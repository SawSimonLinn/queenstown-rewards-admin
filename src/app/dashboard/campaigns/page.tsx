import Link from "next/link";

import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Badge,
  type BadgeTone,
  DataPair,
  EmptyState,
  MobileDataCard,
  MobileDataList,
} from "@/components/ui/data-list";
import { PageHeader } from "@/components/ui/page-header";
import { createClient } from "@/lib/supabase/server";

const STATUS_TONES: Record<string, BadgeTone> = {
  active: "green",
  scheduled: "blue",
  draft: "neutral",
  expired: "red",
};

export default async function CampaignsPage() {
  const supabase = await createClient();
  const { data: campaigns } = await supabase
    .from("burger_campaigns")
    .select("id, name, status, start_date, end_date")
    .order("start_date", { ascending: false });
  const campaignItems = campaigns ?? [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Burger of the Month">
        <Link
          href="/dashboard/campaigns/new"
          className={buttonClassName({ className: "w-full sm:w-auto" })}
        >
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
                <h2 className="min-w-0 text-base font-semibold text-neutral-950">
                  {campaign.name}
                </h2>
                <Badge tone={STATUS_TONES[campaign.status] ?? "neutral"}>{campaign.status}</Badge>
              </div>
              <dl className="mt-4 grid gap-3">
                <DataPair label="Dates">
                  {new Date(campaign.start_date).toLocaleDateString()} -{" "}
                  {new Date(campaign.end_date).toLocaleDateString()}
                </DataPair>
              </dl>
              <Link
                href={`/dashboard/campaigns/${campaign.id}/edit`}
                className={buttonClassName({ variant: "outline", className: "mt-4 w-full" })}
              >
                Edit campaign
              </Link>
            </MobileDataCard>
          ))}
        </MobileDataList>
      )}

      {campaignItems.length > 0 ? (
        <Card padding="none" className="hidden overflow-hidden md:block">
          <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Dates</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {campaignItems.map((campaign) => (
              <tr key={campaign.id} className="border-b border-neutral-100 last:border-0">
                <td className="px-4 py-3 font-medium">{campaign.name}</td>
                <td className="px-4 py-3">
                  <Badge tone={STATUS_TONES[campaign.status] ?? "neutral"}>{campaign.status}</Badge>
                </td>
                <td className="px-4 py-3 text-neutral-600">
                  {new Date(campaign.start_date).toLocaleDateString()} –{" "}
                  {new Date(campaign.end_date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/dashboard/campaigns/${campaign.id}/edit`}
                    className="font-medium text-blue-700 hover:text-blue-800 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {campaignItems.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-neutral-500">
                  No campaigns have been created yet.
                </td>
              </tr>
            )}
          </tbody>
          </table>
        </Card>
      ) : null}
    </div>
  );
}
