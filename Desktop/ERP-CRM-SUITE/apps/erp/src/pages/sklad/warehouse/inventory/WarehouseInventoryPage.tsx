import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { warehouseApi } from "../api/warehouseApi"
import { warehouseEvents } from "../api/events"
import type { LookupItem } from "../api/types"
import StockActionCreateDialog from "../components/StockActionCreateDialog"

type InventoryRow = {
  id?: number | string
  item_name?: string
  item_type?: string
  qty_onhand?: number
  avg_unit_cost?: number
  value_onhand?: number
}

function fmtNum(v: number | undefined) {
  return new Intl.NumberFormat("ru-RU").format(Number(v || 0))
}

export default function WarehouseInventoryPage() {
  const [rows, setRows] = useState<InventoryRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [warehouses, setWarehouses] = useState<LookupItem[]>([])
  const [locations, setLocations] = useState<LookupItem[]>([])
  const [lookupLoading, setLookupLoading] = useState(false)

  const [warehouseId, setWarehouseId] = useState("")
  const [locationId, setLocationId] = useState("")
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 30
  const [count, setCount] = useState(0)

  const loadWarehouses = async () => {
    try {
      setLookupLoading(true)
      const list = await warehouseApi.listWarehouses()
      setWarehouses(list)
      if (!warehouseId && list[0]?.id) {
        setWarehouseId(String(list[0].id))
      }
    } finally {
      setLookupLoading(false)
    }
  }

  const loadLocations = async (warehouseValue: string) => {
    try {
      const list = await warehouseApi.listWarehouseLocations(
        warehouseValue ? Number(warehouseValue) : undefined
      )
      setLocations(list)
      setLocationId((prev) => (list.some((x) => String(x.id) === prev) ? prev : ""))
    } catch {
      setLocations([])
    }
  }

  const loadRows = async (targetPage = page) => {
    try {
      setLoading(true)
      setError("")
      const params: Record<string, number> = { page: targetPage, page_size: pageSize }
      if (warehouseId) params.warehouse = Number(warehouseId)
      if (locationId) params.location = Number(locationId)

      const res = await warehouseApi.listStock(params)
      setRows(res.results)
      setCount(res.count)
      setPage(targetPage)
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: unknown } }; message?: unknown }
      setError(String(err?.response?.data?.detail || err?.message || "Inventarizasiya ma'lumotlari yuklanmadi"))
      setRows([])
      setCount(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWarehouses()
  }, [])

  useEffect(() => {
    loadLocations(warehouseId)
  }, [warehouseId])

  useEffect(() => {
    loadRows(1)
  }, [warehouseId, locationId])

  useEffect(() => {
    const unsub = warehouseEvents.subscribe(() => {
      loadRows(page)
    })
    return () => unsub()
  }, [page, warehouseId, locationId])

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) => String(r.item_name ?? "").toLowerCase().includes(q))
  }, [rows, query])

  const totalPages = Math.max(1, Math.ceil((count || 0) / pageSize))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold">Inventarizasiya</div>
        <div className="flex items-center gap-2">
          <StockActionCreateDialog
            action="waste-adjust"
            title="Yangi inventarizasiya"
            triggerLabel="Yangi inventarizasiya"
            onSuccess={() => loadRows(1)}
          />
          <Button variant="outline" onClick={() => loadRows(page)} disabled={loading}>
            {loading ? "Yuklanmoqda..." : "Yangilash"}
          </Button>
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-4">
        <select
          className="h-9 rounded-md border bg-transparent px-2 text-sm"
          value={warehouseId}
          onChange={(e) => {
            setWarehouseId(e.target.value)
            setLocationId("")
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

        <select
          className="h-9 rounded-md border bg-transparent px-2 text-sm"
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
          disabled={lookupLoading}
        >
          <option value="">Warehouse location</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>

        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Mahsulot qidirish" />
        <Button onClick={() => loadRows(1)} disabled={loading}>Filter qo'llash</Button>
      </div>

      {error ? <div className="text-sm text-rose-600">{error}</div> : null}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mahsulot</TableHead>
              <TableHead>Turi</TableHead>
              <TableHead className="text-right">Sanoq</TableHead>
              <TableHead className="text-right">O'rtacha narx</TableHead>
              <TableHead className="text-right">Jami qiymat</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.map((r, i) => (
              <TableRow key={r.id ?? i}>
                <TableCell>{r.item_name ?? "-"}</TableCell>
                <TableCell>{r.item_type ?? "-"}</TableCell>
                <TableCell className="text-right">{fmtNum(r.qty_onhand)}</TableCell>
                <TableCell className="text-right">{fmtNum(r.avg_unit_cost)}</TableCell>
                <TableCell className="text-right">{fmtNum(r.value_onhand)}</TableCell>
              </TableRow>
            ))}
            {!loading && filteredRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
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
