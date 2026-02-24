// src/pages/Recipes/api/recipesApi.ts
import { http } from "@/shared/http"

type AnyObj = Record<string, any>

function unwrapList<T = any>(res: any): { rows: T[]; count: number } {
  if (Array.isArray(res)) return { rows: res as T[], count: res.length }
  if (res && Array.isArray(res.results)) {
    return { rows: res.results as T[], count: Number(res.count ?? res.results.length) }
  }
  return { rows: [], count: 0 }
}

// 🔹 LIST TYPE
export type RecipeListItem = {
  id: number
  product: number
  product_name: string
  version: number
  is_active: boolean
  created_at: string
  items_count: number
}

// 🔹 DETAIL TYPE
export type RecipeDetail = {
  id: number
  product: number
  version: number
  is_active: boolean
  created_at: string
  items: {
    id?: number
    raw_material: number
    raw_material_name?: string
    qty_per_unit: string
  }[]
}

// 🔹 CREATE / UPDATE PAYLOAD
export type RecipePayload = {
  version: number
  items: {
    raw_material: number
    qty_per_unit: string
  }[]
}

const EP = {
  list: "/api/v1/catalog/recipes",
  detail: (id: number) => `/api/v1/catalog/recipes/${id}`,
  productCreate: (productId: number) =>
    `/api/v1/catalog/products/${productId}/recipes`,
}

export const recipesApi = {
  async list(params?: AnyObj) {
    const res = await http.get<any>(EP.list, params)
    return unwrapList<RecipeListItem>(res)
  },

  async read(id: number) {
    return http.get<RecipeDetail>(EP.detail(id))
  },

  async update(id: number, payload: RecipePayload) {
    return http.patch<RecipePayload>(EP.detail(id), payload)
  },

  async createForProduct(productId: number, payload: RecipePayload) {
    return http.post<RecipePayload>(EP.productCreate(productId), payload)
  },
}
