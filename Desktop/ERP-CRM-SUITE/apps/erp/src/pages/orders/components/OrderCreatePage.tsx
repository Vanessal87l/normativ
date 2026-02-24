// src/pages/OrderCreatePage.tsx
import { Link, useNavigate } from "react-router-dom"
import OrderCreateDialog from "@/pages/orders/components/OrderCreateDialog"
import { Button } from "@/components/ui/button"

export default function OrderCreatePage() {
  const nav = useNavigate()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-xl font-semibold">New Order</div>
          <div className="text-sm text-muted-foreground">
            Alohida sahifada order yaratish
          </div>
        </div>
        <Link to="/sotuv/orders">
          <Button variant="outline">← Back</Button>
        </Link>
      </div>

      {/* Hack: sahifada ham dialog triggerini ko'rsatamiz */}
      <div className="rounded-md border p-4">
        <div className="text-sm text-muted-foreground mb-3">
          “Open form” bosib order yarating. (Keyin xohlasangiz bu formani to‘liq
          page ko‘rinishiga chiqarib beraman.)
        </div>

        <OrderCreateDialog onSuccess={() => nav("/sotuv/orders")} />
      </div>
    </div>
  )
}
