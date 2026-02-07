import { useNavigate } from "react-router-dom"

export default function QuickActionsCard() {
  const nav = useNavigate()

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
      <div className="text-sm font-extrabold text-slate-900">Tezkor amallar</div>

      <div className="mt-3 grid gap-2">
        <button
          type="button"
          onClick={() => nav("/dashboard/sklad/warehouse/stock")}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-slate-800 hover:bg-slate-50"
        >
          Qoldiqni ko‘rish →
        </button>

        <button
          type="button"
          onClick={() => alert("Keyin: Kirim/Chiqim qo‘shish (backend bo‘lsa modal/page)")}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-slate-800 hover:bg-slate-50"
        >
          Kirim/Chiqim qo‘shish (demo)
        </button>

        <button
          type="button"
          onClick={() => alert("Keyin: Inventarizatsiya page")}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-slate-800 hover:bg-slate-50"
        >
          Inventarizatsiya (demo)
        </button>
      </div>
    </div>
  )
}
