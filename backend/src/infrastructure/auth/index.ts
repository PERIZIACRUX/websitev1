/**
 * lib/auth/index.ts
 * ──────────────────────────────────────────────────────────────────────────
 * Authentication and authorization infrastructure.
 *
 * PLACEHOLDER — Will be implemented in a later step.
 *
 * This module will provide:
 *   - Admin session verification
 *   - Scanner operator authentication
 *   - Route protection helpers for Next.js middleware
 *
 * Design principles:
 *   - Authentication decisions are made server-side only.
 *   - Credentials are never passed to or trusted from the browser.
 *   - Admin and scanner routes are protected independently.
 */
import "server-only";

/**
 * Placeholder: verify that a request comes from an authenticated admin.
 * Will check session tokens/JWTs against the database in Step N.
 *
 * @throws {Error} Always throws — not yet implemented.
 */
export async function requireAdmin(): Promise<never> {
  throw new Error(
    "[lib/auth] requireAdmin() is not yet implemented. " +
      "Admin authentication will be built in a later step."
  );
}

/**
 * Placeholder: verify that a request comes from an authenticated scanner operator.
 *
 * @throws {Error} Always throws — not yet implemented.
 */
export async function requireScanner(): Promise<never> {
  throw new Error(
    "[lib/auth] requireScanner() is not yet implemented. " +
      "Scanner authentication will be built in a later step."
  );
}
