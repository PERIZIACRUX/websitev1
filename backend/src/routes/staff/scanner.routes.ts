import { Router } from "express";
import { requireStaff } from "../../middleware/staff-auth";
import { verifyQrCredential } from "../../modules/registration/qr.service";
import { getCurrentPeriziaDay } from "../../modules/registration/day.service";
import { 
  getScannerParticipantContext, 
  performConferenceCheckIn,
  performWorkshopAttendance,
  performFoodCollection
} from "../../modules/staff/scanner.service";
import { z } from "zod";
import rateLimit from "express-rate-limit";

const router = Router();

const scannerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200, // Volunteers might scan frequently; 200 requests / 15 minutes is reasonable
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, error: "Too many scans, please try again later." }
});

router.use(scannerLimiter);
router.use(requireStaff());

const verifyScanSchema = z.object({
  qrToken: z.string().trim().min(1),
  context: z.enum(["SCIENTIFIC_SESSION", "WORKSHOP"]).optional(),
});

// Helper for common setup
async function resolveScanContext(qrToken: string) {
  const result = await verifyQrCredential(qrToken);
  if (result.registration.status !== "CONFIRMED") {
    throw new Error("Registration is not confirmed.");
  }
  const currentDay = await getCurrentPeriziaDay(result.registration.editionId);
  if (!currentDay) {
    throw new Error("No Perizia day is currently active.");
  }
  return { result, currentDay };
}

router.post("/verify", async (req, res, next) => {
  try {
    const { qrToken } = verifyScanSchema.parse(req.body);

    const result = await verifyQrCredential(qrToken);
    const editionId = result.registration.editionId;
    const participant = result.registration.participant;
    const registrationNumber = result.registration.registrationNumber;

    const currentDay = await getCurrentPeriziaDay(editionId);

    let contextData = null;
    if (currentDay) {
      contextData = await getScannerParticipantContext(result.registration.id, currentDay.id);
    }

    res.json({
      success: true,
      data: {
        valid: true,
        message: "Valid Registration",
        participant: {
          name: participant.fullName,
          registrationNumber: registrationNumber,
        },
        day: currentDay ? {
          id: currentDay.id,
          number: currentDay.dayNumber,
          name: currentDay.name,
        } : null,
        conference: contextData?.conference || null,
        workshops: contextData?.workshops || [],
        food: contextData?.food || null,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError || error.name === "ZodError") {
      res.json({ success: true, data: { valid: false, message: "Invalid or empty QR code." } });
      return;
    }
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

const operationSchema = z.object({
  qrToken: z.string().trim().min(1),
  context: z.enum(["SCIENTIFIC_SESSION", "WORKSHOP"]),
});

router.post("/conference-checkin", async (req, res, next) => {
  try {
    const { qrToken, context } = operationSchema.parse(req.body);
    if (context !== "SCIENTIFIC_SESSION") {
      return res.status(400).json({ success: false, error: "Invalid context for check-in." });
    }
    const { result, currentDay } = await resolveScanContext(qrToken);
    const staffId = req.staff!.id;

    const out = await performConferenceCheckIn(result.registration.id, currentDay.id, staffId);
    res.json(out);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post("/workshop-attendance", async (req, res, next) => {
  try {
    const { qrToken, context } = operationSchema.parse(req.body);
    if (context !== "WORKSHOP") {
      return res.status(400).json({ success: false, error: "Invalid context for workshop attendance." });
    }
    const { result, currentDay } = await resolveScanContext(qrToken);
    const staffId = req.staff!.id;

    const out = await performWorkshopAttendance(result.registration.id, currentDay.id, staffId);
    res.json(out);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post("/food-collection", async (req, res, next) => {
  try {
    const { qrToken, context } = operationSchema.parse(req.body);
    const { result, currentDay } = await resolveScanContext(qrToken);
    const staffId = req.staff!.id;

    let mealType: "BREAKFAST" | "LUNCH";
    if (context === "SCIENTIFIC_SESSION") {
      mealType = "BREAKFAST";
    } else if (context === "WORKSHOP") {
      mealType = "LUNCH";
      // Additional safety check: MUST be registered for today's workshop to get lunch
      const contextData = await getScannerParticipantContext(result.registration.id, currentDay.id);
      if (!contextData.workshops || contextData.workshops.length === 0) {
        return res.status(400).json({ success: false, error: "NOT REGISTERED FOR TODAY'S WORKSHOP" });
      }
    } else {
      return res.status(400).json({ success: false, error: "Invalid context for food collection." });
    }

    const out = await performFoodCollection(result.registration.id, currentDay.id, mealType, staffId);
    res.json(out);
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
