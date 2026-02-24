import { useCallback, useEffect, useMemo, useState } from "react"
import { api } from "@/lib/api"
import { toast } from "react-toastify"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { warehouseApi } from "../api/warehouseApi"
import type { LookupItem } from "../api/types"

type InternalOrderRow = {
  id: number | string
  order_no: string
  status: string
  warehouse_name: string
  created_at: string
  total: number
  currency: string
}

type ApiLikeError = {
  response?: { status?: number; data?: { detail?: unknown } }
  message?: unknown
}

function asArray(data: unknown) {
  if (Array.isArray(data)) return data
  if (typeof data === "object" && data !== null && Array.isArray((data as { results?: unknown }).results)) {
    return (data as { results: unknown[] }).results
  }
  return []
}

function toNum(v: unknown) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function fmtNum(v: number) {
  return new Intl.NumberFormat("ru-RU").format(Number(v || 0))
}

function mapRow(x: unknown, idx: number): InternalOrderRow {
  const row = (x ?? {}) as Record<string, unknown>
  const warehouse =
    typeof row.warehouse === "object" && row.warehouse !== null
      ? (row.warehouse as Record<string, unknown>)
      : undefined
  return {
    id: (row.id as number | string | undefined) ?? `INTERNAL-${idx}`,
    order_no: String(row.order_no ?? row.number ?? row.code ?? `INTERNAL-${idx + 1}`),
    status: String(row.status ?? "NEW"),
    warehouse_name: String(
      row.warehouse_name ?? warehouse?.name ?? row.from_warehouse_name ?? row.to_warehouse_name ?? "-"
    ),
    created_at: String(row.created_at ?? row.order_date ?? row.date ?? "-"),
    total: toNum(row.total ?? row.amount ?? row.sum ?? 0),
    currency: String(row.currency ?? "UZS"),
  }
}

async function fetchInternalOrders(params: { page: number; page_size: number; q?: string; status?: string }) {
  const candidates = [
    "/api/v1/warehouse/internal-orders/",
    "/api/v1/warehouse/orders/internal/",
    "/api/v1/internal-orders/",
  ]
  for (const url of candidates) {
    try {
      const { data } = await api.get(url, { params })
      const rows = asArray(data).map(mapRow)
      const dataObj = data as { count?: unknown }
      return { results: rows, count: Number(dataObj.count ?? rows.length) }
    } catch (error: unknown) {
      const status = Number((error as ApiLikeError)?.response?.status || 0)
      if (status !== 404) throw error
    }
  }

  const fallbackParams: Record<string, unknown> = {
    page: params.page,
    page_size: params.page_size,
    search: params.q,
    status: params.status,
    order_type: "INTERNAL",
    type: "INTERNAL",
    is_internal: true,
  }
  const { data } = await api.get("/api/v1/orders/", { params: fallbackParams })
  const rows = asArray(data).map(mapRow)
  const dataObj = data as { count?: unknown }
  return { results: rows, count: Number(dataObj.count ?? rows.length) }
}

export default function WarehouseInternalOrdersPage() {
  const [rows, setRows] = useState<InternalOrderRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 20
  const [count, setCount] = useState(0)

  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [warehouses, setWarehouses] = useState<LookupItem[]>([])
  const [products, setProducts] = useState<LookupItem[]>([])
  const [materials, setMaterials] = useState<LookupItem[]>([])
  const [warehouseId, setWarehouseId] = useState("")
  const [toWarehouseId, setToWarehouseId] = useState("")
  const [itemKind, setItemKind] = useState<"PRODUCT" | "RAW_MATERIAL">("PRODUCT")
  const [productId, setProductId] = useState("")
  const [rawMaterialId, setRawMaterialId] = useState("")
  const [qty, setQty] = useState("1")
  const [note, setNote] = useState("")

  const load = useCallback(async (targetPage = page) => {
    try {
      setLoading(true)
      setError("")
      const res = await fetchInternalOrders({
        page: targetPage,
        page_size: pageSize,
        q: query.trim() || undefined,
        status: status || undefined,
      })
      setRows(res.results)
      setCount(res.count)
      setPage(targetPage)
    } catch (e: unknown) {
      const err = e as ApiLikeError
      setRows([])
      setCount(0)
      setError(String(err?.response?.data?.detail || err?.message || "Internal orders yuklanmadi"))
    } finally {
      setLoading(false)
    }
  }, [page, query, status])

  useEffect(() => {
    load(1)
  }, [load])

  const loadLookups = useCallback(async () => {
    try {
      setLookupLoading(true)
      const [w, p, m] = await Promise.all([
        warehouseApi.listWarehousesFromLocations().catch(() => []),
        warehouseApi.listProducts().catch(() => []),
        warehouseApi.listMaterials().catch(() => []),
      ])
      setWarehouses(w)
      setProducts(p)
      setMaterials(m)
      if (!warehouseId && w[0]?.id) setWarehouseId(String(w[0].id))
      if (!toWarehouseId && w[1]?.id) setToWarehouseId(String(w[1].id))
      if (!productId && p[0]?.id) setProductId(String(p[0].id))
      if (!rawMaterialId && m[0]?.id) setRawMaterialId(String(m[0].id))
    } finally {
      setLookupLoading(false)
    }
  }, [warehouseId, toWarehouseId, productId, rawMaterialId])

  useEffect(() => {
    if (!createOpen) return
    loadLookups()
  }, [createOpen, loadLookups])

  const createInternalOrder = async () => {
    try {
      if (!warehouseId) return toast.error("Warehouse tanlang")
      if (itemKind === "PRODUCT" && !productId) return toast.error("Product tanlang")
      if (itemKind === "RAW_MATERIAL" && !rawMaterialId) return toast.error("Raw material tanlang")
      if (Number(qty) <= 0) return toast.error("Qty 0 dan katta bo'lsin")

      const itemPayload =
        itemKind === "PRODUCT"
          ? { item_type: "PRODUCT", product: Number(productId), qty: String(qty), unit_price: 0, line_total: 0 }
          : { item_type: "RAW_MATERIAL", raw_material: Number(rawMaterialId), qty: String(qty), unit_price: 0, line_total: 0 }

      const payload = {
        warehouse: Number(warehouseId),
        from_warehouse: Number(warehouseId),
        to_warehouse: toWarehouseId ? Number(toWarehouseId) : undefined,
        order_type: "INTERNAL",
        type: "INTERNAL",
        is_internal: true,
        status: "NEW",
        note,
        items: [itemPayload],
      }

      setCreating(true)
      await warehouseApi.createInternalOrder(payload)
      toast.success("Internal order yaratildi")
      setCreateOpen(false)
      await load(1)
    } catch (e: unknown) {
      const err = e as ApiLikeError
      const data = err?.response?.data
      const msg =
        typeof data === "string"
          ? data
          : data?.detail || (data ? JSON.stringify(data) : err?.message || "Create xatolik")
      toast.error(String(msg))
    } finally {
      setCreating(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil((count || 0) / pageSize))
  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) => r.order_no.toLowerCase().includes(q) || r.warehouse_name.toLowerCase().includes(q))
  }, [rows, query])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold">Внутренние заказы</div>
        <div className="flex items-center gap-2">
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild><Button>Create</Button></DialogTrigger>
            <DialogContent className="max-w-2xl h-auto max-h-[90vh] overflow-auto">
              <DialogHeader><DialogTitle>Внутренние заказы create</DialogTitle></DialogHeader>
              <div className="grid gap-2 md:grid-cols-2">
                <select className="h-9 rounded-md border bg-transparent px-2 text-sm" value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)} disabled={lookupLoading}>
                  <option value="">Warehouse tanlang</option>
                  {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
                <select className="h-9 rounded-md border bg-transparent px-2 text-sm" value={toWarehouseId} onChange={(e) => setToWarehouseId(e.target.value)} disabled={lookupLoading}>
                  <option value="">Qabul qiluvchi warehouse (ixtiyoriy)</option>
                  {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
                <select className="h-9 rounded-md border bg-transparent px-2 text-sm" value={itemKind} onChange={(e) => setItemKind(e.target.value as "PRODUCT" | "RAW_MATERIAL")}>
                  <option value="PRODUCT">PRODUCT</option>
                  <option value="RAW_MATERIAL">RAW_MATERIAL</option>
                </select>
                {itemKind === "PRODUCT" ? (
                  <select className="h-9 rounded-md border bg-transparent px-2 text-sm" value={productId} onChange={(e) => setProductId(e.target.value)} disabled={lookupLoading}>
                    <option value="">Product tanlang</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                ) : (
                  <select className="h-9 rounded-md border bg-transparent px-2 text-sm" value={rawMaterialId} onChange={(e) => setRawMaterialId(e.target.value)} disabled={lookupLoading}>
                    <option value="">Raw material tanlang</option>
                    {materials.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                )}
                <Input type="number" placeholder="qty" value={qty} onChange={(e) => setQty(e.target.value)} />
                <Input placeholder="note" value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>Bekor qilish</Button>
                <Button onClick={createInternalOrder} disabled={creating || lookupLoading}>{creating ? "Yaratilmoqda..." : "Create"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={() => load(page)} disabled={loading}>{loading ? "Yuklanmoqda..." : "Yangilash"}</Button>
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-4">
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Zakaz / sklad bo'yicha qidirish" />
        <select className="h-9 rounded-md border bg-transparent px-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Barcha statuslar</option>
          <option value="NEW">NEW</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="READY">READY</option>
          <option value="DONE">DONE</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
        <Button onClick={() => load(1)} disabled={loading}>Filter qo'llash</Button>
      </div>

      {error ? <div className="text-sm text-rose-600">{error}</div> : null}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Заказ №</TableHead>
              <TableHead>Склад</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Создан</TableHead>
              <TableHead className="text-right">Сумма</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.order_no}</TableCell>
                <TableCell>{r.warehouse_name}</TableCell>
                <TableCell>{r.status}</TableCell>
                <TableCell>{r.created_at}</TableCell>
                <TableCell className="text-right">{fmtNum(r.total)} {r.currency}</TableCell>
              </TableRow>
            ))}
            {!loading && filteredRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">Ma'lumot topilmadi</TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" disabled={loading || page <= 1} onClick={() => load(page - 1)}>Oldingi</Button>
        <div className="text-sm text-muted-foreground">{page} / {totalPages}</div>
        <Button variant="outline" disabled={loading || page >= totalPages} onClick={() => load(page + 1)}>Keyingi</Button>
      </div>
    </div>
  )
}
