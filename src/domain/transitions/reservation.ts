import type { ReservationStatus } from "../types/status";

// PRD 9.1 transisi status reservasi.
const ALLOWED: Record<ReservationStatus, ReservationStatus[]> = {
  DRAFT: ["HOLD", "CANCELLED"],
  HOLD: ["PENDING_PAYMENT", "PENDING_APPROVAL", "PARTIALLY_PAID", "CONFIRMED", "EXPIRED", "CANCELLED"],
  PENDING_PAYMENT: ["PARTIALLY_PAID", "CONFIRMED", "EXPIRED", "CANCELLED"],
  PENDING_APPROVAL: ["HOLD", "REJECTED", "EXPIRED", "CANCELLED"],
  PARTIALLY_PAID: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["CHECKED_IN", "CANCELLED", "NO_SHOW"],
  CHECKED_IN: ["CHECKED_OUT"],
  CHECKED_OUT: [],
  CANCELLED: [],
  NO_SHOW: [],
  EXPIRED: [],
  REJECTED: [],
};

export function canTransitionReservation(from: ReservationStatus, to: ReservationStatus): boolean {
  return ALLOWED[from]?.includes(to) ?? false;
}

export function assertTransition(from: ReservationStatus, to: ReservationStatus): void {
  if (!canTransitionReservation(from, to)) {
    throw new Error(`Transisi reservasi tidak valid: ${from} -> ${to}`);
  }
}

export const ACTIVE_RESERVATION_STATUSES: ReservationStatus[] = [
  "HOLD",
  "PENDING_PAYMENT",
  "PENDING_APPROVAL",
  "PARTIALLY_PAID",
  "CONFIRMED",
  "CHECKED_IN",
];

