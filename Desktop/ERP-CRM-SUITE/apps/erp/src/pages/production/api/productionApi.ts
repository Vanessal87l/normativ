import type { ProductionFilters, ProductionOrder, ProductionStatus } from "../types/production.types"
import { uid } from "../utils/production.utils"
import { seedOrders } from "../demo/seed"

const KEY = "erp_demo_production_orders_v1"

function readAll(): ProductionOrder[] {
  const raw = localStorage.getItem(KEY)
  if (!raw) {
    const seeded = seedOrders()
    localStorage.setItem(KEY, JSON.stringify(seeded))
    return seeded
  }
  try {
    return JSON.parse(raw) as ProductionOrder[]
  } catch {
    localStorage.removeItem(KEY)
    return seedOrders()
  }
}
function writeAll(rows: ProductionOrder[]) {
  localStorage.setItem(KEY, JSON.stringify(rows))
}

export async function listProductionOrders(f: ProductionFilters): Promise<ProductionOrder[]> {
  const rows = readAll()

  const filtered = rows.filter((r) => {
    if (f.status !== "ALL" && r.status !== f.status) return false
    if (f.workCenter !== "ALL" && r.workCenter !== f.workCenter) return false

    if (f.dateFrom && r.date < f.dateFrom) return false
    if (f.dateTo && r.date > f.dateTo) return false

    if (f.q) {
      const q = f.q.toLowerCase()
      const hay = `${r.code} ${r.productName} ${r.note ?? ""}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })

  // newest first
  filtered.sort((a, b) => (a.date < b.date ? 1 : -1))
  return new Promise((res) => setTimeout(() => res(filtered), 200))
}

export async function getProductionOrder(id: string): Promise<ProductionOrder | null> {
  const rows = readAll()
  const found = rows.find((x) => x.id === id) ?? null
  return new Promise((res) => setTimeout(() => res(found), 120))
}

export async function createProductionOrder(
  data: Omit<ProductionOrder, "id" | "createdAt" | "updatedAt" | "materials" | "wastes" | "finishedReceivedQty">
): Promise<ProductionOrder> {
  const rows = readAll()
  const now = new Date().toISOString()
  const newRow: ProductionOrder = {
    ...data,
    id: uid("po"),
    materials: [],
    wastes: [],
    finishedReceivedQty: 0,
    createdAt: now,
    updatedAt: now,
  }
  rows.unshift(newRow)
  writeAll(rows)
  return new Promise((res) => setTimeout(() => res(newRow), 150))
}

export async function updateProductionOrder(
  id: string,
  patch: Partial<ProductionOrder>
): Promise<ProductionOrder | null> {
  const rows = readAll()
  const i = rows.findIndex((x) => x.id === id)
  if (i === -1) return null
  rows[i] = { ...rows[i], ...patch, updatedAt: new Date().toISOString() }
  writeAll(rows)
  return new Promise((res) => setTimeout(() => res(rows[i]), 150))
}

export async function deleteProductionOrder(id: string) {
  const rows = readAll().filter((x) => x.id !== id)
  writeAll(rows)
  return new Promise((res) => setTimeout(() => res(true), 120))
}

// actions
export async function setProductionStatus(id: string, status: ProductionStatus) {
  return updateProductionOrder(id, { status })
}

export async function addConsumption(
  id: string,
  line: { name: string; uom: string; qty: number; unitCostUZS: number }
) {
  const row = await getProductionOrder(id)
  if (!row) return null
  const materials = [{ id: uid("m"), ...line }, ...row.materials]
  return updateProductionOrder(id, { materials })
}

export async function addWaste(id: string, line: { reason: string; qty: number }) {
  const row = await getProductionOrder(id)
  if (!row) return null
  const wastes = [{ id: uid("w"), ...line }, ...row.wastes]
  return updateProductionOrder(id, { wastes })
}

export async function addReceiveFinished(id: string, qty: number) {
  const row = await getProductionOrder(id)
  if (!row) return null
  return updateProductionOrder(id, { finishedReceivedQty: Math.max(0, row.finishedReceivedQty + qty) })
}
