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
    <div className="relative rounded-2xl glass border border-slate-200 p-4 ">
      <div className="absolute top-3 right-3 text-white text-lg">{icon}</div>

      <div className="text-xs font-semibold text-white">{title}</div>
      <div className={`mt-2 text-2xl font-extrabold ${toneClass}`}>{value}</div>
      <div className="mt-1 text-xs text-white">{sub}</div>
    </div>
  );
}
