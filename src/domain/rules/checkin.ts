import type { Reservation, PolicyConfig } from "../types/operations";
import type { Room } from "../types/entities";
import type { Role } from "../types/role";
import { dpSatisfied } from "./dp";

export interface CheckinEligibility {
  ok: boolean;
  blockers: string[];
}

// FR-070: kamar CLEAN/INSPECTED, pembayaran sesuai, identitas lengkap, approval selesai.
export function checkCheckinEligibility(args: {
  reservation: Reservation;
  room: Room;
  pricePerNight: number;
  policy: PolicyConfig;
  guestIdComplete: boolean;
  overrideRole?: Role;
}): CheckinEligibility {
  const { reservation, room, pricePerNight, policy, guestIdComplete } = args;
  const blockers: string[] = [];

  if (!["CONFIRMED", "PARTIALLY_PAID"].includes(reservation.status)) {
    blockers.push("Reservasi belum berstatus CONFIRMED.");
  }
  const roomOk = room.operationalStatus === "CLEAN" || room.operationalStatus === "INSPECTED";
  if (!roomOk) blockers.push(`Kamar ${room.number} berstatus ${room.operationalStatus}.`);
  if (!guestIdComplete) blockers.push("Identitas tamu belum lengkap.");
  if (!dpSatisfied(reservation.totalAmount, pricePerNight, reservation.paidAmount, policy)) {
    blockers.push("DP belum memenuhi kebijakan.");
  }

  return { ok: blockers.length === 0, blockers };
}
