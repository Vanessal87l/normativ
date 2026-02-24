/**
 * ✅ DashboardType'lar
 * Vazifasi:
 * - UI bloklari uchun kerakli data struktura
 */

export type RangeKey = "OXIRGI_OY" | "HAFTA" | "BUGUN" | "YIL"

export type Kpi = {
  title: string
  amount: number
  deltaPercent?: number | null
  // sparkline uchun
  spark: number[]
}

export type DissectionPoint = {
  label: string // "Yan", "Fev"...
  a: number // income
  b: number // expense
}

export type ActiveCard = {
  name: string
  masked: string
  balance: number
  brand: "VISA" | "MASTERCARD" | "HUMO" | "UZCARD" | "CARD"
}

export type CategorySlice = { name: string; percent: number }

export type SpendingParam = { name: string; percent: number }

export type TxRow = { id: string; title: string; dateLabel: string; amount: number }

export type InvestmentRow = { title: string; amount: number; percent: number }

export type IncomeExpensePoint = { label: string; income: number; expense: number }

export type FinanceDashboardModel = {
  helloName: string
  kpis: Kpi[] // 2ta
  dissection: DissectionPoint[]
  activeCards: ActiveCard[]
  categories: CategorySlice[]
  spending: SpendingParam[]
  transactions: TxRow[]
  investments: InvestmentRow[]
  incomeExpense: IncomeExpensePoint[]
}
