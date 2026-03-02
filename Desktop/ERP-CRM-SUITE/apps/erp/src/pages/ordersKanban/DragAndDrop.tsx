import React, { useCallback, useMemo, useState } from "react";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useDraggable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
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
  MapPin,
  Phone,
  FileText,
  Upload,
  Download,
  File,
} from "lucide-react";

import SearchBar from "@/pages/ordersKanban/components/Search";

type Status = "Unpaid" | "Paid" | "Partial";
type ColumnId = "new" | "progress" | "ready" | "delivery";
type CardIcon = "note" | "truck" | "ready" | "timer";

type ActivityEntry = {
  id: string;
  text: string;
  time: string;
  dot: "gray" | "sky" | "emerald";
};

type OrderDocument = {
  id: string;
  name: string;
  size: string;
  fileType: string;
  url: string;
};

type OrderItem = {
  id: string;
  orderNo: string;
  customer: string;
  amount: number;
  status: Status;
  icon?: CardIcon;
  notes?: string;
  phone?: string;
  address?: string;
  createdAt?: string;
  activity?: ActivityEntry[];
  documents?: OrderDocument[];
};

type ColumnsState = Record<ColumnId, OrderItem[]>;

const ICONS: Record<CardIcon, React.ElementType> = {
  note: NotebookText,
  truck: Truck,
  ready: Check,
  timer: Clock,
};

const COLUMNS: { id: ColumnId; title: string }[] = [
  { id: "new", title: "New Orders" },
  { id: "progress", title: "In Progress" },
  { id: "ready", title: "Ready for Dispatch" },
  { id: "delivery", title: "On Delivery" },
];

const COLUMN_TITLES: Record<ColumnId, string> = {
  new: "New Orders",
  progress: "In Progress",
  ready: "Ready for Dispatch",
  delivery: "On Delivery",
};

const INITIAL: ColumnsState = {
  new: [
    {
      id: "1",
      orderNo: "ORD-001",
      customer: "Alice Johnson",
      amount: 250,
      status: "Unpaid",
      icon: "note",
      phone: "+998 (90) 111-22-33",
      address: "Tashkent, Chilonzor, Street 5",
      createdAt: "Today - 09:15",
      activity: [
        { id: "a1", text: "Order created", time: "Today - 09:15", dot: "gray" },
      ],
    },
    {
      id: "2",
      orderNo: "ORD-006",
      customer: "Frank White",
      amount: 99.99,
      status: "Unpaid",
      icon: "timer",
      phone: "+998 (91) 555-44-33",
      address: "Tashkent, Mirzo Ulugbek, Street 8",
      createdAt: "Today - 10:00",
      activity: [
        { id: "a1", text: "Order created", time: "Today - 10:00", dot: "gray" },
      ],
    },
  ],
  progress: [
    {
      id: "3",
      orderNo: "ORD-002",
      customer: "Bob Williams",
      amount: 1200.5,
      status: "Partial",
      icon: "truck",
      phone: "+998 (90) 123-45-67",
      address: "Tashkent, Yunusobod, Street 12",
      createdAt: "Today - 12:30",
      activity: [
        { id: "a1", text: "Order created", time: "Today - 12:30", dot: "gray" },
        { id: "a2", text: "Payment status changed to Partial", time: "Today - 13:10", dot: "sky" },
        { id: "a3", text: "Order moved to In Progress", time: "Today - 14:00", dot: "emerald" },
      ],
    },
    {
      id: "4",
      orderNo: "ORD-004",
      customer: "Diana Miller",
      amount: 75.25,
      status: "Unpaid",
      icon: "note",
      phone: "+998 (93) 777-88-99",
      address: "Tashkent, Shaykhontohur, Street 3",
      createdAt: "Today - 11:00",
      activity: [
        { id: "a1", text: "Order created", time: "Today - 11:00", dot: "gray" },
        { id: "a2", text: "Order moved to In Progress", time: "Today - 11:45", dot: "emerald" },
      ],
    },
  ],
  ready: [
    {
      id: "5",
      orderNo: "ORD-003",
      customer: "Charlie Davis",
      amount: 50,
      status: "Paid",
      icon: "ready",
      phone: "+998 (94) 321-65-87",
      address: "Tashkent, Uchtepa, Street 7",
      createdAt: "Today - 08:00",
      activity: [
        { id: "a1", text: "Order created", time: "Today - 08:00", dot: "gray" },
        { id: "a2", text: "Payment status changed to Paid", time: "Today - 08:30", dot: "sky" },
        { id: "a3", text: "Order moved to Ready for Dispatch", time: "Today - 09:00", dot: "emerald" },
      ],
    },
    {
      id: "6",
      orderNo: "ORD-010",
      customer: "Judy Blue",
      amount: 600,
      status: "Paid",
      icon: "ready",
      phone: "+998 (97) 456-78-90",
      address: "Tashkent, Yakkasaroy, Street 1",
      createdAt: "Today - 07:45",
      activity: [
        { id: "a1", text: "Order created", time: "Today - 07:45", dot: "gray" },
        { id: "a2", text: "Payment status changed to Paid", time: "Today - 08:10", dot: "sky" },
        { id: "a3", text: "Order moved to Ready for Dispatch", time: "Today - 08:50", dot: "emerald" },
      ],
    },
  ],
  delivery: [
    {
      id: "7",
      orderNo: "ORD-007",
      customer: "Grace Green",
      amount: 200,
      status: "Partial",
      icon: "truck",
      phone: "+998 (99) 200-30-40",
      address: "Tashkent, Bektemir, Street 15",
      createdAt: "Today - 13:00",
      activity: [
        { id: "a1", text: "Order created", time: "Today - 13:00", dot: "gray" },
        { id: "a2", text: "Payment status changed to Partial", time: "Today - 13:20", dot: "sky" },
        { id: "a3", text: "Order moved to On Delivery", time: "Today - 14:30", dot: "emerald" },
      ],
    },
  ],
};

function findColumn(state: ColumnsState, itemId: string): ColumnId | null {
  return (
    (Object.keys(state) as ColumnId[]).find((c) =>
      state[c].some((i) => i.id === itemId),
    ) ?? null
  );
}

function removeItem(state: ColumnsState, id: string): ColumnsState {
  const next = { ...state } as ColumnsState;
  (Object.keys(next) as ColumnId[]).forEach((cid) => {
    next[cid] = next[cid].filter((x) => x.id !== id);
  });
  return next;
}

function updateItemInPlace(
  state: ColumnsState,
  updated: OrderItem,
): ColumnsState {
  const col = findColumn(state, updated.id);
  if (!col) return state;
  return {
    ...state,
    [col]: state[col].map((x) => (x.id === updated.id ? updated : x)),
  };
}

function getNextOrderNo(state: ColumnsState) {
  const all = Object.values(state).flat();
  let max = 0;
  for (const o of all) {
    const m = o.orderNo.match(/(\d+)/);
    if (m) {
      const n = Number(m[1]);
      if (!Number.isNaN(n)) max = Math.max(max, n);
    }
  }
  const next = max + 1;
  const padded = String(next).padStart(3, "0");
  return `ORD-${padded}`;
}

function nowLabel() {
  const d = new Date();
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `Today - ${h}:${m}`;
}

/* ===================== UI helpers (light theme) ===================== */

const cardBase = "rounded-2xl border border-slate-300 bg-white shadow-sm";
const btn =
  "inline-flex h-10 items-center justify-center rounded-xl border border-transparent px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400";
const btnGhost = `${btn} !bg-none !bg-white !text-slate-800 !border-slate-300 hover:!bg-slate-100`;
const btnPrimary = `${btn} !bg-[#0D3B78] !text-white hover:!bg-[#114a93]`;
const btnDanger = `${btn} !bg-rose-600 !text-white hover:!bg-rose-700`;
const field =
  "w-full rounded-xl border border-slate-400 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-sky-400";

function FullScreenPanel({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[500] overflow-hidden rounded-2xl bg-slate-900/20 p-4 backdrop-blur-[1px]">
      <div className="mx-auto flex h-full w-full max-w-[1380px] flex-col overflow-hidden rounded-2xl bg-slate-100 shadow-2xl">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-300 bg-white px-6 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 items-center gap-2 rounded-xl !bg-none px-3 text-sm font-semibold !text-slate-900 transition hover:!bg-slate-200"
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </button>
            <div className="text-lg font-extrabold text-slate-900">{title}</div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl !bg-none transition hover:!bg-slate-200"
            title="Close"
          >
            <X className="h-5 w-5 text-slate-900" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          {children}
        </div>

        {footer ? (
          <div className="shrink-0 border-t border-slate-300 bg-white px-6 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function OrderCard({
  item,
  onView,
  onQuickEdit,
  onAskDelete,
}: {
  item: OrderItem;
  onView: (item: OrderItem) => void;
  onQuickEdit: (item: OrderItem) => void;
  onAskDelete: (item: OrderItem) => void;
}) {
  const Icon = item.icon ? ICONS[item.icon] : NotebookText;

  const statusStyles =
    item.status === "Paid"
      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
      : item.status === "Partial"
        ? "bg-sky-100 text-sky-800 border border-sky-200"
        : "bg-slate-100 text-slate-800 border border-slate-300";

  return (
    <div className={`w-full ${cardBase} p-5 transition hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <div className="text-[18px] font-extrabold text-slate-900">
            {item.orderNo}
          </div>
          <div className="text-sm text-slate-700 truncate">{item.customer}</div>
        </div>

        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-slate-100">
          <Icon className="h-5 w-5 text-slate-800" />
        </div>
      </div>

      <div className="mt-4 text-[22px] font-extrabold text-slate-900">
        ${item.amount.toFixed(2)}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span
          className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-bold ${statusStyles}`}
        >
          {item.status}
        </span>
      </div>

      <div className="my-4 h-px bg-slate-300" />

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => onView(item)}
          className="flex items-center gap-2 rounded-full !bg-[#0D3B78] px-3 py-2 text-sm font-semibold !text-white transition hover:brightness-110"
        >
          <Eye className="h-4 w-4" />
          View Details
        </button>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onQuickEdit(item)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full !bg-white border border-slate-300 transition hover:!bg-slate-200"
            title="Edit"
          >
            <Pencil className="h-5 w-5 text-slate-800" />
          </button>

          <button
            type="button"
            onClick={() => onAskDelete(item)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full !bg-white border border-rose-200 transition hover:!bg-rose-100"
            title="Delete"
          >
            <X className="h-5 w-5 text-rose-600" />
          </button>
        </div>
      </div>
    </div>
  );
}

function DraggableCard({
  item,
  onView,
  onQuickEdit,
  onAskDelete,
}: {
  item: OrderItem;
  onView: (item: OrderItem) => void;
  onQuickEdit: (item: OrderItem) => void;
  onAskDelete: (item: OrderItem) => void;
}) {
  const { setNodeRef, listeners, attributes, transform, isDragging } =
    useDraggable({ id: item.id });
  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={isDragging ? "opacity-60 cursor-default" : "cursor-default"}
    >
      <OrderCard
        item={item}
        onView={onView}
        onQuickEdit={onQuickEdit}
        onAskDelete={onAskDelete}
      />
    </div>
  );
}

function Column({
  id,
  title,
  items,
  onView,
  onQuickEdit,
  onAskDelete,
}: {
  id: ColumnId;
  title: string;
  items: OrderItem[];
  onView: (item: OrderItem) => void;
  onQuickEdit: (item: OrderItem) => void;
  onAskDelete: (item: OrderItem) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="w-[320px] min-w-[320px] rounded-2xl border border-slate-300 bg-white shadow-sm">
      <div className="flex h-[68vh] min-h-[500px] flex-col rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-slate-900">{title}</h3>
          <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-slate-200 px-2 text-xs font-bold text-slate-800">
            {items.length}
          </span>
        </div>

        <div
          ref={setNodeRef}
          className={[
            "mt-4 flex-1 overflow-auto rounded-xl p-2 transition-colors",
              isOver ? "bg-sky-100" : "bg-transparent",
          ].join(" ")}
        >
          <div className="space-y-3">
            {items.map((item) => (
              <DraggableCard
                key={item.id}
                item={item}
                onView={onView}
                onQuickEdit={onQuickEdit}
                onAskDelete={onAskDelete}
              />
            ))}
          </div>

          {items.length === 0 && (
            <div className="mt-4 rounded-xl border border-dashed border-slate-400 bg-slate-100 p-4 text-center text-sm text-slate-700">
              Drop here
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className={`${cardBase} p-4 flex items-start gap-3`}>
      <div className="mt-[2px] text-slate-700">{icon}</div>
      <div className="min-w-0">
        <div className="text-xs font-extrabold text-slate-600">{label}</div>
        <div className="mt-1 text-sm font-extrabold text-slate-900 truncate">
          {value}
        </div>
      </div>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileType(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "pdf";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return "image";
  if (["xls", "xlsx", "csv"].includes(ext)) return "excel";
  if (["doc", "docx"].includes(ext)) return "word";
  return "other";
}

function DocIcon({ type }: { type: string }) {
  const base = "h-9 w-9 rounded-lg flex items-center justify-center shrink-0";
  if (type === "pdf")
    return <div className={`${base} bg-rose-100`}><FileText className="h-4 w-4 text-rose-600" /></div>;
  if (type === "image")
    return <div className={`${base} bg-violet-100`}><File className="h-4 w-4 text-violet-600" /></div>;
  if (type === "excel")
    return <div className={`${base} bg-emerald-100`}><File className="h-4 w-4 text-emerald-600" /></div>;
  if (type === "word")
    return <div className={`${base} bg-sky-100`}><FileText className="h-4 w-4 text-sky-600" /></div>;
  return <div className={`${base} bg-slate-100`}><File className="h-4 w-4 text-slate-500" /></div>;
}

function DocumentsPanel({
  docs,
  editMode = false,
  onChange,
}: {
  docs: OrderDocument[];
  editMode?: boolean;
  onChange?: (docs: OrderDocument[]) => void;
}) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const newDocs: OrderDocument[] = files.map((f) => ({
      id: String(Date.now()) + Math.random(),
      name: f.name,
      size: formatFileSize(f.size),
      fileType: getFileType(f.name),
      url: URL.createObjectURL(f),
    }));
    onChange?.([...docs, ...newDocs]);
    e.target.value = "";
  };

  const removeDoc = (id: string) =>
    onChange?.(docs.filter((d) => d.id !== id));

  return (
    <div className={`${cardBase} p-5`}>
      <div className="flex items-center justify-between">
        <div className="text-[18px] font-extrabold text-slate-900 inline-flex items-center gap-2">
          <FileText className="h-5 w-5 text-slate-700" />
          Documents
        </div>
        <span className="text-xs font-extrabold text-slate-600">
          {docs.length} {docs.length === 1 ? "file" : "files"}
        </span>
      </div>

      <div className="mt-4 space-y-2">
        {docs.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
          >
            <DocIcon type={doc.fileType} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-slate-900 truncate">{doc.name}</div>
              <div className="text-xs text-slate-500">{doc.size}</div>
            </div>
            {editMode ? (
              <button
                type="button"
                onClick={() => removeDoc(doc.id)}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-rose-200 hover:bg-rose-50"
              >
                <X className="h-4 w-4 text-rose-500" />
              </button>
            ) : (
              <a
                href={doc.url}
                download={doc.name}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-100"
              >
                <Download className="h-4 w-4 text-slate-500" />
              </a>
            )}
          </div>
        ))}

        {docs.length === 0 && !editMode && (
          <div className="py-4 text-center text-sm text-slate-500">
            No documents attached.
          </div>
        )}
      </div>

      {editMode && (
        <label className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-400 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
          <Upload className="h-4 w-4" />
          Attach file
          <input type="file" multiple className="sr-only" onChange={handleFileChange} />
        </label>
      )}
    </div>
  );
}

export default function DragAndDropBoard() {
  const [columns, setColumns] = useState<ColumnsState>(INITIAL);
  const [activeId, setActiveId] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | Status>("all");

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selected, setSelected] = useState<OrderItem | null>(null);

  const [editMode, setEditMode] = useState(false);
  const [editCustomer, setEditCustomer] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editStatus, setEditStatus] = useState<Status>("Unpaid");
  const [editIcon, setEditIcon] = useState<CardIcon>("note");
  const [editColumn, setEditColumn] = useState<ColumnId>("new");
  const [editNotes, setEditNotes] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editDocs, setEditDocs] = useState<OrderDocument[]>([]);

  const [addOpen, setAddOpen] = useState(false);
  const [addCustomer, setAddCustomer] = useState("");
  const [addAmount, setAddAmount] = useState("");
  const [addStatus, setAddStatus] = useState<Status>("Unpaid");
  const [addColumn, setAddColumn] = useState<ColumnId>("new");
  const [addIcon, setAddIcon] = useState<CardIcon>("note");
  const [addNotes, setAddNotes] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [addAddress, setAddAddress] = useState("");
  const [addDocs, setAddDocs] = useState<OrderDocument[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const activeItem = useMemo(() => {
    if (!activeId) return null;
    return (
      Object.values(columns)
        .flat()
        .find((i) => i.id === activeId) ?? null
    );
  }, [activeId, columns]);

  const matches = useCallback(
    (item: OrderItem) => {
      const text = q.trim().toLowerCase();
      const okText =
        text.length === 0 ||
        item.orderNo.toLowerCase().includes(text) ||
        item.customer.toLowerCase().includes(text);
      const okStatus = status === "all" || item.status === status;
      return okText && okStatus;
    },
    [q, status],
  );

  const viewColumns: ColumnsState = useMemo(() => {
    const res = {} as ColumnsState;
    (Object.keys(columns) as ColumnId[]).forEach((cid) => {
      res[cid] = columns[cid].filter(matches);
    });
    return res;
  }, [columns, matches]);

  const statusCounts = useMemo(() => {
    const all = Object.values(columns).flat();
    return {
      all: all.length,
      Unpaid: all.filter((i) => i.status === "Unpaid").length,
      Partial: all.filter((i) => i.status === "Partial").length,
      Paid: all.filter((i) => i.status === "Paid").length,
    };
  }, [columns]);

  const onDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));

  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    if (!e.over) return;

    const fromCol = findColumn(columns, String(e.active.id));
    const toCol = e.over.id as ColumnId;
    if (!fromCol || fromCol === toCol) return;

    setColumns((prev) => {
      const from = [...prev[fromCol]];
      const to = [...prev[toCol]];
      const idx = from.findIndex((i) => i.id === e.active.id);
      const [moved] = from.splice(idx, 1);
      to.push(moved);
      return { ...prev, [fromCol]: from, [toCol]: to };
    });
  };

  const openDetails = (item: OrderItem, forceEdit = false) => {
    setSelected(item);
    setDetailsOpen(true);
    setEditCustomer(item.customer);
    setEditAmount(String(item.amount));
    setEditStatus(item.status);
    setEditIcon(item.icon ?? "note");
    setEditPhone(item.phone ?? "");
    setEditAddress(item.address ?? "");
    setEditDocs(item.documents ?? []);

    const col = findColumn(columns, item.id) ?? "new";
    setEditColumn(col);
    setEditNotes(
      item.notes ??
        `Contact customer, confirm items, and prepare invoice for ${item.orderNo}.`,
    );
    setEditMode(forceEdit);
  };

  const closeDetails = () => {
    setDetailsOpen(false);
    setSelected(null);
    setEditMode(false);
  };

  const askDelete = (item: OrderItem) => {
    const ok = window.confirm(`Delete order ${item.orderNo}?`);
    if (!ok) return;
    setColumns((prev) => removeItem(prev, item.id));
    if (selected?.id === item.id) closeDetails();
  };

  const saveEdit = () => {
    if (!selected) return;
    const amountNum = Number(editAmount);
    if (Number.isNaN(amountNum)) {
      alert("Amount must be a number");
      return;
    }

    const now = nowLabel();
    const newActivity: ActivityEntry[] = [...(selected.activity ?? [])];

    if (editStatus !== selected.status) {
      newActivity.push({
        id: String(Date.now()) + "s",
        text: `Payment status changed to ${editStatus}`,
        time: now,
        dot: "sky",
      });
    }

    const fromCol = findColumn(columns, selected.id) ?? "new";
    if (editColumn !== fromCol) {
      newActivity.push({
        id: String(Date.now()) + "c",
        text: `Order moved to ${COLUMN_TITLES[editColumn]}`,
        time: now,
        dot: "emerald",
      });
    }

    if (
      editCustomer.trim() !== selected.customer ||
      amountNum !== selected.amount ||
      editPhone.trim() !== (selected.phone ?? "") ||
      editAddress.trim() !== (selected.address ?? "")
    ) {
      newActivity.push({
        id: String(Date.now()) + "e",
        text: "Order details updated",
        time: now,
        dot: "gray",
      });
    }

    const updated: OrderItem = {
      ...selected,
      customer: editCustomer.trim() || selected.customer,
      amount: amountNum,
      status: editStatus,
      icon: editIcon,
      notes: editNotes.trim(),
      phone: editPhone.trim() || selected.phone,
      address: editAddress.trim() || selected.address,
      activity: newActivity,
      documents: editDocs,
    };

    setColumns((prev) => {
      let next = updateItemInPlace(prev, updated);
      const toCol = editColumn;
      if (fromCol && fromCol !== toCol) {
        const from = next[fromCol].filter((x) => x.id !== updated.id);
        const to = [updated, ...next[toCol]];
        next = { ...next, [fromCol]: from, [toCol]: to };
      }
      return next;
    });

    setSelected(updated);
    setEditMode(false);
  };

  const openAdd = () => {
    setAddCustomer("");
    setAddAmount("");
    setAddStatus("Unpaid");
    setAddColumn("new");
    setAddIcon("note");
    setAddNotes("Call customer, confirm delivery address and items list.");
    setAddPhone("+998 ");
    setAddAddress("");
    setAddDocs([]);
    setAddOpen(true);
  };

  const saveAdd = () => {
    const customer = addCustomer.trim();
    const phone = addPhone.trim();
    const address = addAddress.trim();
    const amountNum = Number(addAmount);

    if (!customer) {
      alert("Customer name is required");
      return;
    }
    if (!/^[a-zA-ZА-Яа-яЁё\s'-]{2,}$/.test(customer)) {
      alert("Customer name must be at least 2 characters and contain only letters");
      return;
    }
    if (!phone || phone === "+998 " || phone === "+998") {
      alert("Phone number is required");
      return;
    }
    const phoneDigits = phone.replace(/^\+998/, "").replace(/\D/g, "");
    if (phoneDigits.length !== 9) {
      alert("After +998 must be exactly 9 digits. Example: +998 90 123 45 67");
      return;
    }
    if (!address) {
      alert("Delivery address is required");
      return;
    }
    if (Number.isNaN(amountNum) || amountNum <= 0) {
      alert("Amount must be a positive number");
      return;
    }
    const id = String(Date.now());
    const orderNo = getNextOrderNo(columns);
    const now = nowLabel();

    const newOrder: OrderItem = {
      id,
      orderNo,
      customer,
      amount: amountNum,
      status: addStatus,
      icon: addIcon,
      notes: addNotes.trim(),
      phone: addPhone.trim() || undefined,
      address: addAddress.trim() || undefined,
      documents: addDocs,
      createdAt: now,
      activity: [
        { id: "a1", text: "Order created", time: now, dot: "gray" },
      ],
    };

    setColumns((prev) => ({
      ...prev,
      [addColumn]: [newOrder, ...prev[addColumn]],
    }));
    setAddOpen(false);
  };

  const visibleStatus = editMode ? editStatus : selected?.status;
  const currentDetailsColumn = selected
    ? (findColumn(columns, selected.id) ?? "new")
    : "new";
  const summaryCustomer = editMode
    ? editCustomer || "-"
    : (selected?.customer ?? "-");
  const summaryAmount = editMode
    ? editAmount || "-"
    : selected
      ? `$${selected.amount.toFixed(2)}`
      : "-";
  const summaryStatus = editMode ? editStatus : (selected?.status ?? "-");
  const summaryColumn = editMode
    ? COLUMN_TITLES[editColumn]
    : COLUMN_TITLES[currentDetailsColumn];

  const statusBadge =
    visibleStatus === "Paid"
      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
      : visibleStatus === "Partial"
        ? "bg-sky-100 text-sky-800 border border-sky-200"
        : "bg-slate-100 text-slate-800 border border-slate-300";

  return (
    <div className="flex w-full min-w-0 flex-col">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SearchBar
          q={q}
          setQ={setQ}
          status={status}
          setStatus={setStatus}
          counts={statusCounts}
          className="min-w-0 flex-1"
        />

        <button
          type="button"
          onClick={openAdd}
          className={`${btnPrimary} gap-2 whitespace-nowrap`}
        >
          <Plus className="h-5 w-5" />
          Add Order
        </button>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="hide-scrollbar flex flex-1 gap-4 overflow-x-auto pb-2">
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
            <div className="opacity-95">
              <OrderCard
                item={activeItem}
                onView={() => {}}
                onQuickEdit={() => {}}
                onAskDelete={() => {}}
              />
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
                type="button"
                onClick={() => {
                  setEditCustomer(selected.customer);
                  setEditAmount(String(selected.amount));
                  setEditStatus(selected.status);
                  setEditIcon(selected.icon ?? "note");
                  setEditColumn(findColumn(columns, selected.id) ?? "new");
                  setEditNotes(
                    selected.notes ??
                      `Contact customer, confirm items, and prepare invoice for ${selected.orderNo}.`,
                  );
                  setEditPhone(selected.phone ?? "");
                  setEditAddress(selected.address ?? "");
                  setEditDocs(selected.documents ?? []);
                  setEditMode(false);
                }}
                className={btnGhost}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveEdit}
                className={`${btnPrimary} gap-2`}
              >
                <Check className="h-5 w-5" />
                Save
              </button>
            </div>
          ) : null
        }
      >
        {selected && (
          <div className="w-full max-w-[1280px] mx-auto rounded-2xl min-h-[calc(100vh-64px-48px)]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="text-[24px] font-extrabold text-slate-900">
                  Order details
                </div>
                <span
                  className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-bold ${statusBadge}`}
                >
                  {visibleStatus}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {!editMode && (
                  <button
                    type="button"
                    onClick={() => setEditMode(true)}
                    className={`${btnGhost} gap-2`}
                  >
                    <Pencil className="h-5 w-5" />
                    Edit
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => askDelete(selected)}
                  className={`${btnDanger} gap-2`}
                >
                  <Trash2 className="h-5 w-5" />
                  Delete
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`${cardBase} p-5`}>
                <div className="text-[16px] font-extrabold text-slate-700">
                  Customer
                </div>
                {editMode ? (
                  <input
                    value={editCustomer}
                    onChange={(e) => setEditCustomer(e.target.value)}
                    className={`mt-2 ${field}`}
                    placeholder="Customer"
                  />
                ) : (
                  <div className="mt-2 text-[15px] font-extrabold text-slate-900">
                    {selected.customer}
                  </div>
                )}
              </div>

              <div className={`${cardBase} p-5`}>
                <div className="text-[16px] font-extrabold text-slate-700">
                  Amount
                </div>
                {editMode ? (
                  <input
                    type="number"
                    min={0}
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className={`mt-2 ${field}`}
                    placeholder="99.99"
                  />
                ) : (
                  <div className="mt-2 text-[20px] font-extrabold text-slate-900">
                    ${selected.amount.toFixed(2)}
                  </div>
                )}
              </div>

              <div className={`${cardBase} p-5`}>
                <div className="text-[16px] font-extrabold text-slate-700">
                  Payment Status
                </div>
                <div className="mt-2 flex items-center gap-2">
                  {editMode ? (
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as Status)}
                      className={`${field}`}
                    >
                      <option value="Unpaid">Unpaid</option>
                      <option value="Partial">Partial</option>
                      <option value="Paid">Paid</option>
                    </select>
                  ) : (
                    <div className="text-lg font-extrabold text-slate-900">
                      {selected.status}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-300 bg-white p-4 shadow-sm">
              <div className="flex flex-col space-y-3 lg:flex-row lg:space-y-0 lg:space-x-4">
                {editMode ? (
                  <div className={`${cardBase} p-4 flex items-start gap-3 flex-1`}>
                    <div className="mt-[2px] text-slate-700"><Phone className="h-5 w-5" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-extrabold text-slate-600">Phone</div>
                      <input
                        value={editPhone}
                        onChange={(e) => {
                          const val = e.target.value;
                          const raw = val.startsWith("+998") ? val.slice(4) : "";
                          const digits = raw.replace(/\D/g, "").slice(0, 9);
                          let fmt = "";
                          if (digits.length === 1) {
                            fmt = digits;
                          } else if (digits.length >= 2) {
                            fmt = "(" + digits.slice(0, 2) + ")";
                            if (digits.length >= 3) fmt += " " + digits.slice(2, 5);
                            if (digits.length >= 6) fmt += "-" + digits.slice(5, 7);
                            if (digits.length >= 8) fmt += "-" + digits.slice(7, 9);
                          }
                          setEditPhone(digits.length > 0 ? "+998 " + fmt : "+998 ");
                        }}
                        className={`mt-1 ${field}`}
                        placeholder="+998 (90) 123-45-67"
                      />
                    </div>
                  </div>
                ) : (
                  <MiniRow
                    label="Phone"
                    value={selected.phone ?? "—"}
                    icon={<Phone className="h-5 w-5" />}
                  />
                )}

                {editMode ? (
                  <div className={`${cardBase} p-4 flex items-start gap-3 flex-1`}>
                    <div className="mt-[2px] text-slate-700"><MapPin className="h-5 w-5" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-extrabold text-slate-600">Delivery address</div>
                      <input
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        className={`mt-1 ${field}`}
                        placeholder="City, District, Street"
                      />
                    </div>
                  </div>
                ) : (
                  <MiniRow
                    label="Delivery address"
                    value={selected.address ?? "—"}
                    icon={<MapPin className="h-5 w-5" />}
                  />
                )}

                <MiniRow
                  label="Created"
                  value={selected.createdAt ?? "—"}
                  icon={<Clock className="h-5 w-5" />}
                />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className={`${cardBase} p-5 flex flex-col min-h-[260px]`}>
                <div className="text-[16px] font-extrabold text-slate-700">
                  Internal Notes
                </div>
                {editMode ? (
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className={`mt-2 flex-1 ${field}`}
                    placeholder="Write notes for staff..."
                  />
                ) : (
                  <div className="mt-2 flex-1 rounded-xl border border-slate-300 bg-slate-100 p-3 text-sm text-slate-800">
                    {selected.notes?.trim() || "No internal notes yet."}
                  </div>
                )}
              </div>

              <div className={`${cardBase} p-5 min-h-[260px]`}>
                <div className="text-[16px] font-extrabold text-slate-700 mb-4">
                  Order activity
                </div>

                <div className="space-y-4">
                  {(selected.activity ?? []).length === 0 && (
                    <div className="text-sm text-slate-500">No activity yet.</div>
                  )}
                  {(selected.activity ?? []).map((entry) => (
                    <div key={entry.id} className="flex gap-3">
                      <div
                        className={[
                          "h-2 w-2 mt-2 rounded-full shrink-0",
                          entry.dot === "sky"
                            ? "bg-sky-400"
                            : entry.dot === "emerald"
                              ? "bg-emerald-400"
                              : "bg-slate-300",
                        ].join(" ")}
                      />
                      <div>
                        <div className="text-sm font-bold text-slate-900">
                          {entry.text}
                        </div>
                        <div className="text-xs text-slate-600">{entry.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={`mt-6 ${cardBase} p-5`}>
              <div className="text-[14px] font-extrabold text-slate-700 mb-3">
                Order summary
              </div>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div className="text-slate-700">Customer</div>
                <div className="font-bold text-slate-900">
                  {summaryCustomer}
                </div>

                <div className="text-slate-700">Amount</div>
                <div className="font-bold text-slate-900">{summaryAmount}</div>

                <div className="text-slate-700">Payment</div>
                <div className="font-bold text-slate-900">{summaryStatus}</div>

                <div className="text-slate-700">Column</div>
                <div className="font-bold text-slate-900">{summaryColumn}</div>
              </div>
            </div>

            <div className="mt-6">
              <DocumentsPanel
                docs={editDocs}
                editMode={editMode}
                onChange={setEditDocs}
              />
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
              type="button"
              onClick={() => setAddOpen(false)}
              className={btnGhost}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveAdd}
              className={`${btnPrimary} gap-2`}
            >
              <Check className="h-5 w-5" />
              Save Order
            </button>
          </div>
        }
      >
        <div className="w-full max-w-[980px] mx-auto rounded-2xl border border-slate-300 bg-white p-5 shadow-sm">
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`${cardBase} p-5`}>
              <div className="text-[16px] font-extrabold text-slate-700">
                Customer
              </div>
              <input
                value={addCustomer}
                onChange={(e) => setAddCustomer(e.target.value)}
                className={`mt-2 ${field}`}
                placeholder="Customer name"
              />
            </div>

            <div className={`${cardBase} p-5`}>
              <div className="text-[16px] font-extrabold text-slate-700">
                Amount
              </div>
              <input
                type="number"
                min={0}
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                className={`mt-2 ${field}`}
                placeholder="99.99"
              />
            </div>

            <div className={`${cardBase} p-5`}>
              <div className="text-[16px] font-extrabold text-slate-700">
                Payment Status
              </div>
              <select
                value={addStatus}
                onChange={(e) => setAddStatus(e.target.value as Status)}
                className={`mt-2 ${field}`}
              >
                <option value="Unpaid">Unpaid</option>
                <option value="Partial">Partial</option>
                <option value="Paid">Paid</option>
              </select>
            </div>

            <div className={`${cardBase} p-5`}>
              <div className="text-[16px] font-extrabold text-slate-700">
                Column Status
              </div>
              <select
                value={addColumn}
                onChange={(e) => setAddColumn(e.target.value as ColumnId)}
                className={`mt-2 ${field}`}
              >
                <option value="new">New Orders</option>
                <option value="progress">In Progress</option>
                <option value="ready">Ready for Dispatch</option>
                <option value="delivery">On Delivery</option>
              </select>
            </div>

            <div className={`${cardBase} p-5`}>
              <div className="text-[16px] font-extrabold text-slate-700">
                Phone
              </div>
              <input
                value={addPhone}
                onChange={(e) => {
                  const val = e.target.value;
                  const raw = val.startsWith("+998") ? val.slice(4) : "";
                  const digits = raw.replace(/\D/g, "").slice(0, 9);
                  let fmt = "";
                  if (digits.length === 1) {
                    fmt = digits;
                  } else if (digits.length >= 2) {
                    fmt = "(" + digits.slice(0, 2) + ")";
                    if (digits.length >= 3) fmt += " " + digits.slice(2, 5);
                    if (digits.length >= 6) fmt += "-" + digits.slice(5, 7);
                    if (digits.length >= 8) fmt += "-" + digits.slice(7, 9);
                  }
                  setAddPhone(digits.length > 0 ? "+998 " + fmt : "+998 ");
                }}
                className={`mt-2 ${field}`}
                placeholder="+998 (90) 123-45-67"
              />
            </div>

            <div className={`${cardBase} p-5`}>
              <div className="text-[16px] font-extrabold text-slate-700">
                Delivery Address
              </div>
              <input
                value={addAddress}
                onChange={(e) => setAddAddress(e.target.value)}
                className={`mt-2 ${field}`}
                placeholder="City, District, Street"
              />
            </div>

            <div
              className={`${cardBase} p-5 md:col-span-2 flex flex-col min-h-[180px]`}
            >
              <div className="text-[16px] font-extrabold text-slate-700">
                Internal Notes
              </div>
              <textarea
                value={addNotes}
                onChange={(e) => setAddNotes(e.target.value)}
                className={`mt-2 flex-1 ${field}`}
                placeholder="Write notes for staff..."
              />
            </div>

            <div className="md:col-span-2">
              <DocumentsPanel
                docs={addDocs}
                editMode
                onChange={setAddDocs}
              />
            </div>
          </div>
        </div>
      </FullScreenPanel>
    </div>
  );
}
