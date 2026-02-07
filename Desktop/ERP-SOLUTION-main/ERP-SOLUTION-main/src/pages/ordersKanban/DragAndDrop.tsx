import React, { useMemo, useState } from "react"
import type { DragEndEvent,DragStartEvent } from "@dnd-kit/core"
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
  Plus,
  X,
  NotebookText,
  Truck, 
  PackageCheck,
  Timer,
} from "lucide-react"

import SearchBar from "@/pages/ordersKanban/Search";
// import Filter from "@/pages/Filter";

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

const ICONS: Record<CardIcon, React.ComponentType<{ className?: string }>> = {
  note: NotebookText,
  ready: PackageCheck,
  timer: Timer,
  truck: Truck,
}
function OrderCard({ item }: { item: OrderItem }) {
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

        <button
          type="button"
          className="h-9 w-9 text-[#5b656f] rounded-full inline-flex items-center justify-center"
        >
          <Icon className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-4 text-[22px] font-extrabold text-[#1d1f21]">
        ${item.amount.toFixed(2)}
      </div>

      <span className={`mt-3 inline-flex h-7 items-center rounded-full px-3 text-xs font-bold ${statusStyles}`}>
        {item.status}
      </span>

      <div className="my-4 h-px bg-black/10" />

      <div className="flex items-center justify-between">
        <button className="flex items-center text-[#1d1f21] gap-2 rounded-full px-3 py-2 text-sm font-semibold cursor-pointer">
          <Eye className="h-4 w-4" />
          View Details
        </button>

        <div className="flex gap-2 text-[#1d1f21]">
          <button className="h-9 w-9 rounded-full inline-flex items-center justify-center cursor-pointer">
            <Plus className="h-5 w-5" />
          </button>
          <button className="h-9 w-9 rounded-full inline-flex items-center justify-center cursor-pointer">
            <X className="h-5 w-5 text-[#FF5E22]" />
          </button>
        </div>
      </div>
    </div>
  )
}

function DraggableCard({ item }: { item: OrderItem }) {
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
      className={isDragging ? "opacity-40 cursor-grabbing" : "cursor-grab"}
    >
      <OrderCard item={item} />
    </div>
  )
}

function Column({ id, title, items }: { id: ColumnId; title: string; items: OrderItem[] }) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div className="w-[340px] min-w-[340px]">
      <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-md">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold">{title}</h3>
          <span className="h-7 min-w-7 rounded-full bg-[#02437B] px-2 text-xs font-bold text-white flex items-center justify-center">
            {items.length}
          </span>
        </div>

        <div
          ref={setNodeRef}
          className={[
            "mt-4 h-[calc(100vh-280px)] overflow-auto rounded-xl",
            isOver ? "bg-black/5" : "",
          ].join(" ")}
        >
          {items.map((item) => (
            <DraggableCard key={item.id} item={item} />
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

const COLUMNS: { id: ColumnId; title: string }[] = [
  { id: "new", title: "New Orders" },
  { id: "progress", title: "In Progress" },
  { id: "ready", title: "Ready for Dispatch" },
  { id: "delivery", title: "On Delivery" },
]

const INITIAL: ColumnsState = {
  new: [
    { id: "1", orderNo: "ORD-001", customer: "Alice Johnson", amount: 250, status: "Unpaid", icon: "note" },
    { id: "2", orderNo: "ORD-006", customer: "Frank White", amount: 99.99, status: "Unpaid", icon: "truck" },
  ],
  progress: [
    { id: "3", orderNo: "ORD-002", customer: "Bob Williams", amount: 1200.5, status: "Partial", icon: "timer" },
    { id: "4", orderNo: "ORD-004", customer: "Diana Miller", amount: 75.25, status: "Unpaid", icon: "note" },
  ],
  ready: [
    { id: "5", orderNo: "ORD-003", customer: "Charlie Davis", amount: 50, status: "Paid", icon: "ready" },
    { id: "6", orderNo: "ORD-010", customer: "Judy Blue", amount: 600, status: "Paid", icon: "ready" },
  ],
  delivery: [
    { id: "7", orderNo: "ORD-007", customer: "Grace Green", amount: 200, status: "Partial", icon: "truck" },
  ],
}

function findColumn(state: ColumnsState, itemId: string): ColumnId | null {
  return (
    (Object.keys(state) as ColumnId[]).find((c) => state[c].some((i) => i.id === itemId)) ?? null
  )
}

export default function DragAndDropBoard() {
    // const [timeFilter, setTimeFilter] = useState<"all" | "today" | "week" | "month">("all")
  const [columns, setColumns] = useState<ColumnsState>(INITIAL)
  const [activeId, setActiveId] = useState<string | null>(null)

  const [q, setQ] = useState("")
  const [status, setStatus] = useState<"all" | Status>("all")

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const activeItem = useMemo(() => {
    if (!activeId) return null
    return Object.values(columns).flat().find((i) => i.id === activeId) ?? null
  }, [activeId, columns])

  const matches = (item: OrderItem) => {
    const text = q.trim().toLowerCase()
    const okText =
      text.length === 0 ||
      item.orderNo.toLowerCase().includes(text) ||
      item.customer.toLowerCase().includes(text)

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

  return (
    
    <div className="h-screen w-full rounded-md">
     <div className="px-2 pb-4 flex gap-4 items-center">
  <SearchBar q={q} setQ={setQ} status={status} setStatus={setStatus} />
  {/* <Filter value={timeFilter} onChange={setTimeFilter} /> */}
</div>
  
      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto px-2">
          {COLUMNS.map((c) => (
            <Column key={c.id} id={c.id} title={c.title} items={viewColumns[c.id]} />
          ))}
        </div>

        <DragOverlay>{activeItem ? <OrderCard item={activeItem} /> : null}</DragOverlay>
      </DndContext>
    </div>
  )
}