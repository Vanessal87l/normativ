import Portal from "@/pages/documents/components/Portal"
import React from "react"

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (line: { reason: string; qty: number }) => void
}

export default function ProductionWasteDialog({ open, onClose, onSubmit }: Props) {
  const [reason, setReason] = React.useState("")
  const [qty, setQty] = React.useState<number>(1)

  React.useEffect(() => {
    if (!open) return
    setReason("")
    setQty(1)
  }, [open])

  React.useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, onClose])

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
    if (!reason.trim()) return alert("Sabab kiriting")
    if (!qty || qty <= 0) return alert("Miqdor 0 dan katta bo‘lsin")
    onSubmit({ reason: reason.trim(), qty: Number(qty) })
  }

  return (
    <Portal>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <button className="absolute inset-0 bg-black/35" onClick={onClose} aria-label="close" />

        <div className="relative w-full max-w-[520px] overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-[0_28px_80px_rgba(2,6,23,0.35)]">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <div className="text-base font-semibold text-slate-900">Brak / Yo‘qotish</div>
              <div className="text-xs text-slate-500">Demo: statistikaga yoziladi</div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={submit} className="rounded-2xl px-4 py-2 text-sm font-semibold bg-slate-900 text-white hover:opacity-95">
                Qo‘shish
              </button>
              <button onClick={onClose} className="rounded-2xl px-4 py-2 text-sm border border-slate-200 hover:bg-slate-50">
                Yopish
              </button>
            </div>
          </div>

          <div className="p-5 grid grid-cols-1 gap-3">
            <div>
              <div className="text-xs text-slate-500 mb-1">Sabab</div>
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="Masalan: Brak (tikuv)"
              />
            </div>

            <div>
              <div className="text-xs text-slate-500 mb-1">Miqdor</div>
              <input
                type="number"
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                min={0}
              />
            </div>
          </div>
        </div>
      </div>
    </Portal>
  )
}
