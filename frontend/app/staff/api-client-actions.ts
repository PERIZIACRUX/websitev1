import { fetchBackend } from "@/lib/api";

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

    if (data.data.mustChangePassword) {
      window.location.assign("/staff/change-password");
      return prevState;
    }
    
    if (data.data.role === "ADMIN") {
      window.location.assign("/staff/admin");
    } else {
      window.location.assign("/staff/dashboard");
    }
    
    return prevState;
  } catch (error: any) {
    return { error: "Invalid email or password." };
  }
}

export async function logoutApiAction() {
  try {
    await fetchBackend("/api/v1/staff/auth/logout", {
      method: "POST",
    });
  } catch (err) {
    // ignore
  } finally {
    window.location.assign("/staff/login");
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
    const res = await fetchBackend("/api/v1/staff/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    
    const data = await res.json();
    
    if (!res.ok || !data.success) {
      return { error: data.error || data.message || "Failed to change password." };
    }

    // Since we don't know the role directly, redirect to /staff/dashboard
    // and let SSR correctly route admin users to /staff/admin.
    window.location.assign("/staff/dashboard");
    return prevState;
  } catch (error: any) {
    return { error: error.message || "Failed to change password." };
  }
}
