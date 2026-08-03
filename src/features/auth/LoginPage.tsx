import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Hotel as HotelIcon, KeyRound } from "lucide-react";
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
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-slate-100 to-blue-50 p-6">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-lg bg-primary text-primary-foreground">
              <HotelIcon className="size-6" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Hotel Management System</h1>
              <p className="text-sm text-muted-foreground">Masuk sebagai salah satu peran untuk demo prototype.</p>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => go(u.id)}
                className="flex items-center justify-between rounded-md border px-3 py-2.5 text-left hover:border-primary hover:bg-accent"
              >
                <div>
                  <p className="text-sm font-medium">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{ROLE_LABEL[u.role] ?? u.role}</p>
                </div>
                <KeyRound className="size-4 text-muted-foreground" />
              </button>
            ))}
          </div>
          <Button className="mt-4 w-full" variant="outline" onClick={() => go(users[0]!.id)}>
            Masuk cepat sebagai Resepsionis
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
