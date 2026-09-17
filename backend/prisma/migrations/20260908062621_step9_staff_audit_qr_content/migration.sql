/*
  Warnings:

  - Added the required column `updatedAt` to the `conference_check_ins` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `food_collections` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `workshop_attendances` table without a default value. This is not possible if the table is not empty.

*/

-- Migration Safety Note:
-- updatedAt columns are added in 3 steps to safely handle existing rows:
-- 1. Add as nullable TEXT/TIMESTAMP
-- 2. Backfill existing rows with NOW()
-- 3. Alter to NOT NULL

-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('ADMIN', 'VOLUNTEER');

-- ─── conference_check_ins ─────────────────────────────────────────────────────
ALTER TABLE "conference_check_ins"
  ADD COLUMN "checkedInByStaffId" TEXT,
  ADD COLUMN "updatedAt"          TIMESTAMP(3),
  ADD COLUMN "updatedByStaffId"   TEXT;

-- Backfill existing rows
UPDATE "conference_check_ins" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;

-- Now enforce NOT NULL
ALTER TABLE "conference_check_ins" ALTER COLUMN "updatedAt" SET NOT NULL;

-- ─── food_collections ─────────────────────────────────────────────────────────
ALTER TABLE "food_collections"
  ADD COLUMN "collectedByStaffId" TEXT,
  ADD COLUMN "updatedAt"           TIMESTAMP(3),
  ADD COLUMN "updatedByStaffId"    TEXT;

UPDATE "food_collections" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;

ALTER TABLE "food_collections" ALTER COLUMN "updatedAt" SET NOT NULL;

-- ─── qr_credentials ──────────────────────────────────────────────────────────
ALTER TABLE "qr_credentials" ADD COLUMN "encryptedToken" TEXT;

-- ─── workshop_attendances ─────────────────────────────────────────────────────
ALTER TABLE "workshop_attendances"
  ADD COLUMN "markedByStaffId"  TEXT,
  ADD COLUMN "updatedAt"        TIMESTAMP(3),
  ADD COLUMN "updatedByStaffId" TEXT;

UPDATE "workshop_attendances" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;

ALTER TABLE "workshop_attendances" ALTER COLUMN "updatedAt" SET NOT NULL;

-- ─── staff ───────────────────────────────────────────────────────────────────
CREATE TABLE "staff" (
    "id"           TEXT NOT NULL,
    "name"         TEXT NOT NULL,
    "email"        TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role"         "StaffRole" NOT NULL DEFAULT 'VOLUNTEER',
    "isActive"     BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt"  TIMESTAMP(3),
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- ─── staff_sessions ───────────────────────────────────────────────────────────
CREATE TABLE "staff_sessions" (
    "id"         TEXT NOT NULL,
    "staffId"    TEXT NOT NULL,
    "tokenHash"  TEXT NOT NULL,
    "expiresAt"  TIMESTAMP(3) NOT NULL,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3),
    "revokedAt"  TIMESTAMP(3),

    CONSTRAINT "staff_sessions_pkey" PRIMARY KEY ("id")
);

-- ─── staff_audit_logs ────────────────────────────────────────────────────────
CREATE TABLE "staff_audit_logs" (
    "id"         TEXT NOT NULL,
    "staffId"    TEXT,
    "action"     TEXT NOT NULL,
    "entityType" TEXT,
    "entityId"   TEXT,
    "details"    JSONB,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staff_audit_logs_pkey" PRIMARY KEY ("id")
);

-- ─── perizia_content ─────────────────────────────────────────────────────────
CREATE TABLE "perizia_content" (
    "id"               TEXT NOT NULL,
    "editionId"        TEXT NOT NULL,
    "key"              TEXT NOT NULL,
    "value"            TEXT NOT NULL,
    "updatedAt"        TIMESTAMP(3) NOT NULL,
    "updatedByStaffId" TEXT,

    CONSTRAINT "perizia_content_pkey" PRIMARY KEY ("id")
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE UNIQUE INDEX "staff_email_key"              ON "staff"("email");
CREATE INDEX        "staff_email_idx"              ON "staff"("email");
CREATE INDEX        "staff_role_idx"               ON "staff"("role");
CREATE INDEX        "staff_isActive_idx"           ON "staff"("isActive");

CREATE UNIQUE INDEX "staff_sessions_tokenHash_key" ON "staff_sessions"("tokenHash");
CREATE INDEX        "staff_sessions_staffId_idx"   ON "staff_sessions"("staffId");
CREATE INDEX        "staff_sessions_expiresAt_idx" ON "staff_sessions"("expiresAt");
CREATE INDEX        "staff_sessions_revokedAt_idx" ON "staff_sessions"("revokedAt");

CREATE INDEX "staff_audit_logs_staffId_idx"              ON "staff_audit_logs"("staffId");
CREATE INDEX "staff_audit_logs_entityType_entityId_idx"  ON "staff_audit_logs"("entityType", "entityId");
CREATE INDEX "staff_audit_logs_createdAt_idx"            ON "staff_audit_logs"("createdAt");

CREATE INDEX        "perizia_content_editionId_idx"      ON "perizia_content"("editionId");
CREATE UNIQUE INDEX "perizia_content_editionId_key_key"  ON "perizia_content"("editionId", "key");

-- ─── Foreign Keys ─────────────────────────────────────────────────────────────
ALTER TABLE "staff_sessions"
  ADD CONSTRAINT "staff_sessions_staffId_fkey"
  FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "staff_audit_logs"
  ADD CONSTRAINT "staff_audit_logs_staffId_fkey"
  FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "workshop_attendances"
  ADD CONSTRAINT "workshop_attendances_markedByStaffId_fkey"
  FOREIGN KEY ("markedByStaffId") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "workshop_attendances"
  ADD CONSTRAINT "workshop_attendances_updatedByStaffId_fkey"
  FOREIGN KEY ("updatedByStaffId") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "conference_check_ins"
  ADD CONSTRAINT "conference_check_ins_checkedInByStaffId_fkey"
  FOREIGN KEY ("checkedInByStaffId") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "conference_check_ins"
  ADD CONSTRAINT "conference_check_ins_updatedByStaffId_fkey"
  FOREIGN KEY ("updatedByStaffId") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "food_collections"
  ADD CONSTRAINT "food_collections_collectedByStaffId_fkey"
  FOREIGN KEY ("collectedByStaffId") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "food_collections"
  ADD CONSTRAINT "food_collections_updatedByStaffId_fkey"
  FOREIGN KEY ("updatedByStaffId") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "perizia_content"
  ADD CONSTRAINT "perizia_content_editionId_fkey"
  FOREIGN KEY ("editionId") REFERENCES "perizia_editions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "perizia_content"
  ADD CONSTRAINT "perizia_content_updatedByStaffId_fkey"
  FOREIGN KEY ("updatedByStaffId") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
