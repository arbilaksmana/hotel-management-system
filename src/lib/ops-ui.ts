import type { Reservation, RoomNightInventory, RoomNightStatus } from "@/domain/types";

export type FrontDeskBuckets = {
  arrivals: Reservation[];
  departures: Reservation[];
  inHouse: Reservation[];
};

const ARRIVAL_STATUSES = new Set(["CONFIRMED", "PARTIALLY_PAID"]);

/** SOLD statuses count toward rack occupancy (guest committed or in house). */
const OCCUPIED_STATUSES = new Set<RoomNightStatus>(["BOOKED", "OCCUPIED", "HELD"]);

/**
 * Split reservations into front-desk work queues for a given operational day.
 * Presentation-only: does not mutate input.
 */
export function frontDeskBuckets(reservations: Reservation[], today: string): FrontDeskBuckets {
  const arrivals: Reservation[] = [];
  const departures: Reservation[] = [];
  const inHouse: Reservation[] = [];

  for (const r of reservations) {
    if (r.checkInDate === today && ARRIVAL_STATUSES.has(r.status)) {
      arrivals.push(r);
    }
    if (r.status === "CHECKED_IN") {
      inHouse.push(r);
      if (r.checkOutDate === today) {
        departures.push(r);
      }
    }
  }

  return { arrivals, departures, inHouse };
}

/**
 * Per-date occupancy percent (0–100) from room-night inventory.
 * Denominator is `roomCount` (active rooms on the rack). Zero rooms → 0%.
 */
export function occupancyByDate(
  inventory: RoomNightInventory[],
  dates: string[],
  roomCount: number,
): Record<string, number> {
  const out: Record<string, number> = {};
  if (roomCount <= 0) {
    for (const d of dates) out[d] = 0;
    return out;
  }

  const soldByDate = new Map<string, number>();
  for (const row of inventory) {
    if (!OCCUPIED_STATUSES.has(row.status)) continue;
    soldByDate.set(row.date, (soldByDate.get(row.date) ?? 0) + 1);
  }

  for (const d of dates) {
    const sold = soldByDate.get(d) ?? 0;
    out[d] = Math.round((sold / roomCount) * 100);
  }
  return out;
}
