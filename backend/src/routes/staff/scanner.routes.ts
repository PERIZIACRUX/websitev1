import { Router } from "express";
import { requireStaff } from "../../middleware/staff-auth";
import { verifyQrCredential } from "../../modules/registration/qr.service";
import { z } from "zod";

const router = Router();

router.use(requireStaff());

const verifyScanSchema = z.object({
  qrToken: z.string().trim().min(1),
});

router.post("/verify", async (req, res, next) => {
  try {
    const { qrToken } = verifyScanSchema.parse(req.body);

    const result = await verifyQrCredential(qrToken);

    res.json({
      success: true,
      data: {
        valid: true,
        registrationNumber: result.registration.registrationNumber,
        participantName: result.registration.participant.fullName,
        message: "Valid Registration",
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError || error.name === "ZodError") {
      res.json({ success: true, data: { valid: false, message: "Invalid or empty QR code." } });
      return;
    }

    // Safely map known errors
    if (error.statusCode === 401 || error.message?.includes("Invalid QR")) {
      res.json({ success: true, data: { valid: false, message: "Invalid QR code." } });
      return;
    }
    
    if (error.message?.includes("revoked")) {
      res.json({ success: true, data: { valid: false, message: "This QR credential has been revoked." } });
      return;
    }
    
    if (error.statusCode === 403 || error.message?.includes("not confirmed")) {
      res.json({ success: true, data: { valid: false, message: "Registration is not confirmed." } });
      return;
    }

    res.json({ success: true, data: { valid: false, message: "Invalid QR code." } });
  }
});

export default router;
