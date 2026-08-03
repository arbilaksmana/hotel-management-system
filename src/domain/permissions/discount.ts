import type { Role } from "../types/role";

// PRD 4.2 Rekomendasi Batas Diskon.
export const DISCOUNT_LIMITS: Record<Role, number> = {
  RECEPTIONIST: 0.05,
  RESERVATION_STAFF: 0.05,
  CASHIER: 0,
  FRONT_OFFICE_SUPERVISOR: 0.1,
  HOUSEKEEPING: 0,
  HOUSEKEEPING_SUPERVISOR: 0,
  ENGINEERING: 0,
  HOTEL_MANAGER: 0.15,
  FINANCE_HOTEL: 0,
  HEAD_OFFICE_APPROVER: 1,
  HEAD_OFFICE_FINANCE: 0,
  AUDITOR: 0,
  SYSTEM_ADMIN: 0.15,
  OWNER: 0,
};

export function discountLimitFor(role: Role): number {
  return DISCOUNT_LIMITS[role] ?? 0;
}

// Role approver yang disyaratkan ketika diskon melebihi limit requester.
export function requiredApproverFor(percent: number, requesterRole: Role): Role {
  const limit = DISCOUNT_LIMITS[requesterRole] ?? 0;
  if (percent <= limit) return requesterRole;
  if (percent <= 0.1) return "FRONT_OFFICE_SUPERVISOR";
  if (percent <= 0.15) return "HOTEL_MANAGER";
  return "HEAD_OFFICE_APPROVER";
}
