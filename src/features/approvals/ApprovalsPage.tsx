import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { approvalService } from "@/services/mock";
import { qk } from "@/services/query-keys";
import { useAuth } from "@/app/providers/AuthProvider";
import { useToast } from "@/components/feedback/Toast";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { MoneyText } from "@/components/shared/MoneyText";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Dialog } from "@/components/ui/dialog";
import { Textarea, Label } from "@/components/ui/input";
import { formatDateTime } from "@/lib/format";
import type { DiscountRequest } from "@/domain/types";

export function ApprovalsPage() {
  const { user, hotelId } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { data = [] } = useQuery({ queryKey: qk.approvals(hotelId), queryFn: () => approvalService.list(hotelId), refetchInterval: 5000 });

  const [active, setActive] = React.useState<DiscountRequest | null>(null);
  const [action, setAction] = React.useState<"APPROVED" | "REJECTED" | "REVISION_REQUESTED">("APPROVED");
  const [reason, setReason] = React.useState("");

  const decide = useMutation({
    mutationFn: () => approvalService.decide(user!, active!.id, action, reason || "–"),
    onSuccess: () => {
      queryClient.invalidateQueries();
      setActive(null);
      toast.push({ kind: "success", title: "Keputusan tersimpan." });
    },
    onError: (e: Error) => toast.push({ kind: "error", title: e.message }),
  });

  const open = (d: DiscountRequest, a: typeof action) => {
    setActive(d);
    setAction(a);
    setReason("");
  };

  return (
    <div>
      <PageHeader title="Approval Diskon" subtitle="Antrean permintaan diskon di luar batas kewenangan standar." />
      {data.length === 0 ? (
        <EmptyState title="Tidak ada permintaan" hint="Permintaan diskon akan muncul di sini." />
      ) : (
        <div className="grid gap-3">
          {data.map((d) => (
            <Card key={d.id}>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{Math.round(d.requestedPercent * 100)}% · {d.reservationId}</p>
                      <StatusBadge status={d.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{d.reason}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Butuh approval: {d.requiredApproverRole.replace(/_/g, " ")} · SLA sampai {formatDateTime(d.slaDeadline)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Harga dasar ? final</p>
                    <p className="text-sm"><MoneyText value={d.basePrice} muted /> ? <MoneyText value={d.finalPrice} /></p>
                  </div>
                </div>
                {d.status === "PENDING" ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => open(d, "APPROVED")}>Setujui</Button>
                    <Button size="sm" variant="outline" onClick={() => open(d, "REVISION_REQUESTED")}>Minta Revisi</Button>
                    <Button size="sm" variant="destructive" onClick={() => open(d, "REJECTED")}>Tolak</Button>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={Boolean(active)}
        onOpenChange={(o) => !o && setActive(null)}
        title={action === "APPROVED" ? "Setujui diskon" : action === "REJECTED" ? "Tolak diskon" : "Minta revisi"}
        footer={
          <>
            <Button variant="outline" onClick={() => setActive(null)}>Batal</Button>
            <Button variant={action === "REJECTED" ? "destructive" : "default"} onClick={() => decide.mutate()} disabled={decide.isPending}>
              {decide.isPending ? "Menyimpan…" : "Simpan"}
            </Button>
          </>
        }
      >
        <Label>Alasan keputusan</Label>
        <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Tuliskan alasan untuk audit trail…" />
      </Dialog>
    </div>
  );
}
