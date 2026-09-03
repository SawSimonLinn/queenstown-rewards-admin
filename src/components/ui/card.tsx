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
      className={`rounded-lg border border-neutral-200 bg-white shadow-sm ${
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
    <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
      {message}
    </div>
  );
}
