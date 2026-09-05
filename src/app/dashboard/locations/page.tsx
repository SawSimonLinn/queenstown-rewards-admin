import Link from "next/link";

import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge, DataPair, EmptyState, MobileDataCard, MobileDataList } from "@/components/ui/data-list";
import { FilterBar } from "@/components/ui/filter-bar";
import { Field, Input, Select } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/page-header";
import { isLocationOpenNow, type OpeningHours } from "@/lib/opening-hours";
import { isPromotionCurrentlyVisible } from "@/lib/status";
import { createClient } from "@/lib/supabase/server";

export default async function LocationsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const [{ data: locations }, { data: campaignLocations }, { data: specialLinks }, { data: staffMembers }] =
    await Promise.all([
      supabase
        .from("locations")
        .select("id, name, address, suburb, phone, is_participating, opening_hours")
        .order("name"),
      supabase.from("campaign_locations").select("location_id, burger_campaigns(status)"),
      supabase.from("special_locations").select("location_id, specials(status, start_date, end_date)"),
      supabase.from("staff_members").select("location_id").eq("is_active", true),
    ]);

  const campaignParticipation = new Set(
    (campaignLocations ?? [])
      .filter((row) => (row.burger_campaigns as unknown as { status: string } | null)?.status === "active")
      .map((row) => row.location_id),
  );
  const promotionParticipation = new Set(
    (specialLinks ?? [])
      .filter((row) => {
        const special = row.specials as unknown as { status: string; start_date: string; end_date: string } | null;
        return (
          special &&
          isPromotionCurrentlyVisible({ status: special.status, startDate: special.start_date, endDate: special.end_date })
        );
      })
      .map((row) => row.location_id),
  );
  const staffCounts = new Map<string, number>();
  for (const row of staffMembers ?? []) {
    staffCounts.set(row.location_id, (staffCounts.get(row.location_id) ?? 0) + 1);
  }

  const search = params.q?.toLowerCase().trim();
  const participating = params.participating;
  const hasCampaign = params.has_campaign === "1";
  const hasPromotion = params.has_promotion === "1";

  const locationItems = (locations ?? []).filter((location) => {
    if (search && !location.name.toLowerCase().includes(search)) return false;
    if (participating === "yes" && !location.is_participating) return false;
    if (participating === "no" && location.is_participating) return false;
    if (hasCampaign && !campaignParticipation.has(location.id)) return false;
    if (hasPromotion && !promotionParticipation.has(location.id)) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Locations" subtitle={`${locationItems.length} of ${locations?.length ?? 0} locations`}>
        <Link href="/dashboard/locations/new" className={buttonClassName({ className: "w-full sm:w-auto" })}>
          Add location
        </Link>
      </PageHeader>

      <FilterBar clearHref="/dashboard/locations">
        <Field label="Search" htmlFor="q">
          <Input id="q" name="q" defaultValue={params.q} placeholder="Location name" />
        </Field>
        <Field label="Participation" htmlFor="participating">
          <Select id="participating" name="participating" defaultValue={participating ?? ""}>
            <option value="">All locations</option>
            <option value="yes">Participating</option>
            <option value="no">Not participating</option>
          </Select>
        </Field>
        <label className="flex min-h-11 cursor-pointer items-center gap-2 self-end pb-2 text-sm font-medium text-ink">
          <input type="checkbox" name="has_campaign" value="1" defaultChecked={hasCampaign} className="size-4 rounded border-border-strong text-brand focus:ring-2 focus:ring-brand-tint" />
          Has active campaign
        </label>
        <label className="flex min-h-11 cursor-pointer items-center gap-2 self-end pb-2 text-sm font-medium text-ink">
          <input type="checkbox" name="has_promotion" value="1" defaultChecked={hasPromotion} className="size-4 rounded border-border-strong text-brand focus:ring-2 focus:ring-brand-tint" />
          Has active promotion
        </label>
      </FilterBar>

      {locationItems.length === 0 ? (
        <EmptyState>No locations match these filters.</EmptyState>
      ) : (
        <MobileDataList>
          {locationItems.map((location) => (
            <LocationCard
              key={location.id}
              location={location}
              hasCampaign={campaignParticipation.has(location.id)}
              hasPromotion={promotionParticipation.has(location.id)}
              staffCount={staffCounts.get(location.id) ?? 0}
            />
          ))}
        </MobileDataList>
      )}

      {locationItems.length > 0 ? (
        <Card padding="none" className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-max text-left text-sm">
            <thead className="border-b border-border bg-cream text-muted">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Suburb</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Open now</th>
                <th className="px-4 py-3">Campaign</th>
                <th className="px-4 py-3">Promotion</th>
                <th className="px-4 py-3">Staff</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {locationItems.map((location) => {
                const openNow = isLocationOpenNow(location.opening_hours as OpeningHours);
                return (
                  <tr key={location.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 align-middle font-medium text-ink">
                      <Link href={`/dashboard/locations/${location.id}`} className="hover:underline">
                        {location.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 align-middle text-muted">{location.suburb}</td>
                    <td className="px-4 py-3 align-middle">
                      <Badge tone={location.is_participating ? "green" : "neutral"}>
                        {location.is_participating ? "Participating" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      {openNow === null ? (
                        <span className="text-muted">—</span>
                      ) : (
                        <Badge tone={openNow ? "green" : "neutral"}>{openNow ? "Open" : "Closed"}</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      {campaignParticipation.has(location.id) ? <Badge tone="brand">Active</Badge> : <span className="text-muted">—</span>}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      {promotionParticipation.has(location.id) ? (
                        <span aria-label="Has active promotion" title="Has active promotion" className="text-brand">
                          🎁
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-middle text-muted">{staffCounts.get(location.id) ?? 0}</td>
                    <td className="px-4 py-3 text-right align-middle">
                      <Link
                        href={`/dashboard/locations/${location.id}/edit`}
                        className="font-medium text-brand hover:text-brand-hover hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      ) : null}
    </div>
  );
}

function LocationCard({
  location,
  hasCampaign,
  hasPromotion,
  staffCount,
}: {
  location: {
    id: string;
    name: string;
    address: string;
    suburb: string;
    phone: string;
    is_participating: boolean;
    opening_hours: unknown;
  };
  hasCampaign: boolean;
  hasPromotion: boolean;
  staffCount: number;
}) {
  const openNow = isLocationOpenNow(location.opening_hours as OpeningHours);
  return (
    <MobileDataCard>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="line-clamp-2 text-base font-semibold text-ink">
            {location.name} {hasPromotion ? <span title="Has active promotion">🎁</span> : null}
          </h2>
          <p className="mt-1 line-clamp-2 text-sm text-muted">
            {location.address}, {location.suburb}
          </p>
        </div>
        <Badge tone={location.is_participating ? "green" : "neutral"}>
          {location.is_participating ? "Participating" : "Inactive"}
        </Badge>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3">
        <DataPair label="Open now">
          {openNow === null ? "—" : openNow ? "Open" : "Closed"}
        </DataPair>
        <DataPair label="Staff">{staffCount}</DataPair>
        <DataPair label="Campaign">{hasCampaign ? "Active" : "None"}</DataPair>
        <DataPair label="Phone">
          <span className="whitespace-nowrap">{location.phone}</span>
        </DataPair>
      </dl>
      <div className="mt-4 flex gap-2">
        <Link
          href={`/dashboard/locations/${location.id}`}
          className={buttonClassName({ variant: "outline", className: "flex-1" })}
        >
          View
        </Link>
        <Link
          href={`/dashboard/locations/${location.id}/edit`}
          className={buttonClassName({ variant: "primary", className: "flex-1" })}
        >
          Edit
        </Link>
      </div>
    </MobileDataCard>
  );
}
