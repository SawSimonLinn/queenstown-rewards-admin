import { DashboardListPageSkeleton } from "@/components/ui/loading";

export default function Loading() {
  return (
    <DashboardListPageSkeleton
      titleClassName="h-8 w-36"
      subtitle
      tableColumns={4}
      mobileActions
      mobileBadges={false}
    />
  );
}
