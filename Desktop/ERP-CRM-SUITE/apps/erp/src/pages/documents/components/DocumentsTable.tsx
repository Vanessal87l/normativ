import { Eye, Pencil, Trash2 } from "lucide-react"
import TableActionIconButton from "@/components/common/TableActionIconButton"
import type { DocumentItem } from "../types/documents.types"
import { docTypeLabel, docStatusLabel, statusChipClass } from "../utils/documents.utils"

type Props = {
  rows: DocumentItem[]
  onView: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export default function DocumentsTable({ rows, onView, onEdit, onDelete }: Props) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden">
      <div className="overflow-auto">
        <table className="min-w-[1100px] w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr className="text-left">
              <th className="px-4 py-3 font-semibold">Sana</th>
              <th className="px-4 py-3 font-semibold">№</th>
              <th className="px-4 py-3 font-semibold">Turi</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Kontragent</th>
              <th className="px-4 py-3 font-semibold">Reference</th>
              <th className="px-4 py-3 font-semibold">Izoh</th>
              <th className="px-4 py-3 font-semibold text-right">Amallar</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/60">
                <td className="px-4 py-3 text-slate-700">{r.date}</td>
                <td className="px-4 py-3 font-semibold text-slate-900">{r.number}</td>
                <td className="px-4 py-3 text-slate-800">{docTypeLabel[r.type]}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusChipClass(r.status)}`}>
                    {docStatusLabel[r.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-700">{r.kontragentName ?? "-"}</td>
                <td className="px-4 py-3 text-slate-700">{r.refType ? `${r.refType}: ${r.refId ?? "-"}` : "-"}</td>
                <td className="px-4 py-3 text-slate-600 max-w-[320px] truncate">{r.note || "-"}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <TableActionIconButton title="Ko'rish" onClick={() => onView(r.id)}>
                      <Eye size={16} />
                    </TableActionIconButton>
                    <TableActionIconButton title="Tahrirlash" onClick={() => onEdit(r.id)}>
                      <Pencil size={16} />
                    </TableActionIconButton>
                    <TableActionIconButton title="O'chirish" danger onClick={() => onDelete(r.id)}>
                      <Trash2 size={16} />
                    </TableActionIconButton>
                  </div>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-slate-500">
                  Hujjatlar topilmadi
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
