import { DashboardListPageSkeleton } from "@/components/ui/loading";

export default function Loading() {
  return (
    <DashboardListPageSkeleton
      titleClassName="h-8 w-32"
      headerActions={1}
      tableColumns={3}
      mobileActions
      mobileBadges={false}
    />
  );
}
