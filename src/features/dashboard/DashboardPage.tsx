import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarCheck, ClipboardCheck, DoorOpen, ShieldAlert } from "lucide-react";
import { dashboardService } from "@/services/mock";
import { qk } from "@/services/query-keys";
import { useAuth } from "@/app/providers/AuthProvider";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { todayIso } from "@/domain/rules/dates";
import { cn } from "@/lib/utils";
import type { StatusTone } from "@/components/shared/status-tokens";

const TONE_TEXT: Record<StatusTone, string> = {
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

  return (
    <div>
      <PageHeader title="Dashboard operasional" subtitle={`Posisi hotel dan pekerjaan yang perlu ditangani hari ini · ${date}`} />
      <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr_1fr]">
        <Card className="overflow-hidden bg-foreground text-background">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-background/55">Okupansi malam ini</p>
                <p className="mt-2 text-5xl font-semibold tracking-[-0.06em] tabular-nums">{data.occupancyPercent}<span className="ml-1 text-2xl text-background/50">%</span></p>
              </div>
              <span className="rounded-sm bg-background/10 px-2 py-1 text-[11px] font-medium text-background/70">Live</span>
            </div>
            <progress aria-label="Okupansi malam ini" className="mt-8 h-1.5 w-full overflow-hidden rounded-sm accent-white" max="100" value={data.occupancyPercent} />
            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-background/15 pt-4">
              <div><p className="text-[11px] text-background/45">Terisi</p><p className="mt-1 text-xl font-semibold tabular-nums">{data.occupied}</p></div>
              <div><p className="text-[11px] text-background/45">Tersedia</p><p className="mt-1 text-xl font-semibold tabular-nums">{data.available}</p></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Pergerakan tamu</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-x-5 py-1">
            <Metric label="Kedatangan" value={data.arrivalsToday} />
            <Metric label="Keberangkatan" value={data.departuresToday} />
            <Metric label="Kamar terisi" value={data.occupied} tone="info" />
            <Metric label="Kamar tersedia" value={data.available} tone="positive" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Perlu perhatian</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-x-5 py-1">
            <Metric label="Kotor / cleaning" value={`${data.dirty} / ${data.cleaning}`} tone="attention" />
            <Metric label="Pembayaran" value={data.pendingPayments} tone="warning" />
            <Metric label="Approval" value={data.pendingApprovals} tone="special" />
            <Metric label="Anomali akses" value={data.anomalies} tone="danger" />
          </CardContent>
        </Card>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_2fr]">
        <Card>
          <CardHeader><CardTitle>Kapasitas tidak aktif</CardTitle></CardHeader>
          <CardContent className="flex items-end justify-between p-4">
            <div><p className="text-3xl font-semibold tracking-tight tabular-nums">{data.blocked + data.maintenance}</p><p className="mt-1 text-xs text-muted-foreground">{data.blocked} diblokir · {data.maintenance} maintenance</p></div>
            <DoorOpen className="size-5 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Aksi cepat</CardTitle></CardHeader>
          <CardContent className="grid gap-px bg-border p-0 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { to: "/reservations/new", label: "Buat reservasi", icon: CalendarCheck },
              { to: "/front-desk", label: "Front desk", icon: DoorOpen },
              { to: "/approvals", label: "Antrean approval", icon: ClipboardCheck },
              { to: "/access", label: "Monitor akses", icon: ShieldAlert },
            ].map((action) => (
              <Link key={action.to} className="group flex min-h-24 flex-col justify-between bg-card p-4 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring" to={action.to}>
                <action.icon className="size-4 text-muted-foreground group-hover:text-primary" />
                <span className="flex items-center justify-between gap-2">{action.label}<ArrowRight className="size-3.5 text-muted-foreground" /></span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
