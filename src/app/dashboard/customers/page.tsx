import Link from "next/link";

import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataPair, EmptyState, MobileDataCard, MobileDataList } from "@/components/ui/data-list";
import { PageHeader } from "@/components/ui/page-header";
import { createClient } from "@/lib/supabase/server";

export default async function CustomersPage() {
  const supabase = await createClient();
  const { data: customers } = await supabase
    .from("profiles")
    .select("id, full_name, email, created_at")
    .eq("role", "customer")
    .order("created_at", { ascending: false });
  const customerItems = customers ?? [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Customers" subtitle={`${customerItems.length} customer accounts`} />

      {customerItems.length === 0 ? (
        <EmptyState>No customer accounts yet.</EmptyState>
      ) : (
        <MobileDataList>
          {customerItems.map((customer) => (
            <MobileDataCard key={customer.id}>
              <h2 className="truncate text-base font-semibold text-neutral-950">
                {customer.full_name}
              </h2>
              <dl className="mt-4 grid gap-3">
                <DataPair label="Email">{customer.email}</DataPair>
                <DataPair label="Joined">
                  {new Date(customer.created_at).toLocaleDateString()}
                </DataPair>
              </dl>
              <Link
                href={`/dashboard/customers/${customer.id}`}
                className={buttonClassName({ variant: "outline", className: "mt-4 w-full" })}
              >
                View customer
              </Link>
            </MobileDataCard>
          ))}
        </MobileDataList>
      )}

      {customerItems.length > 0 ? (
        <Card padding="none" className="hidden overflow-hidden md:block">
          <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {customerItems.map((customer) => (
              <tr key={customer.id} className="border-b border-neutral-100 last:border-0">
                <td className="px-4 py-3 font-medium">{customer.full_name}</td>
                <td className="px-4 py-3 text-neutral-600">{customer.email}</td>
                <td className="px-4 py-3 text-neutral-600">
                  {new Date(customer.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/dashboard/customers/${customer.id}`}
                    className="font-medium text-blue-700 hover:text-blue-800 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {customerItems.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-neutral-500">
                  No customer accounts yet.
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
