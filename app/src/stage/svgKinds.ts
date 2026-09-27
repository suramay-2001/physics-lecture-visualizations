/**
 * The SVG route's registry (W-709-platform §E "Stage kinds": `KIND_RENDER`). THREE-FREE and ENGINE-FREE, so it sits in
 * the main chunk; the kinds themselves live in the lazy `stage/svg/` chunk (their resolvers call physics/qc, which
 * must never reach the entry closure: build/chunks.test.ts (h)), and register here when it loads.
 *
 * An SVG kind is one definition: its resolver (content → numbers, every observable from the engine), its interpolator
 * (interpolate inputs, recompute outputs, as stage/interp.ts), its validator, its overlay readouts, and ONE scene
 * component drawn in two modes: 'stage' (the live stage box, the reading version) and 'print' (the numbered print
 * figure, ink palette from styles/print.css). So the print figure IS the stage picture.
 *
 * stage/resolve.ts `resolve` / `validateStage` / `validateLayout` and stage/interp.ts `interpolate` hand an SVG kind to
 * its definition, so every caller (drive.ts, FigureFor, the content tests) is unchanged. A page whose chapter uses an
 * SVG kind waits for `loadSvgKinds()` before it renders (pages/LecturePage.tsx `useSvgKinds`).
 */
import { useEffect, useState, type ComponentType } from 'react'
import type { StageKind, StageState, StateOf } from '../content/stage'
import { KIND_RENDER } from '../content/stage'
import type { Anchor } from '../content/stageVocab'
import type { Resolved } from './types'

/** 'stage': the dark stage palette (stage/svg/svg.css maps the stage ink tokens); 'print': the print figure's ink. */
export type SvgMode = 'stage' | 'print'

export interface SvgSceneProps<K extends StageKind> {
  /** Interpolated and physics-consistent (observables recomputed), as a WebGL scene's `f.state`. */
  state: Resolved<K>
  mode: SvgMode
  /** The drawing box in CSS px (stage: the slot rect; print: the figure's viewBox). */
  width: number
  height: number
  /** The hovered term's anchor when it targets this kind (stage mode). */
  focus?: Anchor | null
  /**
   * No overlay around the drawing (the reading version's picture, a Try-it widget): small margins instead of the room
   * the live stage keeps for the passport, the readout column and the caption; the readouts are drawn as text lines.
   */
  bare?: boolean
}

/** One overlay readout of an SVG view (plain text; numbers formatted from the resolved state only). */
export interface SvgReadout {
  name: string
  text: string
  tone?: 'text' | 'plus' | 'minus' | 'state' | 'silver' | 'op'
}

export interface SvgKindDef<K extends StageKind = StageKind> {
  kind: K
  resolve: (st: StateOf<K>, s: number) => Resolved<K>
  interpolate: (a: Resolved<K>, b: Resolved<K>, t: number) => Resolved<K>
  /** Problems with one state ([] = valid); resolve.ts adds the shot and non-finite checks. */
  validate: (st: StateOf<K>) => string[]
  /** Problems between the states of one layout (e.g. amplitudes read from the circuit beside them). */
  validateLayout?: (states: readonly StageState[]) => string[]
  /** Readouts for the overlay's readout column (and the figure's text lines). */
  readouts: (r: Resolved<K>) => SvgReadout[]
  Scene: ComponentType<SvgSceneProps<K>>
  /** The print figure's viewBox. */
  print: { w: number; h: number }
}

const defs = new Map<StageKind, SvgKindDef>()

/** Called by the lazy kind modules when they load (stage/svg/kinds.ts). Idempotent per kind. */
export function registerSvgKind<K extends StageKind>(def: SvgKindDef<K>): void {
  if (KIND_RENDER[def.kind] !== 'svg') throw new Error(`registerSvgKind: ${def.kind} is a WebGL kind (content/stage.ts KIND_RENDER)`)
  defs.set(def.kind, def as unknown as SvgKindDef)
}

/** The definition of an SVG kind, or undefined while the lazy chunk has not loaded. */
export function svgKindDef<K extends StageKind>(kind: K): SvgKindDef<K> | undefined {
  return defs.get(kind) as SvgKindDef<K> | undefined
}

/** The definition, or a clear error: resolve() on an SVG kind needs its chunk (`loadSvgKinds()`). */
export function requireSvgKind<K extends StageKind>(kind: K): SvgKindDef<K> {
  const d = svgKindDef(kind)
  if (!d) throw new Error(`stage kind "${kind}" is drawn as SVG and its module has not loaded: await loadSvgKinds() first (stage/svgKinds.ts)`)
  return d
}

/** Every registered SVG kind (for cross-kind layout checks). */
export const registeredSvgKinds = (): SvgKindDef[] => [...defs.values()]

/** Are these kinds drawable now? (WebGL kinds always are, as far as this registry is concerned.) */
export const svgKindsReady = (kinds: readonly StageKind[]): boolean => kinds.every((k) => KIND_RENDER[k] !== 'svg' || defs.has(k))

/** The live layer's props (stage/svg/SvgStage.tsx). */
export interface SvgStageProps {
  unitId: string
  kinds: readonly StageKind[]
  ownsClock: boolean
}
let stageLayer: ComponentType<SvgStageProps> | null = null
/**
 * The live layer, once its chunk has loaded (components/StoryStage.tsx renders it directly then: a React.lazy boundary
 * would hold a mounted story's first SVG picture back by React's Suspense reveal throttle, ~300 ms).
 */
export const svgStageLayer = (): ComponentType<SvgStageProps> | null => stageLayer

let loading: Promise<void> | null = null
/**
 * Load the SVG kinds' chunk once per session (a failed chunk may load on the next attempt): the live layer
 * (svg/SvgStage.tsx, which registers every kind through svg/kinds.ts), so a story's SVG views mount at once.
 */
export function loadSvgKinds(): Promise<void> {
  loading ??= import('./svg/SvgStage').then(
    (m) => {
      stageLayer = m.default
    },
    (e: unknown) => {
      loading = null
      throw e
    },
  )
  return loading
}

/**
 * 'ready' once every SVG kind in `kinds` is registered (at once when none is needed or the chunk is cached);
 * 'failed' offers `retry`.
 */
export function useSvgKinds(kinds: readonly StageKind[]): { status: 'ready' | 'loading' | 'failed'; retry: () => void } {
  const needed = !svgKindsReady(kinds)
  const [status, setStatus] = useState<'ready' | 'loading' | 'failed'>(needed ? 'loading' : 'ready')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    if (!needed) {
      setStatus('ready')
      return
    }
    let alive = true
    setStatus('loading')
    loadSvgKinds().then(
      () => alive && setStatus('ready'),
      () => alive && setStatus('failed'),
    )
    return () => {
      alive = false
    }
  }, [needed, attempt])
  return { status: needed ? (status === 'ready' ? 'loading' : status) : 'ready', retry: () => setAttempt((a) => a + 1) }
}
