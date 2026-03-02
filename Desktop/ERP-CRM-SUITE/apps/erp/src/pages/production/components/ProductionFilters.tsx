import type { ProductionFilters } from "../types/production.types"
import { workCenterLabel } from "../utils/production.utils"

type Props = {
  value: ProductionFilters
  onChange: (v: ProductionFilters) => void
  onApply: () => void
  onReset: () => void
}

export default function ProductionFiltersPanel({ value, onChange, onApply, onReset }: Props) {
  return (
    <div className="rounded-3xl bg-white border border-slate-200 p-4 shadow-[0_18px_40px_rgba(2,6,23,0.08)]">
      <div className="text-sm font-semibold text-slate-900">Filtrlash</div>
      <div className="mt-3 grid grid-cols-1 md:grid-cols-6 gap-3">
        <div>
          <div className="text-xs text-slate-500 mb-1">Boshlanish</div>
          <input
            type="date"
            value={value.dateFrom ?? ""}
            onChange={(e) => onChange({ ...value, dateFrom: e.target.value || undefined })}
            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Tugash</div>
          <input
            type="date"
            value={value.dateTo ?? ""}
            onChange={(e) => onChange({ ...value, dateTo: e.target.value || undefined })}
            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <div className="text-xs text-slate-500 mb-1">Status</div>
          <select
            value={value.status}
            onChange={(e) => onChange({ ...value, status: e.target.value as any })}
            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white"
          >
            <option value="ALL">Barchasi</option>
            <option value="DRAFT">Draft</option>
            <option value="APPROVED">Tasdiqlangan</option>
            <option value="IN_PROGRESS">Jarayonda</option>
            <option value="PAUSED">To‘xtatilgan</option>
            <option value="COMPLETED">Yakunlangan</option>
            <option value="CANCELLED">Bekor</option>
          </select>
        </div>

        <div>
          <div className="text-xs text-slate-500 mb-1">Sex</div>
          <select
            value={value.workCenter}
            onChange={(e) => onChange({ ...value, workCenter: e.target.value as any })}
            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white"
          >
            <option value="ALL">Barchasi</option>
            <option value="CUTTING">{workCenterLabel.CUTTING}</option>
            <option value="SEWING">{workCenterLabel.SEWING}</option>
            <option value="PACKING">{workCenterLabel.PACKING}</option>
            <option value="OTHER">{workCenterLabel.OTHER}</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <div className="text-xs text-slate-500 mb-1">Qidiruv</div>
          <input
            value={value.q}
            onChange={(e) => onChange({ ...value, q: e.target.value })}
            placeholder="PO kodi, mahsulot nomi, izoh..."
            className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          onClick={onReset}
          className="rounded-2xl px-4 py-2 text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50"
        >
          Tozalash
        </button>
        <button
          onClick={onApply}
          className="rounded-2xl px-4 py-2 text-sm font-semibold bg-slate-900 text-white hover:opacity-95"
        >
          Qo‘llash
        </button>
      </div>
    </div>
  )
}
