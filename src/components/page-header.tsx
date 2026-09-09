export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3">
      <div className="space-y-1">
        {eyebrow ? <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#8a7048]">{eyebrow}</p> : null}
        <h1 className="text-2xl font-semibold text-[#1b3d34]">{title}</h1>
        {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {action ? <div className="flex flex-wrap gap-2">{action}</div> : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "ready" | "warn" | "danger" | "info" | "gold";
}) {
  const bar = {
    default: "bg-[#1b3d34]",
    ready: "bg-emerald-600",
    warn: "bg-amber-500",
    danger: "bg-rose-600",
    info: "bg-sky-600",
    gold: "bg-[#c4a574]",
  }[tone];
  return (
    <div className="raha-card raha-stat overflow-hidden p-4 shadow-[0_10px_24px_-12px_rgba(20,36,31,0.28)]">
      <div className={`mb-3 h-1 w-8 rounded-full ${bar}`} />
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-[family-name:var(--font-display)] text-2xl text-[#1b3d34]">{value}</div>
      {hint ? <div className="mt-1 text-xs text-muted-foreground">{hint}</div> : null}
    </div>
  );
}
