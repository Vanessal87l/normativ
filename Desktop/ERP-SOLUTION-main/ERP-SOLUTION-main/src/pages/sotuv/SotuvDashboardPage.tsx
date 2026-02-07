import { useEffect, useMemo, useState } from "react"

import FilterBar from "./components/FilterBar"
import StatCard from "./components/StatCard"
import SalesOverviewCard from "./components/SalesOverviewCard"
import MiniInfoCard from "./components/MiniInfoCard"
import RecentSalesLuxuryTable from "./components/RecentSalesLuxuryTable"

import { dashboardApi } from "./dashboard-api/dashboardApi"
import type {
  ChartRange,
  ChartPoint,
  DashboardFilter,
  RecentSaleRow,
  RecentSalesQuery,
  StatItem,
} from "./dashboard-api/types"

type UiState = "loading" | "empty" | "error" | "content"

const cardBase = "rounded-xl bg-white border border-slate-200 shadow-sm"

function Skeleton() {
  return (
    <div className={`${cardBase} p-4`}>
      <div className="h-4 w-40 bg-slate-100 rounded" />
      <div className="mt-3 h-10 w-56 bg-slate-100 rounded" />
      <div className="mt-3 h-24 w-full bg-slate-100 rounded" />
    </div>
  )
}

function todayISO() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

export default function DashboardPage() {
  const [ui, setUi] = useState<UiState>("loading")
  const userName = "John Doe"

  // ✅ Filter state (FilterBar dan keladi)
  const [filters, setFilters] = useState<DashboardFilter>(() => ({
    range: "month",
    date: todayISO(),
  }))

  // ✅ data
  const [stats, setStats] = useState<StatItem[]>([])
  const [series, setSeries] = useState<ChartPoint[]>([])
  const [lowStockWarnings, setLowStockWarnings] = useState(0)
  const [unpaidOrders, setUnpaidOrders] = useState(0)

  // ✅ chart range (chart tablar)
  const [chartRange, setChartRange] = useState<ChartRange>("1M")

  // ✅ reload
  const [reloadKey, setReloadKey] = useState(0)
  const handleRetry = () => setReloadKey((k) => k + 1)

  // ✅ FilterBar apply
  const handleApplyFilters = (payload: DashboardFilter) => {
    setFilters(payload)
  }

  // ✅ typed fetch wrapper (tablega filters ham boradi)
  const fetchRecentSales = useMemo(() => {
    return (params: RecentSalesQuery) =>
      dashboardApi.getRecentSales({
        ...params,
        range: filters.range,
        date: filters.date,
      })
  }, [filters.range, filters.date])

  // ✅ summary + chart load
  useEffect(() => {
    let cancelled = false

      ; (async () => {
        try {
          setUi("loading")

          const [summary, chart] = await Promise.all([
            dashboardApi.getSummary(filters),
            dashboardApi.getSalesSeries(chartRange),
          ])

          if (cancelled) return

          setStats(summary.stats)
          setLowStockWarnings(summary.lowStockWarnings)
          setUnpaidOrders(summary.unpaidOrders)
          setSeries(chart.series)

          setUi(summary.stats.length === 0 ? "empty" : "content")
        } catch {
          if (cancelled) return
          setUi("error")
        }
      })()

    return () => {
      cancelled = true
    }
  }, [chartRange, filters.range, filters.date, reloadKey])

  // =========================
  // UI STATE RENDER
  // =========================
  let body: React.ReactNode

  if (ui === "loading") {
    body = (
      <div className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Skeleton />
          </div>
          <div className="grid gap-4">
            <Skeleton />
            <Skeleton />
          </div>
        </div>

        <Skeleton />
      </div>
    )
  } else if (ui === "empty") {
    body = (
      <div className={`${cardBase} p-10 text-center`}>
        <div className="text-lg font-extrabold text-slate-900">Hozircha ma’lumot yo‘q</div>
        <div className="mt-2 text-sm text-slate-500">
          Filtrlarni o‘zgartirib ko‘ring yoki backenddan data kelishini tekshiring.
        </div>
      </div>
    )
  } else if (ui === "error") {
    body = (
      <div className={`${cardBase} p-10`}>
        <div className="text-lg font-extrabold text-slate-900">Xatolik yuz berdi</div>
        <div className="mt-2 text-sm text-slate-500">API error yoki internet muammo bo‘lishi mumkin.</div>
        <button
          type="button"
          onClick={handleRetry}
          className="mt-4 rounded-md bg-slate-900 text-white px-4 py-2 text-sm font-bold"
        >
          Qayta urinib ko‘rish
        </button>
      </div>
    )
  } else {
    body = (
      <div className="grid gap-4">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <StatCard
              key={s.title}
              title={s.title}
              value={s.value}
              sub={s.sub}
              icon={s.icon}
              tone={s.tone}
            />
          ))}
        </div>

        {/* Chart + side cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <SalesOverviewCard
              title="Sotuv & Daromad ko‘rinishi"
              series={series}
              activeRange={chartRange}
              onRangeChange={setChartRange}
            />
          </div>

          <div className="grid gap-4">
            <MiniInfoCard
              title="Kam qolgan mahsulotlar"
              big={String(lowStockWarnings)}
              badgeText="Diqqat talab"
              badgeType="danger"
              icon="🔔"
            />
            <MiniInfoCard
              title="To‘lanmagan buyurtmalar"
              big={String(unpaidOrders)}
              badgeText="To‘lov kutilmoqda"
              badgeType="neutral"
              icon="🧾"
            />
          </div>
        </div>

        {/* Table */}
        <RecentSalesLuxuryTable
          onFetch={fetchRecentSales}
          onEditSave={(row: RecentSaleRow) => dashboardApi.updateSale(row)}
          onDelete={(id) => dashboardApi.deleteSale(id)}
          pageSize={5}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 rounded-2xl">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mt-1">
          <h1 className="text-2xl font-extrabold text-slate-900">
            Xush kelibsiz, {userName}!
          </h1>
        </div>

        <div className="mt-4">
          <FilterBar onApply={handleApplyFilters} />
        </div>

        <div className="mt-4">{body}</div>
      </div>
    </div>
  )
}
