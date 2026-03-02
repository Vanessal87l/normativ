type Props = {
  onCreate: () => void
  onExportCsv: () => void
}

export default function ProductionTopbar({ onCreate, onExportCsv }: Props) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <div className="text-lg font-semibold text-slate-900">Ishlab chiqarish</div>
        <div className="text-sm text-slate-500">Buyurtmalar / jarayon / tannarx</div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onCreate}
          className="rounded-2xl px-4 py-2 text-sm font-semibold bg-slate-900 text-white hover:opacity-95"
        >
          + Yangi buyurtma
        </button>
        <button
          onClick={onExportCsv}
          className="rounded-2xl px-4 py-2 text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50"
        >
          CSV eksport
        </button>
      </div>
    </div>
  )
}
