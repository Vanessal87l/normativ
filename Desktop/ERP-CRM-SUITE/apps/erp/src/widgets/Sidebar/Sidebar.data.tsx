// src/widgets/Sidebar/Sidebar.data.ts
import type { LucideIcon } from "lucide-react"
import {
  LayoutDashboard,
  BookOpen,
  Boxes,
  ClipboardList,
  ShoppingCart,
  Warehouse,
  Wallet,
  Factory,
  FileText,
  Users,
  LogOut,
} from "lucide-react"

export type SidebarItemType = {
  to: string
  label: string
  icon: LucideIcon
  badge?: string | number
  disabled?: boolean
}

export const sidebarItems: SidebarItemType[] = [
  // ✅ 1) Dashboard
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },

  // ✅ 2) Ma’lumotnoma
  { to: "/dashboard/settings/dicts", label: "Ma'lumotnoma", icon: BookOpen },

  // ✅ 3) Mahsulot katalogi
  { to: "/dashboard/catalog/products", label: "Mahsulot katalogi", icon: Boxes },

  // ✅ 5) Buyurtmalar (sizda bor)

  { to: "/sotuv/orders", label: "Buyurtmalar", icon: ClipboardList },

  // ✅ 6) Xaridlar  ← TO‘G‘RI YO‘L
  { to: "/dashboard/purchases", label: "Xaridlar", icon: ShoppingCart },

  // ✅ 7) Ombor
  { to: "/dashboard/sklad/warehouse/overview", label: "Ombor", icon: Warehouse },


  // ✅ 8) Moliya
  { to: "/dashboard/moliya/ledger", label: "Moliya", icon: Wallet },

  // ✅ 9) Ishlab chiqarish
  { to: "/dashboard/production", label: "Ishlab chiqarish", icon: Factory, disabled: true },

  // ✅ 10) Hujjatlar
  { to: "/dashboard/documents", label: "Hujjatlar", icon: FileText, disabled: true },

  // ✅ Extra
  { to: "/xodimlar", label: "Mijoz va Xodim", icon: Users },
  { to: "/login", label: "Logout", icon: LogOut },
]
