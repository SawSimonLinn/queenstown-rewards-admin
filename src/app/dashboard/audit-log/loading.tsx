import { DashboardListPageSkeleton } from "@/components/ui/loading";

export default function Loading() {
  return (
    <DashboardListPageSkeleton
      titleClassName="h-8 w-36"
      subtitle
      tableColumns={5}
      tableRows={6}
      mobileDetailRows={4}
      mobileBadges={false}
    />
  );
}
