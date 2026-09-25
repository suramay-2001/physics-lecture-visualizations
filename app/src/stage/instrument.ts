/**
 * `window.__stage` (W-L1 §2.10): installed only in DEV or with `?measure`. The port of `window.__gate`.
 * W0 ships the counters the freeze criterion needs (contexts, views, beats, triggers, renders, frame
 * stats) plus drivers for tests (setU, reveal, motion). W1 adds scrollToBeat, settle, bench, contrast,
 * contrastAll, stageBg, loseContext. Playwright drives everything through this object.
 */
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { setMotion, setRevealed, setScroll, stage } from './store'
import { getViews } from './views'

interface Counters {
  contexts: number
  lost: number
  log: { type: string; at: number; w: number; h: number }[]
}
const G = globalThis as unknown as { __stageCounters?: Counters; __stage?: unknown }
const counters: Counters = G.__stageCounters ?? (G.__stageCounters = { contexts: 0, lost: 0, log: [] })

const WRAPPED = '__stageGetContextWrapped'
type Proto = HTMLCanvasElement & { [WRAPPED]?: boolean }

/** Count every WebGL context created on the page (ours or anyone's). Install before the Canvas mounts. */
function wrapGetContext() {
  if (typeof HTMLCanvasElement === 'undefined' || (HTMLCanvasElement.prototype as Proto)[WRAPPED]) return
  const orig = HTMLCanvasElement.prototype.getContext
  const seen = new WeakSet<object>()
  const wrapped = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
    const ctx = (orig as (this: HTMLCanvasElement, t: string, ...r: unknown[]) => unknown).call(this, type, ...rest)
    if (ctx && (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') && !seen.has(ctx as object)) {
      seen.add(ctx as object)
      counters.contexts++
      counters.log.push({ type, at: Math.round(performance.now()), w: this.width, h: this.height })
      this.addEventListener('webglcontextlost', () => counters.lost++, { once: true })
    }
    return ctx
  }
  HTMLCanvasElement.prototype.getContext = wrapped as typeof orig
  ;(HTMLCanvasElement.prototype as Proto)[WRAPPED] = true
}

/* ---------------- frame stats (StageHost calls frameStart / frameEnd) ---------------- */
const RING = 300
const frameMs: number[] = []
const intervals: number[] = []
let t0 = 0
let last = 0
export function frameStart() {
  const now = performance.now()
  t0 = now
  if (last > 0) {
    intervals.push(now - last)
    if (intervals.length > RING) intervals.shift()
  }
  last = now
}
export function frameEnd() {
  frameMs.push(performance.now() - t0)
  if (frameMs.length > RING) frameMs.shift()
}
function pct(buf: number[]) {
  if (!buf.length) return { n: 0, p50: NaN, p95: NaN, max: NaN }
  const s = [...buf].sort((a, b) => a - b)
  const q = (p: number) => s[Math.min(s.length - 1, Math.floor(p * (s.length - 1)))]
  const r = (x: number) => Math.round(x * 1000) / 1000
  return { n: s.length, p50: r(q(0.5)), p95: r(q(0.95)), max: r(s[s.length - 1]) }
}

export const enabled = (): boolean => import.meta.env.DEV || stage.measure

/** Install `window.__stage` (idempotent). Returns false when disabled (production without ?measure). */
export function installStageInstrument(): boolean {
  if (!enabled() || typeof window === 'undefined') return false
  wrapGetContext()
  if (G.__stage) return true
  G.__stage = {
    get contexts() {
      return counters.contexts
    },
    get contextsLost() {
      return counters.lost
    },
    contextLog: () => counters.log.slice(),
    /** Story ScrollTriggers alive (W1 creates `story:<unit>` triggers). */
    triggers: () => ScrollTrigger.getAll().filter((t) => String(t.vars.id ?? '').startsWith('story:')).length,
    beats: () =>
      Object.fromEntries(
        [...stage.units.values()].map((t) => [
          t.unitId,
          { beat: t.beat, beatId: t.beats[t.beat]?.id, u: t.u, uRaw: t.uRaw, near: t.near, onScreen: t.onScreen, revealed: [...t.revealed] },
        ]),
      ),
    views: () =>
      getViews().map((v) => ({
        key: v.key,
        kind: v.kind,
        weight: +v.weight.toFixed(4),
        slot: v.frame?.slot ?? null,
        rect: v.rect.map((x) => Math.round(x)),
        screen: v.screen?.map((x) => Math.round(x)) ?? null,
        failed: v.failed,
        renders: v.renders,
        hasCamera: !!v.camera,
      })),
    frame: (key: string) => getViews().find((v) => v.key === key)?.frame ?? null,
    renders: () => Object.fromEntries(getViews().map((v) => [v.key, v.renders])),
    stats: () => ({ frameMs: pct(frameMs), intervalMs: pct(intervals) }),
    setU: (unitId: string, u: number) => {
      const t = stage.units.get(unitId)
      if (t) setScroll(t, u)
      return !!t
    },
    reveal: (unitId: string, beat: number | string, on = true) => setRevealed(unitId, beat, on),
    motion: (on?: boolean) => {
      if (on !== undefined) setMotion(on)
      return stage.motion
    },
    store: stage,
  }
  return true
}
