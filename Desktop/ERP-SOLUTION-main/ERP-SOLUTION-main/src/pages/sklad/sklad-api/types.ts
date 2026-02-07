export type FilterRange = "today" | "week" | "month";

export type DashboardFilter = {
  range: FilterRange;
  date: string; // YYYY-MM-DD
};

export type WarehouseStatItem = {
  title: string;
  value: string | number;
  sub: string;
  icon?: string;
  tone?: "neutral" | "success" | "danger";
};

export type ChartPoint = {
  label: string;
  value: number;
};

export type ChartRange = "1W" | "1M" | "3M" | "1Y";

export type WarehouseSummaryResponse = {
  stats: WarehouseStatItem[];
  lowStockCount: number;
  pendingTransfers: number;
};

export type StockSeriesResponse = {
  range: ChartRange;
  series: ChartPoint[];
};

export type MovementRow = {
  id: number | string;
  product: string;
  type: "KIRIM" | "CHIQIM" | "KOCHIRISH" | "ADJUST";
  qty: number;
  warehouse: string;
  date: string; // YYYY-MM-DD
};

export type MovementsQuery = {
  page: number;
  pageSize: number;

  q?: string;
  sortKey?: "product" | "type" | "qty" | "warehouse" | "date";
  sortDir?: "asc" | "desc";

  range?: FilterRange;
  date?: string;
};

export type Paginated<T> = {
  rows: T[];
  totalCount: number;
};
