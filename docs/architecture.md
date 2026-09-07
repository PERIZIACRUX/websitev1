# Architecture: CRUX × PERIZIA Platform

## Overview

The platform is built as a **Modular Monolith** using Next.js (App Router).
Frontend and backend live in the same repository but are strictly separated
by layer responsibility.

This document describes the responsibilities, rules, and data flow for each layer.

---

## Request Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    User / Browser                           │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP request
┌─────────────────────▼───────────────────────────────────────┐
│              Cloudflare (CDN / WAF / Cache)                 │
│  • Caches static assets and public pages                    │
│  • Web Application Firewall rules                           │
│  • DDoS protection                                          │
│  • Rate limiting at the edge                                │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│         Next.js Application (app/ + components/)            │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Public Pages (app/(public)/)                        │   │
│  │  • CRUX pages — informational/showcase               │   │
│  │  • PERIZIA pages — info + links to registration      │   │
│  │  • Server Components: fetch data, render HTML        │   │
│  │  • Client Components: interactivity only             │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Protected Areas                                     │   │
│  │  • app/register/ — PERIZIA registration flow        │   │
│  │  • app/scanner/  — Event-day QR scanner             │   │
│  │  • app/admin/    — Admin portal                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  API Routes (app/api/)                               │   │
│  │  • All mutation endpoints                            │   │
│  │  • All privileged read endpoints                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────────┘
                      │ calls
┌─────────────────────▼───────────────────────────────────────┐
│         Zod Validation (server/validators/)                  │
│  • Parses and validates ALL incoming request data           │
│  • Rejects malformed or out-of-range inputs immediately     │
│  • Returns structured errors to the client                  │
└─────────────────────┬───────────────────────────────────────┘
                      │ validated input only
┌─────────────────────▼───────────────────────────────────────┐
│         Workflows (server/workflows/)                        │
│  • Multi-step orchestration                                 │
│  • Coordinates multiple services                            │
│  • Handles transactions, rollbacks, retries                 │
│  • Example: registration, check-in                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│         Services (server/services/)                          │
│  • ALL business logic and domain rules                      │
│  • Registration capacity enforcement                        │
│  • Pricing rules (authoritative)                            │
│  • QR credential issuance                                   │
│  • Check-in authorization                                   │
│  • Food collection tracking                                 │
└──────────┬──────────────────────┬───────────────────────────┘
           │                      │
┌──────────▼──────────┐  ┌────────▼────────────────────────────┐
│  Repositories        │  │  External Integration Libs           │
│  (server/repos/)     │  │  (lib/)                              │
│                      │  │                                      │
│  • Database access   │  │  lib/payments/   — Payment gateway   │
│  • ONLY data layer   │  │  lib/email/      — Transactional     │
│  • Typed results     │  │  lib/whatsapp/   — WhatsApp API      │
│  • No business logic │  │  lib/qr/         — QR gen/verify     │
│  • No HTTP calls     │  │  lib/chatbot/    — AI chatbot        │
└──────────┬──────────┘  └────────┬────────────────────────────┘
           │                      │
┌──────────▼──────────────────────▼───────────────────────────┐
│                    PostgreSQL (Supabase)                     │
│  • All data persisted here                                  │
│  • Row Level Security enforced                              │
│  • Service role used only for privileged server operations  │
└─────────────────────────────────────────────────────────────┘
```

---

## Layer Responsibilities

### `app/` — Next.js Pages and API Routes

**Allowed:**
- Render React components (server and client)
- Call server actions or API routes for mutations
- Fetch data via server components (calling repositories directly is allowed in simple read cases, but prefer services)
- Route protection via middleware

**Not allowed:**
- Contain database credentials or service-role keys
- Compute authoritative registration fees
- Enforce registration capacity
- Determine payment success
- Generate or verify QR credentials
- Call external APIs (payment, email, WhatsApp) directly

---

### `components/` — React UI Components

**Allowed:**
- Render UI from typed props
- Hold local UI state (form state, toggles, etc.)
- Call API routes / server actions for data mutations
- Display server-validated errors

**Not allowed:**
- Access database directly
- Import `server-only` modules
- Import `config/server.ts` or `lib/db/client.ts`
- Contain business rules (pricing, capacity, auth decisions)
- Trust any value that could affect registration/payment outcomes

---

### `server/validators/` — Zod Schemas

**Responsibility:**
Parse and validate all incoming data before it reaches any service.

**Rules:**
- Every API route handler must validate its input with Zod before calling any service
- Use `.safeParse()` for structured error responses
- Validators are pure functions — no side effects, no database calls

---

### `server/services/` — Business Logic

**Responsibility:**
All domain rules and business logic. The authoritative layer.

**Rules:**
- Services call repositories for data access
- Services call `lib/` modules for external integrations
- Services enforce capacity limits, pricing, and eligibility
- Services throw typed errors on business rule violations
- Services never access `req`/`res` objects — they are framework-agnostic

---

### `server/repositories/` — Data Access

**Responsibility:**
Database read and write operations. Nothing else.

**Rules:**
- Use `createSupabaseAdmin()` for privileged writes
- Use `createSupabaseClient()` for public reads (RLS applies)
- Return typed data; throw on database errors
- No business logic, no HTTP calls, no email/payment calls
- Select only required columns — never `SELECT *` on participant data

---

### `server/workflows/` — Multi-step Orchestration

**Responsibility:**
Coordinate multiple services for complex business operations.

**Examples:**
- `completeRegistration`: validate → check capacity → create order → verify payment → issue QR → send email → send WhatsApp
- `checkInParticipant`: verify QR → check not already checked in → mark check-in → update attendance

**Rules:**
- Workflows call services, not repositories directly
- Handle transactional consistency (rollback if a step fails)
- Add distributed tracing here in the future

---

### `lib/` — External Integration Abstractions

Each module in `lib/` wraps a specific external service or capability.
All `lib/` modules import `server-only` — they are never bundled into the browser.

| Module | Wraps |
|---|---|
| `lib/db/` | Supabase client setup |
| `lib/auth/` | Authentication infrastructure |
| `lib/qr/` | QR code generation and HMAC verification |
| `lib/payments/` | Payment gateway (Razorpay) |
| `lib/email/` | Transactional email service |
| `lib/whatsapp/` | WhatsApp Business API |
| `lib/chatbot/` | AI language model API |

---

### `config/` — Configuration

| File | Contents |
|---|---|
| `config/index.ts` | `NEXT_PUBLIC_*` vars and non-sensitive constants — safe in browser |
| `config/server.ts` | Server-only secrets — `server-only` import prevents browser bundling |

---

## Key Design Decisions

### Why not microservices?

At 500 participants, microservices add operational overhead without meaningful benefit.
A well-structured monolith is easier to deploy, debug, and reason about for a small team.

### Why Next.js App Router?

- Server components fetch data without a separate API call
- Server actions provide type-safe form submission without boilerplate
- Built-in optimisation (image, font, caching)
- Excellent TypeScript support

### Why Supabase?

- Managed PostgreSQL with a generous free tier
- Row Level Security enforced at the database level
- Real-time subscriptions available if needed (event-day dashboard)
- Supabase Auth can be adopted later if needed

### Why Zod?

- Runtime type safety at the server boundary
- Works identically on server and (if needed) client
- Integrates well with TypeScript inference
- Simple, readable schema definitions

### High Traffic Design

The previous site saw 2,000+ concurrent users. Key design choices for traffic:
- Static and server-cached public pages (CRUX info, PERIZIA info)
- Cloudflare caches static assets and CDN-eligible pages
- Stateless API routes — horizontal scaling is straightforward
- Database connection pooling via Supabase's built-in pooler
- Rate limiting on registration and scanner endpoints (Step N)
