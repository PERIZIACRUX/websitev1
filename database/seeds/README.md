# database/seeds/

Database seed data for development and testing environments.

## Purpose

Seeds populate the database with realistic sample data for local development:
- Sample events (CRUX and PERIZIA)
- Sample workshops
- Test participant records (with fake data only)

## Rules

1. Seeds are for **development/testing only** — never run in production.
2. Seed files use the same migration numbering scheme but are prefixed `seed_`:
   ```
   seed_001_events.sql
   seed_002_workshops.sql
   seed_003_participants.sql
   ```
3. Use obviously fake data (no real names, emails, or phone numbers).
4. Seeds should be idempotent — safe to run multiple times.

## Running Seeds

```bash
# Using Supabase CLI
supabase db reset  # resets and re-applies all migrations + seeds
```
