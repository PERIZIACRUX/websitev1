import { requireStaff } from "@/lib/auth/staff-session";
import Link from "next/link";
import { fetchBackend } from "@/lib/api";
import { cookies } from "next/headers";
import { LiveFoodQuotas } from "@/components/dashboard/LiveFoodQuotas";

const STAFF_SESSION_COOKIE_NAME = "staff_session_id";

export default async function VolunteerDashboardPage() {
  // Ensure we are active staff
  const staff = await requireStaff();
  
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(STAFF_SESSION_COOKIE_NAME)?.value;

  const res = await fetchBackend("/api/v1/staff/dashboard/volunteer-stats", {
    headers: {
      Cookie: `${STAFF_SESSION_COOKIE_NAME}=${sessionToken}`,
    },
  });
  
  if (!res.ok) {
    throw new Error("Failed to load dashboard stats");
  }

  const { data: stats } = await res.json();

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Volunteer Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Welcome, {staff.name}. Here are the current event statistics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100 p-5">
          <dt className="text-sm font-medium text-gray-500 truncate">Total Registered</dt>
          <dd className="mt-1 text-3xl font-semibold text-indigo-600">{stats.registeredCount}</dd>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100 p-5">
          <dt className="text-sm font-medium text-gray-500 truncate">Total Checked-In</dt>
          <dd className="mt-1 text-3xl font-semibold text-emerald-600">{stats.checkedInCount}</dd>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100 p-5">
          <dt className="text-sm font-medium text-gray-500 truncate">Breakfasts Collected</dt>
          <dd className="mt-1 text-3xl font-semibold text-amber-500">{stats.breakfastCount}</dd>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100 p-5">
          <dt className="text-sm font-medium text-gray-500 truncate">Lunches Collected</dt>
          <dd className="mt-1 text-3xl font-semibold text-orange-500">{stats.lunchCount}</dd>
        </div>
      </div>

      <LiveFoodQuotas />

      {/* QR Scanner Link */}
      <div className="mt-12 p-12 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg text-center flex flex-col items-center">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Event Verification</h3>
        <p className="text-gray-500 mb-6 max-w-lg mx-auto">
          Scan participant QR codes to verify their registration securely.
        </p>
        <Link 
          href="/staff/scanner"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <svg className="-ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Open QR Scanner
        </Link>
      </div>
    </div>
  );
}
