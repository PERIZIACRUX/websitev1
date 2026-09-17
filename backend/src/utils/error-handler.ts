import { z } from "zod";
import { Prisma } from "@prisma/client";

/**
 * Standardized API Error class for predictable error handling.
 */
export class ApiError extends Error {
  public statusCode: number;
  public code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

/**
 * Formats a given error into a safe, client-consumable response.
 * Prevents database details, stack traces, or internal secrets from leaking.
 */
export function formatErrorResponse(error: unknown) {
  // 1. Handle custom API Errors
  if (error instanceof ApiError) {
    return {
      success: false as const,
      error: error.message,
      code: error.code,
      status: error.statusCode,
    };
  }

  // 2. Handle Zod validation errors
  if (error instanceof z.ZodError) {
    return {
      success: false as const,
      error: "Validation failed",
      issues: error.issues,
      status: 400,
    };
  }

  // 3. Handle Prisma database errors safely (never leak raw message to client)
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    console.error("[Prisma Error]", error.code, error.meta);
    return {
      success: false as const,
      error: "Database operation failed",
      code: error.code,
      status: 400, // or 409 for unique constraint violations, etc. depending on code
    };
  }

  // 4. Handle generic unhandled errors (catch-all)
  console.error("[Unhandled Error]", error);
  return {
    success: false as const,
    error: "An unexpected internal server error occurred.",
    status: 500,
  };
}
