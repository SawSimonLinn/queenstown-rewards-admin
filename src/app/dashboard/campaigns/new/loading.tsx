import { DashboardFormSkeleton } from "@/components/ui/loading";

export default function Loading() {
  return <DashboardFormSkeleton titleClassName="h-8 w-72" fields={7} textareas={2} checkboxes={4} />;
}
