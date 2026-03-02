import { useForm } from "react-hook-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { CreatePurchasePayload } from "@/Api/purchases.api"

type FormValues = {
  supplier: string
  received_date: string
  produced_date: string
  delivery_company: string
  location: string
  notes: string
}

export default function CreatePurchaseModal({
  open,
  onOpenChange,
  onSubmit,
  loading,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSubmit: (payload: CreatePurchasePayload) => void
  loading: boolean
}) {
  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      supplier: "",
      received_date: new Date().toISOString().slice(0, 10),
      produced_date: "",
      delivery_company: "",
      location: "",
      notes: "",
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle>Yangi xarid (DRAFT)</DialogTitle>
        </DialogHeader>

        <form
          className="space-y-3"
          onSubmit={handleSubmit((v) => {
            const supplier = Number(v.supplier)
            const location = Number(v.location)
            if (!Number.isFinite(supplier) || supplier <= 0) return
            if (!Number.isFinite(location) || location <= 0) return

            onSubmit({
              supplier,
              location,
              received_date: v.received_date || null,
              produced_date: v.produced_date || null,
              delivery_company: v.delivery_company.trim() || null,
              notes: v.notes.trim() || null,
              currency: "UZS",
            })
          })}
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <div className="text-xs text-slate-500">Supplier ID *</div>
              <Input className="rounded-xl" {...register("supplier")} placeholder="12" />
            </div>
            <div>
              <div className="text-xs text-slate-500">Location ID *</div>
              <Input className="rounded-xl" {...register("location")} placeholder="3" />
            </div>

            <div>
              <div className="text-xs text-slate-500">Received date</div>
              <Input type="date" className="rounded-xl" {...register("received_date")} />
            </div>

            <div>
              <div className="text-xs text-slate-500">Produced date</div>
              <Input type="date" className="rounded-xl" {...register("produced_date")} />
            </div>

            <div className="md:col-span-2">
              <div className="text-xs text-slate-500">Delivery company</div>
              <Input className="rounded-xl" {...register("delivery_company")} placeholder="Fargo" />
            </div>

            <div className="md:col-span-2">
              <div className="text-xs text-slate-500">Izoh</div>
              <Input className="rounded-xl" {...register("notes")} placeholder="Kimyo xomashyo kirimi" />
            </div>

            <div>
              <div className="text-xs text-slate-500">Valyuta</div>
              <Input className="rounded-xl" value="UZS" disabled />
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
            <Button type="submit" className="cursor-pointer rounded-2xl" disabled={loading}>
              {loading ? "Yaratilmoqda..." : "Yaratish"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
