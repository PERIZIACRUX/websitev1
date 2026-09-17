/**
 * app/admin/page.tsx
 * ──────────────────────────────────────────────────────────────────────────
 * Admin Portal — Placeholder
 *
 * This area is the internal admin dashboard for PERIZIA organisers.
 * It will provide:
 *   - Participant list and management
 *   - Registration overview / capacity status
 *   - Payment status monitoring
 *   - Manual check-in override
 *   - Workshop attendance reports
 *   - Food collection reports
 *   - Event configuration
 *
 * ACCESS: This route must be protected. Only authenticated admins may
 * access it. Authentication will be implemented in a later step.
 *
 * IMPORTANT: All admin actions are server-side and authoritative.
 * The admin UI never directly writes to the database — it calls
 * authenticated API routes that enforce permissions.
 */

export default function AdminPage() {
  return (
    <main>
      <h1>PERIZIA Admin Portal</h1>
      <p>Admin portal is not yet available.</p>
    </main>
  );
}

export const metadata = {
  title: "Admin — PERIZIA",
  description: "Internal admin portal for PERIZIA organisers.",
  robots: "noindex, nofollow",
};
