import React, { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Bell,
  Search,
  LogOut,
  UserRound,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react"

type Props = { pinned: boolean; setPinned: (v: boolean) => void }

type AuthState = { token: string; email: string; createdAt: number }

// agar sendagi auth key boshqacha bo‘lsa shu yerda o‘zgartir
const AUTH_KEY = "crm_auth"

/** 🔥 GLOBAL SEARCH HIT */
type SearchHit = {
  kind: "customers" | "company" | "contact" | "sales" | "tasks" | "other"
  id: string
  title: string
  subtitle: string
  to: string
  when?: number
}

function cls(...a: Array<string | false | undefined | null>) {
  return a.filter(Boolean).join(" ")
}

function safeParse<T>(v: string | null, fallback: T): T {
  try {
    return v ? (JSON.parse(v) as T) : fallback
  } catch {
    return fallback
  }
}

function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [locked])
}

function fmtWhen(ms: number) {
  return new Date(ms).toLocaleString()
}

/** ✅ localStorage’da crm_* key’larni skaner qilib global db yasaydi */
function buildGlobalHits(query: string): SearchHit[] {
  const s = query.trim().toLowerCase()
  if (!s) return []

  const hits: SearchHit[] = []
  const deny = new Set([AUTH_KEY])

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key) continue
    if (!key.startsWith("crm_")) continue
    if (deny.has(key)) continue

    const raw = localStorage.getItem(key)
    if (!raw) continue

    const parsed = safeParse<any>(raw, null)
    if (!parsed) continue

    const arr: any[] = Array.isArray(parsed) ? parsed : [parsed]
    if (arr.length > 800) continue

    for (const item of arr) {
      if (!item || typeof item !== "object") continue

      const name =
        item.name ??
        item.full_name ??
        item.fullName ??
        item.title ??
        item.company_name ??
        item.companyName ??
        item.owner ??
        item.email ??
        ""

      if (!name) continue

      const desc =
        item.description ??
        item.desc ??
        item.note ??
        item.position ??
        item.channel ??
        item.phone ??
        item.email ??
        ""

      const hay = `${name} ${desc}`.toLowerCase()
      if (!hay.includes(s)) continue

      const lowerKey = key.toLowerCase()

      let kind: SearchHit["kind"] = "other"
      let to = "/app/dashboard"

      if (lowerKey.includes("customer") || lowerKey.includes("srm")) {
        kind = "customers"
        to = "/app/customers"
      } else if (lowerKey.includes("task")) {
        kind = "tasks"
        to = "/app/tasks"
      } else if (lowerKey.includes("sale") || lowerKey.includes("deal")) {
        kind = "sales"
        to = "/app/sales"
      } else if (lowerKey.includes("contact")) {
        kind = "contact"
        to = "/app/contact"
      } else if (lowerKey.includes("company") || lowerKey.includes("profile")) {
        kind = "company"
        to = "/app/company"
      }

      const id = String(item.id ?? item._id ?? `${key}_${Math.random().toString(36).slice(2)}`)

      const when =
        item.updatedAt ??
        item.updated_at ??
        item.createdAt ??
        item.created_at ??
        undefined

      const subtitleParts = [
        desc ? String(desc).slice(0, 40) : null,
        item.phone ? String(item.phone) : null,
        item.email ? String(item.email) : null,
        kind.toUpperCase(),
      ].filter(Boolean)

      hits.push({
        kind,
        id,
        title: String(name),
        subtitle: subtitleParts.join(" • "),
        to,
        when: typeof when === "number" ? when : undefined,
      })
    }
  }

  hits.sort((a, b) => (b.when ?? 0) - (a.when ?? 0))
  return hits.slice(0, 15)
}

export default function Topbar({ pinned, setPinned }: Props) {
  const nav = useNavigate()

  const [q, setQ] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)

  const [notifOpen, setNotifOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)

  const [logoutOpen, setLogoutOpen] = useState(false)

  const searchRef = useRef<HTMLDivElement | null>(null)
  const notifRef = useRef<HTMLDivElement | null>(null)
  const userRef = useRef<HTMLDivElement | null>(null)

  const [auth, setAuth] = useState<AuthState | null>(null)

  useScrollLock(logoutOpen)

  // ✅ auth ni realtime o‘qib turamiz
  useEffect(() => {
    const readAuth = () =>
      setAuth(safeParse<AuthState | null>(localStorage.getItem(AUTH_KEY), null))
    readAuth()

    const onStorage = (e: StorageEvent) => {
      if (e.key === AUTH_KEY) readAuth()
    }

    const onCrmData = () => readAuth()

    window.addEventListener("storage", onStorage)
    window.addEventListener("crm:data", onCrmData)
    window.addEventListener("focus", readAuth)

    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("crm:data", onCrmData)
      window.removeEventListener("focus", readAuth)
    }
  }, [])

  // ✅ global hits
  const hits = useMemo(() => buildGlobalHits(q), [q])

  // notifications: tasks key topilsa shundan olamiz
  const notifications = useMemo(() => {
    const candidates = ["crm_tasks", "crm_task", "crm_tasks_v1"]
    let tasks: any[] = []
    for (const k of candidates) {
      const v = safeParse<any>(localStorage.getItem(k), null)
      if (Array.isArray(v)) {
        tasks = v
        break
      }
    }

    return [...tasks]
      .filter(Boolean)
      .sort((a, b) => (b.updatedAt ?? b.createdAt ?? 0) - (a.updatedAt ?? a.createdAt ?? 0))
      .slice(0, 6)
      .map((t) => ({
        id: String(t.id ?? t._id ?? uid()),
        title: String(t.name ?? t.title ?? "Task"),
        when: Number(t.updatedAt ?? t.createdAt ?? Date.now()),
        meta: `${t.column ?? "TODO"} • ${t.priority ?? "GREEN"}`,
      }))
  }, [q, searchOpen])

  // outside click close
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (searchRef.current && !searchRef.current.contains(t)) setSearchOpen(false)
      if (notifRef.current && !notifRef.current.contains(t)) setNotifOpen(false)
      if (userRef.current && !userRef.current.contains(t)) setUserOpen(false)
    }
    window.addEventListener("mousedown", onDown)
    return () => window.removeEventListener("mousedown", onDown)
  }, [])

  // ESC logout modal close
  useEffect(() => {
    if (!logoutOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLogoutOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [logoutOpen])

  function goto(hit: SearchHit) {
    setSearchOpen(false)
    setQ("")
    nav(hit.to)
  }

  function requestLogout() {
    setUserOpen(false)
    setNotifOpen(false)
    setSearchOpen(false)
    setLogoutOpen(true)
  }

  function confirmLogout() {
    localStorage.removeItem(AUTH_KEY)
    window.dispatchEvent(new Event("crm:data"))
    setLogoutOpen(false)
    nav("/login", { replace: true })
  }

  return (
    <>
      <header
        className={cls(
          // ✅ popup'lar ustida turishi uchun
          "sticky top-4 z-[9999]",
          "w-full h-14 rounded-2xl px-4 sm:px-6 mb-10 flex items-center justify-between gap-3",
          "glass border border-white/10",
          "shadow-[0_20px_80px_-60px_rgba(0,0,0,0.9)]"
        )}
      >
        {/* LEFT */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setPinned(!pinned)}
            className={cls(
              "h-10 w-10 rounded-2xl grid place-items-center shrink-0",
              "border border-white/15 bg-white/5",
              "hover:bg-white/10 transition"
            )}
            title={pinned ? "Collapse sidebar" : "Pin sidebar"}
          >
            {pinned ? (
              <PanelLeftClose className="h-5 w-5 text-white/85" />
            ) : (
              <PanelLeftOpen className="h-5 w-5 text-white/85" />
            )}
          </button>

          <div className="min-w-0">
            <div className="text-sm font-extrabold text-white truncate">Dashboard</div>
            <div className="text-[11px] text-white/45 truncate hidden sm:block">
              Height CRM • Control Panel
            </div>
          </div>
        </div>

        {/* CENTER SEARCH */}
        <div ref={searchRef} className="relative hidden md:block w-[520px] max-w-[52vw]">
          <div
            className={cls(
              "h-10 rounded-2xl px-3 flex items-center gap-2",
              "border border-white/12 glass",
              "focus-within:ring-2 focus-within:ring-white/10 transition"
            )}
          >
            <Search className="h-4 w-4 text-white/55 shrink-0" />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value)
                setSearchOpen(true)
              }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Global search: customers, company, contact, sales, tasks…"
              className="w-full bg-transparent outline-none text-sm text-white placeholder:text-white/35"
            />
          </div>

          {/* ✅ FIX: fixed + z-index katta */}
          {searchOpen && q.trim() && (
            <div
              className={cls(
                "fixed z-[10000] rounded-2xl border border-white/10 overflow-hidden",
                "bg-[#071b3a] shadow-[0_30px_120px_-70px_rgba(0,0,0,0.95)]"
              )}
              style={{
                top: 86,
                left: "50%",
                transform: "translateX(-50%)",
                width: 520,
                maxWidth: "52vw",
              }}
            >
              <div className="px-4 py-3 border-b border-white/10 text-xs font-extrabold text-white/60">
                Results (global)
              </div>

              {hits.length === 0 ? (
                <div className="px-4 py-4 text-sm text-white/50">
                  Topilmadi. (Qidiruv hozir localStorage’dagi HAMMA crm_* datani qidiradi)
                </div>
              ) : (
                <div className="max-h-[340px] overflow-auto">
                  {hits.map((h) => (
                    <button
                      key={`${h.kind}_${h.id}`}
                      onClick={() => goto(h)}
                      className={cls(
                        "w-full text-left px-4 py-3",
                        "hover:bg-white/5 transition border-b border-white/5 last:border-b-0"
                      )}
                      title={h.to}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-extrabold text-white truncate">{h.title}</div>
                        <span className="text-[11px] px-2 py-1 rounded-full border border-white/10 bg-white/5 text-white/70 font-bold">
                          {h.kind.toUpperCase()}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-white/50">{h.subtitle}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Bell */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => {
                setNotifOpen((p) => !p)
                setUserOpen(false)
                setSearchOpen(false)
              }}
              className={cls(
                "h-10 w-10 rounded-2xl grid place-items-center",
                "border border-white/15 bg-white/5",
                "hover:bg-white/10 transition"
              )}
              title="Notifications"
            >
              <Bell className="h-5 w-5 text-white/80" />
            </button>

            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 rounded-full bg-white text-[#071b3a] text-[11px] font-extrabold grid place-items-center">
                {Math.min(9, notifications.length)}
              </span>
            )}

            {/* ✅ FIX: fixed + z-index katta */}
            {notifOpen && (
              <div
                className={cls(
                  "fixed z-[10000] w-[320px] rounded-2xl border border-white/10 overflow-hidden",
                  "bg-[#071b3a] shadow-[0_30px_120px_-70px_rgba(0,0,0,0.95)]"
                )}
                style={{ top: 86, right: 24 }}
              >
                <div className="px-4 py-3 border-b border-white/10 text-xs font-extrabold text-white/60">
                  Notifications
                </div>

                {notifications.length === 0 ? (
                  <div className="px-4 py-4 text-sm text-white/50">No activity yet</div>
                ) : (
                  <div className="max-h-[320px] overflow-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className="px-4 py-3 border-b border-white/5 last:border-b-0">
                        <div className="text-sm font-extrabold text-white truncate">{n.title}</div>
                        <div className="mt-1 text-xs text-white/50">{n.meta}</div>
                        <div className="mt-1 text-[11px] text-white/40">{fmtWhen(n.when)}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="p-3 border-t border-white/10">
                  <button
                    onClick={() => {
                      setNotifOpen(false)
                      nav("/app/tasks")
                    }}
                    className="w-full h-10 rounded-xl bg-white text-[#071b3a] font-extrabold text-sm hover:opacity-95 transition"
                  >
                    Open Tasks
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User */}
          <div ref={userRef} className="relative">
            <button
              onClick={() => {
                setUserOpen((p) => !p)
                setNotifOpen(false)
                setSearchOpen(false)
              }}
              className={cls(
                "h-10 pl-2 pr-3 rounded-2xl flex items-center gap-2",
                "border border-white/15 bg-white/5",
                "hover:bg-white/10 transition"
              )}
              title="User menu"
            >
              <div className="h-7 w-7 rounded-xl bg-white/10 border border-white/10 grid place-items-center">
                <UserRound className="h-4 w-4 text-white/75" />
              </div>

              <div className="hidden sm:block text-left">
                <div className="text-xs font-extrabold text-white leading-4">
                  {auth?.email ? auth.email.split("@")[0] : "Admin"}
                </div>
                <div className="text-[11px] text-white/45 leading-4">{auth?.email ?? "Signed in"}</div>
              </div>

              <ChevronDown className="h-4 w-4 text-white/60" />
            </button>

            {/* ✅ FIX: fixed + z-index katta */}
            {userOpen && (
              <div
                className={cls(
                  "fixed z-[10000] w-[260px] rounded-2xl border border-white/10 overflow-hidden",
                  "bg-[#071b3a] shadow-[0_30px_120px_-70px_rgba(0,0,0,0.95)]"
                )}
                style={{ top: 86, right: 24 }}
              >
                <div className="px-4 py-3 border-b border-white/10">
                  <div className="text-xs text-white/50 font-bold">Signed in as</div>
                  <div className="text-sm font-extrabold text-white truncate">{auth?.email ?? "Admin"}</div>
                </div>

                <button
                  onClick={() => {
                    setUserOpen(false)
                    nav("/app/company")
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-white/5 transition"
                >
                  <div className="text-sm font-extrabold text-white">Company</div>
                  <div className="mt-1 text-xs text-white/50">Profile & settings</div>
                </button>

                <div className="border-t border-white/10 p-3">
                  <button
                    onClick={requestLogout}
                    className="w-full h-10 rounded-xl bg-red-500/15 border border-red-400/25 text-red-200 font-extrabold text-sm hover:bg-red-500/20 transition flex items-center justify-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {logoutOpen && (
        <ConfirmModal
          title="Logout"
          description="Rostdan ham akkauntdan chiqmoqchimisiz?"
          confirmText="Yes, logout"
          cancelText="Cancel"
          onCancel={() => setLogoutOpen(false)}
          onConfirm={confirmLogout}
        />
      )}
    </>
  )
}

function ConfirmModal(props: {
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
}) {
  const { title, description, confirmText = "Confirm", cancelText = "Cancel", onConfirm, onCancel } = props

  return (
    <div className="fixed inset-0 z-[99999]" aria-modal="true" role="dialog">
      <div className="absolute inset-0 bg-slate-900/55 backdrop-blur-sm" onClick={onCancel} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-[460px] rounded-3xl bg-[#071b3a] border border-white/10 shadow-[0_30px_140px_-70px_rgba(0,0,0,0.95)] overflow-hidden">
          <div className="px-6 py-4 bg-[#0a2550] border-b border-white/10 flex items-center justify-between">
            <div className="text-lg font-extrabold text-white">{title}</div>
            <button
              onClick={onCancel}
              className="h-9 w-9 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 transition grid place-items-center text-white"
              title="Close"
            >
              ✕
            </button>
          </div>

          <div className="p-6">
            <div className="text-sm text-white/70 leading-6">{description}</div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={onCancel}
                className="h-11 px-5 rounded-2xl border border-white/15 bg-white/5 text-white font-extrabold hover:bg-white/10 transition"
              >
                {cancelText}
              </button>

              <button
                onClick={onConfirm}
                className="h-11 px-5 rounded-2xl bg-red-500/15 border border-red-400/25 text-red-200 font-extrabold hover:bg-red-500/20 transition"
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function uid() {
  return `x_${Math.random().toString(36).slice(2)}_${Date.now()}`
}
