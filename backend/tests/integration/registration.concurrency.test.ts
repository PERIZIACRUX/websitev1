import { prisma } from "@/infrastructure/db/client";
import { RegistrationStatus } from "@prisma/client";
import request from "supertest";
import app from "@/app";

// Helper to mimic the old service signature but test the actual Express HTTP endpoint
async function processPeriziaRegistration(payload: any) {
  const response = await request(app).post("/api/v1/registration/register").send(payload);
  if (response.status >= 400) {
    const error: any = new Error(response.body?.error || "Unknown Error");
    error.statusCode = response.status;
    throw error;
  }
  return response.body.data;
}

jest.mock("crypto", () => {
  const actualCrypto = jest.requireActual("crypto");
  return {
    ...actualCrypto,
    randomBytes: jest.fn(() => ({
      toString: jest.fn(() => Math.random().toString(36).substring(2, 10)),
    })),
  };
});

jest.setTimeout(30000);

describe("Registration Concurrency and Capacity", () => {
  let activeEditionId: string;
  let day1Id: string;
  let day2Id: string;
  let workshop1Id: string; // Day 1
  let workshop2Id: string; // Day 2
  let workshopSameDayId: string; // Day 1

  beforeAll(async () => {
    // 1. Clean DB from previous aborted runs using scoped identifiers if they exist, but for now just let it be or just do nothing since we create unique tests.
    // To be perfectly safe, we shouldn't wipe the whole DB here because it breaks the local seed data.
    // Instead we just create new data.

    // 2. Create small capacity Edition
    const edition = await prisma.periziaEdition.create({
      data: {
        name: "CONCURRENCY TEST EDITION",
        year: 2097,
        slug: "concurrency-test",
        startDate: new Date(),
        endDate: new Date(),
        isActive: true,
        maxParticipants: 3, // Small capacity for tests
      },
    });
    activeEditionId = edition.id;

    // 3. Create Days
    const day1 = await prisma.periziaDay.create({
      data: { editionId: edition.id, dayNumber: 1, date: new Date("2099-01-01"), name: "Day 1" }
    });
    const day2 = await prisma.periziaDay.create({
      data: { editionId: edition.id, dayNumber: 2, date: new Date("2099-01-02"), name: "Day 2" }
    });
    day1Id = day1.id;
    day2Id = day2.id;

    // 4. Create Workshops
    const ws1 = await prisma.workshop.create({
      data: {
        editionId: edition.id, periziaDayId: day1.id, title: "WS1", slug: "ws1",
        startTime: new Date(), endTime: new Date(), capacity: 2 // Small workshop capacity
      }
    });
    const ws2 = await prisma.workshop.create({
      data: {
        editionId: edition.id, periziaDayId: day2.id, title: "WS2", slug: "ws2",
        startTime: new Date(), endTime: new Date(), capacity: null
      }
    });
    const ws3 = await prisma.workshop.create({
      data: {
        editionId: edition.id, periziaDayId: day1.id, title: "WS3", slug: "ws3",
        startTime: new Date(), endTime: new Date(), capacity: 5
      }
    });

    workshop1Id = ws1.id;
    workshop2Id = ws2.id;
    workshopSameDayId = ws3.id;
  });

  afterEach(async () => {
    // Clear our test registrations specifically between tests
    await prisma.qrCredential.deleteMany({ where: { registration: { editionId: activeEditionId } } });
    await prisma.payment.deleteMany({ where: { registration: { editionId: activeEditionId } } });
    await prisma.workshopRegistration.deleteMany({ where: { registration: { editionId: activeEditionId } } });
    await prisma.registration.deleteMany({ where: { editionId: activeEditionId } });
    await prisma.participant.deleteMany({ where: { collegeName: "College" } });
  });

  afterAll(async () => {
    await prisma.payment.deleteMany({ where: { registration: { editionId: activeEditionId } } });
    await prisma.workshopRegistration.deleteMany({ where: { registration: { editionId: activeEditionId } } });
    await prisma.registration.deleteMany({ where: { editionId: activeEditionId } });
    await prisma.participant.deleteMany({ where: { collegeName: "College" } });
    await prisma.workshop.deleteMany({ where: { editionId: activeEditionId } });
    await prisma.periziaDay.deleteMany({ where: { editionId: activeEditionId } });
    await prisma.periziaEdition.deleteMany({ where: { id: activeEditionId } });
    
    await prisma.$disconnect();
  });

  it("A. Normal registration succeeds", async () => {
    const res = await processPeriziaRegistration({
      fullName: "Test User 1",
      email: "test1@example.com",
      phone: "1111111111",
      collegeName: "Test College",
      editionId: activeEditionId,
      workshopIds: [workshop1Id],
    });

    expect(res.status).toBe(RegistrationStatus.PENDING);
    expect(res.registrationNumber).toBeDefined();
  });

  it("B & C. Concurrent Edition Capacity limits to exactly maxParticipants (3)", async () => {
    // We send 10 concurrent requests to an edition that has maxParticipants = 3
    const promises = Array.from({ length: 10 }).map((_, i) =>
      processPeriziaRegistration({
        fullName: `User ${i}`,
        email: `user${i}@example.com`,
        phone: `222222222${i}`,
        collegeName: "College",
        editionId: activeEditionId,
        workshopIds: [],
      })
    );

    const results = await Promise.allSettled(promises);
    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");

    // Exactly 3 should succeed because maxParticipants = 3
    expect(fulfilled.length).toBe(3);
    expect(rejected.length).toBe(7);

    // Verify DB count
    const count = await prisma.registration.count({ where: { editionId: activeEditionId } });
    expect(count).toBe(3);

    const error = (rejected[0] as PromiseRejectedResult).reason as any;
    expect(error.statusCode).toBe(409);
    expect(error.message).toContain("maximum capacity");
  });

  it("D & E. Concurrent Workshop Capacity limits to exactly capacity (2)", async () => {
    // We send 5 concurrent requests to workshop1 which has capacity = 2
    // We will set Edition capacity temporarily higher so it doesn't block us
    await prisma.periziaEdition.update({ where: { id: activeEditionId }, data: { maxParticipants: 10 } });

    const promises = Array.from({ length: 5 }).map((_, i) =>
      processPeriziaRegistration({
        fullName: `Workshop User ${i}`,
        email: `wsuser${i}@example.com`,
        phone: `333333333${i}`,
        collegeName: "College",
        editionId: activeEditionId,
        workshopIds: [workshop1Id],
      })
    );

    const results = await Promise.allSettled(promises);
    const fulfilled = results.filter((r) => r.status === "fulfilled");
    
    // Exactly 2 should succeed
    expect(fulfilled.length).toBe(2);

    // Verify DB count
    const count = await prisma.workshopRegistration.count({ where: { workshopId: workshop1Id } });
    expect(count).toBe(2);
  });

  it("F. Concurrent Duplicate Registration from same participant succeeds only once", async () => {
    // Hammer the API with identical payloads
    const payload = {
      fullName: "Duplicate User",
      email: "duplicate@example.com",
      phone: "9999999999",
      collegeName: "College",
      editionId: activeEditionId,
      workshopIds: [workshop2Id],
    };

    const promises = Array.from({ length: 5 }).map(() => processPeriziaRegistration(payload));
    const results = await Promise.allSettled(promises);
    
    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");

    // Exactly 1 should succeed
    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(4);

    // Ensure error is gracefully caught as ApiError 409, not raw Prisma crash
    const error = (rejected[0] as PromiseRejectedResult).reason as any;
    expect(error.statusCode).toBe(409);
    expect(error.message).toContain("already registered");

    const registrations = await prisma.registration.count({ where: { participant: { email: "duplicate@example.com" } } });
    expect(registrations).toBe(1);
  });

  it("G. Rejects multiple workshops on the same day", async () => {
    await expect(
      processPeriziaRegistration({
        fullName: "Same Day User",
        email: "sameday@example.com",
        phone: "8888888888",
        collegeName: "College",
        editionId: activeEditionId,
        // WS1 and WS3 are both on Day 1
        workshopIds: [workshop1Id, workshopSameDayId],
      })
    ).rejects.toThrow("You cannot select multiple workshops occurring on the same day");
  });

  it("H. Transaction Rollback ensures no partial data is created on failure", async () => {
    // We intentionally trigger a failure by passing an invalid workshop from another edition
    // First, let's create a fake workshop
    const randStr = Date.now().toString();
    const otherEdition = await prisma.periziaEdition.create({
      data: { name: "Other", year: 2998 + Math.floor(Math.random() * 1000), slug: "other-" + randStr, startDate: new Date(), endDate: new Date() }
    });
    const otherWs = await prisma.workshop.create({
      data: { editionId: otherEdition.id, periziaDayId: day1Id, title: "Oth", slug: "oth", startTime: new Date(), endTime: new Date() }
    });

    try {
      await processPeriziaRegistration({
        fullName: "Rollback User",
        email: "rollback@example.com",
        phone: "7777777777",
        collegeName: "College",
        editionId: activeEditionId,
        workshopIds: [otherWs.id],
      });
      fail("Should have thrown");
    } catch (e: any) {
      expect(e.statusCode).toBe(400);
      expect(e.message).toContain("belongs to a different edition");
    }

    // Assert that the participant was NOT created because the transaction rolled back
    const p = await prisma.participant.findUnique({ where: { email: "rollback@example.com" } });
    expect(p).toBeNull();
    
    // Clean up
    await prisma.workshop.delete({ where: { id: otherWs.id } });
    await prisma.periziaEdition.delete({ where: { id: otherEdition.id } });
  });
});
