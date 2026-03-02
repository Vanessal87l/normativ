import SidebarItem from "./SidebarItem"
import { sidebarItems } from "./Sidebar.data"
import { clearAuth } from "@/lib/auth"

export type SectionKey =
  | "dashboard"
  | "sotuv"
  | "sklad"
  | "moliya"
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
        "rounded-[28px]",
        "bg-white",
        "border border-slate-200",
        "shadow-[0_22px_70px_-55px_rgba(15,23,42,0.55)]",
        "overflow-hidden",
        "w-[92px] hover:w-[300px]",
        "transition-[width] duration-300 ease-out",
        "group",
      ].join(" ")}
    >
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="rounded-3xl bg-gradient-to-b from-[#0D3B78] to-[#0A4D96] p-4 text-white shadow-[0_22px_60px_-40px_rgba(2,6,23,0.7)]">
          {/* ✅ yopiqda center, hoverda left */}
          <div className="flex items-center gap-3 justify-center group-hover:justify-start transition-all duration-300">
            {/* ✅ icon wrapper endi toza center */}
            <div className="h-11 w-11 rounded-2xl bg-white/12 ring-1 ring-white/20 flex items-center ml-[14px] justify-center shrink-0">
              <div className="h-6 w-6 rounded-lg border border-white/35" />
            </div>

            {/* ✅ text faqat hoverda chiqadi */}
            <div className="min-w-0 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              <div className="font-semibold leading-5 truncate">ERP</div>
              <div className="text-xs text-white/70 truncate">
                
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="hide-scrollbar flex-1 overflow-y-auto px-3 pb-3">
        <nav className="flex flex-col gap-2">
          {sidebarItems.map((it) => (
            <SidebarItem
              key={it.to}
              item={it}
              onSelect={() => {
                if (it.to === "/login") {
                  clearAuth()
                  onSectionChange?.(null)
                  return
                }

                if (it.to.startsWith("/dashboard")) {
                  if (it.to === "/dashboard") {
                    onSectionChange?.("dashboard")
                    return
                  }
                  if (it.to.startsWith("/dashboard/sklad")) {
                    onSectionChange?.("sklad")
                    return
                  }
                  if (it.to.startsWith("/dashboard/moliya")) {
                    onSectionChange?.("moliya")
                    return
                  }
                  if (it.to.startsWith("/dashboard/partners")) {
                    onSectionChange?.("mijoz")
                    return
                  }
                  onSectionChange?.("dashboard")
                  return
                }

                if (it.to.startsWith("/sotuv")) {
                  onSectionChange?.("sotuv")
                  return
                }

                if (it.to.startsWith("/xodimlar")) {
                  onSectionChange?.("mijoz")
                  return
                }
                onSectionChange?.(null)
              }}
            />
          ))}
        </nav>
      </div>

      {/* Bottom user card */}
      {/* <div className="p-3 pt-0">
        <div className="rounded-2xl bg-slate-900/5 ring-1 ring-slate-900/10 px-3 py-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-900/10 ring-1 ring-slate-900/10 shrink-0" />
            <div className="min-w-0 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              <div className="text-sm font-semibold text-slate-900 truncate">
                Yusuf
              </div>
              <div className="text-[11px] text-slate-600 truncate">
                Admin
              </div>
            </div>
          </div>
        </div>
      </div> */}
    </aside>
  )
}
