"use client";

import { useActionState } from "react";
import { changePasswordApiAction } from "../api-client-actions";
import LogoutButton from "@/components/staff/LogoutButton";

export default function ChangePasswordPage() {
  const [state, action, isPending] = useActionState(changePasswordApiAction, undefined);

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Change Password</h2>
          <p className="mt-2 text-sm text-gray-600">You must change your password to continue.</p>
        </div>
        
        <form action={action} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Password</label>
              <input
                name="oldPassword"
                type="password"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <input
                name="newPassword"
                type="password"
                required
                minLength={8}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
              <input
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {state?.error && (
            <div className="text-red-600 text-sm font-medium bg-red-50 p-3 rounded-md">
              {state.error}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isPending ? "Changing..." : "Change Password"}
            </button>
          </div>
        </form>
        <div className="mt-4">
          <LogoutButton variant="link">Cancel and Logout</LogoutButton>
        </div>
      </div>
    </div>
  );
}
