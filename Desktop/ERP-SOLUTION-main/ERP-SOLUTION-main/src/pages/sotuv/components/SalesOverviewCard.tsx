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
    <div className="rounded-2xl glass border border-slate-200 p-4 ">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-md font-semibold text-white">{title}</h3>
          <div className="mt-1 text-xs text-gray-400">
            Tanlangan oraliq: <span className="font-bold text-white">{activeRange}</span>
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
                  ? "glass text-white"
                  : "glass text-gray-400 border-slate-200 ",
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
