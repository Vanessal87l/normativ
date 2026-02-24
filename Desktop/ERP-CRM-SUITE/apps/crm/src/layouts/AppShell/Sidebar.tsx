import { NavLink, useLocation } from "react-router-dom";
import {
  Users,
  ListTodo,
  Building2,
  Phone,
  ShoppingCart,
  LayoutDashboard,
} from "lucide-react";

import icon from "@/assets/HEIGHT.svg";

type Props = {
  pinned: boolean;
  setPinned: (v: boolean) => void;
};

const menu = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/customers", label: "Customers", icon: Users },
  { to: "/app/company", label: "Company", icon: Building2 },
  { to: "/app/contact", label: "Contact", icon: Phone },
  { to: "/app/sales", label: "Sales", icon: ShoppingCart },
  { to: "/app/tasks", label: "Tasks", icon: ListTodo },
  { to: "/app/calls", label: "Calls", icon: ListTodo },
] as const;

export default function Sidebar({ pinned, setPinned }: Props) {
  const location = useLocation();

  return (
    <aside
      className={[
        "group h-screen shrink-0 sticky top-0 flex flex-col",
        "bg-[#0f0e0e7f] text-white border-r border-white/10",
        pinned ? "w-[260px]" : "w-[84px] hover:w-[260px]",
        "transition-[width] duration-300 ease-out will-change-[width]",
      ].join(" ")}
    >
      {/* Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-xl bg-white/8 grid place-items-center shrink-0 overflow-hidden">
            <img src={icon} alt="Height" className="h-6 w-6" />
          </div>

          <div className="min-w-0 overflow-hidden">
            <div
              className={[
                "whitespace-nowrap font-extrabold tracking-tight",
                pinned
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0",
                "transition duration-300",
              ].join(" ")}
            >
              Height CRM
            </div>
          </div>
        </div>
      </div>

      {/* MENU label */}
      <div className="px-3 pt-6">
        <div
          className={[
            "px-2 text-xs font-extrabold tracking-widest text-white/60",
            pinned ? "opacity-100" : "opacity-0 group-hover:opacity-100",
            "transition duration-300",
          ].join(" ")}
        >
          MENU
        </div>

        <nav className="mt-4 space-y-2">
          {menu.map((m) => {
            const Icon = m.icon;

            // ✅ custom active: /app/sales va /app/sales/... ham active
            const isCustomActive =
              location.pathname === m.to || location.pathname.startsWith(m.to + "/");

            return (
              <NavLink key={m.to} to={m.to} className="block">
                <div
                  className={[
                    "relative flex items-center gap-3 h-11 px-3 rounded-xl",
                    "transition-all duration-300",
                    "hover:translate-x-0.5",
                    isCustomActive
                      ? "bg-linear-to-br from-black via-[#1a140b] to-[#ff9f1c]"
                      : "hover:bg-white/8",
                  ].join(" ")}
                >
                  {/* left active indicator */}
                  <div
                    className={[
                      "absolute left-0 top-1/2 -translate-y-1/2",
                      "h-7 w-1.5 rounded-full",
                      "bg-linear-to-bl from-black via-[#1a140b] to-[#ff9f1c]",
                      "opacity-0",
                      isCustomActive ? "opacity-100" : "",
                    ].join(" ")}
                  />

                  {/* icon box */}
                  <div
                    className={[
                      "relative h-9 w-9 rounded-xl grid place-items-center shrink-0 overflow-hidden",
                      "transition-all duration-300",
                      isCustomActive
                        ? "bg-linear-to-br from-black via-[#1a140b] to-[#ff9f1c]"
                        : "bg-white/8",
                    ].join(" ")}
                  >
                    {/* glow blur (active) */}
                    <div
                      className={[
                        "pointer-events-none absolute inset-0 rounded-xl blur-xl",
                        "opacity-0",
                        isCustomActive ? "opacity-100" : "",
                        "bg-linear-to-br from-black via-[#1a140b] to-[#ff9f1c]",
                      ].join(" ")}
                    />
                    <Icon
                      className={[
                        "relative h-[18px] w-[18px] transition-colors duration-300",
                        isCustomActive ? "text-white" : "text-white/90",
                      ].join(" ")}
                    />
                  </div>

                  {/* label */}
                  <div className="min-w-0 overflow-hidden">
                    <span
                      className={[
                        "whitespace-nowrap font-semibold text-[14px] inline-block transition duration-300",
                        isCustomActive ? "text-white" : "text-white/90",
                        pinned
                          ? "opacity-100 translate-x-0"
                          : "opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0",
                      ].join(" ")}
                    >
                      {m.label}
                    </span>
                  </div>
                </div>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
