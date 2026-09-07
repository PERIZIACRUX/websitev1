import { NextRequest, NextResponse } from "next/server";
import { formatErrorResponse } from "@/server/utils/error-handler";
import { periziaRegistrationSchema } from "@/server/validators/registration.validator";
import { processPeriziaRegistration } from "@/server/services/registration/registration.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Zod Validation
    const validatedData = periziaRegistrationSchema.parse(body);

    // 2. Process Registration safely within transaction
    const result = await processPeriziaRegistration(validatedData);

    // 3. Return safe success response
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    const errorResponse = formatErrorResponse(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  }
}
