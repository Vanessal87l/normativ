import type { ReactNode } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog"

type DeleteAlertDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title?: string
  description?: ReactNode
  cancelText?: string
  confirmText?: string
  loading?: boolean
}

export default function DeleteAlertDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "O'chirish",
  description = "Rostdan ham ushbu yozuvni o'chirmoqchimisiz?",
  cancelText = "Bekor",
  confirmText = "O'chirish",
  loading = false,
}: DeleteAlertDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="h-auto gap-0 rounded-2xl border-slate-200 bg-slate-100 p-0 sm:max-w-[560px]"
      >
        <div className="flex items-center justify-between px-5 pt-5">
          <h2 className="text-[32px] font-bold text-slate-900">{title}</h2>
          <DialogClose asChild>
            <button
              type="button"
              aria-label="Close"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 bg-slate-100 text-slate-600 hover:bg-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </DialogClose>
        </div>

        <div className="px-5 pb-6 pt-4 text-base text-slate-600">{description}</div>

        <div className="flex items-center justify-end gap-3 px-5 pb-5">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            className="h-10 rounded-xl border-slate-300 bg-slate-100 px-6 font-semibold text-slate-700 hover:bg-slate-200"
            onClick={() => onOpenChange(false)}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            disabled={loading}
            className="h-10 rounded-xl bg-rose-600 px-6 font-semibold text-white hover:bg-rose-700"
            onClick={onConfirm}
          >
            {loading ? "O'chirilmoqda..." : confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
