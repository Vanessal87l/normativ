import React from "react"
import type { ProductionOrder, WorkCenter, ProductionStatus } from "../types/production.types"
import { workCenterLabel } from "../utils/production.utils"
import Portal from "@/pages/documents/components/Portal"

type Form = {
  date: string
  code: string
  productName: string
  quantity: number
  workCenter: WorkCenter
  status: ProductionStatus
  note: string
}

type Props = {
  open: boolean
  mode: "create" | "edit"
  initial?: ProductionOrder | null
  onClose: () => void
  onSubmit: (data: any) => void
}

export default function ProductionOrderDialog({ open, mode, initial, onClose, onSubmit }: Props) {
  const [form, setForm] = React.useState<Form>(() => ({
    date: new Date().toISOString().slice(0, 10),
    code: "",
    productName: "",
    quantity: 1,
    workCenter: "SEWING",
    status: "DRAFT",
    note: "",
  }))

  React.useEffect(() => {
    if (!open) return
    if (mode === "edit" && initial) {
      setForm({
        date: initial.date,
        code: initial.code,
        productName: initial.productName,
        quantity: Number(initial.quantity || 0),
        workCenter: initial.workCenter,
        status: initial.status,
        note: initial.note ?? "",
      })
    } else {
      setForm({
        date: new Date().toISOString().slice(0, 10),
        code: `PO-${String(Math.floor(Math.random() * 90000) + 10000)}`,
        productName: "",
        quantity: 1,
        workCenter: "SEWING",
        status: "DRAFT",
        note: "",
      })
    }
  }, [open, mode, initial])

  // ESC close
  React.useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, onClose])

  // body scroll lock
  React.useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  const submit = () => {
    if (!form.code.trim()) return alert("Kod kiriting")
    if (!form.productName.trim()) return alert("Mahsulot nomini kiriting")
    if (!form.quantity || form.quantity <= 0) return alert("Miqdor 0 dan katta bo‘lsin")

    onSubmit({
      date: form.date,
      code: form.code.trim(),
      productName: form.productName.trim(),
      quantity: Number(form.quantity),
      workCenter: form.workCenter,
      status: form.status,
      note: form.note,
    })
  }

  return (
    <Portal>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <button aria-label="close" className="absolute inset-0 bg-black/35" onClick={onClose} />

        <div className="relative w-full max-w-[680px] overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-[0_28px_80px_rgba(2,6,23,0.35)]">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <div className="text-base font-semibold text-slate-900">
                {mode === "create" ? "Yangi ishlab chiqarish buyurtmasi" : "Buyurtmani tahrirlash"}
              </div>
              <div className="text-xs text-slate-500">PO / sex / status / izoh</div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={submit}
                className="rounded-2xl px-4 py-2 text-sm font-semibold bg-slate-900 text-white hover:opacity-95"
              >
                Saqlash
              </button>
              <button
                onClick={onClose}
                className="rounded-2xl px-4 py-2 text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50"
              >
                Yopish
              </button>
            </div>
          </div>

          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-slate-500 mb-1">Sana</div>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <div className="text-xs text-slate-500 mb-1">Kod</div>
              <input
                value={form.code}
                onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="PO-00001"
              />
            </div>

            <div className="md:col-span-2">
              <div className="text-xs text-slate-500 mb-1">Mahsulot nomi</div>
              <input
                value={form.productName}
                onChange={(e) => setForm((p) => ({ ...p, productName: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="Masalan: Futbolka (Premium)"
              />
            </div>

            <div>
              <div className="text-xs text-slate-500 mb-1">Miqdor</div>
              <input
                type="number"
                value={form.quantity}
                onChange={(e) => setForm((p) => ({ ...p, quantity: Number(e.target.value) }))}
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                min={0}
              />
            </div>

            <div>
              <div className="text-xs text-slate-500 mb-1">Sex</div>
              <select
                value={form.workCenter}
                onChange={(e) => setForm((p) => ({ ...p, workCenter: e.target.value as WorkCenter }))}
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white"
              >
                <option value="CUTTING">{workCenterLabel.CUTTING}</option>
                <option value="SEWING">{workCenterLabel.SEWING}</option>
                <option value="PACKING">{workCenterLabel.PACKING}</option>
                <option value="OTHER">{workCenterLabel.OTHER}</option>
              </select>
            </div>

            <div>
              <div className="text-xs text-slate-500 mb-1">Status</div>
              <select
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as ProductionStatus }))}
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white"
              >
                <option value="DRAFT">Draft</option>
                <option value="APPROVED">Tasdiqlangan</option>
                <option value="IN_PROGRESS">Jarayonda</option>
                <option value="PAUSED">To‘xtatilgan</option>
                <option value="COMPLETED">Yakunlangan</option>
                <option value="CANCELLED">Bekor</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <div className="text-xs text-slate-500 mb-1">Izoh</div>
              <textarea
                value={form.note}
                onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm min-h-[90px]"
                placeholder="Qo‘shimcha izoh..."
              />
            </div>
          </div>
        </div>
      </div>
    </Portal>
  )
}
