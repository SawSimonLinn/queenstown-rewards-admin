import { Card } from "@/components/ui/card";
import { DataPair, EmptyState, MobileDataCard, MobileDataList } from "@/components/ui/data-list";
import { FilterBar } from "@/components/ui/filter-bar";
import { Field, Input, Select } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/page-header";
import { RedemptionStatusBadge } from "@/components/ui/status-badge";
import { createClient } from "@/lib/supabase/server";

import { RedemptionActions } from "./redemption-actions";

export default async function RedemptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const [{ data: locations }] = await Promise.all([
    supabase.from("locations").select("id, name").order("name"),
  ]);

  let query = supabase
    .from("redemptions")
    .select(
      "id, status, redeemed_at, correction_note, locations(name), profiles(full_name, email), monthly_entitlements(burger_campaigns(name)), confirmed_by:profiles!redemptions_confirmed_by_staff_id_fkey(full_name)"
    )
    .order("redeemed_at", { ascending: false })
    .limit(100);

  if (params.status) query = query.eq("status", params.status);
  if (params.location_id) query = query.eq("location_id", params.location_id);
  if (params.from) query = query.gte("redeemed_at", params.from);
  if (params.to) query = query.lte("redeemed_at", params.to);

  const { data: redemptions } = await query;

  const customerFilter = params.customer?.toLowerCase().trim();
  const filtered = customerFilter
    ? (redemptions ?? []).filter((r) => {
        const profile = r.profiles as unknown as { full_name: string; email: string } | null;
        return (
          profile?.full_name.toLowerCase().includes(customerFilter) ||
          profile?.email.toLowerCase().includes(customerFilter)
        );
      })
    : (redemptions ?? []);

  const pendingCount = filtered.filter((r) => r.status === "pending_staff_confirmation").length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Redemptions"
        subtitle={`${filtered.length} recent results${pendingCount > 0 ? ` · ${pendingCount} awaiting confirmation` : ""}`}
      />

      <FilterBar>
        <Field label="Customer" htmlFor="customer">
          <Input id="customer" name="customer" defaultValue={params.customer} placeholder="Name or email" />
        </Field>
        <Field label="Location" htmlFor="location_id">
          <Select id="location_id" name="location_id" defaultValue={params.location_id ?? ""}>
            <option value="">All locations</option>
            {(locations ?? []).map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Status" htmlFor="status">
          <Select id="status" name="status" defaultValue={params.status ?? ""}>
            <option value="">All statuses</option>
            <option value="pending_staff_confirmation">Pending confirmation</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="corrected">Corrected</option>
          </Select>
        </Field>
        <Field label="From" htmlFor="from">
          <Input id="from" name="from" type="date" defaultValue={params.from} />
        </Field>
        <Field label="To" htmlFor="to">
          <Input id="to" name="to" type="date" defaultValue={params.to} />
        </Field>
      </FilterBar>

      {filtered.length === 0 ? (
        <EmptyState>No redemptions match these filters.</EmptyState>
      ) : (
        <MobileDataList>
          {filtered.map((redemption) => {
            const profile = redemption.profiles as unknown as { full_name: string; email: string } | null;
            const location = redemption.locations as unknown as { name: string } | null;
            const entitlement = redemption.monthly_entitlements as unknown as {
              burger_campaigns: { name: string } | null;
            } | null;
            const confirmedBy = redemption.confirmed_by as unknown as { full_name: string } | null;
            const pending = redemption.status === "pending_staff_confirmation";
            return (
              <MobileDataCard
                key={redemption.id}
                className={pending ? "border-l-4 border-l-brand" : ""}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold text-ink">
                      {profile?.full_name ?? "Unknown customer"}
                    </h2>
                    <p className="mt-1 break-words text-xs text-muted">{profile?.email ?? "No email"}</p>
                  </div>
                  <RedemptionStatusBadge status={redemption.status} />
                </div>
                <dl className="mt-4 grid gap-3">
                  <DataPair label="Campaign">{entitlement?.burger_campaigns?.name ?? "No campaign"}</DataPair>
                  <DataPair label="Location">{location?.name ?? "No location"}</DataPair>
                  <DataPair label="Date">{new Date(redemption.redeemed_at).toLocaleString()}</DataPair>
                  <DataPair label="Confirmed by">{confirmedBy?.full_name ?? "—"}</DataPair>
                </dl>
                <div className="mt-4">
                  <RedemptionActions redemptionId={redemption.id} status={redemption.status} />
                </div>
              </MobileDataCard>
            );
          })}
        </MobileDataList>
      )}

      {filtered.length > 0 ? (
        <Card padding="none" className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-max text-left text-sm">
            <thead className="border-b border-border bg-cream text-muted">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Campaign</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Confirmed by</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((redemption) => {
                const profile = redemption.profiles as unknown as { full_name: string; email: string } | null;
                const location = redemption.locations as unknown as { name: string } | null;
                const entitlement = redemption.monthly_entitlements as unknown as {
                  burger_campaigns: { name: string } | null;
                } | null;
                const confirmedBy = redemption.confirmed_by as unknown as { full_name: string } | null;
                const pending = redemption.status === "pending_staff_confirmation";
                return (
                  <tr
                    key={redemption.id}
                    className={`border-b border-border last:border-0 ${pending ? "bg-brand-tint/40" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{profile?.full_name}</p>
                      <p className="text-xs text-muted">{profile?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-muted">{entitlement?.burger_campaigns?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted">{location?.name ?? "—"}</td>
                    <td className="px-4 py-3">
                      <RedemptionStatusBadge status={redemption.status} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted">
                      {new Date(redemption.redeemed_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-muted">{confirmedBy?.full_name ?? "—"}</td>
                    <td className="px-4 py-3">
                      <RedemptionActions redemptionId={redemption.id} status={redemption.status} />
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
