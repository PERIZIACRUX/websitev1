import request from "supertest";
import app from "@/app";
import { prisma } from "@/infrastructure/db/client";

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Payment API", () => {
  it("should return 501 for payment initiate", async () => {
    const response = await request(app)
      .post("/api/v1/payment/initiate")
      .send({});
    
    expect(response.status).toBe(501);
  });

  it("should return 400 for missing fields on test-verify", async () => {
    const response = await request(app)
      .post("/api/v1/payment/test-verify")
      .send({});
    
    expect(response.status).toBe(400);
  });

  it("should return 404 for non-existent registration on test-verify", async () => {
    const response = await request(app)
      .post("/api/v1/payment/test-verify")
      .send({
        registrationNumber: "PRZ-FAKE",
        status: "SUCCESS"
      });
    
    expect(response.status).toBe(404);
  });
});
