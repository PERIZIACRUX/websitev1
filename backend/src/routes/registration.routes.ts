import { Router } from "express";
import { periziaRegistrationSchema } from "../validators/registration.validator";
import { processPeriziaRegistration } from "../modules/registration/registration.service";
import { RetrieveRegistrationSchema } from "../validators/retrieve.validator";
import { prisma } from "../infrastructure/db/client";
import { ApiError } from "../utils/error-handler";
import { RegistrationStatus, PaymentStatus } from "@prisma/client";
import { createSessionToken } from "../utils/session-utils";

export const registrationRouter = Router();

registrationRouter.post("/register", async (req, res, next) => {
  try {
    const validatedData = periziaRegistrationSchema.parse(req.body);
    const result = await processPeriziaRegistration(validatedData);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

const rateLimitMap = new Map<string, { count: number; lastAttempt: number }>();

registrationRouter.post("/retrieve", async (req, res, next) => {
  try {
    const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "unknown";
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

    const data = RetrieveRegistrationSchema.parse(req.body);

    const registration = await prisma.registration.findUnique({
      where: { registrationNumber: data.registrationNumber },
      include: {
        participant: true,
        payment: true,
      },
    });

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

    res.cookie(cookieData.name, cookieData.value, cookieData.options);

    res.json({
      success: true,
      message: "Authentication successful.",
      data: { redirectUrl: `/perizia/registration/${registration.registrationNumber}/confirmation` }
    });
  } catch (error) {
    next(error);
  }
});
