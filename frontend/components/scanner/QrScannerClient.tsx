"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { verifyScanApiAction } from "@/app/staff/scanner/api-client-actions";
import type { VerifyScanResult } from "@/app/staff/scanner/api-client-actions";

const Scanner = dynamic(
  () => import("@yudiel/react-qr-scanner").then((mod) => mod.Scanner),
  { ssr: false }
);

type ScannerStatus = "IDLE" | "SCANNING" | "PROCESSING" | "SUCCESS" | "ERROR" | "CAMERA_ERROR";

export default function QrScannerClient() {
  const [status, setStatus] = useState<ScannerStatus>("IDLE");
  const [result, setResult] = useState<VerifyScanResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  
  // Synchronous scan lock to prevent race conditions and duplicate API calls
  const isProcessingRef = useRef(false);

  // Initialize ZXing WASM module location
  useEffect(() => {
    import("@yudiel/react-qr-scanner").then(({ setZXingModuleOverrides }) => {
      setZXingModuleOverrides({
        locateFile: (path: string) => `/wasm/${path}`,
      });
    }).catch(err => console.error("Failed to configure WASM module:", err));
  }, []);

  const startScanner = () => {
    isProcessingRef.current = false;
    setResult(null);
    setErrorMessage("");
    setStatus("SCANNING");
  };

  const stopScanner = () => {
    isProcessingRef.current = false;
    setStatus("IDLE");
  };

  const scanNext = () => {
    startScanner();
  };

  const processQrToken = async (qrToken: string) => {
    // 1. Synchronous lock check
    if (isProcessingRef.current) return;
    
    // 2. Acquire lock immediately
    isProcessingRef.current = true;
    
    // 3. Transition UI to processing state (which unmounts the Scanner component)
    setStatus("PROCESSING");

    try {
      const res = await verifyScanApiAction(qrToken);
      setResult(res);
      if (res.valid) {
        setStatus("SUCCESS");
      } else {
        setErrorMessage(res.message || "QR verification failed.");
        setStatus("ERROR");
      }
    } catch (err: any) {
      setErrorMessage("An unexpected network or server error occurred.");
      setStatus("ERROR");
    }
  };

  const handleScan = (detectedCodes: { rawValue: string }[]) => {
    if (detectedCodes.length > 0) {
      processQrToken(detectedCodes[0].rawValue);
    }
  };

  const handleError = (error: any) => {
    console.error("Camera Error:", error);
    isProcessingRef.current = false;
    
    const errName = error?.name || "UnknownError";
    let userMsg = "An unknown error occurred while accessing the camera.";
    
    if (errName === "NotAllowedError") {
      userMsg = "Camera permission is required. Please allow camera access for this website.";
    } else if (errName === "NotFoundError") {
      userMsg = "No camera was found on this device.";
    } else if (errName === "NotReadableError") {
      userMsg = "The camera is currently being used by another application.";
    } else if (errName === "SecurityError") {
      userMsg = "Camera access is blocked by browser settings.";
    } else if (errName === "OverconstrainedError") {
      userMsg = "The requested camera is not available.";
    }
    
    setErrorMessage(userMsg);
    setStatus("CAMERA_ERROR");
  };

  // Cleanup lock on unmount
  useEffect(() => {
    return () => {
      isProcessingRef.current = false;
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden flex flex-col border border-gray-200 min-h-[500px] md:min-h-[600px] w-full safe-area-bottom">
      
      {/* Header */}
      <div className="bg-indigo-700 px-4 py-4 flex justify-between items-center text-white shrink-0">
        <h2 className="text-xl font-bold tracking-tight">QR Scanner</h2>
        <Link 
          href="/staff/dashboard" 
          className="text-sm font-medium bg-indigo-800/50 hover:bg-indigo-800 px-4 py-2 rounded-md transition-colors"
        >
          Dashboard
        </Link>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-6 flex-1 flex flex-col items-center justify-center bg-gray-50/50">
        
        {/* State: IDLE */}
        {status === "IDLE" && (
          <div className="w-full flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-300">
            <div className="text-center max-w-sm">
              <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Scan a participant QR code</h3>
              <p className="text-gray-500 mb-8 text-base">Position the QR code within the camera frame to verify registration.</p>
            </div>
            
            <button
              onClick={startScanner}
              className="w-full max-w-sm py-4 px-6 rounded-xl text-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:bg-indigo-800 transition-all min-h-[56px] focus:outline-none focus:ring-4 focus:ring-indigo-500/30"
              aria-label="Start Scanner"
            >
              Start Scanner
            </button>
          </div>
        )}

        {/* State: SCANNING */}
        {status === "SCANNING" && (
          <div className="w-full h-full flex flex-col items-center justify-center animate-in zoom-in-95 duration-200">
            <div className="w-full max-w-md aspect-square md:aspect-[4/3] bg-black rounded-2xl overflow-hidden shadow-2xl relative border-4 border-gray-900 ring-4 ring-indigo-100">
              {/* Note: In yudiel/react-qr-scanner v2, constraints are automatic (prefers environment). */}
              <Scanner
                onScan={handleScan}
                onError={handleError}
                sound={false}
                components={{
                  torch: false,
                  zoom: false,
                  onOff: false,
                  finder: false, // Turn off built-in finder to avoid conflict with custom UI if needed, but keeping default is usually fine.
                }}
              />
              <div className="absolute inset-0 border-2 border-indigo-500/30 pointer-events-none rounded-xl m-4"></div>
            </div>
            <div className="mt-8 text-center">
              <p className="text-gray-600 font-medium animate-pulse mb-6">Scanning for QR code...</p>
              <button
                onClick={stopScanner}
                className="py-3 px-8 rounded-xl text-base font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 shadow-sm transition-colors min-h-[44px]"
              >
                Stop Scanner
              </button>
            </div>
          </div>
        )}

        {/* State: PROCESSING */}
        {status === "PROCESSING" && (
          <div className="w-full flex flex-col items-center justify-center py-12 animate-in fade-in duration-200">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-100 border-t-indigo-600"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="mt-6 text-xl font-bold text-gray-900">Verifying QR...</h3>
            <p className="mt-2 text-gray-500">Checking credentials against database.</p>
          </div>
        )}

        {/* State: SUCCESS */}
        {status === "SUCCESS" && result && (
          <div className="w-full max-w-sm flex flex-col items-center animate-in slide-in-from-bottom-4 duration-300">
            <div className="w-full p-6 bg-emerald-50 border-2 border-emerald-500 rounded-2xl shadow-sm">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-emerald-100 mb-6 shadow-inner">
                <svg className="h-12 w-12 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-emerald-900 text-center mb-6 uppercase tracking-wider">✓ Verified</h3>
              
              <div className="bg-white p-5 rounded-xl shadow-sm border border-emerald-100 text-left space-y-4">
                <div>
                  <p className="text-xs text-emerald-600 uppercase font-bold tracking-wider">Participant</p>
                  <p className="text-xl font-bold text-gray-900 leading-tight mt-1">{result.participantName}</p>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs text-emerald-600 uppercase font-bold tracking-wider">Registration No.</p>
                  <p className="text-lg font-mono font-bold text-gray-800 mt-1">{result.registrationNumber}</p>
                </div>
              </div>
            </div>

            <button
              onClick={scanNext}
              className="mt-8 w-full py-4 px-6 rounded-xl text-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:bg-indigo-800 transition-all min-h-[56px] focus:outline-none focus:ring-4 focus:ring-indigo-500/30"
              aria-label="Scan Next"
            >
              Scan Next
            </button>
            <button
              onClick={stopScanner}
              className="mt-4 w-full py-3 px-6 rounded-xl text-sm font-bold text-gray-500 hover:text-gray-700 bg-transparent transition-colors"
            >
              Done Scanning
            </button>
          </div>
        )}

        {/* State: ERROR */}
        {status === "ERROR" && (
          <div className="w-full max-w-sm flex flex-col items-center animate-in slide-in-from-bottom-4 duration-300">
            <div className="w-full p-6 bg-red-50 border-2 border-red-500 rounded-2xl shadow-sm text-center">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-6">
                <svg className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-red-900 mb-3 uppercase tracking-wider">✕ Failed</h3>
              <p className="text-lg text-red-800 font-medium bg-white py-3 px-4 rounded-xl shadow-sm border border-red-100">
                {errorMessage}
              </p>
            </div>

            <button
              onClick={scanNext}
              className="mt-8 w-full py-4 px-6 rounded-xl text-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:bg-indigo-800 transition-all min-h-[56px]"
            >
              Scan Again
            </button>
            <button
              onClick={stopScanner}
              className="mt-4 w-full py-3 px-6 rounded-xl text-sm font-bold text-gray-500 hover:text-gray-700 bg-transparent transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {/* State: CAMERA_ERROR */}
        {status === "CAMERA_ERROR" && (
          <div className="w-full max-w-sm flex flex-col items-center animate-in fade-in duration-300">
            <div className="w-full p-6 bg-amber-50 border-2 border-amber-400 rounded-2xl shadow-sm text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 mb-4">
                <svg className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-amber-900 mb-3">Camera Error</h3>
              <p className="text-amber-800 text-sm font-medium">{errorMessage}</p>
            </div>

            <button
              onClick={stopScanner}
              className="mt-8 w-full py-4 px-6 rounded-xl text-lg font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 shadow-sm active:bg-gray-100 transition-all min-h-[56px]"
            >
              Back to Start
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
