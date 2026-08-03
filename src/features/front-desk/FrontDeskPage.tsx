import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { frontDeskService, reservationService } from "@/services/mock";
import { qk } from "@/services/query-keys";
import { useAuth } from "@/app/providers/AuthProvider";
import { useToast } from "@/components/feedback/Toast";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback/EmptyState";
import { todayIso } from "@/domain/rules/dates";

export function FrontDeskPage() {
  const { user, hotelId, can } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const today = todayIso();
  const { data = [] } = useQuery({ queryKey: qk.reservations(hotelId), queryFn: () => reservationService.list(hotelId), refetchInterval: 4000 });

  const arrivals = data.filter((r) => r.checkInDate === today && ["CONFIRMED", "PARTIALLY_PAID"].includes(r.status));
  const inHouse = data.filter((r) => r.status === "CHECKED_IN");

  const checkIn = useMutation({
    mutationFn: (id: string) => frontDeskService.checkIn(user!, id),
    onSuccess: () => { queryClient.invalidateQueries(); toast.push({ kind: "success", title: "Check-in berhasil." }); },
    onError: (e: Error) => toast.push({ kind: "error", title: e.message }),
  });
  const checkOut = useMutation({
    mutationFn: (id: string) => frontDeskService.checkOut(user!, id),
    onSuccess: () => { queryClient.invalidateQueries(); toast.push({ kind: "success", title: "Checkout berhasil; kamar jadi kotor." }); },
    onError: (e: Error) => toast.push({ kind: "error", title: e.message }),
  });

  return (
    <div>
      <PageHeader title="Front Desk" subtitle={`Kedatangan & tamu in-house hari ini (${today}).`} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Kedatangan hari ini</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {arrivals.length === 0 ? <EmptyState title="Tidak ada kedatangan" /> : arrivals.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                <div>
                  <Link className="font-medium text-primary hover:underline" to={`/reservations/${r.id}`}>{r.guestName}</Link>
                  <p className="text-xs text-muted-foreground">{r.rooms.map((x) => x.roomNumber).join(", ")} · {r.nights} mlm</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={r.status} />
                  {can("checkin:perform") ? <Button size="sm" onClick={() => checkIn.mutate(r.id)} disabled={checkIn.isPending}>Check-in</Button> : null}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Tamu in-house</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {inHouse.length === 0 ? <EmptyState title="Tidak ada tamu in-house" /> : inHouse.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                <div>
                  <Link className="font-medium text-primary hover:underline" to={`/reservations/${r.id}`}>{r.guestName}</Link>
                  <p className="text-xs text-muted-foreground">{r.rooms.map((x) => x.roomNumber).join(", ")} · checkout {r.checkOutDate}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={r.status} />
                  {can("checkout:perform") ? <Button size="sm" variant="outline" onClick={() => checkOut.mutate(r.id)} disabled={checkOut.isPending}>Checkout</Button> : null}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
