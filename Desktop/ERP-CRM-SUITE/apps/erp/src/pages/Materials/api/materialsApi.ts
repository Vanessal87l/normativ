import { http } from "@/shared/http"

type ListParams = {
  search?: string
  ordering?: "name" | "-name" | "created_at" | "-created_at"
  page?: number
  page_size?: number
}

function unwrapList<T = any>(res: any): { rows: T[]; count: number } {
  if (Array.isArray(res)) return { rows: res as T[], count: res.length }
  if (res && Array.isArray(res.results)) {
    return { rows: res.results as T[], count: Number(res.count ?? res.results.length) }
  }
  return { rows: [], count: 0 }
}

export type Material = {
  id: number
  name: string
  material_type: number | null
  material_type_name?: string | null
  uom: number
  uom_name: string
  purchase_price: number | null
  currency: "UZS" | string
  description?: string | null
  deleted_at?: string | null
  created_at: string
  updated_at?: string
}

export type MaterialCreatePayload = {
  name: string
  material_type: number
  description?: string | null
  uom: number
  purchase_price?: number
  currency?: "UZS"
}

export type MaterialUpdatePayload = Partial<MaterialCreatePayload>

const EP = {
  list: "/api/v1/catalog/materials/",
  detail: (id: number) => `/api/v1/catalog/materials/${id}/`,
}

export const materialsApi = {
  async list(params?: ListParams) {
    const res = await http.get<any>(EP.list, params)
    return unwrapList<Material>(res)
  },
  async detail(id: number) {
    return http.get<Material>(EP.detail(id))
  },
  async create(payload: MaterialCreatePayload) {
    return http.post<Material>(EP.list, payload)
  },
  async update(id: number, payload: MaterialUpdatePayload) {
    return http.patch<Material>(EP.detail(id), payload)
  },
  async remove(id: number) {
    return http.delete<void>(EP.detail(id))
  },
}
