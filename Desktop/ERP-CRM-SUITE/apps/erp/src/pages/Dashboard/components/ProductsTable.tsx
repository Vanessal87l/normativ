import { useEffect, useState } from "react";
import { catalogApi, type ProductRow } from "../api/catalogApi";

export default function ProductsTable({ reloadKey }: { reloadKey: number }) {
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res: any = await catalogApi.listProducts({ page: 1, page_size: 20 });
        const list = Array.isArray(res) ? res : Array.isArray(res?.results) ? res.results : [];
        if (!cancelled) setRows(list);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [reloadKey]);

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
      <div className="text-sm font-extrabold text-slate-900">Mahsulotlar</div>
      <div className="text-xs text-slate-500">So‘nggi 20 ta</div>

      {loading ? (
        <div className="mt-3 text-xs text-slate-500">Yuklanmoqda...</div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-[900px] w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-bold">Nomi</th>
                <th className="px-4 py-3 font-bold">Kategoriya</th>
                <th className="px-4 py-3 font-bold">UoM</th>
                <th className="px-4 py-3 font-bold">Narx</th>
                <th className="px-4 py-3 font-bold text-right">Sana</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-900">
              {rows.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-500">Hozircha yo‘q.</td></tr>
              ) : (
                rows.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold">{p.name}</td>
                    <td className="px-4 py-3">{p.category_name ?? p.category ?? "—"}</td>
                    <td className="px-4 py-3">{p.uom_name ?? p.uom}</td>
                    <td className="px-4 py-3">{Number(p.selling_price).toLocaleString("uz-UZ")} {p.currency}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{String(p.created_at ?? "")}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
