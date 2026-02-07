import type { ChartPoint } from "../qarzdorlik-api/types";

type Props = {
  title?: string;
  series: ChartPoint[];
};

export default function DebtFlowChartCard({ title = "Pul oqimi", series }: Props) {
  const max = Math.max(
    1,
    ...series.flatMap((p) => [p.income, p.expense])
  );

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-extrabold text-slate-900">{title}</div>
          <div className="mt-1 text-xs text-slate-500">Kirim vs Chiqim</div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-2 text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
            Kirim
          </span>
          <span className="inline-flex items-center gap-2 text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-200" />
            Chiqim
          </span>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <div className="min-w-[560px]">
          <div className="flex items-end gap-4 h-44">
            {series.map((p) => {
              const hi = Math.round((p.income / max) * 160);
              const he = Math.round((p.expense / max) * 160);
              return (
                <div key={p.label} className="flex-1">
                  <div className="flex items-end justify-center gap-2">
                    <div
                      className="w-6 rounded-xl bg-indigo-500"
                      style={{ height: hi }}
                      title={`Kirim: ${p.income}`}
                    />
                    <div
                      className="w-6 rounded-xl bg-indigo-200"
                      style={{ height: he }}
                      title={`Chiqim: ${p.expense}`}
                    />
                  </div>
                  <div className="mt-2 text-center text-[11px] font-semibold text-slate-500">
                    {p.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
