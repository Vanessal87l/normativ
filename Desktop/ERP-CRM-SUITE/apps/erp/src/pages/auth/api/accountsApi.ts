import { api } from "@/lib/api"

export type AccountUser = {
  id: number
  username: string
  full_name?: string
  phone?: string
  email?: string
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export type LoginPayload = {
  username: string
  password: string
}

export type LoginResponse = {
  access: string
  refresh: string
  user?: AccountUser
}

export type RefreshPayload = {
  refresh: string
}

export type RefreshResponse = {
  access: string
  refresh?: string
}

export const accountsApi = {
  login(payload: LoginPayload) {
    return api.post<LoginResponse>("/api/v1/accounts/login/", payload).then((r) => r.data)
  },

  refresh(payload: RefreshPayload) {
    return api.post<RefreshResponse>("/api/v1/accounts/refresh/", payload).then((r) => r.data)
  },

  logout(payload: RefreshPayload) {
    return api.post("/api/v1/accounts/logout/", payload).then((r) => r.data)
  },

  me() {
    return api.get<AccountUser>("/api/v1/accounts/me/").then((r) => r.data)
  },

  patchMe(payload: Partial<Pick<AccountUser, "full_name" | "phone" | "email">>) {
    return api.patch<AccountUser>("/api/v1/accounts/me/", payload).then((r) => r.data)
  },

  changePassword(payload: { old_password: string; new_password: string }) {
    return api.post("/api/v1/accounts/change-password/", payload).then((r) => r.data)
  },
}
