// src/pages/Recipes/RecipesPage.tsx
import { useEffect, useState } from "react"
import { recipesApi, type RecipeListItem, type RecipePayload } from "./api/recipesApi"
import { productsApi, type Product } from "@/pages/catalog/api/ProductsApi" // agar bor bo‘lsa
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export default function RecipesPage() {
  const [rows, setRows] = useState<RecipeListItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [createOpen, setCreateOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<number>(0)
  const [version, setVersion] = useState("1")

  const [items, setItems] = useState<{ raw_material: number; qty_per_unit: string }[]>([
    { raw_material: 0, qty_per_unit: "1" }
  ])

  async function load() {
    setLoading(true)
    const { rows } = await recipesApi.list()
    setRows(rows)

    // product list yuklaymiz
    if (products.length === 0) {
      const { rows: productRows } = await productsApi.list()
      setProducts(productRows)
    }

    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function addRow() {
    setItems(prev => [...prev, { raw_material: 0, qty_per_unit: "1" }])
  }

  function updateItem(index: number, field: string, value: any) {
    setItems(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    )
  }

  async function createRecipe() {
    if (!selectedProduct) return

    setSaving(true)

    const payload: RecipePayload = {
      version: Number(version),
      items: items.map(i => ({
        raw_material: Number(i.raw_material),
        qty_per_unit: String(i.qty_per_unit),
      }))
    }

    await recipesApi.createForProduct(selectedProduct, payload)

    await load() // 🔥 MUHIM — listni yangilaymiz

    setCreateOpen(false)
    setSaving(false)
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between">
        <h2 className="text-xl font-semibold">Recipes</h2>

        <Button onClick={() => setCreateOpen(true)}>
          + Qo‘shish
        </Button>
      </div>

      <div className="rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Product</th>
              <th className="p-3">Version</th>
              <th className="p-3">Items</th>
              <th className="p-3">Active</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-6">Yuklanmoqda...</td></tr>
            ) : rows.map(r => (
              <tr key={r.id} className="border-b">
                <td className="p-3">{r.id}</td>
                <td className="p-3">{r.product_name}</td>
                <td className="p-3">{r.version}</td>
                <td className="p-3">{r.items_count}</td>
                <td className="p-3">{r.is_active ? "✅" : "❌"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CREATE DIALOG */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yangi Recipe</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">

            {/* Product select */}
            <select
              className="border rounded px-2 py-1 w-full"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(Number(e.target.value))}
            >
              <option value={0}>Product tanlang</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            {/* Version */}
            <Input
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="Version"
            />

            {/* Items */}
            {items.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Raw Material ID"
                  value={item.raw_material}
                  onChange={(e) =>
                    updateItem(index, "raw_material", Number(e.target.value))
                  }
                />
                <Input
                  placeholder="Qty"
                  value={item.qty_per_unit}
                  onChange={(e) =>
                    updateItem(index, "qty_per_unit", e.target.value)
                  }
                />
              </div>
            ))}

            <Button variant="outline" onClick={addRow}>
              + Material qo‘shish
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
