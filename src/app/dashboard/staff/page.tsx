import Link from "next/link";

import { StaffNameCell } from "@/app/dashboard/staff/staff-name-cell";
import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge, DataPair, EmptyState, MobileDataCard, MobileDataList } from "@/components/ui/data-list";
import { PageHeader } from "@/components/ui/page-header";
import { getCurrentAdminProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import { StaffActiveToggle } from "./staff-active-toggle";

export default async function StaffPage() {
  const admin = await getCurrentAdminProfile();
  if (!admin) {
    return <p className="text-muted">Only admins can manage staff accounts.</p>;
  }

  const supabase = await createClient();
  const [{ data: staffMembers }, { data: recentActivity }] = await Promise.all([
    supabase.from("staff_members").select("id, is_active, profiles(id, full_name, email, role), locations(name)").order("id"),
    supabase.from("audit_logs").select("actor_profile_id, created_at").order("created_at", { ascending: false }).limit(500),
  ]);
  const staffItems = [...(staffMembers ?? [])].sort((a, b) => Number(b.is_active) - Number(a.is_active));

  const lastActivity = new Map<string, string>();
  for (const log of recentActivity ?? []) {
    if (log.actor_profile_id && !lastActivity.has(log.actor_profile_id)) {
      lastActivity.set(log.actor_profile_id, log.created_at);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Staff" subtitle="Manage staff and admin access to this dashboard.">
        <Link href="/dashboard/staff/new" className={buttonClassName({ className: "w-full sm:w-auto" })}>
          Add staff account
        </Link>
      </PageHeader>

      {staffItems.length === 0 ? (
        <EmptyState>No staff accounts have been added yet.</EmptyState>
      ) : (
        <MobileDataList>
          {staffItems.map((member) => {
            const profile = member.profiles as unknown as { id: string; full_name: string; email: string; role: string } | null;
            const location = member.locations as unknown as { name: string } | null;
            const activity = profile ? lastActivity.get(profile.id) : undefined;
            return (
              <MobileDataCard key={member.id} className={member.is_active ? undefined : "opacity-60"}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {profile ? (
                      <StaffNameCell profileId={profile.id} fullName={profile.full_name} />
                    ) : (
                      <h2 className="truncate text-base font-semibold text-ink">Unknown staff member</h2>
                    )}
                    <p className="mt-1 break-words text-xs text-muted">{profile?.email ?? "No email"}</p>
                  </div>
                  <Badge tone={profile?.role === "admin" ? "brand" : "neutral"} className="capitalize">
                    {profile?.role ?? "staff"}
                  </Badge>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3">
                  <DataPair label="Location">{location?.name ?? "No location"}</DataPair>
                  <DataPair label="Status">
                    <Badge tone={member.is_active ? "green" : "neutral"}>{member.is_active ? "Active" : "Inactive"}</Badge>
                  </DataPair>
                  <DataPair label="Last activity">{activity ? new Date(activity).toLocaleDateString() : "—"}</DataPair>
                </dl>
                <div className="mt-4">
                  <StaffActiveToggle staffMemberId={member.id} isActive={member.is_active} />
                </div>
              </MobileDataCard>
            );
          })}
        </MobileDataList>
      )}

      {staffItems.length > 0 ? (
        <Card padding="none" className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-max text-left text-sm">
            <thead className="border-b border-border bg-cream text-muted">
              <tr>
                <th className="px-4 py-3">Nickname</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last activity</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {staffItems.map((member) => {
                const profile = member.profiles as unknown as { id: string; full_name: string; email: string; role: string } | null;
                const location = member.locations as unknown as { name: string } | null;
                const activity = profile ? lastActivity.get(profile.id) : undefined;
                return (
                  <tr key={member.id} className={`border-b border-border last:border-0 ${member.is_active ? "" : "opacity-60"}`}>
                    <td className="px-4 py-3 font-medium text-ink">
                      {profile ? <StaffNameCell profileId={profile.id} fullName={profile.full_name} /> : null}
                    </td>
                    <td className="px-4 py-3 text-muted">{profile?.email}</td>
                    <td className="px-4 py-3">
                      <Badge tone={profile?.role === "admin" ? "brand" : "neutral"} className="capitalize">
                        {profile?.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted">{location?.name}</td>
                    <td className="px-4 py-3">
                      <Badge tone={member.is_active ? "green" : "neutral"}>{member.is_active ? "Active" : "Inactive"}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted">{activity ? new Date(activity).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <StaffActiveToggle staffMemberId={member.id} isActive={member.is_active} />
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
