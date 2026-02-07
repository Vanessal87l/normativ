import type { ChartPoint, OverviewSummaryResponse, RecentRow } from "./types";

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const MOCK_ROWS: RecentRow[] = [
  { id: 1, name: "Yusuf-Latipov", qty: 5, amount: 250, date: "2026-02-06", type: "SALE" },
  { id: 2, name: "Madaminbek", qty: 2, amount: 180, date: "2026-02-05", type: "SALE" },
  { id: 3, name: "Kirim: Xomashyo", qty: 20, amount: 0, date: "2026-02-04", type: "MOVE_IN" },
  { id: 4, name: "Chiqim: Ombor", qty: 7, amount: 0, date: "2026-02-03", type: "MOVE_OUT" },
];

export function demoSalesSeries(range: "1W" | "1M" | "3M" | "1Y"): ChartPoint[] {
  if (range === "1W") return [
    { label: "Mon", value: 1200 }, { label: "Tue", value: 1600 }, { label: "Wed", value: 900 },
    { label: "Thu", value: 2100 }, { label: "Fri", value: 1800 }, { label: "Sat", value: 2400 }, { label: "Sun", value: 2000 },
  ];
  if (range === "3M") return [
    { label: "W1", value: 4200 }, { label: "W2", value: 5100 }, { label: "W3", value: 4800 },
    { label: "W4", value: 5600 }, { label: "W5", value: 5300 }, { label: "W6", value: 6100 },
  ];
  if (range === "1Y") return [
    { label: "Jan", value: 8200 }, { label: "Feb", value: 9150 }, { label: "Mar", value: 8750 },
    { label: "Apr", value: 9400 }, { label: "May", value: 10200 }, { label: "Jun", value: 9800 },
    { label: "Jul", value: 11050 }, { label: "Aug", value: 10700 }, { label: "Sep", value: 11400 },
    { label: "Oct", value: 12100 }, { label: "Nov", value: 11850 }, { label: "Dec", value: 12500 },
  ];
  return [
    { label: "01", value: 900 }, { label: "05", value: 1300 }, { label: "10", value: 1100 },
    { label: "15", value: 1700 }, { label: "20", value: 1600 }, { label: "25", value: 1900 }, { label: "30", value: 2200 },
  ];
}

export function demoSkladSeries(range: "1W" | "1M" | "3M" | "1Y"): ChartPoint[] {
  // ombor “harakatlar” yoki “on-hand” trend demo
  const base = demoSalesSeries(range).map((p) => ({ ...p, value: Math.max(0, Math.round(p.value * 0.35)) }));
  return base;
}

export function buildOverviewDemo(): OverviewSummaryResponse {
  return {
    salesKpis: [
      { title: "Bugungi sotuv", value: "1,250,000", sub: "so'm", icon: "💳", tone: "success", deltaPercent: 12.8 },
      { title: "Bugungi daromad", value: "320,000", sub: "so'm", icon: "💰", tone: "success", deltaPercent: 6.2 },
      { title: "Oylik sotuv", value: "28,760,000", sub: "so'm", icon: "📈", tone: "neutral", deltaPercent: 19.2 },
      { title: "Chegirma ta’siri", value: "—", sub: "demo", icon: "🏷️", tone: "neutral", deltaPercent: -2.1 },
    ],
    skladKpis: [
      { title: "Omborda mahsulot", value: "8,450", sub: "dona", icon: "📦", tone: "neutral", deltaPercent: 4.1 },
      { title: "Bugun kirim", value: "18", sub: "pozitsiya", icon: "⬇️", tone: "success", deltaPercent: 2.0 },
      { title: "Bugun chiqim", value: "5", sub: "pozitsiya", icon: "⬆️", tone: "danger", deltaPercent: -1.2 },
      { title: "Kam qolganlar", value: "12", sub: "diqqat", icon: "🔔", tone: "danger", deltaPercent: 3.4 },
    ],
    salesSeries: demoSalesSeries("1M"),
    skladSeries: demoSkladSeries("1M"),
    rows: MOCK_ROWS,
  };
}
