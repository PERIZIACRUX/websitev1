"use server";

import { fetchBackend } from "@/lib/api";
import { cookies } from "next/headers";

export type VerifyScanResult = {
  valid: boolean;
  message: string;
  participant?: {
    name: string;
    registrationNumber: string;
  };
  day?: {
    id: string;
    number: number;
    name: string;
  } | null;
  conference?: {
    eligible: boolean;
    checkedIn: boolean;
    checkedInAt: string | null;
  } | null;
  workshops?: Array<{
    id: string;
    title: string;
    time: string;
    venue: string;
    registered: boolean;
    attended: boolean;
    attendedAt: string | null;
  }>;
  food?: {
    breakfast: {
      collected: boolean;
      collectedAt: string | null;
    };
    lunch: {
      collected: boolean;
      collectedAt: string | null;
    };
  } | null;
};

export async function verifyScanApiAction(qrToken: string): Promise<VerifyScanResult> {
  if (!qrToken || typeof qrToken !== "string" || qrToken.trim() === "") {
    return { valid: false, message: "Invalid or empty QR code." };
  }

  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("staff_session_id")?.value;

    if (!sessionToken) {
      return { valid: false, message: "Unauthorized: Missing session token." };
    }

    const res = await fetchBackend("/api/v1/staff/scanner/verify", {
      method: "POST",
      headers: {
        Cookie: `staff_session_id=${sessionToken}`,
      },
      body: JSON.stringify({ qrToken }),
    });
    
    const data = await res.json();
    
    if (!res.ok || !data.success) {
      return { 
        valid: false, 
        message: data.error || data.data?.message || "Invalid QR code." 
      };
    }

    return data.data;
  } catch (error: any) {
    return { valid: false, message: "An unexpected error occurred." };
  }
}
