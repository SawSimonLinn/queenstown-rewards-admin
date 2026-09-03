import Link from "next/link";

import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Badge,
  DataPair,
  EmptyState,
  MobileDataCard,
  MobileDataList,
} from "@/components/ui/data-list";
import { PageHeader } from "@/components/ui/page-header";
import { createClient } from "@/lib/supabase/server";

export default async function LocationsPage() {
  const supabase = await createClient();
  const { data: locations } = await supabase
    .from("locations")
    .select("id, name, address, suburb, phone, is_participating")
    .order("name");
  const locationItems = locations ?? [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Locations">
        <Link
          href="/dashboard/locations/new"
          className={buttonClassName({ className: "w-full sm:w-auto" })}
        >
          Add location
        </Link>
      </PageHeader>

      {locationItems.length === 0 ? (
        <EmptyState>No locations have been added yet.</EmptyState>
      ) : (
        <MobileDataList>
          {locationItems.map((location) => (
            <MobileDataCard key={location.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="line-clamp-2 text-base font-semibold text-neutral-950">
                    {location.name}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-sm text-neutral-600">
                    {location.address}, {location.suburb}
                  </p>
                </div>
                <Badge tone={location.is_participating ? "green" : "neutral"}>
                  {location.is_participating ? "Participating" : "Inactive"}
                </Badge>
              </div>
              <dl className="mt-4 grid gap-3">
                <DataPair label="Phone">
                  <span className="whitespace-nowrap">{location.phone}</span>
                </DataPair>
              </dl>
              <Link
                href={`/dashboard/locations/${location.id}/edit`}
                className={buttonClassName({ variant: "outline", className: "mt-4 w-full" })}
              >
                Edit location
              </Link>
            </MobileDataCard>
          ))}
        </MobileDataList>
      )}

      {locationItems.length > 0 ? (
        <Card padding="none" className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[960px] table-fixed text-left text-sm">
            <colgroup>
              <col className="w-[21%]" />
              <col className="w-[43%]" />
              <col className="w-[15%]" />
              <col className="w-[13%]" />
              <col className="w-[8%]" />
            </colgroup>
            <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-600">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Address</th>
                <th className="whitespace-nowrap px-4 py-3">Phone</th>
                <th className="whitespace-nowrap px-4 py-3">Participating</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {locationItems.map((location) => (
                <tr key={location.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-4 py-3 align-middle font-medium">
                    <span className="line-clamp-2">{location.name}</span>
                  </td>
                  <td className="px-4 py-3 align-middle text-neutral-600">
                    <span className="line-clamp-2">
                      {location.address}, {location.suburb}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 align-middle text-neutral-600">
                    {location.phone}
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <Badge tone={location.is_participating ? "green" : "neutral"}>
                      {location.is_participating ? "Yes" : "No"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right align-middle">
                    <Link
                      href={`/dashboard/locations/${location.id}/edit`}
                      className="font-medium text-blue-700 hover:text-blue-800 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : null}
    </div>
  );
}
