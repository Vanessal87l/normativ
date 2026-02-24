// src/Api/orders.ts
import { api } from "@/lib/api" // sizdagi axios instance path moslang
import type { ReactNode } from "react"
import { unwrapResults } from "@/lib/unwrap"

export type OrderStatus =
  | "NEW"
  | "IN_PROGRESS"
  | "READY"
  | "ON_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"

export type PaymentStatus = "UNPAID" | "PARTIALLY_PAID" | "PAID" | string

export interface OnHandRow {
  currency: ReactNode
  item_type: "PRODUCT" | "RAW_MATERIAL"
  product_id: number | null
  raw_material_id: number | null
  location_id: number | null
  item_name: string | null
  qty_onhand: string // "1.000000"
  value_onhand: number
  avg_unit_cost: number
}

export async function getProductOnHand(params: {
  warehouse_id?: number
  location_id?: number
  product_id: number
}): Promise<number> {
  const { data } = await api.get<OnHandRow[]>(
    "/api/v1/warehouse/stock/on-hand/",
    {
      params: {
        // ✅ odatda backend shunaqa qabul qiladi:
        warehouse: params.warehouse_id,
        location: params.location_id,
        item_type: "PRODUCT",
        product_id: params.product_id,
      },
    }
  )

  const rows = (data ?? []).filter((r) => {
    if (r.item_type !== "PRODUCT") return false
    if (r.product_id !== params.product_id) return false
    // agar location_id berilgan bo‘lsa frontda ham filtrlaymiz
    if (params.location_id && r.location_id !== params.location_id) return false
    return true
  })

  // hamma locationlar bo‘yicha yig‘ib yuboramiz (warehouse bo‘yicha filtr backend qilsa ham, qilmasa ham)
  return rows.reduce((sum, r) => sum + Number(r.qty_onhand || 0), 0)
}


export interface Kontragent {
  id: number
  kind: string
  code: string
  name: string
  phone?: string | null
  email?: string | null
  inn?: string | null
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface Product {
  id: number
  name: string
  category: number
  category_name: string
  uom: number
  uom_name: string
  selling_price: number
  currency: string
  nds_applies: boolean
  nds_rate: string
  nds_included: boolean
  created_at: string
}

export interface Branch {
  id: number
  name: string
}

export interface Warehouse {
  id: number
  name: string
  branch?: number
  branch_name?: string
}

// Stock shape (siz backenddan qanday berishini bilmaganim uchun minimal)
export interface StockResponse {
  qty: number
  uom_name?: string
}

export interface OrderItemCreate {
  item_type: "PRODUCT" | "RAW_MATERIAL"
  product?: number
  raw_material?: number
  qty: string // backend string qabul qilyapti
  unit_price: number
  nds_rate?: number | string
  nds_included?: boolean
  line_total: number
  // Agar backend unit/uom_id talab qilsa qo'shasiz:
  // uom?: number
}

export interface OrderCreatePayload {
  client: number
  branch?: number
  warehouse?: number
  order_date: string
  currency: "UZS" | "USD" | string
  discount_total?: number
  delivery_address?: string
  courier_name?: string
  delivery_date?: string | null
  items: OrderItemCreate[]
}

export interface WarehouseStockRow {
  item_type: "PRODUCT" | "RAW_MATERIAL"
  product_id: number | null
  raw_material_id: number | null
  location_id: number | null
  item_name: string | null
  qty_onhand: string // "1.000000"
  value_onhand: number
  avg_unit_cost: number
}

export async function getProductOnhand(params: {
  warehouse_id?: number
  location_id?: number
  product_id: number
}): Promise<number> {
  const { data } = await api.get<WarehouseStockRow[]>("/api/v1/warehouse/stock/", {
    params: {
      // backend qo‘llasa ishlaydi:
      warehouse: params.warehouse_id,
      location: params.location_id,
      item_type: "PRODUCT",
      product_id: params.product_id,
    },
  })

  // Agar backend filterlarni ishlatmasa ham, biz frontda filtrlaymiz:
  const rows = (data ?? []).filter(
    (r) => r.item_type === "PRODUCT" && r.product_id === params.product_id
  )

  // locationlar bo‘yicha yig‘ib qo‘yamiz
  const sum = rows.reduce((s, r) => s + Number(r.qty_onhand || 0), 0)
  return sum
}

export async function fetchOrders(): Promise<OnHandRow[]> {
  const { data } = await api.get("/api/v1/orders/")
  return data
}

export async function createOrder(payload: OrderCreatePayload): Promise<any> {
  const { data } = await api.post("/api/v1/orders/", payload)
  return data
}

export async function fetchKontragents(): Promise<Kontragent[]> {
  const { data } = await api.get("/api/v1/partners/kontragents/")

  if (Array.isArray(data)) return data
  if (Array.isArray(data?.results)) return data.results

  return []
}

// Sizda kontragent create endpoint bo‘lishi kerak.
// Agar URL boshqa bo‘lsa shu yerini almashtirasiz.
export async function createKontragent(payload: {
  kind?: string
  name: string
  phone?: string
  email?: string
  inn?: string
  is_active?: boolean
}): Promise<Kontragent> {
  const { data } = await api.post("/api/v1/partners/kontragents/", {
    kind: payload.kind ?? "CLIENT",
    is_active: payload.is_active ?? true,
    ...payload,
  })
  return data
}

export async function fetchProducts(): Promise<Product[]> {
  const { data } = await api.get("/api/v1/catalog/products/")

  if (Array.isArray(data)) return data
  if (Array.isArray(data?.results)) return data.results
  return []
}



// Branch / Warehouse endpointlar sizda qandayligini bilmayman,
// shuning uchun "placeholder" qoldirdim. Moslab qo‘yasiz.
export async function fetchBranches(): Promise<Branch[]> {
  const { data } = await api.get("/api/v1/branches/") // <-- moslang
  return unwrapResults<Branch>(data)
}

export async function fetchWarehouses(branchId?: number): Promise<Warehouse[]> {
  const { data } = await api.get("/api/v1/dicts/locations/", {
    params: branchId ? { branch: branchId } : undefined,
  })
  const rows = unwrapResults<any>(data?.locations ?? data)

  const byWarehouse = new Map<number, Warehouse>()
  for (const x of rows) {
    const nestedWarehouse =
      typeof x?.warehouse === "object" && x?.warehouse !== null ? x.warehouse : null

    const id = Number(
      x?.warehouse_id ??
        x?.warehouse ??
        nestedWarehouse?.id ??
        0
    )
    if (!id) continue

    const name = String(
      x?.warehouse_name ??
        nestedWarehouse?.name ??
        x?.name ??
        `Warehouse #${id}`
    )

    if (!byWarehouse.has(id)) {
      byWarehouse.set(id, { id, name })
    }
  }

  return Array.from(byWarehouse.values())
}

// ⚠️ STOCK endpointni siz aytmadingiz.
// Sizda qaysi endpoint bo‘lsa shu yerini 1 joyda moslab qo‘ying.
export async function getProductStock(params: {
  warehouse_id: number
  product_id: number
}): Promise<StockResponse> {
  // MISOL: /api/v1/warehouse/on-hand/?warehouse=1&product=2
  const { data } = await api.get("/api/v1/warehouse/on-hand/", {
    params: { warehouse: params.warehouse_id, product: params.product_id },
  })
  // data masalan: { qty: 12.5, uom_name: "kg" }
  return data
}
