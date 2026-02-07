// src/layouts/AppLayout.tsx
import { Outlet, NavLink, useLocation } from "react-router-dom";
import Sidebar from "../widgets/Sidebar/Sidebar";
import Topbar from "../widgets/TopBar/Topbar";

export default function AppLayout() {
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith("/dashboard");

  return (
    <div className="min-h-screen w-full bg-slate-100">
      <div className="mx-auto max-w-[1400px] px-4 py-4">
        <div className="flex gap-4">
          <Sidebar />

          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <Topbar />

            {isDashboardRoute && (
              <div className="rounded-2xl bg-white px-3 py-2 shadow-sm">
                <div className="flex flex-wrap gap-2">
                  <DashTab to="/dashboard">Dashboard</DashTab>
                  <DashTab to="/dashboard/sotuv">Sotuv dashboard</DashTab>
                  <DashTab to="/dashboard/sklad">Sklad dashboard</DashTab>
                  <DashTab to="/dashboard/qarzdorlik">Qarzdorlik</DashTab>
                </div>
              </div>
            )}

            <main className="glass min-w-0 overflow-hidden p-4 md:p-6">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashTab({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        [
          "rounded-xl px-4 py-2 text-sm font-medium transition",
          isActive
            ? "bg-slate-900 text-white"
            : "bg-slate-100 text-slate-700 hover:bg-slate-200",
        ].join(" ")
      }
    >
      {children}
    </NavLink>
  );
}
