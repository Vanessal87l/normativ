import DeleteAlertDialog from "@/components/common/DeleteAlertDialog"

export function DeleteConfirmDialog(props: {
  open: boolean
  title?: string
  description?: string
  loading?: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <DeleteAlertDialog
      open={props.open}
      onOpenChange={(v) => {
        if (!v) props.onClose()
      }}
      title={props.title ?? "O'chirish"}
      description={props.description ?? "Bu amalni ortga qaytarib bo'lmaydi."}
      loading={props.loading}
      onConfirm={props.onConfirm}
    />
  )
}
