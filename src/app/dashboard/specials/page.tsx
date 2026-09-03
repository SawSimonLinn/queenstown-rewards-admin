import Link from "next/link";

import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataPair, EmptyState, MobileDataCard, MobileDataList } from "@/components/ui/data-list";
import { PageHeader } from "@/components/ui/page-header";
import { createClient } from "@/lib/supabase/server";

export default async function SpecialsPage() {
  const supabase = await createClient();
  const { data: specials } = await supabase
    .from("specials")
    .select("id, title, start_date, end_date")
    .order("start_date", { ascending: false });
  const specialItems = specials ?? [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Specials">
        <Link
          href="/dashboard/specials/new"
          className={buttonClassName({ className: "w-full sm:w-auto" })}
        >
          New special
        </Link>
      </PageHeader>

      {specialItems.length === 0 ? (
        <EmptyState>No specials have been created yet.</EmptyState>
      ) : (
        <MobileDataList>
          {specialItems.map((special) => (
            <MobileDataCard key={special.id}>
              <h2 className="text-base font-semibold text-neutral-950">{special.title}</h2>
              <dl className="mt-4 grid gap-3">
                <DataPair label="Dates">
                  {new Date(special.start_date).toLocaleDateString()} -{" "}
                  {new Date(special.end_date).toLocaleDateString()}
                </DataPair>
              </dl>
              <Link
                href={`/dashboard/specials/${special.id}/edit`}
                className={buttonClassName({ variant: "outline", className: "mt-4 w-full" })}
              >
                Edit special
              </Link>
            </MobileDataCard>
          ))}
        </MobileDataList>
      )}

      {specialItems.length > 0 ? (
        <Card padding="none" className="hidden overflow-hidden md:block">
          <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-600">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Dates</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {specialItems.map((special) => (
              <tr key={special.id} className="border-b border-neutral-100 last:border-0">
                <td className="px-4 py-3 font-medium">{special.title}</td>
                <td className="px-4 py-3 text-neutral-600">
                  {new Date(special.start_date).toLocaleDateString()} –{" "}
                  {new Date(special.end_date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/dashboard/specials/${special.id}/edit`}
                    className="font-medium text-blue-700 hover:text-blue-800 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {specialItems.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-neutral-500">
                  No specials have been created yet.
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
