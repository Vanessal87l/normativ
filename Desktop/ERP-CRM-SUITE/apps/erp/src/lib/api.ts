import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios"
import { getAccessToken, getRefreshToken, setTokens, clearAuth } from "@/lib/auth"

export const API_BASE_URL = String((import.meta as any).env?.VITE_API_BASE_URL || "http://77.83.206.97").trim()

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
})

// ========================
// Request: token qo‘shish
// ========================
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ========================
// Response: 401 bo‘lsa refresh
// ========================
let isRefreshing = false
let queue: Array<(token: string | null) => void> = []

// Auth yaroqsiz bo'lsa sessiyani tozalab login sahifasiga o'tkazadi.
function forceLoginRedirect() {
  clearAuth()
  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.replace("/login")
  }
}

function flushQueue(token: string | null) {
  queue.forEach((cb) => cb(token))
  queue = []
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<any>) => {
    const original = error.config as any
    const status = error.response?.status
    const code = (error.response?.data as any)?.code
    const detail = (error.response?.data as any)?.detail

    const isTokenExpired =
      status === 401 &&
      (code === "token_not_valid" ||
        String(detail || "").toLowerCase().includes("token") ||
        String(detail || "").toLowerCase().includes("expired"))

    if (!isTokenExpired) {
      return Promise.reject(error)
    }

    // refresh endpointga tushib qolmaslik
    if (
      original?.url?.includes("/api/v1/accounts/refresh/") ||
      original?.url?.includes("/api/v1/accounts/token/refresh/")
    ) {
      forceLoginRedirect()
      return Promise.reject(error)
    }

    // qayta urinish flag
    if (original._retry) {
      forceLoginRedirect()
      return Promise.reject(error)
    }
    original._retry = true

    const refresh = getRefreshToken()
    if (!refresh) {
      forceLoginRedirect()
      return Promise.reject(error)
    }

    // Agar refresh ketayotgan bo‘lsa – navbatda kutamiz
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push((token) => {
          if (!token) return reject(error)
          original.headers.Authorization = `Bearer ${token}`
          resolve(api(original))
        })
      })
    }

    isRefreshing = true

    try {
      // ⚠️ refresh uchun alohida axios instance ishlatamiz (interceptorlar aralashmasin)
      const refreshRes = await axios.post(
        `${API_BASE_URL}/api/v1/accounts/refresh/`,
        { refresh },
        { headers: { "Content-Type": "application/json" }, timeout: 30000 }
      )

      const newAccess = (refreshRes.data as any)?.access
      const newRefresh = (refreshRes.data as any)?.refresh || refresh

      if (!newAccess) {
        forceLoginRedirect()
        flushQueue(null)
        return Promise.reject(error)
      }

      setTokens(newAccess, newRefresh)

      // navbatdagilarni uyg‘otamiz
      flushQueue(newAccess)

      // original requestni qayta yuboramiz
      original.headers.Authorization = `Bearer ${newAccess}`
      return api(original)
    } catch (e) {
      forceLoginRedirect()
      flushQueue(null)
      return Promise.reject(e)
    } finally {
      isRefreshing = false
    }
  }
)
