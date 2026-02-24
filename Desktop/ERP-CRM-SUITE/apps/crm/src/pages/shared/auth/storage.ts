import type { DemoUser, Session } from "./types"

const USERS_KEY = "crm_users"
const SESSION_KEY = "access_token"
const SESSION_META_KEY = "crm_session"

function safeParse<T>(v: string | null, fallback: T): T {
  try {
    return v ? (JSON.parse(v) as T) : fallback
  } catch {
    return fallback
  }
}

export function getUsers(): DemoUser[] {
  return safeParse<DemoUser[]>(localStorage.getItem(USERS_KEY), [])
}

export function saveUsers(users: DemoUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function registerUser(user: DemoUser) {
  const users = getUsers()
  const exists = users.some(u => u.email.toLowerCase() === user.email.toLowerCase())
  if (exists) throw new Error("Bu email allaqachon ro‘yxatdan o‘tgan.")

  users.push(user)
  saveUsers(users)
}

export function loginUser(email: string, password: string): Session {
  const users = getUsers()
  const found = users.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  )
  if (!found) throw new Error("Email yoki parol xato.")

  const session: Session = {
    access_token: `demo_${Math.random().toString(36).slice(2)}_${Date.now()}`,
    email: found.email,
    fullName: found.fullName,
  }

  localStorage.setItem(SESSION_KEY, session.access_token)
  localStorage.setItem(SESSION_META_KEY, JSON.stringify(session))
  return session
}

export function logout() {
  localStorage.removeItem(SESSION_KEY)
  localStorage.removeItem(SESSION_META_KEY)
}

export function getToken() {
  return localStorage.getItem(SESSION_KEY)
}

export function getSession(): Session | null {
  const raw = localStorage.getItem(SESSION_META_KEY)
  try {
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}