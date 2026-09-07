/**
 * app/scanner/page.tsx
 * ──────────────────────────────────────────────────────────────────────────
 * Event-day QR Scanner — Placeholder
 *
 * This area is intended for scanner operators on event day.
 * It will provide:
 *   - QR code camera scan
 *   - Real-time server-side verification
 *   - Check-in / workshop attendance / food collection confirmation
 *
 * ACCESS: This route must be protected. Only authenticated scanner
 * operators may access it. Authentication will be implemented in a later step.
 *
 * IMPORTANT:
 *   - QR verification is ALWAYS server-side.
 *   - The scanner UI only presents the camera and result.
 *   - The server is authoritative on whether a QR is valid and whether
 *     an action (check-in, food collection) is permitted.
 */

export default function ScannerPage() {
  return (
    <main>
      <h1>PERIZIA Event Scanner</h1>
      <p>
        Scanner is not yet available. This area is restricted to authorised
        operators.
      </p>
    </main>
  );
}

export const metadata = {
  title: "Scanner — PERIZIA Event Day",
  description: "Event-day QR scanner for PERIZIA.",
  robots: "noindex, nofollow",
};
