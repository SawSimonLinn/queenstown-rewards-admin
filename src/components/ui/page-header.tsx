export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="break-words text-2xl font-semibold text-neutral-950">{title}</h1>
        {subtitle ? <p className="mt-1 break-words text-sm text-neutral-500">{subtitle}</p> : null}
      </div>
      {children ? (
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:justify-end">
          {children}
        </div>
      ) : null}
    </div>
  );
}
