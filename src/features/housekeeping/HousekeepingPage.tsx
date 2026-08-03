import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { housekeepingService } from "@/services/mock";
import { qk } from "@/services/query-keys";
import { useAuth } from "@/app/providers/AuthProvider";
import { useToast } from "@/components/feedback/Toast";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import type { HousekeepingStatus } from "@/domain/types";

const COLS: { key: HousekeepingStatus; label: string }[] = [
  { key: "DIRTY", label: "Kotor" },
  { key: "CLEANING", label: "Dibersihkan" },
  { key: "CLEAN", label: "Bersih" },
  { key: "INSPECTED", label: "Dicek" },
];

const NEXT_LABEL: Partial<Record<HousekeepingStatus, string>> = {
  DIRTY: "Mulai Bersihkan",
  CLEANING: "Tandai Bersih",
  CLEAN: "Tandai Dicek",
};

export function HousekeepingPage() {
  const { user, hotelId } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { data = [] } = useQuery({ queryKey: qk.housekeeping(hotelId), queryFn: () => housekeepingService.list(hotelId), refetchInterval: 4000 });
  const advance = useMutation({
    mutationFn: (taskId: string) => housekeepingService.advance(user!, taskId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["housekeeping"] }),
    onError: (e: Error) => toast.push({ kind: "error", title: e.message }),
  });

  return (
    <div>
      <PageHeader title="Housekeeping" subtitle="Alur Kotor → Dibersihkan → Bersih → Dicek." />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {COLS.map((col) => {
          const tasks = data.filter((t) => t.status === col.key);
          return (
            <div key={col.key} className="rounded-lg border bg-card">
              <div className="flex items-center justify-between border-b px-3 py-2.5">
                <p className="text-sm font-semibold">{col.label}</p>
                <span className="text-xs text-muted-foreground tabular-nums">{tasks.length}</span>
              </div>
              <div className="space-y-1.5 p-2">
                {tasks.length === 0 ? (
                  <p className="px-2 py-6 text-center text-xs text-muted-foreground">Tidak ada pekerjaan</p>
                ) : tasks.map((t) => (
                  <div key={t.id} className="rounded-md border bg-background p-2.5 transition-colors hover:bg-accent/30">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold tabular-nums">Kamar {t.roomNumber}</p>
                      <StatusBadge status={t.status} />
                    </div>
                    {t.assignee ? <p className="mt-0.5 text-xs text-muted-foreground">{t.assignee}</p> : null}
                    {NEXT_LABEL[t.status] ? (
                      <Button type="button" size="sm" variant="outline" className="mt-2 w-full" onClick={() => advance.mutate(t.id)} disabled={advance.isPending}>
                        {NEXT_LABEL[t.status]}
                      </Button>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
