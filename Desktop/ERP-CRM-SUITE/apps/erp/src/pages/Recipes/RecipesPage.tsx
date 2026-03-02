import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { recipesApi, type RecipeListItem, type RecipePayload } from "./api/recipesApi"
import { productsApi, type Product } from "@/pages/catalog/api/ProductsApi"
import { materialsApi, type Material } from "@/pages/Materials/api/materialsApi"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Check, Eye, Trash2 } from "lucide-react"
import TableActionIconButton from "@/components/common/TableActionIconButton"

export default function RecipesPage() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [rows, setRows] = useState<RecipeListItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [createOpen, setCreateOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<number>(0)
  const [version, setVersion] = useState("")
  const [q, setQ] = useState("")
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all")

  const [items, setItems] = useState<{ raw_material: number; qty_per_unit: string }[]>([
    { raw_material: 0, qty_per_unit: "1.000000" },
  ])

  const duplicateIds = useMemo(() => {
    const seen = new Set<number>()
    const dup = new Set<number>()
    items.forEach((it) => {
      if (!it.raw_material) return
      if (seen.has(it.raw_material)) dup.add(it.raw_material)
      seen.add(it.raw_material)
    })
    return dup
  }, [items])

  const recipesBasePath = pathname.startsWith("/dashboard/production/recipes")
    ? "/dashboard/production/recipes"
    : "/dashboard/catalog/recipes"

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const { rows } = await recipesApi.list({
        q: q.trim() || undefined,
        is_active: activeFilter === "all" ? undefined : activeFilter === "active",
        ordering: "-created_at",
      })
      setRows(rows)

      if (products.length === 0) {
        const { rows: productRows } = await productsApi.list({ page_size: 200 })
        setProducts(productRows)
      }
      if (materials.length === 0) {
        const { rows: materialRows } = await materialsApi.list({ page_size: 200 })
        setMaterials(materialRows)
      }
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || "Xatolik")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter])

  useEffect(() => {
    const t = setTimeout(() => load(), 250)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  function addRow() {
    setItems((prev) => [...prev, { raw_material: 0, qty_per_unit: "1.000000" }])
  }

  function removeRow(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  function updateItem(index: number, field: string, value: any) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  function validateItems() {
    if (items.length === 0) return "Kamida 1 ta material kerak"
    for (const it of items) {
      if (!it.raw_material) return "Har bir qatorda material tanlang"
      const qty = Number(it.qty_per_unit)
      if (!Number.isFinite(qty) || qty <= 0) return "qty_per_unit 0 dan katta bo'lishi kerak"
    }
    if (duplicateIds.size > 0) return "Bir xil material 2 marta kiritilmasin"
    return null
  }

  async function createRecipe() {
    if (!selectedProduct) return setError("Product tanlang")

    const msg = validateItems()
    if (msg) return setError(msg)

    setSaving(true)
    setError(null)

    const payload: RecipePayload = {
      items: items.map((i) => ({
        raw_material: Number(i.raw_material),
        qty_per_unit: String(i.qty_per_unit),
      })),
    }
    if (version.trim()) payload.version = Number(version)

    try {
      await recipesApi.createForProduct(selectedProduct, payload)
      await load()
      setCreateOpen(false)
      setSelectedProduct(0)
      setVersion("")
      setItems([{ raw_material: 0, qty_per_unit: "1.000000" }])
    } catch (e: any) {
      setError(JSON.stringify(e?.response?.data ?? { detail: e?.message }))
    } finally {
      setSaving(false)
    }
  }

  async function activateRecipe(id: number) {
    try {
      await recipesApi.activate(id)
      await load()
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || "Activate xatolik")
    }
  }

  async function deleteRecipe(id: number) {
    try {
      await recipesApi.remove(id)
      await load()
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || "Delete xatolik")
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">Recipes</h2>
        <div className="flex gap-2">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="qidirish..." className="w-[220px]" />
          <select
            className="border rounded px-2 py-1"
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value as any)}
          >
            <option value="all">Hammasi</option>
            <option value="active">Faol</option>
            <option value="inactive">Nofaol</option>
          </select>
          <Button onClick={() => setCreateOpen(true)}>+ Qo'shish</Button>
        </div>
      </div>

      {error ? <div className="rounded border border-red-300 p-3 text-sm text-red-600">{error}</div> : null}

      <div className="rounded-xl border overflow-x-auto">
        <table className="w-full text-sm min-w-[980px]">
          <thead className="border-b bg-slate-50">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Product</th>
              <th className="p-3 text-left">Version</th>
              <th className="p-3 text-left">Items</th>
              <th className="p-3 text-left">Cost</th>
              <th className="p-3 text-left">Warnings</th>
              <th className="p-3 text-left">Active</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="p-6">Yuklanmoqda...</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6">Ma'lumot yo'q</td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="p-3">{r.id}</td>
                  <td className="p-3">{r.product_name}</td>
                  <td className="p-3">{r.version}</td>
                  <td className="p-3">{r.items_count}</td>
                  <td className="p-3">{r.unit_material_cost_display ?? "-"}</td>
                  <td className="p-3">
                    {(r.cost_warnings ?? []).length > 0 ? (
                      <span className="rounded bg-amber-100 px-2 py-1 text-xs text-amber-800">
                        {(r.cost_warnings ?? []).length} warning
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="p-3">{r.is_active ? "Yes" : "No"}</td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <TableActionIconButton title="Ko'rish" onClick={() => navigate(`${recipesBasePath}/${r.id}`)}>
                        <Eye size={16} />
                      </TableActionIconButton>
                      {!r.is_active ? (
                        <TableActionIconButton title="Activate" onClick={() => activateRecipe(r.id)}>
                          <Check size={16} />
                        </TableActionIconButton>
                      ) : null}
                      <TableActionIconButton title="O'chirish" danger onClick={() => deleteRecipe(r.id)}>
                        <Trash2 size={16} />
                      </TableActionIconButton>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yangi Recipe (draft)</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <select
              className="border rounded px-2 py-1 w-full"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(Number(e.target.value))}
            >
              <option value={0}>Product tanlang</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <Input value={version} onChange={(e) => setVersion(e.target.value)} placeholder="Version (ixtiyoriy)" />

            {items.map((item, index) => (
              <div key={index} className="flex gap-2 items-center">
                <select
                  className="border rounded px-2 py-1 flex-1"
                  value={item.raw_material}
                  onChange={(e) => updateItem(index, "raw_material", Number(e.target.value))}
                >
                  <option value={0}>Material tanlang</option>
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <Input
                  placeholder="Qty"
                  value={item.qty_per_unit}
                  onChange={(e) => updateItem(index, "qty_per_unit", e.target.value)}
                />
                <Button variant="destructive" size="sm" onClick={() => removeRow(index)}>
                  X
                </Button>
              </div>
            ))}

            <Button variant="outline" onClick={addRow}>
              + Material qo'shish
            </Button>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Bekor
            </Button>
            <Button onClick={createRecipe} disabled={saving}>
              {saving ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
