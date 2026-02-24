// src/pages/purchases/components/PurchaseHeader.tsx
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Printer, Save, X } from "lucide-react"
import type { PurchaseStatus } from "../types"

function statusLabel(s?: PurchaseStatus) {
  if (!s) return "—"
  switch (s) {
    case "DRAFT":
      return "Qoralama"
    case "APPROVED":
      return "Tasdiq"
    case "RECEIVED":
      return "Qabul"
    case "CANCELLED":
      return "Bekor"
  }
}

function statusVariant(s?: PurchaseStatus): any {
  if (s === "RECEIVED") return "default"
  if (s === "APPROVED") return "secondary"
  if (s === "CANCELLED") return "destructive"
  return "outline"
}

export default function PurchaseHeader({
  title,
  loading,
  status,
  isPosted,
  isReserved,
  updatedAt,
  onClose,
  onSave,
  onPrint,
  onChangeStatus,
  onTogglePosted,
  onToggleReserved,
}: {
  title: string
  loading: boolean
  status?: PurchaseStatus
  isPosted: boolean
  isReserved: boolean
  updatedAt?: string
  onClose: () => void
  onSave: () => void
  onPrint: () => void
  onChangeStatus: (s: PurchaseStatus) => void
  onTogglePosted: (v: boolean) => void
  onToggleReserved: (v: boolean) => void
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
            <Badge variant={statusVariant(status)}>{statusLabel(status)}</Badge>
            {loading && <span className="text-xs text-slate-500">Yuklanmoqda...</span>}
          </div>

          {updatedAt && (
            <div className="text-xs text-slate-500 mt-1">
              Oxirgi o‘zgarish: {new Date(updatedAt).toLocaleString("ru-RU")}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button className="cursor-pointer rounded-2xl" onClick={onSave}>
            <Save className="h-4 w-4 mr-2" />
            Saqlash
          </Button>

          <Button variant="outline" className="cursor-pointer rounded-2xl" onClick={onPrint}>
            <Printer className="h-4 w-4 mr-2" />
            Chop etish
          </Button>

          <Button variant="secondary" className="cursor-pointer rounded-2xl" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Yopish
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6 text-sm text-slate-700">
        <div className="w-full md:w-[260px]">
          <label className="text-xs text-slate-500">Status</label>
          <Select value={status || "DRAFT"} onValueChange={(v) => onChangeStatus(v as PurchaseStatus)}>
            <SelectTrigger className="mt-1 rounded-xl">
              <SelectValue placeholder="Status tanlang" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Qoralama</SelectItem>
              <SelectItem value="APPROVED">Tasdiq</SelectItem>
              <SelectItem value="RECEIVED">Qabul</SelectItem>
              <SelectItem value="CANCELLED">Bekor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <Checkbox checked={isPosted} onCheckedChange={(v) => onTogglePosted(!!v)} />
          <span>O‘tkazildi</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <Checkbox checked={isReserved} onCheckedChange={(v) => onToggleReserved(!!v)} />
          <span>Rezerv</span>
        </label>
      </div>

      <div className="h-px bg-slate-200" />
    </div>
  )
}
