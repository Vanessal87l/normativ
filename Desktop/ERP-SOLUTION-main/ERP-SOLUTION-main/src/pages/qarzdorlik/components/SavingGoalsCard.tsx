import type { SavingGoal } from "../qarzdorlik-api/types";

type Props = {
  title?: string;
  goals: SavingGoal[];
};

function money(v: number) {
  return `$${v.toLocaleString()}`;
}

export default function SavingGoalsCard({ title = "Jamg‘arma maqsadlari", goals }: Props) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-extrabold text-slate-900">{title}</div>
          <div className="mt-1 text-xs text-slate-500">Progress</div>
        </div>
        <button className="h-8 w-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition">
          ↗
        </button>
      </div>

      <div className="mt-4 grid gap-4">
        {goals.map((g) => {
          const pct = Math.max(0, Math.min(100, Math.round((g.current / g.target) * 100)));
          return (
            <div key={String(g.id)}>
              <div className="flex items-center justify-between text-xs">
                <div className="font-bold text-slate-800">{g.title}</div>
                <div className="text-slate-500">{money(g.current)} / {money(g.target)}</div>
              </div>

              <div className="mt-2 h-3 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-indigo-500"
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="mt-1 text-[11px] text-slate-500">{pct}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
