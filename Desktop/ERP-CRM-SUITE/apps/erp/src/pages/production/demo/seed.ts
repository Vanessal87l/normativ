import type { ProductionOrder } from "../types/production.types"
import { uid } from "../utils/production.utils"

export function seedOrders(): ProductionOrder[] {
  const today = new Date().toISOString().slice(0, 10)

  return [
    {
      id: uid("po"),
      code: "PO-00021",
      date: today,
      productName: "Futbolka (Premium)",
      quantity: 120,
      workCenter: "SEWING",
      status: "IN_PROGRESS",
      note: "Navbat: 2",
      materials: [
        { id: uid("m"), name: "Mato (kulrang)", uom: "m", qty: 260, unitCostUZS: 18000 },
        { id: uid("m"), name: "Tugma", uom: "dona", qty: 120, unitCostUZS: 800 },
      ],
      wastes: [{ id: uid("w"), reason: "Brak (tikuv)", qty: 3 }],
      finishedReceivedQty: 40,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uid("po"),
      code: "PO-00022",
      date: today,
      productName: "Shim (Classic)",
      quantity: 80,
      workCenter: "CUTTING",
      status: "APPROVED",
      note: "",
      materials: [],
      wastes: [],
      finishedReceivedQty: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]
}
