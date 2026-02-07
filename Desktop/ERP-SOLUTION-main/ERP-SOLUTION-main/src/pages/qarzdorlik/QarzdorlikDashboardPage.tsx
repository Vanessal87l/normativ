import { useEffect, useState } from "react";
import FilterBar from "../sotuv/components/FilterBar";

import { qarzdorlikApi } from "./qarzdorlik-api/qarzdorlikApi";
import type { DashboardFilter, DebtSummaryResponse } from "./qarzdorlik-api/types";

import DebtStatCard from "./components/DebtStatCard";
import DebtFlowChartCard from "./components/DebtFlowChartCard";
import BudgetDonutCard from "./components/BudgetDonutCard";
import SavingGoalsCard from "./components/SavingGoalsCard";
import RecentTransactionsTable from "./components/RecentTransactionsTable";

type UiState = "loading" | "error" | "content";

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function QarzdorlikDashboardPage() {
  const userName = "John Doe";
  const [ui, setUi] = useState<UiState>("loading");

  const [filters, setFilters] = useState<DashboardFilter>(() => ({
    range: "month",
    date: todayISO(),
  }));

  const [data, setData] = useState<DebtSummaryResponse | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setUi("loading");
        const res = await qarzdorlikApi.getSummary(filters);
        if (cancelled) return;
        setData(res);
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
  }, [filters, reloadKey]);

  const handleApplyFilters = (payload: DashboardFilter) => setFilters(payload);

  if (ui === "loading") {
    return (
      <div className="min-h-screen bg-gray-100 rounded-2xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
            <div className="h-6 w-56 rounded bg-slate-100" />
            <div className="mt-4 h-10 w-full rounded bg-slate-100" />
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="h-28 rounded-2xl bg-slate-100" />
              <div className="h-28 rounded-2xl bg-slate-100" />
              <div className="h-28 rounded-2xl bg-slate-100" />
              <div className="h-28 rounded-2xl bg-slate-100" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (ui === "error" || !data) {
    return (
      <div className="min-h-screen bg-gray-100 rounded-2xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-8">
            <div className="text-lg font-extrabold text-slate-900">Xatolik yuz berdi</div>
            <div className="mt-2 text-sm text-slate-500">Backend yoki internet muammo bo‘lishi mumkin.</div>
            <button
              onClick={() => setReloadKey((k) => k + 1)}
              className="mt-4 rounded-md bg-slate-900 text-white px-4 py-2 text-sm font-bold"
            >
              Qayta urinib ko‘rish
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 rounded-2xl">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Xush kelibsiz, {userName}!
            </h1>
            <div className="mt-1 text-sm text-slate-500">
              Qarzdorlik va moliyaviy ko‘rsatkichlar paneli
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
              Widgetlarni boshqarish
            </button>
            <button className="rounded-xl bg-indigo-600 text-white px-3 py-2 text-xs font-bold hover:opacity-95">
              + Yangi widget
            </button>
          </div>
        </div>

        {/* FilterBar */}
        <div className="mt-4">
          <FilterBar onApply={handleApplyFilters} />
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          {data.stats.map((s) => (
            <DebtStatCard
              key={s.title}
              title={s.title}
              value={s.value}
              unit={s.unit}
              deltaPercent={s.deltaPercent}
              tone={s.tone}
            />
          ))}
        </div>

        {/* Flow + Budget */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <DebtFlowChartCard series={data.flow.series} />
          </div>
          <BudgetDonutCard budget={data.budget} />
        </div>

        {/* Recent transactions + Goals */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <RecentTransactionsTable rows={data.recent} />
          </div>
          <SavingGoalsCard goals={data.goals} />
        </div>
      </div>
    </div>
  );
}
