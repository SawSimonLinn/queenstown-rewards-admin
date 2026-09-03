"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentAdminProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const staffSchema = z.object({
  full_name: z.string().trim().min(1),
  email: z.string().trim().email(),
  password: z.string().min(8),
  role: z.enum(["staff", "admin"]),
  location_id: z.string().uuid(),
});

export type StaffFormState = { error: string } | null;

/**
 * Creates a new staff/admin account. Admin-only, and the only place this
 * app uses the service-role key — createUser and the role update both need
 * to bypass RLS in ways a customer-facing anon-key flow never should.
 */
export async function createStaffAccount(
  _prevState: StaffFormState,
  formData: FormData
): Promise<StaffFormState> {
  const admin = await getCurrentAdminProfile();
  if (!admin) throw new Error("Not authorized.");

  const parsed = staffSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    location_id: formData.get("location_id"),
  });
  if (!parsed.success) {
    return { error: "Please fill in all fields — password must be at least 8 characters." };
  }

  const adminClient = createAdminClient();

  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { full_name: parsed.data.full_name },
  });
  if (createError || !created.user) {
    return { error: createError?.message ?? "Could not create the account." };
  }

  const { error: roleError } = await adminClient
    .from("profiles")
    .update({ role: parsed.data.role })
    .eq("id", created.user.id);
  if (roleError) return { error: roleError.message };

  const { error: staffError } = await adminClient.from("staff_members").insert({
    profile_id: created.user.id,
    location_id: parsed.data.location_id,
  });
  if (staffError) return { error: staffError.message };

  revalidatePath("/dashboard/staff");
  redirect("/dashboard/staff");
}

export async function setStaffActive(staffMemberId: string, isActive: boolean) {
  const admin = await getCurrentAdminProfile();
  if (!admin) throw new Error("Not authorized.");

  const supabase = await createClient();
  await supabase.from("staff_members").update({ is_active: isActive }).eq("id", staffMemberId);

  revalidatePath("/dashboard/staff");
}
