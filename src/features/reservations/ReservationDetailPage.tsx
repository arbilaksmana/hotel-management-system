import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { paymentService, reservationService, frontDeskService } from "@/services/mock";
import { qk } from "@/services/query-keys";
import { useAuth } from "@/app/providers/AuthProvider";
import { useToast } from "@/components/feedback/Toast";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { MoneyText } from "@/components/shared/MoneyText";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { policy, guests } from "@/data/seed";
import { dpThreshold } from "@/domain/rules/dp";
import { formatDateTime } from "@/lib/format";
import type { PaymentMethod } from "@/domain/types";

function useCountdown(target?: string) {
  const [, tick] = React.useReducer((x: number) => x + 1, 0);
  React.useEffect(() => {
    const t = window.setInterval(() => tick(), 1000);
    return () => window.clearInterval(t);
  }, []);
  if (!target) return null;
  const ms = new Date(target).getTime() - Date.now();
  if (ms <= 0) return "kedaluwarsa";
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}m ${s}s`;
}

export function ReservationDetailPage() {
  const { id = "" } = useParams();
  const { user, hotelId, can } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries();

  const { data: res } = useQuery({ queryKey: qk.reservation(id), queryFn: () => reservationService.get(id), refetchInterval: 4000 });
  const { data: payments = [] } = useQuery({ queryKey: qk.payments(hotelId, id), queryFn: () => paymentService.listFor(hotelId, id), refetchInterval: 4000 });

  const holdLeft = useCountdown(res?.holdExpiresAt);

  const [payOpen, setPayOpen] = React.useState(false);
  const [method, setMethod] = React.useState<PaymentMethod>("TRANSFER");
  const [amount, setAmount] = React.useState("");
  const [reference, setReference] = React.useState("");
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [checkinOpen, setCheckinOpen] = React.useState(false);

  const record = useMutation({
    mutationFn: () => paymentService.record(user!, { reservationId: id, method, amount: Number(amount), isDeposit: true, reference }),
    onSuccess: (p) => {
      invalidate();
      setPayOpen(false);
      toast.push({ kind: "success", title: p.status === "PENDING" ? "Pembayaran dicatat, menunggu verifikasi." : "Pembayaran terverifikasi." });
    },
    onError: (e: Error) => toast.push({ kind: "error", title: e.message }),
  });
  const verify = useMutation({
    mutationFn: (paymentId: string) => paymentService.verify(user!, paymentId),
    onSuccess: () => { invalidate(); toast.push({ kind: "success", title: "Pembayaran diverifikasi." }); },
    onError: (e: Error) => toast.push({ kind: "error", title: e.message }),
  });
  const cancel = useMutation({
    mutationFn: () => reservationService.cancel(user!, id, "Dibatalkan melalui detail."),
    onSuccess: () => { invalidate(); setCancelOpen(false); toast.push({ kind: "info", title: "Reservasi dibatalkan." }); },
    onError: (e: Error) => toast.push({ kind: "error", title: e.message }),
  });
  const checkIn = useMutation({
    mutationFn: () => frontDeskService.checkIn(user!, id),
    onSuccess: () => { invalidate(); setCheckinOpen(false); toast.push({ kind: "success", title: "Tamu check-in." }); },
    onError: (e: Error) => toast.push({ kind: "error", title: e.message }),
  });
  const checkOut = useMutation({
    mutationFn: () => frontDeskService.checkOut(user!, id),
    onSuccess: () => { invalidate(); toast.push({ kind: "success", title: "Tamu checkout. Kamar menjadi kotor." }); },
    onError: (e: Error) => toast.push({ kind: "error", title: e.message }),
  });
  const extendHold = useMutation({
    mutationFn: () => reservationService.extendHold(user!, id, 120, "Perpanjangan supervisor."),
    onSuccess: () => { invalidate(); toast.push({ kind: "success", title: "HOLD diperpanjang 2 jam." }); },
    onError: (e: Error) => toast.push({ kind: "error", title: e.message }),
  });

  if (!res) return <p className="p-6 text-sm text-muted-foreground">Memuat…</p>;

  const fullPerNight = Math.round(res.baseRateTotal / Math.max(1, res.nights));
  const threshold = dpThreshold(res.totalAmount, fullPerNight, policy);
  const guest = guests.find((g) => g.id === res.guestId);

  return (
    <div>
      <PageHeader
        title={`${res.bookingCode} · ${res.guestName}`}
        subtitle={`${res.rooms.map((r) => r.roomNumber).join(", ")} · ${res.channel}`}
        actions={<StatusBadge status={res.status} className="text-sm" />}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Rincian</CardTitle></CardHeader>
            <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
              <div><p className="text-muted-foreground">Periode</p><p>{res.checkInDate} ? {res.checkOutDate} ({res.nights} malam)</p></div>
              <div><p className="text-muted-foreground">Tamu</p><p>{res.guestName} {guest?.idNumber ? `(ID ${guest.idNumber})` : "(identitas belum lengkap)"}</p></div>
              <div><p className="text-muted-foreground">Subtotal</p><MoneyText value={res.baseRateTotal} /></div>
              <div><p className="text-muted-foreground">Diskon</p><p className="tabular-nums">{Math.round(res.discountPercent * 100)}%</p></div>
              <div><p className="text-muted-foreground">Total</p><MoneyText value={res.totalAmount} className="text-base font-semibold" /></div>
              <div><p className="text-muted-foreground">DP minimum</p><MoneyText value={Math.min(threshold, res.totalAmount)} /></div>
              <div><p className="text-muted-foreground">Terbayar</p><MoneyText value={res.paidAmount} className="text-emerald-700" /></div>
              {res.holdExpiresAt && ["HOLD", "PENDING_PAYMENT", "PENDING_APPROVAL", "EXPIRED"].includes(res.status) ? (
                <div><p className="text-muted-foreground">Sisa HOLD</p><p className="animate-pulse-soft font-medium text-amber-700">{holdLeft}</p></div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Pembayaran</CardTitle>
              {can("payment:record") ? <Button size="sm" onClick={() => { setMethod("TRANSFER"); setAmount(""); setReference(""); setPayOpen(true); }}>Catat Pembayaran</Button> : null}
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? <p className="text-sm text-muted-foreground">Belum ada pembayaran.</p> : (
                <table className="w-full text-sm">
                  <thead className="text-left text-xs text-muted-foreground">
                    <tr><th className="py-1">Metode</th><th className="text-right">Jumlah</th><th>Status</th><th>Waktu</th><th></th></tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id} className="border-t">
                        <td className="py-2">{p.method} {p.isDeposit ? "(DP)" : ""}</td>
                        <td className="text-right"><MoneyText value={p.amount} /></td>
                        <td><StatusBadge status={p.status} /></td>
                        <td className="text-muted-foreground">{formatDateTime(p.createdAt)}</td>
                        <td className="text-right">
                          {p.status === "PENDING" && can("payment:verify") ? (
                            <Button size="sm" variant="outline" onClick={() => verify.mutate(p.id)}>Verifikasi</Button>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <p className="mt-2 text-xs text-muted-foreground">Upload bukti transfer tidak sama dengan verifikasi; hanya pembayaran VERIFIED yang mengunci kamar (BR-02/BR-03).</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          <Card>
            <CardHeader><CardTitle>Aksi</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-2">
              {["HOLD", "PENDING_PAYMENT", "EXPIRED"].includes(res.status) && can("hold:extend") ? (
                <Button variant="outline" onClick={() => extendHold.mutate()} disabled={extendHold.isPending}>Perpanjang HOLD 2 jam</Button>
              ) : null}
              {["CONFIRMED", "PARTIALLY_PAID"].includes(res.status) && can("checkin:perform") ? (
                <Button onClick={() => setCheckinOpen(true)}>Check-in</Button>
              ) : null}
              {res.status === "CHECKED_IN" && can("checkout:perform") ? (
                <Button variant="outline" onClick={() => checkOut.mutate()} disabled={checkOut.isPending}>Checkout</Button>
              ) : null}
              {!["CANCELLED", "CHECKED_OUT", "REJECTED"].includes(res.status) && can("reservation:cancel") ? (
                <Button variant="destructive" onClick={() => setCancelOpen(true)}>Batalkan Reservasi</Button>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog
        open={payOpen}
        onOpenChange={setPayOpen}
        title="Catat Pembayaran"
        footer={
          <>
            <Button variant="outline" onClick={() => setPayOpen(false)}>Batal</Button>
            <Button onClick={() => record.mutate()} disabled={!amount || record.isPending}>Simpan</Button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <Label>Metode</Label>
            <Select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
              <option value="TRANSFER">Transfer</option>
              <option value="CASH">Tunai</option>
              <option value="CARD">Kartu</option>
            </Select>
          </div>
          <div>
            <Label>Jumlah</Label>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
          </div>
          {method === "TRANSFER" ? (
            <div>
              <Label>Referensi / catatan bukti</Label>
              <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="No. referensi transfer" />
            </div>
          ) : null}
        </div>
      </Dialog>

      <ConfirmDialog open={cancelOpen} onOpenChange={setCancelOpen} title="Batalkan reservasi?" body="Status menjadi Batal dan kamar yang ditahan dilepas." destructive confirmLabel="Batalkan" onConfirm={() => cancel.mutate()} loading={cancel.isPending} />
      <ConfirmDialog open={checkinOpen} onOpenChange={setCheckinOpen} title="Proses check-in?" body="Sistem memeriksa eligibility (status kamar, DP, identitas). Setelah sukses, tamu resmi menempati kamar." confirmLabel="Check-in" onConfirm={() => checkIn.mutate()} loading={checkIn.isPending} />
    </div>
  );
}


