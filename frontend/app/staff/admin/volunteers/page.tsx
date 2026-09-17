import VolunteerManagement from "@/components/admin/VolunteerManagement";
import { fetchBackend } from "@/lib/api";
import { cookies } from "next/headers";

const STAFF_SESSION_COOKIE_NAME = "staff_session_id";

export default async function AdminVolunteersPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(STAFF_SESSION_COOKIE_NAME)?.value;

  const res = await fetchBackend("/api/v1/staff/volunteers", {
    headers: {
      Cookie: `${STAFF_SESSION_COOKIE_NAME}=${sessionToken}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to load volunteers");
  }

  const { data: volunteers } = await res.json();

  return (
    <VolunteerManagement initialVolunteers={volunteers} />
  );
}
