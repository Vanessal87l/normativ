import { useEffect, useMemo, useState } from "react"
import { adaptFinanceDashboard, ensureModel } from "./adapter"
import { buildDemoDashboard } from "./demo"
import type { FinanceDashboardModel } from "./types"
import { financeApi, type FinanceDashboardQuery } from "./financeApi"

type UiState = "idle" | "loading" | "error" | "success"

const USE_BACKEND = String((import.meta as any).env?.VITE_USE_BACKEND || "1") !== "0"

export function useFinanceDashboard(query: FinanceDashboardQuery) {
  const [ui, setUi] = useState<UiState>("idle")
  const [error, setError] = useState<string | null>(null)
  const [raw, setRaw] = useState<any>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      // ✅ backend o‘chiq bo‘lsa: demo
      if (!USE_BACKEND) {
        setUi("success")
        setError(null)
        setRaw(null)
        return
      }

      try {
        setUi("loading")
        setError(null)

        const data = await financeApi.getDashboard(query)
        if (cancelled) return

        setRaw(data ?? null)
        setUi("success")
      } catch (e: any) {
        if (cancelled) return
        setUi("error")
        setError(e?.message || "Moliya dashboard yuklashda xatolik")
        setRaw(null)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [query.range, query.search, reloadKey])

  const model: FinanceDashboardModel = useMemo(() => {
    const demo = buildDemoDashboard()
    const adapted = adaptFinanceDashboard(raw)
    return ensureModel(adapted ?? demo)
  }, [raw])

  function retry() {
    setReloadKey((k) => k + 1)
  }

  return {
    ui,
    error,
    model,
    retry,
    hasBackend: USE_BACKEND && !!raw,
  }
}
