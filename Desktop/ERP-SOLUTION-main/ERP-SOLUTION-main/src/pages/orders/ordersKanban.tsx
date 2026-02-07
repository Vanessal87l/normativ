import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Funnel, Plus, Search } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { MoreHorizontalIcon } from "lucide-react"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { createOrder, fetchOrders, type Filters, type OrderRow } from "@/Api/orders"
import { Link, useNavigate } from "react-router-dom"

const emptyFiltersUI = {
  id: "",
  clientName: "",
  productName: "",
  unit: "",
  qtyMin: "",
  qtyMax: "",
  ndsMin: "",
  ndsMax: "",
  totalMin: "",
  totalMax: "",
}

const toNum = (v: string) => {
  const n = Number(String(v).replace(/[^\d.-]/g, ""))
  return Number.isFinite(n) ? n : undefined
}

const fmt = (n: number) => n.toLocaleString("ru-RU")

const OrdersKanban = () => {
  const [rows, setRows] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(false)

  // Search
  const [search, setSearch] = useState("")

  // Filter modal
  const [filterOpen, setFilterOpen] = useState(false)
  const [filtersUI, setFiltersUI] = useState(emptyFiltersUI)     // applied (UI)
  const [draftUI, setDraftUI] = useState(emptyFiltersUI)         // draft (UI)

  // New order modal
  const [newOpen, setNewOpen] = useState(false)
  const [newOrder, setNewOrder] = useState({
    clientName: "",
    productName: "",
    unit: "kg",
    qty: "",
    nds: "12",
    total: "",
  })

  const hasAnyFilter = useMemo(() => {
    return Object.values(filtersUI).some((v) => String(v).trim().length > 0)
  }, [filtersUI])

  // ✅ UI filters -> backend filters (numbers)
  const apiFilters: Filters = useMemo(() => {
    return {
      id: filtersUI.id || undefined,
      clientName: filtersUI.clientName || undefined,
      productName: filtersUI.productName || undefined,
      unit: filtersUI.unit || undefined,
      qtyMin: toNum(filtersUI.qtyMin),
      qtyMax: toNum(filtersUI.qtyMax),
      ndsMin: toNum(filtersUI.ndsMin),
      ndsMax: toNum(filtersUI.ndsMax),
      totalMin: toNum(filtersUI.totalMin),
      totalMax: toNum(filtersUI.totalMax),
    }
  }, [filtersUI])

  // ✅ Debounced fetch (search/filter o‘zgarsa API ga boradi)
  useEffect(() => {
    let alive = true
    const t = setTimeout(async () => {
      try {
        setLoading(true)
        const data = await fetchOrders({
          search: search.trim() || undefined,
          filters: apiFilters,
        })
        if (alive) setRows(data)
      } catch (e) {
        console.error(e)
      } finally {
        if (alive) setLoading(false)
      }
    }, 350)

    return () => {
      alive = false
      clearTimeout(t)
    }
  }, [search, apiFilters])

  const openFilter = () => {
    setDraftUI(filtersUI)
    setFilterOpen(true)
  }

  const applyFilters = () => {
    setFiltersUI(draftUI)
    setFilterOpen(false)
  }

  const resetFilters = () => {
    setDraftUI(emptyFiltersUI)
    setFiltersUI(emptyFiltersUI)
  }

  const submitNewOrder = async () => {
    const qty = toNum(newOrder.qty)
    const nds = toNum(newOrder.nds)
    const total = toNum(newOrder.total)

    if (!newOrder.clientName.trim()) return alert("Client Name kiriting")
    if (!newOrder.productName.trim()) return alert("Product Name kiriting")
    if (!qty || qty <= 0) return alert("Quantity to‘g‘ri kiriting")
    if (nds === undefined || nds < 0) return alert("NDS to‘g‘ri kiriting")
    if (total === undefined || total < 0) return alert("Total to‘g‘ri kiriting")

    try {
      setLoading(true)
      await createOrder({
        clientName: newOrder.clientName.trim(),
        productName: newOrder.productName.trim(),
        unit: newOrder.unit.trim() || "kg",
        qty,
        nds,
        total,
      })

      setNewOpen(false)
      setNewOrder({ clientName: "", productName: "", unit: "kg", qty: "", nds: "12", total: "" })

      // ✅ qayta yuklash
      const data = await fetchOrders({
        search: search.trim() || undefined,
        filters: apiFilters,
      })
      setRows(data)
    } catch (e) {
      console.error(e)
      alert("Order qo‘shishda xatolik bo‘ldi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold pb-5 pl-5">Orders Table</h1>

      {/* TOP BAR */}
      <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center px-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* SEARCH */}
          <div className="relative w-full max-w-[320px]">
            <Input
              className="border rounded-xl pl-10 w-full h-[36px] bg-white/70 backdrop-blur-xl border-gray-300 shadow-[rgba(0,0,0,0.24)_0px_3px_8px]"
              type="search"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          </div>

          {/* FILTER */}
          <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
            <DialogTrigger asChild>
              <div className="flex items-center border h-[36px] rounded-xl justify-center bg-white/70 backdrop-blur-xl border-gray-300 shadow-[rgba(0,0,0,0.24)_0px_3px_8px] px-3">
                <Funnel className="w-4 h-4 text-gray-500 mr-2" />
                <Button variant="ghost" className="h-[30px] px-2" onClick={openFilter}>
                  Filter {hasAnyFilter ? "•" : ""}
                </Button>
              </div>
            </DialogTrigger>

            <DialogContent className="bg-white max-w-[720px]">
              <DialogHeader>
                <DialogTitle>Filter Orders</DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <Input placeholder="ID" value={draftUI.id} onChange={(e) => setDraftUI((p) => ({ ...p, id: e.target.value }))} />
                <Input placeholder="Client Name" value={draftUI.clientName} onChange={(e) => setDraftUI((p) => ({ ...p, clientName: e.target.value }))} />
                <Input placeholder="Product Name" value={draftUI.productName} onChange={(e) => setDraftUI((p) => ({ ...p, productName: e.target.value }))} />
                <Input placeholder="Unit (kg/pcs)" value={draftUI.unit} onChange={(e) => setDraftUI((p) => ({ ...p, unit: e.target.value }))} />

                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Qty min" value={draftUI.qtyMin} onChange={(e) => setDraftUI((p) => ({ ...p, qtyMin: e.target.value }))} />
                  <Input placeholder="Qty max" value={draftUI.qtyMax} onChange={(e) => setDraftUI((p) => ({ ...p, qtyMax: e.target.value }))} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="NDS min" value={draftUI.ndsMin} onChange={(e) => setDraftUI((p) => ({ ...p, ndsMin: e.target.value }))} />
                  <Input placeholder="NDS max" value={draftUI.ndsMax} onChange={(e) => setDraftUI((p) => ({ ...p, ndsMax: e.target.value }))} />
                </div>

                <div className="grid grid-cols-2 gap-3 md:col-span-2">
                  <Input placeholder="Total min" value={draftUI.totalMin} onChange={(e) => setDraftUI((p) => ({ ...p, totalMin: e.target.value }))} />
                  <Input placeholder="Total max" value={draftUI.totalMax} onChange={(e) => setDraftUI((p) => ({ ...p, totalMax: e.target.value }))} />
                </div>
              </div>

              <DialogFooter className="mt-4 gap-2">
                <Button variant="outline" onClick={resetFilters}>Reset</Button>
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
                <Button onClick={applyFilters}>Apply</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* NEW ORDER */}

        <Link to="/sotuv/New_order" className="flex items-center cursor-pointer border h-[36px] rounded-xl justify-center bg-white/70 backdrop-blur-xl border-gray-300 shadow-[rgba(0,0,0,0.24)_0px_3px_8px] px-3">
          <Plus className="w-4 h-4 text-gray-500 mr-2" />
          <Button variant="ghost" className="h-[30px] cursor-pointer px-2">
            New Order
          </Button>
        </Link>
      </div>

      {/* TABLE */}
      <div className="px-4 mt-4">
        <div className="text-sm text-gray-500 pb-2">
          {loading ? "Loading..." : `${rows.length} ta buyurtma topildi`}
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">ID</TableHead>
              <TableHead className="text-center">Client Name</TableHead>
              <TableHead className="text-center">Product Name</TableHead>
              <TableHead className="text-center">Units of Mass</TableHead>
              <TableHead className="text-center">Quantity</TableHead>
              <TableHead className="text-center">Nds</TableHead>
              <TableHead className="text-center">Total Prices</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {rows.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-sm text-gray-500 py-8">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              filteredRowsFallback(filteredRowsFromState(rows, search, filtersUI)).map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium text-center">{r.id}</TableCell>
                  <TableCell className="text-center">{r.clientName}</TableCell>
                  <TableCell className="text-center">{r.productName}</TableCell>
                  <TableCell className="text-center">{r.unit}</TableCell>
                  <TableCell className="text-center">{r.qty}</TableCell>
                  <TableCell className="text-center">{r.nds}%</TableCell>
                  <TableCell className="text-center">{fmt(r.total)}</TableCell>

                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontalIcon />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>View</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
                        <DropdownMenuItem>Download</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

/**
 * ⚠️ Agar backend search/filterni to‘liq qila olsa — pastdagi helperlar kerak emas.
 * Lekin ba’zan backend hali tayyor bo‘lmaydi, shunda UI fallback sifatida ishlaydi.
 */
function filteredRowsFromState(rows: OrderRow[], search: string, filtersUI: any) {
  const q = search.trim().toLowerCase()

  return rows.filter((r) => {
    const matchesSearch =
      !q ||
      r.id.toLowerCase().includes(q) ||
      r.clientName.toLowerCase().includes(q) ||
      r.productName.toLowerCase().includes(q)

    if (!matchesSearch) return false

    if (filtersUI.id && !r.id.toLowerCase().includes(filtersUI.id.toLowerCase())) return false
    if (filtersUI.clientName && !r.clientName.toLowerCase().includes(filtersUI.clientName.toLowerCase())) return false
    if (filtersUI.productName && !r.productName.toLowerCase().includes(filtersUI.productName.toLowerCase())) return false
    if (filtersUI.unit && !r.unit.toLowerCase().includes(filtersUI.unit.toLowerCase())) return false

    const qtyMin = toNum(filtersUI.qtyMin)
    const qtyMax = toNum(filtersUI.qtyMax)
    if (qtyMin !== undefined && r.qty < qtyMin) return false
    if (qtyMax !== undefined && r.qty > qtyMax) return false

    const ndsMin = toNum(filtersUI.ndsMin)
    const ndsMax = toNum(filtersUI.ndsMax)
    if (ndsMin !== undefined && r.nds < ndsMin) return false
    if (ndsMax !== undefined && r.nds > ndsMax) return false

    const totalMin = toNum(filtersUI.totalMin)
    const totalMax = toNum(filtersUI.totalMax)
    if (totalMin !== undefined && r.total < totalMin) return false
    if (totalMax !== undefined && r.total > totalMax) return false

    return true
  })
}

function filteredRowsFallback(x: OrderRow[]) {
  return x
}

export default OrdersKanban
