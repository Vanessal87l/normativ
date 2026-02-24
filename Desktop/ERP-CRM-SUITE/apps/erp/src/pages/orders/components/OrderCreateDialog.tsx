import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  createKontragent,
  createOrder,
  fetchKontragents,
  fetchWarehouses,
  type Kontragent,
  type Warehouse,
} from "@/pages/orders/api/ordersApi"
import { useDebouncedValue } from "@/pages/orders/api/useDebouncedValue"
import OrderItemsCalcTable from "@/pages/orders/components/OrderItemsCalcTable"
import type { UiOrderItem } from "./OrderItemsTable"
import { toast } from "react-toastify"
import { warehouseEvents } from "@/pages/sklad/warehouse/api/events"

function todayISO() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16)
}

function safeNumber(n: any) {
  const x = Number(n)
  return Number.isFinite(x) ? x : 0
}

export default function OrderCreateDialog(props: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Master data
  const [clients, setClients] = useState<Kontragent[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])

  // Form state
  const [clientSearch, setClientSearch] = useState("")
  const debouncedClientSearch = useDebouncedValue(clientSearch, 250)

  const [clientId, setClientId] = useState<number | null>(null)
  const [warehouseId, setWarehouseId] = useState<number | null>(null)

  const [orderDate, setOrderDate] = useState(todayISO())
  const [deliveryDate, setDeliveryDate] = useState(todayISO())
  const [currency, setCurrency] = useState("UZS")
  const [discountTotal, setDiscountTotal] = useState<number>(0)
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [courierName, setCourierName] = useState("")

  const [items, setItems] = useState<UiOrderItem[]>([])
  const [itemsCalc, setItemsCalc] = useState<any[]>([])

  // Inline client create
  const [showCreateClient, setShowCreateClient] = useState(false)
  const [newClient, setNewClient] = useState({ name: "", phone: "", email: "", inn: "" })
  const [creatingClient, setCreatingClient] = useState(false)

  // Dialog ochilganda client/warehouse master datani yuklaydi.
  useEffect(() => {
    if (!open) return
    let cancelled = false

    async function load() {
      try {
        const [c, w] = await Promise.all([
          fetchKontragents(),
          fetchWarehouses().catch(() => [] as Warehouse[]),
        ])
        if (cancelled) return

        setClients(c)
        setWarehouses(w)

        setItems((prev) =>
          prev.length
            ? prev
            : [
                {
                  key: uid(),
                  item_type: "PRODUCT",
                  qty: "1",
                  unit_price: 0,
                  line_total: 0,
                  stock_qty: null,
                },
              ]
        )
      } catch (e) {
        console.error(e)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [open])

  const filteredClients = useMemo(() => {
    const q = debouncedClientSearch.trim().toLowerCase()
    if (!q) return clients
    return clients.filter((x) => {
      return (
        x.name?.toLowerCase().includes(q) ||
        x.code?.toLowerCase().includes(q) ||
        (x.phone ?? "").toLowerCase().includes(q) ||
        (x.inn ?? "").toLowerCase().includes(q)
      )
    })
  }, [clients, debouncedClientSearch])

  const totals = useMemo(() => {
    const sub = items.reduce((s, it) => s + safeNumber(it.line_total), 0)
    const disc = safeNumber(discountTotal)
    const total = Math.max(0, sub - disc)
    return { sub, disc, total }
  }, [items, discountTotal])

  const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

  const submit = async () => {
    // Zakaz yaratish: form + itemlarni backend payloadga map qilib yuboradi.
    try {
      if (!clientId) return alert("Client tanlang")
      if (!warehouseId) return alert("Warehouse tanlang")

      if (!itemsCalc || itemsCalc.length === 0) return alert("Kamida 1 ta item qo'shing")

      const bad = itemsCalc.find((x: any) => !x.product_id || Number(x.qty) <= 0)
      if (bad) return alert("Itemlarda product va qty to'g'ri bo'lsin")

      setLoading(true)

      const mappedItems = itemsCalc
        .filter((x: any) => x.product_id)
        .map((x: any) => {
          const unitCost = Number(x.unit_cost || 0)
          const qty = Number(x.qty || 0)
          const ndsPercent = Number(x.nds_percent || 0)

          const brutto = unitCost * qty
          const nds = brutto * (ndsPercent / 100)
          const total = brutto + nds

          return {
            item_type: "PRODUCT" as const,
            product: x.product_id,
            qty: String(qty),
            unit_price: unitCost,
            nds_rate: round2(ndsPercent),
            nds_included: false,
            line_total: round2(total),
          }
        })

      // Create payload: tanlangan warehouse backendga yuboriladi.
      const payload = {
        client: clientId,
        warehouse: warehouseId,
        order_date: orderDate,
        currency,
        discount_total: safeNumber(discountTotal),
        delivery_address: deliveryAddress || undefined,
        courier_name: courierName || undefined,
        delivery_date: deliveryDate || null,
        items: mappedItems,
      }

      await createOrder(payload as any)
      warehouseEvents.emit()
      toast.success("Zakaz muvaffaqiyatli saqlandi")

      setOpen(false)
      setClientId(null)
      setWarehouseId(null)
      setOrderDate(todayISO())
      setDeliveryDate(todayISO())
      setCurrency("UZS")
      setDiscountTotal(0)
      setDeliveryAddress("")
      setCourierName("")
      setItems([])
      setItemsCalc([])
      props.onSuccess?.()
    } catch (e: any) {
      console.error("ORDER CREATE ERROR:", e)
      const status = e?.response?.status
      const data = e?.response?.data
      const msg =
        data && typeof data === "object"
          ? JSON.stringify(data, null, 2)
          : String(data || e?.message || e)

      toast.error(`Order create error (${status ?? "no-status"})`)
      alert(`Order create error (${status ?? "no-status"})\n\n${msg}`)
    } finally {
      setLoading(false)
    }
  }

  const createClientInline = async () => {
    // Dialog ichidan tezkor yangi client yaratish helperi.
    try {
      if (!newClient.name.trim()) {
        alert("Client name kiriting")
        return
      }
      setCreatingClient(true)
      const created = await createKontragent({
        name: newClient.name.trim(),
        phone: newClient.phone || undefined,
        email: newClient.email || undefined,
        inn: newClient.inn || undefined,
        kind: "CLIENT",
      })
      setClients((prev) => [created, ...prev])
      setClientId(created.id)
      setShowCreateClient(false)
      setNewClient({ name: "", phone: "", email: "", inn: "" })
    } catch (e) {
      console.error(e)
      alert("Client create error. Endpointni tekshiring.")
    } finally {
      setCreatingClient(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-b from-[#0D3B78] to-[#0A4D96] text-white">+ Yangi Order</Button>
      </DialogTrigger>

      <DialogContent className="">
        <DialogHeader>
          <DialogTitle>Yangi Sales Order</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="text-sm font-medium">Client</div>
            <div className="flex gap-2">
              <Input
                placeholder="Search client (name/code/phone/inn)..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
              />
              <Button type="button" variant="outline" onClick={() => setShowCreateClient((v) => !v)}>
                + Client
              </Button>
            </div>
            <select
              className="h-10 w-full rounded-md border bg-transparent px-2 text-sm"
              value={clientId ?? ""}
              onChange={(e) => setClientId(Number(e.target.value) || null)}
            >
              <option value="">Client tanlang...</option>
              {filteredClients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>

            {showCreateClient ? (
              <div className="rounded-md border p-3 space-y-2">
                <div className="text-sm font-medium">Yangi client</div>
                <Input
                  placeholder="Name"
                  value={newClient.name}
                  onChange={(e) => setNewClient((p) => ({ ...p, name: e.target.value }))}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Phone"
                    value={newClient.phone}
                    onChange={(e) => setNewClient((p) => ({ ...p, phone: e.target.value }))}
                  />
                  <Input
                    placeholder="INN"
                    value={newClient.inn}
                    onChange={(e) => setNewClient((p) => ({ ...p, inn: e.target.value }))}
                  />
                </div>
                <Input
                  placeholder="Email"
                  value={newClient.email}
                  onChange={(e) => setNewClient((p) => ({ ...p, email: e.target.value }))}
                />
                <div className="flex gap-2">
                  <Button type="button" onClick={createClientInline} disabled={creatingClient}>
                    {creatingClient ? "Saqlanmoqda..." : "Saqlash"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowCreateClient(false)}>
                    Yopish
                  </Button>
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Warehouse</div>
            <select
              className="h-10 w-full rounded-md border bg-transparent px-2 text-sm"
              value={warehouseId ?? ""}
              onChange={(e) => setWarehouseId(Number(e.target.value) || null)}
            >
              <option value="">Warehouse tanlang...</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Order date</div>
                <Input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} />
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Delivery date</div>
                <Input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Currency</div>
                <select
                  className="h-10 w-full rounded-md border bg-transparent px-2 text-sm"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="UZS">UZS</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Discount total</div>
                <Input
                  value={String(discountTotal)}
                  onChange={(e) => setDiscountTotal(Number(e.target.value || 0))}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-2 md:grid-cols-2">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Delivery address</div>
            <Input
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Manzil..."
            />
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Courier name</div>
            <Input value={courierName} onChange={(e) => setCourierName(e.target.value)} placeholder="Kuryer..." />
          </div>
        </div>

        <OrderItemsCalcTable warehouseId={warehouseId} onItemsChange={setItemsCalc} />

        <div className="flex items-center justify-end gap-6 text-sm">
          <div>
            <div className="text-muted-foreground">Subtotal</div>
            <div className="font-medium">{totals.sub}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Discount</div>
            <div className="font-medium">{totals.disc}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Total</div>
            <div className="text-base font-semibold">{totals.total}</div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Bekor qilish
          </Button>
          <Button onClick={submit} disabled={loading}>
            {loading ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
