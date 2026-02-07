// import { api } from "./axios";
import type { ChartRange, DashboardFilter, OverviewSummaryResponse, RecentQuery, RecentRow } from "./types";
import { buildOverviewDemo, demoSalesSeries, demoSkladSeries, sleep } from "./mock";

function inRange(dateISO: string, filter: DashboardFilter) {
  const base = new Date(filter.date);
  if (Number.isNaN(base.getTime())) return true;

  const d = new Date(dateISO);
  if (Number.isNaN(d.getTime())) return true;

  const start = new Date(base);
  const end = new Date(base);

  if (filter.range === "today") {
    // start/end: o'sha kun
  } else if (filter.range === "week") {
    start.setDate(base.getDate() - 6);
  } else {
    start.setDate(1);
  }

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return d >= start && d <= end;
}

export const dashboardApi = {
  // ✅ OVERVIEW SUMMARY (default dashboard)
  async getOverviewSummary(filters: DashboardFilter): Promise<OverviewSummaryResponse> {
    // 🔜 backend kelganda:
    // const res = await api.get("/dashboard/overview/", { params: filters })
    // return res.data

    await sleep(250);
    const demo = buildOverviewDemo();

    // demo: table rows filter
    demo.rows = demo.rows.filter((r) => inRange(r.date, filters));
    return demo;
  },

  // ✅ chart series (range bo'yicha)
  async getOverviewSeries(which: "sales" | "sklad", range: ChartRange): Promise<{ range: ChartRange; series: { label: string; value: number }[] }> {
    // 🔜 backend:
    // const res = await api.get("/dashboard/series/", { params: { which, range } })
    // return res.data

    await sleep(200);
    return {
      range,
      series: which === "sales" ? demoSalesSeries(range) : demoSkladSeries(range),
    };
  },

  // ✅ Recent table (search/sort/pagination + filter)
  async getOverviewRecent(params: RecentQuery): Promise<{ rows: RecentRow[]; totalCount: number }> {
    // 🔜 backend:
    // const res = await api.get("/dashboard/recent/", { params })
    // return res.data

    await sleep(200);

    // demo: local filter/sort/page (mock.ts ichidagi rowsdan)
    const demo = buildOverviewDemo();
    let data = [...demo.rows];

    if (params.range && params.date) {
      data = data.filter((r) => inRange(r.date, { range: params.range, date: params.date }));
    }

    if (params.q) {
      const qq = params.q.toLowerCase();
      data = data.filter((r) => r.name.toLowerCase().includes(qq));
    }

    const sortKey = params.sortKey ?? "date";
    const sortDir = params.sortDir ?? "desc";
    const dir = sortDir === "asc" ? 1 : -1;

    data.sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name) * dir;
      if (sortKey === "qty") return (a.qty - b.qty) * dir;
      if (sortKey === "amount") return (a.amount - b.amount) * dir;
      if (sortKey === "type") return a.type.localeCompare(b.type) * dir;
      return a.date.localeCompare(b.date) * dir;
    });

    const totalCount = data.length;
    const start = (params.page - 1) * params.pageSize;
    const rows = data.slice(start, start + params.pageSize);

    return { rows, totalCount };
  },
};
