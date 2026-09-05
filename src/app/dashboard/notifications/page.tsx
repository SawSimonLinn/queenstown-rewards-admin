import Link from "next/link";

import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataPair, EmptyState, MobileDataCard, MobileDataList } from "@/components/ui/data-list";
import { FilterBar } from "@/components/ui/filter-bar";
import { Field, Select } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/page-header";
import { NotificationStatusBadge } from "@/components/ui/status-badge";
import { createClient } from "@/lib/supabase/server";

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("notification_campaigns")
    .select("id, title, body, status, scheduled_for, created_at")
    .order("created_at", { ascending: false });
  if (params.status) query = query.eq("status", params.status);

  const { data: campaigns } = await query;
  const notificationItems = campaigns ?? [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Notifications" subtitle="Push notifications sent to customer devices via Expo.">
        <Link href="/dashboard/notifications/new" className={buttonClassName({ className: "w-full sm:w-auto" })}>
          New notification
        </Link>
      </PageHeader>

      <FilterBar clearHref="/dashboard/notifications">
        <Field label="Status" htmlFor="status">
          <Select id="status" name="status" defaultValue={params.status ?? ""}>
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="sending">Sending</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
          </Select>
        </Field>
      </FilterBar>

      {notificationItems.length === 0 ? (
        <EmptyState>No notifications yet.</EmptyState>
      ) : (
        <MobileDataList>
          {notificationItems.map((campaign) => (
            <MobileDataCard key={campaign.id}>
              <div className="flex items-start justify-between gap-3">
                <h2 className="min-w-0 text-base font-semibold text-ink">{campaign.title}</h2>
                <NotificationStatusBadge status={campaign.status} />
              </div>
              <p className="mt-3 break-words text-sm text-muted">{campaign.body}</p>
              <dl className="mt-4 grid gap-3">
                <DataPair label="Created">{new Date(campaign.created_at).toLocaleString()}</DataPair>
                {campaign.scheduled_for ? (
                  <DataPair label="Scheduled">{new Date(campaign.scheduled_for).toLocaleString()}</DataPair>
                ) : null}
              </dl>
            </MobileDataCard>
          ))}
        </MobileDataList>
      )}

      {notificationItems.length > 0 ? (
        <Card padding="none" className="hidden overflow-hidden md:block">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-cream text-muted">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Body</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {notificationItems.map((campaign) => (
                <tr key={campaign.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-ink">{campaign.title}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-muted">{campaign.body}</td>
                  <td className="px-4 py-3">
                    <NotificationStatusBadge status={campaign.status} />
                  </td>
                  <td className="px-4 py-3 text-muted">{new Date(campaign.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : null}
    </div>
  );
}
