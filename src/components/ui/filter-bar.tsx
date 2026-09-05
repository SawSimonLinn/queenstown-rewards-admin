import { Card } from "@/components/ui/card";
import { buttonClassName } from "@/components/ui/button";

/**
 * Wraps the GET-param filter forms used across list pages (locations,
 * campaigns, promotions, redemptions, customers, notifications, staff,
 * audit log) so they share the same layout/spacing.
 */
export function FilterBar({
  action,
  children,
  submitLabel = "Filter",
  clearHref,
}: {
  action?: string;
  children: React.ReactNode;
  submitLabel?: string;
  clearHref?: string;
}) {
  return (
    <Card>
      <form method="get" action={action} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {children}
        <div className="flex items-end gap-2 sm:col-span-2 xl:col-span-1">
          <button type="submit" className={buttonClassName({ variant: "primary", className: "w-full" })}>
            {submitLabel}
          </button>
          {clearHref ? (
            <a href={clearHref} className={buttonClassName({ variant: "outline" })}>
              Clear
            </a>
          ) : null}
        </div>
      </form>
    </Card>
  );
}
