import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { PurchaseDetail } from "../types"

type FormValues = {
  organization_id: string
  kontragent_id: string
  warehouse_id: string
  planned_receive_date: string
  delivery_address: string
  comment: string
  vat_enabled: boolean
  price_includes_vat: boolean
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
  onSubmit: (payload: Partial<PurchaseDetail>) => void
}) {
  const { register, reset, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      organization_id: "",
      kontragent_id: "",
      warehouse_id: "",
      planned_receive_date: "",
      delivery_address: "",
      comment: "",
      vat_enabled: true,
      price_includes_vat: true,
    },
  })

  useEffect(() => {
    if (!value) return
    reset({
      organization_id: value.organization_id ? String(value.organization_id) : "",
      kontragent_id: value.kontragent_id ? String(value.kontragent_id) : "",
      warehouse_id: value.warehouse_id ? String(value.warehouse_id) : "",
      planned_receive_date: value.planned_receive_date || "",
      delivery_address: value.delivery_address || "",
      comment: value.comment || "",
      vat_enabled: value.vat_enabled,
      price_includes_vat: value.price_includes_vat,
    })
  }, [value, reset])

  return (
    <form
      className="rounded-2xl border border-slate-200 bg-white p-4"
      onSubmit={handleSubmit((v) => {
        onSubmit({
          organization_id: v.organization_id ? Number(v.organization_id) : null,
          kontragent_id: v.kontragent_id ? Number(v.kontragent_id) : null,
          warehouse_id: v.warehouse_id ? Number(v.warehouse_id) : null,
          planned_receive_date: v.planned_receive_date || null,
          delivery_address: v.delivery_address || null,
          comment: v.comment || null,
          vat_enabled: v.vat_enabled,
          price_includes_vat: v.price_includes_vat,
        })
      })}
    >
      <div className="text-sm font-semibold text-slate-900">Asosiy ma’lumotlar</div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-500">Tashkilot (ID)</label>
          <Input className="mt-1 rounded-xl" disabled={loading} {...register("organization_id")} />
        </div>

        <div>
          <label className="text-xs text-slate-500">Kontragent (ID)</label>
          <Input className="mt-1 rounded-xl" disabled={loading} {...register("kontragent_id")} />
        </div>

        <div>
          <label className="text-xs text-slate-500">Ombor (ID)</label>
          <Input className="mt-1 rounded-xl" disabled={loading} {...register("warehouse_id")} />
        </div>

        <div>
          <label className="text-xs text-slate-500">Reja sana</label>
          <Input className="mt-1 rounded-xl" type="date" disabled={loading} {...register("planned_receive_date")} />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs text-slate-500">Yetkazish manzili</label>
          <Input className="mt-1 rounded-xl" disabled={loading} {...register("delivery_address")} />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs text-slate-500">Komment</label>
          <Textarea className="mt-1 rounded-xl" rows={4} disabled={loading} {...register("comment")} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <Button
          type="submit"
          className="cursor-pointer rounded-xl"
          disabled={saving || loading}
        >
          {saving ? "Saqlanmoqda..." : "Saqlash"}
        </Button>
      </div>
    </form>
  )
}
