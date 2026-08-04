import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { addDays, format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { availabilityService, roomService } from "@/services/mock";
import { qk } from "@/services/query-keys";
import { useAuth } from "@/app/providers/AuthProvider";
import { PageHeader } from "@/components/shared/PageHeader";
import { cellToneClass, TONE_TEXT } from "@/components/shared/status-tokens";
import { todayIso } from "@/domain/rules/dates";
import { cn } from "@/lib/utils";
import { Select } from "@/components/ui/input";
import type { RoomNightStatus } from "@/domain/types";

const DAYS = 14;

const LABEL: Record<RoomNightStatus, string> = {
  AVAILABLE: "AVAIL",
  HELD: "HOLD",
  BOOKED: "BOOK",
  OCCUPIED: "OCC",
  BLOCKED: "BLOCK",
};

export function AvailabilityPage() {
  const { hotelId } = useAuth();
  const navigate = useNavigate();
  const from = todayIso();
  const to = format(addDays(new Date(), DAYS - 1), "yyyy-MM-dd");
  const dates = React.useMemo(() => Array.from({ length: DAYS }, (_, i) => format(addDays(new Date(), i), "yyyy-MM-dd")), []);
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [floorFilter, setFloorFilter] = React.useState<string>("ALL");

  const { data: rooms = [] } = useQuery({ queryKey: qk.rooms(hotelId), queryFn: () => roomService.listRooms(hotelId) });
  const { data: inventory = [] } = useQuery({
    queryKey: qk.inventory(hotelId, from, to),
    queryFn: () => availabilityService.getInventory(hotelId, from, to),
    refetchInterval: 5000,
  });

  const cellFor = (roomId: string, date: string) => inventory.find((i) => i.roomId === roomId && i.date === date);

  const floors = Array.from(new Set(rooms.map((r) => r.floor))).sort();
  const visibleRooms = rooms.filter((r) => r.active && (floorFilter === "ALL" || String(r.floor) === floorFilter));

  const occByDate = React.useMemo(() => {
    const map: Record<string, { sold: number; total: number }> = {};
    for (const d of dates) map[d] = { sold: 0, total: visibleRooms.length };
    for (const room of visibleRooms) {
      for (const d of dates) {
        const bucket = map[d];
        if (!bucket) continue;
        const status = cellFor(room.id, d)?.status ?? "AVAILABLE";
        if (status === "OCCUPIED" || status === "BOOKED" || status === "HELD") bucket.sold += 1;
      }
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cellFor is stable over inventory/rooms
  }, [dates, visibleRooms, inventory]);

  return (
    <div>
      <PageHeader
        title="Availability Kamar"
        subtitle="Grid kamar × tanggal. Header menampilkan okupansi harian; klik sel untuk reservasi/detail."
        actions={
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
            <Select aria-label="Filter lantai" className="sm:w-40" value={floorFilter} onChange={(e) => setFloorFilter(e.target.value)}>
              <option value="ALL">Semua lantai</option>
              {floors.map((f) => (
                <option key={f} value={f}>
                  Lantai {f}
                </option>
              ))}
            </Select>
            <Select aria-label="Filter status" className="sm:w-40" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">Semua status</option>
              {Object.keys(LABEL).map((s) => (
                <option key={s} value={s}>
                  {LABEL[s as RoomNightStatus]}
                </option>
              ))}
            </Select>
          </div>
        }
      />

      <div className="mb-3 flex items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2 text-[11px]">
          {(Object.keys(LABEL) as RoomNightStatus[]).map((s) => (
            <span key={s} className={cn("rounded-sm border px-2 py-0.5 font-medium", cellToneClass(s))}>
              {LABEL[s]}
            </span>
          ))}
        </div>
        <p className="hidden shrink-0 text-xs text-muted-foreground sm:block">
          {visibleRooms.length} kamar · {DAYS} hari
        </p>
      </div>

      <div className="overflow-auto rounded-lg border bg-card">
        <table className="w-full border-collapse text-xs">
          <caption className="sr-only">Ketersediaan kamar selama 14 hari</caption>
          <thead>
            <tr>
              <th className="sticky left-0 top-0 z-30 min-w-24 border-b bg-card px-3 py-2.5 text-left font-semibold">Kamar</th>
              {dates.map((d) => {
                const occ = occByDate[d] ?? { sold: 0, total: visibleRooms.length };
                const pct = occ.total === 0 ? 0 : Math.round((occ.sold / occ.total) * 100);
                return (
                  <th key={d} className="sticky top-0 z-20 min-w-20 border-b bg-card px-2 py-2 text-center font-medium">
                    <div>{format(new Date(d), "dd MMM", { locale: idLocale })}</div>
                    <div className="text-[10px] font-normal text-muted-foreground">{format(new Date(d), "EEE", { locale: idLocale })}</div>
                    <div
                      className={cn(
                        "mt-1 text-[10px] font-semibold tabular-nums",
                        pct >= 90 ? TONE_TEXT.danger : pct >= 70 ? TONE_TEXT.warning : TONE_TEXT.positive,
                      )}
                      title={`${occ.sold}/${occ.total} terjual`}
                    >
                      {occ.sold}/{occ.total}
                      <span className="ml-0.5 font-normal text-muted-foreground">·{pct}%</span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {visibleRooms.map((room) => (
              <tr key={room.id} className="border-b hover:bg-muted/35 last:border-0">
                <td className="sticky left-0 z-20 border-r bg-card px-3 py-1.5 font-medium">
                  {room.number}
                  <div className="text-[10px] font-normal text-muted-foreground">L{room.floor}</div>
                </td>
                {dates.map((d) => {
                  const cell = cellFor(room.id, d);
                  const status: RoomNightStatus = cell?.status ?? "AVAILABLE";
                  if (statusFilter !== "ALL" && status !== statusFilter) {
                    return (
                      <td key={d} className="border-r px-2 py-1.5 text-center text-muted-foreground/40">
                        –
                      </td>
                    );
                  }
                  return (
                    <td key={d} className="border-r px-1 py-1">
                      <button
                        type="button"
                        title={`${room.number} × ${d} × ${LABEL[status]}${cell?.reason ? ` × ${cell.reason}` : ""}`}
                        onClick={() => {
                          if (status === "AVAILABLE") navigate(`/reservations/new?room=${room.id}&date=${d}`);
                          else if (cell?.reservationId) navigate(`/reservations/${cell.reservationId}`);
                        }}
                        className={cn(
                          "h-9 w-full rounded-sm text-[10px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 active:translate-y-px",
                          cellToneClass(status),
                          status === "AVAILABLE" && "hover:opacity-80",
                        )}
                      >
                        {LABEL[status]}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
