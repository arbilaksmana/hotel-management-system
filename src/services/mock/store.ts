import { buildInitialState, type PrototypeState } from "@/data/seed";
import type { AuditLog, AppNotification, Role, User } from "@/domain/types";
import { genId } from "./util";

// Store in-memory terpadu. Service mock membaca/menulis di sini.
export const store: PrototypeState = buildInitialState();

export interface ActorContext {
  user: User;
}

export function auditLog(actor: ActorContext, entry: Omit<AuditLog, "id" | "createdAt" | "actorId" | "actorName" | "actorRole">): void {
  store.audit.unshift({
    id: genId("aud"),
    createdAt: new Date().toISOString(),
    actorId: actor.user.id,
    actorName: actor.user.name,
    actorRole: actor.user.role,
    ...entry,
  });
}

export function notify(entry: Omit<AppNotification, "id" | "createdAt" | "read">): void {
  store.notifications.unshift({
    id: genId("ntf"),
    createdAt: new Date().toISOString(),
    read: false,
    ...entry,
  });
}

export function requireRole(actor: ActorContext, allowed: Role[]): void {
  if (!allowed.includes(actor.user.role)) {
    throw new Error("Aksi tidak diizinkan untuk peran Anda.");
  }
}
