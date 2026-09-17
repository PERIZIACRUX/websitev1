
import { prisma } from "@/infrastructure/db/client";
import * as argon2 from "argon2";
import { logAuditEvent } from "../audit.service";
import { revokeAllStaffSessions } from "./session.service";
import { StaffRole } from "@prisma/client";

export interface CreateStaffData {
  name: string;
  email: string;
}

/**
 * Retrieves all VOLUNTEER accounts, omitting sensitive fields.
 */
export async function getAllVolunteers() {
  return await prisma.staff.findMany({
    where: { role: "VOLUNTEER" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}


/**
 * Validates that the target staff is a VOLUNTEER and not the calling admin.
 */
async function validateTargetVolunteer(adminId: string, targetStaffId: string) {
  if (adminId === targetStaffId) {
    throw new Error("You cannot perform this action on yourself.");
  }
  const target = await prisma.staff.findUnique({ where: { id: targetStaffId } });
  if (!target) {
    throw new Error("Staff member not found.");
  }
  if (target.role !== "VOLUNTEER") {
    throw new Error("Action denied. Target is not a volunteer.");
  }
  return target;
}

/**
 * Creates a new volunteer account.
 * ONLY Admin can call this (must be verified at caller level).
 */
export async function createStaff(adminId: string, data: CreateStaffData) {
  // Use a default strong temporary password
  const tempPassword = Math.random().toString(36).slice(-10) + "A1!";

  const passwordHash = await argon2.hash(tempPassword, {
    type: argon2.argon2id,
  });

  const newStaff = await prisma.staff.create({
    data: {
      name: data.name,
      email: data.email,
      role: "VOLUNTEER", // Forced by requirements
      passwordHash,
      isActive: true,
      mustChangePassword: true, // Force change on first login
    },
    select: {
      id: true, name: true, email: true, role: true, isActive: true, createdAt: true,
    }
  });

  await logAuditEvent({
    action: "CREATE_STAFF",
    staffId: adminId,
    entityType: "Staff",
    entityId: newStaff.id,
    details: { role: "VOLUNTEER", email: data.email },
  });

  return { newStaff, tempPassword };
}

/**
 * Deactivates a volunteer and revokes all their active sessions.
 */
export async function deactivateStaff(adminId: string, targetStaffId: string) {
  await validateTargetVolunteer(adminId, targetStaffId);

  const target = await prisma.staff.update({
    where: { id: targetStaffId },
    data: { isActive: false },
    select: { id: true, isActive: true }
  });

  await revokeAllStaffSessions(targetStaffId);

  await logAuditEvent({
    action: "DEACTIVATE_STAFF",
    staffId: adminId,
    entityType: "Staff",
    entityId: targetStaffId,
  });

  return target;
}

/**
 * Reactivates a volunteer.
 */
export async function reactivateStaff(adminId: string, targetStaffId: string) {
  await validateTargetVolunteer(adminId, targetStaffId);

  const target = await prisma.staff.update({
    where: { id: targetStaffId },
    data: { isActive: true },
    select: { id: true, isActive: true }
  });

  await logAuditEvent({
    action: "REACTIVATE_STAFF",
    staffId: adminId,
    entityType: "Staff",
    entityId: targetStaffId,
  });

  return target;
}

/**
 * Admin forces a password reset for a volunteer.
 */
export async function resetVolunteerPassword(adminId: string, targetStaffId: string, newTempPassword?: string) {
  await validateTargetVolunteer(adminId, targetStaffId);

  const tempPassword = newTempPassword || (Math.random().toString(36).slice(-10) + "B2!");

  const passwordHash = await argon2.hash(tempPassword, {
    type: argon2.argon2id,
  });

  await prisma.staff.update({
    where: { id: targetStaffId },
    data: {
      passwordHash,
      mustChangePassword: true, // Force them to change the temporary password
    },
  });

  await revokeAllStaffSessions(targetStaffId);

  await logAuditEvent({
    action: "RESET_PASSWORD",
    staffId: adminId,
    entityType: "Staff",
    entityId: targetStaffId,
    details: { reason: "Admin forced reset" },
  });

  return tempPassword;
}
