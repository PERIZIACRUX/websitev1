import "server-only";

import { prisma } from "@/lib/db/client";
import { ApiError } from "@/server/utils/error-handler";
import type { TestPaymentInput } from "@/server/validators/payment.validator";
import { PaymentStatus, RegistrationStatus, Prisma } from "@prisma/client";
import { generateQrCredential } from "./qr.service";

export async function processTestPayment(data: TestPaymentInput) {
  return await prisma.$transaction(async (tx) => {
    // 1. Fetch the registration and current payment securely inside transaction
    const registration = await tx.registration.findUnique({
      where: { registrationNumber: data.registrationNumber },
      include: { payment: true },
    });

    if (!registration || !registration.payment) {
      throw new ApiError("Registration or payment record not found.", 404);
    }

    // 2. Idempotency Check
    // If the payment is already PAID, return the existing state immediately without error.
    if (registration.payment.status === PaymentStatus.PAID) {
      return {
        paymentStatus: registration.payment.status,
        registrationStatus: registration.status,
        registrationId: registration.id,
        message: "Already paid",
      };
    }

    // 3. Process State Transitions
    if (data.status === "SUCCESS") {
      // Update Payment: PENDING -> PAID
      const updatedPayment = await tx.payment.update({
        where: { id: registration.payment.id },
        data: {
          status: PaymentStatus.PAID,
          paidAt: new Date(),
        },
      });

      // Update Registration: PENDING -> CONFIRMED
      const updatedRegistration = await tx.registration.update({
        where: { id: registration.id },
        data: {
          status: RegistrationStatus.CONFIRMED,
          confirmedAt: new Date(),
        },
      });

      // Generate QR Credential
      const qrResult = await generateQrCredential(registration.id, tx as Prisma.TransactionClient);

      return {
        paymentStatus: updatedPayment.status,
        registrationStatus: updatedRegistration.status,
        registrationId: updatedRegistration.id,
        message: "Payment successful",
        qrToken: qrResult.rawToken,
      };
    } else {
      // Handle FAILURE
      // Update Payment: PENDING -> FAILED
      // Do NOT update Registration, it remains PENDING
      const updatedPayment = await tx.payment.update({
        where: { id: registration.payment.id },
        data: {
          status: PaymentStatus.FAILED,
        },
      });

      return {
        paymentStatus: updatedPayment.status,
        registrationStatus: registration.status,
        message: "Payment failed",
      };
    }
  });
}
