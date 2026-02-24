import React, { useEffect, useMemo, useState } from "react"
import { Pencil, Trash2, X, LayoutGrid, Table2, Search, Download, PhoneCall, CheckCircle2, Plus } from "lucide-react"

/* ===================== Types ===================== */

type CallType = "OUTGOING" | "INCOMING"
type RelatedKind = "CUSTOMER" | "COMPANY" | "DEAL"

type ColumnId = string

type CallItem = {
  id: string
  fullName: string
  company: string
  phone: string
  relatedKind: RelatedKind
  type: CallType
  status: ColumnId // ✅ endi columnId
  note: string
  createdAt: number
  updatedAt?: number
}

type BoardColumn = {
  id: ColumnId
  title: string
  hint: string
}

/* ===================== Storage Keys ===================== */

const STORAGE_KEY = "crm_calls_v2_items"
const COL_KEY = "crm_calls_v2_columns"

/* ===================== Defaults ===================== */

const DEFAULT_COLUMNS: BoardColumn[] = [
  { id: "TODO", title: "Planned", hint: "New calls / queue" },
  { id: "IN_PROGRESS", title: "In progress", hint: "Calling now" },
  { id: "DONE", title: "Done", hint: "Completed calls" },
]

/* ===================== Helpers ===================== */

function cn(...a: Array<string | false | undefined | null>) {
  return a.filter(Boolean).join(" ")
}
function uid() {
  return `call_${Math.random().toString(36).slice(2)}_${Date.now()}`
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
function fmtWhen(ms: number) {
  return new Date(ms).toLocaleString()
}

/* ===================== Pills ===================== */

const kindPill: Record<RelatedKind, string> = {
  CUSTOMER: "bg-yellow-500/15 border-yellow-400/25 text-yellow-200",
  COMPANY: "bg-sky-500/15 border-sky-400/25 text-sky-200",
  DEAL: "bg-emerald-500/15 border-emerald-400/25 text-emerald-200",
}
const typePill: Record<CallType, string> = {
  OUTGOING: "bg-white/10 border-white/15 text-white/80",
  INCOMING: "bg-white/10 border-white/15 text-white/80",
}

/* ===================== Demo Seed ===================== */

const seed: CallItem[] = [
  {
    id: uid(),
    fullName: "Yusuf Latipov",
    company: "Height",
    phone: "+998 90 123 45 67",
    relatedKind: "COMPANY",
    type: "OUTGOING",
    status: "TODO",
    note: "Discuss integration requirements",
    createdAt: Date.now() - 320000,
  },
  {
    id: uid(),
    fullName: "Janice Greg",
    company: "Company",
    phone: "(+55) 555-555-5555",
    relatedKind: "DEAL",
    type: "INCOMING",
    status: "IN_PROGRESS",
    note: "Needs proposal update",
    createdAt: Date.now() - 240000,
  },
  {
    id: uid(),
    fullName: "aaa",
    company: "aaaa",
    phone: "234565432",
    relatedKind: "CUSTOMER",
    type: "OUTGOING",
    status: "DONE",
    note: "wegfrew",
    createdAt: Date.now() - 600000,
    updatedAt: Date.now() - 500000,
  },
]

/* ===================== Page ===================== */

export default function CallsPage() {
  const boardRef = React.useRef<HTMLDivElement | null>(null)

  const [view, setView] = useState<"TABLE" | "BOARD">("TABLE")
  const [q, setQ] = useState("")

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

  function onBoardDragOver(e: React.DragEvent) {
    e.preventDefault()
  }

  // right details drawer
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

  // ✅ Create Work modal
  const [createOpen, setCreateOpen] = useState(false)
  // ✅ Edit modal
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
  useEffect(() => {
    localStorage.setItem(COL_KEY, JSON.stringify(columns))
  }, [columns])

  // ✅ items
  const [items, setItems] = useState<CallItem[]>(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
      return seed
    }
    const parsed = safeParse<CallItem[]>(raw, [])
    return Array.isArray(parsed) ? parsed : []
  })
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    window.dispatchEvent(new Event("crm:data"))
  }, [items])

  // which column when user presses +Add inside column
  const [quickColumn, setQuickColumn] = useState<ColumnId | null>(null)

  // selection for edit
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const active = useMemo(() => (activeId ? items.find((x) => x.id === activeId) ?? null : null), [activeId, items])

  const selectedItem = useMemo(() => {
    if (!selectedId) return null
    return items.find((t) => t.id === selectedId) ?? null
  }, [items, selectedId])

  useScrollLock(createOpen || editOpen || createColumnOpen || detailsOpen)

  /* ===================== Search ===================== */

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return items
    return items.filter((x) => {
      const colTitle = columns.find((c) => c.id === x.status)?.title ?? x.status
      const hay = [x.fullName, x.company, x.phone, x.note, x.relatedKind, x.type, colTitle].join(" ").toLowerCase()
      return hay.includes(s)
    })
  }, [items, q, columns])

  /* ===================== Grouped ===================== */

  const grouped = useMemo(() => {
    const byCol: Record<string, CallItem[]> = {}
    for (const c of columns) byCol[c.id] = []
    for (const t of filtered) {
      if (!byCol[t.status]) byCol[t.status] = []
      byCol[t.status].push(t)
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

  /* ===================== Create / Edit Form State ===================== */

  const [fFullName, setFFullName] = useState("")
  const [fCompany, setFCompany] = useState("")
  const [fPhone, setFPhone] = useState("")
  const [fKind, setFKind] = useState<RelatedKind>("CUSTOMER")
  const [fType, setFType] = useState<CallType>("OUTGOING")
  const [fStatus, setFStatus] = useState<ColumnId>("TODO")
  const [fNote, setFNote] = useState("")
  const [err, setErr] = useState<Partial<Record<string, string>>>({})

  function resetForm() {
    setFFullName("")
    setFCompany("")
    setFPhone("")
    setFKind("CUSTOMER")
    setFType("OUTGOING")
    setFStatus(quickColumn ?? "TODO")
    setFNote("")
    setErr({})
  }

  useEffect(() => {
    if (!createOpen) return
    setErr({})
    setFStatus(quickColumn ?? "TODO")
  }, [createOpen, quickColumn])

  function validate() {
    const e: Partial<Record<string, string>> = {}
    if (!fFullName.trim()) e.fullName = "Full name required"
    if (!fCompany.trim()) e.company = "Company required"
    if (!fPhone.trim()) e.phone = "Phone required"
    if (!fStatus) e.status = "Status required"
    setErr(e)
    return Object.keys(e).length === 0
  }

  function createWork() {
    if (!validate()) return
    const x: CallItem = {
      id: uid(),
      fullName: fFullName.trim(),
      company: fCompany.trim(),
      phone: fPhone.trim(),
      relatedKind: fKind,
      type: fType,
      status: fStatus,
      note: fNote.trim(),
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
    setFFullName(it.fullName)
    setFCompany(it.company)
    setFPhone(it.phone)
    setFKind(it.relatedKind)
    setFType(it.type)
    setFStatus(it.status)
    setFNote(it.note)
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
              fullName: fFullName.trim(),
              company: fCompany.trim(),
              phone: fPhone.trim(),
              relatedKind: fKind,
              type: fType,
              status: fStatus,
              note: fNote.trim(),
              updatedAt: Date.now(),
            }
          : x
      )
    )
    closeEdit()
  }

  function remove(id: string) {
    if (!window.confirm("Delete call?")) return
    setItems((p) => p.filter((x) => x.id !== id))
    if (activeId === id) {
      setDetailsOpen(false)
      setActiveId(null)
    }
    if (selectedId === id) closeEdit()
  }

  function clearAll() {
    if (!window.confirm("Delete ALL calls?")) return
    setItems([])
    closeEdit()
    setDetailsOpen(false)
    setActiveId(null)
  }

  function openDetails(id: string) {
    setActiveId(id)
    setDetailsOpen(true)
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
    setItems((p) => p.map((x) => (x.id === id ? { ...x, status: col, updatedAt: Date.now() } : x)))
  }
  function onDragLeave(col: ColumnId) {
    setDragOver((p) => (p === col ? null : p))
  }

  /* ===================== UI ===================== */

  return (
    <div className="space-y-6">
      {/* ✅ TOP CARD */}
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-2xl font-extrabold text-white">Contact</div>
            <div className="text-sm text-white/60 mt-1">Table + Board • drag cards across columns • click item for details.</div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setColTitle("")
                setColErr(null)
                setCreateColumnOpen(true)
              }}
              className="h-11 px-5 rounded-2xl glass-btn text-white font-extrabold transition"
            >
              + Create Card
            </button>

            <button
              onClick={() => {
                setQuickColumn(null)
                resetForm()
                setCreateOpen(true)
              }}
              className="h-11 px-5 rounded-2xl bg-white text-black font-extrabold shadow-sm hover:opacity-95 transition"
            >
              + Create Work
            </button>

            <button
              onClick={clearAll}
              className="h-11 px-5 rounded-2xl glass-btn text-white font-extrabold transition"
              title="Delete all"
            >
              Clear All
            </button>

            <div className="h-11 rounded-2xl glass-btn p-1 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setView("TABLE")}
                className={cn(
                  "h-9 px-4 rounded-xl transition flex items-center gap-2 text-sm font-extrabold",
                  view === "TABLE" ? "bg-white text-black" : "text-white/70 hover:text-white"
                )}
              >
                <Table2 className="h-4 w-4" /> Table
              </button>
              <button
                type="button"
                onClick={() => setView("BOARD")}
                className={cn(
                  "h-9 px-4 rounded-xl transition flex items-center gap-2 text-sm font-extrabold",
                  view === "BOARD" ? "bg-white text-black" : "text-white/70 hover:text-white"
                )}
              >
                <LayoutGrid className="h-4 w-4" /> Board
              </button>
            </div>
          </div>
        </div>

        {/* search */}
        <div className="mt-5">
          <div className="h-11 rounded-2xl glass-btn px-4 flex items-center gap-3">
            <Search className="h-4 w-4 text-white/60" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search calls..."
              className="w-full bg-transparent outline-none text-white placeholder:text-white/35 text-sm"
            />
            <button
              type="button"
              onClick={() => alert("Export (demo)")}
              className="h-9 px-4 rounded-xl glass-btn text-white text-sm font-extrabold flex items-center gap-2"
            >
              <Download className="h-4 w-4" /> Export
            </button>
          </div>
        </div>

        {/* CONTENT */}
        {view === "TABLE" ? (
          <TableView data={filtered} onOpen={openDetails} onEdit={openEdit} onRemove={remove} />
        ) : (
          <div
            ref={boardRef}
            onDragOver={onBoardDragOver}
            className={cn(
              "mt-6 flex gap-6 overflow-x-auto pb-3",
              "snap-x snap-mandatory",
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
                  onOpen={(id) => openDetails(id)}
                  onEdit={(id) => openEdit(id)}
                  onDelete={(id) => remove(id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ✅ DETAILS DRAWER (right) */}
      <RightDetailsDrawer
        open={detailsOpen}
        item={active}
        onClose={() => setDetailsOpen(false)}
        onEdit={() => (active ? openEdit(active.id) : null)}
        onDelete={() => (active ? remove(active.id) : null)}
        onMarkDone={() => {
          if (!active) return
          setItems((p) => p.map((x) => (x.id === active.id ? { ...x, status: "DONE", updatedAt: Date.now() } : x)))
        }}
        columnLabel={(colId) => columns.find((c) => c.id === colId)?.title ?? colId}
      />

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
              <div className="text-xs font-extrabold text-white/70 mb-2">Title (required)</div>
              <input
                value={colTitle}
                onChange={(e) => {
                  setColTitle(e.target.value)
                  setColErr(null)
                }}
                placeholder="e.g. Review"
                className={cn(
                  "h-12 w-full rounded-2xl px-4 outline-none text-white placeholder:text-white/35 border focus:ring-2",
                  "glass-inner",
                  colErr ? "border-red-400/35 focus:ring-red-400/20" : "border-white/12 focus:ring-white/10"
                )}
              />
            </label>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={() => setCreateColumnOpen(false)} className="h-11 px-5 rounded-2xl glass-btn text-white font-extrabold transition">
                Cancel
              </button>
              <button onClick={submitCreateColumn} className="h-11 px-5 rounded-2xl bg-white text-black font-extrabold hover:opacity-95 transition">
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
          <WorkForm
            columns={columns}
            colValue={fStatus}
            setColValue={(v) => {
              setFStatus(v)
              setErr((p) => ({ ...p, status: undefined }))
            }}
            fFullName={fFullName}
            setFFullName={(v) => {
              setFFullName(v)
              setErr((p) => ({ ...p, fullName: undefined }))
            }}
            fCompany={fCompany}
            setFCompany={(v) => {
              setFCompany(v)
              setErr((p) => ({ ...p, company: undefined }))
            }}
            fPhone={fPhone}
            setFPhone={(v) => {
              setFPhone(v)
              setErr((p) => ({ ...p, phone: undefined }))
            }}
            fKind={fKind}
            setFKind={setFKind}
            fType={fType}
            setFType={setFType}
            fNote={fNote}
            setFNote={setFNote}
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
      {editOpen && selectedItem && (
        <ModalShell title="Edit Work" onClose={closeEdit}>
          <div className="space-y-4">
            <div className="text-xs text-white/55">Created: {fmtWhen(selectedItem.createdAt)}</div>

            <WorkForm
              columns={columns}
              colValue={fStatus}
              setColValue={(v) => {
                setFStatus(v)
                setErr((p) => ({ ...p, status: undefined }))
              }}
              fFullName={fFullName}
              setFFullName={(v) => {
                setFFullName(v)
                setErr((p) => ({ ...p, fullName: undefined }))
              }}
              fCompany={fCompany}
              setFCompany={(v) => {
                setFCompany(v)
                setErr((p) => ({ ...p, company: undefined }))
              }}
              fPhone={fPhone}
              setFPhone={(v) => {
                setFPhone(v)
                setErr((p) => ({ ...p, phone: undefined }))
              }}
              fKind={fKind}
              setFKind={setFKind}
              fType={fType}
              setFType={setFType}
              fNote={fNote}
              setFNote={setFNote}
              err={err}
              onCancel={closeEdit}
              onSubmit={saveEdit}
              submitText="Save"
              leftDanger={{
                text: "Delete",
                onClick: () => remove(selectedItem.id),
              }}
            />
          </div>
        </ModalShell>
      )}
    </div>
  )
}

/* ===================== TableView ===================== */

function TableView(props: {
  data: CallItem[]
  onOpen: (id: string) => void
  onEdit: (id: string) => void
  onRemove: (id: string) => void
}) {
  const { data, onOpen, onEdit, onRemove } = props

  return (
    <div className="rounded-3xl overflow-hidden glass-card mt-6">
      <div className="px-6 py-4 text-white flex items-center justify-between glass-header">
        <div className="text-sm font-extrabold">Calls (table)</div>
        <div className="text-xs text-white/55">{data.length} rows</div>
      </div>

      <div className="overflow-auto">
        <table className="min-w-[1120px] w-full">
          <thead className="sticky top-0 z-10 glass-header text-white">
            <tr className="text-left text-xs font-extrabold tracking-wide text-white/80">
              <th className="px-6 py-4">Client</th>
              <th className="px-6 py-4">Company</th>
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Related</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody className="bg-transparent">
            {data.map((r, idx) => (
              <tr
                key={r.id}
                className={cn(
                  "text-white/90 border-t border-white/10 hover:bg-white/8 transition",
                  idx % 2 === 0 ? "bg-white/[0.04]" : "bg-transparent"
                )}
              >
                <td className="px-6 py-4">
                  <button className="text-left w-full" type="button" onClick={() => onOpen(r.id)} title="Open details">
                    <div className="font-extrabold text-sm truncate">{r.fullName}</div>
                    <div className="text-xs text-white/55 truncate">{r.note ? r.note : "—"}</div>
                  </button>
                </td>

                <td className="px-6 py-4 text-sm text-white/80">{r.company}</td>
                <td className="px-6 py-4 text-sm text-white/80">{r.phone}</td>

                <td className="px-6 py-4">
                  <span className={cn("text-xs font-extrabold px-3 py-1 rounded-full border", typePill[r.type])}>
                    {r.type === "OUTGOING" ? "Outgoing" : "Incoming"}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <span className="text-xs font-extrabold px-3 py-1 rounded-full border bg-white/10 border-white/15 text-white/80">
                    {r.status}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <span className={cn("text-xs font-extrabold px-3 py-1 rounded-full border", kindPill[r.relatedKind])}>
                    {r.relatedKind}
                  </span>
                </td>

                <td className="px-6 py-4 text-right">
                  <div className="inline-flex items-center gap-2">
                    <button className="h-9 w-9 rounded-xl glass-btn grid place-items-center" type="button" title="Edit" onClick={() => onEdit(r.id)}>
                      <Pencil className="h-4 w-4 text-white/80" />
                    </button>
                    <button className="h-9 w-9 rounded-xl glass-btn grid place-items-center" type="button" title="Delete" onClick={() => onRemove(r.id)}>
                      <Trash2 className="h-4 w-4 text-white/80" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {data.length === 0 && (
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
  )
}

/* ===================== Board UI ===================== */

function ColumnCard(props: {
  title: string
  hint: string
  column: ColumnId
  items: CallItem[]
  dragActive: boolean
  onDragStart: (e: React.DragEvent, id: string) => void
  onDragEnd: () => void
  allowDrop: (e: React.DragEvent, col: ColumnId) => void
  onDrop: (e: React.DragEvent, col: ColumnId) => void
  onDragLeave: (col: ColumnId) => void
  onQuickAdd: (col: ColumnId) => void
  onOpen: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}) {
  const { title, hint, column, items, dragActive, onDragStart, onDragEnd, allowDrop, onDrop, onDragLeave, onQuickAdd, onOpen, onEdit, onDelete } =
    props

  return (
    <section
      onDragOver={(e) => allowDrop(e, column)}
      onDrop={(e) => onDrop(e, column)}
      onDragLeave={() => onDragLeave(column)}
      className={cn("rounded-3xl overflow-hidden transition", "glass-card", dragActive && "ring-2 ring-white/10 border-white/20")}
    >
      <div className="px-5 py-4 glass-header flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-extrabold text-white">{title}</div>
          <div className="text-xs text-white/50 mt-1">{hint}</div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-bold text-white/60">{items.length}</div>
          <button onClick={() => onQuickAdd(column)} className="h-9 px-3 rounded-xl glass-btn text-white text-xs font-extrabold transition">
            + Add
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3 min-h-[520px]">
        {items.length === 0 ? (
          <div
            className={cn(
              "h-10 rounded-xl border border-dashed flex items-center justify-center text-sm transition",
              "bg-white/5 text-white/50",
              dragActive ? "border-white/25" : "border-white/10"
            )}
          >
            Drop cards here
          </div>
        ) : (
          items.map((x) => (
            <CallCard
              key={x.id}
              item={x}
              onOpen={() => onOpen(x.id)}
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

function CallCard(props: {
  item: CallItem
  onOpen: () => void
  onDragStart: (e: React.DragEvent, id: string) => void
  onDragEnd: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const { item, onOpen, onDragStart, onDragEnd, onEdit, onDelete } = props

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, item.id)}
      onDragEnd={onDragEnd}
      className={cn("rounded-2xl border border-white/10 p-4", "glass-inner", "cursor-grab active:cursor-grabbing", "hover:bg-white/10 transition")}
      title="Drag to move"
    >
      <button type="button" className="w-full text-left" onClick={onOpen}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-extrabold text-white truncate">{item.fullName}</div>
            <div className="text-xs text-white/55 mt-1 truncate">
              {item.company} • {item.phone}
            </div>
            <div className="text-xs text-white/55 mt-1 truncate">{item.note || "—"}</div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              className="h-9 w-9 rounded-xl glass-btn grid place-items-center"
              title="Edit"
            >
              <Pencil className="h-4 w-4 text-white/85" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="h-9 w-9 rounded-xl glass-btn grid place-items-center"
              title="Delete"
            >
              <Trash2 className="h-4 w-4 text-white/75" />
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className={cn("text-[11px] font-extrabold px-3 py-1 rounded-full border", kindPill[item.relatedKind])}>
            {item.relatedKind}
          </span>
          <span className={cn("text-[11px] font-extrabold px-3 py-1 rounded-full border", typePill[item.type])}>
            {item.type === "OUTGOING" ? "Outgoing" : "Incoming"}
          </span>
        </div>
      </button>
    </div>
  )
}

/* ===================== Modals ===================== */

function ModalShell(props: { title: string; onClose: () => void; children: React.ReactNode }) {
  const { title, onClose, children } = props
  return (
    <div className="fixed inset-0 z-[9999]" aria-modal="true" role="dialog">
      <div className="absolute inset-0 bg-slate-900/45 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-[620px] rounded-3xl overflow-hidden glass-card">
          <div className="px-6 py-4 glass-header flex items-center justify-between">
            <div className="text-lg font-extrabold text-white">{title}</div>
            <button onClick={onClose} className="h-9 w-9 rounded-xl glass-btn grid place-items-center text-white" title="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  )
}

function WorkForm(props: {
  columns: BoardColumn[]
  colValue: ColumnId
  setColValue: (v: ColumnId) => void

  fFullName: string
  setFFullName: (v: string) => void

  fCompany: string
  setFCompany: (v: string) => void

  fPhone: string
  setFPhone: (v: string) => void

  fKind: RelatedKind
  setFKind: (v: RelatedKind) => void

  fType: CallType
  setFType: (v: CallType) => void

  fNote: string
  setFNote: (v: string) => void

  err: Partial<Record<string, string>>
  onCancel: () => void
  onSubmit: () => void
  submitText: string
  leftDanger?: { text: string; onClick: () => void }
}) {
  const { columns, colValue, setColValue, fFullName, setFFullName, fCompany, setFCompany, fPhone, setFPhone, fKind, setFKind, fType, setFType, fNote, setFNote, err, onCancel, onSubmit, submitText, leftDanger } =
    props

  return (
    <div className="space-y-4">
      {(err.fullName || err.company || err.phone || err.status) && (
        <div className="rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-200 font-semibold">
          Please fix highlighted fields.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Full name" value={fFullName} onChange={setFFullName} error={err.fullName} />
        <Field label="Company" value={fCompany} onChange={setFCompany} error={err.company} />
      </div>

      <Field label="Phone" value={fPhone} onChange={setFPhone} error={err.phone} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Related"
          value={fKind}
          onChange={(v) => setFKind(v as RelatedKind)}
          options={[
            { value: "CUSTOMER", label: "Customer" },
            { value: "COMPANY", label: "Company" },
            { value: "DEAL", label: "Deal" },
          ]}
        />

        <Select
          label="Type"
          value={fType}
          onChange={(v) => setFType(v as CallType)}
          options={[
            { value: "OUTGOING", label: "Outgoing" },
            { value: "INCOMING", label: "Incoming" },
          ]}
        />
      </div>

      <Select
        label="Column"
        value={colValue}
        onChange={(v) => setColValue(v)}
        options={columns.map((c) => ({ value: c.id, label: c.title }))}
        error={err.status}
      />

      <TextArea label="Note" value={fNote} onChange={setFNote} placeholder="Short note..." />

      <div className="flex items-center justify-between gap-3 pt-2">
        {leftDanger ? (
          <button onClick={leftDanger.onClick} className="h-11 px-5 rounded-2xl border border-red-400/25 bg-red-500/10 text-red-200 font-extrabold hover:bg-red-500/15 transition">
            {leftDanger.text}
          </button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="h-11 px-5 rounded-2xl glass-btn text-white font-extrabold transition">
            Cancel
          </button>
          <button onClick={onSubmit} className="h-11 px-5 rounded-2xl bg-white text-black font-extrabold hover:opacity-95 transition">
            {submitText}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field(props: { label: string; value: string; onChange: (v: string) => void; error?: string; placeholder?: string }) {
  const { label, value, onChange, error, placeholder } = props
  return (
    <label className="block">
      <div className="text-xs font-extrabold text-white/70 mb-2">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "h-12 w-full rounded-2xl px-4 outline-none text-white placeholder:text-white/35 border focus:ring-2",
          "glass-inner",
          error ? "border-red-400/35 focus:ring-red-400/20" : "border-white/12 focus:ring-white/10"
        )}
      />
      {error && <div className="mt-2 text-xs font-bold text-red-200/90">{error}</div>}
    </label>
  )
}

function TextArea(props: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  const { label, value, onChange, placeholder } = props
  return (
    <label className="block">
      <div className="text-xs font-extrabold text-white/70 mb-2">{label}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[110px] w-full rounded-2xl px-4 py-3 outline-none text-white placeholder:text-white/35 glass-inner border border-white/12 focus:ring-2 focus:ring-white/10"
      />
    </label>
  )
}

function Select(props: { label: string; value: string; onChange: (v: string) => void; options: Array<{ value: string; label: string }>; error?: string }) {
  const { label, value, onChange, options, error } = props
  return (
    <label className="block">
      <div className="text-xs font-extrabold text-white/70 mb-2">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-12 w-full rounded-2xl border glass-inner px-4 outline-none text-white focus:ring-2",
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

/* ===================== Details Drawer ===================== */

function RightDetailsDrawer(props: {
  open: boolean
  item: CallItem | null
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
  onMarkDone: () => void
  columnLabel: (colId: ColumnId) => string
}) {
  const { open, item, onClose, onEdit, onDelete, onMarkDone, columnLabel } = props
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[9999]" aria-modal="true" role="dialog">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div
        className={cn(
          "absolute inset-y-0 right-0 w-full max-w-[520px] border-l border-white/10",
          "bg-white/6 backdrop-blur-2xl",
          "shadow-[0_30px_140px_-70px_rgba(0,0,0,0.95)]",
          "animate-in slide-in-from-right duration-200"
        )}
      >
        <div className="h-14 px-6 flex items-center justify-between glass-header">
          <div className="text-white font-extrabold">Details</div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={onMarkDone} className="h-10 px-4 rounded-2xl glass-btn text-white font-extrabold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Done
            </button>

            <button type="button" onClick={onEdit} className="h-10 w-10 rounded-2xl glass-btn grid place-items-center" title="Edit">
              <Pencil className="h-4 w-4 text-white/85" />
            </button>

            <button type="button" onClick={onDelete} className="h-10 w-10 rounded-2xl glass-btn grid place-items-center" title="Delete">
              <Trash2 className="h-4 w-4 text-white/80" />
            </button>

            <button type="button" onClick={onClose} className="h-10 w-10 rounded-2xl glass-btn grid place-items-center" title="Close">
              <X className="h-4 w-4 text-white/80" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto h-[calc(100vh-56px)]">
          <div className="rounded-3xl p-5 glass-card">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-white font-extrabold text-xl truncate">{item?.fullName ?? "—"}</div>
                <div className="text-white/70 text-sm mt-2 truncate">
                  {item?.company ?? "—"} • {item?.phone ?? "—"}
                </div>
                <div className="text-white/45 text-xs mt-2">{item ? `${item.type === "OUTGOING" ? "Outgoing" : "Incoming"} • ${fmtWhen(item.createdAt)}` : "—"}</div>
              </div>

              <div className="flex flex-col items-end gap-2">
                {item && (
                  <span className="text-xs font-extrabold px-3 py-1 rounded-full border bg-white/10 border-white/15 text-white/80">
                    {columnLabel(item.status)}
                  </span>
                )}
                {item && (
                  <span className={cn("text-xs font-extrabold px-3 py-1 rounded-full border", kindPill[item.relatedKind])}>
                    {item.relatedKind}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MiniCard title="Related" value={item?.company ?? "—"} />
            <MiniCard title="Status" value={item ? columnLabel(item.status) : "—"} />
            <MiniCard title="Type" value={item ? (item.type === "OUTGOING" ? "Outgoing" : "Incoming") : "—"} />
            <MiniCard title="Last update" value={item?.updatedAt ? fmtWhen(item.updatedAt) : "—"} />
          </div>

          <div className="rounded-3xl p-5 glass-card">
            <div className="text-xs font-extrabold text-white/70 mb-2">Note</div>
            <div className="text-white/70 text-sm leading-6">{item?.note ? item.note : "—"}</div>
          </div>

          <div className="rounded-3xl p-5 flex items-center justify-between gap-4 glass-card">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-12 w-12 rounded-2xl bg-white/10 border border-white/10 grid place-items-center">
                <PhoneCall className="h-5 w-5 text-white/80" />
              </div>
              <div className="min-w-0">
                <div className="text-white font-extrabold">Quick action</div>
                <div className="text-white/45 text-xs mt-1">(Demo) “Call now”</div>
              </div>
            </div>

            <button type="button" onClick={() => alert("Call now (demo)")} className="h-11 px-6 rounded-2xl bg-white text-black font-extrabold hover:opacity-95 transition shrink-0">
              Call now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MiniCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-3xl p-5 glass-card">
      <div className="text-xs font-extrabold text-white/55">{title}</div>
      <div className="mt-2 text-white font-extrabold">{value}</div>
    </div>
  )
}
