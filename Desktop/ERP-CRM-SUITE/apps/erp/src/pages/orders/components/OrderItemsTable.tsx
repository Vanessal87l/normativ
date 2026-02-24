// src/components/orders/OrderItemsTable.tsx
import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Product } from "@/pages/orders/api/ordersApi"

export type ItemType = "PRODUCT" | "RAW_MATERIAL"

export interface UiOrderItem {
  key: string
  item_type: ItemType
  product_id?: number
  raw_material_id?: number // hozir ishlatmaymiz
  uom_id?: number
  uom_name?: string
  stock_qty?: number | null
  qty: string
  unit_price: number
  line_total: number
}

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

export default function OrderItemsTable(props: {
  products: Product[]
  warehouseSelected: boolean
  items: UiOrderItem[]
  onAdd: () => void
  onRemove: (key: string) => void
  onChange: (key: string, patch: Partial<UiOrderItem>) => void
  onPickProduct: (key: string, productId: number) => void
}) {
  const { products, items } = props
  const productMap = useMemo(() => {
    const m = new Map<number, Product>()
    products.forEach((p) => m.set(p.id, p))
    return m
  }, [products])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-medium">Items</div>
        <Button type="button" variant="outline" onClick={props.onAdd}>
          + Item qo‘shish
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mahsulot</TableHead>
              <TableHead className="w-[120px]">Unit</TableHead>
              <TableHead className="w-[140px]">Stock</TableHead>
              <TableHead className="w-[120px]">Qty</TableHead>
              <TableHead className="w-[160px]">Unit price</TableHead>
              <TableHead className="w-[160px]">Line total</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {items.map((it) => {
              const p = it.product_id ? productMap.get(it.product_id) : undefined
              return (
                <TableRow key={it.key}>
                  <TableCell>
                    <select
                      className="h-9 w-full rounded-md border bg-transparent px-2 text-sm"
                      value={it.product_id ?? ""}
                      onChange={(e) => {
                        const v = Number(e.target.value)
                        if (!v) return
                        props.onPickProduct(it.key, v)
                      }}
                      disabled={!props.warehouseSelected}
                      title={
                        props.warehouseSelected
                          ? ""
                          : "Avval warehouse tanlang"
                      }
                    >
                      <option value="">Mahsulot tanlang…</option>
                      {products.map((x) => (
                        <option key={x.id} value={x.id}>
                          {x.name}
                        </option>
                      ))}
                    </select>
                    {p ? (
                      <div className="mt-1 text-xs text-muted-foreground">
                        {p.category_name} · {p.currency}
                      </div>
                    ) : null}
                  </TableCell>

                  <TableCell>
                    <select
                      className="h-9 w-full rounded-md border bg-transparent px-2 text-sm"
                      value={it.uom_id ?? ""}
                      onChange={(e) =>
                        props.onChange(it.key, {
                          uom_id: Number(e.target.value) || undefined,
                          uom_name:
                            Number(e.target.value) ? it.uom_name : undefined,
                        })
                      }
                      disabled
                      title="UOM productdan keladi (hozir read-only)"
                    >
                      <option value={it.uom_id ?? ""}>
                        {it.uom_name ?? "—"}
                      </option>
                    </select>
                  </TableCell>

                  <TableCell>
                    <div className="text-sm">
                      {it.stock_qty === null || it.stock_qty === undefined
                        ? "—"
                        : it.stock_qty}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {it.uom_name ?? ""}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Input
                      value={it.qty}
                      onChange={(e) => {
                        const qtyStr = e.target.value
                        const qty = Number(qtyStr || 0)
                        const line_total = round2(qty * (it.unit_price || 0))
                        props.onChange(it.key, { qty: qtyStr, line_total })
                      }}
                      placeholder="0"
                    />
                  </TableCell>

                  <TableCell>
                    <Input
                      value={String(it.unit_price ?? 0)}
                      onChange={(e) => {
                        const up = Number(e.target.value || 0)
                        const qty = Number(it.qty || 0)
                        const line_total = round2(qty * up)
                        props.onChange(it.key, {
                          unit_price: up,
                          line_total,
                        })
                      }}
                      placeholder="0"
                    />
                  </TableCell>

                  <TableCell>
                    <div className="text-sm font-medium">{it.line_total}</div>
                  </TableCell>

                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => props.onRemove(it.key)}
                    >
                      ✕
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}

            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-6 text-center text-sm">
                  Item yo‘q. “Item qo‘shish” ni bosing.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
