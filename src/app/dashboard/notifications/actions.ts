"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentStaffProfile } from "@/lib/auth";
import { sendExpoPushNotifications } from "@/lib/expo-push";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const notificationSchema = z.object({
  title: z.string().trim().min(1),
  body: z.string().trim().min(1),
  deep_link: z.string().trim().optional(),
  scheduled_for: z.string().optional(),
  send_now: z.boolean(),
});

export type NotificationFormState = { error: string } | null;

export async function createNotificationCampaign(
  _prevState: NotificationFormState,
  formData: FormData
): Promise<NotificationFormState> {
  const profile = await getCurrentStaffProfile();
  if (!profile) throw new Error("Not authorized.");

  const parsed = notificationSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    deep_link: formData.get("deep_link") || undefined,
    scheduled_for: formData.get("scheduled_for") || undefined,
    send_now: formData.get("send_now") === "on",
  });
  if (!parsed.success) {
    return { error: "Title and body are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("notification_campaigns").insert({
    title: parsed.data.title,
    body: parsed.data.body,
    deep_link: parsed.data.deep_link ?? null,
    scheduled_for: parsed.data.scheduled_for ?? null,
    status: parsed.data.send_now ? "sent" : parsed.data.scheduled_for ? "scheduled" : "draft",
  });
  if (error) return { error: error.message };

  if (parsed.data.send_now) {
    // Reading every device's push token is a privileged, system-level
    // operation — deliberately done with the service-role key here rather
    // than widening push_tokens' RLS for staff/admin reads.
    const adminClient = createAdminClient();
    const { data: tokens } = await adminClient.from("push_tokens").select("token");

    if (tokens && tokens.length > 0) {
      await sendExpoPushNotifications(
        tokens.map((row) => ({
          to: row.token,
          title: parsed.data.title,
          body: parsed.data.body,
          data: parsed.data.deep_link ? { deepLink: parsed.data.deep_link } : undefined,
        }))
      );
    }
  }

  revalidatePath("/dashboard/notifications");
  redirect("/dashboard/notifications");
}
