import "server-only";

import { prisma } from "@/lib/db/client";
import { ApiError } from "@/server/utils/error-handler";
import { randomBytes, createHash } from "crypto";
import { Prisma, QrCredentialStatus, RegistrationStatus } from "@prisma/client";

// ─── Utilities ───────────────────────────────────────────────────────────────

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function generateSecureToken(): string {
  // 32 bytes = 256 bits of entropy, hex encoded to 64 chars
  return randomBytes(32).toString("hex");
}

// ─── Core Service ────────────────────────────────────────────────────────────

/**
 * Generates a secure QR credential for a given registration.
 * MUST be called inside a transaction during payment confirmation.
 */
export async function generateQrCredential(
  registrationId: string,
  tx: Prisma.TransactionClient = prisma
) {
  const rawToken = generateSecureToken();
  const tokenHash = hashToken(rawToken);

  const credential = await tx.qrCredential.create({
    data: {
      registrationId,
      tokenHash,
      status: QrCredentialStatus.ACTIVE,
    }
  });

  return {
    credentialId: credential.id,
    rawToken, // MUST ONLY be returned this one time
  };
}

/**
 * Verifies a raw QR token and returns the registration context.
 * Useful for scanner endpoints.
 */
export async function verifyQrCredential(rawToken: string) {
  const tokenHash = hashToken(rawToken);

  const credential = await prisma.qrCredential.findUnique({
    where: { tokenHash },
    include: {
      registration: {
        include: {
          participant: true,
          payment: true,
        }
      }
    }
  });

  if (!credential) {
    throw new ApiError("Invalid QR credential.", 401);
  }

  if (credential.status !== QrCredentialStatus.ACTIVE) {
    throw new ApiError("This QR credential has been revoked.", 403);
  }

  if (credential.registration.status !== RegistrationStatus.CONFIRMED) {
    throw new ApiError("Registration is not confirmed.", 403);
  }

  return {
    credentialId: credential.id,
    registration: credential.registration,
  };
}

/**
 * Revokes an existing QR credential.
 */
export async function revokeQrCredential(credentialId: string) {
  return await prisma.qrCredential.update({
    where: { id: credentialId },
    data: {
      status: QrCredentialStatus.REVOKED,
      revokedAt: new Date(),
    }
  });
}
