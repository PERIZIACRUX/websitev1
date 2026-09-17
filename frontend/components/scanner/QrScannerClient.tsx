"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { verifyScanApiAction } from "@/app/staff/scanner/api-client-actions";
import type { VerifyScanResult } from "@/app/staff/scanner/api-client-actions";

const Scanner = dynamic(
  () => import("@yudiel/react-qr-scanner").then((mod) => mod.Scanner),
  { ssr: false }
);
import Link from "next/link";

export default function QrScannerClient() {
  const [isScanning, setIsScanning] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<VerifyScanResult | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualInput, setManualInput] = useState("");

  const processQrToken = async (qrToken: string) => {
    // 4. DUPLICATE SCAN PROTECTION
    // Immediately lock scanning to prevent multiple API requests
    if (isProcessing || !isScanning) return;
    
    setIsScanning(false);
    setIsProcessing(true);

    try {
      const res = await verifyScanApiAction(qrToken);
      setResult(res);
    } catch (err) {
      setResult({ valid: false, message: "An unexpected error occurred." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleScan = (detectedCodes: { rawValue: string }[]) => {
    if (detectedCodes.length > 0 && isScanning && !isProcessing) {
      processQrToken(detectedCodes[0].rawValue);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    processQrToken(manualInput.trim());
  };

  const resetScanner = () => {
    setResult(null);
    setManualInput("");
    setIsScanning(true);
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-xl rounded-xl overflow-hidden flex flex-col border border-gray-200">
      <div className="bg-indigo-700 px-4 py-3 flex justify-between items-center text-white">
        <h2 className="text-lg font-bold">QR Scanner</h2>
        <Link href="/staff/dashboard" className="text-sm text-indigo-100 hover:text-white font-medium">
          Dashboard
        </Link>
      </div>

      {/* Main Scanner / Result Area */}
      <div className="p-6 flex-1 flex flex-col items-center justify-center min-h-[400px]">
        {isProcessing && (
          <div className="text-center py-12 w-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium animate-pulse">Verifying...</p>
          </div>
        )}

        {result && !isProcessing && (
          <div className="w-full text-center space-y-6 animate-in fade-in zoom-in duration-200">
            {result.valid ? (
              <div className="p-6 bg-emerald-50 border-2 border-emerald-500 rounded-xl">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 mb-4">
                  <svg className="h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-emerald-900 mb-1">✓ {result.message}</h3>
                <div className="mt-4 bg-white p-4 rounded-lg shadow-sm text-left">
                  <p className="text-sm text-gray-500 uppercase font-semibold">Participant</p>
                  <p className="text-lg font-bold text-gray-900">{result.participantName}</p>
                  
                  <p className="text-sm text-gray-500 uppercase font-semibold mt-3">Registration No.</p>
                  <p className="text-lg font-bold text-gray-900 font-mono">{result.registrationNumber}</p>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-red-50 border-2 border-red-500 rounded-xl">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                  <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-red-900">✕ {result.message}</h3>
              </div>
            )}

            <button
              onClick={resetScanner}
              className="w-full py-4 px-6 rounded-lg text-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md active:bg-indigo-800 transition-colors"
            >
              Scan Next
            </button>
          </div>
        )}

        {isScanning && !isProcessing && !result && (
          <div className="w-full relative rounded-lg overflow-hidden border border-gray-300 shadow-sm aspect-square bg-black">
            {!manualMode ? (
              <Scanner
                onScan={handleScan}
                onError={(error: any) => console.error("Scanner Error:", error)}
                constraints={{
                  facingMode: "environment" // Force rear camera on mobile
                }}
              />
            ) : (
              <form onSubmit={handleManualSubmit} className="absolute inset-0 bg-white flex flex-col justify-center p-6 space-y-4">
                <label className="block text-sm font-medium text-gray-700 text-center">
                  Manual QR Code Entry
                </label>
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-lg p-3 text-center focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Enter token..."
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!manualInput.trim()}
                  className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg disabled:opacity-50"
                >
                  Verify Code
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Footer Controls */}
      {isScanning && !isProcessing && !result && (
        <div className="bg-gray-50 border-t border-gray-200 p-4 flex justify-center">
          <button
            type="button"
            onClick={() => setManualMode(!manualMode)}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-900"
          >
            {manualMode ? "Use Camera to Scan" : "Enter QR manually"}
          </button>
        </div>
      )}
    </div>
  );
}
