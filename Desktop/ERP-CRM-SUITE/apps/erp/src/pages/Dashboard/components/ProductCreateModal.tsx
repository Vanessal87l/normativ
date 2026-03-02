// src/pages/Dashboard/components/ProductCreateModal.tsx
import { useEffect, useMemo, useState } from "react"
import { catalogApi, type CatalogCategory, type CatalogUom } from "../api/catalogApi"

function cx(...a: Array<string | false | undefined | null>) {
  return a.filter(Boolean).join(" ")
}

export default function ProductCreateModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated?: () => void
}) {
  const [ui, setUi] = useState<"idle" | "loading" | "ready" | "error">("idle")
  const [err, setErr] = useState<string | null>(null)

  const [categories, setCategories] = useState<CatalogCategory[]>([])
  const [uoms, setUoms] = useState<CatalogUom[]>([])

  const [name, setName] = useState("")
  const [categoryId, setCategoryId] = useState<number | "">("")
  const [uomId, setUomId] = useState<number | "">("")
  const [sellingPrice, setSellingPrice] = useState("")
  const [currency, setCurrency] = useState<"UZS" | "USD" | "RUB">("UZS")

  useEffect(() => {
    if (!open) return
    setErr(null)
    setUi("idle")
  }, [open])

  const canSave = useMemo(() => {
    if (!name.trim()) return false
    if (uomId === "") return false
    if (!sellingPrice.trim()) return true
    const p = Number(sellingPrice)
    return Number.isFinite(p) && p >= 0
  }, [name, uomId, sellingPrice])

  useEffect(() => {
    if (!open) return

    let cancelled = false
    async function loadMeta() {
      try {
        setUi("loading")
        setErr(null)

        const [cats, uu] = await Promise.all([catalogApi.listCategories(), catalogApi.listUoms()])
        if (cancelled) return

        setCategories(cats)
        setUoms(uu)

        setCategoryId((prev) => (prev === "" && cats.length ? cats[0].id : prev))
        setUomId((prev) => (prev === "" && uu.length ? uu[0].id : prev))

        setUi("ready")
      } catch (e: any) {
        if (cancelled) return
        setUi("error")
        setErr(e?.message || "Category/UoM yuklashda xatolik")
      }
    }

    loadMeta()
    return () => {
      cancelled = true
    }
  }, [open])

  async function save() {
    setErr(null)

    if (!name.trim()) return setErr("Mahsulot nomi majburiy.")
    if (uoms.length === 0) return setErr("UoM topilmadi.")
    if (uomId === "") return setErr("O'lchov birligini tanlang.")

    const payload: any = {
      name: name.trim(),
      category: categoryId === "" ? null : Number(categoryId),
      uom: Number(uomId),
      currency,
    }

    if (sellingPrice.trim()) {
      const p = Number(sellingPrice)
      if (!Number.isFinite(p) || p < 0) return setErr("Narx noto'g'ri.")
      payload.selling_price = Math.trunc(p)
    }

    try {
      setUi("loading")
      await catalogApi.createProduct(payload)

      onCreated?.()
      onClose()

      setName("")
      setCategoryId("")
      setUomId("")
      setSellingPrice("")
      setCurrency("UZS")
      setErr(null)
      setUi("idle")
    } catch (e: any) {
      setUi("ready")
      setErr(e?.message || "Saqlashda xatolik")
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-[620px] rounded-2xl bg-white border border-slate-200 shadow-xl">
        <div className="p-5">
          <div className="text-lg font-extrabold text-slate-900">Mahsulot qo'shish</div>

          {err && (
            <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{err}</div>
          )}

          <div className="mt-4 grid grid-cols-1 gap-3">
            <Field label="Nomi *">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masalan: Piyola"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none"
                disabled={ui === "loading"}
              />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Kategoriya (ixtiyoriy)">
                <select
                  value={categoryId === "" ? "" : String(categoryId)}
                  onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : "")}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none"
                  disabled={ui === "loading"}
                >
                  <option value="">Tanlanmagan</option>
                  {categories.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.name} (#{c.id})
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="O'lchov birligi (UoM) *">
                <select
                  value={uomId === "" ? "" : String(uomId)}
                  onChange={(e) => setUomId(e.target.value ? Number(e.target.value) : "")}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none"
                  disabled={ui === "loading"}
                >
                  {uoms.length === 0 ? (
                    <option value="">(UoM topilmadi)</option>
                  ) : (
                    uoms.map((u) => (
                      <option key={u.id} value={String(u.id)}>
                        {u.name} (#{u.id})
                      </option>
                    ))
                  )}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Sotuv narxi (ixtiyoriy)">
                <input
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  placeholder="19000"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none"
                  disabled={ui === "loading"}
                />
              </Field>

              <Field label="Valyuta">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as any)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none"
                  disabled={ui === "loading"}
                >
                  <option value="UZS">UZS</option>
                  <option value="USD">USD</option>
                  <option value="RUB">RUB</option>
                </select>
              </Field>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 hover:bg-slate-50"
              disabled={ui === "loading"}
            >
              Bekor qilish
            </button>

            <button
              type="button"
              onClick={save}
              disabled={!canSave || ui === "loading" || uoms.length === 0}
              className={cx(
                "h-10 rounded-xl px-4 text-sm font-extrabold text-white disabled:opacity-60",
                "bg-slate-900 hover:bg-slate-800"
              )}
            >
              {ui === "loading" ? "Saqlanmoqda..." : "Saqlash"}
            </button>
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
