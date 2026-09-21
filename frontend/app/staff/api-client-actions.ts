"use server";

import { fetchBackend } from "@/lib/api";
import { redirect } from "next/navigation";
import { setStaffSessionCookie, clearStaffSessionCookie } from "@/lib/auth/staff-session";
import { cookies } from "next/headers";

export async function loginApiAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  let successData: any = null;

  try {
    const res = await fetchBackend("/api/v1/staff/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    
    // Extract the raw session token from the backend's Set-Cookie header
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) {
      const match = setCookie.match(/staff_session_id=([^;]+)/);
      if (match && match[1]) {
        await setStaffSessionCookie(match[1]);
      }
    }

    const data = await res.json();

    if (!res.ok || !data.success) {
      return { error: data.error || data.message || "Invalid email or password." };
    }

    successData = data.data;
  } catch (error: any) {
    return { error: "Invalid email or password." };
  }

  // Perform redirect outside of try-catch so Next.js NEXT_REDIRECT error isn't caught
  if (successData.mustChangePassword) {
    redirect("/staff/change-password");
  }
  
  if (successData.role === "ADMIN") {
    redirect("/staff/admin");
  } else {
    redirect("/staff/dashboard");
  }
}

export async function logoutApiAction() {
  let shouldRedirect = false;
  
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("staff_session_id")?.value;

    await fetchBackend("/api/v1/staff/auth/logout", {
      method: "POST",
      headers: sessionToken ? { Cookie: `staff_session_id=${sessionToken}` } : undefined,
    });
  } catch (err) {
    // ignore
  } finally {
    await clearStaffSessionCookie();
    shouldRedirect = true;
  }
  
  if (shouldRedirect) {
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

  let success = false;

  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("staff_session_id")?.value;

    const res = await fetchBackend("/api/v1/staff/auth/change-password", {
      method: "POST",
      headers: sessionToken ? { Cookie: `staff_session_id=${sessionToken}` } : undefined,
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    
    const data = await res.json();
    
    if (!res.ok || !data.success) {
      return { error: data.error || data.message || "Failed to change password." };
    }

    success = true;
  } catch (error: any) {
    return { error: error.message || "Failed to change password." };
  }

  // Since we don't know the role directly, redirect to /staff/dashboard
  // and let SSR correctly route admin users to /staff/admin.
  if (success) {
    redirect("/staff/dashboard");
  }
}
