"use server";

import { revalidatePath } from "next/cache";

import { getCurrentStaffProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function setEntitlementStatus(
  entitlementId: string,
  customerId: string,
  status: "eligible" | "ineligible"
) {
  const profile = await getCurrentStaffProfile();
  if (!profile) throw new Error("Not authorized.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("monthly_entitlements")
    .update({ status })
    .eq("id", entitlementId);
  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/customers/${customerId}`);
}
