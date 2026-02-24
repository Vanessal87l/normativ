import type { FinanceDashboardModel } from "./types"
import { buildDemoDashboard } from "./demo"

function n(v: unknown) {
  const x = Number(v)
  return Number.isFinite(x) ? x : 0
}

function s(v: unknown) {
  return String(v ?? "")
}

export function adaptFinanceDashboard(response: any | undefined | null): FinanceDashboardModel | null {
  if (!response || !response.summary) return null

  try {
    const summary = response.summary
    const income = n(summary.income_total)
    const expense = n(summary.expense_total)
    const net = n(summary.net)
    const topCategories = Array.isArray(summary.top_categories) ? summary.top_categories : []
    const recent = Array.isArray(summary.recent) ? summary.recent : []
    const clientsDebts = Array.isArray(response.clientsDebts) ? response.clientsDebts : []
    const suppliersDebts = Array.isArray(response.suppliersDebts) ? response.suppliersDebts : []

    const catTotal = topCategories.reduce((acc: number, x: any) => acc + n(x?.total), 0) || 1
    const categories = topCategories.slice(0, 6).map((x: any) => ({
      name: s(x?.category || "OTHER"),
      percent: Math.round((n(x?.total) / catTotal) * 100),
    }))

    const incomeByCat = topCategories
      .filter((x: any) => s(x?.entry_type).toUpperCase() === "INCOME")
      .map((x: any) => ({ label: s(x?.category || "INCOME"), a: n(x?.total), b: 0 }))
    const expenseByCat = topCategories
      .filter((x: any) => s(x?.entry_type).toUpperCase() === "EXPENSE")
      .map((x: any) => ({ label: s(x?.category || "EXPENSE"), a: 0, b: n(x?.total) }))

    const dissection = [...incomeByCat, ...expenseByCat]

    const spending = suppliersDebts.slice(0, 5).map((x: any) => ({
      name: s(x?.supplier_name || `Supplier #${x?.supplier_id ?? ""}`),
      percent: n(x?.debt),
    }))

    const transactions = recent.slice(0, 8).map((x: any, i: number) => ({
      id: s(x?.id ?? `tx-${i}`),
      title: s(x?.category || x?.entry_type || "Tranzaksiya"),
      dateLabel: s(x?.occurred_on || "-"),
      amount: n(x?.amount),
    }))

    const investments = clientsDebts.slice(0, 5).map((x: any) => ({
      title: s(x?.client_name || `Client #${x?.client_id ?? ""}`),
      amount: n(x?.debt),
      percent: n(x?.total) > 0 ? Math.round((n(x?.debt) / n(x?.total)) * 100) : 0,
    }))

    return {
      helloName: "Finance",
      kpis: [
        {
          title: "Jami kirim",
          amount: income,
          deltaPercent: null,
          spark: [income, Math.max(income - Math.round(income * 0.12), 0), income],
        },
        {
          title: "Jami xarajat",
          amount: expense,
          deltaPercent: null,
          spark: [expense, Math.max(expense - Math.round(expense * 0.1), 0), expense],
        },
      ],
      dissection,
      activeCards: [
        {
          name: "Net",
          masked: "Finance",
          balance: net,
          brand: "CARD",
        },
      ],
      categories,
      spending,
      transactions,
      investments,
      incomeExpense: [
        {
          label: s(summary.currency || "UZS"),
          income,
          expense,
        },
      ],
    }
  } catch {
    return null
  }
}

export function ensureModel(m?: FinanceDashboardModel | null): FinanceDashboardModel {
  const demo = buildDemoDashboard()
  const x = m ?? ({} as FinanceDashboardModel)

  return {
    helloName: x.helloName ?? demo.helloName,
    kpis: Array.isArray(x.kpis) && x.kpis.length >= 2 ? x.kpis.slice(0, 2) : demo.kpis,
    dissection: Array.isArray(x.dissection) ? x.dissection : demo.dissection,
    activeCards: Array.isArray(x.activeCards) ? x.activeCards : demo.activeCards,
    categories: Array.isArray(x.categories) ? x.categories : demo.categories,
    spending: Array.isArray(x.spending) ? x.spending : demo.spending,
    transactions: Array.isArray(x.transactions) ? x.transactions : demo.transactions,
    investments: Array.isArray(x.investments) ? x.investments : demo.investments,
    incomeExpense: Array.isArray(x.incomeExpense) ? x.incomeExpense : demo.incomeExpense,
  }
}
