import type { RecentRow } from "../api/types"

function money(n: number) {
  return `${n.toLocaleString("uz-UZ")} so‘m`
}

export default function RecentTable({
  rows,
  q,
  onQChange,
  page,
  totalPages,
  onPrev,
  onNext,
}: {
  rows: RecentRow[]
  q: string
  onQChange: (v: string) => void
  page: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
}) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm font-extrabold text-slate-900">Oxirgi harakatlar</div>
          <div className="text-xs text-slate-500">Sotuv + ombor kirim/chiqim</div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
            <span className="text-slate-400">🔎</span>
            <input
              value={q}
              onChange={(e) => onQChange(e.target.value)}
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
                  <td className="px-4 py-3">{r.type}</td>
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
          onClick={onPrev}
        >
          ◀ Oldingi
        </button>
        <button
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 disabled:opacity-50"
          disabled={page >= totalPages}
          onClick={onNext}
        >
          Keyingi ▶
        </button>
      </div>
    </div>
  )
}
