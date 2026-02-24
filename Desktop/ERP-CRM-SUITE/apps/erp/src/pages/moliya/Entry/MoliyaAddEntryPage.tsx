import { useState } from "react"
import { financeClient } from "../shared/financeClient"
import type { EntryType, PaymentMethod, Currency } from "../shared/demoStore"

export default function MoliyaAddEntryPage() {
  const [entryType, setEntryType] = useState<EntryType | "">("")
  const [category, setCategory] = useState("")
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState<Currency>("UZS")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("")
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [ok, setOk] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  async function save() {
    setErr(null)
    setOk(null)

    const a = Number(amount)
    if (!entryType) return setErr("Yozuv turini tanlang.")
    if (!category.trim()) return setErr("Kategoriya majburiy.")
    if (!Number.isFinite(a) || a <= 0) return setErr("Summa noto‘g‘ri.")
    if (!paymentMethod) return setErr("To‘lov usulini tanlang.")
    if (!date) return setErr("Sana majburiy.")

    setSaving(true)
    try {
      await financeClient.createEntry({
        date,
        entryType,
        category: category.trim(),
        amount: a,
        currency,
        paymentMethod,
        notes: notes.trim() || undefined,
      })
      setOk("Yozuv saqlandi.")
      setEntryType("")
      setCategory("")
      setAmount("")
      setPaymentMethod("")
      setNotes("")
    } catch (e: any) {
      const data = e?.response?.data
      const msg =
        typeof data === "string"
          ? data
          : data?.detail || (data ? JSON.stringify(data) : e?.message || "Saqlashda xatolik")
      setErr(String(msg))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm max-w-[620px] ml-62">
      <div className="text-lg font-extrabold text-slate-900">Yangi moliyaviy yozuv qo‘shish</div>
      <div className="mt-1 text-xs font-semibold text-slate-500">
      </div>

      {err && <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{err}</div>}
      {ok && <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{ok}</div>}

      <div className="mt-4 grid gap-3">
        <Field label="Yozuv turi">
          <select value={entryType} onChange={(e) => setEntryType(e.target.value as any)} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none">
            <option value="">Tanlang...</option>
            <option value="INCOME">Kirim</option>
            <option value="EXPENSE">Xarajat</option>
            <option value="ADJUSTMENT">Tuzatish</option>
          </select>
        </Field>

        <Field label="Kategoriya">
          <input value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none" />
        </Field>

        <Field label="Summa">
          <input value={amount} onChange={(e) => setAmount(e.target.value)} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none" />
        </Field>

        <Field label="Valyuta">
          <select value={currency} onChange={(e) => setCurrency(e.target.value as any)} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none">
            <option value="UZS">UZS</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="RUB">RUB</option>
          </select>
        </Field>

        <Field label="To‘lov usuli">
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as any)} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none">
            <option value="">Tanlang...</option>
            <option value="BANK">Bank o‘tkazma</option>
            <option value="CARD">Karta</option>
            <option value="CASH">Naqd</option>
          </select>
        </Field>

        <Field label="Sana">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none" />
        </Field>

        <Field label="Izoh (ixtiyoriy)">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" />
        </Field>

        <div className="flex justify-end">
          <button
            type="button"
            disabled={saving}
            onClick={save}
            className="h-10 rounded-xl bg-slate-900 px-5 text-sm font-extrabold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {saving ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-extrabold text-slate-600">{label}</div>
      <div className="mt-1">{children}</div>
    </div>
  )
}
