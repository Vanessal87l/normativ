import { useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  addPurchaseItem,
  cancelPurchase,
  confirmPurchase,
  deletePurchase,
  deletePurchaseItem,
  fetchPurchase,
  fetchPurchasesMeta,
  patchPurchase,
  patchPurchaseItem,
  payPurchase,
  type PatchPurchasePayload,
} from "@/Api/purchases.api"

import PurchaseHeader from "./components/PurchaseHeader"
import PurchaseForm from "./components/PurchaseForm"
import PurchaseItemsTable from "./components/PurchaseItemsTable"
import PurchasePaymentsPanel from "./components/PurchasePaymentsPanel"
import PurchaseTabs from "./components/PurchaseTabs"

function choiceValue(x: any): string {
  if (typeof x === "string") return x
  if (Array.isArray(x)) return String(x[0] ?? "")
  return String(x?.value ?? "")
}

export default function PurchaseDetailPage() {
  const { id } = useParams()
  const purchaseId = Number(id)
  const nav = useNavigate()
  const qc = useQueryClient()

  const q = useQuery({
    queryKey: ["purchases", "detail", purchaseId],
    queryFn: () => fetchPurchase(purchaseId),
    enabled: Number.isFinite(purchaseId),
  })

  const metaQ = useQuery({
    queryKey: ["purchases", "meta"],
    queryFn: fetchPurchasesMeta,
  })

  const refreshAll = () => {
    q.refetch()
    qc.invalidateQueries({ queryKey: ["purchases", "list"] })
  }

  const patchM = useMutation({
    mutationFn: (payload: PatchPurchasePayload) => patchPurchase(purchaseId, payload),
    onSuccess: (data) => {
      qc.setQueryData(["purchases", "detail", purchaseId], data)
      qc.invalidateQueries({ queryKey: ["purchases", "list"] })
    },
  })

  const addItemM = useMutation({
    mutationFn: (payload: { raw_material: number; qty: string; unit_price: number }) =>
      addPurchaseItem(purchaseId, payload),
    onSuccess: (data) => qc.setQueryData(["purchases", "detail", purchaseId], data),
  })

  const patchItemM = useMutation({
    mutationFn: (args: { itemId: number; payload: { raw_material?: number; qty?: string; unit_price?: number } }) =>
      patchPurchaseItem(purchaseId, args.itemId, args.payload),
    onSuccess: (data) => qc.setQueryData(["purchases", "detail", purchaseId], data),
  })

  const deleteItemM = useMutation({
    mutationFn: (itemId: number) => deletePurchaseItem(purchaseId, itemId),
    onSuccess: (data) => qc.setQueryData(["purchases", "detail", purchaseId], data),
  })

  const confirmM = useMutation({
    mutationFn: () => confirmPurchase(purchaseId),
    onSuccess: (data) => qc.setQueryData(["purchases", "detail", purchaseId], data),
  })

  const cancelM = useMutation({
    mutationFn: () => cancelPurchase(purchaseId),
    onSuccess: (data) => qc.setQueryData(["purchases", "detail", purchaseId], data),
  })

  const deleteM = useMutation({
    mutationFn: () => deletePurchase(purchaseId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["purchases", "list"] })
      nav("/dashboard/purchases")
    },
  })

  const payM = useMutation({
    mutationFn: (payload: { method: string; amount: number; occurred_on?: string; note?: string }) =>
      payPurchase({
        purchase_id: purchaseId,
        method: payload.method,
        amount: payload.amount,
        currency: "UZS",
        occurred_on: payload.occurred_on,
        note: payload.note,
      }),
    onSuccess: () => refreshAll(),
  })

  const data = q.data
  const loading = q.isLoading
  const isDraft = data?.status === "DRAFT"
  const canConfirm = Boolean(isDraft && data?.location && data?.items?.length)

  const title = useMemo(() => {
    if (!data) return "Xarid"
    return `Xarid #${data.purchase_no}`
  }, [data])

  const paymentMethods = (metaQ.data?.payment_method_choices || []).map(choiceValue).filter(Boolean)

  return (
    <div className="p-6">
      <div className="rounded-3xl bg-white/80 backdrop-blur border border-slate-200 shadow-sm">
        <div className="p-6">
          <PurchaseHeader
            title={title}
            loading={loading}
            status={data?.status}
            paymentStatus={data?.payment_status}
            updatedAt={data?.updated_at}
            total={data?.total || 0}
            paidAmount={data?.paid_amount || 0}
            canConfirm={canConfirm}
            onClose={() => nav("/dashboard/purchases")}
            onRefresh={refreshAll}
            onConfirm={() => confirmM.mutate()}
            onCancel={() => cancelM.mutate()}
            onDelete={() => {
              if (window.confirm("Xaridni soft-delete qilinsinmi?")) deleteM.mutate()
            }}
          />

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5">
              <PurchaseForm
                loading={loading}
                value={data}
                saving={patchM.isPending}
                onSubmit={(payload) => patchM.mutate(payload)}
              />
            </div>

            <div className="lg:col-span-7">
              <PurchaseTabs
                itemsTab={
                  <PurchaseItemsTable
                    loading={loading}
                    currency={data?.currency}
                    canEdit={isDraft}
                    items={data?.items || []}
                    onAdd={(payload) => addItemM.mutate(payload)}
                    onPatch={(itemId, payload) => patchItemM.mutate({ itemId, payload })}
                    onDelete={(itemId) => {
                      if (window.confirm("Item o'chirilsinmi?")) deleteItemM.mutate(itemId)
                    }}
                  />
                }
                paymentsTab={
                  <PurchasePaymentsPanel
                    payments={data?.payments || []}
                    paymentMethods={paymentMethods}
                    paying={payM.isPending}
                    onPay={(payload) => payM.mutate(payload)}
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
