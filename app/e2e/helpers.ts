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
declare global {
  interface Window {
    __stage?: StageApi
    __ctxCount?: number
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
