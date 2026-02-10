import { NavLink, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"

export default function SidebarItem({
  item,
  onSelect,
}: {
  item: { to: string; label: string; icon: any }
  onSelect?: () => void
}) {

  const location = useLocation();

  // ✅ custom active: /sotuv va /sotuv/.... hammasi active
  const isCustomActive =
    location.pathname === item.to ||
    location.pathname.startsWith(item.to + "/");

  return (
    <NavLink to={item.to} className="block" onClick={onSelect}>
      {() => (
        <div
          className={cn(
            "relative w-full h-14 rounded-2xl flex items-center",
            "transition-all duration-300",
            "hover:translate-x-0.5",
            isCustomActive
              ? "bg-linear-to-br from-black via-[#1a140b] to-[#ff9f1c]"
              : "hover:bg-slate-900/5"
          )}
        >
          {/* left active indicator */}
          <div
            className={cn(
              "absolute left-0 top-1/2 -translate-y-1/2",
              "h-8 w-1.5 rounded-full",
              "bg-linear-to-bl from-black via-[#1a140b] to-[#ff9f1c]",
              "opacity-0",
              isCustomActive && "opacity-100"
            )}
          />

          {/* icon */}
          <div className="w-16 shrink-0 flex items-center justify-center">
            <div
              className={cn(
                "relative w-11 h-11 rounded-2xl flex items-center justify-center",
                "transition-all duration-300",
                isCustomActive
                  ? "bg-linear-to-br from-black via-[#1a140b] to-[#ff9f1c]"
                  : "glass"
              )}
            >
              <div
                className={cn(
                  "pointer-events-none absolute inset-0 rounded-2xl blur-xl",
                  "opacity-0",
                  isCustomActive && "opacity-100",
                  "bg-linear-to-br from-black via-[#1a140b] to-[#ff9f1c]"
                )}
              />

              <item.icon
                size={20}
                className={cn(
                  "relative transition-colors duration-300",
                  isCustomActive ? "text-white" : "text-gray-400"
                )}
              />
            </div>
          </div>

          {/* label */}
          <div className="min-w-0 flex-1 pr-4">
            <span
              className={cn(
                "block truncate font-semibold text-sm",
                "opacity-0 translate-x-2",
                "group-hover:opacity-100 group-hover:translate-x-0",
                "transition-all duration-300",
                isCustomActive ? "text-white" : "text-slate-700"
              )}
            >
              {item.label}
            </span>
          </div>
        </div>
      )}
    </NavLink>
  )
}
