import { notFound } from "next/navigation";

import { Card } from "@/components/ui/card";
import { Badge, DataPair, EmptyState } from "@/components/ui/data-list";
import { PageHeader } from "@/components/ui/page-header";
import { RedemptionStatusBadge } from "@/components/ui/status-badge";
import { createClient } from "@/lib/supabase/server";

import { EntitlementAction } from "./entitlement-action";

const ENTITLEMENT_TONE = { eligible: "green", ineligible: "red", redeemed: "blue" } as const;

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: customer }, { data: entitlements }, { data: redemptions }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, email, created_at").eq("id", id).maybeSingle(),
    supabase
      .from("monthly_entitlements")
      .select("id, period_month, status, redeemed_at, burger_campaigns(name)")
      .eq("profile_id", id)
      .order("period_month", { ascending: false }),
    supabase
      .from("redemptions")
      .select("id, status, redeemed_at, correction_note, locations(name), confirmed_by:profiles!redemptions_confirmed_by_staff_id_fkey(full_name)")
      .eq("profile_id", id)
      .order("redeemed_at", { ascending: false }),
  ]);

  if (!customer) notFound();
  const entitlementItems = entitlements ?? [];
  const redemptionItems = redemptions ?? [];
  const isMember = entitlementItems.length > 0;
  const preferredLocation = (redemptionItems[0]?.locations as unknown as { name: string } | null)?.name ?? null;
  const corrections = redemptionItems.filter((r) => r.status === "corrected" || r.correction_note);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={customer.full_name}
        subtitle={`${customer.email} · Account created ${new Date(customer.created_at).toLocaleDateString()}`}
        breadcrumbs={[{ label: "Customers", href: "/dashboard/customers" }, { label: customer.full_name }]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm font-medium text-muted">Preferred location</p>
          <p className="mt-2 text-lg font-semibold text-ink">{preferredLocation ?? "No redemptions yet"}</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-muted">Burger Club</p>
          <p className="mt-2">
            <Badge tone={isMember ? "brand" : "neutral"}>{isMember ? "Member" : "Not a member"}</Badge>
          </p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-muted">Account created</p>
          <p className="mt-2 text-lg font-semibold text-ink">{new Date(customer.created_at).toLocaleDateString()}</p>
          <p className="text-xs text-muted">Separate from Burger of the Month enrolment.</p>
        </Card>
      </div>

      <Card>
        <h2 className="mb-3 font-display text-lg font-semibold text-ink">Monthly entitlement</h2>
        {entitlementItems.length === 0 ? (
          <EmptyState>No entitlements yet.</EmptyState>
        ) : (
          <>
            <div className="divide-y divide-border md:hidden">
              {entitlementItems.map((entitlement) => {
                const campaign = entitlement.burger_campaigns as unknown as { name: string } | null;
                return (
                  <section key={entitlement.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-sm font-semibold text-ink">{entitlement.period_month}</h3>
                      <Badge tone={ENTITLEMENT_TONE[entitlement.status as keyof typeof ENTITLEMENT_TONE] ?? "neutral"}>
                        {entitlement.status}
                      </Badge>
                    </div>
                    <dl className="mt-3 grid gap-3">
                      <DataPair label="Campaign">{campaign?.name ?? "No campaign"}</DataPair>
                    </dl>
                    <div className="mt-4">
                      <EntitlementAction
                        entitlementId={entitlement.id}
                        customerId={id}
                        status={entitlement.status as "eligible" | "ineligible" | "redeemed"}
                      />
                    </div>
                  </section>
                );
              })}
            </div>
            <table className="hidden w-full text-left text-sm md:table">
              <thead className="border-b border-border text-muted">
                <tr>
                  <th className="py-2">Period</th>
                  <th className="py-2">Campaign</th>
                  <th className="py-2">Status</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {entitlementItems.map((entitlement) => {
                  const campaign = entitlement.burger_campaigns as unknown as { name: string } | null;
                  return (
                    <tr key={entitlement.id} className="border-b border-border last:border-0">
                      <td className="py-2">{entitlement.period_month}</td>
                      <td className="py-2 text-muted">{campaign?.name ?? "—"}</td>
                      <td className="py-2">
                        <Badge tone={ENTITLEMENT_TONE[entitlement.status as keyof typeof ENTITLEMENT_TONE] ?? "neutral"}>
                          {entitlement.status}
                        </Badge>
                      </td>
                      <td className="py-2 text-right">
                        <EntitlementAction
                          entitlementId={entitlement.id}
                          customerId={id}
                          status={entitlement.status as "eligible" | "ineligible" | "redeemed"}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}
      </Card>

      <Card>
        <h2 className="mb-3 font-display text-lg font-semibold text-ink">Redemption history</h2>
        {redemptionItems.length === 0 ? (
          <EmptyState>No redemptions yet.</EmptyState>
        ) : (
          <>
            <div className="divide-y divide-border md:hidden">
              {redemptionItems.map((redemption) => {
                const location = redemption.locations as unknown as { name: string } | null;
                return (
                  <section key={redemption.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-sm font-semibold text-ink">{new Date(redemption.redeemed_at).toLocaleString()}</h3>
                      <RedemptionStatusBadge status={redemption.status} />
                    </div>
                    <dl className="mt-3 grid gap-3">
                      <DataPair label="Location">{location?.name ?? "No location"}</DataPair>
                    </dl>
                  </section>
                );
              })}
            </div>
            <table className="hidden w-full text-left text-sm md:table">
              <thead className="border-b border-border text-muted">
                <tr>
                  <th className="py-2">Date</th>
                  <th className="py-2">Location</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {redemptionItems.map((redemption) => {
                  const location = redemption.locations as unknown as { name: string } | null;
                  return (
                    <tr key={redemption.id} className="border-b border-border last:border-0">
                      <td className="py-2">{new Date(redemption.redeemed_at).toLocaleString()}</td>
                      <td className="py-2 text-muted">{location?.name ?? "—"}</td>
                      <td className="py-2">
                        <RedemptionStatusBadge status={redemption.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}
      </Card>

      <Card>
        <h2 className="mb-3 font-display text-lg font-semibold text-ink">Staff corrections</h2>
        {corrections.length === 0 ? (
          <EmptyState>No staff corrections on record for this customer.</EmptyState>
        ) : (
          <ul className="divide-y divide-border">
            {corrections.map((c) => {
              const confirmedBy = c.confirmed_by as unknown as { full_name: string } | null;
              return (
                <li key={c.id} className="py-3 text-sm">
                  <p className="text-ink">{c.correction_note ?? "Corrected"}</p>
                  <p className="mt-1 text-xs text-muted">
                    {confirmedBy?.full_name ?? "Unknown staff"} · {new Date(c.redeemed_at).toLocaleString()}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
