import { Outlet } from "react-router-dom"
import { useState } from "react"
import Sidebar from "./Sidebar"
import Topbar from "./Topbar"

export default function AppShell() {
  const [pinned, setPinned] = useState(true)

  return (
    <div className="min-h-screen">
      <div className="flex min-h-screen">
        <Sidebar pinned={pinned} setPinned={setPinned} />

        <div className="flex-1 min-w-0 flex flex-col">
          <div className="px-6 pt-6">
            <Topbar pinned={pinned} setPinned={setPinned} />
          </div>

          {/* ✅ faqat Y scroll, X yopiq */}
          <main className="flex-1 min-h-0 min-w-0 px-6 pb-2 pt-6 overflow-y-auto overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
