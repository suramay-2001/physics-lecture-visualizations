/**
 * Playwright helpers over `window.__stage` (W-L1 §6.2). Types mirror app/src/stage/instrument.ts; e2e does
 * not import app code (different module resolution), so the page is the only source of truth.
 */
import { expect, type Page } from '@playwright/test'

export interface ViewInfo {
  key: string
  kind: string
  weight: number
  slot: string | null
  rect: number[]
  screen: number[] | null
  failed: boolean
  renders: number
  warmups: number
  portalSize: { width: number; height: number }
  hasCamera: boolean
}
export interface BeatInfo {
  beat: number
  beatId: string
  u: number
  uRaw: number
  near: boolean
  onScreen: boolean
  revealed: number[]
}
export interface LayoutInfo {
  beatId: string
  kinds: string[]
  /** Lab model per state, null for other kinds. */
  models: (string | null)[]
  passports: string[]
  caption: string | null
  hasReveal: boolean
}
export interface ContrastRow {
  unit: string
  kind: string
  text: string
  ratio: number
  atBeat?: string
  offscreen?: boolean
}
export interface VisibleContrastRow {
  text: string
  kind?: string
  ratio: number
  noBacking: number
  worstPixel: string
}
export interface Pct {
  n: number
  p50: number
  p95: number
  max: number
}
export interface BenchAt {
  viewport: number[]
  canvas: number[]
  dpr: number
  all: Pct
  per: Record<string, Pct & { calls: number; triangles: number }>
}
export interface AuditResult {
  worst: number
  worstAt: string
  overlaps: string[]
  rows: { u: number; labels: number; min: number; overlaps: number }[]
}
export interface StageApi {
  contexts: number
  contextsLost: number
  /** Frames the lecture host has drawn this session. */
  framesDrawn: number
  /** Page px of a physics point through view `key`'s camera (null when the view is off screen). */
  project: (key: string, p: [number, number, number]) => [number, number] | null
  /** View `key`'s camera in physics coordinates and its vertical fov (degrees). */
  camera: (key: string) => { position: [number, number, number]; up: [number, number, number]; fov: number | null } | null
  triggers: () => number
  beats: () => Record<string, BeatInfo>
  views: () => ViewInfo[]
  islands: () => { key: string; renders: number }[]
  frame: (key: string) => { t: number; clock: number; u: number; state: Record<string, unknown> } | null
  layoutOf: (unit: string, i: number, revealed?: boolean) => LayoutInfo | null
  motion: (on?: boolean) => boolean
  setU: (unit: string, u: number) => boolean
  reveal: (unit: string, beat: number | string, on?: boolean) => void
  scrollToBeat: (beatId: string, opts?: { wait?: boolean; at?: number }) => Promise<{ beat: number; beatId?: string; u: number; uRaw: number }>
  settle: () => Promise<void>
  contrast: ((opts?: { visible?: false }) => ContrastRow[]) & ((opts: { visible: true }) => VisibleContrastRow[])
  contrastAll: () => Promise<ContrastRow[]>
  stageBg: () => Record<string, { hex: string; Y: number; Lstar: number }>
  bench: ((opts?: { frames?: number; sync?: boolean }) => Promise<unknown>) & ((unit: string, us: number[], frames?: number) => Promise<BenchAt | null>)
  /** D's tools (interface change D7). */
  overlaps: () => string[]
  audit: (unit: string, us: number[], waitMs?: number) => Promise<AuditResult | null>
  render: () => void
  governor: () => { cap: number; lastP95: number; pending: number; dprCap: number }
  loseContext: () => boolean
  restoreContext: () => boolean
}
/** `window.__lab` (app/src/lab/instrument.ts), DEV or ?measure. */
export interface LabBenchResult {
  frames: number
  gui: 'on' | 'static' | 'off'
  p50: number
  p95: number
  max: number
  canvas: [number, number]
  viewport: [number, number]
  hardwareScaling: number
  activeMeshes: number
  environment: boolean
}
export interface LabApi {
  readonly contexts: number
  readonly contextsLost: number
  readonly live: number
  readonly framesDrawn: number
  readonly mounts: number
  readonly disposals: number
  readonly mounted: boolean
  engines: () => number
  tripwire: () => string[]
  setPhi: (deg: number) => void
  state: () => { phi: number; lost: boolean; givenUp: boolean; epoch: number }
  shot: (azDeg: number, elDeg: number, d: number, fovDeg: number) => boolean
  project: (p: [number, number, number], view?: string) => [number, number] | null
  beadScreen: () => [number, number] | null
  handleScreen: (id: string) => [number, number] | null
  bench: (opts?: { frames?: number; gui?: 'on' | 'static' | 'off'; drag?: string }) => Promise<LabBenchResult | null>
  loseContext: () => boolean
  /** The Operator Lab's hooks while its page is mounted (app/src/lab/instrument.ts OperatorLabApi). */
  readonly op: OperatorLabApi | null
}
export interface OperatorLabState {
  source: 'params' | 'cells'
  a0: number
  a: [number, number, number]
  tau: number
  preset: string | null
  B: string | null
  basis: 'z' | 'x' | 'y'
  split: 'lr' | 'tb'
  psi0: { named: string | null; theta: number; phi: number }
}
export interface OperatorLabApi {
  state: () => OperatorLabState
  readouts: () => { op: Record<string, string>; state: Record<string, string> }
  drag: (handle: string, points: [number, number, number][]) => void
  setup: (id: string) => void
}
declare global {
  interface Window {
    __stage?: StageApi
    __lab?: LabApi
    __ctxCount?: number
    /** DEV-only (src/openers/OpenersPreview.tsx): live `opener:*` ScrollTriggers */
    __openers?: { triggers: () => number }
  }
}

/** Collect console errors and page errors for the whole test. */
export function collectErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text())
  })
  page.on('pageerror', (e) => errors.push(String(e)))
  return errors
}

/** Count WebGL contexts from page start, independent of the app (works where __stage is never installed). */
export async function countContexts(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const orig = HTMLCanvasElement.prototype.getContext
    const seen = new WeakSet<object>()
    window.__ctxCount = 0
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
      const ctx = (orig as (this: HTMLCanvasElement, t: string, ...r: unknown[]) => unknown).call(this, type, ...rest)
      if (ctx && /webgl/.test(type) && !seen.has(ctx as object)) {
        seen.add(ctx as object)
        window.__ctxCount = (window.__ctxCount ?? 0) + 1
      }
      return ctx
    } as typeof orig
  })
}

/** Wait until the live stories are tracked and at least one view has drawn. */
export async function waitForStage(page: Page, units: number): Promise<void> {
  await page.waitForFunction((n) => !!window.__stage && Object.keys(window.__stage.beats()).length === n, units, { timeout: 20_000 })
}

/** Live story beat ids of a unit, in order (from the DOM). */
export async function beatIds(page: Page, unit: string): Promise<string[]> {
  return page.locator(`.story[data-unit="${unit}"] .story-beat`).evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.beat!))
}

export async function expectNoErrors(errors: string[]): Promise<void> {
  expect(errors, errors.join('\n')).toEqual([])
}
