import { useQuery } from "@tanstack/react-query";
import { auditService } from "@/services/mock";
import { qk } from "@/services/query-keys";
import { useAuth } from "@/app/providers/AuthProvider";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";

export function AuditPage() {
  const { hotelId } = useAuth();
  const { data = [] } = useQuery({ queryKey: qk.audit(hotelId), queryFn: () => auditService.list(hotelId), refetchInterval: 4000 });

  return (
    <div>
      <PageHeader title="Audit Trail" subtitle="Log aktivitas sensitif, immutable (append-only)." />
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-left text-xs text-muted-foreground">
            <tr><th className="px-4 py-2">Waktu</th><th className="px-4 py-2">Aktor</th><th className="px-4 py-2">Aksi</th><th className="px-4 py-2">Entitas</th><th className="px-4 py-2">Alasan</th><th className="px-4 py-2">Sumber</th></tr>
          </thead>
          <tbody>
            {data.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="px-4 py-2 text-muted-foreground">{formatDateTime(a.createdAt)}</td>
                <td className="px-4 py-2">{a.actorName} <span className="text-xs text-muted-foreground">({a.actorRole})</span></td>
                <td className="px-4 py-2 font-medium">{a.action}</td>
                <td className="px-4 py-2 text-muted-foreground">{a.entity} · {a.entityId}</td>
                <td className="px-4 py-2 text-muted-foreground">{a.reason ?? "-"}</td>
                <td className="px-4 py-2 text-muted-foreground">{a.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
