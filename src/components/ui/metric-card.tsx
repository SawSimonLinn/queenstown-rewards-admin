import { Card } from "@/components/ui/card";

export function MetricCard({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: "neutral" | "brand" | "warning";
}) {
  return (
    <Card className="min-w-0">
      <p className="text-sm font-medium text-muted">{label}</p>
      <p
        className={`font-display mt-2 text-3xl font-semibold ${
          tone === "brand" ? "text-brand" : tone === "warning" ? "text-warning" : "text-ink"
        }`}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </Card>
  );
}
