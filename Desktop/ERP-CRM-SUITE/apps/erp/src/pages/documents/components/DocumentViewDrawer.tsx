import React from "react"
import type { DocumentItem } from "../types/documents.types"
import { docStatusLabel, docTypeLabel, statusChipClass } from "../utils/documents.utils"
import { openPrintWindow } from "../utils/printDocument"
import DocumentAttachments from "./DocumentAttachments"
import DocumentPreview from "./DocumentPreview"
import Portal from "./Portal"

type Props = {
  open: boolean
  doc: DocumentItem | null
  onClose: () => void
}

export default function DocumentViewDrawer({ open, doc, onClose }: Props) {
  const handlePrint = () => {
    if (!doc) return
    openPrintWindow(doc)
  }

  // ESC -> close
  React.useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, onClose])

  // body scroll lock
  React.useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  return (
    <Portal>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <button
          aria-label="Close modal"
          onClick={onClose}
          className="absolute inset-0 bg-black/35"
        />

        {/* Modal */}
        <div className="relative w-full max-w-[720px] max-h-[85vh] overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-[0_28px_80px_rgba(2,6,23,0.35)]">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between">
            <div>
              <div className="text-base font-semibold text-slate-900">Hujjat</div>
              <div className="text-xs text-slate-500">Ko‘rish / Preview</div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                disabled={!doc}
                className="rounded-2xl px-3 py-2 text-sm font-semibold bg-slate-900 text-white hover:opacity-95 disabled:opacity-60"
              >
                Pechat
              </button>

              <button
                onClick={onClose}
                className="rounded-2xl px-3 py-2 text-sm border border-slate-200 hover:bg-slate-50"
              >
                Yopish
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="max-h-[calc(85vh-72px)] overflow-auto p-5 space-y-4">
            {!doc ? (
              <div className="py-10 text-center text-slate-500">Hujjat topilmadi</div>
            ) : (
              <>
                {/* Card */}
                <div className="rounded-3xl border border-slate-200 bg-slate-50/50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm text-slate-500">{doc.date}</div>
                      <div className="text-lg font-semibold text-slate-900">{doc.number}</div>
                      <div className="text-sm text-slate-700">
                        {docTypeLabel[doc.type]} • {doc.title}
                      </div>
                    </div>

                    <span
                      className={[
                        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                        statusChipClass(doc.status),
                      ].join(" ")}
                    >
                      {docStatusLabel[doc.status]}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-xs text-slate-500">Kontragent</div>
                      <div className="font-semibold text-slate-900">
                        {doc.kontragentName ?? "-"}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-slate-500">Reference</div>
                      <div className="font-semibold text-slate-900">
                        {doc.refType ? `${doc.refType}: ${doc.refId ?? "-"}` : "-"}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-slate-500">Summa</div>
                      <div className="font-semibold text-slate-900">
                        {doc.amount
                          ? `${Number(doc.amount).toLocaleString()} ${doc.currency ?? "UZS"}`
                          : "-"}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-slate-500">Mas’ul</div>
                      <div className="font-semibold text-slate-900">{doc.createdBy ?? "-"}</div>
                    </div>
                  </div>

                  {doc.note ? <div className="mt-3 text-sm text-slate-700">{doc.note}</div> : null}
                </div>

                {/* Attachments */}
                <DocumentAttachments doc={doc} />

                {/* Preview */}
                <DocumentPreview doc={doc} />
              </>
            )}
          </div>
        </div>
      </div>
    </Portal>
  )
}
