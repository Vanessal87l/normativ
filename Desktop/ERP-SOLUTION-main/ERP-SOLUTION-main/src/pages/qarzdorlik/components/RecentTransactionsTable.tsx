import type { RecentTxRow } from "../qarzdorlik-api/types";

type Props = {
  title?: string;
  rows: RecentTxRow[];
};

function money(v: number) {
  const sign = v < 0 ? "-" : "+";
  return `${sign}$${Math.abs(v).toLocaleString()}`;
}

export default function RecentTransactionsTable({ title = "So‘nggi tranzaksiyalar", rows }: Props) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
        <div>
          <div className="text-sm font-extrabold text-slate-900">{title}</div>
          <div className="mt-1 text-xs text-slate-500">Oxirgi kirim/chiqim</div>
        </div>

        <div className="flex items-center gap-2">
          <button className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
            Barchasi
          </button>
        </div>
      </div>

      <div className="overflow-x-auto p-4">
        <table className="min-w-[860px] w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-bold">Sana</th>
              <th className="px-4 py-3 font-bold">Miqdor</th>
              <th className="px-4 py-3 font-bold">To‘lov nomi</th>
              <th className="px-4 py-3 font-bold">Usul</th>
              <th className="px-4 py-3 font-bold">Kategoriya</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 text-slate-800">
            {rows.map((r) => (
              <tr key={String(r.id)} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-600">{r.dateTime}</td>

                <td className="px-4 py-3 font-extrabold">
                  <span className={r.amount < 0 ? "text-red-600" : "text-emerald-600"}>
                    {money(r.amount)}
                  </span>
                </td>

                <td className="px-4 py-3 font-semibold text-slate-900">{r.paymentName}</td>
                <td className="px-4 py-3 text-slate-600">{r.method}</td>
                <td className="px-4 py-3 text-slate-600">{r.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
