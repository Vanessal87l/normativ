import { Button } from "@/components/ui/button"
import type { PaymentStatus, PurchaseStatus } from "../types"

function badgeClass(type: "status" | "payment", value?: string) {
  if (type === "status") {
    if (value === "CONFIRMED") return "bg-emerald-50 text-emerald-700 border-emerald-200"
    if (value === "CANCELLED") return "bg-rose-50 text-rose-700 border-rose-200"
    return "bg-slate-50 text-slate-700 border-slate-200"
  }
  if (value === "PAID") return "bg-emerald-50 text-emerald-700 border-emerald-200"
  if (value === "PARTIAL") return "bg-amber-50 text-amber-700 border-amber-200"
  return "bg-slate-50 text-slate-700 border-slate-200"
}

export default function PurchaseHeader({
  title,
  loading,
  status,
  paymentStatus,
  updatedAt,
  total,
  paidAmount,
  canConfirm,
  onClose,
  onRefresh,
  onConfirm,
  onCancel,
  onDelete,
}: {
  title: string
  loading: boolean
  status?: PurchaseStatus
  paymentStatus?: PaymentStatus
  updatedAt?: string
  total: number
  paidAmount: number
  canConfirm: boolean
  onClose: () => void
  onRefresh: () => void
  onConfirm: () => void
  onCancel: () => void
  onDelete: () => void
}) {
  const isDraft = status === "DRAFT"
  const isConfirmed = status === "CONFIRMED"

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
            <span
              className={[
                "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
                badgeClass("status", status),
              ].join(" ")}
            >
              {status ?? "-"}
            </span>
            <span
              className={[
                "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
                badgeClass("payment", paymentStatus),
              ].join(" ")}
            >
              {paymentStatus ?? "-"}
            </span>
            {loading && <span className="text-xs text-slate-500">Yuklanmoqda...</span>}
          </div>

          <div className="mt-2 text-xs text-slate-500">
            Total: <b>{total.toLocaleString("ru-RU")} UZS</b> | Paid:{" "}
            <b>{paidAmount.toLocaleString("ru-RU")} UZS</b>
          </div>
          {updatedAt && (
            <div className="text-xs text-slate-500 mt-1">Oxirgi o'zgarish: {new Date(updatedAt).toLocaleString("ru-RU")}</div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="cursor-pointer rounded-2xl" onClick={onRefresh}>
            Yangilash
          </Button>
          <Button
            className="cursor-pointer rounded-2xl"
            onClick={onConfirm}
            disabled={!isDraft || !canConfirm}
            title={!canConfirm ? "Confirm uchun location va items kerak" : ""}
          >
            Confirm
          </Button>
          <Button
            variant="secondary"
            className="cursor-pointer rounded-2xl"
            onClick={onCancel}
            disabled={!isDraft && !isConfirmed}
          >
            Cancel
          </Button>
          <Button variant="destructive" className="cursor-pointer rounded-2xl" onClick={onDelete}>
            Delete
          </Button>
          <Button variant="outline" className="cursor-pointer rounded-2xl" onClick={onClose}>
            Yopish
          </Button>
        </div>
      </div>
      <div className="h-px bg-slate-200" />
    </div>
  )
}
