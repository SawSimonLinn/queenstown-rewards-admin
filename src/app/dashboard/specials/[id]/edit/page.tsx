import { notFound } from "next/navigation";

import { updateSpecial } from "@/app/dashboard/specials/actions";
import { SpecialForm } from "@/app/dashboard/specials/special-form";
import { PageHeader } from "@/components/ui/page-header";
import { createClient } from "@/lib/supabase/server";

export default async function EditSpecialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: special }, { data: locations }, { data: specialLocations }] = await Promise.all([
    supabase.from("specials").select("*").eq("id", id).maybeSingle(),
    supabase.from("locations").select("id, name").order("name"),
    supabase.from("special_locations").select("location_id").eq("special_id", id),
  ]);

  if (!special) notFound();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={`Edit ${special.title}`} />
      <SpecialForm
        action={updateSpecial.bind(null, id)}
        initial={special}
        locations={locations ?? []}
        initialLocationIds={(specialLocations ?? []).map((row) => row.location_id)}
        submitLabel="Save changes"
      />
    </div>
  );
}
