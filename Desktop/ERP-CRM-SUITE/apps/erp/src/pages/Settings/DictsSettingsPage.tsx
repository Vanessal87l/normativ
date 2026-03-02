import { useEffect, useMemo, useState } from "react"
import DashboardShell from "@/pages/Dashboard/components/DashboardShell"
import {
  dictsApi,
  type UomRow,
  type MaterialTypeRow,
  type ProductCategoryRow,
  type WarehouseLocationRow,
} from "./Api/dictsApi"
import { Eye, Pencil, RotateCcw, Trash2 } from "lucide-react"

type TabKey = "uom" | "material" | "category" | "location"
type RowBase = { id: number; name: string; code?: string }

function cx(...a: Array<string | false | undefined | null>) {
  return a.filter(Boolean).join(" ")
}

function getApiErrorMessage(error: any, fallback: string) {
  const status = Number(error?.response?.status || 0)
  const data = error?.response?.data
  const detail = data?.detail ? String(data.detail) : ""
  const text = typeof data === "string" ? data : data ? JSON.stringify(data) : ""

  if (status === 409) {
    return detail || "Bog'langan ma'lumotlar bor. Shu sabab amal bajarilmadi."
  }
  if (status === 400 && (detail || text.toLowerCase().includes("already exists"))) {
    return detail || "Bunday qiymat allaqachon mavjud."
  }
  if (detail) return detail
  if (typeof data === "string" && data.trim()) return data
  return fallback
}

export default function DictsSettingsPage() {
  const tabs: Array<{ key: TabKey; title: string; subtitle: string }> = useMemo(
    () => [
      { key: "uom", title: "UoM", subtitle: "O'lchov birliklari (kg, dona, litr...)" },
      { key: "material", title: "Material Type", subtitle: "Xom ashyo turlari" },
      { key: "category", title: "Product Category", subtitle: "Mahsulot kategoriyalari" },
      { key: "location", title: "Warehouse Location", subtitle: "Ombor joylari" },
    ],
    []
  )

  const [tab, setTab] = useState<TabKey>("uom")

  return (
    <DashboardShell>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-lg font-extrabold text-slate-900">Ma'lumotnoma (Dicts)</div>
        <div className="mt-1 text-xs text-slate-500">Dropdown/selectlar shu yerdan to'ladi</div>

        <div className="mt-4 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cx(
                "h-9 rounded-lg border px-3 text-xs font-extrabold transition",
                tab === t.key
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              )}
            >
              {t.title}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        {tab === "uom" && (
          <DictSection<UomRow>
            title="UoM"
            subtitle="O'lchov birliklari"
            fetcher={dictsApi.listUom}
            detailer={dictsApi.getUom}
            creator={dictsApi.createUom}
            patcher={dictsApi.patchUom}
            deleter={dictsApi.deleteUom}
            restorer={dictsApi.restoreUom}
            supportsCode
          />
        )}

        {tab === "material" && (
          <DictSection<MaterialTypeRow>
            title="Material Type"
            subtitle="Xom ashyo turlari"
            fetcher={dictsApi.listMaterialTypes}
            detailer={dictsApi.getMaterialType}
            creator={dictsApi.createMaterialType}
            patcher={dictsApi.patchMaterialType}
            deleter={dictsApi.deleteMaterialType}
            restorer={dictsApi.restoreMaterialType}
          />
        )}

        {tab === "category" && (
          <DictSection<ProductCategoryRow>
            title="Product Category"
            subtitle="Mahsulot kategoriyalari"
            fetcher={dictsApi.listProductCategories}
            detailer={dictsApi.getProductCategory}
            creator={dictsApi.createProductCategory}
            patcher={dictsApi.patchProductCategory}
            deleter={dictsApi.deleteProductCategory}
            restorer={dictsApi.restoreProductCategory}
          />
        )}

        {tab === "location" && (
          <DictSection<WarehouseLocationRow>
            title="Warehouse Location"
            subtitle="Ombor joylari"
            fetcher={dictsApi.listWarehouseLocations}
            detailer={dictsApi.getWarehouseLocation}
            creator={dictsApi.createWarehouseLocation}
            patcher={dictsApi.patchWarehouseLocation}
            deleter={dictsApi.deleteWarehouseLocation}
            restorer={dictsApi.restoreWarehouseLocation}
          />
        )}
      </div>
    </DashboardShell>
  )
}

function DictSection<T extends RowBase>({
  title,
  subtitle,
  fetcher,
  detailer,
  creator,
  patcher,
  deleter,
  restorer,
  supportsCode = false,
}: {
  title: string
  subtitle: string
  fetcher: () => Promise<T[]>
  detailer: (id: number) => Promise<T>
  creator: (p: { name: string; code?: string }) => Promise<T>
  patcher: (id: number, p: { name?: string; code?: string }) => Promise<T>
  deleter: (id: number) => Promise<any>
  restorer: (id: number) => Promise<T>
  supportsCode?: boolean
}) {
  const [ui, setUi] = useState<"loading" | "ready" | "error">("loading")
  const [err, setErr] = useState<string | null>(null)
  const [rows, setRows] = useState<T[]>([])
  const [q, setQ] = useState("")

  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<"create" | "edit" | "view" | "delete">("create")
  const [current, setCurrent] = useState<T | null>(null)
  const [lastDeleted, setLastDeleted] = useState<T | null>(null)

  const [name, setName] = useState("")
  const [code, setCode] = useState("")

  async function load() {
    try {
      setUi("loading")
      setErr(null)
      const data = await fetcher()
      setRows(data)
      setUi("ready")
    } catch (e: any) {
      setUi("error")
      setErr(getApiErrorMessage(e, "Yuklashda xatolik"))
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase()
    if (!qq) return rows
    return rows.filter((r) => {
      const n = String(r.name ?? "").toLowerCase()
      const c = String(r.code ?? "").toLowerCase()
      return n.includes(qq) || c.includes(qq)
    })
  }, [rows, q])

  function openCreate() {
    setMode("create")
    setCurrent(null)
    setName("")
    setCode("")
    setErr(null)
    setOpen(true)
  }

  async function openView(r: T) {
    setMode("view")
    setCurrent(r)
    setName(r.name ?? "")
    setCode(r.code ?? "")
    setErr(null)
    setOpen(true)
    try {
      const full = await detailer(r.id)
      setCurrent(full)
      setName(full.name ?? "")
      setCode(full.code ?? "")
    } catch (e: any) {
      setErr(getApiErrorMessage(e, "Ma'lumotni olishda xatolik"))
    }
  }

  function openEdit(r: T) {
    setMode("edit")
    setCurrent(r)
    setName(r.name ?? "")
    setCode(r.code ?? "")
    setErr(null)
    setOpen(true)
  }

  function openDelete(r: T) {
    setMode("delete")
    setCurrent(r)
    setName(r.name ?? "")
    setCode(r.code ?? "")
    setErr(null)
    setOpen(true)
  }

  async function save() {
    try {
      setErr(null)

      const n = name.trim()
      const cRaw = code.trim()
      const c = supportsCode && cRaw ? cRaw.toUpperCase() : undefined

      if (!n) {
        setErr("Nomi majburiy.")
        return
      }

      if (supportsCode && mode === "create" && c) {
        const exists = rows.some((x) => String(x.code || "").trim().toUpperCase() === c)
        if (exists) {
          setErr(`Bu code (${c}) allaqachon mavjud. Boshqa code kiriting.`)
          return
        }
      }

      if (supportsCode && mode === "edit" && c && current) {
        const exists = rows.some(
          (x) => x.id !== current.id && String(x.code || "").trim().toUpperCase() === c
        )
        if (exists) {
          setErr(`Bu code (${c}) allaqachon mavjud. Boshqa code kiriting.`)
          return
        }
      }

      if (mode === "create") {
        const created = await creator({ name: n, code: c })
        setRows((prev) => [created, ...prev])
        setOpen(false)
        return
      }

      if (mode === "edit") {
        if (!current) return
        const updated = await patcher(current.id, { name: n, code: c })
        setRows((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
        setOpen(false)
      }
    } catch (e: any) {
      const text = JSON.stringify(e?.response?.data ?? "").toLowerCase()
      if (supportsCode && (text.includes("uom_code_key") || text.includes("duplicate"))) {
        setErr("Bu code allaqachon mavjud. Iltimos boshqa code kiriting.")
        return
      }
      setErr(getApiErrorMessage(e, "Saqlashda xatolik"))
    }
  }

  async function remove() {
    if (!current) return
    try {
      setErr(null)
      await deleter(current.id)
      setRows((prev) => prev.filter((x) => x.id !== current.id))
      setLastDeleted(current)
      setOpen(false)
    } catch (e: any) {
      setErr(getApiErrorMessage(e, "O'chirishda xatolik"))
    }
  }

  async function restoreLastDeleted() {
    if (!lastDeleted) return
    try {
      setErr(null)
      const restored = await restorer(lastDeleted.id)
      setRows((prev) => [restored, ...prev])
      setLastDeleted(null)
    } catch (e: any) {
      setErr(getApiErrorMessage(e, "Restore qilishda xatolik"))
    }
  }

  const headerCard = "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"

  return (
    <div className={headerCard}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm font-extrabold text-slate-900">{title}</div>
          <div className="text-xs text-slate-500">{subtitle}</div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
            <span className="text-slate-400">Q</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Qidirish (name/code)..."
              className="w-56 bg-transparent text-xs text-slate-700 placeholder:text-slate-400 outline-none"
            />
          </div>

          {lastDeleted ? (
            <button
              type="button"
              onClick={restoreLastDeleted}
              className="h-9 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-extrabold text-emerald-700 hover:bg-emerald-100"
            >
              <span className="inline-flex items-center gap-1">
                <RotateCcw size={14} />
                Restore
              </span>
            </button>
          ) : null}

          <button
            type="button"
            onClick={openCreate}
            className="app-btn-default h-9 rounded-lg px-4 text-xs font-extrabold"
          >
            + Qo'shish
          </button>
        </div>
      </div>

      {ui === "loading" && <div className="mt-4 text-xs text-slate-500">Yuklanmoqda...</div>}

      {ui === "error" && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {err || "Xatolik"}
        </div>
      )}

      {ui === "ready" && (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-6 py-4 font-bold">Name</th>
                <th className="px-6 py-4 font-bold">Code</th>
                <th className="px-6 py-4 font-bold">Created</th>
                <th className="px-6 py-4 text-right font-bold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-slate-500">
                    Hozircha ma'lumot yo'q.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="bg-white transition hover:bg-slate-50">
                    <td className="px-6 py-5 font-medium text-slate-900">{r.name}</td>
                    <td className="px-6 py-5 text-slate-600">{r.code ?? "-"}</td>
                    <td className="px-6 py-5 text-slate-600">-</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <IconBtn title="View" onClick={() => openView(r)}>
                          <Eye size={16} />
                        </IconBtn>
                        <IconBtn title="Edit" onClick={() => openEdit(r)}>
                          <Pencil size={16} />
                        </IconBtn>
                        <IconBtn danger title="Delete" onClick={() => openDelete(r)}>
                          <Trash2 size={16} />
                        </IconBtn>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <Modal
          title={
            mode === "create"
              ? "Yangi qo'shish"
              : mode === "edit"
                ? "Tahrirlash"
                : mode === "view"
                  ? "Ko'rish"
                  : "O'chirish"
          }
          err={err}
          onClose={() => setOpen(false)}
        >
          {mode === "delete" ? (
            <div>
              <div className="text-sm text-slate-700">
                Rostdan ham <b>{current?.name}</b> ni o'chirmoqchimisiz?
              </div>

              <div className="mt-5 flex items-center justify-end gap-2">
                <Btn onClick={() => setOpen(false)} variant="ghost">
                  Bekor
                </Btn>
                <Btn onClick={remove} variant="danger">
                  O'chirish
                </Btn>
              </div>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 gap-3">
                <Field label="Name *">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={mode === "view"}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none disabled:bg-slate-50"
                  />
                </Field>

                {supportsCode ? (
                  <Field label="Code (ixtiyoriy)">
                    <input
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      disabled={mode === "view"}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none disabled:bg-slate-50"
                      placeholder="Masalan: KG / PCS ..."
                    />
                  </Field>
                ) : null}
              </div>

              <div className="mt-5 flex items-center justify-end gap-2">
                <Btn onClick={() => setOpen(false)} variant="ghost">
                  {mode === "view" ? "Yopish" : "Bekor"}
                </Btn>

                {mode !== "view" && (
                  <Btn onClick={save} variant="primary">
                    Saqlash
                  </Btn>
                )}
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}

function IconBtn({
  children,
  title,
  onClick,
  danger,
}: {
  children: React.ReactNode
  title: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cx(
        "flex h-10 w-14 items-center justify-center rounded-2xl border transition",
        danger
          ? "!border-rose-200 !bg-rose-50 !text-rose-600 hover:!bg-rose-100"
          : "!border-slate-200 !bg-white !text-slate-700 hover:!bg-slate-50"
      )}
    >
      {children}
    </button>
  )
}

function Modal({
  title,
  children,
  onClose,
  err,
}: {
  title: string
  children: React.ReactNode
  onClose: () => void
  err: string | null
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-[560px] rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="text-lg font-extrabold text-slate-900">{title}</div>
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-extrabold text-slate-700 hover:bg-slate-50"
            >
              X
            </button>
          </div>

          {err && (
            <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {err}
            </div>
          )}

          <div className="mt-4">{children}</div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-extrabold text-slate-600">{label}</div>
      <div className="mt-1">{children}</div>
    </div>
  )
}

function Btn({
  children,
  onClick,
  variant,
}: {
  children: React.ReactNode
  onClick: () => void
  variant: "primary" | "ghost" | "danger"
}) {
  const cls =
    variant === "primary"
      ? "app-btn-default text-white"
      : variant === "danger"
        ? "bg-rose-600 text-white hover:bg-rose-700"
        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"

  return (
    <button type="button" onClick={onClick} className={cx("h-10 rounded-xl px-4 text-sm font-extrabold", cls)}>
      {children}
    </button>
  )
}
