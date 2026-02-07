import type { ChartRange, ChartPoint } from "../sklad-api/types";
import StockBarChart from "./StockBarChart";

type Props = {
  title?: string;
  range: ChartRange;
  onRangeChange?: (r: ChartRange) => void;
  seriesIn: ChartPoint[];
  seriesOut: ChartPoint[];
};

const tabBase = "rounded-lg px-2.5 py-1.5 text-xs font-bold border transition";
const tabActive = "bg-slate-900 text-white border-slate-900";
const tabIdle = "bg-white text-slate-600 border-slate-200 hover:bg-slate-50";

export default function StockBarChartCard({
  title = "Ombor kirim/chiqim ko‘rinishi",
  range,
  onRangeChange,
  seriesIn,
  seriesOut,
}: Props) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900">{title}</h3>
          <div className="mt-1 text-xs text-slate-500">
            Tanlangan oraliq: <span className="font-bold text-slate-900">{range}</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Qora: Kirim, Kulrang: Chiqim
          </div>
        </div>

        <div className="flex items-center gap-1">
          {(["1W", "1M", "3M", "1Y"] as const).map((t) => (
            <button
              key={t}
              type="button"
              className={`${tabBase} ${range === t ? tabActive : tabIdle}`}
              onClick={() => onRangeChange?.(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <StockBarChart seriesIn={seriesIn} seriesOut={seriesOut} />
      </div>
    </div>
  );
}
