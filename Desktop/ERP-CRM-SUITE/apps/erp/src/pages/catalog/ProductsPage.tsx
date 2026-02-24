import { useEffect, useMemo, useState } from "react"
import DashboardShell from "@/pages/Dashboard/components/DashboardShell"
import ProductCreateModal from "@/pages/Dashboard/components/ProductCreateModal"
import ProductsTable from "./components/ProductsTable"
import ProductCrudModal from "./components/ProductCrudModal"
import { productsApi, type Product } from "./api/ProductsApi"
import { Plus } from "lucide-react"

type Ui = "loading" | "error" | "ready"

export default function ProductsPage() {
  const [ui, setUi] = useState<Ui>("loading")
  const [err, setErr] = useState<string | null>(null)

  const [rows, setRows] = useState<Product[]>([])
  const [count, setCount] = useState(0)

  const [q, setQ] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 10
  const totalPages = useMemo(() => Math.max(1, Math.ceil(count / pageSize)), [count, pageSize])

  // modals
  const [openCreate, setOpenCreate] = useState(false)
  const [openCrud, setOpenCrud] = useState(false)
  const [mode, setMode] = useState<"view" | "edit" | "delete">("view")
  const [current, setCurrent] = useState<Product | null>(null)

  async function load() {
    try {
      setUi("loading")
      setErr(null)
      const res = await productsApi.list({
        search: q.trim() || undefined,
        page,
        page_size: pageSize,
      })
      setRows(res.rows)
      setCount(res.count)
      setUi("ready")
    } catch (e: any) {
      setUi("error")
      setErr(e?.message || "Mahsulotlar yuklashda xatolik")
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize])

  useEffect(() => {
    setPage(1)
    // q o‘zgarsa birinchi sahifaga qaytib load qilamiz
  }, [q])

  useEffect(() => {
    const t = setTimeout(() => load(), 250)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  function open(p: Product, m: "view" | "edit" | "delete") {
    setCurrent(p)
    setMode(m)
    setOpenCrud(true)
  }

  return (
    <DashboardShell>
      <div className="mt-4 rounded-2xl bg-white border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-lg font-extrabold text-slate-900">Mahsulotlar</div>
            {/* <div className="text-xs text-slate-500">GET/POST/PATCH/DELETE /api/v1/catalog/products/</div> */}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
              <span className="text-slate-400">🔎</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Qidirish..."
                className="w-64 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => setOpenCreate(true)}
              className="h-10 rounded-xl bg-slate-900 px-4 text-sm font-extrabold text-white hover:bg-slate-800 inline-flex items-center gap-2"
            >
              <Plus size={16} />
              Qo‘shish
            </button>
          </div>
        </div>

        <div className="mt-4">
          {ui === "loading" && <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm">Yuklanmoqda...</div>}
          {ui === "error" && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
              {err ?? "Xatolik"}
            </div>
          )}
          {ui === "ready" && (
            <>
              <ProductsTable
                rows={rows}
                onView={(p) => open(p, "view")}
                onEdit={(p) => open(p, "edit")}
                onDelete={(p) => open(p, "delete")}
              />

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  Jami: <b>{count}</b>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 disabled:opacity-50"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    ◀ Oldingi
                  </button>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    Sahifa: <b>{page}</b> / {totalPages}
                  </div>
                  <button
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 disabled:opacity-50"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Keyingi ▶
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* create modal (sizdagi) */}
      <ProductCreateModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreated={() => {
          setOpenCreate(false)
          load()
        }}
      />

      {/* view/edit/delete modal */}
      <ProductCrudModal
        open={openCrud}
        mode={mode}
        current={current}
        onClose={() => setOpenCrud(false)}
        onChanged={() => load()}
      />
    </DashboardShell>
  )
}
