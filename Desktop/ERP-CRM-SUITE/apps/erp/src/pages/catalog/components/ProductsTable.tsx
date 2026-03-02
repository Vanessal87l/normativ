import { Eye, Pencil, Trash2 } from "lucide-react"
import type { Product } from "../api/ProductsApi"

function cx(...a: Array<string | false | undefined | null>) {
  return a.filter(Boolean).join(" ")
}

export default function ProductsTable({
  rows,
  onView,
  onEdit,
  onDelete,
}: {
  rows: Product[]
  onView: (p: Product) => void
  onEdit: (p: Product) => void
  onDelete: (p: Product) => void
}) {
  return (
    <div className="overflow-x-auto rounded-2xl bg-white border border-slate-200 shadow-sm">
      <table className="min-w-[1100px] w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-700">
          <tr>
            <th className="px-5 py-4 font-bold">Nomi</th>
            <th className="px-5 py-4 font-bold">Kategoriya</th>
            <th className="px-5 py-4 font-bold">UoM</th>
            <th className="px-5 py-4 font-bold">Narx</th>
            <th className="px-5 py-4 font-bold">Valyuta</th>
            <th className="px-5 py-4 font-bold">Status</th>
            <th className="px-5 py-4 font-bold text-right">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-200 text-slate-900">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-5 py-10 text-center text-slate-500">
                Hozircha mahsulot yo'q.
              </td>
            </tr>
          ) : (
            rows.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-5 py-4 font-semibold">{p.name}</td>
                <td className="px-5 py-4 text-slate-700">{p.category_name ?? (p.category ?? "-")}</td>
                <td className="px-5 py-4 text-slate-700">{p.uom_name ?? p.uom}</td>
                <td className="px-5 py-4">
                  {p.selling_price == null ? "-" : Number(p.selling_price).toLocaleString("uz-UZ")}
                </td>
                <td className="px-5 py-4">{p.currency}</td>
                <td className="px-5 py-4">{p.deleted_at ? "Deleted" : "Active"}</td>

                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <ActionBtn title="Ko'rish" onClick={() => onView(p)}>
                      <Eye size={16} />
                    </ActionBtn>
                    <ActionBtn title="Tahrirlash" onClick={() => onEdit(p)}>
                      <Pencil size={16} />
                    </ActionBtn>
                    <ActionBtn title="O'chirish" danger onClick={() => onDelete(p)}>
                      <Trash2 size={16} />
                    </ActionBtn>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

function ActionBtn({
  children,
  onClick,
  title,
  danger,
}: {
  children: React.ReactNode
  onClick: () => void
  title: string
  danger?: boolean
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cx(
        "h-10 w-10 inline-flex items-center justify-center rounded-xl border transition",
        danger
          ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      )}
    >
      {children}
    </button>
  )
}
