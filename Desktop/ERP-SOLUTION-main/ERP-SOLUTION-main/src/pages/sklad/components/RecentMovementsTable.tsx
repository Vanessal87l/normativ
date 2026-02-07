import { useEffect, useMemo, useState } from "react";
import type { MovementRow, MovementsQuery, Paginated } from "../sklad-api/types";

type SortKey = NonNullable<MovementsQuery["sortKey"]>;
type SortDir = NonNullable<MovementsQuery["sortDir"]>;

type Props = {
  title?: string;
  subtitle?: string;

  onFetch: (params: MovementsQuery) => Promise<Paginated<MovementRow>>;
  onEditSave?: (row: MovementRow) => Promise<void> | any;
  onDelete?: (id: MovementRow["id"]) => Promise<void> | void;

  pageSize?: number;
};

function cx(...a: Array<string | false | undefined | null>) {
  return a.filter(Boolean).join(" ");
}

export default function RecentMovementsTable({
  title = "So‘nggi ombor harakatlari",
  subtitle = "Kirim / Chiqim / Ko‘chirish / Adjust ro‘yxati",
  onFetch,
  onEditSave,
  onDelete,
  pageSize: pageSizeProp = 5,
}: Props) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(pageSizeProp);

  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const [rows, setRows] = useState<MovementRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState<MovementRow | null>(null);
  const [fQty, setFQty] = useState<number>(0);

  const [deleteId, setDeleteId] = useState<MovementRow["id"] | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErr(null);

    onFetch({
      page,
      pageSize,
      q,
      sortKey,
      sortDir,
    })
      .then((res) => {
        if (cancelled) return;
        setRows(res.rows);
        setTotalCount(res.totalCount);
      })
      .catch((e) => {
        if (cancelled) return;
        setErr(e?.message || "Serverdan ma’lumot olishda xatolik");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [onFetch, page, pageSize, q, sortKey, sortDir, refreshKey]);

  useEffect(() => {
    setPage(1);
  }, [q, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
      return;
    }
    setSortDir((d) => (d === "asc" ? "desc" : "asc"));
  }

  function openEdit(r: MovementRow) {
    setEditRow(r);
    setFQty(r.qty);
    setEditOpen(true);
  }
  function closeEdit() {
    setEditOpen(false);
    setEditRow(null);
  }

  async function saveEdit() {
    if (!editRow) return;
    try {
      setErr(null);
      await onEditSave?.({ ...editRow, qty: Number(fQty) });
      setRefreshKey((k) => k + 1);
      closeEdit();
    } catch (e: any) {
      setErr(e?.message || "Saqlashda xatolik");
    }
  }

  async function confirmDelete() {
    if (deleteId == null) return;
    try {
      setErr(null);
      await onDelete?.(deleteId);
      setRefreshKey((k) => k + 1);
      setDeleteId(null);
    } catch (e: any) {
      setErr(e?.message || "O‘chirishda xatolik");
      setDeleteId(null);
    }
  }

  const badge = (t: MovementRow["type"]) => {
    if (t === "KIRIM") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (t === "CHIQIM") return "bg-red-50 text-red-700 border-red-200";
    if (t === "KOCHIRISH") return "bg-sky-50 text-sky-700 border-sky-200";
    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* header */}
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm font-extrabold text-slate-900">{title}</div>
          <div className="text-xs text-slate-500">{subtitle}</div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
            <span className="text-slate-400">🔎</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Qidirish: mahsulot/ombor..."
              className="w-56 bg-transparent text-xs text-slate-700 placeholder:text-slate-400 outline-none"
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
            Sahifa: <span className="font-bold text-slate-900">{page}</span> / {totalPages}
          </div>
        </div>
      </div>

      <div className="p-4">
        {err && (
          <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
            {err}
          </div>
        )}

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-[980px] w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-bold">
                  <button onClick={() => toggleSort("product")} className="hover:text-slate-900">
                    Mahsulot {sortKey === "product" ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                  </button>
                </th>
                <th className="px-4 py-3 font-bold">
                  <button onClick={() => toggleSort("type")} className="hover:text-slate-900">
                    Turi {sortKey === "type" ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                  </button>
                </th>
                <th className="px-4 py-3 font-bold">
                  <button onClick={() => toggleSort("qty")} className="hover:text-slate-900">
                    Miqdor {sortKey === "qty" ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                  </button>
                </th>
                <th className="px-4 py-3 font-bold">
                  <button onClick={() => toggleSort("warehouse")} className="hover:text-slate-900">
                    Ombor {sortKey === "warehouse" ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                  </button>
                </th>
                <th className="px-4 py-3 font-bold text-right">
                  <button onClick={() => toggleSort("date")} className="hover:text-slate-900">
                    Sana {sortKey === "date" ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                  </button>
                </th>
                <th className="px-4 py-3 font-bold text-right">Amallar</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 text-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                    Hozircha ma’lumot yo‘q.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={String(r.id)} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{r.product}</td>

                    <td className="px-4 py-3">
                      <span className={cx("inline-flex items-center rounded-full border px-2.5 py-1 font-bold", badge(r.type))}>
                        {r.type}
                      </span>
                    </td>

                    <td className="px-4 py-3">{r.qty}</td>
                    <td className="px-4 py-3 text-slate-600">{r.warehouse}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{r.date}</td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(r)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          ✏️ Tahrirlash
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteId(r.id)}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 font-semibold text-red-700 hover:bg-red-100"
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
        </div>

        {/* pagination */}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <div className="text-xs text-slate-500">
            Jami: <span className="font-bold text-slate-900">{totalCount}</span> ta yozuv
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className={cx(
                "rounded-xl px-3 py-2 text-xs font-bold transition",
                "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                "disabled:opacity-50"
              )}
            >
              ◀ Oldingi
            </button>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className={cx(
                "rounded-xl px-3 py-2 text-xs font-bold transition",
                "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                "disabled:opacity-50"
              )}
            >
              Keyingi ▶
            </button>
          </div>
        </div>
      </div>

      {/* delete modal */}
      {deleteId != null && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <div className="text-sm font-extrabold text-slate-900">O‘chirishni tasdiqlaysizmi?</div>
            <div className="mt-2 text-xs text-slate-600">
              Bu amal qaytarib bo‘lmaydi. Haqiqatan ham o‘chirmoqchimisiz?
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-100"
              >
                O‘chirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* edit modal */}
      {editOpen && editRow && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <div className="text-sm font-extrabold text-slate-900">Miqdorni tahrirlash</div>

            <div className="mt-3 grid gap-1">
              <span className="text-xs font-bold text-slate-600">Miqdor</span>
              <input
                type="number"
                value={String(fQty)}
                onChange={(e) => setFQty(Number(e.target.value))}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none"
                min={0}
                step={1}
              />
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeEdit}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={saveEdit}
                className="rounded-xl border border-slate-900 bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:opacity-95"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
