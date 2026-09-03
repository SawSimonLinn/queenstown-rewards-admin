import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { createClient } from "@/lib/supabase/server";

export default async function OverviewPage() {
  const supabase = await createClient();

  const [locations, activeCampaign, pendingRedemptions, confirmedThisMonth, specials] =
    await Promise.all([
      supabase.from("locations").select("id", { count: "exact", head: true }),
      supabase
        .from("burger_campaigns")
        .select("id, name")
        .eq("status", "active")
        .maybeSingle(),
      supabase
        .from("redemptions")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending_staff_confirmation"),
      supabase
        .from("redemptions")
        .select("id", { count: "exact", head: true })
        .eq("status", "confirmed")
        .gte("redeemed_at", new Date(new Date().setDate(1)).toISOString()),
      supabase
        .from("specials")
        .select("id", { count: "exact", head: true })
        .gte("end_date", new Date().toISOString()),
    ]);

  const metrics = [
    { label: "Locations", value: locations.count ?? 0 },
    { label: "Pending redemptions", value: pendingRedemptions.count ?? 0 },
    { label: "Redeemed this month", value: confirmedThisMonth.count ?? 0 },
    { label: "Active specials", value: specials.count ?? 0 },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Overview"
        subtitle="Snapshot of active rewards, redemptions, and restaurant coverage."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="min-w-0">
            <p className="text-sm font-medium text-neutral-500">{metric.label}</p>
            <p className="mt-2 text-3xl font-semibold text-neutral-950">{metric.value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <p className="text-sm font-medium text-neutral-500">Current Burger of the Month</p>
        <p className="mt-2 break-words text-lg font-semibold text-neutral-950">
          {activeCampaign.data ? activeCampaign.data.name : "No active campaign"}
        </p>
      </Card>
    </div>
  );
}
