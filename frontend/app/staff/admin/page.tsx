import { fetchBackend } from "@/lib/api";
import { cookies } from "next/headers";

const STAFF_SESSION_COOKIE_NAME = "staff_session_id";

export default async function AdminOverviewPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(STAFF_SESSION_COOKIE_NAME)?.value;

  const res = await fetchBackend("/api/v1/staff/dashboard/admin-stats", {
    headers: {
      Cookie: `${STAFF_SESSION_COOKIE_NAME}=${sessionToken}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to load admin stats");
  }

  const { data: stats } = await res.json();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Overview</h1>
        <p className="mt-1 text-sm text-gray-500">Real-time statistics for the current Perizia edition.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Registration Stats */}
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
          <div className="p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Registered Participants</dt>
            <dd className="mt-1 text-3xl font-semibold text-indigo-600">{stats.registeredCount}</dd>
          </div>
        </div>

        {/* Check-in Stats */}
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
          <div className="p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Checked-In</dt>
            <dd className="mt-1 text-3xl font-semibold text-emerald-600">{stats.checkedInCount}</dd>
          </div>
        </div>

        {/* Volunteer Stats */}
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
          <div className="p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Volunteers</dt>
            <dd className="mt-1 text-3xl font-semibold text-blue-600">{stats.totalVolunteers}</dd>
            <div className="mt-4 flex gap-4 text-sm text-gray-600">
              <span><strong className="text-green-600">{stats.activeVolunteers}</strong> Active</span>
              <span><strong className="text-red-500">{stats.inactiveVolunteers}</strong> Inactive</span>
            </div>
          </div>
        </div>

        {/* Food Stats */}
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
          <div className="p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">Breakfasts Collected</dt>
            <dd className="mt-1 text-3xl font-semibold text-amber-500">{stats.breakfastCount}</dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
          <div className="p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">Lunches Collected</dt>
            <dd className="mt-1 text-3xl font-semibold text-orange-500">{stats.lunchCount}</dd>
          </div>
        </div>
      </div>
    </div>
  );
}
