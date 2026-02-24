import React, { useEffect, useMemo, useState } from "react"
import { Pencil, Trash2, X } from "lucide-react"

type Priority = "RED" | "YELLOW" | "GREEN"
type ColumnId = string

type Task = {
  id: string
  name: string
  description: string
  priority: Priority
  column: ColumnId
  createdAt: number
  updatedAt?: number
}

type BoardColumn = {
  id: ColumnId
  title: string
  hint: string
}

const STORAGE_KEY = "crm_tasks"
const COL_KEY = "crm_task_columns"

const DEFAULT_COLUMNS: BoardColumn[] = [
  { id: "TODO", title: "Work exists", hint: "New cards will appear here" },
  { id: "DOING", title: "In progress", hint: "Currently being worked on" },
  { id: "DONE", title: "Done", hint: "Approved / completed" },
]

function cn(...a: Array<string | false | undefined | null>) {
  return a.filter(Boolean).join(" ")
}

const priorityMeta: Record<Priority, { label: string; badge: string; dot: string }> = {
  RED: { label: "Urgent", badge: "bg-red-500/15 text-red-200 border-red-400/25", dot: "bg-red-500" },
  YELLOW: { label: "Medium", badge: "bg-yellow-500/15 text-yellow-200 border-yellow-400/25", dot: "bg-yellow-500" },
  GREEN: { label: "Low", badge: "bg-emerald-500/15 text-emerald-200 border-emerald-400/25", dot: "bg-emerald-500" },
}

function priorityWeight(p: Priority) {
  if (p === "RED") return 0
  if (p === "YELLOW") return 1
  return 2
}

function uid() {
  return `t_${Math.random().toString(36).slice(2)}_${Date.now()}`
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

export default function TasksPage() {
  const boardRef = React.useRef<HTMLDivElement | null>(null)

  // ✅ drag holati (auto horizontal scroll uchun)
  const [isDragging, setIsDragging] = useState(false)

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

  // modals
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  // ✅ Create COLUMN modal
  const [createColumnOpen, setCreateColumnOpen] = useState(false)
  const [colTitle, setColTitle] = useState("")
  const [colErr, setColErr] = useState<string | null>(null)

  // columns
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

  // which column when user presses +Add inside column
  const [quickColumn, setQuickColumn] = useState<ColumnId | null>(null)

  // selection for edit
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // drag state
  const [dragOver, setDragOver] = useState<ColumnId | null>(null)

  // create form
  const [cName, setCName] = useState("")
  const [cDesc, setCDesc] = useState("")
  const [cPriority, setCPriority] = useState<Priority | null>(null)
  const [cColumn, setCColumn] = useState<ColumnId>("TODO")
  const [createErrors, setCreateErrors] = useState<{ name?: string; priority?: string; form?: string }>({})

  // storage init
  const [tasks, setTasks] = useState<Task[]>(() => {
    const hasKey = localStorage.getItem(STORAGE_KEY) !== null
    if (hasKey) return safeParse<Task[]>(localStorage.getItem(STORAGE_KEY), [])

    const demo: Task[] = [
      { id: uid(), name: "Prepare proposal", description: "Send proposal to customer by evening.", priority: "RED", column: "TODO", createdAt: Date.now() - 200000 },
      { id: uid(), name: "Call customer", description: "Follow-up about requirements.", priority: "YELLOW", column: "TODO", createdAt: Date.now() - 100000 },
      { id: uid(), name: "Send invoice", description: "Invoice for last month support.", priority: "GREEN", column: "TODO", createdAt: Date.now() - 50000 },
    ]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demo))
    return demo
  })

  // persist
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    window.dispatchEvent(new Event("crm:data"))
  }, [tasks])

  useScrollLock(createOpen || editOpen || createColumnOpen)

  useEffect(() => {
    if (!createOpen) return
    setCreateErrors({})
    if (quickColumn) setCColumn(quickColumn)
  }, [createOpen, quickColumn])

  const selectedTask = useMemo(() => {
    if (!selectedId) return null
    return tasks.find((t) => t.id === selectedId) ?? null
  }, [tasks, selectedId])

  // edit form
  const [eName, setEName] = useState("")
  const [eDesc, setEDesc] = useState("")
  const [ePriority, setEPriority] = useState<Priority>("RED")
  const [eColumn, setEColumn] = useState<ColumnId>("TODO")

  useEffect(() => {
    if (!selectedTask) return
    setEName(selectedTask.name)
    setEDesc(selectedTask.description)
    setEPriority(selectedTask.priority)
    setEColumn(selectedTask.column)
  }, [selectedTask])

  const grouped = useMemo(() => {
    const byCol: Record<string, Task[]> = {}
    for (const c of columns) byCol[c.id] = []
    for (const t of tasks) {
      if (!byCol[t.column]) byCol[t.column] = []
      byCol[t.column].push(t)
    }

    for (const colId of Object.keys(byCol)) {
      byCol[colId].sort((a, b) => {
        const pw = priorityWeight(a.priority) - priorityWeight(b.priority)
        if (pw !== 0) return pw
        return b.createdAt - a.createdAt
      })
    }

    return byCol
  }, [tasks, columns])

  function resetCreate() {
    setCName("")
    setCDesc("")
    setCPriority(null)
    setCColumn(quickColumn ?? "TODO")
    setCreateErrors({})
  }

  function validateCreate() {
    const errs: typeof createErrors = {}
    const n = cName.trim()

    if (!n) errs.name = "Title (name) kiritilishi shart."
    else if (n.length < 2) errs.name = "Title kamida 2 ta belgi bo‘lsin."

    if (!cPriority) errs.priority = "Priority tanlang (Red/Yellow/Green)."

    if (Object.keys(errs).length) {
      errs.form = "Create qilishdan oldin xatolarni to‘g‘rilang."
      setCreateErrors(errs)
      return false
    }

    setCreateErrors({})
    return true
  }

  function createTaskCard() {
    if (!validateCreate()) return

    const t: Task = {
      id: uid(),
      name: cName.trim(),
      description: cDesc.trim(),
      priority: cPriority!,
      column: cColumn,
      createdAt: Date.now(),
    }

    setTasks((p) => [...p, t])
    setCreateOpen(false)
    setQuickColumn(null)
    resetCreate()
  }

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

  function openEdit(id: string) {
    setSelectedId(id)
    setEditOpen(true)
  }

  function closeEdit() {
    setEditOpen(false)
    setSelectedId(null)
  }

  function saveEdit() {
    if (!selectedId) return
    const n = eName.trim()
    if (!n) return

    setTasks((prev) =>
      prev.map((t) =>
        t.id === selectedId
          ? { ...t, name: n, description: eDesc.trim(), priority: ePriority, column: eColumn, updatedAt: Date.now() }
          : t
      )
    )
    closeEdit()
  }

  function deleteTaskById(id: string) {
    const ok = window.confirm("Delete this card?")
    if (!ok) return
    setTasks((p) => p.filter((x) => x.id !== id))
    if (selectedId === id) closeEdit()
  }

  function clearAll() {
    const ok = window.confirm("Delete ALL cards?")
    if (!ok) return
    setTasks([])
    closeEdit()
  }

  // drag
  function onDragStart(e: React.DragEvent, taskId: string) {
    setIsDragging(true)
    e.dataTransfer.setData("text/plain", taskId)
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

  function onDrop(e: React.DragEvent, column: ColumnId) {
    e.preventDefault()
    setDragOver(null)
    setIsDragging(false)

    const id = e.dataTransfer.getData("text/plain")
    if (!id) return
    setTasks((p) => p.map((t) => (t.id === id ? { ...t, column, updatedAt: Date.now() } : t)))
  }

  function onDragLeave(col: ColumnId) {
    setDragOver((p) => (p === col ? null : p))
  }

  return (
    <div className="space-y-6">
      {/* ✅ PAGE CARD: background yo‘q, theme ostidan chiqadi */}
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-2xl font-extrabold text-white">Tasks</div>
            <div className="text-sm text-white/60 mt-1">Create cards, drag between columns, and track progress.</div>
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
          </div>
        </div>

        {/* columns */}
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
                tasks={grouped[col.id] ?? []}
                dragActive={dragOver === col.id}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                allowDrop={allowDrop}
                onDrop={onDrop}
                onDragLeave={onDragLeave}
                onQuickAdd={(colId) => {
                  setQuickColumn(colId)
                  setCreateOpen(true)
                }}
                onEdit={(id) => openEdit(id)}
                onDelete={(id) => deleteTaskById(id)}
              />
            </div>
          ))}
        </div>
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
              <button
                onClick={() => setCreateColumnOpen(false)}
                className="h-11 px-5 rounded-2xl glass-btn text-white font-extrabold transition"
              >
                Cancel
              </button>

              <button
                onClick={submitCreateColumn}
                className="h-11 px-5 rounded-2xl bg-white text-black font-extrabold hover:opacity-95 transition"
              >
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
            resetCreate()
          }}
        >
          <div className="space-y-4">
            {createErrors.form && (
              <div className="rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-200 font-semibold">
                {createErrors.form}
              </div>
            )}

            <label className="block">
              <div className="text-xs font-extrabold text-white/70 mb-2">Title (required)</div>
              <input
                value={cName}
                onChange={(e) => {
                  setCName(e.target.value)
                  setCreateErrors((p) => ({ ...p, name: undefined, form: undefined }))
                }}
                placeholder="e.g. Prepare proposal"
                className={cn(
                  "h-12 w-full rounded-2xl px-4 outline-none text-white placeholder:text-white/35 border focus:ring-2",
                  "glass-inner",
                  createErrors.name ? "border-red-400/35 focus:ring-red-400/20" : "border-white/12 focus:ring-white/10"
                )}
              />
              {createErrors.name && <div className="mt-2 text-xs font-bold text-red-200/90">{createErrors.name}</div>}
            </label>

            <label className="block">
              <div className="text-xs font-extrabold text-white/70 mb-2">Description</div>
              <textarea
                value={cDesc}
                onChange={(e) => setCDesc(e.target.value)}
                placeholder="Short details…"
                className="min-h-[110px] w-full rounded-2xl px-4 py-3 outline-none text-white placeholder:text-white/35 glass-inner border border-white/12 focus:ring-2 focus:ring-white/10"
              />
            </label>

            <label className="block">
              <div className="text-xs font-extrabold text-white/70 mb-2">Column</div>
              <select
                value={cColumn}
                onChange={(e) => setCColumn(e.target.value)}
                className="h-12 w-full rounded-2xl border border-white/12 glass-inner px-4 outline-none text-white focus:ring-2 focus:ring-white/10"
              >
                {columns.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#071b3a] text-white">
                    {c.title}
                  </option>
                ))}
              </select>
            </label>

            <div>
              <div className="text-xs font-extrabold text-white/70 mb-2">Priority (required)</div>
              <div className="grid grid-cols-3 gap-3">
                <PriorityPick
                  active={cPriority === "RED"}
                  onClick={() => {
                    setCPriority("RED")
                    setCreateErrors((p) => ({ ...p, priority: undefined, form: undefined }))
                  }}
                  title="Red"
                  desc="Urgent"
                  cls="border-red-400/25 bg-red-500/10 text-white"
                />
                <PriorityPick
                  active={cPriority === "YELLOW"}
                  onClick={() => {
                    setCPriority("YELLOW")
                    setCreateErrors((p) => ({ ...p, priority: undefined, form: undefined }))
                  }}
                  title="Yellow"
                  desc="Medium"
                  cls="border-yellow-400/25 bg-yellow-500/10 text-white"
                />
                <PriorityPick
                  active={cPriority === "GREEN"}
                  onClick={() => {
                    setCPriority("GREEN")
                    setCreateErrors((p) => ({ ...p, priority: undefined, form: undefined }))
                  }}
                  title="Green"
                  desc="Low"
                  cls="border-emerald-400/25 bg-emerald-500/10 text-white"
                />
              </div>
              {createErrors.priority && <div className="mt-2 text-xs font-bold text-red-200/90">{createErrors.priority}</div>}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setCreateOpen(false)
                  setQuickColumn(null)
                  resetCreate()
                }}
                className="h-11 px-5 rounded-2xl glass-btn text-white font-extrabold transition"
              >
                Cancel
              </button>

              <button
                onClick={createTaskCard}
                className="h-11 px-5 rounded-2xl bg-white text-black font-extrabold hover:opacity-95 transition"
              >
                Create
              </button>
            </div>
          </div>
        </ModalShell>
      )}

      {/* ✅ EDIT MODAL */}
      {editOpen && selectedTask && (
        <ModalShell title="Edit Card" onClose={closeEdit}>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-white/55">Created: {new Date(selectedTask.createdAt).toLocaleString()}</div>
              <span className={cn("text-xs font-extrabold px-3 py-1 rounded-full border", priorityMeta[selectedTask.priority].badge)}>
                {priorityMeta[selectedTask.priority].label}
              </span>
            </div>

            <label className="block">
              <div className="text-xs font-extrabold text-white/70 mb-2">Title</div>
              <input
                value={eName}
                onChange={(e) => setEName(e.target.value)}
                className="h-12 w-full rounded-2xl border border-white/12 glass-inner px-4 outline-none text-white focus:ring-2 focus:ring-white/10"
              />
            </label>

            <label className="block">
              <div className="text-xs font-extrabold text-white/70 mb-2">Description</div>
              <textarea
                value={eDesc}
                onChange={(e) => setEDesc(e.target.value)}
                className="min-h-[110px] w-full rounded-2xl border border-white/12 glass-inner px-4 py-3 outline-none text-white focus:ring-2 focus:ring-white/10"
              />
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <div className="text-xs font-extrabold text-white/70 mb-2">Column</div>
                <select
                  value={eColumn}
                  onChange={(e) => setEColumn(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-white/12 glass-inner px-4 outline-none text-white focus:ring-2 focus:ring-white/10"
                >
                  {columns.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#071b3a] text-white">
                      {c.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <div className="text-xs font-extrabold text-white/70 mb-2">Priority</div>
                <select
                  value={ePriority}
                  onChange={(e) => setEPriority(e.target.value as Priority)}
                  className="h-12 w-full rounded-2xl border border-white/12 glass-inner px-4 outline-none text-white focus:ring-2 focus:ring-white/10"
                >
                  <option value="RED" className="bg-[#071b3a] text-white">
                    Red (Urgent)
                  </option>
                  <option value="YELLOW" className="bg-[#071b3a] text-white">
                    Yellow (Medium)
                  </option>
                  <option value="GREEN" className="bg-[#071b3a] text-white">
                    Green (Low)
                  </option>
                </select>
              </label>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={() => deleteTaskById(selectedTask.id)}
                className="h-11 px-5 rounded-2xl border border-red-400/25 bg-red-500/10 text-red-200 font-extrabold hover:bg-red-500/15 transition"
              >
                Delete
              </button>

              <div className="flex items-center gap-3">
                <button onClick={closeEdit} className="h-11 px-5 rounded-2xl glass-btn text-white font-extrabold transition">
                  Close
                </button>

                <button onClick={saveEdit} className="h-11 px-5 rounded-2xl bg-white text-black font-extrabold hover:opacity-95 transition">
                  Save
                </button>
              </div>
            </div>
          </div>
        </ModalShell>
      )}
    </div>
  )
}

function ModalShell(props: { title: string; onClose: () => void; children: React.ReactNode }) {
  const { title, onClose, children } = props
  return (
    <div className="fixed inset-0 z-[9999]" aria-modal="true" role="dialog">
      <div className="absolute inset-0 bg-slate-900/45 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-[560px] rounded-3xl overflow-hidden glass-card">
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

function ColumnCard(props: {
  title: string
  hint: string
  column: ColumnId
  tasks: Task[]
  dragActive: boolean
  onDragStart: (e: React.DragEvent, taskId: string) => void
  onDragEnd: () => void
  allowDrop: (e: React.DragEvent, col: ColumnId) => void
  onDrop: (e: React.DragEvent, column: ColumnId) => void
  onDragLeave: (col: ColumnId) => void
  onQuickAdd: (col: ColumnId) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}) {
  const { title, hint, column, tasks, dragActive, onDragStart, onDragEnd, allowDrop, onDrop, onDragLeave, onQuickAdd, onEdit, onDelete } = props

  return (
    <section
      onDragOver={(e) => allowDrop(e, column)}
      onDrop={(e) => onDrop(e, column)}
      onDragLeave={() => onDragLeave(column)}
      className={cn(
        "rounded-3xl overflow-hidden transition",
        "glass-card",
        dragActive && "ring-2 ring-white/10 border-white/20"
      )}
    >
      <div className="px-5 py-4 glass-header flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-extrabold text-white">{title}</div>
          <div className="text-xs text-white/50 mt-1">{hint}</div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-bold text-white/60">{tasks.length}</div>
          <button onClick={() => onQuickAdd(column)} className="h-9 px-3 rounded-xl glass-btn text-white text-xs font-extrabold transition">
            + Add
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3 min-h-[520px]">
        {tasks.length === 0 ? (
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
          tasks.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onEdit={() => onEdit(t.id)}
              onDelete={() => onDelete(t.id)}
            />
          ))
        )}
      </div>
    </section>
  )
}

function TaskCard(props: {
  task: Task
  onDragStart: (e: React.DragEvent, taskId: string) => void
  onDragEnd: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const { task, onDragStart, onDragEnd, onEdit, onDelete } = props
  const meta = priorityMeta[task.priority]

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragEnd={onDragEnd}
      className={cn(
        "rounded-2xl border border-white/10 p-4",
        "glass-inner",
        "cursor-grab active:cursor-grabbing",
        "hover:bg-white/10 transition"
      )}
      title="Drag to move"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn("h-2 w-2 rounded-full", meta.dot)} />
            <div className="font-extrabold text-white truncate">{task.name}</div>
          </div>

          {task.description ? (
            <div className="text-sm text-white/60 mt-1 line-clamp-2">{task.description}</div>
          ) : (
            <div className="text-sm text-white/40 mt-1">No description</div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={cn("text-xs font-extrabold px-3 py-1 rounded-full border", meta.badge)}>{meta.label}</span>

          <button type="button" onClick={onEdit} className="h-9 w-9 rounded-xl glass-btn grid place-items-center" title="Edit">
            <Pencil className="h-4 w-4 text-white/85" />
          </button>

          <button type="button" onClick={onDelete} className="h-9 w-9 rounded-xl glass-btn grid place-items-center" title="Delete">
            <Trash2 className="h-4 w-4 text-white/75" />
          </button>
        </div>
      </div>
    </div>
  )
}

function PriorityPick(props: { active: boolean; onClick: () => void; title: string; desc: string; cls: string }) {
  const { active, onClick, title, desc, cls } = props
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-2xl border p-3 text-left transition",
        cls,
        active ? "ring-2 ring-white/10 border-white/20" : "hover:bg-white/5"
      )}
    >
      <div className="text-xs font-extrabold text-white">{title}</div>
      <div className="text-xs text-white/60 mt-1">{desc}</div>
    </button>
  )
}
