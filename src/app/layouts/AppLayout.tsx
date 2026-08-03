import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Hotel as HotelIcon, LogOut, Menu, X } from "lucide-react";
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
        type="button"
        aria-label="Notifikasi"
        onClick={() => setOpen((o) => !o)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Bell className="size-5" />
        {unread > 0 ? <span className="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full bg-destructive text-[10px] font-bold text-white">{unread}</span> : null}
      </button>
      {open ? (
        <div className="absolute right-0 top-11 z-40 w-[calc(100vw-2rem)] max-w-96 animate-slide-up rounded-lg border bg-card shadow-lg">
          <div className="border-b px-3 py-2 text-sm font-semibold">Notifikasi</div>
          <div className="max-h-96 overflow-y-auto">
            {data.length === 0 ? <p className="px-3 py-6 text-center text-sm text-muted-foreground">Tidak ada notifikasi.</p> : null}
            {data.map((n) => (
              <button
                type="button"
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
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const items = NAV_ITEMS.filter((i) => !i.permission || can(i.permission));

  const signOut = () => {
    logout();
    navigate("/login");
  };

  const navigation = (
    <>
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-4">
        <div className="grid size-9 place-items-center rounded-md bg-white text-primary">
          <HotelIcon className="size-5" />
        </div>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-semibold text-white">Hotel Arjuna</p>
          <p className="text-[11px] text-white/55">Bandung · Front Office</p>
        </div>
      </div>
      <nav aria-label="Navigasi utama" className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">Workspace</p>
        <div className="space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileNavOpen(false)}
              className={({ isActive }) =>
                cn(
                  "group flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-white/60 hover:bg-white/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
                  isActive && "bg-white/[0.11] text-white",
                )
              }
            >
              <item.icon className="size-4 shrink-0 opacity-80 group-hover:opacity-100" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
      <div className="border-t border-white/10 p-3">
        <div className="px-3 py-2">
          <p className="truncate text-sm font-medium text-white">{user?.name}</p>
          <p className="mt-0.5 text-[10px] uppercase tracking-wider text-white/40">{user?.role.replace(/_/g, " ")}</p>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="mt-1 flex min-h-10 w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-white/55 hover:bg-white/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        >
          <LogOut className="size-4" /> Keluar
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-[100dvh] bg-background">
      <a href="#main-content" className="sr-only z-50 rounded-md bg-card px-3 py-2 focus:not-sr-only focus:fixed focus:left-3 focus:top-3">Lewati ke konten</a>
      <aside className="sticky top-0 hidden h-[100dvh] w-60 shrink-0 flex-col bg-foreground lg:flex">
        {navigation}
      </aside>
      {mobileNavOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Tutup navigasi" className="absolute inset-0 bg-foreground/45 backdrop-blur-sm" onClick={() => setMobileNavOpen(false)} />
          <aside aria-label="Navigasi mobile" className="relative flex h-full w-[min(19rem,86vw)] animate-fade-in flex-col bg-foreground shadow-lg">
            {navigation}
            <button type="button" aria-label="Tutup navigasi" onClick={() => setMobileNavOpen(false)} className="absolute right-3 top-3 grid size-10 place-items-center rounded-md text-white/60 hover:bg-white/10 hover:text-white">
              <X className="size-5" />
            </button>
          </aside>
        </div>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/90 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <button type="button" aria-label="Buka navigasi" onClick={() => setMobileNavOpen(true)} className="grid size-10 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden">
              <Menu className="size-5" />
            </button>
            <div>
              <p className="text-sm font-medium text-foreground lg:hidden">Hotel Arjuna</p>
              <p className="hidden text-xs text-muted-foreground sm:block">Shift operasional · Bandung</p>
            </div>
          </div>
          <NotificationBell />
        </header>
        <main id="main-content" className="min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-6">
          <div className="mx-auto w-full max-w-[100rem]"><Outlet /></div>
        </main>
      </div>
    </div>
  );
}
