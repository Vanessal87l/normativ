import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type PurchasesFiltersValue = {
  supplier: string
  date_from: string
  date_to: string
  status: "ALL" | "DRAFT" | "CONFIRMED" | "CANCELLED"
  payment_status: "ALL" | "UNPAID" | "PARTIAL" | "PAID"
  search: string
}

export default function PurchasesFilters({
  value,
  onChange,
  onReset,
}: {
  value: PurchasesFiltersValue
  onChange: (v: PurchasesFiltersValue) => void
  onReset: () => void
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-sm font-semibold text-slate-900">Xaridlarni filtrlash</div>

      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-12">
        <div className="md:col-span-3">
          <label className="text-xs text-slate-500">Supplier ID</label>
          <Input
            className="mt-1 rounded-xl"
            placeholder="12"
            value={value.supplier}
            onChange={(e) => onChange({ ...value, supplier: e.target.value })}
          />
        </div>

        <div className="md:col-span-3">
          <label className="text-xs text-slate-500">Boshlanish sana</label>
          <Input
            className="mt-1 rounded-xl"
            type="date"
            value={value.date_from}
            onChange={(e) => onChange({ ...value, date_from: e.target.value })}
          />
        </div>

        <div className="md:col-span-3">
          <label className="text-xs text-slate-500">Tugash sana</label>
          <Input
            className="mt-1 rounded-xl"
            type="date"
            value={value.date_to}
            onChange={(e) => onChange({ ...value, date_to: e.target.value })}
          />
        </div>

        <div className="md:col-span-3">
          <label className="text-xs text-slate-500">Status</label>
          <Select
            value={value.status}
            onValueChange={(v) => onChange({ ...value, status: v as PurchasesFiltersValue["status"] })}
          >
            <SelectTrigger className="mt-1 rounded-xl">
              <SelectValue placeholder="Barchasi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Barchasi</SelectItem>
              <SelectItem value="DRAFT">DRAFT</SelectItem>
              <SelectItem value="CONFIRMED">CONFIRMED</SelectItem>
              <SelectItem value="CANCELLED">CANCELLED</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-3">
          <label className="text-xs text-slate-500">To'lov holati</label>
          <Select
            value={value.payment_status}
            onValueChange={(v) =>
              onChange({ ...value, payment_status: v as PurchasesFiltersValue["payment_status"] })
            }
          >
            <SelectTrigger className="mt-1 rounded-xl">
              <SelectValue placeholder="Barchasi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Barchasi</SelectItem>
              <SelectItem value="UNPAID">UNPAID</SelectItem>
              <SelectItem value="PARTIAL">PARTIAL</SelectItem>
              <SelectItem value="PAID">PAID</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-9">
          <label className="text-xs text-slate-500">Qidiruv</label>
          <Input
            className="mt-1 rounded-xl"
            placeholder="purchase_no yoki supplier..."
            value={value.search}
            onChange={(e) => onChange({ ...value, search: e.target.value })}
          />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-end gap-2">
        <Button variant="secondary" className="cursor-pointer rounded-xl" onClick={onReset}>
          Filtrlarni tozalash
        </Button>
      </div>
    </div>
  )
}
