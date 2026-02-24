import { api } from "@/lib/api"
import { unwrapResults } from "@/lib/unwrap"

export type Product = {
  id: number
  name: string
  category: number
  category_name: string
  uom: number
  uom_name: string
  selling_price: number
  currency: string
  nds_applies: boolean
  nds_rate: string
  nds_included: boolean
  created_at: string
}

export type Uom = {
  id: number
  code: string
  name: string
}

export async function fetchProducts(): Promise<Product[]> {
  const { data } = await api.get("/api/v1/catalog/products/")
  return unwrapResults<Product>(data)
}

export async function fetchUoms(): Promise<Uom[]> {
  const { data } = await api.get("/api/v1/dicts/uom/")
  return unwrapResults<Uom>(data)
}
