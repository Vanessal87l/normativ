import type { ProductionStatus, WorkCenter } from "../types/production.types"

export const statusLabel: Record<ProductionStatus, string> = {
  DRAFT: "Draft",
  APPROVED: "Tasdiqlangan",
  IN_PROGRESS: "Jarayonda",
  PAUSED: "To‘xtatilgan",
  COMPLETED: "Yakunlangan",
  CANCELLED: "Bekor qilingan",
}

export const workCenterLabel: Record<WorkCenter, string> = {
  CUTTING: "Qirqish",
  SEWING: "Tikish",
  PACKING: "Qadoqlash",
  OTHER: "Boshqa",
}

export function statusChipClass(s: ProductionStatus) {
  switch (s) {
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200"
    case "IN_PROGRESS":
      return "bg-blue-50 text-blue-700 border border-blue-200"
    case "APPROVED":
      return "bg-slate-50 text-slate-700 border border-slate-200"
    case "PAUSED":
      return "bg-amber-50 text-amber-700 border border-amber-200"
    case "CANCELLED":
      return "bg-rose-50 text-rose-700 border border-rose-200"
    default:
      return "bg-slate-50 text-slate-700 border border-slate-200"
  }
}

export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`
}
