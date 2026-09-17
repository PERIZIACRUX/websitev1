import { StaffRole, RegistrationStatus } from "../types/enums";

export interface StaffDTO {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  isActive: boolean;
  mustChangePassword?: boolean;
}

export interface ParticipantSummaryDTO {
  id: string;
  registrationId: string;
  registrationNumber: string;
  fullName: string;
  email: string;
  status: RegistrationStatus;
}

export interface VolunteerDashboardStatsDTO {
  registeredCount: number;
  checkedInCount: number;
  breakfastCount: number;
  lunchCount: number;
}

export interface AdminDashboardStatsDTO extends VolunteerDashboardStatsDTO {
  totalVolunteers: number;
  activeVolunteers: number;
  inactiveVolunteers: number;
}

export interface QrTokenPayloadDTO {
  registrationId: string;
  registrationNumber: string;
  issuedAt: number;
  sig: string;
}

export type ApiResponseDTO<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

export interface PaginationParamsDTO {
  page: number;
  pageSize: number;
}

export interface PaginatedResultDTO<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
