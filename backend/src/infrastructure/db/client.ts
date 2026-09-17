/**
 * lib/db/client.ts
 * ──────────────────────────────────────────────────────────────────────────
 * Database client configuration.
 *
 * Step 2 update: Prisma is now the primary ORM/query layer using Neon DB.
 *
 * Exports:
 *   - `prisma`              — Singleton Prisma client (server-only)
 *
 * IMPORTANT: This file imports 'server-only'.
 * It must never be imported by client components.
 */
import "server-only";

import { PrismaClient } from "@prisma/client";

// ─── Prisma Client (singleton pattern) ───────────────────────────────────────
//
// In development, Next.js hot-reloads modules which would create a new
// PrismaClient on every reload — exhausting database connections.
// The global singleton pattern prevents this.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
