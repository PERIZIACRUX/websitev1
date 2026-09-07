# Database — CRUX × PERIZIA Platform

This project uses **Prisma ORM** with **PostgreSQL** hosted on **Supabase**.

> ⚠ **The `prisma/` directory is now the authoritative schema and migration source.**
> The `database/migrations/` folder in this directory is kept for documentation/notes only.
> All actual migrations live in `prisma/migrations/` and are managed by Prisma CLI.

## Schema

See [`prisma/schema.prisma`](../prisma/schema.prisma) for the complete database schema.

## Common Commands

```bash
# Format schema
npm run db:format

# Validate schema without connecting
npm run db:validate

# Generate Prisma Client after schema changes
npm run db:generate

# Create and apply a new migration (development)
npm run db:migrate

# Apply migrations in production (no prompt)
npm run db:migrate:deploy

# Push schema changes without migration (for rapid prototyping only)
npm run db:push

# Open Prisma Studio (browser-based DB explorer)
npm run db:studio

# Run seed data
npm run db:seed
```

## Environment Variables Required

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Supabase pooled connection string (runtime, via pgBouncer) |
| `DIRECT_URL` | Supabase direct connection string (migrations only) |

Get both from: **Supabase Dashboard → Settings → Database → Connection string**

> Use the **Transaction** pooler URL for `DATABASE_URL`.
> Use the **Direct** connection URL for `DIRECT_URL`.

## Media Storage

Binary files (images, videos, documents) are **NOT stored in PostgreSQL**.
They are stored in **Cloudflare R2**.
The database stores only metadata in the `media_assets` table (`storageKey`, `publicUrl`, etc.).
