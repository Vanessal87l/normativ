import Portal from "@/pages/documents/components/Portal"
import React from "react"

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (line: { name: string; uom: string; qty: number; unitCostUZS: number }) => void
}

export default function ProductionConsumeDialog({ open, onClose, onSubmit }: Props) {
  const [name, setName] = React.useState("")
  const [uom, setUom] = React.useState("kg")
  const [qty, setQty] = React.useState<number>(1)
  const [unitCostUZS, setUnitCostUZS] = React.useState<number>(1000)

  React.useEffect(() => {
    if (!open) return
    setName("")
    setUom("kg")
    setQty(1)
    setUnitCostUZS(1000)
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
    if (!name.trim()) return alert("Material nomini kiriting")
    if (!qty || qty <= 0) return alert("Miqdor 0 dan katta bo‘lsin")
    if (!unitCostUZS || unitCostUZS < 0) return alert("Narx 0 dan kichik bo‘lmasin")
    onSubmit({ name: name.trim(), uom, qty: Number(qty), unitCostUZS: Number(unitCostUZS) })
  }

  return (
    <Portal>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <button className="absolute inset-0 bg-black/35" onClick={onClose} aria-label="close" />

        <div className="relative w-full max-w-[520px] overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-[0_28px_80px_rgba(2,6,23,0.35)]">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <div className="text-base font-semibold text-slate-900">Material sarfi</div>
              <div className="text-xs text-slate-500">Demo: ombordan minus sifatida</div>
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
              <div className="text-xs text-slate-500 mb-1">Material</div>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm" placeholder="Masalan: Mato (kulrang)" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="text-xs text-slate-500 mb-1">O‘lchov</div>
                <input value={uom} onChange={(e) => setUom(e.target.value)} className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm" placeholder="kg/m/dona" />
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Miqdor</div>
                <input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm" min={0} />
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Narx (UZS)</div>
                <input type="number" value={unitCostUZS} onChange={(e) => setUnitCostUZS(Number(e.target.value))} className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm" min={0} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  )
}
