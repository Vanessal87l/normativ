import { http } from "./http"

export type OrderRow = {
  id: string
  clientName: string
  productName: string
  unit: string
  qty: number
  nds: number
  total: number
}

export type Filters = {
  id?: string
  clientName?: string
  productName?: string
  unit?: string
  qtyMin?: number
  qtyMax?: number
  ndsMin?: number
  ndsMax?: number
  totalMin?: number
  totalMax?: number
}

// ✅ GET /orders?search=&id=&clientName=...
export async function fetchOrders(params: {
  search?: string
  filters?: Filters
}) {
  const { search, filters } = params

  const res = await http.get<OrderRow[]>("/orders", {
    params: {
      search: search || undefined,
      ...filters,
    },
  })
  return res.data
}

// ✅ POST /orders
export async function createOrder(body: Omit<OrderRow, "id">) {
  const res = await http.post<OrderRow>("/orders", body)
  return res.data
}
