import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Trash2, ChevronUp } from "lucide-react"

type ItemType = "finished" | "raw"

type OrderItem = {
  id: string
  type: ItemType
  name: string
  qty: number
  unitPrice: number
  discountPct: number
}

type OrderPayload = {
  client: string
  date: string
  items: OrderItem[]
  paidAmount: number
  orderDiscount: number
}

type Props = {
  onCreate?: (payload: OrderPayload) => Promise<void> | void
}

const money = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

const uid = () => Math.random().toString(36).slice(2, 10)

const NewOrderDialog = ({ onCreate }: Props) => {
  const [open, setOpen] = useState(false)

  // left side form
  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const [client, setClient] = useState("Acme Corp.")
  const [date, setDate] = useState(today)

  const [paidAmount, setPaidAmount] = useState<number>(0)
  const [orderDiscount, setOrderDiscount] = useState<number>(0) // absolute value (money)

  const [items, setItems] = useState<OrderItem[]>([
    { id: uid(), type: "finished", name: "Product", qty: 2, unitPrice: 50, discountPct: 10 },
    { id: uid(), type: "raw", name: "Material", qty: 5, unitPrice: 10, discountPct: 0 },
    { id: uid(), type: "finished", name: "Service", qty: 1, unitPrice: 120, discountPct: 5 },
  ])

  // computed
  const subtotal = useMemo(() => {
    return items.reduce((sum, it) => {
      const line = it.qty * it.unitPrice
      const disc = (line * it.discountPct) / 100
      return sum + (line - disc)
    }, 0)
  }, [items])

  const total = useMemo(() => {
    return Math.max(0, subtotal - (orderDiscount || 0))
  }, [subtotal, orderDiscount])

  const remaining = useMemo(() => {
    return Math.max(0, total - (paidAmount || 0))
  }, [total, paidAmount])

  const canSave = useMemo(() => {
    if (!client.trim()) return false
    if (!date) return false
    if (items.length === 0) return false
    if (items.some((i) => !i.name.trim() || i.qty <= 0 || i.unitPrice < 0)) return false
    if (orderDiscount < 0) return false
    if (paidAmount < 0) return false
    return true
  }, [client, date, items, orderDiscount, paidAmount])

  const addItem = () => {
    setItems((p) => [
      ...p,
      { id: uid(), type: "finished", name: "", qty: 1, unitPrice: 0, discountPct: 0 },
    ])
  }

  const removeItem = (id: string) => {
    setItems((p) => p.filter((x) => x.id !== id))
  }

  const updateItem = <K extends keyof OrderItem>(
    id: string,
    key: K,
    value: OrderItem[K]
  ) => {
    setItems((p) =>
      p.map((it) => (it.id === id ? { ...it, [key]: value } : it))
    )
  }

  const lineTotal = (it: OrderItem) => {
    const line = it.qty * it.unitPrice
    const disc = (line * it.discountPct) / 100
    return Math.max(0, line - disc)
  }

  const resetAll = () => {
    setClient("Acme Corp.")
    setDate(today)
    setPaidAmount(0)
    setOrderDiscount(0)
    setItems([
      { id: uid(), type: "finished", name: "Product", qty: 2, unitPrice: 50, discountPct: 10 },
      { id: uid(), type: "raw", name: "Material", qty: 5, unitPrice: 10, discountPct: 0 },
      { id: uid(), type: "finished", name: "Service", qty: 1, unitPrice: 120, discountPct: 5 },
    ])
  }

  const handleSave = async () => {
    if (!canSave) return
    const payload: OrderPayload = {
      client: client.trim(),
      date,
      items,
      paidAmount,
      orderDiscount,
    }
    await onCreate?.(payload)
    setOpen(false)
    resetAll()
  }

  return (
    <div>
      {/* Trigger – xohlagan joyga qo‘yasan */}

      {/* Full-screen-ish dialog like screenshot */}
      <div className="p-0  border-none max-w-[1100px]">
        <div className="p-6">
          {/* Top header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h1 className="text-2xl font-semibold text-slate-800">
                Create New Order
              </h1>
            </div>
          </div>

          {/* Main grid: left form + right summary */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
            {/* LEFT */}
            <div className="space-y-6">
              {/* Client Details */}
              <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="font-semibold text-slate-800 mb-5">Client Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-[1fr_110px] gap-3 items-end">
                  <div className="grid gap-2">
                    <Label className="text-slate-600">Client</Label>
                    <Input
                      className="rounded-xl rounded-xl justify-center bg-white/70 backdrop-blur-xl border-gray-300 shadow-[rgba(0,0,0,0.24)_0px_3px_8px]"
                      value={client}
                      onChange={(e) => setClient(e.target.value)}
                      placeholder="Client name..."
                    />
                  </div>

                  <Button
                    variant="outline"
                    className="h-10 rounded-xl bg-white rounded-xl justify-center bg-white/70 backdrop-blur-xl border-gray-300 shadow-[rgba(0,0,0,0.24)_0px_3px_8px]"
                    type="button"
                    onClick={() => setClient("")}
                  >
                    New Client
                  </Button>
                </div>
              </section>

              {/* Order Date */}
              <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="font-semibold text-slate-800 mb-5">Order Date</h3>

                <div className="grid gap-2 max-w-[420px]">
                  <Label className="text-slate-600">Date</Label>
                  <Input
                    className="rounded-xl rounded-xl justify-center bg-white/70 backdrop-blur-xl border-gray-300 shadow-[rgba(0,0,0,0.24)_0px_3px_8px]"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </section>

              {/* Order Items */}
              <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-semibold text-slate-800">Order Items</h3>
                  <Button
                    type="button"
                    onClick={addItem}
                    className="h-9 rounded-xl bg-[#0b87b6] hover:bg-[#0a7aa5] text-white"
                  >
                    Add Item
                  </Button>
                </div>

                {/* Table header */}
                <div className="hidden md:grid grid-cols-[150px_1fr_90px_110px_120px_110px_80px] gap-3 px-3 text-[11px] font-semibold text-slate-500 uppercase">
                  <div>Mahsulot nomi</div>
                  <div>Massa O'lchovlari</div>
                  <div className="text-center">Soni</div>
                  <div className="text-center">Narx</div>
                  <div className="text-center">Chegirma (%)</div>
                  <div className="text-center">Umumiy Summa</div>
                </div>

                <div className="mt-3 space-y-3">
                  {items.map((it) => (
                    <div
                      key={it.id}
                      className="
                        grid grid-cols-1 md:grid-cols-[150px_1fr_90px_110px_120px_110px_80px]
                        gap-3 items-center
                        px-3 py-2
                        rounded-xl
                        border border-slate-200
                        bg-white
                      "
                    >
                      {/* type */}
                      <div>
                        <Select
                          value={it.type}
                          onValueChange={(v) => updateItem(it.id, "type", v as ItemType)}
                        >
                          <SelectTrigger className="rounded-xl h-9">
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="finished">Finished Product</SelectItem>
                            <SelectItem value="raw">Raw Material</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* name */}
                      <div>
                        <Input
                          className="rounded-xl h-9"
                          value={it.name}
                          onChange={(e) => updateItem(it.id, "name", e.target.value)}
                          placeholder={it.type === "finished" ? "Product name..." : "Material name..."}
                        />
                      </div>

                      {/* qty */}
                      <div>
                        <Input
                          className="rounded-xl h-9 text-center"
                          type="number"
                          min={1}
                          value={it.qty}
                          onChange={(e) =>
                            updateItem(it.id, "qty", clamp(Number(e.target.value || 0), 0, 999999))
                          }
                        />
                      </div>

                      {/* unit price */}
                      <div>
                        <Input
                          className="rounded-xl h-9 text-center"
                          type="number"
                          min={0}
                          value={it.unitPrice}
                          onChange={(e) =>
                            updateItem(it.id, "unitPrice", clamp(Number(e.target.value || 0), 0, 999999999))
                          }
                        />
                      </div>

                      {/* discount */}
                      <div>
                        <Input
                          className="rounded-xl h-9 text-center"
                          type="number"
                          min={0}
                          max={100}
                          value={it.discountPct}
                          onChange={(e) =>
                            updateItem(it.id, "discountPct", clamp(Number(e.target.value || 0), 0, 100))
                          }
                        />
                      </div>

                      {/* line total */}
                      <div className="text-center font-semibold text-slate-800">
                        ${money(lineTotal(it))}
                      </div>

                      {/* actions */}
                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={() => removeItem(it.id)}
                          className="h-9 w-9 rounded-xl border border-slate-200 grid place-items-center text-red-500 hover:bg-red-50"
                          aria-label="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex items-center gap-5 justify-end">
                  <Button className="rounded-xl justify-center border bg-white/70 backdrop-blur-xl border-gray-300 shadow-[rgba(0,0,0,0.24)_0px_3px_8px]">Save Draft</Button>
                  <Button className="rounded-xl border bg-[#0b87b6] hover:bg-[#0a7aa5] text-white justify-center  backdrop-blur-xl border-gray-300 shadow-[rgba(0,0,0,0.24)_0px_3px_8px]">Confirm Order</Button>
                </div>
              </section>
            </div>

            {/* RIGHT SUMMARY */}
            <aside className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-fit">
              <h3 className="font-semibold text-slate-800 mb-5">Order Summary</h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="text-slate-800">${money(subtotal)}</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span>Discount</span>
                  <span className="text-slate-800">-${money(orderDiscount)}</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span>Paid Amount</span>
                  <span className="text-slate-800">${money(paidAmount)}</span>
                </div>

                <div className="my-3 h-px bg-slate-200" />

                <div className="flex items-center justify-between font-semibold text-slate-800">
                  <span>Total</span>
                  <span>${money(total)}</span>
                </div>

                <div className="flex items-center justify-between font-semibold">
                  <span className="text-slate-800">Remaining</span>
                  <span className="text-orange-500">${money(remaining)}</span>
                </div>
              </div>

              {/* Optional controls to match summary numbers */}
              <div className="mt-5 space-y-3">
                <div className="grid gap-2">
                  <Label className="text-xs text-slate-600">Order discount ($)</Label>
                  <Input
                    className="rounded-xl"
                    type="number"
                    min={0}
                    value={orderDiscount}
                    onChange={(e) => setOrderDiscount(clamp(Number(e.target.value || 0), 0, 999999999))}
                  />
                </div>

                <div className="grid gap-2">
                  <Label className="text-xs text-slate-600">Paid amount ($)</Label>
                  <Input
                    className="rounded-xl"
                    type="number"
                    min={0}
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(clamp(Number(e.target.value || 0), 0, 999999999))}
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl"
                  type="button"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>

                <Button
                  className="flex-1 rounded-xl bg-[#0b87b6] hover:bg-[#0a7aa5] text-white"
                  disabled={!canSave}
                  onClick={handleSave}
                  type="button"
                >
                  Save
                </Button>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewOrderDialog
