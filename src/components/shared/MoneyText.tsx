import { formatIdr } from "@/lib/format";
import { cn } from "@/lib/utils";

export function MoneyText({ value, className, muted }: { value: number; className?: string; muted?: boolean }) {
  return <span className={cn("tabular-nums font-medium", muted && "text-muted-foreground", className)}>{formatIdr(value)}</span>;
}
