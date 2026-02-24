// src/pages/purchases/components/PurchaseItemsTable.tsx
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import type { PurchaseDetail, PurchaseItem } from "../types"

function fmtMoney(amount: number) {
  return new Intl.NumberFormat("ru-RU").format(amount || 0)
}

export default function PurchaseItemsTable({
  items,
  loading,
  currency,
  vatEnabled,
  priceIncludesVat,
  onChangeFlags,
  onAddDemoItem,
}: {
  items: PurchaseItem[]
  loading: boolean
  currency?: string
  vatEnabled: boolean
  priceIncludesVat: boolean
  onChangeFlags: (payload: Partial<PurchaseDetail>) => void
  onAddDemoItem?: () => void
}) {
  const total = items.reduce((s, it) => s + (it.line_total || 0), 0)

  return (
    <div className="overflow-hidden">
      <div className="p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-900">Pozitsiyalar</div>
          <div className="text-xs text-slate-500 mt-1">
            Raqamlar avtomatik hisoblanadi · Valyuta: <span className="font-medium">{currency || "—"}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
            <Checkbox checked={vatEnabled} onCheckedChange={(v) => onChangeFlags({ vat_enabled: !!v })} />
            <span>NDS</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
            <Checkbox
              checked={priceIncludesVat}
              onCheckedChange={(v) => onChangeFlags({ price_includes_vat: !!v })}
            />
            <span>Narx NDS bilan</span>
          </label>

          <Badge variant="outline" className="rounded-xl">{currency || "—"}</Badge>

          {onAddDemoItem && (
            <Button variant="outline" className="cursor-pointer rounded-xl" onClick={onAddDemoItem}>
              + Pozitsiya qo‘shish (demo)
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto border-t border-slate-100">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:text-left [&>th]:font-medium">
              <th>#</th>
              <th>Nomi</th>
              <th className="text-right">Miqdor</th>
              <th>UOM</th>
              <th className="text-right">Narx</th>
              <th className="text-right">NDS</th>
              <th className="text-right">Chegirma</th>
              <th className="text-right">Summa</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                  Yuklanmoqda...
                </td>
              </tr>
            )}

            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                  Pozitsiya yo‘q
                </td>
              </tr>
            )}

            {!loading &&
              items.map((it, idx) => (
                <tr key={it.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-500">{idx + 1}</td>
                  <td className="px-4 py-3 text-slate-900 font-medium">{it.name}</td>
                  <td className="px-4 py-3 text-right">{it.qty}</td>
                  <td className="px-4 py-3">{it.uom}</td>
                  <td className="px-4 py-3 text-right">{fmtMoney(it.price)}</td>
                  <td className="px-4 py-3 text-right">{it.vat_rate}%</td>
                  <td className="px-4 py-3 text-right">{it.discount_percent}%</td>
                  <td className="px-4 py-3 text-right font-semibold">{fmtMoney(it.line_total)}</td>
                </tr>
              ))}
          </tbody>

          <tfoot>
            <tr className="border-t border-slate-200">
              <td colSpan={7} className="px-4 py-3 text-right text-slate-600 font-medium">
                Umumiy summa
              </td>
              <td className="px-4 py-3 text-right text-slate-900 font-semibold">
                {fmtMoney(total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
