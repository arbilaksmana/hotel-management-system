import { addDays, addHours, addMinutes, format, subDays, subMinutes } from "date-fns";
import type {
  AccessCard,
  AuditLog,
  CashierShift,
  DiscountRequest,
  DoorEvent,
  HousekeepingTask,
  MaintenanceTicket,
  AppNotification,
  Payment,
  Reservation,
  RoomNightInventory,
} from "@/domain/types";
import { HOTEL_ID, rooms } from "./core";
import { eachNight, todayIso } from "@/domain/rules/dates";

const now = new Date();
const today = todayIso(now);
const tomorrow = format(addDays(now, 1), "yyyy-MM-dd");
const plus2 = format(addDays(now, 2), "yyyy-MM-dd");
const plus3 = format(addDays(now, 3), "yyyy-MM-dd");
const yesterday = format(subDays(now, 1), "yyyy-MM-dd");

let seq = 0;
const id = (p: string) => `${p}-${(++seq).toString().padStart(4, "0")}`;

const roomByNumber = (n: string) => rooms.find((r) => r.number === n)!;

export interface PrototypeState {
  reservations: Reservation[];
  inventory: RoomNightInventory[];
  payments: Payment[];
  discountRequests: DiscountRequest[];
  cards: AccessCard[];
  doorEvents: DoorEvent[];
  housekeeping: HousekeepingTask[];
  maintenance: MaintenanceTicket[];
  notifications: AppNotification[];
  audit: AuditLog[];
  shifts: CashierShift[];
}

function inv(roomId: string, date: string, status: RoomNightInventory["status"], reservationId?: string, reason?: string): RoomNightInventory {
  return { id: id("inv"), hotelId: HOTEL_ID, roomId, date, status, reservationId, reason };
}

function invForStay(roomNumber: string, ci: string, co: string, status: RoomNightInventory["status"], reservationId: string): RoomNightInventory[] {
  const room = roomByNumber(roomNumber);
  return eachNight(ci, co).map((d) => inv(room.id, d, status, reservationId));
}

function reservation(partial: Partial<Reservation> & Pick<Reservation, "guestId" | "guestName" | "checkInDate" | "checkOutDate" | "ratePlanId" | "rooms" | "status">): Reservation {
  const base = partial.rooms.reduce((sum, r) => {
    const rt = rooms.find((rm) => rm.id === r.roomId)!.roomTypeId;
    const rate = rateForNight(rt, partial.ratePlanId!);
    return sum + rate;
  }, 0);
  const nights = eachNight(partial.checkInDate, partial.checkOutDate).length;
  const baseTotal = base * nights;
  const discount = partial.discountPercent ?? 0;
  const total = Math.round(baseTotal * (1 - discount));
  return {
    id: id("rsv"),
    hotelId: HOTEL_ID,
    bookingCode: partial.bookingCode ?? `BK-${String(seq).padStart(5, "0")}`,
    channel: partial.channel ?? "WALK_IN",
    discountPercent: discount,
    baseRateTotal: baseTotal,
    totalAmount: total,
    paidAmount: partial.paidAmount ?? 0,
    nights,
    createdBy: partial.createdBy ?? "u-resepsionis",
    createdAt: partial.createdAt ?? now.toISOString(),
    notes: partial.notes,
    holdExpiresAt: partial.holdExpiresAt,
    ...partial,
    guestName: partial.guestName,
    guestId: partial.guestId,
    checkInDate: partial.checkInDate,
    checkOutDate: partial.checkOutDate,
    ratePlanId: partial.ratePlanId,
    rooms: partial.rooms,
    status: partial.status,
  };
}

function rateForNight(roomTypeId: string, ratePlanId: string): number {
  const rp = ratePlans.find((r) => r.id === ratePlanId);
  if (rp && rp.roomTypeId === roomTypeId) return rp.pricePerNight;
  const fall = ratePlans.find((r) => r.roomTypeId === roomTypeId);
  return fall ? fall.pricePerNight : 0;
}

import { ratePlans } from "./core";

export function buildInitialState(): PrototypeState {
  seq = 0;

  // 1) Reservasi CONFIRMED + BOOKED untuk hari ini (calon check-in).
  const r1 = reservation({
    guestId: "g-01",
    guestName: "Andi Saputra",
    checkInDate: today,
    checkOutDate: plus2,
    ratePlanId: "rp-dlx-rack",
    rooms: [{ roomId: "rm-201", roomNumber: "201", roomTypeId: "rt-dlx", adults: 2, children: 0 }],
    status: "CONFIRMED",
    channel: "PHONE",
    paidAmount: 650_000,
  });

  // 2) Reservasi CONFIRMED + BOOKED (sudah check-in -> OCCUPIED).
  const r2 = reservation({
    guestId: "g-02",
    guestName: "Rina Marlina",
    checkInDate: yesterday,
    checkOutDate: tomorrow,
    ratePlanId: "rp-std-rack",
    rooms: [{ roomId: "rm-101", roomNumber: "101", roomTypeId: "rt-std", adults: 1, children: 1 }],
    status: "CHECKED_IN",
    channel: "WALK_IN",
    paidAmount: 450_000,
  });

  // 3) HOLD dengan expiry dekat (menunjukkan countdown).
  const r3 = reservation({
    guestId: "g-03",
    guestName: "Farhan Alwi",
    checkInDate: tomorrow,
    checkOutDate: plus3,
    ratePlanId: "rp-std-rack",
    rooms: [{ roomId: "rm-102", roomNumber: "102", roomTypeId: "rt-std", adults: 1, children: 0 }],
    status: "HOLD",
    channel: "WHATSAPP",
    holdExpiresAt: addMinutes(now, 25).toISOString(),
  });

  // 4) PENDING_APPROVAL karena diskon 20% (> limit manager, butuh HO).
  const r4 = reservation({
    guestId: "g-04",
    guestName: "PT Nusantara Jaya",
    checkInDate: plus2,
    checkOutDate: plus3,
    ratePlanId: "rp-ste-rack",
    rooms: [{ roomId: "rm-301", roomNumber: "301", roomTypeId: "rt-ste", adults: 2, children: 0 }],
    status: "PENDING_APPROVAL",
    channel: "CORPORATE",
    discountPercent: 0.2,
    notes: "Kontrak corporate tahunan.",
  });

  // 5) PENDING_PAYMENT menunggu verifikasi transfer (bentuk skenario Finance).
  const r5 = reservation({
    guestId: "g-05",
    guestName: "Siti Rahma",
    checkInDate: tomorrow,
    checkOutDate: plus2,
    ratePlanId: "rp-dlx-rack",
    rooms: [{ roomId: "rm-204", roomNumber: "204", roomTypeId: "rt-dlx", adults: 2, children: 0 }],
    status: "PENDING_PAYMENT",
    channel: "WEBSITE",
    paidAmount: 0,
    holdExpiresAt: addHours(now, 1).toISOString(),
  });

  const reservations = [r1, r2, r3, r4, r5];

  const inventory: RoomNightInventory[] = [
    ...invForStay("201", today, plus2, "BOOKED", r1.id),
    ...invForStay("101", yesterday, tomorrow, "BOOKED", r2.id).map((i) =>
      i.date === today ? { ...i, status: "OCCUPIED" as const } : i,
    ),
    ...invForStay("102", tomorrow, plus3, "HELD", r3.id),
    ...invForStay("301", plus2, plus3, "HELD", r4.id),
    // Kamar maintenance diblokir hari ini & besok.
    inv(roomByNumber("303").id, today, "BLOCKED", undefined, "Pipa bocor"),
    inv(roomByNumber("303").id, tomorrow, "BLOCKED", undefined, "Pipa bocor"),
  ];

  const payments: Payment[] = [
    {
      id: id("pay"), hotelId: HOTEL_ID, reservationId: r1.id, method: "TRANSFER", amount: 650_000,
      status: "VERIFIED", isDeposit: true, receivedBy: "u-kasir", verifiedBy: "u-finance", receiptNo: "RCP-0001",
      reference: "TRF-8821", createdAt: subDays(now, 1).toISOString(),
    },
    {
      id: id("pay"), hotelId: HOTEL_ID, reservationId: r2.id, method: "CASH", amount: 450_000,
      status: "VERIFIED", isDeposit: false, receivedBy: "u-kasir", verifiedBy: "u-kasir", receiptNo: "RCP-0002",
      createdAt: yesterday + "T09:12:00",
    },
    {
      // Bukti transfer diunggah tetapi BELUM diverifikasi (BR-03).
      id: id("pay"), hotelId: HOTEL_ID, reservationId: r5.id, method: "TRANSFER", amount: 200_000,
      status: "PENDING", isDeposit: true, receivedBy: "u-resepsionis", reference: "TRF-9920",
      proofNote: "Bukti transfer diunggah tamu", createdAt: subMinutes(now, 40).toISOString(),
    },
  ];

  const discountRequests: DiscountRequest[] = [
    {
      id: id("dsc"), hotelId: HOTEL_ID, reservationId: r4.id, requesterId: "u-resepsionis",
      requesterRole: "RECEPTIONIST", status: "PENDING", basePrice: r4.baseRateTotal, requestedPercent: 0.2,
      finalPrice: r4.totalAmount, reason: "Kontrak corporate tahunan, komitmen 200 room-night.",
      requiredApproverRole: "HEAD_OFFICE_APPROVER", createdAt: subMinutes(now, 50).toISOString(),
      slaDeadline: addHours(now, 1).toISOString(),
    },
  ];

  const cards: AccessCard[] = [
    {
      id: id("crd"), hotelId: HOTEL_ID, cardUid: "A1B2C3D4", roomId: r2.rooms[0]!.roomId, roomNumber: "101",
      reservationId: r2.id, status: "ACTIVE", issuedBy: "u-resepsionis",
      issuedAt: yesterday + "T14:05:00", validUntil: tomorrow + "T12:00:00", lastUsedAt: now.toISOString(),
    },
  ];

  const doorEvents: DoorEvent[] = [
    {
      id: id("evt"), hotelId: HOTEL_ID, eventId: "EV-1000", cardUid: "A1B2C3D4", roomId: r2.rooms[0]!.roomId,
      roomNumber: "101", eventType: "GUEST_CARD", eventTime: yesterday + "T14:06:00", deviceId: "LOCK-101",
      reservationId: r2.id, anomaly: false, severity: "INFO", note: "First entry valid",
    },
    {
      // ACCESS ANOMALY: kartu tak dikenal mencoba kamar 104.
      id: id("evt"), hotelId: HOTEL_ID, eventId: "EV-1001", cardUid: "ZZZZ0000", roomId: roomByNumber("104").id,
      roomNumber: "104", eventType: "DENIED", eventTime: subMinutes(now, 15).toISOString(), deviceId: "LOCK-104",
      anomaly: true, severity: "CRITICAL", note: "Kartu tidak dikenal, tanpa reservasi valid",
    },
  ];

  const housekeeping: HousekeepingTask[] = [
    { id: id("hk"), hotelId: HOTEL_ID, roomId: roomByNumber("103").id, roomNumber: "103", status: "DIRTY" },
    { id: id("hk"), hotelId: HOTEL_ID, roomId: roomByNumber("203").id, roomNumber: "203", status: "CLEANING", assignee: "Joko Santoso", startedAt: subMinutes(now, 20).toISOString() },
  ];

  const maintenance: MaintenanceTicket[] = [
    { id: id("mt"), hotelId: HOTEL_ID, roomId: roomByNumber("303").id, roomNumber: "303", title: "Pipa bocor di kamar mandi", priority: "HIGH", status: "IN_PROGRESS", technician: "Agus Riyanto", blockFrom: today, blockTo: tomorrow, createdAt: subDays(now, 1).toISOString() },
  ];

  const notifications: AppNotification[] = [
    { id: id("ntf"), hotelId: HOTEL_ID, toRole: "HEAD_OFFICE_APPROVER", title: "Permintaan diskon 20%", body: "PT Nusantara Jaya · Suite 301 memerlukan approval Head Office.", kind: "APPROVAL", link: "/approvals", read: false, createdAt: subMinutes(now, 50).toISOString() },
    { id: id("ntf"), hotelId: HOTEL_ID, toRole: "FRONT_OFFICE_SUPERVISOR", title: "Access anomaly kamar 104", body: "Kartu tidak dikenal mencoba membuka kamar 104.", kind: "ANOMALY", link: "/access", read: false, createdAt: subMinutes(now, 15).toISOString() },
    { id: id("ntf"), hotelId: HOTEL_ID, toRole: "FINANCE_HOTEL", title: "Verifikasi transfer", body: "Transfer Rp 200.000 untuk Siti Rahma menunggu verifikasi.", kind: "PAYMENT", link: "/reservations", read: false, createdAt: subMinutes(now, 40).toISOString() },
  ];

  const shifts: CashierShift[] = [
    { id: id("shf"), hotelId: HOTEL_ID, cashierId: "u-kasir", status: "OPEN", openingCash: 500_000, expectedCash: 950_000, openedAt: today + "T07:00:00" },
  ];

  const audit: AuditLog[] = [
    { id: id("aud"), hotelId: HOTEL_ID, actorId: "u-finance", actorName: "Mega Kusuma", actorRole: "FINANCE_HOTEL", action: "PAYMENT_VERIFIED", entity: "Payment", entityId: payments[0]!.id, after: { status: "VERIFIED" }, source: "web", createdAt: subDays(now, 1).toISOString() },
    { id: id("aud"), hotelId: HOTEL_ID, actorId: "u-resepsionis", actorName: "Sari Wulandari", actorRole: "RECEPTIONIST", action: "RESERVATION_CREATED", entity: "Reservation", entityId: r4.id, after: { status: "PENDING_APPROVAL", discount: 0.2 }, source: "web", createdAt: subMinutes(now, 50).toISOString() },
  ];

  return { reservations, inventory, payments, discountRequests, cards, doorEvents, housekeeping, maintenance, notifications, audit, shifts };
}
