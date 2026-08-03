import { PageHeader } from "@/components/shared/PageHeader";
import { policy } from "@/data/seed";
import { formatPercent } from "@/lib/format";

export function SettingsPage() {
  const rows = [
    { label: "DP", value: `${formatPercent(policy.dpPercent)} dari total atau 1 malam (terbesar)` },
    { label: "HOLD online", value: `${policy.holdMinutesOnline} menit`, numeric: true },
    { label: "HOLD front office", value: `${policy.holdMinutesFrontOffice} menit`, numeric: true },
    { label: "Check-in / Checkout", value: `${policy.checkInTime} / ${policy.checkOutTime}` },
  ];

  return (
    <div>
      <PageHeader title="Pengaturan" subtitle="Konfigurasi kebijakan hotel (read-only pada prototype)." />
      <div className="rounded-lg border bg-card">
        <div className="border-b px-4 py-3">
          <h2 className="text-sm font-semibold tracking-tight">Kebijakan Operasional</h2>
        </div>
        <div className="divide-y">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
              <p className="text-muted-foreground">{r.label}</p>
              <p className={r.numeric ? "font-medium tabular-nums" : "font-medium"}>{r.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
