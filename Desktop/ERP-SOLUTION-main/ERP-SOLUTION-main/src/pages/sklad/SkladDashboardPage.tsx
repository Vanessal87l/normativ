import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import FilterBar from "../sotuv/components/FilterBar";
import StatCard from "../sotuv/components/StatCard";
import MiniInfoCard from "../sotuv/components/MiniInfoCard";
import SalesOverviewCard from "../sotuv/components/SalesOverviewCard";

import { skladApi } from "./sklad-api/skladApi";
import type {
  ChartPoint,
  ChartRange,
  DashboardFilter,
  MovementRow,
  MovementsQuery,
  WarehouseStatItem,
} from "./sklad-api/types";

import RecentMovementsTable from "./components/RecentMovementsTable";

type UiState = "loading" | "empty" | "error" | "content";
const cardBase = "rounded-xl bg-white border border-slate-200 shadow-sm";

function Skeleton() {
  return (
    <div className={`${cardBase} p-4`}>
      <div className="h-4 w-40 glass rounded" />
      <div className="mt-3 h-10 w-56 glass rounded" />
      <div className="mt-3 h-24 w-full glass rounded" />
    </div>
  );
}

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function SkladDashboardPage() {
  const nav = useNavigate();

  const [ui, setUi] = useState<UiState>("loading");
  const userName = "John Doe";

  // ✅ Filter (Bugun/Hafta/Oy + date)
  const [filters, setFilters] = useState<DashboardFilter>(() => ({
    range: "month",
    date: todayISO(),
  }));

  const [stats, setStats] = useState<WarehouseStatItem[]>([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [pendingTransfers, setPendingTransfers] = useState(0);

  // chart
  const [chartRange, setChartRange] = useState<ChartRange>("1M");
  const [series, setSeries] = useState<ChartPoint[]>([]);

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setUi("loading");

        const [summary, chart] = await Promise.all([
          skladApi.getSummary(filters),
          skladApi.getStockSeries(chartRange),
        ]);

        if (cancelled) return;

        setStats(summary.stats);
        setLowStockCount(summary.lowStockCount);
        setPendingTransfers(summary.pendingTransfers);
        setSeries(chart.series);

        setUi(summary.stats.length === 0 ? "empty" : "content");
      } catch {
        if (cancelled) return;
        setUi("error");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [filters, chartRange, reloadKey]);

  const handleRetry = () => setReloadKey((k) => k + 1);
  const handleApplyFilters = (payload: DashboardFilter) => setFilters(payload);

  // ✅ table fetch (filters ham ketadi)
  const fetchMovements = useMemo(() => {
    return (params: MovementsQuery) =>
      skladApi.getMovements({
        ...params,
        range: filters.range,
        date: filters.date,
      });
  }, [filters]);

  let body: React.ReactNode;

  if (ui === "loading") {
    body = (
      <div className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton /><Skeleton /><Skeleton /><Skeleton />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2"><Skeleton /></div>
          <div className="grid gap-4"><Skeleton /><Skeleton /></div>
        </div>
        <Skeleton />
      </div>
    );
  } else if (ui === "empty") {
    body = (
      <div className={`${cardBase} p-10 text-center`}>
        <div className="text-lg font-extrabold text-white">Hozircha ma’lumot yo‘q</div>
        <div className="mt-2 text-sm text-white">
          Filtrlarni o‘zgartirib ko‘ring yoki backenddan data kelishini tekshiring.
        </div>
      </div>
    );
  } else if (ui === "error") {
    body = (
      <div className={`${cardBase} p-10`}>
        <div className="text-lg font-extrabold text-white">Xatolik yuz berdi</div>
        <div className="mt-2 text-sm text-white">
          API error yoki internet muammo bo‘lishi mumkin.
        </div>
        <button
          type="button"
          onClick={handleRetry}
          className="mt-4 rounded-md glass text-white px-4 py-2 text-sm font-bold"
        >
          Qayta urinib ko‘rish
        </button>
      </div>
    );
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
              title="Sklad harakati ko‘rinishi"
              series={series}
              activeRange={chartRange}
              onRangeChange={setChartRange}
            />
          </div>

          <div className="grid gap-4">
            <MiniInfoCard
              title="Kam qolgan mahsulotlar"
              big={String(lowStockCount)}
              badgeText="Diqqat talab"
              badgeType="danger"
              icon="🔔"
            />
            <MiniInfoCard
              title="Kutilayotgan ko‘chirishlar"
              big={String(pendingTransfers)}
              badgeText="Jarayonda"
              badgeType="neutral"
              icon="🚚"
            />
          </div>
        </div>

        {/* Movements table */}
        <RecentMovementsTable
          onFetch={fetchMovements}
          onEditSave={(row: MovementRow) => skladApi.updateMovement(row)}
          onDelete={(id) => skladApi.deleteMovement(id)}
          pageSize={5}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen glass">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* ✅ HEADER + Omborga o'tish tugmasi */}
        <div className="mt-1 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-extrabold text-white">
              Xush kelibsiz, {userName}!
            </h1>
            <p className="text-sm text-white">
              Sklad ko‘rsatkichlari va harakatlar
            </p>
          </div>

          <button
            type="button"
            onClick={() => nav("/dashboard/sklad/warehouse/overview")}
            className="rounded-xl glass text-white px-4 py-2 text-xs font-bold"
          >
            Omborga kirish →
          </button>

        </div>

        <div className="mt-4">
          <FilterBar onApply={handleApplyFilters} />
        </div>

        <div className="mt-4">{body}</div>
      </div>
    </div>
  );
}
