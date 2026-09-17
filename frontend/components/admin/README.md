# components/admin/

Admin portal UI components.

Examples:
- `ParticipantTable.tsx` — searchable/filterable participant list
- `RegistrationStats.tsx` — capacity usage, revenue summary
- `AttendanceReport.tsx` — workshop and check-in attendance
- `ManualCheckinButton.tsx` — allows admins to manually check in a participant

## Rules
- Admin components are only used within `app/admin/` pages.
- All admin actions call authenticated API routes — no direct database access.
- Admin components display data fetched by server components.
- All mutations (check-in override, refund, etc.) go through authenticated API routes.
- This area is admin-only and must be protected by authentication.
