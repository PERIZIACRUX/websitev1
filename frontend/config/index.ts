/**
 * config/index.ts
 * ──────────────────────────────────────────────────────────────────────────
 * Centralized application configuration.
 *
 * All environment variable access should be channelled through this file
 * (or a sub-module imported here). This ensures:
 *   1. There is a single place to discover all required variables.
 *   2. Missing variables are caught at startup, not at request time.
 *   3. Client components never accidentally import server-only variables.
 *
 * IMPORTANT:
 *   - Variables prefixed with NEXT_PUBLIC_ may be imported into client code.
 *   - All other variables are server-only. Do NOT export them from this
 *     file if it could be imported by client components.
 *     Use config/server.ts for server-only values (server-side import only).
 */

// ─── Public configuration (safe to use in browser) ───────────────────────────

export const publicConfig = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "",
} as const;

// ─── Registration capacity ────────────────────────────────────────────────────
// These are business rules — authoritative values live server-side only.

export const PERIZIA_MAX_PARTICIPANTS = 500;
