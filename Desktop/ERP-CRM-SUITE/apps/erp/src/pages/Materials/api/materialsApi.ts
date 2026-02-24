import { http } from "@/shared/http"

type AnyObj = Record<string, any>

function unwrapList<T = any>(res: any): { rows: T[]; count: number } {
  if (Array.isArray(res)) return { rows: res as T[], count: res.length }
  if (res && Array.isArray(res.results))
    return { rows: res.results as T[], count: Number(res.count ?? res.results.length) }
  return { rows: [], count: 0 }
}

export type Material = {
  id: number
  name: string
  material_type: string | null
  uom: number
  uom_name: string
  purchase_price: number | null
  currency: string
  created_at: string
}


export type MaterialCreatePayload = {
  name: string
  uom: number // ✅ REQUIRED
  sku?: string | null
  description?: string | null
}

export type MaterialUpdatePayload = Partial<MaterialCreatePayload>

const EP = {
  list: "/api/v1/catalog/materials/",
  detail: (id: number) => `/api/v1/catalog/materials/${id}/`,
}

export const materialsApi = {
  async list(params?: AnyObj) {
    const res = await http.get<any>(EP.list, params)
    return unwrapList<Material>(res)
  },
  async create(payload: MaterialCreatePayload) {
    return http.post<Material>(EP.list, payload)
  },
  async update(id: number, payload: MaterialUpdatePayload) {
    return http.patch<Material>(EP.detail(id), payload)
  },
  async remove(id: number) {
    return http.delete<any>(EP.detail(id))
  },
}
