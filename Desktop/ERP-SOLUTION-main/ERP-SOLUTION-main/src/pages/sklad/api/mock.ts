import { todayISO } from "../warehouse/shared/utils/date"
import type { CreateStockPayload, FetchParams, FetchResult, StockItem } from "./types"

// ✅ Demo DB (memory)
let STOCK_DB: StockItem[] = [
  {
    id: 1,
    name: "Granula",
    type: "RAW",
    unit: "kg",
    qtyOnHand: 120,
    lastUnitCost: 12,
    totalValue: 1440,
    status: "IN_STOCK",
    category: "Raw",
    updatedAt: todayISO(),
  },
  {
    id: 2,
    name: "Paket",
    type: "FINISHED",
    unit: "dona",
    qtyOnHand: 25,
    lastUnitCost: 2.5,
    totalValue: 62.5,
    status: "LOW_STOCK",
    category: "Packaging",
    updatedAt: todayISO(),
  },
]

export const mockSummary = {
  rawStockUnits: 120,
  finishedStockUnits: 25,
  inventoryValue: 1502.5,
  movementsIn: 18,
  movementsOut: 7,
  lowStockCount: 1,
  unpaidOrders: 3,
}

export const mockAlerts = [{ id: "a1", name: "Paket", leftQty: 25, level: "warning" as const }]

// ✅ CREATE (qo‘shish)
export function mockCreateStockItem(payload: CreateStockPayload) {
  const id = Date.now()
  const updatedAt = todayISO()

  const row: StockItem = {
    id,
    name: payload.name,
    type: payload.type,
    unit: payload.unit,
    qtyOnHand: payload.qtyOnHand,
    lastUnitCost: payload.lastUnitCost,
    totalValue: payload.qtyOnHand * payload.lastUnitCost,
    status: payload.status,
    category: payload.category,
    updatedAt,
  }

  STOCK_DB = [row, ...STOCK_DB]
}

export function mockFetchStock(params: FetchParams): FetchResult {
  let rows = [...STOCK_DB]

  // filter q
  if (params.q?.trim()) {
    const qq = params.q.trim().toLowerCase()
    rows = rows.filter((r) => r.name.toLowerCase().includes(qq))
  }

  // type
  rows = rows.filter((r) => r.type === params.type)

  // status
  if (params.status !== "ALL") rows = rows.filter((r) => r.status === params.status)

  // category
  if (params.category !== "ALL") rows = rows.filter((r) => (r.category || "") === params.category)

  // lowOnly
  if (params.lowOnly) rows = rows.filter((r) => r.status === "LOW_STOCK" || r.status === "OUT_OF_STOCK")

  // sort
  const dir = params.sortDir === "asc" ? 1 : -1
  rows.sort((a, b) => {
    if (params.sortKey === "name") return a.name.localeCompare(b.name) * dir
    if (params.sortKey === "qtyOnHand") return (a.qtyOnHand - b.qtyOnHand) * dir
    if (params.sortKey === "totalValue") return (a.totalValue - b.totalValue) * dir
    return a.updatedAt.localeCompare(b.updatedAt) * dir
  })

  const totalCount = rows.length

  // pagination
  const start = (params.page - 1) * params.pageSize
  const pageRows = rows.slice(start, start + params.pageSize)

  return { rows: pageRows, totalCount }
}
