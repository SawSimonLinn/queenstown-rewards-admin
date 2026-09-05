import { Card } from "@/components/ui/card";

const CELL_WIDTHS = ["w-28", "w-40", "w-24", "w-32", "w-20", "w-36"];
const COLUMN_MIN_WIDTHS = ["min-w-36", "min-w-48", "min-w-32", "min-w-40", "min-w-28", "min-w-44"];

export function Spinner({
  className = "",
  label,
}: {
  className?: string;
  label?: string;
}) {
  return (
    <span
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`inline-block size-4 shrink-0 rounded-full border-2 border-current border-r-transparent motion-safe:animate-spin ${className}`}
    />
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`block rounded-md bg-border/80 motion-safe:animate-pulse ${className}`}
    />
  );
}

export function LoadingRegion({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div aria-busy="true" aria-live="polite" className="flex flex-col gap-6">
      <p className="sr-only">{label}</p>
      {children}
    </div>
  );
}

export function PageHeaderSkeleton({
  titleClassName = "h-8 w-44",
  subtitle = false,
  actions = 0,
}: {
  titleClassName?: string;
  subtitle?: boolean;
  actions?: number;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <Skeleton className={titleClassName} />
        {subtitle ? <Skeleton className="mt-2 h-4 w-full max-w-80" /> : null}
      </div>
      {actions > 0 ? (
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:justify-end">
          {Array.from({ length: actions }, (_, index) => (
            <Skeleton key={index} className="h-11 w-full sm:w-36" />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function StatGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <Card key={index} className="min-w-0">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-3 h-9 w-16" />
        </Card>
      ))}
    </div>
  );
}

function FieldSkeleton({ textarea = false }: { textarea?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Skeleton className="h-4 w-20" />
      <Skeleton className={textarea ? "h-24 w-full" : "h-11 w-full"} />
    </div>
  );
}

export function FilterPanelSkeleton({ fields = 5 }: { fields?: number }) {
  return (
    <Card>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: fields }, (_, index) => (
          <FieldSkeleton key={index} />
        ))}
        <div className="sm:col-span-2 xl:col-span-5">
          <Skeleton className="h-11 w-full sm:w-24" />
        </div>
      </div>
    </Card>
  );
}

export function DataTableSkeleton({
  columns = 4,
  rows = 5,
}: {
  columns?: number;
  rows?: number;
}) {
  return (
    <Card padding="none" className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-max text-left text-sm">
        <thead className="border-b border-border bg-cream">
          <tr>
            {Array.from({ length: columns }, (_, index) => (
              <th
                key={index}
                className={`px-4 py-3 ${COLUMN_MIN_WIDTHS[index % COLUMN_MIN_WIDTHS.length]}`}
              >
                <Skeleton className={`h-4 ${CELL_WIDTHS[index % CELL_WIDTHS.length]}`} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, rowIndex) => (
            <tr key={rowIndex} className="border-b border-border last:border-0">
              {Array.from({ length: columns }, (_, columnIndex) => (
                <td
                  key={columnIndex}
                  className={`px-4 py-3 ${
                    COLUMN_MIN_WIDTHS[columnIndex % COLUMN_MIN_WIDTHS.length]
                  }`}
                >
                  <Skeleton
                    className={`h-4 ${
                      CELL_WIDTHS[(rowIndex + columnIndex) % CELL_WIDTHS.length]
                    }`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

export function MobileCardListSkeleton({
  cards = 3,
  detailRows = 2,
  withAction = false,
  withBadge = true,
}: {
  cards?: number;
  detailRows?: number;
  withAction?: boolean;
  withBadge?: boolean;
}) {
  return (
    <div className="grid gap-3 md:hidden">
      {Array.from({ length: cards }, (_, cardIndex) => (
        <article
          key={cardIndex}
          className="rounded-lg border border-border bg-white p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="mt-2 h-4 w-1/2" />
            </div>
            {withBadge ? <Skeleton className="h-6 w-20 shrink-0" /> : null}
          </div>
          <div className="mt-4 grid gap-3">
            {Array.from({ length: detailRows }, (_, rowIndex) => (
              <div key={rowIndex} className="grid gap-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
          {withAction ? <Skeleton className="mt-4 h-11 w-full" /> : null}
        </article>
      ))}
    </div>
  );
}

export function DashboardOverviewSkeleton() {
  return (
    <LoadingRegion label="Loading overview">
      <PageHeaderSkeleton titleClassName="h-8 w-32" subtitle />
      <StatGridSkeleton />
      <Card>
        <Skeleton className="h-4 w-44" />
        <Skeleton className="mt-3 h-6 w-full max-w-sm" />
      </Card>
    </LoadingRegion>
  );
}

export function DashboardListPageSkeleton({
  titleClassName = "h-8 w-44",
  subtitle = false,
  headerActions = 0,
  filters = false,
  filterFields = 5,
  tableColumns = 4,
  tableRows = 5,
  mobileCards = 3,
  mobileDetailRows = 2,
  mobileActions = false,
  mobileBadges = true,
}: {
  titleClassName?: string;
  subtitle?: boolean;
  headerActions?: number;
  filters?: boolean;
  filterFields?: number;
  tableColumns?: number;
  tableRows?: number;
  mobileCards?: number;
  mobileDetailRows?: number;
  mobileActions?: boolean;
  mobileBadges?: boolean;
}) {
  return (
    <LoadingRegion label="Loading page">
      <PageHeaderSkeleton
        titleClassName={titleClassName}
        subtitle={subtitle}
        actions={headerActions}
      />
      {filters ? <FilterPanelSkeleton fields={filterFields} /> : null}
      <MobileCardListSkeleton
        cards={mobileCards}
        detailRows={mobileDetailRows}
        withAction={mobileActions}
        withBadge={mobileBadges}
      />
      <DataTableSkeleton columns={tableColumns} rows={tableRows} />
    </LoadingRegion>
  );
}

export function DashboardFormSkeleton({
  titleClassName = "h-8 w-56",
  maxWidthClassName = "max-w-3xl",
  fields = 6,
  textareas = 1,
  checkboxes = 0,
}: {
  titleClassName?: string;
  maxWidthClassName?: string;
  fields?: number;
  textareas?: number;
  checkboxes?: number;
}) {
  return (
    <LoadingRegion label="Loading form">
      <PageHeaderSkeleton titleClassName={titleClassName} />
      <Card className={`w-full ${maxWidthClassName}`}>
        <div className="flex flex-col gap-4">
          {Array.from({ length: fields }, (_, index) => (
            <FieldSkeleton key={index} textarea={index < textareas} />
          ))}
          {checkboxes > 0 ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {Array.from({ length: checkboxes }, (_, index) => (
                <Skeleton key={index} className="h-11 w-full" />
              ))}
            </div>
          ) : null}
          <Skeleton className="h-11 w-full sm:w-36" />
        </div>
      </Card>
    </LoadingRegion>
  );
}

export function QrCodeGridSkeleton() {
  return (
    <LoadingRegion label="Loading QR codes">
      <PageHeaderSkeleton titleClassName="h-8 w-32" subtitle actions={1} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Card key={index} className="flex min-w-0 flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="mt-2 h-4 w-1/2" />
              </div>
              <Skeleton className="h-6 w-16 shrink-0" />
            </div>
            <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-cream p-4 sm:flex-row">
              <Skeleton className="h-36 w-36 shrink-0" />
              <div className="grid w-full min-w-0 flex-1 gap-3">
                <div className="grid gap-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <div className="grid gap-1">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </div>
            <Skeleton className="h-11 w-full sm:w-28" />
          </Card>
        ))}
      </div>
    </LoadingRegion>
  );
}

function DetailSectionSkeleton({ columns }: { columns: number }) {
  return (
    <Card>
      <Skeleton className="mb-4 h-5 w-44" />
      <div className="divide-y divide-border md:hidden">
        {Array.from({ length: 3 }, (_, index) => (
          <section key={index} className="py-4 first:pt-0 last:pb-0">
            <div className="flex items-start justify-between gap-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="mt-3 grid gap-3">
              <div className="grid gap-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </section>
        ))}
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-max text-left text-sm">
        <thead className="border-b border-border">
          <tr>
            {Array.from({ length: columns }, (_, index) => (
              <th
                key={index}
                className={`py-2 pr-4 ${COLUMN_MIN_WIDTHS[index % COLUMN_MIN_WIDTHS.length]}`}
              >
                <Skeleton className={`h-4 ${CELL_WIDTHS[index % CELL_WIDTHS.length]}`} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 4 }, (_, rowIndex) => (
            <tr key={rowIndex} className="border-b border-border last:border-0">
              {Array.from({ length: columns }, (_, columnIndex) => (
                <td
                  key={columnIndex}
                  className={`py-2 pr-4 ${
                    COLUMN_MIN_WIDTHS[columnIndex % COLUMN_MIN_WIDTHS.length]
                  }`}
                >
                  <Skeleton
                    className={`h-4 ${
                      CELL_WIDTHS[(rowIndex + columnIndex) % CELL_WIDTHS.length]
                    }`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        </table>
      </div>
    </Card>
  );
}

export function CustomerDetailSkeleton() {
  return (
    <LoadingRegion label="Loading customer details">
      <PageHeaderSkeleton titleClassName="h-8 w-56" subtitle />
      <DetailSectionSkeleton columns={4} />
      <DetailSectionSkeleton columns={3} />
    </LoadingRegion>
  );
}

export function LoginSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6"
    >
      <p className="sr-only">Loading sign in form</p>
      <Card className="w-full max-w-sm">
        <div className="mb-6">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="mt-3 h-8 w-56" />
          <Skeleton className="mt-2 h-4 w-64 max-w-full" />
        </div>
        <div className="flex flex-col gap-4">
          <FieldSkeleton />
          <FieldSkeleton />
          <Skeleton className="h-11 w-full" />
        </div>
      </Card>
    </div>
  );
}
