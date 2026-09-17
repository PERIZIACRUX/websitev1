import "server-only";
import { prisma } from "@/infrastructure/db/client";

export type AuditEventAction =
  | "USER_REGISTERED"
  | "PAYMENT_INITIATED"
  | "PAYMENT_COMPLETED"
  | "PAYMENT_FAILED"
  | "QR_SCANNED"
  | "QR_REVOKED"
  | "SETTINGS_UPDATED"
  // Staff actions
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "LOGOUT"
  | "CREATE_STAFF"
  | "DEACTIVATE_STAFF"
  | "REACTIVATE_STAFF"
  | "RESET_PASSWORD"
  | "REVOKE_SESSION"
  | "ALL_SESSIONS_REVOKED";

export interface AuditEventPayload {
  action: AuditEventAction;
  staffId?: string; // ID of staff performing the action
  entityType?: string; // e.g., "Registration", "Payment", "StaffSession", "Staff"
  entityId?: string; // ID of the entity being acted upon
  details?: Record<string, unknown>; // MUST NOT contain secrets
}

/**
 * Standardized audit logging.
 * Uses the `StaffAuditLog` model for persistence.
 */
export async function logAuditEvent(payload: AuditEventPayload): Promise<void> {
  // Never log secrets
  const sanitizedDetails = { ...payload.details };
  delete sanitizedDetails.password;
  delete sanitizedDetails.passwordHash;
  delete sanitizedDetails.token;
  delete sanitizedDetails.rawToken;
  delete sanitizedDetails.tokenHash;
  delete sanitizedDetails.encryptedToken;

  try {
    await prisma.staffAuditLog.create({
      data: {
        staffId: payload.staffId,
        action: payload.action,
        entityType: payload.entityType,
        entityId: payload.entityId,
        details: sanitizedDetails ? JSON.parse(JSON.stringify(sanitizedDetails)) : undefined,
      },
    });
  } catch (error) {
    // Fallback to console if DB insert fails so we don't lose the log,
    // but don't crash the calling function
    console.error("[Audit Log Failed]", error, JSON.stringify(payload));
  }
}
