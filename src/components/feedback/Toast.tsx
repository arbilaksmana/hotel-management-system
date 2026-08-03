import * as React from "react";

export interface Toast {
  id: number;
  title: string;
  kind: "success" | "error" | "info";
}

const ToastContext = React.createContext<{ push: (t: Omit<Toast, "id">) => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const push = React.useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { ...t, id }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 3800);
  }, []);
  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={
              "pointer-events-auto animate-slide-up rounded-md border px-3 py-2 text-sm shadow-md " +
              (t.kind === "success"
                ? "border-tone-positive-border bg-tone-positive text-tone-positive-foreground"
                : t.kind === "error"
                  ? "border-tone-danger-border bg-tone-danger text-tone-danger-foreground"
                  : "border bg-card text-card-foreground")
            }
          >
            {t.title}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast harus di dalam ToastProvider");
  return ctx;
}
