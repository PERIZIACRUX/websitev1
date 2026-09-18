"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchBackend } from "@/lib/api";
import QRCode from "react-qr-code";

export default function TestPaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: registrationNumber } = use(params);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handlePayment = async (status: "SUCCESS" | "FAILURE") => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchBackend("/api/v1/payment/test-verify", {
        method: "POST",
        body: JSON.stringify({ registrationNumber, status }),
      });
      const json = await res.json();
      
      if (!res.ok || !json.success) {
        setError(json.error || "Payment verification failed");
      } else {
        if (status === "SUCCESS") {
          setSuccess(true);
        } else {
          setError("Payment was declined (Simulated Failure).");
        }
      }
    } catch (err) {
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="bg-green-50 border border-green-200 p-8 rounded-2xl max-w-md w-full text-center shadow-sm">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Payment Successful!</h2>
          <p className="text-green-700 mb-6">Your registration has been confirmed.</p>
          
          <div className="bg-white p-6 rounded-xl border border-green-100 inline-block mb-6 shadow-sm">
            <p className="text-gray-500 text-sm font-semibold mb-3 uppercase tracking-widest">Entry Pass</p>
            <div className="flex justify-center">
              <QRCode value={registrationNumber} size={150} level="M" />
            </div>
            <p className="mt-4 font-mono font-bold text-gray-900 tracking-wider">{registrationNumber}</p>
          </div>

          <Link href="/perizia" className="inline-block w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-all">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Test Payment Gateway</h2>
          <p className="text-gray-500">Registration ID: <span className="font-mono text-gray-800 font-medium">{registrationNumber}</span></p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button 
            onClick={() => handlePayment("SUCCESS")}
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-md hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {loading ? "Processing..." : "Simulate Successful Payment"}
          </button>
          
          <button 
            onClick={() => handlePayment("FAILURE")}
            disabled={loading}
            className="w-full bg-red-100 text-red-700 font-bold py-4 rounded-xl hover:bg-red-200 transition-all disabled:opacity-50"
          >
            Simulate Failed Payment
          </button>
        </div>
      </div>
    </div>
  );
}
