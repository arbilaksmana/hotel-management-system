import * as React from "react";
import { users, HOTEL_ID } from "@/data/seed";
import type { User } from "@/domain/types";
import type { Permission } from "@/domain/permissions/permissions";
import { hasPermission } from "@/domain/permissions/permissions";

interface AuthState {
  user: User | null;
  hotelId: string;
  login: (userId: string) => void;
  logout: () => void;
  can: (p: Permission) => boolean;
}

const AuthContext = React.createContext<AuthState | null>(null);
const STORAGE = "hms.session.userId";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE);
    return users.find((u) => u.id === saved) ?? null;
  });

  const login = React.useCallback((userId: string) => {
    const found = users.find((u) => u.id === userId) ?? null;
    setUser(found);
    if (found) localStorage.setItem(STORAGE, found.id);
    else localStorage.removeItem(STORAGE);
  }, []);

  const logout = React.useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE);
  }, []);

  const can = React.useCallback((p: Permission) => (user ? hasPermission(user.role, p) : false), [user]);

  const value = React.useMemo(
    () => ({ user, hotelId: user?.hotelId ?? HOTEL_ID, login, logout, can }),
    [user, login, logout, can],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return ctx;
}

export function Can({ permission, children, fallback = null }: { permission: Permission; children: React.ReactNode; fallback?: React.ReactNode }) {
  const { can } = useAuth();
  return can(permission) ? <>{children}</> : <>{fallback}</>;
}
