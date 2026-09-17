
import crypto from "crypto";
import { prisma } from "@/infrastructure/db/client";
import { Staff, StaffSession } from "@prisma/client";

// Token settings
const SESSION_EXPIRY_HOURS = 12;

/**
 * Creates a cryptographically secure SHA-256 hash of a string.
 * This is used for session tokens, NOT passwords.
 * We need deterministic lookup for session tokens.
 */
function hashSessionToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Creates a new secure session for a staff member.
 * Returns the raw token (to be sent via cookie) and the stored session.
 */
export async function createStaffSession(staffId: string): Promise<{ rawToken: string; session: StaffSession }> {
  // Generate secure random raw token
  const rawToken = crypto.randomBytes(32).toString("hex");
  
  // Hash for storage
  const tokenHash = hashSessionToken(rawToken);
  
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000);

  const session = await prisma.staffSession.create({
    data: {
      staffId,
      tokenHash,
      expiresAt,
    },
  });

  return { rawToken, session };
}

/**
 * Verifies a raw session token.
 * Returns the session and associated staff member if valid.
 * Returns null if invalid, expired, or revoked.
 */
export async function verifyStaffSession(rawToken: string): Promise<{ session: StaffSession; staff: Staff } | null> {
  const tokenHash = hashSessionToken(rawToken);

  const session = await prisma.staffSession.findUnique({
    where: { tokenHash },
    include: { staff: true },
  });

  if (!session) {
    return null; // Not found
  }

  if (session.revokedAt) {
    return null; // Revoked
  }

  if (session.expiresAt.getTime() < Date.now()) {
    return null; // Expired
  }

  if (!session.staff.isActive) {
    return null; // Staff member deactivated
  }

  // Update lastUsedAt in the background (fire and forget)
  prisma.staffSession.update({
    where: { id: session.id },
    data: { lastUsedAt: new Date() },
  }).catch(() => {}); // Ignore errors so it doesn't block verification

  return { session, staff: session.staff };
}

/**
 * Revokes a specific session.
 */
export async function revokeStaffSession(sessionId: string): Promise<void> {
  await prisma.staffSession.updateMany({
    where: { id: sessionId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

/**
 * Revokes all sessions for a specific staff member.
 * Useful for password resets or deactivation.
 */
export async function revokeAllStaffSessions(staffId: string): Promise<void> {
  await prisma.staffSession.updateMany({
    where: { staffId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
