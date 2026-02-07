import { useMemo, useState } from "react"
import StockTabs from "./components/StockTabs"
import StockFilters, { type StockFilterValue } from "./components/StockFilters"
import StockTable from "./components/StockTable"
import AddStockItemModal from "./components/AddStockItemModal"
import { warehouseApi } from "../api/warehouseApi"
import type { StockItemType } from "../api/types"
import { dayAgoISO, todayISO } from "../warehouse/shared/utils/date"


export default function StockOnHandPage() {
  const [type, setType] = useState<StockItemType>("FINISHED")
  const [filters, setFilters] = useState<StockFilterValue>({
    q: "",
    status: "ALL",
    category: "ALL",
    lowOnly: false,
    dateRange: { from: dayAgoISO(30), to: todayISO() },
  })

  const [addOpen, setAddOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const categories = useMemo(() => {
    return type === "RAW" ? ["Raw", "Packaging"] : ["Electronics", "Apparel", "Home Goods"]
  }, [type])

  const paramsBase = useMemo(() => {
    return {
      q: filters.q,
      type,
      status: filters.status,
      category: filters.category,
      lowOnly: filters.lowOnly,
      dateRange: filters.dateRange,
    }
  }, [filters, type])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <StockTabs value={type} onChange={setType} />

        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="rounded-2xl bg-slate-900 text-white px-4 py-2 text-xs font-extrabold hover:opacity-95"
        >
          + Mahsulot qo‘shish
        </button>
      </div>

      <StockFilters categories={categories} value={filters} onApply={setFilters} />

      <StockTable
        refreshKey={refreshKey}
        paramsBase={paramsBase}
        onFetch={(p) => warehouseApi.fetchStock(p)}
        onEditSave={(row) => warehouseApi.updateItem({ id: row.id, ...row })}
        onDelete={(id) => warehouseApi.deleteItem(id)}
        pageSize={7}
      />

      <AddStockItemModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={async (payload) => {
          await warehouseApi.createItem(payload)
          setRefreshKey((k) => k + 1) // ✅ table refresh
        }}
      />
    </div>
  )
}
