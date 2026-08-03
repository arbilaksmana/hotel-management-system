import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Hotel as HotelIcon, LogOut } from "lucide-react";
import { NAV_ITEMS } from "@/components/navigation/nav";
import { useAuth } from "@/app/providers/AuthProvider";
import { notificationService } from "@/services/mock";
import { qk } from "@/services/query-keys";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/format";
import * as React from "react";

function NotificationBell() {
  const { user, hotelId } = useAuth();
  const [open, setOpen] = React.useState(false);
  const queryClient = useQueryClient();
  const { data = [] } = useQuery({
    queryKey: qk.notifications(hotelId, user?.id ?? "anon"),
    queryFn: () => notificationService.list(hotelId, user!),
    enabled: Boolean(user),
    refetchInterval: 4000,
  });
  const markRead = useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
  const navigate = useNavigate();
  const unread = data.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        aria-label="Notifikasi"
        onClick={() => setOpen((o) => !o)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent"
      >
        <Bell className="size-5" />
        {unread > 0 ? <span className="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full bg-destructive text-[10px] font-bold text-white">{unread}</span> : null}
      </button>
      {open ? (
        <div className="absolute right-0 top-11 z-40 w-96 animate-slide-up rounded-lg border bg-card shadow-lg">
          <div className="border-b px-3 py-2 text-sm font-semibold">Notifikasi</div>
          <div className="max-h-96 overflow-y-auto">
            {data.length === 0 ? <p className="px-3 py-6 text-center text-sm text-muted-foreground">Tidak ada notifikasi.</p> : null}
            {data.map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  markRead.mutate(n.id);
                  if (n.link) navigate(n.link);
                  setOpen(false);
                }}
                className={cn("block w-full border-b px-3 py-2 text-left last:border-0 hover:bg-accent", !n.read && "bg-accent/40")}
              >
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-muted-foreground">{n.body}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{formatDateTime(n.createdAt)}</p>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function AppLayout() {
  const { user, logout, can } = useAuth();
  const navigate = useNavigate();
  const items = NAV_ITEMS.filter((i) => !i.permission || can(i.permission));

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 flex h-screen w-60 flex-col border-r bg-card">
        <div className="flex items-center gap-2 border-b px-4 py-4">
          <div className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground">
            <HotelIcon className="size-5" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">Hotel MS</p>
            <p className="text-[11px] text-muted-foreground">Bandung</p>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground",
                  isActive && "bg-accent text-foreground",
                )
              }
            >
              <item.icon className="size-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t p-3">
          <div className="rounded-md bg-secondary/60 px-3 py-2">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-[11px] text-muted-foreground">{user?.role.replace(/_/g, " ")}</p>
          </div>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="mt-2 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent"
          >
            <LogOut className="size-4" /> Keluar
          </button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/80 px-6 backdrop-blur">
          <p className="text-sm text-muted-foreground">Hotel Arjuna Bandung · Front Office</p>
          <NotificationBell />
        </header>
        <main className="min-w-0 flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
