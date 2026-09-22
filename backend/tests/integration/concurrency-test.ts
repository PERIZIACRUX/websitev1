import { performFoodCollection } from "../../src/modules/staff/scanner.service";
import { prisma } from "../../src/infrastructure/db/client";

async function main() {
  console.log("Setting up DB...");
  const edition = await prisma.periziaEdition.findFirst({ where: { isActive: true }});
  if (!edition) throw new Error("No active edition");

  const day = await prisma.periziaDay.findFirst({ where: { editionId: edition.id }});
  if (!day) throw new Error("No active day");

  // Create test participants
  const p1 = await prisma.participant.create({
    data: {
      fullName: "Test Participant 1",
      email: `test1-${Date.now()}@example.com`,
      phone: `123-${Date.now()}-1`,
      collegeName: "Test College",
    }
  });

  const p2 = await prisma.participant.create({
    data: {
      fullName: "Test Participant 2",
      email: `test2-${Date.now()}@example.com`,
      phone: `123-${Date.now()}-2`,
      collegeName: "Test College",
    }
  });

  const reg1 = await prisma.registration.create({
    data: {
      participantId: p1.id,
      editionId: edition.id,
      registrationNumber: `REG-${Date.now()}-1`,
      status: "CONFIRMED",
    }
  });

  const reg2 = await prisma.registration.create({
    data: {
      participantId: p2.id,
      editionId: edition.id,
      registrationNumber: `REG-${Date.now()}-2`,
      status: "CONFIRMED",
    }
  });

  const staff = await prisma.staff.findFirst({ where: { role: "ADMIN" }});
  if (!staff) throw new Error("No staff");

  // Create Quota of 1 for breakfast
  await prisma.foodQuota.upsert({
    where: { periziaDayId_mealType: { periziaDayId: day.id, mealType: "BREAKFAST" }},
    update: { totalAllocated: 1, givenCount: 0 },
    create: { periziaDayId: day.id, mealType: "BREAKFAST", totalAllocated: 1, givenCount: 0, updatedByStaffId: staff.id }
  });

  console.log("Simulating concurrent food collection...");
  
  // Try to collect breakfast for both participants at the exact same time
  const results = await Promise.allSettled([
    performFoodCollection(reg1.id, day.id, "BREAKFAST", staff.id),
    performFoodCollection(reg2.id, day.id, "BREAKFAST", staff.id),
  ]);

  let successes = 0;
  let failures = 0;

  for (const r of results) {
    if (r.status === "fulfilled") successes++;
    else failures++;
  }

  console.log(`Successes: ${successes} (Expected: 1)`);
  console.log(`Failures: ${failures} (Expected: 1)`);

  const quota = await prisma.foodQuota.findUnique({
    where: { periziaDayId_mealType: { periziaDayId: day.id, mealType: "BREAKFAST" }}
  });
  console.log(`Final givenCount in DB: ${quota?.givenCount} (Expected: 1)`);

  if (successes === 1 && failures === 1 && quota?.givenCount === 1) {
    console.log("CONCURRENCY TEST PASSED");
  } else {
    console.error("CONCURRENCY TEST FAILED");
    process.exit(1);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
