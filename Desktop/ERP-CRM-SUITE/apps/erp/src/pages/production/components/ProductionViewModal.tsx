import React from "react"
import type { ProductionOrder, ProductionStatus } from "../types/production.types"
import { statusChipClass, statusLabel, workCenterLabel } from "../utils/production.utils"
import {
  addConsumption,
  addReceiveFinished,
  addWaste,
  setProductionStatus,
} from "../api/productionApi"
import ProductionConsumeDialog from "./ProductionConsumeDialog"
import ProductionReceiveDialog from "./ProductionReceiveDialog"
import ProductionWasteDialog from "./ProductionWasteDialog"
import ProductionCostCard from "./ProductionCostCard"
import Portal from "@/pages/documents/components/Portal"

type Props = {
  open: boolean
  order: ProductionOrder | null
  onClose: () => void
  onUpdated: (id: string) => void
}

export default function ProductionViewModal({ open, order, onClose, onUpdated }: Props) {
  const [consumeOpen, setConsumeOpen] = React.useState(false)
  const [receiveOpen, setReceiveOpen] = React.useState(false)
  const [wasteOpen, setWasteOpen] = React.useState(false)

  // ESC close + scroll lock
  React.useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKeyDown)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  const setStatus = async (s: ProductionStatus) => {
    if (!order) return
    await setProductionStatus(order.id, s)
    await onUpdated(order.id)
  }

  const doConsume = async (line: { name: string; uom: string; qty: number; unitCostUZS: number }) => {
    if (!order) return
    await addConsumption(order.id, line)
    setConsumeOpen(false)
    await onUpdated(order.id)
  }

  const doReceive = async (qty: number) => {
    if (!order) return
    await addReceiveFinished(order.id, qty)
    setReceiveOpen(false)
    await onUpdated(order.id)
  }

  const doWaste = async (line: { reason: string; qty: number }) => {
    if (!order) return
    await addWaste(order.id, line)
    setWasteOpen(false)
    await onUpdated(order.id)
  }

  return (
    <Portal>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <button className="absolute inset-0 bg-black/35" onClick={onClose} aria-label="close" />

        <div className="relative w-full max-w-[920px] max-h-[88vh] overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-[0_28px_80px_rgba(2,6,23,0.35)]">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between">
            <div>
              <div className="text-base font-semibold text-slate-900">Ishlab chiqarish buyurtmasi</div>
              <div className="text-xs text-slate-500">Ko‘rish / boshqarish</div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setConsumeOpen(true)}
                disabled={!order}
                className="rounded-2xl px-3 py-2 text-sm font-semibold border border-slate-200 hover:bg-slate-50 disabled:opacity-60"
              >
                Material sarfi
              </button>
              <button
                onClick={() => setReceiveOpen(true)}
                disabled={!order}
                className="rounded-2xl px-3 py-2 text-sm font-semibold border border-slate-200 hover:bg-slate-50 disabled:opacity-60"
              >
                Kirim
              </button>
              <button
                onClick={() => setWasteOpen(true)}
                disabled={!order}
                className="rounded-2xl px-3 py-2 text-sm font-semibold border border-slate-200 hover:bg-slate-50 disabled:opacity-60"
              >
                Brak
              </button>
              <button
                onClick={onClose}
                className="rounded-2xl px-3 py-2 text-sm font-semibold bg-slate-900 text-white hover:opacity-95"
              >
                Yopish
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="max-h-[calc(88vh-72px)] overflow-auto p-5 space-y-4">
            {!order ? (
              <div className="py-12 text-center text-slate-500">Buyurtma topilmadi</div>
            ) : (
              <>
                {/* Summary */}
                <div className="rounded-3xl border border-slate-200 bg-slate-50/50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm text-slate-500">{order.date}</div>
                      <div className="text-lg font-semibold text-slate-900">{order.code}</div>
                      <div className="text-sm text-slate-700">
                        {order.productName} • {order.quantity.toLocaleString()} dona
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        Sex: {workCenterLabel[order.workCenter]} • Qabul qilingan: {order.finishedReceivedQty.toLocaleString()}
                      </div>
                    </div>

                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusChipClass(order.status)}`}>
                      {statusLabel[order.status]}
                    </span>
                  </div>

                  {order.note ? <div className="mt-3 text-sm text-slate-700">{order.note}</div> : null}

                  {/* Status actions */}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button onClick={() => setStatus("DRAFT")} className="rounded-2xl px-3 py-1.5 text-xs font-semibold border border-slate-200 hover:bg-white">
                      Draft
                    </button>
                    <button onClick={() => setStatus("APPROVED")} className="rounded-2xl px-3 py-1.5 text-xs font-semibold border border-slate-200 hover:bg-white">
                      Tasdiqlash
                    </button>
                    <button onClick={() => setStatus("IN_PROGRESS")} className="rounded-2xl px-3 py-1.5 text-xs font-semibold border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100">
                      Boshlash
                    </button>
                    <button onClick={() => setStatus("PAUSED")} className="rounded-2xl px-3 py-1.5 text-xs font-semibold border border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100">
                      Pause
                    </button>
                    <button onClick={() => setStatus("COMPLETED")} className="rounded-2xl px-3 py-1.5 text-xs font-semibold border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100">
                      Yakunlash
                    </button>
                    <button onClick={() => setStatus("CANCELLED")} className="rounded-2xl px-3 py-1.5 text-xs font-semibold border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100">
                      Bekor
                    </button>
                  </div>
                </div>

                {/* Cost */}
                <ProductionCostCard order={order} />

                {/* Materials */}
                <div className="rounded-3xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Material sarfi</div>
                      <div className="text-xs text-slate-500">Demo ledger</div>
                    </div>
                    <button
                      onClick={() => setConsumeOpen(true)}
                      className="rounded-2xl px-3 py-2 text-xs font-semibold bg-slate-900 text-white hover:opacity-95"
                    >
                      + Qo‘shish
                    </button>
                  </div>

                  <div className="mt-3 overflow-auto">
                    <table className="w-full text-sm">
                      <thead className="text-slate-600">
                        <tr className="border-b border-slate-100">
                          <th className="text-left py-2">Material</th>
                          <th className="text-left py-2">UOM</th>
                          <th className="text-right py-2">Qty</th>
                          <th className="text-right py-2">Narx</th>
                          <th className="text-right py-2">Summa</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.materials.map((m) => (
                          <tr key={m.id} className="border-b border-slate-50">
                            <td className="py-2">{m.name}</td>
                            <td className="py-2 text-slate-600">{m.uom}</td>
                            <td className="py-2 text-right">{m.qty.toLocaleString()}</td>
                            <td className="py-2 text-right">{m.unitCostUZS.toLocaleString()}</td>
                            <td className="py-2 text-right font-semibold">
                              {(m.qty * m.unitCostUZS).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                        {order.materials.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-6 text-center text-slate-500">
                              Material sarfi yo‘q
                            </td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Waste */}
                <div className="rounded-3xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Brak / Yo‘qotish</div>
                      <div className="text-xs text-slate-500">Demo statistik</div>
                    </div>
                    <button
                      onClick={() => setWasteOpen(true)}
                      className="rounded-2xl px-3 py-2 text-xs font-semibold border border-slate-200 hover:bg-slate-50"
                    >
                      + Qo‘shish
                    </button>
                  </div>

                  <div className="mt-3">
                    {order.wastes.length === 0 ? (
                      <div className="text-sm text-slate-500">Brak yo‘q</div>
                    ) : (
                      <div className="space-y-2">
                        {order.wastes.map((w) => (
                          <div key={w.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 flex items-center justify-between">
                            <div className="text-sm text-slate-900">{w.reason}</div>
                            <div className="text-sm font-semibold text-slate-900">{w.qty.toLocaleString()}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Receive */}
                <div className="rounded-3xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Tayyor mahsulot kirimi</div>
                      <div className="text-xs text-slate-500">Qabul qilingan: {order.finishedReceivedQty.toLocaleString()}</div>
                    </div>
                    <button
                      onClick={() => setReceiveOpen(true)}
                      className="rounded-2xl px-3 py-2 text-xs font-semibold bg-slate-900 text-white hover:opacity-95"
                    >
                      + Kirim qilish
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Nested dialogs */}
        <ProductionConsumeDialog open={consumeOpen} onClose={() => setConsumeOpen(false)} onSubmit={doConsume} />
        <ProductionReceiveDialog open={receiveOpen} onClose={() => setReceiveOpen(false)} onSubmit={doReceive} />
        <ProductionWasteDialog open={wasteOpen} onClose={() => setWasteOpen(false)} onSubmit={doWaste} />
      </div>
    </Portal>
  )
}
