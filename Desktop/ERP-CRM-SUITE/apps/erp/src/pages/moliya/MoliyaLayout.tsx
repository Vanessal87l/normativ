import { NavLink, Outlet } from "react-router-dom"

/**
 * ✅ MoliyaLayout
 * - Moliya ichida 3 ta tab:
 *   1) Ledger
 *   2) Kirim/Xarajat qo‘shish
 *   3) Xodimlar & Oylik
 *
 * ✅ Eslatma:
 * - /dashboard/moliya (index) -> MoliyaDashboardContent bo‘lishi mumkin
 * - Lekin bu layout ichida “Dashboard” tab chiqmaydi (tepada sidebar’da bor)
 */
export default function MoliyaLayout() {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-4 md:p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-lg font-extrabold text-slate-900">Moliya</div>
          {/* <div className="text-xs font-semibold text-slate-500">Ledger / Kirim-xarajat / Xodimlar</div> */}
        </div>

        <div className="flex flex-wrap gap-2 rounded-2xl bg-slate-50 border border-slate-200 p-2">
          <Tab to="/dashboard/moliya/ledger">O'tkazmalar</Tab>
          <Tab to="/dashboard/moliya/add-entry">Kirim/Xarajat qo‘shish</Tab>
          <Tab to="/dashboard/moliya/employees">Xodimlar & Oylik</Tab>
          <Tab to="/dashboard/moliya/debts">Qarzdorlik</Tab>
        </div>
      </div>

      <div className="mt-4">
        <Outlet />
      </div>
    </div>
  )
}

function Tab({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "px-4 py-2 rounded-xl text-sm font-bold transition",
          isActive
            ? "bg-slate-900 text-white"
            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100",
        ].join(" ")
      }
    >
      {children}
    </NavLink>
  )
}
