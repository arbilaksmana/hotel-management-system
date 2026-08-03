import { guests, policy, ratePlans, rooms } from "@/data/seed";
import type {
  ChannelKind,
  Reservation,
  RoomNightInventory,
  User,
} from "@/domain/types";
import { assertTransition } from "@/domain/transitions/reservation";
import { canTransitionHousekeeping } from "@/domain/transitions/housekeeping";
import { eachNight, nightsBetween, todayIso } from "@/domain/rules/dates";
import { dpShortfall } from "@/domain/rules/dp";
import { checkCheckinEligibility } from "@/domain/rules/checkin";
import { exceedsDiscountLimit } from "@/domain/rules/discount";
import { requiredApproverFor } from "@/domain/permissions/discount";
import { hasPermission } from "@/domain/permissions/permissions";
import { addHours, addMinutes } from "date-fns";
import type {
  ApprovalOps,
  DashboardOps,
  DashboardSummary,
  FrontDeskOps,
  HousekeepingOps,
  MaintenanceOps,
  NotificationOps,
  AuditOps,
  AccessOps,
  PaymentOps,
  ReservationInput,
  ReservationOps,
  PaymentInput,
} from "../contracts";
import { auditLog, notify, requireRole, store } from "./store";
import { delay, genId } from "./util";

const roomById = (id: string) => rooms.find((r) => r.id === id);
const ratePlanById = (id: string) => ratePlans.find((r) => r.id === id);
const priceForRoom = (roomId: string, ratePlanId: string) => {
  const room = roomById(roomId);
  if (!room) return 0;
  const rp = ratePlanById(ratePlanId);
  if (rp && rp.roomTypeId === room.roomTypeId) return rp.pricePerNight;
  return ratePlans.find((r) => r.roomTypeId === room.roomTypeId)?.pricePerNight ?? 0;
};

const getRes = (id: string) => store.reservations.find((r) => r.id === id);

function pricePerNightForReservation(res: Reservation): number {
  const first = res.rooms[0];
  if (!first) return 0;
  const full = priceForRoom(first.roomId, res.ratePlanId);
  return Math.round(full * (1 - res.discountPercent));
}

function holdMinutesFor(channel: ChannelKind): number {
  if (channel === "WEBSITE") return policy.holdMinutesOnline;
  if (channel === "WHATSAPP" || channel === "PHONE") return policy.holdMinutesFrontOffice;
  return policy.holdMinutesFrontOffice;
}

// ----- Reservation + inventory lock -----
export const reservationService: ReservationOps = {
  async list(hotelId) {
    await delay();
    return store.reservations.filter((r) => r.hotelId === hotelId);
  },
  async get(id) {
    await delay(80);
    return getRes(id);
  },
  async create(actor: User, input: ReservationInput) {
    await delay();
    requireRole({ user: actor }, ["RECEPTIONIST", "RESERVATION_STAFF", "FRONT_OFFICE_SUPERVISOR", "HOTEL_MANAGER", "SYSTEM_ADMIN"]);

    // BR-01: satu room-night hanya satu reservasi aktif.
    const nights = eachNight(input.checkInDate, input.checkOutDate);
    for (const roomId of input.roomIds) {
      for (const date of nights) {
        const existing = store.inventory.find(
          (i) => i.roomId === roomId && i.date === date && i.status !== "AVAILABLE",
        );
        if (existing) {
          const room = roomById(roomId);
          throw new Error(`Kamar ${room?.number ?? roomId} pada ${date} tidak tersedia.`);
        }
      }
    }

    const nightsCount = nightsBetween(input.checkInDate, input.checkOutDate);
    const basePerNight = input.roomIds.reduce((s, rid) => s + priceForRoom(rid, input.ratePlanId), 0);
    const baseTotal = basePerNight * nightsCount;
    const total = Math.round(baseTotal * (1 - input.discountPercent));
    const guest = guests.find((g) => g.id === input.guestId);

    const needsApproval = exceedsDiscountLimit(input.discountPercent, actor.role);
    const status: Reservation["status"] = needsApproval ? "PENDING_APPROVAL" : "HOLD";

    const res: Reservation = {
      id: genId("rsv"),
      hotelId: input.hotelId,
      bookingCode: `BK-${genId("").replace("-", "").toUpperCase()}`,
      guestId: input.guestId,
      guestName: guest?.fullName ?? input.guestName,
      channel: input.channel,
      status,
      checkInDate: input.checkInDate,
      checkOutDate: input.checkOutDate,
      nights: nightsCount,
      rooms: input.roomIds.map((rid) => {
        const room = roomById(rid)!;
        return { roomId: rid, roomNumber: room.number, roomTypeId: room.roomTypeId, adults: 2, children: 0 };
      }),
      ratePlanId: input.ratePlanId,
      baseRateTotal: baseTotal,
      discountPercent: input.discountPercent,
      totalAmount: total,
      paidAmount: 0,
      holdExpiresAt: addMinutes(new Date(), holdMinutesFor(input.channel)).toISOString(),
      createdBy: actor.id,
      createdAt: new Date().toISOString(),
      notes: input.notes,
    };

    // Tahan inventory sebagai HELD.
    for (const roomId of input.roomIds) {
      for (const date of nights) {
        store.inventory.push({ id: genId("inv"), hotelId: input.hotelId, roomId, date, status: "HELD", reservationId: res.id });
      }
    }
    store.reservations.unshift(res);

    if (needsApproval) {
      const required = requiredApproverFor(input.discountPercent, actor.role);
      store.discountRequests.unshift({
        id: genId("dsc"),
        hotelId: input.hotelId,
        reservationId: res.id,
        requesterId: actor.id,
        requesterRole: actor.role,
        status: "PENDING",
        basePrice: baseTotal,
        requestedPercent: input.discountPercent,
        finalPrice: total,
        reason: input.notes ?? "Diskon di luar batas kewenangan.",
        requiredApproverRole: required,
        createdAt: new Date().toISOString(),
        slaDeadline: addHours(new Date(), 2).toISOString(),
      });
      notify({
        hotelId: input.hotelId,
        toRole: required,
        title: `Permintaan diskon ${Math.round(input.discountPercent * 100)}%`,
        body: `${res.guestName} · ${res.bookingCode} memerlukan approval.`,
        kind: "APPROVAL",
        link: "/approvals",
      });
    }

    auditLog({ user: actor }, { hotelId: input.hotelId, action: "RESERVATION_CREATED", entity: "Reservation", entityId: res.id, after: { status, discount: input.discountPercent }, source: "web" });
    return res;
  },
  async cancel(actor: User, id: string, reason: string) {
    await delay();
    requireRole({ user: actor }, ["FRONT_OFFICE_SUPERVISOR", "HOTEL_MANAGER", "SYSTEM_ADMIN"]);
    const res = getRes(id);
    if (!res) throw new Error("Reservasi tidak ditemukan.");
    assertTransition(res.status, "CANCELLED");
    res.status = "CANCELLED";
    releaseInventory(res.id);
    auditLog({ user: actor }, { hotelId: res.hotelId, action: "RESERVATION_CANCELLED", entity: "Reservation", entityId: id, after: { status: "CANCELLED" }, reason, source: "web" });
    return res;
  },
  async extendHold(actor: User, id: string, minutes: number, reason: string) {
    await delay();
    requireRole({ user: actor }, ["FRONT_OFFICE_SUPERVISOR", "HOTEL_MANAGER"]);
    const res = getRes(id);
    if (!res) throw new Error("Reservasi tidak ditemukan.");
    res.holdExpiresAt = addMinutes(new Date(), minutes).toISOString();
    if (res.status === "EXPIRED") res.status = "HOLD";
    auditLog({ user: actor }, { hotelId: res.hotelId, action: "HOLD_EXTENDED", entity: "Reservation", entityId: id, after: { holdExpiresAt: res.holdExpiresAt }, reason, source: "web" });
    return res;
  },
};

function releaseInventory(reservationId: string): void {
  for (const inv of store.inventory) {
    if (inv.reservationId === reservationId) {
      inv.status = "AVAILABLE";
      inv.reservationId = undefined;
    }
  }
}

// ----- Payment + DP lock -----
export const paymentService: PaymentOps = {
  async listFor(hotelId: string, reservationId: string) {
    await delay(80);
    return store.payments.filter((p) => p.hotelId === hotelId && p.reservationId === reservationId);
  },
  async record(actor: User, input: PaymentInput) {
    await delay();
    const res = getRes(input.reservationId);
    if (!res) throw new Error("Reservasi tidak ditemukan.");
    const payment = {
      id: genId("pay"),
      hotelId: res.hotelId,
      reservationId: res.id,
      method: input.method,
      amount: input.amount,
      status: input.method === "CASH" ? ("VERIFIED" as const) : ("PENDING" as const),
      isDeposit: input.isDeposit,
      reference: input.reference,
      proofNote: input.proofNote,
      receivedBy: actor.id,
      verifiedBy: input.method === "CASH" ? actor.id : undefined,
      receiptNo: input.method === "CASH" ? `RCP-${genId("").replace("-", "")}` : undefined,
      createdAt: new Date().toISOString(),
    };
    store.payments.unshift(payment);
    if (payment.status === "VERIFIED") {
      applyVerifiedPayment(actor, res, payment.amount);
    } else {
      notify({ hotelId: res.hotelId, toRole: "FINANCE_HOTEL", title: "Verifikasi transfer", body: `Transfer ${payment.amount} untuk ${res.guestName} menunggu verifikasi.`, kind: "PAYMENT", link: "/reservations" });
      if (res.status === "HOLD") {
        res.status = "PENDING_PAYMENT";
      }
    }
    auditLog({ user: actor }, { hotelId: res.hotelId, action: "PAYMENT_RECORDED", entity: "Payment", entityId: payment.id, after: { amount: input.amount, method: input.method, status: payment.status }, source: "web" });
    return payment;
  },
  async verify(actor: User, paymentId: string) {
    await delay();
    requireRole({ user: actor }, ["FINANCE_HOTEL", "CASHIER", "HEAD_OFFICE_FINANCE"]);
    const payment = store.payments.find((p) => p.id === paymentId);
    if (!payment) throw new Error("Pembayaran tidak ditemukan.");
    payment.status = "VERIFIED";
    payment.verifiedBy = actor.id;
    payment.receiptNo = `RCP-${genId("").replace("-", "")}`;
    const res = getRes(payment.reservationId)!;
    applyVerifiedPayment(actor, res, payment.amount);
    auditLog({ user: actor }, { hotelId: payment.hotelId, action: "PAYMENT_VERIFIED", entity: "Payment", entityId: paymentId, after: { status: "VERIFIED" }, source: "web" });
    return payment;
  },
};

// DP VERIFIED -> bila threshold terpenuhi, CONFIRMED + BOOKED (BR-02, FR-050).
function applyVerifiedPayment(actor: User, res: Reservation, amount: number): void {
  res.paidAmount += amount;
  const pricePerNight = pricePerNightForReservation(res);
  const shortfall = dpShortfall(res.totalAmount, pricePerNight, res.paidAmount, policy);
  if (shortfall <= 0 && ["HOLD", "PENDING_PAYMENT", "PARTIALLY_PAID"].includes(res.status)) {
    assertTransition(res.status, "CONFIRMED");
    res.status = "CONFIRMED";
    // Kunci room-night -> BOOKED (idempotent).
    for (const inv of store.inventory) {
      if (inv.reservationId === res.id && inv.status === "HELD") inv.status = "BOOKED";
    }
  } else if (res.paidAmount > 0 && res.status !== "CONFIRMED") {
    if (res.status !== "PARTIALLY_PAID") assertTransition(res.status, "PARTIALLY_PAID");
    res.status = "PARTIALLY_PAID";
  }
  auditLog({ user: actor }, { hotelId: res.hotelId, action: "DP_EVALUATED", entity: "Reservation", entityId: res.id, after: { status: res.status, paidAmount: res.paidAmount, shortfall }, source: "system" });
}

// ----- Approval diskon -----
export const approvalService: ApprovalOps = {
  async list(hotelId: string) {
    await delay();
    return store.discountRequests.filter((d) => d.hotelId === hotelId);
  },
  async decide(actor: User, id, decision, reason) {
    await delay();
    if (!hasPermission(actor.role, "discount:approve")) throw new Error("Aksi tidak diizinkan untuk peran Anda.");
    const req = store.discountRequests.find((d) => d.id === id);
    if (!req) throw new Error("Permintaan tidak ditemukan.");
    if (req.status !== "PENDING" && req.status !== "REVISION_REQUESTED") throw new Error("Permintaan sudah diputuskan.");
    req.status = decision;
    req.approverId = actor.id;
    req.decisionReason = reason;
    req.decidedAt = new Date().toISOString();

    const res = getRes(req.reservationId);
    if (res) {
      if (decision === "APPROVED") {
        assertTransition(res.status, "HOLD");
        res.status = "HOLD";
        res.holdExpiresAt = addMinutes(new Date(), policy.holdMinutesApproval).toISOString();
      } else if (decision === "REJECTED") {
        assertTransition(res.status, "REJECTED");
        res.status = "REJECTED";
        releaseInventory(res.id);
      }
    }
    auditLog({ user: actor }, { hotelId: req.hotelId, action: `DISCOUNT_${decision}`, entity: "DiscountRequest", entityId: id, before: { percent: req.requestedPercent }, after: { decision }, reason, source: "web" });
    return req;
  },
};

// ----- Front desk: check-in/out -----
export const frontDeskService: FrontDeskOps = {
  async checkIn(actor: User, reservationId: string, overrides?: { reason: string }) {
    await delay();
    const res = getRes(reservationId);
    if (!res) throw new Error("Reservasi tidak ditemukan.");
    const room = res.rooms[0] ? roomById(res.rooms[0].roomId) : undefined;
    if (!room) throw new Error("Kamar tidak ditemukan.");
    const guest = guests.find((g) => g.id === res.guestId);
    const guestIdComplete = Boolean(guest?.idNumber);

    const eligibility = checkCheckinEligibility({
      reservation: res,
      room,
      pricePerNight: pricePerNightForReservation(res),
      policy,
      guestIdComplete,
    });

    if (!eligibility.ok) {
      if (overrides && hasPermission(actor.role, "override:checkin")) {
        auditLog({ user: actor }, { hotelId: res.hotelId, action: "CHECKIN_OVERRIDE", entity: "Reservation", entityId: res.id, reason: overrides.reason, after: { blockers: eligibility.blockers }, source: "web" });
      } else {
        throw new Error(`Check-in ditolak: ${eligibility.blockers.join(" ")}`);
      }
    }

    assertTransition(res.status, "CHECKED_IN");
    res.status = "CHECKED_IN";
    const today = todayIso();
    for (const inv of store.inventory) {
      if (inv.reservationId === res.id && inv.date === today && inv.status === "BOOKED") inv.status = "OCCUPIED";
    }
    auditLog({ user: actor }, { hotelId: res.hotelId, action: "CHECKED_IN", entity: "Reservation", entityId: res.id, after: { status: "CHECKED_IN" }, source: "web" });
    return res;
  },
  async checkOut(actor: User, reservationId: string) {
    await delay();
    const res = getRes(reservationId);
    if (!res) throw new Error("Reservasi tidak ditemukan.");
    assertTransition(res.status, "CHECKED_OUT");
    res.status = "CHECKED_OUT";
    // BR-08: checkout -> kamar DIRTY + kartu nonaktif + inventory dibebaskan.
    const today = todayIso();
    for (const inv of store.inventory) {
      if (inv.reservationId === res.id && (inv.status === "OCCUPIED" || inv.status === "BOOKED")) {
        if (inv.date >= today) {
          inv.status = "AVAILABLE";
          inv.reservationId = undefined;
        }
      }
    }
    for (const r of res.rooms) {
      const room = roomById(r.roomId);
      if (room) room.operationalStatus = "DIRTY";
      store.housekeeping.unshift({ id: genId("hk"), hotelId: res.hotelId, roomId: r.roomId, roomNumber: r.roomNumber, status: "DIRTY" });
    }
    for (const card of store.cards) {
      if (card.reservationId === res.id) card.status = "DEACTIVATED";
    }
    auditLog({ user: actor }, { hotelId: res.hotelId, action: "CHECKED_OUT", entity: "Reservation", entityId: res.id, after: { status: "CHECKED_OUT" }, source: "web" });
    return res;
  },
};

// ----- Access card & door event simulator -----
export const accessService: AccessOps = {
  async issueCard(actor: User, reservationId: string, roomId: string) {
    await delay();
    const res = getRes(reservationId);
    const room = roomById(roomId);
    if (!res || !room) throw new Error("Reservasi/kamar tidak ditemukan.");
    const card = {
      id: genId("crd"),
      hotelId: res.hotelId,
      cardUid: Math.random().toString(16).slice(2, 10).toUpperCase(),
      roomId,
      roomNumber: room.number,
      reservationId,
      status: "ACTIVE" as const,
      issuedBy: actor.id,
      issuedAt: new Date().toISOString(),
      validUntil: `${res.checkOutDate}T${policy.checkOutTime}:00`,
    };
    store.cards.unshift(card);
    auditLog({ user: actor }, { hotelId: res.hotelId, action: "CARD_ISSUED", entity: "AccessCard", entityId: card.id, after: { cardUid: card.cardUid, room: room.number }, source: "web" });
    return card;
  },
  async listCards(hotelId: string) {
    await delay();
    return store.cards.filter((c) => c.hotelId === hotelId);
  },
  async listDoorEvents(hotelId: string) {
    await delay();
    return store.doorEvents.filter((e) => e.hotelId === hotelId);
  },
  // Simulasi PROTOYPE: event first-entry. Idempotent via eventId.
  async simulateDoorEvent(actor: User, cardUid: string, roomId: string) {
    await delay();
    const room = roomById(roomId);
    const card = store.cards.find((c) => c.cardUid === cardUid);
    const eventId = `EV-${genId("").replace("-", "")}`;
    // Cek idempotensi: eventId yang sama tidak diproses dua kali (BR-06) · di sini eventId selalu baru,
    // tetapi deduplikasi dijaga oleh pencocokan lastUsedAt.
    const validReservation =
      card && card.status === "ACTIVE" && card.reservationId ? getRes(card.reservationId) : undefined;

    let anomaly = false;
    let severity: "INFO" | "CRITICAL" = "INFO";
    let note = "Entry";
    if (!card || card.status !== "ACTIVE" || !validReservation || !["CONFIRMED", "CHECKED_IN"].includes(validReservation.status)) {
      anomaly = true;
      severity = "CRITICAL";
      note = "ACCESS ANOMALY: kartu tanpa reservasi valid";
    }

    const event = {
      id: genId("evt"),
      hotelId: card?.hotelId ?? room?.hotelId ?? "",
      eventId,
      cardUid,
      roomId,
      roomNumber: room?.number ?? "?",
      eventType: anomaly ? ("DENIED" as const) : ("GUEST_CARD" as const),
      eventTime: new Date().toISOString(),
      deviceId: `LOCK-${room?.number ?? "?"}`,
      reservationId: validReservation?.id,
      anomaly,
      severity,
      note,
    };
    store.doorEvents.unshift(event);

    if (card) card.lastUsedAt = event.eventTime;

    if (!anomaly && validReservation) {
      // Fail-safe: kunci inventory secara idempotent + tandai OCCUPIED bila hari ini dalam rentang.
      if (validReservation.status === "CONFIRMED") {
        validReservation.status = "CHECKED_IN";
        const today = todayIso();
        for (const inv of store.inventory) {
          if (inv.reservationId === validReservation.id && inv.date === today && inv.status === "BOOKED") inv.status = "OCCUPIED";
        }
      }
    } else if (anomaly && room) {
      // FR-082: blokir sementara dari penjualan + alert.
      const today = todayIso();
      const inv = store.inventory.find((i) => i.roomId === roomId && i.date === today);
      if (inv && inv.status === "AVAILABLE") {
        inv.status = "BLOCKED";
        inv.reason = "Access anomaly";
      }
      notify({ hotelId: room.hotelId, toRole: "FRONT_OFFICE_SUPERVISOR", title: `Access anomaly kamar ${room.number}`, body: `${cardUid} tidak memiliki reservasi valid.`, kind: "ANOMALY", link: "/access" });
    }

    auditLog({ user: actor }, { hotelId: event.hotelId, action: "DOOR_EVENT_SIMULATED", entity: "DoorEvent", entityId: event.id, after: { anomaly, room: room?.number }, source: "simulator" });
    return event;
  },
  async resolveAnomaly(actor: User, eventId: string, note: string) {
    await delay();
    const event = store.doorEvents.find((e) => e.id === eventId);
    if (!event) throw new Error("Event tidak ditemukan.");
    event.anomaly = false;
    event.severity = "INFO";
    event.note = `Diselesaikan: ${note}`;
    auditLog({ user: actor }, { hotelId: event.hotelId, action: "ANOMALY_RESOLVED", entity: "DoorEvent", entityId: eventId, reason: note, source: "web" });
    return event;
  },
};

// ----- Housekeeping / Maintenance -----
export const housekeepingService: HousekeepingOps = {
  async list(hotelId: string) {
    await delay();
    return store.housekeeping.filter((t) => t.hotelId === hotelId);
  },
  async advance(actor: User, taskId: string) {
    await delay();
    const task = store.housekeeping.find((t) => t.id === taskId);
    if (!task) throw new Error("Task tidak ditemukan.");
    const nextMap = { DIRTY: "CLEANING", CLEANING: "CLEAN", CLEAN: "INSPECTED" } as const;
    const next = nextMap[task.status as keyof typeof nextMap];
    if (!next || !canTransitionHousekeeping(task.status, next)) throw new Error("Tidak ada transisi lanjutan.");
    task.status = next;
    if (next === "CLEANING") task.startedAt = new Date().toISOString();
    if (next === "CLEAN" || next === "INSPECTED") task.finishedAt = new Date().toISOString();
    const room = roomById(task.roomId);
    if (room) room.operationalStatus = next === "INSPECTED" ? "INSPECTED" : next;
    auditLog({ user: actor }, { hotelId: task.hotelId, action: "HOUSEKEEPING_ADVANCED", entity: "HousekeepingTask", entityId: taskId, after: { status: next }, source: "web" });
    return task;
  },
};

export const maintenanceService: MaintenanceOps = {
  async list(hotelId: string) {
    await delay();
    return store.maintenance.filter((t) => t.hotelId === hotelId);
  },
  async resolve(actor: User, id: string) {
    await delay();
    const t = store.maintenance.find((m) => m.id === id);
    if (!t) throw new Error("Tiket tidak ditemukan.");
    t.status = "RESOLVED";
    const room = roomById(t.roomId);
    if (room && room.operationalStatus === "MAINTENANCE") room.operationalStatus = "DIRTY";
    for (const inv of store.inventory) {
      if (inv.roomId === t.roomId && inv.status === "BLOCKED" && inv.reason) {
        inv.status = "AVAILABLE";
        inv.reason = undefined;
      }
    }
    auditLog({ user: actor }, { hotelId: t.hotelId, action: "MAINTENANCE_RESOLVED", entity: "MaintenanceTicket", entityId: id, source: "web" });
    return t;
  },
};

// ----- Audit / Notification -----
export const auditService: AuditOps = {
  async list(hotelId: string) {
    await delay();
    return store.audit.filter((a) => !a.hotelId || a.hotelId === hotelId);
  },
};

export const notificationService: NotificationOps = {
  async list(hotelId: string, user: User) {
    await delay();
    return store.notifications.filter(
      (n) => (!n.hotelId || n.hotelId === hotelId) && (!n.toRole || n.toRole === user.role) && (!n.toUserId || n.toUserId === user.id),
    );
  },
  async markRead(id: string) {
    await delay(60);
    const n = store.notifications.find((x) => x.id === id);
    if (n) n.read = true;
  },
};

// ----- Dashboard -----
export const dashboardService: DashboardOps = {
  async summary(hotelId: string, date: string): Promise<DashboardSummary> {
    await delay();
    const totalRooms = rooms.filter((r) => r.hotelId === hotelId && r.active).length;
    const inventory = store.inventory.filter((i) => i.hotelId === hotelId && i.date === date);
    const statusCount = (s: RoomNightInventory["status"]) => inventory.filter((i) => i.status === s).length;
    const occupied = statusCount("OCCUPIED");
    const booked = statusCount("BOOKED");
    const held = statusCount("HELD");
    const blocked = statusCount("BLOCKED");
    const available = totalRooms - (occupied + booked + held + blocked);
    const arrivals = store.reservations.filter(
      (r) => r.hotelId === hotelId && r.checkInDate === date && ["CONFIRMED", "PARTIALLY_PAID"].includes(r.status),
    ).length;
    const departures = store.reservations.filter(
      (r) => r.hotelId === hotelId && r.checkOutDate === date && r.status === "CHECKED_IN",
    ).length;
    const dirty = rooms.filter((r) => r.hotelId === hotelId && r.operationalStatus === "DIRTY").length;
    const cleaning = rooms.filter((r) => r.hotelId === hotelId && r.operationalStatus === "CLEANING").length;
    const maintenance = rooms.filter((r) => r.hotelId === hotelId && (r.operationalStatus === "MAINTENANCE" || r.operationalStatus === "OUT_OF_ORDER")).length;
    const pendingPayments = store.payments.filter((p) => p.hotelId === hotelId && p.status === "PENDING").length;
    const pendingApprovals = store.discountRequests.filter((d) => d.hotelId === hotelId && d.status === "PENDING").length;
    const anomalies = store.doorEvents.filter((e) => e.hotelId === hotelId && e.anomaly).length;
    return {
      date,
      totalRooms,
      occupied,
      available,
      booked,
      held,
      blocked,
      arrivalsToday: arrivals,
      departuresToday: departures,
      dirty,
      cleaning,
      maintenance,
      pendingPayments,
      pendingApprovals,
      anomalies,
      occupancyPercent: totalRooms ? Math.round(((occupied + booked) / totalRooms) * 100) : 0,
    };
  },
};



