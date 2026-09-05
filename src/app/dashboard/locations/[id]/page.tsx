import Link from "next/link";
import { notFound } from "next/navigation";

import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge, DataPair, EmptyState } from "@/components/ui/data-list";
import { PageHeader } from "@/components/ui/page-header";
import { CampaignStatusBadge, PromotionStatusBadge } from "@/components/ui/status-badge";
import { Tabs } from "@/components/ui/tabs";
import { DAYS, isLocationOpenNow, type OpeningHours } from "@/lib/opening-hours";
import { createClient } from "@/lib/supabase/server";

const DAY_LABELS: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

export default async function LocationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: location }, { data: campaignLinks }, { data: promotionLinks }, { data: qrCodes }, { data: staffLinks }] =
    await Promise.all([
      supabase.from("locations").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("campaign_locations")
        .select("burger_campaigns(id, name, status, start_date, end_date)")
        .eq("location_id", id),
      supabase
        .from("special_locations")
        .select("specials(id, title, status, start_date, end_date)")
        .eq("location_id", id),
      supabase
        .from("redemption_qr_codes")
        .select("id, expires_at, is_active, burger_campaigns(name)")
        .eq("location_id", id)
        .order("expires_at", { ascending: false }),
      supabase
        .from("staff_members")
        .select("id, is_active, profiles(full_name, email, role)")
        .eq("location_id", id),
    ]);

  if (!location) notFound();

  const openingHours = location.opening_hours as OpeningHours;
  const openNow = isLocationOpenNow(openingHours);
  const campaigns = (campaignLinks ?? [])
    .map((row) => row.burger_campaigns as unknown as { id: string; name: string; status: string; start_date: string; end_date: string } | null)
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
  const promotions = (promotionLinks ?? [])
    .map((row) => row.specials as unknown as { id: string; title: string; status: string; start_date: string; end_date: string } | null)
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={location.name}
        subtitle={`${location.address}, ${location.suburb}`}
        breadcrumbs={[{ label: "Locations", href: "/dashboard/locations" }, { label: location.name }]}
      >
        <Link href={`/dashboard/locations/${id}/edit`} className={buttonClassName({ className: "w-full sm:w-auto" })}>
          Edit location
        </Link>
      </PageHeader>

      <Tabs
        tabs={[
          {
            id: "overview",
            label: "Overview",
            content: (
              <Card>
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <DataPair label="Status">
                    <Badge tone={location.is_participating ? "green" : "neutral"}>
                      {location.is_participating ? "Participating" : "Inactive"}
                    </Badge>
                  </DataPair>
                  <DataPair label="Open now">
                    {openNow === null ? "No hours set for today" : <Badge tone={openNow ? "green" : "neutral"}>{openNow ? "Open" : "Closed"}</Badge>}
                  </DataPair>
                  <DataPair label="Address">{location.address}</DataPair>
                  <DataPair label="Suburb">{location.suburb}</DataPair>
                  <DataPair label="Phone">{location.phone}</DataPair>
                  <DataPair label="Staff assigned">{staffLinks?.length ?? 0}</DataPair>
                </dl>
              </Card>
            ),
          },
          {
            id: "hours",
            label: "Opening hours",
            content: (
              <Card>
                <dl className="divide-y divide-border">
                  {DAYS.map((day) => {
                    const hours = openingHours?.[day] ?? null;
                    return (
                      <div key={day} className="flex items-center justify-between py-2.5 text-sm">
                        <dt className="font-medium text-ink">{DAY_LABELS[day]}</dt>
                        <dd className="text-muted">{hours ? `${hours.open} – ${hours.close}` : "Closed"}</dd>
                      </div>
                    );
                  })}
                </dl>
              </Card>
            ),
          },
          {
            id: "campaigns",
            label: "Campaigns",
            content:
              campaigns.length === 0 ? (
                <EmptyState>No Burger of the Month campaigns include this location.</EmptyState>
              ) : (
                <Card padding="none">
                  <ul className="divide-y divide-border">
                    {campaigns.map((campaign) => (
                      <li key={campaign.id} className="flex items-center justify-between gap-3 px-4 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-ink">{campaign.name}</p>
                          <p className="text-xs text-muted">
                            {new Date(campaign.start_date).toLocaleDateString()} – {new Date(campaign.end_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <CampaignStatusBadge status={campaign.status} />
                          <Link href={`/dashboard/campaigns/${campaign.id}/edit`} className="text-sm font-medium text-brand hover:underline">
                            Edit
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                </Card>
              ),
          },
          {
            id: "promotions",
            label: "Promotions",
            content:
              promotions.length === 0 ? (
                <EmptyState>No promotions include this location.</EmptyState>
              ) : (
                <Card padding="none">
                  <ul className="divide-y divide-border">
                    {promotions.map((promo) => (
                      <li key={promo.id} className="flex items-center justify-between gap-3 px-4 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-ink">{promo.title}</p>
                          <p className="text-xs text-muted">
                            {new Date(promo.start_date).toLocaleDateString()} – {new Date(promo.end_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <PromotionStatusBadge status={promo.status} startDate={promo.start_date} endDate={promo.end_date} />
                          <Link href={`/dashboard/specials/${promo.id}/edit`} className="text-sm font-medium text-brand hover:underline">
                            Edit
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                </Card>
              ),
          },
          {
            id: "qr-codes",
            label: "QR codes",
            content:
              (qrCodes?.length ?? 0) === 0 ? (
                <EmptyState>No QR codes generated for this location yet.</EmptyState>
              ) : (
                <Card padding="none">
                  <ul className="divide-y divide-border">
                    {(qrCodes ?? []).map((qr) => {
                      const campaign = qr.burger_campaigns as unknown as { name: string } | null;
                      const expired = new Date(qr.expires_at) <= new Date();
                      const status = !qr.is_active ? "Deactivated" : expired ? "Expired" : "Active";
                      return (
                        <li key={qr.id} className="flex items-center justify-between gap-3 px-4 py-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-ink">{campaign?.name ?? "Unknown campaign"}</p>
                            <p className="text-xs text-muted">Expires {new Date(qr.expires_at).toLocaleString()}</p>
                          </div>
                          <Badge tone={status === "Active" ? "green" : status === "Expired" ? "red" : "neutral"}>{status}</Badge>
                        </li>
                      );
                    })}
                  </ul>
                </Card>
              ),
          },
          {
            id: "staff",
            label: "Staff",
            content:
              (staffLinks?.length ?? 0) === 0 ? (
                <EmptyState>No staff assigned to this location.</EmptyState>
              ) : (
                <Card padding="none">
                  <ul className="divide-y divide-border">
                    {(staffLinks ?? []).map((staff) => {
                      const profile = staff.profiles as unknown as { full_name: string; email: string; role: string } | null;
                      return (
                        <li key={staff.id} className="flex items-center justify-between gap-3 px-4 py-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-ink">{profile?.full_name}</p>
                            <p className="truncate text-xs text-muted">{profile?.email}</p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <Badge tone={profile?.role === "admin" ? "brand" : "neutral"} className="capitalize">
                              {profile?.role}
                            </Badge>
                            <Badge tone={staff.is_active ? "green" : "neutral"}>{staff.is_active ? "Active" : "Inactive"}</Badge>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </Card>
              ),
          },
        ]}
      />
    </div>
  );
}
