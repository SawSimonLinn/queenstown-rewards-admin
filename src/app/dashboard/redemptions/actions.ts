"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentStaffProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { error: string } | { error?: undefined };

async function logAction(
  supabase: Awaited<ReturnType<typeof createClient>>,
  action: string,
  actorProfileId: string,
  targetId: string,
  metadata: Record<string, unknown>,
) {
  await supabase.from("audit_logs").insert({
    action,
    actor_profile_id: actorProfileId,
    target_id: targetId,
    metadata,
  });
}

export async function confirmRedemption(redemptionId: string): Promise<ActionResult> {
  const profile = await getCurrentStaffProfile();
  if (!profile) return { error: "Not authorized." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("redemptions")
    .update({ status: "confirmed", confirmed_by_staff_id: profile.id })
    .eq("id", redemptionId);
  if (error) return { error: error.message };

  await logAction(supabase, "redemption_confirmed", profile.id, redemptionId, {});
  revalidatePath("/dashboard/redemptions");
  revalidatePath("/dashboard");
  return {};
}

const cancelSchema = z.object({ reason: z.string().trim().min(1, "A reason is required.") });

export async function cancelRedemption(redemptionId: string, reason: string): Promise<ActionResult> {
  const profile = await getCurrentStaffProfile();
  if (!profile) return { error: "Not authorized." };

  const parsed = cancelSchema.safeParse({ reason });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase
    .from("redemptions")
    .update({
      status: "cancelled",
      confirmed_by_staff_id: profile.id,
      correction_note: parsed.data.reason,
    })
    .eq("id", redemptionId);
  if (error) return { error: error.message };

  await logAction(supabase, "redemption_cancelled", profile.id, redemptionId, {
    reason: parsed.data.reason,
  });
  revalidatePath("/dashboard/redemptions");
  revalidatePath("/dashboard");
  return {};
}

const correctSchema = z.object({
  newStatus: z.enum(["confirmed", "cancelled"]),
  note: z.string().trim().min(1, "A note explaining the correction is required."),
});

export async function correctRedemption(
  redemptionId: string,
  newStatus: "confirmed" | "cancelled",
  note: string,
): Promise<ActionResult> {
  const profile = await getCurrentStaffProfile();
  if (!profile) return { error: "Not authorized." };

  const parsed = correctSchema.safeParse({ newStatus, note });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase
    .from("redemptions")
    .update({
      status: "corrected",
      confirmed_by_staff_id: profile.id,
      correction_note: `Corrected to ${parsed.data.newStatus}: ${parsed.data.note}`,
    })
    .eq("id", redemptionId);
  if (error) return { error: error.message };

  await logAction(supabase, "redemption_corrected", profile.id, redemptionId, {
    corrected_to: parsed.data.newStatus,
    note: parsed.data.note,
  });
  revalidatePath("/dashboard/redemptions");
  revalidatePath("/dashboard");
  return {};
}
