import type {
  AccessCard,
  AuditLog,
  AppNotification,
  ChannelKind,
  DiscountRequest,
  DoorEvent,
  HousekeepingTask,
  MaintenanceTicket,
  Payment,
  Reservation,
  Room,
  RoomNightInventory,
  User,
} from "@/domain/types";

export interface ReservationInput {
  hotelId: string;
  guestId: string;
  guestName: string;
  channel: ChannelKind;
  checkInDate: string;
  checkOutDate: string;
  ratePlanId: string;
  roomIds: string[];
  discountPercent: number;
  notes?: string;
}

export interface PaymentInput {
  reservationId: string;
  method: Payment["method"];
  amount: number;
  isDeposit: boolean;
  reference?: string;
  proofNote?: string;
}

export interface DashboardSummary {
  date: string;
  totalRooms: number;
  occupied: number;
  available: number;
  booked: number;
  held: number;
  blocked: number;
  arrivalsToday: number;
  departuresToday: number;
  dirty: number;
  cleaning: number;
  maintenance: number;
  pendingPayments: number;
  pendingApprovals: number;
  anomalies: number;
  occupancyPercent: number;
}

// Service contracts · port yang nantinya bisa ditukar REST tanpa mengubah UI.
export interface HotelService {
  listRooms(hotelId: string): Promise<Room[]>;
}

export interface AvailabilityService {
  getInventory(hotelId: string, from: string, to: string): Promise<RoomNightInventory[]>;
}

export interface ReservationOps {
  list(hotelId: string): Promise<Reservation[]>;
  get(id: string): Promise<Reservation | undefined>;
  create(actor: User, input: ReservationInput): Promise<Reservation>;
  cancel(actor: User, id: string, reason: string): Promise<Reservation>;
  extendHold(actor: User, id: string, minutes: number, reason: string): Promise<Reservation>;
}

export interface PaymentOps {
  record(actor: User, input: PaymentInput): Promise<Payment>;
  verify(actor: User, paymentId: string): Promise<Payment>;
  listFor(hotelId: string, reservationId: string): Promise<Payment[]>;
}

export interface ApprovalOps {
  list(hotelId: string): Promise<DiscountRequest[]>;
  decide(actor: User, id: string, decision: "APPROVED" | "REJECTED" | "REVISION_REQUESTED", reason: string): Promise<DiscountRequest>;
}

export interface FrontDeskOps {
  checkIn(actor: User, reservationId: string, overrides?: { reason: string }): Promise<Reservation>;
  checkOut(actor: User, reservationId: string): Promise<Reservation>;
}

export interface AccessOps {
  issueCard(actor: User, reservationId: string, roomId: string): Promise<AccessCard>;
  listCards(hotelId: string): Promise<AccessCard[]>;
  listDoorEvents(hotelId: string): Promise<DoorEvent[]>;
  simulateDoorEvent(actor: User, cardUid: string, roomId: string): Promise<DoorEvent>;
  resolveAnomaly(actor: User, eventId: string, note: string): Promise<DoorEvent>;
}

export interface HousekeepingOps {
  list(hotelId: string): Promise<HousekeepingTask[]>;
  advance(actor: User, taskId: string): Promise<HousekeepingTask>;
}

export interface MaintenanceOps {
  list(hotelId: string): Promise<MaintenanceTicket[]>;
  resolve(actor: User, id: string): Promise<MaintenanceTicket>;
}

export interface AuditOps {
  list(hotelId: string): Promise<AuditLog[]>;
}

export interface NotificationOps {
  list(hotelId: string, user: User): Promise<AppNotification[]>;
  markRead(id: string): Promise<void>;
}

export interface DashboardOps {
  summary(hotelId: string, date: string): Promise<DashboardSummary>;
}
