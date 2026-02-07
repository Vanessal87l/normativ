import type { AlertItem } from "@/pages/sklad/api/types"

export default function CriticalAlertsCard({ items }: { items: AlertItem[] }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-extrabold text-slate-900">Muhim ogohlantirishlar</div>
        <div className="text-xs text-slate-500">⚠️</div>
      </div>

      <div className="mt-3 space-y-2">
        {items.length === 0 ? (
          <div className="text-xs text-slate-500">Hozircha ogohlantirish yo‘q.</div>
        ) : (
          items.map((a) => (
            <div
              key={String(a.id)}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
            >
              <div>
                <div className="text-xs font-bold text-slate-900">{a.name}</div>
                <div className="text-[11px] text-slate-500">
                  Qoldiq: <span className="font-bold">{a.leftQty}</span>
                </div>
              </div>

              <span
                className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full border ${
                  a.level === "critical"
                    ? "bg-red-100 text-red-700 border-red-200"
                    : "bg-orange-100 text-orange-700 border-orange-200"
                }`}
              >
                {a.level === "critical" ? "Juda kam" : "Kamaya boshladi"}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
