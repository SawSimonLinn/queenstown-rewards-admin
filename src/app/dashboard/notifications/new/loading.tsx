import { DashboardFormSkeleton } from "@/components/ui/loading";

export default function Loading() {
  return <DashboardFormSkeleton titleClassName="h-8 w-44" maxWidthClassName="max-w-2xl" fields={4} textareas={1} checkboxes={1} />;
}
