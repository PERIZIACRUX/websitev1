"use server";

import { fetchBackend } from "@/lib/api";
import { redirect } from "next/navigation";
import { setStaffSessionCookie, clearStaffSessionCookie } from "@/lib/auth/staff-session";
import { cookies } from "next/headers";

function extractCookie(res: Response, cookieName: string): string | null {
  const setCookieHeaders = res.headers.getSetCookie();
  for (const header of setCookieHeaders) {
    if (header.startsWith(`${cookieName}=`)) {
      const match = header.match(new RegExp(`${cookieName}=([^;]+)`));
      if (match) return match[1];
    }
  }
  return null;
}

export async function loginApiAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  try {
    const res = await fetchBackend("/api/v1/staff/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    
    const data = await res.json();

    if (!res.ok || !data.success) {
      return { error: data.error || data.message || "Invalid email or password." };
    }

    const token = extractCookie(res, "staff_session_id");
    if (token) {
      await setStaffSessionCookie(token);
    }

    if (data.data.mustChangePassword) {
      redirect("/staff/change-password");
    }
    
    if (data.data.role === "ADMIN") {
      redirect("/staff/admin");
    } else {
      redirect("/staff/dashboard");
    }
  } catch (error: any) {
    if (error.message === "NEXT_REDIRECT") throw error;
    return { error: "Invalid email or password." };
  }
}

export async function logoutApiAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("staff_session_id")?.value;
    await fetchBackend("/api/v1/staff/auth/logout", {
      method: "POST",
      headers: token ? { Cookie: `staff_session_id=${token}` } : {},
    });
  } catch (err) {
    // ignore
  } finally {
    await clearStaffSessionCookie();
    redirect("/staff/login");
  }
}

export async function changePasswordApiAction(prevState: any, formData: FormData) {
  const oldPassword = formData.get("oldPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!oldPassword || !newPassword || !confirmPassword) {
    return { error: "All fields are required." };
  }

  if (newPassword !== confirmPassword) {
    return { error: "New passwords do not match." };
  }

  if (newPassword.length < 8) {
    return { error: "Password must be at least 8 characters long." };
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("staff_session_id")?.value;

    const res = await fetchBackend("/api/v1/staff/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ oldPassword, newPassword }),
      headers: token ? { Cookie: `staff_session_id=${token}` } : {},
    });
    
    const data = await res.json();
    
    if (!res.ok || !data.success) {
      return { error: data.error || data.message || "Failed to change password." };
    }

    redirect("/staff/dashboard");
  } catch (error: any) {
    if (error.message === "NEXT_REDIRECT") throw error;
    return { error: error.message || "Failed to change password." };
  }
}
