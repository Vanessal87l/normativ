export function safeParse<T>(v: string | null, fallback: T): T {
  try {
    return v ? (JSON.parse(v) as T) : fallback
  } catch {
    return fallback
  }
}

export function readLS<T>(key: string, fallback: T): T {
  return safeParse<T>(localStorage.getItem(key), fallback)
}

export function writeLS<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}
