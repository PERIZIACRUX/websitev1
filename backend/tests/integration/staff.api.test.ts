import request from "supertest";
import app from "@/app";
import { prisma } from "@/infrastructure/db/client";
import { STAFF_SESSION_COOKIE_NAME } from "@/middleware/staff-auth";
import { createStaffSession } from "@/modules/staff/session.service";
import * as argon2 from "argon2";

describe("Staff API Endpoints", () => {
  let adminCookie: string;
  let volunteerCookie: string;
  let adminId: string;
  let volunteerId: string;
  let inactiveVolunteerId: string;

  beforeAll(async () => {
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

    // Create an inactive volunteer
    const inactiveVolunteer = await prisma.staff.create({
      data: {
        name: "Inactive Vol",
        email: "vol.inactive@example.com",
        role: "VOLUNTEER",
        passwordHash,
        isActive: false,
        mustChangePassword: false,
      },
    });
    inactiveVolunteerId = inactiveVolunteer.id;

    // Generate sessions
    const adminSession = await createStaffSession(adminId);
    adminCookie = `${STAFF_SESSION_COOKIE_NAME}=${adminSession.rawToken}`;

    const volSession = await createStaffSession(volunteerId);
    volunteerCookie = `${STAFF_SESSION_COOKIE_NAME}=${volSession.rawToken}`;
  });

  afterAll(async () => {
    await prisma.qrCredential.deleteMany();
    await prisma.registration.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.participant.deleteMany();
    await prisma.staffSession.deleteMany();
    await prisma.staffAuditLog.deleteMany();
    await prisma.staff.deleteMany();
  });

  describe("Authentication API", () => {
    it("should login a valid user and return cookie", async () => {
      const res = await request(app).post("/api/v1/staff/auth/login").send({
        email: "admin.staff@example.com",
        password: "testAdminPwd1!",
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe("ADMIN");
      expect(res.headers["set-cookie"]).toBeDefined();
    });

    it("should return 401 on invalid credentials", async () => {
      const res = await request(app).post("/api/v1/staff/auth/login").send({
        email: "admin.staff@example.com",
        password: "wrongPassword!",
      });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should return 401 on inactive user login", async () => {
      const res = await request(app).post("/api/v1/staff/auth/login").send({
        email: "vol.inactive@example.com",
        password: "testAdminPwd1!",
      });
      expect(res.status).toBe(401);
    });

    it("should change password", async () => {
      const res = await request(app)
        .post("/api/v1/staff/auth/change-password")
        .set("Cookie", adminCookie)
        .send({
          oldPassword: "testAdminPwd1!",
          newPassword: "newTestAdminPwd2@",
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should logout successfully", async () => {
      const volSession2 = await createStaffSession(volunteerId);
      const volCookie2 = `${STAFF_SESSION_COOKIE_NAME}=${volSession2.rawToken}`;
      
      const res = await request(app)
        .post("/api/v1/staff/auth/logout")
        .set("Cookie", volCookie2);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.headers["set-cookie"]).toBeDefined();
    });
  });

  describe("Authorization & Middleware", () => {
    it("should allow admin access to volunteer creation", async () => {
      const res = await request(app)
        .post("/api/v1/staff/volunteers")
        .set("Cookie", adminCookie)
        .send({
          name: "New Volunteer",
          email: "new.vol@example.com",
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe("VOLUNTEER");
      expect(res.body.tempPassword).toBeDefined();
    });

    it("should block volunteer from creating volunteer", async () => {
      const res = await request(app)
        .post("/api/v1/staff/volunteers")
        .set("Cookie", volunteerCookie)
        .send({
          name: "Another Vol",
          email: "another@example.com",
        });
      expect(res.status).toBe(403);
    });

    it("should block unauthenticated access to volunteers", async () => {
      const res = await request(app)
        .post("/api/v1/staff/volunteers")
        .send({
          name: "Unauth Vol",
          email: "unauth@example.com",
        });
      expect(res.status).toBe(401);
    });

    it("should block access if session is revoked", async () => {
      const revokedSession = await createStaffSession(adminId);
      await prisma.staffSession.update({
        where: { id: revokedSession.session.id },
        data: { revokedAt: new Date() },
      });
      const revokedCookie = `${STAFF_SESSION_COOKIE_NAME}=${revokedSession.rawToken}`;
      
      const res = await request(app)
        .post("/api/v1/staff/volunteers")
        .set("Cookie", revokedCookie)
        .send({ name: "A", email: "a@a.com" });
      expect(res.status).toBe(401);
    });
  });

  describe("Volunteer Management (Admin)", () => {
    let tempVolId: string;
    beforeAll(async () => {
      const vol = await prisma.staff.create({
        data: {
          name: "Temp Vol",
          email: "temp.vol@example.com",
          role: "VOLUNTEER",
          passwordHash: "x",
          isActive: true,
          mustChangePassword: false,
        },
      });
      tempVolId = vol.id;
    });

    it("should allow admin to get volunteer list (omitting sensitive info)", async () => {
      const res = await request(app)
        .get("/api/v1/staff/volunteers")
        .set("Cookie", adminCookie);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      
      // Ensure tempVol is in the list
      const vol = res.body.data.find((v: any) => v.id === tempVolId);
      expect(vol).toBeDefined();
      expect(vol.email).toBe("temp.vol@example.com");
      
      // Sensitive fields shouldn't be there
      expect(vol.passwordHash).toBeUndefined();
    });

    it("should block volunteer from getting volunteer list", async () => {
      const res = await request(app)
        .get("/api/v1/staff/volunteers")
        .set("Cookie", volunteerCookie);
      expect(res.status).toBe(403);
    });

    it("should block unauthenticated from getting volunteer list", async () => {
      const res = await request(app)
        .get("/api/v1/staff/volunteers");
      expect(res.status).toBe(401);
    });

    it("should deactivate a volunteer", async () => {
      const res = await request(app)
        .post(`/api/v1/staff/volunteers/${tempVolId}/deactivate`)
        .set("Cookie", adminCookie);
      expect(res.status).toBe(200);
      
      const vol = await prisma.staff.findUnique({ where: { id: tempVolId }});
      expect(vol?.isActive).toBe(false);
    });

    it("should reactivate a volunteer", async () => {
      const res = await request(app)
        .post(`/api/v1/staff/volunteers/${tempVolId}/reactivate`)
        .set("Cookie", adminCookie);
      expect(res.status).toBe(200);
      
      const vol = await prisma.staff.findUnique({ where: { id: tempVolId }});
      expect(vol?.isActive).toBe(true);
    });

    it("should reset volunteer password", async () => {
      const res = await request(app)
        .post(`/api/v1/staff/volunteers/${tempVolId}/reset-password`)
        .set("Cookie", adminCookie);
      expect(res.status).toBe(200);
      expect(res.body.tempPassword).toBeDefined();

      const vol = await prisma.staff.findUnique({ where: { id: tempVolId }});
      expect(vol?.mustChangePassword).toBe(true);
    });
  });

  describe("QR Scanner (Staff)", () => {
    it("should return invalid QR for empty token", async () => {
      const res = await request(app)
        .post("/api/v1/staff/scanner/verify")
        .set("Cookie", volunteerCookie)
        .send({ qrToken: "  " });
      expect(res.status).toBe(200); // We return 200 with { data: { valid: false }}
      expect(res.body.data.valid).toBe(false);
      expect(res.body.data.message).toContain("Invalid or empty");
    });

    it("should block unauthenticated access to scanner", async () => {
      const res = await request(app)
        .post("/api/v1/staff/scanner/verify")
        .send({ qrToken: "faketoken" });
      expect(res.status).toBe(401);
    });
  });
});
