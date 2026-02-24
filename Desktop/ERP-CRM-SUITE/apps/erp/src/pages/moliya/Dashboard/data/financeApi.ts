import { http } from "@/shared/http"

export type FinanceDashboardQuery = {
  range: string
  search?: string
}

export type FinanceDashboardSummary = {
  currency: string
  income_total: number
  expense_total: number
  net: number
  top_categories: Array<{ entry_type: string; category: string; total: number }>
  recent: Array<{
    id: number | string
    entry_type: string
    category: string
    amount: number
    currency: string
    method: string
    occurred_on: string
    ref_type?: string | null
    ref_id?: string | number | null
  }>
}

export type FinanceDebtRow = {
  client_id?: number
  client_name?: string
  supplier_id?: number
  supplier_name?: string
  total: number
  paid: number
  debt: number
}

export type FinanceDashboardResponse = {
  summary: FinanceDashboardSummary
  clientsDebts: FinanceDebtRow[]
  suppliersDebts: FinanceDebtRow[]
}

function fmtDate(d: Date) {
  return d.toISOString().slice(0, 10)
}

function buildRange(range: string) {
  const now = new Date()
  const to = fmtDate(now)
  const fromDate = new Date(now)
  const key = String(range || "").toUpperCase()
  if (key === "BUGUN") {
    return { date_from: to, date_to: to }
  }
  if (key === "HAFTA") {
    fromDate.setDate(now.getDate() - 6)
    return { date_from: fmtDate(fromDate), date_to: to }
  }
  if (key === "YIL") {
    fromDate.setFullYear(now.getFullYear() - 1)
    return { date_from: fmtDate(fromDate), date_to: to }
  }
  fromDate.setMonth(now.getMonth() - 1)
  return { date_from: fmtDate(fromDate), date_to: to }
}

export const financeApi = {
  async getDashboard(query: FinanceDashboardQuery): Promise<FinanceDashboardResponse> {
    const range = buildRange(query.range)
    const summaryParams = {
      ...range,
      currency: "UZS",
    }

    const [summary, clientsRaw, suppliersRaw] = await Promise.all([
      http.get<FinanceDashboardSummary>("/api/v1/finance/dashboard/summary", summaryParams),
      http.get<{ rows?: FinanceDebtRow[] }>("/api/v1/finance/dashboard/debts/clients", {}),
      http.get<{ rows?: FinanceDebtRow[] }>("/api/v1/finance/dashboard/debts/suppliers", {}),
    ])

    return {
      summary,
      clientsDebts: Array.isArray(clientsRaw?.rows) ? clientsRaw.rows : [],
      suppliersDebts: Array.isArray(suppliersRaw?.rows) ? suppliersRaw.rows : [],
    }
  },
}
