export type MovementType = "IN" | "OUT" | "TRANSFER" | "RETURN" | "WASTE" | string

export type MovementItem = {
  id: number | string
  type: MovementType
  itemName: string
  qty: number
  total: number
  date: string
  note?: string
}

export type StockOnHandItem = {
  id: number | string
  item_name: string
  item_type: string
  qty_onhand: number
  value_onhand: number
  avg_unit_cost: number
  currency?: string
}

export type OverviewSummary = {
  total_items: number
  total_qty: number
  total_value: number
  low_stock_count: number
}

export type AlertItem = {
  id: string | number
  title: string
  message: string
}

export type LookupItem = {
  id: number
  name: string
}

export type WarehouseAction =
  | "issue"
  | "receipt"
  | "return"
  | "transfer"
  | "waste-adjust"
