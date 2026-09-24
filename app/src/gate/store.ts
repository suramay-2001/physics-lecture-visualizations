/**
 * Phase-0 gate: the mutable scroll store and the `window.__gate` instrumentation.
 *
 * Scroll → state without React churn: ScrollTrigger tweens `sections[id].progress` (a plain number);
 * scenes read it inside useFrame. React state changes only when a section's active beat changes.
 */
import { advance } from '@react-three/fiber'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { WebGLRenderer, Texture } from 'three'

export type StageId = 'lab' | 'hopf' | 'bloch'
export const STAGES: StageId[] = ['lab', 'hopf', 'bloch']

export interface SectionState {
  /** Smoothed (scrubbed) progress through the section, 0..1. Scenes read this. */
  progress: number
  /** Raw ScrollTrigger progress, 0..1. */
  raw: number
  beat: number
  beats: number
}

type Ring = { buf: number[]; push(v: number): void }
const ring = (cap = 300): Ring => ({
  buf: [],
  push(v) {
    this.buf.push(v)
    if (this.buf.length > cap) this.buf.shift()
  },
})

export const store = {
  sections: {
    lab: { progress: 0, raw: 0, beat: 0, beats: 5 },
    hopf: { progress: 0, raw: 0, beat: 0, beats: 5 },
    bloch: { progress: 0, raw: 0, beat: 0, beats: 5 },
  } as Record<StageId, SectionState>,
  /** Section whose area crosses the viewport's center line (IntersectionObserver). */
  active: null as StageId | null,
  /** false under prefers-reduced-motion: scenes freeze their clocks and show the final beat. */
  motion: true,
  gl: null as WebGLRenderer | null,
  env: null as Texture | null,
  /** DOM axis labels and live readouts written by scenes (no React). Key: `${stage}:${name}`. */
  dom: new Map<string, HTMLElement>(),
  stageSize: {} as Record<string, { w: number; h: number }>,
  setFibers: null as null | ((n: 64 | 128) => void),
  fibers: 64 as 64 | 128,
  /** Time to build the merged Hopf fiber geometry for the current fiber count (ms). */
  hopfBuildMs: 0,
  syncGpu: false,
  /** true while bench() drives frames synchronously: keeps its frames out of the rAF statistics. */
  benching: false,
  frame: { t0: 0, last: 0 },
  samples: {
    all: ring(),
    interval: ring(),
    lab: ring(),
    hopf: ring(),
    bloch: ring(),
    none: ring(),
  },
  lastInfo: { calls: 0, triangles: 0, points: 0, lines: 0 },
  renders: { page: 0, lab: 0, hopf: 0, bloch: 0, sceneLab: 0, sceneHopf: 0, sceneMini: 0, sceneBloch: 0 },
  visits: 0,
  lastUnmountAt: -1e9,
}

/* ---------------- WebGL context counter (wrap getContext once per page load) ---------------- */
interface Counters {
  contexts: number
  lost: number
  log: { type: string; at: number; w: number; h: number }[]
}
const G = globalThis as unknown as { __gateCounters?: Counters }
const counters: Counters = G.__gateCounters ?? (G.__gateCounters = { contexts: 0, lost: 0, log: [] })

const WRAPPED = '__gateGetContextWrapped'
type Proto = HTMLCanvasElement & { [WRAPPED]?: boolean }
if (typeof HTMLCanvasElement !== 'undefined' && !(HTMLCanvasElement.prototype as Proto)[WRAPPED]) {
  const orig = HTMLCanvasElement.prototype.getContext
  const seen = new WeakSet<object>()
  const wrapped = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctx = (orig as any).call(this, type, ...rest)
    if (ctx && (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') && !seen.has(ctx)) {
      seen.add(ctx)
      counters.contexts++
      counters.log.push({ type, at: Math.round(performance.now()), w: this.width, h: this.height })
      this.addEventListener('webglcontextlost', () => counters.lost++, { once: true })
    }
    return ctx
  }
  HTMLCanvasElement.prototype.getContext = wrapped as typeof orig
  ;(HTMLCanvasElement.prototype as Proto)[WRAPPED] = true
}

/* ---------------- frame timing ---------------- */
export function frameStart() {
  const now = performance.now()
  store.frame.t0 = now
  if (store.benching) return
  if (store.frame.last > 0) store.samples.interval.push(now - store.frame.last)
  store.frame.last = now
}
export function frameEnd() {
  const gl = store.gl
  if (store.syncGpu && gl) {
    // A 1-pixel readback waits for the GPU to finish this frame: frameMs then includes GPU time.
    const px = new Uint8Array(4)
    const ctx = gl.getContext()
    ctx.readPixels(0, 0, 1, 1, ctx.RGBA, ctx.UNSIGNED_BYTE, px)
  }
  const ms = performance.now() - store.frame.t0
  if (!store.benching) {
    store.samples.all.push(ms)
    store.samples[store.active ?? 'none'].push(ms)
  }
  if (gl) {
    const r = gl.info.render
    store.lastInfo = { calls: r.calls, triangles: r.triangles, points: r.points, lines: r.lines }
  }
}

function pct(buf: number[]) {
  if (!buf.length) return { n: 0, p50: NaN, p95: NaN, max: NaN }
  const s = [...buf].sort((a, b) => a - b)
  const q = (p: number) => s[Math.min(s.length - 1, Math.floor(p * (s.length - 1)))]
  const r = (x: number) => Math.round(x * 1000) / 1000
  return { n: s.length, p50: r(q(0.5)), p95: r(q(0.95)), max: r(s[s.length - 1]) }
}

/* ---------------- contrast readout ---------------- */
const lin = (c: number) => {
  const v = c / 255
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}
const relLum = (r: number, g: number, b: number) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
const parseRgba = (s: string): [number, number, number, number] => {
  const m = s.match(/rgba?\(([^)]+)\)/)
  if (!m) return [0, 0, 0, 0]
  const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number)
  return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]
}
const over = (top: [number, number, number, number], under: [number, number, number]): [number, number, number] => [
  top[0] * top[3] + under[0] * (1 - top[3]),
  top[1] * top[3] + under[1] * (1 - top[3]),
  top[2] * top[3] + under[2] * (1 - top[3]),
]
const ratio = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
const hex = (c: number[]) => '#' + c.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')

function readRect(r: DOMRect) {
  const gl = store.gl
  if (!gl) return null
  const canvas = gl.domElement
  const cr = canvas.getBoundingClientRect()
  const sx = canvas.width / cr.width
  const sy = canvas.height / cr.height
  const x0 = Math.max(0, Math.floor((r.left - cr.left) * sx))
  const x1 = Math.min(canvas.width, Math.ceil((r.right - cr.left) * sx))
  const yTop = Math.max(0, Math.floor((r.top - cr.top) * sy))
  const yBot = Math.min(canvas.height, Math.ceil((r.bottom - cr.top) * sy))
  const w = x1 - x0
  const h = yBot - yTop
  if (w <= 0 || h <= 0) return null
  const ctx = gl.getContext()
  gl.state.bindFramebuffer(ctx.FRAMEBUFFER, null)
  const buf = new Uint8Array(w * h * 4)
  // WebGL's origin is bottom-left: flip y.
  ctx.readPixels(x0, canvas.height - yBot, w, h, ctx.RGBA, ctx.UNSIGNED_BYTE, buf)
  return { buf, w, h, dpr: sx }
}

export interface ContrastRow {
  id: string
  kind: string
  stage: string
  text: string
  ratio: number
  /** Text straight over the brightest canvas pixel, ignoring the label's own backing. */
  ratioNoBacking: number
  fg: string
  worstPixel: string
  effectiveBg: string
  px: number
  offscreen?: boolean
}

export function contrast(): ContrastRow[] {
  const out: ContrastRow[] = []
  const pageBg = parseRgba(getComputedStyle(document.body).backgroundColor)
  document.querySelectorAll<HTMLElement>('.gate-root [data-contrast]').forEach((el) => {
    const id = el.dataset.cid ?? el.dataset.contrast ?? '?'
    const stage = el.closest<HTMLElement>('[data-stage]')?.dataset.stage ?? '?'
    const base = { id, kind: el.dataset.contrast ?? '?', stage, text: (el.textContent ?? '').trim().replace(/\s+/g, ' ') }
    const r = el.getBoundingClientRect()
    const hidden = el.dataset.hidden === '1' || r.width === 0 || r.height === 0
    const onscreen = r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth
    const px = hidden || !onscreen ? null : readRect(r)
    if (!px) {
      out.push({ ...base, ratio: NaN, ratioNoBacking: NaN, fg: '', worstPixel: '', effectiveBg: '', px: 0, offscreen: true })
      return
    }
    const cs = getComputedStyle(el)
    const labelBg = parseRgba(cs.backgroundColor)
    const fgA = parseRgba(cs.color)
    let worst: [number, number, number] = [0, 0, 0]
    let worstL = -1
    for (let i = 0; i < px.buf.length; i += 4) {
      // un-premultiply and composite any transparent canvas pixel over the page background
      const a = px.buf[i + 3] / 255
      const c: [number, number, number] =
        a >= 1
          ? [px.buf[i], px.buf[i + 1], px.buf[i + 2]]
          : [px.buf[i] + pageBg[0] * (1 - a), px.buf[i + 1] + pageBg[1] * (1 - a), px.buf[i + 2] + pageBg[2] * (1 - a)]
      const L = relLum(c[0], c[1], c[2])
      if (L > worstL) {
        worstL = L
        worst = c
      }
    }
    const eff = over(labelBg, worst)
    const fgEff = over(fgA, eff)
    const fgRaw = over(fgA, worst)
    out.push({
      ...base,
      ratio: Math.round(ratio(relLum(...fgEff), relLum(...eff)) * 100) / 100,
      ratioNoBacking: Math.round(ratio(relLum(...fgRaw), relLum(...worst)) * 100) / 100,
      fg: hex(fgEff),
      worstPixel: hex(worst),
      effectiveBg: hex(eff),
      px: px.w * px.h,
    })
  })
  return out
}

/** Median pixel of an 8×8 probe near each stage's top-right corner (10 % down): relative luminance Y, CIE L*, HSL L. */
export function stageBg() {
  const out: Record<string, unknown> = {}
  document.querySelectorAll<HTMLElement>('.gate-root [data-view]').forEach((el) => {
    const r = el.getBoundingClientRect()
    if (r.bottom < 0 || r.top > innerHeight) return
    const probe = new DOMRect(r.right - 14, r.top + r.height * 0.1, 8, 8)
    const px = readRect(probe)
    if (!px) return
    const ls: [number, number, number][] = []
    for (let i = 0; i < px.buf.length; i += 4) ls.push([px.buf[i], px.buf[i + 1], px.buf[i + 2]])
    ls.sort((a, b) => relLum(...a) - relLum(...b))
    const c = ls[Math.floor(ls.length / 2)]
    const Y = relLum(...c)
    const Lstar = Y > 0.008856 ? 116 * Math.cbrt(Y) - 16 : 903.3 * Y
    const hslL = (Math.max(...c) + Math.min(...c)) / 2 / 255
    out[el.dataset.view!] = { hex: hex(c), Y: +Y.toFixed(4), Lstar: +Lstar.toFixed(1), hslLightness: +(hslL * 100).toFixed(1) }
  })
  return out
}

/**
 * Debug image of one stage: the canvas pixels under the stage plus its DOM labels redrawn on top.
 * Returns a blob: URL (open it in a tab). Useful where screenshots of the live page are unreliable.
 */
export async function snapshot(view: string = store.active ?? 'lab', scale = 1) {
  const gl = store.gl
  const el = document.querySelector<HTMLElement>(`.gate-root [data-view="${view}"]`)
  if (!gl || !el) return null
  const canvas = gl.domElement
  const cr = canvas.getBoundingClientRect()
  const k = canvas.width / cr.width
  const r = el.getBoundingClientRect()
  const out = document.createElement('canvas')
  out.width = Math.round(r.width * scale)
  out.height = Math.round(r.height * scale)
  const ctx = out.getContext('2d')!
  ctx.drawImage(canvas, (r.left - cr.left) * k, (r.top - cr.top) * k, r.width * k, r.height * k, 0, 0, out.width, out.height)
  const stageEl = el.closest<HTMLElement>('[data-stage]')
  stageEl?.querySelectorAll<HTMLElement>('[data-contrast]').forEach((lab) => {
    if (lab.dataset.hidden === '1' || (lab.closest('[data-stage]') !== stageEl && view !== 'hopf')) return
    const b = lab.getBoundingClientRect()
    const cs = getComputedStyle(lab)
    ctx.fillStyle = cs.backgroundColor
    ctx.fillRect((b.left - r.left) * scale, (b.top - r.top) * scale, b.width * scale, b.height * scale)
    ctx.fillStyle = cs.color
    ctx.font = `${parseFloat(cs.fontSize) * scale}px ${cs.fontFamily}`
    ctx.textBaseline = 'top'
    const pad = parseFloat(cs.paddingLeft) || 0
    ctx.fillText((lab.textContent ?? '').trim().replace(/\s+/g, ' '), (b.left - r.left + pad) * scale, (b.top - r.top + (parseFloat(cs.paddingTop) || 0)) * scale, (b.width - 2 * pad) * scale)
  })
  const blob = await new Promise<Blob | null>((res) => out.toBlob(res, 'image/png'))
  return blob ? URL.createObjectURL(blob) : null
}

/* ---------------- programmatic scroll ---------------- */
const nextFrame = () => new Promise<void>((res) => requestAnimationFrame(() => res()))
const sleep = (ms: number) => new Promise<void>((res) => setTimeout(res, ms))
const converged = () => STAGES.every((id) => Math.abs(store.sections[id].progress - store.sections[id].raw) < 5e-4)

/** Render one frame now via r3f's advance(): independent of requestAnimationFrame throttling. */
function renderNow() {
  if (store.gl) advance(performance.now())
}

/**
 * Jump every scrubbed value to its scroll target (what the scrub would reach after ~0.6 s). The scrub
 * tween itself is completed; otherwise its next tick would drag `progress` back to where it was.
 */
function snap() {
  for (const t of ScrollTrigger.getAll()) t.getTween()?.progress(1)
  for (const id of STAGES) {
    const s = store.sections[id]
    s.progress = s.raw
  }
}

/**
 * Wait for the scrub to settle (up to `timeout` ms of real frames), then snap whatever is left and
 * render two frames synchronously so the canvas shows exactly the target state.
 */
export async function settle(timeout = 2000) {
  const start = performance.now()
  let frames = 0
  while (performance.now() - start < timeout) {
    await Promise.race([nextFrame(), sleep(100)]) // rAF can be throttled in unfocused windows
    frames++
    if (frames >= 3 && converged()) break
  }
  snap()
  await commitAndRender()
}

/**
 * Two things update through React, not the frame loop: the caption (beat state) and drei View's
 * on/offscreen flag. Render once so a view notices it is on screen, let both React roots commit,
 * then render the final frame.
 */
async function commitAndRender() {
  await sleep(20)
  renderNow()
  await sleep(20)
  renderNow()
  renderNow()
}

/**
 * Scroll so beat `beat` of `section` sits at the viewport centre. `wait: true` (default) lets the scrub
 * animate for real; `wait: false` snaps immediately (deterministic, used by contrastAll and bench).
 */
export async function scrollToBeat(section: StageId | number, beat: number, opts: { wait?: boolean } = {}) {
  const id = typeof section === 'number' ? STAGES[section] : section
  const el = document.querySelector<HTMLElement>(`.gate-root [data-section="${id}"] [data-beat="${beat}"]`)
  if (!el) throw new Error(`no beat ${beat} in section ${id}`)
  const r = el.getBoundingClientRect()
  window.scrollTo({ top: window.scrollY + r.top + r.height / 2 - innerHeight / 2, behavior: 'instant' as ScrollBehavior })
  ScrollTrigger.update()
  store.active = id
  if (opts.wait === false) {
    snap()
    await commitAndRender()
  } else await settle()
  return { section: id, beat, progress: +store.sections[id].progress.toFixed(4), activeBeat: store.sections[id].beat }
}

export async function contrastAll() {
  const worst = new Map<string, ContrastRow & { section: string; beat: number }>()
  for (const id of STAGES) {
    for (let b = 0; b < store.sections[id].beats; b++) {
      await scrollToBeat(id, b, { wait: false })
      for (const row of contrast()) {
        if (row.offscreen || !row.id.startsWith(id)) continue
        const prev = worst.get(row.id)
        if (!prev || row.ratio < prev.ratio) worst.set(row.id, { ...row, section: id, beat: b })
      }
    }
  }
  return [...worst.values()].map((r) => ({ id: r.id, text: r.text, minRatio: r.ratio, atBeat: `${r.section}#${r.beat}`, ratioNoBacking: r.ratioNoBacking, worstPixel: r.worstPixel }))
}

/** Real-time tour: scroll through every beat with the live rAF loop, then report rAF frame stats. */
export async function tour(dwellMs = 1500) {
  resetStats()
  for (const id of STAGES) {
    for (let b = 0; b < store.sections[id].beats; b++) {
      await scrollToBeat(id, b)
      await sleep(dwellMs)
    }
  }
  return stats()
}

/**
 * Deterministic frame cost: for every beat of every section, render `frames` frames back-to-back via
 * advance(). With `sync` (default) each frame ends with a 1-pixel readPixels, so the time includes the
 * GPU finishing the frame. Unaffected by rAF throttling; not a vsync-paced measurement.
 */
export async function bench(opts: { frames?: number; sync?: boolean; sections?: StageId[] } = {}) {
  const frames = opts.frames ?? 60
  const sync = opts.sync ?? true
  const prevSync = store.syncGpu
  const perStage: Record<string, unknown> = {}
  try {
    for (const id of opts.sections ?? STAGES) {
      const all: number[] = []
      const perBeat: { p50: number; p95: number; triangles: number; calls: number }[] = []
      for (let b = 0; b < store.sections[id].beats; b++) {
        await scrollToBeat(id, b, { wait: false })
        store.benching = true
        store.syncGpu = sync
        for (let i = 0; i < 5; i++) renderNow() // warm-up: shader compile, uploads
        const times: number[] = []
        for (let i = 0; i < frames; i++) {
          const t0 = performance.now()
          renderNow()
          times.push(performance.now() - t0)
        }
        store.benching = false
        store.syncGpu = prevSync
        all.push(...times)
        const q = pct(times)
        perBeat.push({ p50: q.p50, p95: q.p95, triangles: store.lastInfo.triangles, calls: store.lastInfo.calls })
        await sleep(0)
      }
      perStage[id] = { ...pct(all), perBeat }
    }
  } finally {
    store.benching = false
    store.syncGpu = prevSync
  }
  const gl = store.gl
  return {
    mode: sync ? 'cpu+gpu per frame (readPixels fence)' : 'cpu submit only',
    framesPerBeat: frames,
    canvas: gl ? { width: gl.domElement.width, height: gl.domElement.height, dpr: gl.getPixelRatio() } : null,
    viewport: { w: innerWidth, h: innerHeight },
    fibers: store.fibers,
    perStage,
  }
}

export function resetStats() {
  for (const k of Object.keys(store.samples) as (keyof typeof store.samples)[]) store.samples[k].buf.length = 0
}

export function stats() {
  return {
    frameMs: {
      all: pct(store.samples.all.buf),
      lab: pct(store.samples.lab.buf),
      hopf: pct(store.samples.hopf.buf),
      bloch: pct(store.samples.bloch.buf),
      none: pct(store.samples.none.buf),
    },
    intervalMs: pct(store.samples.interval.buf),
    syncGpu: store.syncGpu,
    fibers: store.fibers,
    dpr: store.gl?.getPixelRatio() ?? null,
  }
}

export interface GateApi {
  readonly frameMs: number[]
  readonly intervalMs: number[]
  stats: typeof stats
  resetStats: typeof resetStats
  triggers: () => number
  readonly contexts: number
  readonly contextsLost: number
  readonly contextLog: Counters['log']
  readonly visits: number
  renderInfo: () => unknown
  contrast: typeof contrast
  contrastAll: typeof contrastAll
  stageBg: typeof stageBg
  scrollTo: typeof scrollToBeat
  settle: typeof settle
  tour: typeof tour
  bench: typeof bench
  setHopfFibers: (n: 64 | 128) => Promise<unknown>
  snapshot: typeof snapshot
  syncGpu: boolean
  beats: () => Record<StageId, { beat: number; progress: number; raw: number }>
  renders: () => typeof store.renders
  readonly active: StageId | null
  readonly reducedMotion: boolean
}

declare global {
  interface Window {
    __gate?: GateApi
  }
}

const api: GateApi = {
  get frameMs() {
    return [...store.samples.all.buf]
  },
  get intervalMs() {
    return [...store.samples.interval.buf]
  },
  stats,
  resetStats,
  triggers: () => ScrollTrigger.getAll().length,
  get contexts() {
    return counters.contexts
  },
  get contextsLost() {
    return counters.lost
  },
  get contextLog() {
    return counters.log
  },
  get visits() {
    return store.visits
  },
  renderInfo: () => {
    const gl = store.gl
    if (!gl) return null
    return {
      render: { ...store.lastInfo },
      memory: { geometries: gl.info.memory.geometries, textures: gl.info.memory.textures },
      programs: gl.info.programs?.length ?? null,
      hopf: { fibers: store.fibers, buildMs: store.hopfBuildMs },
      canvas: { width: gl.domElement.width, height: gl.domElement.height, dpr: gl.getPixelRatio() },
    }
  },
  contrast,
  contrastAll,
  stageBg,
  snapshot,
  scrollTo: scrollToBeat,
  settle,
  tour,
  bench,
  setHopfFibers: async (n) => {
    store.setFibers?.(n)
    await settle()
    return api.renderInfo()
  },
  get syncGpu() {
    return store.syncGpu
  },
  set syncGpu(v: boolean) {
    store.syncGpu = v
  },
  beats: () =>
    Object.fromEntries(
      STAGES.map((id) => [id, { beat: store.sections[id].beat, progress: +store.sections[id].progress.toFixed(4), raw: +store.sections[id].raw.toFixed(4) }]),
    ) as Record<StageId, { beat: number; progress: number; raw: number }>,
  renders: () => ({ ...store.renders }),
  get active() {
    return store.active
  },
  get reducedMotion() {
    return !store.motion
  },
}

if (typeof window !== 'undefined') window.__gate = api
