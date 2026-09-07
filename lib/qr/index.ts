/**
 * lib/qr/index.ts
 * ──────────────────────────────────────────────────────────────────────────
 * QR credential generation and verification.
 *
 * PLACEHOLDER — Will be implemented in a later step.
 *
 * This module will provide:
 *   - Signed QR payload generation (HMAC-SHA256 with QR_SIGNING_SECRET)
 *   - QR code image generation (PNG/SVG for email/WhatsApp attachment)
 *   - Payload verification at scan time
 *   - Replay protection
 *
 * Security principles:
 *   - QR codes are signed server-side; the browser never generates them.
 *   - Verification is authoritative server-side only.
 *   - A valid-looking QR is meaningless without server-side signature check.
 *   - The signing secret is stored in QR_SIGNING_SECRET (server-only env var).
 */
import "server-only";

import type { QrTokenPayload } from "@/types";

/**
 * Placeholder: generate a signed QR payload for a participant.
 *
 * @throws {Error} Always throws — not yet implemented.
 */
export async function generateQrPayload(
  _participantId: string,
  _registrationId: string
): Promise<QrTokenPayload> {
  throw new Error(
    "[lib/qr] generateQrPayload() is not yet implemented. " +
      "QR generation will be built in a later step."
  );
}

/**
 * Placeholder: verify a QR payload presented at the scanner.
 * Returns the verified payload or throws if invalid/tampered.
 *
 * @throws {Error} Always throws — not yet implemented.
 */
export async function verifyQrPayload(
  _rawPayload: string
): Promise<QrTokenPayload> {
  throw new Error(
    "[lib/qr] verifyQrPayload() is not yet implemented. " +
      "QR verification will be built in a later step."
  );
}
