import request from "supertest";
import app from "@/app";
import { prisma } from "@/infrastructure/db/client";

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Workshops API", () => {
  it("should return the active edition if one exists, or 404", async () => {
    const response = await request(app).get("/api/v1/workshops");
    expect([200, 404]).toContain(response.status);
    
    if (response.status === 200) {
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data).toHaveProperty("days");
      expect(response.body.data).toHaveProperty("workshops");
    }
  });
});
