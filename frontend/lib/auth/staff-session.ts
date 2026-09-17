import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchBackend } from "@/lib/api";

const STAFF_SESSION_COOKIE_NAME = "staff_session_id";

export interface Staff {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "VOLUNTEER";
  mustChangePassword: boolean;
  isActive: boolean;
}

/**
 * Sets the secure HttpOnly cookie containing the raw session token.
 */
export async function setStaffSessionCookie(rawToken: string) {
  const cookieStore = await cookies();
  const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000); // Align with session DB expiry

  cookieStore.set({
    name: STAFF_SESSION_COOKIE_NAME,
    value: rawToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/**
 * Clears the session cookie. Revocation should be done via API call prior to this.
 */
export async function clearStaffSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(STAFF_SESSION_COOKIE_NAME);
}

/**
 * Retrieves the currently authenticated staff member via API.
 * Does NOT throw if unauthenticated; returns null instead.
 */
export async function getCurrentStaff(): Promise<{ staff: Staff } | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(STAFF_SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return null;
  }

  try {
    const res = await fetchBackend("/api/v1/staff/auth/me", {
      headers: {
        Cookie: `${STAFF_SESSION_COOKIE_NAME}=${sessionToken}`,
      },
    });

    if (!res.ok) {
      return null;
    }

    const body = await res.json();
    if (body.success && body.data) {
      // Backend returns active users only if they hit /me, since requireStaff handles it.
      // We force isActive: true for compatibility since if /me succeeds, they are active.
      return { staff: { ...body.data, isActive: true } };
    }
    return null;
  } catch (err) {
    return null;
  }
}

/**
 * Ensures the user is authenticated as ANY active staff member (Admin or Volunteer).
 * Throws ApiError or redirects if invalid.
 * Also handles password-change redirects.
 */
export async function requireStaff(options: { allowPasswordChange?: boolean } = {}): Promise<Staff> {
  const data = await getCurrentStaff();

  if (!data) {
    redirect("/staff/login");
  }

  const { staff } = data;

  if (!staff.isActive) {
    redirect("/staff/login");
  }

  if (staff.mustChangePassword && !options.allowPasswordChange) {
    redirect("/staff/change-password");
  }

  return staff;
}

/**
 * Ensures the user is authenticated strictly as an ADMIN.
 * Throws or redirects if not an Admin.
 */
export async function requireAdmin(): Promise<Staff> {
  const staff = await requireStaff();

  if (staff.role !== "ADMIN") {
    // Return standard unauthorized error (frontend can catch or Next.js handles)
    throw new Error("Unauthorized: Admin access required.");
  }

  return staff;
}
