/**
 * config/server.ts
 * ──────────────────────────────────────────────────────────────────────────
 * Server-only configuration. Contains secrets and privileged credentials.
 *
 * THIS FILE MUST NEVER BE IMPORTED BY CLIENT COMPONENTS OR CLIENT-SIDE CODE.
 *
 * Enforce this by adding 'server-only' as the first import — Next.js will
 * throw a build-time error if a client bundle tries to import this module.
 */
import "server-only";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `[config/server] Missing required environment variable: ${name}\n` +
        `Copy .env.example to .env.local and fill in all values.`
    );
  }
  return value;
}

function optionalEnv(name: string): string | undefined {
  return process.env[name];
}

// ─── DB (Prisma) ──────────────────────────────────────────────────────────────
export const serverConfig = {
  databaseUrl: requireEnv("DATABASE_URL"),


  // Payment (filled in when Razorpay/payment gateway is integrated)
  paymentKeyId: optionalEnv("PAYMENT_KEY_ID"),
  paymentKeySecret: optionalEnv("PAYMENT_KEY_SECRET"),

  // Email (filled in when email service is integrated)
  emailApiKey: optionalEnv("EMAIL_API_KEY"),

  // WhatsApp Business API (filled in when WhatsApp integration is built)
  whatsappAccessToken: optionalEnv("WHATSAPP_ACCESS_TOKEN"),
  whatsappPhoneNumberId: optionalEnv("WHATSAPP_PHONE_NUMBER_ID"),

  // AI / Chatbot
  aiApiKey: optionalEnv("AI_API_KEY"),

  // Admin secret (used to protect admin routes until full auth is implemented)
  adminSecret: optionalEnv("ADMIN_SECRET"),

  // QR signing secret (HMAC key for QR credential integrity)
  qrSigningSecret: optionalEnv("QR_SIGNING_SECRET"),
} as const;
