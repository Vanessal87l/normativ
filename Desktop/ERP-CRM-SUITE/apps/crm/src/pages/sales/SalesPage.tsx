import React, { useEffect, useMemo, useState, type DragEvent } from "react"
import { LayoutGrid, Table2, Plus, Search, Download, Pencil, Trash2 } from "lucide-react"

type Lane = "LEAD" | "OPPORTUNITY" | "CUSTOMER" | "OTHER"

type Deal = {
  id: string
  title: string
  company: string
  owner: string
  phone: string
  valueUZS: string
  note: string
  lane: Lane
  createdAt: number
  updatedAt?: number
}

const STORAGE_KEY = "crm_sales_deals_v1"

const laneMeta: Record<Lane, { title: string; hint: string; chip: string; bar: string }> = {
  LEAD: {
    title: "Lead",
    hint: "New interest",
    chip: "bg-yellow-500/15 text-yellow-200 border-yellow-400/25",
    bar: "bg-yellow-300/80",
  },
  OPPORTUNITY: {
    title: "Opportunity",
    hint: "Negotiation",
    chip: "bg-sky-500/15 text-sky-200 border-sky-400/25",
    bar: "bg-sky-300/80",
  },
  CUSTOMER: {
    title: "Customer",
    hint: "Converted",
    chip: "bg-emerald-500/15 text-emerald-200 border-emerald-400/25",
    bar: "bg-emerald-300/80",
  },
  OTHER: {
    title: "Other",
    hint: "Later / backlog",
    chip: "bg-slate-500/15 text-slate-200 border-slate-400/25",
    bar: "bg-slate-300/60",
  },
}

function cx(...s: Array<string | false | undefined>) {
  return s.filter(Boolean).join(" ")
}
function uid() {
  return `dl_${Math.random().toString(36).slice(2)}_${Date.now()}`
}
function safeParse<T>(v: string | null, fallback: T): T {
  try {
    return v ? (JSON.parse(v) as T) : fallback
  } catch {
    return fallback
  }
}
function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [locked])
}

const seed: Deal[] = [
  {
    id: uid(),
    title: "CRM setup package",
    company: "Mirano Text",
    owner: "Admin",
    phone: "+998 90 111 11 11",
    valueUZS: "12000000",
    note: "Wants premium UI",
    lane: "LEAD",
    createdAt: Date.now() - 520000,
  },
  {
    id: uid(),
    title: "ERP integration",
    company: "HEIGHT COMPANY",
    owner: "Manager A",
    phone: "+998 93 222 22 22",
    valueUZS: "50000000",
    note: "API discussion",
    lane: "OPPORTUNITY",
    createdAt: Date.now() - 420000,
  },
  {
    id: uid(),
    title: "Monthly support",
    company: "Tripzy Group",
    owner: "Manager B",
    phone: "+998 99 333 33 33",
    valueUZS: "8000000",
    note: "Invoice ready",
    lane: "CUSTOMER",
    createdAt: Date.now() - 320000,
  },
]

function formatUZS(v: string) {
  const n = Number(v || 0)
  if (!Number.isFinite(n)) return v
  return n.toLocaleString("ru-RU") + " UZS"
}

export default function SalesPage() {
  const [view, setView] = useState<"TABLE" | "BOARD">("TABLE")
  const [q, setQ] = useState("")

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [mode, setMode] = useState<"ADD" | "EDIT">("ADD")
  const [editId, setEditId] = useState<string | null>(null)

  const [dragOver, setDragOver] = useState<Lane | null>(null)

  const [items, setItems] = useState<Deal[]>(() => {
    const has = localStorage.getItem(STORAGE_KEY) !== null
    if (has) return safeParse<Deal[]>(localStorage.getItem(STORAGE_KEY), [])
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
    return seed
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    window.dispatchEvent(new Event("crm:data"))
  }, [items])

  useScrollLock(drawerOpen)

  // form
  const [fTitle, setFTitle] = useState("")
  const [fCompany, setFCompany] = useState("")
  const [fOwner, setFOwner] = useState("")
  const [fPhone, setFPhone] = useState("")
  const [fValue, setFValue] = useState("")
  const [fNote, setFNote] = useState("")
  const [fLane, setFLane] = useState<Lane>("LEAD")
  const [err, setErr] = useState<Partial<Record<string, string>>>({})

  function resetForm() {
    setFTitle("")
    setFCompany("")
    setFOwner("")
    setFPhone("")
    setFValue("")
    setFNote("")
    setFLane("LEAD")
    setErr({})
  }

  function openAdd() {
    setMode("ADD")
    setEditId(null)
    resetForm()
    setDrawerOpen(true)
  }

  function openEdit(id: string) {
    const it = items.find((x) => x.id === id)
    if (!it) return
    setMode("EDIT")
    setEditId(id)

    setFTitle(it.title)
    setFCompany(it.company)
    setFOwner(it.owner)
    setFPhone(it.phone)
    setFValue(it.valueUZS)
    setFNote(it.note)
    setFLane(it.lane)
    setErr({})
    setDrawerOpen(true)
  }

  function validate() {
    const e: Partial<Record<string, string>> = {}
    if (!fTitle.trim()) e.title = "Deal title required."
    if (!fCompany.trim()) e.company = "Company required."
    if (!fOwner.trim()) e.owner = "Owner/Manager required."
    if (!fPhone.trim()) e.phone = "Phone required."
    if (!fValue.trim()) e.value = "Value required."
    if (fValue.trim() && !/^\d+$/.test(fValue.trim())) e.value = "Value must be digits only."
    if (!fLane) e.lane = "Stage required."
    setErr(e)
    return Object.keys(e).length === 0
  }

  function submit() {
    if (!validate()) return

    if (mode === "ADD") {
      const x: Deal = {
        id: uid(),
        title: fTitle.trim(),
        company: fCompany.trim(),
        owner: fOwner.trim(),
        phone: fPhone.trim(),
        valueUZS: fValue.trim(),
        note: fNote.trim(),
        lane: fLane,
        createdAt: Date.now(),
      }
      setItems((p) => [x, ...p])
      setDrawerOpen(false)
      resetForm()
      return
    }

    if (!editId) return
    setItems((p) =>
      p.map((x) =>
        x.id === editId
          ? {
              ...x,
              title: fTitle.trim(),
              company: fCompany.trim(),
              owner: fOwner.trim(),
              phone: fPhone.trim(),
              valueUZS: fValue.trim(),
              note: fNote.trim(),
              lane: fLane,
              updatedAt: Date.now(),
            }
          : x
      )
    )
    setDrawerOpen(false)
    setEditId(null)
    resetForm()
  }

  function remove(id: string) {
    if (!window.confirm("Delete deal?")) return
    setItems((p) => p.filter((x) => x.id !== id))
  }

  function clearAll() {
    if (!window.confirm("Clear all deals?")) return
    setItems([])
  }

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return items
    return items.filter((x) =>
      [x.title, x.company, x.owner, x.phone, x.valueUZS, x.note, laneMeta[x.lane].title]
        .join(" ")
        .toLowerCase()
        .includes(query)
    )
  }, [items, q])

  const grouped = useMemo(() => {
    const g: Record<Lane, Deal[]> = { LEAD: [], OPPORTUNITY: [], CUSTOMER: [], OTHER: [] }
    for (const x of filtered) g[x.lane].push(x)
    ;(Object.keys(g) as Lane[]).forEach((k) => {
      g[k].sort((a, b) => (b.updatedAt ?? b.createdAt) - (a.updatedAt ?? a.createdAt))
    })
    return g
  }, [filtered])

  // dnd
  function onDragStart(e: DragEvent<HTMLDivElement>, id: string) {
    e.dataTransfer.setData("text/plain", id)
    e.dataTransfer.effectAllowed = "move"
  }
  function allowDrop(e: DragEvent<HTMLElement>, lane: Lane) {
    e.preventDefault()
    setDragOver(lane)
  }
  function onDrop(e: DragEvent<HTMLElement>, lane: Lane) {
    e.preventDefault()
    setDragOver(null)
    const id = e.dataTransfer.getData("text/plain")
    if (!id) return
    setItems((p) => p.map((x) => (x.id === id ? { ...x, lane, updatedAt: Date.now() } : x)))
  }

  return (
    <div className="space-y-6">
      <TopHeader
        title="Sales"
        subtitle="Deals pipeline (Lead → Opportunity → Customer)"
        q={q}
        setQ={setQ}
        view={view}
        setView={setView}
        onCreateCard={openAdd}
        onClearAll={clearAll}
      />

      {view === "TABLE" ? (
        <div className="rounded-3xl overflow-hidden glass-card">
          <HeaderRow title="Deals (table)" onCreateCard={openAdd} />

          <div className="overflow-auto">
            <table className="min-w-[1150px] w-full">
              <thead className="sticky top-0 z-10 glass-header text-white">
                <tr className="text-left text-xs font-extrabold tracking-wide text-white/80">
                  <th className="px-6 py-4">Deal</th>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Owner</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Value</th>
                  <th className="px-6 py-4">Stage</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((r, idx) => (
                  <tr
                    key={r.id}
                    className={cx(
                      "text-white/90 border-t border-white/10 hover:bg-white/10 transition",
                      idx % 2 === 0 ? "bg-white/5" : "bg-transparent"
                    )}
                  >
                    <td className="px-6 py-4">
                      <div className="font-extrabold text-sm">{r.title}</div>
                      <div className="text-xs text-white/55 mt-1 truncate">{r.note}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/80">{r.company}</td>
                    <td className="px-6 py-4 text-sm text-white/80">{r.owner}</td>
                    <td className="px-6 py-4 text-sm text-white/80">{r.phone}</td>
                    <td className="px-6 py-4 text-sm text-white/80">{formatUZS(r.valueUZS)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={cx(
                          "text-xs font-extrabold px-3 py-1 rounded-full border",
                          laneMeta[r.lane].chip
                        )}
                      >
                        {laneMeta[r.lane].title}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <IconBtn title="Edit" onClick={() => openEdit(r.id)}>
                          <Pencil className="h-4 w-4 text-white/80" />
                        </IconBtn>
                        <IconBtn title="Delete" onClick={() => remove(r.id)}>
                          <Trash2 className="h-4 w-4 text-white/80" />
                        </IconBtn>
                      </div>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="text-white/70 font-extrabold">No results</div>
                      <div className="text-white/45 text-sm mt-2">Try another search query.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="h-4" />
        </div>
      ) : (
        <div className="rounded-3xl glass-card overflow-hidden">
          <HeaderRow title="Deals (board)" onCreateCard={openAdd} />

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
              {(["LEAD", "OPPORTUNITY", "CUSTOMER", "OTHER"] as Lane[]).map((lane) => (
                <section
                  key={lane}
                  onDragOver={(e) => allowDrop(e, lane)}
                  onDrop={(e) => onDrop(e, lane)}
                  onDragLeave={() => setDragOver((p) => (p === lane ? null : p))}
                  className={cx(
                    "rounded-3xl border overflow-hidden transition",
                    "glass-inner border-white/10",
                    dragOver === lane && "ring-2 ring-white/10 border-white/20"
                  )}
                >
                  <div className="px-4 py-4 border-b border-white/10 glass-header">
                    <div className="flex items-center justify-between">
                      <div className="text-white font-extrabold text-sm">{laneMeta[lane].title}</div>
                      <div className="text-white/60 text-xs font-bold">{grouped[lane]?.length ?? 0}</div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={cx("h-1.5 w-10 rounded-full", laneMeta[lane].bar)} />
                      <div className="text-white/50 text-xs">{laneMeta[lane].hint}</div>
                    </div>
                  </div>

                  <div className="p-4 space-y-3 min-h-[520px]">
                    {(grouped[lane] ?? []).length === 0 ? (
                      <div className="h-full rounded-2xl border border-dashed border-white/10 bg-white/5 grid place-items-center text-white/45 text-sm">
                        Drop here
                      </div>
                    ) : (
                      grouped[lane].map((x) => (
                        <div
                          key={x.id}
                          draggable
                          onDragStart={(e) => onDragStart(e, x.id)}
                          className="rounded-2xl border border-white/10 glass-inner hover:bg-white/10 transition p-4 cursor-grab active:cursor-grabbing"
                          title="Drag to move"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-white font-extrabold text-sm truncate">{x.title}</div>
                              <div className="text-white/55 text-xs mt-1 truncate">
                                {x.company} • {formatUZS(x.valueUZS)}
                              </div>
                              <div className="text-white/55 text-xs mt-1 truncate">
                                {x.owner} • {x.phone}
                              </div>
                              <div className="text-white/55 text-xs mt-1 truncate">{x.note}</div>
                            </div>

                            <div className="flex items-center gap-2">
                              <IconBtn title="Edit" onClick={() => openEdit(x.id)}>
                                <Pencil className="h-4 w-4 text-white/80" />
                              </IconBtn>
                              <IconBtn title="Delete" onClick={() => remove(x.id)}>
                                <Trash2 className="h-4 w-4 text-white/80" />
                              </IconBtn>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-end">
                            <span
                              className={cx(
                                "text-[11px] font-extrabold px-3 py-1 rounded-full border",
                                laneMeta[x.lane].chip
                              )}
                            >
                              {laneMeta[x.lane].title}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      )}

      <RightDrawer
        open={drawerOpen}
        title={mode === "ADD" ? "Create Card" : "Edit Card"}
        onClose={() => setDrawerOpen(false)}
        onSave={submit}
        errorCount={Object.keys(err).filter((k) => err[k]).length}
      >
        <Field
          label="Deal title"
          value={fTitle}
          onChange={(v) => {
            setFTitle(v)
            setErr((p) => ({ ...p, title: undefined }))
          }}
          error={err.title}
        />
        <Field
          label="Company"
          value={fCompany}
          onChange={(v) => {
            setFCompany(v)
            setErr((p) => ({ ...p, company: undefined }))
          }}
          error={err.company}
        />
        <Field
          label="Owner/Manager"
          value={fOwner}
          onChange={(v) => {
            setFOwner(v)
            setErr((p) => ({ ...p, owner: undefined }))
          }}
          error={err.owner}
        />
        <Field
          label="Phone"
          value={fPhone}
          onChange={(v) => {
            setFPhone(v)
            setErr((p) => ({ ...p, phone: undefined }))
          }}
          error={err.phone}
        />
        <Field
          label="Value (UZS digits)"
          value={fValue}
          onChange={(v) => {
            setFValue(v)
            setErr((p) => ({ ...p, value: undefined }))
          }}
          error={err.value}
        />
        <Field
          label="Note"
          value={fNote}
          onChange={(v) => setFNote(v)}
          placeholder="Short note..."
        />
        <Select
          label="Stage"
          value={fLane}
          onChange={(v) => {
            setFLane(v as Lane)
            setErr((p) => ({ ...p, lane: undefined }))
          }}
          options={[
            { value: "LEAD", label: "Lead" },
            { value: "OPPORTUNITY", label: "Opportunity" },
            { value: "CUSTOMER", label: "Customer" },
            { value: "OTHER", label: "Other" },
          ]}
          error={err.lane}
        />
      </RightDrawer>
    </div>
  )
}

/* ================= UI helpers ================= */

function TopHeader(props: {
  title: string
  subtitle: string
  q: string
  setQ: (v: string) => void
  view: "TABLE" | "BOARD"
  setView: (v: "TABLE" | "BOARD") => void
  onCreateCard: () => void
  onClearAll: () => void
}) {
  const { title, subtitle, q, setQ, view, setView, onCreateCard, onClearAll } = props

  return (
    <div className="rounded-3xl overflow-hidden glass-card">
      <div className="px-6 py-4 flex items-center justify-between gap-4 glass-header">
        <div className="min-w-0">
          <div className="text-white font-extrabold text-lg">{title}</div>
          <div className="text-white/55 text-sm mt-1">{subtitle}</div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCreateCard}
            className="h-10 px-4 rounded-2xl bg-white text-black font-extrabold text-sm hover:opacity-95 transition inline-flex items-center gap-2"
            title="Create Card"
          >
            <Plus className="h-4 w-4" />
            Create Card
          </button>

          <button
            type="button"
            onClick={onClearAll}
            className="h-10 px-4 rounded-2xl glass-btn transition flex items-center gap-2 font-extrabold text-white text-sm"
          >
            Clear All
          </button>

          <button
            type="button"
            onClick={() => alert("Export (demo)")}
            className="h-10 px-4 rounded-2xl glass-btn transition flex items-center gap-2 font-extrabold text-white text-sm"
          >
            <Download className="h-4 w-4" />
            Export
          </button>

          <div className="h-10 rounded-2xl glass-btn p-1 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setView("TABLE")}
              className={cx(
                "h-8 px-3 rounded-xl transition flex items-center gap-2 text-xs font-extrabold",
                view === "TABLE" ? "bg-white text-black" : "text-white/70 hover:text-white"
              )}
            >
              <Table2 className="h-4 w-4" />
              Table
            </button>
            <button
              type="button"
              onClick={() => setView("BOARD")}
              className={cx(
                "h-8 px-3 rounded-xl transition flex items-center gap-2 text-xs font-extrabold",
                view === "BOARD" ? "bg-white text-black" : "text-white/70 hover:text-white"
              )}
            >
              <LayoutGrid className="h-4 w-4" />
              Board
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-2">
        <div className="h-11 rounded-2xl glass-btn px-4 flex items-center gap-3">
          <Search className="h-4 w-4 text-white/60" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search..."
            className="w-full bg-transparent outline-none text-white placeholder:text-white/35 text-sm"
          />
          <button
            type="button"
            onClick={onCreateCard}
            className="h-8 px-3 rounded-xl bg-white text-black font-extrabold text-xs hover:opacity-95 transition"
          >
            + Create Card
          </button>
        </div>
      </div>
    </div>
  )
}

function HeaderRow({ title, onCreateCard }: { title: string; onCreateCard: () => void }) {
  return (
    <div className="px-6 py-4 text-white flex items-center justify-between glass-header">
      <div className="text-sm font-extrabold">{title}</div>
      <button
        onClick={onCreateCard}
        className="h-9 px-4 rounded-2xl bg-white text-black font-extrabold text-xs hover:opacity-95 transition"
        type="button"
      >
        + Create Card
      </button>
    </div>
  )
}

function IconBtn(props: { title: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={props.title}
      onClick={props.onClick}
      className="h-9 w-9 rounded-xl glass-btn transition grid place-items-center"
    >
      {props.children}
    </button>
  )
}

function RightDrawer(props: {
  open: boolean
  title: string
  onClose: () => void
  onSave: () => void
  children: React.ReactNode
  errorCount: number
}) {
  useScrollLock(props.open)
  if (!props.open) return null

  return (
    <div className="fixed inset-0 z-[9999]">
      <div className="absolute inset-0 bg-slate-900/35 backdrop-blur-sm" onClick={props.onClose} />

      <div className="absolute inset-y-0 right-0 w-full max-w-[520px] glass-card border-l border-white/10 shadow-[0_30px_120px_-60px_rgba(0,0,0,0.9)]">
        <div className="h-14 px-6 flex items-center justify-between border-b border-white/10 glass-header">
          <div className="text-white font-extrabold">{props.title}</div>
          <button
            type="button"
            onClick={props.onClose}
            className="h-9 w-9 rounded-xl glass-btn transition grid place-items-center text-white"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          {props.children}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={props.onClose}
              className="h-11 px-5 rounded-2xl glass-btn transition text-white font-extrabold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={props.onSave}
              className="h-11 px-5 rounded-2xl bg-emerald-500/20 border border-emerald-400/25 text-emerald-200 font-extrabold hover:bg-emerald-500/25 transition"
            >
              Save
            </button>
          </div>

          {props.errorCount > 0 && (
            <div className="text-xs text-red-200/90 border border-red-400/20 bg-red-500/10 rounded-2xl px-4 py-3">
              Please fix the highlighted fields.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Field(props: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  error?: string
}) {
  const { label, value, onChange, placeholder, error } = props
  return (
    <label className="block">
      <div className="text-xs font-extrabold text-white/70 mb-2">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cx(
          "h-12 w-full rounded-2xl px-4 outline-none text-white placeholder:text-white/35",
          "glass-inner border",
          error ? "border-red-400/35 focus:ring-2 focus:ring-red-400/20" : "border-white/12 focus:ring-2 focus:ring-white/10"
        )}
      />
      {error && <div className="mt-2 text-xs font-bold text-red-200/90">{error}</div>}
    </label>
  )
}

function Select(props: {
  label: string
  value: string
  onChange: (v: string) => void
  options: Array<{ value: string; label: string }>
  error?: string
}) {
  const { label, value, onChange, options, error } = props
  return (
    <label className="block">
      <div className="text-xs font-extrabold text-white/70 mb-2">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cx(
          "h-12 w-full rounded-2xl px-4 outline-none text-white",
          "glass-inner border",
          error ? "border-red-400/35 focus:ring-2 focus:ring-red-400/20" : "border-white/12 focus:ring-2 focus:ring-white/10"
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#071b3a] text-white">
            {o.label}
          </option>
        ))}
      </select>
      {error && <div className="mt-2 text-xs font-bold text-red-200/90">{error}</div>}
    </label>
  )
}
