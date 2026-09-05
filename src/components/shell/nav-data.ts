import type { ComponentType, SVGProps } from "react";

import {
  AuditIcon,
  BellIcon,
  BurgerIcon,
  DashboardIcon,
  LocationIcon,
  QrIcon,
  ReceiptIcon,
  StaffIcon,
  TagIcon,
  UsersIcon,
} from "@/components/shell/icons";

export type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export type NavSection = {
  label: string;
  adminOnly?: boolean;
  items: NavItem[];
};

export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Overview",
    items: [{ href: "/dashboard", label: "Dashboard", icon: DashboardIcon }],
  },
  {
    label: "Content",
    items: [
      { href: "/dashboard/locations", label: "Locations", icon: LocationIcon },
      { href: "/dashboard/campaigns", label: "Burger Campaigns", icon: BurgerIcon },
      { href: "/dashboard/specials", label: "Promotions", icon: TagIcon },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/dashboard/qr-codes", label: "QR Codes", icon: QrIcon },
      { href: "/dashboard/redemptions", label: "Redemptions", icon: ReceiptIcon },
      { href: "/dashboard/customers", label: "Customers", icon: UsersIcon },
      { href: "/dashboard/notifications", label: "Notifications", icon: BellIcon },
    ],
  },
  {
    label: "Administration",
    adminOnly: true,
    items: [
      { href: "/dashboard/staff", label: "Staff", icon: StaffIcon },
      { href: "/dashboard/audit-log", label: "Audit Log", icon: AuditIcon },
    ],
  },
];

export function isNavItemActive(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
}
