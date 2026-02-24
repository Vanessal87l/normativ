// src/pages/Recipes/RecipeDetailPage.tsx
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { recipesApi, type RecipeDetail, type RecipePayload } from "@/pages/Recipes/api/recipesApi"
import { materialsApi, type Material } from "@/pages/Materials/api/materialsApi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function RecipeDetailPage() {
  const { id } = useParams()
  const recipeId = Number(id)

  const [recipe, setRecipe] = useState<RecipeDetail | null>(null)
  const [materials, setMaterials] = useState<Material[]>([])
  const [items, setItems] = useState<RecipeDetail["items"]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const data = await recipesApi.read(recipeId)
    setRecipe(data)
    setItems(data.items || [])

    const { rows } = await materialsApi.list()
    setMaterials(rows)

    setLoading(false)
  }

  useEffect(() => {
    if (recipeId) load()
  }, [recipeId])

  function addRow() {
    setItems(prev => [
      ...prev,
      { raw_material: 0, qty_per_unit: "1" }
    ])
  }

  function removeRow(index: number) {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  function updateItem(index: number, field: string, value: any) {
    setItems(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    )
  }

  async function save() {
    if (!recipe) return

    setSaving(true)

    const payload: RecipePayload = {
      version: recipe.version,
      items: items.map(i => ({
        raw_material: Number(i.raw_material),
        qty_per_unit: String(i.qty_per_unit),
      }))
    }

    await recipesApi.update(recipe.id, payload)
    await load()

    setSaving(false)
  }

  if (loading || !recipe) return <div className="p-6">Yuklanmoqda...</div>

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">
        Recipe #{recipe.id} — Product ID: {recipe.product}
      </h2>

      <div className="rounded-xl border p-4 space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex gap-3 items-center">

            {/* Raw Material Select */}
            <select
              className="border rounded px-2 py-1"
              value={item.raw_material}
              onChange={(e) =>
                updateItem(index, "raw_material", Number(e.target.value))
              }
            >
              <option value={0}>Material tanlang</option>
              {materials.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>

            {/* Qty */}
            <Input
              className="w-[120px]"
              value={item.qty_per_unit}
              onChange={(e) =>
                updateItem(index, "qty_per_unit", e.target.value)
              }
              placeholder="Qty"
            />

            <Button
              variant="destructive"
              size="sm"
              onClick={() => removeRow(index)}
            >
              O‘chirish
            </Button>
          </div>
        ))}

        <Button variant="outline" onClick={addRow}>
          + Material qo‘shish
        </Button>
      </div>

      <Button onClick={save} disabled={saving}>
        {saving ? "Saqlanmoqda..." : "Saqlash"}
      </Button>
    </div>
  )
}
