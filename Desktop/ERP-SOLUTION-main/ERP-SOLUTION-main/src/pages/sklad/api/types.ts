export type DateRange = { from: string; to: string }

export type WarehouseSummary = {
  rawStockUnits: number
  finishedStockUnits: number
  inventoryValue: number
  movementsIn: number
  movementsOut: number
  lowStockCount: number
  unpaidOrders: number
}

export type AlertItem = {
  id: string | number
  name: string
  leftQty: number
  level: "warning" | "critical"
}

export type StockItemType = "RAW" | "FINISHED"
export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "DISCONTINUED"

export type StockItem = {
  id: string | number
  name: string
  type: StockItemType
  unit: string
  qtyOnHand: number
  lastUnitCost: number
  totalValue: number
  status: StockStatus
  category?: string
  updatedAt: string // YYYY-MM-DD
}

export type CreateStockPayload = {
  name: string
  type: StockItemType
  unit: string
  qtyOnHand: number
  lastUnitCost: number
  status: StockStatus
  category?: string
}

export type FetchParams = {
  page: number
  pageSize: number
  q: string
  type: StockItemType
  status: StockStatus | "ALL"
  category: string | "ALL"
  lowOnly: boolean
  dateRange: DateRange
  sortKey: "name" | "qtyOnHand" | "totalValue" | "updatedAt"
  sortDir: "asc" | "desc"
}

export type FetchResult = { rows: StockItem[]; totalCount: number }
