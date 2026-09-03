"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentStaffProfile } from "@/lib/auth";
import { parseOpeningHoursFromFormData } from "@/lib/opening-hours";
import { createClient } from "@/lib/supabase/server";

const locationSchema = z.object({
  name: z.string().trim().min(1),
  address: z.string().trim().min(1),
  suburb: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  is_participating: z.boolean(),
});

export type LocationFormState = { error: string } | null;

async function requireStaff() {
  const profile = await getCurrentStaffProfile();
  if (!profile) throw new Error("Not authorized.");
  return profile;
}

export async function createLocation(
  _prevState: LocationFormState,
  formData: FormData
): Promise<LocationFormState> {
  await requireStaff();

  const parsed = locationSchema.safeParse({
    name: formData.get("name"),
    address: formData.get("address"),
    suburb: formData.get("suburb"),
    phone: formData.get("phone"),
    latitude: formData.get("latitude"),
    longitude: formData.get("longitude"),
    is_participating: formData.get("is_participating") === "on",
  });
  if (!parsed.success) {
    return { error: "Please fill in all required fields with valid values." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("locations").insert({
    ...parsed.data,
    opening_hours: parseOpeningHoursFromFormData(formData),
  });
  if (error) return { error: error.message };

  revalidatePath("/dashboard/locations");
  redirect("/dashboard/locations");
}

export async function updateLocation(
  locationId: string,
  _prevState: LocationFormState,
  formData: FormData
): Promise<LocationFormState> {
  await requireStaff();

  const parsed = locationSchema.safeParse({
    name: formData.get("name"),
    address: formData.get("address"),
    suburb: formData.get("suburb"),
    phone: formData.get("phone"),
    latitude: formData.get("latitude"),
    longitude: formData.get("longitude"),
    is_participating: formData.get("is_participating") === "on",
  });
  if (!parsed.success) {
    return { error: "Please fill in all required fields with valid values." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("locations")
    .update({
      ...parsed.data,
      opening_hours: parseOpeningHoursFromFormData(formData),
      updated_at: new Date().toISOString(),
    })
    .eq("id", locationId);
  if (error) return { error: error.message };

  revalidatePath("/dashboard/locations");
  redirect("/dashboard/locations");
}
