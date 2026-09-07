import { NextRequest, NextResponse } from "next/server";
import { TestPaymentSchema } from "@/server/validators/payment.validator";
import { processTestPayment } from "@/server/services/registration/payment.service";
import { ApiError } from "@/server/utils/error-handler";
import { z } from "zod";

import { createSessionToken } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request body
    const data = TestPaymentSchema.parse(body);
    
    // Process payment transition
    const result = await processTestPayment(data);
    
    const response = NextResponse.json({ success: true, data: result });
    
    if (result.paymentStatus === "PAID" && result.registrationId) {
      const cookieData = await createSessionToken({
        registrationId: result.registrationId,
        registrationNumber: data.registrationNumber,
      });
      response.cookies.set(cookieData.name, cookieData.value, cookieData.options);
    }

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }
    
    if (error instanceof ApiError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    console.error("Payment test error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
