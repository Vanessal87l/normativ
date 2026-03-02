import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function PurchaseTabs({
  itemsTab,
  paymentsTab,
}: {
  itemsTab: React.ReactNode
  paymentsTab: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <Tabs defaultValue="items">
        <div className="p-3 border-b border-slate-100">
          <TabsList className="w-full justify-start rounded-xl bg-slate-50">
            <TabsTrigger value="items" className="cursor-pointer">Pozitsiyalar</TabsTrigger>
            <TabsTrigger value="payments" className="cursor-pointer">To'lovlar</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="items" className="mt-0">
          {itemsTab}
        </TabsContent>

        <TabsContent value="payments" className="mt-0">
          {paymentsTab}
        </TabsContent>
      </Tabs>
    </div>
  )
}
