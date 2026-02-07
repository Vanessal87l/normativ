type Props = {
  title: string;
  value: number;
  unit?: string;
  deltaPercent?: number;
  tone?: "neutral" | "success" | "danger";
};

function money(v: number, unit = "$") {
  const fixed = Math.abs(v).toLocaleString();
  return `${unit}${fixed}`;
}

export default function DebtStatCard({
  title,
  value,
  unit = "$",
  deltaPercent,
  tone = "neutral",
}: Props) {
  const pill =
    tone === "success"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : tone === "danger"
      ? "bg-red-50 text-red-700 border-red-200"
      : "bg-slate-50 text-slate-700 border-slate-200";

  const arrow =
    typeof deltaPercent === "number" ? (deltaPercent >= 0 ? "▲" : "▼") : "";

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-semibold text-slate-700">{title}</div>
        <button className="h-8 w-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition">
          ↗
        </button>
      </div>

      <div className="mt-3 text-2xl font-extrabold text-slate-900">
        {money(value, unit)}
      </div>

      {typeof deltaPercent === "number" && (
        <div className="mt-2 inline-flex items-center gap-2">
          <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${pill}`}>
            {arrow} {Math.abs(deltaPercent).toFixed(1)}%
          </span>
          <span className="text-[11px] text-slate-500">o‘tgan oyga nisbatan</span>
        </div>
      )}
    </div>
  );
}
