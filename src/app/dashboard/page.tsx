import Link from "next/link";

import { Badge, EmptyState } from "@/components/ui/data-list";
import { Card } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { PageHeader } from "@/components/ui/page-header";
import { CampaignStatusBadge } from "@/components/ui/status-badge";
import { createClient } from "@/lib/supabase/server";
import { getPromotionStatus, isPromotionCurrentlyVisible } from "@/lib/status";

const SOON_MS = 7 * 24 * 60 * 60 * 1000; // 7 days, for "ending soon"
const QR_SOON_MS = 48 * 60 * 60 * 1000; // 48 hours

export default async function OverviewPage() {
  const supabase = await createClient();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    locationsCount,
    activeCampaign,
    pendingRedemptions,
    confirmedThisMonth,
    activeSpecialsRaw,
    expiringQrCodes,
    stuckNotifications,
    endingCampaigns,
    recentAuditLogs,
    recentRedemptions,
  ] = await Promise.all([
    supabase.from("locations").select("id", { count: "exact", head: true }).eq("is_participating", true),
    supabase
      .from("burger_campaigns")
      .select("id, name, image_url, start_date, end_date, status, campaign_locations(location_id)")
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
      .gte("redeemed_at", monthStart),
    supabase
      .from("specials")
      .select("id, title, start_date, end_date, status, special_locations(location_id, locations(name))"),
    supabase
      .from("redemption_qr_codes")
      .select("id, expires_at, is_active, locations(name), burger_campaigns(name)")
      .eq("is_active", true)
      .lte("expires_at", new Date(now.getTime() + QR_SOON_MS).toISOString())
      .gte("expires_at", now.toISOString()),
    supabase
      .from("notification_campaigns")
      .select("id, title, status, scheduled_for")
      .in("status", ["failed", "scheduled"])
      .lte("scheduled_for", now.toISOString()),
    supabase
      .from("burger_campaigns")
      .select("id, name, end_date")
      .eq("status", "active")
      .lte("end_date", new Date(now.getTime() + SOON_MS).toISOString())
      .gte("end_date", now.toISOString()),
    supabase
      .from("audit_logs")
      .select("id, action, created_at, profiles(full_name)")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("redemptions")
      .select("id, status, redeemed_at, profiles(full_name), locations(name)")
      .order("redeemed_at", { ascending: false })
      .limit(5),
  ]);

  const activePromotions = (activeSpecialsRaw.data ?? []).filter((special) =>
    isPromotionCurrentlyVisible({
      status: special.status,
      startDate: special.start_date,
      endDate: special.end_date,
    }),
  );

  const promotionsByLocation = new Map<string, { locationName: string; promotions: typeof activePromotions }>();
  for (const promo of activePromotions) {
    const specialLocations = (promo.special_locations ?? []) as unknown as {
      location_id: string;
      locations: { name: string } | null;
    }[];
    for (const link of specialLocations) {
      const key = link.location_id;
      const entry = promotionsByLocation.get(key) ?? {
        locationName: link.locations?.name ?? "Unknown location",
        promotions: [],
      };
      entry.promotions.push(promo);
      promotionsByLocation.set(key, entry);
    }
  }

  const endingPromotions = activePromotions.filter(
    (promo) => new Date(promo.end_date).getTime() - now.getTime() <= SOON_MS,
  );

  const needsAttention = [
    (pendingRedemptions.count ?? 0) > 0 && {
      key: "pending",
      label: `${pendingRedemptions.count} redemption${pendingRedemptions.count === 1 ? "" : "s"} awaiting confirmation`,
      href: "/dashboard/redemptions?status=pending_staff_confirmation",
    },
    (expiringQrCodes.data?.length ?? 0) > 0 && {
      key: "qr",
      label: `${expiringQrCodes.data!.length} QR code${expiringQrCodes.data!.length === 1 ? "" : "s"} expiring within 48 hours`,
      href: "/dashboard/qr-codes",
    },
    (stuckNotifications.data?.length ?? 0) > 0 && {
      key: "notifications",
      label: `${stuckNotifications.data!.length} scheduled notification${stuckNotifications.data!.length === 1 ? "" : "s"} not yet dispatched or failed`,
      href: "/dashboard/notifications",
    },
    (endingCampaigns.data?.length ?? 0) > 0 && {
      key: "campaigns",
      label: `${endingCampaigns.data!.length} Burger of the Month campaign${endingCampaigns.data!.length === 1 ? "" : "s"} ending within 7 days`,
      href: "/dashboard/campaigns",
    },
    endingPromotions.length > 0 && {
      key: "promotions",
      label: `${endingPromotions.length} promotion${endingPromotions.length === 1 ? "" : "s"} ending within 7 days`,
      href: "/dashboard/specials",
    },
  ].filter(Boolean) as { key: string; label: string; href: string }[];

  const metrics = [
    { label: "Active locations", value: locationsCount.count ?? 0 },
    { label: "Pending redemptions", value: pendingRedemptions.count ?? 0, tone: "warning" as const },
    { label: "Redeemed this month", value: confirmedThisMonth.count ?? 0 },
    { label: "Active promotions", value: activePromotions.length },
  ];

  const campaign = activeCampaign.data;
  const campaignLocationCount = (campaign?.campaign_locations as unknown as { location_id: string }[] | null)
    ?.length ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Dashboard" subtitle="Snapshot of active rewards, redemptions, and restaurant coverage." />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} tone={metric.tone} />
        ))}
      </div>

      {needsAttention.length > 0 ? (
        <Card>
          <h2 className="font-display text-lg font-semibold text-ink">Needs attention</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {needsAttention.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className="flex items-center justify-between gap-3 rounded-lg border border-warning-border bg-warning-tint px-4 py-3 text-sm font-medium text-warning hover:brightness-95"
                >
                  {item.label}
                  <span aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Card>
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold text-ink">Active Burger of the Month</h2>
          {campaign ? (
            <Link href={`/dashboard/campaigns/${campaign.id}/edit`} className="text-sm font-medium text-brand hover:underline">
              Manage campaign
            </Link>
          ) : null}
        </div>
        {campaign ? (
          <div className="mt-4 flex flex-col gap-4 sm:flex-row">
            {campaign.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={campaign.image_url}
                alt=""
                className="h-32 w-full shrink-0 rounded-lg border border-border object-cover sm:w-48"
              />
            ) : null}
            <div className="min-w-0">
              <p className="font-display text-xl font-semibold text-ink">{campaign.name}</p>
              <p className="mt-1 text-sm text-muted">
                {new Date(campaign.start_date).toLocaleDateString()} –{" "}
                {new Date(campaign.end_date).toLocaleDateString()}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <CampaignStatusBadge status={campaign.status} />
                <span className="text-sm text-muted">
                  {campaignLocationCount} participating location{campaignLocationCount === 1 ? "" : "s"}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState>
              No active Burger of the Month campaign.{" "}
              <Link href="/dashboard/campaigns/new" className="font-medium text-brand hover:underline">
                Create one
              </Link>
            </EmptyState>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="font-display text-lg font-semibold text-ink">Promotions by location</h2>
        {promotionsByLocation.size === 0 ? (
          <div className="mt-4">
            <EmptyState>No locations currently have an active promotion.</EmptyState>
          </div>
        ) : (
          <ul className="mt-4 flex flex-col divide-y divide-border">
            {Array.from(promotionsByLocation.entries()).map(([locationId, entry]) => (
              <li key={locationId} className="py-3 first:pt-0 last:pb-0">
                <p className="text-sm font-semibold text-ink">{entry.locationName}</p>
                <ul className="mt-1.5 flex flex-col gap-1.5">
                  {entry.promotions.map((promo) => {
                    const status = getPromotionStatus({
                      status: promo.status,
                      startDate: promo.start_date,
                      endDate: promo.end_date,
                    });
                    return (
                      <li key={promo.id} className="flex flex-wrap items-center gap-2 text-sm text-muted">
                        <span className="text-ink">{promo.title}</span>
                        <Badge tone={status === "active" ? "green" : "neutral"}>{status}</Badge>
                        <span>
                          {new Date(promo.start_date).toLocaleDateString()} –{" "}
                          {new Date(promo.end_date).toLocaleDateString()}
                        </span>
                        <Link
                          href={`/dashboard/specials/${promo.id}/edit`}
                          className="font-medium text-brand hover:underline"
                        >
                          Edit
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold text-ink">Recent redemptions</h2>
            <Link href="/dashboard/redemptions" className="text-sm font-medium text-brand hover:underline">
              View all
            </Link>
          </div>
          {(recentRedemptions.data ?? []).length === 0 ? (
            <div className="mt-4">
              <EmptyState>No redemptions yet.</EmptyState>
            </div>
          ) : (
            <ul className="mt-3 flex flex-col divide-y divide-border">
              {(recentRedemptions.data ?? []).map((r) => {
                const profile = r.profiles as unknown as { full_name: string } | null;
                const location = r.locations as unknown as { name: string } | null;
                return (
                  <li key={r.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <span className="min-w-0 truncate text-ink">
                      {profile?.full_name ?? "Unknown"} · {location?.name ?? "—"}
                    </span>
                    <span className="shrink-0 text-xs text-muted">
                      {new Date(r.redeemed_at).toLocaleDateString()}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold text-ink">Recent activity</h2>
            <Link href="/dashboard/audit-log" className="text-sm font-medium text-brand hover:underline">
              View all
            </Link>
          </div>
          {(recentAuditLogs.data ?? []).length === 0 ? (
            <div className="mt-4">
              <EmptyState>No recent admin activity.</EmptyState>
            </div>
          ) : (
            <ul className="mt-3 flex flex-col divide-y divide-border">
              {(recentAuditLogs.data ?? []).map((log) => {
                const actor = log.profiles as unknown as { full_name: string } | null;
                return (
                  <li key={log.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <span className="min-w-0 truncate text-ink">
                      {log.action.replace(/_/g, " ")} · {actor?.full_name ?? "System"}
                    </span>
                    <span className="shrink-0 text-xs text-muted">
                      {new Date(log.created_at).toLocaleDateString()}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
