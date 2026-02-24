import { api } from "@/lib/api"
import { unwrapResults } from "@/lib/unwrap"

export type OnHandRow = {
  item_type: "PRODUCT" | "RAW_MATERIAL"
  product_id: number | null
  raw_material_id: number | null
  location_id: number | null
  item_name: string | null
  qty_onhand: string
  value_onhand: number
  avg_unit_cost: number
}

// warehouse filter param nomi swagger’da qanday bo‘lsa shunga moslang:
// men "warehouse" deb qo‘ydim
export async function fetchOnHand(params?: {
  warehouse?: number
  item_type?: "PRODUCT" | "RAW_MATERIAL"
}): Promise<OnHandRow[]> {
  const { data } = await api.get("/api/v1/warehouse/stock/on-hand/", { params })
  return unwrapResults<OnHandRow>(data)
}
