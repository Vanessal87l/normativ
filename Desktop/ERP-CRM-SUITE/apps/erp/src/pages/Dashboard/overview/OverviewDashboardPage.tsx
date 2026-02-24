import { useEffect, useState } from "react"
import { Plus } from "lucide-react"
import DashboardShell from "../components/DashboardShell"
import FilterBar from "../components/FilterBar"
import KpiCard from "../components/KpiCard"
import RangeTabs from "../components/RangeTabs"
import LineChart from "../components/LineChart"
import ProductCreateModal from "../components/ProductCreateModal"
import RecentTable from "../components/RecentTable"
import ProductsTable from "../components/ProductsTable"
import { dashboardApi } from "../api/dashboardApi"
import type {
  ChartRange,
  DashboardFilter,
  OverviewSummaryResponse,
  RecentQuery,
  RecentRow,
} from "../api/types"
import { warehouseEvents } from "@/pages/sklad/warehouse/api/events"

type UiState = "loading" | "error" | "content"

function todayISO() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

function cx(...a: Array<string | false | undefined | null>) {
  return a.filter(Boolean).join(" ")
}

export default function OverviewDashboardPage() {
  const [ui, setUi] = useState<UiState>("loading")
  const [filters, setFilters] = useState<DashboardFilter>(() => ({
    range: "month",
    date: todayISO(),
  }))

  const [rangeSales, setRangeSales] = useState<ChartRange>("1M")
  const [rangeSklad, setRangeSklad] = useState<ChartRange>("1M")

  const [summary, setSummary] = useState<OverviewSummaryResponse | null>(null)
  const [q, setQ] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 6
  const [rows, setRows] = useState<RecentRow[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [salesSeries, setSalesSeries] = useState<Array<{ label: string; value: number }>>([])
  const [skladSeries, setSkladSeries] = useState<Array<{ label: string; value: number }>>([])

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const headerCard = "rounded-2xl bg-white border border-slate-200 shadow-sm"
  const [reloadKey, setReloadKey] = useState(0)
  const [openProduct, setOpenProduct] = useState(false)

  useEffect(() => {
    const unsub = warehouseEvents.subscribe(() => setReloadKey((k) => k + 1))
    return () => unsub()
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setUi("loading")
        const res = await dashboardApi.getOverviewSummary(filters)
        if (cancelled) return
        setSummary(res)
        setUi("content")
      } catch {
        if (cancelled) return
        setUi("error")
      }
    })()
    return () => {
      cancelled = true
    }
  }, [filters, reloadKey])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [a, b] = await Promise.all([
          dashboardApi.getOverviewSeries("sales", rangeSales),
          dashboardApi.getOverviewSeries("sklad", rangeSklad),
        ])
        if (cancelled) return
        setSalesSeries(a.series)
        setSkladSeries(b.series)
      } catch {
        if (cancelled) return
        setSalesSeries([])
        setSkladSeries([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [rangeSales, rangeSklad, reloadKey])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const params: RecentQuery = {
          page,
          pageSize,
          q: q.trim() || undefined,
          sortKey: "date",
          sortDir: "desc",
          range: filters.range,
          date: filters.date,
        }
        const res = await dashboardApi.getOverviewRecent(params)
        if (cancelled) return
        setRows(res.rows)
        setTotalCount(res.totalCount)
      } catch {
        if (cancelled) return
        setRows([])
        setTotalCount(0)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [page, pageSize, q, filters, reloadKey])

  useEffect(() => {
    setPage(1)
  }, [q, filters])

  return (
    <DashboardShell>
      <div className="text-2xl font-extrabold text-slate-900"></div>

      <div className="mt-4">
        <FilterBar
          onApply={(p) => setFilters(p)}
          leftSlot={
            <button
              type="button"
              onClick={() => setOpenProduct(true)}
              className="h-9 rounded-lg bg-slate-900 px-3 text-xs font-extrabold text-white hover:bg-slate-800 inline-flex items-center gap-2"
            >
              <Plus size={16} />
              Mahsulot qo'shish
            </button>
          }
        />
      </div>

      {ui === "loading" && (
        <div className="mt-4 rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
          Yuklanmoqda...
        </div>
      )}

      {ui === "error" && (
        <div className="mt-4 rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
          <div className="text-lg font-extrabold text-slate-900">Xatolik</div>
          <div className="mt-2 text-sm text-slate-500">
            Backend ulanmagan bo'lishi mumkin. Server va endpointlarni tekshiring.
          </div>
        </div>
      )}

      {ui === "content" && summary && (
        <div className="mt-4 grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {summary.salesKpis.map((k) => (
              <KpiCard key={k.title} kpi={k} />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {summary.skladKpis.map((k) => (
              <KpiCard key={k.title} kpi={k} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className={cx(headerCard, "p-4")}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-extrabold text-slate-900">Sotuv trendi</div>
                  <div className="mt-1 text-xs text-slate-500">Dinamikani ko'rsatadi</div>
                </div>
                <RangeTabs value={rangeSales} onChange={setRangeSales} />
              </div>
              <div className="mt-3">
                <LineChart data={salesSeries} />
              </div>
            </div>

            <div className={cx(headerCard, "p-4")}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-extrabold text-slate-900">Ombor harakatlari</div>
                  <div className="mt-1 text-xs text-slate-500">Kirim/chiqim dinamikasi</div>
                </div>
                <RangeTabs value={rangeSklad} onChange={setRangeSklad} />
              </div>
              <div className="mt-3">
                <LineChart data={skladSeries} />
              </div>
            </div>
          </div>

          <div className={cx(headerCard, "p-4")}>
            <RecentTable
              rows={rows}
              q={q}
              onQChange={setQ}
              page={page}
              totalPages={totalPages}
              onPrev={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
            />
            <ProductsTable reloadKey={reloadKey} />
          </div>
        </div>
      )}

      <ProductCreateModal
        open={openProduct}
        onClose={() => setOpenProduct(false)}
        onCreated={() => setReloadKey((k) => k + 1)}
      />
    </DashboardShell>
  )
}
