import request from "supertest";
import app from "../../src/app";
import { prisma } from "../../src/infrastructure/db/client";
import { STAFF_SESSION_COOKIE_NAME } from "../../src/middleware/staff-auth";
import { createStaffSession } from "../../src/modules/staff/session.service";
import * as argon2 from "argon2";

describe("Dashboard API Endpoints", () => {
  let adminCookie: string;
  let volunteerCookie: string;
  let adminId: string;
  let volunteerId: string;
  let editionId: string;

  beforeAll(async () => {
    // Clean up in proper foreign-key order
    await prisma.staffSession.deleteMany();
    await prisma.staffAuditLog.deleteMany();
    await prisma.foodCollection.deleteMany();
    await prisma.conferenceCheckIn.deleteMany();
    await prisma.workshopAttendance.deleteMany();
    await prisma.workshopRegistration.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.foodQuota.deleteMany();
    await prisma.qrCredential.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.registration.deleteMany();
    await prisma.participant.deleteMany();
    await prisma.periziaContent.deleteMany();
    await prisma.workshop.deleteMany();
    await prisma.periziaDay.deleteMany();
    await prisma.periziaEdition.deleteMany();
    await prisma.staff.deleteMany();

    // Create a mock active edition
    const edition = await prisma.periziaEdition.create({
      data: {
        name: "Test Edition",
        slug: "test-edition-" + Date.now(),
        year: 2050 + Math.floor(Math.random() * 1000),
        startDate: new Date(),
        endDate: new Date(),
        isActive: true,
        maxParticipants: 100,
      }
    });
    editionId = edition.id;

    // Create an admin
    const passwordHash = await argon2.hash("testAdminPwd1!", { type: argon2.argon2id });
    const admin = await prisma.staff.create({
      data: {
        name: "Admin Staff",
        email: "admin.staff@example.com",
        role: "ADMIN",
        passwordHash,
        isActive: true,
        mustChangePassword: false,
      },
    });
    adminId = admin.id;

    // Create an active volunteer
    const volunteer = await prisma.staff.create({
      data: {
        name: "Active Vol",
        email: "vol.active@example.com",
        role: "VOLUNTEER",
        passwordHash,
        isActive: true,
        mustChangePassword: false,
      },
    });
    volunteerId = volunteer.id;

    // Generate sessions
    const adminSession = await createStaffSession(adminId);
    adminCookie = `${STAFF_SESSION_COOKIE_NAME}=${adminSession.rawToken}`;

    const volSession = await createStaffSession(volunteerId);
    volunteerCookie = `${STAFF_SESSION_COOKIE_NAME}=${volSession.rawToken}`;
  });

  afterAll(async () => {
    // Clean up in proper foreign-key order
    await prisma.staffSession.deleteMany();
    await prisma.staffAuditLog.deleteMany();
    await prisma.foodCollection.deleteMany();
    await prisma.conferenceCheckIn.deleteMany();
    await prisma.workshopAttendance.deleteMany();
    await prisma.workshopRegistration.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.foodQuota.deleteMany();
    await prisma.qrCredential.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.registration.deleteMany();
    await prisma.participant.deleteMany();
    await prisma.periziaContent.deleteMany();
    await prisma.workshop.deleteMany();
    await prisma.periziaDay.deleteMany();
    await prisma.periziaEdition.deleteMany();
    await prisma.staff.deleteMany();
  });

  describe("GET /api/v1/staff/dashboard/volunteer-stats", () => {
    it("should allow admin to view volunteer stats", async () => {
      const res = await request(app)
        .get("/api/v1/staff/dashboard/volunteer-stats")
        .set("Cookie", adminCookie);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.registeredCount).toBeDefined();
    });

    it("should allow volunteer to view volunteer stats", async () => {
      const res = await request(app)
        .get("/api/v1/staff/dashboard/volunteer-stats")
        .set("Cookie", volunteerCookie);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.registeredCount).toBeDefined();
    });

    it("should block unauthenticated users", async () => {
      const res = await request(app).get("/api/v1/staff/dashboard/volunteer-stats");
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/v1/staff/dashboard/admin-stats", () => {
    it("should allow admin to view admin stats", async () => {
      const res = await request(app)
        .get("/api/v1/staff/dashboard/admin-stats")
        .set("Cookie", adminCookie);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalVolunteers).toBeDefined();
      expect(res.body.data.activeVolunteers).toBeDefined();
    });

    it("should block volunteer from viewing admin stats", async () => {
      const res = await request(app)
        .get("/api/v1/staff/dashboard/admin-stats")
        .set("Cookie", volunteerCookie);
      
      expect(res.status).toBe(403);
    });

    it("should block unauthenticated users", async () => {
      const res = await request(app).get("/api/v1/staff/dashboard/admin-stats");
      expect(res.status).toBe(401);
    });
  });
});
