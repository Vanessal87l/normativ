import { http } from "@/shared/http"

type Paginated<T> = { count: number; next: string | null; previous: string | null; results: T[] }

function unwrapList<T>(res: any): T[] {
  const data = res?.data ?? res
  if (Array.isArray(data)) return data as T[]
  if (data && Array.isArray(data.results)) return data.results as T[]
  return []
}

export type UomRow = { id: number; code?: string; name: string }
export type MaterialTypeRow = { id: number; code?: string; name: string }
export type ProductCategoryRow = { id: number; code?: string; name: string }
export type WarehouseLocationRow = { id: number; code?: string; name: string }

type CreatePayload = { name: string; code?: string }
type PatchPayload = Partial<CreatePayload>

const ENDPOINTS = {
  uom: ["/api/v1/dicts/uom/"],
  materialType: ["/api/v1/dicts/material-type/", "/api/v1/dicts/material-types/"],
  productCategory: ["/api/v1/dicts/product-category/", "/api/v1/dicts/product-categories/"],
  warehouseLocation: ["/api/v1/dicts/warehouse-location/", "/api/v1/dicts/locations/"],
}

const detailUrl = (base: string, id: number) => `${base}${id}/`
const restoreUrl = (base: string, id: number) => `${base}${id}/restore/`

function isNotFound(error: any) {
  return Number(error?.response?.status || 0) === 404
}

async function withEndpointFallback<T>(
  candidates: string[],
  runner: (base: string) => Promise<T>
): Promise<T> {
  let lastError: any = null
  for (const base of candidates) {
    try {
      return await runner(base)
    } catch (error: any) {
      if (!isNotFound(error)) throw error
      lastError = error
    }
  }
  throw lastError ?? new Error("Endpoint topilmadi")
}

export const dictsApi = {
  async listUom() {
    const res = await withEndpointFallback(ENDPOINTS.uom, (base) =>
      http.get<Paginated<UomRow> | UomRow[] | any>(base)
    )
    return unwrapList<UomRow>(res)
  },
  async createUom(payload: CreatePayload) {
    return withEndpointFallback(ENDPOINTS.uom, (base) => http.post<UomRow>(base, payload))
  },
  async getUom(id: number) {
    return withEndpointFallback(ENDPOINTS.uom, (base) => http.get<UomRow>(detailUrl(base, id)))
  },
  async patchUom(id: number, payload: PatchPayload) {
    return withEndpointFallback(ENDPOINTS.uom, (base) =>
      http.patch<UomRow>(detailUrl(base, id), payload)
    )
  },
  async deleteUom(id: number) {
    return withEndpointFallback(ENDPOINTS.uom, (base) => http.delete<void>(detailUrl(base, id)))
  },
  async restoreUom(id: number) {
    return withEndpointFallback(ENDPOINTS.uom, (base) =>
      http.post<UomRow>(restoreUrl(base, id), {})
    )
  },

  async listMaterialTypes() {
    const res = await withEndpointFallback(ENDPOINTS.materialType, (base) =>
      http.get<Paginated<MaterialTypeRow> | MaterialTypeRow[] | any>(base)
    )
    return unwrapList<MaterialTypeRow>(res)
  },
  async createMaterialType(payload: CreatePayload) {
    return withEndpointFallback(ENDPOINTS.materialType, (base) =>
      http.post<MaterialTypeRow>(base, payload)
    )
  },
  async getMaterialType(id: number) {
    return withEndpointFallback(ENDPOINTS.materialType, (base) =>
      http.get<MaterialTypeRow>(detailUrl(base, id))
    )
  },
  async patchMaterialType(id: number, payload: PatchPayload) {
    return withEndpointFallback(ENDPOINTS.materialType, (base) =>
      http.patch<MaterialTypeRow>(detailUrl(base, id), payload)
    )
  },
  async deleteMaterialType(id: number) {
    return withEndpointFallback(ENDPOINTS.materialType, (base) =>
      http.delete<void>(detailUrl(base, id))
    )
  },
  async restoreMaterialType(id: number) {
    return withEndpointFallback(ENDPOINTS.materialType, (base) =>
      http.post<MaterialTypeRow>(restoreUrl(base, id), {})
    )
  },

  async listProductCategories() {
    const res = await withEndpointFallback(ENDPOINTS.productCategory, (base) =>
      http.get<Paginated<ProductCategoryRow> | ProductCategoryRow[] | any>(base)
    )
    return unwrapList<ProductCategoryRow>(res)
  },
  async createProductCategory(payload: CreatePayload) {
    return withEndpointFallback(ENDPOINTS.productCategory, (base) =>
      http.post<ProductCategoryRow>(base, payload)
    )
  },
  async getProductCategory(id: number) {
    return withEndpointFallback(ENDPOINTS.productCategory, (base) =>
      http.get<ProductCategoryRow>(detailUrl(base, id))
    )
  },
  async patchProductCategory(id: number, payload: PatchPayload) {
    return withEndpointFallback(ENDPOINTS.productCategory, (base) =>
      http.patch<ProductCategoryRow>(detailUrl(base, id), payload)
    )
  },
  async deleteProductCategory(id: number) {
    return withEndpointFallback(ENDPOINTS.productCategory, (base) =>
      http.delete<void>(detailUrl(base, id))
    )
  },
  async restoreProductCategory(id: number) {
    return withEndpointFallback(ENDPOINTS.productCategory, (base) =>
      http.post<ProductCategoryRow>(restoreUrl(base, id), {})
    )
  },

  async listWarehouseLocations() {
    const res = await withEndpointFallback(ENDPOINTS.warehouseLocation, (base) =>
      http.get<Paginated<WarehouseLocationRow> | WarehouseLocationRow[] | any>(base)
    )
    return unwrapList<WarehouseLocationRow>(res)
  },
  async createWarehouseLocation(payload: CreatePayload) {
    return withEndpointFallback(ENDPOINTS.warehouseLocation, (base) =>
      http.post<WarehouseLocationRow>(base, payload)
    )
  },
  async getWarehouseLocation(id: number) {
    return withEndpointFallback(ENDPOINTS.warehouseLocation, (base) =>
      http.get<WarehouseLocationRow>(detailUrl(base, id))
    )
  },
  async patchWarehouseLocation(id: number, payload: PatchPayload) {
    return withEndpointFallback(ENDPOINTS.warehouseLocation, (base) =>
      http.patch<WarehouseLocationRow>(detailUrl(base, id), payload)
    )
  },
  async deleteWarehouseLocation(id: number) {
    return withEndpointFallback(ENDPOINTS.warehouseLocation, (base) =>
      http.delete<void>(detailUrl(base, id))
    )
  },
  async restoreWarehouseLocation(id: number) {
    return withEndpointFallback(ENDPOINTS.warehouseLocation, (base) =>
      http.post<WarehouseLocationRow>(restoreUrl(base, id), {})
    )
  },
}
