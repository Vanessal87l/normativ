// src/shared/useMe.ts
export function getUserName(): string {
  try {
    const raw = localStorage.getItem("erp_user")
    const me = raw ? JSON.parse(raw) : null
    return me?.full_name || me?.username || "Foydalanuvchi"
  } catch {
    return "Foydalanuvchi"
  }
}
