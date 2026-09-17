import { Router } from "express";
import { requireStaff, requireAdmin } from "../../middleware/staff-auth";
import {
  createStaff,
  deactivateStaff,
  reactivateStaff,
  resetVolunteerPassword,
  getAllVolunteers,
} from "../../modules/staff/management.service";
import { z } from "zod";

const router = Router();

// Apply auth middleware to all volunteer routes
router.use(requireStaff());
router.use(requireAdmin);

const createVolunteerSchema = z.object({
  name: z.string().min(1).trim(),
  email: z.string().email().trim().toLowerCase(),
});

router.get("/", async (req, res, next) => {
  try {
    const volunteers = await getAllVolunteers();
    res.json({
      success: true,
      data: volunteers,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || "Failed to retrieve volunteers." });
  }
});

router.post("/", async (req, res, next) => {
  try {
    const adminId = req.staff!.id;
    const { name, email } = createVolunteerSchema.parse(req.body);

    const { newStaff, tempPassword } = await createStaff(adminId, { name, email });

    res.json({
      success: true,
      message: "Volunteer created successfully.",
      data: {
        id: newStaff.id,
        name: newStaff.name,
        email: newStaff.email,
        role: newStaff.role,
        isActive: newStaff.isActive,
        createdAt: newStaff.createdAt,
      },
      tempPassword, // As in original Server Action, returning temp password to UI
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: "Invalid input." });
      return;
    }
    if (error.code === "P2002") {
      res.status(400).json({ success: false, error: "Email is already registered." });
      return;
    }
    res.status(400).json({ success: false, error: error.message || "Failed to create volunteer." });
  }
});

router.post("/:id/deactivate", async (req, res, next) => {
  try {
    const adminId = req.staff!.id;
    const targetStaffId = req.params.id;

    await deactivateStaff(adminId, targetStaffId);

    res.json({ success: true, message: "Volunteer deactivated successfully." });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || "Failed to deactivate volunteer." });
  }
});

router.post("/:id/reactivate", async (req, res, next) => {
  try {
    const adminId = req.staff!.id;
    const targetStaffId = req.params.id;

    await reactivateStaff(adminId, targetStaffId);

    res.json({ success: true, message: "Volunteer reactivated successfully." });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || "Failed to reactivate volunteer." });
  }
});

router.post("/:id/reset-password", async (req, res, next) => {
  try {
    const adminId = req.staff!.id;
    const targetStaffId = req.params.id;

    const tempPassword = await resetVolunteerPassword(adminId, targetStaffId);

    res.json({ success: true, message: "Password reset successfully.", tempPassword });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || "Failed to reset password." });
  }
});

export default router;
