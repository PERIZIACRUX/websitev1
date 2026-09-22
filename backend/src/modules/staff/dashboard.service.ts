
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

export async function getTodayFoodQuotas() {
  const editionId = await getActiveEditionId();
  // Get active day
  const today = await prisma.periziaDay.findFirst({
    where: {
      editionId,
      // Same logic as getCurrentPeriziaDay for date matching?
      // Since we just need "today's", actually the dashboard can just get ALL days' quotas,
      // but returning all is easier.
    }
  });
  
  // Let's just return all food quotas for the active edition, grouped by day
  const quotas = await prisma.foodQuota.findMany({
    where: {
      periziaDay: {
        editionId,
      }
    },
    include: {
      periziaDay: true,
    },
    orderBy: {
      periziaDay: {
        date: "asc"
      }
    }
  });

  return quotas;
}

export async function updateFoodQuota(id: string, totalAllocated: number, staffId: string) {
  const quota = await prisma.foodQuota.findUnique({ where: { id } });
  if (!quota) throw new Error("Quota not found.");
  if (totalAllocated < quota.givenCount) {
    throw new Error("Allocated quantity cannot be less than food already distributed.");
  }
  
  const updated = await prisma.foodQuota.update({
    where: { id },
    data: {
      totalAllocated,
      updatedByStaffId: staffId,
    }
  });

  await prisma.staffAuditLog.create({
    data: {
      staffId,
      action: "FOOD_QUOTA_UPDATED",
      entityType: "FoodQuota",
      entityId: id,
      details: {
        oldAllocated: quota.totalAllocated,
        newAllocated: totalAllocated,
      }
    }
  });

  return updated;
}
