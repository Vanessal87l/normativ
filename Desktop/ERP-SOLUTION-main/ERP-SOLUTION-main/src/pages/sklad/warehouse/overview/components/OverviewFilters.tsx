import { useMemo, useState } from "react"
import { todayISO } from "../../shared/utils/date"

export type OverviewFilter = {
  range: "today" | "week" | "month"
  date: string
}

type Props = {
  onApply: (f: OverviewFilter) => void
}

const chipBase = "rounded-xl px-3 py-2 text-xs font-extrabold border transition"
const chipActive = "bg-slate-900 text-white border-slate-900"
const chipIdle = "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"

export default function OverviewFilters({ onApply }: Props) {
  const initDate = useMemo(() => todayISO(), [])
  const [range, setRange] = useState<OverviewFilter["range"]>("month")
  const [date, setDate] = useState(initDate)

  return (
    <div className="rounded-2xl bg-white/70 backdrop-blur border border-slate-200 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-600">Filtr:</span>

        <button
          type="button"
          onClick={() => setRange("today")}
          className={`${chipBase} ${range === "today" ? chipActive : chipIdle}`}
        >
          Bugun
        </button>

        <button
          type="button"
          onClick={() => setRange("week")}
          className={`${chipBase} ${range === "week" ? chipActive : chipIdle}`}
        >
          Hafta
        </button>

        <button
          type="button"
          onClick={() => setRange("month")}
          className={`${chipBase} ${range === "month" ? chipActive : chipIdle}`}
        >
          Oy
        </button>

        <div className="ml-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
          <span className="text-xs text-slate-500">📅</span>
          <input
            className="text-xs outline-none text-slate-700"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="flex-1" />

        <button
          type="button"
          onClick={() => onApply({ range, date })}
          className="rounded-xl bg-slate-900 text-white px-4 py-2 text-xs font-extrabold hover:opacity-95"
        >
          Qo‘llash
        </button>
      </div>
    </div>
  )
}
