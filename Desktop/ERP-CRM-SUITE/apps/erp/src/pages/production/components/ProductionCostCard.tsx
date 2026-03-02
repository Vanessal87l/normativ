import type { ProductionOrder } from "../types/production.types"

function sum(n: number[]) {
  return n.reduce((a, b) => a + b, 0)
}

export default function ProductionCostCard({ order }: { order: ProductionOrder }) {
  const materialCost = sum(order.materials.map((m) => m.qty * m.unitCostUZS))
  const wasteQty = sum(order.wastes.map((w) => w.qty))
  const effectiveQty = Math.max(0, order.quantity - wasteQty)

  // Demo qo‘shimcha xarajatlar (foiz)
  const overhead = Math.round(materialCost * 0.08) // 8%
  const totalCost = materialCost + overhead

  const unitCost = effectiveQty > 0 ? Math.round(totalCost / effectiveQty) : 0

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-900">Tannarx (demo)</div>
          <div className="text-xs text-slate-500">Material + overhead (8%) / (qty - brak)</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500">Unit tannarx</div>
          <div className="text-lg font-extrabold text-slate-900">{unitCost.toLocaleString()} UZS</div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3">
          <div className="text-xs text-slate-500">Material cost</div>
          <div className="font-semibold text-slate-900">{materialCost.toLocaleString()} UZS</div>
        </div>
        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3">
          <div className="text-xs text-slate-500">Overhead (8%)</div>
          <div className="font-semibold text-slate-900">{overhead.toLocaleString()} UZS</div>
        </div>
        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3">
          <div className="text-xs text-slate-500">Brak (qty)</div>
          <div className="font-semibold text-slate-900">{wasteQty.toLocaleString()}</div>
        </div>
        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3">
          <div className="text-xs text-slate-500">Effective qty</div>
          <div className="font-semibold text-slate-900">{effectiveQty.toLocaleString()}</div>
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-slate-200 p-3">
        <div className="text-xs text-slate-500">Total cost</div>
        <div className="text-base font-bold text-slate-900">{totalCost.toLocaleString()} UZS</div>
      </div>
    </div>
  )
}
