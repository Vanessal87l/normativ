import { useMemo, useState } from "react"
import type { DashboardFilter, FilterRange } from "../dashboard-api/types"

type Props = {
  onApply?: (payload: DashboardFilter) => void
}

const chipBase = "rounded-md px-2.5 py-1 text-xs font-semibold border transition"
const chipActive = "glass  text-white "
const chipIdle = "glass text-gray-400  border-slate-200 "

function todayISO() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

export default function FilterBar({ onApply }: Props) {
  const [range, setRange] = useState<FilterRange>("month")

  const today = useMemo(() => todayISO(), [])
  const [date, setDate] = useState(today)

  return (
    <div className="flex flex-col gap-3 rounded-xl glass border border-slate-200 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-white">Sana bo‘yicha filtrlash:</span>

        <button
          type="button"
          className={`${chipBase} ${range === "today" ? chipActive : chipIdle}`}
          onClick={() => setRange("today")}
        >
          Bugun
        </button>

        <button
          type="button"
          className={`${chipBase} ${range === "week" ? chipActive : chipIdle}`}
          onClick={() => setRange("week")}
        >
          Hafta
        </button>

        <button
          type="button"
          className={`${chipBase} ${range === "month" ? chipActive : chipIdle}`}
          onClick={() => setRange("month")}
        >
          Oy
        </button>

        <div className="ml-2 flex items-center gap-2 rounded-md border border-slate-200 glass px-2 py-1">
          <span className="text-xs text-white">📅</span>
          <input
            className="text-xs outline-none text-white"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="flex-1" />

        <button
          type="button"
          onClick={() => onApply?.({ range, date })}
          className="rounded-md glass text-white px-3 py-2 text-xs font-semibold hover:opacity-95"
        >
          Filtrlarni qo‘llash
        </button>
      </div>
    </div>
  )
}
