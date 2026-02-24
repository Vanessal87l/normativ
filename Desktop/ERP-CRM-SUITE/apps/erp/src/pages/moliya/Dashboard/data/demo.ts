import type { FinanceDashboardModel } from "./types"

function seeded(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}
function jitterInt(base: number, seed: number, pct = 0.06) {
  const r = seeded(seed) * 2 - 1
  return Math.max(0, Math.round(base * (1 + r * pct)))
}
function jitterPct(base: number, seed: number, spread = 2.5) {
  const r = seeded(seed) * 2 - 1
  return Number((base + r * spread).toFixed(1))
}

export function buildDemoDashboard(): FinanceDashboardModel {
  const seed = Math.floor(Date.now() / 60000)

  return {
    helloName: "Yusuf",
    kpis: [
      {
        title: "Jami balans",
        amount: jitterInt(857_850, seed + 1, 0.06),
        deltaPercent: jitterPct(2.1, seed + 11, 1.8),
        spark: [20, 30, 26, 34, 28, 38, 42, 39, 48, 52].map((n, i) => jitterInt(n, seed + 101 + i, 0.12)),
      },
      {
        title: "Jami xarajat",
        amount: jitterInt(198_110, seed + 2, 0.07),
        deltaPercent: jitterPct(-1.7, seed + 12, 2.0),
        spark: [18, 22, 21, 25, 27, 30, 35, 33, 40, 45].map((n, i) => jitterInt(n, seed + 201 + i, 0.12)),
      },
    ],
    dissection: [
      { label: "YAN", a: 120, b: 90 },
      { label: "FEV", a: 160, b: 110 },
      { label: "MAR", a: 140, b: 100 },
      { label: "APR", a: 210, b: 130 },
      { label: "MAY", a: 180, b: 140 },
      { label: "IYUN", a: 240, b: 160 },
      { label: "IYUL", a: 220, b: 150 },
      { label: "AVG", a: 260, b: 170 },
      { label: "SEN", a: 230, b: 160 },
      { label: "OKT", a: 280, b: 175 },
      { label: "NOY", a: 300, b: 190 },
      { label: "DEK", a: 320, b: 200 },
    ].map((p, i) => ({
      ...p,
      a: jitterInt(p.a, seed + 301 + i, 0.08),
      b: jitterInt(p.b, seed + 401 + i, 0.08),
    })),
    activeCards: [
      { name: "Privatbank", masked: "**** 4215", balance: Number((1452.23 + (seeded(seed + 7) - 0.5) * 120).toFixed(2)), brand: "VISA" },
      { name: "BCA Bank", masked: "**** 1286", balance: Number((932.4 + (seeded(seed + 8) - 0.5) * 90).toFixed(2)), brand: "CARD" },
    ],
    categories: [
      { name: "Xomashyo", percent: 28 },
      { name: "Ish haqi", percent: 25 },
      { name: "Transport", percent: 22 },
      { name: "Marketing", percent: 15 },
      { name: "Boshqa", percent: 10 },
    ].map((c, i) => ({ ...c, percent: Math.max(1, Math.round(c.percent + (seeded(seed + 501 + i) - 0.5) * 6)) })),
    spending: [
      { name: "Oziq-ovqat", percent: 57 },
      { name: "Uy", percent: 76 },
      { name: "Mashina", percent: 21 },
      { name: "Sog‘liq", percent: 34 },
      { name: "Hordiq", percent: 10 },
      { name: "Boshqa", percent: 8 },
    ].map((c, i) => ({ ...c, percent: clamp(Math.round(c.percent + (seeded(seed + 601 + i) - 0.5) * 10), 1, 100) })),
    transactions: [
      { id: "t1", title: "Supermarket", dateLabel: "Bugun, 11:45", amount: -22.35 },
      { id: "t2", title: "Boutique", dateLabel: "Kecha, 18:10", amount: -120.7 },
      { id: "t3", title: "Sport zal", dateLabel: "Kecha, 07:20", amount: -61.12 },
      { id: "t4", title: "Restoran", dateLabel: "2 kun oldin", amount: -13.25 },
    ],
    investments: [
      { title: "Studiyalar", amount: 520.0, percent: 72 },
      { title: "Kripto", amount: 220.0, percent: 48 },
      { title: "Hissa", amount: 135.0, percent: 30 },
      { title: "Aksiyalar", amount: 450.0, percent: 62 },
      { title: "Aktivlar", amount: 827.0, percent: 84 },
    ].map((x, i) => ({ ...x, percent: clamp(Math.round(x.percent + (seeded(seed + 701 + i) - 0.5) * 8), 1, 100) })),
    incomeExpense: [
      { label: "Dushanba", income: 120, expense: 110 },
      { label: "Seshanba", income: 150, expense: 115 },
      { label: "Chorshanba", income: 140, expense: 130 },
      { label: "Payshanba", income: 170, expense: 120 },
      { label: "Juma", income: 155, expense: 135 },
      { label: "Shanba", income: 190, expense: 140 },
      { label: "Yakshanba", income: 175, expense: 150 },
    ].map((p, i) => ({
      ...p,
      income: jitterInt(p.income, seed + 801 + i, 0.10),
      expense: jitterInt(p.expense, seed + 901 + i, 0.10),
    })),
  }
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n))
}
