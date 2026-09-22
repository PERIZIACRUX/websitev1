import { Router } from "express";
import { requireStaff, requireAdmin } from "../../middleware/staff-auth";
import { 
  getVolunteerStats, 
  getAdminStats,
  getTodayFoodQuotas,
  updateFoodQuota
} from "../../modules/staff/dashboard.service";

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

router.get("/food-quotas", async (req, res, next) => {
  try {
    const quotas = await getTodayFoodQuotas();
    res.json({ success: true, data: quotas });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || "Failed to retrieve quotas." });
  }
});

router.patch("/food-quotas/:id", requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { totalAllocated } = req.body;
    if (typeof totalAllocated !== "number" || totalAllocated < 0) {
      return res.status(400).json({ success: false, error: "Invalid allocation quantity." });
    }
    const staffId = req.staff!.id;
    const updated = await updateFoodQuota(id, totalAllocated, staffId);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || "Failed to update quota." });
  }
});

export default router;
