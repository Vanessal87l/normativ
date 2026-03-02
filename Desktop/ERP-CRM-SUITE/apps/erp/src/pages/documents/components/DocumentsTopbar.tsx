
type Props = {
  onCreate: () => void;
  onExportCsv: () => void;
};

export default function DocumentsTopbar({ onCreate, onExportCsv }: Props) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Hujjatlar</h1>
        <p className="text-sm text-slate-500">Ro‘yxat</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onCreate}
          className="rounded-2xl px-4 py-2 text-sm font-semibold bg-slate-900 text-white shadow-[0_14px_30px_rgba(2,6,23,0.22)] hover:opacity-95 active:scale-[0.99]"
        >
          + Yangi hujjat qo‘shish
        </button>
        <button
          onClick={onExportCsv}
          className="rounded-2xl px-4 py-2 text-sm font-semibold bg-white border border-slate-200 text-slate-900 hover:bg-slate-50"
        >
          CSV eksport
        </button>
      </div>
    </div>
  );
}
