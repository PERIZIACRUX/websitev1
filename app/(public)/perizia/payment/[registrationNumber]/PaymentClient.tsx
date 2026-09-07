"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import QRCode from "react-qr-code";

type PaymentClientProps = {
  registrationNumber: string;
  initialPaymentStatus: string;
  initialRegistrationStatus: string;
};

export default function PaymentClient({
  registrationNumber,
  initialPaymentStatus,
  initialRegistrationStatus
}: PaymentClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Local state to show immediate success/failure without reloading the whole page initially
  const [paymentStatus, setPaymentStatus] = useState(initialPaymentStatus);
  const [qrToken, setQrToken] = useState<string | null>(null);

  const simulatePayment = async (status: "SUCCESS" | "FAILURE") => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/perizia/payment/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationNumber, status }),
      });
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        setError(data.error || "Payment simulation failed.");
      } else {
        setPaymentStatus(data.data.paymentStatus);
        
        if (data.data.paymentStatus === "PAID") {
          if (data.data.qrToken) {
            sessionStorage.setItem(`qr_token_${registrationNumber}`, data.data.qrToken);
          }
          router.push(`/perizia/registration/${registrationNumber}/confirmation`);
        } else {
          router.refresh();
        }
      }
    } catch (_err) {
      setError("Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // We no longer render the success state here. We redirect to the confirmation page.
  if (paymentStatus === "PAID") {
    return (
      <div className="space-y-4 text-center">
        <div className="bg-white p-6 rounded-xl border border-gray-100">
          <p className="text-gray-500">Redirecting to confirmation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
          {error}
        </div>
      )}

      {paymentStatus === "FAILED" && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 mb-4">
          <p className="font-semibold">Last payment attempt failed.</p>
          <p className="text-sm">You can try again below.</p>
        </div>
      )}

      <button
        onClick={() => simulatePayment("SUCCESS")}
        disabled={loading}
        className="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-md hover:bg-green-700 transition-all disabled:opacity-50"
      >
        {loading ? "Processing..." : "Simulate Successful Payment"}
      </button>

      <button
        onClick={() => simulatePayment("FAILURE")}
        disabled={loading}
        className="w-full bg-red-100 text-red-700 font-bold py-4 rounded-xl shadow-sm hover:bg-red-200 transition-all disabled:opacity-50"
      >
        {loading ? "Processing..." : "Simulate Failed Payment"}
      </button>

      <div className="pt-4 border-t border-gray-100">
        <Link href="/perizia" className="text-sm text-gray-500 hover:underline">
          Cancel and Return
        </Link>
      </div>
    </div>
  );
}
