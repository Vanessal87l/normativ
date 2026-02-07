export type FilterRange = "today" | "week" | "month";

export type DashboardFilter = {
  range: FilterRange;
  date: string; // YYYY-MM-DD
};

export type Tone = "neutral" | "success" | "danger";

export type StatItem = {
  title: string;
  value: number;
  unit?: string; // "$" yoki "UZS"
  deltaPercent?: number; // +12.1 / -2.4
  tone?: Tone;
};

export type ChartPoint = {
  label: string; // Jan, Feb...
  income: number;
  expense: number;
};

export type DebtFlowResponse = {
  series: ChartPoint[];
};

export type BudgetItem = {
  name: string;
  amount: number;
};

export type BudgetResponse = {
  total: number;
  items: BudgetItem[];
};

export type SavingGoal = {
  id: number | string;
  title: string;
  current: number;
  target: number;
};

export type RecentTxRow = {
  id: number | string;
  dateTime: string; // "2026-02-06 12:30"
  amount: number;   // (-) chiqim, (+) kirim
  paymentName: string;
  method: string;
  category: string;
};

export type DebtSummaryResponse = {
  stats: StatItem[];

  flow: DebtFlowResponse;
  budget: BudgetResponse;
  goals: SavingGoal[];

  recent: RecentTxRow[];
};
