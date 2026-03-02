import { useEffect, useMemo, useRef, useState } from "react";
import { Search as SearchIcon, X } from "lucide-react";

export type Status = "Unpaid" | "Paid" | "Partial";
type StatusValue = "all" | Status;

type Option = {
  value: StatusValue;
  label: string;
  hint?: string;
};

const OPTIONS: Option[] = [
  { value: "all", label: "All", hint: "Show every order" },
  { value: "Unpaid", label: "Unpaid", hint: "Not paid yet" },
  { value: "Partial", label: "Partial", hint: "Partly paid" },
  { value: "Paid", label: "Paid", hint: "Fully paid" },
];

type Props = {
  q?: string;
  setQ?: (v: string) => void;
  status?: StatusValue;
  setStatus?: (v: StatusValue) => void;
  counts?: Partial<Record<StatusValue, number>>;
  className?: string;
};

export default function Search({
  q = "",
  setQ = () => {},
  status = "all",
  setStatus = () => {},
  counts = {},
  className = "",
}: Props) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <div className="flex h-11 w-full max-w-[320px] items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 shadow-sm">
        <SearchIcon className="h-4 w-4 text-slate-600" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search orders..."
          className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-600"
        />
        {(q?.length ?? 0) > 0 && (
          <button
            type="button"
            onClick={() => setQ("")}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full !bg-none !bg-transparent !text-slate-700 transition hover:!bg-slate-200 hover:!text-slate-900"
            aria-label="Clear"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <StatusFilter value={status} onChange={setStatus} counts={counts} />
    </div>
  );
}

function StatusFilter({
  value = "all",
  onChange,
  counts = {},
  className = "",
}: {
  value?: StatusValue;
  onChange?: (v: StatusValue) => void;
  counts?: Partial<Record<StatusValue, number>>;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [internal, setInternal] = useState<StatusValue>(value);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => setInternal(value), [value]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const currentLabel = useMemo(
    () => OPTIONS.find((o) => o.value === internal)?.label ?? "All",
    [internal],
  );

  const currentCount = counts[internal];

  const setValue = (v: StatusValue) => {
    setInternal(v);
    onChange?.(v);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="group inline-flex h-11 items-center gap-2 rounded-xl border !border-slate-300 !bg-none !bg-white px-4 text-sm font-semibold !text-slate-900 shadow-sm transition hover:!bg-slate-100"
      >
        <span className="text-slate-700">Status:</span>
        <span>{currentLabel}</span>
        {currentCount !== undefined && (
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-200 px-1.5 text-xs font-bold text-slate-700">
            {currentCount}
          </span>
        )}
        <Chevron open={open} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-300 bg-white p-2 shadow-xl"
          style={{ top: "100%" }}
        >
          <div className="px-2 pb-1 pt-2 text-xs font-semibold text-slate-700">
            Choose status
          </div>

          <div className="grid gap-1 p-1">
            {OPTIONS.map((o) => {
              const active = o.value === internal;
              const count = counts[o.value];
              return (
                <button
                  key={o.value}
                  role="menuitem"
                  type="button"
                  onClick={() => setValue(o.value)}
                  className={[
                    "w-full rounded-xl px-3 py-2 text-left transition",
                    active
                      ? "!bg-slate-900 !text-white shadow-sm"
                      : "!bg-none !bg-transparent !text-slate-800 hover:!bg-slate-200",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <MiniBadge value={o.value} active={active} />
                      <div className="font-semibold">{o.label}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {count !== undefined && (
                        <span
                          className={[
                            "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold",
                            active
                              ? "bg-white/20 text-white"
                              : "bg-slate-200 text-slate-700",
                          ].join(" ")}
                        >
                          {count}
                        </span>
                      )}
                      {active && <Tick />}
                    </div>
                  </div>

                  {o.hint && (
                    <div
                      className={[
                        "mt-0.5 text-xs",
                        active ? "text-slate-300" : "text-slate-600",
                      ].join(" ")}
                    >
                      {o.hint}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="px-3 pb-2 pt-1 text-[11px] text-slate-600">
            Tip: press <span className="font-semibold">Esc</span> to close
          </div>
        </div>
      )}
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={[
        "ml-1 h-4 w-4 text-slate-700 transition-transform duration-300",
        open ? "rotate-180" : "rotate-0",
      ].join(" ")}
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Tick() {
  return (
    <svg className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="none">
      <path
        d="M4.5 10.5l3.2 3.1 7.8-8.1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MiniBadge({ value, active }: { value: StatusValue; active: boolean }) {
  const text =
    value === "all"
      ? "ALL"
      : value === "Unpaid"
        ? "0"
        : value === "Partial"
          ? "1/2"
          : "OK";

  return (
    <span
      className={[
        "inline-flex h-6 w-9 items-center justify-center rounded-lg text-xs font-bold",
        active ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700",
      ].join(" ")}
    >
      {text}
    </span>
  );
}
