import { useForm } from "react-hook-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type FormValues = {
  organization_id: string
  kontragent_id: string
  warehouse_id: string
  currency: "UZS" | "USD" | "RUB"
  comment: string
}

export default function CreatePurchaseModal({
  open,
  onOpenChange,
  onSubmit,
  loading,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSubmit: (payload: {
    organization_id: number | null
    kontragent_id: number | null
    warehouse_id: number | null
    currency: string
    comment?: string | null
  }) => void
  loading: boolean
}) {
  const { register, handleSubmit, setValue, watch } = useForm<FormValues>({
    defaultValues: {
      organization_id: "",
      kontragent_id: "",
      warehouse_id: "",
      currency: "UZS",
      comment: "",
    },
  })

  const currency = watch("currency")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle>Yangi xarid</DialogTitle>
        </DialogHeader>

        <form
          className="space-y-3"
          onSubmit={handleSubmit((v) => {
            onSubmit({
              organization_id: v.organization_id ? Number(v.organization_id) : null,
              kontragent_id: v.kontragent_id ? Number(v.kontragent_id) : null,
              warehouse_id: v.warehouse_id ? Number(v.warehouse_id) : null,
              currency: v.currency,
              comment: v.comment?.trim() ? v.comment.trim() : null,
            })
          })}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-slate-500">Tashkilot (ID)</div>
              <Input className="rounded-xl" {...register("organization_id")} placeholder="1" />
            </div>
            <div>
              <div className="text-xs text-slate-500">Kontragent (ID)</div>
              <Input className="rounded-xl" {...register("kontragent_id")} placeholder="12" />
            </div>
            <div>
              <div className="text-xs text-slate-500">Ombor (ID)</div>
              <Input className="rounded-xl" {...register("warehouse_id")} placeholder="3" />
            </div>

            <div>
              <div className="text-xs text-slate-500">Valyuta</div>
              <Select value={currency} onValueChange={(v) => setValue("currency", v as any)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UZS">UZS</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="RUB">RUB</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <div className="text-xs text-slate-500">Komment</div>
              <Input className="rounded-xl" {...register("comment")} placeholder="Izoh..." />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="cursor-pointer rounded-2xl"
              onClick={() => onOpenChange(false)}
            >
              Bekor
            </Button>

            <Button
              type="submit"
              className="cursor-pointer rounded-2xl"
              disabled={loading}
            >
              {loading ? "Yaratilmoqda..." : "Yaratish"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
