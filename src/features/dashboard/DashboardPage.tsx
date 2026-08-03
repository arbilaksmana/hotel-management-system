import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
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

function StatCard({ label, value, tone }: { label: string; value: React.ReactNode; tone?: StatusTone }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn("mt-1 text-2xl font-semibold tabular-nums", tone && TONE_TEXT[tone])}>{value}</p>
      </CardContent>
    </Card>
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
      <PageHeader title="Dashboard Operasional" subtitle={`Ringkasan hari ini (${date}).`} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Okupansi" value={`${data.occupancyPercent}%`} />
        <StatCard label="Kamar Terisi (Occupied)" value={data.occupied} tone="info" />
        <StatCard label="Tersedia" value={data.available} tone="positive" />
        <StatCard label="Kedatangan Hari Ini" value={data.arrivalsToday} />
        <StatCard label="Keberangkatan Hari Ini" value={data.departuresToday} />
        <StatCard label="Kotor / Dibersihkan" value={`${data.dirty} / ${data.cleaning}`} tone="attention" />
        <StatCard label="Pembayaran Menunggu" value={data.pendingPayments} tone="warning" />
        <StatCard label="Approval Menunggu" value={data.pendingApprovals} tone="special" />
        <StatCard label="Access Anomaly" value={data.anomalies} tone="danger" />
        <StatCard label="Diblokir / Maintenance" value={`${data.blocked} / ${data.maintenance}`} />
      </div>
      <Card className="mt-5">
        <CardHeader>
          <CardTitle>Aksi cepat</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 text-sm">
          <Link className="rounded-md border px-3 py-2 hover:bg-accent" to="/reservations/new">Buat Reservasi</Link>
          <Link className="rounded-md border px-3 py-2 hover:bg-accent" to="/front-desk">Front Desk (Check-in/out)</Link>
          <Link className="rounded-md border px-3 py-2 hover:bg-accent" to="/approvals">Antrean Approval</Link>
          <Link className="rounded-md border px-3 py-2 hover:bg-accent" to="/access">Monitor Akses</Link>
        </CardContent>
      </Card>
    </div>
  );
}
