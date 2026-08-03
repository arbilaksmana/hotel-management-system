import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { reservationService } from "@/services/mock";
import { useAuth } from "@/app/providers/AuthProvider";
import { useToast } from "@/components/feedback/Toast";
import { PageHeader } from "@/components/shared/PageHeader";
import { MoneyText } from "@/components/shared/MoneyText";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { guests, ratePlans, rooms, roomTypes } from "@/data/seed";
import { addDays, format } from "date-fns";
import { nightsBetween } from "@/domain/rules/dates";
import { formatIdr } from "@/lib/format";

const schema = z.object({
  guestId: z.string().min(1, "Pilih tamu."),
  channel: z.string().min(1),
  checkInDate: z.string().min(1, "Tanggal check-in wajib."),
  checkOutDate: z.string().min(1, "Tanggal checkout wajib."),
  ratePlanId: z.string().min(1, "Pilih rate plan."),
  discountPercent: z.number().min(0).max(0.5, "Maksimal 50%."),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function ReservationNewPage() {
  const { user, hotelId } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [params] = useSearchParams();
  const preRoom = params.get("room");
  const preDate = params.get("date");

  const today = format(new Date(), "yyyy-MM-dd");
  const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      guestId: "",
      channel: "WALK_IN",
      checkInDate: preDate ?? today,
      checkOutDate: tomorrow,
      ratePlanId: "",
      discountPercent: 0,
      notes: "",
    },
  });

  const [selectedRooms, setSelectedRooms] = React.useState<string[]>(preRoom ? [preRoom] : []);
  const ratePlanId = watch("ratePlanId");
  const checkInDate = watch("checkInDate");
  const checkOutDate = watch("checkOutDate");
  const discountPercent = Number(watch("discountPercent")) || 0;

  const plan = ratePlans.find((r) => r.id === ratePlanId);
  const eligibleRooms = plan ? rooms.filter((r) => r.roomTypeId === plan.roomTypeId && r.active) : [];
  const nights = checkInDate && checkOutDate ? nightsBetween(checkInDate, checkOutDate) : 0;
  const baseTotal = plan ? selectedRooms.length * plan.pricePerNight * nights : 0;
  const total = Math.round(baseTotal * (1 - discountPercent));

  const create = useMutation({
    mutationFn: (values: FormValues) =>
      reservationService.create(user!, {
        hotelId,
        guestId: values.guestId,
        guestName: guests.find((g) => g.id === values.guestId)?.fullName ?? "",
        channel: values.channel as never,
        checkInDate: values.checkInDate,
        checkOutDate: values.checkOutDate,
        ratePlanId: values.ratePlanId,
        roomIds: selectedRooms,
        discountPercent,
        notes: values.notes,
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries();
      toast.push({ kind: "success", title: res.status === "PENDING_APPROVAL" ? "Reservasi dibuat, menunggu approval diskon." : "Reservasi dibuat (HOLD)." });
      navigate(`/reservations/${res.id}`);
    },
    onError: (e: Error) => toast.push({ kind: "error", title: e.message }),
  });

  const toggleRoom = (id: string) =>
    setSelectedRooms((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <div>
      <PageHeader title="Buat Reservasi" subtitle="Isi data, pilih rate plan & kamar, sistem menahan kamar sebagai HOLD." />
      <form onSubmit={handleSubmit((v) => create.mutate(v))}>
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardContent className="space-y-4 p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="guestId">Tamu</Label>
                  <Select id="guestId" {...register("guestId")}>
                    <option value="">Pilih tamu…</option>
                    {guests.map((g) => (
                      <option key={g.id} value={g.id}>{g.fullName}</option>
                    ))}
                  </Select>
                  {errors.guestId ? <p className="mt-1 text-xs text-destructive">{errors.guestId.message}</p> : null}
                </div>
                <div>
                  <Label htmlFor="channel">Channel</Label>
                  <Select id="channel" {...register("channel")}>
                    <option value="WALK_IN">Walk-in</option>
                    <option value="PHONE">Telepon</option>
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="WEBSITE">Website</option>
                    <option value="OTA">OTA</option>
                    <option value="CORPORATE">Corporate</option>
                    <option value="TRAVEL_AGENT">Travel Agent</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="checkInDate">Check-in</Label>
                  <Input id="checkInDate" type="date" {...register("checkInDate")} />
                  {errors.checkInDate ? <p className="mt-1 text-xs text-destructive">{errors.checkInDate.message}</p> : null}
                </div>
                <div>
                  <Label htmlFor="checkOutDate">Check-out</Label>
                  <Input id="checkOutDate" type="date" {...register("checkOutDate")} />
                  {errors.checkOutDate ? <p className="mt-1 text-xs text-destructive">{errors.checkOutDate.message}</p> : null}
                </div>
                <div>
                  <Label htmlFor="ratePlanId">Rate Plan</Label>
                  <Select id="ratePlanId" {...register("ratePlanId")}>
                    <option value="">Pilih rate plan…</option>
                    {ratePlans.map((r) => {
                      const rt = roomTypes.find((t) => t.id === r.roomTypeId);
                      return <option key={r.id} value={r.id}>{rt?.name} · {r.name} · {formatIdr(r.pricePerNight)}</option>;
                    })}
                  </Select>
                  {errors.ratePlanId ? <p className="mt-1 text-xs text-destructive">{errors.ratePlanId.message}</p> : null}
                </div>
                <div>
                  <Label htmlFor="discountPercent">Diskon (0–0.5)</Label>
                  <Input id="discountPercent" type="number" step="0.01" min="0" max="0.5" {...register("discountPercent", { valueAsNumber: true })} />
                  {errors.discountPercent ? <p className="mt-1 text-xs text-destructive">{errors.discountPercent.message}</p> : null}
                </div>
              </div>

              {plan ? (
                <div>
                  <Label>Pilih kamar ({roomTypes.find((t) => t.id === plan.roomTypeId)?.name})</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {eligibleRooms.map((room) => (
                      <button
                        type="button"
                        key={room.id}
                        onClick={() => toggleRoom(room.id)}
                        className={
                          "rounded-md border px-3 py-2 text-sm " +
                          (selectedRooms.includes(room.id) ? "border-primary bg-accent font-medium" : "hover:bg-accent")
                        }
                      >
                        {room.number}
                      </button>
                    ))}
                  </div>
                  {selectedRooms.length === 0 ? <p className="mt-1 text-xs text-muted-foreground">Pilih minimal 1 kamar.</p> : null}
                </div>
              ) : null}

              <div>
                <Label htmlFor="notes">Catatan / alasan diskon</Label>
                <Textarea id="notes" placeholder="Contoh: kontrak corporate, kompensasi komplain…" {...register("notes")} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-4">
              <h3 className="text-sm font-semibold">Ringkasan</h3>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Malam</span><span className="tabular-nums">{nights}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Kamar</span><span className="tabular-nums">{selectedRooms.length}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Harga/malam</span><MoneyText value={plan?.pricePerNight ?? 0} /></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><MoneyText value={baseTotal} /></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Diskon</span><span className="tabular-nums">{Math.round(discountPercent * 100)}%</span></div>
              <div className="flex justify-between border-t pt-2 text-base font-semibold"><span>Total</span><MoneyText value={total} /></div>
              <Button className="w-full" disabled={selectedRooms.length === 0 || !plan || create.isPending}>
                {create.isPending ? "Memproses…" : "Buat & Tahan Kamar (HOLD)"}
              </Button>
              <p className="text-xs text-muted-foreground">Diskon di atas batas peran Anda akan mengirim permintaan approval.</p>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}

