import Link from "next/link";

import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, MobileDataCard, MobileDataList, DataPair } from "@/components/ui/data-list";
import { PageHeader } from "@/components/ui/page-header";
import { CampaignStatusBadge } from "@/components/ui/status-badge";
import { createClient } from "@/lib/supabase/server";

import { CampaignRowActions } from "./campaign-row-actions";

export default async function CampaignsPage() {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const [{ data: campaigns }, { data: redeemedEntitlements }, { data: activeQrCodes }] = await Promise.all([
    supabase
      .from("burger_campaigns")
      .select("id, name, status, start_date, end_date")
      .order("start_date", { ascending: false }),
    supabase.from("monthly_entitlements").select("burger_campaign").eq("status", "redeemed"),
    supabase.from("redemption_qr_codes").select("campaign_id").eq("is_active", true).gt("expires_at", now),
  ]);
  const campaignItems = campaigns ?? [];

  const redemptionCounts = new Map<string, number>();
  for (const row of redeemedEntitlements ?? []) {
    redemptionCounts.set(row.burger_campaign, (redemptionCounts.get(row.burger_campaign) ?? 0) + 1);
  }
  const campaignsWithActiveQr = new Set((activeQrCodes ?? []).map((row) => row.campaign_id));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Burger Campaigns" subtitle="Recurring Burger of the Month rewards and their status.">
        <Link href="/dashboard/campaigns/new" className={buttonClassName({ className: "w-full sm:w-auto" })}>
          New campaign
        </Link>
      </PageHeader>

      {campaignItems.length === 0 ? (
        <EmptyState>No campaigns have been created yet.</EmptyState>
      ) : (
        <MobileDataList>
          {campaignItems.map((campaign) => (
            <MobileDataCard key={campaign.id}>
              <div className="flex items-start justify-between gap-3">
                <h2 className="min-w-0 text-base font-semibold text-ink">{campaign.name}</h2>
                <CampaignStatusBadge status={campaign.status} />
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3">
                <DataPair label="Dates">
                  {new Date(campaign.start_date).toLocaleDateString()} – {new Date(campaign.end_date).toLocaleDateString()}
                </DataPair>
                <DataPair label="Redemptions">{redemptionCounts.get(campaign.id) ?? 0}</DataPair>
                <DataPair label="QR codes">{campaignsWithActiveQr.has(campaign.id) ? "Active" : "None active"}</DataPair>
              </dl>
              <div className="mt-4 flex flex-col gap-2">
                <Link href={`/dashboard/campaigns/${campaign.id}/edit`} className={buttonClassName({ variant: "primary" })}>
                  Edit campaign
                </Link>
                <CampaignRowActions campaignId={campaign.id} status={campaign.status} />
              </div>
            </MobileDataCard>
          ))}
        </MobileDataList>
      )}

      {campaignItems.length > 0 ? (
        <Card padding="none" className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-max text-left text-sm">
            <thead className="border-b border-border bg-cream text-muted">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Dates</th>
                <th className="px-4 py-3">Redemptions</th>
                <th className="px-4 py-3">QR codes</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {campaignItems.map((campaign) => (
                <tr key={campaign.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-ink">{campaign.name}</td>
                  <td className="px-4 py-3">
                    <CampaignStatusBadge status={campaign.status} />
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(campaign.start_date).toLocaleDateString()} – {new Date(campaign.end_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-muted">{redemptionCounts.get(campaign.id) ?? 0}</td>
                  <td className="px-4 py-3 text-muted">{campaignsWithActiveQr.has(campaign.id) ? "Active" : "None active"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/dashboard/campaigns/${campaign.id}/edit`}
                        className="font-medium text-brand hover:text-brand-hover hover:underline"
                      >
                        Edit
                      </Link>
                      <CampaignRowActions campaignId={campaign.id} status={campaign.status} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : null}
    </div>
  );
}
