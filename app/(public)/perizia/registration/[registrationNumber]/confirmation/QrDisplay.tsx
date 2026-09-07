"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";

export default function QrDisplay({ registrationNumber }: { registrationNumber: string }) {
  const [qrToken, setQrToken] = useState<string | null>(null);

  useEffect(() => {
    // Attempt to retrieve the raw QR token from sessionStorage
    const storedToken = sessionStorage.getItem(`qr_token_${registrationNumber}`);
    if (storedToken && storedToken !== qrToken) {
      setTimeout(() => {
        setQrToken(storedToken);
      }, 0);
    }
  }, [registrationNumber, qrToken]);

  if (!qrToken) {
    return (
      <div className="bg-white p-6 rounded-xl inline-block shadow-sm border border-gray-200">
        <p className="text-sm font-medium text-gray-700 mb-2">QR Code Secured</p>
        <p className="text-xs text-gray-500 max-w-[250px] mx-auto leading-relaxed">
          For security, your QR token is not stored on our servers. It will be sent to your registered Email/WhatsApp.
          <br />
          <span className="italic text-gray-400 mt-2 block">(Implementation coming in next phase)</span>
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl inline-block shadow-sm border border-green-200">
      <div className="bg-white p-2 rounded-lg inline-block">
        <QRCode value={qrToken} size={200} />
      </div>
      <p className="text-xs text-gray-500 mt-4 max-w-[250px] mx-auto font-medium">
        Keep this QR code ready on your phone. It will be used for event entry and designated checkpoints.
      </p>
    </div>
  );
}
