// shared/src/types/enums.ts

export enum RegistrationStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED"
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED"
}

export enum QrCredentialStatus {
  ACTIVE = "ACTIVE",
  REVOKED = "REVOKED"
}

export enum WorkshopStatus {
  UPCOMING = "UPCOMING",
  OPEN = "OPEN",
  LIVE = "LIVE",
  ENDING_SOON = "ENDING_SOON",
  COMPLETED = "COMPLETED"
}

export enum WorkshopRegistrationStatus {
  REGISTERED = "REGISTERED",
  CANCELLED = "CANCELLED"
}

export enum MealType {
  BREAKFAST = "BREAKFAST",
  LUNCH = "LUNCH"
}

export enum ScannerStationType {
  CONFERENCE = "CONFERENCE",
  WORKSHOP = "WORKSHOP",
  FOOD = "FOOD",
  HELP_DESK = "HELP_DESK"
}

export enum NotificationType {
  REGISTRATION_CONFIRMATION_EMAIL = "REGISTRATION_CONFIRMATION_EMAIL",
  INVOICE_EMAIL = "INVOICE_EMAIL",
  WHATSAPP_CONFIRMATION = "WHATSAPP_CONFIRMATION"
}

export enum NotificationStatus {
  PENDING = "PENDING",
  SENT = "SENT",
  FAILED = "FAILED"
}

export enum MediaType {
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  DOCUMENT = "DOCUMENT"
}

export enum StorageProvider {
  R2 = "R2",
  YOUTUBE = "YOUTUBE",
  EXTERNAL = "EXTERNAL"
}

export enum StaffRole {
  ADMIN = "ADMIN",
  VOLUNTEER = "VOLUNTEER"
}

export type Fest = "crux" | "perizia";
export type AdminRole = "super_admin" | "event_admin" | "scanner_operator";
