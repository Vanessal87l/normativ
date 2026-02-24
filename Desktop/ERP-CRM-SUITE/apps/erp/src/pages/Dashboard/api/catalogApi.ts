// src/pages/Dashboard/api/catalogApi.ts
import { http } from "@/shared/http"

export type CatalogCategory = { id: number; name: string }
export type CatalogUom = { id: number; name: string }

export type ProductCreatePayload = {
  name: string
  category: number | null
  uom: number
  selling_price: number
  currency: "UZS" | "USD" | "RUB"
}

export type ProductRow = {
  id: number
  name: string
  category: number | null
  category_name?: string
  uom: number
  uom_name?: string
  selling_price: number
  currency: string
  created_at: string
}

type Paginated<T> = { count: number; next: string | null; previous: string | null; results: T[] }

function unwrapList<T>(res: any): T[] {
  if (Array.isArray(res)) return res as T[]
  if (res && Array.isArray(res.results)) return res.results as T[]
  return []
}

const ENDPOINTS = {
  products: "/api/v1/catalog/products/",
  categories: "/api/v1/dicts/product-categories/",
  uoms: "/api/v1/dicts/uom/",
}

export const catalogApi = {
  async listCategories(): Promise<CatalogCategory[]> {
    const res = await http.get<Paginated<CatalogCategory> | CatalogCategory[] | any>(ENDPOINTS.categories)
    return unwrapList<CatalogCategory>(res)
  },

  async listUoms(): Promise<CatalogUom[]> {
    const res = await http.get<Paginated<CatalogUom> | CatalogUom[] | any>(ENDPOINTS.uoms)
    return unwrapList<CatalogUom>(res)
  },

  async createProduct(payload: ProductCreatePayload): Promise<ProductRow> {
    return http.post<ProductRow>(ENDPOINTS.products, payload)
  },

  // ✅ ixtiyoriy: product list kerak bo‘lsa (table uchun)
  async listProducts(params?: { search?: string; page?: number; page_size?: number }) {
    return http.get<Paginated<ProductRow> | ProductRow[]>(ENDPOINTS.products, params as any)
  },
}
