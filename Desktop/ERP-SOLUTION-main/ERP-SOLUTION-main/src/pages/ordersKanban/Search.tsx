import { useEffect, useMemo, useRef, useState } from "react"
import { X, Search as SearchIcon } from "lucide-react"

export type Status = "Unpaid" | "Paid" | "Partial"
type StatusValue = "all" | Status

type Option = {
  value: StatusValue
  label: string
  hint?: string
}

const OPTIONS: Option[] = [
  { value: "all", label: "All", hint: "Show everything" },
  { value: "Unpaid", label: "Unpaid", hint: "Not paid yet" },
  { value: "Partial", label: "Partial", hint: "Partly paid" },
  { value: "Paid", label: "Paid", hint: "Fully paid" },
]


type Props = {
  q?: string
  setQ?: (v: string) => void
  status?: StatusValue
  setStatus?: (v: StatusValue) => void
  className?: string
}

export default function Search({
  q = "", 
  setQ = () => {},
  status = "all",
  setStatus = () => {},
  className = "",
}: Props) {
  return (
    <div className={`flex flex-wrap items-center gap-4 ${className}`}>
      <div className="flex items-center gap-2 h-10 w-[260px] rounded-xl bg-white border border-black/10 px-3  shadow-md">
        <SearchIcon className="h-4 w-4 text-[#5b656f]" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search orders..."
          className="w-full bg-transparent text-sm text-[#1d1f21] outline-none placeholder:text-[#9aa3ad]"
        />
        {(q?.length ?? 0) > 0 && (
          <button
            type="button"
            onClick={() => setQ("")}
            className="h-7 w-7 rounded-full hover:bg-black/5 transition inline-flex items-center justify-center"
            aria-label="Clear"
          >
            <X className="h-4 w-4 text-[#5b656f]" />
          </button>
        )}
      </div>

      <StatusFilter value={status} onChange={setStatus} />
    </div>
  )
}


function StatusFilter({
  value = "all",
  onChange,
  className = "",
}: {
  value?: StatusValue
  onChange?: (v: StatusValue) => void
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [internal, setInternal] = useState<StatusValue>(value)

  useEffect(() => setInternal(value), [value])

  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current) return
      if (!rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  const currentLabel = useMemo(
    () => OPTIONS.find((o) => o.value === internal)?.label ?? "All",
    [internal]
  )

  const setValue = (v: StatusValue) => {
    setInternal(v)
    onChange?.(v)
    setOpen(false)
  }

  return (
    <div ref={rootRef} className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={[
          "group inline-flex items-center gap-2",
          "h-10 px-4 rounded-[13px]",
          "shadow-md",
          "bg-white/70 backdrop-blur-[10px]",
          "text-[15px] font-semibold text-[#5b656f]",
          "active:scale-[0.99]",
        ].join(" ")}
      >
        <AnimatedTag open={open} />
        <span>Status</span>
        <span className="ml-1 text-[#5b656f] font-medium">{currentLabel}</span>
        <Chevron open={open} />
      </button>

      {open && (
        <div
          role="menu"
          className={[
            "absolute z-50 mt-2 w-72 right-0",
            "rounded-2xl overflow-hidden",
            "bg-white backdrop-blur-xl",
            "shadow-md",
            "p-2",
          ].join(" ")}
        >
          <div className="px-2 pt-2 pb-1 text-xs font-semibold text-[#1d1f21]">
            Choose status
          </div>

          <div className="grid gap-1 p-1">
            {OPTIONS.map((o) => {
              const active = o.value === internal
              return (
                <button
                  key={o.value}
                  role="menuitem"
                  type="button"
                  onClick={() => setValue(o.value)}
                  className={[
                    "w-full text-left rounded-xl px-3 py-2",
                    "transition",
                    active
                      ? "bg-[#02437B] text-white shadow-md"
                      : "hover:bg-black/5 text-[#1d1f21]",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <MiniBadge value={o.value} active={active} />
                      <div className="font-semibold">{o.label}</div>
                    </div>
                    {active ? <Tick /> : <GhostSparkle />}
                  </div>

                  {o.hint && (
                    <div className={["mt-0.5 text-xs", active ? "text-white/75" : "text-slate-500"].join(" ")}>
                      {o.hint}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          <div className="px-3 pb-2 pt-1 text-[11px] text-[#5b656f]">
            Tip: press <span className="font-semibold">Esc</span> to close
          </div>
        </div>
      )}
    </div>
  )
}


function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={[
        "ml-1 w-4 h-4 text-[#5b656f] transition-transform duration-300",
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
  )
}

function AnimatedTag({ open }: { open: boolean }) {
  return (
    <span className="relative inline-flex items-center">
      <svg
        className={[
          "w-5 h-5 transition-transform duration-300",
          open ? "rotate-[-10deg] scale-[1.03]" : "rotate-0 scale-100",
        ].join(" ")}
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M3 7a2 2 0 0 1 2-2h8l6 6-6 6H5a2 2 0 0 1-2-2V7Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M8.5 9.5h.01"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>

      <svg
        className={[
          "absolute -right-2 -top-2 w-4 h-4",
          "opacity-0 scale-75",
          "transition duration-300",
          open ? "opacity-100 scale-100" : "",
          "animate-[spark_1.6s_ease-in-out_infinite]",
        ].join(" ")}
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M12 2l1.1 4.2L17 7.3l-3.9 1.1L12 12l-1.1-3.6L7 7.3l3.9-1.1L12 2Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>

      <style>{`
        @keyframes spark {
          0%, 100% { transform: translate(0,0) rotate(0deg) scale(1); opacity: .65; }
          50% { transform: translate(-2px, 2px) rotate(10deg) scale(1.06); opacity: 1; }
        }
      `}</style>
    </span>
  )
}

function Tick() {
  return (
    <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="none">
      <path
        d="M4.5 10.5l3.2 3.1 7.8-8.1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function GhostSparkle() {
  return (
    <svg className="w-4 h-4 text-[#5b656f]" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3l.9 3.4 3.1.9-3.1.9L12 12l-.9-3.9L8 7.3l3.1-.9L12 3Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MiniBadge({ value, active }: { value: StatusValue; active: boolean }) {
  const text = value === "all" ? "∞" : value === "Unpaid" ? "0" : value === "Partial" ? "½" : "✓"
  return (
    <span
      className={[
        "inline-flex items-center justify-center",
        "w-8 h-6 rounded-lg text-xs font-bold",
        active ? "bg-white/15 text-white" : "bg-black/5 text-slate-700",
      ].join(" ")}
    >
      {text}
    </span>
  )
}