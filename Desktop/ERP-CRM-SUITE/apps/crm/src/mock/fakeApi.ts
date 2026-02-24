/* src/mock/fakeApi.ts
   Fake API: localStorage DB + async delay + REST-ga o‘xshash response
*/

export type Priority = "RED" | "YELLOW" | "GREEN";
export type Column = "TODO" | "DOING" | "DONE";

export type Task = {
  id: string;
  name: string;
  description: string;
  priority: Priority;
  column: Column;
  createdAt: number;
  updatedAt?: number;
};

export type Customer = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  createdAt: number;
  updatedAt?: number;
};

export type DealLane = "LEAD" | "OPPORTUNITY" | "CUSTOMER" | "OTHER";

export type Deal = {
  id: string;
  title: string;
  company: string;
  owner: string;
  phone: string;
  valueUZS: string; // digits string
  note: string;
  lane: DealLane;
  createdAt: number;
  updatedAt?: number;
};

export type DashboardStats = {
  totalCustomers: number;
  totalTasks: number;
  todo: number;
  doing: number;
  done: number;
  totalSalesUZS: number;
  dealsCount: number;
  conversionPct: number;
};

export type ActivityItem = {
  id: string;
  title: string;
  when: number;
  type: "TASK";
  status: Column;
  priority: Priority;
};

export type SalesTrendPoint = {
  key: string;   // YYYY-M-D
  label: string; // Mon Tue...
  totalUZS: number;
};

const KEY_TASKS = "crm_tasks";
const KEY_CUSTOMERS = "crm_customers";     // ⚠️ agar sendagi key boshqacha bo‘lsa, shuni o‘zgartir
const KEY_SALES_DEALS = "crm_sales_deals_v1"; // ⚠️ men bergan SalesPage’da shu key ishlatilgan

function safeParse<T>(v: string | null, fallback: T): T {
  try { return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; }
}
function readLS<T>(key: string, fallback: T): T {
  return safeParse<T>(localStorage.getItem(key), fallback);
}
function writeLS<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}
function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

export function ensureSeed() {
  // Tasks
  if (localStorage.getItem(KEY_TASKS) === null) {
    const demo: Task[] = [
      {
        id: uid("t"),
        name: "Prepare proposal",
        description: "Send proposal to customer by evening.",
        priority: "RED",
        column: "TODO",
        createdAt: Date.now() - 1000 * 60 * 40,
      },
      {
        id: uid("t"),
        name: "Call customer",
        description: "Follow-up about requirements.",
        priority: "YELLOW",
        column: "DOING",
        createdAt: Date.now() - 1000 * 60 * 25,
      },
      {
        id: uid("t"),
        name: "Send invoice",
        description: "Invoice for last month support.",
        priority: "GREEN",
        column: "DONE",
        createdAt: Date.now() - 1000 * 60 * 90,
      },
    ];
    writeLS(KEY_TASKS, demo);
  }

  // Customers
  if (localStorage.getItem(KEY_CUSTOMERS) === null) {
    const demo: Customer[] = [
      { id: uid("c"), name: "Mirano Text", email: "info@mirano.uz", phone: "+998 90 000 00 00", createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2 },
      { id: uid("c"), name: "HEIGHT COMPANY", email: "hello@height.uz", phone: "+998 93 111 11 11", createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5 },
      { id: uid("c"), name: "Tripzy Group", email: "team@tripzy.uz", phone: "+998 99 222 22 22", createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7 },
    ];
    writeLS(KEY_CUSTOMERS, demo);
  }

  // Sales deals (men bergan SalesPage key)
  if (localStorage.getItem(KEY_SALES_DEALS) === null) {
    const demo: Deal[] = [
      {
        id: uid("dl"),
        title: "CRM setup package",
        company: "Mirano Text",
        owner: "Admin",
        phone: "+998 90 111 11 11",
        valueUZS: "12000000",
        note: "Wants premium UI",
        lane: "LEAD",
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
      },
      {
        id: uid("dl"),
        title: "ERP integration",
        company: "HEIGHT COMPANY",
        owner: "Manager A",
        phone: "+998 93 222 22 22",
        valueUZS: "50000000",
        note: "API discussion",
        lane: "OPPORTUNITY",
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
      },
      {
        id: uid("dl"),
        title: "Monthly support",
        company: "Tripzy Group",
        owner: "Manager B",
        phone: "+998 99 333 33 33",
        valueUZS: "8000000",
        note: "Invoice ready",
        lane: "CUSTOMER",
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 6,
      },
    ];
    writeLS(KEY_SALES_DEALS, demo);
  }
}

function computeStats(tasks: Task[], customers: Customer[], deals: Deal[]): DashboardStats {
  const todo = tasks.filter((t) => t.column === "TODO").length;
  const doing = tasks.filter((t) => t.column === "DOING").length;
  const done = tasks.filter((t) => t.column === "DONE").length;

  const totalSalesUZS = deals.reduce((acc, d) => acc + (Number(d.valueUZS) || 0), 0);
  const totalTasks = tasks.length;
  const conversionPct = totalTasks > 0 ? Math.round((done / totalTasks) * 100) : 0;

  return {
    totalCustomers: customers.length,
    totalTasks,
    todo,
    doing,
    done,
    totalSalesUZS,
    dealsCount: deals.length,
    conversionPct,
  };
}

function computeRecentActivity(tasks: Task[]): ActivityItem[] {
  return [...tasks]
    .sort((a, b) => (b.updatedAt ?? b.createdAt) - (a.updatedAt ?? a.createdAt))
    .slice(0, 7)
    .map((t) => ({
      id: t.id,
      title: t.name,
      when: t.updatedAt ?? t.createdAt,
      type: "TASK",
      status: t.column,
      priority: t.priority,
    }));
}

function computeSalesTrend(deals: Deal[], days = 7): SalesTrendPoint[] {
  const now = new Date();
  const buckets = Array.from({ length: days }).map((_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (days - 1 - i));
    d.setHours(0, 0, 0, 0);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    return {
      key,
      label: d.toLocaleDateString(undefined, { weekday: "short" }),
      totalUZS: 0,
    };
  });

  for (const s of deals) {
    const d = new Date(s.createdAt);
    d.setHours(0, 0, 0, 0);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    const idx = buckets.findIndex((b) => b.key === key);
    if (idx >= 0) buckets[idx].totalUZS += Number(s.valueUZS) || 0;
  }
  return buckets;
}

export const fakeApi = {
  async getDashboard() {
    ensureSeed();
    await sleep(350); // network delay

    const tasks = readLS<Task[]>(KEY_TASKS, []);
    const customers = readLS<Customer[]>(KEY_CUSTOMERS, []);
    const deals = readLS<Deal[]>(KEY_SALES_DEALS, []);

    return {
      stats: computeStats(tasks, customers, deals),
      activity: computeRecentActivity(tasks),
      salesTrend: computeSalesTrend(deals, 7),
    };
  },

  // (xohlasang keyin ishlatasan) — “real API”ga o‘xshatish uchun:
  async getTasks() {
    ensureSeed();
    await sleep(250);
    return readLS<Task[]>(KEY_TASKS, []);
  },
  async getCustomers() {
    ensureSeed();
    await sleep(250);
    return readLS<Customer[]>(KEY_CUSTOMERS, []);
  },
  async getDeals() {
    ensureSeed();
    await sleep(250);
    return readLS<Deal[]>(KEY_SALES_DEALS, []);
  },
};
