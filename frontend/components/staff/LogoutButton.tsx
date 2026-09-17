"use client";

import { useTransition } from "react";
import { logoutApiAction } from "@/app/staff/api-client-actions";

interface LogoutButtonProps {
  className?: string;
  variant?: "primary" | "danger" | "link";
  children?: React.ReactNode;
}

export default function LogoutButton({ className = "", variant = "danger", children = "Logout" }: LogoutButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutApiAction();
    });
  };

  const baseStyles = "text-sm font-medium w-full rounded-md text-left focus:outline-none transition-colors";
  
  let variantStyles = "";
  if (variant === "danger") {
    variantStyles = "px-3 py-2 text-red-600 hover:bg-red-50";
  } else if (variant === "link") {
    variantStyles = "text-center text-gray-500 hover:text-gray-700";
  } else if (variant === "primary") {
    variantStyles = "inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-red-700 bg-white hover:bg-red-50";
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      className={`${baseStyles} ${variantStyles} ${className} disabled:opacity-50`}
    >
      {isPending ? "Logging out..." : children}
    </button>
  );
}
