/**
 * lib/email/index.ts
 * ──────────────────────────────────────────────────────────────────────────
 * Transactional email abstraction layer.
 *
 * PLACEHOLDER — Will be implemented in a later step.
 *
 * This module will provide:
 *   - Registration confirmation emails
 *   - Invoice emails (with QR attachment for PERIZIA participants)
 *   - Template rendering (HTML + plain text)
 *
 * Design principles:
 *   - All email is triggered server-side only (API routes / server actions).
 *   - Email API key is server-only (EMAIL_API_KEY env var).
 *   - Transactional emails are idempotent where possible.
 *   - Queue/retry logic to be added for reliability.
 */
import "server-only";

export interface RegistrationConfirmationEmailParams {
  to: string;
  participantName: string;
  registrationId: string;
  /** Base64-encoded QR code PNG, attached to the email */
  qrCodeBase64: string;
}

/**
 * Placeholder: send a registration confirmation email with QR attachment.
 *
 * @throws {Error} Always throws — not yet implemented.
 */
export async function sendRegistrationConfirmation(
  _params: RegistrationConfirmationEmailParams
): Promise<void> {
  throw new Error(
    "[lib/email] sendRegistrationConfirmation() is not yet implemented. " +
      "Email integration will be built in a later step."
  );
}
