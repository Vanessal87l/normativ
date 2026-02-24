// src/pages/Dashboard/api/dashboardApi.ts
import type { ChartRange, DashboardFilter, OverviewSummaryResponse, RecentQuery, RecentRow } from "./types"
import { buildOverviewDemo, demoSalesSeries, demoSkladSeries, sleep } from "./mock"

import { warehouseApi } from "@/pages/sklad/warehouse/api/warehouseApi"
import type { MovementItem } from "@/pages/sklad/warehouse/api/types"

import { http } from "@/shared/http"

// =====================================================
// Backend toggle
// =====================================================
const USE_BACKEND = String((import.meta as any).env?.VITE_USE_BACKEND || "") === "1"

const ENDPOINTS = {
  financeSummary: "/api/v1/dashboard/finance/summary/",
  overviewSummary: "/api/v1/dashboard/overview/summary/",
  salesSummary: "/api/v1/dashboard/sales/summary/",      // ?top_n=10
  warehouseSummary: "/api/v1/dashboard/warehouse/summary/",
}

// =====================================================
// Safe helpers
// =====================================================
function safeStr(x: any, fallback = "—") {
  const s = String(x ?? "").trim()
  return s.length ? s : fallback
}
function num(x: any) {
  const v = Number(x)
  return Number.isFinite(v) ? v : 0
}
function pickNumber(obj: any, keys: string[], fallback = 0) {
  for (const k of keys) {
    const v = obj?.[k]
    const n = Number(v)
    if (Number.isFinite(n)) return n
  }
  return fallback
}
function pickString(obj: any, keys: string[], fallback = "—") {
  for (const k of keys) {
    const v = obj?.[k]
    const s = String(v ?? "").trim()
    if (s) return s
  }
  return fallback
}
function todayISO() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

function shiftDate(isoDate: string, days: number) {
  const d = new Date(`${isoDate}T00:00:00`)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function buildDashboardParams(filters: DashboardFilter) {
  const date = String(filters?.date || todayISO())
  const range = String(filters?.range || "month")

  let dateFrom = date
  if (range === "today") dateFrom = date
  else if (range === "week") dateFrom = shiftDate(date, -6)
  else if (range === "year") dateFrom = shiftDate(date, -365)
  else dateFrom = shiftDate(date, -30)

  // Ikkala formatni ham yuboramiz: ba'zi endpointlar date_from/date_to, ba'zilari range/date qabul qiladi.
  return {
    range,
    date,
    date_from: dateFrom,
    date_to: date,
  }
}

/**
 * Warehouse MovementItem -> RecentRow
 */
function mapMovementToRecentRow(m: MovementItem): RecentRow {
  const t = String((m as any).type ?? "").toUpperCase()
  const type: RecentRow["type"] = t === "OUT" || t === "WASTE" ? "MOVE_OUT" : "MOVE_IN"

  return {
    id: (m as any).id,
    name: safeStr((m as any).itemName, "—"),
    qty: num((m as any).qty),
    amount: num((m as any).total),
    date: safeStr((m as any).date, todayISO()),
    type,
  }
}

// =====================================================
// API
// =====================================================
export const dashboardApi = {
  // =====================================================
  // ✅ OVERVIEW SUMMARY — backenddan 4 ta summary ni yig‘ib beradi
  // =====================================================
  async getOverviewSummary(filters: DashboardFilter): Promise<OverviewSummaryResponse> {
    // fallback demo tayyor turadi
    const demo = buildOverviewDemo()

    if (!USE_BACKEND) {
      // demo + warehouse mix (eski logika)
      await sleep(150)
      return demo
    }

    // ✅ Backenddan parallel chaqiramiz (bittasi yiqilsa ham qolganlari ishlaydi)
    const params = buildDashboardParams(filters)
    const [financeS, overviewS, salesS, warehouseS] = await Promise.allSettled([
      http.get<any>(ENDPOINTS.financeSummary, params as any),
      http.get<any>(ENDPOINTS.overviewSummary, params as any),
      http.get<any>(ENDPOINTS.salesSummary, { ...params, top_n: 10 } as any),
      http.get<any>(ENDPOINTS.warehouseSummary, params as any),
    ])

    const finance = financeS.status === "fulfilled" ? financeS.value : null
    const overview = overviewS.status === "fulfilled" ? overviewS.value : null
    const sales = salesS.status === "fulfilled" ? salesS.value : null
    const whSum = warehouseS.status === "fulfilled" ? warehouseS.value : null

    // ✅ KPI larni “kalitlar farq qilsa ham” topishga harakat qilamiz
    const todaySales = pickNumber(overview, ["today_sales", "todaySales", "sales_today", "day_sales"], NaN)
    const todayProfit = pickNumber(overview, ["today_profit", "todayProfit", "profit_today", "day_profit"], NaN)
    const monthSales = pickNumber(overview, ["month_sales", "monthSales", "sales_month", "monthly_sales"], NaN)

    const balance = pickNumber(finance, ["balance", "net", "net_balance"], NaN)

    const stockUnits = pickNumber(whSum, ["stock_units", "total_units", "total_stock", "products_in_stock"], NaN)
    const movementsIn = pickNumber(whSum, ["movements_in", "in_count", "today_in"], NaN)
    const movementsOut = pickNumber(whSum, ["movements_out", "out_count", "today_out"], NaN)
    const lowStock = pickNumber(whSum, ["low_stock_count", "lowStockCount", "low_stock"], NaN)

    // ✅ Sales summary: top_n=10
    // backend qaytarishi: items/top/products ... bo‘lishi mumkin — top listni topib RecentRow ga o‘tkazamiz
    const topList: any[] =
      (Array.isArray(sales) ? sales :
        Array.isArray(sales?.results) ? sales.results :
        Array.isArray(sales?.items) ? sales.items :
        Array.isArray(sales?.top) ? sales.top :
        Array.isArray(sales?.products) ? sales.products :
        [])

    const topRows: RecentRow[] = topList.slice(0, 10).map((x, idx) => ({
      id: x?.id ?? `top-${idx}`,
      name: safeStr(x?.name ?? x?.product_name ?? x?.title, "—"),
      qty: num(x?.qty ?? x?.quantity ?? x?.count ?? 1),
      amount: num(x?.amount ?? x?.total ?? x?.sum ?? x?.revenue ?? 0),
      date: safeStr(x?.date, todayISO()),
      type: "SALE",
    }))

    // ✅ KPI listlarni UI formatga keltiramiz (agar backendda yo‘q bo‘lsa demo’dan oladi)
    const salesKpis = [
      {
        title: "Bugungi sotuv",
        value: Number.isFinite(todaySales) ? todaySales.toLocaleString("uz-UZ") : demo.salesKpis[0].value,
        sub: "so‘m",
        icon: "💳",
        tone: "success" as const,
      },
      {
        title: "Bugungi daromad",
        value: Number.isFinite(todayProfit) ? todayProfit.toLocaleString("uz-UZ") : demo.salesKpis[1].value,
        sub: "so‘m",
        icon: "💰",
        tone: "success" as const,
      },
      {
        title: "Oylik sotuv",
        value: Number.isFinite(monthSales) ? monthSales.toLocaleString("uz-UZ") : demo.salesKpis[2].value,
        sub: "so‘m",
        icon: "📈",
        tone: "neutral" as const,
      },
      {
        title: "Balans",
        value: Number.isFinite(balance) ? balance.toLocaleString("uz-UZ") : pickString(finance, ["balance_text"], "—"),
        sub: "so‘m",
        icon: "🧾",
        tone: "neutral" as const,
      },
    ]

    const skladKpis = [
      {
        title: "Omborda mahsulot",
        value: Number.isFinite(stockUnits) ? stockUnits : demo.skladKpis[0].value,
        sub: "dona/birlik",
        icon: "📦",
        tone: "neutral" as const,
      },
      {
        title: "Bugun kirim",
        value: Number.isFinite(movementsIn) ? movementsIn : demo.skladKpis[1].value,
        sub: "pozitsiya",
        icon: "⬇️",
        tone: "success" as const,
      },
      {
        title: "Bugun chiqim",
        value: Number.isFinite(movementsOut) ? movementsOut : demo.skladKpis[2].value,
        sub: "pozitsiya",
        icon: "⬆️",
        tone: "danger" as const,
      },
      {
        title: "Kam qolganlar",
        value: Number.isFinite(lowStock) ? lowStock : demo.skladKpis[3].value,
        sub: "diqqat",
        icon: "🔔",
        tone: "danger" as const,
      },
    ]

    // ✅ Recent rows: backend top sales + warehouse movements (xohlasangiz)
    let moveRows: RecentRow[] = []
    try {
      const moves = await warehouseApi.listMovements()
      moveRows = moves.map(mapMovementToRecentRow)
    } catch {}

    return {
      salesKpis,
      skladKpis,
      // series endpoint siz bergan linklarda yo‘q — hozircha demo series
      salesSeries: demoSalesSeries("1M"),
      skladSeries: demoSkladSeries("1M"),
      rows: [...topRows, ...moveRows],
    }
  },

  // =====================================================
  // ✅ Hozircha demo (Series/Recent uchun alohida endpoint bermagansiz)
  // =====================================================
  async getOverviewSeries(which: "sales" | "sklad", range: ChartRange) {
    await sleep(150)
    return { range, series: which === "sales" ? demoSalesSeries(range) : demoSkladSeries(range) }
  },

  async getOverviewRecent(params: RecentQuery) {
    await sleep(120)
    let salesRows: RecentRow[] = [...buildOverviewDemo().rows]

    if (USE_BACKEND) {
      try {
        const backendParams = {
          ...buildDashboardParams({ range: params.range, date: params.date }),
          top_n: 50,
        }
        const sales = await http.get<any>(ENDPOINTS.salesSummary, backendParams)
        const topList: any[] =
          Array.isArray(sales)
            ? sales
            : Array.isArray(sales?.results)
            ? sales.results
            : Array.isArray(sales?.items)
            ? sales.items
            : Array.isArray(sales?.top)
            ? sales.top
            : Array.isArray(sales?.products)
            ? sales.products
            : []

        salesRows = topList.map((x, idx) => ({
          id: x?.id ?? `sale-${idx}`,
          name: safeStr(x?.name ?? x?.product_name ?? x?.title, "—"),
          qty: num(x?.qty ?? x?.quantity ?? x?.count ?? 1),
          amount: num(x?.amount ?? x?.total ?? x?.sum ?? x?.revenue ?? 0),
          date: safeStr(x?.date, todayISO()),
          type: "SALE" as const,
        }))
      } catch {
        // backend ishlamasa demo bilan davom etadi
      }
    }

    let moveRows: RecentRow[] = []
    try {
      const moves = await warehouseApi.listMovements()
      moveRows = moves.map(mapMovementToRecentRow)
    } catch {}

    let data = [...salesRows, ...moveRows]
    const q = String(params.q || "").trim().toLowerCase()
    if (q) {
      data = data.filter(
        (x) =>
          x.name.toLowerCase().includes(q) ||
          String(x.type).toLowerCase().includes(q)
      )
    }

    if (params.sortKey) {
      const dir = params.sortDir === "asc" ? 1 : -1
      data = [...data].sort((a, b) => {
        if (params.sortKey === "name") return a.name.localeCompare(b.name) * dir
        if (params.sortKey === "qty") return (a.qty - b.qty) * dir
        if (params.sortKey === "amount") return (a.amount - b.amount) * dir
        if (params.sortKey === "type") return a.type.localeCompare(b.type) * dir
        return a.date.localeCompare(b.date) * dir
      })
    }
    const totalCount = data.length
    const start = (params.page - 1) * params.pageSize
    const rows = data.slice(start, start + params.pageSize)

    return { rows, totalCount }
  },
}
