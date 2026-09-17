import { requireStaff } from "@/lib/auth/staff-session";
import QrScannerClient from "@/components/scanner/QrScannerClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "QR Scanner - Perizia",
};

export default async function ScannerPage() {
  // Enforce staff role. Admins and Volunteers can access.
  await requireStaff();

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <QrScannerClient />
    </div>
  );
}
