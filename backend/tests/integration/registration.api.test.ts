import request from "supertest";
import app from "@/app";
import { prisma } from "@/infrastructure/db/client";

// Setup and teardown if necessary
beforeAll(async () => {
  // Wait for db connection if needed
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Registration API", () => {
  it("should return 400 for missing required fields on /register", async () => {
    const response = await request(app)
      .post("/api/v1/registration/register")
      .send({});
    
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe("Validation failed");
  });

  it("should return 400 for invalid email on /register", async () => {
    const response = await request(app)
      .post("/api/v1/registration/register")
      .send({
        fullName: "Test User",
        email: "not-an-email",
        phone: "1234567890",
        collegeName: "Test College",
        editionId: "some-edition-id"
      });
    
    expect(response.status).toBe(400);
  });

  it("should return 401 for invalid retrieve request", async () => {
    const response = await request(app)
      .post("/api/v1/registration/retrieve")
      .send({
        registrationNumber: "PRZ-INVALID",
        email: "wrong@example.com"
      });
    
    // Expecting either 404/401 because it does not exist
    expect([401, 404]).toContain(response.status);
    expect(response.body.success).toBe(false);
  });
});
