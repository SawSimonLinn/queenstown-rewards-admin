import Link from "next/link";

import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge, DataPair, EmptyState, MobileDataCard, MobileDataList } from "@/components/ui/data-list";
import { FilterBar } from "@/components/ui/filter-bar";
import { Field, Input, Select } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/page-header";
import { PromotionStatusBadge } from "@/components/ui/status-badge";
import { getPromotionStatus } from "@/lib/status";
import { createClient } from "@/lib/supabase/server";

import { SpecialRowActions } from "./special-row-actions";

export default async function SpecialsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const [{ data: specials }, { data: locations }, { data: specialLocations }] = await Promise.all([
    supabase
      .from("specials")
      .select("id, title, start_date, end_date, status")
      .order("start_date", { ascending: false }),
    supabase.from("locations").select("id, name").order("name"),
    supabase.from("special_locations").select("special_id, location_id, locations(name)"),
  ]);

  const locationsBySpecial = new Map<string, { id: string; name: string }[]>();
  for (const row of specialLocations ?? []) {
    const list = locationsBySpecial.get(row.special_id) ?? [];
    const location = row.locations as unknown as { name: string } | null;
    if (location) list.push({ id: row.location_id, name: location.name });
    locationsBySpecial.set(row.special_id, list);
  }

  const search = params.q?.toLowerCase().trim();
  const statusFilter = params.status;
  const locationFilter = params.location_id;
  const dateFilter = params.date;

  const specialItems = (specials ?? []).filter((special) => {
    if (search && !special.title.toLowerCase().includes(search)) return false;
    if (statusFilter && getPromotionStatus({ status: special.status, startDate: special.start_date, endDate: special.end_date }) !== statusFilter) {
      return false;
    }
    if (locationFilter && !(locationsBySpecial.get(special.id) ?? []).some((l) => l.id === locationFilter)) return false;
    if (dateFilter) {
      const date = new Date(dateFilter);
      if (date < new Date(special.start_date) || date > new Date(special.end_date)) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Promotions" subtitle="Time-boxed promotions shown in the mobile app.">
        <Link href="/dashboard/specials/new" className={buttonClassName({ className: "w-full sm:w-auto" })}>
          Create promotion
        </Link>
      </PageHeader>

      <FilterBar clearHref="/dashboard/specials">
        <Field label="Search" htmlFor="q">
          <Input id="q" name="q" defaultValue={params.q} placeholder="Promotion title" />
        </Field>
        <Field label="Status" htmlFor="status">
          <Select id="status" name="status" defaultValue={statusFilter ?? ""}>
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
          </Select>
        </Field>
        <Field label="Location" htmlFor="location_id">
          <Select id="location_id" name="location_id" defaultValue={locationFilter ?? ""}>
            <option value="">All locations</option>
            {(locations ?? []).map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Active on date" htmlFor="date">
          <Input id="date" name="date" type="date" defaultValue={params.date} />
        </Field>
      </FilterBar>

      {specialItems.length === 0 ? (
        <EmptyState>No promotions match these filters.</EmptyState>
      ) : (
        <MobileDataList>
          {specialItems.map((special) => {
            const specialLocationsList = locationsBySpecial.get(special.id) ?? [];
            return (
              <MobileDataCard key={special.id}>
                <div className="flex items-start justify-between gap-3">
                  <h2 className="min-w-0 text-base font-semibold text-ink">{special.title}</h2>
                  <PromotionStatusBadge status={special.status} startDate={special.start_date} endDate={special.end_date} />
                </div>
                <dl className="mt-4 grid gap-3">
                  <DataPair label="Dates">
                    {new Date(special.start_date).toLocaleDateString()} – {new Date(special.end_date).toLocaleDateString()}
                  </DataPair>
                  <DataPair label="Locations">
                    <div className="flex flex-wrap gap-1">
                      {specialLocationsList.length === 0 ? (
                        <span className="text-muted">None assigned</span>
                      ) : (
                        specialLocationsList.map((l) => <Badge key={l.id}>{l.name}</Badge>)
                      )}
                    </div>
                  </DataPair>
                </dl>
                <div className="mt-4 flex flex-col gap-2">
                  <Link href={`/dashboard/specials/${special.id}/edit`} className={buttonClassName({ variant: "primary" })}>
                    Edit promotion
                  </Link>
                  <SpecialRowActions specialId={special.id} status={special.status} />
                </div>
              </MobileDataCard>
            );
          })}
        </MobileDataList>
      )}

      {specialItems.length > 0 ? (
        <Card padding="none" className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-max text-left text-sm">
            <thead className="border-b border-border bg-cream text-muted">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Dates</th>
                <th className="px-4 py-3">Locations</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {specialItems.map((special) => {
                const specialLocationsList = locationsBySpecial.get(special.id) ?? [];
                return (
                  <tr key={special.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-ink">{special.title}</td>
                    <td className="px-4 py-3">
                      <PromotionStatusBadge status={special.status} startDate={special.start_date} endDate={special.end_date} />
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {new Date(special.start_date).toLocaleDateString()} – {new Date(special.end_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {specialLocationsList.length === 0 ? (
                          <span className="text-muted">None</span>
                        ) : (
                          specialLocationsList.map((l) => <Badge key={l.id}>{l.name}</Badge>)
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/dashboard/specials/${special.id}/edit`}
                          className="font-medium text-brand hover:text-brand-hover hover:underline"
                        >
                          Edit
                        </Link>
                        <SpecialRowActions specialId={special.id} status={special.status} />
                      </div>
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
