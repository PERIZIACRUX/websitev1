"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
// import dynamic from "next/dynamic";
// import { verifyScanApiAction } from "@/app/staff/scanner/api-client-actions";
// import type { VerifyScanResult } from "@/app/staff/scanner/api-client-actions";

// const Scanner = dynamic(
//   () => import("@yudiel/react-qr-scanner").then((mod) => mod.Scanner),
//   { ssr: false }
// );

export default function QrScannerClient() {
  const [isTestActive, setIsTestActive] = useState(false);
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [errorDetails, setErrorDetails] = useState<{name: string, message: string} | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const addLog = (msg: string) => {
    console.log(msg);
    setLogMessages((prev) => [...prev, msg]);
  };

  const startCameraTest = async () => {
    addLog("SCAN BUTTON CLICKED");
    setIsTestActive(true);
    addLog("CAMERA INITIALIZATION STARTED");
    addLog(`IS SECURE CONTEXT: ${window.isSecureContext}`);
    addLog(`MEDIA DEVICES: ${!!navigator.mediaDevices}`);
    addLog(`GET USER MEDIA: ${typeof navigator.mediaDevices?.getUserMedia}`);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      addLog("GET USER MEDIA FAILED");
      setErrorDetails({
        name: "UnsupportedBrowser",
        message: "navigator.mediaDevices.getUserMedia is not supported by this browser or context."
      });
      return;
    }

    addLog("CALLING GET USER MEDIA");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false
      });
      addLog("GET USER MEDIA SUCCESS");
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => {
          addLog("VIDEO PLAY ERROR: " + e.message);
        });
        addLog("VIDEO STREAM ATTACHED");
      }
    } catch (err: any) {
      addLog("GET USER MEDIA FAILED");
      console.error(err);
      setErrorDetails({
        name: err.name || "UnknownError",
        message: err.message || "An unknown error occurred while initializing the camera."
      });
    }
  };

  const stopCameraTest = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsTestActive(false);
    setLogMessages([]);
    setErrorDetails(null);
  };

  useEffect(() => {
    addLog("SCANNER COMPONENT MOUNTED");
    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="max-w-md mx-auto bg-white shadow-xl rounded-xl overflow-hidden flex flex-col border border-gray-200">
      <div className="bg-indigo-700 px-4 py-3 flex justify-between items-center text-white">
        <h2 className="text-lg font-bold">QR Scanner (Debug Test)</h2>
        <Link href="/staff/dashboard" className="text-sm text-indigo-100 hover:text-white font-medium">
          Dashboard
        </Link>
      </div>

      <div className="p-6 flex-1 flex flex-col min-h-[400px]">
        {!isTestActive ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Diagnostic Mode</h3>
              <p className="text-gray-500">Tap the button below to initiate the direct camera test.</p>
            </div>
            <button
              onClick={startCameraTest}
              className="w-full py-4 px-6 rounded-lg text-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md active:bg-indigo-800 transition-colors"
            >
              Start Direct Camera Test
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col space-y-4">
            <div className="w-full relative rounded-lg overflow-hidden border-2 border-dashed border-gray-300 shadow-sm aspect-square bg-black flex items-center justify-center">
              <video 
                ref={videoRef}
                autoPlay 
                playsInline 
                muted
                className="w-full h-full object-cover"
              />
              {!streamRef.current && !errorDetails && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-sm font-mono animate-pulse">Initializing...</span>
                </div>
              )}
            </div>

            {streamRef.current && (
              <div className="p-4 bg-emerald-50 border-2 border-emerald-500 rounded-xl text-center">
                <h3 className="text-lg font-bold text-emerald-900">Camera Working!</h3>
              </div>
            )}

            {errorDetails && (
              <div className="p-4 bg-red-50 border-2 border-red-500 rounded-xl">
                <h3 className="text-lg font-bold text-red-900 mb-2">Camera Error</h3>
                <p className="text-sm text-red-800 font-mono"><strong>Name:</strong> {errorDetails.name}</p>
                <p className="text-sm text-red-800 font-mono mt-1"><strong>Message:</strong> {errorDetails.message}</p>
                <div className="mt-4 text-xs text-gray-600 space-y-1 bg-white p-2 rounded border border-red-200">
                  <p>{errorDetails.name === "NotAllowedError" ? "-> Permission was denied. Please allow camera access." : ""}</p>
                  <p>{errorDetails.name === "NotFoundError" ? "-> No camera was found on this device." : ""}</p>
                  <p>{errorDetails.name === "NotReadableError" ? "-> The camera is currently being used by another application." : ""}</p>
                  <p>{errorDetails.name === "SecurityError" ? "-> Camera access is blocked by browser security settings." : ""}</p>
                </div>
              </div>
            )}

            <div className="bg-gray-900 rounded p-3 h-48 overflow-y-auto">
              <h4 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Diagnostic Logs</h4>
              <div className="space-y-1">
                {logMessages.map((log, i) => (
                  <p key={i} className="text-xs text-green-400 font-mono break-all">{'>'} {log}</p>
                ))}
              </div>
            </div>

            <button
              onClick={stopCameraTest}
              className="w-full py-3 px-6 rounded-lg text-sm font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
            >
              Stop & Reset Test
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
