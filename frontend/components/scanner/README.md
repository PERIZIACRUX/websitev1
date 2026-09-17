# components/scanner/

Scanner operator UI components.

Examples:
- `QrReader.tsx` — camera-based QR code reader (using a scanning library)
- `ScanResult.tsx` — displays check-in / attendance confirmation
- `ScanError.tsx` — displays error when QR is invalid or already used

## Rules
- Scanner components are only used within `app/scanner/` pages.
- QR reading happens client-side (camera access needed).
- QR *verification* always happens server-side via an API call.
- The scanner UI shows results from the server — it does NOT determine validity itself.
- This area is operator-only and must be protected by authentication.
