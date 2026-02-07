// src/widgets/Sidebar/Sidebar.data.ts
import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, ShoppingCart, Warehouse, Wallet, Users, Package } from "lucide-react";

export type SidebarItemType = {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: string | number;
  disabled?: boolean;
};

export const sidebarItems: SidebarItemType[] = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    to: "/sotuv/Orders",
    label: "Sotuv",
    icon: ShoppingCart,
    badge: 3,
  },
  {
    to: "/dashboard/sklad",
    label: "Ombor",
    icon: Warehouse,
  },
  {
    to: "/dashboard/qarzdorlik",
    label: "Qarzdorlik",
    icon: Wallet,
    badge: 12,
  },
  {
    to: "/tovarlar",
    label: "Tovar va Narx",
    icon: Package,
  },
  {
    to: "/xodimlar",
    label: "Mijoz va Xodim",
    icon: Users,
  },
];
