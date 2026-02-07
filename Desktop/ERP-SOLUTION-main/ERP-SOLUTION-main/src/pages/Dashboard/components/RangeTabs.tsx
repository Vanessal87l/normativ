import type { ChartRange } from "../api/types";

export default function RangeTabs({
  value,
  onChange,
}: {
  value: ChartRange;
  onChange: (r: ChartRange) => void;
}) {
  const tabBase = "rounded-md px-2 py-1 text-[10px] font-bold border transition";
  const tabActive = "bg-slate-900 text-white border-slate-900";
  const tabIdle = "bg-white text-slate-600 border-slate-200 hover:bg-slate-50";

  return (
    <div className="flex items-center gap-1">
      {(["1W", "1M", "3M", "1Y"] as const).map((t) => (
        <button
          key={t}
          type="button"
          className={`${tabBase} ${value === t ? tabActive : tabIdle}`}
          onClick={() => onChange(t)}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
