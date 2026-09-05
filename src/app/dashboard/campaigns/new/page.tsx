import { createCampaign } from "@/app/dashboard/campaigns/actions";
import { CampaignForm } from "@/app/dashboard/campaigns/campaign-form";
import { PageHeader } from "@/components/ui/page-header";
import { createClient } from "@/lib/supabase/server";

export default async function NewCampaignPage() {
  const supabase = await createClient();
  const { data: locations } = await supabase.from("locations").select("id, name").order("name");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="New Burger of the Month campaign"
        breadcrumbs={[{ label: "Burger Campaigns", href: "/dashboard/campaigns" }, { label: "New" }]}
      />
      <CampaignForm
        action={createCampaign}
        locations={locations ?? []}
        submitLabel="Create campaign"
      />
    </div>
  );
}
