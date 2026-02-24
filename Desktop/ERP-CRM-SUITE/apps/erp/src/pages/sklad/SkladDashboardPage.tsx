import { useEffect, useMemo, useState, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { CalendarDays, Package2, Plus, RefreshCcw, TrendingDown, TrendingUp, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { warehouseApi } from "@/pages/sklad/warehouse/api/warehouseApi"
import { warehouseEvents } from "@/pages/sklad/warehouse/api/events"

type Summary = {
  total_items: number
  total_qty: number
  total_value: number
  low_stock_count: number
}

type DateFilter = "today" | "week" | "month" | "year"

function formatNum(v: number) {
  return new Intl.NumberFormat("ru-RU").format(Number.isFinite(v) ? v : 0)
}

// Oddiy SVG chiziqli trend, dashboard ko'rinishini boyitish uchun ishlatiladi.
function TrendChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = Math.max(max - min, 1)
  const pts = data.map((v, i) => {
    const x = 20 + i * ((640 - 40) / Math.max(data.length - 1, 1))
    const y = 190 - ((v - min) / range) * 130
    return `${x},${y}`
  })
  const path = pts.join(" ")

  return (
    <svg viewBox="0 0 640 220" className="h-48 w-full">
      {[50, 85, 120, 155, 190].map((y) => (
        <line key={y} x1="20" y1={y} x2="620" y2={y} stroke="currentColor" opacity="0.12" />
      ))}
      <polyline points={path} fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-700" />
      {pts.map((p, i) => {
        const [x, y] = p.split(",")
        return <circle key={i} cx={x} cy={y} r="4.2" className="fill-white stroke-slate-700 stroke-2" />
      })}
    </svg>
  )
}

function DeltaPill({ value, down }: { value: string; down?: boolean }) {
  return (
    <div
      className={[
        "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium",
        down ? "border-rose-200 text-rose-700 bg-rose-50" : "border-emerald-200 text-emerald-700 bg-emerald-50",
      ].join(" ")}
    >
      {down ? <TrendingDown className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
      <span>{value}</span>
      <span className="text-slate-500">o'tgan davrga nisbatan</span>
    </div>
  )
}

function KpiCard(props: {
  title: string
  value: string
  unit?: string
  delta: string
  down?: boolean
  icon: ReactNode
}) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[17px] text-slate-600">{props.title}</div>
        <div className="rounded-lg bg-slate-100 p-2 text-slate-700">{props.icon}</div>
      </div>
      <div className="text-[42px] leading-none font-bold tracking-tight text-slate-900">{props.value}</div>
      <div className="mt-1 text-sm text-slate-500">{props.unit ?? "so'm"}</div>
      <div className="mt-4">
        <DeltaPill value={props.delta} down={props.down} />
      </div>
    </div>
  )
}

export default function SkladDashboardPage() {
  const [loading, setLoading] = useState(false)
  const [dateFilter, setDateFilter] = useState<DateFilter>("month")
  const [pickedDate, setPickedDate] = useState(new Date().toISOString().slice(0, 10))
  const [appliedFilter, setAppliedFilter] = useState<DateFilter>("month")
  const [appliedDate, setAppliedDate] = useState(new Date().toISOString().slice(0, 10))
  const [summary, setSummary] = useState<Summary>({
    total_items: 0,
    total_qty: 0,
    total_value: 0,
    low_stock_count: 0,
  })
  const [recent, setRecent] = useState<any[]>([])

  // Dashboard ochilganda warehouse overview va ledger satrlarini olib keladi.
  const load = async () => {
    try {
      setLoading(true)
      const [s, l] = await Promise.all([warehouseApi.overview(), warehouseApi.listMovements().catch(() => [])])
      setSummary(s)
      setRecent(l)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  // Warehouse action bo'lganda dashboard KPIlari ham avtomatik yangilanadi.
  useEffect(() => {
    const unsub = warehouseEvents.subscribe(() => {
      load()
    })
    return () => unsub()
  }, [])

  // Sanaga qarab ledgerni front tomonda intervalga filtrlaydi.
  const filteredRecent = useMemo(() => {
    const baseDate = new Date(appliedDate)
    if (Number.isNaN(baseDate.getTime())) return recent
    const msDay = 24 * 60 * 60 * 1000
    let rangeDays = 30
    if (appliedFilter === "today") rangeDays = 1
    if (appliedFilter === "week") rangeDays = 7
    if (appliedFilter === "month") rangeDays = 30
    if (appliedFilter === "year") rangeDays = 365
    const min = baseDate.getTime() - (rangeDays - 1) * msDay
    const max = baseDate.getTime() + msDay - 1
    return recent.filter((x) => {
      const ts = new Date(String(x?.date || "")).getTime()
      return Number.isFinite(ts) && ts >= min && ts <= max
    })
  }, [recent, appliedDate, appliedFilter])

  // UI KPI lar uchun ledgerdan tezkor aggregat hisob-kitoblar.
  const metrics = useMemo(() => {
    const today = appliedDate
    const todayRows = filteredRecent.filter((x) => String(x?.date || "").slice(0, 10) === today)
    const inCount = todayRows.filter((x) => /in|receipt|return/i.test(String(x?.type || ""))).length
    const outCount = todayRows.filter((x) => /out|issue|waste/i.test(String(x?.type || ""))).length
    const monthlyValue = filteredRecent.reduce((s, x) => s + Number(x?.total || 0), 0)
    return { inCount, outCount, monthlyValue }
  }, [filteredRecent, appliedDate])

  // Oxirgi 7 nuqta uchun trend qiymatlarini ledgerdan yig'adi.
  const salesTrend = useMemo(() => {
    const src = filteredRecent.slice(0, 7).map((x) => Number(x?.total || 0))
    if (src.length >= 2) return src
    return [9, 14, 11, 19, 18, 23, 27]
  }, [filteredRecent])

  // Kirim/chiqim miqdori trendini oxirgi 7 nuqta bo'yicha tayyorlaydi.
  const flowTrend = useMemo(() => {
    const src = filteredRecent.slice(0, 7).map((x) => Number(x?.qty || 0))
    if (src.length >= 2) return src
    return [8, 13, 10, 18, 17, 22, 26]
  }, [filteredRecent])

  return (
    <div className="space-y-5 bg-slate-50 p-3 md:p-4">
      {/* Tepki boshqaruv paneli: sana filterlari va tezkor tugmalar */}
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <Button className="h-11 rounded-xl bg-slate-950 px-5 text-base hover:bg-slate-800">
            <Plus className="mr-2 h-4 w-4" />
            Mahsulot qo'shish
          </Button>
          <div className="text-sm font-medium text-slate-600">Sana bo'yicha filtrlash:</div>
          <div className="flex items-center gap-2">
            {[
              { id: "today", label: "Bugun" },
              { id: "week", label: "Hafta" },
              { id: "month", label: "Oy" },
              { id: "year", label: "Yil" },
            ].map((x) => (
              <button
                key={x.id}
                type="button"
                onClick={() => setDateFilter(x.id as DateFilter)}
                className={[
                  "h-11 rounded-xl border px-5 text-base transition",
                  dateFilter === x.id
                    ? "border-slate-900 bg-slate-950 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100",
                ].join(" ")}
              >
                {x.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <Input
              className="h-11 w-[170px] rounded-xl border-slate-200 pr-10 text-base"
              type="date"
              value={pickedDate}
              onChange={(e) => setPickedDate(e.target.value)}
            />
            <CalendarDays className="pointer-events-none absolute top-3.5 right-3 h-4 w-4 text-slate-500" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" className="h-11 rounded-xl" onClick={load} disabled={loading}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              {loading ? "Yuklanmoqda..." : "Yangilash"}
            </Button>
            <Button
              className="h-11 rounded-xl bg-slate-950 px-5 text-base hover:bg-slate-800"
              onClick={() => {
                setAppliedFilter(dateFilter)
                setAppliedDate(pickedDate)
              }}
            >
              Filtrlarni qo'llash
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Bugungi sotuv"
          value={formatNum(metrics.monthlyValue)}
          unit="so'm"
          delta="+12.7%"
          icon={<Wallet className="h-4 w-4" />}
        />
        <KpiCard
          title="Bugungi daromad"
          value={formatNum(Math.round(metrics.monthlyValue * 0.24))}
          unit="so'm"
          delta="+5.1%"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <KpiCard
          title="Oylik sotuv"
          value={formatNum(summary.total_value)}
          unit="so'm"
          delta="+18.1%"
          icon={<CalendarDays className="h-4 w-4" />}
        />
        <KpiCard
          title="Chegirma ta'siri"
          value={formatNum(Math.round(metrics.monthlyValue * 0.03))}
          unit="so'm"
          delta="-3.2%"
          down
          icon={<TrendingDown className="h-4 w-4" />}
        />
        <KpiCard
          title="Omborda mahsulot"
          value={formatNum(summary.total_qty)}
          unit="dona"
          delta="+4.6%"
          icon={<Package2 className="h-4 w-4" />}
        />
        <KpiCard
          title="Bugun kirim"
          value={formatNum(metrics.inCount)}
          unit="pozitsiya"
          delta="+2.4%"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <KpiCard
          title="Bugun chiqim"
          value={formatNum(metrics.outCount)}
          unit="pozitsiya"
          delta="-0.3%"
          down
          icon={<TrendingDown className="h-4 w-4" />}
        />
        <KpiCard
          title="Kam qolganlar"
          value={formatNum(summary.low_stock_count)}
          unit="diqqat"
          delta="+2.0%"
          icon={<Package2 className="h-4 w-4" />}
        />
      </div>

      {/* Pastki trend panellari: sotuv va ombor harakati dinamikasi */}
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-start justify-between">
            <div>
              <div className="text-[30px] leading-none font-semibold tracking-tight text-slate-900">Sotuv trendi</div>
              <div className="mt-1 text-base text-slate-500">Dinamikani ko'rsatadi</div>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" className="rounded-lg border px-3 py-1.5 text-sm text-slate-600">1W</button>
              <button type="button" className="rounded-lg bg-slate-950 px-3 py-1.5 text-sm text-white">1M</button>
              <button type="button" className="rounded-lg border px-3 py-1.5 text-sm text-slate-600">3M</button>
              <button type="button" className="rounded-lg border px-3 py-1.5 text-sm text-slate-600">1Y</button>
            </div>
          </div>
          <TrendChart data={salesTrend} />
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-start justify-between">
            <div>
              <div className="text-[30px] leading-none font-semibold tracking-tight text-slate-900">Ombor harakatlari</div>
              <div className="mt-1 text-base text-slate-500">Kirim/chiqim dinamikasi</div>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" className="rounded-lg border px-3 py-1.5 text-sm text-slate-600">1W</button>
              <button type="button" className="rounded-lg bg-slate-950 px-3 py-1.5 text-sm text-white">1M</button>
              <button type="button" className="rounded-lg border px-3 py-1.5 text-sm text-slate-600">3M</button>
              <button type="button" className="rounded-lg border px-3 py-1.5 text-sm text-slate-600">1Y</button>
            </div>
          </div>
          <TrendChart data={flowTrend} />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Link to="/dashboard/sklad/warehouse/balances" className="rounded-xl border bg-white p-4 text-slate-800 shadow-sm hover:bg-slate-50">
          <div className="font-semibold">Остатки</div>
          <div className="text-sm text-slate-500">On-hand qoldiq, narx va warehouse location kesimida</div>
        </Link>
        <Link to="/dashboard/sklad/warehouse/receipts" className="rounded-xl border bg-white p-4 text-slate-800 shadow-sm hover:bg-slate-50">
          <div className="font-semibold">Оприходования</div>
          <div className="text-sm text-slate-500">Kirim operatsiyasi va tarixi</div>
        </Link>
        <Link to="/dashboard/sklad/warehouse/transfers" className="rounded-xl border bg-white p-4 text-slate-800 shadow-sm hover:bg-slate-50">
          <div className="font-semibold">Перемещения</div>
          <div className="text-sm text-slate-500">Omborlar orasida ko'chirish</div>
        </Link>
      </div>
    </div>
  )
}
