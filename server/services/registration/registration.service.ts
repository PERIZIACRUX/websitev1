import "server-only";

import { prisma } from "@/lib/db/client";
import { ApiError } from "@/server/utils/error-handler";
import type { PeriziaRegistrationInput } from "@/server/validators/registration.validator";
import { RegistrationStatus, PaymentStatus, WorkshopRegistrationStatus } from "@prisma/client";
import { randomBytes } from "crypto";
import { Prisma } from "@prisma/client";

// ─── Hardcoded Pricing Rules (Mocked for now) ────────────────────────────────
const BASE_REGISTRATION_FEE = 500;
const FEE_PER_WORKSHOP = 200;

export function calculateRegistrationFee(workshopCount: number): number {
  return BASE_REGISTRATION_FEE + workshopCount * FEE_PER_WORKSHOP;
}

// ─── Utilities ───────────────────────────────────────────────────────────────

function generateRegistrationNumber(): string {
  // Generates e.g. "PRZ-A1B2C3D4"
  return `PRZ-${randomBytes(4).toString("hex").toUpperCase()}`;
}

// ─── Core Service ────────────────────────────────────────────────────────────

export async function processPeriziaRegistration(data: PeriziaRegistrationInput) {
  // Execute everything safely within a single transaction
  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Verify Edition
      const edition = await tx.periziaEdition.findUnique({
        where: { id: data.editionId },
      });
      
      if (!edition) {
        throw new ApiError("Edition not found.", 404);
      }
      if (!edition.isActive) {
        throw new ApiError("This edition is not currently active for registration.", 400);
      }

      // ACQUIRE LOCK ON EDITION
      await tx.$queryRawUnsafe(`SELECT id FROM "perizia_editions" WHERE id = $1 FOR UPDATE`, data.editionId);

      // Check Edition Capacity
      const currentEditionRegistrations = await tx.registration.count({
        where: {
          editionId: data.editionId,
          status: { in: [RegistrationStatus.PENDING, RegistrationStatus.CONFIRMED] }
        }
      });

      if (currentEditionRegistrations >= edition.maxParticipants) {
        throw new ApiError(`Perizia ${edition.year} has reached its maximum capacity.`, 409);
      }

      // 2. Resolve Participant (Get or Create)
      let participant = await tx.participant.findFirst({
        where: {
          OR: [
            { email: data.email },
            { phone: data.phone }
          ]
        }
      });

      if (!participant) {
        participant = await tx.participant.create({
          data: {
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            collegeName: data.collegeName,
            collegeId: data.collegeId,
          }
        });
      }

      // 3. Fetch Workshops and Acquire Locks
      // Sort to prevent deadlocks when locking multiple rows
      const sortedWorkshopIds = [...data.workshopIds].sort();

      if (sortedWorkshopIds.length > 0) {
        const placeholders = sortedWorkshopIds.map((_, i) => `$${i + 1}`).join(', ');
        await tx.$queryRawUnsafe(`SELECT id FROM "workshops" WHERE id IN (${placeholders}) FOR UPDATE`, ...sortedWorkshopIds);
      }

      const workshops = await tx.workshop.findMany({
        where: { id: { in: data.workshopIds } },
        include: {
          _count: {
            select: { workshopRegistrations: { where: { status: WorkshopRegistrationStatus.REGISTERED } } }
          }
        }
      });

      if (workshops.length !== data.workshopIds.length) {
        throw new ApiError("One or more selected workshops are invalid or not found.", 400);
      }

      const seenDays = new Set<string>();

      for (const workshop of workshops) {
        if (workshop.editionId !== data.editionId) {
          throw new ApiError(`Workshop '${workshop.title}' belongs to a different edition.`, 400);
        }

        if (seenDays.has(workshop.periziaDayId)) {
          throw new ApiError("You cannot select multiple workshops occurring on the same day.", 400);
        }
        seenDays.add(workshop.periziaDayId);

        if (workshop.capacity && workshop._count.workshopRegistrations >= workshop.capacity) {
          throw new ApiError(`Workshop '${workshop.title}' has reached its maximum capacity.`, 409);
        }
      }

      // 4. Calculate final fee server-side
      const totalFee = calculateRegistrationFee(workshops.length);
      const registrationNumber = generateRegistrationNumber();

      // 5. Create all relational records (Registration, WorkshopRegistrations, Payment)
      const registration = await tx.registration.create({
        data: {
          registrationNumber,
          status: RegistrationStatus.PENDING,
          participant: { connect: { id: participant.id } },
          edition: { connect: { id: data.editionId } },
          
          workshopRegistrations: {
            create: workshops.map(ws => ({
              workshop: { connect: { id: ws.id } },
              periziaDay: { connect: { id: ws.periziaDayId } },
              status: WorkshopRegistrationStatus.REGISTERED,
            }))
          },

          payment: {
            create: {
              amount: new Prisma.Decimal(totalFee),
              currency: "INR",
              status: PaymentStatus.PENDING,
              gateway: "RAZORPAY", // Placeholder
            }
          }
        },
        include: {
          payment: true
        }
      });

      return {
        registrationId: registration.id,
        registrationNumber: registration.registrationNumber,
        amount: totalFee,
        status: registration.status,
      };
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ApiError("Participant is already registered for this edition or duplicate entry detected.", 409);
    }
    throw error;
  }
}
