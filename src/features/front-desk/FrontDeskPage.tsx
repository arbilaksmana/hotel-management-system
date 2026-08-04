import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { frontDeskService, reservationService } from "@/services/mock";
import { qk } from "@/services/query-keys";
import { useAuth } from "@/app/providers/AuthProvider";
import { useToast } from "@/components/feedback/Toast";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/EmptyState";
import { todayIso } from "@/domain/rules/dates";
import { cn } from "@/lib/utils";
import { TONE_TEXT } from "@/components/shared/status-tokens";
import type { Reservation } from "@/domain/types";

type BoardTab = "arrivals" | "departures" | "inhouse";

function GuestRow({
  reservation: r,
  meta,
  action,
}: {
  reservation: Reservation;
  meta: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border bg-background px-3 py-2.5 transition-colors hover:bg-accent/30">
      <div className="min-w-0">
        <Link className="font-medium text-primary hover:underline" to={`/reservations/${r.id}`}>
          {r.guestName}
        </Link>
        <p className="text-xs text-muted-foreground tabular-nums">{meta}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <StatusBadge status={r.status} />
        {action}
      </div>
    </div>
  );
}

export function FrontDeskPage() {
  const { user, hotelId, can } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const today = todayIso();
  const [tab, setTab] = React.useState<BoardTab>("arrivals");
  const { data = [] } = useQuery({
    queryKey: qk.reservations(hotelId),
    queryFn: () => reservationService.list(hotelId),
    refetchInterval: 4000,
  });

  const arrivals = data.filter((r) => r.checkInDate === today && ["CONFIRMED", "PARTIALLY_PAID"].includes(r.status));
  const departures = data.filter((r) => r.checkOutDate === today && r.status === "CHECKED_IN");
  const inHouse = data.filter((r) => r.status === "CHECKED_IN");
  const dueSoon = departures.length;

  const checkIn = useMutation({
    mutationFn: (id: string) => frontDeskService.checkIn(user!, id),
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.push({ kind: "success", title: "Check-in berhasil." });
    },
    onError: (e: Error) => toast.push({ kind: "error", title: e.message }),
  });
  const checkOut = useMutation({
    mutationFn: (id: string) => frontDeskService.checkOut(user!, id),
    onSuccess: () => {
      queryClient.invalidateQueries();
      toast.push({ kind: "success", title: "Checkout berhasil; kamar jadi kotor." });
    },
    onError: (e: Error) => toast.push({ kind: "error", title: e.message }),
  });

  const tabs: { key: BoardTab; label: string; count: number }[] = [
    { key: "arrivals", label: "Kedatangan", count: arrivals.length },
    { key: "departures", label: "Keberangkatan", count: departures.length },
    { key: "inhouse", label: "In-house", count: inHouse.length },
  ];

  const list =
    tab === "arrivals" ? arrivals : tab === "departures" ? departures : inHouse;

  return (
    <div>
      <PageHeader title="Front Desk" subtitle={`Shift operasional · antrean hari ini (${today}).`} />

      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border bg-card px-3 py-2.5 text-xs">
        <span className="rounded-sm bg-foreground px-2 py-0.5 font-medium text-background">Shift aktif</span>
        <span className="text-muted-foreground">Tanggal</span>
        <span className="font-medium tabular-nums">{today}</span>
        <span className="hidden text-border sm:inline">·</span>
        <span className="text-muted-foreground">Arr</span>
        <span className="font-semibold tabular-nums">{arrivals.length}</span>
        <span className="text-muted-foreground">Dep</span>
        <span className={cn("font-semibold tabular-nums", dueSoon > 0 && TONE_TEXT.warning)}>{departures.length}</span>
        <span className="text-muted-foreground">In-house</span>
        <span className={cn("font-semibold tabular-nums", TONE_TEXT.info)}>{inHouse.length}</span>
        <span className="ml-auto hidden text-muted-foreground md:inline">Checkout hari ini memicu HK kotor</span>
      </div>

      <div className="mb-3 flex flex-wrap gap-1 rounded-lg border bg-muted/30 p-1" role="tablist" aria-label="Antrean front desk">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "inline-flex min-h-9 flex-1 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-none",
              tab === t.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
            <span className="tabular-nums text-xs text-muted-foreground">{t.count}</span>
          </button>
        ))}
      </div>

      <div className="rounded-lg border bg-card" role="tabpanel">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-sm font-semibold tracking-tight">
            {tab === "arrivals" ? "Kedatangan hari ini" : tab === "departures" ? "Keberangkatan hari ini" : "Tamu in-house"}
          </h2>
          <span className="text-xs text-muted-foreground tabular-nums">{list.length} tamu</span>
        </div>
        <div className="space-y-1 p-3">
          {list.length === 0 ? (
            <EmptyState title={tab === "arrivals" ? "Tidak ada kedatangan" : tab === "departures" ? "Tidak ada keberangkatan" : "Tidak ada tamu in-house"} />
          ) : (
            list.map((r) => {
              if (tab === "arrivals") {
                return (
                  <GuestRow
                    key={r.id}
                    reservation={r}
                    meta={`${r.rooms.map((x) => x.roomNumber).join(", ")} · ${r.nights} mlm`}
                    action={
                      can("checkin:perform") ? (
                        <Button type="button" size="sm" onClick={() => checkIn.mutate(r.id)} disabled={checkIn.isPending}>
                          Check-in
                        </Button>
                      ) : null
                    }
                  />
                );
              }
              if (tab === "departures") {
                return (
                  <GuestRow
                    key={r.id}
                    reservation={r}
                    meta={`${r.rooms.map((x) => x.roomNumber).join(", ")} · checkout ${r.checkOutDate}`}
                    action={
                      can("checkout:perform") ? (
                        <Button type="button" size="sm" variant="outline" onClick={() => checkOut.mutate(r.id)} disabled={checkOut.isPending}>
                          Checkout
                        </Button>
                      ) : null
                    }
                  />
                );
              }
              const isDepartureToday = r.checkOutDate === today;
              return (
                <GuestRow
                  key={r.id}
                  reservation={r}
                  meta={`${r.rooms.map((x) => x.roomNumber).join(", ")} · checkout ${r.checkOutDate}${isDepartureToday ? " · hari ini" : ""}`}
                  action={
                    can("checkout:perform") ? (
                      <Button type="button" size="sm" variant="outline" onClick={() => checkOut.mutate(r.id)} disabled={checkOut.isPending}>
                        Checkout
                      </Button>
                    ) : null
                  }
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
