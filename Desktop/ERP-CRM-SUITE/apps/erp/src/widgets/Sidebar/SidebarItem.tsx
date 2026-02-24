import { NavLink, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"

export default function SidebarItem({
  item,
  onSelect,
}: {
  item: { to: string; label: string; icon: any; badge?: string | number; disabled?: boolean }
  onSelect?: () => void
}) {
  const location = useLocation()

  const isCustomActive =
    item.to === "/dashboard"
      ? location.pathname === "/dashboard"
      : location.pathname === item.to || location.pathname.startsWith(item.to + "/")

  const Icon = item.icon

  return (
    <NavLink
      to={item.disabled ? "#" : item.to}
      className={cn("block", item.disabled && "pointer-events-none opacity-45")}
      onClick={onSelect}
      aria-disabled={item.disabled}
      tabIndex={item.disabled ? -1 : 0}
    >
      {() => (
        <div
          className={cn(
            "relative w-full h-[45px] rounded-2xl flex items-center",
            "px-2.5",
            "transition-all duration-200 ease-out",
            "hover:bg-slate-900/5 hover:translate-x-0.5",
            isCustomActive && "bg-slate-900/5 ring-1 ring-slate-900/10"
          )}
        >
          {/* active indicator */}
          <div
            className={cn(
              "absolute left-0 top-1/2 -translate-y-1/2",
              "h-8 w-1.5 rounded-full",
              "bg-gradient-to-b from-sky-400 to-indigo-600",
              "opacity-0",
              isCustomActive && "opacity-100"
            )}
          />

          {/* icon bubble */}
          <div className="w-[64px] shrink-0 flex items-center justify-center">
            <div
              className={cn(
                "h-10 w-10 rounded-2xl flex items-center justify-center",
                "transition-all duration-200 ease-out",
                isCustomActive
                  ? "bg-blue-600/12 ring-1 ring-blue-500/15 shadow-[0_12px_26px_-18px_rgba(37,99,235,0.65)]"
                  : "bg-white ring-1 ring-slate-900/5 shadow-[0_10px_25px_-18px_rgba(15,23,42,0.2)]"
              )}
            >
              <Icon
                size={20}
                className={cn(isCustomActive ? "text-blue-600" : "text-slate-700")}
              />
            </div>
          </div>

          {/* label + badge (sidebar ochilganda chiqadi) */}
          <div className="min-w-0 flex-1 pr-3 flex items-center justify-between gap-3">
            <span
              className={cn(
                "block min-w-0 truncate text-[14px] font-semibold",
                "opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0",
                "transition-all duration-300",
                isCustomActive ? "text-slate-900" : "text-slate-700"
              )}
              title={item.label}
            >
              {item.label}
            </span>

            {item.badge !== undefined ? (
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                  "bg-slate-900 text-white",
                  "opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                )}
              >
                {item.badge}
              </span>
            ) : null}
          </div>
        </div>
      )}
    </NavLink>
  )
}
