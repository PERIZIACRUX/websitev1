import React from "react";
import { Metadata } from "next";
import { getCurrentStaff } from "@/lib/auth/staff-session";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Staff Portal - Perizia",
  description: "Internal staff portal for Perizia fest management.",
};

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const staffData = await getCurrentStaff();
  const staff = staffData?.staff;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
        <h1 className="text-xl font-bold tracking-tight text-gray-900">Perizia Staff Portal</h1>
        {staff && (
          <nav className="flex space-x-4">
            {staff.role === "ADMIN" ? (
              <Link href="/staff/admin" className="text-sm font-medium text-gray-600 hover:text-gray-900">Admin</Link>
            ) : (
              <Link href="/staff/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900">Dashboard</Link>
            )}
            <Link href="/staff/account" className="text-sm font-medium text-gray-600 hover:text-gray-900">Account</Link>
          </nav>
        )}
      </header>
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
