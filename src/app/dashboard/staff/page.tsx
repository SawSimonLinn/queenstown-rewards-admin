import Link from "next/link";

import { setStaffActive } from "@/app/dashboard/staff/actions";
import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge, DataPair, EmptyState, MobileDataCard, MobileDataList } from "@/components/ui/data-list";
import { PageHeader } from "@/components/ui/page-header";
import { SubmitButton } from "@/components/ui/submit-button";
import { getCurrentAdminProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function StaffPage() {
  const admin = await getCurrentAdminProfile();
  if (!admin) {
    return <p className="text-neutral-600">Only admins can manage staff accounts.</p>;
  }

  const supabase = await createClient();
  const { data: staffMembers } = await supabase
    .from("staff_members")
    .select("id, is_active, profiles(full_name, email, role), locations(name)")
    .order("id");
  const staffItems = staffMembers ?? [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Staff">
        <Link
          href="/dashboard/staff/new"
          className={buttonClassName({ className: "w-full sm:w-auto" })}
        >
          Add staff account
        </Link>
      </PageHeader>

      {staffItems.length === 0 ? (
        <EmptyState>No staff accounts have been added yet.</EmptyState>
      ) : (
        <MobileDataList>
          {staffItems.map((member) => {
            const profile = member.profiles as unknown as {
              full_name: string;
              email: string;
              role: string;
            } | null;
            const location = member.locations as unknown as { name: string } | null;
            return (
              <MobileDataCard key={member.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold text-neutral-950">
                      {profile?.full_name ?? "Unknown staff member"}
                    </h2>
                    <p className="mt-1 break-words text-xs text-neutral-500">
                      {profile?.email ?? "No email"}
                    </p>
                  </div>
                  <Badge tone={member.is_active ? "green" : "neutral"}>
                    {member.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <dl className="mt-4 grid gap-3">
                  <DataPair label="Role">
                    <span className="capitalize">{profile?.role ?? "staff"}</span>
                  </DataPair>
                  <DataPair label="Location">{location?.name ?? "No location"}</DataPair>
                </dl>
                <form action={setStaffActive.bind(null, member.id, !member.is_active)} className="mt-4">
                  <SubmitButton
                    variant="outline"
                    pendingLabel={member.is_active ? "Deactivating..." : "Reactivating..."}
                    className="w-full"
                  >
                    {member.is_active ? "Deactivate" : "Reactivate"}
                  </SubmitButton>
                </form>
              </MobileDataCard>
            );
          })}
        </MobileDataList>
      )}

      {staffItems.length > 0 ? (
        <Card padding="none" className="hidden overflow-hidden md:block">
          <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {staffItems.map((member) => {
              const profile = member.profiles as unknown as {
                full_name: string;
                email: string;
                role: string;
              } | null;
              const location = member.locations as unknown as { name: string } | null;
              return (
                <tr key={member.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-4 py-3 font-medium">{profile?.full_name}</td>
                  <td className="px-4 py-3 text-neutral-600">{profile?.email}</td>
                  <td className="px-4 py-3 capitalize">{profile?.role}</td>
                  <td className="px-4 py-3 text-neutral-600">{location?.name}</td>
                  <td className="px-4 py-3">
                    <Badge tone={member.is_active ? "green" : "neutral"}>
                      {member.is_active ? "Yes" : "No"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form action={setStaffActive.bind(null, member.id, !member.is_active)}>
                      <SubmitButton
                        variant="outline"
                        size="sm"
                        pendingLabel={member.is_active ? "Deactivating..." : "Reactivating..."}
                      >
                        {member.is_active ? "Deactivate" : "Reactivate"}
                      </SubmitButton>
                    </form>
                  </td>
                </tr>
              );
            })}
            {staffItems.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-neutral-500">
                  No staff accounts have been added yet.
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
