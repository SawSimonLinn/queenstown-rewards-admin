"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentStaffProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { uploadImageIfPresent } from "@/lib/upload-image";

const specialSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  start_date: z.string().min(1),
  end_date: z.string().min(1),
  status: z.enum(["draft", "active"]),
  location_ids: z.array(z.string()).min(1, "Select at least one location."),
});

export type SpecialFormState = { error: string } | null;

async function requireStaff() {
  const profile = await getCurrentStaffProfile();
  if (!profile) throw new Error("Not authorized.");
  return profile;
}

function getLocationIds(formData: FormData): string[] {
  return formData.getAll("location_ids").map(String);
}

async function syncSpecialLocations(
  supabase: Awaited<ReturnType<typeof createClient>>,
  specialId: string,
  locationIds: string[]
) {
  await supabase.from("special_locations").delete().eq("special_id", specialId);
  if (locationIds.length > 0) {
    await supabase
      .from("special_locations")
      .insert(locationIds.map((locationId) => ({ special_id: specialId, location_id: locationId })));
  }
}

function parseSpecialForm(formData: FormData) {
  return specialSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
    status: formData.get("status"),
    location_ids: getLocationIds(formData),
  });
}

export async function createSpecial(
  _prevState: SpecialFormState,
  formData: FormData
): Promise<SpecialFormState> {
  await requireStaff();

  const parsed = parseSpecialForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please fill in all required fields with valid values." };
  }

  const supabase = await createClient();
  const imageUrl = await uploadImageIfPresent(supabase, formData.get("image") as File | null, "specials");

  const { data: special, error } = await supabase
    .from("specials")
    .insert({
      title: parsed.data.title,
      description: parsed.data.description,
      start_date: parsed.data.start_date,
      end_date: parsed.data.end_date,
      status: parsed.data.status,
      image_url: imageUrl,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };

  await syncSpecialLocations(supabase, special.id, parsed.data.location_ids);

  revalidatePath("/dashboard/specials");
  redirect("/dashboard/specials");
}

export async function updateSpecial(
  specialId: string,
  _prevState: SpecialFormState,
  formData: FormData
): Promise<SpecialFormState> {
  await requireStaff();

  const parsed = parseSpecialForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please fill in all required fields with valid values." };
  }

  const supabase = await createClient();
  const imageUrl = await uploadImageIfPresent(supabase, formData.get("image") as File | null, "specials");

  const { error } = await supabase
    .from("specials")
    .update({
      title: parsed.data.title,
      description: parsed.data.description,
      start_date: parsed.data.start_date,
      end_date: parsed.data.end_date,
      status: parsed.data.status,
      ...(imageUrl ? { image_url: imageUrl } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", specialId);
  if (error) return { error: error.message };

  await syncSpecialLocations(supabase, specialId, parsed.data.location_ids);

  revalidatePath("/dashboard/specials");
  redirect("/dashboard/specials");
}

export async function duplicateSpecial(specialId: string): Promise<{ error?: string }> {
  await requireStaff();
  const supabase = await createClient();

  const [{ data: special, error: fetchError }, { data: links }] = await Promise.all([
    supabase.from("specials").select("*").eq("id", specialId).maybeSingle(),
    supabase.from("special_locations").select("location_id").eq("special_id", specialId),
  ]);
  if (fetchError) return { error: fetchError.message };
  if (!special) return { error: "Promotion not found." };

  const { id: _id, created_at: _createdAt, updated_at: _updatedAt, ...rest } = special;
  void _id;
  void _createdAt;
  void _updatedAt;

  const { data: copy, error: insertError } = await supabase
    .from("specials")
    .insert({ ...rest, title: `${special.title} (copy)`, status: "draft" })
    .select("id")
    .single();
  if (insertError) return { error: insertError.message };

  if (links && links.length > 0) {
    await supabase
      .from("special_locations")
      .insert(links.map((link) => ({ special_id: copy.id, location_id: link.location_id })));
  }

  revalidatePath("/dashboard/specials");
  return {};
}

export async function setSpecialStatus(specialId: string, status: "draft" | "active"): Promise<{ error?: string }> {
  await requireStaff();
  const supabase = await createClient();
  const { error } = await supabase
    .from("specials")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", specialId);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/specials");
  revalidatePath("/dashboard");
  return {};
}

export async function deleteSpecial(specialId: string): Promise<{ error?: string }> {
  await requireStaff();
  const supabase = await createClient();
  await supabase.from("special_locations").delete().eq("special_id", specialId);
  const { error } = await supabase.from("specials").delete().eq("id", specialId);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/specials");
  revalidatePath("/dashboard");
  return {};
}
