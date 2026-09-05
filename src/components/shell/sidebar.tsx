"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/data-list";
import { signOut } from "@/app/dashboard/actions";
import { ChevronLeftIcon, SignOutIcon } from "@/components/shell/icons";
import { isNavItemActive, NAV_SECTIONS } from "@/components/shell/nav-data";

const COLLAPSE_KEY = "qr-admin-sidebar-collapsed";

export function Sidebar({
  fullName,
  role,
  locationName,
  isAdmin,
}: {
  fullName: string;
  role: string;
  locationName: string | null;
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Reads a browser-only preference after mount; the brief flash from
  // expanded to collapsed avoids a server/client hydration mismatch.
  useEffect(() => {
    if (window.localStorage.getItem(COLLAPSE_KEY) === "1") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCollapsed(true);
    }
  }, []);

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      return next;
    });
  }

  const sections = NAV_SECTIONS.filter((section) => !section.adminOnly || isAdmin);

  return (
    <nav
      aria-label="Dashboard navigation"
      className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-150 lg:flex ${
        collapsed ? "w-[76px]" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-4">
        <Link href="/dashboard" className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">
            QR
          </span>
          {!collapsed && (
            <span className="min-w-0">
              <span className="font-display block truncate text-sm font-semibold text-ink">
                Queenstown Rewards
              </span>
              <span className="block truncate text-xs text-muted">Admin</span>
            </span>
          )}
        </Link>
      </div>

      <ul className="flex-1 overflow-y-auto px-3 py-4">
        {sections.map((section, index) => (
          <li key={section.label} className={index > 0 ? "mt-5" : ""}>
            {!collapsed && (
              <p className="mb-1.5 px-3 text-xs font-semibold uppercase tracking-wide text-muted">
                {section.label}
              </p>
            )}
            <ul className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const active = isNavItemActive(pathname, item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      title={collapsed ? item.label : undefined}
                      className={`relative flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                        active
                          ? "bg-brand-tint font-medium text-brand-active"
                          : "text-ink/80 hover:bg-cream hover:text-ink"
                      }`}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand" />
                      )}
                      <Icon className="size-5 shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>

      <div className="border-t border-border p-3">
        <button
          type="button"
          onClick={toggleCollapsed}
          className="mb-2 flex min-h-9 w-full items-center justify-center gap-2 rounded-lg text-sm text-muted hover:bg-cream hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeftIcon className={`size-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
          {!collapsed && "Collapse"}
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left hover:bg-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-tint text-sm font-semibold text-brand-active">
              {fullName.charAt(0).toUpperCase() || "?"}
            </span>
            {!collapsed && (
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-ink">{fullName}</span>
                <span className="flex items-center gap-1.5">
                  <Badge tone={role === "admin" ? "brand" : "neutral"} className="capitalize">
                    {role}
                  </Badge>
                  {locationName && <span className="truncate text-xs text-muted">{locationName}</span>}
                </span>
              </span>
            )}
          </button>

          {menuOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-full min-w-48 rounded-lg border border-border bg-surface p-1 shadow-lg">
              <form action={signOut}>
                <button
                  type="submit"
                  className="flex min-h-10 w-full items-center gap-2 rounded-md px-3 text-left text-sm text-ink hover:bg-cream"
                >
                  <SignOutIcon className="size-4" />
                  Sign out
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
