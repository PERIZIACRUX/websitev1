
import { prisma } from "@/infrastructure/db/client";

export interface VolunteerDashboardStats {
  registeredCount: number;
  checkedInCount: number;
  breakfastCount: number;
  lunchCount: number;
}

export interface AdminDashboardStats extends VolunteerDashboardStats {
  totalVolunteers: number;
  activeVolunteers: number;
  inactiveVolunteers: number;
}

/**
 * Gets the currently active Perizia edition.
 * Throws if none is active.
 */
async function getActiveEditionId() {
  const edition = await prisma.periziaEdition.findFirst({
    where: { isActive: true },
    select: { id: true },
  });
  if (!edition) {
    throw new Error("No active Perizia edition found.");
  }
  return edition.id;
}

/**
 * Gets edition-scoped operational statistics for volunteers.
 */
export async function getVolunteerStats(): Promise<VolunteerDashboardStats> {
  const editionId = await getActiveEditionId();

  const [registeredCount, checkedInCount, breakfastCount, lunchCount] = await Promise.all([
    prisma.registration.count({
      where: {
        editionId,
        status: "CONFIRMED",
      },
    }),
    prisma.conferenceCheckIn.count({
      where: {
        periziaDay: {
          editionId,
        },
      },
    }),
    prisma.foodCollection.count({
      where: {
        mealType: "BREAKFAST",
        periziaDay: {
          editionId,
        },
      },
    }),
    prisma.foodCollection.count({
      where: {
        mealType: "LUNCH",
        periziaDay: {
          editionId,
        },
      },
    }),
  ]);

  return {
    registeredCount,
    checkedInCount,
    breakfastCount,
    lunchCount,
  };
}

/**
 * Gets edition-scoped operational stats AND global staff stats for admins.
 */
export async function getAdminStats(): Promise<AdminDashboardStats> {
  const volStats = await getVolunteerStats();

  const [totalVolunteers, activeVolunteers, inactiveVolunteers] = await Promise.all([
    prisma.staff.count({ where: { role: "VOLUNTEER" } }),
    prisma.staff.count({ where: { role: "VOLUNTEER", isActive: true } }),
    prisma.staff.count({ where: { role: "VOLUNTEER", isActive: false } }),
  ]);

  return {
    ...volStats,
    totalVolunteers,
    activeVolunteers,
    inactiveVolunteers,
  };
}
