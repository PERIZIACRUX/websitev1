-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "QrCredentialStatus" AS ENUM ('ACTIVE', 'REVOKED');

-- CreateEnum
CREATE TYPE "WorkshopStatus" AS ENUM ('UPCOMING', 'OPEN', 'LIVE', 'ENDING_SOON', 'COMPLETED', 'CANCELLED', 'VENUE_CHANGED');

-- CreateEnum
CREATE TYPE "WorkshopRegistrationStatus" AS ENUM ('REGISTERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('BREAKFAST', 'LUNCH');

-- CreateEnum
CREATE TYPE "ScannerStationType" AS ENUM ('CONFERENCE', 'WORKSHOP', 'FOOD', 'HELP_DESK');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('REGISTRATION_CONFIRMATION_EMAIL', 'INVOICE_EMAIL', 'WHATSAPP_CONFIRMATION');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "StorageProvider" AS ENUM ('R2', 'YOUTUBE', 'EXTERNAL');

-- CreateTable
CREATE TABLE "media_assets" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mediaType" "MediaType" NOT NULL,
    "mimeType" TEXT NOT NULL,
    "storageProvider" "StorageProvider" NOT NULL,
    "storageKey" TEXT NOT NULL,
    "publicUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "fileSize" INTEGER,
    "altText" TEXT,
    "uploadedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venues" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "googleMapsUrl" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "venues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scanner_stations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ScannerStationType" NOT NULL,
    "location" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scanner_stations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perizia_editions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "maxParticipants" INTEGER NOT NULL DEFAULT 500,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "perizia_editions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perizia_days" (
    "id" TEXT NOT NULL,
    "editionId" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "perizia_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participants" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "collegeName" TEXT NOT NULL,
    "collegeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registrations" (
    "id" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "editionId" TEXT NOT NULL,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'PENDING',
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "gateway" TEXT NOT NULL,
    "gatewayOrderId" TEXT,
    "gatewayPaymentId" TEXT,
    "gatewaySignature" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qr_credentials" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "status" "QrCredentialStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "qr_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workshops" (
    "id" TEXT NOT NULL,
    "editionId" TEXT NOT NULL,
    "periziaDayId" TEXT NOT NULL,
    "venueId" TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "speaker" TEXT,
    "imageMediaId" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "capacity" INTEGER,
    "status" "WorkshopStatus" NOT NULL DEFAULT 'UPCOMING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workshops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workshop_registrations" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "workshopId" TEXT NOT NULL,
    "periziaDayId" TEXT NOT NULL,
    "status" "WorkshopRegistrationStatus" NOT NULL DEFAULT 'REGISTERED',
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workshop_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workshop_attendances" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "workshopId" TEXT NOT NULL,
    "periziaDayId" TEXT NOT NULL,
    "scannerStationId" TEXT,
    "attendedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "markedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workshop_attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conference_check_ins" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "periziaDayId" TEXT NOT NULL,
    "scannerStationId" TEXT,
    "checkedInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkedInBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conference_check_ins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_collections" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "periziaDayId" TEXT NOT NULL,
    "mealType" "MealType" NOT NULL,
    "collectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scannerStationId" TEXT,
    "collectedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "food_collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "sentAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crux_editions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crux_editions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crux_events" (
    "id" TEXT NOT NULL,
    "editionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "eventDate" TIMESTAMP(3),
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "venueId" TEXT,
    "coverMediaId" TEXT,
    "registrationInfo" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crux_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crux_posters" (
    "id" TEXT NOT NULL,
    "editionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "mediaId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crux_posters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crux_galleries" (
    "id" TEXT NOT NULL,
    "editionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "coverMediaId" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crux_galleries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crux_gallery_items" (
    "id" TEXT NOT NULL,
    "galleryId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "caption" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crux_gallery_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crux_videos" (
    "id" TEXT NOT NULL,
    "editionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "youtubeUrl" TEXT NOT NULL,
    "youtubeVideoId" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "category" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crux_videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crux_announcements" (
    "id" TEXT NOT NULL,
    "editionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "coverMediaId" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishAt" TIMESTAMP(3),
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crux_announcements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "perizia_editions_year_key" ON "perizia_editions"("year");

-- CreateIndex
CREATE UNIQUE INDEX "perizia_editions_slug_key" ON "perizia_editions"("slug");

-- CreateIndex
CREATE INDEX "perizia_days_editionId_idx" ON "perizia_days"("editionId");

-- CreateIndex
CREATE INDEX "perizia_days_date_idx" ON "perizia_days"("date");

-- CreateIndex
CREATE UNIQUE INDEX "perizia_days_editionId_dayNumber_key" ON "perizia_days"("editionId", "dayNumber");

-- CreateIndex
CREATE UNIQUE INDEX "perizia_days_editionId_date_key" ON "perizia_days"("editionId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "participants_email_key" ON "participants"("email");

-- CreateIndex
CREATE UNIQUE INDEX "participants_phone_key" ON "participants"("phone");

-- CreateIndex
CREATE INDEX "participants_email_idx" ON "participants"("email");

-- CreateIndex
CREATE INDEX "participants_phone_idx" ON "participants"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "registrations_registrationNumber_key" ON "registrations"("registrationNumber");

-- CreateIndex
CREATE INDEX "registrations_participantId_idx" ON "registrations"("participantId");

-- CreateIndex
CREATE INDEX "registrations_editionId_idx" ON "registrations"("editionId");

-- CreateIndex
CREATE INDEX "registrations_status_idx" ON "registrations"("status");

-- CreateIndex
CREATE INDEX "registrations_registrationNumber_idx" ON "registrations"("registrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "registrations_participantId_editionId_key" ON "registrations"("participantId", "editionId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_registrationId_key" ON "payments"("registrationId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_gatewayOrderId_key" ON "payments"("gatewayOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_gatewayPaymentId_key" ON "payments"("gatewayPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "qr_credentials_registrationId_key" ON "qr_credentials"("registrationId");

-- CreateIndex
CREATE UNIQUE INDEX "qr_credentials_tokenHash_key" ON "qr_credentials"("tokenHash");

-- CreateIndex
CREATE INDEX "workshops_editionId_idx" ON "workshops"("editionId");

-- CreateIndex
CREATE INDEX "workshops_periziaDayId_idx" ON "workshops"("periziaDayId");

-- CreateIndex
CREATE INDEX "workshops_venueId_idx" ON "workshops"("venueId");

-- CreateIndex
CREATE INDEX "workshops_status_idx" ON "workshops"("status");

-- CreateIndex
CREATE UNIQUE INDEX "workshops_editionId_slug_key" ON "workshops"("editionId", "slug");

-- CreateIndex
CREATE INDEX "workshop_registrations_registrationId_idx" ON "workshop_registrations"("registrationId");

-- CreateIndex
CREATE INDEX "workshop_registrations_workshopId_idx" ON "workshop_registrations"("workshopId");

-- CreateIndex
CREATE INDEX "workshop_registrations_periziaDayId_idx" ON "workshop_registrations"("periziaDayId");

-- CreateIndex
CREATE UNIQUE INDEX "workshop_registrations_registrationId_periziaDayId_key" ON "workshop_registrations"("registrationId", "periziaDayId");

-- CreateIndex
CREATE UNIQUE INDEX "workshop_registrations_registrationId_workshopId_key" ON "workshop_registrations"("registrationId", "workshopId");

-- CreateIndex
CREATE INDEX "workshop_attendances_registrationId_idx" ON "workshop_attendances"("registrationId");

-- CreateIndex
CREATE INDEX "workshop_attendances_workshopId_idx" ON "workshop_attendances"("workshopId");

-- CreateIndex
CREATE INDEX "workshop_attendances_periziaDayId_idx" ON "workshop_attendances"("periziaDayId");

-- CreateIndex
CREATE UNIQUE INDEX "workshop_attendances_registrationId_workshopId_key" ON "workshop_attendances"("registrationId", "workshopId");

-- CreateIndex
CREATE UNIQUE INDEX "workshop_attendances_registrationId_periziaDayId_key" ON "workshop_attendances"("registrationId", "periziaDayId");

-- CreateIndex
CREATE INDEX "conference_check_ins_registrationId_idx" ON "conference_check_ins"("registrationId");

-- CreateIndex
CREATE INDEX "conference_check_ins_periziaDayId_idx" ON "conference_check_ins"("periziaDayId");

-- CreateIndex
CREATE UNIQUE INDEX "conference_check_ins_registrationId_periziaDayId_key" ON "conference_check_ins"("registrationId", "periziaDayId");

-- CreateIndex
CREATE INDEX "food_collections_registrationId_idx" ON "food_collections"("registrationId");

-- CreateIndex
CREATE INDEX "food_collections_periziaDayId_idx" ON "food_collections"("periziaDayId");

-- CreateIndex
CREATE INDEX "food_collections_mealType_idx" ON "food_collections"("mealType");

-- CreateIndex
CREATE UNIQUE INDEX "food_collections_registrationId_periziaDayId_mealType_key" ON "food_collections"("registrationId", "periziaDayId", "mealType");

-- CreateIndex
CREATE INDEX "notifications_registrationId_idx" ON "notifications"("registrationId");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- CreateIndex
CREATE INDEX "notifications_status_idx" ON "notifications"("status");

-- CreateIndex
CREATE UNIQUE INDEX "crux_editions_year_key" ON "crux_editions"("year");

-- CreateIndex
CREATE UNIQUE INDEX "crux_editions_slug_key" ON "crux_editions"("slug");

-- CreateIndex
CREATE INDEX "crux_events_editionId_idx" ON "crux_events"("editionId");

-- CreateIndex
CREATE INDEX "crux_events_published_idx" ON "crux_events"("published");

-- CreateIndex
CREATE INDEX "crux_events_displayOrder_idx" ON "crux_events"("displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "crux_events_editionId_slug_key" ON "crux_events"("editionId", "slug");

-- CreateIndex
CREATE INDEX "crux_posters_editionId_idx" ON "crux_posters"("editionId");

-- CreateIndex
CREATE INDEX "crux_posters_published_idx" ON "crux_posters"("published");

-- CreateIndex
CREATE INDEX "crux_posters_displayOrder_idx" ON "crux_posters"("displayOrder");

-- CreateIndex
CREATE INDEX "crux_galleries_editionId_idx" ON "crux_galleries"("editionId");

-- CreateIndex
CREATE INDEX "crux_galleries_published_idx" ON "crux_galleries"("published");

-- CreateIndex
CREATE INDEX "crux_gallery_items_galleryId_idx" ON "crux_gallery_items"("galleryId");

-- CreateIndex
CREATE INDEX "crux_gallery_items_displayOrder_idx" ON "crux_gallery_items"("displayOrder");

-- CreateIndex
CREATE INDEX "crux_videos_editionId_idx" ON "crux_videos"("editionId");

-- CreateIndex
CREATE INDEX "crux_videos_published_idx" ON "crux_videos"("published");

-- CreateIndex
CREATE INDEX "crux_videos_displayOrder_idx" ON "crux_videos"("displayOrder");

-- CreateIndex
CREATE INDEX "crux_announcements_editionId_idx" ON "crux_announcements"("editionId");

-- CreateIndex
CREATE INDEX "crux_announcements_published_idx" ON "crux_announcements"("published");

-- CreateIndex
CREATE INDEX "crux_announcements_displayOrder_idx" ON "crux_announcements"("displayOrder");

-- AddForeignKey
ALTER TABLE "perizia_days" ADD CONSTRAINT "perizia_days_editionId_fkey" FOREIGN KEY ("editionId") REFERENCES "perizia_editions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "participants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_editionId_fkey" FOREIGN KEY ("editionId") REFERENCES "perizia_editions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "registrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_credentials" ADD CONSTRAINT "qr_credentials_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "registrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workshops" ADD CONSTRAINT "workshops_editionId_fkey" FOREIGN KEY ("editionId") REFERENCES "perizia_editions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workshops" ADD CONSTRAINT "workshops_periziaDayId_fkey" FOREIGN KEY ("periziaDayId") REFERENCES "perizia_days"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workshops" ADD CONSTRAINT "workshops_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "venues"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workshops" ADD CONSTRAINT "workshops_imageMediaId_fkey" FOREIGN KEY ("imageMediaId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workshop_registrations" ADD CONSTRAINT "workshop_registrations_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "registrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workshop_registrations" ADD CONSTRAINT "workshop_registrations_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "workshops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workshop_registrations" ADD CONSTRAINT "workshop_registrations_periziaDayId_fkey" FOREIGN KEY ("periziaDayId") REFERENCES "perizia_days"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workshop_attendances" ADD CONSTRAINT "workshop_attendances_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "registrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workshop_attendances" ADD CONSTRAINT "workshop_attendances_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "workshops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workshop_attendances" ADD CONSTRAINT "workshop_attendances_periziaDayId_fkey" FOREIGN KEY ("periziaDayId") REFERENCES "perizia_days"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workshop_attendances" ADD CONSTRAINT "workshop_attendances_scannerStationId_fkey" FOREIGN KEY ("scannerStationId") REFERENCES "scanner_stations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conference_check_ins" ADD CONSTRAINT "conference_check_ins_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "registrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conference_check_ins" ADD CONSTRAINT "conference_check_ins_periziaDayId_fkey" FOREIGN KEY ("periziaDayId") REFERENCES "perizia_days"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conference_check_ins" ADD CONSTRAINT "conference_check_ins_scannerStationId_fkey" FOREIGN KEY ("scannerStationId") REFERENCES "scanner_stations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_collections" ADD CONSTRAINT "food_collections_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "registrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_collections" ADD CONSTRAINT "food_collections_periziaDayId_fkey" FOREIGN KEY ("periziaDayId") REFERENCES "perizia_days"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_collections" ADD CONSTRAINT "food_collections_scannerStationId_fkey" FOREIGN KEY ("scannerStationId") REFERENCES "scanner_stations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "registrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crux_events" ADD CONSTRAINT "crux_events_editionId_fkey" FOREIGN KEY ("editionId") REFERENCES "crux_editions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crux_events" ADD CONSTRAINT "crux_events_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "venues"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crux_events" ADD CONSTRAINT "crux_events_coverMediaId_fkey" FOREIGN KEY ("coverMediaId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crux_posters" ADD CONSTRAINT "crux_posters_editionId_fkey" FOREIGN KEY ("editionId") REFERENCES "crux_editions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crux_posters" ADD CONSTRAINT "crux_posters_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crux_galleries" ADD CONSTRAINT "crux_galleries_editionId_fkey" FOREIGN KEY ("editionId") REFERENCES "crux_editions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crux_galleries" ADD CONSTRAINT "crux_galleries_coverMediaId_fkey" FOREIGN KEY ("coverMediaId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crux_gallery_items" ADD CONSTRAINT "crux_gallery_items_galleryId_fkey" FOREIGN KEY ("galleryId") REFERENCES "crux_galleries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crux_gallery_items" ADD CONSTRAINT "crux_gallery_items_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crux_videos" ADD CONSTRAINT "crux_videos_editionId_fkey" FOREIGN KEY ("editionId") REFERENCES "crux_editions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crux_announcements" ADD CONSTRAINT "crux_announcements_editionId_fkey" FOREIGN KEY ("editionId") REFERENCES "crux_editions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crux_announcements" ADD CONSTRAINT "crux_announcements_coverMediaId_fkey" FOREIGN KEY ("coverMediaId") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
