// src/pages/purchases/components/PurchaseTabs.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function PurchaseTabs({
  itemsTab,
}: {
  itemsTab: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className="p-3 border-b border-slate-100">
        <Tabs defaultValue="items">
          <TabsList className="w-full justify-start rounded-xl bg-slate-50">
            <TabsTrigger value="items" className="cursor-pointer">Pozitsiyalar</TabsTrigger>
            <TabsTrigger value="links" className="cursor-pointer">Bog‘liq hujjatlar</TabsTrigger>
            <TabsTrigger value="files" className="cursor-pointer">Fayllar</TabsTrigger>
            <TabsTrigger value="tasks" className="cursor-pointer">Vazifalar</TabsTrigger>
            <TabsTrigger value="events" className="cursor-pointer">Hodisalar</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="mt-3">
            {itemsTab}
          </TabsContent>

          <TabsContent value="links" className="mt-3">
            <div className="p-4 text-sm text-slate-500">Hozircha yo‘q (keyin backend ulaymiz)</div>
          </TabsContent>

          <TabsContent value="files" className="mt-3">
            <div className="p-4 text-sm text-slate-500">Hozircha yo‘q (keyin backend ulaymiz)</div>
          </TabsContent>

          <TabsContent value="tasks" className="mt-3">
            <div className="p-4 text-sm text-slate-500">Hozircha yo‘q (keyin backend ulaymiz)</div>
          </TabsContent>

          <TabsContent value="events" className="mt-3">
            <div className="p-4 text-sm text-slate-500">Hozircha yo‘q (keyin backend ulaymiz)</div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
