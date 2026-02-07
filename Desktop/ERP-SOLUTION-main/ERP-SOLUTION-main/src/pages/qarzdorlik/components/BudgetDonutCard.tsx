import type { BudgetResponse } from "../qarzdorlik-api/types";

type Props = {
  title?: string;
  budget: BudgetResponse;
};

function money(v: number) {
  return `$${v.toLocaleString()}`;
}

export default function BudgetDonutCard({ title = "Byudjet", budget }: Props) {
  const max = Math.max(1, ...budget.items.map((x) => x.amount));
  const top = budget.items[0];
  const percent = top ? Math.round((top.amount / budget.total) * 100) : 0;

  const r = 44;
  const c = 2 * Math.PI * r;
  const fill = Math.min(1, budget.total / (budget.total || 1));
  const dash = Math.max(0.05, Math.min(0.95, fill)) * c;

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-extrabold text-slate-900">{title}</div>
          <div className="mt-1 text-xs text-slate-500">Kategoriya bo‘yicha</div>
        </div>
        <button className="h-8 w-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition">
          ↗
        </button>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className="relative h-28 w-28">
          <svg viewBox="0 0 120 120" className="h-full w-full">
            <circle cx="60" cy="60" r={r} strokeWidth="12" stroke="#E5E7EB" fill="none" />
            <circle
              cx="60"
              cy="60"
              r={r}
              strokeWidth="12"
              stroke="#6366F1"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${c - dash}`}
              transform="rotate(-90 60 60)"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-xs font-bold text-slate-500">{percent}%</div>
            <div className="text-[11px] text-slate-400">{money(budget.total)}</div>
          </div>
        </div>

        <div className="flex-1">
          <div className="text-xs font-bold text-slate-700">Jami: {money(budget.total)}</div>
          <div className="mt-2 grid gap-1">
            {budget.items.slice(0, 6).map((x) => (
              <div key={x.name} className="flex items-center justify-between text-xs">
                <span className="text-slate-600">{x.name}</span>
                <span className="font-bold text-slate-900">{money(x.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
