"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function FestToggle() {
  const pathname = usePathname();
  
  const isCrux = pathname?.startsWith("/crux");
  const isPerizia = pathname?.startsWith("/perizia") || pathname?.startsWith("/register");

  return (
    <div className="inline-flex rounded-lg border border-gray-800 p-1 bg-gray-900/50 backdrop-blur">
      <Link
        href="/crux"
        className={`px-6 py-2 rounded-md text-sm font-semibold transition-all ${
          isCrux ? "bg-purple-600 text-white shadow-lg" : "text-gray-400 hover:text-white hover:bg-gray-800"
        }`}
      >
        CRUX
      </Link>
      <Link
        href="/perizia"
        className={`px-6 py-2 rounded-md text-sm font-semibold transition-all ${
          isPerizia ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-white hover:bg-gray-800"
        }`}
      >
        PERIZIA
      </Link>
    </div>
  );
}
