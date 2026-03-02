import React, { useMemo, useState } from "react";
import { docStatusLabel, docTypeLabel, refTypeLabel } from "../utils/documents.utils";
import type { DocumentItem, DocumentStatus, DocumentType, RefType } from "../types/documents.types";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  initial?: DocumentItem | null;
  onClose: () => void;
  onSubmit: (data: Omit<DocumentItem, "id" | "createdAt" | "updatedAt">) => Promise<void>;
};

export default function DocumentCreateEditDialog({ open, mode, initial, onClose, onSubmit }: Props) {
  const init = useMemo(() => {
    const base = initial ?? null;
    return {
      number: base?.number ?? `DOC-${String(Math.floor(Math.random() * 900000) + 100000)}`,
      title: base?.title ?? "",
      type: base?.type ?? ("INVOICE" as DocumentType),
      status: base?.status ?? ("DRAFT" as DocumentStatus),
      date: base?.date ?? new Date().toISOString().slice(0, 10),
      kontragentName: base?.kontragentName ?? "",
      refType: base?.refType ?? ("MANUAL" as RefType),
      refId: base?.refId ?? "",
      amount: base?.amount ?? undefined,
      currency: base?.currency ?? "UZS",
      createdBy: base?.createdBy ?? "Admin",
      note: base?.note ?? "",
      attachments: base?.attachments ?? [],
    };
  }, [initial]);

  const [form, setForm] = useState(init);
  const [loading, setLoading] = useState(false);

  // initial o‘zgarsa (edit id almashsa) reset
  React.useEffect(() => setForm(init), [init]);

  if (!open) return null;

  const docTypes: DocumentType[] = ["INVOICE", "CONTRACT", "ACT", "PAYMENT_ORDER", "DELIVERY_NOTE", "INVENTORY_ACT", "PRODUCTION_REPORT", "OTHER"];
  const statuses: DocumentStatus[] = ["DRAFT", "SIGNED", "PAID", "CANCELED", "ARCHIVED"];
  const refTypes: RefType[] = ["ORDER", "PURCHASE", "PRODUCTION", "WAREHOUSE", "FINANCE", "MANUAL"];

  const set = (patch: Partial<typeof form>) => setForm((p) => ({ ...p, ...patch }));

  const submit = async () => {
    setLoading(true);
    try {
      await onSubmit(form as any);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-3xl rounded-3xl bg-white border border-slate-200 shadow-[0_26px_70px_rgba(2,6,23,0.25)] overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-base font-semibold text-slate-900">
              {mode === "create" ? "Yangi hujjat" : "Hujjatni tahrirlash"}
            </div>
            <div className="text-xs text-slate-500">Hujjat ma’lumotlarini kiriting</div>
          </div>
          <button onClick={onClose} className="rounded-2xl px-3 py-2 text-sm border border-slate-200 hover:bg-slate-50">
            Yopish
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-600">Hujjat raqami</label>
            <input
              value={form.number}
              onChange={(e) => set({ number: e.target.value })}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-slate-600">Sana</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => set({ date: e.target.value })}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-slate-600">Turi</label>
            <select
              value={form.type}
              onChange={(e) => set({ type: e.target.value as DocumentType })}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white"
            >
              {docTypes.map((t) => (
                <option key={t} value={t}>
                  {docTypeLabel[t]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-600">Status</label>
            <select
              value={form.status}
              onChange={(e) => set({ status: e.target.value as DocumentStatus })}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {docStatusLabel[s]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-600">Kontragent</label>
            <input
              value={form.kontragentName}
              onChange={(e) => set({ kontragentName: e.target.value })}
              placeholder="Masalan: Jasur Trade"
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-slate-600">Sarlavha (nom)</label>
            <input
              value={form.title}
              onChange={(e) => set({ title: e.target.value })}
              placeholder="Masalan: Shartnoma"
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-slate-600">Reference turi</label>
            <select
              value={form.refType}
              onChange={(e) => set({ refType: e.target.value as RefType })}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white"
            >
              {refTypes.map((r) => (
                <option key={r} value={r}>
                  {refTypeLabel[r]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-600">Reference ID</label>
            <input
              value={form.refId}
              onChange={(e) => set({ refId: e.target.value })}
              placeholder="Masalan: ORD-789"
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-slate-600">Summa (ixtiyoriy)</label>
            <input
              value={form.amount ?? ""}
              onChange={(e) => set({ amount: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="1500000"
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-slate-600">Valyuta</label>
            <select
              value={form.currency}
              onChange={(e) => set({ currency: e.target.value as any })}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm bg-white"
            >
              <option value="UZS">UZS</option>
              <option value="USD">USD</option>
              <option value="RUB">RUB</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs text-slate-600">Izoh</label>
            <textarea
              value={form.note ?? ""}
              onChange={(e) => set({ note: e.target.value })}
              rows={3}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-end gap-2">
          <button onClick={onClose} className="rounded-2xl px-4 py-2 text-sm font-semibold bg-white border border-slate-200 hover:bg-slate-50">
            Bekor qilish
          </button>
          <button
            disabled={loading}
            onClick={submit}
            className="rounded-2xl px-4 py-2 text-sm font-semibold bg-slate-900 text-white hover:opacity-95 disabled:opacity-60"
          >
            {loading ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </div>
      </div>
    </div>
  );
}
