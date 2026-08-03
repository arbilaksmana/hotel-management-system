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
import { Card } from "@/components/ui/card";
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
              <Button><Plus /> Buat Reservasi</Button>
            </Link>
          ) : undefined
        }
      />
      {data.length === 0 ? (
        <EmptyState title="Belum ada reservasi" />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2 font-medium">Kode</th>
                <th className="px-4 py-2 font-medium">Tamu</th>
                <th className="px-4 py-2 font-medium">Tanggal</th>
                <th className="px-4 py-2 font-medium">Kamar</th>
                <th className="px-4 py-2 font-medium">Channel</th>
                <th className="px-4 py-2 text-right font-medium">Total</th>
                <th className="px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <tr key={r.id} className="border-t hover:bg-accent/40">
                  <td className="px-4 py-2">
                    <Link className="font-medium text-primary hover:underline" to={`/reservations/${r.id}`}>{r.bookingCode}</Link>
                  </td>
                  <td className="px-4 py-2">{r.guestName}</td>
                  <td className="px-4 py-2 text-muted-foreground">{formatDate(r.checkInDate)} ? {formatDate(r.checkOutDate)}</td>
                  <td className="px-4 py-2">{r.rooms.map((x) => x.roomNumber).join(", ")}</td>
                  <td className="px-4 py-2 text-muted-foreground">{r.channel}</td>
                  <td className="px-4 py-2 text-right"><MoneyText value={r.totalAmount} /></td>
                  <td className="px-4 py-2"><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
