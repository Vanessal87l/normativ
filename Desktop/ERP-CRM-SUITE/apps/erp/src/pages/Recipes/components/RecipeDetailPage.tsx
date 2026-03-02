import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { recipesApi, type RecipeDetail, type RecipePayload } from "@/pages/Recipes/api/recipesApi"
import { materialsApi, type Material } from "@/pages/Materials/api/materialsApi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function RecipeDetailPage() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { id } = useParams()
  const recipeId = Number(id)
  const recipesBasePath = pathname.startsWith("/dashboard/production/recipes")
    ? "/dashboard/production/recipes"
    : "/dashboard/catalog/recipes"

  const [recipe, setRecipe] = useState<RecipeDetail | null>(null)
  const [materials, setMaterials] = useState<Material[]>([])
  const [items, setItems] = useState<RecipeDetail["items"]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const data = await recipesApi.read(recipeId)
      setRecipe(data)
      setItems(data.items || [])

      const { rows } = await materialsApi.list({ page_size: 200 })
      setMaterials(rows)
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || "Xatolik")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (recipeId) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipeId])

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

  async function save() {
    if (!recipe) return
    if (recipe.is_active) return setError("Active recipe tahrirlanmaydi. Yangi versiya yarating.")

    const msg = validateItems()
    if (msg) return setError(msg)

    setSaving(true)
    setError(null)

    const payload: RecipePayload = {
      version: recipe.version,
      items: items.map((i) => ({
        raw_material: Number(i.raw_material),
        qty_per_unit: String(i.qty_per_unit),
      })),
    }

    try {
      await recipesApi.update(recipe.id, payload)
      await load()
    } catch (e: any) {
      setError(JSON.stringify(e?.response?.data ?? { detail: e?.message }))
    } finally {
      setSaving(false)
    }
  }

  async function activate() {
    if (!recipe) return
    try {
      await recipesApi.activate(recipe.id)
      await load()
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || "Activate xatolik")
    }
  }

  async function remove() {
    if (!recipe) return
    try {
      await recipesApi.remove(recipe.id)
      navigate(recipesBasePath)
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || "Delete xatolik")
    }
  }

  if (loading || !recipe) return <div className="p-6">Yuklanmoqda...</div>

  const readonly = recipe.is_active

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Recipe #{recipe.id} - Product ID: {recipe.product}</h2>

      <div className="rounded border p-3 text-sm">
        <div>Version: {recipe.version}</div>
        <div>Active: {recipe.is_active ? "Yes" : "No"}</div>
        <div>Cost: {recipe.unit_material_cost_display ?? "-"}</div>
        {(recipe.cost_warnings ?? []).length > 0 ? (
          <div className="mt-2">
            {(recipe.cost_warnings ?? []).map((w, i) => (
              <div key={i} className="text-amber-700">{w}</div>
            ))}
          </div>
        ) : null}
      </div>

      {error ? <div className="rounded border border-red-300 p-3 text-sm text-red-600">{error}</div> : null}

      <div className="rounded-xl border p-4 space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex gap-3 items-center">
            <select
              className="border rounded px-2 py-1"
              value={item.raw_material}
              onChange={(e) => updateItem(index, "raw_material", Number(e.target.value))}
              disabled={readonly}
            >
              <option value={0}>Material tanlang</option>
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>

            <Input
              className="w-[140px]"
              value={item.qty_per_unit}
              onChange={(e) => updateItem(index, "qty_per_unit", e.target.value)}
              placeholder="Qty"
              disabled={readonly}
            />

            <div className="text-xs text-muted-foreground min-w-[180px]">
              {item.line_material_cost_display ?? "-"}
            </div>

            <Button variant="destructive" size="sm" onClick={() => removeRow(index)} disabled={readonly}>
              O'chirish
            </Button>
          </div>
        ))}

        <Button variant="outline" onClick={addRow} disabled={readonly}>
          + Material qo'shish
        </Button>
      </div>

      <div className="flex gap-2">
        <Button onClick={save} disabled={saving || readonly}>
          {saving ? "Saqlanmoqda..." : "Saqlash"}
        </Button>
        {!recipe.is_active ? <Button onClick={activate}>Activate</Button> : null}
        <Button variant="destructive" onClick={remove}>Delete</Button>
      </div>
    </div>
  )
}
