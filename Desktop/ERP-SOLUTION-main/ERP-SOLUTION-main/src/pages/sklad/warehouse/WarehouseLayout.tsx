import { Outlet, NavLink } from "react-router-dom"
import { cx } from "./shared/utils/cx"

export default function WarehouseLayout() {
  return (
    <div className="min-h-screen bg-[#e9eff2] rounded-2xl">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Ombor</h1>
            <p className="text-sm text-slate-500">
              Ombor bo‘limi: qoldiq, ogohlantirishlar va tezkor amallar
            </p>
          </div>

          <div className="flex items-center gap-2">
            <NavLink
              to="/dashboard/sklad/warehouse/overview"
              className={({ isActive }) =>
                cx(
                  "rounded-xl px-4 py-2 text-xs font-extrabold border transition",
                  isActive
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                )
              }
            >
              Umumiy ko‘rinish
            </NavLink>

            <NavLink
              to="/dashboard/sklad/warehouse/stock"
              className={({ isActive }) =>
                cx(
                  "rounded-xl px-4 py-2 text-xs font-extrabold border transition",
                  isActive
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                )
              }
            >
              Qoldiq (Stock)
            </NavLink>
          </div>
        </div>

        <div className="mt-4">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
