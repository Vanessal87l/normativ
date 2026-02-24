import { useEffect, useState } from "react"
import { warehouseApi } from "../api/warehouseApi"
import { warehouseEvents } from "../api/events"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "react-toastify"
import type { LookupItem, WarehouseAction } from "../api/types"

const ACTIONS: WarehouseAction[] = ["receipt", "issue", "return", "transfer", "waste-adjust"]

function fmtNum(v: number) {
  return new Intl.NumberFormat("ru-RU").format(Number(v || 0))
}

export default function WarehouseMovementsPage() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [lookupLoading, setLookupLoading] = useState(false)

  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [count, setCount] = useState(0)

  const [warehouses, setWarehouses] = useState<LookupItem[]>([])
  const [products, setProducts] = useState<LookupItem[]>([])
  const [materials, setMaterials] = useState<LookupItem[]>([])

  const [action, setAction] = useState<WarehouseAction>("receipt")
  const [warehouseId, setWarehouseId] = useState("")
  const [toWarehouseId, setToWarehouseId] = useState("")
  const [itemKind, setItemKind] = useState<"PRODUCT" | "RAW_MATERIAL">("PRODUCT")
  const [productId, setProductId] = useState("")
  const [rawMaterialId, setRawMaterialId] = useState("")
  const [qty, setQty] = useState("1")
  const [note, setNote] = useState("")
  const [payloadText, setPayloadText] = useState("{}")

  // Ledger ro'yxatini backenddan sahifalab olib tablega chiqaradi.
  const load = async (targetPage = page) => {
    try {
      setLoading(true)
      const res = await warehouseApi.listMovementsPage({ page: targetPage, page_size: pageSize })
      setRows(res.results)
      setCount(res.count)
      setPage(targetPage)
    } finally {
      setLoading(false)
    }
  }

  // Dropdown/select ma'lumotlarini warehouse, product va material APIlaridan oladi.
  const loadLookups = async () => {
    try {
      setLookupLoading(true)
      const [w, p, m] = await Promise.all([
        warehouseApi.listWarehouses().catch(() => []),
        warehouseApi.listProducts().catch(() => []),
        warehouseApi.listMaterials().catch(() => []),
      ])
      setWarehouses(w)
      setProducts(p)
      setMaterials(m)
      if (!warehouseId && w[0]?.id) setWarehouseId(String(w[0].id))
      if (!toWarehouseId && w[1]?.id) setToWarehouseId(String(w[1].id))
      if (!toWarehouseId && !w[1]?.id && w[0]?.id) setToWarehouseId(String(w[0].id))
      if (!productId && p[0]?.id) setProductId(String(p[0].id))
      if (!rawMaterialId && m[0]?.id) setRawMaterialId(String(m[0].id))
    } finally {
      setLookupLoading(false)
    }
  }

  useEffect(() => {
    load(1)
    loadLookups()
  }, [])

  // Warehouse action bajarilgandan keyin barcha warehouse sahifalari o'zini yangilashi uchun event tinglaydi.
  useEffect(() => {
    const unsub = warehouseEvents.subscribe(() => {
      load(page)
    })
    return () => unsub()
  }, [page])

  // Form holatidan backend endpointiga yuboriladigan payloadni yig'adi.
  const makePayload = () => {
    const base: any = {
      warehouse: Number(warehouseId || 0),
      item_type: itemKind,
      qty: String(qty || "0"),
      note,
    }
    if (itemKind === "PRODUCT") {
      base.product_id = Number(productId || 0)
    } else {
      base.raw_material_id = Number(rawMaterialId || 0)
    }
    if (action === "transfer") {
      base.to_warehouse = Number(toWarehouseId || 0)
    }
    return base
  }

  // Action yoki form o'zgarsa payload preview avtomatik yangilanadi.
  useEffect(() => {
    setPayloadText(JSON.stringify(makePayload(), null, 2))
  }, [action, warehouseId, toWarehouseId, itemKind, productId, rawMaterialId, qty, note])

  // Tanlangan action uchun payloadni swagger POST endpointiga yuboradi.
  const submitAction = async () => {
    try {
      const payload = makePayload()
      if (!payload.warehouse) return toast.error("Warehouse tanlang")
      if (action === "transfer" && !payload.to_warehouse) return toast.error("Qabul qiluvchi warehouse tanlang")
      if (itemKind === "PRODUCT" && !payload.product_id) return toast.error("Product tanlang")
      if (itemKind === "RAW_MATERIAL" && !payload.raw_material_id) return toast.error("Raw material tanlang")
      if (Number(payload.qty) <= 0) return toast.error("Qty 0 dan katta bo'lishi kerak")

      setSubmitting(true)
      await warehouseApi.stockAction(action, payload)
      toast.success(`Warehouse ${action} muvaffaqiyatli`)
      await load(1)
    } catch (e: any) {
      const data = e?.response?.data
      const msg =
        typeof data === "string"
          ? data
          : data?.detail || (data ? JSON.stringify(data) : e?.message || "Action error")
      toast.error(String(msg))
    } finally {
      setSubmitting(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(count / pageSize))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold">Warehouse Ledger</div>
        <Button variant="outline" onClick={() => load(page)} disabled={loading}>
          {loading ? "Yuklanmoqda..." : "Refresh"}
        </Button>
      </div>

      <div className="rounded-md border p-3 space-y-3">
        <div className="text-sm font-medium">Yangi Warehouse Harakati (Swagger POST endpointlar)</div>
        <div className="text-xs text-muted-foreground">
          Actionni tanlang va formni to'ldiring. Bu qism create (POST) uchun.
        </div>

        <div className="grid md:grid-cols-4 gap-2">
          <select
            className="h-9 rounded-md border bg-transparent px-2 text-sm"
            value={action}
            onChange={(e) => setAction(e.target.value as WarehouseAction)}
          >
            {ACTIONS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>

          <select
            className="h-9 rounded-md border bg-transparent px-2 text-sm"
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
            disabled={lookupLoading}
          >
            <option value="">Warehouse tanlang</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>

          {action === "transfer" ? (
            <select
              className="h-9 rounded-md border bg-transparent px-2 text-sm"
              value={toWarehouseId}
              onChange={(e) => setToWarehouseId(e.target.value)}
              disabled={lookupLoading}
            >
              <option value="">Qabul qiluvchi warehouse</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          ) : (
            <div />
          )}

          <Input value={qty} onChange={(e) => setQty(e.target.value)} placeholder="qty" type="number" />
        </div>

        <div className="grid md:grid-cols-4 gap-2">
          <select
            className="h-9 rounded-md border bg-transparent px-2 text-sm"
            value={itemKind}
            onChange={(e) => setItemKind(e.target.value as "PRODUCT" | "RAW_MATERIAL")}
          >
            <option value="PRODUCT">PRODUCT</option>
            <option value="RAW_MATERIAL">RAW_MATERIAL</option>
          </select>

          {itemKind === "PRODUCT" ? (
            <select
              className="h-9 rounded-md border bg-transparent px-2 text-sm"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              disabled={lookupLoading}
            >
              <option value="">Product tanlang</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          ) : (
            <select
              className="h-9 rounded-md border bg-transparent px-2 text-sm"
              value={rawMaterialId}
              onChange={(e) => setRawMaterialId(e.target.value)}
              disabled={lookupLoading}
            >
              <option value="">Raw material tanlang</option>
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          )}

          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="note (optional)" />
          <Button onClick={submitAction} disabled={submitting || lookupLoading}>
            {submitting ? "Yuborilmoqda..." : "Create / Yuborish"}
          </Button>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Payload preview</div>
          <textarea
            className="w-full min-h-[120px] rounded-md border bg-transparent p-2 text-xs"
            value={payloadText}
            readOnly
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Item</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r: any, i: number) => (
              <TableRow key={r.id ?? i}>
                <TableCell>{r.date}</TableCell>
                <TableCell>{r.type}</TableCell>
                <TableCell>{r.itemName}</TableCell>
                <TableCell className="text-right">{fmtNum(r.qty)}</TableCell>
                <TableCell className="text-right">{fmtNum(r.total)}</TableCell>
              </TableRow>
            ))}
            {!loading && rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                  Ma'lumot yo'q
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" disabled={loading || page <= 1} onClick={() => load(page - 1)}>
          Oldingi
        </Button>
        <div className="text-sm text-muted-foreground">
          {page} / {totalPages}
        </div>
        <Button variant="outline" disabled={loading || page >= totalPages} onClick={() => load(page + 1)}>
          Keyingi
        </Button>
      </div>
    </div>
  )
}
