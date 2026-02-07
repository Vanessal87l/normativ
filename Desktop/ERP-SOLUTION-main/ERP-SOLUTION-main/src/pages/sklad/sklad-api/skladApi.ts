// import { api } from "../../Dashboard/dashboard-api/axios";
import type {
  ChartRange,
  DashboardFilter,
  MovementRow,
  MovementsQuery,
  Paginated,
  StockSeriesResponse,
  WarehouseSummaryResponse,
} from "./types";

let MOCK_MOVES: MovementRow[] = [
  { id: 1, product: "Serio C1", type: "KIRIM", qty: 120, warehouse: "Asosiy ombor", date: "2026-02-01" },
  { id: 2, product: "Serio C2", type: "CHIQIM", qty: 40, warehouse: "Asosiy ombor", date: "2026-02-02" },
  { id: 3, product: "Xomashyo A", type: "KOCHIRISH", qty: 25, warehouse: "Filial ombor", date: "2026-02-03" },
  { id: 4, product: "Qadoq B", type: "ADJUST", qty: 6, warehouse: "Asosiy ombor", date: "2026-02-04" },
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function toISO(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function inRange(dateISO: string, f?: DashboardFilter) {
  if (!f?.date) return true;
  const base = new Date(f.date);
  const d = new Date(dateISO);

  if (Number.isNaN(d.getTime()) || Number.isNaN(base.getTime())) return true;

  if (f.range === "today") {
    return toISO(d) === toISO(base);
  }

  if (f.range === "week") {
    // week: base - 6 days .. base
    const start = new Date(base);
    start.setDate(base.getDate() - 6);
    return d >= start && d <= base;
  }

  // month: base month
  return d.getFullYear() === base.getFullYear() && d.getMonth() === base.getMonth();
}

export const skladApi = {
  async getSummary(filters?: DashboardFilter): Promise<WarehouseSummaryResponse> {
    // 🔜 backend:
    // const res = await api.get("/warehouse/summary/", { params: filters })
    // return res.data

    await sleep(250);

    const filtered = MOCK_MOVES.filter((m) => inRange(m.date, filters));
    const inCount = filtered.filter((x) => x.type === "KIRIM").reduce((a, x) => a + x.qty, 0);
    const outCount = filtered.filter((x) => x.type === "CHIQIM").reduce((a, x) => a + x.qty, 0);

    return {
      stats: [
        { title: "Kirim (jami)", value: inCount, sub: "filtr bo‘yicha", icon: "📥", tone: "success" },
        { title: "Chiqim (jami)", value: outCount, sub: "filtr bo‘yicha", icon: "📤", tone: "danger" },
        { title: "Omborlar", value: 2, sub: "demo", icon: "🏬" },
        { title: "Pozitsiyalar", value: 128, sub: "demo", icon: "📦" },
      ],
      lowStockCount: 12,
      pendingTransfers: 3,
    };
  },

  async getStockSeries(range: ChartRange): Promise<StockSeriesResponse> {
    // 🔜 backend:
    // const res = await api.get("/warehouse/stock-series/", { params: { range } })
    // return res.data

    await sleep(250);

    const demo: Record<ChartRange, { label: string; value: number }[]> = {
      "1W": [
        { label: "Mon", value: 40 },
        { label: "Tue", value: 55 },
        { label: "Wed", value: 38 },
        { label: "Thu", value: 62 },
        { label: "Fri", value: 70 },
        { label: "Sat", value: 49 },
        { label: "Sun", value: 58 },
      ],
      "1M": [
        { label: "01", value: 120 },
        { label: "05", value: 160 },
        { label: "10", value: 110 },
        { label: "15", value: 190 },
        { label: "20", value: 175 },
        { label: "25", value: 210 },
        { label: "30", value: 240 },
      ],
      "3M": [
        { label: "W1", value: 520 },
        { label: "W2", value: 610 },
        { label: "W3", value: 560 },
        { label: "W4", value: 740 },
        { label: "W5", value: 690 },
        { label: "W6", value: 810 },
      ],
      "1Y": [
        { label: "Jan", value: 2100 },
        { label: "Feb", value: 2400 },
        { label: "Mar", value: 2300 },
        { label: "Apr", value: 2600 },
        { label: "May", value: 2800 },
        { label: "Jun", value: 2700 },
        { label: "Jul", value: 3000 },
        { label: "Aug", value: 2950 },
        { label: "Sep", value: 3100 },
        { label: "Oct", value: 3300 },
        { label: "Nov", value: 3250 },
        { label: "Dec", value: 3450 },
      ],
    };

    return { range, series: demo[range] };
  },

  async getMovements(params: MovementsQuery): Promise<Paginated<MovementRow>> {
    // 🔜 backend:
    // const res = await api.get("/warehouse/movements/", { params })
    // return res.data

    await sleep(250);

    const f: DashboardFilter | undefined =
      params.range && params.date ? { range: params.range, date: params.date } : undefined;

    let data = [...MOCK_MOVES].filter((m) => inRange(m.date, f));

    if (params.q) {
      const qq = params.q.toLowerCase();
      data = data.filter((x) =>
        [x.product, x.type, x.warehouse, x.date].some((v) => String(v).toLowerCase().includes(qq))
      );
    }

    const sortKey = params.sortKey ?? "date";
    const sortDir = params.sortDir ?? "desc";
    const dir = sortDir === "asc" ? 1 : -1;

    data.sort((a, b) => {
      if (sortKey === "qty") return (a.qty - b.qty) * dir;
      if (sortKey === "product") return a.product.localeCompare(b.product) * dir;
      if (sortKey === "type") return a.type.localeCompare(b.type) * dir;
      if (sortKey === "warehouse") return a.warehouse.localeCompare(b.warehouse) * dir;
      return a.date.localeCompare(b.date) * dir;
    });

    const totalCount = data.length;
    const start = (params.page - 1) * params.pageSize;
    const rows = data.slice(start, start + params.pageSize);

    return { rows, totalCount };
  },

  async updateMovement(row: MovementRow): Promise<MovementRow> {
    // 🔜 backend:
    // const res = await api.patch(`/warehouse/movements/${row.id}/`, row)
    // return res.data

    await sleep(250);
    MOCK_MOVES = MOCK_MOVES.map((x) => (x.id === row.id ? row : x));
    return row;
  },

  async deleteMovement(id: number | string): Promise<void> {
    // 🔜 backend:
    // await api.delete(`/warehouse/movements/${id}/`)

    await sleep(250);
    MOCK_MOVES = MOCK_MOVES.filter((x) => x.id !== id);
  },
};
