import { DashboardListPageSkeleton } from "@/components/ui/loading";

export default function Loading() {
  return (
    <DashboardListPageSkeleton
      titleClassName="h-8 w-44"
      headerActions={1}
      tableColumns={4}
      mobileDetailRows={2}
    />
  );
}
