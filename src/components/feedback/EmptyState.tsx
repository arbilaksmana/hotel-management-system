import { Inbox } from "lucide-react";

export function EmptyState({ title = "Tidak ada data", hint }: { title?: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 rounded-md border border-dashed py-10 text-center">
      <Inbox className="size-5 text-muted-foreground/60" />
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      {hint ? <p className="text-xs text-muted-foreground/70">{hint}</p> : null}
    </div>
  );
}
