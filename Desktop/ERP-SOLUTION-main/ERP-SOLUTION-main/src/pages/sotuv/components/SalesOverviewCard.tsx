import LineChart from "./LineChart"
import type { ChartRange } from "../dashboard-api/types"

type Props = {
  title?: string
  series: { label: string; value: number }[]
  activeRange: ChartRange
  onRangeChange: (r: ChartRange) => void
}

export default function SalesOverviewCard({
  title = "Sotuv & Daromad ko‘rinishi",
  series,
  activeRange,
  onRangeChange,
}: Props) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900">{title}</h3>
          <div className="mt-1 text-xs text-slate-500">
            Tanlangan oraliq: <span className="font-bold text-slate-900">{activeRange}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {(["1W", "1M", "3M", "1Y"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onRangeChange(t)}
              className={[
                "rounded-lg px-2.5 py-1.5 text-xs font-bold border transition",
                activeRange === t
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50",
              ].join(" ")}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <LineChart data={series} />
      </div>
    </div>
  )
}
