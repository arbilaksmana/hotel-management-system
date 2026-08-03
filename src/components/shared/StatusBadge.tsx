import { cn } from "@/lib/utils";
import { badgeToneClass } from "./status-tokens";
import type { AnyStatus } from "./status-tokens";

const LABEL_ID: Record<string, string> = {
  AVAILABLE: "Tersedia",
  HELD: "Ditahan",
  BOOKED: "Booked",
  OCCUPIED: "Terisi",
  BLOCKED: "Diblokir",
  CLEAN: "Bersih",
  INSPECTED: "Dicek",
  DIRTY: "Kotor",
  CLEANING: "Dibersihkan",
  MAINTENANCE: "Perbaikan",
  OUT_OF_ORDER: "Tidak Aktif",
  DRAFT: "Draf",
  HOLD: "Ditahan",
  PENDING_PAYMENT: "Menunggu Bayar",
  PENDING_APPROVAL: "Menunggu Approval",
  PARTIALLY_PAID: "DP Sebagian",
  CONFIRMED: "Terkonfirmasi",
  CHECKED_IN: "Check-in",
  CHECKED_OUT: "Check-out",
  CANCELLED: "Batal",
  NO_SHOW: "No Show",
  EXPIRED: "Kedaluwarsa",
  REJECTED: "Ditolak",
  PENDING: "Menunggu",
  VERIFIED: "Terverifikasi",
  FAILED: "Gagal",
  REFUNDED: "Refund",
  REVERSED: "Reversal",
  APPROVED: "Disetujui",
  REVISION_REQUESTED: "Minta Revisi",
  INVALIDATED: "Dibatalkan",
  ACTIVE: "Aktif",
  DEACTIVATED: "Nonaktif",
  REPLACED: "Diganti",
  OPEN: "Terbuka",
  IN_PROGRESS: "Diproses",
  RESOLVED: "Selesai",
  CLOSED: "Ditutup",
};

export function statusLabel(status: string): string {
  return LABEL_ID[status] ?? status;
}

/**
 * Status is always conveyed by text label plus colour (PRD 10.1), never colour
 * alone. Colour comes from semantic tone tokens in status-tokens.ts.
 */
export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-[11px] font-medium",
        badgeToneClass(status),
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {statusLabel(status)}
    </span>
  );
}

export type { AnyStatus };
