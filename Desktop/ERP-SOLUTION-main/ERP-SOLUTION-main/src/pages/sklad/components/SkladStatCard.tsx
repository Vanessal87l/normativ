import type { WarehouseStatItem } from "../sklad-api/types";


export default function SkladStatCard({
  title,
  value,
  sub,
  icon = "📦",
  tone = "neutral",
}: WarehouseStatItem) {
  const toneClass =
    tone === "success"
      ? "text-emerald-600"
      : tone === "danger"
        ? "text-red-600"
        : "text-slate-900";

  return (
    <div className="relative rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
      <div className="absolute top-3 right-3 text-slate-400 text-lg">{icon}</div>

      <div className="text-xs font-semibold text-slate-500">{title}</div>
      <div className={`mt-2 text-2xl font-extrabold ${toneClass}`}>{value}</div>
      <div className="mt-1 text-xs text-slate-500">{sub}</div>
    </div>
  );
}
