import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Building2, Hotel as HotelIcon, KeyRound } from "lucide-react";
import { users } from "@/data/seed";
import { useAuth } from "@/app/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const ROLE_LABEL: Record<string, string> = {
  RECEPTIONIST: "Resepsionis",
  RESERVATION_STAFF: "Reservasi",
  CASHIER: "Kasir",
  FRONT_OFFICE_SUPERVISOR: "FO Supervisor",
  HOUSEKEEPING: "Housekeeping",
  HOUSEKEEPING_SUPERVISOR: "HK Supervisor",
  ENGINEERING: "Engineering",
  HOTEL_MANAGER: "Hotel Manager",
  FINANCE_HOTEL: "Finance",
  HEAD_OFFICE_APPROVER: "HO Approver",
  HEAD_OFFICE_FINANCE: "HO Finance",
  AUDITOR: "Auditor",
  SYSTEM_ADMIN: "Admin",
  OWNER: "Owner",
};

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const firstUser = users.at(0);

  // Deep-link demo: /login?as=u-manager mempermudah presentasi & QA berbagi peran.
  useEffect(() => {
    const as = params.get("as");
    if (as && users.some((u) => u.id === as)) {
      login(as);
      navigate("/dashboard", { replace: true });
    }
  }, [params, login, navigate]);

  const go = (id: string) => {
    login(id);
    navigate("/dashboard");
  };

  return (
    <main className="grid min-h-[100dvh] bg-background lg:grid-cols-[0.8fr_1.2fr]">
      <section className="relative hidden overflow-hidden bg-foreground p-10 text-background lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-md bg-background text-primary"><HotelIcon className="size-5" /></div>
          <div><p className="text-sm font-semibold">Hotel Arjuna</p><p className="text-xs text-background/45">Bandung</p></div>
        </div>
        <div className="max-w-md">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-background/40">Property workspace</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.04em]">Satu meja kerja untuk seluruh operasi hotel.</h1>
          <p className="mt-4 max-w-sm text-sm leading-6 text-background/55">Pantau kamar, tamu, pembayaran, housekeeping, dan akses tanpa berpindah konteks.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-background/40"><Building2 className="size-4" /> Prototype operasional front office</div>
      </section>
      <section className="flex items-center justify-center px-4 py-8 sm:px-8">
        <Card className="w-full max-w-2xl overflow-hidden">
          <CardContent className="p-0">
            <div className="border-b p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-3 lg:hidden">
                <div className="grid size-10 place-items-center rounded-md bg-primary text-primary-foreground"><HotelIcon className="size-5" /></div>
                <div><p className="text-sm font-semibold">Hotel Arjuna</p><p className="text-xs text-muted-foreground">Bandung · Front Office</p></div>
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/70">Akses prototype</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">Pilih peran kerja</h2>
              <p className="mt-1 text-sm text-muted-foreground">Setiap peran membuka izin dan antrean kerja yang berbeda.</p>
            </div>
            <div className="grid max-h-[55dvh] overflow-y-auto sm:grid-cols-2">
            {users.map((u) => (
              <button
                type="button"
                key={u.id}
                onClick={() => go(u.id)}
                className="group flex min-h-16 items-center justify-between border-b p-4 text-left hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:odd:border-r"
              >
                <div>
                  <p className="text-sm font-medium">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{ROLE_LABEL[u.role] ?? u.role}</p>
                </div>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </button>
            ))}
            </div>
            <div className="p-4 sm:p-5">
              <Button className="w-full" disabled={!firstUser} variant="outline" onClick={() => firstUser && go(firstUser.id)}>
                <KeyRound /> Masuk cepat sebagai resepsionis
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
