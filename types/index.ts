/**
 * types/index.ts
 * ──────────────────────────────────────────────────────────────────────────
 * Shared TypeScript type definitions for the CRUX × PERIZIA platform.
 *
 * Step 2 update: Prisma-generated types are now the authoritative source
 * for all database model types. This file re-exports relevant Prisma types
 * plus any additional application-level types.
 *
 * NOTE: Do NOT import from this file in client components if the types
 * reference server-only constructs. Prefer importing directly from
 * '@prisma/client' or the relevant sub-module for server-side code.
 */

// ─── Re-export Prisma enums and types for convenience ────────────────────────
// These are safe to use on both client and server (they're just TypeScript types).

export type {
  Participant,
  Registration,
  Payment,
  QrCredential,
  PeriziaEdition,
  PeriziaDay,
  Workshop,
  WorkshopRegistration,
  WorkshopAttendance,
  ConferenceCheckIn,
  FoodCollection,
  Notification,
  ScannerStation,
  CruxEdition,
  CruxEvent,
  CruxPoster,
  CruxGallery,
  CruxGalleryItem,
  CruxVideo,
  CruxAnnouncement,
  MediaAsset,
  Venue,
} from "@prisma/client";

export {
  RegistrationStatus,
  PaymentStatus,
  QrCredentialStatus,
  WorkshopStatus,
  WorkshopRegistrationStatus,
  MealType,
  ScannerStationType,
  NotificationType,
  NotificationStatus,
  MediaType,
  StorageProvider,
} from "@prisma/client";

// ─── Fest Identity ───────────────────────────────────────────────────────────

/** Which fest a resource belongs to */
export type Fest = "crux" | "perizia";

// ─── Common Response Shapes ──────────────────────────────────────────────────

/**
 * Standard success/error envelope used by API routes and server actions.
 * Frontend code should always check `success` before reading `data`.
 */
export type ApiResponse<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

// ─── Pagination ──────────────────────────────────────────────────────────────

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Participant Summary (view type) ─────────────────────────────────────────

/**
 * Minimal participant shape for list views.
 * The full `Participant` type is available from @prisma/client.
 */
export interface ParticipantSummary {
  id: string;
  registrationId: string;
  registrationNumber: string;
  fullName: string;
  email: string;
  status: import("@prisma/client").RegistrationStatus;
}

// ─── QR Payload (the signed token, NOT the DB record) ────────────────────────

/**
 * The payload encoded into the QR code.
 * This is signed with HMAC-SHA256 and stored as tokenHash in QrCredential.
 * Do NOT store sensitive personal information here.
 */
export interface QrTokenPayload {
  registrationId: string;
  registrationNumber: string;
  issuedAt: number; // Unix timestamp (seconds)
  /** HMAC-SHA256 signature — MUST be verified server-side before trusting */
  sig: string;
}

// ─── Admin Role ───────────────────────────────────────────────────────────────

export type AdminRole = "super_admin" | "event_admin" | "scanner_operator";
