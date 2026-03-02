import React, { useEffect, useMemo, useState } from "react";
import type { TabKey, EntityMap, Mode, Employee, Client, Supplier } from "../../Api/types";
import { loadLS, saveLS } from "../../storage/storage";
import { apiAxios } from "../../Api/api.axios";
import { EmployeeForm } from "../../pages/xodimlar/Employee/EmployeeForm";
import { ClientForm } from "../../pages/xodimlar/Client/ClientForm";
import { SupplierForm } from "../../pages/xodimlar/Supplier/SupplierForm";
import { toast } from "react-toastify";
import DeleteAlertDialog from "@/components/common/DeleteAlertDialog";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import TableActionIconButton from "@/components/common/TableActionIconButton";

/** =========================
 *  Config
 *  ========================= */
const LS_KEY = "tabs_crud_pro_v1";
const USE_API = true;

type Store = {
  employee: Employee[];
  client: Client[];
  supplier: Supplier[];
};

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const nowISO = () => new Date().toISOString();

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

// ✅ type -> tab mapping
function tabFromType(t: any): TabKey {
  if (t === "EMPLOYEE") return "employee";
  if (t === "CLIENT") return "client";
  return "supplier";
}

/** =========================
 *  Typed Table Columns
 *  ========================= */
type ColumnDef<T> = {
  key: keyof T | "actions";
  title: string;
  render?: (row: T) => React.ReactNode;
};

type AnyTabDef =
  | { key: "employee"; label: string; addLabel: string; columns: ColumnDef<Employee>[] }
  | { key: "client"; label: string; addLabel: string; columns: ColumnDef<Client>[] }
  | { key: "supplier"; label: string; addLabel: string; columns: ColumnDef<Supplier>[] };

/** =========================
 *  Modal (Tailwind)
 *  ========================= */
function Modal({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4" onMouseDown={onClose}>
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div className="text-base font-extrabold text-slate-900">{title}</div>
          <button
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-extrabold text-slate-700 hover:bg-slate-100"
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-4">{children}</div>

        {footer ? <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">{footer}</div> : null}
      </div>
    </div>
  );
}

/** =========================
 *  Pagination (Tailwind)
 *  ========================= */
function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center gap-2">
        <button
          disabled={!canPrev}
          onClick={() => onPageChange(page - 1)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
        >
          Prev
        </button>

        <div className="text-xs text-slate-600">
          Page <span className="font-bold text-slate-900">{page}</span> /{" "}
          <span className="font-bold text-slate-900">{totalPages}</span>
        </div>

        <button
          disabled={!canNext}
          onClick={() => onPageChange(page + 1)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
        >
          Next
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-600">Rows:</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-800"
        >
          {[5, 10, 20, 50].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>

        <span className="text-xs text-slate-600">
          Total: <span className="font-bold text-slate-900">{total}</span>
        </span>
      </div>
    </div>
  );
}

/** =========================
 *  DataTable (Tailwind)
 *  ========================= */
function DataTable<T extends { id: string }>({
  columns,
  rows,
  onView,
  onEdit,
  onDelete,
  onRestore,
  onToggleActive,
}: {
  columns: ColumnDef<T>[];
  rows: T[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onRestore?: (id: string) => void;
  onToggleActive?: (id: string, nextActive: boolean) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {columns.map((c) => (
              <th key={String(c.key)} className="px-3 py-3 text-left text-xs font-extrabold text-slate-700">
                {c.title}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className="px-3 py-4 text-sm text-slate-600" colSpan={columns.length}>
                No data
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/60">
                {columns.map((c) => {
                  if (c.key === "actions") {
                    const anyRow = row as any;
                    const isActive = typeof anyRow?.isActive === "boolean" ? anyRow.isActive : undefined;
                    const deletedAt = anyRow?.deletedAt as string | null | undefined;

                    return (
                      <td key="actions" className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <TableActionIconButton title="View" onClick={() => onView(row.id)}>
                            <Eye size={16} />
                          </TableActionIconButton>
                          <TableActionIconButton title="Edit" onClick={() => onEdit(row.id)}>
                            <Pencil size={16} />
                          </TableActionIconButton>
                          <TableActionIconButton title="Delete" danger onClick={() => onDelete(row.id)}>
                            <Trash2 size={16} />
                          </TableActionIconButton>
                          {deletedAt && onRestore ? (
                            <button
                              type="button"
                              onClick={() => onRestore(row.id)}
                              className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 hover:bg-emerald-100"
                              title="Restore"
                            >
                              Restore
                            </button>
                          ) : null}
                          {!deletedAt && typeof isActive === "boolean" && onToggleActive ? (
                            <button
                              type="button"
                              onClick={() => onToggleActive(row.id, !isActive)}
                              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-100"
                              title="Toggle Active"
                            >
                              {isActive ? "Deactivate" : "Activate"}
                            </button>
                          ) : null}
                        </div>
                      </td>
                    );
                  }

                  const val = (row as any)[c.key as any];
                  return (
                    <td key={String(c.key)} className="px-3 py-3 text-sm text-slate-900">
                      {c.render ? c.render(row) : val ?? ""}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
/** =========================
 *  Main Component
 *  ========================= */
export default function TabsCrud() {
  const tabs: AnyTabDef[] = useMemo(
    () => [
      {
        key: "employee",
        label: "Employee",
        addLabel: "Add Employee",
        columns: [
          { key: "name", title: "Name" },
          { key: "position", title: "Position" },
          { key: "phone", title: "Phone" },
          { key: "salary", title: "Base Salary" },
          { key: "currency", title: "Currency" },
          { key: "isActive", title: "Active", render: (r) => (r.isActive ? "true" : "false") },
          { key: "deletedAt", title: "Deleted At", render: (r) => (r.deletedAt || "-") },
          { key: "createdAt", title: "Created", render: (r) => formatDate(r.createdAt) },
          { key: "actions", title: "Actions" },
        ],
      },
      {
        key: "client",
        label: "Client",
        addLabel: "Add Client",
        columns: [
          { key: "name", title: "Name" },
          { key: "notes", title: "Notes" },
          { key: "phone", title: "Phone" },
          { key: "taxId", title: "INN" },
          { key: "createdAt", title: "Created", render: (r) => formatDate(r.createdAt) },
          { key: "actions", title: "Actions" },
        ],
      },
      {
        key: "supplier",
        label: "Supplier",
        addLabel: "Add Supplier",
        columns: [
          { key: "notes", title: "Notes" },
          { key: "name", title: "Contact" },
          { key: "phone", title: "Phone" },
          { key: "taxId", title: "INN" },
          { key: "createdAt", title: "Created", render: (r) => formatDate(r.createdAt) },
          { key: "actions", title: "Actions" },
        ],
      },
    ],
    []
  );

  const [activeTab, setActiveTab] = useState<TabKey>("employee");

  const [store, setStore] = useState<Store>(() =>
    loadLS<Store>(LS_KEY, {
      employee: [],
      client: [],
      supplier: [],
    })
  );

  useEffect(() => {
    saveLS(LS_KEY, store);
  }, [store]);

  useEffect(() => {
    if (!USE_API) return;

    (async () => {
      try {
        // Employee ro'yxati alohida server-side pagination bilan yuklanadi.
        const [c, s] = await Promise.all([
          apiAxios.list("client").catch(() => []),
          apiAxios.list("supplier").catch(() => []),
        ]);
        setStore((p) => ({ ...p, client: c, supplier: s }));
      } catch (err) {
        console.error(err);
        alert("API list error. Console-ni tekshiring.");
      }
    })();
  }, []);

  const tabDef = tabs.find((t) => t.key === activeTab)!;

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [employeeStatus, setEmployeeStatus] = useState<"ALL" | "true" | "false">("ALL");
  const [employeeTotal, setEmployeeTotal] = useState(0);

  useEffect(() => {
    setPage(1);
  }, [activeTab, query]);

  useEffect(() => {
    if (!USE_API || activeTab !== "employee") return;

    (async () => {
      try {
        const res = await apiAxios.listEmployeesPage({
          page,
          page_size: pageSize,
          search: query || undefined,
          ordering: "-created_at",
          is_active: employeeStatus === "ALL" ? undefined : employeeStatus === "true",
        });
        setStore((p) => ({ ...p, employee: res.items }));
        setEmployeeTotal(res.total);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [activeTab, page, pageSize, query, employeeStatus]);

  const rows = store[activeTab] as EntityMap[typeof activeTab][];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((r) => {
      for (const [, v] of Object.entries(r as any)) {
        if (typeof v === "string" && v.toLowerCase().includes(q)) return true;
        if (typeof v === "number" && String(v).includes(q)) return true;
      }
      return false;
    });
  }, [rows, query]);

  const total = activeTab === "employee" ? employeeTotal : filtered.length;
  const paged = useMemo(() => {
    if (activeTab === "employee") return rows;
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [activeTab, filtered, page, pageSize, rows]);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("create");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Delete confirm dialog (shadcn) holati.
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const selectedRow = useMemo(() => {
    if (!selectedId) return null;
    return (store[activeTab] as any[]).find((x) => x.id === selectedId) ?? null;
  }, [activeTab, selectedId, store]);

  function openCreate() {
    setMode("create");
    setSelectedId(null);
    setModalOpen(true);
  }
  async function openView(id: string) {
    if (USE_API && activeTab === "employee") {
      try {
        // Detail endpointdan eng so'nggi employee ma'lumotini olib modalga beramiz.
        const detail = await apiAxios.detail("employee", id);
        setStore((p) => ({
          ...p,
          employee: (p.employee as any[]).map((x) => (x.id === id ? detail : x)),
        }));
      } catch (e: any) {
        toast.error(String(e?.response?.data?.detail || e?.message || "Employee detail xatolik"));
      }
    }
    setMode("view");
    setSelectedId(id);
    setModalOpen(true);
  }
  async function openEdit(id: string) {
    if (USE_API && activeTab === "employee") {
      try {
        const detail = await apiAxios.detail("employee", id);
        setStore((p) => ({
          ...p,
          employee: (p.employee as any[]).map((x) => (x.id === id ? detail : x)),
        }));
      } catch (e: any) {
        toast.error(String(e?.response?.data?.detail || e?.message || "Employee detail xatolik"));
      }
    }
    setMode("edit");
    setSelectedId(id);
    setModalOpen(true);
  }
  function closeModal() {
    setModalOpen(false);
    setSelectedId(null);
  }

  // ✅ create row TO target tab
  async function createRowTo(tabKey: TabKey, payload: any) {
    if (USE_API) {
      const created = await apiAxios.create(tabKey as any, payload);
      setStore((p) => ({ ...p, [tabKey]: [created, ...(p[tabKey] as any[])] }));
      return;
    }

    const created = { ...payload, id: uid(), createdAt: nowISO() };
    setStore((p) => ({ ...p, [tabKey]: [created, ...(p[tabKey] as any[])] }));
  }

  async function updateRow(id: string, payload: any) {
    if (USE_API) {
      const updated = await apiAxios.update(activeTab as any, id, payload);
      setStore((p) => ({
        ...p,
        [activeTab]: (p[activeTab] as any[]).map((x) => (x.id === id ? updated : x)),
      }));
      return;
    }

    setStore((p) => ({
      ...p,
      [activeTab]: (p[activeTab] as any[]).map((x) => (x.id === id ? { ...x, ...payload } : x)),
    }));
  }

  function requestDeleteRow(id: string) {
    setDeleteTargetId(id);
    setDeleteOpen(true);
  }

  async function removeRow(id: string) {
    try {
      setDeleting(true);
      if (USE_API) {
        await apiAxios.remove(activeTab as any, id);
        if (activeTab === "employee") {
          const res = await apiAxios.listEmployeesPage({
            page,
            page_size: pageSize,
            search: query || undefined,
            ordering: "-created_at",
            is_active: employeeStatus === "ALL" ? undefined : employeeStatus === "true",
          });
          setStore((p) => ({ ...p, employee: res.items }));
          setEmployeeTotal(res.total);
        } else {
          setStore((p) => ({ ...p, [activeTab]: (p[activeTab] as any[]).filter((x) => x.id !== id) }));
        }
      } else {
        setStore((p) => ({ ...p, [activeTab]: (p[activeTab] as any[]).filter((x) => x.id !== id) }));
      }
      toast.success("O'chirildi");
    } catch (e: any) {
      const data = e?.response?.data;
      const msg = typeof data === "string" ? data : data?.detail || e?.message || "Delete xatolik";
      toast.error(String(msg));
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
      setDeleteTargetId(null);
    }
  }

  async function restoreRow(id: string) {
    if (!USE_API) return;
    await apiAxios.restore(activeTab as any, id);
    if (activeTab === "employee") {
      const res = await apiAxios.listEmployeesPage({
        page,
        page_size: pageSize,
        search: query || undefined,
        ordering: "-created_at",
        is_active: employeeStatus === "ALL" ? undefined : employeeStatus === "true",
      });
      setStore((p) => ({ ...p, employee: res.items }));
      setEmployeeTotal(res.total);
    }
  }

  async function toggleActiveRow(id: string, nextActive: boolean) {
    if (!USE_API) return;
    if (nextActive) await apiAxios.activate(activeTab as any, id);
    else await apiAxios.deactivate(activeTab as any, id);
    if (activeTab === "employee") {
      const res = await apiAxios.listEmployeesPage({
        page,
        page_size: pageSize,
        search: query || undefined,
        ordering: "-created_at",
        is_active: employeeStatus === "ALL" ? undefined : employeeStatus === "true",
      });
      setStore((p) => ({ ...p, employee: res.items }));
      setEmployeeTotal(res.total);
    }
  }

  const formNode = useMemo(() => {
    // ✅ universal submit for create/edit
    const handleEntitySubmit = async (values: any) => {
      try {
        if (mode === "create") {
          const targetTab = tabFromType(values?.type);
          await createRowTo(targetTab, values);
          setActiveTab(targetTab); // ✅ AUTO TAB SWITCH
          toast.success("Yaratildi");
        }

        if (mode === "edit" && selectedId) {
          await updateRow(selectedId, values);
          toast.success("Yangilandi");
        }

        closeModal();
      } catch (e: any) {
        const data = e?.response?.data
        const msg =
          typeof data === "string"
            ? data
            : data?.detail || (data ? JSON.stringify(data) : e?.message || "Saqlashda xatolik")
        toast.error(msg)
        console.error("TabsCrud submit error:", e)
      }
    };

    if (activeTab === "employee") {
      return (
        <EmployeeForm
          mode={mode}
          defaultValues={mode === "create" ? { type: "EMPLOYEE" } as any : (selectedRow as any) ?? undefined}
          onSubmit={handleEntitySubmit as any}
        />
      );
    }

    if (activeTab === "client") {
      return (
        <ClientForm
          mode={mode}
          defaultValues={mode === "create" ? { type: "CLIENT" } as any : (selectedRow as any) ?? undefined}
          onSubmit={handleEntitySubmit as any}
        />
      );
    }

    return (
      <SupplierForm
        mode={mode}
        defaultValues={mode === "create" ? { type: "SUPPLIER" } as any : (selectedRow as any) ?? undefined}
        onSubmit={handleEntitySubmit as any}
      />
    );
  }, [activeTab, mode, selectedId, selectedRow]);

  return (
    <div className="p-4 font-sans text-slate-900 min-h-[570px]">
      {/* Tabs */}
      <div className="flex w-fit gap-2 rounded-full bg-slate-200 p-2">
        {tabs.map((t) => {
          const isActive = t.key === activeTab;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={[
                "rounded-full px-4 py-2 text-sm font-bold transition",
                isActive ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" : "bg-transparent text-slate-900 hover:bg-white",
              ].join(" ")}
              type="button"
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="mt-4 mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="text-lg font-black">{tabDef.label} list</div>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="w-[320px] max-w-[78vw] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900"
          />
          {activeTab === "employee" ? (
            <select
              value={employeeStatus}
              onChange={(e) => {
                setEmployeeStatus(e.target.value as "ALL" | "true" | "false");
                setPage(1);
              }}
              className="w-[220px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900"
            >
              <option value="ALL">Status: barchasi</option>
              <option value="true">Faqat aktiv</option>
              <option value="false">Faqat noaktiv</option>
            </select>
          ) : null}
          <div className="text-xs text-slate-600">
            Items: <span className="font-bold text-slate-900">{total}</span>
          </div>
        </div>

        <button
          className="w-fit rounded-xl bg-slate-900 px-4 py-2 text-sm font-extrabold text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800"
          onClick={openCreate}
          type="button"
        >
          + {tabDef.addLabel}
        </button>
      </div>

      {/* Table */}
      <DataTable
        columns={tabDef.columns as any}
        rows={paged as any}
        onView={openView}
        onEdit={openEdit}
        onDelete={requestDeleteRow}
        onRestore={restoreRow}
        onToggleActive={toggleActiveRow}
      />

      {/* Pagination */}
      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={(s) => {
          setPageSize(s);
          setPage(1);
        }}
      />

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={mode === "create" ? tabDef.addLabel : mode === "edit" ? `Edit ${tabDef.label}` : `View ${tabDef.label}`}
        footer={
          <div className="flex justify-end">
            <button
              onClick={closeModal}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-extrabold text-slate-900 hover:bg-slate-100"
              type="button"
            >
              Close
            </button>
          </div>
        }
      >
        {formNode}
      </Modal>

      <DeleteAlertDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeleteTargetId(null);
        }}
        title="O'chirish"
        description="Rostdan ham tanlangan yozuvni o'chirmoqchimisiz?"
        loading={deleting}
        onConfirm={() => {
          if (deleteTargetId) void removeRow(deleteTargetId);
        }}
      />
    </div>
  );
}

