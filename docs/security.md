# Security Rules: CRUX × PERIZIA Platform

This document defines the security principles and mandatory rules that all
contributors must follow. Read this before writing any code.

---

## 1. Secrets Management

### Rule 1.1 — Never commit secrets to Git

- `.env`, `.env.local`, and `.env.*.local` are in `.gitignore`
- Only `.env.example` (variable names, no values) is committed
- If a secret is accidentally committed, rotate it immediately

### Rule 1.2 — Server-only secrets must be server-only

The following secrets must **never** appear in client-side code or browser bundles:

| Secret | Risk if exposed |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Full database access, bypasses all RLS |
| `DATABASE_URL` | Direct database access |
| `PAYMENT_KEY_SECRET` | Can initiate and manipulate payments |
| `EMAIL_API_KEY` | Can send emails on our behalf |
| `WHATSAPP_ACCESS_TOKEN` | Can send WhatsApp messages |
| `AI_API_KEY` | Cost exposure, prompt injection risk |
| `QR_SIGNING_SECRET` | Can forge QR credentials |
| `ADMIN_SECRET` | Admin access |

### Rule 1.3 — Use `server-only` to enforce secrets at build time

All modules that handle secrets import `server-only`:

```typescript
import "server-only";
// If a client component imports this module, Next.js will throw a build error
```

Modules with this enforcement:
- `config/server.ts`
- `lib/db/client.ts` (for the admin client)
- `lib/payments/`
- `lib/email/`
- `lib/whatsapp/`
- `lib/qr/`
- `lib/auth/`
- `lib/chatbot/`

---

## 2. Input Validation

### Rule 2.1 — All user input is validated server-side with Zod

No API route or server action may process user input without first passing it
through a Zod schema:

```typescript
// ✅ Correct
const result = registrationInputSchema.safeParse(await request.json());
if (!result.success) {
  return NextResponse.json({ success: false, error: result.error.flatten() }, { status: 400 });
}
const input = result.data; // Now safe to use

// ❌ Wrong — trusting raw input
const input = await request.json();
await registerParticipant(input); // Never do this
```

### Rule 2.2 — Never trust values from the browser for business-critical decisions

The browser must never control:
- Registration fee amounts
- Workshop seat availability
- Payment success/failure outcome
- QR code validity
- Check-in authorization
- Food collection eligibility
- Registration capacity

These decisions are made **exclusively on the server**.

---

## 3. Authentication and Authorization

### Rule 3.1 — Admin routes are protected

The `/admin` area is accessible only to authenticated admins.
Authentication will use a server-side session mechanism.
The server verifies the session on every request — the browser is never trusted to declare admin status.

### Rule 3.2 — Scanner routes are protected

The `/scanner` area is accessible only to authenticated scanner operators.
Different from admins — operators may have limited access (scan only, no participant management).

### Rule 3.3 — No custom authentication schemes

Authentication uses established mechanisms (Supabase Auth or Next.js session with a secure httpOnly cookie).
Do NOT invent a custom authentication protocol.

### Rule 3.4 — Middleware enforces route protection

Next.js middleware (`middleware.ts`) will enforce authentication on:
- `/admin/*`
- `/scanner/*`
- All sensitive API routes under `/api/admin/*` and `/api/scanner/*`

---

## 4. Database Security

### Rule 4.1 — Row Level Security (RLS) is enabled on all tables

Every table in Supabase must have RLS enabled.
The anonymous key can only read data explicitly allowed by RLS policies.
The service role key is the only way to bypass RLS — and it is server-only.

### Rule 4.2 — Use the right client

| Situation | Client to use |
|---|---|
| Public data reads in server components | `createSupabaseClient()` (anon key, RLS applies) |
| Registration writes, admin operations | `createSupabaseAdmin()` (service role, NEVER in browser) |

### Rule 4.3 — Never expose raw database errors to the client

Database errors may leak schema information, column names, or constraint details.
Catch all database errors server-side and return generic error messages to the client.

### Rule 4.4 — Parameterised queries only

Never construct SQL with string interpolation.
Use the Supabase client's query builder, which handles parameterisation automatically.

---

## 5. Payment Security

### Rule 5.1 — Amount is always computed server-side

The registration fee is computed by the server from authoritative pricing rules.
The browser sends a registration intent — it NEVER sends the amount to charge.

### Rule 5.2 — Payment success is verified by server-side signature check

After the user completes payment in the browser:
1. The payment gateway sends a signature to the browser
2. The browser forwards the signature to our API
3. Our API verifies the signature using `PAYMENT_KEY_SECRET` (server-side)
4. Only if the signature is valid does the server mark the registration as paid

The browser's claim of "payment successful" is NEVER trusted without this verification.

### Rule 5.3 — Webhook verification

Payment gateway webhooks (for async notifications) must verify the webhook signature
before processing. Invalid signatures are rejected immediately.

---

## 6. QR Credential Security

### Rule 6.1 — QR codes are generated server-side only

The QR code image and payload are generated by the server after confirmed payment.
The browser never generates QR codes.

### Rule 6.2 — QR codes are HMAC-signed

Each QR payload is signed with `QR_SIGNING_SECRET` using HMAC-SHA256.
A QR payload presented at the scanner must have its signature verified before
any action (check-in, attendance, food) is taken.

### Rule 6.3 — Verification is server-side only

The scanner app sends the raw QR payload to the server for verification.
The scanner UI never decides whether a QR is valid — only the server does.

### Rule 6.4 — Single-use enforcement

Each QR action (check-in, workshop attendance, food) is tracked server-side.
Attempting to use the same QR for the same action twice is rejected by the server.

---

## 7. HTTP Security Headers

The following headers are configured in `next.config.ts`:

| Header | Value | Purpose |
|---|---|---|
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME-type sniffing |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Enforce HTTPS |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limit referrer leakage |
| `Permissions-Policy` | Disables camera, mic, geolocation, payment | Limit browser API access |
| `X-DNS-Prefetch-Control` | `on` | Performance + minor security |

A Content Security Policy (CSP) header will be added when the full UI is built.

---

## 8. Rate Limiting

Rate limiting will be applied to sensitive endpoints in a later step:
- `/api/register` — prevent registration spam
- `/api/scanner/verify` — prevent brute-force QR guessing
- `/api/chatbot` — prevent cost abuse

Rate limiting will be enforced at the Cloudflare level (WAF rules) and optionally
at the application level using an in-memory or Redis-backed limiter.

---

## 9. Sensitive Data Handling

### Rule 9.1 — Participant data is not public

Participant names, emails, phone numbers, and registration IDs are never exposed
in public API responses or in the page HTML.

### Rule 9.2 — Minimal data collection

Collect only what is needed for registration and event-day operations.
Do not store unnecessary personal information.

### Rule 9.3 — Logs must not contain secrets

Application logs must not include:
- API keys
- Database connection strings
- Payment secrets
- Participant phone numbers or emails (in plain log lines)

---

## 10. Dependency Security

- Run `npm audit` regularly to check for known vulnerabilities.
- Pin major versions of critical dependencies.
- Do not add unnecessary packages — each dependency is an attack surface.
- Review package source before adding new dependencies.

---

## Incident Response

If a security issue is discovered:

1. Do NOT commit a "fix" without understanding the root cause.
2. Rotate any secrets that may have been exposed immediately.
3. Document the incident, root cause, and remediation.
4. Add a test to prevent regression.

---

## Checklist for New Features

Before merging any feature that handles user data or privileged operations:

- [ ] All input is validated with Zod server-side
- [ ] No secrets are in client-side code
- [ ] `server-only` is imported in modules with secrets
- [ ] Business rules are in services, not components or API handlers
- [ ] Database errors are caught and not exposed to the client
- [ ] Route protection is enforced in middleware
- [ ] QR/payment verification is server-side only
- [ ] No new packages added without review
