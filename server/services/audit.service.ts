import "server-only";

export type AuditEventAction =
  | "USER_REGISTERED"
  | "PAYMENT_INITIATED"
  | "PAYMENT_COMPLETED"
  | "PAYMENT_FAILED"
  | "QR_SCANNED"
  | "QR_REVOKED"
  | "ADMIN_LOGIN"
  | "SETTINGS_UPDATED";

export interface AuditEventPayload {
  action: AuditEventAction;
  actorId?: string; // ID of user/admin performing the action
  targetId?: string; // ID of the entity being acted upon (e.g., registrationId)
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Foundation for Audit Logging.
 * Currently uses console/stdout which is captured by standard serverless logs (e.g. Vercel/AWS).
 * Can be extended to write to a dedicated `AuditLog` database table if added later.
 */
export async function logAuditEvent(payload: AuditEventPayload): Promise<void> {
  const timestamp = new Date().toISOString();
  
  // Format for structured logging (JSON)
  const logEntry = {
    timestamp,
    level: "AUDIT",
    ...payload,
  };

  // Write to standard output
  // In production (Vercel/AWS), this is captured by Datadog/CloudWatch
  console.log(JSON.stringify(logEntry));
  
  // Example of future DB implementation (do NOT uncomment yet):
  // await prisma.auditLog.create({ data: { ...payload } });
}
