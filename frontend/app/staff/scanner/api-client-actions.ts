import { fetchBackend } from "@/lib/api";
export type VerifyScanResult = {
  valid: boolean;
  registrationNumber?: string;
  participantName?: string;
  message: string;
};

export async function verifyScanApiAction(qrToken: string): Promise<VerifyScanResult> {
  if (!qrToken || typeof qrToken !== "string" || qrToken.trim() === "") {
    return { valid: false, message: "Invalid or empty QR code." };
  }

  try {
    const res = await fetchBackend("/api/v1/staff/scanner/verify", {
      method: "POST",
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
