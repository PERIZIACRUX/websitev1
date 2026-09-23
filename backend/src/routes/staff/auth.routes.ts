import { Router } from "express";
import { verifyCredentials, changePassword } from "../../modules/staff/auth.service";
import { revokeStaffSession } from "../../modules/staff/session.service";
import { requireStaff, STAFF_SESSION_COOKIE_NAME } from "../../middleware/staff-auth";
import { logAuditEvent } from "../../modules/audit.service";
import { z } from "zod";

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

import rateLimit from "express-rate-limit";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10, // Max 10 login attempts per IP per 15 minutes
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, error: "Too many login attempts, please try again later." }
});

router.post("/login", loginLimiter, async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const { staff, rawToken } = await verifyCredentials(email, password);

    res.cookie(STAFF_SESSION_COOKIE_NAME, rawToken, {
      httpOnly: true,
      secure: true, // MUST be true for SameSite=None
      sameSite: "none", // MUST be none for cross-domain cookies (Vercel -> Render)
      path: "/",
      maxAge: 12 * 60 * 60 * 1000, // 12 hours
    });

    res.json({
      success: true,
      data: {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        mustChangePassword: staff.mustChangePassword,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: "Invalid input." });
      return;
    }
    // Generic error to prevent enumeration
    res.status(401).json({ success: false, error: "Invalid email or password." });
  }
});

router.post("/logout", requireStaff({ allowPasswordChange: true }), async (req, res, next) => {
  try {
    const sessionId = req.sessionId;
    const staffId = req.staff!.id;

    if (sessionId) {
      await revokeStaffSession(sessionId);
      await logAuditEvent({
        action: "LOGOUT",
        staffId: staffId,
        entityType: "StaffSession",
        entityId: sessionId,
      });
    }

    res.clearCookie(STAFF_SESSION_COOKIE_NAME);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.post("/change-password", requireStaff({ allowPasswordChange: true }), async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = changePasswordSchema.parse(req.body);
    const staffId = req.staff!.id;

    await changePassword(staffId, oldPassword, newPassword);

    res.json({ success: true, message: "Password updated successfully." });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: error.errors[0].message });
      return;
    }
    res.status(400).json({ success: false, error: error.message || "Failed to change password." });
  }
});

router.get("/me", requireStaff({ allowPasswordChange: true }), async (req, res, next) => {
  try {
    const staff = req.staff!;
    res.json({
      success: true,
      data: {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        mustChangePassword: staff.mustChangePassword,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
