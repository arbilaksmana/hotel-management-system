import { useQuery } from "@tanstack/react-query";
import { auditService } from "@/services/mock";
import { qk } from "@/services/query-keys";
import { useAuth } from "@/app/providers/AuthProvider";
import { PageHeader } from "@/components/shared/PageHeader";
import { formatDateTime } from "@/lib/format";

export function AuditPage() {
  const { hotelId } = useAuth();
  const { data = [] } = useQuery({ queryKey: qk.audit(hotelId), queryFn: () => auditService.list(hotelId), refetchInterval: 4000 });

  return (
    <div>
      <PageHeader title="Audit Trail" subtitle="Log aktivitas sensitif, immutable (append-only)." />
      <div className="rounded-lg border bg-card">
        <div className="flex items-center justify-between border-b px-4 py-2.5">
          <p className="text-sm font-semibold">{data.length} entri</p>
          <p className="text-xs text-muted-foreground">Geser untuk melihat kolom lainnya</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-secondary/50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="sticky left-0 z-10 bg-secondary/50 px-4 py-2.5 font-medium">Waktu</th>
                <th className="px-4 py-2.5 font-medium">Aktor</th>
                <th className="px-4 py-2.5 font-medium">Aksi</th>
                <th className="px-4 py-2.5 font-medium">Entitas</th>
                <th className="px-4 py-2.5 font-medium">Alasan</th>
                <th className="px-4 py-2.5 font-medium">Sumber</th>
              </tr>
            </thead>
            <tbody>
              {data.map((a) => (
                <tr key={a.id} className="border-t transition-colors hover:bg-accent/30">
                  <td className="sticky left-0 z-10 bg-card px-4 py-2.5 text-muted-foreground tabular-nums">{formatDateTime(a.createdAt)}</td>
                  <td className="px-4 py-2.5">{a.actorName} <span className="text-xs text-muted-foreground">({a.actorRole})</span></td>
                  <td className="px-4 py-2.5 font-medium">{a.action}</td>
                  <td className="px-4 py-2.5 text-muted-foreground tabular-nums">{a.entity} · {a.entityId}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{a.reason ?? "–"}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{a.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
