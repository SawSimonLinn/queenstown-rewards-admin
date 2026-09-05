// Supabase Edge Function — polls notification_campaigns for scheduled rows
// whose send time has passed and dispatches them via Expo's push API.
// Triggered every minute by the pg_cron job added in
// supabase/migrations/20260904170200_notification_dispatch.sql.
//
// Deploy with: supabase functions deploy dispatch-notifications
// Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY as function secrets
// (Supabase sets SUPABASE_URL automatically; add the service role key with
// `supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...`).

import { createClient } from "jsr:@supabase/supabase-js@2";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const PUSH_BATCH_SIZE = 100;

type PushMessage = {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
};

async function sendExpoPushNotifications(messages: PushMessage[]): Promise<void> {
  for (let i = 0; i < messages.length; i += PUSH_BATCH_SIZE) {
    const batch = messages.slice(i, i + PUSH_BATCH_SIZE);
    const response = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(batch),
    });
    if (!response.ok) {
      throw new Error(`Expo push API responded ${response.status}`);
    }
  }
}

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: dueCampaigns, error: fetchError } = await supabase
    .from("notification_campaigns")
    .select("id, title, body, deep_link")
    .eq("status", "scheduled")
    .lte("scheduled_for", new Date().toISOString());

  if (fetchError) {
    return new Response(JSON.stringify({ error: fetchError.message }), { status: 500 });
  }
  if (!dueCampaigns || dueCampaigns.length === 0) {
    return new Response(JSON.stringify({ dispatched: 0 }), { status: 200 });
  }

  const results: { id: string; status: "sent" | "failed"; error?: string }[] = [];

  for (const campaign of dueCampaigns) {
    await supabase.from("notification_campaigns").update({ status: "sending" }).eq("id", campaign.id);

    try {
      const { data: tokens, error: tokensError } = await supabase.from("push_tokens").select("token");
      if (tokensError) throw new Error(tokensError.message);

      if (tokens && tokens.length > 0) {
        await sendExpoPushNotifications(
          tokens.map((row: { token: string }) => ({
            to: row.token,
            title: campaign.title,
            body: campaign.body,
            data: campaign.deep_link ? { deepLink: campaign.deep_link } : undefined,
          })),
        );
      }

      await supabase.from("notification_campaigns").update({ status: "sent" }).eq("id", campaign.id);
      try {
        await supabase.from("audit_logs").insert({
          action: "notification_dispatched",
          actor_profile_id: null,
          target_id: campaign.id,
          metadata: { title: campaign.title, recipient_count: tokens?.length ?? 0 },
        });
      } catch {
        // Audit logging is best-effort here; a failure shouldn't mark an
        // otherwise-successful send as failed. actor_profile_id is null
        // since this runs unattended — if that column is NOT NULL in your
        // schema, this insert will silently no-op and should be revisited.
      }
      results.push({ id: campaign.id, status: "sent" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      await supabase.from("notification_campaigns").update({ status: "failed" }).eq("id", campaign.id);
      try {
        await supabase.from("audit_logs").insert({
          action: "notification_dispatch_failed",
          actor_profile_id: null,
          target_id: campaign.id,
          metadata: { title: campaign.title, error: message },
        });
      } catch {
        // Best-effort, see note above.
      }
      results.push({ id: campaign.id, status: "failed", error: message });
    }
  }

  return new Response(JSON.stringify({ dispatched: results.length, results }), { status: 200 });
});
