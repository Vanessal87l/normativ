import { useMemo, useState } from "react"
import type { CreateStockPayload, StockItemType, StockStatus } from "../../api/types"
import { cx } from "../../warehouse/shared/utils/cx"


type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (payload: CreateStockPayload) => Promise<void> | void
}

const inputBase = "rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none w-full"

export default function AddStockItemModal({ open, onClose, onSubmit }: Props) {
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [type, setType] = useState<StockItemType>("FINISHED")
  const [unit, setUnit] = useState("dona")
  const [qty, setQty] = useState<number>(0)
  const [cost, setCost] = useState<number>(0)
  const [status, setStatus] = useState<StockStatus>("IN_STOCK")
  const [category, setCategory] = useState("")

  const canSave = useMemo(() => {
    if (!name.trim()) return false
    if (!unit.trim()) return false
    if (!Number.isFinite(qty) || qty < 0) return false
    if (!Number.isFinite(cost) || cost < 0) return false
    return true
  }, [name, unit, qty, cost])

  async function handleSave() {
    setErr(null)

    if (!name.trim()) return setErr("Mahsulot nomi bo‘sh bo‘lmasin.")
    if (!unit.trim()) return setErr("Birlik bo‘sh bo‘lmasin.")
    if (!Number.isFinite(qty) || qty < 0) return setErr("Qoldiq 0 dan kichik bo‘lmasin.")
    if (!Number.isFinite(cost) || cost < 0) return setErr("Narx 0 dan kichik bo‘lmasin.")

    try {
      setSaving(true)
      await onSubmit({
        name: name.trim(),
        type,
        unit: unit.trim(),
        qtyOnHand: Number(qty),
        lastUnitCost: Number(cost),
        status,
        category: category.trim() || undefined,
      })
      onClose()

      // reset
      setName("")
      setType("FINISHED")
      setUnit("dona")
      setQty(0)
      setCost(0)
      setStatus("IN_STOCK")
      setCategory("")
    } catch (e: any) {
      setErr(e?.message || "Saqlashda xatolik")
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-sm font-extrabold text-slate-900">Mahsulot qo‘shish</div>
            <div className="text-xs text-slate-500">Omborga yangi mahsulot kiritish</div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        <div className="p-5 grid gap-3">
          {err && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
              {err}
            </div>
          )}

          <label className="grid gap-1">
            <span className="text-xs font-extrabold text-slate-700">Nomi *</span>
            <input
              className={inputBase}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masalan: Granula, Paket..."
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="grid gap-1">
              <span className="text-xs font-extrabold text-slate-700">Turi</span>
              <select className={inputBase} value={type} onChange={(e) => setType(e.target.value as StockItemType)}>
                <option value="RAW">Xom ashyo</option>
                <option value="FINISHED">Tayyor mahsulot</option>
              </select>
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-extrabold text-slate-700">Birlik *</span>
              <input className={inputBase} value={unit} onChange={(e) => setUnit(e.target.value)} />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="grid gap-1">
              <span className="text-xs font-extrabold text-slate-700">Qoldiq</span>
              <input
                className={inputBase}
                type="number"
                min={0}
                step={1}
                value={String(qty)}
                onChange={(e) => setQty(Number(e.target.value))}
              />
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-extrabold text-slate-700">Oxirgi narx (1 birlik)</span>
              <input
                className={inputBase}
                type="number"
                min={0}
                step={0.01}
                value={String(cost)}
                onChange={(e) => setCost(Number(e.target.value))}
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="grid gap-1">
              <span className="text-xs font-extrabold text-slate-700">Holat</span>
              <select className={inputBase} value={status} onChange={(e) => setStatus(e.target.value as StockStatus)}>
                <option value="IN_STOCK">Bor</option>
                <option value="LOW_STOCK">Kam qoldi</option>
                <option value="OUT_OF_STOCK">Tugagan</option>
                <option value="DISCONTINUED">To‘xtatilgan</option>
              </select>
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-extrabold text-slate-700">Kategoriya (ixtiyoriy)</span>
              <input
                className={inputBase}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Masalan: Packaging"
              />
            </label>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Bekor qilish
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !canSave}
            className={cx(
              "rounded-xl px-4 py-2 text-xs font-extrabold transition",
              "bg-slate-900 text-white hover:opacity-95",
              "disabled:opacity-50"
            )}
          >
            {saving ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </div>
      </div>
    </div>
  )
}
