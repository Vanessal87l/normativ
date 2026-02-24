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
  const [materialType, setMaterialType] = useState("") // material_type
  const [uom, setUom] = useState<string>("") // uom id
  const [uomName, setUomName] = useState("") // faqat ko‘rsatish uchun (optional)
  const [purchasePrice, setPurchasePrice] = useState<string>("") // number
  const [currency, setCurrency] = useState("UZS")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!props.open) return
    setError(null)

    if (props.mode === "edit") {
      setName(props.initial.name ?? "")
      setMaterialType(props.initial.material_type ?? "")
      setUom(String(props.initial.uom ?? ""))
      setUomName(props.initial.uom_name ?? "")
      setPurchasePrice(
        props.initial.purchase_price === null || props.initial.purchase_price === undefined
          ? ""
          : String(props.initial.purchase_price)
      )
      setCurrency(props.initial.currency ?? "UZS")
    } else {
      setName("")
      setMaterialType("")
      setUom("")
      setUomName("")
      setPurchasePrice("")
      setCurrency("UZS")
    }
  }, [props.open, props.mode, props.mode === "edit" ? props.initial : null])
  async function submit() {
    setError(null)

    const mt = materialType == null ? "" : String(materialType)
    const cur = currency == null ? "" : String(currency)

    if (!name.trim()) return setError("Nomi (name) majburiy")
    if (!uom.trim()) return setError("UOM majburiy (ID kiriting)")

    const uomId = Number(uom)
    if (!Number.isFinite(uomId) || uomId <= 0) return setError("UOM noto‘g‘ri. Masalan: 1")

    let price: number | undefined
    if (purchasePrice.trim()) {
      const p = Number(purchasePrice)
      if (!Number.isFinite(p) || p < 0) return setError("Purchase price noto‘g‘ri")
      price = p
    }

    const payload: any = {
      name: name.trim(),
      uom: uomId,
    }

    if (mt.trim()) payload.material_type = mt.trim()
    if (price !== undefined) payload.purchase_price = price
    if (cur.trim()) payload.currency = cur.trim()

    console.log("MATERIAL SUBMIT PAYLOAD =>", payload)

    if (props.mode === "create") await props.onSubmit(payload)
    else await props.onSubmit(payload)
  }



  return (
    <Dialog open={props.open} onOpenChange={(v) => !v && props.onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {props.mode === "create" ? "Material qo‘shish" : "Materialni tahrirlash"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <div className="text-sm mb-1">Nomi (name) *</div>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Masalan: Salafan" />
          </div>

          <div>
            <div className="text-sm mb-1">Material Type (material_type)</div>
            <Input
              value={materialType}
              onChange={(e) => setMaterialType(e.target.value)}
              placeholder="Masalan: packaging"
            />
          </div>

          <div>
            <div className="text-sm mb-1">UOM ID (uom) *</div>
            <Input type="number" value={uom} onChange={(e) => setUom(e.target.value)} placeholder="Masalan: 2" />
            {uomName ? (
              <div className="text-xs text-muted-foreground mt-1">UOM: {uomName}</div>
            ) : null}
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
            <div className="text-sm mb-1">Currency (currency)</div>
            <Input value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="UZS" />
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
