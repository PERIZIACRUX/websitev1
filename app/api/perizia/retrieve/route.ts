import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { RetrieveRegistrationSchema } from "@/server/validators/retrieve.validator";
import { ApiError } from "@/server/utils/error-handler";
import { createSessionToken } from "@/lib/auth/session";
import { RegistrationStatus, PaymentStatus } from "@prisma/client";

// Basic in-memory rate limiting for MVP
const rateLimitMap = new Map<string, { count: number; lastAttempt: number }>();

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    
    // Simple Rate Limiting: max 5 requests per minute per IP
    const rlData = rateLimitMap.get(ip) || { count: 0, lastAttempt: now };
    if (now - rlData.lastAttempt < 60000) {
      rlData.count++;
      if (rlData.count > 5) {
        throw new ApiError("Too many attempts. Please try again later.", 429);
      }
    } else {
      rlData.count = 1;
      rlData.lastAttempt = now;
    }
    rateLimitMap.set(ip, rlData);

    const body = await req.json();
    const data = RetrieveRegistrationSchema.parse(body);

    const registration = await prisma.registration.findUnique({
      where: { registrationNumber: data.registrationNumber },
      include: {
        participant: true,
        payment: true,
      },
    });

    // Use a generic error to prevent enumeration of registration numbers
    const genericAuthError = new ApiError("Invalid registration number or email address.", 401);

    if (!registration) {
      console.error(`[Retrieve API] Registration not found: ${data.registrationNumber}`);
      throw genericAuthError;
    }

    if (registration.participant.email.toLowerCase() !== data.email.toLowerCase()) {
      console.error(`[Retrieve API] Email mismatch for ${data.registrationNumber}. Expected: ${registration.participant.email}, Got: ${data.email}`);
      throw genericAuthError;
    }

    if (registration.status !== RegistrationStatus.CONFIRMED || registration.payment?.status !== PaymentStatus.PAID) {
      console.error(`[Retrieve API] Status mismatch for ${data.registrationNumber}. RegStatus: ${registration.status}, PayStatus: ${registration.payment?.status}`);
      throw new ApiError("This registration is not yet confirmed and paid.", 403);
    }

    // Set secure session cookie
    const cookieData = await createSessionToken({
      registrationId: registration.id,
      registrationNumber: registration.registrationNumber,
    });

    const response = NextResponse.json({
      success: true,
      message: "Authentication successful.",
      data: { redirectUrl: `/perizia/registration/${registration.registrationNumber}/confirmation` }
    });
    
    response.cookies.set(cookieData.name, cookieData.value, cookieData.options);
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Invalid input data." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
