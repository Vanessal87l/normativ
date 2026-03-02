import { useMemo, useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"

import { useDebounce } from "@/hooks/useDebounce"
import { createPurchase, fetchPurchases, type CreatePurchasePayload } from "@/Api/purchases.api"

import PurchasesToolbar from "./components/PurchasesToolbar"
import PurchasesFilters, { type PurchasesFiltersValue } from "./components/PurchasesFilters"
import PurchasesTable from "./components/PurchasesTable"
import CreatePurchaseModal from "./components/CreatePurchaseModal"

const DEFAULT_PAGE_SIZE = 20

export default function PurchasesListPage() {
  const nav = useNavigate()

  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [filters, setFilters] = useState<PurchasesFiltersValue>({
    supplier: "",
    date_from: "",
    date_to: "",
    status: "ALL",
    payment_status: "ALL",
    search: "",
  })

  const debouncedSearch = useDebounce(filters.search, 400)

  const queryParams = useMemo(() => {
    return {
      page,
      page_size: DEFAULT_PAGE_SIZE,
      supplier: filters.supplier ? Number(filters.supplier) : undefined,
      status: filters.status !== "ALL" ? filters.status : undefined,
      payment_status: filters.payment_status !== "ALL" ? filters.payment_status : undefined,
      search: debouncedSearch || undefined,
      date_from: filters.date_from || undefined,
      date_to: filters.date_to || undefined,
      ordering: "-created_at",
    }
  }, [page, debouncedSearch, filters])

  const q = useQuery({
    queryKey: ["purchases", "list", queryParams],
    queryFn: () => fetchPurchases(queryParams),
    staleTime: 10_000,
  })

  const createM = useMutation({
    mutationFn: (payload: CreatePurchasePayload) => createPurchase(payload),
    onSuccess: (data) => {
      setCreateOpen(false)
      q.refetch()
      nav(`/dashboard/purchases/${data.id}`)
    },
  })

  const rows = q.data?.results || []
  const total = q.data?.count || 0
  const loading = q.isLoading

  const handleExportCsv = () => {
    const header = [
      "purchase_no",
      "supplier_name",
      "received_date",
      "produced_date",
      "location_name",
      "status",
      "payment_status",
      "subtotal",
      "total",
      "paid_amount",
    ]
    const csv = [
      header.join(","),
      ...rows.map((r) =>
        [
          r.purchase_no,
          `"${(r.supplier_name || "").replaceAll('"', '""')}"`,
          r.received_date || "",
          r.produced_date || "",
          `"${(r.location_name || "").replaceAll('"', '""')}"`,
          r.status,
          r.payment_status,
          r.subtotal,
          r.total,
          r.paid_amount,
        ].join(",")
      ),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `xaridlar_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6">
      <div className="rounded-3xl bg-white/80 backdrop-blur border border-slate-200 shadow-sm">
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Xaridlar</h1>
              <p className="text-sm text-slate-500 mt-1">Ro'yxati</p>
            </div>

            <PurchasesToolbar
              onCreate={() => setCreateOpen(true)}
              onExport={handleExportCsv}
              onRefresh={() => q.refetch()}
            />
          </div>

          <div className="mt-5">
            <PurchasesFilters
              value={filters}
              onChange={(next) => {
                setPage(1)
                setFilters(next)
              }}
              onReset={() => {
                setPage(1)
                setFilters({
                  supplier: "",
                  date_from: "",
                  date_to: "",
                  status: "ALL",
                  payment_status: "ALL",
                  search: "",
                })
              }}
            />
          </div>

          <div className="mt-5">
            <PurchasesTable
              loading={loading}
              rows={rows}
              total={total}
              page={page}
              pageSize={DEFAULT_PAGE_SIZE}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>

      <CreatePurchaseModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        loading={createM.isPending}
        onSubmit={(payload) => createM.mutate(payload)}
      />
    </div>
  )
}
