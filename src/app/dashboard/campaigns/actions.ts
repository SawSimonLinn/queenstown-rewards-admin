"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentStaffProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { uploadImageIfPresent } from "@/lib/upload-image";

const campaignSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  terms_and_restrictions: z.string().trim().default(""),
  start_date: z.string().min(1),
  end_date: z.string().min(1),
  status: z.enum(["draft", "scheduled", "active", "expired"]),
});

export type CampaignFormState = { error: string } | null;

async function requireStaff() {
  const profile = await getCurrentStaffProfile();
  if (!profile) throw new Error("Not authorized.");
  return profile;
}

function getLocationIds(formData: FormData): string[] {
  return formData.getAll("location_ids").map(String);
}

async function syncCampaignLocations(
  supabase: Awaited<ReturnType<typeof createClient>>,
  campaignId: string,
  locationIds: string[]
) {
  await supabase.from("campaign_locations").delete().eq("campaign_id", campaignId);
  if (locationIds.length > 0) {
    await supabase
      .from("campaign_locations")
      .insert(locationIds.map((locationId) => ({ campaign_id: campaignId, location_id: locationId })));
  }
}

export async function createCampaign(
  _prevState: CampaignFormState,
  formData: FormData
): Promise<CampaignFormState> {
  await requireStaff();

  const parsed = campaignSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    terms_and_restrictions: formData.get("terms_and_restrictions"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return { error: "Please fill in all required fields with valid values." };
  }

  const supabase = await createClient();
  const imageUrl = await uploadImageIfPresent(
    supabase,
    formData.get("image") as File | null,
    "campaigns"
  );

  const { data: campaign, error } = await supabase
    .from("burger_campaigns")
    .insert({ ...parsed.data, image_url: imageUrl })
    .select("id")
    .single();
  if (error) return { error: error.message };

  await syncCampaignLocations(supabase, campaign.id, getLocationIds(formData));

  revalidatePath("/dashboard/campaigns");
  redirect("/dashboard/campaigns");
}

export async function updateCampaign(
  campaignId: string,
  _prevState: CampaignFormState,
  formData: FormData
): Promise<CampaignFormState> {
  await requireStaff();

  const parsed = campaignSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    terms_and_restrictions: formData.get("terms_and_restrictions"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return { error: "Please fill in all required fields with valid values." };
  }

  const supabase = await createClient();
  const imageUrl = await uploadImageIfPresent(
    supabase,
    formData.get("image") as File | null,
    "campaigns"
  );

  const { error } = await supabase
    .from("burger_campaigns")
    .update({
      ...parsed.data,
      ...(imageUrl ? { image_url: imageUrl } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", campaignId);
  if (error) return { error: error.message };

  await syncCampaignLocations(supabase, campaignId, getLocationIds(formData));

  revalidatePath("/dashboard/campaigns");
  redirect("/dashboard/campaigns");
}

export async function duplicateCampaign(campaignId: string): Promise<{ error?: string }> {
  await requireStaff();
  const supabase = await createClient();

  const [{ data: campaign, error: fetchError }, { data: links }] = await Promise.all([
    supabase.from("burger_campaigns").select("*").eq("id", campaignId).maybeSingle(),
    supabase.from("campaign_locations").select("location_id").eq("campaign_id", campaignId),
  ]);
  if (fetchError) return { error: fetchError.message };
  if (!campaign) return { error: "Campaign not found." };

  const { id: _id, created_at: _createdAt, updated_at: _updatedAt, ...rest } = campaign;
  void _id;
  void _createdAt;
  void _updatedAt;

  const { data: copy, error: insertError } = await supabase
    .from("burger_campaigns")
    .insert({ ...rest, name: `${campaign.name} (copy)`, status: "draft" })
    .select("id")
    .single();
  if (insertError) return { error: insertError.message };

  if (links && links.length > 0) {
    await supabase
      .from("campaign_locations")
      .insert(links.map((link) => ({ campaign_id: copy.id, location_id: link.location_id })));
  }

  revalidatePath("/dashboard/campaigns");
  return {};
}

export async function setCampaignStatus(
  campaignId: string,
  status: "active" | "expired" | "draft",
): Promise<{ error?: string }> {
  await requireStaff();
  const supabase = await createClient();
  const { error } = await supabase
    .from("burger_campaigns")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", campaignId);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/campaigns");
  revalidatePath("/dashboard");
  return {};
}
