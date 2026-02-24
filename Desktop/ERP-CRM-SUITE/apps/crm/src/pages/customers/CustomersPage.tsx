import React, { useEffect, useMemo, useState } from "react"
import { LayoutGrid, Table2, Search, Download, Pencil, Trash2, X } from "lucide-react"

/* ===================== Types ===================== */

type ColumnId = string
type Segment = "VIP" | "REGULAR" | "NEW"

type Customer = {
  id: string
  fullName: string
  phone: string
  city: string
  segment: Segment
  note: string
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

const STORAGE_KEY = "crm_customers_v2_items"
const COL_KEY = "crm_customers_v2_columns"

const DEFAULT_COLUMNS: BoardColumn[] = [
  { id: "LEADS", title: "Leads", hint: "Potential customers" },
  { id: "CONTACTED", title: "Contacted", hint: "Talked / messaged" },
  { id: "NEGOTIATION", title: "Negotiation", hint: "Discussing price" },
  { id: "WON", title: "Won", hint: "Converted customers" },
]

/* ===================== Helpers ===================== */

function cn(...a: Array<string | false | undefined | null>) {
  return a.filter(Boolean).join(" ")
}
function uid() {
  return `cus_${Math.random().toString(36).slice(2)}_${Date.now()}`
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

/* ===================== Seed ===================== */

const seed: Customer[] = [
  {
    id: uid(),
    fullName: "AAA Customer",
    phone: "+998 99 111 11 11",
    city: "Tashkent",
    segment: "NEW",
    note: "Asked for price list",
    lane: "LEADS",
    createdAt: Date.now() - 700000,
  },
  {
    id: uid(),
    fullName: "BBB VIP",
    phone: "+998 90 222 22 22",
    city: "Samarkand",
    segment: "VIP",
    note: "Ready to buy soon",
    lane: "NEGOTIATION",
    createdAt: Date.now() - 600000,
  },
]

/* ===================== Premium Colors ===================== */

const segPill: Record<Segment, string> = {
  VIP: "bg-amber-400/15 border-amber-300/25 text-amber-100",
  REGULAR: "bg-sky-400/15 border-sky-300/25 text-sky-100",
  NEW: "bg-white/8 border-white/12 text-white/85",
}

// ✅ column drag type (text/plain bilan to‘qnashmasin)
const COL_DND_TYPE = "application/x-crm-column"

// ✅ Premium button classes (hover/active/animation)
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

export default function CustomersPage() {
  const boardRef = React.useRef<HTMLDivElement | null>(null)

  // ✅ hover auto-scroll refs
  const hoverDirRef = React.useRef<"LEFT" | "RIGHT" | null>(null)
  const hoverRafRef = React.useRef<number | null>(null)

  const [view, setView] = useState<"TABLE" | "BOARD">("TABLE")
  const [q, setQ] = useState("")

  // ✅ hover scroll paytida snap’ni o‘chirib turamiz
  const [autoScroll, setAutoScroll] = useState(false)

  // ✅ item drag holati (auto horizontal scroll uchun)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOver, setDragOver] = useState<ColumnId | null>(null)

  // ✅ column drag holati
  const [isColDragging, setIsColDragging] = useState(false)
  const [colDragOver, setColDragOver] = useState<ColumnId | null>(null)

  // ✅ details modal
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

  const activeCustomer = useMemo(
    () => (activeId ? itemsRefGetter(activeId) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeId]
  )

  function openDetails(id: string) {
    setActiveId(id)
    setDetailsOpen(true)
  }
  function closeDetails() {
    setDetailsOpen(false)
    setActiveId(null)
  }

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

  function onBoardDragOver(e: React.DragEvent) {
    e.preventDefault()
  }

  // ✅ hover scroll helpers
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

  // ✅ modals
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  // ✅ Column modal: create/edit (bitta modal)
  const [colModalOpen, setColModalOpen] = useState(false)
  const [colMode, setColMode] = useState<"CREATE" | "EDIT">("CREATE")
  const [editingColId, setEditingColId] = useState<ColumnId | null>(null)
  const [colTitle, setColTitle] = useState("")
  const [colHint, setColHint] = useState("")
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
  const [items, setItems] = useState<Customer[]>(() => {
    const has = localStorage.getItem(STORAGE_KEY) !== null
    if (has) return safeParse<Customer[]>(localStorage.getItem(STORAGE_KEY), [])
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
    return seed
  })

  // ✅ activeCustomer uchun safe getter (activeId o‘zgarganda ham topib beradi)
  function itemsRefGetter(id: string) {
    return items.find((x) => x.id === id) ?? null
  }

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    window.dispatchEvent(new Event("crm:data"))
  }, [items])

  // which column when user presses +Add inside column
  const [quickColumn, setQuickColumn] = useState<ColumnId | null>(null)

  // selection for edit
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useScrollLock(createOpen || editOpen || colModalOpen || detailsOpen)

  /* ===================== Search ===================== */

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return items
    return items.filter((x) => {
      const colTitle2 = columns.find((c) => c.id === x.lane)?.title ?? x.lane
      const hay = [x.fullName, x.phone, x.city, x.segment, x.note, colTitle2].join(" ").toLowerCase()
      return hay.includes(query)
    })
  }, [items, q, columns])

  /* ===================== Grouped (ORDER PRESERVING) ===================== */

  const grouped = useMemo(() => {
    const byCol: Record<string, Customer[]> = {}
    for (const c of columns) byCol[c.id] = []
    for (const t of filtered) {
      if (!byCol[t.lane]) byCol[t.lane] = []
      byCol[t.lane].push(t)
    }

    // ✅ tartib items massividagi tartib bo‘yicha (reorder ko‘rinadi)
    const pos = new Map<string, number>()
    filtered.forEach((it, idx) => pos.set(it.id, idx))

    for (const colId of Object.keys(byCol)) {
      byCol[colId].sort((a, b) => pos.get(a.id)! - pos.get(b.id)!)
    }
    return byCol
  }, [filtered, columns])

  /* ===================== Column Create/Edit/Delete/Reorder ===================== */

  function openCreateColumn() {
    setColMode("CREATE")
    setEditingColId(null)
    setColTitle("")
    setColHint("")
    setColErr(null)
    setColModalOpen(true)
  }

  function openEditColumn(colId: ColumnId) {
    const col = columns.find((c) => c.id === colId)
    if (!col) return
    setColMode("EDIT")
    setEditingColId(colId)
    setColTitle(col.title)
    setColHint(col.hint ?? "")
    setColErr(null)
    setColModalOpen(true)
  }

  function submitColumnModal() {
    const title = colTitle.trim()
    const hint = colHint.trim()

    if (!title) return setColErr("Title kiritilishi shart.")
    if (title.length < 2) return setColErr("Title kamida 2 ta belgi bo‘lsin.")

    if (colMode === "CREATE") {
      const newCol: BoardColumn = {
        id: `COL_${uid()}`,
        title,
        hint: hint || "Custom column",
      }
      setColumns((p) => [...p, newCol])
      setColModalOpen(false)

      requestAnimationFrame(() => {
        boardRef.current?.scrollTo({ left: boardRef.current.scrollWidth, behavior: "smooth" })
      })
      return
    }

    // EDIT
    if (!editingColId) return
    setColumns((p) => p.map((c) => (c.id === editingColId ? { ...c, title, hint: hint || c.hint } : c)))
    setColModalOpen(false)
    setEditingColId(null)
  }

  function deleteColumn(colId: ColumnId) {
    if (columns.length <= 1) {
      alert("Kamida 1 ta column qolishi kerak.")
      return
    }
    if (!window.confirm("Delete this column? (Items will be moved to first column)")) return

    const fallback = columns.find((c) => c.id !== colId)?.id
    if (!fallback) return

    // 1) move items from deleted column -> fallback
    setItems((p) => p.map((x) => (x.lane === colId ? { ...x, lane: fallback, updatedAt: Date.now() } : x)))

    // 2) remove column
    setColumns((p) => p.filter((c) => c.id !== colId))
  }

  function reorderColumns(dragColId: ColumnId, targetColId: ColumnId) {
    if (!dragColId || !targetColId || dragColId === targetColId) return
    setColumns((prev) => {
      const from = prev.findIndex((c) => c.id === dragColId)
      const to = prev.findIndex((c) => c.id === targetColId)
      if (from === -1 || to === -1) return prev
      const copy = [...prev]
      const [moved] = copy.splice(from, 1)
      copy.splice(to, 0, moved)
      return copy
    })
  }

  function onColumnDragStart(e: React.DragEvent, colId: ColumnId) {
    setIsColDragging(true)
    setColDragOver(null)
    e.dataTransfer.setData(COL_DND_TYPE, colId)
    e.dataTransfer.effectAllowed = "move"
  }
  function onColumnDragEnd() {
    setIsColDragging(false)
    setColDragOver(null)
  }
  function onColumnWrapperDragOver(e: React.DragEvent, targetColId: ColumnId) {
    const colId = e.dataTransfer.types?.includes(COL_DND_TYPE) ? e.dataTransfer.getData(COL_DND_TYPE) : ""
    if (!colId) return
    e.preventDefault()
    setColDragOver(targetColId)
  }
  function onColumnWrapperDrop(e: React.DragEvent, targetColId: ColumnId) {
    const dragColId = e.dataTransfer.getData(COL_DND_TYPE)
    if (!dragColId) return // item drop bo‘lsa, ichkariga (ColumnCard) tushsin
    e.preventDefault()
    e.stopPropagation()
    reorderColumns(dragColId, targetColId)
    setIsColDragging(false)
    setColDragOver(null)
  }
  function onColumnWrapperDragLeave(targetColId: ColumnId) {
    setColDragOver((p) => (p === targetColId ? null : p))
  }

  /* ===================== Form State (Customer) ===================== */

  const [fFullName, setFFullName] = useState("")
  const [fPhone, setFPhone] = useState("")
  const [fCity, setFCity] = useState("")
  const [fSegment, setFSegment] = useState<Segment>("NEW")
  const [fNote, setFNote] = useState("")
  const [fLane, setFLane] = useState<ColumnId>("LEADS")
  const [err, setErr] = useState<Record<string, string>>({})

  function resetForm() {
    setFFullName("")
    setFPhone("")
    setFCity("")
    setFSegment("NEW")
    setFNote("")
    setFLane(quickColumn ?? "LEADS")
    setErr({})
  }

  useEffect(() => {
    if (!createOpen) return
    setErr({})
    setFLane(quickColumn ?? "LEADS")
  }, [createOpen, quickColumn])

  function validate() {
    const e: Record<string, string> = {}
    if (!fFullName.trim()) e.fullName = "Full name required"
    if (!fPhone.trim()) e.phone = "Phone required"
    if (!fCity.trim()) e.city = "City required"
    if (!fLane) e.lane = "Column required"
    setErr(e)
    return Object.keys(e).length === 0
  }

  function createWork() {
    if (!validate()) return
    const x: Customer = {
      id: uid(),
      fullName: fFullName.trim(),
      phone: fPhone.trim(),
      city: fCity.trim(),
      segment: fSegment,
      note: fNote.trim(),
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
    setFFullName(it.fullName)
    setFPhone(it.phone)
    setFCity(it.city)
    setFSegment(it.segment)
    setFNote(it.note)
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
              fullName: fFullName.trim(),
              phone: fPhone.trim(),
              city: fCity.trim(),
              segment: fSegment,
              note: fNote.trim(),
              lane: fLane,
              updatedAt: Date.now(),
            }
          : x
      )
    )
    closeEdit()
  }

  function remove(id: string) {
    if (!window.confirm("Delete customer?")) return
    setItems((p) => p.filter((x) => x.id !== id))
    if (selectedId === id) closeEdit()
    if (activeId === id) closeDetails()
  }

  function clearAll() {
    if (!window.confirm("Delete ALL customers?")) return
    setItems([])
    closeEdit()
    closeDetails()
  }

  /* ===================== Drag & Drop (Customer move between columns) ===================== */

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
    const colDrag = e.dataTransfer.types?.includes(COL_DND_TYPE)
    if (colDrag) return
    e.preventDefault()
    setDragOver(col)
  }
  function onDrop(e: React.DragEvent, col: ColumnId) {
    const colDragId = e.dataTransfer.getData(COL_DND_TYPE)
    if (colDragId) return

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

  // ✅ REORDER: bitta lane ichida card->card drop
  function reorderWithinLane(dragId: string, targetId: string) {
    if (!dragId || !targetId || dragId === targetId) return

    setItems((prev) => {
      const drag = prev.find((x) => x.id === dragId)
      const target = prev.find((x) => x.id === targetId)
      if (!drag || !target) return prev
      if (drag.lane !== target.lane) return prev

      const lane = drag.lane
      const laneIds = prev.filter((x) => x.lane === lane).map((x) => x.id)

      const from = laneIds.indexOf(dragId)
      const to = laneIds.indexOf(targetId)
      if (from === -1 || to === -1) return prev

      laneIds.splice(from, 1)
      laneIds.splice(to, 0, dragId)

      const laneMap = new Map(prev.filter((x) => x.lane === lane).map((x) => [x.id, x] as const))
      const rebuiltLane = laneIds.map((id) => laneMap.get(id)!)

      const out: Customer[] = []
      let laneCursor = 0
      for (const it of prev) {
        if (it.lane !== lane) out.push(it)
        else out.push(rebuiltLane[laneCursor++])
      }

      return out.map((x) => (x.id === dragId ? { ...x, updatedAt: Date.now() } : x))
    })
  }

  /* ===================== UI ===================== */

  const active = activeId ? items.find((x) => x.id === activeId) ?? null : null


  return (
    <div className="space-y-6">
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-2xl font-extrabold text-white drop-shadow-sm">Customers</div>
            <div className="text-sm text-white/70 mt-1">
              Column Edit/Delete/Drag + Create Work + Drag & Drop + Details modal
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={openCreateColumn} className={btn.glass}>
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
              placeholder="Search customers..."
              className="w-full bg-transparent outline-none py-3 text-white/90 placeholder:text-white/45 text-sm"
            />
            <button
              type="button"
              onClick={() => alert("Export (demo)")}
              className={cn(btn.glass, "h-9 px-6 flex items-center gap-2 rounded-xl")}
            >
              <Download className="h-4 w-4" /> Export
            </button>
          </div>
        </div>

        {view === "TABLE" ? (
          <CustomersTable data={filtered} onEdit={openEdit} onRemove={remove} onOpen={openDetails} />
        ) : (
          <div className="relative mt-6">
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
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-20 bg-gradient-to-r from-white/5 to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-20 bg-gradient-to-l from-white/5 to-transparent" />

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
                <div
                  key={col.id}
                  className={cn(
                    "flex-none w-[330px] snap-start",
                    isColDragging && colDragOver === col.id && "ring-2 ring-white/10 rounded-3xl"
                  )}
                  onDragOver={(e) => onColumnWrapperDragOver(e, col.id)}
                  onDrop={(e) => onColumnWrapperDrop(e, col.id)}
                  onDragLeave={() => onColumnWrapperDragLeave(col.id)}
                >
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
                    onReorder={reorderWithinLane}
                    // ✅ column actions
                    onEditColumn={() => openEditColumn(col.id)}
                    onDeleteColumn={() => deleteColumn(col.id)}
                    onColumnDragStart={(e) => onColumnDragStart(e, col.id)}
                    onColumnDragEnd={onColumnDragEnd}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ✅ COLUMN MODAL (CREATE/EDIT) */}
      {colModalOpen && (
        <ModalShell
          title={colMode === "CREATE" ? "Create Card" : "Edit Card"}
          onClose={() => {
            setColModalOpen(false)
            setEditingColId(null)
          }}
        >
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
                placeholder="e.g. Lost"
                className={cn(
                  "h-12 w-full rounded-2xl px-4 outline-none text-white/90 placeholder:text-white/45 border focus:ring-2 transition",
                  "glass-inner",
                  colErr ? "border-red-400/35 focus:ring-red-400/20" : "border-white/12 focus:ring-white/10"
                )}
              />
            </label>

            <label className="block">
              <div className="text-xs font-extrabold text-white/75 mb-2">Hint</div>
              <input
                value={colHint}
                onChange={(e) => setColHint(e.target.value)}
                placeholder="Short description..."
                className={cn(
                  "h-12 w-full rounded-2xl px-4 outline-none text-white/90 placeholder:text-white/45 border focus:ring-2 transition",
                  "glass-inner",
                  "border-white/12 focus:ring-white/10"
                )}
              />
            </label>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setColModalOpen(false)
                  setEditingColId(null)
                }}
                className={btn.glass}
              >
                Cancel
              </button>
              <button onClick={submitColumnModal} className={btn.primary}>
                {colMode === "CREATE" ? "Create" : "Save"}
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
          <CustomerForm
            columns={columns}
            fFullName={fFullName}
            setFFullName={(v) => {
              setFFullName(v)
              setErr((p) => ({ ...p, fullName: "" }))
            }}
            fPhone={fPhone}
            setFPhone={(v) => {
              setFPhone(v)
              setErr((p) => ({ ...p, phone: "" }))
            }}
            fCity={fCity}
            setFCity={(v) => {
              setFCity(v)
              setErr((p) => ({ ...p, city: "" }))
            }}
            fSegment={fSegment}
            setFSegment={setFSegment}
            fNote={fNote}
            setFNote={setFNote}
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
          <CustomerForm
            columns={columns}
            fFullName={fFullName}
            setFFullName={(v) => {
              setFFullName(v)
              setErr((p) => ({ ...p, fullName: "" }))
            }}
            fPhone={fPhone}
            setFPhone={(v) => {
              setFPhone(v)
              setErr((p) => ({ ...p, phone: "" }))
            }}
            fCity={fCity}
            setFCity={(v) => {
              setFCity(v)
              setErr((p) => ({ ...p, city: "" }))
            }}
            fSegment={fSegment}
            setFSegment={setFSegment}
            fNote={fNote}
            setFNote={setFNote}
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

      {/* ✅ DETAILS MODAL */}
      {detailsOpen && active && (
        <ModalShell title="Customer details" onClose={closeDetails}>
          <div className="space-y-4">
            <div className="rounded-3xl p-5 glass-card">
              <div className="text-white font-extrabold text-xl">{active.fullName}</div>
              <div className="text-white/70 text-sm mt-2">
                {active.phone} • {active.city}
              </div>
              <div className="text-white/55 text-xs mt-2">
                Created: {fmtWhen(active.createdAt)}
                {active.updatedAt ? ` • Updated: ${fmtWhen(active.updatedAt)}` : ""}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-3xl p-5 glass-card">
                <div className="text-xs font-extrabold text-white/60">Segment</div>
                <div className="mt-2">
                  <span className={cn("text-xs font-extrabold px-3 py-1 rounded-full border", segPill[active.segment])}>
                    {active.segment}
                  </span>
                </div>
              </div>

              <div className="rounded-3xl p-5 glass-card">
                <div className="text-xs font-extrabold text-white/60">Lane</div>
                <div className="mt-2 text-white font-extrabold">
                  {columns.find((c) => c.id === active.lane)?.title ?? active.lane}
                </div>
              </div>
            </div>

            <div className="rounded-3xl p-5 glass-card">
              <div className="text-xs font-extrabold text-white/60 mb-2">Note</div>
              <div className="text-white/75 text-sm leading-6">{active.note || "—"}</div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <button onClick={closeDetails} className={btn.glass}>
                Close
              </button>
              <button
                onClick={() => {
                  closeDetails()
                  openEdit(active.id)
                }}
                className={btn.primary}
              >
                Edit
              </button>
            </div>
          </div>
        </ModalShell>
      )}
    </div>
  )
}

/* ===================== Table ===================== */

function CustomersTable(props: {
  data: Customer[]
  onOpen: (id: string) => void
  onEdit: (id: string) => void
  onRemove: (id: string) => void
}) {
  const { data, onOpen, onEdit, onRemove } = props
  return (
    <div className="rounded-3xl overflow-hidden glass-card mt-6">
      <div className="px-6 py-4 text-white flex items-center justify-between glass-header">
        <div className="text-sm font-extrabold text-white/90">Customers</div>
        <div className="text-xs text-white/60">{data.length} rows</div>
      </div>

      <div className="overflow-auto">
        <table className="min-w-[980px] w-full">
          <thead className="sticky top-0 z-10 glass-header text-white">
            <tr className="text-left text-xs font-extrabold tracking-wide text-white/85">
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4">City</th>
              <th className="px-6 py-4">Segment</th>
              <th className="px-6 py-4">Lane</th>
              <th className="px-6 py-4">Note</th>
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
                  <button type="button" className="text-left w-full" onClick={() => onOpen(r.id)} title="Open details">
                    <div className="font-extrabold text-sm text-white">{r.fullName}</div>
                  </button>
                </td>
                <td className="px-6 py-4 text-sm text-white/85">{r.phone}</td>
                <td className="px-6 py-4 text-sm text-white/85">{r.city}</td>
                <td className="px-6 py-4">
                  <span className={cn("text-xs font-extrabold px-3 py-1 rounded-full border", segPill[r.segment])}>
                    {r.segment}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-extrabold px-3 py-1 rounded-full border bg-white/8 border-white/12 text-white/85">
                    {r.lane}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-white/75 truncate max-w-[260px]">{r.note || "—"}</td>
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
  items: Customer[]
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
  onReorder: (dragId: string, targetId: string) => void
  onEditColumn: () => void
  onDeleteColumn: () => void
  onColumnDragStart: (e: React.DragEvent) => void
  onColumnDragEnd: () => void
}) {
  const {
    title,
    hint,
    column,
    items,
    dragActive,
    onDragStart,
    onDragEnd,
    allowDrop,
    onDrop,
    onDragLeave,
    onQuickAdd,
    onOpen,
    onEdit,
    onDelete,
    onReorder,
    onEditColumn,
    onDeleteColumn,
    onColumnDragStart,
    onColumnDragEnd,
  } = props

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

        <div className="flex items-center gap-2 shrink-0">
          <div className="text-xs font-bold text-white/60">{items.length}</div>

          <div
            draggable
            onDragStart={onColumnDragStart}
            onDragEnd={onColumnDragEnd}
            className={cn(btn.icon, "cursor-grab active:cursor-grabbing select-none")}
            title="Drag column"
          >
            ≡
          </div>

          <button onClick={onEditColumn} className={btn.icon} title="Edit column">
            <Pencil className="h-4 w-4 text-white/85" />
          </button>

          <button onClick={onDeleteColumn} className={btn.icon} title="Delete column">
            <Trash2 className="h-4 w-4 text-white/85" />
          </button>

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
            <CustomerCard
              key={x.id}
              item={x}
              onOpen={() => onOpen(x.id)}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onEdit={() => onEdit(x.id)}
              onDelete={() => onDelete(x.id)}
              onReorder={onReorder}
            />
          ))
        )}
      </div>
    </section>
  )
}

function CustomerCard(props: {
  item: Customer
  onOpen: () => void
  onDragStart: (e: React.DragEvent, id: string) => void
  onDragEnd: () => void
  onEdit: () => void
  onDelete: () => void
  onReorder: (dragId: string, targetId: string) => void
}) {
  const { item, onOpen, onDragStart, onDragEnd, onEdit, onDelete, onReorder } = props

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, item.id)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        const dragId = e.dataTransfer.getData("text/plain")
        onReorder(dragId, item.id)
      }}
      className={cn(
        "rounded-2xl border border-white/10 p-4",
        "glass-inner",
        "cursor-grab active:cursor-grabbing",
        "transition-all duration-200 hover:bg-white/10 hover:-translate-y-[1px] hover:shadow-md"
      )}
      title="Drag to move"
    >
      <button type="button" className="w-full text-left" onClick={onOpen}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-extrabold text-white truncate">{item.fullName}</div>
            <div className="text-xs text-white/70 mt-1 truncate">
              {item.phone} • {item.city}
            </div>
            <div className="text-xs text-white/65 mt-1 truncate">{item.note || "—"}</div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              className={btn.icon}
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
              className={btn.icon}
              title="Delete"
            >
              <Trash2 className="h-4 w-4 text-white/85" />
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className={cn("text-[11px] font-extrabold px-3 py-1 rounded-full border", segPill[item.segment])}>
            {item.segment}
          </span>
          <span className="text-[11px] font-extrabold px-3 py-1 rounded-full border bg-white/8 border-white/12 text-white/85">
            {item.lane}
          </span>
        </div>
      </button>
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
            <button onClick={onClose} className={btn.icon} title="Close">
              <X className="h-4 w-4 text-white/90" />
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  )
}

function CustomerForm(props: {
  columns: BoardColumn[]
  fFullName: string
  setFFullName: (v: string) => void
  fPhone: string
  setFPhone: (v: string) => void
  fCity: string
  setFCity: (v: string) => void
  fSegment: Segment
  setFSegment: (v: Segment) => void
  fNote: string
  setFNote: (v: string) => void
  fLane: ColumnId
  setFLane: (v: ColumnId) => void
  err: Record<string, string>
  onCancel: () => void
  onSubmit: () => void
  submitText: string
  leftDanger?: { text: string; onClick: () => void }
}) {
  const {
    columns,
    fFullName,
    setFFullName,
    fPhone,
    setFPhone,
    fCity,
    setFCity,
    fSegment,
    setFSegment,
    fNote,
    setFNote,
    fLane,
    setFLane,
    err,
    onCancel,
    onSubmit,
    submitText,
    leftDanger,
  } = props
  const hasErr = Object.values(err).some(Boolean)

  return (
    <div className="space-y-4">
      {hasErr && (
        <div className="rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-200 font-semibold">
          Please fix highlighted fields.
        </div>
      )}

      <Field label="Full name" value={fFullName} onChange={setFFullName} error={err.fullName} placeholder="Customer name" />
      <Field label="Phone" value={fPhone} onChange={setFPhone} error={err.phone} placeholder="+998 ..." />
      <Field label="City" value={fCity} onChange={setFCity} error={err.city} placeholder="Tashkent / Samarkand ..." />

      <Select
        label="Segment"
        value={fSegment}
        onChange={(v) => setFSegment(v as Segment)}
        options={[
          { value: "NEW", label: "NEW" },
          { value: "REGULAR", label: "REGULAR" },
          { value: "VIP", label: "VIP" },
        ]}
      />

      <TextArea label="Note" value={fNote} onChange={setFNote} placeholder="Short note..." />

      <Select label="Column" value={fLane} onChange={setFLane} options={columns.map((c) => ({ value: c.id, label: c.title }))} error={err.lane} />

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
          "glass-inner",
          "text-white/90 placeholder:text-white/45",
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
      <div className="text-xs font-extrabold text-white/75 mb-2">{label}</div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[110px] w-full rounded-2xl px-4 py-3 outline-none border border-white/12 focus:ring-2 focus:ring-white/10 transition-all duration-200 glass-inner text-white/90 placeholder:text-white/45"
      />
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
