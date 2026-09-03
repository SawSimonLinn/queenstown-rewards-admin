import { DashboardListPageSkeleton } from "@/components/ui/loading";

export default function Loading() {
  return (
    <DashboardListPageSkeleton
      titleClassName="h-8 w-36"
      headerActions={1}
      tableColumns={5}
      mobileActions
    />
  );
}
