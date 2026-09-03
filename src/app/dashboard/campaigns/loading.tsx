import { DashboardListPageSkeleton } from "@/components/ui/loading";

export default function Loading() {
  return (
    <DashboardListPageSkeleton
      titleClassName="h-8 w-56"
      headerActions={1}
      tableColumns={4}
      mobileActions
    />
  );
}
