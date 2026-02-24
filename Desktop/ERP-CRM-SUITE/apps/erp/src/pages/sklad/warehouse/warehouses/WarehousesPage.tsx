import { useCallback, useEffect, useState } from "react"
import { toast } from "react-toastify"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { warehouseApi } from "../api/warehouseApi"
import type { LookupItem } from "../api/types"

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<LookupItem[]>([])
  const [locations, setLocations] = useState<LookupItem[]>([])
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [error, setError] = useState("")

  const [warehouseCreateOpen, setWarehouseCreateOpen] = useState(false)
  const [locationCreateOpen, setLocationCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newWarehouseName, setNewWarehouseName] = useState("")
  const [newWarehouseCode, setNewWarehouseCode] = useState("")
  const [newLocationName, setNewLocationName] = useState("")
  const [newLocationCode, setNewLocationCode] = useState("")

  const loadWarehouses = useCallback(async () => {
    try {
      setLoading(true)
      setError("")
      const list = await warehouseApi.listWarehouses()
      setWarehouses(list)
      if (!selectedWarehouseId && list[0]?.id) setSelectedWarehouseId(String(list[0].id))
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: unknown } }; message?: unknown }
      setError(String(err?.response?.data?.detail || err?.message || "Sklady yuklanmadi"))
      setWarehouses([])
    } finally {
      setLoading(false)
    }
  }, [selectedWarehouseId])

  const loadLocations = useCallback(async (warehouseId: string) => {
    try {
      setLocationLoading(true)
      setError("")
      const list = await warehouseApi.listWarehouseLocations(warehouseId ? Number(warehouseId) : undefined)
      setLocations(list)
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: unknown } }; message?: unknown }
      setLocations([])
      setError(String(err?.response?.data?.detail || err?.message || "Warehouse locationlar yuklanmadi"))
    } finally {
      setLocationLoading(false)
    }
  }, [])

  useEffect(() => {
    loadWarehouses()
  }, [loadWarehouses])

  useEffect(() => {
    if (!selectedWarehouseId) {
      setLocations([])
      return
    }
    loadLocations(selectedWarehouseId)
  }, [selectedWarehouseId, loadLocations])

  const createWarehouse = async () => {
    try {
      if (!newWarehouseName.trim()) return toast.error("Warehouse nomini kiriting")
      setCreating(true)
      await warehouseApi.createWarehouse({ name: newWarehouseName.trim(), code: newWarehouseCode.trim() || undefined })
      toast.success("Warehouse yaratildi")
      setWarehouseCreateOpen(false)
      setNewWarehouseName("")
      setNewWarehouseCode("")
      await loadWarehouses()
    } catch (e: unknown) {
      const err = e as { response?: { data?: unknown }; message?: unknown }
      const data = err?.response?.data
      const msg =
        typeof data === "string"
          ? data
          : (data as { detail?: unknown })?.detail || (data ? JSON.stringify(data) : err?.message || "Create warehouse xatolik")
      toast.error(String(msg))
    } finally {
      setCreating(false)
    }
  }

  const createLocation = async () => {
    try {
      if (!selectedWarehouseId) return toast.error("Avval warehouse tanlang")
      if (!newLocationName.trim()) return toast.error("Location nomini kiriting")
      setCreating(true)
      const warehouseNum = Number(selectedWarehouseId)
      await warehouseApi.createWarehouseLocation({
        warehouse: warehouseNum,
        warehouse_id: warehouseNum,
        name: newLocationName.trim(),
        code: newLocationCode.trim() || undefined,
      })
      toast.success("Location yaratildi")
      setLocationCreateOpen(false)
      setNewLocationName("")
      setNewLocationCode("")
      await loadLocations(selectedWarehouseId)
    } catch (e: unknown) {
      const err = e as { response?: { data?: unknown }; message?: unknown }
      const data = err?.response?.data
      const msg =
        typeof data === "string"
          ? data
          : (data as { detail?: unknown })?.detail || (data ? JSON.stringify(data) : err?.message || "Create location xatolik")
      toast.error(String(msg))
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold">Skladi</div>
        <div className="flex items-center gap-2">
          <Dialog open={warehouseCreateOpen} onOpenChange={setWarehouseCreateOpen}>
            <DialogTrigger asChild>
              <Button>Yangi sklad yaratish</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg h-auto">
              <DialogHeader>
                <DialogTitle>Yangi sklad yaratish</DialogTitle>
              </DialogHeader>
              <div className="grid gap-2">
                <Input placeholder="Warehouse name" value={newWarehouseName} onChange={(e) => setNewWarehouseName(e.target.value)} />
                <Input
                  placeholder="Warehouse code (ixtiyoriy)"
                  value={newWarehouseCode}
                  onChange={(e) => setNewWarehouseCode(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setWarehouseCreateOpen(false)}>Bekor qilish</Button>
                <Button onClick={createWarehouse} disabled={creating}>{creating ? "Yaratilmoqda..." : "Yaratish"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={locationCreateOpen} onOpenChange={setLocationCreateOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Yangi joylashuv</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg h-auto">
              <DialogHeader>
                <DialogTitle>Yangi sklad joylashuvi</DialogTitle>
              </DialogHeader>
              <div className="grid gap-2">
                <Input value={selectedWarehouseId} readOnly placeholder="Warehouse ID" />
                <Input placeholder="Location name" value={newLocationName} onChange={(e) => setNewLocationName(e.target.value)} />
                <Input
                  placeholder="Location code (ixtiyoriy)"
                  value={newLocationCode}
                  onChange={(e) => setNewLocationCode(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setLocationCreateOpen(false)}>Bekor qilish</Button>
                <Button onClick={createLocation} disabled={creating}>{creating ? "Yaratilmoqda..." : "Yaratish"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={loadWarehouses} disabled={loading}>
            {loading ? "Yuklanmoqda..." : "Yangilash"}
          </Button>
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        <select
          className="h-9 rounded-md border bg-transparent px-2 text-sm"
          value={selectedWarehouseId}
          onChange={(e) => setSelectedWarehouseId(e.target.value)}
          disabled={loading}
        >
          <option value="">Warehouse tanlang</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
      </div>

      {error ? <div className="text-sm text-rose-600">{error}</div> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-md border">
          <div className="border-b px-3 py-2 text-sm font-medium">Skladlar ro'yxati</div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nomi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {warehouses.map((w) => (
                <TableRow key={w.id} className={selectedWarehouseId === String(w.id) ? "bg-slate-50" : ""}>
                  <TableCell>{w.id}</TableCell>
                  <TableCell>{w.name}</TableCell>
                </TableRow>
              ))}
              {!loading && warehouses.length === 0 ? (
                <TableRow><TableCell colSpan={2} className="text-center text-sm text-muted-foreground">Omborlar topilmadi</TableCell></TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>

        <div className="rounded-md border">
          <div className="border-b px-3 py-2 text-sm font-medium">Sklad joylashuvlari</div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nomi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locations.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>{l.id}</TableCell>
                  <TableCell>{l.name}</TableCell>
                </TableRow>
              ))}
              {!locationLoading && locations.length === 0 ? (
                <TableRow><TableCell colSpan={2} className="text-center text-sm text-muted-foreground">Location topilmadi</TableCell></TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
