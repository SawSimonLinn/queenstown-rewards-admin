import { notFound } from "next/navigation";

import { updateLocation } from "@/app/dashboard/locations/actions";
import { LocationForm } from "@/app/dashboard/locations/location-form";
import { PageHeader } from "@/components/ui/page-header";
import { createClient } from "@/lib/supabase/server";

export default async function EditLocationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: location } = await supabase.from("locations").select("*").eq("id", id).maybeSingle();

  if (!location) notFound();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Edit ${location.name}`}
        breadcrumbs={[
          { label: "Locations", href: "/dashboard/locations" },
          { label: location.name, href: `/dashboard/locations/${id}` },
          { label: "Edit" },
        ]}
      />
      <LocationForm
        action={updateLocation.bind(null, id)}
        initial={location}
        submitLabel="Save changes"
      />
    </div>
  );
}
