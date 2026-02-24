import { NavLink, Outlet } from "react-router-dom"

function Tab(props: { to: string; children: string }) {
  return (
    <NavLink
      to={props.to}
      className={({ isActive }) =>
        `rounded-md px-3 py-2 text-sm border ${isActive ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-200"}`
      }
    >
      {props.children}
    </NavLink>
  )
}

export default function WarehouseLayout() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Tab to="/dashboard/sklad/warehouse/receipts">Prixod</Tab>
        <Tab to="/dashboard/sklad/warehouse/write-offs">Spisaniya</Tab>
        <Tab to="/dashboard/sklad/warehouse/transfers">Peremesheniya</Tab>
        <Tab to="/dashboard/sklad/warehouse/inventories">Inventarizasiya</Tab>
        <Tab to="/dashboard/sklad/warehouse/balances">Ostatki</Tab>
        <Tab to="/dashboard/sklad/warehouse/warehouses">Skladi</Tab>
      </div>
      <Outlet />
    </div>
  )
}
