import { fetchBackend } from "@/lib/api";
import { cookies } from "next/headers";

export async function createVolunteerApiAction(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  if (!name || !email) {
    return { error: "Name and email are required." };
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("staff_session_id")?.value;
    const headers = token ? { Cookie: `staff_session_id=${token}` } : undefined;

    const res = await fetchBackend("/api/v1/staff/volunteers", {
      method: "POST",
      headers,
      body: JSON.stringify({ name, email }),
    });
    
    const data = await res.json();
    
    if (!res.ok || !data.success) {
      return { error: data.error || data.message || "Failed to create volunteer." };
    }

    return { 
      success: true, 
      message: `Volunteer ${data.data.name} created successfully.`,
      tempPassword: data.tempPassword 
    };
  } catch (error: any) {
    return { error: "Failed to create volunteer." };
  }
}

export async function deactivateVolunteerApiAction(id: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("staff_session_id")?.value;
    const headers = token ? { Cookie: `staff_session_id=${token}` } : undefined;

    const res = await fetchBackend(`/api/v1/staff/volunteers/${id}/deactivate`, {
      method: "POST",
      headers,
    });
    
    const data = await res.json();
    
    if (!res.ok || !data.success) {
      return { error: data.error || data.message || "Failed to deactivate volunteer." };
    }

    // Since we are changing state in place, force a hard reload so SSR can re-fetch volunteers
    window.location.reload();
    return { success: true };
  } catch (error: any) {
    return { error: "Failed to deactivate volunteer." };
  }
}

export async function reactivateVolunteerApiAction(id: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("staff_session_id")?.value;
    const headers = token ? { Cookie: `staff_session_id=${token}` } : undefined;

    const res = await fetchBackend(`/api/v1/staff/volunteers/${id}/reactivate`, {
      method: "POST",
      headers,
    });
    
    const data = await res.json();
    
    if (!res.ok || !data.success) {
      return { error: data.error || data.message || "Failed to reactivate volunteer." };
    }

    window.location.reload();
    return { success: true };
  } catch (error: any) {
    return { error: "Failed to reactivate volunteer." };
  }
}

export async function resetPasswordApiAction(id: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("staff_session_id")?.value;
    const headers = token ? { Cookie: `staff_session_id=${token}` } : undefined;

    const res = await fetchBackend(`/api/v1/staff/volunteers/${id}/reset-password`, {
      method: "POST",
      headers,
    });
    
    const data = await res.json();
    
    if (!res.ok || !data.success) {
      return { error: data.error || data.message || "Failed to reset password." };
    }

    return { 
      success: true, 
      tempPassword: data.tempPassword 
    };
  } catch (error: any) {
    return { error: "Failed to reset password." };
  }
}
