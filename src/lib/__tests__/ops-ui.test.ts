import { describe, expect, it } from "vitest";
import { frontDeskBuckets, occupancyByDate } from "@/lib/ops-ui";
import type { Reservation, RoomNightInventory } from "@/domain/types";

function res(partial: Partial<Reservation> & Pick<Reservation, "id" | "status" | "checkInDate" | "checkOutDate">): Reservation {
  return {
    hotelId: "h1",
    bookingCode: "B",
    guestId: "g1",
    guestName: "Tamu",
    channel: "WALK_IN",
    nights: 1,
    rooms: [],
    ratePlanId: "rp",
    baseRateTotal: 0,
    discountPercent: 0,
    totalAmount: 0,
    paidAmount: 0,
    createdBy: "u1",
    createdAt: "2026-01-01T00:00:00Z",
    ...partial,
  };
}

describe("frontDeskBuckets", () => {
  const today = "2026-08-04";

  it("memisahkan kedatangan, keberangkatan, dan in-house", () => {
    const list = [
      res({ id: "a1", status: "CONFIRMED", checkInDate: today, checkOutDate: "2026-08-05" }),
      res({ id: "a2", status: "PARTIALLY_PAID", checkInDate: today, checkOutDate: "2026-08-06" }),
      res({ id: "d1", status: "CHECKED_IN", checkInDate: "2026-08-01", checkOutDate: today }),
      res({ id: "ih", status: "CHECKED_IN", checkInDate: "2026-08-02", checkOutDate: "2026-08-07" }),
      res({ id: "x", status: "HOLD", checkInDate: today, checkOutDate: "2026-08-05" }),
    ];
    const buckets = frontDeskBuckets(list, today);
    expect(buckets.arrivals.map((r) => r.id)).toEqual(["a1", "a2"]);
    expect(buckets.departures.map((r) => r.id)).toEqual(["d1"]);
    expect(buckets.inHouse.map((r) => r.id)).toEqual(["d1", "ih"]);
  });

  it("mengabaikan kedatangan yang bukan CONFIRMED/PARTIALLY_PAID", () => {
    const buckets = frontDeskBuckets(
      [res({ id: "c", status: "CHECKED_IN", checkInDate: today, checkOutDate: "2026-08-05" })],
      today,
    );
    expect(buckets.arrivals).toHaveLength(0);
    expect(buckets.inHouse).toHaveLength(1);
  });
});

describe("occupancyByDate", () => {
  it("menghitung persen okupansi per tanggal dari inventory", () => {
    const dates = ["2026-08-04", "2026-08-05"];
    const inventory: RoomNightInventory[] = [
      { id: "1", hotelId: "h1", roomId: "r1", date: "2026-08-04", status: "OCCUPIED" },
      { id: "2", hotelId: "h1", roomId: "r2", date: "2026-08-04", status: "BOOKED" },
      { id: "3", hotelId: "h1", roomId: "r3", date: "2026-08-04", status: "AVAILABLE" },
      { id: "4", hotelId: "h1", roomId: "r4", date: "2026-08-04", status: "HELD" },
      { id: "5", hotelId: "h1", roomId: "r1", date: "2026-08-05", status: "AVAILABLE" },
      { id: "6", hotelId: "h1", roomId: "r2", date: "2026-08-05", status: "BLOCKED" },
    ];
    // 4 rooms: day1 sold OCCUPIED+BOOKED+HELD = 3 → 75%; day2 = 0 → 0%
    expect(occupancyByDate(inventory, dates, 4)).toEqual({
      "2026-08-04": 75,
      "2026-08-05": 0,
    });
  });

  it("mengembalikan 0% bila roomCount nol", () => {
    expect(occupancyByDate([], ["2026-08-04"], 0)).toEqual({ "2026-08-04": 0 });
  });
});
