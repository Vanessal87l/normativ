import { useEffect, useMemo, useState } from "react"
import type { FetchParams, FetchResult, StockItem, StockStatus } from "../../api/types"
import { money } from "../../warehouse/shared/utils/money"
import { cx } from "../../warehouse/shared/utils/cx"

type ParamsBase = Omit<FetchParams, "page" | "pageSize" | "sortKey" | "sortDir">

type Props = {
  onFetch: (p: FetchParams) => Promise<FetchResult>
  onEditSave: (row: StockItem) => Promise<void> | void
  onDelete: (id: StockItem["id"]) => Promise<void> | void
  paramsBase: ParamsBase
  pageSize?: number
  refreshKey?: number // ✅ tashqaridan refresh signal
}

function statusBadge(s: StockStatus) {
  if (s === "LOW_STOCK") return "bg-orange-100 text-orange-700 border-orange-200"
  if (s === "OUT_OF_STOCK") return "bg-red-100 text-red-700 border-red-200"
  if (s === "DISCONTINUED") return "bg-slate-100 text-slate-700 border-slate-200"
  return "bg-emerald-100 text-emerald-700 border-emerald-200"
}

function statusLabel(s: StockStatus) {
  if (s === "LOW_STOCK") return "Kam qoldi"
  if (s === "OUT_OF_STOCK") return "Tugagan"
  if (s === "DISCONTINUED") return "To‘xtatilgan"
  return "Bor"
}

export default function StockTable({
  onFetch,
  onEditSave,
  onDelete,
  paramsBase,
  pageSize = 7,
  refreshKey = 0,
}: Props) {
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState<FetchParams["sortKey"]>("updatedAt")
  const [sortDir, setSortDir] = useState<FetchParams["sortDir"]>("desc")

  const [rows, setRows] = useState<StockItem[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  const [deleteId, setDeleteId] = useState<StockItem["id"] | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [editOpen, setEditOpen] = useState(false)
  const [editSaving, setEditSaving] = useState(false)
  const [editRow, setEditRow] = useState<StockItem | null>(null)

  const [fName, setFName] = useState("")
  const [fUnit, setFUnit] = useState("")
  const [fQty, setFQty] = useState(0)
  const [fCost, setFCost] = useState(0)
  const [fStatus, setFStatus] = useState<StockStatus>("IN_STOCK")

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setErr(null)

        const res = await onFetch({
          ...paramsBase,
          page,
          pageSize,
          sortKey,
          sortDir,
        })

        if (cancelled) return
        setRows(res.rows)
        setTotalCount(res.totalCount)
      } catch (e: any) {
        if (cancelled) return
        setErr(e?.message || "Qoldiqni yuklashda xatolik")
      } finally {
        if (cancelled) return
        setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [onFetch, paramsBase, page, pageSize, sortKey, sortDir, refreshKey])

  // filter o‘zgarsa 1-sahifa
  useEffect(() => {
    setPage(1)
  }, [
    paramsBase.q,
    paramsBase.status,
    paramsBase.category,
    paramsBase.lowOnly,
    paramsBase.dateRange.from,
    paramsBase.dateRange.to,
    paramsBase.type,
  ])

  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / pageSize)), [totalCount, pageSize])

  function toggleSort(k: FetchParams["sortKey"]) {
    if (sortKey !== k) {
      setSortKey(k)
      setSortDir("asc")
      return
    }
    setSortDir((d) => (d === "asc" ? "desc" : "asc"))
  }

  function openEdit(r: StockItem) {
    setErr(null)
    setEditRow(r)
    setFName(r.name)
    setFUnit(r.unit)
    setFQty(r.qtyOnHand)
    setFCost(r.lastUnitCost)
    setFStatus(r.status)
    setEditOpen(true)
  }

  async function saveEdit() {
    if (!editRow) return
    if (!fName.trim()) return setErr("Nom bo‘sh bo‘lmasin")
    if (!Number.isFinite(fQty) || fQty < 0) return setErr("Qoldiq noto‘g‘ri")
    if (!Number.isFinite(fCost) || fCost < 0) return setErr("Narx noto‘g‘ri")

    const updated: StockItem = {
      ...editRow,
      name: fName.trim(),
      unit: fUnit.trim() || editRow.unit,
      qtyOnHand: Number(fQty),
      lastUnitCost: Number(fCost),
      totalValue: Number(fQty) * Number(fCost),
      status: fStatus,
    }

    try {
      setEditSaving(true)
      setErr(null)
      await onEditSave(updated)
      setEditOpen(false)
      // Table server/mode bo‘lsa parent refreshKey bilan refresh qiladi.
      // Demo/mode bo‘lsa ham fetch qayta chaqiriladi (refreshKey parentdan keladi)
    } catch (e: any) {
      setErr(e?.message || "Saqlashda xatolik")
    } finally {
      setEditSaving(false)
    }
  }

  async function confirmDelete() {
    if (deleteId == null) return
    try {
      setDeleting(true)
      setErr(null)
      await onDelete(deleteId)
      setDeleteId(null)
    } catch (e: any) {
      setErr(e?.message || "O‘chirishda xatolik")
      setDeleteId(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 flex items-center justify-between">
        <div>
          <div className="text-sm font-extrabold text-slate-900">Ombor qoldig‘i</div>
          <div className="text-xs text-slate-500">Tahrirlash / O‘chirish + sahifalash + saralash</div>
        </div>
        <div className="text-xs text-slate-500">
          Jami: <b className="text-slate-900">{totalCount}</b> ta
        </div>
      </div>

      {err && (
        <div className="mx-4 mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {err}
        </div>
      )}

      <div className="px-4 pb-4 overflow-x-auto">
        <table className="min-w-[980px] w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2 font-extrabold">
                <button type="button" onClick={() => toggleSort("name")} className="hover:text-slate-900">
                  Nomi {sortKey === "name" ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                </button>
              </th>
              <th className="px-3 py-2 font-extrabold">Birlik</th>
              <th className="px-3 py-2 font-extrabold">
                <button type="button" onClick={() => toggleSort("qtyOnHand")} className="hover:text-slate-900">
                  Qoldiq {sortKey === "qtyOnHand" ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                </button>
              </th>
              <th className="px-3 py-2 font-extrabold">Oxirgi narx</th>
              <th className="px-3 py-2 font-extrabold">
                <button type="button" onClick={() => toggleSort("totalValue")} className="hover:text-slate-900">
                  Jami qiymat {sortKey === "totalValue" ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                </button>
              </th>
              <th className="px-3 py-2 font-extrabold">Holat</th>
              <th className="px-3 py-2 font-extrabold">
                <button type="button" onClick={() => toggleSort("updatedAt")} className="hover:text-slate-900">
                  Yangilangan {sortKey === "updatedAt" ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                </button>
              </th>
              <th className="px-3 py-2 font-extrabold text-right">Amallar</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-slate-500">
                  Yuklanmoqda...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-slate-500">
                  Ma’lumot yo‘q
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={String(r.id)} className="hover:bg-slate-50">
                  <td className="px-3 py-2 font-extrabold text-slate-900">{r.name}</td>
                  <td className="px-3 py-2 text-slate-700">{r.unit}</td>
                  <td className="px-3 py-2 text-slate-700">{r.qtyOnHand}</td>
                  <td className="px-3 py-2 text-slate-700">{money(r.lastUnitCost)}</td>
                  <td className="px-3 py-2 text-slate-900 font-bold">{money(r.totalValue)}</td>
                  <td className="px-3 py-2">
                    <span
                      className={cx(
                        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-extrabold",
                        statusBadge(r.status)
                      )}
                    >
                      {statusLabel(r.status)}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-slate-500">{r.updatedAt}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(r)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-extrabold text-slate-800 hover:bg-slate-50"
                      >
                        ✏️ Tahrirlash
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(r.id)}
                        className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-[11px] font-extrabold text-red-700 hover:bg-red-100"
                      >
                        🗑 O‘chirish
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="mt-3 flex items-center justify-end gap-2 text-xs">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-extrabold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            ◀ Oldingi
          </button>

          <div className="text-slate-600">
            Sahifa: <b className="text-slate-900">{page}</b> / {totalPages}
          </div>

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-extrabold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Keyingi ▶
          </button>
        </div>
      </div>

      {/* delete modal */}
      {deleteId != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-5 shadow-xl">
            <div className="text-sm font-extrabold text-slate-900">O‘chirishni tasdiqlaysizmi?</div>
            <div className="mt-2 text-xs text-slate-500">Bu amal qaytarib bo‘lmaydi.</div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                disabled={deleting}
                onClick={() => setDeleteId(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Bekor qilish
              </button>
              <button
                disabled={deleting}
                onClick={confirmDelete}
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-extrabold text-red-700 hover:bg-red-100 disabled:opacity-50"
              >
                {deleting ? "O‘chirilmoqda..." : "O‘chirish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* edit modal */}
      {editOpen && editRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-extrabold text-slate-900">Tahrirlash</div>
                <div className="text-xs text-slate-500">ID: {String(editRow.id)}</div>
              </div>
              <button
                disabled={editSaving}
                onClick={() => setEditOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              <label className="grid gap-1">
                <span className="text-xs font-extrabold text-slate-700">Nomi</span>
                <input
                  value={fName}
                  onChange={(e) => setFName(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="grid gap-1">
                  <span className="text-xs font-extrabold text-slate-700">Birlik</span>
                  <input
                    value={fUnit}
                    onChange={(e) => setFUnit(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-xs font-extrabold text-slate-700">Holat</span>
                  <select
                    value={fStatus}
                    onChange={(e) => setFStatus(e.target.value as StockStatus)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                  >
                    <option value="IN_STOCK">Bor</option>
                    <option value="LOW_STOCK">Kam qoldi</option>
                    <option value="OUT_OF_STOCK">Tugagan</option>
                    <option value="DISCONTINUED">To‘xtatilgan</option>
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="grid gap-1">
                  <span className="text-xs font-extrabold text-slate-700">Qoldiq</span>
                  <input
                    type="number"
                    value={String(fQty)}
                    onChange={(e) => setFQty(Number(e.target.value))}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-xs font-extrabold text-slate-700">Oxirgi narx</span>
                  <input
                    type="number"
                    value={String(fCost)}
                    onChange={(e) => setFCost(Number(e.target.value))}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                  />
                </label>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                disabled={editSaving}
                onClick={() => setEditOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Bekor qilish
              </button>
              <button
                disabled={editSaving}
                onClick={saveEdit}
                className="rounded-xl bg-slate-900 text-white px-4 py-2 text-xs font-extrabold hover:opacity-95 disabled:opacity-50"
              >
                {editSaving ? "Saqlanmoqda..." : "Saqlash"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
