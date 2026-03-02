import { http } from "@/shared/http"

export type Currency = "UZS" | "USD" | "RUB" | string

export type Product = {
  id: number
  name: string
  category: number | null
  category_name?: string | null
  uom: number
  uom_name?: string | null
  selling_price: number | null
  currency: Currency
  deleted_at?: string | null
  created_at?: string
}

export type ProductCreatePayload = {
  name: string
  category: number | null
  uom: number
  selling_price?: number
  currency: Currency
}

export type ProductPatchPayload = Partial<ProductCreatePayload>

type Paginated<T> = { count: number; next: string | null; previous: string | null; results: T[] }

type ListParams = {
  search?: string
  ordering?: "name" | "-name" | "created_at" | "-created_at"
  page?: number
  page_size?: number
}

function unwrapList<T>(res: any): { rows: T[]; count: number } {
  if (Array.isArray(res)) return { rows: res as T[], count: (res as T[]).length }
  if (res && Array.isArray(res.results)) {
    return { rows: res.results as T[], count: Number(res.count ?? res.results.length) }
  }
  return { rows: [], count: 0 }
}

const EP = {
  list: "/api/v1/catalog/products/",
  detail: (id: number) => `/api/v1/catalog/products/${id}/`,
}

export const productsApi = {
  async list(params?: ListParams) {
    const res = await http.get<Paginated<Product> | Product[] | any>(EP.list, params as any)
    return unwrapList<Product>(res)
  },
  async create(payload: ProductCreatePayload) {
    return http.post<Product>(EP.list, payload)
  },
  async patch(id: number, payload: ProductPatchPayload) {
    return http.patch<Product>(EP.detail(id), payload)
  },
  async remove(id: number) {
    return http.delete<void>(EP.detail(id))
  },
  async detail(id: number) {
    return http.get<Product>(EP.detail(id))
  },
}
