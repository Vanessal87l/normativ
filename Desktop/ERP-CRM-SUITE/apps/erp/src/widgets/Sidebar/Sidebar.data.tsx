// src/widgets/Sidebar/Sidebar.data.ts
import type { LucideIcon } from "lucide-react"
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
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
  // 1пёЏвѓЈ Dashboard
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },

  // 2пёЏвѓЈ MaвЂ™lumotnoma
  { to: "/dashboard/settings/dicts", label: "Ma'lumotnoma", icon: BookOpen },

  // 3пёЏвѓЈ Mahsulot katalogi

  // вњ… 5) Buyurtmalar (sizda bor)


  { to: "/sotuv/ordersKanban", label: "Buyurtmalar", icon: ClipboardList },

  // 5пёЏвѓЈ Xaridlar


  // вњ… 7) Ombor
  { to: "/dashboard/sklad/warehouse/overview", label: "Ombor", icon: Warehouse },



  // 7пёЏвѓЈ Moliya
  { to: "/dashboard/moliya/ledger", label: "Moliya", icon: Wallet },

  // 8пёЏвѓЈ Ishlab chiqarish вњ… endi ishlaydi
  { to: "/dashboard/production", label: "Ishlab chiqarish", icon: Factory },

  // 9пёЏвѓЈ Hujjatlar
  { to: "/dashboard/documents", label: "Hujjatlar", icon: FileText },

  // рџ”џ Mijoz va Xodim
  { to: "/xodimlar", label: "Mijoz va Xodim", icon: Users },
  { to: "/login", label: "Logout", icon: LogOut },
]

