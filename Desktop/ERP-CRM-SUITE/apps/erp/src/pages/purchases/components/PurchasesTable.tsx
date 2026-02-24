// src/pages/purchases/components/PurchasesTable.tsx
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import type { PurchaseListItem, PurchaseStatus } from "../types"

function fmtMoney(amount: number) {
  return new Intl.NumberFormat("ru-RU").format(amount || 0)
}

function statusLabel(s: PurchaseStatus) {
  switch (s) {
    case "DRAFT":
      return "Draft"
    case "APPROVED":
      return "Tasdiq"
    case "RECEIVED":
      return "Qabul"
    case "CANCELLED":
      return "Bekor"
  }
}

// ✅ 2-rasmdagi (Moliya table) uslubiga yaqin pill ranglar
function statusPillClass(s: PurchaseStatus) {
  switch (s) {
    case "RECEIVED":
      // Kirim - yashil
      return "bg-emerald-50 text-emerald-700 border-emerald-200"
    case "APPROVED":
      // Karta/ko'k - ko'k/binafsha
      return "bg-indigo-50 text-indigo-700 border-indigo-200"
    case "CANCELLED":
      // Xarajat - qizil
      return "bg-rose-50 text-rose-700 border-rose-200"
    case "DRAFT":
    default:
      // neytral
      return "bg-slate-50 text-slate-700 border-slate-200"
  }
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
              <th>№</th>
              <th>Vaqt</th>
              <th>Kontragent</th>
              <th>Tashkilot</th>
              <th className="text-right">Summa</th>
              <th>Valyuta</th>
              <th className="text-right">Hisob</th>
              <th className="text-right">To‘langan</th>
              <th className="text-right">Qabul</th>
              <th className="text-right">Rezerv</th>
              <th>Status</th>
              <th>Komment</th>
              <th className="text-right">Amallar</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={13} className="px-4 py-8 text-center text-slate-500">
                  Yuklanmoqda...
                </td>
              </tr>
            )}

            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={13} className="px-4 py-10 text-center text-slate-500">
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
                  <td className="px-4 py-3 text-blue-600 font-semibold">{r.number}</td>

                  <td className="px-4 py-3 text-slate-700">
                    {new Date(r.created_at).toLocaleString("ru-RU")}
                  </td>

                  <td className="px-4 py-3 text-slate-900 font-medium">{r.kontragent_name}</td>
                  <td className="px-4 py-3 text-slate-700">{r.organization_name}</td>

                  {/* ✅ SUMMA - ajratib ko‘rsatish */}
                  <td className="px-4 py-3 text-right">
                    <span className="font-semibold text-slate-900">
                      {fmtMoney(r.total_amount)}
                    </span>
                  </td>

                  <td className="px-4 py-3">{r.currency}</td>

                  <td className="px-4 py-3 text-right text-slate-700">
                    {fmtMoney(r.invoiced_amount)}
                  </td>

                  {/* ✅ To'langan - yashil */}
                  <td className="px-4 py-3 text-right">
                    <span className="font-semibold text-emerald-700">
                      {fmtMoney(r.paid_amount)}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right text-slate-700">
                    {fmtMoney(r.received_amount)}
                  </td>

                  <td className="px-4 py-3 text-right text-slate-700">
                    {fmtMoney(r.reserved_amount)}
                  </td>

                  {/* ✅ STATUS - pill */}
                  <td className="px-4 py-3">
                    <span
                      className={[
                        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
                        statusPillClass(r.status),
                      ].join(" ")}
                    >
                      {statusLabel(r.status)}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-slate-600 max-w-[220px] truncate">
                    {r.comment || "—"}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
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
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* ✅ Pagination */}
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
