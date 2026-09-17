import { Router } from "express";
import { TestPaymentSchema } from "../validators/payment.validator";
import { processTestPayment } from "../modules/registration/payment.service";
import { createSessionToken } from "../utils/session-utils";

export const paymentRouter = Router();

paymentRouter.post("/initiate", (req, res, next) => {
  res.status(501).json({
    success: false,
    error: "Payment initialization is not yet implemented.",
  });
});

paymentRouter.post("/test-verify", async (req, res, next) => {
  try {
    const data = TestPaymentSchema.parse(req.body);
    const result = await processTestPayment(data);
    
    if (result.paymentStatus === "PAID" && result.registrationId) {
      const cookieData = await createSessionToken({
        registrationId: result.registrationId,
        registrationNumber: data.registrationNumber,
      });
      res.cookie(cookieData.name, cookieData.value, cookieData.options);
    }

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});
