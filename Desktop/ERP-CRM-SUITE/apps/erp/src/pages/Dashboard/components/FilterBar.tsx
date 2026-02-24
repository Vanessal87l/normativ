// src/pages/Dashboard/components/FilterBar.tsx
import { useMemo, useState } from "react"
import type { DashboardFilter, FilterRange } from "../api/types"

type Props = {
  onApply: (f: DashboardFilter) => void
  leftSlot?: React.ReactNode
  rightSlot?: React.ReactNode
  initial?: DashboardFilter
}

function todayISO() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

function cx(...a: Array<string | false | undefined | null>) {
  return a.filter(Boolean).join(" ")
}

export default function FilterBar({ onApply, leftSlot, rightSlot, initial }: Props) {
  const init = useMemo<DashboardFilter>(
    () =>
      initial ?? {
        range: "month",
        date: todayISO(),
      },
    [initial]
  )

  const [range, setRange] = useState<FilterRange>(init.range ?? "month")
  const [date, setDate] = useState<string>(init.date ?? todayISO())

  const apply = () => onApply({ range, date })

  const Tab = ({ value, children }: { value: FilterRange; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={() => setRange(value)}
      className={cx(
        "h-9 rounded-lg px-3 text-xs font-extrabold border",
        range === value
          ? "bg-slate-900 border-slate-900 text-white"
          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
      )}
    >
      {children}
    </button>
  )

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          {!!leftSlot && <div className="flex items-center">{leftSlot}</div>}

          <div className="flex flex-wrap items-center gap-2">
            <div className="text-xs font-bold text-slate-600">Sana bo‘yicha filtrlash:</div>

            <Tab value="today">Bugun</Tab>
            <Tab value="week">Hafta</Tab>
            <Tab value="month">Oy</Tab>
            <Tab value="year">Yil</Tab>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {rightSlot}
          <button
            type="button"
            onClick={apply}
            className="h-9 rounded-lg bg-slate-900 px-4 text-xs font-extrabold text-white hover:bg-slate-800"
          >
            Filtrlarni qo‘llash
          </button>
        </div>
      </div>
    </div>
  )
}
