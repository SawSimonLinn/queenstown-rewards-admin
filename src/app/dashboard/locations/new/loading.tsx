import { DashboardFormSkeleton } from "@/components/ui/loading";

export default function Loading() {
  return <DashboardFormSkeleton titleClassName="h-8 w-36" fields={7} checkboxes={1} />;
}
