const TONE_CLASSES = {
  neutral: "bg-neutral-100 text-neutral-700 ring-neutral-200",
  blue: "bg-blue-50 text-blue-800 ring-blue-200",
  green: "bg-green-50 text-green-800 ring-green-200",
  yellow: "bg-yellow-50 text-yellow-800 ring-yellow-200",
  red: "bg-red-50 text-red-800 ring-red-200",
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
    <article className={`rounded-lg border border-neutral-200 bg-white p-4 shadow-sm ${className}`}>
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
      <dt className="text-xs font-medium uppercase text-neutral-500">{label}</dt>
      <dd className="mt-1 break-words text-sm text-neutral-700">{children}</dd>
    </div>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-neutral-300 bg-white px-4 py-8 text-center text-sm font-medium text-neutral-500">
      {children}
    </div>
  );
}
