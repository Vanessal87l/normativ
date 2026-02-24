// src/pages/purchases/PurchaseDetailPage.tsx
import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { fetchPurchase, patchPurchase } from "@/Api/purchases.api"

import PurchaseHeader from "./components/PurchaseHeader"
import PurchaseForm from "./components/PurchaseForm"
import PurchaseItemsTable from "./components/PurchaseItemsTable"
import type { PurchaseDetail } from "./types"
import { DEMO_PURCHASES_DETAIL } from "./demo"
import PurchaseTabs from "./components/PurchaseTabs"

export default function PurchaseDetailPage() {
  const { id } = useParams()
  const purchaseId = Number(id)
  const nav = useNavigate()
  const qc = useQueryClient()

  // ✅ DEMO mode
  const DEMO_MODE = true

  const q = useQuery({
    queryKey: ["purchases", "detail", purchaseId],
    queryFn: () => fetchPurchase(purchaseId),
    enabled: !DEMO_MODE && Number.isFinite(purchaseId),
  })

  // ✅ demo state
  const [demo, setDemo] = useState<PurchaseDetail | null>(() => {
    const d = DEMO_PURCHASES_DETAIL[purchaseId]
    if (d) return d
    // id topilmasa ham bo‘sh detail qilib beramiz (demoCreate bosganda keladi)
    if (Number.isFinite(purchaseId)) {
      return {
        id: purchaseId,
        number: String(purchaseId).padStart(5, "0"),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: "DRAFT",
        is_posted: false,
        is_reserved: false,
        organization_id: 1,
        organization_name: "Demo Org",
        kontragent_id: 1,
        kontragent_name: "Demo Kontragent",
        warehouse_id: 1,
        warehouse_name: "Demo Ombor",
        currency: "UZS",
        planned_receive_date: new Date().toISOString().slice(0, 10),
        delivery_address: "",
        comment: "",
        vat_enabled: true,
        price_includes_vat: true,
        total_amount: 0,
        items: [],
      }
    }
    return null
  })

  const m = useMutation({
    mutationFn: (payload: Partial<PurchaseDetail>) => patchPurchase(purchaseId, payload),
    onSuccess: (data) => {
      qc.setQueryData(["purchases", "detail", purchaseId], data)
      qc.invalidateQueries({ queryKey: ["purchases", "list"] })
    },
  })

  const data: PurchaseDetail | undefined = DEMO_MODE ? (demo || undefined) : q.data
  const loading = DEMO_MODE ? false : q.isLoading
  const saving = DEMO_MODE ? false : m.isPending

  const title = useMemo(() => {
    if (!data) return "Xarid"
    return `Xarid № ${data.number}`
  }, [data])

  const handleSave = () => {
    // bu yerda global Save tugmasi bor, realda form submit bilan ishlatamiz
    // hozircha no-op (form ichida saqlash bor)
  }

  const handlePatch = (payload: Partial<PurchaseDetail>) => {
    if (!data) return
    if (DEMO_MODE) {
      setDemo((prev) => {
        if (!prev) return prev
        const next: PurchaseDetail = {
          ...prev,
          ...payload,
          updated_at: new Date().toISOString(),
        }
        return next
      })
      return
    }
    m.mutate(payload)
  }

  return (
    <div className="p-6">
      <div className="rounded-3xl bg-white/80 backdrop-blur border border-slate-200 shadow-sm">
        <div className="p-6">
          <PurchaseHeader
            title={title}
            loading={loading}
            status={data?.status}
            isPosted={!!data?.is_posted}
            isReserved={!!data?.is_reserved}
            updatedAt={data?.updated_at}
            onClose={() => nav("/dashboard/purchases")}
            onSave={handleSave}
            onPrint={() => console.log("TODO: print")}
            onChangeStatus={(s) => handlePatch({ status: s })}
            onTogglePosted={(v) => handlePatch({ is_posted: v })}
            onToggleReserved={(v) => handlePatch({ is_reserved: v })}
          />

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5">
              <PurchaseForm
                loading={loading}
                value={data}
                saving={saving}
                onSubmit={(payload) => handlePatch(payload)}
              />
            </div>

            <div className="lg:col-span-7">
              <PurchaseTabs
                itemsTab={
                  <PurchaseItemsTable
                    loading={loading}
                    currency={data?.currency}
                    vatEnabled={!!data?.vat_enabled}
                    priceIncludesVat={!!data?.price_includes_vat}
                    items={data?.items || []}
                    onChangeFlags={(p) => handlePatch(p)}
                    onAddDemoItem={() => {
                      if (!DEMO_MODE) return
                      setDemo((prev) => {
                        if (!prev) return prev
                        const nextId = (prev.items.reduce((m, it) => Math.max(m, it.id), 0) || 0) + 1
                        const newItem = {
                          id: nextId,
                          name: `Yangi pozitsiya ${nextId}`,
                          qty: "1.000000",
                          uom: "шт",
                          price: 10000,
                          vat_rate: prev.vat_enabled ? 12 : 0,
                          discount_percent: 0,
                          line_total: 10000,
                        }
                        const items = [newItem, ...prev.items]
                        const total = items.reduce((s, it) => s + (it.line_total || 0), 0)
                        return { ...prev, items, total_amount: total, updated_at: new Date().toISOString() }
                      })
                    }}
                  />
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
