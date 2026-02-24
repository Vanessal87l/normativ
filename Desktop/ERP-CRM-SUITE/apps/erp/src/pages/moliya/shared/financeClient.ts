import { api } from "@/lib/api"
import { demoStore, type FinanceEntry, type Employee } from "./demoStore"

const USE_BACKEND = String((import.meta as any).env?.VITE_USE_BACKEND || "1") !== "0"

const EP = {
  ledger: ["/api/v1/finance/ledger/"],
  payments: ["/api/v1/finance/payments/"],
  paymentsOrder: ["/api/v1/finance/payments/order/", "/api/v1/finance/payments/order"],
  paymentsPurchase: ["/api/v1/finance/payments/purchase/", "/api/v1/finance/payments/purchase"],
  paymentsSalary: ["/api/v1/finance/payments/salary/", "/api/v1/finance/payments/salary"],
  employees: ["/api/v1/partners/employees/", "/api/v1/finance/employees/"],
}

type ApiRow = Record<string, unknown>

function asArray(data: unknown): ApiRow[] {
  if (Array.isArray(data)) return data as ApiRow[]
  if (typeof data === "object" && data !== null) {
    const x = data as { results?: unknown[]; items?: unknown[]; rows?: unknown[]; data?: unknown[] }
    if (Array.isArray(x.results)) return x.results as ApiRow[]
    if (Array.isArray(x.items)) return x.items as ApiRow[]
    if (Array.isArray(x.rows)) return x.rows as ApiRow[]
    if (Array.isArray(x.data)) return x.data as ApiRow[]
  }
  return []
}

function n(v: unknown) {
  const x = Number(v)
  return Number.isFinite(x) ? x : 0
}

function s(v: unknown) {
  return String(v ?? "")
}

function mapEntryType(v: unknown): FinanceEntry["entryType"] {
  const t = s(v).toUpperCase()
  if (t === "INCOME") return "INCOME"
  if (t === "EXPENSE") return "EXPENSE"
  return "ADJUSTMENT"
}

function mapPayment(v: unknown): FinanceEntry["paymentMethod"] {
  const t = s(v).toUpperCase()
  if (t.includes("BANK")) return "BANK"
  if (t.includes("CARD")) return "CARD"
  return "CASH"
}

function mapCurrency(v: unknown): FinanceEntry["currency"] {
  const t = s(v).toUpperCase()
  if (t === "UZS" || t === "USD" || t === "EUR" || t === "RUB") return t as FinanceEntry["currency"]
  return "UZS"
}

function toIsoDate(v: unknown) {
  const raw = s(v)
  if (!raw) return new Date().toISOString().slice(0, 10)
  return raw.slice(0, 10)
}

function toRefString(refType: unknown, refId: unknown) {
  const t = s(refType)
  const id = s(refId)
  if (!t && !id) return undefined
  if (!id) return t
  if (!t) return `#${id}`
  return `${t} #${id}`
}

function normalizeLedgerRow(x: ApiRow, idx: number): FinanceEntry {
  const refType = x.ref_type ?? x.reference_type
  const refId = x.ref_id ?? x.reference_id
  return {
    id: s(x.id ?? `LEDGER-${idx}`),
    date: toIsoDate(x.occurred_on ?? x.date ?? x.created_at),
    entryType: mapEntryType(x.entry_type),
    category: s(x.category ?? "OTHER"),
    amount: n(x.amount),
    currency: mapCurrency(x.currency),
    paymentMethod: mapPayment(x.method),
    referenceType: refType ? s(refType) : undefined,
    referenceId: refId ? s(refId) : undefined,
    reference: toRefString(refType, refId),
    notes: x.note ? s(x.note) : undefined,
  }
}

function normalizePaymentRow(x: ApiRow, idx: number): FinanceEntry {
  const refType = x.ref_type
  const refId = x.ref_id
  return {
    id: s(x.id ?? `PAY-${idx}`),
    date: toIsoDate(x.paid_at ?? x.occurred_on ?? x.created_at),
    entryType: "EXPENSE",
    category: "PAYMENT",
    amount: n(x.amount),
    currency: mapCurrency(x.currency),
    paymentMethod: mapPayment(x.method),
    referenceType: refType ? s(refType) : undefined,
    referenceId: refId ? s(refId) : undefined,
    reference: toRefString(refType, refId),
    notes: x.note ? s(x.note) : undefined,
  }
}

function normalizeEmployee(x: ApiRow, idx: number): Employee {
  return {
    id: s(x.id ?? `EMP-${idx}`),
    fullName: s(x.full_name ?? x.name ?? "-"),
    role: s(x.position ?? x.role ?? "-"),
    phone: x.phone ? s(x.phone) : undefined,
    baseSalary: n(x.base_salary ?? x.salary ?? 0),
    currency: mapCurrency(x.currency),
  }
}

function errorText(e: any) {
  const data = e?.response?.data
  if (typeof data === "string") return data
  if (data?.detail) return String(data.detail)
  if (data && typeof data === "object") return JSON.stringify(data)
  return String(e?.message || "Xatolik")
}

async function getFirst(urls: string[], params?: Record<string, unknown>) {
  let lastErr: unknown = null
  for (const url of urls) {
    try {
      const { data } = await api.get(url, params ? { params } : undefined)
      return data
    } catch (e: any) {
      const status = Number(e?.response?.status || 0)
      if (status !== 404) throw e
      lastErr = e
    }
  }
  if (lastErr) throw lastErr
  return null
}

async function postFirst(urls: string[], payload: Record<string, unknown>) {
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

async function patchFirst(urls: string[], payload: Record<string, unknown>) {
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

async function deleteFirst(urls: string[]) {
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
}

function toBackendMethod(v: FinanceEntry["paymentMethod"] | undefined) {
  if (v === "BANK") return "BANK_TRANSFER"
  if (v === "CARD") return "CARD"
  return "CASH"
}

export const financeClient = {
  async listDebts(): Promise<FinanceEntry[]> {
    if (!USE_BACKEND) return []
    return []
  },

  async listPostings(): Promise<FinanceEntry[]> {
    if (!USE_BACKEND) return []
    const data = await getFirst(EP.payments).catch(() => null)
    return asArray(data).map(normalizePaymentRow).filter((x) => x.amount > 0)
  },

  async listEntries(): Promise<FinanceEntry[]> {
    if (!USE_BACKEND) return demoStore.listEntries()
    const data = await getFirst(EP.ledger).catch(() => null)
    return asArray(data).map(normalizeLedgerRow).filter((x) => x.amount >= 0)
  },

  async createEntry(payload: Omit<FinanceEntry, "id">): Promise<FinanceEntry> {
    if (!USE_BACKEND) return demoStore.createEntry(payload)

    const body = {
      entry_type: payload.entryType,
      category: payload.category,
      amount: Math.trunc(n(payload.amount)),
      currency: payload.currency,
      method: toBackendMethod(payload.paymentMethod),
      occurred_on: payload.date,
      ref_type: payload.referenceType ?? null,
      ref_id: payload.referenceId ?? null,
      note: payload.notes ?? "",
    }

    try {
      const data = await postFirst(EP.ledger, body)
      return normalizeLedgerRow((data as ApiRow) || body, 0)
    } catch (e: any) {
      throw new Error(errorText(e))
    }
  },

  async updateEntry(id: string, payload: Partial<Omit<FinanceEntry, "id">>): Promise<FinanceEntry> {
    if (!USE_BACKEND) return demoStore.updateEntry(id, payload)

    const body = {
      category: payload.category,
      occurred_on: payload.date,
      note: payload.notes,
    }
    try {
      const data = await patchFirst(EP.ledger.map((x) => `${x}${id}/`), body)
      return normalizeLedgerRow((data as ApiRow) || body, 0)
    } catch (e: any) {
      throw new Error(errorText(e))
    }
  },

  async deleteEntry(id: string): Promise<void> {
    if (!USE_BACKEND) return demoStore.deleteEntry(id)
    await deleteFirst(EP.ledger.map((x) => `${x}${id}/`))
  },

  async listEmployees(): Promise<Employee[]> {
    if (!USE_BACKEND) return demoStore.listEmployees()
    const data = await getFirst(EP.employees).catch(() => null)
    return asArray(data).map(normalizeEmployee)
  },

  async createEmployee(payload: Omit<Employee, "id">): Promise<Employee> {
    if (!USE_BACKEND) return demoStore.createEmployee(payload)
    const body = {
      full_name: payload.fullName,
      position: payload.role,
      phone: payload.phone,
      base_salary: payload.baseSalary,
      currency: payload.currency,
    }
    const data = await postFirst(EP.employees, body)
    return normalizeEmployee((data as ApiRow) || body, 0)
  },

  async payOrder(payload: {
    orderId: number
    amount: number
    currency: string
    method: FinanceEntry["paymentMethod"]
    occurredOn?: string
    note?: string
  }) {
    const body = {
      order_id: payload.orderId,
      method: toBackendMethod(payload.method),
      amount: Math.trunc(n(payload.amount)),
      currency: payload.currency,
      occurred_on: payload.occurredOn,
      note: payload.note ?? "",
    }
    return postFirst(EP.paymentsOrder, body)
  },

  async payPurchase(payload: {
    purchaseId: number
    amount: number
    currency: string
    method: FinanceEntry["paymentMethod"]
    occurredOn?: string
    note?: string
  }) {
    const body = {
      purchase_id: payload.purchaseId,
      method: toBackendMethod(payload.method),
      amount: Math.trunc(n(payload.amount)),
      currency: payload.currency,
      occurred_on: payload.occurredOn,
      note: payload.note ?? "",
    }
    return postFirst(EP.paymentsPurchase, body)
  },

  async paySalary(payload: {
    employeeId: number
    amount: number
    currency: string
    method: FinanceEntry["paymentMethod"]
    occurredOn?: string
    note?: string
  }) {
    const body = {
      employee_id: payload.employeeId,
      method: toBackendMethod(payload.method),
      amount: Math.trunc(n(payload.amount)),
      currency: payload.currency,
      occurred_on: payload.occurredOn,
      note: payload.note ?? "",
    }
    return postFirst(EP.paymentsSalary, body)
  },
}
