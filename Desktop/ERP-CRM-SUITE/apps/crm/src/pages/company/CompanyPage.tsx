import React, { useEffect, useMemo, useState } from "react"
import { LayoutGrid, Table2, Search, Download, Pencil, Trash2, X } from "lucide-react"

/* ===================== Types ===================== */

type ColumnId = string

type Company = {
  id: string
  name: string
  inn: string
  phone: string
  email: string
  address: string
  region: string
  lane: ColumnId
  createdAt: number
  updatedAt?: number
}

type BoardColumn = {
  id: ColumnId
  title: string
  hint: string
}

/* ===================== Storage ===================== */

const STORAGE_KEY = "crm_company_v2_items"
const COL_KEY = "crm_company_v2_columns"

const DEFAULT_COLUMNS: BoardColumn[] = [
  { id: "ACTIVE", title: "Active", hint: "Working companies" },
  { id: "PARTNER", title: "Partner", hint: "Partners / resellers" },
  { id: "PROSPECT", title: "Prospect", hint: "Potential clients" },
  { id: "ARCHIVED", title: "Archived", hint: "Paused / closed" },
]

/* ===================== Helpers ===================== */

function cn(...a: Array<string | false | undefined | null>) {
  return a.filter(Boolean).join(" ")
}
function uid() {
  return `cmp_${Math.random().toString(36).slice(2)}_${Date.now()}`
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

/* ===================== Premium Button Classes ===================== */

const btn = {
  primary:
    "h-11 px-5 rounded-2xl bg-white text-black font-extrabold shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.98]",
  glass:
    "h-11 px-5 rounded-2xl glass-btn text-white font-extrabold transition-all duration-200 hover:bg-white/10 hover:-translate-y-[1px] hover:shadow-md active:translate-y-0 active:scale-[0.98]",
  icon:
    "h-9 w-9 rounded-xl glass-btn grid place-items-center transition-all duration-200 hover:bg-white/12 hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.98]",
  chipWrap: "h-11 rounded-2xl glass-btn p-1 flex items-center gap-1",
  chip:
    "h-9 px-4 rounded-xl transition-all duration-200 flex items-center gap-2 text-sm font-extrabold hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.98]",
  mini:
    "h-9 px-3 rounded-xl glass-btn text-white text-xs font-extrabold transition-all duration-200 hover:bg-white/12 hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.98]",
}

/* ===================== Seed ===================== */

const seed: Company[] = [
  {
    id: uid(),
    name: "HEIGHT COMPANY",
    inn: "309991234",
    phone: "+998 90 111 11 11",
    email: "info@height.uz",
    address: "Tashkent, UZ",
    region: "TAS",
    lane: "ACTIVE",
    createdAt: Date.now() - 1000000,
  },
  {
    id: uid(),
    name: "Mirano Text",
    inn: "308880000",
    phone: "+998 93 222 22 22",
    email: "office@mirano.uz",
    address: "Samarkand, UZ",
    region: "SAM",
    lane: "PARTNER",
    createdAt: Date.now() - 900000,
  },
  {
    id: uid(),
    name: "Tripzy Group",
    inn: "307770000",
    phone: "+998 99 333 33 33",
    email: "sales@tripzy.com",
    address: "Tashkent, UZ",
    region: "TAS",
    lane: "PROSPECT",
    createdAt: Date.now() - 800000,
  },
]

export default function CompanyPage() {
  const boardRef = React.useRef<HTMLDivElement | null>(null)

  // ✅ hover auto-scroll refs
  const hoverDirRef = React.useRef<"LEFT" | "RIGHT" | null>(null)
  const hoverRafRef = React.useRef<number | null>(null)

  const [view, setView] = useState<"TABLE" | "BOARD">("TABLE")
  const [q, setQ] = useState("")

  // ✅ hover scroll paytida snap’ni o‘chirib turamiz
  const [autoScroll, setAutoScroll] = useState(false)

  // ✅ drag holati (auto horizontal scroll uchun)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOver, setDragOver] = useState<ColumnId | null>(null)

  // ✅ DRAG PAYTIDA AUTO HORIZONTAL SCROLL
  useEffect(() => {
    if (!isDragging) return

    function handleDragOver(ev: DragEvent) {
      const el = boardRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const x = ev.clientX - rect.left
      const edge = 110
      const speed = 26
      if (x < edge) el.scrollLeft -= speed
      else if (x > rect.width - edge) el.scrollLeft += speed
    }

    window.addEventListener("dragover", handleDragOver)
    return () => window.removeEventListener("dragover", handleDragOver)
  }, [isDragging])

  // ✅ stop hover scroll on unmount
  useEffect(() => {
    return () => {
      hoverDirRef.current = null
      if (hoverRafRef.current) cancelAnimationFrame(hoverRafRef.current)
      hoverRafRef.current = null
    }
  }, [])

  function stopHoverScroll() {
    hoverDirRef.current = null
    setAutoScroll(false)
    if (hoverRafRef.current) cancelAnimationFrame(hoverRafRef.current)
    hoverRafRef.current = null
  }

  function startHoverScroll(dir: "LEFT" | "RIGHT") {
    hoverDirRef.current = dir
    setAutoScroll(true)

    if (hoverRafRef.current) return

    const tick = () => {
      const el = boardRef.current
      const d = hoverDirRef.current
      if (!el || !d) {
        hoverRafRef.current = null
        return
      }
      const speed = 28
      el.scrollLeft += d === "RIGHT" ? speed : -speed
      hoverRafRef.current = requestAnimationFrame(tick)
    }

    hoverRafRef.current = requestAnimationFrame(tick)
  }

  function onBoardDragOver(e: React.DragEvent) {
    e.preventDefault()
  }

  // ✅ modals
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  // ✅ Create COLUMN modal
  const [createColumnOpen, setCreateColumnOpen] = useState(false)
  const [colTitle, setColTitle] = useState("")
  const [colErr, setColErr] = useState<string | null>(null)

  // ✅ columns
  const [columns, setColumns] = useState<BoardColumn[]>(() => {
    const hasKey = localStorage.getItem(COL_KEY) !== null
    if (!hasKey) {
      localStorage.setItem(COL_KEY, JSON.stringify(DEFAULT_COLUMNS))
      return DEFAULT_COLUMNS
    }
    const saved = safeParse<BoardColumn[]>(localStorage.getItem(COL_KEY), DEFAULT_COLUMNS)
    return saved.length ? saved : DEFAULT_COLUMNS
  })
  useEffect(() => localStorage.setItem(COL_KEY, JSON.stringify(columns)), [columns])

  // ✅ items
  const [items, setItems] = useState<Company[]>(() => {
    const has = localStorage.getItem(STORAGE_KEY) !== null
    if (has) return safeParse<Company[]>(localStorage.getItem(STORAGE_KEY), [])
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
    return seed
  })
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    window.dispatchEvent(new Event("crm:data"))
  }, [items])

  // which column when user presses +Add inside column
  const [quickColumn, setQuickColumn] = useState<ColumnId | null>(null)

  // selection for edit
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useScrollLock(createOpen || editOpen || createColumnOpen)

  /* ===================== Search ===================== */

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return items
    return items.filter((x) => {
      const colTitle2 = columns.find((c) => c.id === x.lane)?.title ?? x.lane
      const hay = [x.name, x.inn, x.phone, x.email, x.address, x.region, colTitle2].join(" ").toLowerCase()
      return hay.includes(query)
    })
  }, [items, q, columns])

  /* ===================== Grouped ===================== */

  const grouped = useMemo(() => {
    const byCol: Record<string, Company[]> = {}
    for (const c of columns) byCol[c.id] = []
    for (const t of filtered) {
      if (!byCol[t.lane]) byCol[t.lane] = []
      byCol[t.lane].push(t)
    }
    for (const colId of Object.keys(byCol)) {
      byCol[colId].sort((a, b) => (b.updatedAt ?? b.createdAt) - (a.updatedAt ?? a.createdAt))
    }
    return byCol
  }, [filtered, columns])

  /* ===================== Create Column ===================== */

  function submitCreateColumn() {
    const title = colTitle.trim()
    if (!title) return setColErr("Title kiritilishi shart.")
    if (title.length < 2) return setColErr("Title kamida 2 ta belgi bo‘lsin.")

    const newCol: BoardColumn = {
      id: `COL_${uid()}`,
      title,
      hint: "Custom column",
    }
    setColumns((p) => [...p, newCol])
    setCreateColumnOpen(false)
    setColTitle("")
    setColErr(null)

    requestAnimationFrame(() => {
      boardRef.current?.scrollTo({ left: boardRef.current.scrollWidth, behavior: "smooth" })
    })
  }

  /* ===================== Form State ===================== */

  const [fName, setFName] = useState("")
  const [fInn, setFInn] = useState("")
  const [fPhone, setFPhone] = useState("")
  const [fEmail, setFEmail] = useState("")
  const [fAddress, setFAddress] = useState("")
  const [fRegion, setFRegion] = useState("TAS")
  const [fLane, setFLane] = useState<ColumnId>("ACTIVE")
  const [err, setErr] = useState<Record<string, string>>({})

  function resetForm() {
    setFName("")
    setFInn("")
    setFPhone("")
    setFEmail("")
    setFAddress("")
    setFRegion("TAS")
    setFLane(quickColumn ?? "ACTIVE")
    setErr({})
  }

  useEffect(() => {
    if (!createOpen) return
    setErr({})
    setFLane(quickColumn ?? "ACTIVE")
  }, [createOpen, quickColumn])

  function validate() {
    const e: Record<string, string> = {}
    if (!fName.trim()) e.name = "Company name required"
    if (!fInn.trim()) e.inn = "INN required"
    if (fInn.trim() && fInn.trim().length < 6) e.inn = "INN too short"
    if (!fPhone.trim()) e.phone = "Phone required"
    if (!fEmail.trim()) e.email = "Email required"
    if (fEmail.trim() && !fEmail.includes("@")) e.email = "Email not valid"
    if (!fAddress.trim()) e.address = "Address required"
    if (!fLane) e.lane = "Status required"
    setErr(e)
    return Object.keys(e).length === 0
  }

  function createWork() {
    if (!validate()) return
    const x: Company = {
      id: uid(),
      name: fName.trim(),
      inn: fInn.trim(),
      phone: fPhone.trim(),
      email: fEmail.trim(),
      address: fAddress.trim(),
      region: fRegion.trim() || "TAS",
      lane: fLane,
      createdAt: Date.now(),
    }
    setItems((p) => [x, ...p])
    setCreateOpen(false)
    setQuickColumn(null)
    resetForm()
  }

  function openEdit(id: string) {
    const it = items.find((x) => x.id === id)
    if (!it) return
    setSelectedId(id)
    setFName(it.name)
    setFInn(it.inn)
    setFPhone(it.phone)
    setFEmail(it.email)
    setFAddress(it.address)
    setFRegion(it.region)
    setFLane(it.lane)
    setErr({})
    setEditOpen(true)
  }

  function closeEdit() {
    setEditOpen(false)
    setSelectedId(null)
  }

  function saveEdit() {
    if (!selectedId) return
    if (!validate()) return

    setItems((p) =>
      p.map((x) =>
        x.id === selectedId
          ? {
              ...x,
              name: fName.trim(),
              inn: fInn.trim(),
              phone: fPhone.trim(),
              email: fEmail.trim(),
              address: fAddress.trim(),
              region: fRegion.trim() || "TAS",
              lane: fLane,
              updatedAt: Date.now(),
            }
          : x
      )
    )
    closeEdit()
  }

  function remove(id: string) {
    if (!window.confirm("Delete company?")) return
    setItems((p) => p.filter((x) => x.id !== id))
    if (selectedId === id) closeEdit()
  }

  function clearAll() {
    if (!window.confirm("Delete ALL companies?")) return
    setItems([])
    closeEdit()
  }

  /* ===================== Drag & Drop ===================== */

  function onDragStart(e: React.DragEvent, id: string) {
    setIsDragging(true)
    e.dataTransfer.setData("text/plain", id)
    e.dataTransfer.effectAllowed = "move"
  }
  function onDragEnd() {
    setIsDragging(false)
    setDragOver(null)
  }
  function allowDrop(e: React.DragEvent, col: ColumnId) {
    e.preventDefault()
    setDragOver(col)
  }
  function onDrop(e: React.DragEvent, col: ColumnId) {
    e.preventDefault()
    setDragOver(null)
    setIsDragging(false)
    const id = e.dataTransfer.getData("text/plain")
    if (!id) return
    setItems((p) => p.map((x) => (x.id === id ? { ...x, lane: col, updatedAt: Date.now() } : x)))
  }
  function onDragLeave(col: ColumnId) {
    setDragOver((p) => (p === col ? null : p))
  }

  /* ===================== UI ===================== */

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-2xl font-extrabold text-white drop-shadow-sm">Company</div>
            <div className="text-sm text-white/70 mt-1">Companies / partners • board is Tasks-style.</div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setColTitle("")
                setColErr(null)
                setCreateColumnOpen(true)
              }}
              className={btn.glass}
            >
              + Create Card
            </button>

            <button
              onClick={() => {
                setQuickColumn(null)
                resetForm()
                setCreateOpen(true)
              }}
              className={btn.primary}
            >
              + Create Work
            </button>

            <button onClick={clearAll} className={btn.glass}>
              Clear All
            </button>

            <div className={btn.chipWrap}>
              <button
                type="button"
                onClick={() => setView("TABLE")}
                className={cn(btn.chip, view === "TABLE" ? "bg-white text-black shadow-sm" : "text-white/75 hover:text-white")}
              >
                <Table2 className="h-4 w-4" /> Table
              </button>
              <button
                type="button"
                onClick={() => setView("BOARD")}
                className={cn(btn.chip, view === "BOARD" ? "bg-white text-black shadow-sm" : "text-white/75 hover:text-white")}
              >
                <LayoutGrid className="h-4 w-4" /> Board
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <div className="h-11 rounded-2xl glass-btn px-4 flex items-center gap-3 transition-all duration-200 hover:bg-white/8">
            <Search className="h-4 w-4 text-white/70" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search companies..."
              className="w-full bg-transparent outline-none text-white/90 placeholder:text-white/45 text-sm"
            />
            <button type="button" onClick={() => alert("Export (demo)")} className={cn(btn.glass, "h-9 px-4 rounded-xl")}>
              <Download className="h-4 w-4" /> Export
            </button>
          </div>
        </div>

        {view === "TABLE" ? (
          <CompanyTable data={filtered} onEdit={openEdit} onRemove={remove} />
        ) : (
          <div className="relative mt-6">
            {/* ✅ hover zones */}
            <div
              className="absolute left-0 top-0 bottom-0 z-30 w-14 cursor-w-resize"
              onMouseEnter={() => startHoverScroll("LEFT")}
              onMouseLeave={stopHoverScroll}
            />
            <div
              className="absolute right-0 top-0 bottom-0 z-30 w-14 cursor-e-resize"
              onMouseEnter={() => startHoverScroll("RIGHT")}
              onMouseLeave={stopHoverScroll}
            />

            {/* ✅ gradient fade */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-20 bg-gradient-to-r from-white/15 to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-20 bg-gradient-to-l from-white/15 to-transparent" />

            <div
              ref={boardRef}
              onDragOver={onBoardDragOver}
              className={cn(
                "flex gap-6 overflow-x-auto pb-3",
                autoScroll ? "snap-none" : "snap-x snap-mandatory",
                "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              )}
            >
              {columns.map((col) => (
                <div key={col.id} className="flex-none w-[330px] snap-start">
                  <ColumnCard
                    title={col.title}
                    hint={col.hint}
                    column={col.id}
                    items={grouped[col.id] ?? []}
                    dragActive={dragOver === col.id}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    allowDrop={allowDrop}
                    onDrop={onDrop}
                    onDragLeave={onDragLeave}
                    onQuickAdd={(colId) => {
                      setQuickColumn(colId)
                      resetForm()
                      setCreateOpen(true)
                    }}
                    onEdit={(id) => openEdit(id)}
                    onDelete={(id) => remove(id)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ✅ CREATE COLUMN MODAL */}
      {createColumnOpen && (
        <ModalShell title="Create Card" onClose={() => setCreateColumnOpen(false)}>
          <div className="space-y-4">
            {colErr && (
              <div className="rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-200 font-semibold">
                {colErr}
              </div>
            )}

            <label className="block">
              <div className="text-xs font-extrabold text-white/75 mb-2">Title (required)</div>
              <input
                value={colTitle}
                onChange={(e) => {
                  setColTitle(e.target.value)
                  setColErr(null)
                }}
                placeholder="e.g. Review"
                className={cn(
                  "h-12 w-full rounded-2xl px-4 outline-none border focus:ring-2 transition-all duration-200",
                  "glass-inner text-white/90 placeholder:text-white/45",
                  colErr ? "border-red-400/35 focus:ring-red-400/20" : "border-white/12 focus:ring-white/10"
                )}
              />
            </label>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={() => setCreateColumnOpen(false)} className={btn.glass}>
                Cancel
              </button>
              <button onClick={submitCreateColumn} className={btn.primary}>
                Create
              </button>
            </div>
          </div>
        </ModalShell>
      )}

      {/* ✅ CREATE WORK MODAL */}
      {createOpen && (
        <ModalShell
          title={quickColumn ? `Create Work (${columns.find((c) => c.id === quickColumn)?.title ?? "Column"})` : "Create Work"}
          onClose={() => {
            setCreateOpen(false)
            setQuickColumn(null)
            resetForm()
          }}
        >
          <CompanyForm
            columns={columns}
            fName={fName}
            setFName={(v) => {
              setFName(v)
              setErr((p) => ({ ...p, name: "" }))
            }}
            fInn={fInn}
            setFInn={(v) => {
              setFInn(v)
              setErr((p) => ({ ...p, inn: "" }))
            }}
            fPhone={fPhone}
            setFPhone={(v) => {
              setFPhone(v)
              setErr((p) => ({ ...p, phone: "" }))
            }}
            fEmail={fEmail}
            setFEmail={(v) => {
              setFEmail(v)
              setErr((p) => ({ ...p, email: "" }))
            }}
            fAddress={fAddress}
            setFAddress={(v) => {
              setFAddress(v)
              setErr((p) => ({ ...p, address: "" }))
            }}
            fRegion={fRegion}
            setFRegion={setFRegion}
            fLane={fLane}
            setFLane={(v) => {
              setFLane(v)
              setErr((p) => ({ ...p, lane: "" }))
            }}
            err={err}
            onCancel={() => {
              setCreateOpen(false)
              setQuickColumn(null)
              resetForm()
            }}
            onSubmit={createWork}
            submitText="Create"
          />
        </ModalShell>
      )}

      {/* ✅ EDIT MODAL */}
      {editOpen && selectedId && (
        <ModalShell title="Edit Work" onClose={closeEdit}>
          <CompanyForm
            columns={columns}
            fName={fName}
            setFName={(v) => {
              setFName(v)
              setErr((p) => ({ ...p, name: "" }))
            }}
            fInn={fInn}
            setFInn={(v) => {
              setFInn(v)
              setErr((p) => ({ ...p, inn: "" }))
            }}
            fPhone={fPhone}
            setFPhone={(v) => {
              setFPhone(v)
              setErr((p) => ({ ...p, phone: "" }))
            }}
            fEmail={fEmail}
            setFEmail={(v) => {
              setFEmail(v)
              setErr((p) => ({ ...p, email: "" }))
            }}
            fAddress={fAddress}
            setFAddress={(v) => {
              setFAddress(v)
              setErr((p) => ({ ...p, address: "" }))
            }}
            fRegion={fRegion}
            setFRegion={setFRegion}
            fLane={fLane}
            setFLane={(v) => {
              setFLane(v)
              setErr((p) => ({ ...p, lane: "" }))
            }}
            err={err}
            onCancel={closeEdit}
            onSubmit={saveEdit}
            submitText="Save"
            leftDanger={{ text: "Delete", onClick: () => remove(selectedId) }}
          />
        </ModalShell>
      )}
    </div>
  )
}

/* ===================== Table ===================== */

function CompanyTable(props: { data: Company[]; onEdit: (id: string) => void; onRemove: (id: string) => void }) {
  const { data, onEdit, onRemove } = props
  return (
    <div className="rounded-3xl overflow-hidden glass-card mt-6">
      <div className="px-6 py-4 text-white flex items-center justify-between glass-header">
        <div className="text-sm font-extrabold text-white/90">Company list</div>
        <div className="text-xs text-white/60">{data.length} rows</div>
      </div>

      <div className="overflow-auto">
        <table className="min-w-[980px] w-full">
          <thead className="sticky top-0 z-10 glass-header text-white">
            <tr className="text-left text-xs font-extrabold tracking-wide text-white/85">
              <th className="px-6 py-4">Company</th>
              <th className="px-6 py-4">INN</th>
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Region</th>
              <th className="px-6 py-4">Lane</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {data.map((r, idx) => (
              <tr
                key={r.id}
                className={cn(
                  "text-white/90 border-t border-white/10 hover:bg-white/8 transition",
                  idx % 2 === 0 ? "bg-white/[0.035]" : "bg-transparent"
                )}
              >
                <td className="px-6 py-4">
                  <div className="font-extrabold text-sm text-white truncate">{r.name}</div>
                  <div className="text-xs text-white/60 mt-1 truncate">{r.address}</div>
                </td>
                <td className="px-6 py-4 text-sm text-white/85">{r.inn}</td>
                <td className="px-6 py-4 text-sm text-white/85">{r.phone}</td>
                <td className="px-6 py-4 text-sm text-white/85">{r.email}</td>
                <td className="px-6 py-4">
                  <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-white/8 border border-white/12 text-white/90">
                    {r.region}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-extrabold px-3 py-1 rounded-full border bg-white/8 border-white/12 text-white/85">
                    {r.lane}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="inline-flex items-center gap-2">
                    <button className={btn.icon} type="button" title="Edit" onClick={() => onEdit(r.id)}>
                      <Pencil className="h-4 w-4 text-white/85" />
                    </button>
                    <button className={btn.icon} type="button" title="Delete" onClick={() => onRemove(r.id)}>
                      <Trash2 className="h-4 w-4 text-white/85" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {data.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center">
                  <div className="text-white/80 font-extrabold">No results</div>
                  <div className="text-white/55 text-sm mt-2">Try another search query.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="h-4 bg-transparent" />
    </div>
  )
}

/* ===================== Board ===================== */

function ColumnCard(props: {
  title: string
  hint: string
  column: ColumnId
  items: Company[]
  dragActive: boolean
  onDragStart: (e: React.DragEvent, id: string) => void
  onDragEnd: () => void
  allowDrop: (e: React.DragEvent, col: ColumnId) => void
  onDrop: (e: React.DragEvent, col: ColumnId) => void
  onDragLeave: (col: ColumnId) => void
  onQuickAdd: (col: ColumnId) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}) {
  const { title, hint, column, items, dragActive, onDragStart, onDragEnd, allowDrop, onDrop, onDragLeave, onQuickAdd, onEdit, onDelete } =
    props

  return (
    <section
      onDragOver={(e) => allowDrop(e, column)}
      onDrop={(e) => onDrop(e, column)}
      onDragLeave={() => onDragLeave(column)}
      className={cn("rounded-3xl overflow-hidden transition", "glass-card", dragActive && "ring-2 ring-white/10 border-white/20")}
    >
      <div className="px-5 py-4 glass-header flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-extrabold text-white truncate">{title}</div>
          <div className="text-xs text-white/65 mt-1 truncate">{hint}</div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-xs font-bold text-white/60">{items.length}</div>
          <button onClick={() => onQuickAdd(column)} className={btn.mini}>
            + Add
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3 min-h-[520px]">
        {items.length === 0 ? (
          <div
            className={cn(
              "h-10 rounded-xl border border-dashed flex items-center justify-center text-sm transition",
              "bg-white/5 text-white/60",
              dragActive ? "border-white/25" : "border-white/10"
            )}
          >
            Drop cards here
          </div>
        ) : (
          items.map((x) => (
            <CompanyCard
              key={x.id}
              item={x}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onEdit={() => onEdit(x.id)}
              onDelete={() => onDelete(x.id)}
            />
          ))
        )}
      </div>
    </section>
  )
}

function CompanyCard(props: {
  item: Company
  onDragStart: (e: React.DragEvent, id: string) => void
  onDragEnd: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const { item, onDragStart, onDragEnd, onEdit, onDelete } = props

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, item.id)}
      onDragEnd={onDragEnd}
      className={cn(
        "rounded-2xl border border-white/10 p-4",
        "glass-inner",
        "cursor-grab active:cursor-grabbing",
        "transition-all duration-200 hover:bg-white/10 hover:-translate-y-[1px] hover:shadow-md"
      )}
      title="Drag to move"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-extrabold text-white truncate">{item.name}</div>
          <div className="text-xs text-white/70 mt-1 truncate">
            {item.phone} • {item.region}
          </div>
          <div className="text-xs text-white/65 mt-1 truncate">{item.email}</div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button type="button" onClick={onEdit} className={btn.icon} title="Edit">
            <Pencil className="h-4 w-4 text-white/85" />
          </button>

          <button type="button" onClick={onDelete} className={btn.icon} title="Delete">
            <Trash2 className="h-4 w-4 text-white/85" />
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-white/8 border border-white/12 text-white/90">
          INN: {item.inn}
        </span>
        <span className="text-[11px] font-extrabold px-3 py-1 rounded-full border bg-white/8 border-white/12 text-white/85">
          {item.lane}
        </span>
      </div>
    </div>
  )
}

/* ===================== Modals / Form ===================== */

function ModalShell(props: { title: string; onClose: () => void; children: React.ReactNode }) {
  const { title, onClose, children } = props
  return (
    <div className="fixed inset-0 z-[9999]" aria-modal="true" role="dialog">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-[620px] rounded-3xl overflow-hidden glass-card">
          <div className="px-6 py-4 glass-header flex items-center justify-between">
            <div className="text-lg font-extrabold text-white">{title}</div>
            <button onClick={onClose} className={cn(btn.icon, "h-9 w-9")} title="Close">
              <X className="h-4 w-4 text-white/90" />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  )
}

function CompanyForm(props: {
  columns: BoardColumn[]
  fName: string
  setFName: (v: string) => void
  fInn: string
  setFInn: (v: string) => void
  fPhone: string
  setFPhone: (v: string) => void
  fEmail: string
  setFEmail: (v: string) => void
  fAddress: string
  setFAddress: (v: string) => void
  fRegion: string
  setFRegion: (v: string) => void
  fLane: ColumnId
  setFLane: (v: ColumnId) => void
  err: Record<string, string>
  onCancel: () => void
  onSubmit: () => void
  submitText: string
  leftDanger?: { text: string; onClick: () => void }
}) {
  const { columns, fName, setFName, fInn, setFInn, fPhone, setFPhone, fEmail, setFEmail, fAddress, setFAddress, fRegion, setFRegion, fLane, setFLane, err, onCancel, onSubmit, submitText, leftDanger } =
    props

  const hasErr = Object.values(err).some(Boolean)

  return (
    <div className="space-y-4">
      {hasErr && (
        <div className="rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-200 font-semibold">
          Please fix highlighted fields.
        </div>
      )}

      <Field label="Company name" value={fName} onChange={setFName} error={err.name} placeholder="HEIGHT COMPANY" />
      <Field label="INN" value={fInn} onChange={setFInn} error={err.inn} placeholder="309991234" />
      <Field label="Phone" value={fPhone} onChange={setFPhone} error={err.phone} placeholder="+998 ..." />
      <Field label="Email" value={fEmail} onChange={setFEmail} error={err.email} placeholder="info@company.com" />
      <Field label="Address" value={fAddress} onChange={setFAddress} error={err.address} placeholder="City, street..." />

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Region"
          value={fRegion}
          onChange={setFRegion}
          options={[
            { value: "TAS", label: "TAS" },
            { value: "SAM", label: "SAM" },
            { value: "FER", label: "FER" },
            { value: "UZB", label: "UZB" },
          ]}
        />
        <Select label="Column" value={fLane} onChange={setFLane} options={columns.map((c) => ({ value: c.id, label: c.title }))} error={err.lane} />
      </div>

      <div className="flex items-center justify-between gap-3 pt-2">
        {leftDanger ? (
          <button
            onClick={leftDanger.onClick}
            className="h-11 px-5 rounded-2xl border border-red-400/25 bg-red-500/10 text-red-200 font-extrabold transition-all duration-200 hover:bg-red-500/15 hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.98]"
          >
            {leftDanger.text}
          </button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-3">
          <button onClick={onCancel} className={btn.glass}>
            Cancel
          </button>
          <button onClick={onSubmit} className={btn.primary}>
            {submitText}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field(props: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; error?: string }) {
  const { label, value, onChange, placeholder, error } = props
  return (
    <label className="block">
      <div className="text-xs font-extrabold text-white/75 mb-2">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "h-12 w-full rounded-2xl px-4 outline-none border focus:ring-2 transition-all duration-200",
          "glass-inner text-white/90 placeholder:text-white/45",
          error ? "border-red-400/35 focus:ring-red-400/20" : "border-white/12 focus:ring-white/10"
        )}
      />
      {error && <div className="mt-2 text-xs font-bold text-red-200/90">{error}</div>}
    </label>
  )
}

function Select(props: { label: string; value: string; onChange: (v: string) => void; options: Array<{ value: string; label: string }>; error?: string }) {
  const { label, value, onChange, options, error } = props
  return (
    <label className="block">
      <div className="text-xs font-extrabold text-white/75 mb-2">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-12 w-full rounded-2xl border glass-inner px-4 outline-none focus:ring-2 transition-all duration-200",
          "text-white/90",
          error ? "border-red-400/35 focus:ring-red-400/20" : "border-white/12 focus:ring-white/10"
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
