import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import type { PurchasePayment } from "../types"

function fmtMoney(amount: number) {
  return new Intl.NumberFormat("ru-RU").format(amount || 0)
}

type FormState = {
  method: string
  amount: string
  occurred_on: string
  note: string
}

export default function PurchasePaymentsPanel({
  payments,
  paymentMethods,
  onPay,
  paying,
}: {
  payments: PurchasePayment[]
  paymentMethods: string[]
  onPay: (payload: { method: string; amount: number; occurred_on?: string; note?: string }) => void
  paying: boolean
}) {
  const [form, setForm] = useState<FormState>({
    method: paymentMethods[0] || "CASH",
    amount: "",
    occurred_on: new Date().toISOString().slice(0, 10),
    note: "",
  })

  const total = useMemo(() => payments.reduce((s, p) => s + (p.amount || 0), 0), [payments])

  return (
    <div className="p-4">
      <div className="text-sm font-semibold text-slate-900">To'lovlar</div>

      <div className="mt-3 grid grid-cols-1 gap-2 rounded-xl border border-slate-200 p-3 md:grid-cols-5">
        <select
          className="h-9 rounded-md border bg-transparent px-2 text-sm"
          value={form.method}
          onChange={(e) => setForm((p) => ({ ...p, method: e.target.value }))}
        >
          {(paymentMethods.length ? paymentMethods : ["CASH", "CARD", "BANK_TRANSFER"]).map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <input
          className="h-9 rounded-md border px-2 text-sm"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
        />
        <input
          className="h-9 rounded-md border px-2 text-sm"
          type="date"
          value={form.occurred_on}
          onChange={(e) => setForm((p) => ({ ...p, occurred_on: e.target.value }))}
        />
        <input
          className="h-9 rounded-md border px-2 text-sm"
          placeholder="Note"
          value={form.note}
          onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
        />
        <Button
          className="rounded-xl"
          disabled={paying}
          onClick={() => {
            const amount = Number(form.amount)
            if (!Number.isFinite(amount) || amount <= 0) return
            onPay({
              method: form.method,
              amount,
              occurred_on: form.occurred_on || undefined,
              note: form.note.trim() || undefined,
            })
            setForm((p) => ({ ...p, amount: "", note: "" }))
          }}
        >
          {paying ? "Yuborilmoqda..." : "To'lov qo'shish"}
        </Button>
      </div>

      <div className="mt-4 overflow-x-auto border border-slate-100 rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:text-left [&>th]:font-medium">
              <th>ID</th>
              <th>Method</th>
              <th className="text-right">Amount</th>
              <th>Currency</th>
              <th>Paid at</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  To'lovlar yo'q
                </td>
              </tr>
            )}
            {payments.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3">{p.id}</td>
                <td className="px-4 py-3">{p.method}</td>
                <td className="px-4 py-3 text-right">{fmtMoney(p.amount)}</td>
                <td className="px-4 py-3">{p.currency}</td>
                <td className="px-4 py-3">{p.paid_at ? new Date(p.paid_at).toLocaleString("ru-RU") : "-"}</td>
                <td className="px-4 py-3">{p.note || "-"}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-200">
              <td colSpan={2} className="px-4 py-3 text-right text-slate-600 font-medium">
                Jami to'lov
              </td>
              <td className="px-4 py-3 text-right text-slate-900 font-semibold">{fmtMoney(total)}</td>
              <td colSpan={3} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
