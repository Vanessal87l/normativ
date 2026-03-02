import { NavLink, Outlet } from "react-router-dom"

function Tab(props: { to: string; children: string }) {
  return (
    <NavLink
      to={props.to}
      className={({ isActive }) =>
        `rounded-md px-3 py-2 text-sm border ${
          isActive
            ? "bg-gradient-to-b from-[#0D3B78] to-[#0A4D96] text-white border-[#0A4D96]"
            : "bg-gradient-to-b from-[#0D3B78] to-[#0A4D96] text-white/90 border-[#0A4D96] opacity-85 hover:opacity-100"
        }`
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
        <Tab to="/dashboard/purchases">Xaridlar</Tab>
        <Tab to="/dashboard/sklad/warehouse/write-offs">Spisaniya</Tab>
        <Tab to="/dashboard/sklad/warehouse/transfers">Peremesheniya</Tab>
        <Tab to="/dashboard/sklad/warehouse/inventories">Inventarizasiya</Tab>
        <Tab to="/dashboard/sklad/warehouse/balances">Ostatki</Tab>
        <Tab to="/dashboard/sklad/warehouse/warehouses">Skladi</Tab>
        <Tab to="/dashboard/catalog/products">Mahsulot katalogi</Tab>
      </div>
      <Outlet />
    </div>
  )
}
