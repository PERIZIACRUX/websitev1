import { Router } from "express";
import { requireStaff, requireAdmin } from "../../middleware/staff-auth";
import { getVolunteerStats, getAdminStats } from "../../modules/staff/dashboard.service";

const router = Router();

// Apply auth middleware
router.use(requireStaff());

router.get("/volunteer-stats", async (req, res, next) => {
  try {
    const stats = await getVolunteerStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || "Failed to retrieve stats." });
  }
});

router.get("/admin-stats", requireAdmin, async (req, res, next) => {
  try {
    const stats = await getAdminStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || "Failed to retrieve stats." });
  }
});

export default router;
