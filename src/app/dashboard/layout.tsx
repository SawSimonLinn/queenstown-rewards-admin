import { redirect } from "next/navigation";

import { Nav } from "@/components/nav";
import { getCurrentStaffProfile } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentStaffProfile();

  // The proxy only checks "is there a session" — role is verified here,
  // server-side, on every dashboard request.
  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-neutral-50 lg:flex-row">
      <Nav fullName={profile.full_name} role={profile.role} isAdmin={profile.role === "admin"} />
      <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}
