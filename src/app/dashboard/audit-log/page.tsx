import { Card } from "@/components/ui/card";
import { DataPair, EmptyState, MobileDataCard, MobileDataList } from "@/components/ui/data-list";
import { PageHeader } from "@/components/ui/page-header";
import { getCurrentAdminProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AuditLogPage() {
  const admin = await getCurrentAdminProfile();
  if (!admin) {
    return <p className="text-neutral-600">Only admins can view the audit log.</p>;
  }

  const supabase = await createClient();
  const { data: logs } = await supabase
    .from("audit_logs")
    .select("id, action, actor_profile_id, target_id, metadata, created_at, profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(200);
  const logItems = logs ?? [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Audit Log" subtitle={`${logItems.length} latest entries`} />

      {logItems.length === 0 ? (
        <EmptyState>No audit log entries yet.</EmptyState>
      ) : (
        <MobileDataList>
          {logItems.map((log) => {
            const actor = log.profiles as unknown as { full_name: string } | null;
            return (
              <MobileDataCard key={log.id}>
                <h2 className="text-base font-semibold capitalize text-neutral-950">
                  {log.action.replace(/_/g, " ")}
                </h2>
                <dl className="mt-4 grid gap-3">
                  <DataPair label="Actor">{actor?.full_name ?? "System"}</DataPair>
                  <DataPair label="Target">
                    <span className="break-all font-mono text-xs">{log.target_id ?? "No target"}</span>
                  </DataPair>
                  <DataPair label="Date">{new Date(log.created_at).toLocaleString()}</DataPair>
                  <DataPair label="Metadata">
                    <span className="break-all font-mono text-xs">
                      {JSON.stringify(log.metadata)}
                    </span>
                  </DataPair>
                </dl>
              </MobileDataCard>
            );
          })}
        </MobileDataList>
      )}

      {logItems.length > 0 ? (
        <Card padding="none" className="hidden overflow-x-auto md:block">
          <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-600">
            <tr>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Actor</th>
              <th className="px-4 py-3">Target</th>
              <th className="px-4 py-3">Metadata</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {logItems.map((log) => {
              const actor = log.profiles as unknown as { full_name: string } | null;
              return (
                <tr key={log.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-4 py-3 font-medium capitalize">
                    {log.action.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{actor?.full_name ?? "System"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-neutral-500">{log.target_id}</td>
                  <td className="px-4 py-3 font-mono text-xs text-neutral-500">
                    {JSON.stringify(log.metadata)}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              );
            })}
            {logItems.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-neutral-500">
                  No audit log entries yet.
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
