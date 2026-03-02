import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import type {
  Material,
  MaterialCreatePayload,
  MaterialUpdatePayload,
} from "@/pages/Materials/api/materialsApi"

type CreateProps = {
  open: boolean
  mode: "create"
  loading?: boolean
  onClose: () => void
  onSubmit: (payload: MaterialCreatePayload) => Promise<void>
}

type EditProps = {
  open: boolean
  mode: "edit"
  initial: Material
  loading?: boolean
  onClose: () => void
  onSubmit: (payload: MaterialUpdatePayload) => Promise<void>
}

type Props = CreateProps | EditProps

export function MaterialFormDialog(props: Props) {
  const [name, setName] = useState("")
  const [materialType, setMaterialType] = useState<string>("")
  const [uom, setUom] = useState<string>("")
  const [uomName, setUomName] = useState("")
  const [description, setDescription] = useState("")
  const [purchasePrice, setPurchasePrice] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!props.open) return
    setError(null)

    if (props.mode === "edit") {
      setName(props.initial.name ?? "")
      setMaterialType(props.initial.material_type ? String(props.initial.material_type) : "")
      setUom(String(props.initial.uom ?? ""))
      setUomName(props.initial.uom_name ?? "")
      setDescription(props.initial.description ?? "")
      setPurchasePrice(
        props.initial.purchase_price === null || props.initial.purchase_price === undefined
          ? ""
          : String(props.initial.purchase_price)
      )
    } else {
      setName("")
      setMaterialType("")
      setUom("")
      setUomName("")
      setDescription("")
      setPurchasePrice("")
    }
  }, [props.open, props.mode, props.mode === "edit" ? props.initial : null])

  async function submit() {
    setError(null)

    if (!name.trim()) return setError("Nomi (name) majburiy")
    if (!materialType.trim()) return setError("Material type ID majburiy")
    if (!uom.trim()) return setError("UOM majburiy")

    const materialTypeId = Number(materialType)
    const uomId = Number(uom)

    if (!Number.isFinite(materialTypeId) || materialTypeId <= 0) return setError("Material type ID noto'g'ri")
    if (!Number.isFinite(uomId) || uomId <= 0) return setError("UOM ID noto'g'ri")

    let price: number | undefined
    if (purchasePrice.trim()) {
      const p = Number(purchasePrice)
      if (!Number.isFinite(p) || p < 0) return setError("Purchase price noto'g'ri")
      price = p
    }

    if (props.mode === "create") {
      const payload: MaterialCreatePayload = {
        name: name.trim(),
        material_type: materialTypeId,
        uom: uomId,
        currency: "UZS",
        description: description.trim() || undefined,
      }
      if (price !== undefined) payload.purchase_price = price
      await props.onSubmit(payload)
      return
    }

    const payload: MaterialUpdatePayload = {
      name: name.trim(),
      material_type: materialTypeId,
      uom: uomId,
      currency: "UZS",
      description: description.trim() || undefined,
    }
    if (price !== undefined) payload.purchase_price = price
    await props.onSubmit(payload)
  }

  return (
    <Dialog open={props.open} onOpenChange={(v) => !v && props.onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{props.mode === "create" ? "Material qo'shish" : "Materialni tahrirlash"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <div className="text-sm mb-1">Nomi (name) *</div>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Masalan: Salafan" />
          </div>

          <div>
            <div className="text-sm mb-1">Material Type ID (material_type) *</div>
            <Input
              type="number"
              value={materialType}
              onChange={(e) => setMaterialType(e.target.value)}
              placeholder="Masalan: 1"
            />
          </div>

          <div>
            <div className="text-sm mb-1">UOM ID (uom) *</div>
            <Input type="number" value={uom} onChange={(e) => setUom(e.target.value)} placeholder="Masalan: 2" />
            {uomName ? <div className="text-xs text-muted-foreground mt-1">UOM: {uomName}</div> : null}
          </div>

          <div>
            <div className="text-sm mb-1">Description</div>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ixtiyoriy" />
          </div>

          <div>
            <div className="text-sm mb-1">Purchase Price (purchase_price)</div>
            <Input
              type="number"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              placeholder="Masalan: 1500"
            />
          </div>

          <div>
            <div className="text-sm mb-1">Currency</div>
            <Input value="UZS" disabled />
          </div>

          {error ? <div className="text-sm text-red-500">{error}</div> : null}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={props.loading} onClick={props.onClose}>
              Bekor
            </Button>
          </DialogClose>

          <Button onClick={submit} disabled={props.loading}>
            {props.loading ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
