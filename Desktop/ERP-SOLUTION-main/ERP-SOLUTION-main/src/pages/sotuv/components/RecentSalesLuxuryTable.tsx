import { useEffect, useMemo, useState } from "react";

export type RecentSaleRow = {
  id: string | number;
  name: string; // Ism/Nomi
  soni: number; // Miqdor
  narxi: number; // Narx (1 dona)
  data: string; // YYYY-MM-DD
};

type SortKey = "name" | "soni" | "narxi" | "data";
type SortDir = "asc" | "desc";

type FetchParams = {
  page: number;
  pageSize: number;
  q: string;
  sortKey: SortKey;
  sortDir: SortDir;
};

type FetchResult = {
  rows: RecentSaleRow[];
  totalCount: number;
};

type Props = {
  title?: string;
  subtitle?: string;

  // ✅ Local mode (backend yo‘q bo‘lsa)
  rows?: RecentSaleRow[];

  // ✅ Server mode (backend bo‘lsa)
  onFetch?: (params: FetchParams) => Promise<FetchResult>;

  // ✅ Actionlar
  onEditSave?: (row: RecentSaleRow) => Promise<void> | any;
  onDelete?: (id: RecentSaleRow["id"]) => Promise<void> | void;

  pageSize?: number;
};

function money(n: number) {
  return `$${Number.isFinite(n) ? n.toFixed(2) : "0.00"}`;
}

function cx(...a: Array<string | false | undefined | null>) {
  return a.filter(Boolean).join(" ");
}

function isValidDateYYYYMMDD(s: string) {
  // minimal check: YYYY-MM-DD
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export default function RecentSalesLuxuryTable({
  title = "So‘nggi sotuvlar",
  subtitle = "Oxirgi kiritilgan sotuvlar ro‘yxati",
  rows,
  onFetch,
  onEditSave,
  onDelete,
  pageSize: pageSizeProp = 5,
}: Props) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(pageSizeProp);

  const [sortKey, setSortKey] = useState<SortKey>("data");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const isServerMode = typeof onFetch === "function";

  // ✅ Local state (edit/delete local ishlashi uchun)
  const [localRows, setLocalRows] = useState<RecentSaleRow[]>(rows ?? []);
  useEffect(() => {
    // parent rows o‘zgarsa localRows sync bo‘lsin
    setLocalRows(rows ?? []);
  }, [rows]);

  // ✅ Server state
  const [serverRows, setServerRows] = useState<RecentSaleRow[]>([]);
  const [totalCount, setTotalCount] = useState<number>((rows ?? []).length);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // ✅ refresh trigger (server mode’da delete/editdan keyin qayta fetch)
  const [refreshKey, setRefreshKey] = useState(0);

  // ✅ Delete modal
  const [deleteId, setDeleteId] = useState<RecentSaleRow["id"] | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ✅ Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editRow, setEditRow] = useState<RecentSaleRow | null>(null);

  // Edit form state
  const [fName, setFName] = useState("");
  const [fSoni, setFSoni] = useState<number>(0);
  const [fNarxi, setFNarxi] = useState<number>(0);
  const [fData, setFData] = useState("");

  // ✅ SERVER FETCH
  useEffect(() => {
    if (!isServerMode) {
      // local mode count
      setTotalCount(localRows.length);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setErr(null);

    onFetch!({
      page,
      pageSize,
      q,
      sortKey,
      sortDir,
    })
      .then((res) => {
        if (cancelled) return;
        setServerRows(res.rows);
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
  }, [isServerMode, onFetch, page, pageSize, q, sortKey, sortDir, refreshKey, localRows.length]);

  // ✅ LOCAL MODE filter + sort
  const localFilteredSorted = useMemo(() => {
    const src = localRows ?? [];
    const qq = q.trim().toLowerCase();

    const filtered = !qq ? src : src.filter((r) => r.name.toLowerCase().includes(qq));

    const sorted = [...filtered].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "name") return a.name.localeCompare(b.name) * dir;
      if (sortKey === "soni") return (a.soni - b.soni) * dir;
      if (sortKey === "narxi") return (a.narxi - b.narxi) * dir;
      return a.data.localeCompare(b.data) * dir;
    });

    return sorted;
  }, [localRows, q, sortKey, sortDir]);

  const localTotalCount = localFilteredSorted.length;
  const localTotalPages = Math.max(1, Math.ceil(localTotalCount / pageSize));

  useEffect(() => {
    // q yoki sort o‘zgarsa 1-page
    setPage(1);
  }, [q, sortKey, sortDir]);

  useEffect(() => {
    // local mode bounds
    if (!isServerMode) {
      if (page > localTotalPages) setPage(localTotalPages);
      if (page < 1) setPage(1);
      setTotalCount(localTotalCount);
    }
  }, [isServerMode, page, localTotalPages, localTotalCount]);

  const pageRows = useMemo(() => {
    if (isServerMode) return serverRows;
    const start = (page - 1) * pageSize;
    return localFilteredSorted.slice(start, start + pageSize);
  }, [isServerMode, serverRows, localFilteredSorted, page, pageSize]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalCount / pageSize));
  }, [totalCount, pageSize]);

  const totalAmount = useMemo(() => {
    // Local mode: hamma localRows bo‘yicha total
    // Server mode: faqat current page bo‘yicha (backend totalSum beradigan bo‘lsa keyin ulaymiz)
    const src = isServerMode ? pageRows : localRows;
    return (src ?? []).reduce((acc, r) => acc + r.narxi * r.soni, 0);
  }, [isServerMode, pageRows, localRows]);

  function toggleSort(key: SortKey) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
      return;
    }
    setSortDir((d) => (d === "asc" ? "desc" : "asc"));
  }

  function openEdit(row: RecentSaleRow) {
    setErr(null);
    setEditRow(row);
    setFName(row.name);
    setFSoni(row.soni);
    setFNarxi(row.narxi);
    setFData(row.data);
    setEditOpen(true);
  }

  function closeEdit() {
    setEditOpen(false);
    setEditRow(null);
  }

  async function handleEditSave() {
    if (!editRow) return;

    // ✅ validation
    if (!fName.trim()) {
      setErr("Ism/Nomi bo‘sh bo‘lishi mumkin emas.");
      return;
    }
    if (!Number.isFinite(fSoni) || fSoni <= 0) {
      setErr("Soni 0 dan katta bo‘lishi kerak.");
      return;
    }
    if (!Number.isFinite(fNarxi) || fNarxi < 0) {
      setErr("Narxi 0 dan kichik bo‘lishi mumkin emas.");
      return;
    }
    if (!isValidDateYYYYMMDD(fData)) {
      setErr("Sana formati noto‘g‘ri. Masalan: 2025-10-10");
      return;
    }

    const updated: RecentSaleRow = {
      id: editRow.id,
      name: fName.trim(),
      soni: Number(fSoni),
      narxi: Number(fNarxi),
      data: fData,
    };

    try {
      setEditSaving(true);
      setErr(null);

      // ✅ backend bo‘lsa shu ishlaydi
      await onEditSave?.(updated);

      if (!isServerMode) {
        // ✅ local mode: localRows ichidan update
        setLocalRows((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      } else {
        // ✅ server mode: refresh
        setRefreshKey((k) => k + 1);
      }

      closeEdit();
    } catch (e: any) {
      setErr(e?.message || "Saqlashda xatolik");
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDeleteConfirmed() {
    if (deleteId == null) return;

    try {
      setDeleting(true);
      setErr(null);

      await onDelete?.(deleteId);

      if (!isServerMode) {
        // ✅ local mode: listdan olib tashlaymiz
        setLocalRows((prev) => prev.filter((x) => x.id !== deleteId));
      } else {
        // ✅ server mode: refresh
        setRefreshKey((k) => k + 1);
      }

      setDeleteId(null);
    } catch (e: any) {
      setErr(e?.message || "O‘chirishda xatolik");
      setDeleteId(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* header */}
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm font-extrabold text-slate-900">{title}</div>
          <div className="text-xs text-slate-500">{subtitle}</div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {/* search */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
            <span className="text-slate-400">🔎</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Qidirish: ism/nomi..."
              className="w-56 bg-transparent text-xs text-slate-700 placeholder:text-slate-400 outline-none"
            />
          </div>

          {/* page info */}
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
            Sahifa: <span className="font-bold text-slate-900">{page}</span> / {totalPages}
          </div>
        </div>
      </div>

      {/* content */}
      <div className="p-4">
        {/* error */}
        {err && (
          <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
            {err}
          </div>
        )}

        {/* table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-[920px] w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-bold">
                  <button
                    type="button"
                    onClick={() => toggleSort("name")}
                    className="inline-flex items-center gap-2 hover:text-slate-900"
                  >
                    Ism / Nomi
                    <span className="text-[10px] text-slate-400">
                      {sortKey === "name" ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </button>
                </th>

                <th className="px-4 py-3 font-bold">
                  <button
                    type="button"
                    onClick={() => toggleSort("soni")}
                    className="inline-flex items-center gap-2 hover:text-slate-900"
                  >
                    Soni
                    <span className="text-[10px] text-slate-400">
                      {sortKey === "soni" ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </button>
                </th>

                <th className="px-4 py-3 font-bold">
                  <button
                    type="button"
                    onClick={() => toggleSort("narxi")}
                    className="inline-flex items-center gap-2 hover:text-slate-900"
                  >
                    Narxi
                    <span className="text-[10px] text-slate-400">
                      {sortKey === "narxi" ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </button>
                </th>

                <th className="px-4 py-3 font-bold text-right">
                  <button
                    type="button"
                    onClick={() => toggleSort("data")}
                    className="inline-flex items-center gap-2 hover:text-slate-900"
                  >
                    Sana
                    <span className="text-[10px] text-slate-400">
                      {sortKey === "data" ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </button>
                </th>

                <th className="px-4 py-3 font-bold text-right">Amallar</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 text-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : pageRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                    Hozircha ma’lumot yo‘q.
                  </td>
                </tr>
              ) : (
                pageRows.map((r) => (
                  <tr key={String(r.id)} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{r.name}</td>

                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-bold text-slate-800">
                        {r.soni}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-slate-800">{money(r.narxi)}</td>

                    <td className="px-4 py-3 text-right text-slate-500">{r.data}</td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(r)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-800 hover:bg-slate-50"
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

            <tfoot className="bg-slate-50 text-slate-700">
              <tr>
                <td className="px-4 py-3 font-bold" colSpan={4}>
                  Jami (narxi × soni)
                </td>
                <td className="px-4 py-3 text-right font-extrabold text-slate-900">
                  {money(totalAmount)}
                </td>
              </tr>
            </tfoot>
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
                "disabled:opacity-50 disabled:hover:bg-white"
              )}
            >
              ◀ Oldingi
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(Math.max(0, page - 2), Math.min(totalPages, page + 2))
              .map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={cx(
                    "rounded-xl px-3 py-2 text-xs font-bold border transition",
                    p === page
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  )}
                >
                  {p}
                </button>
              ))}

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className={cx(
                "rounded-xl px-3 py-2 text-xs font-bold transition",
                "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                "disabled:opacity-50 disabled:hover:bg-white"
              )}
            >
              Keyingi ▶
            </button>
          </div>
        </div>
      </div>

      {/* ✅ DELETE CONFIRM MODAL */}
      {deleteId != null && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <div className="text-sm font-extrabold text-slate-900">O‘chirishni tasdiqlaysizmi?</div>
            <div className="mt-2 text-xs text-slate-500">
              Bu amal qaytarib bo‘lmaydi. Haqiqatan ham o‘chirmoqchimisiz?
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteId(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Bekor qilish
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteConfirmed}
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-100 disabled:opacity-50"
              >
                {deleting ? "O‘chirilmoqda..." : "O‘chirish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ EDIT MODAL */}
      {editOpen && editRow && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-extrabold text-slate-900">Tahrirlash</div>
                <div className="mt-1 text-xs text-slate-500">
                  ID: <span className="font-bold text-slate-900">{String(editRow.id)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={closeEdit}
                disabled={editSaving}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              <label className="grid gap-1">
                <span className="text-xs font-bold text-slate-700">Ism / Nomi</span>
                <input
                  value={fName}
                  onChange={(e) => setFName(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  placeholder="Masalan: Yusuf-Latipov"
                />
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="grid gap-1">
                  <span className="text-xs font-bold text-slate-700">Soni</span>
                  <input
                    type="number"
                    value={String(fSoni)}
                    onChange={(e) => setFSoni(Number(e.target.value))}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none"
                    min={1}
                    step={1}
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-xs font-bold text-slate-700">Narxi (1 dona)</span>
                  <input
                    type="number"
                    value={String(fNarxi)}
                    onChange={(e) => setFNarxi(Number(e.target.value))}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none"
                    min={0}
                    step={0.01}
                  />
                </label>
              </div>

              <label className="grid gap-1">
                <span className="text-xs font-bold text-slate-700">Sana</span>
                <input
                  type="date"
                  value={fData}
                  onChange={(e) => setFData(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none"
                />
                <span className="text-[11px] text-slate-400">Format: YYYY-MM-DD</span>
              </label>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={editSaving}
                onClick={closeEdit}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Bekor qilish
              </button>

              <button
                type="button"
                disabled={editSaving}
                onClick={handleEditSave}
                className="rounded-xl border border-slate-900 bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:opacity-95 disabled:opacity-50"
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
