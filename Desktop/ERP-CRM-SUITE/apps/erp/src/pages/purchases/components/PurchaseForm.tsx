import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { PatchPurchasePayload } from "@/Api/purchases.api"
import type { PurchaseDetail } from "../types"

type FormValues = {
  supplier: string
  location: string
  received_date: string
  produced_date: string
  delivery_company: string
  notes: string
}

export default function PurchaseForm({
  value,
  loading,
  saving,
  onSubmit,
}: {
  value?: PurchaseDetail
  loading: boolean
  saving: boolean
  onSubmit: (payload: PatchPurchasePayload) => void
}) {
  const { register, reset, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      supplier: "",
      location: "",
      received_date: "",
      produced_date: "",
      delivery_company: "",
      notes: "",
    },
  })

  useEffect(() => {
    if (!value) return
    reset({
      supplier: value.supplier ? String(value.supplier) : "",
      location: value.location ? String(value.location) : "",
      received_date: value.received_date || "",
      produced_date: value.produced_date || "",
      delivery_company: value.delivery_company || "",
      notes: value.notes || "",
    })
  }, [value, reset])

  const isDraft = value?.status === "DRAFT"

  return (
    <form
      className="rounded-2xl border border-slate-200 bg-white p-4"
      onSubmit={handleSubmit((v) => {
        const payload: PatchPurchasePayload = {
          supplier: Number(v.supplier),
          location: Number(v.location),
          received_date: v.received_date || null,
          produced_date: v.produced_date || null,
          delivery_company: v.delivery_company.trim() || null,
          notes: v.notes.trim() || null,
          currency: "UZS",
        }
        onSubmit(payload)
      })}
    >
      <div className="text-sm font-semibold text-slate-900">Asosiy ma'lumotlar</div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-500">Supplier ID *</label>
          <Input className="mt-1 rounded-xl" disabled={loading || !isDraft} {...register("supplier")} />
        </div>

        <div>
          <label className="text-xs text-slate-500">Location ID *</label>
          <Input className="mt-1 rounded-xl" disabled={loading || !isDraft} {...register("location")} />
        </div>

        <div>
          <label className="text-xs text-slate-500">Received date</label>
          <Input className="mt-1 rounded-xl" type="date" disabled={loading || !isDraft} {...register("received_date")} />
        </div>

        <div>
          <label className="text-xs text-slate-500">Produced date</label>
          <Input className="mt-1 rounded-xl" type="date" disabled={loading || !isDraft} {...register("produced_date")} />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs text-slate-500">Delivery company</label>
          <Input className="mt-1 rounded-xl" disabled={loading || !isDraft} {...register("delivery_company")} />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs text-slate-500">Notes</label>
          <Textarea className="mt-1 rounded-xl" rows={4} disabled={loading || !isDraft} {...register("notes")} />
        </div>

        <div>
          <label className="text-xs text-slate-500">Currency</label>
          <Input className="mt-1 rounded-xl" value="UZS" disabled />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <Button type="submit" className="cursor-pointer rounded-xl" disabled={saving || loading || !isDraft}>
          {saving ? "Saqlanmoqda..." : "Saqlash"}
        </Button>
      </div>
    </form>
  )
}
