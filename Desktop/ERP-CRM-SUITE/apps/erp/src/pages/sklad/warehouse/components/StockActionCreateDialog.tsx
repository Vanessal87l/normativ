import { useCallback, useEffect, useState } from "react"
import { toast } from "react-toastify"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { warehouseApi } from "../api/warehouseApi"
import type { LookupItem, WarehouseAction } from "../api/types"

type WarehouseOption = LookupItem & { default_location_id?: number }

type Props = {
  action: WarehouseAction
  title: string
  triggerLabel: string
  onSuccess?: () => Promise<void> | void
}

export default function StockActionCreateDialog(props: Props) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [lookupLoading, setLookupLoading] = useState(false)

  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([])
  const [products, setProducts] = useState<LookupItem[]>([])
  const [materials, setMaterials] = useState<LookupItem[]>([])
  const [suppliers, setSuppliers] = useState<LookupItem[]>([])

  const [warehouseId, setWarehouseId] = useState("")
  const [toWarehouseId, setToWarehouseId] = useState("")
  const [supplierId, setSupplierId] = useState("")
  const [itemKind, setItemKind] = useState<"PRODUCT" | "RAW_MATERIAL">("PRODUCT")
  const [productId, setProductId] = useState("")
  const [rawMaterialId, setRawMaterialId] = useState("")
  const [qty, setQty] = useState("1")
  const [comment, setComment] = useState("")

  const isTransfer = props.action === "transfer"
  const isReceipt = props.action === "receipt"
  const isWriteOff = props.action === "waste-adjust"

  const loadLookups = useCallback(async () => {
    try {
      setLookupLoading(true)
      const [w, p, m, s] = await Promise.all([
        warehouseApi.listWarehousesFromLocations().catch((): WarehouseOption[] => []),
        warehouseApi.listProducts().catch(() => []),
        warehouseApi.listMaterials().catch(() => []),
        warehouseApi.listSuppliers().catch(() => []),
      ])
      setWarehouses(w)
      setProducts(p)
      setMaterials(m)
      setSuppliers(s)

      if (!warehouseId && w[0]?.id) setWarehouseId(String(w[0].id))
      if (!toWarehouseId && w[1]?.id) setToWarehouseId(String(w[1].id))
      if (!productId && p[0]?.id) setProductId(String(p[0].id))
      if (!rawMaterialId && m[0]?.id) setRawMaterialId(String(m[0].id))
      if (!supplierId && s[0]?.id) setSupplierId(String(s[0].id))
    } finally {
      setLookupLoading(false)
    }
  }, [warehouseId, toWarehouseId, productId, rawMaterialId, supplierId])

  useEffect(() => {
    if (!open) return
    loadLookups()
  }, [open, loadLookups])

  const submit = async () => {
    try {
      const payload: Record<string, unknown> = {
        warehouse: Number(warehouseId || 0),
        item_type: itemKind,
        qty: String(qty || "0"),
        note: comment,
      }
      const selectedWarehouse = warehouses.find((w) => String(w.id) === warehouseId)
      if (selectedWarehouse?.default_location_id) {
        payload.warehouse_location = selectedWarehouse.default_location_id
      }
      if (itemKind === "PRODUCT") payload.product_id = Number(productId || 0)
      if (itemKind === "RAW_MATERIAL") payload.raw_material_id = Number(rawMaterialId || 0)
      if (isTransfer) payload.to_warehouse = Number(toWarehouseId || 0)
      if (isReceipt && supplierId) {
        payload.supplier = Number(supplierId)
        payload.kontragent = Number(supplierId)
      }
      if (isWriteOff && comment.trim()) payload.reason = comment.trim()

      if (!payload.warehouse) return toast.error("Warehouse tanlang")
      if (isTransfer && !payload.to_warehouse) return toast.error("Qabul qiluvchi warehouse tanlang")
      if (itemKind === "PRODUCT" && !payload.product_id) return toast.error("Product tanlang")
      if (itemKind === "RAW_MATERIAL" && !payload.raw_material_id) return toast.error("Raw material tanlang")
      if (Number(payload.qty) <= 0) return toast.error("Miqdor 0 dan katta bo'lishi kerak")

      setSubmitting(true)
      await warehouseApi.stockAction(props.action, payload)
      toast.success("Yaratildi")
      setOpen(false)
      setComment("")
      await props.onSuccess?.()
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: unknown } }; message?: unknown }
      const data = err?.response?.data
      const msg =
        typeof data === "string"
          ? data
          : data?.detail || (data ? JSON.stringify(data) : err?.message || "Create xatolik")
      toast.error(String(msg))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{props.triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl h-auto max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{props.title}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-2 md:grid-cols-2">
          <select
            className="h-9 rounded-md border bg-transparent px-2 text-sm"
            value={warehouseId}
            onChange={(e) => {
              setWarehouseId(e.target.value)
            }}
            disabled={lookupLoading}
          >
            <option value="">Warehouse tanlang</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>

          {isTransfer ? (
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

          {isReceipt ? (
            <select
              className="h-9 rounded-md border bg-transparent px-2 text-sm"
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              disabled={lookupLoading}
            >
              <option value="">Supplier tanlang</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          ) : (
            <div />
          )}

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

          <Input value={qty} onChange={(e) => setQty(e.target.value)} type="number" placeholder="Miqdor" />
          <Input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={isWriteOff ? "Spisaniya sababi" : "Izoh"}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Bekor qilish</Button>
          <Button onClick={submit} disabled={submitting || lookupLoading}>
            {submitting ? "Yaratilmoqda..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
