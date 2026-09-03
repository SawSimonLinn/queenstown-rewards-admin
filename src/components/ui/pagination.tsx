import Link from "next/link";

import { buttonClassName } from "@/components/ui/button";

export function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <nav className="flex items-center justify-between gap-4" aria-label="Pagination">
      <Link
        href={buildHref(page - 1)}
        aria-disabled={prevDisabled}
        tabIndex={prevDisabled ? -1 : undefined}
        className={buttonClassName({
          variant: "outline",
          size: "sm",
          className: prevDisabled ? "pointer-events-none opacity-50" : "",
        })}
      >
        Previous
      </Link>
      <span className="text-sm text-neutral-600">
        Page {page} of {totalPages}
      </span>
      <Link
        href={buildHref(page + 1)}
        aria-disabled={nextDisabled}
        tabIndex={nextDisabled ? -1 : undefined}
        className={buttonClassName({
          variant: "outline",
          size: "sm",
          className: nextDisabled ? "pointer-events-none opacity-50" : "",
        })}
      >
        Next
      </Link>
    </nav>
  );
}
