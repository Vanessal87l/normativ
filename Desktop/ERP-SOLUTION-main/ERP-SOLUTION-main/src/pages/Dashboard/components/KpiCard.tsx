import type { Kpi } from "../api/types";

function cx(...a: Array<string | false | undefined | null>) {
  return a.filter(Boolean).join(" ");
}

export default function KpiCard({ kpi }: { kpi: Kpi }) {
  const tone =
    kpi.tone === "success"
      ? "text-emerald-600"
      : kpi.tone === "danger"
      ? "text-rose-600"
      : "text-white";

  const delta = typeof kpi.deltaPercent === "number" ? kpi.deltaPercent : null;
  const deltaTone =
    delta == null ? "text-white" : delta >= 0 ? "text-emerald-600" : "text-rose-600";

  return (
    <div className="relative rounded-2xl glass border border-slate-200 p-4 transition">
      <div className="absolute top-3 right-3 text-white text-lg">{kpi.icon ?? "📊"}</div>

      <div className="text-xs font-semibold text-white">{kpi.title}</div>

      <div className={cx("mt-2 text-2xl font-extrabold", tone)}>
        {kpi.value}
      </div>

      <div className="mt-1 text-xs text-white">{kpi.sub}</div>

      {delta != null && (
        <div className={cx("mt-3 inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-bold",
          "border-slate-200 glass", deltaTone
        )}>
          {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}%
          <span className="font-semibold text-white">o‘tgan davrga nisbatan</span>
        </div>
      )}
    </div>
  );
}
