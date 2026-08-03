// Status enums mengikuti PRD bagian 9 (Status dan Aturan Bisnis).

export type ReservationStatus =
  | "DRAFT"
  | "HOLD"
  | "PENDING_PAYMENT"
  | "PENDING_APPROVAL"
  | "PARTIALLY_PAID"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "CHECKED_OUT"
  | "CANCELLED"
  | "NO_SHOW"
  | "EXPIRED"
  | "REJECTED";

export type RoomNightStatus = "AVAILABLE" | "HELD" | "BOOKED" | "OCCUPIED" | "BLOCKED";

export type RoomOperationalStatus =
  | "CLEAN"
  | "INSPECTED"
  | "DIRTY"
  | "CLEANING"
  | "MAINTENANCE"
  | "OUT_OF_ORDER";

export type PaymentStatus = "PENDING" | "VERIFIED" | "FAILED" | "EXPIRED" | "REFUNDED" | "REVERSED";

export type PaymentMethod = "CASH" | "TRANSFER" | "CARD" | "OTA" | "CORPORATE";

export type DiscountRequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "REVISION_REQUESTED" | "INVALIDATED";

export type CardStatus = "ACTIVE" | "EXPIRED" | "REPLACED" | "DEACTIVATED";

export type DoorEventType = "GUEST_CARD" | "MASTER_CARD" | "DENIED" | "DOOR_OPENED";

export type DoorEventSeverity = "INFO" | "WARNING" | "CRITICAL";

export type HousekeepingStatus = "DIRTY" | "CLEANING" | "CLEAN" | "INSPECTED";

export type MaintenanceStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export type CashierShiftStatus = "OPEN" | "CLOSED";
