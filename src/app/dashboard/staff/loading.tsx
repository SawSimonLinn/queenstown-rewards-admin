import { DashboardListPageSkeleton } from "@/components/ui/loading";

export default function Loading() {
  return (
    <DashboardListPageSkeleton
      titleClassName="h-8 w-24"
      headerActions={1}
      tableColumns={6}
      mobileDetailRows={2}
      mobileActions
    />
  );
}
