import { useEffect, useState } from "react"
import DocumentsTopbar from "./components/DocumentsTopbar"
import DocumentsFiltersPanel from "./components/DocumentsFilters"
import DocumentsTable from "./components/DocumentsTable"
import DocumentCreateEditDialog from "./components/DocumentCreateEditDialog"
import DocumentViewDrawer from "./components/DocumentViewDrawer"
import DeleteAlertDialog from "@/components/common/DeleteAlertDialog"

import {
  createDocument,
  deleteDocument,
  getDocument,
  listDocuments,
  updateDocument,
} from "./api/documentsApi"

import type { DocumentItem, DocumentsFilters } from "./types/documents.types"

const defaultFilters: DocumentsFilters = {
  type: "ALL",
  status: "ALL",
  refType: "ALL",
  dateFrom: undefined,
  dateTo: undefined,
  q: "",
  refId: "",
}

export default function DocumentsPage() {
  const [filtersDraft, setFiltersDraft] = useState<DocumentsFilters>(defaultFilters)
  const [filters, setFilters] = useState<DocumentsFilters>(defaultFilters)

  const [rows, setRows] = useState<DocumentItem[]>([])
  const [loading, setLoading] = useState(false)

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editDoc, setEditDoc] = useState<DocumentItem | null>(null)

  const [viewOpen, setViewOpen] = useState(false)
  const [viewDoc, setViewDoc] = useState<DocumentItem | null>(null)
  const [viewLoading, setViewLoading] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = async (f: DocumentsFilters) => {
    setLoading(true)
    try {
      const data = await listDocuments(f)
      setRows(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      try {
        const data = await listDocuments(filters)
        if (!alive) return
        setRows(data)
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [filters])

  const onApply = () => setFilters(filtersDraft)

  const onReset = () => {
    setFiltersDraft(defaultFilters)
    setFilters(defaultFilters)
  }

  const onCreate = () => setCreateOpen(true)

  const onExportCsv = () => {
    const header = [
      "date",
      "number",
      "type",
      "status",
      "kontragent",
      "refType",
      "refId",
      "amount",
      "currency",
      "note",
    ]

    const lines = rows.map((r) =>
      [
        r.date,
        r.number,
        r.type,
        r.status,
        r.kontragentName ?? "",
        r.refType ?? "",
        r.refId ?? "",
        r.amount ?? "",
        r.currency ?? "",
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
    a.download = `documents_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ✅ VIEW: drawer ochish
  const onView = async (id: string) => {
    setViewOpen(true)
    setViewLoading(true)
    setViewDoc(null)

    try {
      const d = await getDocument(id)
      setViewDoc(d)
    } finally {
      setViewLoading(false)
    }
  }

  // ✅ EDIT
  const onEdit = async (id: string) => {
    const d = await getDocument(id)
    setEditDoc(d)
    setEditOpen(true)
  }

  // ✅ DELETE
  const onDelete = async (id: string) => {
    setDeleteId(id)
    setDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteDocument(deleteId)
      await load(filters)
      setDeleteOpen(false)
      setDeleteId(null)
    } finally {
      setDeleting(false)
    }
  }

  const submitCreate = async (data: Omit<DocumentItem, "id" | "createdAt" | "updatedAt">) => {
    await createDocument(data)
    await load(filters)
  }

  const submitEdit = async (data: Omit<DocumentItem, "id" | "createdAt" | "updatedAt">) => {
    if (!editDoc) return
    await updateDocument(editDoc.id, data as any)
    await load(filters)
  }

  const closeView = () => {
    setViewOpen(false)
    setViewDoc(null)
    setViewLoading(false)
  }

  return (
    <div className="space-y-4">
      {/* Topbar */}
      <div className="rounded-3xl bg-white border border-slate-200 p-4 shadow-[0_18px_40px_rgba(2,6,23,0.08)]">
        <DocumentsTopbar onCreate={onCreate} onExportCsv={onExportCsv} />
      </div>

      {/* Filters */}
      <DocumentsFiltersPanel
        value={filtersDraft}
        onChange={setFiltersDraft}
        onApply={onApply}
        onReset={onReset}
      />

      {/* Table */}
      <div className="rounded-3xl bg-white border border-slate-200 p-3 shadow-[0_18px_40px_rgba(2,6,23,0.08)]">
        {loading ? (
          <div className="py-12 text-center text-slate-500">Yuklanmoqda...</div>
        ) : (
          <DocumentsTable rows={rows} onView={onView} onEdit={onEdit} onDelete={onDelete} />
        )}
      </div>

      {/* Create */}
      <DocumentCreateEditDialog
        open={createOpen}
        mode="create"
        onClose={() => setCreateOpen(false)}
        onSubmit={submitCreate}
      />

      {/* Edit */}
      <DocumentCreateEditDialog
        open={editOpen}
        mode="edit"
        initial={editDoc}
        onClose={() => setEditOpen(false)}
        onSubmit={submitEdit}
      />

      {/* View Drawer */}
      <DocumentViewDrawer
        open={viewOpen}
        doc={
          viewLoading
            ? ({
                id: "loading",
                number: "Yuklanmoqda...",
                title: "",
                type: "OTHER",
                status: "DRAFT",
                date: new Date().toISOString().slice(0, 10),
                attachments: [],
                createdAt: "",
                updatedAt: "",
              } as any)
            : viewDoc
        }
        onClose={closeView}
      />

      <DeleteAlertDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open)
          if (!open) setDeleteId(null)
        }}
        title="O'chirish"
        description="Rostdan ham ushbu hujjatni o'chirmoqchimisiz?"
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  )
}

