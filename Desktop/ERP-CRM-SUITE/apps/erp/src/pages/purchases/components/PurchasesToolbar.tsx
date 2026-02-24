import { Button } from "@/components/ui/button"
import { RefreshCcw, Plus, Download } from "lucide-react"

export default function PurchasesToolbar({
  onCreate,
  onExport,
  onRefresh,
}: {
  onCreate: () => void
  onExport: () => void
  onRefresh: () => void
}) {
  return (
    <div className="flex items-center gap-2">
      <Button
        className="cursor-pointer rounded-2xl"
        onClick={onCreate}
      >
        <Plus className="h-4 w-4 mr-2" />
        Yangi xarid
      </Button>

      <Button
        variant="secondary"
        className="cursor-pointer rounded-2xl"
        onClick={onExport}
      >
        <Download className="h-4 w-4 mr-2" />
        CSV eksport
      </Button>

      <Button
        variant="outline"
        className="cursor-pointer rounded-2xl"
        onClick={onRefresh}
      >
        <RefreshCcw className="h-4 w-4" />
      </Button>
    </div>
  )
}
