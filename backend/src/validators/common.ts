/**
 * server/validators/common.ts
 * ──────────────────────────────────────────────────────────────────────────
 * Shared Zod validation schemas used across multiple features.
 *
 * All user input MUST be validated through Zod schemas on the server side
 * before being processed by any service or repository.
 *
 * Rules:
 *   - Schemas are defined here or in feature-specific validator files.
 *   - Schemas are used in API routes and server actions, never in client code.
 *   - Never trust values from the browser for prices, capacity, or auth.
 */
import { z } from "zod";

// ─── Primitive helpers ────────────────────────────────────────────────────────

/** Non-empty trimmed string */
export const nonEmptyString = z.string().trim().min(1, "Required");

/** Valid email address */
export const emailSchema = z
  .string()
  .trim()
  .email("Must be a valid email address");

/** Indian mobile number (10 digits, optionally prefixed with +91) */
export const indianPhoneSchema = z
  .string()
  .trim()
  .regex(
    /^(\+91)?[6-9]\d{9}$/,
    "Must be a valid Indian mobile number (10 digits)"
  );

/** UUID v4 */
export const uuidSchema = z.string().uuid("Must be a valid UUID");

/** Positive integer */
export const positiveInt = z.number().int().positive();

// ─── Pagination ──────────────────────────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

// ─── Registration ID format ───────────────────────────────────────────────────

/**
 * PERIZIA registration ID format: PRZIA-YYYYMMDD-XXXXXX
 * Exact format TBD in Step 2 when registration is implemented.
 */
export const registrationIdSchema = z
  .string()
  .regex(/^PRZIA-\d{8}-[A-Z0-9]{6}$/, "Invalid registration ID format");

// ─── Fest identifier ─────────────────────────────────────────────────────────

export const festSchema = z.enum(["crux", "perizia"]);
