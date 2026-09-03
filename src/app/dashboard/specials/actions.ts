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

export async function createSpecial(
  _prevState: SpecialFormState,
  formData: FormData
): Promise<SpecialFormState> {
  await requireStaff();

  const parsed = specialSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
  });
  if (!parsed.success) {
    return { error: "Please fill in all required fields with valid values." };
  }

  const supabase = await createClient();
  const imageUrl = await uploadImageIfPresent(
    supabase,
    formData.get("image") as File | null,
    "specials"
  );

  const { data: special, error } = await supabase
    .from("specials")
    .insert({ ...parsed.data, image_url: imageUrl })
    .select("id")
    .single();
  if (error) return { error: error.message };

  await syncSpecialLocations(supabase, special.id, getLocationIds(formData));

  revalidatePath("/dashboard/specials");
  redirect("/dashboard/specials");
}

export async function updateSpecial(
  specialId: string,
  _prevState: SpecialFormState,
  formData: FormData
): Promise<SpecialFormState> {
  await requireStaff();

  const parsed = specialSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
  });
  if (!parsed.success) {
    return { error: "Please fill in all required fields with valid values." };
  }

  const supabase = await createClient();
  const imageUrl = await uploadImageIfPresent(
    supabase,
    formData.get("image") as File | null,
    "specials"
  );

  const { error } = await supabase
    .from("specials")
    .update({
      ...parsed.data,
      ...(imageUrl ? { image_url: imageUrl } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", specialId);
  if (error) return { error: error.message };

  await syncSpecialLocations(supabase, specialId, getLocationIds(formData));

  revalidatePath("/dashboard/specials");
  redirect("/dashboard/specials");
}
