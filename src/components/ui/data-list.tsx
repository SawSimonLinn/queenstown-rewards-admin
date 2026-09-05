const TONE_CLASSES = {
  neutral: "bg-cream text-muted ring-border-strong",
  blue: "bg-info-tint text-info ring-info-border",
  green: "bg-success-tint text-success ring-success-border",
  yellow: "bg-warning-tint text-warning ring-warning-border",
  red: "bg-danger-tint text-danger ring-danger-border",
  brand: "bg-brand-tint text-brand-active ring-brand-tint-border",
} as const;

export type BadgeTone = keyof typeof TONE_CLASSES;

export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex min-h-6 max-w-full items-center justify-center rounded-md px-2 py-0.5 text-center text-xs font-medium leading-5 ring-1 ring-inset ${TONE_CLASSES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function MobileDataList({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`grid gap-3 md:hidden ${className}`}>{children}</div>;
}

export function MobileDataCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <article className={`rounded-xl border border-border bg-surface p-4 shadow-sm ${className}`}>
      {children}
    </article>
  );
}

export function DataPair({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-1 break-words text-sm text-ink">{children}</dd>
    </div>
  );
}

export function EmptyState({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border-strong bg-surface px-4 py-10 text-center text-sm font-medium text-muted">
      {icon ? <div className="text-muted/70">{icon}</div> : null}
      {children}
    </div>
  );
}
