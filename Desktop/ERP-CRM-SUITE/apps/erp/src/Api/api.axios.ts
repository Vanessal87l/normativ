import { api } from "@/lib/api"
import type { Client, Employee, EntityMap, Supplier, TabKey } from "./types"

type CreatePayload<K extends TabKey> = Omit<EntityMap[K], "id" | "createdAt">
type UpdatePayload<K extends TabKey> = Partial<CreatePayload<K>>

type ApiRow = Record<string, unknown>
type ApiListEnvelope = { results?: unknown[]; items?: unknown[]; employees?: unknown[]; count?: unknown; next?: unknown; previous?: unknown }

function asArray(data: unknown): ApiRow[] {
  if (Array.isArray(data)) return data as ApiRow[]
  if (typeof data === "object" && data !== null) {
    const obj = data as ApiListEnvelope
    if (Array.isArray(obj.results)) return obj.results as ApiRow[]
    if (Array.isArray(obj.items)) return obj.items as ApiRow[]
    if (Array.isArray(obj.employees)) return obj.employees as ApiRow[]
  }
  return []
}

function asListMeta(data: unknown) {
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return { count: 0, next: null as string | null, previous: null as string | null }
  }
  const obj = data as ApiListEnvelope
  const count = Number(obj.count)
  return {
    count: Number.isFinite(count) ? count : asArray(data).length,
    next: typeof obj.next === "string" ? obj.next : null,
    previous: typeof obj.previous === "string" ? obj.previous : null,
  }
}

function asNumber(v: unknown) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function asString(v: unknown) {
  return String(v ?? "")
}

function normalizeEmail(v: unknown) {
  const x = asString(v).trim().toLowerCase()
  return x || undefined
}

function cleanPayload<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== "")
  ) as T
}

function normalizeEmployee(x: ApiRow, idx: number): Employee {
  return {
    id: asString(x.id ?? `EMP-${idx}`),
    // Backend maydonlari (full_name/base_salary/currency/is_active/deleted_at) ni front modelga map qilamiz.
    name: asString(x.full_name ?? x.name ?? "-"),
    phone: asString(x.phone ?? x.phone_number ?? ""),
    email: asString(x.email ?? ""),
    address: asString(x.address ?? ""),
    position: asString(x.position ?? x.role ?? ""),
    salary: asNumber(x.base_salary ?? x.salary ?? x.wage ?? 0),
    currency: asString(x.currency ?? "UZS"),
    isActive: Boolean(x.is_active ?? true),
    deletedAt: (x.deleted_at as string | null | undefined) ?? null,
    createdAt: asString(x.created_at ?? x.createdAt ?? new Date().toISOString()),
    updatedAt: asString(x.updated_at ?? x.updatedAt ?? ""),
  }
}

function normalizeKontragentAsEmployee(x: ApiRow, idx: number): Employee {
  return {
    id: asString(x.id ?? `EMP-${idx}`),
    name: asString(x.name ?? "-"),
    phone: asString(x.phone ?? ""),
    email: asString(x.email ?? ""),
    address: asString(x.address ?? ""),
    position: asString(x.position ?? x.role ?? ""),
    salary: asNumber(x.salary ?? 0),
    createdAt: asString(x.created_at ?? x.createdAt ?? new Date().toISOString()),
  }
}

function normalizeKontragentAsClient(x: ApiRow, idx: number): Client {
  return {
    id: asString(x.id ?? `CLI-${idx}`),
    code: asString(x.code ?? ""),
    kind: asString(x.kind ?? x.type ?? "CLIENT"),
    name: asString(x.name ?? "-"),
    phone: asString(x.phone ?? ""),
    email: asString(x.email ?? ""),
    address: asString(x.address ?? ""),
    company: asString(x.company ?? x.organization ?? ""),
    taxId: asString(x.inn ?? x.tax_id ?? ""),
    notes: asString(x.notes ?? ""),
    isActive: Boolean(x.is_active ?? true),
    deletedAt: (x.deleted_at as string | null | undefined) ?? null,
    createdAt: asString(x.created_at ?? x.createdAt ?? new Date().toISOString()),
    updatedAt: asString(x.updated_at ?? x.updatedAt ?? ""),
  }
}

function normalizeKontragentAsSupplier(x: ApiRow, idx: number): Supplier {
  return {
    id: asString(x.id ?? `SUP-${idx}`),
    code: asString(x.code ?? ""),
    kind: asString(x.kind ?? x.type ?? "SUPPLIER"),
    name: asString(x.name ?? "-"),
    phone: asString(x.phone ?? ""),
    email: asString(x.email ?? ""),
    address: asString(x.address ?? ""),
    company: asString(x.company ?? x.organization ?? x.name ?? "-"),
    taxId: asString(x.inn ?? x.tax_id ?? ""),
    notes: asString(x.notes ?? ""),
    paymentTerms: asString(x.payment_terms ?? x.paymentTerms ?? ""),
    isActive: Boolean(x.is_active ?? true),
    deletedAt: (x.deleted_at as string | null | undefined) ?? null,
    createdAt: asString(x.created_at ?? x.createdAt ?? new Date().toISOString()),
    updatedAt: asString(x.updated_at ?? x.updatedAt ?? ""),
  }
}

async function postWithCandidates(urls: string[], payload: Record<string, unknown>) {
  let lastErr: unknown = null
  for (const url of urls) {
    try {
      const { data } = await api.post(url, payload)
      return data
    } catch (e: any) {
      const status = Number(e?.response?.status || 0)
      if (status !== 404) throw e
      lastErr = e
    }
  }
  if (lastErr) throw lastErr
  throw new Error("Create endpoint topilmadi")
}

async function postSupplierKontragent(payload: Record<string, unknown>) {
  const urls = ["/api/v1/partners/kontragents/"]
  const kinds = ["SUPPLIER"]
  let lastErr: unknown = null
  const base = {
    name: payload.name,
    phone: payload.phone,
    email: payload.email,
    inn: payload.inn,
    address: payload.address,
    notes: payload.notes,
  }

  const variants: Record<string, unknown>[] = []
  for (const kind of kinds) {
    variants.push({ ...base, kind, notes: base.notes })
  }

  for (const body of variants) {
    for (const url of urls) {
      try {
        const cleaned = cleanPayload(body)
        const { data } = await api.post(url, cleaned)
        return data
      } catch (e: any) {
        const status = Number(e?.response?.status || 0)
        if (status === 404) {
          lastErr = e
          continue
        }
        throw e
      }
    }
  }
  if (lastErr) throw lastErr
  throw new Error("Supplier create endpoint topilmadi")
}

async function patchWithCandidates(urls: string[], payload: Record<string, unknown>) {
  let lastErr: unknown = null
  for (const url of urls) {
    try {
      const { data } = await api.patch(url, payload)
      return data
    } catch (e: any) {
      const status = Number(e?.response?.status || 0)
      if (status !== 404 && status !== 405) throw e
      try {
        const { data } = await api.put(url, payload)
        return data
      } catch (e2: any) {
        const status2 = Number(e2?.response?.status || 0)
        if (status2 !== 404) throw e2
        lastErr = e2
      }
    }
  }
  if (lastErr) throw lastErr
  throw new Error("Update endpoint topilmadi")
}

async function deleteWithCandidates(urls: string[]) {
  let lastErr: unknown = null
  for (const url of urls) {
    try {
      await api.delete(url)
      return
    } catch (e: any) {
      const status = Number(e?.response?.status || 0)
      if (status !== 404) throw e
      lastErr = e
    }
  }
  if (lastErr) throw lastErr
  throw new Error("Delete endpoint topilmadi")
}

async function postActionWithCandidates(urls: string[]) {
  let lastErr: unknown = null
  for (const url of urls) {
    try {
      await api.post(url, {})
      return
    } catch (e: any) {
      const status = Number(e?.response?.status || 0)
      if (status !== 404) throw e
      lastErr = e
    }
  }
  if (lastErr) throw lastErr
  throw new Error("Action endpoint topilmadi")
}

function normalizedType(row: ApiRow) {
  return asString(row.type ?? row.kind ?? row.category).trim().toUpperCase()
}

function isKindMatch(kind: "CLIENT" | "SUPPLIER" | "EMPLOYEE", row: ApiRow) {
  const t = normalizedType(row)
  if (!t) return false
  if (kind === "CLIENT") return t.includes("CLIENT") || t.includes("CUSTOMER") || t.includes("BOTH")
  if (kind === "SUPPLIER") return t.includes("SUPPLIER") || t.includes("SUPLIER") || t.includes("VENDOR") || t.includes("BOTH")
  return t.includes("EMPLOYEE") || t.includes("STAFF")
}

async function listKontragents(kind: "CLIENT" | "SUPPLIER" | "EMPLOYEE") {
  const { data } = await api.get("/api/v1/partners/kontragents/", {
    params: { kind },
  })
  const rows = asArray(data)
  return rows.filter((x) => isKindMatch(kind, x))
}

const EMPLOYEE_ENDPOINTS = [
  "/api/v1/partners/employees/",
  "/api/v1/employees/",
  "/api/v1/hr/employees/",
  "/api/v1/staff/employees/",
]

async function listEmployees(params?: {
  is_active?: boolean
  search?: string
  ordering?: string
  page?: number
  page_size?: number
}) {
  const query = cleanPayload({
    is_active: typeof params?.is_active === "boolean" ? params.is_active : undefined,
    search: params?.search,
    ordering: params?.ordering,
    page: params?.page,
    page_size: params?.page_size,
  })
  let lastErr: unknown = null
  for (const url of EMPLOYEE_ENDPOINTS) {
    try {
      const { data } = await api.get(url, { params: query })
      return { rows: asArray(data), ...asListMeta(data) }
    } catch (e: any) {
      const status = Number(e?.response?.status || 0)
      if (status !== 404) throw e
      lastErr = e
    }
  }
  if (lastErr) throw lastErr
  return { rows: [], count: 0, next: null as string | null, previous: null as string | null }
}

export const apiAxios = {
  async listEmployeesPage(params?: {
    is_active?: boolean
    search?: string
    ordering?: string
    page?: number
    page_size?: number
  }) {
    // Employee list DRF pagination/filter/search/order qo'llab-quvvatlaydi.
    const res = await listEmployees(params)
    return {
      items: res.rows.map((x, i) => normalizeEmployee(x, i)),
      total: res.count,
      next: res.next,
      previous: res.previous,
    }
  },

  async listKontragentsPage(params: {
    kind?: "CLIENT" | "SUPPLIER" | "OTHER"
    is_active?: boolean
    created_from?: string
    created_to?: string
    page?: number
    page_size?: number
  }) {
    const query = cleanPayload({
      kind: params.kind,
      is_active: typeof params.is_active === "boolean" ? params.is_active : undefined,
      created_from: params.created_from,
      created_to: params.created_to,
      page: params.page,
      page_size: params.page_size,
    })
    const { data } = await api.get("/api/v1/partners/kontragents/", { params: query })
    const rows = asArray(data)
    const meta = asListMeta(data)
    return { rows, ...meta }
  },

  async detail<K extends TabKey>(key: K, id: string): Promise<EntityMap[K]> {
    if (key === "employee") {
      const { data } = await api.get(`/api/v1/partners/employees/${id}/`)
      return normalizeEmployee((data as ApiRow) || {}, 0) as EntityMap[K]
    }
    const { data } = await api.get(`/api/v1/partners/kontragents/${id}/`)
    const row = (data as ApiRow) || {}
    if (key === "client") return normalizeKontragentAsClient(row, 0) as EntityMap[K]
    return normalizeKontragentAsSupplier(row, 0) as EntityMap[K]
  },

  async listClientsPage(params: {
    is_active?: boolean
    created_from?: string
    created_to?: string
    page?: number
    page_size?: number
  }) {
    const res = await this.listKontragentsPage({
      kind: "CLIENT",
      is_active: params.is_active,
      created_from: params.created_from,
      created_to: params.created_to,
      page: params.page,
      page_size: params.page_size,
    })
    return {
      items: res.rows.map((x, i) => normalizeKontragentAsClient(x, i)),
      total: res.count,
      next: res.next,
      previous: res.previous,
    }
  },

  async list<K extends TabKey>(key: K): Promise<EntityMap[K][]> {
    if (key === "employee") {
      const res = await this.listEmployeesPage({ page: 1, page_size: 500 }).catch(() => ({ items: [] as Employee[] }))
      if (res.items.length > 0) {
        return res.items as EntityMap[K][]
      }
      const kontragentRows = await listKontragents("EMPLOYEE").catch(() => [])
      return kontragentRows.map((x, i) => normalizeKontragentAsEmployee(x, i)) as EntityMap[K][]
    }
    if (key === "client") {
      const rows = await listKontragents("CLIENT")
      return rows.map((x, i) => normalizeKontragentAsClient(x, i)) as EntityMap[K][]
    }
    const rows = await listKontragents("SUPPLIER")
    return rows.map((x, i) => normalizeKontragentAsSupplier(x, i)) as EntityMap[K][]
  },

  async create<K extends TabKey>(key: K, payload: CreatePayload<K>): Promise<EntityMap[K]> {
    if (key === "employee") {
      const salaryRaw = (payload as CreatePayload<"employee">).salary
      const body: Record<string, unknown> = {
        full_name: (payload as CreatePayload<"employee">).name,
        position: (payload as CreatePayload<"employee">).position,
        phone: (payload as CreatePayload<"employee">).phone,
        // Salary berilmagan bo'lsa backend defaultiga qoldiramiz, majburan 0 qilmaymiz.
        base_salary: salaryRaw == null ? undefined : Number(salaryRaw),
        currency: (payload as CreatePayload<"employee">).currency || "UZS",
        is_active: (payload as CreatePayload<"employee">).isActive,
      }
      const data = await postWithCandidates(
        ["/api/v1/partners/employees/", ...EMPLOYEE_ENDPOINTS],
        cleanPayload(body)
      )
      return normalizeEmployee((data as ApiRow) || body, 0) as EntityMap[K]
    }

    if (key === "client") {
      const body = {
        kind: "CLIENT",
        name: (payload as CreatePayload<"client">).name,
        phone: (payload as CreatePayload<"client">).phone,
        email: normalizeEmail((payload as CreatePayload<"client">).email),
        inn: (payload as CreatePayload<"client">).taxId || undefined,
        address: (payload as CreatePayload<"client">).address || undefined,
        notes: (payload as CreatePayload<"client">).notes || (payload as CreatePayload<"client">).company || undefined,
        is_active: (payload as CreatePayload<"client">).isActive,
      }
      const data = await postWithCandidates(["/api/v1/partners/kontragents/"], cleanPayload(body))
      return normalizeKontragentAsClient((data as ApiRow) || body, 0) as EntityMap[K]
    }

    const body = {
      kind: "SUPPLIER",
      name: (payload as CreatePayload<"supplier">).name,
      phone: (payload as CreatePayload<"supplier">).phone,
      email: normalizeEmail((payload as CreatePayload<"supplier">).email),
      inn: (payload as CreatePayload<"supplier">).taxId || undefined,
      address: (payload as CreatePayload<"supplier">).address || undefined,
      notes:
        (payload as CreatePayload<"supplier">).notes ||
        (payload as CreatePayload<"supplier">).company ||
        (payload as CreatePayload<"supplier">).paymentTerms ||
        undefined,
      is_active: (payload as CreatePayload<"supplier">).isActive,
    }
    const data = await postSupplierKontragent(body)
    return normalizeKontragentAsSupplier((data as ApiRow) || body, 0) as EntityMap[K]
  },

  async update<K extends TabKey>(key: K, id: string, payload: UpdatePayload<K>): Promise<EntityMap[K]> {
    if (key === "employee") {
      const salaryRaw = (payload as UpdatePayload<"employee">).salary
      const body: Record<string, unknown> = {
        full_name: (payload as UpdatePayload<"employee">).name,
        position: (payload as UpdatePayload<"employee">).position,
        phone: (payload as UpdatePayload<"employee">).phone,
        base_salary: salaryRaw == null ? undefined : Number(salaryRaw),
        currency: (payload as UpdatePayload<"employee">).currency,
        is_active: (payload as UpdatePayload<"employee">).isActive,
      }
      const data = await patchWithCandidates(
        ["/api/v1/partners/employees/" + id + "/", ...EMPLOYEE_ENDPOINTS.map((x) => `${x}${id}/`)],
        cleanPayload(body)
      )
      return normalizeEmployee((data as ApiRow) || body, 0) as EntityMap[K]
    }

    if (key === "client") {
      const body = {
        kind: "CLIENT",
        name: (payload as UpdatePayload<"client">).name,
        phone: (payload as UpdatePayload<"client">).phone,
        email: normalizeEmail((payload as UpdatePayload<"client">).email),
        inn: (payload as UpdatePayload<"client">).taxId || undefined,
        address: (payload as UpdatePayload<"client">).address,
        notes: (payload as UpdatePayload<"client">).notes || (payload as UpdatePayload<"client">).company,
        is_active: (payload as UpdatePayload<"client">).isActive,
      }
      const data = await patchWithCandidates(
        [`/api/v1/partners/kontragents/${id}/`],
        cleanPayload(body)
      )
      return normalizeKontragentAsClient((data as ApiRow) || body, 0) as EntityMap[K]
    }

    const body = {
      kind: "SUPPLIER",
      name: (payload as UpdatePayload<"supplier">).name,
      phone: (payload as UpdatePayload<"supplier">).phone,
      email: normalizeEmail((payload as UpdatePayload<"supplier">).email),
      inn: (payload as UpdatePayload<"supplier">).taxId || undefined,
      address: (payload as UpdatePayload<"supplier">).address || undefined,
      notes:
        (payload as UpdatePayload<"supplier">).notes ||
        (payload as UpdatePayload<"supplier">).company ||
        (payload as UpdatePayload<"supplier">).paymentTerms,
      is_active: (payload as UpdatePayload<"supplier">).isActive,
    }
    const data = await patchWithCandidates(
      [`/api/v1/partners/kontragents/${id}/`],
      cleanPayload(body)
    )
    return normalizeKontragentAsSupplier((data as ApiRow) || body, 0) as EntityMap[K]
  },

  async remove<K extends TabKey>(key: K, id: string): Promise<{ ok: true }> {
    if (key === "employee") {
      await deleteWithCandidates([
        `/api/v1/partners/employees/${id}/`,
        ...EMPLOYEE_ENDPOINTS.map((x) => `${x}${id}/`),
      ])
      return { ok: true }
    }
    await deleteWithCandidates([`/api/v1/partners/kontragents/${id}/`])
    return { ok: true }
  },

  async restore<K extends TabKey>(key: K, id: string): Promise<{ ok: true }> {
    if (key === "employee") {
      await postActionWithCandidates([
        `/api/v1/partners/employees/${id}/restore/`,
        ...EMPLOYEE_ENDPOINTS.map((x) => `${x}${id}/restore/`),
      ])
      return { ok: true }
    }
    await api.post(`/api/v1/partners/kontragents/${id}/restore/`, {})
    return { ok: true }
  },

  async activate<K extends TabKey>(key: K, id: string): Promise<{ ok: true }> {
    if (key === "employee") {
      await postActionWithCandidates([
        `/api/v1/partners/employees/${id}/activate/`,
        ...EMPLOYEE_ENDPOINTS.map((x) => `${x}${id}/activate/`),
      ])
      return { ok: true }
    }
    await api.post(`/api/v1/partners/kontragents/${id}/activate/`, {})
    return { ok: true }
  },

  async deactivate<K extends TabKey>(key: K, id: string): Promise<{ ok: true }> {
    if (key === "employee") {
      await postActionWithCandidates([
        `/api/v1/partners/employees/${id}/deactivate/`,
        ...EMPLOYEE_ENDPOINTS.map((x) => `${x}${id}/deactivate/`),
      ])
      return { ok: true }
    }
    await api.post(`/api/v1/partners/kontragents/${id}/deactivate/`, {})
    return { ok: true }
  },

  async autocompleteEmployees(params: { q: string; limit?: number }) {
    const query = { q: params.q, limit: Math.min(50, Math.max(1, Number(params.limit ?? 10))) }
    const urls = [
      "/api/v1/partners/employees/autocomplete/",
      ...EMPLOYEE_ENDPOINTS.map((x) => `${x}autocomplete/`),
    ]
    for (const url of urls) {
      try {
        const { data } = await api.get(url, { params: query })
        return asArray(data).map((x) => ({
          id: asString(x.id),
          full_name: asString(x.full_name ?? x.name),
          position: asString(x.position ?? x.role),
          phone: asString(x.phone),
        }))
      } catch (e: any) {
        if (Number(e?.response?.status || 0) !== 404) throw e
      }
    }
    return []
  },

  async employeesMeta() {
    const urls = [
      "/api/v1/partners/employees/meta/",
      ...EMPLOYEE_ENDPOINTS.map((x) => `${x}meta/`),
    ]
    for (const url of urls) {
      try {
        const { data } = await api.get(url)
        return data
      } catch (e: any) {
        if (Number(e?.response?.status || 0) !== 404) throw e
      }
    }
    return null
  },

  async autocomplete(params: { q: string; limit?: number }) {
    const { data } = await api.get("/api/v1/partners/kontragents/autocomplete/", {
      params: { q: params.q, limit: Math.min(50, Math.max(1, Number(params.limit ?? 10))) },
    })
    return asArray(data).map((x) => ({
      id: asString(x.id),
      code: asString(x.code),
      name: asString(x.name),
      phone: asString(x.phone),
      inn: asString(x.inn ?? x.tax_id),
    }))
  },

  async checkDuplicate(params: { inn?: string; phone?: string; email?: string }) {
    const { data } = await api.get("/api/v1/partners/kontragents/check-duplicate/", {
      params: {
        ...(params.inn ? { inn: params.inn } : {}),
        ...(params.phone ? { phone: params.phone } : {}),
        ...(params.email ? { email: params.email.toLowerCase() } : {}),
      },
    })
    return data as { duplicate?: boolean; matches?: unknown[] }
  },

  async meta() {
    const { data } = await api.get("/api/v1/partners/kontragents/meta/")
    return data
  },
}
