import type { Role } from "../types/role";

export type Permission =
  | "reservation:create"
  | "reservation:view"
  | "reservation:cancel"
  | "payment:record"
  | "payment:verify"
  | "payment:refund"
  | "discount:request"
  | "discount:approve"
  | "hold:extend"
  | "override:dp"
  | "override:checkin"
  | "checkin:perform"
  | "checkout:perform"
  | "card:issue"
  | "doorevent:simulate"
  | "anomaly:resolve"
  | "housekeeping:manage"
  | "maintenance:manage"
  | "cashier:shift"
  | "dashboard:view"
  | "audit:view"
  | "reports:view"
  | "notification:view"
  | "settings:view";

const COMMON_STAFF: Permission[] = [
  "reservation:view",
  "dashboard:view",
  "notification:view",
];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  RECEPTIONIST: [
    ...COMMON_STAFF,
    "reservation:create",
    "discount:request",
    "payment:record",
    "checkin:perform",
    "checkout:perform",
    "card:issue",
    "doorevent:simulate",
  ],
  RESERVATION_STAFF: [
    ...COMMON_STAFF,
    "reservation:create",
    "discount:request",
    "payment:record",
  ],
  CASHIER: [...COMMON_STAFF, "payment:record", "payment:verify", "payment:refund", "cashier:shift", "card:issue"],
  FRONT_OFFICE_SUPERVISOR: [
    ...COMMON_STAFF,
    "reservation:create",
    "reservation:cancel",
    "discount:request",
    "discount:approve",
    "payment:record",
    "hold:extend",
    "override:dp",
    "override:checkin",
    "checkin:perform",
    "checkout:perform",
    "card:issue",
    "doorevent:simulate",
    "anomaly:resolve",
  ],
  HOUSEKEEPING: ["dashboard:view", "notification:view", "housekeeping:manage"],
  HOUSEKEEPING_SUPERVISOR: ["dashboard:view", "notification:view", "housekeeping:manage"],
  ENGINEERING: ["dashboard:view", "notification:view", "maintenance:manage"],
  HOTEL_MANAGER: [
    ...COMMON_STAFF,
    "reservation:create",
    "reservation:cancel",
    "discount:request",
    "discount:approve",
    "payment:record",
    "payment:refund",
    "hold:extend",
    "override:dp",
    "override:checkin",
    "checkin:perform",
    "checkout:perform",
    "card:issue",
    "doorevent:simulate",
    "anomaly:resolve",
    "audit:view",
    "reports:view",
    "settings:view",
  ],
  FINANCE_HOTEL: [...COMMON_STAFF, "payment:verify", "payment:refund", "audit:view", "reports:view"],
  HEAD_OFFICE_APPROVER: [...COMMON_STAFF, "discount:approve", "audit:view", "reports:view", "anomaly:resolve"],
  HEAD_OFFICE_FINANCE: [...COMMON_STAFF, "payment:verify", "payment:refund", "audit:view", "reports:view"],
  AUDITOR: ["dashboard:view", "audit:view", "reports:view", "notification:view"],
  SYSTEM_ADMIN: [
    ...COMMON_STAFF,
    "reservation:create",
    "reservation:cancel",
    "payment:record",
    "discount:request",
    "audit:view",
    "reports:view",
    "settings:view",
  ],
  OWNER: ["dashboard:view", "audit:view", "reports:view", "notification:view"],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
