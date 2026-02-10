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
const tabActive = "glass text-white border-slate-900";
const tabIdle = "glass text-white border-slate-200 hover:bg-slate-50";

export default function StockBarChartCard({
  title = "Ombor kirim/chiqim ko‘rinishi",
  range,
  onRangeChange,
  seriesIn,
  seriesOut,
}: Props) {
  return (
    <div className="rounded-2xl glass border border-slate-200 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-extrabold text-white">{title}</h3>
          <div className="mt-1 text-xs text-white">
            Tanlangan oraliq: <span className="font-bold text-white">{range}</span>
          </div>
          <div className="mt-1 text-[11px] text-white">
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
