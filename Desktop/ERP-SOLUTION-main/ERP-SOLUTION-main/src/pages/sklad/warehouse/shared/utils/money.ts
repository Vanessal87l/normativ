export function money(n: number) {
  const v = Number.isFinite(n) ? n : 0
  return `$${v.toFixed(2)}`
}
