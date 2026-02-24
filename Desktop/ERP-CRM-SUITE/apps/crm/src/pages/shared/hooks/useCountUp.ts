import { useEffect, useMemo, useState } from "react"

type Opts = {
  durationMs?: number
  decimals?: number
}

export function useCountUp(value: number, opts: Opts = {}) {
  const { durationMs = 700, decimals = 0 } = opts
  const [display, setDisplay] = useState(value)

  const factor = useMemo(() => Math.pow(10, decimals), [decimals])

  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const from = display
    const to = value

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs)
      const eased = 1 - Math.pow(1 - t, 3) // easeOutCubic
      const next = from + (to - from) * eased
      const rounded = Math.round(next * factor) / factor
      setDisplay(rounded)
      if (t < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, durationMs, factor])

  return display
}
