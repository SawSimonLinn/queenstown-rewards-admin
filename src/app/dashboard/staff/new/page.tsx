import { StaffForm } from "@/app/dashboard/staff/staff-form";
import { PageHeader } from "@/components/ui/page-header";
import { getCurrentAdminProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function NewStaffPage() {
  const admin = await getCurrentAdminProfile();
  if (!admin) {
    return <p className="text-neutral-600">Only admins can create staff accounts.</p>;
  }

  const supabase = await createClient();
  const { data: locations } = await supabase.from("locations").select("id, name").order("name");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Add staff account" />
      <StaffForm locations={locations ?? []} />
    </div>
  );
}
