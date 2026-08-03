import {
  LayoutDashboard,
  CalendarRange,
  BookOpenCheck,
  BadgePercent,
  DoorOpen,
  KeyRound,
  BedDouble,
  Wrench,
  ScrollText,
  Settings,
} from "lucide-react";
import type { Permission } from "@/domain/permissions";

export interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: Permission;
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard:view" },
  { to: "/availability", label: "Availability", icon: CalendarRange, permission: "reservation:view" },
  { to: "/reservations", label: "Reservasi", icon: BookOpenCheck, permission: "reservation:view" },
  { to: "/approvals", label: "Approval Diskon", icon: BadgePercent, permission: "discount:approve" },
  { to: "/front-desk", label: "Front Desk", icon: DoorOpen, permission: "checkin:perform" },
  { to: "/access", label: "Kartu & Akses", icon: KeyRound, permission: "reservation:view" },
  { to: "/housekeeping", label: "Housekeeping", icon: BedDouble, permission: "housekeeping:manage" },
  { to: "/maintenance", label: "Maintenance", icon: Wrench, permission: "maintenance:manage" },
  { to: "/audit", label: "Audit Trail", icon: ScrollText, permission: "audit:view" },
  { to: "/settings", label: "Pengaturan", icon: Settings, permission: "settings:view" },
];
