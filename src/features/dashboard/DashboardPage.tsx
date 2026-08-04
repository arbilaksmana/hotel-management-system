import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarCheck, ClipboardCheck, DoorOpen, ShieldAlert } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/mock";
import { qk } from "@/services/query-keys";
import { useAuth } from "@/app/providers/AuthProvider";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { todayIso } from "@/domain/rules/dates";
import { cn } from "@/lib/utils";
import type { StatusTone } from "@/components/shared/status-tokens";
import { TONE_TEXT } from "@/components/shared/status-tokens";

type ExceptionItem = {
  label: string;
  value: number;
  tone: StatusTone;
  to: string;
  hint: string;
};

function ExceptionCounter({ item }: { item: ExceptionItem }) {
  const idle = item.value === 0;
  return (
    <Link
      to={item.to}
      className={cn(
        "group flex min-h-[4.5rem] flex-col justify-between rounded-md border px-3 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        idle ? "border-border/70 bg-muted/20 hover:bg-muted/35" : "border-border bg-card hover:bg-accent/40",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-medium text-muted-foreground">{item.label}</p>
        <ArrowRight className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100" />
      </div>
      <div>
        <p className={cn("text-2xl font-semibold tracking-tight tabular-nums", !idle && TONE_TEXT[item.tone])}>{item.value}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">{idle ? "Tidak ada antrean" : item.hint}</p>
      </div>
    </Link>
  );
}

function Metric({ label, value, tone }: { label: string; value: React.ReactNode; tone?: StatusTone }) {
  return (
    <div className="border-b py-3 last:border-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-xl font-semibold tracking-tight tabular-nums", tone && TONE_TEXT[tone])}>{value}</p>
    </div>
  );
}

export function DashboardPage() {
  const { hotelId } = useAuth();
  const date = todayIso();
  const { data, isLoading } = useQuery({
    queryKey: qk.dashboard(hotelId, date),
    queryFn: () => dashboardService.summary(hotelId, date),
    refetchInterval: 5000,
  });

  if (isLoading || !data) return <p className="p-6 text-sm text-muted-foreground">Memuat dashboard…</p>;

  const exceptions: ExceptionItem[] = [
    { label: "Kotor", value: data.dirty, tone: "attention", to: "/housekeeping", hint: "Buka antrean HK" },
    { label: "Cleaning", value: data.cleaning, tone: "warning", to: "/housekeeping", hint: "Sedang dikerjakan" },
    { label: "Pembayaran", value: data.pendingPayments, tone: "warning", to: "/reservations", hint: "Verifikasi / DP" },
    { label: "Approval", value: data.pendingApprovals, tone: "special", to: "/approvals", hint: "Diskon menunggu" },
    { label: "Anomali akses", value: data.anomalies, tone: "danger", to: "/access", hint: "Monitor pintu" },
    { label: "Kapasitas off", value: data.blocked + data.maintenance, tone: "inverse", to: "/maintenance", hint: `${data.blocked} blok · ${data.maintenance} MT` },
  ];
  const openExceptions = exceptions.filter((e) => e.value > 0).length;

  return (
    <div>
      <PageHeader title="Dashboard operasional" subtitle={`Posisi hotel dan pekerjaan yang perlu ditangani hari ini · ${date}`} />

      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border bg-card px-3 py-2 text-xs">
        <span className="rounded-sm bg-foreground px-2 py-0.5 font-medium text-background">Shift hari ini</span>
        <span className="text-muted-foreground">Tanggal operasional</span>
        <span className="font-medium tabular-nums">{date}</span>
        <span className="text-border">·</span>
        <span className="text-muted-foreground">Exception terbuka</span>
        <span className={cn("font-semibold tabular-nums", openExceptions > 0 ? TONE_TEXT.warning : TONE_TEXT.positive)}>{openExceptions}</span>
        <span className="ml-auto hidden text-muted-foreground sm:inline">Klik counter untuk masuk antrean</span>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <Card className="overflow-hidden bg-foreground text-background">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-background/55">Okupansi malam ini</p>
                <p className="mt-2 text-5xl font-semibold tracking-[-0.06em] tabular-nums">
                  {data.occupancyPercent}
                  <span className="ml-1 text-2xl text-background/50">%</span>
                </p>
              </div>
              <span className="rounded-sm bg-background/10 px-2 py-1 text-[11px] font-medium text-background/70">Live</span>
            </div>
            <progress aria-label="Okupansi malam ini" className="mt-8 h-1.5 w-full overflow-hidden rounded-sm accent-white" max={100} value={data.occupancyPercent} />
            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-background/15 pt-4 sm:grid-cols-4">
              <div>
                <p className="text-[11px] text-background/45">Terisi</p>
                <p className="mt-1 text-xl font-semibold tabular-nums">{data.occupied}</p>
              </div>
              <div>
                <p className="text-[11px] text-background/45">Tersedia</p>
                <p className="mt-1 text-xl font-semibold tabular-nums">{data.available}</p>
              </div>
              <div>
                <p className="text-[11px] text-background/45">Kedatangan</p>
                <p className="mt-1 text-xl font-semibold tabular-nums">{data.arrivalsToday}</p>
              </div>
              <div>
                <p className="text-[11px] text-background/45">Keberangkatan</p>
                <p className="mt-1 text-xl font-semibold tabular-nums">{data.departuresToday}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pergerakan tamu</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-x-5 py-1">
            <Metric label="Kedatangan" value={data.arrivalsToday} />
            <Metric label="Keberangkatan" value={data.departuresToday} />
            <Metric label="Kamar terisi" value={data.occupied} tone="info" />
            <Metric label="Kamar tersedia" value={data.available} tone="positive" />
          </CardContent>
        </Card>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">Exception → antrean</h2>
            <p className="text-xs text-muted-foreground">Counter sisa pekerjaan; klik untuk membuka antrean terkait.</p>
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">{openExceptions} aktif</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {exceptions.map((item) => (
            <ExceptionCounter key={item.label} item={item} />
          ))}
        </div>
      </div>

      <div className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Aksi cepat</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-px bg-border p-0 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { to: "/reservations/new", label: "Buat reservasi", icon: CalendarCheck },
              { to: "/front-desk", label: "Front desk", icon: DoorOpen },
              { to: "/approvals", label: "Antrean approval", icon: ClipboardCheck },
              { to: "/access", label: "Monitor akses", icon: ShieldAlert },
            ].map((action) => (
              <Link
                key={action.to}
                className="group flex min-h-24 flex-col justify-between bg-card p-4 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                to={action.to}
              >
                <action.icon className="size-4 text-muted-foreground group-hover:text-primary" />
                <span className="flex items-center justify-between gap-2">
                  {action.label}
                  <ArrowRight className="size-3.5 text-muted-foreground" />
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
