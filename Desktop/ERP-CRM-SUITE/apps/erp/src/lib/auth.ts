const ACCESS_KEY = "access_token"
const REFRESH_KEY = "refresh_token"
const AUTH_KEY = "erp_auth"

export function isAuthenticated(): boolean {
  return localStorage.getItem(AUTH_KEY) === "true" || !!localStorage.getItem(ACCESS_KEY)
}

export function setTokens(access: string, refresh?: string) {
  if (!access) throw new Error("Access token bo‘sh keldi")
  localStorage.setItem(ACCESS_KEY, access)
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh)
  localStorage.setItem(AUTH_KEY, "true")
}

export function clearAuth() {
  localStorage.removeItem(AUTH_KEY)
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem("erp_user")
}

// ✅ alias — clearTokens ishlatilgan joylar sinmasin
export const clearTokens = clearAuth

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY)
}
