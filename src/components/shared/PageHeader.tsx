export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 border-b pb-5 sm:flex-row sm:items-end">
      <div className="min-w-0">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/70">Operasional hotel</p>
        <h1 className="text-2xl font-semibold tracking-[-0.025em] text-foreground">{title}</h1>
        {subtitle ? <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2 sm:justify-end">{actions}</div> : null}
    </div>
  );
}
