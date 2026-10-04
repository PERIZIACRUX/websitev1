import { PrismaClient, WorkshopStatus } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_EDITION_NAME = "Perizia 2026 - MVP Demo";
const DEMO_EDITION_SLUG = "perizia-2026-mvp-demo";

const demoDates = [
  "2026-10-18T09:00:00+05:30",
  "2026-10-19T09:00:00+05:30",
  "2026-10-20T09:00:00+05:30",
  "2026-10-21T09:00:00+05:30",
] as const;

async function ensureVenue(name: string) {
  const existing = await prisma.venue.findFirst({ where: { name } });

  if (existing) {
    return existing;
  }

  return prisma.venue.create({
    data: {
      name,
      address: "Demo campus venue",
      description: "Demo venue for MVP registration flow.",
    },
  });
}

async function main() {
  console.log("🌱 Seeding PERIZIA MVP demo edition...");

  const edition = await prisma.periziaEdition.upsert({
    where: { year: 2026 },
    update: {
      name: DEMO_EDITION_NAME,
      slug: DEMO_EDITION_SLUG,
      description: "Demo edition for the CRUX × PERIZIA MVP registration flow.",
      startDate: new Date("2026-10-18T00:00:00+05:30"),
      endDate: new Date("2026-10-21T23:59:59+05:30"),
      isActive: true,
      maxParticipants: 500,
    },
    create: {
      name: DEMO_EDITION_NAME,
      year: 2026,
      slug: DEMO_EDITION_SLUG,
      description: "Demo edition for the CRUX × PERIZIA MVP registration flow.",
      startDate: new Date("2026-10-18T00:00:00+05:30"),
      endDate: new Date("2026-10-21T23:59:59+05:30"),
      isActive: true,
      maxParticipants: 500,
    },
  });

  await prisma.periziaEdition.updateMany({
    where: {
      id: { not: edition.id },
      isActive: true,
    },
    data: { isActive: false },
  });

  const venueNames = [
    "Main Auditorium",
    "Seminar Hall 1",
    "Seminar Hall 2",
    "Computer Lab Block",
  ];

  const venues = await Promise.all(venueNames.map((name) => ensureVenue(name)));

  const dayRecords = await Promise.all(
    demoDates.map((iso, index) =>
      prisma.periziaDay.upsert({
        where: {
          editionId_dayNumber: {
            editionId: edition.id,
            dayNumber: index + 1,
          },
        },
        update: {
          date: new Date(iso),
          name: `Day ${index + 1}`,
        },
        create: {
          editionId: edition.id,
          dayNumber: index + 1,
          date: new Date(iso),
          name: `Day ${index + 1}`,
        },
      }),
    ),
  );

  const workshopSeed = [
    {
      title: "AI in Medicine",
      slug: "ai-in-medicine",
      description: "Practical applications of AI in diagnosis, patient flow, and clinical support.",
      speaker: "Dr. A. Mehta",
      day: dayRecords[0],
      venue: venues[1],
      start: "2026-10-18T10:00:00+05:30",
      end: "2026-10-18T13:00:00+05:30",
      capacity: 60,
    },
    {
      title: "Clinical Skills Workshop",
      slug: "clinical-skills-workshop",
      description: "Hands-on clinical reasoning and patient interaction simulation.",
      speaker: "Dr. S. Nair",
      day: dayRecords[0],
      venue: venues[2],
      start: "2026-10-18T14:00:00+05:30",
      end: "2026-10-18T17:00:00+05:30",
      capacity: 50,
    },
    {
      title: "Medical Photography",
      slug: "medical-photography",
      description: "Documentation techniques for clinical observation and patient communication.",
      speaker: "Prof. R. Shah",
      day: dayRecords[1],
      venue: venues[0],
      start: "2026-10-19T10:00:00+05:30",
      end: "2026-10-19T12:30:00+05:30",
      capacity: 45,
    },
    {
      title: "Research Methodology",
      slug: "research-methodology",
      description: "Designing studies, framing hypotheses, and reviewing evidence with rigor.",
      speaker: "Dr. K. Iyer",
      day: dayRecords[1],
      venue: venues[3],
      start: "2026-10-19T13:30:00+05:30",
      end: "2026-10-19T16:30:00+05:30",
      capacity: 55,
    },
    {
      title: "Emergency Medicine",
      slug: "emergency-medicine",
      description: "Rapid triage decisions, team workflow, and emergency response essentials.",
      speaker: "Dr. V. Kumar",
      day: dayRecords[2],
      venue: venues[1],
      start: "2026-10-20T11:00:00+05:30",
      end: "2026-10-20T14:00:00+05:30",
      capacity: 60,
    },
    {
      title: "Surgical Skills",
      slug: "surgical-skills",
      description: "Foundational principles of safe technique, instrument handling, and case flow.",
      speaker: "Prof. T. Rao",
      day: dayRecords[3],
      venue: venues[2],
      start: "2026-10-21T10:00:00+05:30",
      end: "2026-10-21T13:00:00+05:30",
      capacity: 50,
    },
  ] as const;

  for (const workshop of workshopSeed) {
    await prisma.workshop.upsert({
      where: {
        editionId_slug: {
          editionId: edition.id,
          slug: workshop.slug,
        },
      },
      update: {
        title: workshop.title,
        description: workshop.description,
        speaker: workshop.speaker,
        venueId: workshop.venue.id,
        periziaDayId: workshop.day.id,
        startTime: new Date(workshop.start),
        endTime: new Date(workshop.end),
        capacity: workshop.capacity,
        status: WorkshopStatus.UPCOMING,
      },
      create: {
        editionId: edition.id,
        periziaDayId: workshop.day.id,
        venueId: workshop.venue.id,
        title: workshop.title,
        slug: workshop.slug,
        description: workshop.description,
        speaker: workshop.speaker,
        startTime: new Date(workshop.start),
        endTime: new Date(workshop.end),
        capacity: workshop.capacity,
        status: WorkshopStatus.UPCOMING,
      },
    });
  }

  console.log("  ✓ Demo edition, days, and workshops prepared.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
