import { useMemo, useState } from "react";
import type { DashboardFilter, FilterRange } from "../sklad-api/types";

type Props = {
  onApply?: (payload: DashboardFilter) => void;
};

const chipBase = "h-9 px-3 rounded-xl text-xs font-semibold border transition";
const chipActive = "bg-slate-900 text-white border-slate-900";
const chipIdle = "bg-white text-slate-700 border-slate-200 hover:bg-slate-50";

export default function SkladFilterBar({ onApply }: Props) {
  const [range, setRange] = useState<FilterRange>("month");

  const today = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const [date, setDate] = useState(today);

  return (
    <div className="rounded-2xl glass border border-slate-200 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-white">
          Sana bo‘yicha filtrlash:
        </span>

        <button
          type="button"
          className={`${chipBase} ${range === "today" ? chipActive : chipIdle}`}
          onClick={() => setRange("today")}
        >
          Bugun
        </button>

        <button
          type="button"
          className={`${chipBase} ${range === "week" ? chipActive : chipIdle}`}
          onClick={() => setRange("week")}
        >
          Hafta
        </button>

        <button
          type="button"
          className={`${chipBase} ${range === "month" ? chipActive : chipIdle}`}
          onClick={() => setRange("month")}
        >
          Oy
        </button>

        <div className="ml-2 flex items-center gap-2 rounded-xl border border-slate-200 glass px-3 h-9">
          <span className="text-xs text-white">📅</span>
          <input
            className="text-xs outline-none text-white"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="flex-1" />

        <button
          type="button"
          onClick={() => onApply?.({ range, date })}
          className="h-9 px-4 rounded-xl glass text-white text-sm font-semibold "
        >
          Filtrlarni qo‘llash
        </button>
      </div>
    </div>
  );
}
