import { api } from "@/lib/api"
import { warehouseEvents } from "./events"
import type {
  AlertItem,
  LookupItem,
  MovementItem,
  OverviewSummary,
  StockOnHandItem,
  WarehouseAction,
} from "./types"

function toNum(v: any) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

// Backenddan kelgan list/paginated javobni bir xil ko'rinishga keltiradi.
function asArray(data: any) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.results)) return data.results
  return []
}

// Stock endpointdan kelgan satrni UI ishlatadigan standart shape'ga map qiladi.
function mapStockRow(x: any, idx: number): StockOnHandItem {
  return {
    id: x?.id ?? `${x?.item_type ?? "ITEM"}-${x?.product_id ?? x?.raw_material_id ?? idx}`,
    item_name: String(x?.item_name ?? "-"),
    item_type: String(x?.item_type ?? "-"),
    qty_onhand: toNum(x?.qty_onhand),
    value_onhand: toNum(x?.value_onhand),
    avg_unit_cost: toNum(x?.avg_unit_cost),
    currency: String(x?.currency ?? "UZS"),
  }
}

// warehouse location maydoni backendga qarab nomlanishi farq qilsa (warehouse_location/location),
// avval berilgan payload bilan yuboradi, keyin kerak bo'lsa location kalitiga fallback qiladi.
async function postStockAction(url: string, payload: any) {
  const isUnknownFieldError = (value: unknown) => {
    const s = String(value || "").toLowerCase()
    return (
      s.includes("unknown field") ||
      s.includes("not allowed") ||
      s.includes("cannot be sent") ||
      s.includes("bu fieldni yuborish mumkin emas") ||
      s.includes("нельзя отправлять это поле")
    )
  }

  const remapPayloadForStrictSerializer = (src: any, errors: Record<string, unknown>) => {
    const next = { ...src }

    const setIf = (to: string, from: string) => {
      if (next[from] !== undefined && next[to] === undefined) next[to] = next[from]
    }

    if (isUnknownFieldError(errors?.warehouse)) setIf("warehouse_id", "warehouse")
    if (isUnknownFieldError(errors?.to_warehouse)) setIf("to_warehouse_id", "to_warehouse")
    if (isUnknownFieldError(errors?.warehouse_location)) {
      setIf("location", "warehouse_location")
      setIf("location_id", "warehouse_location")
    }
    if (isUnknownFieldError(errors?.product_id)) setIf("product", "product_id")
    if (isUnknownFieldError(errors?.raw_material_id)) setIf("raw_material", "raw_material_id")
    if (isUnknownFieldError(errors?.qty)) setIf("quantity", "qty")
    if (isUnknownFieldError(errors?.note)) setIf("comment", "note")
    if (isUnknownFieldError(errors?.supplier)) setIf("supplier_id", "supplier")
    if (isUnknownFieldError(errors?.kontragent)) setIf("partner", "kontragent")

    for (const [field, message] of Object.entries(errors || {})) {
      if (isUnknownFieldError(message)) delete next[field]
    }
    return next
  }

  try {
    return await api.post(url, payload)
  } catch (error: any) {
    const detail = String(error?.response?.data?.detail || "")
    const data = error?.response?.data
    const maybeUnknownLocationField =
      detail.toLowerCase().includes("warehouse_location") ||
      detail.toLowerCase().includes("unknown field")

    if (payload?.warehouse_location && maybeUnknownLocationField) {
      const fallback = { ...payload, location: payload.warehouse_location }
      delete fallback.warehouse_location
      return api.post(url, fallback)
    }

    if (data && typeof data === "object" && !Array.isArray(data)) {
      const maybeFixed = remapPayloadForStrictSerializer(payload, data as Record<string, unknown>)
      if (JSON.stringify(maybeFixed) !== JSON.stringify(payload)) {
        return api.post(url, maybeFixed)
      }
    }
    throw error
  }
}

export const warehouseApi = {
  // Warehouse overview KPI ma'lumotlarini oladi.
  async overview(): Promise<OverviewSummary> {
    const { data } = await api.get("/api/v1/warehouse/overview/")
    return {
      total_items: toNum(data?.total_items ?? data?.items_count ?? 0),
      total_qty: toNum(data?.total_qty ?? data?.qty_total ?? 0),
      total_value: toNum(data?.total_value ?? data?.value_total ?? 0),
      low_stock_count: toNum(data?.low_stock_count ?? data?.critical_count ?? 0),
    }
  },

  // Dashboard uchun eski nom mosligi: summary = overview.
  async getSummary() {
    return this.overview()
  },

  // Stock meta ichidan alert/low-stock ro'yxatini soddalashtirib qaytaradi.
  async getCriticalAlerts(): Promise<AlertItem[]> {
    try {
      const { data } = await api.get("/api/v1/warehouse/stock/meta/")
      const lows = asArray(data?.low_stock ?? data?.alerts ?? [])
      return lows.map((x: any, i: number) => ({
        id: x?.id ?? i,
        title: String(x?.item_name ?? x?.name ?? "Low stock"),
        message: String(x?.message ?? "Stock kamaygan"),
      }))
    } catch {
      return []
    }
  },

  // /warehouse/stock/ dan stock listni pagination bilan oladi.
  async listStock(params?: Record<string, any>) {
    const { data } = await api.get("/api/v1/warehouse/stock/", { params })
    const list = asArray(data).map((x: any, idx: number) => mapStockRow(x, idx))
    return {
      results: list,
      count: Number(data?.count ?? list.length),
      next: data?.next ?? null,
      previous: data?.previous ?? null,
    }
  },

  // /warehouse/stock/meta/ ni xom ko'rinishda qaytaradi.
  async stockMeta() {
    const { data } = await api.get("/api/v1/warehouse/stock/meta/")
    return data
  },

  // /warehouse/stock/on-hand/ ni xom ko'rinishda qaytaradi.
  async stockOnHand(params?: Record<string, any>) {
    const { data } = await api.get("/api/v1/warehouse/stock/on-hand/", { params })
    return data
  },

  // Stock page uchun on-hand javobini UI formatiga map qiladi.
  async fetchStock(params?: { page?: number; page_size?: number; q?: string }) {
    const { data } = await api.get("/api/v1/warehouse/stock/on-hand/", { params })
    const list = asArray(data).map((x: any, idx: number) => mapStockRow(x, idx))

    return {
      results: list,
      count: Number(data?.count ?? list.length),
      next: data?.next ?? null,
      previous: data?.previous ?? null,
    }
  },

  // /warehouse/ledger/ dan movement (kirim/chiqim) tarixini oladi.
  async listMovementsPage(params?: {
    page?: number
    page_size?: number
    warehouse?: number
    location?: number
    movement_type?: string
  }) {
    const { data } = await api.get("/api/v1/warehouse/ledger/", { params })
    const rows = asArray(data).map((x: any) => ({
      id: x?.id,
      type: String(x?.movement_type ?? x?.type ?? "IN"),
      itemName: String(x?.item_name ?? x?.product_name ?? x?.raw_material_name ?? "-"),
      qty: toNum(x?.qty ?? x?.quantity),
      total: toNum(x?.total ?? x?.amount ?? x?.value),
      date: String(x?.date ?? x?.created_at ?? new Date().toISOString().slice(0, 10)),
      note: x?.note ? String(x.note) : undefined,
    }))
    return {
      results: rows,
      count: Number(data?.count ?? rows.length),
      next: data?.next ?? null,
      previous: data?.previous ?? null,
    }
  },

  // /warehouse/ledger/ dan movement (kirim/chiqim) tarixini oladi.
  async listMovements(): Promise<MovementItem[]> {
    const res = await this.listMovementsPage({ page: 1, page_size: 100 })
    return res.results
  },

  // Dashboarddagi eski chaqiriqlar uchun mos wrapper.
  async ledgerList() {
    const rows = await this.listMovements()
    return { results: rows, count: rows.length }
  },

  // Stock issue (chiqim) action endpointi.
  async issue(payload: any) {
    const { data } = await postStockAction("/api/v1/warehouse/stock/issue/", payload)
    warehouseEvents.emit()
    return data
  },

  // Stock receipt (kirim) action endpointi.
  async receipt(payload: any) {
    const { data } = await postStockAction("/api/v1/warehouse/stock/receipt/", payload)
    warehouseEvents.emit()
    return data
  },

  // Stock return action endpointi.
  async returnStock(payload: any) {
    const { data } = await postStockAction("/api/v1/warehouse/stock/return/", payload)
    warehouseEvents.emit()
    return data
  },

  // Stock transfer action endpointi.
  async transfer(payload: any) {
    const { data } = await postStockAction("/api/v1/warehouse/stock/transfer/", payload)
    warehouseEvents.emit()
    return data
  },

  // Stock waste-adjust action endpointi.
  async wasteAdjust(payload: any) {
    const { data } = await postStockAction("/api/v1/warehouse/stock/waste-adjust/", payload)
    warehouseEvents.emit()
    return data
  },

  // Action nomiga qarab tegishli warehouse stock endpointiga yuboradi.
  async stockAction(action: WarehouseAction, payload: any) {
    if (action === "issue") return this.issue(payload)
    if (action === "receipt") return this.receipt(payload)
    if (action === "return") return this.returnStock(payload)
    if (action === "transfer") return this.transfer(payload)
    return this.wasteAdjust(payload)
  },

  // Legacy moslik: eski code createMovement desa receipt ishlatiladi.
  async createMovement(payload: any) {
    return this.receipt(payload)
  },

  // Legacy moslik: eski code createInventoryCount desa waste-adjust ishlatiladi.
  async createInventoryCount(payload: any) {
    return this.wasteAdjust(payload)
  },

  // Warehouse ro'yxatini dropdown/select uchun qaytaradi.
  async listWarehouses(): Promise<LookupItem[]> {
    const candidates = ["/api/v1/warehouses/", "/api/v1/warehouse/warehouses/"]
    for (const url of candidates) {
      try {
        const { data } = await api.get(url)
        const list = asArray(data)
          .map((x: any) => ({
            id: Number(x?.id ?? 0),
            name: String(x?.name ?? `Warehouse #${x?.id ?? "-"}`),
          }))
          .filter((x: LookupItem) => x.id > 0)
        if (list.length > 0 || Array.isArray(data) || Array.isArray(data?.results)) {
          return list
        }
      } catch (error: any) {
        const status = Number(error?.response?.status || 0)
        if (status !== 404) throw error
      }
    }
    return []
  },

  // Warehouse select uchun /dicts/warehouse-location/ dan warehouselarni hosil qiladi.
  // location row ichida warehouse maydoni bo'lsa o'shani oladi, bo'lmasa id/name fallback qiladi.
  async listWarehousesFromLocations(): Promise<Array<LookupItem & { default_location_id?: number }>> {
    const { data } = await api.get("/api/v1/dicts/warehouse-location/")
    const raw = asArray(data?.locations ?? data)
    const mapped = raw
      .map((x: any) => {
        const nestedWarehouse =
          typeof x?.warehouse === "object" && x?.warehouse !== null ? x.warehouse : null
        const id = Number(
          x?.warehouse_id ??
          x?.warehouse ??
          nestedWarehouse?.id ??
          x?.id ??
          0
        )
        const locationId = Number(x?.id ?? x?.location_id ?? x?.value ?? 0)
        const name = String(
          x?.warehouse_name ??
          nestedWarehouse?.name ??
          x?.name ??
          `Warehouse #${id || "-"}`
        )
        return { id, name, default_location_id: locationId > 0 ? locationId : undefined }
      })
      .filter((x: LookupItem & { default_location_id?: number }) => x.id > 0)

    const uniq = new Map<number, { name: string; default_location_id?: number }>()
    for (const item of mapped) {
      if (!uniq.has(item.id)) {
        uniq.set(item.id, { name: item.name, default_location_id: item.default_location_id })
      }
    }
    return Array.from(uniq.entries()).map(([id, v]) => ({
      id,
      name: v.name,
      default_location_id: v.default_location_id,
    }))
  },

  // Product ro'yxatini dropdown/select uchun qaytaradi.
  async listProducts(): Promise<LookupItem[]> {
    const { data } = await api.get("/api/v1/catalog/products/")
    return asArray(data).map((x: any) => ({
      id: Number(x?.id ?? 0),
      name: String(x?.name ?? `Product #${x?.id ?? "-"}`),
    })).filter((x: LookupItem) => x.id > 0)
  },

  // Raw material ro'yxatini dropdown/select uchun qaytaradi.
  async listMaterials(): Promise<LookupItem[]> {
    const { data } = await api.get("/api/v1/catalog/materials/")
    return asArray(data).map((x: any) => ({
      id: Number(x?.id ?? 0),
      name: String(x?.name ?? `Material #${x?.id ?? "-"}`),
    })).filter((x: LookupItem) => x.id > 0)
  },

  // Supplier ro'yxatini prixod dialogida tanlash uchun qaytaradi.
  async listSuppliers(): Promise<LookupItem[]> {
    const candidates = [
      { url: "/api/v1/partners/kontragents/", params: { kind: "SUPPLIER" } },
      { url: "/api/v1/partners/kontragents/", params: { kind: "VENDOR" } },
      { url: "/api/v1/suppliers/", params: undefined },
    ]

    for (const cfg of candidates) {
      try {
        const { data } = await api.get(cfg.url, { params: cfg.params })
        const list = asArray(data)
          .map((x: any) => ({
            id: Number(x?.id ?? 0),
            name: String(x?.name ?? x?.title ?? `Supplier #${x?.id ?? "-"}`),
          }))
          .filter((x: LookupItem) => x.id > 0)
        if (list.length > 0 || Array.isArray(data) || Array.isArray(data?.results)) {
          return list
        }
      } catch (error: any) {
        const status = Number(error?.response?.status || 0)
        if (status !== 404) throw error
      }
    }

    return []
  },

  // Warehouse tanlanganda location API listini oladi. Endpoint nomlari turli bo'lishi mumkin,
  // lekin talab bo'yicha aynan /api/v1/dicts/warehouse-location/ dan olinadi.
  async listWarehouseLocations(warehouseId?: number): Promise<LookupItem[]> {
    const params = warehouseId ? { warehouse: warehouseId, warehouse_id: warehouseId } : undefined
    const { data } = await api.get("/api/v1/dicts/warehouse-location/", { params })
    const rows = asArray(data?.locations ?? data).filter((x: any) => {
      if (!warehouseId) return true
      const w = Number(x?.warehouse ?? x?.warehouse_id ?? x?.warehouseId ?? 0)
      return !w || w === warehouseId
    })
    return rows
      .map((x: any) => ({
        id: Number(x?.id ?? x?.value ?? 0),
        name: String(x?.name ?? x?.label ?? `Location #${x?.id ?? x?.value ?? "-"}`),
      }))
      .filter((x: LookupItem) => x.id > 0)
  },

  // Ichki buyurtma yaratadi (candidate endpointlar + fallback /orders/).
  async createInternalOrder(payload: any) {
    const candidates = [
      "/api/v1/warehouse/internal-orders/",
      "/api/v1/warehouse/orders/internal/",
      "/api/v1/internal-orders/",
    ]
    for (const url of candidates) {
      try {
        const { data } = await api.post(url, payload)
        warehouseEvents.emit()
        return data
      } catch (error: any) {
        const status = Number(error?.response?.status || 0)
        if (status !== 404) throw error
      }
    }

    const fallback = {
      ...payload,
      order_type: payload?.order_type ?? "INTERNAL",
      type: payload?.type ?? "INTERNAL",
      is_internal: payload?.is_internal ?? true,
    }
    const { data } = await api.post("/api/v1/orders/", fallback)
    warehouseEvents.emit()
    return data
  },

  // Warehouse yaratadi.
  async createWarehouse(payload: any) {
    const candidates = ["/api/v1/warehouses/", "/api/v1/warehouse/warehouses/"]
    for (const url of candidates) {
      try {
        const { data } = await api.post(url, payload)
        warehouseEvents.emit()
        return data
      } catch (error: any) {
        const status = Number(error?.response?.status || 0)
        if (status !== 404) throw error
      }
    }
    throw new Error("Warehouse create endpoint topilmadi")
  },

  // Warehouse location yaratadi.
  async createWarehouseLocation(payload: any) {
    const candidates = [
      "/api/v1/warehouse/locations/",
      "/api/v1/warehouse/location/",
      "/api/v1/warehouse-locations/",
      "/api/v1/warehouse-location/",
      "/api/v1/dicts/warehouse-location/",
    ]
    for (const url of candidates) {
      try {
        const { data } = await api.post(url, payload)
        warehouseEvents.emit()
        return data
      } catch (error: any) {
        const status = Number(error?.response?.status || 0)
        if (status !== 404) throw error
      }
    }
    throw new Error("Warehouse location create endpoint topilmadi")
  },
}
