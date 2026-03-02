import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"

import { Eye } from "lucide-react"
import TableActionIconButton from "@/components/common/TableActionIconButton"

import type { PaymentStatus, PurchaseListItem, PurchaseStatus } from "../types"


function fmtMoney(amount: number) {
  return new Intl.NumberFormat("ru-RU").format(amount || 0)
}

function statusPillClass(s: PurchaseStatus) {
  if (s === "CONFIRMED") return "bg-emerald-50 text-emerald-700 border-emerald-200"
  if (s === "CANCELLED") return "bg-rose-50 text-rose-700 border-rose-200"
  return "bg-slate-50 text-slate-700 border-slate-200"
}

function paymentPillClass(s: PaymentStatus) {
  if (s === "PAID") return "bg-emerald-50 text-emerald-700 border-emerald-200"
  if (s === "PARTIAL") return "bg-amber-50 text-amber-700 border-amber-200"
  return "bg-slate-50 text-slate-700 border-slate-200"
}

export default function PurchasesTable({
  rows,
  loading,
  total,
  page,
  pageSize,
  onPageChange,
}: {
  rows: PurchaseListItem[]
  loading: boolean
  total: number
  page: number
  pageSize: number
  onPageChange: (p: number) => void
}) {
  const nav = useNavigate()
  const pages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:text-left [&>th]:font-medium">
              <th>No</th>
              <th>Supplier</th>
              <th>Received</th>
              <th>Produced</th>
              <th>Location</th>
              <th className="text-right">Subtotal</th>
              <th className="text-right">Total</th>
              <th className="text-right">Paid</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Deleted</th>
              <th className="text-right">Amallar</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={12} className="px-4 py-8 text-center text-slate-500">
                  Yuklanmoqda...
                </td>
              </tr>
            )}

            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={12} className="px-4 py-10 text-center text-slate-500">
                  Hech narsa topilmadi
                </td>
              </tr>
            )}

            {!loading &&
              rows.map((r) => (
                <tr
                  key={r.id}
                  className="hover:bg-slate-50 cursor-pointer"
                  onClick={() => nav(`/dashboard/purchases/${r.id}`)}
                >
                  <td className="px-4 py-3 text-blue-600 font-semibold">{r.purchase_no}</td>
                  <td className="px-4 py-3 text-slate-900 font-medium">{r.supplier_name ?? `#${r.supplier ?? "-"}`}</td>
                  <td className="px-4 py-3">{r.received_date ?? "-"}</td>
                  <td className="px-4 py-3">{r.produced_date ?? "-"}</td>
                  <td className="px-4 py-3">{r.location_name ?? `#${r.location ?? "-"}`}</td>
                  <td className="px-4 py-3 text-right">{fmtMoney(r.subtotal)}</td>
                  <td className="px-4 py-3 text-right font-semibold">{fmtMoney(r.total)}</td>
                  <td className="px-4 py-3 text-right text-emerald-700 font-semibold">{fmtMoney(r.paid_amount)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={[
                        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
                        paymentPillClass(r.payment_status),
                      ].join(" ")}
                    >
                      {r.payment_status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={[
                        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
                        statusPillClass(r.status),
                      ].join(" ")}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{r.deleted_at ? "Deleted" : "-"}</td>
                  <td className="px-4 py-3 text-right">

                    <div className="flex justify-end gap-2">
                      <TableActionIconButton
                        title="Ochish"
                        onClick={(e) => {
                          e.stopPropagation()
                          nav(`/dashboard/purchases/${r.id}`)
                        }}
                        className="cursor-pointer"
                      >
                        <Eye size={16} />
                      </TableActionIconButton>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="cursor-pointer rounded-xl"
                      onClick={(e) => {
                        e.stopPropagation()
                        nav(`/dashboard/purchases/${r.id}`)
                      }}
                    >
                      Ochish
                    </Button>

                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-white">
        <div className="text-xs text-slate-500">
          Jami: <span className="font-medium text-slate-700">{total}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer rounded-xl"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Oldingi
          </Button>

          <div className="text-xs text-slate-600">
            {page} / {pages}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer rounded-xl"
            disabled={page >= pages}
            onClick={() => onPageChange(page + 1)}
          >
            Keyingi
          </Button>
        </div>
      </div>
    </div>
  )
}
