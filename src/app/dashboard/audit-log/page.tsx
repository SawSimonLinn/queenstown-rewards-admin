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
import { Pagination } from "@/components/ui/pagination";
import { getCurrentAdminProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PAGE_SIZE = 25;
const SYSTEM_ACTOR_VALUE = "system";

function actionTone(action: string): BadgeTone {
  if (action.endsWith("_confirmed")) return "green";
  if (action.endsWith("_created") || action.endsWith("_joined")) return "blue";
  if (action.endsWith("_deleted") || action.endsWith("_deactivated") || action.endsWith("_removed")) {
    return "red";
  }
  return "neutral";
}

function humanizeKey(key: string) {
  return key
    .replace(/_/g, " ")
    .replace(/\bid\b/gi, "ID")
    .replace(/^\w/, (char) => char.toUpperCase());
}

function formatValue(value: unknown) {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return UUID_PATTERN.test(text) ? `${text.slice(0, 8)}…` : text;
}

function TruncatedId({ value }: { value: string | null }) {
  if (!value) return <span className="text-neutral-400">No target</span>;
  return (
    <span className="font-mono text-xs text-neutral-500" title={value}>
      {UUID_PATTERN.test(value) ? `${value.slice(0, 8)}…` : value}
    </span>
  );
}

function MetadataList({ metadata }: { metadata: Record<string, unknown> | null }) {
  const entries = metadata ? Object.entries(metadata) : [];
  if (entries.length === 0) return <span className="text-neutral-400">—</span>;
  return (
    <dl className="grid gap-1">
      {entries.map(([key, value]) => (
        <div key={key} className="flex flex-wrap gap-x-1.5 text-xs">
          <dt className="font-medium text-neutral-500">{humanizeKey(key)}:</dt>
          <dd
            className="break-all font-mono text-neutral-700"
            title={typeof value === "string" ? value : undefined}
          >
            {formatValue(value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const admin = await getCurrentAdminProfile();
  if (!admin) {
    return <p className="text-neutral-600">Only admins can view the audit log.</p>;
  }

  const params = await searchParams;
  const supabase = await createClient();

  const q = params.q?.trim();
  const page = Math.max(1, Number(params.page) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const [{ data: actionRows }, { data: actorRows }] = await Promise.all([
    supabase.from("audit_logs").select("action").order("action").limit(1000),
    supabase
      .from("profiles")
      .select("id, full_name")
      .in("role", ["admin", "staff"])
      .order("full_name"),
  ]);
  const actionOptions = Array.from(new Set((actionRows ?? []).map((row) => row.action))).sort();
  const actorOptions = actorRows ?? [];

  let query = supabase
    .from("audit_logs")
    .select(
      "id, action, actor_profile_id, target_id, metadata, created_at, profiles(full_name)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (params.action) query = query.eq("action", params.action);
  if (params.actor === SYSTEM_ACTOR_VALUE) query = query.is("actor_profile_id", null);
  else if (params.actor) query = query.eq("actor_profile_id", params.actor);
  if (params.from) query = query.gte("created_at", params.from);
  if (params.to) query = query.lte("created_at", params.to);
  if (q) {
    const escaped = q.replace(/[,()%]/g, "");
    query = query.or(`action.ilike.%${escaped}%,target_id.ilike.%${escaped}%`);
  }

  const { data: logs, count } = await query.range(from, to);
  const logItems = logs ?? [];
  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const buildHref = (targetPage: number) => {
    const sp = new URLSearchParams();
    if (params.q) sp.set("q", params.q);
    if (params.action) sp.set("action", params.action);
    if (params.actor) sp.set("actor", params.actor);
    if (params.from) sp.set("from", params.from);
    if (params.to) sp.set("to", params.to);
    sp.set("page", String(targetPage));
    return `?${sp.toString()}`;
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Audit Log"
        subtitle={`${totalCount} matching ${totalCount === 1 ? "entry" : "entries"} · page ${page} of ${totalPages}`}
      />

      <Card>
        <form className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5" method="get">
          <Field label="Search" htmlFor="q">
            <Input id="q" name="q" defaultValue={params.q} placeholder="Action or target ID" />
          </Field>
          <Field label="Action" htmlFor="action">
            <Select id="action" name="action" defaultValue={params.action ?? ""}>
              <option value="">All actions</option>
              {actionOptions.map((action) => (
                <option key={action} value={action}>
                  {action.replace(/_/g, " ")}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Actor" htmlFor="actor">
            <Select id="actor" name="actor" defaultValue={params.actor ?? ""}>
              <option value="">All actors</option>
              <option value={SYSTEM_ACTOR_VALUE}>System</option>
              {actorOptions.map((actor) => (
                <option key={actor.id} value={actor.id}>
                  {actor.full_name}
                </option>
              ))}
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

      {logItems.length === 0 ? (
        <EmptyState>No audit log entries match these filters.</EmptyState>
      ) : (
        <MobileDataList>
          {logItems.map((log) => {
            const actor = log.profiles as unknown as { full_name: string } | null;
            return (
              <MobileDataCard key={log.id}>
                <div className="flex items-start justify-between gap-3">
                  <Badge tone={actionTone(log.action)} className="capitalize">
                    {log.action.replace(/_/g, " ")}
                  </Badge>
                  <span className="shrink-0 text-xs text-neutral-500">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
                <dl className="mt-4 grid gap-3">
                  <DataPair label="Actor">{actor?.full_name ?? "System"}</DataPair>
                  <DataPair label="Target">
                    <TruncatedId value={log.target_id} />
                  </DataPair>
                  <DataPair label="Metadata">
                    <MetadataList metadata={log.metadata as Record<string, unknown> | null} />
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
                <tr key={log.id} className="border-b border-neutral-100 align-top last:border-0">
                  <td className="px-4 py-3">
                    <Badge tone={actionTone(log.action)} className="capitalize">
                      {log.action.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{actor?.full_name ?? "System"}</td>
                  <td className="px-4 py-3">
                    <TruncatedId value={log.target_id} />
                  </td>
                  <td className="px-4 py-3">
                    <MetadataList metadata={log.metadata as Record<string, unknown> | null} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-neutral-600">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
          </table>
        </Card>
      ) : null}

      <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
    </div>
  );
}
