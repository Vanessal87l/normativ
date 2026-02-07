import { useMemo, useState } from "react"
import type { DateRange, StockStatus } from "../../api/types"
import { dayAgoISO, todayISO } from "@/pages/sklad/warehouse/shared/utils/date"

export type StockFilterValue = {
  q: string
  status: StockStatus | "ALL"
  category: string | "ALL"
  lowOnly: boolean
  dateRange: DateRange
}

type Props = {
  categories: string[]
  value: StockFilterValue
  onApply: (v: StockFilterValue) => void
}

export default function StockFilters({ categories, value, onApply }: Props) {
  const init = useMemo(() => value, [value])
  const [q, setQ] = useState(init.q)
  const [status, setStatus] = useState(init.status)
  const [category, setCategory] = useState(init.category)
  const [lowOnly, setLowOnly] = useState(init.lowOnly)
  const [from, setFrom] = useState(init.dateRange.from)
  const [to, setTo] = useState(init.dateRange.to)

  return (
    <div className="rounded-2xl bg-white/70 backdrop-blur border border-slate-200 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Qidirish..."
          className="w-56 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none"
        >
          <option value="ALL">Status: Hammasi</option>
          <option value="IN_STOCK">Bor</option>
          <option value="LOW_STOCK">Kam qoldi</option>
          <option value="OUT_OF_STOCK">Tugagan</option>
          <option value="DISCONTINUED">To‘xtatilgan</option>
        </select>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as any)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none"
        >
          <option value="ALL">Kategoriya: Hammasi</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700">
          <input type="checkbox" checked={lowOnly} onChange={(e) => setLowOnly(e.target.checked)} />
          Faqat “Kam qoldi”
        </label>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs">
          <span className="text-slate-500">📅</span>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="outline-none" />
          <span className="text-slate-400">—</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="outline-none" />
        </div>

        <div className="flex-1" />

        <button
          type="button"
          onClick={() =>
            onApply({
              q,
              status,
              category,
              lowOnly,
              dateRange: { from, to },
            })
          }
          className="rounded-xl bg-slate-900 text-white px-4 py-2 text-xs font-extrabold hover:opacity-95"
        >
          Qo‘llash
        </button>

        <button
          type="button"
          onClick={() =>
            onApply({
              q: "",
              status: "ALL",
              category: "ALL",
              lowOnly: false,
              dateRange: { from: dayAgoISO(30), to: todayISO() },
            })
          }
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-50"
        >
          Tozalash
        </button>
      </div>
    </div>
  )
}
