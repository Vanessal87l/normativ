import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { PurchaseItem } from "../types"

type ItemDraft = { raw_material: string; qty: string; unit_price: string }

function fmtMoney(amount: number) {
  return new Intl.NumberFormat("ru-RU").format(amount || 0)
}

export default function PurchaseItemsTable({
  items,
  loading,
  currency,
  canEdit,
  onAdd,
  onPatch,
  onDelete,
}: {
  items: PurchaseItem[]
  loading: boolean
  currency?: string
  canEdit: boolean
  onAdd: (payload: { raw_material: number; qty: string; unit_price: number }) => void
  onPatch: (itemId: number, payload: { raw_material?: number; qty?: string; unit_price?: number }) => void
  onDelete: (itemId: number) => void
}) {
  const [create, setCreate] = useState<ItemDraft>({ raw_material: "", qty: "1.000000", unit_price: "0" })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [edit, setEdit] = useState<ItemDraft>({ raw_material: "", qty: "", unit_price: "" })

  const total = items.reduce((s, it) => s + (it.line_total || 0), 0)

  const submitCreate = () => {
    const rawMaterial = Number(create.raw_material)
    const unitPrice = Number(create.unit_price)
    if (!Number.isFinite(rawMaterial) || rawMaterial <= 0) return
    if (!Number.isFinite(unitPrice) || unitPrice < 0) return
    if (!create.qty.trim()) return
    onAdd({ raw_material: rawMaterial, qty: create.qty.trim(), unit_price: unitPrice })
    setCreate({ raw_material: "", qty: "1.000000", unit_price: "0" })
  }

  const startEdit = (row: PurchaseItem) => {
    setEditingId(row.id)
    setEdit({
      raw_material: row.raw_material ? String(row.raw_material) : "",
      qty: row.qty,
      unit_price: String(row.unit_price),
    })
  }

  const submitEdit = () => {
    if (!editingId) return
    const payload: { raw_material?: number; qty?: string; unit_price?: number } = {}
    if (edit.raw_material.trim()) {
      const rawMaterial = Number(edit.raw_material)
      if (Number.isFinite(rawMaterial) && rawMaterial > 0) payload.raw_material = rawMaterial
    }
    if (edit.qty.trim()) payload.qty = edit.qty.trim()
    if (edit.unit_price.trim()) {
      const unitPrice = Number(edit.unit_price)
      if (Number.isFinite(unitPrice) && unitPrice >= 0) payload.unit_price = unitPrice
    }
    onPatch(editingId, payload)
    setEditingId(null)
  }

  return (
    <div className="overflow-hidden">
      <div className="p-4 flex flex-col gap-3">
        <div className="text-sm font-semibold text-slate-900">Pozitsiyalar</div>
        <div className="text-xs text-slate-500">Valyuta: <span className="font-medium">{currency || "UZS"}</span></div>

        {canEdit && (
          <div className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200 p-3 md:grid-cols-5">
            <input
              className="h-9 rounded-md border px-2 text-sm"
              placeholder="Raw material ID"
              value={create.raw_material}
              onChange={(e) => setCreate((p) => ({ ...p, raw_material: e.target.value }))}
            />
            <input
              className="h-9 rounded-md border px-2 text-sm"
              placeholder="Qty (100.000000)"
              value={create.qty}
              onChange={(e) => setCreate((p) => ({ ...p, qty: e.target.value }))}
            />
            <input
              className="h-9 rounded-md border px-2 text-sm"
              placeholder="Unit price"
              value={create.unit_price}
              onChange={(e) => setCreate((p) => ({ ...p, unit_price: e.target.value }))}
            />
            <div className="md:col-span-2">
              <Button className="cursor-pointer rounded-xl" onClick={submitCreate}>
                + Item qo'shish
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="overflow-x-auto border-t border-slate-100">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:text-left [&>th]:font-medium">
              <th>#</th>
              <th>Raw material</th>
              <th className="text-right">Qty</th>
              <th className="text-right">Unit price</th>
              <th className="text-right">Line subtotal</th>
              <th className="text-right">Line total</th>
              {canEdit && <th className="text-right">Amallar</th>}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={canEdit ? 7 : 6} className="px-4 py-10 text-center text-slate-500">
                  Yuklanmoqda...
                </td>
              </tr>
            )}

            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={canEdit ? 7 : 6} className="px-4 py-12 text-center text-slate-500">
                  Pozitsiya yo'q
                </td>
              </tr>
            )}

            {!loading &&
              items.map((it, idx) => (
                <tr key={it.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-500">{idx + 1}</td>
                  <td className="px-4 py-3 text-slate-900 font-medium">{it.raw_material_name}</td>

                  {editingId === it.id ? (
                    <>
                      <td className="px-4 py-3 text-right">
                        <input
                          className="h-9 w-28 rounded-md border px-2 text-right text-sm"
                          value={edit.qty}
                          onChange={(e) => setEdit((p) => ({ ...p, qty: e.target.value }))}
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <input
                          className="h-9 w-28 rounded-md border px-2 text-right text-sm"
                          value={edit.unit_price}
                          onChange={(e) => setEdit((p) => ({ ...p, unit_price: e.target.value }))}
                        />
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 text-right">{it.qty}</td>
                      <td className="px-4 py-3 text-right">{fmtMoney(it.unit_price)}</td>
                    </>
                  )}

                  <td className="px-4 py-3 text-right">{fmtMoney(it.line_subtotal)}</td>
                  <td className="px-4 py-3 text-right font-semibold">{fmtMoney(it.line_total)}</td>

                  {canEdit && (
                    <td className="px-4 py-3 text-right">
                      {editingId === it.id ? (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" className="rounded-xl" onClick={submitEdit}>Saqlash</Button>
                          <Button size="sm" variant="outline" className="rounded-xl" onClick={() => setEditingId(null)}>
                            Bekor
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" className="rounded-xl" onClick={() => startEdit(it)}>
                            Tahrirlash
                          </Button>
                          <Button size="sm" variant="destructive" className="rounded-xl" onClick={() => onDelete(it.id)}>
                            O'chirish
                          </Button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
          </tbody>

          <tfoot>
            <tr className="border-t border-slate-200">
              <td colSpan={canEdit ? 6 : 5} className="px-4 py-3 text-right text-slate-600 font-medium">
                Umumiy summa
              </td>
              <td className="px-4 py-3 text-right text-slate-900 font-semibold">{fmtMoney(total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
