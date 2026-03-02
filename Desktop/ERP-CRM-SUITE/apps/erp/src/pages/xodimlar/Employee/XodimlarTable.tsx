import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Funnel, Plus, Search } from "lucide-react"
import { apiAxios } from "@/Api/api.axios"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { MoreHorizontalIcon } from "lucide-react"
import DeleteAlertDialog from "@/components/common/DeleteAlertDialog"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { Link } from "react-router-dom"
import type { Client } from "@/Api/types"
import { toast } from "react-toastify"

type ClientRow = {
  id: string
  code: string
  clientName: string
  inn: string
  kind: string
  phoneNumber: string
  email: string
  address: string
  notes: string
  isActive: boolean
  deletedAt: string | null
}

const emptyFiltersUI = {
  id: "",
  code: "",
  clientName: "",
  inn: "",
  kind: "",
  isActive: "ALL",
  createdFrom: "",
  createdTo: "",
  phoneNumber: "",
  email: "",
  address: "",
}

const XodimlarTable = () => {
  const [rows, setRows] = useState<ClientRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [total, setTotal] = useState(0)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filtersUI, setFiltersUI] = useState(emptyFiltersUI)
  const [draftUI, setDraftUI] = useState(emptyFiltersUI)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editRow, setEditRow] = useState<ClientRow | null>(null)
  const [editForm, setEditForm] = useState({
    clientName: "",
    inn: "",
    phoneNumber: "",
    address: "",
    notes: "",
  })

  const load = async (targetPage = page, activeFilters = filtersUI) => {
    try {
      setLoading(true)
      setError("")
      const backend = await apiAxios.listClientsPage({
        page: targetPage,
        page_size: pageSize,
        is_active:
          activeFilters.isActive === "true"
            ? true
            : activeFilters.isActive === "false"
              ? false
              : undefined,
        created_from: activeFilters.createdFrom || undefined,
        created_to: activeFilters.createdTo || undefined,
      })
      const mapped = (backend.items as Client[]).map((x) => ({
        id: String(x.id),
        code: String(x.code || ""),
        clientName: String(x.name || "-"),
        inn: String(x.taxId || ""),
        kind: String(x.kind || "CLIENT"),
        phoneNumber: String(x.phone || ""),
        email: String(x.email || ""),
        address: String(x.address || ""),
        notes: String(x.company || ""),
        isActive: Boolean(x.isActive ?? true),
        deletedAt: x.deletedAt ?? null,
      }))
      setRows(mapped)
      setTotal(Number(backend.total || 0))
      setPage(targetPage)
    } catch (e: any) {
      setRows([])
      setTotal(0)
      setError(String(e?.response?.data?.detail || e?.message || "Clientlar yuklanmadi"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(page, filtersUI)
  }, [page])

  const hasAnyFilter = useMemo(() => {
    return Object.entries(filtersUI).some(([k, v]) => String(v) !== String((emptyFiltersUI as Record<string, string>)[k]))
  }, [filtersUI])

  const openFilter = () => {
    setDraftUI(filtersUI)
    setFilterOpen(true)
  }

  const applyFilters = () => {
    setFiltersUI(draftUI)
    load(1, draftUI)
    setFilterOpen(false)
  }

  const resetFilters = () => {
    const x = { ...emptyFiltersUI }
    setDraftUI(x)
    setFiltersUI(x)
    load(1, x)
  }

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase()

    return rows.filter((r) => {
      const matchesSearch =
        !q ||
        r.id.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.clientName.toLowerCase().includes(q) ||
        r.inn.toLowerCase().includes(q) ||
        r.phoneNumber.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q)

      if (!matchesSearch) return false
      if (filtersUI.id && !r.id.toLowerCase().includes(filtersUI.id.toLowerCase())) return false
      if (filtersUI.code && !r.code.toLowerCase().includes(filtersUI.code.toLowerCase())) return false
      if (filtersUI.clientName && !r.clientName.toLowerCase().includes(filtersUI.clientName.toLowerCase())) return false
      if (filtersUI.inn && !r.inn.toLowerCase().includes(filtersUI.inn.toLowerCase())) return false
      if (filtersUI.kind && !r.kind.toLowerCase().includes(filtersUI.kind.toLowerCase())) return false
      if (filtersUI.phoneNumber && !r.phoneNumber.toLowerCase().includes(filtersUI.phoneNumber.toLowerCase())) return false
      if (filtersUI.email && !r.email.toLowerCase().includes(filtersUI.email.toLowerCase())) return false
      if (filtersUI.address && !r.address.toLowerCase().includes(filtersUI.address.toLowerCase())) return false
      return true
    })
  }, [rows, search, filtersUI])

  const openEdit = async (row: ClientRow) => {
    try {
      setEditLoading(true)
      const d = await apiAxios.detail("client", row.id)
      const enriched: ClientRow = {
        id: String(d.id),
        code: String(d.code || ""),
        clientName: String(d.name || "-"),
        inn: String(d.taxId || ""),
        kind: String(d.kind || "CLIENT"),
        phoneNumber: String(d.phone || ""),
        email: String(d.email || ""),
        address: String(d.address || ""),
        notes: String(d.notes || d.company || ""),
        isActive: Boolean(d.isActive ?? true),
        deletedAt: d.deletedAt ?? null,
      }
      setEditRow(enriched)
      setEditForm({
        clientName: enriched.clientName,
        inn: enriched.inn,
        phoneNumber: enriched.phoneNumber,
        address: enriched.address,
        notes: enriched.notes,
      })
      setEditOpen(true)
    } catch (e: any) {
      toast.error(String(e?.response?.data?.detail || e?.message || "Client detail yuklanmadi"))
    } finally {
      setEditLoading(false)
    }
  }

  const submitEdit = async () => {
    if (!editRow) return
    try {
      setSaving(true)
      const updated = await apiAxios.update("client", editRow.id, {
        name: editForm.clientName,
        phone: editForm.phoneNumber,
        address: editForm.address,
        taxId: editForm.inn,
        company: editForm.notes,
      } as any)

      const mapped: ClientRow = {
        id: String(updated.id),
        code: String(updated.code || ""),
        clientName: String(updated.name || "-"),
        inn: String(updated.taxId || ""),
        kind: String(updated.kind || "CLIENT"),
        phoneNumber: String(updated.phone || ""),
        email: String(updated.email || ""),
        address: String(updated.address || ""),
        notes: String(updated.company || ""),
        isActive: Boolean(updated.isActive ?? true),
        deletedAt: updated.deletedAt ?? null,
      }

      setRows((prev) => prev.map((x) => (x.id === editRow.id ? mapped : x)))
      setEditOpen(false)
      setEditRow(null)
      toast.success("Client yangilandi")
    } catch (e: any) {
      toast.error(String(e?.response?.data?.detail || e?.message || "Yangilashda xatolik"))
    } finally {
      setSaving(false)
    }
  }

  const requestDeleteClient = (id: string) => {
    setDeleteTargetId(id)
    setDeleteOpen(true)
  }

  const removeClient = async (id: string) => {
    try {
      setDeletingId(id)
      await apiAxios.remove("client", id)
      await load(page, filtersUI)
      toast.success("Client o'chirildi")
    } catch (e: any) {
      toast.error(String(e?.response?.data?.detail || e?.message || "O'chirishda xatolik"))
    } finally {
      setDeletingId(null)
      setDeleteOpen(false)
      setDeleteTargetId(null)
    }
  }

  const restoreClient = async (id: string) => {
    try {
      await apiAxios.restore("client", id)
      await load(page, filtersUI)
      toast.success("Client restore qilindi")
    } catch (e: any) {
      toast.error(String(e?.response?.data?.detail || e?.message || "Restore xatolik"))
    }
  }

  const toggleActive = async (row: ClientRow, nextActive: boolean) => {
    try {
      if (nextActive) await apiAxios.activate("client", row.id)
      else await apiAxios.deactivate("client", row.id)
      await load(page, filtersUI)
      toast.success(nextActive ? "Client aktiv qilindi" : "Client noaktiv qilindi")
    } catch (e: any) {
      toast.error(String(e?.response?.data?.detail || e?.message || "Status o'zgartirish xatolik"))
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold pb-5 pl-5">Clients Table</h1>

      <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center px-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full max-w-[320px]">
            <Input
              className="border rounded-xl pl-10 w-full h-[36px] bg-white/70 backdrop-blur-xl border-gray-300 shadow-[rgba(0,0,0,0.24)_0px_3px_8px]"
              type="search"
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          </div>

          <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
            <DialogTrigger asChild>
              <div className="flex items-center border h-[36px] rounded-xl justify-center bg-white/70 backdrop-blur-xl border-gray-300 shadow-[rgba(0,0,0,0.24)_0px_3px_8px] px-3">
                <Funnel className="w-4 h-4 text-gray-500 mr-2" />
                <Button variant="ghost" className="h-[30px] px-2" onClick={openFilter}>
                  Filter {hasAnyFilter ? "•" : ""}
                </Button>
              </div>
            </DialogTrigger>

            <DialogContent className="bg-white max-w-[720px]">
              <DialogHeader>
                <DialogTitle>Filter Clients</DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <Input placeholder="ID" value={draftUI.id} onChange={(e) => setDraftUI((p) => ({ ...p, id: e.target.value }))} />
                <Input placeholder="Code" value={draftUI.code} onChange={(e) => setDraftUI((p) => ({ ...p, code: e.target.value }))} />
                <Input placeholder="Client Name" value={draftUI.clientName} onChange={(e) => setDraftUI((p) => ({ ...p, clientName: e.target.value }))} />
                <Input placeholder="INN" value={draftUI.inn} onChange={(e) => setDraftUI((p) => ({ ...p, inn: e.target.value }))} />
                <Input placeholder="Kind" value={draftUI.kind} onChange={(e) => setDraftUI((p) => ({ ...p, kind: e.target.value }))} />
                <Input type="date" placeholder="Created from" value={draftUI.createdFrom} onChange={(e) => setDraftUI((p) => ({ ...p, createdFrom: e.target.value }))} />
                <Input type="date" placeholder="Created to" value={draftUI.createdTo} onChange={(e) => setDraftUI((p) => ({ ...p, createdTo: e.target.value }))} />
                <select
                  className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
                  value={draftUI.isActive}
                  onChange={(e) => setDraftUI((p) => ({ ...p, isActive: e.target.value }))}
                >
                  <option value="ALL">Status: Barchasi</option>
                  <option value="true">Faqat aktiv</option>
                  <option value="false">Faqat noaktiv/deleted</option>
                </select>
                <Input placeholder="Phone" value={draftUI.phoneNumber} onChange={(e) => setDraftUI((p) => ({ ...p, phoneNumber: e.target.value }))} />
                <Input placeholder="Email" value={draftUI.email} onChange={(e) => setDraftUI((p) => ({ ...p, email: e.target.value }))} />
                <Input placeholder="Address" value={draftUI.address} onChange={(e) => setDraftUI((p) => ({ ...p, address: e.target.value }))} />
              </div>

              <DialogFooter className="mt-4 gap-2">
                <Button variant="outline" onClick={resetFilters}>Reset</Button>
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
                <Button onClick={applyFilters}>Apply</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={() => load(page, filtersUI)} disabled={loading}>
            {loading ? "Yuklanmoqda..." : "Yangilash"}
          </Button>
        </div>

        <Link
          to="/xodimlar/form"
          className="flex items-center cursor-pointer border h-[36px] rounded-xl justify-center bg-white/70 backdrop-blur-xl border-gray-300 shadow-[rgba(0,0,0,0.24)_0px_3px_8px] px-3"
        >
          <Plus className="w-4 h-4 text-gray-500 mr-2" />
          <Button variant="ghost" className="h-[30px] cursor-pointer px-2">
            Create Client
          </Button>
        </Link>
      </div>

      <div className="px-4 mt-4">
        {error ? <div className="text-sm text-rose-600 pb-2">{error}</div> : null}
        <div className="text-sm text-gray-500 pb-2">
          {`${filteredRows.length} ta (sahifadagi) / jami ${total} ta mijoz`}
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">ID</TableHead>
              <TableHead className="text-center">Code</TableHead>
              <TableHead className="text-center">Client Name</TableHead>
              <TableHead className="text-center">INN</TableHead>
              <TableHead className="text-center">Kind</TableHead>
              <TableHead className="text-center">Phone_Number</TableHead>
              <TableHead className="text-center">Email</TableHead>
              <TableHead className="text-center">Address</TableHead>
              <TableHead className="text-center">Active</TableHead>
              <TableHead className="text-center">Deleted At</TableHead>
              <TableHead className="text-center">Notes</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {!loading && filteredRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12} className="text-center text-sm text-gray-500 py-8">
                  No clients found
                </TableCell>
              </TableRow>
            ) : (
              filteredRows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium text-center">{r.id}</TableCell>
                  <TableCell className="text-center">{r.code || "-"}</TableCell>
                  <TableCell className="text-center">{r.clientName}</TableCell>
                  <TableCell className="text-center">{r.inn}</TableCell>
                  <TableCell className="text-center">{r.kind}</TableCell>
                  <TableCell className="text-center">{r.phoneNumber}</TableCell>
                  <TableCell className="text-center">{r.email || "-"}</TableCell>
                  <TableCell className="text-center">{r.address}</TableCell>
                  <TableCell className="text-center">{r.isActive ? "true" : "false"}</TableCell>
                  <TableCell className="text-center">{r.deletedAt || "-"}</TableCell>
                  <TableCell className="text-center">{r.notes}</TableCell>

                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontalIcon />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(r)} disabled={editLoading}>
                          {editLoading ? "Yuklanmoqda..." : "Edit"}
                        </DropdownMenuItem>
                        {r.deletedAt ? (
                          <DropdownMenuItem onClick={() => restoreClient(r.id)}>Restore</DropdownMenuItem>
                        ) : null}
                        {!r.deletedAt ? (
                          <DropdownMenuItem onClick={() => toggleActive(r, !r.isActive)}>
                            {r.isActive ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => requestDeleteClient(r.id)}
                          disabled={deletingId === r.id}
                        >
                          {deletingId === r.id ? "Deleting..." : "Delete"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="mt-4 flex items-center justify-end gap-2">
          <Button
            variant="outline"
            disabled={loading || page <= 1}
            onClick={() => load(page - 1, filtersUI)}
          >
            Oldingi
          </Button>
          <div className="text-sm text-muted-foreground">
            {page} / {Math.max(1, Math.ceil((total || 0) / pageSize))}
          </div>
          <Button
            variant="outline"
            disabled={loading || page >= Math.max(1, Math.ceil((total || 0) / pageSize))}
            onClick={() => load(page + 1, filtersUI)}
          >
            Keyingi
          </Button>
        </div>
      </div>

      <DeleteAlertDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open)
          if (!open) setDeleteTargetId(null)
        }}
        title="O'chirish"
        description="Rostdan ham ushbu clientni o'chirmoqchimisiz?"
        loading={!!deletingId}
        onConfirm={() => {
          if (deleteTargetId) void removeClient(deleteTargetId)
        }}
      />

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-white max-w-[640px]">
          <DialogHeader>
            <DialogTitle>Clientni tahrirlash</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <Input
              placeholder="Client name"
              value={editForm.clientName}
              onChange={(e) => setEditForm((p) => ({ ...p, clientName: e.target.value }))}
            />
            <Input
              placeholder="INN"
              value={editForm.inn}
              onChange={(e) => setEditForm((p) => ({ ...p, inn: e.target.value }))}
            />
            <Input
              placeholder="Phone"
              value={editForm.phoneNumber}
              onChange={(e) => setEditForm((p) => ({ ...p, phoneNumber: e.target.value }))}
            />
            <Input
              placeholder="Address"
              value={editForm.address}
              onChange={(e) => setEditForm((p) => ({ ...p, address: e.target.value }))}
            />
            <Input
              className="md:col-span-2"
              placeholder="Company/Notes"
              value={editForm.notes}
              onChange={(e) => setEditForm((p) => ({ ...p, notes: e.target.value }))}
            />
          </div>
          <DialogFooter className="mt-4 gap-2">
            <DialogClose asChild>
              <Button variant="outline">Bekor qilish</Button>
            </DialogClose>
            <Button onClick={submitEdit} disabled={saving}>
              {saving ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default XodimlarTable
