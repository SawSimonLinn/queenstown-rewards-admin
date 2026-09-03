import { createSpecial } from "@/app/dashboard/specials/actions";
import { SpecialForm } from "@/app/dashboard/specials/special-form";
import { PageHeader } from "@/components/ui/page-header";
import { createClient } from "@/lib/supabase/server";

export default async function NewSpecialPage() {
  const supabase = await createClient();
  const { data: locations } = await supabase.from("locations").select("id, name").order("name");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="New special" />
      <SpecialForm action={createSpecial} locations={locations ?? []} submitLabel="Create special" />
    </div>
  );
}
