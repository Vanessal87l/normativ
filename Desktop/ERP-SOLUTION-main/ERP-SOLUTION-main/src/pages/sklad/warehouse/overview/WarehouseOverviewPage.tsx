import { useEffect, useState } from "react"
import OverviewFilters, { type OverviewFilter } from "./components/OverviewFilters"
import MetricCard from "./components/MetricCard"
import CriticalAlertsCard from "./components/CriticalAlertsCard"
import QuickActionsCard from "./components/QuickActionsCard"
import { money } from "../shared/utils/money"
import { todayISO } from "../shared/utils/date"
import type { AlertItem, WarehouseSummary } from "../../api/types"
import { warehouseApi } from "../../api/warehouseApi"

export default function WarehouseOverviewPage() {
  const [filter, setFilter] = useState<OverviewFilter>({
    range: "month",
    date: todayISO(),
  })

  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  const [summary, setSummary] = useState<WarehouseSummary | null>(null)
  const [alerts, setAlerts] = useState<AlertItem[]>([])

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setErr(null)

        // hozircha filter demo, keyin backend params bo‘ladi
        const [s, a] = await Promise.all([
          warehouseApi.getSummary(),
          warehouseApi.getCriticalAlerts(),
        ])

        if (cancelled) return
        setSummary(s)
        setAlerts(a)
      } catch (e: any) {
        if (cancelled) return
        setErr(e?.message || "Ma’lumot yuklashda xatolik")
      } finally {
        if (cancelled) return
        setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [filter])

  return (
    <div className="space-y-4">
      <OverviewFilters onApply={setFilter} />

      {err && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      )}

      {/* 4 ta metrikaning kartalari */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Xom ashyo qoldig‘i (birlik)"
          value={loading || !summary ? "..." : String(summary.rawStockUnits)}
          icon="🧱"
        />
        <MetricCard
          title="Tayyor mahsulot qoldig‘i (birlik)"
          value={loading || !summary ? "..." : String(summary.finishedStockUnits)}
          icon="📦"
        />
        <MetricCard
          title="Ombor qiymati (umumiy)"
          value={loading || !summary ? "..." : money(summary.inventoryValue)}
          icon="💰"
        />
        <MetricCard
          title="Kam qolgan mahsulotlar"
          value={loading || !summary ? "..." : String(summary.lowStockCount)}
          icon="⚠️"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <CriticalAlertsCard items={loading ? [] : alerts} />
        </div>
        <QuickActionsCard />
      </div>
    </div>
  )
}
