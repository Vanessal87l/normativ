import { useEffect, useState } from "react"
import { warehouseApi } from "../api/warehouseApi"
import { warehouseEvents } from "../api/events"
import { Button } from "@/components/ui/button"

export default function WarehouseOverviewPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [summary, setSummary] = useState({ total_items: 0, total_qty: 0, total_value: 0, low_stock_count: 0 })

  // Overview KPI ma'lumotlarini backenddan qayta yuklaydi.
  const load = async () => {
    try {
      setLoading(true)
      setError("")
      const s = await warehouseApi.overview()
      setSummary(s)
    } catch (e: any) {
      setError(String(e?.response?.data?.detail || e?.message || "Overview yuklashda xato"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  // Warehouse action bo'lsa overview ham avtomatik yangilanadi.
  useEffect(() => {
    const unsub = warehouseEvents.subscribe(() => {
      load()
    })
    return () => unsub()
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold">Warehouse Overview</div>
        <Button variant="outline" onClick={load} disabled={loading}>
          {loading ? "Yuklanmoqda..." : "Refresh"}
        </Button>
      </div>
      {error ? <div className="text-sm text-rose-600">{error}</div> : null}
      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-md border p-4"><div className="text-xs text-muted-foreground">Items</div><div className="text-lg font-semibold">{summary.total_items}</div></div>
        <div className="rounded-md border p-4"><div className="text-xs text-muted-foreground">Total Qty</div><div className="text-lg font-semibold">{summary.total_qty}</div></div>
        <div className="rounded-md border p-4"><div className="text-xs text-muted-foreground">Total Value</div><div className="text-lg font-semibold">{summary.total_value}</div></div>
        <div className="rounded-md border p-4"><div className="text-xs text-muted-foreground">Low Stock</div><div className="text-lg font-semibold">{summary.low_stock_count}</div></div>
      </div>
    </div>
  )
}
