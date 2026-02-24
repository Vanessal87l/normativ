import { http } from "./http"
import type { PageResponse, PurchaseDetail, PurchaseListItem } from "@/pages/purchases/types"

const PURCHASES_BASE = "/v1/purchases/orders"

export type PurchasesListParams = {
  page?: number
  page_size?: number
  search?: string
  date_from?: string
  date_to?: string
  status?: string
  organization_id?: string
  kontragent_id?: string
  warehouse_id?: string
  currency?: string
  ordering?: string
}

export type CreatePurchasePayload = {
  organization_id: number | null
  kontragent_id: number | null
  warehouse_id: number | null
  currency: string
  comment?: string | null
}

export type CreatePurchaseResponse = { id: number }

function cleanParams<T extends Record<string, any>>(params: T): Partial<T> {
  // undefined / "" / null bo‘lganlarni query’dan olib tashlaydi
  const out: Record<string, any> = {}
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v === undefined || v === null) return
    if (typeof v === "string" && v.trim() === "") return
    out[k] = v
  })
  return out as Partial<T>
}

// ✅ CREATE
export async function createPurchase(payload: CreatePurchasePayload) {
  const { data } = await http.post<CreatePurchaseResponse>(`${PURCHASES_BASE}/`, payload)
  return data
}

// ✅ LIST
export async function fetchPurchases(params: PurchasesListParams) {
  const { data } = await http.get<PageResponse<PurchaseListItem>>(`${PURCHASES_BASE}/`, {
    params: cleanParams(params),
  })
  return data
}

// ✅ DETAIL
export async function fetchPurchase(id: number) {
  const { data } = await http.get<PurchaseDetail>(`${PURCHASES_BASE}/${id}/`)
  return data
}

// ✅ PATCH (policy: PATCH-only)
export async function patchPurchase(id: number, payload: Partial<PurchaseDetail>) {
  const { data } = await http.patch<PurchaseDetail>(`${PURCHASES_BASE}/${id}/`, payload)
  return data
}
