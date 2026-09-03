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
  draft: "neutral",
  scheduled: "blue",
  sent: "green",
};

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: campaigns } = await supabase
    .from("notification_campaigns")
    .select("id, title, body, status, scheduled_for, created_at")
    .order("created_at", { ascending: false });
  const notificationItems = campaigns ?? [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Notifications">
        <Link
          href="/dashboard/notifications/new"
          className={buttonClassName({ className: "w-full sm:w-auto" })}
        >
          New notification
        </Link>
      </PageHeader>

      {notificationItems.length === 0 ? (
        <EmptyState>No notifications yet.</EmptyState>
      ) : (
        <MobileDataList>
          {notificationItems.map((campaign) => (
            <MobileDataCard key={campaign.id}>
              <div className="flex items-start justify-between gap-3">
                <h2 className="min-w-0 text-base font-semibold text-neutral-950">
                  {campaign.title}
                </h2>
                <Badge tone={STATUS_TONES[campaign.status] ?? "neutral"}>{campaign.status}</Badge>
              </div>
              <p className="mt-3 break-words text-sm text-neutral-600">{campaign.body}</p>
              <dl className="mt-4 grid gap-3">
                <DataPair label="Created">
                  {new Date(campaign.created_at).toLocaleString()}
                </DataPair>
                {campaign.scheduled_for ? (
                  <DataPair label="Scheduled">
                    {new Date(campaign.scheduled_for).toLocaleString()}
                  </DataPair>
                ) : null}
              </dl>
            </MobileDataCard>
          ))}
        </MobileDataList>
      )}

      {notificationItems.length > 0 ? (
        <Card padding="none" className="hidden overflow-hidden md:block">
          <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-600">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Body</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {notificationItems.map((campaign) => (
              <tr key={campaign.id} className="border-b border-neutral-100 last:border-0">
                <td className="px-4 py-3 font-medium">{campaign.title}</td>
                <td className="max-w-xs truncate px-4 py-3 text-neutral-600">{campaign.body}</td>
                <td className="px-4 py-3">
                  <Badge tone={STATUS_TONES[campaign.status] ?? "neutral"}>{campaign.status}</Badge>
                </td>
                <td className="px-4 py-3 text-neutral-600">
                  {new Date(campaign.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
            {notificationItems.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-neutral-500">
                  No notifications yet.
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
