import Link from "next/link";

import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge, DataPair, EmptyState, MobileDataCard, MobileDataList } from "@/components/ui/data-list";
import { PageHeader } from "@/components/ui/page-header";
import { createClient } from "@/lib/supabase/server";

function currentPeriodMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default async function CustomersPage() {
  const supabase = await createClient();
  const periodMonth = currentPeriodMonth();

  const [{ data: customers }, { data: entitlements }, { data: redemptions }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, email, created_at").eq("role", "customer").order("created_at", { ascending: false }),
    supabase.from("monthly_entitlements").select("profile_id, period_month, status"),
    supabase
      .from("redemptions")
      .select("profile_id, redeemed_at, locations(name)")
      .order("redeemed_at", { ascending: false }),
  ]);
  const customerItems = customers ?? [];

  const isMember = new Set((entitlements ?? []).map((e) => e.profile_id));
  const currentEligibility = new Map<string, string>();
  for (const e of entitlements ?? []) {
    if (e.period_month === periodMonth) currentEligibility.set(e.profile_id, e.status);
  }
  const latestRedemption = new Map<string, { date: string; location: string }>();
  for (const r of redemptions ?? []) {
    if (!latestRedemption.has(r.profile_id)) {
      const location = r.locations as unknown as { name: string } | null;
      latestRedemption.set(r.profile_id, { date: r.redeemed_at, location: location?.name ?? "—" });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Customers" subtitle={`${customerItems.length} customer accounts`} />

      {customerItems.length === 0 ? (
        <EmptyState>No customer accounts yet.</EmptyState>
      ) : (
        <MobileDataList>
          {customerItems.map((customer) => {
            const recent = latestRedemption.get(customer.id);
            const eligibility = currentEligibility.get(customer.id);
            return (
              <MobileDataCard key={customer.id}>
                <h2 className="truncate text-base font-semibold text-ink">{customer.full_name}</h2>
                <dl className="mt-4 grid grid-cols-2 gap-3">
                  <DataPair label="Email">{customer.email}</DataPair>
                  <DataPair label="Preferred location">{recent?.location ?? "—"}</DataPair>
                  <DataPair label="Burger Club">
                    <Badge tone={isMember.has(customer.id) ? "brand" : "neutral"}>
                      {isMember.has(customer.id) ? "Member" : "Not a member"}
                    </Badge>
                  </DataPair>
                  <DataPair label="This month">
                    {eligibility ? (
                      <Badge tone={eligibility === "eligible" ? "green" : eligibility === "redeemed" ? "blue" : "red"}>{eligibility}</Badge>
                    ) : (
                      "—"
                    )}
                  </DataPair>
                </dl>
                <Link href={`/dashboard/customers/${customer.id}`} className={buttonClassName({ variant: "outline", className: "mt-4 w-full" })}>
                  View customer
                </Link>
              </MobileDataCard>
            );
          })}
        </MobileDataList>
      )}

      {customerItems.length > 0 ? (
        <Card padding="none" className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-max text-left text-sm">
            <thead className="border-b border-border bg-cream text-muted">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Preferred location</th>
                <th className="px-4 py-3">Burger Club</th>
                <th className="px-4 py-3">This month</th>
                <th className="px-4 py-3">Last redemption</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {customerItems.map((customer) => {
                const recent = latestRedemption.get(customer.id);
                const eligibility = currentEligibility.get(customer.id);
                return (
                  <tr key={customer.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-ink">{customer.full_name}</td>
                    <td className="px-4 py-3 text-muted">{customer.email}</td>
                    <td className="px-4 py-3 text-muted">{recent?.location ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Badge tone={isMember.has(customer.id) ? "brand" : "neutral"}>
                        {isMember.has(customer.id) ? "Member" : "Not a member"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {eligibility ? (
                        <Badge tone={eligibility === "eligible" ? "green" : eligibility === "redeemed" ? "blue" : "red"}>{eligibility}</Badge>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted">{recent ? new Date(recent.date).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3 text-muted">{new Date(customer.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/dashboard/customers/${customer.id}`} className="font-medium text-brand hover:text-brand-hover hover:underline">
                        View
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
