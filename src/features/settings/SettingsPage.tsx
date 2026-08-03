import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { policy } from "@/data/seed";
import { formatPercent } from "@/lib/format";

export function SettingsPage() {
  return (
    <div>
      <PageHeader title="Pengaturan" subtitle="Konfigurasi kebijakan hotel (read-only pada prototype)." />
      <Card>
        <CardHeader><CardTitle>Kebijakan Operasional</CardTitle></CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <div><p className="text-muted-foreground">DP</p><p>{formatPercent(policy.dpPercent)} dari total atau 1 malam (terbesar)</p></div>
          <div><p className="text-muted-foreground">HOLD online</p><p>{policy.holdMinutesOnline} menit</p></div>
          <div><p className="text-muted-foreground">HOLD front office</p><p>{policy.holdMinutesFrontOffice} menit</p></div>
          <div><p className="text-muted-foreground">Check-in / Checkout</p><p>{policy.checkInTime} / {policy.checkOutTime}</p></div>
        </CardContent>
      </Card>
    </div>
  );
}
