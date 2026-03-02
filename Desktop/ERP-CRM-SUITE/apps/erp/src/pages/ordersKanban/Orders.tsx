import DragAndDrop from "@/pages/ordersKanban/DragAndDrop";

export default function Orders() {
  return (
    <div className="p-6">
      <div className="rounded-3xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur">
        <div className="p-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Buyurtmalar</h1>
            <p className="mt-1 text-sm text-slate-500">Kanban board</p>
          </div>

          <div className="mt-4 flex w-full items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mt-[2px] text-amber-600"
            >
              <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>

            <div className="min-w-0">
              <div className="font-semibold text-amber-900">
                Some orders were not loaded
              </div>
              <p className="text-sm text-amber-900/80">
                Failed to load some orders. Please refresh or try again later.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <DragAndDrop />
          </div>
        </div>
      </div>
    </div>
  );
}
