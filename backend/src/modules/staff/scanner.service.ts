import { prisma } from "../../infrastructure/db/client";

export async function getScannerParticipantContext(registrationId: string, periziaDayId: string) {
  // 1. Conference Status
  const checkIn = await prisma.conferenceCheckIn.findUnique({
    where: {
      registrationId_periziaDayId: {
        registrationId,
        periziaDayId,
      },
    },
  });

  // 2. Workshops for today
  const workshopRegs = await prisma.workshopRegistration.findMany({
    where: {
      registrationId,
      periziaDayId,
      status: "REGISTERED",
    },
    include: {
      workshop: {
        include: {
          venue: true
        }
      },
    },
  });

  const attendances = await prisma.workshopAttendance.findMany({
    where: {
      registrationId,
      periziaDayId,
    },
  });

  const attendedWorkshopIds = new Set(attendances.map((a) => a.workshopId));
  const attendedMap = new Map(attendances.map((a) => [a.workshopId, a.attendedAt]));

  // 3. Food Status
  const foodCollections = await prisma.foodCollection.findMany({
    where: {
      registrationId,
      periziaDayId,
    },
  });

  const breakfast = foodCollections.find((f) => f.mealType === "BREAKFAST");
  const lunch = foodCollections.find((f) => f.mealType === "LUNCH");

  return {
    conference: {
      eligible: true, // confirmed registration implies eligible
      checkedIn: !!checkIn,
      checkedInAt: checkIn ? checkIn.checkedInAt : null,
    },
    workshops: workshopRegs.map((wr) => {
      const attended = attendedWorkshopIds.has(wr.workshopId);
      return {
        id: wr.workshopId,
        title: wr.workshop.title,
        time: wr.workshop.startTime,
        venue: wr.workshop.venue?.name || null,
        attended: attended,
        attendedAt: attended ? attendedMap.get(wr.workshopId) : null,
      };
    }),
    food: {
      breakfast: {
        collected: !!breakfast,
        collectedAt: breakfast ? breakfast.collectedAt : null,
      },
      lunch: {
        collected: !!lunch,
        collectedAt: lunch ? lunch.collectedAt : null,
      },
    },
  };
}

export async function performConferenceCheckIn(registrationId: string, periziaDayId: string, staffId: string) {
  try {
    const checkIn = await prisma.conferenceCheckIn.create({
      data: {
        registrationId,
        periziaDayId,
        checkedInByStaffId: staffId,
      }
    });

    await prisma.staffAuditLog.create({
      data: {
        staffId,
        action: "SCIENTIFIC_SESSION_CHECKIN",
        entityType: "ConferenceCheckIn",
        entityId: checkIn.id,
        details: { registrationId, periziaDayId }
      }
    });

    return { success: true, message: "Checked in successfully." };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: true, message: "ALREADY CHECKED IN" }; // Idempotent success
    }
    throw error;
  }
}

export async function performWorkshopAttendance(registrationId: string, periziaDayId: string, staffId: string) {
  const reg = await prisma.workshopRegistration.findUnique({
    where: {
      registrationId_periziaDayId: {
        registrationId,
        periziaDayId
      }
    }
  });

  if (!reg || reg.status !== "REGISTERED") {
    throw new Error("NOT REGISTERED FOR TODAY'S WORKSHOP");
  }

  try {
    const attendance = await prisma.workshopAttendance.create({
      data: {
        registrationId,
        workshopId: reg.workshopId,
        periziaDayId,
        markedByStaffId: staffId,
      }
    });

    await prisma.staffAuditLog.create({
      data: {
        staffId,
        action: "WORKSHOP_ATTENDANCE",
        entityType: "WorkshopAttendance",
        entityId: attendance.id,
        details: { registrationId, periziaDayId, workshopId: reg.workshopId }
      }
    });

    return { success: true, message: "Attendance marked successfully." };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: true, message: "ALREADY ATTENDED" }; // Idempotent success
    }
    throw error;
  }
}

export async function performFoodCollection(registrationId: string, periziaDayId: string, mealType: "BREAKFAST" | "LUNCH", staffId: string) {
  // First, check idempotency safely (without incrementing quota if already collected)
  const existing = await prisma.foodCollection.findUnique({
    where: {
      registrationId_periziaDayId_mealType: {
        registrationId, periziaDayId, mealType
      }
    }
  });
  if (existing) {
    return { success: true, message: `${mealType} ALREADY GIVEN` };
  }

  // Transaction for atomic update
  const result = await prisma.$transaction(async (tx) => {
    // 1. Try to decrement quota safely
    const quotaUpdate = await tx.foodQuota.updateMany({
      where: {
        periziaDayId,
        mealType,
        givenCount: {
          lt: prisma.foodQuota.fields.totalAllocated
        }
      },
      data: {
        givenCount: {
          increment: 1
        }
      }
    });

    if (quotaUpdate.count === 0) {
      // Either quota doesn't exist, or it's exhausted
      const quotaExists = await tx.foodQuota.findUnique({
        where: {
          periziaDayId_mealType: { periziaDayId, mealType }
        }
      });
      if (!quotaExists) {
        throw new Error("Food quota not configured for this day/meal.");
      } else {
        throw new Error("QUOTA EXHAUSTED");
      }
    }

    // 2. Create the collection record
    const collection = await tx.foodCollection.create({
      data: {
        registrationId,
        periziaDayId,
        mealType,
        collectedByStaffId: staffId,
      }
    });

    // 3. Audit log
    await tx.staffAuditLog.create({
      data: {
        staffId,
        action: `${mealType}_COLLECTED`,
        entityType: "FoodCollection",
        entityId: collection.id,
        details: { registrationId, periziaDayId, mealType }
      }
    });

    return collection;
  });

  return { success: true, message: `${mealType} collected successfully.`, data: result };
}
