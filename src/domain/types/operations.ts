import type {
  CardStatus,
  DiscountRequestStatus,
  DoorEventSeverity,
  DoorEventType,
  HousekeepingStatus,
  MaintenanceStatus,
  PaymentMethod,
  PaymentStatus,
  ReservationStatus,
  RoomNightStatus,
  CashierShiftStatus,
} from "./status";
import type { ChannelKind } from "./entities";
import type { Role } from "./role";

export interface PolicyConfig {
  hotelId: string;
  dpPercent: number; // contoh 0.3
  dpMinOneNight: boolean;
  holdMinutesOnline: number;
  holdMinutesFrontOffice: number;
  holdMinutesApproval: number;
  checkInTime: string; // "14:00"
  checkOutTime: string; // "12:00"
  inspectionRequired: boolean;
  discountLimits: Record<Role, number>; // batas diskon per role (desimal)
}

export interface ReservationRoom {
  roomId: string;
  roomNumber: string;
  roomTypeId: string;
  adults: number;
  children: number;
}

export interface Reservation {
  id: string;
  hotelId: string;
  bookingCode: string;
  guestId: string;
  guestName: string;
  channel: ChannelKind;
  status: ReservationStatus;
  checkInDate: string; // ISO date
  checkOutDate: string; // ISO date
  nights: number;
  rooms: ReservationRoom[];
  ratePlanId: string;
  baseRateTotal: number;
  discountPercent: number;
  totalAmount: number;
  paidAmount: number;
  holdExpiresAt?: string; // ISO datetime
  createdBy: string;
  createdAt: string;
  notes?: string;
}

export interface RoomNightInventory {
  id: string;
  hotelId: string;
  roomId: string;
  date: string; // ISO date
  status: RoomNightStatus;
  reservationId?: string;
  reason?: string;
}

export interface Payment {
  id: string;
  hotelId: string;
  reservationId: string;
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  reference?: string;
  proofNote?: string;
  isDeposit: boolean;
  receivedBy: string;
  verifiedBy?: string;
  receiptNo?: string;
  createdAt: string;
}

export interface DiscountRequest {
  id: string;
  hotelId: string;
  reservationId: string;
  requesterId: string;
  requesterRole: Role;
  status: DiscountRequestStatus;
  basePrice: number;
  requestedPercent: number;
  finalPrice: number;
  reason: string;
  approverId?: string;
  decisionReason?: string;
  requiredApproverRole: Role;
  createdAt: string;
  decidedAt?: string;
  slaDeadline: string;
}

export interface AccessCard {
  id: string;
  hotelId: string;
  cardUid: string;
  roomId: string;
  roomNumber: string;
  reservationId?: string;
  status: CardStatus;
  issuedBy: string;
  issuedAt: string;
  validUntil: string;
  lastUsedAt?: string;
}

export interface DoorEvent {
  id: string;
  hotelId: string;
  eventId: string; // untuk idempotensi
  cardUid: string;
  roomId: string;
  roomNumber: string;
  eventType: DoorEventType;
  eventTime: string;
  deviceId: string;
  reservationId?: string;
  anomaly: boolean;
  severity: DoorEventSeverity;
  note?: string;
}

export interface HousekeepingTask {
  id: string;
  hotelId: string;
  roomId: string;
  roomNumber: string;
  status: HousekeepingStatus;
  assignee?: string;
  startedAt?: string;
  finishedAt?: string;
  notes?: string;
}

export interface MaintenanceTicket {
  id: string;
  hotelId: string;
  roomId: string;
  roomNumber: string;
  title: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: MaintenanceStatus;
  technician?: string;
  blockFrom?: string;
  blockTo?: string;
  createdAt: string;
}

export interface CashierShift {
  id: string;
  hotelId: string;
  cashierId: string;
  status: CashierShiftStatus;
  openingCash: number;
  closingCash?: number;
  expectedCash: number;
  variance?: number;
  openedAt: string;
  closedAt?: string;
}

export interface AuditLog {
  id: string;
  hotelId?: string;
  actorId: string;
  actorName: string;
  actorRole: Role;
  action: string;
  entity: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
  reason?: string;
  source: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  hotelId?: string;
  toRole?: Role;
  toUserId?: string;
  title: string;
  body: string;
  kind: "APPROVAL" | "ANOMALY" | "PAYMENT" | "SYSTEM";
  link?: string;
  read: boolean;
  createdAt: string;
}
