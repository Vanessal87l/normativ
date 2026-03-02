import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import { MoreHorizontalIcon } from "lucide-react"

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

import {
  materialsApi,
  type Material,
  type MaterialCreatePayload,
  type MaterialUpdatePayload,
} from "@/pages/Materials/api/materialsApi"

import { MaterialFormDialog } from "./MaterialFormDialog"
import { DeleteConfirmDialog } from "./DeleteConfirmDialog"

export default function MaterialsPage() {
  const [rows, setRows] = useState<Material[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState("")
  const [ordering, setOrdering] = useState<"name" | "-name" | "-created_at">("-created_at")

  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selected, setSelected] = useState<Material | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const { rows } = await materialsApi.list({ search: search.trim() || undefined, ordering })
      setRows(rows)
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || "Xatolik yuz berdi")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ordering])

  useEffect(() => {
    const t = setTimeout(() => load(), 250)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  async function onCreate(payload: MaterialCreatePayload) {
    setSaving(true)
    setError(null)
    try {
      await materialsApi.create(payload)
      await load()
      setCreateOpen(false)
    } catch (e: any) {
      setError(JSON.stringify(e?.response?.data ?? { detail: e?.message }))
    } finally {
      setSaving(false)
    }
  }

  async function onEdit(payload: MaterialUpdatePayload) {
    if (!selected) return
    setSaving(true)
    setError(null)
    try {
      await materialsApi.update(selected.id, payload)
      await load()
      setEditOpen(false)
      setSelected(null)
    } catch (e: any) {
      setError(JSON.stringify(e?.response?.data ?? { detail: e?.message }))
    } finally {
      setSaving(false)
    }
  }

  async function onDelete() {
    if (!selected) return
    setDeleting(true)
    setError(null)
    try {
      await materialsApi.remove(selected.id)
      await load()
      setDeleteOpen(false)
      setSelected(null)
    } catch (e: any) {
      setError(JSON.stringify(e?.response?.data ?? { detail: e?.message }))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xl font-semibold">Materials</div>
          <div className="text-sm text-muted-foreground">Catalog -&gt; Materials</div>
        </div>

        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Qo'shish
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Qidirish..."
          />
        </div>

        <select
          className="h-10 rounded-md border px-2"
          value={ordering}
          onChange={(e) => setOrdering(e.target.value as any)}
        >
          <option value="-created_at">Yangi avval</option>
          <option value="name">Name A-Z</option>
          <option value="-name">Name Z-A</option>
        </select>

        <Button variant="outline" onClick={load} disabled={loading}>
          {loading ? "..." : "Refresh"}
        </Button>
      </div>

      {error ? <div className="border rounded-md p-3 text-sm text-red-500">{error}</div> : null}

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[70px]">ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Material Type</TableHead>
              <TableHead>UOM</TableHead>
              <TableHead>Purchase Price</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="w-[80px] text-right">...</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="py-10 text-center">Yuklanmoqda...</TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-10 text-center">Ma'lumot yo'q</TableCell>
              </TableRow>
            ) : (
              rows.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>{m.id}</TableCell>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell>{m.material_type_name ?? m.material_type ?? "-"}</TableCell>
                  <TableCell>{m.uom_name ?? m.uom}</TableCell>
                  <TableCell>{m.purchase_price ?? "-"}</TableCell>
                  <TableCell>{m.currency}</TableCell>
                  <TableCell>{m.deleted_at ? "Deleted" : "Active"}</TableCell>
                  <TableCell>{m.created_at ? new Date(m.created_at).toLocaleString() : "-"}</TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelected(m)
                            setEditOpen(true)
                          }}
                        >
                          Tahrirlash
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setSelected(m)
                            setDeleteOpen(true)
                          }}
                        >
                          O'chirish
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <MaterialFormDialog
        open={createOpen}
        mode="create"
        loading={saving}
        onClose={() => setCreateOpen(false)}
        onSubmit={onCreate}
      />

      {selected ? (
        <MaterialFormDialog
          open={editOpen}
          mode="edit"
          initial={selected}
          loading={saving}
          onClose={() => {
            setEditOpen(false)
            setSelected(null)
          }}
          onSubmit={onEdit}
        />
      ) : null}

      <DeleteConfirmDialog
        open={deleteOpen}
        loading={deleting}
        title="Material o'chiriladi"
        description={selected ? `${selected.name} (ID: ${selected.id}) o'chirilsinmi?` : "O'chirilsinmi?"}
        onClose={() => {
          setDeleteOpen(false)
          setSelected(null)
        }}
        onConfirm={onDelete}
      />
    </div>
  )
}
