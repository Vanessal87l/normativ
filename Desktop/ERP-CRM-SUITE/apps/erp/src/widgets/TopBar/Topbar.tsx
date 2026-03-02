import { Link } from "react-router-dom";
import { Search } from "lucide-react"
import { getUserName } from "@/shared/useMe";


/**
 * Topbar (1ga1)
 * - 1-qator: uzun gradient search pill + o'ngda iconlar
 * - 2-qator: pill tabs (hozircha kommentda)
 */

export default function Topbar() {
  const userName = getUserName();
  return (
    <header className="glass-strong px-4 py-3 rounded-3xl">
      {/* 1-qator */}
      <div className="flex items-center gap-3">
        {/* Search pill */}
        <div className="flex-1 min-w-0">
          <div className="rounded-3xl p-[2px] bg-slate-900/10 shadow-[0_12px_26px_rgba(51,79,157,0.30)]">
            <div className="relative rounded-3xl bg-white/70 backdrop-blur-xl border border-white/50">
              <input
                className={[
                  "w-full h-10 rounded-3xl",
                  "bg-transparent",
                  "pl-4 pr-10",
                  "outline-none",
                  "placeholder:text-slate-500 text-sm",
                ].join(" ")}
                placeholder="Qidiruv..."
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                <Search size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-2">
          <Link
            to="/profile"
            className="flex items-center gap-3 rounded-2xl px-2 py-1 hover:bg-slate-900/5"
          >
            <div className="h-9 w-9 rounded-2xl bg-slate-900/10 overflow-hidden" />
            <div className="leading-4 hidden sm:block">
              <div className="text-sm font-semibold">{userName}</div>
              <div className="text-xs text-slate-500">Admin</div>
            </div>
          </Link>
        </div>
      </div>

      {/* 2-qator: Tabs (NavLink) */}
      {/* hozircha keyin yoqasiz */}
    </header>
  );
}
