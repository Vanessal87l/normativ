import { sidebarItems } from "./Sidebar.data"
import SidebarItem from "./SidebarItem"

export type SectionKey =
  | "dashboard"
  | "sotuv"
  | "sklad"
  | "qarzdorlik"
  | "tovar"
  | "mijoz"

export default function Sidebar({
  onSectionChange,
}: {
  onSectionChange?: (key: SectionKey | null) => void
}) {
  return (
    <aside
      className={[
        "shrink-0",
        "sticky top-4 h-[calc(100vh-2rem)]",
        "flex flex-col",
        "glass-strong rounded-[28px]",
        "w-24 hover:w-73",
        "transition-[width] duration-300 ease-out",
        "overflow-hidden",
        "group",
      ].join(" ")}
    >
      <div className="px-4 pt-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-blue-600/90 shadow-[0_14px_34px_rgba(37,99,235,0.35)]" />

          <div className="min-w-0 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
            <div className="font-semibold leading-5 truncate">ERP Admin</div>
            <div className="text-xs text-slate-500 truncate">Luxury UI</div>
          </div>
        </div>

        <div className="mt-6 px-1 text-xs font-semibold text-slate-400">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            HOME
          </span>
        </div>
      </div>

      <nav className="mt-3 flex flex-col gap-2 px-3">
        {sidebarItems.map((it) => (
          <SidebarItem
            key={it.to}
            item={it}
            onSelect={() => {
              // ✅ dashboard bo'limlarini route bo'yicha aniqlaymiz
              if (it.to.startsWith("/dashboard")) {
                if (it.to === "/dashboard" || it.to === "/dashboard/sotuv") {
                  onSectionChange?.("sotuv")
                  return
                }
                if (it.to === "/dashboard/sklad") {
                  onSectionChange?.("sklad")
                  return
                }
                if (it.to === "/dashboard/qarzdorlik") {
                  onSectionChange?.("qarzdorlik")
                  return
                }
                onSectionChange?.("dashboard")
                return
              }

              // ✅ qolgan bo'limlar (agar ishlatsang)
              if (it.to === "/xodimlar") {
                onSectionChange?.("tovar")
                return
              }
              if (it.to === "/bildirishnomalar") {
                onSectionChange?.("mijoz")
                return
              }

              onSectionChange?.(null)
            }}
          />
        ))}
      </nav>
    </aside>
  )
}
