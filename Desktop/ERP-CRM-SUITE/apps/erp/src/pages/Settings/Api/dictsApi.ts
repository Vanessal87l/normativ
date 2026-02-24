// src/pages/Settings/api/dictsApi.ts
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
  uom: "/api/v1/dicts/uom/",
  materialType: "/api/v1/dicts/material-types/",
  productCategory: "/api/v1/dicts/product-categories/",
  warehouseLocation: "/api/v1/dicts/locations/",
}

export const dictsApi = {
  // ✅ UOM
  async listUom() {
    const res = await http.get<Paginated<UomRow> | UomRow[] | any>(ENDPOINTS.uom)
    return unwrapList<UomRow>(res)
  },
  async createUom(payload: CreatePayload) {
    return http.post<UomRow>(ENDPOINTS.uom, payload)
  },
  async patchUom(id: number, payload: PatchPayload) {
    return http.patch<UomRow>(`${ENDPOINTS.uom}${id}/`, payload)
  },
  async deleteUom(id: number) {
    return http.delete<void>(`${ENDPOINTS.uom}${id}/`)
  },

  // ✅ Material types
  async listMaterialTypes() {
    const res = await http.get<Paginated<MaterialTypeRow> | MaterialTypeRow[] | any>(ENDPOINTS.materialType)
    return unwrapList<MaterialTypeRow>(res)
  },
  async createMaterialType(payload: CreatePayload) {
    return http.post<MaterialTypeRow>(ENDPOINTS.materialType, payload)
  },
  async patchMaterialType(id: number, payload: PatchPayload) {
    return http.patch<MaterialTypeRow>(`${ENDPOINTS.materialType}${id}/`, payload)
  },
  async deleteMaterialType(id: number) {
    return http.delete<void>(`${ENDPOINTS.materialType}${id}/`)
  },

  // ✅ Product categories
  async listProductCategories() {
    const res = await http.get<Paginated<ProductCategoryRow> | ProductCategoryRow[] | any>(ENDPOINTS.productCategory)
    return unwrapList<ProductCategoryRow>(res)
  },
  async createProductCategory(payload: CreatePayload) {
    return http.post<ProductCategoryRow>(ENDPOINTS.productCategory, payload)
  },
  async patchProductCategory(id: number, payload: PatchPayload) {
    return http.patch<ProductCategoryRow>(`${ENDPOINTS.productCategory}${id}/`, payload)
  },
  async deleteProductCategory(id: number) {
    return http.delete<void>(`${ENDPOINTS.productCategory}${id}/`)
  },

  // ✅ Warehouse locations
  async listWarehouseLocations() {
    const res = await http.get<Paginated<WarehouseLocationRow> | WarehouseLocationRow[] | any>(ENDPOINTS.warehouseLocation)
    return unwrapList<WarehouseLocationRow>(res)
  },
  async createWarehouseLocation(payload: CreatePayload) {
    return http.post<WarehouseLocationRow>(ENDPOINTS.warehouseLocation, payload)
  },
  async patchWarehouseLocation(id: number, payload: PatchPayload) {
    return http.patch<WarehouseLocationRow>(`${ENDPOINTS.warehouseLocation}${id}/`, payload)
  },
  async deleteWarehouseLocation(id: number) {
    return http.delete<void>(`${ENDPOINTS.warehouseLocation}${id}/`)
  },
}
