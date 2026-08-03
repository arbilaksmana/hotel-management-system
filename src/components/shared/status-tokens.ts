import type {
  PaymentStatus,
  ReservationStatus,
  RoomNightStatus,
  RoomOperationalStatus,
} from "@/domain/types";

/**
 * Semantic tones for operational status. Components must consume these tokens
 * instead of raw palette classes so light/dark themes stay in sync and status
 * semantics remain reviewable in one place.
 *
 * Tone intent:
 * - positive   : sellable / clean / settled
 * - info       : guest in house (occupied, checked-in)
 * - warning    : time-boxed or awaiting action (hold, pending payment)
 * - committed  : sold, guest not yet arrived (booked, confirmed)
 * - danger     : failure / rejection / anomaly
 * - special    : approval + money reversal flows
 * - inspect    : verified-by-supervisor housekeeping state
 * - attention  : needs housekeeping work (dirty)
 * - neutral    : terminal or inert states
 * - inverse    : hard block, room removed from inventory
 */
export type StatusTone =
  | "positive"
  | "info"
  | "warning"
  | "committed"
  | "danger"
  | "special"
  | "inspect"
  | "attention"
  | "neutral"
  | "inverse";

export const STATUS_TONE: Record<string, StatusTone> = {
  // Room-night inventory
  AVAILABLE: "positive",
  HELD: "warning",
  BOOKED: "committed",
  OCCUPIED: "info",
  BLOCKED: "inverse",

  // Housekeeping
  CLEAN: "positive",
  INSPECTED: "inspect",
  DIRTY: "attention",
  CLEANING: "warning",
  MAINTENANCE: "neutral",
  OUT_OF_ORDER: "inverse",

  // Reservation lifecycle
  DRAFT: "neutral",
  HOLD: "warning",
  PENDING_PAYMENT: "warning",
  PENDING_APPROVAL: "special",
  PARTIALLY_PAID: "warning",
  CONFIRMED: "committed",
  CHECKED_IN: "info",
  CHECKED_OUT: "neutral",
  CANCELLED: "neutral",
  NO_SHOW: "neutral",
  EXPIRED: "neutral",
  REJECTED: "danger",

  // Payment
  PENDING: "warning",
  VERIFIED: "positive",
  FAILED: "danger",
  REFUNDED: "special",
  REVERSED: "special",

  // Approval
  APPROVED: "positive",
  REVISION_REQUESTED: "warning",

  // Access cards
  INVALIDATED: "neutral",
  ACTIVE: "positive",
  DEACTIVATED: "neutral",
  REPLACED: "warning",

  // Maintenance tickets
  OPEN: "committed",
  IN_PROGRESS: "warning",
  RESOLVED: "positive",
  CLOSED: "neutral",
};

/** Badge surface: soft background, readable foreground, matching border. */
export const TONE_BADGE: Record<StatusTone, string> = {
  positive: "bg-tone-positive text-tone-positive-foreground border-tone-positive-border",
  info: "bg-tone-info text-tone-info-foreground border-tone-info-border",
  warning: "bg-tone-warning text-tone-warning-foreground border-tone-warning-border",
  committed: "bg-tone-committed text-tone-committed-foreground border-tone-committed-border",
  danger: "bg-tone-danger text-tone-danger-foreground border-tone-danger-border",
  special: "bg-tone-special text-tone-special-foreground border-tone-special-border",
  inspect: "bg-tone-inspect text-tone-inspect-foreground border-tone-inspect-border",
  attention: "bg-tone-attention text-tone-attention-foreground border-tone-attention-border",
  neutral: "bg-tone-neutral text-tone-neutral-foreground border-tone-neutral-border",
  inverse: "bg-tone-inverse text-tone-inverse-foreground border-tone-inverse-border",
};

/** Denser surface for the availability rack, where cells sit edge to edge. */
export const TONE_CELL: Record<StatusTone, string> = {
  positive: "bg-tone-positive-cell text-tone-positive-foreground",
  info: "bg-tone-info-cell text-tone-info-foreground",
  warning: "bg-tone-warning-cell text-tone-warning-foreground",
  committed: "bg-tone-committed-cell text-tone-committed-foreground",
  danger: "bg-tone-danger-cell text-tone-danger-foreground",
  special: "bg-tone-special-cell text-tone-special-foreground",
  inspect: "bg-tone-inspect-cell text-tone-inspect-foreground",
  attention: "bg-tone-attention-cell text-tone-attention-foreground",
  neutral: "bg-tone-neutral-cell text-tone-neutral-foreground",
  inverse: "bg-tone-inverse-cell text-tone-inverse-foreground",
};

/** Foreground-only tone, for metric emphasis on a plain card. */
export const TONE_TEXT: Record<StatusTone, string> = {
  positive: "text-tone-positive-foreground",
  info: "text-tone-info-foreground",
  warning: "text-tone-warning-foreground",
  committed: "text-tone-committed-foreground",
  danger: "text-tone-danger-foreground",
  special: "text-tone-special-foreground",
  inspect: "text-tone-inspect-foreground",
  attention: "text-tone-attention-foreground",
  neutral: "text-tone-neutral-foreground",
  inverse: "text-foreground",
};

export function toneFor(status: string): StatusTone {
  return STATUS_TONE[status] ?? "neutral";
}

export function badgeToneClass(status: string): string {
  return TONE_BADGE[toneFor(status)];
}

export function cellToneClass(status: string): string {
  return TONE_CELL[toneFor(status)];
}

export type AnyStatus =
  | RoomNightStatus
  | RoomOperationalStatus
  | ReservationStatus
  | PaymentStatus
  | string;
