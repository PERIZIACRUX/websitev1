import { requireStaff } from "@/lib/auth/staff-session";
import LogoutButton from "@/components/staff/LogoutButton";
import Link from "next/link";

export default async function AccountPage() {
  const staff = await requireStaff();

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Account Information</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and actions.</p>
          </div>
          {staff.role === "ADMIN" ? (
            <Link href="/staff/admin" className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
              Back to Admin
            </Link>
          ) : (
            <Link href="/staff/dashboard" className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
              Back to Dashboard
            </Link>
          )}
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Full name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{staff.name}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Email address</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{staff.email}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Role</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{staff.role}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Account Status</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${staff.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {staff.isActive ? "Active" : "Inactive"}
                </span>
              </dd>
            </div>
          </dl>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6 flex space-x-4">
          <Link
            href="/staff/change-password"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Change Password
          </Link>
          <LogoutButton variant="primary" />
        </div>
      </div>
    </div>
  );
}
