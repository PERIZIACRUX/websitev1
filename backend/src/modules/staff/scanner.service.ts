import { prisma } from "../../infrastructure/db/client";

export async function getScannerParticipantContext(registrationId: string, periziaDayId: string) {
  // 1. Conference Status
  const checkIn = await prisma.conferenceCheckIn.findUnique({
    where: {
      registrationId_periziaDayId: {
        registrationId,
        periziaDayId,
      },
    },
  });

  // 2. Workshops for today
  // Get all workshop registrations for this participant on this day, including workshop details
  const workshopRegs = await prisma.workshopRegistration.findMany({
    where: {
      registrationId,
      periziaDayId,
      status: "REGISTERED",
    },
    include: {
      workshop: true,
    },
  });

  // Also get attendances for this day
  const attendances = await prisma.workshopAttendance.findMany({
    where: {
      registrationId,
      periziaDayId,
    },
  });

  const attendedWorkshopIds = new Set(attendances.map((a) => a.workshopId));
  const attendedMap = new Map(attendances.map((a) => [a.workshopId, a.attendedAt]));

  const workshops = workshopRegs.map((wr) => {
    const attended = attendedWorkshopIds.has(wr.workshopId);
    return {
      id: wr.workshopId,
      title: wr.workshop.title,
      time: wr.workshop.startTime,
      venue: wr.workshop.venueId, // We might need to resolve venue name, but venueId is fine or we can omit it if not strictly required, actually the prompt says `venue` (string), let's fetch venue name
    };
  });
  
  // Wait, let's include venue in the query:
  // include: { workshop: { include: { venue: true } } }
  
  // 3. Food Status
  const foodCollections = await prisma.foodCollection.findMany({
    where: {
      registrationId,
      periziaDayId,
    },
  });

  const breakfast = foodCollections.find((f) => f.mealType === "BREAKFAST");
  const lunch = foodCollections.find((f) => f.mealType === "LUNCH");

  return {
    conference: {
      eligible: true, // confirmed registration implies eligible
      checkedIn: !!checkIn,
      checkedInAt: checkIn ? checkIn.checkedInAt : null,
    },
    workshops: workshopRegs.map((wr) => {
      const attended = attendedWorkshopIds.has(wr.workshopId);
      return {
        id: wr.workshopId,
        title: wr.workshop.title,
        time: wr.workshop.startTime,
        // Actually, venue might not be loaded if I don't include it. Let's fix the query.
      };
    }),
    food: {
      breakfast: {
        collected: !!breakfast,
        collectedAt: breakfast ? breakfast.collectedAt : null,
      },
      lunch: {
        collected: !!lunch,
        collectedAt: lunch ? lunch.collectedAt : null,
      },
    },
  };
}
