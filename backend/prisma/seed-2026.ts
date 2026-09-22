import { PrismaClient, WorkshopStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding PERIZIA 2026...");

  // 1. Create Edition 2026
  const perizia2026 = await prisma.periziaEdition.create({
    data: {
      name: "PERIZIA 2026",
      year: 2026,
      slug: "perizia-2026",
      description: "PERIZIA 2026 — The Next Generation.",
      startDate: new Date("2026-11-20"),
      endDate: new Date("2026-11-21"),
      isActive: true,
      maxParticipants: 500,
    },
  });

  console.log("  ✓ Edition created");

  // 2. Create Days
  const day1 = await prisma.periziaDay.create({
    data: {
      editionId: perizia2026.id,
      dayNumber: 1,
      date: new Date("2026-11-20"),
      name: "Day 1",
    },
  });
  
  const day2 = await prisma.periziaDay.create({
    data: {
      editionId: perizia2026.id,
      dayNumber: 2,
      date: new Date("2026-11-21"),
      name: "Day 2",
    },
  });

  console.log("  ✓ Days created");

  // 3. Create Workshops A, B, C, D
  await prisma.workshop.createMany({
    data: [
      {
        editionId: perizia2026.id,
        periziaDayId: day1.id,
        title: "Workshop A",
        slug: "workshop-a-2026",
        description: "Demi Workshop A",
        speaker: "Demi Speaker",
        startTime: new Date("2026-11-20T10:00:00"),
        endTime: new Date("2026-11-20T13:00:00"),
        capacity: 50,
        status: WorkshopStatus.UPCOMING,
      },
      {
        editionId: perizia2026.id,
        periziaDayId: day1.id,
        title: "Workshop B",
        slug: "workshop-b-2026",
        description: "Demi Workshop B",
        speaker: "Demi Speaker",
        startTime: new Date("2026-11-20T14:00:00"),
        endTime: new Date("2026-11-20T17:00:00"),
        capacity: 50,
        status: WorkshopStatus.UPCOMING,
      },
      {
        editionId: perizia2026.id,
        periziaDayId: day2.id,
        title: "Workshop C",
        slug: "workshop-c-2026",
        description: "Demi Workshop C",
        speaker: "Demi Speaker",
        startTime: new Date("2026-11-21T10:00:00"),
        endTime: new Date("2026-11-21T13:00:00"),
        capacity: 50,
        status: WorkshopStatus.UPCOMING,
      },
      {
        editionId: perizia2026.id,
        periziaDayId: day2.id,
        title: "Workshop D",
        slug: "workshop-d-2026",
        description: "Demi Workshop D",
        speaker: "Demi Speaker",
        startTime: new Date("2026-11-21T14:00:00"),
        endTime: new Date("2026-11-21T17:00:00"),
        capacity: 50,
        status: WorkshopStatus.UPCOMING,
      }
    ]
  });

  console.log("  ✓ Workshops A, B, C, D created");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
