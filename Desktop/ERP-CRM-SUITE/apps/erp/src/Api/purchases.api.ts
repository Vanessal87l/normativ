import { http } from "./http"
import type {
  PageResponse,
  PurchaseDetail,
  PurchaseListItem,
  PurchasesMeta,
} from "@/pages/purchases/types"

const PURCHASES_BASE = "/v1/purchases"
const PURCHASE_PAYMENT_BASE = "/v1/finance/payments/purchase"

export type PurchasesListParams = {
  page?: number
  page_size?: number
  supplier?: number
  status?: string
  payment_status?: string
  date_from?: string
  date_to?: string
  search?: string
  ordering?: string
}

export type CreatePurchasePayload = {
  supplier: number
  received_date?: string | null
  produced_date?: string | null
  delivery_company?: string | null
  location: number
  notes?: string | null
  currency?: "UZS"
  items?: Array<{
    raw_material: number
    qty: string
    unit_price: number
  }>
}

export type CreatePurchaseResponse = { id: number }
export type PatchPurchasePayload = Partial<CreatePurchasePayload>

export type PurchaseItemPayload = {
  raw_material: number
  qty: string
  unit_price: number
}

export type PurchasePaymentPayload = {
  purchase_id: number
  method: string
  amount: number
  currency: "UZS"
  occurred_on?: string
  note?: string
}

function cleanParams<T extends Record<string, unknown>>(params: T): Partial<T> {
  const out: Record<string, unknown> = {}
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v === undefined || v === null) return
    if (typeof v === "string" && v.trim() === "") return
    out[k] = v
  })
  return out as Partial<T>
}

export async function fetchPurchasesMeta() {
  const { data } = await http.get<PurchasesMeta>(`${PURCHASES_BASE}/meta/`)
  return data
}

export async function fetchPurchases(params: PurchasesListParams) {
  const { data } = await http.get<PageResponse<PurchaseListItem>>(`${PURCHASES_BASE}/`, {
    params: cleanParams(params),
  })
  return data
}

export async function fetchPurchase(id: number) {
  const { data } = await http.get<PurchaseDetail>(`${PURCHASES_BASE}/${id}/`)
  return data
}

export async function createPurchase(payload: CreatePurchasePayload) {
  const { data } = await http.post<CreatePurchaseResponse>(`${PURCHASES_BASE}/`, {
    ...payload,
    currency: "UZS",
  })
  return data
}

export async function patchPurchase(id: number, payload: PatchPurchasePayload) {
  const { data } = await http.patch<PurchaseDetail>(`${PURCHASES_BASE}/${id}/`, payload)
  return data
}

export async function addPurchaseItem(purchaseId: number, payload: PurchaseItemPayload) {
  const { data } = await http.post<PurchaseDetail>(`${PURCHASES_BASE}/${purchaseId}/items`, payload)
  return data
}

export async function patchPurchaseItem(
  purchaseId: number,
  itemId: number,
  payload: Partial<PurchaseItemPayload>
) {
  const { data } = await http.patch<PurchaseDetail>(`${PURCHASES_BASE}/${purchaseId}/items/${itemId}`, payload)
  return data
}

export async function deletePurchaseItem(purchaseId: number, itemId: number) {
  const { data } = await http.delete<PurchaseDetail>(`${PURCHASES_BASE}/${purchaseId}/items/${itemId}`)
  return data
}

export async function confirmPurchase(purchaseId: number) {
  const { data } = await http.post<PurchaseDetail>(`${PURCHASES_BASE}/${purchaseId}/confirm`, {})
  return data
}

export async function cancelPurchase(purchaseId: number) {
  try {
    const { data } = await http.post<PurchaseDetail>(`${PURCHASES_BASE}/${purchaseId}/cancel`, {})
    return data
  } catch (error: any) {
    if (Number(error?.response?.status || 0) !== 404) throw error
    const { data } = await http.post<PurchaseDetail>(`${PURCHASES_BASE}/${purchaseId}/cancel-confirm`, {})
    return data
  }
}

export async function deletePurchase(purchaseId: number) {
  const { data } = await http.delete<PurchaseDetail>(`${PURCHASES_BASE}/${purchaseId}/`)
  return data
}

export async function payPurchase(payload: PurchasePaymentPayload) {
  const { data } = await http.post(`${PURCHASE_PAYMENT_BASE}`, {
    ...payload,
    currency: "UZS",
  })
  return data
}
