import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { maintenanceService } from "@/services/mock";
import { qk } from "@/services/query-keys";
import { useAuth } from "@/app/providers/AuthProvider";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/format";

export function MaintenancePage() {
  const { user, hotelId } = useAuth();
  const queryClient = useQueryClient();
  const { data = [] } = useQuery({ queryKey: qk.maintenance(hotelId), queryFn: () => maintenanceService.list(hotelId), refetchInterval: 4000 });
  const resolve = useMutation({
    mutationFn: (id: string) => maintenanceService.resolve(user!, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["maintenance"] }),
  });

  return (
    <div>
      <PageHeader title="Maintenance" subtitle="Tiket perbaikan; kamar OUT OF ORDER tidak dapat dijual (BR-11)." />
      <div className="grid gap-3">
        {data.map((t) => (
          <Card key={t.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">Kamar {t.roomNumber} · {t.title}</p>
                  <StatusBadge status={t.status} />
                </div>
                <p className="text-sm text-muted-foreground">Prioritas {t.priority} · teknisi {t.technician ?? "-"}</p>
                {t.blockFrom ? <p className="text-xs text-muted-foreground">Blok: {formatDate(t.blockFrom)} ? {t.blockTo ? formatDate(t.blockTo) : "-"}</p> : null}
              </div>
              {t.status !== "RESOLVED" && t.status !== "CLOSED" ? (
                <Button size="sm" variant="outline" onClick={() => resolve.mutate(t.id)}>Tandai Selesai</Button>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
