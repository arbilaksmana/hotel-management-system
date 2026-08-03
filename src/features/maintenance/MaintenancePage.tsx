import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { maintenanceService } from "@/services/mock";
import { qk } from "@/services/query-keys";
import { useAuth } from "@/app/providers/AuthProvider";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";

export function MaintenancePage() {
  const { user, hotelId } = useAuth();
  const queryClient = useQueryClient();
  const { data = [] } = useQuery({ queryKey: qk.maintenance(hotelId), queryFn: () => maintenanceService.list(hotelId), refetchInterval: 4000 });
  const resolve = useMutation({
    mutationFn: (id: string) => maintenanceService.resolve(user!, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["maintenance"] }),
  });

  const open = data.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS");
  const closed = data.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED");

  return (
    <div>
      <PageHeader title="Maintenance" subtitle="Tiket perbaikan; kamar OUT OF ORDER tidak dapat dijual (BR-11)." />
      <div className="space-y-4">
        <div className="rounded-lg border bg-card">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="text-sm font-semibold tracking-tight">Tiket aktif</h2>
            <span className="text-xs text-muted-foreground tabular-nums">{open.length} tiket</span>
          </div>
          <div className="space-y-1 p-3">
            {open.length === 0 ? (
              <p className="px-2 py-6 text-center text-xs text-muted-foreground">Tidak ada tiket aktif.</p>
            ) : open.map((t) => (
              <div key={t.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-background px-3 py-2.5 transition-colors hover:bg-accent/30">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">Kamar {t.roomNumber} · {t.title}</p>
                    <StatusBadge status={t.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">Prioritas {t.priority} · teknisi {t.technician ?? "–"}</p>
                  {t.blockFrom ? <p className="text-xs text-muted-foreground tabular-nums">Blok: {formatDate(t.blockFrom)} – {t.blockTo ? formatDate(t.blockTo) : "–"}</p> : null}
                </div>
                <Button type="button" size="sm" variant="outline" onClick={() => resolve.mutate(t.id)}>Tandai Selesai</Button>
              </div>
            ))}
          </div>
        </div>

        {closed.length > 0 ? (
          <div className="rounded-lg border bg-card">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="text-sm font-semibold tracking-tight text-muted-foreground">Riwayat</h2>
              <span className="text-xs text-muted-foreground tabular-nums">{closed.length} tiket</span>
            </div>
            <div className="space-y-1 p-3">
              {closed.map((t) => (
                <div key={t.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-background px-3 py-2.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-muted-foreground">Kamar {t.roomNumber} · {t.title}</p>
                      <StatusBadge status={t.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">Prioritas {t.priority} · teknisi {t.technician ?? "–"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
