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
import { Field, Input, Select } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/page-header";
import { createClient } from "@/lib/supabase/server";

const STATUS_TONES: Record<string, BadgeTone> = {
  pending_staff_confirmation: "yellow",
  confirmed: "green",
  cancelled: "neutral",
  corrected: "blue",
};

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
      "id, status, redeemed_at, locations(name), profiles(full_name, email), monthly_entitlements(burger_campaigns(name))"
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

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Redemptions" subtitle={`${filtered.length} recent results`} />

      <Card>
        <form className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5" method="get">
          <Field label="Customer" htmlFor="customer">
            <Input
              id="customer"
              name="customer"
              defaultValue={params.customer}
              placeholder="Name or email"
            />
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
          <div className="sm:col-span-2 xl:col-span-5">
            <button type="submit" className={buttonClassName({ className: "w-full sm:w-auto" })}>
              Filter
            </button>
          </div>
        </form>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState>No redemptions match these filters.</EmptyState>
      ) : (
        <MobileDataList>
          {filtered.map((redemption) => {
            const profile = redemption.profiles as unknown as {
              full_name: string;
              email: string;
            } | null;
            const location = redemption.locations as unknown as { name: string } | null;
            const entitlement = redemption.monthly_entitlements as unknown as {
              burger_campaigns: { name: string } | null;
            } | null;
            return (
              <MobileDataCard key={redemption.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold text-neutral-950">
                      {profile?.full_name ?? "Unknown customer"}
                    </h2>
                    <p className="mt-1 break-words text-xs text-neutral-500">
                      {profile?.email ?? "No email"}
                    </p>
                  </div>
                  <Badge tone={STATUS_TONES[redemption.status] ?? "neutral"}>
                    {redemption.status.replace(/_/g, " ")}
                  </Badge>
                </div>
                <dl className="mt-4 grid gap-3">
                  <DataPair label="Campaign">
                    {entitlement?.burger_campaigns?.name ?? "No campaign"}
                  </DataPair>
                  <DataPair label="Location">{location?.name ?? "No location"}</DataPair>
                  <DataPair label="Date">
                    {new Date(redemption.redeemed_at).toLocaleString()}
                  </DataPair>
                </dl>
              </MobileDataCard>
            );
          })}
        </MobileDataList>
      )}

      {filtered.length > 0 ? (
        <Card padding="none" className="hidden overflow-hidden md:block">
          <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-600">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Campaign</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((redemption) => {
              const profile = redemption.profiles as unknown as {
                full_name: string;
                email: string;
              } | null;
              const location = redemption.locations as unknown as { name: string } | null;
              const entitlement = redemption.monthly_entitlements as unknown as {
                burger_campaigns: { name: string } | null;
              } | null;
              return (
                <tr key={redemption.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium">{profile?.full_name}</p>
                    <p className="text-xs text-neutral-500">{profile?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {entitlement?.burger_campaigns?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{location?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONES[redemption.status] ?? "neutral"}>
                      {redemption.status.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {new Date(redemption.redeemed_at).toLocaleString()}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-neutral-500">
                  No redemptions match these filters.
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
