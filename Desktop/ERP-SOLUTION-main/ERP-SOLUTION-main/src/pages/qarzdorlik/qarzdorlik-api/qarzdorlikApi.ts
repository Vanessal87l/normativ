// import { api } from "../Dashboard/dashboard-api/axios"; // agar axios shu joyda bo‘lsa yo‘lni mosla
import type { DashboardFilter, DebtSummaryResponse } from "./types";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const qarzdorlikApi = {
  async getSummary(filters?: DashboardFilter): Promise<DebtSummaryResponse> {
    // 🔜 backend bo‘lsa:
    // const res = await api.get("/debt/dashboard/", { params: filters })
    // return res.data

    await sleep(250);

    // ✅ demo data (UI ko‘rinishi uchun)
    return {
      stats: [
        { title: "Jami balans", value: 15700, unit: "$", deltaPercent: 12.1, tone: "success" },
        { title: "Kirim", value: 8500, unit: "$", deltaPercent: 6.3, tone: "success" },
        { title: "Chiqim", value: 6222, unit: "$", deltaPercent: -2.4, tone: "danger" },
        { title: "Jamg‘arma", value: 32913, unit: "$", deltaPercent: 12.1, tone: "success" },
      ],

      flow: {
        series: [
          { label: "Jan", income: 9000, expense: 5200 },
          { label: "Feb", income: 10400, expense: 6100 },
          { label: "Mar", income: 10000, expense: 5950 },
          { label: "Apr", income: 11800, expense: 7000 },
          { label: "May", income: 11200, expense: 6600 },
          { label: "Jun", income: 7800, expense: 5400 },
          { label: "Jul", income: 9200, expense: 6100 },
        ],
      },

      budget: {
        total: 5950,
        items: [
          { name: "Kafe & Restoran", amount: 400 },
          { name: "Ko‘ngilochar", amount: 650 },
          { name: "Investitsiya", amount: 1200 },
          { name: "Oziq-ovqat", amount: 2100 },
          { name: "Sog‘liq & Beauty", amount: 800 },
          { name: "Sayohat", amount: 800 },
        ],
      },

      goals: [
        { id: 1, title: "MacBook Pro", current: 1650, target: 6500 },
        { id: 2, title: "Yangi mashina", current: 60000, target: 120000 },
        { id: 3, title: "Yangi uy", current: 15000, target: 500000 },
      ],

      recent: [
        { id: 1, dateTime: "2026-02-06 12:30", amount: -10, paymentName: "YouTube", method: 'VISA **3254', category: "Obuna" },
        { id: 2, dateTime: "2026-02-06 15:00", amount: -150, paymentName: "Reserved", method: 'Mastercard **2154', category: "Shopping" },
        { id: 3, dateTime: "2026-02-07 09:00", amount: -80, paymentName: "Yaposhka", method: 'Mastercard **2154', category: "Kafe & Restoran" },
      ],
    };
  },
};
