import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { accessService } from "@/services/mock";
import { qk } from "@/services/query-keys";
import { useAuth } from "@/app/providers/AuthProvider";
import { useToast } from "@/components/feedback/Toast";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { rooms } from "@/data/seed";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export function AccessPage() {
  const { user, hotelId, can } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { data: cards = [] } = useQuery({ queryKey: qk.cards(hotelId), queryFn: () => accessService.listCards(hotelId), refetchInterval: 4000 });
  const { data: events = [] } = useQuery({ queryKey: qk.doorEvents(hotelId), queryFn: () => accessService.listDoorEvents(hotelId), refetchInterval: 4000 });

  const [cardUid, setCardUid] = React.useState(cards[0]?.cardUid ?? "");
  const [roomId, setRoomId] = React.useState(rooms[0]!.id);
  const [anomalyNote, setAnomalyNote] = React.useState("");

  const simulate = useMutation({
    mutationFn: () => accessService.simulateDoorEvent(user!, cardUid, roomId),
    onSuccess: (e) => {
      queryClient.invalidateQueries();
      toast.push(e.anomaly ? { kind: "error", title: "ACCESS ANOMALY: kartu tanpa reservasi valid." } : { kind: "success", title: "Door event valid diproses." });
    },
    onError: (e: Error) => toast.push({ kind: "error", title: e.message }),
  });
  const resolve = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => accessService.resolveAnomaly(user!, id, note),
    onSuccess: () => { queryClient.invalidateQueries(); toast.push({ kind: "success", title: "Anomaly diselesaikan." }); },
    onError: (e: Error) => toast.push({ kind: "error", title: e.message }),
  });

  return (
    <div>
      <PageHeader title="Kartu & Monitor Akses" subtitle="Manajemen kartu, event door lock (simulator), dan rekonsiliasi anomaly." />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Event Door Lock</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {events.map((e) => (
              <div key={e.id} className={cn("flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2", e.anomaly && "border-red-300 bg-red-50")}>
                <div>
                  <p className="text-sm font-medium">Kamar {e.roomNumber} · kartu {e.cardUid}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(e.eventTime)} · {e.deviceId} · {e.note}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={e.eventType} />
                  {e.anomaly ? <span className="rounded-sm bg-destructive px-2 py-0.5 text-[11px] font-semibold text-destructive-foreground">ANOMALY</span> : null}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Daftar Kartu</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {cards.length === 0 ? <p className="text-sm text-muted-foreground">Belum ada kartu.</p> : cards.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                  <div>
                    <p className="font-mono text-xs">{c.cardUid}</p>
                    <p className="text-xs text-muted-foreground">Kamar {c.roomNumber}</p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
              ))}
            </CardContent>
          </Card>

          {can("doorevent:simulate") ? (
            <Card>
              <CardHeader><CardTitle>Simulator Door Event</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Card UID</Label>
                  <Select value={cardUid} onChange={(e) => setCardUid(e.target.value)}>
                    {cards.map((c) => <option key={c.id} value={c.cardUid}>{c.cardUid} · kamar {c.roomNumber}</option>)}
                    <option value="UNKNOWNXYZ">UNKNOWNXYZ (kartu asing)</option>
                  </Select>
                </div>
                <div>
                  <Label>Kamar</Label>
                  <Select value={roomId} onChange={(e) => setRoomId(e.target.value)}>
                    {rooms.filter((r) => r.active).map((r) => <option key={r.id} value={r.id}>{r.number}</option>)}
                  </Select>
                </div>
                <Button className="w-full" onClick={() => simulate.mutate()} disabled={simulate.isPending}>
                  {simulate.isPending ? "Memproses…" : "Kirim Door Event"}
                </Button>
                <p className="text-xs text-muted-foreground">Event tanpa reservasi valid membuat ACCESS ANOMALY dan memblokir kamar sementara (BR-07/FR-082).</p>
              </CardContent>
            </Card>
          ) : null}

          {events.some((e) => e.anomaly) && can("anomaly:resolve") ? (
            <Card>
              <CardHeader><CardTitle>Rekonsiliasi</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <Input placeholder="Catatan penyelesaian…" value={anomalyNote} onChange={(e) => setAnomalyNote(e.target.value)} />
                {events.filter((e) => e.anomaly).map((e) => (
                  <Button key={e.id} size="sm" variant="outline" onClick={() => resolve.mutate({ id: e.id, note: anomalyNote || "Ditangani supervisor" })}>
                    Selesaikan anomaly {e.roomNumber}
                  </Button>
                ))}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
