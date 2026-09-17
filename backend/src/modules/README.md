/**
 * server/services/README.md
 * ──────────────────────────────────────────────────────────────────────────
 * Services Layer
 *
 * ## Responsibility
 * Business logic and domain rules. Services orchestrate one or more
 * repositories and enforce all business rules:
 *
 *   - Registration capacity enforcement
 *   - Workshop seat limits
 *   - Pricing rules
 *   - Check-in authorization
 *   - QR credential issuance
 *   - Food collection tracking
 *
 * ## Rules
 *
 * 1. Services are NEVER called from client components.
 * 2. Services call repositories — never raw SQL or Supabase directly.
 * 3. Services coordinate external integrations via lib/ modules
 *    (payments, email, WhatsApp, QR).
 * 4. Services throw typed errors on rule violations.
 * 5. Business rules must NEVER exist in React components or API route handlers.
 *    They belong here.
 *
 * ## File naming convention
 * `<domain>.service.ts` — e.g., registration.service.ts, checkin.service.ts
 */
