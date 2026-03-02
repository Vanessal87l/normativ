export type ProductionStatus = "DRAFT" | "APPROVED" | "IN_PROGRESS" | "PAUSED" | "COMPLETED" | "CANCELLED"

export type WorkCenter = "CUTTING" | "SEWING" | "PACKING" | "OTHER"

export type MaterialLine = {
  id: string
  name: string
  uom: string
  qty: number
  unitCostUZS: number // demo cost (UZS)
}

export type WasteLine = {
  id: string
  reason: string
  qty: number
}

export type ProductionOrder = {
  id: string
  code: string
  date: string // YYYY-MM-DD
  productName: string
  quantity: number
  workCenter: WorkCenter
  status: ProductionStatus
  note?: string

  // demo accounting
  materials: MaterialLine[]
  wastes: WasteLine[]
  finishedReceivedQty: number

  createdAt: string
  updatedAt: string
}

export type ProductionFilters = {
  status: "ALL" | ProductionStatus
  workCenter: "ALL" | WorkCenter
  q: string
  dateFrom?: string
  dateTo?: string
}
