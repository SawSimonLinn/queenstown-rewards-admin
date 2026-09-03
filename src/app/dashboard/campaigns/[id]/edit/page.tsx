import { notFound } from "next/navigation";

import { updateCampaign } from "@/app/dashboard/campaigns/actions";
import { CampaignForm } from "@/app/dashboard/campaigns/campaign-form";
import { PageHeader } from "@/components/ui/page-header";
import { createClient } from "@/lib/supabase/server";

export default async function EditCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: campaign }, { data: locations }, { data: campaignLocations }] = await Promise.all([
    supabase.from("burger_campaigns").select("*").eq("id", id).maybeSingle(),
    supabase.from("locations").select("id, name").order("name"),
    supabase.from("campaign_locations").select("location_id").eq("campaign_id", id),
  ]);

  if (!campaign) notFound();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={`Edit ${campaign.name}`} />
      <CampaignForm
        action={updateCampaign.bind(null, id)}
        initial={campaign}
        locations={locations ?? []}
        initialLocationIds={(campaignLocations ?? []).map((row) => row.location_id)}
        submitLabel="Save changes"
      />
    </div>
  );
}
