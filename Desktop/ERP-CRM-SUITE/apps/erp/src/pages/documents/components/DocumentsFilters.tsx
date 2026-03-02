
import type { DocumentsFilters, DocumentStatus, DocumentType, RefType } from "../types/documents.types";
import { docStatusLabel, docTypeLabel, refTypeLabel } from "../utils/documents.utils";

type Props = {
  value: DocumentsFilters;
  onChange: (next: DocumentsFilters) => void;
  onApply: () => void;
  onReset: () => void;
};

export default function DocumentsFiltersPanel({ value, onChange, onApply, onReset }: Props) {
  const set = (patch: Partial<DocumentsFilters>) => onChange({ ...value, ...patch });

  const docTypes: (DocumentType | "ALL")[] = ["ALL", "INVOICE", "CONTRACT", "ACT", "PAYMENT_ORDER", "DELIVERY_NOTE", "INVENTORY_ACT", "PRODUCTION_REPORT", "OTHER"];
  const statuses: (DocumentStatus | "ALL")[] = ["ALL", "DRAFT", "SIGNED", "PAID", "CANCELED", "ARCHIVED"];
  const refTypes: (RefType | "ALL")[] = ["ALL", "ORDER", "PURCHASE", "PRODUCTION", "WAREHOUSE", "FINANCE", "MANUAL"];

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50/50 p-4">
      <h3 className="text-sm font-semibold text-slate-900">Hujjatlarni filtrlash</h3>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-6 gap-3">
        <div className="md:col-span-1">
          <label className="text-xs text-slate-600">Boshlanish sana</label>
          <input
            type="date"
            value={value.dateFrom ?? ""}
            onChange={(e) => set({ dateFrom: e.target.value || undefined })}
            className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div className="md:col-span-1">
          <label className="text-xs text-slate-600">Tugash sana</label>
          <input
            type="date"
            value={value.dateTo ?? ""}
            onChange={(e) => set({ dateTo: e.target.value || undefined })}
            className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div className="md:col-span-1">
          <label className="text-xs text-slate-600">Hujjat turi</label>
          <select
            value={value.type ?? "ALL"}
            onChange={(e) => set({ type: (e.target.value as any) })}
            className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            {docTypes.map((t) => (
              <option key={t} value={t}>
                {t === "ALL" ? "Barchasi" : docTypeLabel[t]}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-1">
          <label className="text-xs text-slate-600">Status</label>
          <select
            value={value.status ?? "ALL"}
            onChange={(e) => set({ status: (e.target.value as any) })}
            className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s === "ALL" ? "Barchasi" : docStatusLabel[s]}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-1">
          <label className="text-xs text-slate-600">Reference turi</label>
          <select
            value={value.refType ?? "ALL"}
            onChange={(e) => set({ refType: (e.target.value as any) })}
            className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            {refTypes.map((r) => (
              <option key={r} value={r}>
                {r === "ALL" ? "Barchasi" : refTypeLabel[r]}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-1">
          <label className="text-xs text-slate-600">Reference ID</label>
          <input
            value={value.refId ?? ""}
            onChange={(e) => set({ refId: e.target.value || undefined })}
            placeholder="Masalan: ORD-789"
            className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div className="md:col-span-4">
          <label className="text-xs text-slate-600">Qidiruv</label>
          <input
            value={value.q ?? ""}
            onChange={(e) => set({ q: e.target.value || undefined })}
            placeholder="DOC raqam, nom, kontragent..."
            className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div className="md:col-span-2 flex items-end justify-end gap-2">
          <button
            onClick={onReset}
            className="rounded-2xl px-4 py-2 text-sm font-semibold bg-white border border-slate-200 text-slate-900 hover:bg-slate-50"
          >
            Filtrlarni tozalash
          </button>
          <button
            onClick={onApply}
            className="rounded-2xl px-4 py-2 text-sm font-semibold bg-slate-900 text-white hover:opacity-95"
          >
            Filtrlarni qo‘llash
          </button>
        </div>
      </div>
    </div>
  );
}
