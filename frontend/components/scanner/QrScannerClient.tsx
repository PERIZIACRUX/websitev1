"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { 
  verifyScanApiAction, 
  conferenceCheckInAction, 
  workshopAttendanceAction, 
  foodCollectionAction
} from "@/app/staff/scanner/api-client-actions";
import type { VerifyScanResult } from "@/app/staff/scanner/api-client-actions";

const Scanner = dynamic(
  () => import("@yudiel/react-qr-scanner").then((mod) => mod.Scanner),
  { ssr: false }
);

type ScanMode = "SCIENTIFIC_SESSION" | "WORKSHOP" | null;
type ScannerStatus = "IDLE" | "SCANNING" | "PROCESSING" | "SUCCESS" | "ERROR" | "CAMERA_ERROR";

export default function QrScannerClient() {
  const [scanMode, setScanMode] = useState<ScanMode>(null);
  const [status, setStatus] = useState<ScannerStatus>("IDLE");
  const [result, setResult] = useState<VerifyScanResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [lastScannedQr, setLastScannedQr] = useState<string>("");
  const [opLoading, setOpLoading] = useState(false);
  const [opError, setOpError] = useState("");
  
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

  const triggerVibrate = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const startScanner = () => {
    isProcessingRef.current = false;
    setResult(null);
    setErrorMessage("");
    setOpError("");
    setStatus("SCANNING");
  };

  const stopScanner = () => {
    isProcessingRef.current = false;
    setStatus("IDLE");
  };

  const scanNext = () => {
    startScanner();
  };

  const changeMode = () => {
    setScanMode(null);
    stopScanner();
    setResult(null);
  };

  const processQrToken = async (qrToken: string) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    
    setLastScannedQr(qrToken);
    setStatus("PROCESSING");
    setOpError("");

    try {
      const res = await verifyScanApiAction(qrToken);
      if (res.valid) {
        setResult(res);
        setStatus("SUCCESS");
        triggerVibrate();
      } else {
        setResult(null);
        setErrorMessage(res.message || "QR verification failed.");
        setStatus("ERROR");
      }
    } catch (err: any) {
      setErrorMessage("An unexpected network or server error occurred.");
      setStatus("ERROR");
    }
  };

  const refreshParticipantData = async () => {
    if (!lastScannedQr) return;
    try {
      const res = await verifyScanApiAction(lastScannedQr);
      if (res.valid) {
        setResult(res);
      }
    } catch (e) {
      console.error("Failed to refresh participant data", e);
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

  const handleAction = async (actionFn: () => Promise<{ success: boolean; message?: string; error?: string }>) => {
    if (opLoading) return;
    setOpLoading(true);
    setOpError("");
    try {
      const res = await actionFn();
      if (res.success) {
        triggerVibrate();
        await refreshParticipantData();
      } else {
        setOpError(res.error || "Operation failed.");
      }
    } catch (e: any) {
      setOpError("Network error occurred.");
    } finally {
      setOpLoading(false);
    }
  };

  const hasWorkshopToday = result?.workshops && result.workshops.length > 0;
  const todaysWorkshop = hasWorkshopToday ? result!.workshops![0] : null;

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden flex flex-col border border-gray-200 min-h-[500px] md:min-h-[600px] w-full safe-area-bottom">
      
      {/* Header */}
      <div className="bg-indigo-700 px-4 py-4 flex justify-between items-center text-white shrink-0">
        <h2 className="text-xl font-bold tracking-tight">
          {scanMode === "SCIENTIFIC_SESSION" ? "Scanner: Scientific Session" :
           scanMode === "WORKSHOP" ? "Scanner: Workshop" : "Select Scanner Mode"}
        </h2>
        {scanMode && (
          <button 
            onClick={changeMode}
            className="text-sm font-medium bg-indigo-800/50 hover:bg-indigo-800 px-4 py-2 rounded-md transition-colors"
          >
            Change Mode
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-6 flex-1 flex flex-col items-center justify-center bg-gray-50/50">
        
        {/* Mode Selector */}
        {!scanMode && (
          <div className="w-full max-w-sm flex flex-col space-y-6">
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Choose Operational Context</h3>
            
            <button
              onClick={() => { setScanMode("SCIENTIFIC_SESSION"); startScanner(); }}
              className="w-full py-6 px-6 rounded-xl text-lg font-bold text-indigo-700 bg-indigo-50 border-2 border-indigo-200 hover:bg-indigo-100 transition-all text-left flex flex-col"
            >
              <span className="text-xl">Scientific Session</span>
              <span className="text-sm text-indigo-500 font-normal mt-1">Includes check-in and breakfast distribution</span>
            </button>
            
            <button
              onClick={() => { setScanMode("WORKSHOP"); startScanner(); }}
              className="w-full py-6 px-6 rounded-xl text-lg font-bold text-emerald-700 bg-emerald-50 border-2 border-emerald-200 hover:bg-emerald-100 transition-all text-left flex flex-col"
            >
              <span className="text-xl">Workshop</span>
              <span className="text-sm text-emerald-500 font-normal mt-1">Includes attendance and lunch distribution</span>
            </button>
          </div>
        )}

        {/* State: IDLE */}
        {scanMode && status === "IDLE" && (
          <div className="w-full flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-300">
            <div className="text-center max-w-sm">
              <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Scan a participant QR code</h3>
              <p className="text-gray-500 mb-8 text-base">Position the QR code within the camera frame.</p>
            </div>
            
            <button
              onClick={startScanner}
              className="w-full max-w-sm py-4 px-6 rounded-xl text-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 active:bg-indigo-800 transition-all min-h-[56px]"
            >
              Start Scanner
            </button>
          </div>
        )}

        {/* State: SCANNING */}
        {scanMode && status === "SCANNING" && (
          <div className="w-full h-full flex flex-col items-center justify-center animate-in zoom-in-95 duration-200">
            <div className="w-full max-w-md aspect-square md:aspect-[4/3] bg-black rounded-2xl overflow-hidden shadow-2xl relative border-4 border-gray-900 ring-4 ring-indigo-100">
              <Scanner
                onScan={handleScan}
                onError={handleError}
                sound={false}
                components={{ torch: false, zoom: false, onOff: false, finder: false }}
              />
              <div className="absolute inset-0 border-2 border-indigo-500/30 pointer-events-none rounded-xl m-4"></div>
            </div>
            <div className="mt-8 text-center">
              <p className="text-gray-600 font-medium animate-pulse mb-6">Scanning for QR code...</p>
              <button
                onClick={stopScanner}
                className="py-3 px-8 rounded-xl text-base font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 shadow-sm transition-colors min-h-[44px]"
              >
                Cancel Scanning
              </button>
            </div>
          </div>
        )}

        {/* State: PROCESSING */}
        {scanMode && status === "PROCESSING" && (
          <div className="w-full flex flex-col items-center justify-center py-12 animate-in fade-in duration-200">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-100 border-t-indigo-600"></div>
            </div>
            <h3 className="mt-6 text-xl font-bold text-gray-900">Verifying QR...</h3>
            <p className="mt-2 text-gray-500">Checking credentials against database.</p>
          </div>
        )}

        {/* State: SUCCESS */}
        {scanMode && status === "SUCCESS" && result && result.participant && (
          <div className="w-full max-w-sm flex flex-col items-center animate-in slide-in-from-bottom-4 duration-300 pb-8">
            <div className="w-full p-6 bg-emerald-50 border-2 border-emerald-500 rounded-2xl shadow-sm">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 mb-4 shadow-inner">
                <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-emerald-900 text-center mb-4 uppercase tracking-wider">✓ Verified</h3>
              
              <div className="bg-white p-5 rounded-xl shadow-sm border border-emerald-100 text-left space-y-4">
                <div>
                  <p className="text-xs text-emerald-600 uppercase font-bold tracking-wider">Participant</p>
                  <p className="text-lg font-bold text-gray-900 leading-tight mt-1">{result.participant.name}</p>
                  <p className="text-sm font-mono font-bold text-gray-500 mt-1">{result.participant.registrationNumber}</p>
                </div>

                {/* Check Day Context */}
                {result.day ? (
                  <>
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 inline-block rounded-md uppercase">
                        Today — {result.day.name}
                      </p>
                    </div>

                    {opError && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm font-bold rounded-lg animate-in fade-in">
                        {opError}
                      </div>
                    )}

                    {/* CONTEXT: SCIENTIFIC SESSION */}
                    {scanMode === "SCIENTIFIC_SESSION" && result.conference && result.food && (
                      <div className="space-y-4">
                        <div className="pt-4 border-t border-gray-100">
                          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Scientific Session</p>
                          <p className="text-emerald-600 font-bold flex items-center text-sm mb-2">
                            ✓ Eligible
                          </p>
                          {result.conference.checkedIn ? (
                            <p className="text-emerald-600 font-bold flex items-center text-sm">
                              ✓ Checked in
                            </p>
                          ) : (
                            <button
                              disabled={opLoading}
                              onClick={() => handleAction(() => conferenceCheckInAction(lastScannedQr))}
                              className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50"
                            >
                              [ CHECK IN ]
                            </button>
                          )}
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Breakfast</p>
                          {result.food.breakfast.collected ? (
                            <p className="text-emerald-600 font-bold flex items-center text-sm">
                              ✓ Given
                            </p>
                          ) : (
                            <button
                              disabled={opLoading}
                              onClick={() => handleAction(() => foodCollectionAction(lastScannedQr, "SCIENTIFIC_SESSION"))}
                              className="w-full py-3 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 active:bg-amber-700 disabled:opacity-50"
                            >
                              [ GIVE BREAKFAST ]
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* CONTEXT: WORKSHOP */}
                    {scanMode === "WORKSHOP" && (
                      <div className="space-y-4">
                        <div className="pt-4 border-t border-gray-100">
                          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Today's Workshop</p>
                          
                          {hasWorkshopToday ? (
                            <>
                              <p className="font-bold text-gray-900">{todaysWorkshop!.title}</p>
                              <p className="text-emerald-600 font-bold flex items-center text-sm mt-2 mb-2">✓ Registered</p>
                              
                              {todaysWorkshop!.attended ? (
                                <p className="text-emerald-600 font-bold flex items-center text-sm">
                                  ✓ Attended
                                </p>
                              ) : (
                                <button
                                  disabled={opLoading}
                                  onClick={() => handleAction(() => workshopAttendanceAction(lastScannedQr))}
                                  className="w-full py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50"
                                >
                                  [ MARK ATTENDANCE ]
                                </button>
                              )}
                            </>
                          ) : (
                            <p className="text-red-600 font-bold text-sm">NOT REGISTERED FOR TODAY'S WORKSHOP</p>
                          )}
                        </div>

                        {hasWorkshopToday && result.food && (
                          <div className="pt-4 border-t border-gray-100">
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Lunch</p>
                            {result.food.lunch.collected ? (
                              <p className="text-emerald-600 font-bold flex items-center text-sm">
                                ✓ Given
                              </p>
                            ) : (
                              <button
                                disabled={opLoading}
                                onClick={() => handleAction(() => foodCollectionAction(lastScannedQr, "WORKSHOP"))}
                                className="w-full py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 active:bg-orange-700 disabled:opacity-50"
                              >
                                [ GIVE LUNCH ]
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="pt-4 border-t border-gray-100 bg-amber-50 -mx-5 -mb-5 px-5 py-4 rounded-b-xl border-t-amber-200">
                     <p className="text-amber-800 font-bold text-center">No Perizia day is currently active.</p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={scanNext}
              className="mt-6 w-full py-4 px-6 rounded-xl text-lg font-bold text-white bg-gray-800 hover:bg-gray-900 shadow-lg shadow-gray-200 active:bg-black transition-all min-h-[56px]"
            >
              Scan Next
            </button>
          </div>
        )}

        {/* State: ERROR */}
        {scanMode && status === "ERROR" && (
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
              className="mt-8 w-full py-4 px-6 rounded-xl text-lg font-bold text-white bg-gray-800 hover:bg-gray-900 shadow-lg shadow-gray-200 active:bg-black transition-all min-h-[56px]"
            >
              Scan Again
            </button>
          </div>
        )}

        {/* State: CAMERA_ERROR */}
        {scanMode && status === "CAMERA_ERROR" && (
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
              onClick={changeMode}
              className="mt-8 w-full py-4 px-6 rounded-xl text-lg font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 shadow-sm active:bg-gray-100 transition-all min-h-[56px]"
            >
              Back
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
