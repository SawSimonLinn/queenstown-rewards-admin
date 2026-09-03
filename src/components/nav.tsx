"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { signOut } from "@/app/dashboard/actions";

const LINKS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/locations", label: "Locations" },
  { href: "/dashboard/campaigns", label: "Burger of the Month" },
  { href: "/dashboard/specials", label: "Specials" },
  { href: "/dashboard/qr-codes", label: "QR Codes" },
  { href: "/dashboard/redemptions", label: "Redemptions" },
  { href: "/dashboard/customers", label: "Customers" },
  { href: "/dashboard/notifications", label: "Notifications" },
] as const;

const ADMIN_LINKS = [
  { href: "/dashboard/staff", label: "Staff" },
  { href: "/dashboard/audit-log", label: "Audit Log" },
] as const;

export function Nav({
  fullName,
  role,
  isAdmin,
}: {
  fullName: string;
  role: string;
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  const links = isAdmin ? [...LINKS, ...ADMIN_LINKS] : LINKS;

  return (
    <nav
      aria-label="Dashboard navigation"
      className="sticky top-0 z-30 flex w-full flex-col border-b border-neutral-200 bg-white lg:h-screen lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r"
    >
      <div className="flex items-center justify-between gap-3 border-b border-neutral-200 px-4 py-3 lg:block lg:px-4 lg:py-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-neutral-950">Queenstown Rewards</p>
          <p className="truncate text-xs text-neutral-500">{fullName}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2 lg:mt-3 lg:block">
          <span className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1 text-xs font-medium capitalize text-neutral-600 lg:inline-flex">
            {role}
          </span>
          <form action={signOut} className="lg:hidden">
            <button
              type="submit"
              className="min-h-9 rounded-md border border-neutral-200 px-2 py-1 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
      <ul className="flex gap-1 overflow-x-auto px-3 py-2 lg:flex-1 lg:flex-col lg:overflow-x-visible lg:p-3">
        {links.map((link) => {
          const active =
            link.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`block min-h-10 whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 lg:min-h-0 ${
                  active
                    ? "bg-blue-50 font-medium text-blue-800"
                    : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <form action={signOut} className="hidden border-t border-neutral-200 p-3 lg:block">
        <button
          type="submit"
          className="w-full rounded-md px-3 py-2 text-left text-sm text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Sign out
        </button>
      </form>
    </nav>
  );
}
