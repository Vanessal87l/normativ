// import { api } from "./axios";
import type {
  ChartRange,
  DashboardFilter,
  DashboardSummaryResponse,
  Paginated,
  RecentSaleRow,
  RecentSalesQuery,
  SalesSeriesResponse,
} from "./types";

/* ===============================
   🔧 HOZIRCHA MOCK DATA
   =============================== */

let MOCK_SALES: RecentSaleRow[] = [
  { id: 1, name: "Yusuf-Latipov", soni: 5, narxi: 250, data: "2025-10-10" },
  { id: 2, name: "Madaminbek-Abduxoshimov", soni: 2, narxi: 180, data: "2025-07-11" },
  { id: 3, name: "Azam-Atxamov", soni: 1, narxi: 10, data: "2025-09-20" },
  { id: 4, name: "MuhammadSodiq", soni: 10, narxi: 150, data: "2025-09-20" },
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ===============================
   ✅ DASHBOARD API
   =============================== */

type Point = { label: string; value: number };

// ✅ date helpers (demo filter uchun)
function parseISODate(s: string) {
  const d = new Date(s + "T00:00:00");
  return Number.isNaN(d.getTime()) ? null : d;
}

function startOfWeek(d: Date) {
  // Monday-start week
  const copy = new Date(d);
  const day = copy.getDay(); // 0=Sun
  const diff = (day === 0 ? -6 : 1) - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfWeek(d: Date) {
  const s = startOfWeek(d);
  const e = new Date(s);
  e.setDate(e.getDate() + 6);
  e.setHours(23, 59, 59, 999);
  return e;
}

function startOfMonth(d: Date) {
  const s = new Date(d.getFullYear(), d.getMonth(), 1);
  s.setHours(0, 0, 0, 0);
  return s;
}

function endOfMonth(d: Date) {
  const e = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  e.setHours(23, 59, 59, 999);
  return e;
}

function inRange(dateISO: string, filters?: DashboardFilter) {
  if (!filters?.date || !filters?.range) return true;

  const rowD = parseISODate(dateISO);
  const base = parseISODate(filters.date);
  if (!rowD || !base) return true;

  if (filters.range === "today") {
    return (
      rowD.getFullYear() === base.getFullYear() &&
      rowD.getMonth() === base.getMonth() &&
      rowD.getDate() === base.getDate()
    );
  }

  if (filters.range === "week") {
    const s = startOfWeek(base);
    const e = endOfWeek(base);
    return rowD >= s && rowD <= e;
  }

  // month
  const s = startOfMonth(base);
  const e = endOfMonth(base);
  return rowD >= s && rowD <= e;
}

export const dashboardApi = {
  // 🔹 SUMMARY (StatCard + MiniInfoCard) ✅ filter qabul qiladi
  async getSummary(filters?: DashboardFilter): Promise<DashboardSummaryResponse> {
    // 🔜 backend bo‘lsa:
    // const res = await api.get("/dashboard/summary/", { params: filters })
    // return res.data

    await sleep(250);

    // ✅ demo: filter bo‘yicha MOCK_SALES dan hisoblab ko‘rsatamiz
    const filtered = filters ? MOCK_SALES.filter((r) => inRange(r.data, filters)) : MOCK_SALES;

    const totalQty = filtered.reduce((a, r) => a + r.soni, 0);
    const totalRevenue = filtered.reduce((a, r) => a + r.soni * r.narxi, 0);

    return {
      stats: [
        { title: "Jami daromad", value: `$${totalRevenue.toFixed(2)}`, sub: "filtr bo‘yicha", icon: "💰", tone: "success" },
        { title: "Sotilgan mahsulotlar", value: String(totalQty), sub: "filtr bo‘yicha", icon: "📦" },
        { title: "Top kategoriya", value: "—", sub: "demo", icon: "🏷️" },
        { title: "Top mahsulot", value: "—", sub: "demo", icon: "🎧" },
      ],
      lowStockWarnings: 18,
      unpaidOrders: 7,
    };
  },

  // 🔹 CHART (demo + backend-ready)
  async getSalesSeries(range: ChartRange): Promise<SalesSeriesResponse> {
    const demoByRange: Record<ChartRange, Point[]> = {
      "1W": [
        { label: "Mon", value: 1200 },
        { label: "Tue", value: 1600 },
        { label: "Wed", value: 900 },
        { label: "Thu", value: 2100 },
        { label: "Fri", value: 1800 },
        { label: "Sat", value: 2400 },
        { label: "Sun", value: 2000 },
      ],
      "1M": [
        { label: "01", value: 900 },
        { label: "05", value: 1300 },
        { label: "10", value: 1100 },
        { label: "15", value: 1700 },
        { label: "20", value: 1600 },
        { label: "25", value: 1900 },
        { label: "30", value: 2200 },
      ],
      "3M": [
        { label: "W1", value: 4200 },
        { label: "W2", value: 5100 },
        { label: "W3", value: 4800 },
        { label: "W4", value: 5600 },
        { label: "W5", value: 5300 },
        { label: "W6", value: 6100 },
      ],
      "1Y": [
        { label: "Jan", value: 8200 },
        { label: "Feb", value: 9150 },
        { label: "Mar", value: 8750 },
        { label: "Apr", value: 9400 },
        { label: "May", value: 10200 },
        { label: "Jun", value: 9800 },
        { label: "Jul", value: 11050 },
        { label: "Aug", value: 10700 },
        { label: "Sep", value: 11400 },
        { label: "Oct", value: 12100 },
        { label: "Nov", value: 11850 },
        { label: "Dec", value: 12500 },
      ],
    };

    try {
      await sleep(250);
      return { range, series: demoByRange[range] };

      // 🔜 BACKEND ulanganida:
      // const res = await api.get("/dashboard/sales-series/", { params: { range } })
      // return res.data
    } catch {
      return { range, series: demoByRange[range] };
    }
  },

  // 🔹 TABLE LIST ✅ filter params qabul qiladi (range/date)
  async getRecentSales(params: RecentSalesQuery): Promise<Paginated<RecentSaleRow>> {
    // 🔜 backend:
    // const res = await api.get("/sales/", { params })
    // return res.data

    await sleep(250);

    let data = [...MOCK_SALES];

    // ✅ filter bar
    if (params.range && params.date) {
      data = data.filter((r) =>
        inRange(r.data, { range: params.range, date: params.date })
      );
    }

    // search
    if (params.q) {
      data = data.filter((r) => r.name.toLowerCase().includes(params.q!.toLowerCase()));
    }

    // sort
    const dir = params.sortDir === "asc" ? 1 : -1;
    data.sort((a, b) => {
      if (params.sortKey === "soni") return (a.soni - b.soni) * dir;
      if (params.sortKey === "narxi") return (a.narxi - b.narxi) * dir;
      if (params.sortKey === "name") return a.name.localeCompare(b.name) * dir;
      return a.data.localeCompare(b.data) * dir;
    });

    const totalCount = data.length;
    const start = (params.page - 1) * params.pageSize;
    const rows = data.slice(start, start + params.pageSize);

    return { rows, totalCount };
  },

  // 🔹 UPDATE
  async updateSale(row: RecentSaleRow): Promise<RecentSaleRow> {
    // 🔜 backend:
    // const res = await api.patch(`/sales/${row.id}/`, row)
    // return res.data

    await sleep(250);
    MOCK_SALES = MOCK_SALES.map((x) => (x.id === row.id ? row : x));
    return row;
  },

  // 🔹 DELETE
  async deleteSale(id: number | string): Promise<void> {
    // 🔜 backend:
    // await api.delete(`/sales/${id}/`)

    await sleep(250);
    MOCK_SALES = MOCK_SALES.filter((x) => x.id !== id);
  },
};
