"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { signOut } from "@/app/dashboard/actions";
import { Badge } from "@/components/ui/data-list";
import { CloseIcon, MenuIcon, SignOutIcon } from "@/components/shell/icons";
import { isNavItemActive, NAV_SECTIONS } from "@/components/shell/nav-data";

export function MobileNav({
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
  const [open, setOpen] = useState(false);
  const [openedForPathname, setOpenedForPathname] = useState(pathname);

  if (pathname !== openedForPathname) {
    setOpenedForPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const sections = NAV_SECTIONS.filter((section) => !section.adminOnly || isAdmin);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-surface px-4 py-3 lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">
            QR
          </span>
          <span className="font-display text-sm font-semibold text-ink">Queenstown Rewards</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open navigation menu"
          className="flex size-11 items-center justify-center rounded-lg text-ink hover:bg-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          <MenuIcon className="size-6" />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            className="absolute inset-0 bg-ink/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 flex w-[85vw] max-w-xs flex-col bg-surface shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <span className="font-display text-sm font-semibold text-ink">Menu</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close navigation menu"
                className="flex size-11 items-center justify-center rounded-lg text-muted hover:bg-cream hover:text-ink"
              >
                <CloseIcon className="size-6" />
              </button>
            </div>

            <ul className="flex-1 overflow-y-auto px-3 py-4">
              {sections.map((section, index) => (
                <li key={section.label} className={index > 0 ? "mt-5" : ""}>
                  <p className="mb-1.5 px-3 text-xs font-semibold uppercase tracking-wide text-muted">
                    {section.label}
                  </p>
                  <ul className="flex flex-col gap-0.5">
                    {section.items.map((item) => {
                      const active = isNavItemActive(pathname, item.href);
                      const Icon = item.icon;
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            aria-current={active ? "page" : undefined}
                            className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm ${
                              active
                                ? "bg-brand-tint font-medium text-brand-active"
                                : "text-ink/80 hover:bg-cream"
                            }`}
                          >
                            <Icon className="size-5 shrink-0" />
                            <span className="truncate">{item.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>

            <div className="border-t border-border p-3">
              <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-tint text-sm font-semibold text-brand-active">
                  {fullName.charAt(0).toUpperCase() || "?"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">{fullName}</span>
                  <span className="flex items-center gap-1.5">
                    <Badge tone={role === "admin" ? "brand" : "neutral"} className="capitalize">
                      {role}
                    </Badge>
                    {locationName && <span className="truncate text-xs text-muted">{locationName}</span>}
                  </span>
                </span>
              </div>
              <form action={signOut}>
                <button
                  type="submit"
                  className="mt-1 flex min-h-11 w-full items-center gap-2 rounded-md px-3 text-left text-sm text-ink hover:bg-cream"
                >
                  <SignOutIcon className="size-4" />
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
