import { requireAdmin } from "@/lib/auth/staff-session";
import Link from "next/link";
import LogoutButton from "@/components/staff/LogoutButton";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Enforce ADMIN role at layout level
  await requireAdmin();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Admin Portal</h2>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <Link href="/staff/admin" className="block px-3 py-2 text-sm font-medium text-gray-900 rounded-md hover:bg-gray-50">
            Overview
          </Link>
          <Link href="/staff/admin/volunteers" className="block px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900">
            Volunteers
          </Link>
          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Coming Later</p>
          </div>
          <span className="block px-3 py-2 text-sm font-medium text-gray-400 rounded-md cursor-not-allowed">
            Participants
          </span>
          <span className="block px-3 py-2 text-sm font-medium text-gray-400 rounded-md cursor-not-allowed">
            Sessions
          </span>
          <span className="block px-3 py-2 text-sm font-medium text-gray-400 rounded-md cursor-not-allowed">
            Audit Logs
          </span>
        </nav>
        <div className="p-4 border-t border-gray-200 space-y-2">
          <Link href="/staff/account" className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900">
            My Account
          </Link>
          <LogoutButton variant="danger" />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
