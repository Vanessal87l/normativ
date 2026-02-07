import type { StockItemType } from "../../api/types"
import { cx } from "../../warehouse/shared/utils/cx"


export default function StockTabs({
  value,
  onChange,
}: {
  value: StockItemType
  onChange: (v: StockItemType) => void
}) {
  return (
    <div className="inline-flex rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {(["RAW", "FINISHED"] as const).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={cx(
            "px-4 py-2 text-xs font-extrabold transition",
            value === t ? "bg-slate-900 text-white" : "bg-white text-slate-700 hover:bg-slate-50"
          )}
        >
          {t === "RAW" ? "Xom ashyo" : "Tayyor mahsulot"}
        </button>
      ))}
    </div>
  )
}
