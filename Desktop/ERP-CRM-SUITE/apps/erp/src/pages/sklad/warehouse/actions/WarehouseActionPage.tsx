import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { warehouseApi } from "../api/warehouseApi"
import { warehouseEvents } from "../api/events"
import type { WarehouseAction } from "../api/types"
import StockActionCreateDialog from "../components/StockActionCreateDialog"

type ActionMode = "receipt" | "transfer" | "writeoff"

type ModeConfig = {
  title: string
  action: WarehouseAction
  rowFilter: RegExp
  createLabel: string
}

const CONFIG: Record<ActionMode, ModeConfig> = {
  receipt: { title: "Prixod", action: "receipt", rowFilter: /in|receipt|return/i, createLabel: "Yangi prixod" },
  transfer: {
    title: "Peremesheniya",
    action: "transfer",
    rowFilter: /transfer/i,
    createLabel: "Yangi peremesheniya",
  },
  writeoff: {
    title: "Spisaniya",
    action: "waste-adjust",
    rowFilter: /waste|out|issue/i,
    createLabel: "Yangi spisaniya",
  },
}

type MovementRow = {
  id?: number | string
  date?: string
  type?: string
  itemName?: string
  qty?: number
  total?: number
}

function fmtNum(v: number | undefined) {
  return new Intl.NumberFormat("ru-RU").format(Number(v || 0))
}

export default function WarehouseActionPage({ mode }: { mode: ActionMode }) {
  const cfg = CONFIG[mode]
  const [rows, setRows] = useState<MovementRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 20
  const [count, setCount] = useState(0)

  const loadRows = useCallback(
    async (targetPage = page) => {
      try {
        setLoading(true)
        setError("")
        const params: Record<string, number> = { page: targetPage, page_size: pageSize }
        const res = await warehouseApi.listMovementsPage(params)
        setRows((res.results ?? []) as MovementRow[])
        setCount(res.count ?? 0)
        setPage(targetPage)
      } catch (e: unknown) {
        const err = e as { response?: { data?: { detail?: unknown } }; message?: unknown }
        setError(String(err?.response?.data?.detail || err?.message || "Harakatlar yuklanmadi"))
        setRows([])
        setCount(0)
      } finally {
        setLoading(false)
      }
    },
    [page]
  )

  useEffect(() => {
    loadRows(1)
  }, [mode, loadRows])

  useEffect(() => {
    const unsub = warehouseEvents.subscribe(() => {
      loadRows(page)
    })
    return () => unsub()
  }, [page, mode, loadRows])

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((r) => {
      const typeOk = cfg.rowFilter.test(String(r.type || ""))
      const searchOk = !q || String(r.itemName || "").toLowerCase().includes(q)
      return typeOk && searchOk
    })
  }, [rows, search, cfg.rowFilter])

  const totalPages = Math.max(1, Math.ceil((count || 0) / pageSize))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold">{cfg.title}</div>
        <div className="flex items-center gap-2">
          <StockActionCreateDialog
            action={cfg.action}
            title={cfg.createLabel}
            triggerLabel={cfg.createLabel}
            onSuccess={() => loadRows(1)}
          />
          <Button variant="outline" onClick={() => loadRows(page)} disabled={loading}>
            {loading ? "Yuklanmoqda..." : "Yangilash"}
          </Button>
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-4">
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Mahsulot bo'yicha qidirish" />
      </div>

      {error ? <div className="text-sm text-rose-600">{error}</div> : null}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hujjat #</TableHead>
              <TableHead>Sana</TableHead>
              <TableHead>Harakat turi</TableHead>
              <TableHead>Mahsulot</TableHead>
              <TableHead className="text-right">Miqdor</TableHead>
              <TableHead className="text-right">Jami</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.map((r, i) => (
              <TableRow key={r.id ?? i}>
                <TableCell className="font-medium">{r.id ?? i + 1}</TableCell>
                <TableCell>{r.date ?? "-"}</TableCell>
                <TableCell>{r.type ?? "-"}</TableCell>
                <TableCell>{r.itemName ?? "-"}</TableCell>
                <TableCell className="text-right">{fmtNum(r.qty)}</TableCell>
                <TableCell className="text-right">{fmtNum(r.total)}</TableCell>
              </TableRow>
            ))}
            {!loading && filteredRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                  Ma'lumot topilmadi
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" disabled={loading || page <= 1} onClick={() => loadRows(page - 1)}>
          Oldingi
        </Button>
        <div className="text-sm text-muted-foreground">
          {page} / {totalPages}
        </div>
        <Button variant="outline" disabled={loading || page >= totalPages} onClick={() => loadRows(page + 1)}>
          Keyingi
        </Button>
      </div>
    </div>
  )
}
