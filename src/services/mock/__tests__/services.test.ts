import { beforeEach, describe, expect, it } from "vitest";
import { buildInitialState, guests, users } from "@/data/seed";
import * as storeModule from "@/services/mock/store";
import { frontDeskService, paymentService, reservationService, approvalService, accessService } from "@/services/mock/services";
import type { PrototypeState } from "@/data/seed";

const receptionist = users.find((u) => u.id === "u-resepsionis")!;
const finance = users.find((u) => u.id === "u-finance")!;
const approver = users.find((u) => u.id === "u-ho-approver")!;

function reset(): PrototypeState {
  const fresh = buildInitialState();
  Object.assign(storeModule.store, fresh);
  return fresh;
}

describe("integrasi layanan mock (alur PRD 7)", () => {
  beforeEach(() => reset());

  it("DP terverifikasi mengunci kamar (HOLD -> CONFIRMED + BOOKED)", async () => {
    const res = await reservationService.create(receptionist, {
      hotelId: "htl-bandung-01", guestId: guests[0]!.id, guestName: guests[0]!.fullName,
      channel: "PHONE", checkInDate: "2026-08-05", checkOutDate: "2026-08-07",
      ratePlanId: "rp-std-rack", roomIds: ["rm-101"], discountPercent: 0,
    });
    expect(res.status).toBe("HOLD");
    const pay = await paymentService.record(receptionist, { reservationId: res.id, method: "CASH", amount: 500_000, isDeposit: true });
    expect(pay.status).toBe("VERIFIED");
    const after = await reservationService.get(res.id);
    expect(after?.status).toBe("CONFIRMED");
    expect(storeModule.store.inventory.filter((i) => i.reservationId === res.id && i.status === "BOOKED").length).toBe(2);
  });

  it("transfer belum diverifikasi tidak mengunci kamar (BR-03)", async () => {
    const res = await reservationService.create(receptionist, {
      hotelId: "htl-bandung-01", guestId: guests[1]!.id, guestName: guests[1]!.fullName,
      channel: "WEBSITE", checkInDate: "2026-08-06", checkOutDate: "2026-08-07",
      ratePlanId: "rp-std-rack", roomIds: ["rm-104"], discountPercent: 0,
    });
    await paymentService.record(receptionist, { reservationId: res.id, method: "TRANSFER", amount: 500_000, isDeposit: true, reference: "x" });
    expect((await reservationService.get(res.id))?.status).not.toBe("CONFIRMED");
  });

  it("diskon di atas limit membuat permintaan approval (FR-060)", async () => {
    const res = await reservationService.create(receptionist, {
      hotelId: "htl-bandung-01", guestId: guests[3]!.id, guestName: guests[3]!.fullName,
      channel: "CORPORATE", checkInDate: "2026-08-10", checkOutDate: "2026-08-11",
      ratePlanId: "rp-ste-rack", roomIds: ["rm-301"], discountPercent: 0.2,
    });
    expect(res.status).toBe("PENDING_APPROVAL");
    const req = storeModule.store.discountRequests.find((d) => d.reservationId === res.id);
    expect(req?.requiredApproverRole).toBe("HEAD_OFFICE_APPROVER");
    await approvalService.decide(approver, req!.id, "APPROVED", "oke");
    expect((await reservationService.get(res.id))?.status).toBe("HOLD");
  });

  it("door event tanpa kartu valid membuat anomaly (BR-07)", async () => {
    const event = await accessService.simulateDoorEvent(receptionist, "UNKNOWNXYZ", "rm-105");
    expect(event.anomaly).toBe(true);
  });

  it("checkout menandai kamar DIRTY dan menonaktifkan kartu (BR-08)", async () => {
    const res = storeModule.store.reservations.find((r) => r.status === "CHECKED_IN")!;
    await frontDeskService.checkOut(receptionist, res.id);
    expect((await reservationService.get(res.id))?.status).toBe("CHECKED_OUT");
    expect(storeModule.store.cards.find((c) => c.reservationId === res.id)?.status).toBe("DEACTIVATED");
  });

  it("akses role ditolak untuk aksi di luar kewenangan", async () => {
    await expect(
      reservationService.create(finance, {
        hotelId: "htl-bandung-01", guestId: guests[0]!.id, guestName: guests[0]!.fullName,
        channel: "PHONE", checkInDate: "2026-08-05", checkOutDate: "2026-08-06",
        ratePlanId: "rp-std-rack", roomIds: ["rm-105"], discountPercent: 0,
      }),
    ).rejects.toThrow();
  });
});
