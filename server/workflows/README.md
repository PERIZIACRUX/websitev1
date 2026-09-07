/**
 * server/workflows/README.md
 * ──────────────────────────────────────────────────────────────────────────
 * Workflows Layer
 *
 * ## Responsibility
 * Multi-step business operations that coordinate multiple services.
 * Workflows are the highest-level server-side orchestration layer.
 *
 * ## Examples of workflows
 *   - `completeRegistration`: validate → reserve seat → create order →
 *     verify payment → issue QR → send email → send WhatsApp
 *   - `checkInParticipant`: verify QR → mark check-in → update attendance
 *   - `processWorkshopEnrollment`: check seat availability → reserve seat →
 *     notify participant
 *
 * ## Rules
 *
 * 1. Workflows are called from API routes or server actions ONLY.
 * 2. Workflows call services — they do NOT access repositories directly.
 * 3. Workflows handle cross-cutting concerns: transactions, rollbacks,
 *    error recovery, retries.
 * 4. Keep each workflow focused on one business operation.
 * 5. Workflows are the ideal place to add distributed tracing / logging later.
 *
 * ## File naming convention
 * `<operation>.workflow.ts` — e.g., registration.workflow.ts
 */
