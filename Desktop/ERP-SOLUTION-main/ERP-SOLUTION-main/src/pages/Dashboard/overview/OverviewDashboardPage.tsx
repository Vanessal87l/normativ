import { useEffect, useMemo, useState } from "react";
import DashboardShell from "../components/DashboardShell";
import FilterBar from "../components/FilterBar";
import KpiCard from "../components/KpiCard";
import RangeTabs from "../components/RangeTabs";
import LineChart from "../components/LineChart";

import { dashboardApi } from "../api/dashboardApi";
import type { ChartRange, DashboardFilter, OverviewSummaryResponse, RecentQuery, RecentRow } from "../api/types";

type UiState = "loading" | "error" | "content";

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function cx(...a: Array<string | false | undefined | null>) {
  return a.filter(Boolean).join(" ");
}

export default function OverviewDashboardPage() {
  const userName = "John Doe";

  const [ui, setUi] = useState<UiState>("loading");

  const [filters, setFilters] = useState<DashboardFilter>(() => ({
    range: "month",
    date: todayISO(),
  }));

  const [rangeSales, setRangeSales] = useState<ChartRange>("1M");
  const [rangeSklad, setRangeSklad] = useState<ChartRange>("1M");

  const [summary, setSummary] = useState<OverviewSummaryResponse | null>(null);

  // recent table state
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const [rows, setRows] = useState<RecentRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const [salesSeries, setSalesSeries] = useState<{ label: string; value: number }[]>([]);
  const [skladSeries, setSkladSeries] = useState<{ label: string; value: number }[]>([]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // load summary
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setUi("loading");
        const res = await dashboardApi.getOverviewSummary(filters);
        if (cancelled) return;
        setSummary(res);
        setUi("content");
      } catch {
        if (cancelled) return;
        setUi("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [filters]);

  // load charts by range
  useEffect(() => {
    let cancelled = false;

    async function loadCharts() {
      const [a, b] = await Promise.all([
        dashboardApi.getOverviewSeries("sales", rangeSales),
        dashboardApi.getOverviewSeries("sklad", rangeSklad),
      ]);
      if (cancelled) return;
      setSalesSeries(a.series);
      setSkladSeries(b.series);
    }

    loadCharts();
    return () => {
      cancelled = true;
    };
  }, [rangeSales, rangeSklad]);

  // load recent table
  useEffect(() => {
    let cancelled = false;

    async function loadRecent() {
      const params: RecentQuery = {
        page,
        pageSize,
        q: q.trim() || undefined,
        sortKey: "date",
        sortDir: "desc",
        range: filters.range,
        date: filters.date,
      };
      const res = await dashboardApi.getOverviewRecent(params);
      if (cancelled) return;
      setRows(res.rows);
      setTotalCount(res.totalCount);
    }

    loadRecent();
    return () => {
      cancelled = true;
    };
  }, [page, pageSize, q, filters]);

  useEffect(() => {
    setPage(1);
  }, [q, filters]);

  const money = (n: number) => `${n.toLocaleString("uz-UZ")} so‘m`;

  const headerCard = "rounded-2xl bg-white border border-slate-200 shadow-sm";

  return (
    <DashboardShell>
      <div className="text-2xl font-extrabold text-slate-900">Xush kelibsiz, {userName}!</div>

      <div className="mt-4">
        <FilterBar onApply={(p) => setFilters(p)} />
      </div>

      {ui === "loading" && (
        <div className="mt-4 rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
          Yuklanmoqda...
        </div>
      )}

      {ui === "error" && (
        <div className="mt-4 rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
          <div className="text-lg font-extrabold text-slate-900">Xatolik</div>
          <div className="mt-2 text-sm text-slate-500">Demo API xatolik bo‘lishi mumkin.</div>
        </div>
      )}

      {ui === "content" && summary && (
        <div className="mt-4 grid gap-4">
          {/* ✅ KPI row (Sales) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {summary.salesKpis.map((k) => (
              <KpiCard key={k.title} kpi={k} />
            ))}
          </div>

          {/* ✅ KPI row (Sklad) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {summary.skladKpis.map((k) => (
              <KpiCard key={k.title} kpi={k} />
            ))}
          </div>

          {/* ✅ Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Sales chart */}
            <div className={cx(headerCard, "p-4")}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-extrabold text-slate-900">Sotuv trendi</div>
                  <div className="mt-1 text-xs text-slate-500">Foizlar va dinamikani ko‘rsatadi (demo)</div>
                </div>
                <RangeTabs value={rangeSales} onChange={setRangeSales} />
              </div>
              <div className="mt-3">
                <LineChart data={salesSeries} />
              </div>
            </div>

            {/* Sklad chart */}
            <div className={cx(headerCard, "p-4")}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-extrabold text-slate-900">Ombor harakatlari</div>
                  <div className="mt-1 text-xs text-slate-500">Kirim/chiqim dinamikasi (demo)</div>
                </div>
                <RangeTabs value={rangeSklad} onChange={setRangeSklad} />
              </div>
              <div className="mt-3">
                <LineChart data={skladSeries} />
              </div>
            </div>
          </div>

          {/* ✅ Recent table */}
          <div className={cx(headerCard, "p-4")}>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm font-extrabold text-slate-900">Oxirgi harakatlar</div>
                <div className="text-xs text-slate-500">Sotuv + ombor kirim/chiqim (filter bilan)</div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                  <span className="text-slate-400">🔎</span>
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Qidirish..."
                    className="w-56 bg-transparent text-xs text-slate-700 placeholder:text-slate-400 outline-none"
                  />
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                  Sahifa: <b>{page}</b> / {totalPages}
                </div>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-[900px] w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-bold">Nomi</th>
                    <th className="px-4 py-3 font-bold">Turi</th>
                    <th className="px-4 py-3 font-bold">Soni</th>
                    <th className="px-4 py-3 font-bold">Summa</th>
                    <th className="px-4 py-3 font-bold text-right">Sana</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-900">
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                        Hozircha ma’lumot yo‘q.
                      </td>
                    </tr>
                  ) : (
                    rows.map((r) => (
                      <tr key={String(r.id)} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-semibold">{r.name}</td>
                        <td className="px-4 py-3">
                          <span
                            className={cx(
                              "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold",
                              r.type === "SALE"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : r.type === "MOVE_IN"
                                ? "border-sky-200 bg-sky-50 text-sky-700"
                                : "border-rose-200 bg-rose-50 text-rose-700"
                            )}
                          >
                            {r.type === "SALE" ? "Sotuv" : r.type === "MOVE_IN" ? "Kirim" : "Chiqim"}
                          </span>
                        </td>
                        <td className="px-4 py-3">{r.qty}</td>
                        <td className="px-4 py-3">{r.amount ? money(r.amount) : "—"}</td>
                        <td className="px-4 py-3 text-right text-slate-600">{r.date}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 disabled:opacity-50"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ◀ Oldingi
              </button>
              <button
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 disabled:opacity-50"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Keyingi ▶
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
