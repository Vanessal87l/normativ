import { useMemo, useState } from "react"
import type { RangeKey } from "./data/types"

import KpiSparkCard from "./components/blocks/KpiSparkCard"
import ActiveCardsCard from "./components/blocks/ActiveCardsCard"
import CategoriesDonutCard from "./components/blocks/CategoriesDonutCard"
import DissectionBarCard from "./components/blocks/DissectionBarCard"
import SpendingParamsCard from "./components/blocks/SpendingParamsCard"
import TransactionsCard from "./components/blocks/TransactionsCard"
import InvestmentsCard from "./components/blocks/InvestmentsCard"
import IncomeExpenseLineCard from "./components/blocks/IncomeExpenseLineCard"

import { useFinanceDashboard } from "./data/useFinanceDashboard"

export default function MoliyaDashboardContent() {
  const [range, setRange] = useState<RangeKey>("OXIRGI_OY")
  const [search, setSearch] = useState("")

  const query = useMemo(() => {
    const s = search.trim()
    return { range, search: s || undefined }
  }, [range, search])

  // ✅ model bu yerda allaqachon ensure qilingan bo‘ladi
  const { ui, error, model, retry, hasBackend } = useFinanceDashboard(query)

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-4 md:p-5 shadow-sm text-slate-900">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div>
          <div className="text-sm font-semibold text-slate-500">Salom, {model.helloName} 👋</div>
          <div className="text-xl font-extrabold text-slate-900">Moliya</div>

          <div className="mt-1 text-xs text-slate-500">
            {ui === "loading" && "Yuklanmoqda..."}
            {ui === "error" && "Backend ulanmagan yoki xatolik."}
            {ui === "success" && hasBackend && "✅ Backend’dan real ma’lumot keldi"}
            {ui === "success" && !hasBackend && "✅ Demo rejim"}
          </div>
        </div>

        <div className="md:ml-auto flex flex-col sm:flex-row gap-2 sm:items-center">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Qidirish..."
            className="h-10 w-full sm:w-[280px] rounded-xl bg-white border border-slate-200 px-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none"
          />

          <select
            value={range}
            onChange={(e) => setRange(e.target.value as RangeKey)}
            className="h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 text-sm text-slate-700 outline-none"
          >
            <option value="OXIRGI_OY">Oxirgi oy</option>
            <option value="HAFTA">Hafta</option>
            <option value="BUGUN">Bugun</option>
            <option value="YIL">Yil</option>
          </select>

          {ui === "error" && (
            <button
              type="button"
              onClick={retry}
              className="h-10 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white hover:bg-slate-800"
            >
              Qayta urinish
            </button>
          )}
        </div>
      </div>

      {ui === "error" && (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <div className="font-extrabold">Xatolik</div>
          <div className="mt-1 text-xs">{error}</div>
        </div>
      )}

      <div className="mt-4 grid gap-4">
        <div className="grid gap-4 lg:grid-cols-4">
          <KpiSparkCard item={model.kpis[0]} />
          <KpiSparkCard item={model.kpis[1]} />
          <ActiveCardsCard cards={model.activeCards} />
          <CategoriesDonutCard slices={model.categories} />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <DissectionBarCard points={model.dissection} />
          </div>
          <SpendingParamsCard items={model.spending} />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <TransactionsCard rows={model.transactions} />
          <InvestmentsCard rows={model.investments} />
          <IncomeExpenseLineCard points={model.incomeExpense} />
        </div>
      </div>
    </div>
  )
}
