// src/pages/OrdersPage.tsx
import { useEffect, useState } from "react"
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, Download, Ellipsis, Eye, Pencil, Trash2 } from "lucide-react"
import OrderCreateDialog from "@/pages/orders/components/OrderCreateDialog"
import { api } from "@/lib/api"
import { toast } from "react-toastify"

type OrderRow = {
  id: number
  order_no: string
  client_code: string
  client_name: string
  order_date: string
  status: string
  payment_status: string
  currency: string
  total: number
  paid_amount: number
  remaining: number
  delivery_date: string | null
  created_at: string
  updated_at: string
  nds_total?: number
  nds_percent?: number
}

type OrderDetail = {
  id: number
  order_no: string
  client?: { name?: string | null; code?: string | null } | null
  order_date: string
  status: string
  currency: string
  subtotal?: number
  nds_total?: number
  discount_total?: number
  total?: number
  delivery_date?: string | null
  delivery_address?: string | null
  courier_name?: string | null
  items?: Array<{
    id: number
    item_type: string
    product_name?: string | null
    raw_material_name?: string | null
    qty?: string | number
    unit_price?: number
    nds_rate?: string | number
    nds_amount?: number
    line_total?: number
  }>
}

export default function OrdersPage() {
  const [rows, setRows] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(false)
  const [busyKey, setBusyKey] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [viewOpen, setViewOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<OrderRow | null>(null)
  const [activeOrder, setActiveOrder] = useState<OrderDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [editForm, setEditForm] = useState({
    order_date: "",
    delivery_date: "",
    currency: "UZS",
    discount_total: 0,
    delivery_address: "",
    courier_name: "",
    status: "NEW",
  })
  const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100
  const formatAmount = (n: number | string | null | undefined) => {
    const num = Number(n ?? 0)
    if (!Number.isFinite(num)) return "0"
    const sign = num < 0 ? "-" : ""
    const abs = Math.abs(Math.trunc(num))
    return `${sign}${String(abs).replace(/\B(?=(\d{3})+(?!\d))/g, " ")}`
  }
  const parseAmountInput = (v: string) => {
    const cleaned = v.replace(/\s/g, "").replace(/,/g, "")
    const num = Number(cleaned)
    return Number.isFinite(num) ? num : 0
  }
  const formatDate = (v: string | null | undefined) => {
    if (!v) return "-"
    const d = new Date(v)
    if (Number.isNaN(d.getTime())) return String(v)
    const dd = String(d.getDate()).padStart(2, "0")
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const yyyy = d.getFullYear()
    return `${dd}.${mm}.${yyyy}`
  }
  const toDateInputValue = (v: string | null | undefined) => {
    if (!v) return ""
    const s = String(v)
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
    const d = new Date(s)
    if (Number.isNaN(d.getTime())) return ""
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const dd = String(d.getDate()).padStart(2, "0")
    return `${yyyy}-${mm}-${dd}`
  }
  const statusOptions = [
    "NEW",
    "IN_PROGRESS",
    "READY",
    "ON_DELIVERY",
    "DELIVERED",
    "CANCELLED",
  ]

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  // Order listni pagination bilan olib keladi va NDS ma'lumotini detaildan to'ldiradi.
  const load = async (page = currentPage) => {
    try {
      setLoading(true)
      const { data } = await api.get("/api/v1/orders/", {
        params: { page, page_size: pageSize },
      })
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
          ? data.results
          : []
      const count = Number(data?.count)
      setTotalCount(Number.isFinite(count) ? count : list.length)
      setCurrentPage(page)

      const withNds = await Promise.all(
        list.map(async (row: OrderRow) => {
          try {
            const { data: detail } = await api.get(`/api/v1/orders/${row.id}/`)
            const subtotal = Number(detail?.subtotal || 0)
            const ndsTotal = Number(detail?.nds_total || 0)
            const ndsPercent = subtotal > 0 ? (ndsTotal / subtotal) * 100 : 0
            return {
              ...row,
              nds_total: ndsTotal,
              nds_percent: ndsPercent,
            }
          } catch {
            return {
              ...row,
              nds_total: Number((row as any).nds_total || 0),
              nds_percent: Number((row as any).nds_percent || 0),
            }
          }
        })
      )

      setRows(withNds)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(1)
  }, [pageSize])

  // View/Edit dialoglar uchun order detailni backenddan oladi.
  const fetchOrderDetail = async (id: number) => {
    setDetailLoading(true)
    try {
      const { data } = await api.get(`/api/v1/orders/${id}/`)
      return data as OrderDetail
    } finally {
      setDetailLoading(false)
    }
  }

  // View dialogni ochadi va order detailni ko'rsatadi.
  const viewOrder = async (id: number) => {
    const key = `${id}:view`
    try {
      setBusyKey(key)
      const data = await fetchOrderDetail(id)
      setActiveOrder(data)
      setViewOpen(true)
    } catch (e: any) {
      const msg = String(e?.response?.data?.detail || e?.message || "View error")
      alert(msg)
    } finally {
      setBusyKey("")
    }
  }

  // Edit dialogni ochishdan oldin joriy order ma'lumotlarini formga joylaydi.
  const editOrder = async (id: number) => {
    const key = `${id}:edit`
    try {
      setBusyKey(key)
      const data = await fetchOrderDetail(id)
      setActiveOrder(data)
      setEditForm({
        order_date: toDateInputValue(data.order_date),
        delivery_date: toDateInputValue(data.delivery_date),
        currency: data.currency || "UZS",
        discount_total: Number(data.discount_total || 0),
        delivery_address: data.delivery_address || "",
        courier_name: data.courier_name || "",
        status: data.status || "NEW",
      })
      setEditOpen(true)
    } catch (e: any) {
      const msg = String(e?.response?.data?.detail || e?.message || "Edit open error")
      alert(msg)
    } finally {
      setBusyKey("")
    }
  }

  // Edit formdagi o'zgarishlarni saqlaydi; status bo'lsa set-status actionni chaqiradi.
  const saveEdit = async () => {
    if (!activeOrder?.id) return
    const key = `${activeOrder.id}:edit-save`
    try {
      setBusyKey(key)
      await api.patch(`/api/v1/orders/${activeOrder.id}/`, {
        order_date: editForm.order_date || null,
        delivery_date: editForm.delivery_date || null,
        currency: editForm.currency,
        discount_total: Number(editForm.discount_total || 0),
        delivery_address: editForm.delivery_address || null,
        courier_name: editForm.courier_name || null,
      })

      if (editForm.status !== activeOrder.status) {
        await api.post(`/api/v1/orders/${activeOrder.id}/set-status/`, {
          status: editForm.status,
        })
      }
      setEditOpen(false)
      await load(currentPage)
      toast.success("Zakaz muvaffaqiyatli yangilandi")
    } catch (e: any) {
      const msg = String(e?.response?.data?.detail || e?.message || "Edit save error")
      toast.error(msg)
    } finally {
      setBusyKey("")
    }
  }

  // Delete action oldidan center dialog ochish uchun target rowni saqlaydi.
  const askDeleteOrder = (row: OrderRow) => {
    setDeleteTarget(row)
    setDeleteOpen(true)
  }

  // Delete dialog tasdiqlansa backenddan orderni o'chiradi va ro'yxatni yangilaydi.
  const confirmDeleteOrder = async () => {
    if (!deleteTarget) return
    const id = deleteTarget.id
    const key = `${id}:delete`
    try {
      setBusyKey(key)
      await api.delete(`/api/v1/orders/${id}/`)
      setDeleteOpen(false)
      setDeleteTarget(null)
      const isLastItemOnPage = rows.length === 1 && currentPage > 1
      const nextPage = isLastItemOnPage ? currentPage - 1 : currentPage
      await load(nextPage)
      toast.success("Zakaz o'chirildi")
    } catch (e: any) {
      const msg = String(e?.response?.data?.detail || e?.message || "Delete error")
      toast.error(msg)
    } finally {
      setBusyKey("")
    }
  }

  const toCsvCell = (v: string | number | null | undefined) => {
    const s = String(v ?? "")
    if (s.includes(",") || s.includes("\"") || s.includes("\n")) {
      return `"${s.replace(/"/g, "\"\"")}"`
    }
    return s
  }

  // Order detaildan CSV tayyorlab yuklab beradi (Excel ochadi).
  const downloadOrderFile = async (row: OrderRow) => {
    const key = `${row.id}:download`
    try {
      setBusyKey(key)
      const { data } = await api.get(`/api/v1/orders/${row.id}/`)
      const items: any[] = Array.isArray(data?.items) ? data.items : []

      const lines: string[] = []
      lines.push("Order No,Client,Status,Order Date,Delivery Date,Currency,Subtotal,NDS Total,Discount,Total")
      lines.push(
        [
          toCsvCell(data?.order_no),
          toCsvCell(data?.client?.name ?? row.client_name),
          toCsvCell(data?.status),
          toCsvCell(data?.order_date),
          toCsvCell(data?.delivery_date),
          toCsvCell(data?.currency),
          toCsvCell(data?.subtotal),
          toCsvCell(data?.nds_total),
          toCsvCell(data?.discount_total),
          toCsvCell(data?.total),
        ].join(",")
      )
      lines.push("")
      lines.push("Item Type,Product,Qty,Unit Price,NDS Rate,NDS Amount,Line Total")
      for (const it of items) {
        lines.push(
          [
            toCsvCell(it?.item_type),
            toCsvCell(it?.product_name ?? it?.raw_material_name ?? ""),
            toCsvCell(it?.qty),
            toCsvCell(it?.unit_price),
            toCsvCell(it?.nds_rate),
            toCsvCell(it?.nds_amount),
            toCsvCell(it?.line_total),
          ].join(",")
        )
      }

      const csv = `\uFEFF${lines.join("\r\n")}`
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${data?.order_no || row.order_no}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e: any) {
      const msg = String(e?.response?.data?.detail || e?.message || "Download error")
      alert(msg)
    } finally {
      setBusyKey("")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-xl font-semibold">Buyurtmalar</div>
          <div className="text-sm text-muted-foreground">Buyurtmalar ro'yxati</div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => load(currentPage)} disabled={loading}>
            {loading ? "Yuklanmoqda..." : "Refresh"}
          </Button>
          <OrderCreateDialog onSuccess={() => load(1)} />
        </div>
      </div>

      <div className="rounded-md">
        <div className="max-h-[68vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Buyurtma kodi</TableHead>
                <TableHead>Mijozlar</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Buyurtma sana</TableHead>
                <TableHead>Yetkazib berish sana </TableHead>
                <TableHead className="text-right">NDS %</TableHead>
                <TableHead className="text-right">NDS summa</TableHead>
                <TableHead className="text-right">Umumiy summa</TableHead>
                <TableHead className="flex justify-end items-center"><Ellipsis /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.order_no}</TableCell>
                  <TableCell>
                    <div>{r.client_name}</div>
                  </TableCell>
                  <TableCell>
                    {r.status}
                  </TableCell>
                  <TableCell>{formatDate(r.order_date)}</TableCell>
                  <TableCell>{formatDate(r.delivery_date)}</TableCell>
                  <TableCell className="text-right">{round2(Number(r.nds_percent || 0))}%</TableCell>
                  <TableCell className="text-right">
                    {formatAmount(r.nds_total)} {r.currency}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatAmount(r.total)} {r.currency}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        className="border-none"
                        size="sm"
                        variant="outline"
                        onClick={() => editOrder(r.id)}
                        disabled={busyKey === `${r.id}:edit`}
                      >
                        <Pencil color="green" size={14} />
                      </Button>
                      <Button
                        className="border-none"
                        size="sm"
                        variant="outline"
                        onClick={() => viewOrder(r.id)}
                        disabled={busyKey === `${r.id}:view`}
                      >
                        <Eye color="blue" size={14} />
                      </Button>
                      <Button
                        className="text-black"
                        size="sm"
                        variant="destructive"
                        onClick={() => askDeleteOrder(r)}
                        disabled={busyKey === `${r.id}:delete`}
                      >
                        <Trash2 color="red" size={14} />

                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => downloadOrderFile(r)}
                        disabled={busyKey === `${r.id}:download`}
                      >
                        <Download size={14} />

                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-sm">
                    Order yo'q
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">
            Jami: {totalCount} ta
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sahifa hajmi:</span>
            <select
              className="h-8 rounded-md border bg-transparent px-2 text-sm"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value) || 10)}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => load(currentPage - 1)}
            disabled={loading || currentPage <= 1}
          >
            <ChevronLeft size={16} />
          </Button>
          <div className="text-sm min-w-[90px] text-center">
            {currentPage} / {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => load(currentPage + 1)}
            disabled={loading || currentPage >= totalPages}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-4xl h-auto max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Order view: {activeOrder?.order_no ?? "-"}</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="text-sm text-muted-foreground">Yuklanmoqda...</div>
          ) : activeOrder ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Client:</span> {activeOrder.client?.name ?? "-"}</div>
                <div><span className="text-muted-foreground">Status:</span> {activeOrder.status}</div>
                <div><span className="text-muted-foreground">Order date:</span> {formatDate(activeOrder.order_date)}</div>
                <div><span className="text-muted-foreground">Delivery:</span> {formatDate(activeOrder.delivery_date)}</div>
                <div><span className="text-muted-foreground">NDS:</span> {formatAmount(activeOrder.nds_total)} {activeOrder.currency}</div>
                <div><span className="text-muted-foreground">Total:</span> {formatAmount(activeOrder.total)} {activeOrder.currency}</div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>NDS %</TableHead>
                      <TableHead>NDS summa</TableHead>
                      <TableHead className="text-right">Line total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(activeOrder.items ?? []).map((it) => (
                      <TableRow key={it.id}>
                        <TableCell>{it.product_name ?? it.raw_material_name ?? "-"}</TableCell>
                        <TableCell>{it.qty ?? "-"}</TableCell>
                        <TableCell>{Number(it.nds_rate ?? 0)}%</TableCell>
                        <TableCell>{formatAmount(it.nds_amount)}</TableCell>
                        <TableCell className="text-right">{formatAmount(it.line_total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Ma'lumot topilmadi</div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-3xl h-auto max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Order edit: {activeOrder?.order_no ?? "-"}</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="text-sm text-muted-foreground">Yuklanmoqda...</div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="mb-1 text-xs text-muted-foreground">Order date</div>
                  <Input
                    type="date"
                    value={editForm.order_date}
                    onChange={(e) => setEditForm((p) => ({ ...p, order_date: e.target.value }))}
                  />
                </div>
                <div>
                  <div className="mb-1 text-xs text-muted-foreground">Delivery date</div>
                  <Input
                    type="date"
                    value={editForm.delivery_date}
                    onChange={(e) => setEditForm((p) => ({ ...p, delivery_date: e.target.value }))}
                  />
                </div>
                <div>
                  <div className="mb-1 text-xs text-muted-foreground">Status</div>
                  <select
                    className="h-9 w-full rounded-md border bg-transparent px-2 text-sm"
                    value={editForm.status}
                    onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="mb-1 text-xs text-muted-foreground">Currency</div>
                  <select
                    className="h-9 w-full rounded-md border bg-transparent px-2 text-sm"
                    value={editForm.currency}
                    onChange={(e) => setEditForm((p) => ({ ...p, currency: e.target.value }))}
                  >
                    <option value="UZS">UZS</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
                <div>
                  <div className="mb-1 text-xs text-muted-foreground">Discount total</div>
                  <Input
                    value={formatAmount(editForm.discount_total)}
                    onChange={(e) => setEditForm((p) => ({ ...p, discount_total: parseAmountInput(e.target.value) }))}
                  />
                </div>
                <div>
                  <div className="mb-1 text-xs text-muted-foreground">Courier name</div>
                  <Input
                    value={editForm.courier_name}
                    onChange={(e) => setEditForm((p) => ({ ...p, courier_name: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <div className="mb-1 text-xs text-muted-foreground">Delivery address</div>
                <Input
                  value={editForm.delivery_address}
                  onChange={(e) => setEditForm((p) => ({ ...p, delivery_address: e.target.value }))}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Bekor qilish
            </Button>
            <Button onClick={saveEdit} disabled={!activeOrder || busyKey === `${activeOrder?.id}:edit-save`}>
              Saqlash
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="w-[600px] h-auto">
          <DialogHeader>
            <DialogTitle>Zakazni o'chirish</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">
            {deleteTarget?.order_no} zakazini o'chirmoqchimisiz? Bu amalni bekor qilib bo'lmaydi.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Bekor qilish
            </Button>
            <Button
              className="text-black border"
              variant="destructive"
              onClick={confirmDeleteOrder}
              disabled={!deleteTarget || busyKey === `${deleteTarget?.id}:delete`}
            >
              O'chirish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
