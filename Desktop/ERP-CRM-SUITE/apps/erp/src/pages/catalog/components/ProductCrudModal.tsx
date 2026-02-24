import { useEffect, useMemo, useState } from "react"
import type { Currency, Product } from "../api/ProductsApi"
import { productsApi } from "../api/ProductsApi"
import { catalogApi } from "@/pages/Dashboard/api/catalogApi" // sizda bor
import type { CatalogCategory, CatalogUom } from "@/pages/Dashboard/api/catalogApi"

function cx(...a: Array<string | false | undefined | null>) {
  return a.filter(Boolean).join(" ")
}

type Mode = "view" | "edit" | "delete"

export default function ProductCrudModal({
  open,
  mode,
  current,
  onClose,
  onChanged,
}: {
  open: boolean
  mode: Mode
  current: Product | null
  onClose: () => void
  onChanged?: () => void
}) {
  const [ui, setUi] = useState<"idle" | "loading" | "ready">("idle")
  const [err, setErr] = useState<string | null>(null)

  const [categories, setCategories] = useState<CatalogCategory[]>([])
  const [uoms, setUoms] = useState<CatalogUom[]>([])

  const [name, setName] = useState("")
  const [categoryId, setCategoryId] = useState<number | "">("")
  const [uomId, setUomId] = useState<number | "">("")
  const [sellingPrice, setSellingPrice] = useState("")
  const [currency, setCurrency] = useState<Currency>("UZS")

  const readOnly = mode === "view" || mode === "delete"

  useEffect(() => {
    if (!open) return
    setErr(null)
    setUi("loading")

    let cancelled = false
      ; (async () => {
        try {
          const [cats, uu] = await Promise.all([catalogApi.listCategories(), catalogApi.listUoms()])
          if (cancelled) return
          setCategories(cats)
          setUoms(uu)
          setUi("ready")
        } catch (e: any) {
          if (cancelled) return
          setUi("ready")
          setErr(e?.message || "Dicts yuklashda xatolik (category/uom).")
        }
      })()

    return () => {
      cancelled = true
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    if (!current) return

    setName(current.name ?? "")
    setCategoryId(current.category ?? "")
    setUomId(current.uom ?? "")
    setSellingPrice(String(current.selling_price ?? ""))
    setCurrency((current.currency as Currency) || "UZS")
  }, [open, current])

  const canSave = useMemo(() => {
    if (readOnly) return false
    const p = Number(sellingPrice)
    return name.trim().length > 0 && uomId !== "" && Number.isFinite(p) && p >= 0
  }, [name, uomId, sellingPrice, readOnly])

  if (!open || !current) return null

  async function submit() {
    setErr(null)

    if (!current) return // ✅ TS xato yo‘qoladi

    if (mode === "delete") {
      try {
        setUi("loading")
        await productsApi.remove(current.id)
        onChanged?.()
        onClose()
      } catch (e: any) {
        setUi("ready")
        setErr(e?.message || "O‘chirishda xatolik")
      }
      return
    }

    if (mode === "edit") {
      const p = Number(sellingPrice)
      if (!name.trim()) return setErr("Nomi majburiy.")
      if (uomId === "") return setErr("UoM tanlanmagan.")
      if (!Number.isFinite(p) || p < 0) return setErr("Narx noto‘g‘ri.")

      try {
        setUi("loading")
        await productsApi.patch(current.id, {
          name: name.trim(),
          category: categoryId === "" ? null : Number(categoryId),
          uom: Number(uomId),
          selling_price: Math.trunc(p),
          currency,
        })
        onChanged?.()
        onClose()
      } catch (e: any) {
        setUi("ready")
        const data = e?.response?.data
        if (data?.uom?.[0]) return setErr(`UoM: ${data.uom[0]}`)
        if (data?.category?.[0]) return setErr(`Kategoriya: ${data.category[0]}`)
        setErr(e?.message || "Saqlashda xatolik")
      }
    }
  }


  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-[720px] rounded-2xl bg-white border border-slate-200 shadow-xl">
        <div className="p-5">
          <div className="text-lg font-extrabold text-slate-900">
            {mode === "view" ? "Mahsulotni ko‘rish" : mode === "edit" ? "Mahsulotni tahrirlash" : "Mahsulotni o‘chirish"}
          </div>

          {err && (
            <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{err}</div>
          )}

          {mode === "delete" ? (
            <div className="mt-4 text-sm text-slate-700">
              <b>{current.name}</b> mahsulotini o‘chirmoqchimisiz?
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-3">
              <Field label="Nomi *">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none"
                  disabled={readOnly || ui === "loading"}
                />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Kategoriya (ixtiyoriy)">
                  <select
                    value={categoryId === "" ? "" : String(categoryId)}
                    onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : "")}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none"
                    disabled={readOnly || ui === "loading"}
                  >
                    <option value="">Tanlanmagan</option>
                    {categories.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.name} (#{c.id})
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="UoM *">
                  <select
                    value={uomId === "" ? "" : String(uomId)}
                    onChange={(e) => setUomId(e.target.value ? Number(e.target.value) : "")}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none"
                    disabled={readOnly || ui === "loading"}
                  >
                    {uoms.length === 0 ? <option value="">(UoM topilmadi)</option> : null}
                    {uoms.map((u) => (
                      <option key={u.id} value={String(u.id)}>
                        {u.name} (#{u.id})
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Sotuv narxi">
                  <input
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none"
                    disabled={readOnly || ui === "loading"}
                  />
                </Field>

                <Field label="Valyuta">
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as any)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none"
                    disabled={readOnly || ui === "loading"}
                  >
                    <option value="UZS">UZS</option>
                    <option value="USD">USD</option>
                    <option value="RUB">RUB</option>
                  </select>
                </Field>
              </div>
            </div>
          )}

          <div className="mt-5 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 hover:bg-slate-50"
              disabled={ui === "loading"}
            >
              Yopish
            </button>

            {mode !== "view" && (
              <button
                type="button"
                onClick={submit}
                disabled={(mode === "edit" && !canSave) || ui === "loading"}
                className={cx(
                  "h-10 rounded-xl px-4 text-sm font-extrabold text-white disabled:opacity-60",
                  mode === "delete" ? "bg-rose-600 hover:bg-rose-700" : "bg-slate-900 hover:bg-slate-800"
                )}
              >
                {ui === "loading" ? "Kutilmoqda..." : mode === "delete" ? "O‘chirish" : "Saqlash"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-extrabold text-slate-600">{label}</div>
      <div className="mt-1">{children}</div>
    </div>
  )
}
