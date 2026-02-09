import React, { useMemo, useState } from "react"
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useDraggable,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import {
  Eye,
  X,
  NotebookText,
  Pencil,
  ArrowLeft,
  Trash2,
  Check,
  Plus,
  Truck,
  Clock,
  ClipboardList,
  MapPin,
  Phone,
  MessageSquareText,
} from "lucide-react"

import SearchBar from "@/pages/ordersKanban/Search"

type Status = "Unpaid" | "Paid" | "Partial"
type ColumnId = "new" | "progress" | "ready" | "delivery"
type CardIcon = "note" | "truck" | "ready" | "timer"

type OrderItem = {
  id: string
  orderNo: string
  customer: string
  amount: number
  status: Status
  icon?: CardIcon
}

type ColumnsState = Record<ColumnId, OrderItem[]>

const ICONS: Record<CardIcon, React.ElementType> = {
  note: NotebookText,
  truck: Truck,
  ready: Check,
  timer: Clock,
}

const COLUMNS: { id: ColumnId; title: string }[] = [
  { id: "new", title: "New Orders" },
  { id: "progress", title: "In Progress" },
  { id: "ready", title: "Ready for Dispatch" },
  { id: "delivery", title: "On Delivery" },
]

const INITIAL: ColumnsState = {
  new: [
    { id: "1", orderNo: "ORD-001", customer: "Alice Johnson", amount: 250, status: "Unpaid", icon: "note" },
    { id: "2", orderNo: "ORD-006", customer: "Frank White", amount: 99.99, status: "Unpaid", icon: "timer" },
  ],
  progress: [
    { id: "3", orderNo: "ORD-002", customer: "Bob Williams", amount: 1200.5, status: "Partial", icon: "truck" },
    { id: "4", orderNo: "ORD-004", customer: "Diana Miller", amount: 75.25, status: "Unpaid", icon: "note" },
  ],
  ready: [
    { id: "5", orderNo: "ORD-003", customer: "Charlie Davis", amount: 50, status: "Paid", icon: "ready" },
    { id: "6", orderNo: "ORD-010", customer: "Judy Blue", amount: 600, status: "Paid", icon: "ready" },
  ],
  delivery: [{ id: "7", orderNo: "ORD-007", customer: "Grace Green", amount: 200, status: "Partial", icon: "truck" }],
}

function findColumn(state: ColumnsState, itemId: string): ColumnId | null {
  return (Object.keys(state) as ColumnId[]).find((c) => state[c].some((i) => i.id === itemId)) ?? null
}

function removeItem(state: ColumnsState, id: string): ColumnsState {
  const next = { ...state } as ColumnsState
  ;(Object.keys(next) as ColumnId[]).forEach((cid) => {
    next[cid] = next[cid].filter((x) => x.id !== id)
  })
  return next
}

function updateItemInPlace(state: ColumnsState, updated: OrderItem): ColumnsState {
  const col = findColumn(state, updated.id)
  if (!col) return state
  return { ...state, [col]: state[col].map((x) => (x.id === updated.id ? updated : x)) }
}

function getNextOrderNo(state: ColumnsState) {
  const all = Object.values(state).flat()
  let max = 0
  for (const o of all) {
    const m = o.orderNo.match(/(\d+)/)
    if (m) {
      const n = Number(m[1])
      if (!Number.isNaN(n)) max = Math.max(max, n)
    }
  }
  const next = max + 1
  const padded = String(next).padStart(3, "0")
  return `ORD-${padded}`
}

function FullScreenPanel({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[500] bg-white flex flex-col">
      <div className="h-16 shrink-0 border-b border-black/10 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="h-10 px-3 rounded-xl inline-flex items-center gap-2 font-extrabold hover:bg-black/5"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
          <div className="text-lg font-extrabold text-[#1d1f21]">{title}</div>
        </div>

        <button
          onClick={onClose}
          className="h-10 w-10 rounded-xl inline-flex items-center justify-center hover:bg-black/5"
          title="Close"
        >
          <X className="h-5 w-5 text-[#1d1f21]" />
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6">{children}</div>

      {footer ? (
        <div className="shrink-0 border-t border-black/10 bg-white px-6 py-4">
          {footer}
        </div>
      ) : null}
    </div>
  )
}

function OrderCard({
  item,
  onView,
  onQuickEdit,
  onAskDelete,
}: {
  item: OrderItem
  onView: (item: OrderItem) => void
  onQuickEdit: (item: OrderItem) => void
  onAskDelete: (item: OrderItem) => void
}) {
  const Icon = item.icon ? ICONS[item.icon] : NotebookText

  const statusStyles =
    item.status === "Paid"
      ? "bg-emerald-100 text-emerald-700"
      : item.status === "Partial"
      ? "bg-amber-100 text-[#1d1f21]"
      : "bg-[#FF5E22]/15 text-[#FF5E22]"

  return (
    <div className="mt-4 w-full rounded-xl bg-[#d8E9F0] p-5 shadow-[0_12px_40px_-26px_rgba(0,0,0,0.45)]">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[18px] font-extrabold text-[#1d1f21]">{item.orderNo}</div>
          <div className="text-sm text-[#5b656f]">{item.customer}</div>
        </div>
      </div>

      <div className="mt-4 text-[22px] font-extrabold text-[#1d1f21]">${item.amount.toFixed(2)}</div>

      <div className="mt-3 flex items-center gap-2">
        <span className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-bold ${statusStyles}`}>
          {item.status}
        </span>
      </div>

      <div className="my-4 h-px bg-black/10" />

      <div className="flex items-center justify-between">
        <button
          onClick={() => onView(item)}
          className="flex items-center text-[#1d1f21] gap-2 rounded-full px-3 py-2 text-sm font-semibold cursor-pointer hover:bg-black/5"
        >
          <Eye className="h-4 w-4" />
          View Details
        </button>

        <div className="flex gap-2 text-[#1d1f21]">
          <button
            onClick={() => onQuickEdit(item)}
            className="h-9 w-9 rounded-full inline-flex items-center justify-center cursor-pointer hover:bg-black/5"
            title="Edit"
          >
            <Pencil className="h-5 w-5" />
          </button>

          <button
            onClick={() => onAskDelete(item)}
            className="h-9 w-9 rounded-full inline-flex items-center justify-center cursor-pointer hover:bg-black/5"
            title="Delete"
          >
            <X className="h-5 w-5 text-[#FF5E22]" />
          </button>
        </div>
      </div>
    </div>
  )
}

function DraggableCard({
  item,
  onView,
  onQuickEdit,
  onAskDelete,
}: {
  item: OrderItem
  onView: (item: OrderItem) => void
  onQuickEdit: (item: OrderItem) => void
  onAskDelete: (item: OrderItem) => void
}) {
  const { setNodeRef, listeners, attributes, transform, isDragging } = useDraggable({
    id: item.id,
  })

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={isDragging ? "opacity-40 cursor-default" : "cursor-default"}
    >
      <OrderCard item={item} onView={onView} onQuickEdit={onQuickEdit} onAskDelete={onAskDelete} />
    </div>
  )
}

function Column({
  id,
  title,
  items,
  onView,
  onQuickEdit,
  onAskDelete,
}: {
  id: ColumnId
  title: string
  items: OrderItem[]
  onView: (item: OrderItem) => void
  onQuickEdit: (item: OrderItem) => void
  onAskDelete: (item: OrderItem) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div className="w-[340px] min-w-[340px]">
      <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-md flex flex-col h-[calc(100vh-140px)]">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold">{title}</h3>
          <span className="h-7 min-w-7 rounded-full bg-[#02437B] px-2 text-xs font-bold text-white flex items-center justify-center">
            {items.length}
          </span>
        </div>

        <div ref={setNodeRef} className={["mt-4 flex-1 overflow-auto rounded-xl", isOver ? "bg-black/5" : ""].join(" ")}>
          {items.map((item) => (
            <DraggableCard key={item.id} item={item} onView={onView} onQuickEdit={onQuickEdit} onAskDelete={onAskDelete} />
          ))}

          {items.length === 0 && (
            <div className="mt-4 rounded-xl border border-dashed border-black/20 p-4 text-center text-sm text-[#5b656f]">
              Drop here
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MiniRow({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-black/10 p-4">
      <div className="mt-[2px]">{icon}</div>
      <div className="min-w-0">
        <div className="text-xs font-extrabold text-[#5b656f]">{label}</div>
        <div className="mt-1 text-sm font-extrabold text-[#1d1f21] truncate">{value}</div>
      </div>
    </div>
  )
}

function PlaceholderItems({ count = 4 }: { count?: number }) {
  const items = Array.from({ length: count }).map((_, i) => ({
    name: `Item ${i + 1}`,
    qty: (i + 1) * 2,
    price: 25 + i * 10,
  }))

  return (
    <div className="rounded-2xl border border-black/10 p-5">
      <div className="flex items-center justify-between">
        <div className="text-[18px] font-extrabold text-[#5b656f] inline-flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Items
        </div>
        <span className="text-xs font-extrabold text-[#5b656f]">{items.length} lines</span>
      </div>

      <div className="mt-4 space-y-3">
        {items.map((it, idx) => (
          <div key={idx} className="flex items-center justify-between rounded-xl bg-black/[0.03] border border-black/10 px-4 py-3">
            <div className="min-w-0">
              <div className="text-sm font-extrabold text-[#1d1f21] truncate">{it.name}</div>
              <div className="text-xs font-bold text-[#5b656f]">Qty: {it.qty}</div>
            </div>
            <div className="text-sm font-extrabold text-[#1d1f21]">${it.price.toFixed(2)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DragAndDropBoard() {
  const [columns, setColumns] = useState<ColumnsState>(INITIAL)
  const [activeId, setActiveId] = useState<string | null>(null)

  const [q, setQ] = useState("")
  const [status, setStatus] = useState<"all" | Status>("all")

  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selected, setSelected] = useState<OrderItem | null>(null)

  const [editMode, setEditMode] = useState(false)
  const [editCustomer, setEditCustomer] = useState("")
  const [editAmount, setEditAmount] = useState("")
  const [editStatus, setEditStatus] = useState<Status>("Unpaid")
  const [editIcon, setEditIcon] = useState<CardIcon>("note")
  const [editColumn, setEditColumn] = useState<ColumnId>("new")
  const [editNotes, setEditNotes] = useState("")

  const [addOpen, setAddOpen] = useState(false)
  const [addCustomer, setAddCustomer] = useState("")
  const [addAmount, setAddAmount] = useState("")
  const [addStatus, setAddStatus] = useState<Status>("Unpaid")
  const [addColumn, setAddColumn] = useState<ColumnId>("new")
  const [addIcon, setAddIcon] = useState<CardIcon>("note")
  const [addNotes, setAddNotes] = useState("")

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const activeItem = useMemo(() => {
    if (!activeId) return null
    return Object.values(columns).flat().find((i) => i.id === activeId) ?? null
  }, [activeId, columns])

  const matches = (item: OrderItem) => {
    const text = q.trim().toLowerCase()
    const okText = text.length === 0 || item.orderNo.toLowerCase().includes(text) || item.customer.toLowerCase().includes(text)
    const okStatus = status === "all" || item.status === status
    return okText && okStatus
  }

  const viewColumns: ColumnsState = useMemo(() => {
    const res = {} as ColumnsState
    ;(Object.keys(columns) as ColumnId[]).forEach((cid) => {
      res[cid] = columns[cid].filter(matches)
    })
    return res
  }, [columns, q, status])

  const onDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id))

  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null)
    if (!e.over) return

    const fromCol = findColumn(columns, String(e.active.id))
    const toCol = e.over.id as ColumnId
    if (!fromCol || fromCol === toCol) return

    setColumns((prev) => {
      const from = [...prev[fromCol]]
      const to = [...prev[toCol]]
      const idx = from.findIndex((i) => i.id === e.active.id)
      const [moved] = from.splice(idx, 1)
      to.push(moved)
      return { ...prev, [fromCol]: from, [toCol]: to }
    })
  }

  const openDetails = (item: OrderItem, forceEdit = false) => {
    setSelected(item)
    setDetailsOpen(true)
    setEditCustomer(item.customer)
    setEditAmount(String(item.amount))
    setEditStatus(item.status)
    setEditIcon(item.icon ?? "note")

    const col = findColumn(columns, item.id) ?? "new"
    setEditColumn(col)
    setEditNotes(`Contact customer, confirm items, and prepare invoice for ${item.orderNo}.`)
    setEditMode(forceEdit)
  }

  const closeDetails = () => {
    setDetailsOpen(false)
    setSelected(null)
    setEditMode(false)
  }

  const askDelete = (item: OrderItem) => {
    const ok = window.confirm(`Delete order ${item.orderNo}?`)
    if (!ok) return
    setColumns((prev) => removeItem(prev, item.id))
    if (selected?.id === item.id) closeDetails()
  }

  const saveEdit = () => {
    if (!selected) return
    const amountNum = Number(editAmount)
    if (Number.isNaN(amountNum)) {
      alert("Amount must be a number")
      return
    }

    const updated: OrderItem = {
      ...selected,
      customer: editCustomer.trim() || selected.customer,
      amount: amountNum,
      status: editStatus,
      icon: editIcon,
    }

    setColumns((prev) => {
      let next = updateItemInPlace(prev, updated)

      const fromCol = findColumn(next, updated.id)
      const toCol = editColumn
      if (fromCol && fromCol !== toCol) {
        const from = next[fromCol].filter((x) => x.id !== updated.id)
        const to = [updated, ...next[toCol]]
        next = { ...next, [fromCol]: from, [toCol]: to }
      }
      return next
    })

    setSelected(updated)
    setEditMode(false)
  }

  const openAdd = () => {
    setAddCustomer("")
    setAddAmount("")
    setAddStatus("Unpaid")
    setAddColumn("new")
    setAddIcon("note")
    setAddNotes("Call customer, confirm delivery address and items list.")
    setAddOpen(true)
  }

  const saveAdd = () => {
    const customer = addCustomer.trim()
    const amountNum = Number(addAmount)

    if (!customer) {
      alert("Customer is required")
      return
    }
    if (Number.isNaN(amountNum)) {
      alert("Amount must be a number")
      return
    }

    const id = String(Date.now())
    const orderNo = getNextOrderNo(columns)

    const newOrder: OrderItem = {
      id,
      orderNo,
      customer,
      amount: amountNum,
      status: addStatus,
      icon: addIcon,
    }

    setColumns((prev) => ({ ...prev, [addColumn]: [newOrder, ...prev[addColumn]] }))
    setAddOpen(false)
  }

  const statusBadge =
    selected?.status === "Paid"
      ? "bg-emerald-100 text-emerald-700"
      : selected?.status === "Partial"
      ? "bg-amber-100 text-[#1d1f21]"
      : "bg-[#FF5E22]/15 text-[#FF5E22]"

  return (
    <div className="min-h-screen w-full rounded-md flex flex-col">
      <div className="px-2 pb-4 flex gap-4 items-center">
        <SearchBar q={q} setQ={setQ} status={status} setStatus={setStatus} />

        <button
          onClick={openAdd}
          className="h-10 px-4 rounded-xl cursor-pointer shadow-md bg-[#02437B] text-white font-extrabold hover:opacity-95 inline-flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add Orders
        </button>
      </div>

      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto h-[400px] px-2 pb-4 flex-1">
          {COLUMNS.map((c) => (
            <Column
              key={c.id}
              id={c.id}
              title={c.title}
              items={viewColumns[c.id]}
              onView={(it) => openDetails(it, false)}
              onQuickEdit={(it) => openDetails(it, true)}
              onAskDelete={askDelete}
            />
          ))}
        </div>

        <DragOverlay>
          {activeItem ? (
            <div className="opacity-90">
              <OrderCard item={activeItem} onView={() => {}} onQuickEdit={() => {}} onAskDelete={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* DETAILS / EDIT */}
      <FullScreenPanel
        open={detailsOpen && !!selected}
        title={selected ? `Order ${selected.orderNo}` : "Order"}
        onClose={closeDetails}
        footer={
          editMode && selected ? (
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setEditCustomer(selected.customer)
                  setEditAmount(String(selected.amount))
                  setEditStatus(selected.status)
                  setEditIcon(selected.icon ?? "note")
                  setEditColumn(findColumn(columns, selected.id) ?? "new")
                  setEditNotes(`Contact customer, confirm items, and prepare invoice for ${selected.orderNo}.`)
                  setEditMode(false)
                }}
                className="h-10 px-4 rounded-xl cursor-pointer border border-black/10 font-extrabold hover:bg-black/5"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="h-10 px-4 rounded-xl bg-[#02437B] cursor-pointer text-white font-extrabold hover:opacity-95 inline-flex items-center gap-2"
              >
                <Check className="h-5 w-5" />
                Save
              </button>
            </div>
          ) : null
        }
      >
        {selected && (
          <div className="w-full max-w-[1280px] mx-auto  min-h-[calc(100vh-64px-48px)]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="text-[25px] font-bold text-[#5b656f]">Order details</div>
                <span className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-bold ${statusBadge}`}>
                  {selected.status}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {!editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className="h-10 px-4 rounded-xl cursor-pointer border border-black/10 inline-flex items-center gap-2 font-extrabold hover:bg-black/5"
                  >
                    <Pencil className="h-5 w-5" />
                    Edit
                  </button>
                )}

                <button
                  onClick={() => askDelete(selected)}
                  className="h-10 px-4 rounded-xl cursor-pointer border border-black/10 inline-flex items-center gap-2 font-extrabold hover:bg-black/5 text-[#FF5E22]"
                >
                  <Trash2 className="h-5 w-5" />
                  Delete
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-black/10 p-5">
                <div className="text-[18px] font-semibold text-[#5b656f]">Customer</div>
                {editMode ? (
                  <input
                    value={editCustomer}
                    onChange={(e) => setEditCustomer(e.target.value)}
                    className="mt-2 w-full rounded-xl border focus:shadow-md border-black/10 px-3 py-2 text-md outline-none"
                  />
                ) : (
                  <div className="mt-2 text-[15px] font-extrabold text-[#1d1f21]">{selected.customer}</div>
                )}
              </div>

              <div className="rounded-2xl border border-black/10 p-5">
                <div className="text-[18px] font-semibold text-[#5b656f]">Amount</div>
                {editMode ? (
                  <input
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2 text-[15px] outline-none focus:shadow-md"
                  />
                ) : (
                  <div className="mt-2 text-[20px] font-extrabold text-[#1d1f21]">${selected.amount.toFixed(2)}</div>
                )}
              </div>

              <div className="rounded-2xl border border-black/10 p-5">
                <div className="text-[18px] font-semibold text-[#5b656f]">Payment Status</div>

                <div className="mt-2 flex items-center gap-2">
                  {editMode ? (
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as Status)}
                      className="rounded-xl border border-black/10 px-3 py-2 text-[15px] focus:shadow-md outline-none"
                    >
                      <option value="Unpaid">Unpaid</option>
                      <option value="Partial">Partial</option>
                      <option value="Paid">Paid</option>
                    </select>
                  ) : (
                    <div className="text-lg font-extrabold text-[#1d1f21]">{selected.status}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
              <MiniRow label="Phone" value="+998 (90) 123-45-67" icon={<Phone className="h-5 w-5 text-[#02437B]" />} />
              <MiniRow label="Delivery address" value="Tashkent, Yunusobod, Street 12" icon={<MapPin className="h-5 w-5 text-[#02437B]" />} />
              <MiniRow label="Created" value="Today • 12:30" icon={<Clock className="h-5 w-5 text-[#02437B]" />} />
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-black/10 p-5 flex flex-col flex-1 min-h-[260px]">
            <div className="flex items-center justify-between">
                  <div className="text-[18px] font-extrabold text-[#5b656f] inline-flex items-center gap-2">
                    <MessageSquareText className="h-5 w-5" />
                    Notes & activity
                  </div>
                </div>

                {editMode ? (
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="mt-4 w-full flex-1 min-h-[140px] rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
                    placeholder="Write internal notes..."
                  />
                ) : (
                  <div className="mt-4 rounded-2xl bg-black/[0.03] border border-black/10 p-4 text-sm text-[#1d1f21]">
                    {editNotes}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </FullScreenPanel>

      {/* ADD */}
      <FullScreenPanel
        open={addOpen}
        title="Create Order"
        onClose={() => setAddOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setAddOpen(false)}
              className="h-10 px-4 rounded-xl border border-black/10 font-extrabold hover:bg-black/5"
            >
              Cancel
            </button>
            <button
              onClick={saveAdd}
              className="h-10 px-4 rounded-xl bg-[#02437B] text-white font-extrabold hover:opacity-95 inline-flex items-center gap-2"
            >
              <Check className="h-5 w-5" />
              Save Order
            </button>
          </div>
        }
      >
        <div className="w-full max-w-[980px] mx-auto">
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-black/10 p-5">
              <div className="text-[18px] font-extrabold text-[#5b656f]">Customer</div>
              <input
                value={addCustomer}
                onChange={(e) => setAddCustomer(e.target.value)}
                className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
                placeholder="Customer name"
              />
            </div>

            <div className="rounded-2xl border border-black/10 p-5">
              <div className="text-[18px] font-extrabold text-[#5b656f]">Amount</div>
              <input
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
                placeholder="99.99"
              />
            </div>

            <div className="rounded-2xl border border-black/10 p-5">
              <div className="text-[18px] font-extrabold text-[#5b656f]">Payment Status</div>
              <select
                value={addStatus}
                onChange={(e) => setAddStatus(e.target.value as Status)}
                className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2 text-[15px] outline-none focus:ring-2 focus:ring-black/10"
              >
                <option value="Unpaid">Unpaid</option>
                <option value="Partial">Partial</option>
                <option value="Paid">Paid</option>
              </select>
            </div>

            <div className="rounded-2xl border border-black/10 p-5">
              <div className="text-[18px] font-extrabold text-[#5b656f]">Column Status</div>
              <select
                value={addColumn}
                onChange={(e) => setAddColumn(e.target.value as ColumnId)}
                className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
              >
                <option value="new">New Orders</option>
                <option value="progress">In Progress</option>
                <option value="ready">Ready for Dispatch</option>
                <option value="delivery">On Delivery</option>
              </select>
            </div>

            <div className="rounded-2xl border border-black/10 p-5 md:col-span-2">
              <div className="text-[18px] font-extrabold text-[#5b656f]">Internal Notes</div>
              <textarea
                value={addNotes}
                onChange={(e) => setAddNotes(e.target.value)}
                className="mt-2 w-full min-h-[120px] rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
                placeholder="Write notes for staff..."
              />
            </div>
          </div>
        </div>
      </FullScreenPanel>
    </div>
  )
}
