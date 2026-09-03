import { notFound } from "next/navigation";

import { setEntitlementStatus } from "@/app/dashboard/customers/actions";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeTone, DataPair, EmptyState } from "@/components/ui/data-list";
import { PageHeader } from "@/components/ui/page-header";
import { SubmitButton } from "@/components/ui/submit-button";
import { createClient } from "@/lib/supabase/server";

const ENTITLEMENT_TONES: Record<string, BadgeTone> = {
  eligible: "green",
  ineligible: "red",
  redeemed: "blue",
};

const REDEMPTION_TONES: Record<string, BadgeTone> = {
  pending_staff_confirmation: "yellow",
  confirmed: "green",
  cancelled: "neutral",
  corrected: "blue",
};

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
      .select("id, status, redeemed_at, locations(name)")
      .eq("profile_id", id)
      .order("redeemed_at", { ascending: false }),
  ]);

  if (!customer) notFound();
  const entitlementItems = entitlements ?? [];
  const redemptionItems = redemptions ?? [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={customer.full_name}
        subtitle={`${customer.email} · Joined ${new Date(customer.created_at).toLocaleDateString()}`}
      />

      <Card>
        <h2 className="mb-3 text-base font-semibold text-neutral-950">Monthly entitlements</h2>
        {entitlementItems.length === 0 ? (
          <EmptyState>No entitlements yet.</EmptyState>
        ) : (
          <div className="divide-y divide-neutral-100 md:hidden">
            {entitlementItems.map((entitlement) => {
              const campaign = entitlement.burger_campaigns as unknown as { name: string } | null;
              return (
                <section key={entitlement.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-semibold text-neutral-950">
                      {entitlement.period_month}
                    </h3>
                    <Badge tone={ENTITLEMENT_TONES[entitlement.status] ?? "neutral"}>
                      {entitlement.status}
                    </Badge>
                  </div>
                  <dl className="mt-3 grid gap-3">
                    <DataPair label="Campaign">{campaign?.name ?? "No campaign"}</DataPair>
                  </dl>
                  {entitlement.status === "ineligible" ? (
                    <form
                      action={setEntitlementStatus.bind(null, entitlement.id, id, "eligible")}
                      className="mt-4"
                    >
                      <SubmitButton
                        variant="outline"
                        pendingLabel="Marking eligible..."
                        className="w-full"
                      >
                        Mark eligible
                      </SubmitButton>
                    </form>
                  ) : entitlement.status === "eligible" ? (
                    <form
                      action={setEntitlementStatus.bind(null, entitlement.id, id, "ineligible")}
                      className="mt-4"
                    >
                      <SubmitButton
                        variant="outline"
                        pendingLabel="Marking ineligible..."
                        className="w-full"
                      >
                        Mark ineligible
                      </SubmitButton>
                    </form>
                  ) : null}
                </section>
              );
            })}
          </div>
        )}
        {entitlementItems.length > 0 ? (
          <table className="hidden w-full text-left text-sm md:table">
          <thead className="border-b border-neutral-200 text-neutral-600">
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
                <tr key={entitlement.id} className="border-b border-neutral-100 last:border-0">
                  <td className="py-2">{entitlement.period_month}</td>
                  <td className="py-2 text-neutral-600">{campaign?.name ?? "—"}</td>
                  <td className="py-2 capitalize">
                    <Badge tone={ENTITLEMENT_TONES[entitlement.status] ?? "neutral"}>
                      {entitlement.status}
                    </Badge>
                  </td>
                  <td className="py-2 text-right">
                    {entitlement.status === "ineligible" ? (
                      <form
                        action={setEntitlementStatus.bind(null, entitlement.id, id, "eligible")}
                      >
                        <SubmitButton
                          variant="outline"
                          size="sm"
                          pendingLabel="Marking eligible..."
                        >
                          Mark eligible
                        </SubmitButton>
                      </form>
                    ) : entitlement.status === "eligible" ? (
                      <form
                        action={setEntitlementStatus.bind(null, entitlement.id, id, "ineligible")}
                      >
                        <SubmitButton
                          variant="outline"
                          size="sm"
                          pendingLabel="Marking ineligible..."
                        >
                          Mark ineligible
                        </SubmitButton>
                      </form>
                    ) : null}
                  </td>
                </tr>
              );
            })}
            {entitlementItems.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-center text-neutral-500">
                  No entitlements yet.
                </td>
              </tr>
            )}
          </tbody>
          </table>
        ) : null}
      </Card>

      <Card>
        <h2 className="mb-3 text-base font-semibold text-neutral-950">Redemption history</h2>
        {redemptionItems.length === 0 ? (
          <EmptyState>No redemptions yet.</EmptyState>
        ) : (
          <div className="divide-y divide-neutral-100 md:hidden">
            {redemptionItems.map((redemption) => {
              const location = redemption.locations as unknown as { name: string } | null;
              return (
                <section key={redemption.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-semibold text-neutral-950">
                      {new Date(redemption.redeemed_at).toLocaleString()}
                    </h3>
                    <Badge tone={REDEMPTION_TONES[redemption.status] ?? "neutral"}>
                      {redemption.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <dl className="mt-3 grid gap-3">
                    <DataPair label="Location">{location?.name ?? "No location"}</DataPair>
                  </dl>
                </section>
              );
            })}
          </div>
        )}
        {redemptionItems.length > 0 ? (
          <table className="hidden w-full text-left text-sm md:table">
          <thead className="border-b border-neutral-200 text-neutral-600">
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
                <tr key={redemption.id} className="border-b border-neutral-100 last:border-0">
                  <td className="py-2">{new Date(redemption.redeemed_at).toLocaleString()}</td>
                  <td className="py-2 text-neutral-600">{location?.name ?? "—"}</td>
                  <td className="py-2 capitalize">
                    <Badge tone={REDEMPTION_TONES[redemption.status] ?? "neutral"}>
                      {redemption.status.replace(/_/g, " ")}
                    </Badge>
                  </td>
                </tr>
              );
            })}
            {redemptionItems.length === 0 && (
              <tr>
                <td colSpan={3} className="py-4 text-center text-neutral-500">
                  No redemptions yet.
                </td>
              </tr>
            )}
          </tbody>
          </table>
        ) : null}
      </Card>
    </div>
  );
}
