/**
 * lib/whatsapp/index.ts
 * ──────────────────────────────────────────────────────────────────────────
 * WhatsApp Business API abstraction layer.
 *
 * PLACEHOLDER — Will be implemented in a later step.
 *
 * IMPORTANT — WhatsApp is NOT a registration channel.
 * It is a POST-REGISTRATION communication channel only.
 * Participants register via the website. WhatsApp is used to:
 *   - Send a registration confirmation message.
 *   - Attach the QR credential (as an image).
 *   - Send event-day reminders.
 *
 * Design principles:
 *   - WhatsApp API calls are made server-side only.
 *   - WHATSAPP_ACCESS_TOKEN is server-only.
 *   - Messages are sent after successful payment verification.
 *   - Never send WhatsApp messages in response to unverified browser input.
 */


export interface WhatsAppConfirmationParams {
  phoneNumber: string; // E.164 format, e.g. +919876543210
  participantName: string;
  registrationId: string;
  /** Publicly accessible URL of the QR code image */
  qrImageUrl: string;
}

/**
 * Placeholder: send a WhatsApp confirmation message with QR to participant.
 *
 * @throws {Error} Always throws — not yet implemented.
 */
export async function sendRegistrationConfirmationWhatsApp(
  _params: WhatsAppConfirmationParams
): Promise<void> {
  throw new Error(
    "[lib/whatsapp] sendRegistrationConfirmationWhatsApp() is not yet implemented. " +
      "WhatsApp integration will be built in a later step."
  );
}
