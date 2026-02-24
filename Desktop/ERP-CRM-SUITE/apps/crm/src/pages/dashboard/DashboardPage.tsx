import { useEffect, useMemo, useState } from "react";
import {
  fakeApi,
  type DashboardStats,
  type ActivityItem,
  type SalesTrendPoint,
} from "@/mock/fakeApi";

/* =====================================================
   ✅ GLASS CSS (buni index.css / globals.css ga qo‘sh)
   =====================================================

.glass-card{
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.12);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: 0 30px 120px -70px rgba(0,0,0,.85);
}
.glass-header{
  background: rgba(255,255,255,.07);
  border-bottom: 1px solid rgba(255,255,255,.10);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}
.glass-inner{
  background: rgba(255,255,255,.05);
  border: 1px solid rgba(255,255,255,.10);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
.glass-btn{
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.14);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

===================================================== */

function formatMoney(n: number) {
  if (!Number.isFinite(n)) return "0";
  return n.toLocaleString();
}
function max1(n: number) {
  return Math.max(1, n);
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [trend, setTrend] = useState<SalesTrendPoint[]>([]);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setErr(null);
      const res = await fakeApi.getDashboard();
      setStats(res.stats);
      setActivity(res.activity);
      setTrend(res.salesTrend);
    } catch {
      setErr("Failed to load dashboard (fake API).");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();

    // Optional: faqat boshqa tab (yoki window) localStorage o‘zgartirganda yangilansin
    const onStorage = () => load();
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("storage", onStorage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const maxTrend = useMemo(
    () => max1(Math.max(...trend.map((t) => t.totalUZS))),
    [trend]
  );

  return (
    <div className="rounded-3xl p-6 space-y-6 glass-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-2xl font-extrabold text-white">Dashboard</div>
          <div className="mt-1 text-sm text-white/60">
            Data comes from{" "}
            <span className="font-bold text-white/75">fake API</span>{" "}
            (localStorage DB + async).
          </div>
        </div>

        <button
          onClick={load}
          className="h-11 px-5 rounded-2xl glass-btn text-white font-extrabold hover:bg-white/10 transition"
        >
          Refresh
        </button>
      </div>

      {err && (
        <div className="rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-200 font-semibold">
          {err}
        </div>
      )}

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi
          loading={loading}
          title="Customers"
          value={stats?.totalCustomers ?? 0}
          sub="Total customers"
        />
        <Kpi
          loading={loading}
          title="Tasks"
          value={stats?.totalTasks ?? 0}
          sub={
            stats
              ? `${stats.todo} todo • ${stats.doing} doing • ${stats.done} done`
              : "—"
          }
        />
        <Kpi
          loading={loading}
          title="Sales (UZS)"
          value={stats?.totalSalesUZS ?? 0}
          sub={stats ? `${stats.dealsCount} deals` : "—"}
          money
        />
        <Kpi
          loading={loading}
          title="Conversion"
          value={stats?.conversionPct ?? 0}
          sub="Done / Total tasks"
          suffix="%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend */}
        <div className="rounded-2xl p-5 glass-inner">
          <div className="flex items-center justify-between">
            <div className="text-sm font-extrabold text-white">
              Sales trend (7 days)
            </div>
            <div className="text-xs font-bold text-white/50">
              fakeApi.getDashboard()
            </div>
          </div>

          <div className="mt-4 rounded-2xl p-4 glass-inner">
            <div className="h-[180px] flex items-end gap-3">
              {(loading ? Array.from({ length: 7 }) : trend).map(
                (b: any, i: number) => {
                  const total = loading ? 1 : (b.totalUZS as number);
                  const h = Math.max(8, Math.round((total / maxTrend) * 160));

                  return (
                    <div
                      key={loading ? i : b.key}
                      className="flex-1 flex flex-col items-center gap-2"
                    >
                      <div className="w-full rounded-xl bg-white/10 border border-white/10 overflow-hidden">
                        <div
                          className="w-full rounded-xl bg-white/25"
                          style={{ height: `${h}px` }}
                        />
                      </div>
                      <div className="text-[11px] text-white/50 font-bold">
                        {loading ? "—" : b.label}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          <div className="mt-3 text-xs text-white/45">
            Sales page’da add qilsang → localStorage DB o‘zgaradi → dashboard fake
            API orqali yangilanadi.
          </div>
        </div>

        {/* Activity */}
        <div className="rounded-2xl p-5 glass-inner">
          <div className="flex items-center justify-between">
            <div className="text-sm font-extrabold text-white">
              Recent activity
            </div>
            <div className="text-xs font-bold text-white/50">Tasks updates</div>
          </div>

          <div className="mt-4 space-y-3">
            {loading ? (
              <SkeletonList />
            ) : activity.length === 0 ? (
              <div className="h-[220px] rounded-2xl border border-dashed border-white/15 bg-white/5 backdrop-blur-md grid place-items-center text-white/45 text-sm">
                No activity yet
              </div>
            ) : (
              activity.map((a) => (
                <div key={a.id} className="rounded-2xl p-4 glass-inner">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-extrabold text-white truncate">
                        {a.title}
                      </div>
                      <div className="mt-1 text-xs text-white/45">
                        {new Date(a.when).toLocaleString()}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <Tag text={a.priority} />
                      <Tag text={a.status} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-3 text-xs text-white/45">
            Tasks page’da drag/drop yoki edit qilsang → activity yangilanadi.
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi(props: {
  loading: boolean;
  title: string;
  value: number;
  sub: string;
  money?: boolean;
  suffix?: string;
}) {
  const { loading, title, value, sub, money, suffix } = props;

  return (
    <div className="rounded-2xl p-4 glass-inner">
      <div className="text-xs font-extrabold text-white/60">{title}</div>
      <div className="mt-2 text-2xl font-extrabold text-white">
        {loading
          ? "…"
          : money
          ? `${formatMoney(value)}${suffix ?? ""}`
          : `${value}${suffix ?? ""}`}
      </div>
      <div className="mt-2 text-xs text-white/45 font-bold">
        {loading ? "Loading..." : sub}
      </div>
    </div>
  );
}

function Tag({ text }: { text: string }) {
  const cls =
    text === "RED"
      ? "bg-red-500/15 border-red-400/25 text-red-200"
      : text === "YELLOW"
      ? "bg-yellow-500/15 border-yellow-400/25 text-yellow-200"
      : text === "GREEN"
      ? "bg-emerald-500/15 border-emerald-400/25 text-emerald-200"
      : "bg-white/10 border-white/15 text-white/75";

  return (
    <span
      className={["text-[11px] font-extrabold px-3 py-1 rounded-full border", cls].join(
        " "
      )}
    >
      {text}
    </span>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-2xl p-4 glass-inner">
          <div className="h-3 w-2/3 bg-white/10 rounded mb-2" />
          <div className="h-3 w-1/2 bg-white/10 rounded" />
        </div>
      ))}
    </div>
  );
}
