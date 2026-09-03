"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentStaffProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const qrSchema = z.object({
  location_id: z.string().uuid(),
  campaign_id: z.string().uuid(),
  expires_at: z.string().min(1),
});

export type QrFormState = { error: string } | null;

export async function createQrCode(
  _prevState: QrFormState,
  formData: FormData
): Promise<QrFormState> {
  const profile = await getCurrentStaffProfile();
  if (!profile) throw new Error("Not authorized.");

  const parsed = qrSchema.safeParse({
    location_id: formData.get("location_id"),
    campaign_id: formData.get("campaign_id"),
    expires_at: formData.get("expires_at"),
  });
  if (!parsed.success) {
    return { error: "Choose a location, campaign, and expiry date." };
  }

  // Opaque, unguessable token — never derived from customer or entitlement
  // data. The mobile app never sees anything but this string.
  const token = crypto.randomUUID();

  const supabase = await createClient();
  const { error } = await supabase.from("redemption_qr_codes").insert({
    ...parsed.data,
    token,
    is_active: true,
  });
  if (error) return { error: error.message };

  revalidatePath("/dashboard/qr-codes");
  redirect("/dashboard/qr-codes");
}

export async function deactivateQrCode(qrCodeId: string) {
  const profile = await getCurrentStaffProfile();
  if (!profile) throw new Error("Not authorized.");

  const supabase = await createClient();
  await supabase.from("redemption_qr_codes").update({ is_active: false }).eq("id", qrCodeId);

  revalidatePath("/dashboard/qr-codes");
}
