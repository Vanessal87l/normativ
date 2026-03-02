import { Eye, Pencil, Trash2 } from "lucide-react"
import TableActionIconButton from "@/components/common/TableActionIconButton"
import type { ProductionOrder } from "../types/production.types"
import { statusChipClass, statusLabel, workCenterLabel } from "../utils/production.utils"

type Props = {
  rows: ProductionOrder[]
  onView: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export default function ProductionTable({ rows, onView, onEdit, onDelete }: Props) {
  return (
    <div className="overflow-auto">
      <table className="w-full text-sm">
        <thead className="text-slate-600">
          <tr className="border-b border-slate-100">
            <th className="text-left py-3 px-3">Sana</th>
            <th className="text-left py-3 px-3">Kod</th>
            <th className="text-left py-3 px-3">Mahsulot</th>
            <th className="text-left py-3 px-3">Miqdor</th>
            <th className="text-left py-3 px-3">Sex</th>
            <th className="text-left py-3 px-3">Status</th>
            <th className="text-right py-3 px-3">Amallar</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/60">
              <td className="py-3 px-3 text-slate-700">{r.date}</td>
              <td className="py-3 px-3 font-semibold text-slate-900">{r.code}</td>
              <td className="py-3 px-3 text-slate-900">{r.productName}</td>
              <td className="py-3 px-3 text-slate-900">{r.quantity.toLocaleString()}</td>
              <td className="py-3 px-3 text-slate-700">{workCenterLabel[r.workCenter]}</td>
              <td className="py-3 px-3">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusChipClass(r.status)}`}>
                  {statusLabel[r.status]}
                </span>
              </td>
              <td className="py-3 px-3">
                <div className="flex items-center justify-end gap-2">
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
          {rows.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-10 text-center text-slate-500">
                Hozircha buyurtma yo'q
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  )
}
