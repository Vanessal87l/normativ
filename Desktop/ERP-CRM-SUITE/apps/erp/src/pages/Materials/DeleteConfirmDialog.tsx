import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function DeleteConfirmDialog(props: {
  open: boolean
  title?: string
  description?: string
  loading?: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <Dialog open={props.open} onOpenChange={(v) => !v && props.onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{props.title ?? "O‘chirishni tasdiqlaysizmi?"}</DialogTitle>
        </DialogHeader>

        <div className="text-sm text-muted-foreground">
          {props.description ?? "Bu amalni ortga qaytarib bo‘lmaydi."}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={props.onClose} disabled={props.loading}>Bekor</Button>
          <Button variant="destructive" onClick={props.onConfirm} disabled={props.loading}>
            {props.loading ? "O‘chirilmoqda..." : "O‘chirish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
