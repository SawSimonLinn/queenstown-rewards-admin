import { DashboardListPageSkeleton } from "@/components/ui/loading";

export default function Loading() {
  return (
    <DashboardListPageSkeleton
      titleClassName="h-8 w-40"
      subtitle
      filters
      tableColumns={5}
      tableRows={6}
      mobileDetailRows={3}
    />
  );
}
