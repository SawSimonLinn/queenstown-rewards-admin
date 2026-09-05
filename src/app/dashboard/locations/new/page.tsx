import { createLocation } from "@/app/dashboard/locations/actions";
import { LocationForm } from "@/app/dashboard/locations/location-form";
import { PageHeader } from "@/components/ui/page-header";

export default function NewLocationPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Add location"
        breadcrumbs={[{ label: "Locations", href: "/dashboard/locations" }, { label: "New" }]}
      />
      <LocationForm action={createLocation} submitLabel="Create location" />
    </div>
  );
}
