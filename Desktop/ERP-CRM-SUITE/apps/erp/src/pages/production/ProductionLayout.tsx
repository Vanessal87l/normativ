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

export default function ProductionLayout() {
  return (
    <div className="production-scope space-y-4">
      <div className="flex flex-wrap gap-2">
        <Tab to="/dashboard/production/orders">Ishlab chiqarish</Tab>
        <Tab to="/dashboard/production/materials">Xomashyo</Tab>
        <Tab to="/dashboard/production/recipes">Retseptlar</Tab>
      </div>
      <Outlet />
    </div>
  )
}
