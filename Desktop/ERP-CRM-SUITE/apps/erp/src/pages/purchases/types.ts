export type CurrencyCode = "UZS" | "USD" | "RUB"

export type PurchaseStatus =
  | "DRAFT"
  | "APPROVED"
  | "RECEIVED"
  | "CANCELLED"

export type PurchaseListItem = {
  id: number
  number: string
  created_at: string // ISO
  kontragent_name: string
  organization_name: string
  currency: CurrencyCode
  total_amount: number // backendda BigInteger bo‘lsa ham frontend number/string ko‘rsatadi
  invoiced_amount: number
  paid_amount: number
  received_amount: number
  reserved_amount: number
  status: PurchaseStatus
  comment?: string | null
}

export type PurchaseItem = {
  id: number
  name: string
  qty: string // Decimal(18,6) => string qilib olib yuramiz
  uom: string
  price: number
  vat_rate: number // masalan 0 / 12 / 15
  discount_percent: number
  line_total: number
  available_qty?: string
  stock_qty?: string
}

export type PurchaseDetail = {
  id: number
  number: string
  created_at: string
  updated_at: string
  status: PurchaseStatus
  is_posted: boolean
  is_reserved: boolean

  organization_id: number | null
  organization_name?: string

  kontragent_id: number | null
  kontragent_name?: string

  warehouse_id: number | null
  warehouse_name?: string

  currency: CurrencyCode
  planned_receive_date?: string | null
  delivery_address?: string | null
  contract_id?: number | null
  project_id?: number | null
  comment?: string | null

  vat_enabled: boolean
  price_includes_vat: boolean

  total_amount: number
  items: PurchaseItem[]
}

export type PageResponse<T> = {
  results: T[]
  count: number
  page: number
  page_size: number
}
