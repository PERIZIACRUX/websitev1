import "server-only";
import { prisma } from "@/infrastructure/db/client";
import { Staff } from "@prisma/client";
import * as argon2 from "argon2";
import { logAuditEvent } from "../audit.service";
import { createStaffSession } from "./session.service";

/**
 * Initializes the first Admin user from environment variables.
 * Designed to run safely on startup without overwriting existing Admins.
 */
export async function initializeAdmin(): Promise<void> {
  const adminName = process.env.INITIAL_ADMIN_NAME;
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL;
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;

  if (!adminName || !adminEmail || !adminPassword) {
    // Missing setup variables; don't initialize
    return;
  }

  // Check if ANY admin exists
  const existingAdmin = await prisma.staff.findFirst({
    where: { role: "ADMIN" },
  });

  if (existingAdmin) {
    // Admin already exists, do nothing
    return;
  }

  // Hash password using Argon2id
  const passwordHash = await argon2.hash(adminPassword, {
    type: argon2.argon2id,
  });

  try {
    const newAdmin = await prisma.staff.create({
      data: {
        name: adminName,
        email: adminEmail,
        passwordHash,
        role: "ADMIN",
        isActive: true,
        mustChangePassword: true, // Force them to change the initial password
      },
    });

    await logAuditEvent({
      action: "CREATE_STAFF",
      entityType: "Staff",
      entityId: newAdmin.id,
      details: { role: "ADMIN", email: adminEmail, reason: "Initial setup" },
    });
  } catch (error) {
    console.error("Failed to initialize admin", error);
  }
}

/**
 * Verifies email and password.
 * Returns the Staff record and a new raw session token on success.
 * Throws an Error on failure.
 */
export async function verifyCredentials(email: string, password: string): Promise<{ staff: Staff; rawToken: string }> {
  const staff = await prisma.staff.findUnique({
    where: { email },
  });

  if (!staff) {
    throw new Error("Invalid email or password.");
  }

  if (!staff.isActive) {
    await logAuditEvent({
      action: "LOGIN_FAILED",
      entityType: "Staff",
      entityId: staff.id,
      details: { reason: "Account inactive" },
    });
    throw new Error("Invalid email or password.");
  }

  const isValidPassword = await argon2.verify(staff.passwordHash, password);

  if (!isValidPassword) {
    await logAuditEvent({
      action: "LOGIN_FAILED",
      entityType: "Staff",
      entityId: staff.id,
      details: { reason: "Invalid password" },
    });
    throw new Error("Invalid email or password.");
  }

  // Update last login
  await prisma.staff.update({
    where: { id: staff.id },
    data: { lastLoginAt: new Date() },
  });

  // Create session
  const { rawToken, session } = await createStaffSession(staff.id);

  await logAuditEvent({
    action: "LOGIN_SUCCESS",
    staffId: staff.id,
    entityType: "StaffSession",
    entityId: session.id,
  });

  return { staff, rawToken };
}

/**
 * Changes a staff member's password.
 */
export async function changePassword(staffId: string, oldPassword: string, newPassword: string): Promise<void> {
  const staff = await prisma.staff.findUnique({ where: { id: staffId } });

  if (!staff) {
    throw new Error("Staff member not found.");
  }

  const isValidPassword = await argon2.verify(staff.passwordHash, oldPassword);

  if (!isValidPassword) {
    throw new Error("Invalid current password.");
  }

  const newPasswordHash = await argon2.hash(newPassword, {
    type: argon2.argon2id,
  });

  await prisma.staff.update({
    where: { id: staffId },
    data: {
      passwordHash: newPasswordHash,
      mustChangePassword: false,
    },
  });

  await logAuditEvent({
    action: "RESET_PASSWORD",
    staffId,
    entityType: "Staff",
    entityId: staffId,
    details: { reason: "Self password change" },
  });
}
