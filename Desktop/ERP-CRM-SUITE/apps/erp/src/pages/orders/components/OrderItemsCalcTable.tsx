import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"

import { fetchProducts, fetchUoms, type Product, type Uom } from "@/Api/catalog"
import { fetchOnHand, type OnHandRow } from "@/Api/warehouse"

type ItemRow = {
  key: string
  product_id: number | null
  uom_id: number | null
  unit_cost: number // tan narxi (user edit)
  qty: number       // soni (user edit)
  stock_qty: number | null
  nds_percent: number
  currency: string
}

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16)
}
function toNum(x: any) {
  const n = Number(x)
  return Number.isFinite(n) ? n : 0
}
function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

export default function OrderItemsCalcTable(props: {
  warehouseId: number | null
  // agar kerak bo‘lsa parentga itemsni chiqarib beramiz
  onItemsChange?: (items: ItemRow[]) => void
}) {
  const [products, setProducts] = useState<Product[]>([])
  const [uoms, setUoms] = useState<Uom[]>([])
  const [onHandRows, setOnHandRows] = useState<OnHandRow[]>([])

  const [items, setItems] = useState<ItemRow[]>([
    {
      key: uid(),
      product_id: null,
      uom_id: null,
      unit_cost: 0,
      qty: 1,
      stock_qty: null,
      nds_percent: 0,
      currency: "UZS",
    },
  ])

  // load products + uoms
  useEffect(() => {
    ; (async () => {
      const [p, u] = await Promise.all([fetchProducts(), fetchUoms()])
      setProducts(p)
      setUoms(u)
    })()
  }, [])

  // load on-hand when warehouse changes
  useEffect(() => {
    if (!props.warehouseId) {
      setOnHandRows([])
      // stocklarni null qilamiz
      setItems((prev) => prev.map((x) => ({ ...x, stock_qty: null })))
      return
    }
    ; (async () => {
      const rows = await fetchOnHand(
        props.warehouseId ? { warehouse: props.warehouseId } : undefined
      )
      setOnHandRows(rows)
    })()
  }, [props.warehouseId])

  // product_id -> stock sum (faqat PRODUCT)
  const stockMap = useMemo(() => {
    const m = new Map<number, number>()
    for (const r of onHandRows) {
      if (r.item_type !== "PRODUCT") continue
      if (!r.product_id) continue
      m.set(r.product_id, (m.get(r.product_id) ?? 0) + toNum(r.qty_onhand))
    }
    return m
  }, [onHandRows])

  // Warehouse yoki on-hand o'zgarsa, mavjud rowlardagi qoldiqni qayta hisoblaydi.
  useEffect(() => {
    setItems((prev) => {
      const next = prev.map((r) => ({
        ...r,
        stock_qty: props.warehouseId && r.product_id ? (stockMap.get(r.product_id) ?? 0) : null,
      }))
      props.onItemsChange?.(next)
      return next
    })
  }, [props.warehouseId, stockMap])

  const productMap = useMemo(() => {
    const m = new Map<number, Product>()
    products.forEach((p) => m.set(p.id, p))
    return m
  }, [products])

  const uomMap = useMemo(() => {
    const m = new Map<number, Uom>()
    uoms.forEach((u) => m.set(u.id, u))
    return m
  }, [uoms])

  const setRow = (key: string, patch: Partial<ItemRow>) => {
    setItems((prev) => {
      const next = prev.map((r) => (r.key === key ? { ...r, ...patch } : r))
      props.onItemsChange?.(next)
      return next
    })
  }

  const addRow = () => {
    setItems((prev) => {
      const next = [
        ...prev,
        {
          key: uid(),
          product_id: null,
          uom_id: null,
          unit_cost: 0,
          qty: 1,
          stock_qty: null,
          nds_percent: 0,
          currency: "UZS",
        },
      ]
      props.onItemsChange?.(next)
      return next
    })
  }

  const removeRow = (key: string) => {
    setItems((prev) => {
      const next = prev.filter((r) => r.key !== key)
      props.onItemsChange?.(next)
      return next
    })
  }

  // Kalkulyatsiya:
  // brutto = tan narx * soni
  // nds_sum = brutto * nds%
  // total = brutto + nds_sum
  const calc = (r: ItemRow) => {
    const brutto = round2(toNum(r.unit_cost) * toNum(r.qty))
    const nds_sum = round2(brutto * (toNum(r.nds_percent) / 100))
    const total = round2(brutto + nds_sum)
    return { brutto, nds_sum, total }
  }

  const grand = useMemo(() => {
    return items.reduce(
      (acc, r) => {
        const c = calc(r)
        acc.brutto += c.brutto
        acc.nds += c.nds_sum
        acc.total += c.total
        acc.currency = r.currency || acc.currency
        return acc
      },
      { brutto: 0, nds: 0, total: 0, currency: "UZS" }
    )
  }, [items])

  const pickProduct = (key: string, productId: number) => {
    const p = productMap.get(productId)
    if (!p) return

    const ndsPercent = p.nds_applies ? toNum(p.nds_rate) : 0
    const stock = props.warehouseId ? (stockMap.get(p.id) ?? 0) : null

    setRow(key, {
      product_id: p.id,
      uom_id: p.uom,               // default product uom
      unit_cost: toNum(p.selling_price), // default price (user edit)
      qty: 1,
      stock_qty: stock,
      nds_percent: ndsPercent,
      currency: p.currency ?? "UZS",
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Mahsulotlar</div>
        <Button type="button" variant="outline" onClick={addRow}>
          + Mahsulot qo‘shish
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mahsulotlar</TableHead>
              <TableHead className="w-[170px]">O‘lchov birligi</TableHead>
              <TableHead className="w-[140px]">Tan narxi</TableHead>
              <TableHead className="w-[110px]">Soni</TableHead>
              <TableHead className="w-[140px]">Qoldiqlar</TableHead>
              <TableHead className="w-[110px]">NDS %</TableHead>
              <TableHead className="w-[170px]">Umumiy summa</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {items.map((r) => {
              const p = r.product_id ? productMap.get(r.product_id) : null
              const { total } = calc(r)

              return (
                <TableRow key={r.key}>
                  {/* Mahsulot */}
                  <TableCell>
                    <select
                      className="h-9 w-full rounded-md border bg-transparent px-2 text-sm"
                      value={r.product_id ?? ""}
                      onChange={(e) => {
                        const id = Number(e.target.value)
                        if (id) pickProduct(r.key, id)
                        else setRow(r.key, { product_id: null })
                      }}
                    >
                      <option value="">Tanlang…</option>
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

                  {/* UOM select (backenddan keladi /dicts/uom/) */}
                  <TableCell>
                    <select
                      className="h-9 w-full rounded-md border bg-transparent px-2 text-sm"
                      value={r.uom_id ?? ""}
                      onChange={(e) => setRow(r.key, { uom_id: Number(e.target.value) || null })}
                    >
                      <option value="">Tanlang…</option>
                      {uoms.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {r.uom_id ? `${uomMap.get(r.uom_id)?.code ?? ""}` : (p?.uom_name ?? "")}
                    </div>
                  </TableCell>

                  {/* Tan narxi */}
                  <TableCell>
                    <Input
                      type="number"
                      value={String(r.unit_cost ?? 0)}
                      onChange={(e) => setRow(r.key, { unit_cost: toNum(e.target.value) })}
                      placeholder="0"
                    />
                  </TableCell>

                  {/* Soni */}
                  <TableCell>
                    <Input
                      type="number"
                      value={String(r.qty ?? 0)}
                      onChange={(e) => setRow(r.key, { qty: toNum(e.target.value) })}
                      placeholder="0"
                    />
                  </TableCell>

                  {/* Qoldiqlar */}
                  <TableCell>
                    {props.warehouseId ? (r.stock_qty ?? 0) : "Warehouse tanlang"}
                  </TableCell>

                  {/* NDS % (backenddan product.nds_rate keladi) */}
                  <TableCell>
                    <Input
                      type="number"
                      value={String(r.nds_percent ?? 0)}
                      onChange={(e) => setRow(r.key, { nds_percent: toNum(e.target.value) })}
                      placeholder="0"
                      disabled={p?.nds_applies === false}
                      title={p?.nds_applies ? "" : "Bu mahsulotga NDS qo‘llanmaydi"}
                    />
                  </TableCell>

                  {/* Umumiy summa */}
                  <TableCell className="font-medium">
                    {total} {r.currency}
                  </TableCell>

                  <TableCell>
                    <Button type="button" variant="ghost" onClick={() => removeRow(r.key)}>
                      ✕
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pastdagi umumiy totals */}
      <div className="flex justify-end gap-8 text-sm">
        <div>
          <div className="text-muted-foreground">Brutto</div>
          <div className="font-medium">{round2(grand.brutto)} {grand.currency}</div>
        </div>
        <div>
          <div className="text-muted-foreground">NDS</div>
          <div className="font-medium">{round2(grand.nds)} {grand.currency}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Umumiy</div>
          <div className="text-base font-semibold">{round2(grand.total)} {grand.currency}</div>
        </div>
      </div>
    </div>
  )
}
