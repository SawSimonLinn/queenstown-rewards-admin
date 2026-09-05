import { redirect } from "next/navigation";

import { MobileNav } from "@/components/shell/mobile-nav";
import { Sidebar } from "@/components/shell/sidebar";
import { ToastProvider } from "@/components/ui/toast";
import { getCurrentStaffProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentStaffProfile();

  // The proxy only checks "is there a session" — role is verified here,
  // server-side, on every dashboard request.
  if (!profile) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data: staffMember } = await supabase
    .from("staff_members")
    .select("locations(name)")
    .eq("profile_id", profile.id)
    .maybeSingle<{ locations: { name: string } | null }>();
  const locationName = staffMember?.locations?.name ?? null;

  return (
    <ToastProvider>
      <div className="flex min-h-full flex-1 flex-col bg-cream lg:flex-row">
        <Sidebar
          fullName={profile.full_name}
          role={profile.role}
          locationName={locationName}
          isAdmin={profile.role === "admin"}
        />
        <MobileNav
          fullName={profile.full_name}
          role={profile.role}
          locationName={locationName}
          isAdmin={profile.role === "admin"}
        />
        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </ToastProvider>
  );
}
