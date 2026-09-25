/**
 * `window.__stage` (W-L1 §2.10): installed only in DEV or with `?measure`. The port of `window.__gate`.
 * Playwright drives everything through this object.
 *
 *   counters   contexts · contextsLost · contextLog()
 *   state      triggers() · beats() · views() · frame(key) · renders() · islands() · governor() · store
 *   drivers    setU(unit, u) · reveal(unit, beat, on) · motion(on?) · scrollToBeat(beatId, {wait}) · settle()
 *   measures   stats() · resetStats() · bench({frames, sync}) · contrast() · contrastAll() · stageBg()
 *   faults     loseContext() · restoreContext()
 *
 * Pixel reads render a frame with r3f's `advance()` and read it in the same task, so they work without
 * `preserveDrawingBuffer` (which only `?measure` turns on).
 */
import { advance } from '@react-three/fiber'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type * as THREE from 'three'
import { beatLayout, layoutStates, passportOf } from '../content/stage'
import { hostGovernor } from './governor'
import { getHostIslands } from './IslandPort'
import { setMotion, setRevealed, setScroll, snapAllScroll, stage } from './store'
import { STORY_TRIGGER_PREFIX } from './useStoryScroll'
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

/* ---------------- host renderer handle (StageHost Frame sets it) ---------------- */
let hostGl: THREE.WebGLRenderer | null = null
export function setHostGl(gl: THREE.WebGLRenderer | null) {
  hostGl = gl
}
let isBenching = false
export const benching = () => isBenching

/* ---------------- frame stats (StageHost calls frameStart / frameEnd) ---------------- */
const RING = 300
const frameMs: number[] = []
const intervals: number[] = []
let t0 = 0
let last = 0
let lastMs = 0
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
  lastMs = performance.now() - t0
  frameMs.push(lastMs)
  if (frameMs.length > RING) frameMs.shift()
}
/** CPU time of the last frame (Frame −1000 → 1000), for the DPR governor. */
export const lastFrameMs = () => lastMs
function pct(buf: number[]) {
  if (!buf.length) return { n: 0, p50: NaN, p95: NaN, max: NaN }
  const s = [...buf].sort((a, b) => a - b)
  const q = (p: number) => s[Math.min(s.length - 1, Math.floor(p * (s.length - 1)))]
  const r = (x: number) => Math.round(x * 1000) / 1000
  return { n: s.length, p50: r(q(0.5)), p95: r(q(0.95)), max: r(s[s.length - 1]) }
}

export const enabled = (): boolean => import.meta.env.DEV || stage.measure

/* ---------------- frames on demand ---------------- */
const nextFrame = () => new Promise<void>((res) => requestAnimationFrame(() => res()))
const sleep = (ms: number) => new Promise<void>((res) => setTimeout(res, ms))
/** Render one frame now, independent of rAF throttling (background tabs, unfocused panes). */
function renderNow() {
  if (hostGl) advance(performance.now())
}
/** Let React commit (caption, overlay) and render the final frame. */
async function commitAndRender() {
  await sleep(20)
  renderNow()
  await sleep(20)
  renderNow()
}
const converged = () => [...stage.units.values()].every((t) => Math.abs(t.u - t.uRaw) < 5e-4)

/** Wait for the scroll smoothing to settle (≤ timeout ms of real frames), snap what is left, render. */
async function settle(timeout = 2000) {
  const start = performance.now()
  let frames = 0
  while (performance.now() - start < timeout) {
    await Promise.race([nextFrame(), sleep(100)])
    frames++
    if (frames >= 3 && converged()) break
  }
  snapAllScroll()
  await commitAndRender()
}

/** The live beat article (or static beat) for a beat id. */
function beatEl(beatId: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`.story-beat[data-beat="${CSS.escape(beatId)}"]`) ?? document.querySelector<HTMLElement>(`[data-beat="${CSS.escape(beatId)}"]`)
}

/**
 * Scroll so the middle of beat `beatId` sits on the viewport centre line (the middle of its hold window).
 * `wait: false` snaps the smoothing immediately (deterministic under rAF throttling).
 */
async function scrollToBeat(beatId: string, opts: { wait?: boolean; at?: number } = {}) {
  const el = beatEl(beatId)
  if (!el) throw new Error(`no beat ${beatId}`)
  const r = el.getBoundingClientRect()
  const at = opts.at ?? 0.5
  window.scrollTo({ top: window.scrollY + r.top + r.height * at - innerHeight / 2, behavior: 'instant' as ScrollBehavior })
  ScrollTrigger.update()
  if (opts.wait === false) {
    snapAllScroll()
    await commitAndRender()
  } else await settle()
  const unitId = beatId.split(':')[0]
  const t = stage.units.get(unitId)
  return t ? { unit: unitId, beat: t.beat, beatId: t.beats[t.beat]?.id, u: +t.u.toFixed(4), uRaw: +t.uRaw.toFixed(4) } : { unit: unitId, beat: -1 }
}

/* ---------------- pixel reads ---------------- */
function parseRgba(s: string): [number, number, number, number] {
  const m = s.match(/rgba?\(([^)]+)\)/)
  if (!m) return [0, 0, 0, 0]
  const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number)
  return [p[0] ?? 0, p[1] ?? 0, p[2] ?? 0, p[3] ?? 1]
}
const lin = (c: number) => {
  const x = c / 255
  return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
}
const relLum = (r: number, g: number, b: number) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
const over = (fg: [number, number, number, number], bg: [number, number, number]): [number, number, number] => {
  const a = fg[3]
  return [fg[0] * a + bg[0] * (1 - a), fg[1] * a + bg[1] * (1 - a), fg[2] * a + bg[2] * (1 - a)]
}
const ratio = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
const hex = (c: number[]) => '#' + c.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')

/** Read the canvas pixels under a CSS rect. Call right after renderNow() in the same task. */
function readRect(r: { left: number; top: number; right: number; bottom: number }) {
  const gl = hostGl
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
  ctx.readPixels(x0, canvas.height - yBot, w, h, ctx.RGBA, ctx.UNSIGNED_BYTE, buf) // WebGL origin: bottom-left
  return { buf, w, h }
}

export interface ContrastRow {
  unit: string
  kind: string
  text: string
  ratio: number
  /** Text straight over the brightest canvas pixel, ignoring the label's own backing. */
  ratioNoBacking: number
  fg: string
  worstPixel: string
  effectiveBg: string
  offscreen?: boolean
}

/** Every `[data-contrast]` element in a live stage box vs the brightest canvas pixel under it (gate method). */
function contrast(): ContrastRow[] {
  renderNow()
  const out: ContrastRow[] = []
  const pageBg = parseRgba(getComputedStyle(document.body).backgroundColor)
  document.querySelectorAll<HTMLElement>('.story-stage [data-contrast]').forEach((el) => {
    const unit = el.closest<HTMLElement>('.story-stage')?.dataset.unit ?? '?'
    const base = { unit, kind: el.dataset.contrast ?? '?', text: (el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 80) }
    const r = el.getBoundingClientRect()
    const hidden = el.dataset.hidden === '1' || r.width === 0 || r.height === 0
    const onscreen = r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth
    const px = hidden || !onscreen ? null : readRect(r)
    if (!px) {
      out.push({ ...base, ratio: NaN, ratioNoBacking: NaN, fg: '', worstPixel: '', effectiveBg: '', offscreen: true })
      return
    }
    const cs = getComputedStyle(el)
    const labelBg = parseRgba(cs.backgroundColor)
    const fgA = parseRgba(cs.color)
    let worst: [number, number, number] = [0, 0, 0]
    let worstL = -1
    for (let i = 0; i < px.buf.length; i += 4) {
      const a = px.buf[i + 3] / 255
      const c: [number, number, number] =
        a >= 1 ? [px.buf[i], px.buf[i + 1], px.buf[i + 2]] : [px.buf[i] + pageBg[0] * (1 - a), px.buf[i + 1] + pageBg[1] * (1 - a), px.buf[i + 2] + pageBg[2] * (1 - a)]
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
    })
  })
  return out
}

const storyBeatIds = () => [...stage.units.values()].flatMap((t) => t.beats.map((b) => b.id))

/** Worst contrast per overlay element over every beat of every live story (and revealed clues). */
async function contrastAll() {
  const worst = new Map<string, ContrastRow & { atBeat: string }>()
  for (const id of storyBeatIds()) {
    await scrollToBeat(id, { wait: false })
    for (const row of contrast()) {
      if (row.offscreen) continue
      const key = `${row.unit}|${row.kind}|${row.text}`
      const prev = worst.get(key)
      if (!prev || row.ratio < prev.ratio) worst.set(key, { ...row, atBeat: id })
    }
  }
  return [...worst.values()].sort((a, b) => a.ratio - b.ratio)
}

/** Median pixel of an 8×8 probe near each live stage box's top-right corner (10 % down): Y, L*, HSL L. */
function stageBg() {
  renderNow()
  const out: Record<string, unknown> = {}
  document.querySelectorAll<HTMLElement>('.story-stage[data-unit]').forEach((el) => {
    const r = el.getBoundingClientRect()
    if (r.bottom < 0 || r.top > innerHeight) return
    const px = readRect({ left: r.right - 14, top: r.top + r.height * 0.1, right: r.right - 6, bottom: r.top + r.height * 0.1 + 8 })
    if (!px) return
    const ls: [number, number, number][] = []
    for (let i = 0; i < px.buf.length; i += 4) ls.push([px.buf[i], px.buf[i + 1], px.buf[i + 2]])
    ls.sort((a, b) => relLum(...a) - relLum(...b))
    const c = ls[Math.floor(ls.length / 2)]
    const Y = relLum(...c)
    const Lstar = Y > 0.008856 ? 116 * Math.cbrt(Y) - 16 : 903.3 * Y
    out[el.dataset.unit!] = { hex: hex(c), Y: +Y.toFixed(4), Lstar: +Lstar.toFixed(1) }
  })
  return out
}

/**
 * Deterministic frame cost per beat of every live story: render `frames` frames back-to-back via advance().
 * With `sync` (default) each frame ends with a 1-pixel readPixels, so the time includes the GPU finishing.
 */
async function bench(opts: { frames?: number; sync?: boolean; units?: string[] } = {}) {
  const frames = opts.frames ?? 60
  const sync = opts.sync ?? true
  const perUnit: Record<string, unknown> = {}
  const px = new Uint8Array(4)
  try {
    for (const t of stage.units.values()) {
      if (opts.units && !opts.units.includes(t.unitId)) continue
      const all: number[] = []
      const perBeat: { beat: string; p50: number; p95: number; calls: number; triangles: number }[] = []
      for (const b of t.beats) {
        await scrollToBeat(b.id, { wait: false })
        isBenching = true
        for (let i = 0; i < 5; i++) renderNow() // warm-up: shader compile, uploads
        const times: number[] = []
        for (let i = 0; i < frames; i++) {
          const s = performance.now()
          renderNow()
          if (sync && hostGl) {
            const ctx = hostGl.getContext()
            ctx.readPixels(0, 0, 1, 1, ctx.RGBA, ctx.UNSIGNED_BYTE, px)
          }
          times.push(performance.now() - s)
        }
        isBenching = false
        all.push(...times)
        const q = pct(times)
        perBeat.push({ beat: b.id, p50: q.p50, p95: q.p95, calls: hostGl?.info.render.calls ?? 0, triangles: hostGl?.info.render.triangles ?? 0 })
        await sleep(0)
      }
      perUnit[t.unitId] = { ...pct(all), perBeat }
    }
  } finally {
    isBenching = false
  }
  const gl = hostGl
  return {
    mode: sync ? 'cpu+gpu per frame (readPixels fence)' : 'cpu submit only',
    framesPerBeat: frames,
    canvas: gl ? { width: gl.domElement.width, height: gl.domElement.height, dpr: gl.getPixelRatio() } : null,
    viewport: { w: innerWidth, h: innerHeight },
    perUnit,
  }
}

let loseExt: { loseContext(): void; restoreContext(): void } | null = null

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
    /** Story ScrollTriggers alive (`story:<unit>`). */
    triggers: () => ScrollTrigger.getAll().filter((t) => String(t.vars.id ?? '').startsWith(STORY_TRIGGER_PREFIX)).length,
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
        warmups: v.warmups,
        portalSize: v.portalSize,
        hasCamera: !!v.camera,
      })),
    islands: () => [...getHostIslands()].map((i) => ({ key: i.key, renders: i.renders })),
    frame: (key: string) => getViews().find((v) => v.key === key)?.frame ?? null,
    /** What the content says beat `i` of `unitId` shows (tests compare the DOM and the views against it). */
    layoutOf: (unitId: string, i: number, revealed = false) => {
      const b = stage.units.get(unitId)?.beats[i]
      if (!b) return null
      const states = layoutStates(beatLayout(b, revealed))
      return {
        beatId: b.id,
        kinds: states.map((s) => s.kind),
        passports: states.map((s) => passportOf(s).title),
        caption: (revealed && b.reveal?.caption ? b.reveal.caption : b.caption) ?? null,
        hasReveal: !!b.reveal,
      }
    },
    renders: () => Object.fromEntries(getViews().map((v) => [v.key, v.renders])),
    stats: () => ({ frameMs: pct(frameMs), intervalMs: pct(intervals), dpr: hostGl?.getPixelRatio() ?? null }),
    resetStats: () => {
      frameMs.length = 0
      intervals.length = 0
    },
    governor: () => ({ cap: hostGovernor.cap, lastP95: hostGovernor.lastP95, pending: hostGovernor.buf.length, dprCap: stage.dprCap }),
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
    scrollToBeat,
    settle,
    bench,
    contrast,
    contrastAll,
    stageBg,
    /** Simulate a GPU reset (WEBGL_lose_context): every story swaps to StaticStory. */
    loseContext: () => {
      const gl = hostGl?.getContext()
      loseExt = (gl?.getExtension('WEBGL_lose_context') as typeof loseExt) ?? null
      loseExt?.loseContext()
      return !!loseExt
    },
    /** Restore it: the host remounts the Canvas once (a second loss within 60 s gives up). */
    restoreContext: () => {
      loseExt?.restoreContext()
      return !!loseExt
    },
    store: stage,
  }
  return true
}
