/**
 * DPR governor (W-L1 §2.7), pure. The host feeds the frame time of every ON-SCREEN frame; each window of
 * 120 frames yields a p95. Two consecutive windows above 10 ms lower the cap by 0.5 (floor 1); five
 * consecutive windows under 5 ms raise it by 0.5 again (up to the device's own ratio, at most 2).
 */
export const GOVERNOR = { window: 120, highMs: 10, lowMs: 5, highWindows: 2, lowWindows: 5, step: 0.5, floor: 1, cap: 2 } as const

export interface GovernorState {
  cap: number
  buf: number[]
  highRun: number
  lowRun: number
  /** p95 of the last completed window (for instrumentation). */
  lastP95: number
}

export function governorInit(cap: number = GOVERNOR.cap): GovernorState {
  return { cap, buf: [], highRun: 0, lowRun: 0, lastP95: NaN }
}

export function p95(buf: readonly number[]): number {
  if (!buf.length) return NaN
  const s = [...buf].sort((a, b) => a - b)
  return s[Math.min(s.length - 1, Math.floor(0.95 * (s.length - 1)))]
}

/** Feed one on-screen frame time (ms). Returns the new cap when it changes, else null. */
export function governorFeed(g: GovernorState, ms: number, maxCap: number = GOVERNOR.cap): number | null {
  g.buf.push(ms)
  if (g.buf.length < GOVERNOR.window) return null
  const q = p95(g.buf)
  g.buf.length = 0
  g.lastP95 = q
  if (q > GOVERNOR.highMs) {
    g.highRun++
    g.lowRun = 0
    if (g.highRun >= GOVERNOR.highWindows && g.cap > GOVERNOR.floor) {
      g.highRun = 0
      g.cap = Math.max(GOVERNOR.floor, g.cap - GOVERNOR.step)
      return g.cap
    }
  } else if (q < GOVERNOR.lowMs) {
    g.lowRun++
    g.highRun = 0
    if (g.lowRun >= GOVERNOR.lowWindows && g.cap < maxCap) {
      g.lowRun = 0
      g.cap = Math.min(maxCap, g.cap + GOVERNOR.step)
      return g.cap
    }
  } else {
    g.highRun = 0
    g.lowRun = 0
  }
  return null
}

/** The host's governor (one canvas per session; read by window.__stage.governor()). */
export const hostGovernor: GovernorState = governorInit()
