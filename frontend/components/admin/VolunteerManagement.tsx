"use client";

import { useState, useTransition } from "react";
import { 
  createVolunteerApiAction, 
  deactivateVolunteerApiAction, 
  reactivateVolunteerApiAction, 
  resetPasswordApiAction 
} from "@/app/staff/admin/volunteers/api-client-actions";

type Volunteer = {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
};

export default function VolunteerManagement({ initialVolunteers }: { initialVolunteers: Volunteer[] }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const resetMessages = () => {
    setError(null);
    setSuccess(null);
    setTempPassword(null);
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetMessages();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const result = await createVolunteerApiAction(null, formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccess(result.message || "Volunteer created.");
        setTempPassword(result.tempPassword || null);
        setIsCreateModalOpen(false);
      }
    });
  };

  const handleDeactivate = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to DEACTIVATE ${name}? They will immediately lose access.`)) return;
    resetMessages();
    startTransition(async () => {
      const result = await deactivateVolunteerApiAction(id);
      if (result?.error) setError(result.error);
      else setSuccess(`${name} deactivated.`);
    });
  };

  const handleReactivate = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to REACTIVATE ${name}?`)) return;
    resetMessages();
    startTransition(async () => {
      const result = await reactivateVolunteerApiAction(id);
      if (result?.error) setError(result.error);
      else setSuccess(`${name} reactivated.`);
    });
  };

  const handleResetPassword = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to RESET PASSWORD for ${name}? All their active sessions will be revoked.`)) return;
    resetMessages();
    startTransition(async () => {
      const result = await resetPasswordApiAction(id);
      if (result?.error) setError(result.error);
      else {
        setSuccess(`Password reset for ${name}.`);
        setTempPassword(result.tempPassword || null);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Volunteer Management</h1>
          <p className="mt-1 text-sm text-gray-500">Create and manage volunteer accounts.</p>
        </div>
        <button
          onClick={() => { resetMessages(); setIsCreateModalOpen(true); }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
        >
          Create Volunteer
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
          <p>{success}</p>
          {tempPassword && (
            <div className="mt-2 p-3 bg-white border border-green-300 rounded font-mono text-lg text-gray-900">
              Temporary Password: <strong>{tempPassword}</strong>
              <p className="text-xs text-red-600 mt-1 uppercase font-bold">Important: This is the ONLY time this password will be shown. Copy it now!</p>
            </div>
          )}
        </div>
      )}

      {/* Volunteer Table */}
      <div className="bg-white shadow border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name / Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {initialVolunteers.map((vol) => (
              <tr key={vol.id} className={!vol.isActive ? "bg-gray-50" : ""}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{vol.name}</div>
                  <div className="text-sm text-gray-500">{vol.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${vol.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {vol.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {vol.lastLoginAt ? new Date(vol.lastLoginAt).toLocaleDateString() : "Never"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                  <button
                    disabled={isPending}
                    onClick={() => handleResetPassword(vol.id, vol.name)}
                    className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                  >
                    Reset Pwd
                  </button>
                  {vol.isActive ? (
                    <button
                      disabled={isPending}
                      onClick={() => handleDeactivate(vol.id, vol.name)}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button
                      disabled={isPending}
                      onClick={() => handleReactivate(vol.id, vol.name)}
                      className="text-green-600 hover:text-green-900 disabled:opacity-50"
                    >
                      Reactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {initialVolunteers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                  No volunteers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Create Volunteer</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input required type="text" name="name" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input required type="email" name="email" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50"
                >
                  {isPending ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
