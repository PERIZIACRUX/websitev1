import { Request, Response, NextFunction } from "express";
import { verifyStaffSession } from "../modules/staff/session.service";
import { Staff } from "@prisma/client";

// Define custom properties on Express Request
declare global {
  namespace Express {
    interface Request {
      staff?: Staff;
      sessionId?: string;
    }
  }
}

export const STAFF_SESSION_COOKIE_NAME = "staff_session_id";

/**
 * Middleware that authenticates a staff member using the staff_session_id cookie.
 * 
 * It checks if:
 * 1. The session cookie exists.
 * 2. The session is valid, not expired, and not revoked.
 * 3. The staff member is active.
 * 4. The staff member does not need to change their password (unless allowPasswordChange is true).
 * 
 * If successful, it attaches req.staff and req.sessionId.
 */
export const requireStaff = (options: { allowPasswordChange?: boolean } = {}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rawToken = req.cookies[STAFF_SESSION_COOKIE_NAME];

      if (!rawToken) {
        res.status(401).json({ success: false, error: "Unauthorized: Missing session token." });
        return;
      }

      const data = await verifyStaffSession(rawToken);

      if (!data) {
        res.status(401).json({ success: false, error: "Unauthorized: Invalid or expired session." });
        return;
      }

      const { staff, session } = data;

      if (!staff.isActive) {
        res.status(401).json({ success: false, error: "Unauthorized: Staff account is inactive." });
        return;
      }

      if (staff.mustChangePassword && !options.allowPasswordChange) {
        res.status(403).json({ success: false, error: "Forbidden: Password change required.", requirePasswordChange: true });
        return;
      }

      // Attach to request
      req.staff = staff;
      req.sessionId = session.id;

      next();
    } catch (error) {
      console.error("[Staff Auth Middleware Error]", error);
      res.status(500).json({ success: false, error: "Internal server error during authentication." });
    }
  };
};

/**
 * Middleware that ensures the authenticated staff member has the ADMIN role.
 * Must be used AFTER requireStaff().
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.staff) {
    res.status(401).json({ success: false, error: "Unauthorized: Not authenticated." });
    return;
  }

  if (req.staff.role !== "ADMIN") {
    res.status(403).json({ success: false, error: "Forbidden: Admin access required." });
    return;
  }

  next();
};
