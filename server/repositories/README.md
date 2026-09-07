/**
 * server/repositories/README.md
 * ──────────────────────────────────────────────────────────────────────────
 * Repositories Layer
 *
 * ## Responsibility
 * All database access. Repositories are the ONLY place that interact with
 * Supabase/PostgreSQL. They expose simple, typed read/write methods.
 *
 * ## Rules
 *
 * 1. Repositories are called ONLY by services (or workflows).
 *    Never from API routes, server actions, or React components directly.
 * 2. Repositories use `createSupabaseAdmin()` for privileged writes.
 *    They use `createSupabaseClient()` for read-only public data where RLS
 *    is sufficient.
 * 3. No business logic in repositories — only data access.
 * 4. Return typed results; throw on database errors.
 * 5. Repositories do NOT send emails, trigger payments, or make HTTP calls.
 *
 * ## File naming convention
 * `<entity>.repository.ts` — e.g., participant.repository.ts, event.repository.ts
 *
 * ## Query guidelines
 * - Select only the columns you need.
 * - Use parameterised queries (Supabase client handles this).
 * - Apply pagination on all list queries.
 * - Never expose raw database error messages to the client.
 */
