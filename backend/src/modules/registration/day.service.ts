import { prisma } from "../../infrastructure/db/client";

/**
 * Determines the current PeriziaDay for a given edition.
 * Uses the system date (or PERIZIA_TEST_DATE for development testing).
 * Returns null if no day matches.
 */
export async function getCurrentPeriziaDay(editionId: string) {
  let todayStr: string;
  
  if (process.env.PERIZIA_TEST_DATE) {
    todayStr = process.env.PERIZIA_TEST_DATE; // Expected format: YYYY-MM-DD
  } else {
    const now = new Date();
    // Use Asia/Kolkata timezone to determine current event date
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    // Format is YYYY-MM-DD
    todayStr = formatter.format(now);
  }

  const days = await prisma.periziaDay.findMany({
    where: { editionId },
    orderBy: { dayNumber: "asc" }
  });

  const currentDay = days.find(day => {
    // Prisma returns `day.date` as a Date object.
    const dayStr = day.date.toISOString().split("T")[0];
    return dayStr === todayStr;
  });

  return currentDay || null;
}
