import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type PurchasesFiltersValue = {
  date_from: string
  date_to: string
  status: "ALL" | "DRAFT" | "APPROVED" | "RECEIVED" | "CANCELLED"
  organization_id: string
  kontragent_id: string
  warehouse_id: string
  currency: "ALL" | "UZS" | "USD" | "RUB"
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
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-900">Xaridlarni filtrlash</div>
          <div className="text-xs text-slate-500 mt-1">Parametrlarni tanlang va ro‘yxatni toraytiring</div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-3">
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
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="APPROVED">Tasdiq</SelectItem>
              <SelectItem value="RECEIVED">Qabul qilingan</SelectItem>
              <SelectItem value="CANCELLED">Bekor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-3">
          <label className="text-xs text-slate-500">Valyuta</label>
          <Select
            value={value.currency}
            onValueChange={(v) => onChange({ ...value, currency: v as PurchasesFiltersValue["currency"] })}
          >
            <SelectTrigger className="mt-1 rounded-xl">
              <SelectValue placeholder="Barchasi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Barchasi</SelectItem>
              <SelectItem value="UZS">UZS</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="RUB">RUB</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-6">
          <label className="text-xs text-slate-500">Qidiruv</label>
          <Input
            className="mt-1 rounded-xl"
            placeholder="Raqam yoki komment..."
            value={value.search}
            onChange={(e) => onChange({ ...value, search: e.target.value })}
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs text-slate-500">Kontragent ID</label>
          <Input
            className="mt-1 rounded-xl"
            placeholder="12"
            value={value.kontragent_id}
            onChange={(e) => onChange({ ...value, kontragent_id: e.target.value })}
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs text-slate-500">Ombor ID</label>
          <Input
            className="mt-1 rounded-xl"
            placeholder="3"
            value={value.warehouse_id}
            onChange={(e) => onChange({ ...value, warehouse_id: e.target.value })}
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs text-slate-500">Tashkilot ID</label>
          <Input
            className="mt-1 rounded-xl"
            placeholder="1"
            value={value.organization_id}
            onChange={(e) => onChange({ ...value, organization_id: e.target.value })}
          />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-end gap-2">
        <Button variant="secondary" className="cursor-pointer rounded-xl" onClick={onReset}>
          Filtrlarni tozalash
        </Button>
        <Button className="cursor-pointer rounded-xl" onClick={() => {}}>
          Filtrlarni qo‘llash
        </Button>
      </div>
    </div>
  )
}
