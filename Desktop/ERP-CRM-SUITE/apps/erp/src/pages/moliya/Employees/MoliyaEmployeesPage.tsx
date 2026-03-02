import { useEffect, useState } from "react"
import { financeClient } from "../shared/financeClient"
import type { Employee, Currency } from "../shared/demoStore"
import { Eye } from "lucide-react"
import TableActionIconButton from "@/components/common/TableActionIconButton"

export default function MoliyaEmployeesPage() {
  const [rows, setRows] = useState<Employee[]>([])
  const [ui, setUi] = useState<"loading" | "ready" | "error">("loading")
  const [err, setErr] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  async function load() {
    try {
      setUi("loading")
      setErr(null)
      const res = await financeClient.listEmployees()
      setRows(res)
      setUi("ready")
    } catch (e: any) {
      setUi("error")
      setErr(e?.message || "Xodimlarni yuklashda xatolik")
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-4 md:p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-lg font-extrabold text-slate-900">Xodimlar ro‘yxati</div>
          <div className="text-xs font-semibold text-slate-500">Oylik (base salary) ma’lumotlari</div>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="h-10 rounded-xl bg-slate-900 px-4 text-sm font-extrabold text-white hover:bg-slate-800"
        >
          + Xodim qo‘shish
        </button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
        {ui === "loading" && <div className="p-4 text-sm text-slate-600">Yuklanmoqda...</div>}
        {ui === "error" && <div className="p-4 text-sm text-rose-700">{err}</div>}

        {ui === "ready" && (
          <table className="min-w-[900px] w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-extrabold">F.I.Sh</th>
                <th className="px-4 py-3 font-extrabold">Lavozim</th>
                <th className="px-4 py-3 font-extrabold">Telefon</th>
                <th className="px-4 py-3 font-extrabold">Bazaviy oylik</th>
                <th className="px-4 py-3 font-extrabold text-right">Amallar</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 text-slate-900">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                    Hozircha xodim yo‘q.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-extrabold text-slate-900">{r.fullName}</td>
                    <td className="px-4 py-3 text-slate-700 font-semibold">{r.role}</td>
                    <td className="px-4 py-3 text-slate-600">{r.phone ?? "—"}</td>
                    <td className="px-4 py-3 font-extrabold">
                      {r.baseSalary.toLocaleString("uz-UZ")} {r.currency}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center justify-end">
                        <TableActionIconButton title="Ko'rish">
                          <Eye size={16} />
                        </TableActionIconButton>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {open && (
        <AddEmployeeModal
          onClose={() => setOpen(false)}
          onSaved={async () => {
            setOpen(false)
            await load()
          }}
        />
      )}
    </div>
  )
}

/** ✅ KICHIK MODAL (Ledger dagidek razmer) */
function AddEmployeeModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [fullName, setFullName] = useState("")
  const [role, setRole] = useState("")
  const [phone, setPhone] = useState("")
  const [baseSalary, setBaseSalary] = useState("")
  const [currency, setCurrency] = useState<Currency>("UZS")
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function save() {
    setErr(null)
    const s = Number(baseSalary)

    if (!fullName.trim()) return setErr("F.I.Sh majburiy.")
    if (!role.trim()) return setErr("Lavozim majburiy.")
    if (!Number.isFinite(s) || s <= 0) return setErr("Oylik noto‘g‘ri.")

    setSaving(true)
    try {
      await financeClient.createEmployee({
        fullName: fullName.trim(),
        role: role.trim(),
        phone: phone.trim() || undefined,
        baseSalary: s,
        currency,
      })
      await onSaved()
    } catch (e: any) {
      setErr(e?.message || "Saqlashda xatolik")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-[440px] rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-200 flex items-start justify-between">
          <div>
            <div className="text-sm font-extrabold text-slate-900">Xodim qo‘shish</div>
            <div className="mt-0.5 text-[11px] font-semibold text-slate-500">Oylik ma’lumotlari</div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            aria-label="Yopish"
            title="Yopish"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-3">
          {err && (
            <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 p-2 text-xs font-bold text-rose-700">
              {err}
            </div>
          )}

          <div className="grid grid-cols-1 gap-3">
            <FieldSmall label="F.I.Sh">
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs outline-none"
                placeholder="Masalan: Akmal Karimov"
              />
            </FieldSmall>

            <FieldSmall label="Lavozim">
              <input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs outline-none"
                placeholder="Masalan: Hisobchi"
              />
            </FieldSmall>

            <FieldSmall label="Telefon (ixtiyoriy)">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs outline-none"
                placeholder="+998 90 123 45 67"
              />
            </FieldSmall>

            <div className="grid grid-cols-2 gap-3">
              <FieldSmall label="Bazaviy oylik">
                <input
                  value={baseSalary}
                  onChange={(e) => setBaseSalary(e.target.value)}
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs outline-none"
                  placeholder="3500000"
                  inputMode="numeric"
                />
              </FieldSmall>

              <FieldSmall label="Valyuta">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as any)}
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs outline-none"
                >
                  <option value="UZS">UZS</option>
                  <option value="USD">USD</option>
                  <option value="RUB">RUB</option>
                </select>
              </FieldSmall>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-extrabold text-slate-700 hover:bg-slate-50"
          >
            Bekor qilish
          </button>

          <button
            disabled={saving}
            onClick={save}
            className="h-9 rounded-lg bg-slate-900 px-3 text-xs font-extrabold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {saving ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </div>
      </div>
    </div>
  )
}

function FieldSmall({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-extrabold text-slate-600">{label}</div>
      <div className="mt-1">{children}</div>
    </div>
  )
}
