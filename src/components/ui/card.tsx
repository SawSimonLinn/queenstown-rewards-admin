export function Card({
  children,
  className = "",
  padding = "default",
}: {
  children: React.ReactNode;
  className?: string;
  padding?: "default" | "none";
}) {
  return (
    <div
      className={`rounded-xl border border-border bg-surface shadow-sm ${
        padding === "default" ? "p-4 sm:p-5" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function ErrorBanner({ message }: { message: string | null | undefined }) {
  if (!message) return null;
  return (
    <div className="rounded-lg border border-danger-border bg-danger-tint px-4 py-3 text-sm font-medium text-danger">
      {message}
    </div>
  );
}

export function SuccessBanner({ message }: { message: string | null | undefined }) {
  if (!message) return null;
  return (
    <div className="rounded-lg border border-success-border bg-success-tint px-4 py-3 text-sm font-medium text-success">
      {message}
    </div>
  );
}
