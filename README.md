# CRUX × PERIZIA — Unified College Fest Platform

A single, unified web platform for two college fests — **CRUX** (cultural) and **PERIZIA** (academic).

---

## The Two Fests

### CRUX — Cultural Fest

| Feature | Details |
|---|---|
| Purpose | Showcase / information website |
| Audience | General public, students, alumni |
| Registration | **None** — no student-facing registration |
| Key pages | Events, Gallery, Posters, Past editions, About |
| WhatsApp | Not applicable |

### PERIZIA — Academic Fest

| Feature | Details |
|---|---|
| Purpose | Academic conference + workshop platform |
| Audience | Registered participants (500 capacity) |
| Registration | Website-only, multi-step with payment |
| Key features | Registration ID, QR credential, workshop selection |
| Post-registration | Email confirmation + invoice, WhatsApp QR message |
| Event day | QR scanner, check-in, workshop attendance, food tracking |
| Admin | Admin portal, AI chatbot for participants |

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL via Supabase |
| Validation | Zod (server-side only) |
| CDN / WAF | Cloudflare (sits in front of the application) |
| Hosting | Managed Node.js / Vercel-compatible |

---

## Architecture

This project uses a **Modular Monolith** — everything is in one Next.js repository,
but the code is structured so frontend and backend are clearly separated.

```
User
 ↓
Next.js UI (app/ + components/)
 ↓
API Routes / Server Actions (app/api/)
 ↓
Zod Validation (server/validators/)
 ↓
Business Logic (server/services/)
 ↓
Data Access (server/repositories/)
 ↓
PostgreSQL (via Supabase)
```

External integrations (payment, email, WhatsApp, QR, AI) are accessed **only** through
dedicated server-side modules in `lib/`. They are never called from client components.

See [`docs/architecture.md`](./docs/architecture.md) for full details.

---

## Folder Structure

```
app/
  (public)/           ← Public-facing pages (no auth required)
    crux/             ← CRUX cultural fest pages
    perizia/          ← PERIZIA academic fest pages
  register/           ← PERIZIA registration flow
  scanner/            ← Event-day QR scanner (operator-only)
  admin/              ← Admin portal (admin-only)
  api/                ← API routes
    health/           ← Health check endpoint

components/
  shared/             ← Components used across both fests
  crux/               ← CRUX-specific components
  perizia/            ← PERIZIA-specific components
  scanner/            ← Scanner UI components
  admin/              ← Admin UI components

server/
  services/           ← Business logic
  repositories/       ← Database access
  validators/         ← Zod schemas
  workflows/          ← Multi-step orchestration

lib/
  db/                 ← Supabase client configuration
  auth/               ← Authentication infrastructure
  qr/                 ← QR generation and verification
  payments/           ← Payment gateway abstraction
  email/              ← Transactional email abstraction
  whatsapp/           ← WhatsApp Business API abstraction
  chatbot/            ← AI chatbot abstraction

database/
  migrations/         ← SQL migration files
  seeds/              ← Development seed data

types/                ← Shared TypeScript type definitions
config/               ← Application configuration
  index.ts            ← Public config (NEXT_PUBLIC_ vars)
  server.ts           ← Server-only secrets (imports 'server-only')

public/
  images/             ← General site images
  posters/            ← Event poster images
  assets/             ← Static assets (icons, fonts)

tests/
  unit/               ← Unit tests (Jest)
  integration/        ← Integration tests
  load/               ← Load tests (k6)

docs/                 ← Architecture and security documentation
```

---

## Local Development Setup

### Prerequisites

- Node.js 20+ (LTS recommended)
- npm 10+
- A Supabase project (free tier works for development)

### Steps

```bash
# 1. Clone the repository
git clone <repo-url>
cd crux-perizia-platform

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Edit .env.local and fill in your values

# 4. Start the development server
npm run dev
```

The application will be available at `http://localhost:3000`.

### Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build production bundle |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript type checking |
| `npm run test:unit` | Run unit tests |
| `npm run test:integration` | Run integration tests |
| `npm run test:load` | Run load tests (see tests/load/) |

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values.

| Variable | Scope | Description |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Public | Full URL of the application |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server-only** | Supabase service role key (bypasses RLS) |
| `DATABASE_URL` | **Server-only** | Direct database connection string |
| `PAYMENT_KEY_ID` | **Server-only** | Payment gateway key ID |
| `PAYMENT_KEY_SECRET` | **Server-only** | Payment gateway secret |
| `EMAIL_API_KEY` | **Server-only** | Transactional email API key |
| `WHATSAPP_ACCESS_TOKEN` | **Server-only** | WhatsApp Business API token |
| `WHATSAPP_PHONE_NUMBER_ID` | **Server-only** | WhatsApp sender phone ID |
| `AI_API_KEY` | **Server-only** | AI/LLM API key for chatbot |
| `QR_SIGNING_SECRET` | **Server-only** | HMAC key for QR credential signing |
| `ADMIN_SECRET` | **Server-only** | Bootstrap admin secret |

> **IMPORTANT**: Variables without the `NEXT_PUBLIC_` prefix are **server-only**.
> They are never sent to the browser and must never be imported by client components.
> `config/server.ts` uses the `server-only` package to enforce this at build time.

---

## Security

See [`docs/security.md`](./docs/security.md) for comprehensive security rules.

**Key principles:**
- Secrets are never committed to Git (`.env*` is gitignored)
- `SUPABASE_SERVICE_ROLE_KEY` and other secrets are server-only
- All user input is validated with Zod on the server side
- The backend is authoritative for pricing, capacity, and payment decisions
- Admin and scanner areas are protected by authentication
- Security headers are configured in `next.config.ts`

---

## Development Principles

1. **Server-first** — business logic belongs in `server/`, never in React components
2. **Validate everything** — every API input goes through Zod before processing
3. **Never trust the browser** — amounts, capacity, and auth decisions are server-side
4. **Secrets stay server-side** — `server-only` import prevents accidental exposure
5. **Small, focused modules** — each file has one clear responsibility
6. **No `any`** — TypeScript strict mode is enabled; avoid type casting
7. **Repositories only access data** — no business logic in repositories
8. **Services orchestrate** — business rules live in services, not components

---

## Contribution

This is an internal project for college fest management.

Before contributing:
1. Read [`docs/architecture.md`](./docs/architecture.md)
2. Read [`docs/security.md`](./docs/security.md)
3. Run `npm run type-check` and `npm run lint` before committing
