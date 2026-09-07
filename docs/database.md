# Database Schema: CRUX × PERIZIA Platform

## Overview

**ORM:** Prisma  
**Database:** PostgreSQL (hosted on Supabase)  
**Media Storage:** Cloudflare R2 (metadata only in PostgreSQL)  
**Schema file:** [`prisma/schema.prisma`](../prisma/schema.prisma)

---

## Models

### PERIZIA Domain

| Model | Purpose |
|---|---|
| `PeriziaEdition` | One annual edition of the PERIZIA fest |
| `PeriziaDay` | One day within an edition (dynamic, not hard-coded) |
| `Participant` | A person's persistent identity |
| `Registration` | A participant's registration for one edition |
| `Payment` | Payment record for a registration |
| `QrCredential` | Signed QR credential (one per confirmed registration) |
| `Workshop` | A workshop session on a specific Perizia day |
| `WorkshopRegistration` | Workshop selection by a participant |
| `WorkshopAttendance` | Actual workshop attendance (second QR scan) |
| `ConferenceCheckIn` | Conference entry per participant per day |
| `FoodCollection` | Breakfast/lunch collection per participant per day |
| `Notification` | Email/WhatsApp notification delivery tracking |
| `ScannerStation` | Physical scanning device/station |

### CRUX Domain

| Model | Purpose |
|---|---|
| `CruxEdition` | One annual edition of the CRUX cultural fest |
| `CruxEvent` | A cultural event within an edition |
| `CruxPoster` | An event poster (admin-editable) |
| `CruxGallery` | A photo/video gallery album |
| `CruxGalleryItem` | One media item inside a gallery |
| `CruxVideo` | A YouTube (or externally hosted) video |
| `CruxAnnouncement` | A news/announcement item |

### Shared

| Model | Purpose |
|---|---|
| `MediaAsset` | Media metadata (storageKey, publicUrl) — shared by all content types |
| `Venue` | Physical venue (shared by PERIZIA workshops and CRUX events) |

---

## Enums

| Enum | Values |
|---|---|
| `RegistrationStatus` | `PENDING`, `CONFIRMED`, `CANCELLED` |
| `PaymentStatus` | `PENDING`, `PAID`, `FAILED`, `REFUNDED` |
| `QrCredentialStatus` | `ACTIVE`, `REVOKED` |
| `WorkshopStatus` | `UPCOMING`, `OPEN`, `LIVE`, `ENDING_SOON`, `COMPLETED`, `CANCELLED`, `VENUE_CHANGED` |
| `WorkshopRegistrationStatus` | `REGISTERED`, `CANCELLED` |
| `MealType` | `BREAKFAST`, `LUNCH` |
| `ScannerStationType` | `CONFERENCE`, `WORKSHOP`, `FOOD`, `HELP_DESK` |
| `NotificationType` | `REGISTRATION_CONFIRMATION_EMAIL`, `INVOICE_EMAIL`, `WHATSAPP_CONFIRMATION` |
| `NotificationStatus` | `PENDING`, `SENT`, `FAILED` |
| `MediaType` | `IMAGE`, `VIDEO`, `DOCUMENT` |
| `StorageProvider` | `R2`, `YOUTUBE`, `EXTERNAL` |

---

## Critical Unique Constraints

| Table | Constraint | Business Rule |
|---|---|---|
| `participants` | `email` | Unique participant email |
| `participants` | `phone` | Unique participant phone |
| `perizia_editions` | `year` | One edition per year |
| `perizia_editions` | `slug` | Unique URL slug |
| `perizia_days` | `(editionId, dayNumber)` | One day number per edition |
| `perizia_days` | `(editionId, date)` | One calendar date per edition |
| `registrations` | `registrationNumber` | Unique registration ID |
| `registrations` | `(participantId, editionId)` | No double-registration per edition |
| `payments` | `registrationId` | One payment per registration |
| `payments` | `gatewayOrderId` | Unique gateway order |
| `payments` | `gatewayPaymentId` | Unique gateway payment |
| `qr_credentials` | `registrationId` | One QR per registration |
| `qr_credentials` | `tokenHash` | Unique QR token |
| `workshops` | `(editionId, slug)` | Unique workshop URL per edition |
| `workshop_registrations` | `(registrationId, periziaDayId)` | One workshop per participant per day |
| `workshop_registrations` | `(registrationId, workshopId)` | Can't register for same workshop twice |
| `workshop_attendances` | `(registrationId, workshopId)` | Can't attend same workshop twice |
| `workshop_attendances` | `(registrationId, periziaDayId)` | One workshop attendance per participant per day |
| `conference_check_ins` | `(registrationId, periziaDayId)` | One check-in per participant per day |
| `food_collections` | `(registrationId, periziaDayId, mealType)` | One meal type per participant per day |

---

## Key Design Decisions

### 1. Denormalized `periziaDayId` in WorkshopRegistration and WorkshopAttendance

PostgreSQL cannot create a unique constraint on a field belonging to a related model.
Therefore `periziaDayId` is stored directly in both `WorkshopRegistration` and `WorkshopAttendance`.
This enables the database-level unique constraint `(registrationId, periziaDayId)`.
The backend service layer must validate that `workshop.periziaDayId === workshopRegistration.periziaDayId`.

### 2. Dynamic Perizia Days

Days are rows in the `perizia_days` table, not hard-coded columns.
The MVP has 4 days for PERIZIA 2025, but the number can change by adding/removing `PeriziaDay` rows.
No application code assumes exactly 4 days.

### 3. Context-Agnostic QR Credential

A single `QrCredential` is issued per confirmed registration.
The same QR code is used for all scanning contexts (conference, workshop, food).
The scanning context (determined by the scanner station type and the API endpoint called)
determines what operation is performed — not the QR itself.

### 4. Payment and Notification Independence

Payment status (`PaymentStatus`) and registration status (`RegistrationStatus`) are separate fields.
Notification delivery failure (`NotificationStatus.FAILED`) does not roll back a payment or
change a registration to `CANCELLED`. Failed notifications can be retried via the `Notification` table.

### 5. No Binary Data in PostgreSQL

All media files are stored in Cloudflare R2.
The `MediaAsset` table stores only metadata (`storageKey`, `publicUrl`, `mimeType`, `fileSize`).
YouTube videos are referenced by `youtubeUrl` and `youtubeVideoId` in `CruxVideo` — no binary data.

### 6. Supabase Connection Pooling

Supabase uses PgBouncer for connection pooling.
Prisma requires two connection URLs:
- `DATABASE_URL` — the pooled URL (used at runtime by `prisma.$queryRaw`, etc.)
- `DIRECT_URL` — the direct URL (used by `prisma migrate` and `prisma db push`)

Both are configured in `prisma/schema.prisma` and `.env.example`.

---

## Indexes

High-frequency query indexes are defined on:

- `participants.email`, `participants.phone`
- `registrations.participantId`, `editionId`, `status`, `registrationNumber`
- `perizia_days.editionId`, `date`
- `workshops.editionId`, `periziaDayId`, `venueId`, `status`
- `workshop_registrations.registrationId`, `workshopId`, `periziaDayId`
- `workshop_attendances.registrationId`, `workshopId`, `periziaDayId`
- `conference_check_ins.registrationId`, `periziaDayId`
- `food_collections.registrationId`, `periziaDayId`, `mealType`
- `notifications.registrationId`, `type`, `status`
- All CRUX content tables: `editionId`, `published`, `displayOrder`

---

## Local Development

```bash
# 1. Configure .env.local with DATABASE_URL and DIRECT_URL
cp .env.example .env.local

# 2. Generate Prisma Client
npm run db:generate

# 3. Apply migrations (creates tables)
npm run db:migrate

# 4. Seed development data
npm run db:seed
```
