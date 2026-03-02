import { useEffect, useState } from "react"
import ProductionTopbar from "./components/ProductionTopbar"
import ProductionFiltersPanel from "./components/ProductionFilters"
import ProductionTable from "./components/ProductionTable"

import type { ProductionFilters, ProductionOrder } from "./types/production.types"
import {
  createProductionOrder,
  deleteProductionOrder,
  getProductionOrder,
  listProductionOrders,
  updateProductionOrder,
} from "./api/productionApi"

import ProductionOrderDialog from "./components/ProductionOrderDialog"
import ProductionViewModal from "./components/ProductionViewModal"
import DeleteAlertDialog from "@/components/common/DeleteAlertDialog"

const defaultFilters: ProductionFilters = {
  status: "ALL",
  workCenter: "ALL",
  q: "",
  dateFrom: undefined,
  dateTo: undefined,
}

export default function ProductionPage() {
  const [filtersDraft, setFiltersDraft] = useState(defaultFilters)
  const [filters, setFilters] = useState(defaultFilters)

  const [rows, setRows] = useState<ProductionOrder[]>([])
  const [loading, setLoading] = useState(false)

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editRow, setEditRow] = useState<ProductionOrder | null>(null)

  const [viewOpen, setViewOpen] = useState(false)
  const [viewRow, setViewRow] = useState<ProductionOrder | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = async (f: ProductionFilters) => {
    setLoading(true)
    try {
      setRows(await listProductionOrders(f))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(filters)
  }, [filters])

  const onApply = () => setFilters(filtersDraft)
  const onReset = () => {
    setFiltersDraft(defaultFilters)
    setFilters(defaultFilters)
  }

  const onExportCsv = () => {
    const header = ["date", "code", "product", "qty", "workCenter", "status", "receivedQty", "note"]
    const lines = rows.map((r) =>
      [
        r.date,
        r.code,
        r.productName,
        r.quantity,
        r.workCenter,
        r.status,
        r.finishedReceivedQty,
        (r.note ?? "").replaceAll("\n", " "),
      ]
        .map((x) => `"${String(x).replaceAll('"', '""')}"`)
        .join(",")
    )
    const csv = [header.join(","), ...lines].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `production_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const onView = async (id: string) => {
    const d = await getProductionOrder(id)
    setViewRow(d)
    setViewOpen(true)
  }

  const onEdit = async (id: string) => {
    const d = await getProductionOrder(id)
    setEditRow(d)
    setEditOpen(true)
  }

  const onDelete = async (id: string) => {
    setDeleteId(id)
    setDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteProductionOrder(deleteId)
      await load(filters)
      setDeleteOpen(false)
      setDeleteId(null)
    } finally {
      setDeleting(false)
    }
  }

  const submitCreate = async (data: any) => {
    await createProductionOrder(data)
    setCreateOpen(false)
    await load(filters)
  }

  const submitEdit = async (data: any) => {
    if (!editRow) return
    await updateProductionOrder(editRow.id, data)
    setEditOpen(false)
    setEditRow(null)
    await load(filters)
  }

  const onCreate = () => setCreateOpen(true)

  const onViewUpdated = async (id: string) => {
    // modal ichidagi actionsdan keyin refresh
    const d = await getProductionOrder(id)
    setViewRow(d)
    await load(filters)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-white border border-slate-200 p-4 shadow-[0_18px_40px_rgba(2,6,23,0.08)]">
        <ProductionTopbar onCreate={onCreate} onExportCsv={onExportCsv} />
      </div>

      <ProductionFiltersPanel
        value={filtersDraft}
        onChange={setFiltersDraft}
        onApply={onApply}
        onReset={onReset}
      />

      <div className="rounded-3xl bg-white border border-slate-200 p-3 shadow-[0_18px_40px_rgba(2,6,23,0.08)]">
        {loading ? (
          <div className="py-12 text-center text-slate-500">Yuklanmoqda...</div>
        ) : (
          <ProductionTable rows={rows} onView={onView} onEdit={onEdit} onDelete={onDelete} />
        )}
      </div>

      <ProductionOrderDialog
        open={createOpen}
        mode="create"
        onClose={() => setCreateOpen(false)}
        onSubmit={submitCreate}
      />

      <ProductionOrderDialog
        open={editOpen}
        mode="edit"
        initial={editRow}
        onClose={() => {
          setEditOpen(false)
          setEditRow(null)
        }}
        onSubmit={submitEdit}
      />

      <ProductionViewModal
        open={viewOpen}
        order={viewRow}
        onClose={() => {
          setViewOpen(false)
          setViewRow(null)
        }}
        onUpdated={onViewUpdated}
      />

      <DeleteAlertDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open)
          if (!open) setDeleteId(null)
        }}
        title="O'chirish"
        description="Rostdan ham ushbu buyurtmani o'chirmoqchimisiz?"
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  )
}

