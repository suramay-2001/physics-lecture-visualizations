/**
 * `window.__stage` (W-L1 §2.10): installed only in DEV or with `?measure`. The port of `window.__gate`.
 * Playwright drives everything through this object.
 *
 *   counters   contexts · contextsLost · contextLog()
 *   state      triggers() · beats() · views() · frame(key) · renders() · islands() · governor() · store
 *   drivers    setU(unit, u) · reveal(unit, beat, on) · motion(on?) · scrollToBeat(beatId, {wait}) · settle()
 *   measures   stats() · resetStats() · bench({frames, sync}) · contrast() · contrastAll() · stageBg()
 *   D's tools  bench(unit, us, frames) · contrast({ visible: true }) · overlaps() · audit(unit, us, waitMs) · render()
 *              (interface change D7: ported from D's `window.__stageD`, same methods and result shapes)
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
import { domReservedRects, type LabelRect } from './hooks'
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

/**
 * Overlay text a reader can see now (D's `labelsOn`): in a stage box, not hidden, opacity > 0.02, on screen,
 * with text.
 */
function visibleOverlayText(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>('.story-stage [data-contrast]')].filter((el) => {
    const r = el.getBoundingClientRect()
    const op = Number(getComputedStyle(el).opacity)
    return el.dataset.hidden !== '1' && op > 0.02 && r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && (el.textContent ?? '').trim() !== ''
  })
}

export interface VisibleContrastRow {
  text: string
  kind: string | undefined
  ratio: number
  noBacking: number
  worstPixel: string
}

/**
 * D's method (`__stageD.contrast()`): only the text a reader sees, and the element's own opacity (a fade)
 * scales both its backing and its ink over the brightest canvas pixel under it.
 */
function contrastVisible(): VisibleContrastRow[] {
  renderNow()
  const pageBg = parseRgba(getComputedStyle(document.body).backgroundColor)
  return visibleOverlayText().map((el) => {
    const r = el.getBoundingClientRect()
    const px = readRect(r)
    const cs = getComputedStyle(el)
    const opacity = Number(cs.opacity)
    const labelBg = parseRgba(cs.backgroundColor)
    const fg = parseRgba(cs.color)
    let worst: [number, number, number] = [0, 0, 0]
    let worstL = -1
    if (px)
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
    const eff = over([labelBg[0], labelBg[1], labelBg[2], labelBg[3] * opacity], worst)
    const ink = over([fg[0], fg[1], fg[2], fg[3] * opacity], eff)
    return {
      text: (el.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 40),
      kind: el.dataset.contrast,
      ratio: Math.round(ratio(relLum(...ink), relLum(...eff)) * 100) / 100,
      noBacking: Math.round(ratio(relLum(...over(fg, worst)), relLum(...worst)) * 100) / 100,
      worstPixel: hex(worst),
    }
  })
}

/** D §6.1 acceptance: visible labels vs reserved zones (+0 px), each other and the stage edges. [] = clean. */
function overlaps(): string[] {
  const out: string[] = []
  const visible = visibleOverlayText()
  for (const box of document.querySelectorAll<HTMLElement>('.story-stage')) {
    const b = box.getBoundingClientRect()
    const reserved = domReservedRects(box)
    const labels = visible.filter((el) => box.contains(el) && el.classList.contains('stage-label'))
    const rects = labels.map((el): LabelRect => {
      const r = el.getBoundingClientRect()
      return [r.left - b.left, r.top - b.top, r.width, r.height]
    })
    const hit = (a: LabelRect, c: LabelRect) => a[0] < c[0] + c[2] && a[0] + a[2] > c[0] && a[1] < c[1] + c[3] && a[1] + a[3] > c[1]
    rects.forEach((r, i) => {
      const t = (labels[i].textContent ?? '').trim()
      reserved.forEach((q) => hit(r, q) && out.push(`${t} × reserved[${q.map(Math.round).join(',')}]`))
      for (let j = i + 1; j < rects.length; j++) if (hit(r, rects[j])) out.push(`${t} × ${(labels[j].textContent ?? '').trim()}`)
      if (r[0] < 0 || r[1] < 0 || r[0] + r[2] > b.width || r[1] + r[3] > b.height) out.push(`${t} outside the stage`)
    })
  }
  return out
}

/**
 * Measure the settled look, not a 150 ms label fade (a throttled/background tab may not advance transitions).
 * A class on <html> (rule in story.css), not an injected <style>: the production CSP (style-src-elem 'self')
 * blocks inline style elements, so D's `__stageD.audit` logs a CSP violation in the preview build.
 */
export const MEASURING_CLASS = 'stage-measuring'
function freezeLabelFades(): () => void {
  const root = document.documentElement
  const had = root.classList.contains(MEASURING_CLASS)
  root.classList.add(MEASURING_CLASS)
  return () => {
    if (!had) root.classList.remove(MEASURING_CLASS)
  }
}

/** D's audit: contrast (visible, opacity-aware) + overlaps at each beat position u of `unit`. */
async function audit(unit: string, us: number[], waitMs = 260) {
  const track = stage.units.get(unit)
  if (!track) return null
  const rows: { u: number; labels: number; min: number; overlaps: number }[] = []
  let worst = Infinity
  let worstAt = ''
  const allOverlaps: string[] = []
  const unfreeze = freezeLabelFades()
  try {
    for (const u of us) {
      setScroll(track, u)
      renderNow()
      if (waitMs > 0) await sleep(waitMs)
      renderNow()
      const c = contrastVisible()
      for (const row of c)
        if (row.ratio < worst) {
          worst = row.ratio
          worstAt = `u=${u} "${row.text}" over ${row.worstPixel}`
        }
      const o = overlaps()
      allOverlaps.push(...o.map((x) => `u=${u}: ${x}`))
      rows.push({ u, labels: c.length, min: Math.min(...c.map((x) => x.ratio)), overlaps: o.length })
    }
  } finally {
    unfreeze()
  }
  return { worst, worstAt, overlaps: allOverlaps, rows }
}

/**
 * D's bench (`__stageD.bench(unit, us, frames)`): for each beat position u of `unit`, 5 warm-up frames, then
 * `frames` frames back-to-back, each fenced by a 1-pixel readPixels (CPU + GPU per frame).
 */
async function benchAt(unit: string, us: number[], frames = 60) {
  const track = stage.units.get(unit)
  const gl = hostGl
  if (!track || !gl) return null
  const px = new Uint8Array(4)
  const fence = () => {
    const ctx = gl.getContext()
    ctx.readPixels(0, 0, 1, 1, ctx.RGBA, ctx.UNSIGNED_BYTE, px)
  }
  const all: number[] = []
  const per: Record<string, unknown> = {}
  try {
    for (const u of us) {
      setScroll(track, u)
      isBenching = true
      for (let i = 0; i < 5; i++) {
        renderNow()
        fence()
      }
      const times: number[] = []
      for (let i = 0; i < frames; i++) {
        const t = performance.now()
        renderNow()
        fence()
        times.push(performance.now() - t)
      }
      isBenching = false
      all.push(...times)
      const r = gl.info.render
      per[u.toFixed(2)] = { ...pct(times), calls: r.calls, triangles: r.triangles }
      await sleep(0)
    }
  } finally {
    isBenching = false
  }
  const canvas = gl.domElement
  return { viewport: [innerWidth, innerHeight], canvas: [canvas.width, canvas.height], dpr: gl.getPixelRatio(), all: pct(all), per }
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
  const unfreeze = freezeLabelFades()
  try {
    for (const id of storyBeatIds()) {
      await scrollToBeat(id, { wait: false })
      for (const row of contrast()) {
        if (row.offscreen) continue
        const key = `${row.unit}|${row.kind}|${row.text}`
        const prev = worst.get(key)
        if (!prev || row.ratio < prev.ratio) worst.set(key, { ...row, atBeat: id })
      }
    }
  } finally {
    unfreeze()
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
async function bench(opts: { frames?: number; sync?: boolean; units?: string[] } | string = {}, us?: number[], framesAt?: number) {
  // D's signature (D7): bench(unit, us, frames) → per beat position u
  if (typeof opts === 'string') return benchAt(opts, us ?? [0.5], framesAt)
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
        /** Lab model per state (null for other kinds): a 'classical' beat shows no ± outcome (Round 3 #5). */
        models: states.map((s) => (s.kind === 'lab-r3' ? (s.model ?? 'quantum') : null)),
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
    /** Gate method over every overlay element; `{ visible: true }` = D's method (visible text, opacity-aware). */
    contrast: (opts?: { visible?: boolean }) => (opts?.visible ? contrastVisible() : contrast()),
    contrastAll,
    overlaps,
    audit,
    /** Render one frame now (r3f advance), e.g. before a pixel read. */
    render: renderNow,
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
