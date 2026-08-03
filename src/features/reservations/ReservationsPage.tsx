import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { reservationService } from "@/services/mock";
import { qk } from "@/services/query-keys";
import { useAuth } from "@/app/providers/AuthProvider";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { MoneyText } from "@/components/shared/MoneyText";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";

export function ReservationsPage() {
  const { hotelId, can } = useAuth();
  const { data = [] } = useQuery({ queryKey: qk.reservations(hotelId), queryFn: () => reservationService.list(hotelId), refetchInterval: 5000 });

  return (
    <div>
      <PageHeader
        title="Reservasi"
        subtitle="Daftar reservasi dan statusnya."
        actions={
          can("reservation:create") ? (
            <Link to="/reservations/new">
              <Button type="button"><Plus className="size-4" /> Buat Reservasi</Button>
            </Link>
          ) : undefined
        }
      />
      {data.length === 0 ? (
        <EmptyState title="Belum ada reservasi" hint="Reservasi baru akan muncul di sini." />
      ) : (
        <div className="rounded-lg border bg-card">
          <div className="flex items-center justify-between border-b px-4 py-2.5">
            <p className="text-sm font-semibold">{data.length} reservasi</p>
            <p className="text-xs text-muted-foreground">Geser untuk melihat kolom lainnya</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-secondary/50 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="sticky left-0 z-10 bg-secondary/50 px-4 py-2.5 font-medium">Kode</th>
                  <th className="px-4 py-2.5 font-medium">Tamu</th>
                  <th className="px-4 py-2.5 font-medium">Check-in – out</th>
                  <th className="px-4 py-2.5 font-medium">Kamar</th>
                  <th className="px-4 py-2.5 font-medium">Channel</th>
                  <th className="px-4 py-2.5 text-right font-medium">Total</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((r) => (
                  <tr key={r.id} className="border-t transition-colors hover:bg-accent/40">
                    <td className="sticky left-0 z-10 bg-card px-4 py-2.5">
                      <Link className="font-medium text-primary hover:underline" to={`/reservations/${r.id}`}>{r.bookingCode}</Link>
                    </td>
                    <td className="px-4 py-2.5">{r.guestName}</td>
                    <td className="px-4 py-2.5 text-muted-foreground tabular-nums">{formatDate(r.checkInDate)} – {formatDate(r.checkOutDate)}</td>
                    <td className="px-4 py-2.5 tabular-nums">{r.rooms.map((x) => x.roomNumber).join(", ")}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{r.channel}</td>
                    <td className="px-4 py-2.5 text-right"><MoneyText value={r.totalAmount} /></td>
                    <td className="px-4 py-2.5"><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
