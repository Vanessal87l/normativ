// src/pages/purchases/PurchasesListPage.tsx
import { useMemo, useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"

import { useDebounce } from "@/hooks/useDebounce"
import { createPurchase, fetchPurchases, type CreatePurchasePayload } from "@/Api/purchases.api"

import PurchasesToolbar from "./components/PurchasesToolbar"
import PurchasesFilters, { type PurchasesFiltersValue } from "./components/PurchasesFilters"
import PurchasesTable from "./components/PurchasesTable"
import CreatePurchaseModal from "./components/CreatePurchaseModal"

import { DEMO_PURCHASES_LIST } from "./demo"
import type { PageResponse, PurchaseListItem } from "./types"

const DEFAULT_PAGE_SIZE = 20

export default function PurchasesListPage() {
  const nav = useNavigate()

  // ✅ DEMO mode (backend bo‘lmasa ham ishlaydi)
  const DEMO_MODE = true

  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)

  const [demo, setDemo] = useState<PageResponse<PurchaseListItem>>(DEMO_PURCHASES_LIST)

  const [filters, setFilters] = useState<PurchasesFiltersValue>({
    date_from: "",
    date_to: "",
    status: "ALL",
    organization_id: "",
    kontragent_id: "",
    warehouse_id: "",
    currency: "ALL",
    search: "",
  })

  const debouncedSearch = useDebounce(filters.search, 400)

  const queryParams = useMemo(() => {
    return {
      page,
      page_size: DEFAULT_PAGE_SIZE,
      search: debouncedSearch || undefined,
      date_from: filters.date_from || undefined,
      date_to: filters.date_to || undefined,
      status: filters.status !== "ALL" ? filters.status : undefined,
      organization_id: filters.organization_id || undefined,
      kontragent_id: filters.kontragent_id || undefined,
      warehouse_id: filters.warehouse_id || undefined,
      currency: filters.currency !== "ALL" ? filters.currency : undefined,
      ordering: "-created_at",
    }
  }, [page, debouncedSearch, filters])

  const q = useQuery({
    queryKey: ["purchases", "list", queryParams],
    queryFn: () => fetchPurchases(queryParams),
    staleTime: 10_000,
    enabled: !DEMO_MODE,
  })

  const createM = useMutation({
    mutationFn: (payload: CreatePurchasePayload) => createPurchase(payload),
    onSuccess: (data) => {
      setCreateOpen(false)
      q.refetch()
      nav(`/dashboard/purchases/${data.id}`)
    },
  })

  const rows = DEMO_MODE ? demo.results : (q.data?.results || [])
  const total = DEMO_MODE ? demo.count : (q.data?.count || 0)
  const loading = DEMO_MODE ? false : q.isLoading

  const handleExportCsv = () => {
    const header = ["number", "created_at", "kontragent", "organization", "total_amount", "currency", "status"]
    const csv = [
      header.join(","),
      ...rows.map((r) =>
        [
          r.number,
          r.created_at,
          `"${(r.kontragent_name || "").replaceAll('"', '""')}"`,
          `"${(r.organization_name || "").replaceAll('"', '""')}"`,
          r.total_amount,
          r.currency,
          r.status,
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

  const demoCreate = () => {
    const maxId = demo.results.reduce((m, r) => Math.max(m, r.id), 0)
    const nextId = maxId + 1
    const nextNumber = String(nextId).padStart(5, "0")

    const newRow: PurchaseListItem = {
      id: nextId,
      number: nextNumber,
      created_at: new Date().toISOString(),
      kontragent_name: "Demo Kontragent",
      organization_name: "Demo Org",
      currency: "UZS",
      total_amount: 150000,
      invoiced_amount: 0,
      paid_amount: 0,
      received_amount: 0,
      reserved_amount: 0,
      status: "DRAFT",
      comment: "Yangi demo xarid",
    }

    setDemo((prev) => ({
      ...prev,
      results: [newRow, ...prev.results],
      count: prev.count + 1,
    }))

    // ✅ create bosilganda darrov detailga o‘tkazamiz
    nav(`/dashboard/purchases/${nextId}`)
  }

  return (
    <div className="p-6">
      <div className="rounded-3xl bg-white/80 backdrop-blur border border-slate-200 shadow-sm">
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Xaridlar</h1>
              <p className="text-sm text-slate-500 mt-1">Ro‘yxati</p>

              {DEMO_MODE && (
                <p className="text-xs text-slate-500 mt-1">
                  Demo rejim yoqilgan (backend bo‘lmasa ham ishlaydi)
                </p>
              )}
            </div>

            <PurchasesToolbar
              onCreate={() => (DEMO_MODE ? demoCreate() : setCreateOpen(true))}
              onExport={handleExportCsv}
              onRefresh={() => (DEMO_MODE ? null : q.refetch())}
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
                  date_from: "",
                  date_to: "",
                  status: "ALL",
                  organization_id: "",
                  kontragent_id: "",
                  warehouse_id: "",
                  currency: "ALL",
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

      {!DEMO_MODE && (
        <CreatePurchaseModal
          open={createOpen}
          onOpenChange={setCreateOpen}
          loading={createM.isPending}
          onSubmit={(payload) => createM.mutate(payload)}
        />
      )}
    </div>
  )
}
