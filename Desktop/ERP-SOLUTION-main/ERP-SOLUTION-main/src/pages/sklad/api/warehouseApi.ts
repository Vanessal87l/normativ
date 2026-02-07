import { http } from "./http"
import type { AlertItem, CreateStockPayload, FetchParams, FetchResult, StockItem, WarehouseSummary } from "./types"
import { mockAlerts, mockCreateStockItem, mockFetchStock, mockSummary } from "./mock"

const DEMO = (import.meta.env.VITE_WAREHOUSE_DEMO ?? "1") === "1"

export const warehouseApi = {
  async getSummary(): Promise<WarehouseSummary> {
    if (DEMO) return mockSummary as any
    const { data } = await http.get("/warehouse/summary/")
    return data
  },

  async getCriticalAlerts(): Promise<AlertItem[]> {
    if (DEMO) return mockAlerts as any
    const { data } = await http.get("/warehouse/alerts/")
    return data
  },

  async fetchStock(params: FetchParams): Promise<FetchResult> {
    if (DEMO) return mockFetchStock(params)
    const { data } = await http.get("/warehouse/stock/", { params })
    return data
  },

  async createItem(payload: CreateStockPayload): Promise<void> {
    if (DEMO) {
      mockCreateStockItem(payload)
      return
    }
    await http.post("/warehouse/stock/", payload)
  },

  async updateItem(payload: Partial<StockItem> & { id: StockItem["id"] }): Promise<void> {
    if (DEMO) return
    await http.patch(`/warehouse/stock/${payload.id}/`, payload)
  },

  async deleteItem(id: StockItem["id"]): Promise<void> {
    if (DEMO) return
    await http.delete(`/warehouse/stock/${id}/`)
  },
}
