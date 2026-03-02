import { http } from "@/shared/http"

function unwrapList<T = any>(res: any): { rows: T[]; count: number } {
  if (Array.isArray(res)) return { rows: res as T[], count: res.length }
  if (res && Array.isArray(res.results)) {
    return { rows: res.results as T[], count: Number(res.count ?? res.results.length) }
  }
  return { rows: [], count: 0 }
}

export type RecipeListItem = {
  id: number
  product: number
  product_name: string
  version: number
  is_active: boolean
  created_at: string
  items_count: number
  unit_material_cost_by_currency?: Record<string, number>
  unit_material_cost_display?: string
  cost_warnings?: string[]
}

export type RecipeItemDetail = {
  id?: number
  raw_material: number
  raw_material_name?: string
  qty_per_unit: string
  currency?: string
  default_purchase_price?: number | null
  line_material_cost_estimate?: number | null
  line_material_cost_display?: string
}

export type RecipeDetail = {
  id: number
  product: number
  product_name?: string
  version: number
  is_active: boolean
  created_at: string
  items: RecipeItemDetail[]
  unit_material_cost_by_currency?: Record<string, number>
  unit_material_cost_display?: string
  cost_warnings?: string[]
}

export type RecipePayload = {
  version?: number
  items: {
    raw_material: number
    qty_per_unit: string
  }[]
}

const EP = {
  list: "/api/v1/catalog/recipes/",
  detail: (id: number) => `/api/v1/catalog/recipes/${id}/`,
  activate: (id: number) => `/api/v1/catalog/recipes/${id}/activate/`,
  productCreate: (productId: number) => `/api/v1/catalog/products/${productId}/recipes/`,
  productRecipes: (productId: number) => `/api/v1/catalog/products/${productId}/recipes/`,
}

export const recipesApi = {
  async list(params?: {
    product?: number
    is_active?: boolean
    q?: string
    ordering?: "created_at" | "-created_at" | "version" | "-version"
  }) {
    const res = await http.get<any>(EP.list, params)
    return unwrapList<RecipeListItem>(res)
  },

  async listByProduct(productId: number) {
    const res = await http.get<any>(EP.productRecipes(productId))
    return unwrapList<RecipeListItem>(res)
  },

  async read(id: number) {
    return http.get<RecipeDetail>(EP.detail(id))
  },

  async update(id: number, payload: RecipePayload) {
    return http.patch<RecipeDetail>(EP.detail(id), payload)
  },

  async createForProduct(productId: number, payload: RecipePayload) {
    return http.post<RecipeDetail>(EP.productCreate(productId), payload)
  },

  async activate(id: number) {
    return http.post<{ ok?: boolean }>(EP.activate(id), {})
  },

  async remove(id: number) {
    return http.delete<void>(EP.detail(id))
  },
}
