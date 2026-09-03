import { createClient } from "@/lib/supabase/server";

export type StaffProfile = {
  id: string;
  full_name: string;
  email: string;
  role: "customer" | "staff" | "admin";
};

/**
 * Returns the signed-in user's profile if they're staff or admin, otherwise
 * null. Every dashboard page and Server Action must call this and check the
 * result — Server Actions are reachable by anyone who can POST to them, so
 * UI-level gating alone is not enough (per Next.js's own security guidance).
 */
export async function getCurrentStaffProfile(): Promise<StaffProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role === "customer") return null;
  return profile as StaffProfile;
}

/** Admin-only variant, for actions that require the admin role specifically. */
export async function getCurrentAdminProfile(): Promise<StaffProfile | null> {
  const profile = await getCurrentStaffProfile();
  return profile?.role === "admin" ? profile : null;
}
