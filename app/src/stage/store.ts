/**
 * The stage store: scroll → state without React churn (W-L1 §2.2; frozen at `l1-freeze`). THREE-FREE:
 * DOM components (StoryStage, Workbench, overlays, Rich term links) import this without pulling three.js
 * into their chunk. The lazy host chunk (StageHost) reads it every frame.
 *
 * Mutable fields (u, near, revealMix, clock …) are written without notifying anyone; React hears only
 * about discrete changes through topic subscriptions: the current beat, reveals, flags, focus, view
 * registrations and label sets. Everything is idempotent under StrictMode double effects.
 */
import { useSyncExternalStore } from 'react'
import type { Beat, StageKind, StageLayout, TermId } from '../content/stage'
import { isOutcomeText } from './readoutGuard'
import { getMotionChoice } from '../ui/motionPref'

/* ------------------------------------------------------------------------------------------------ */
/* Tiny topic emitter                                                                                */
/* ------------------------------------------------------------------------------------------------ */

type Listener = () => void
const topics = new Map<string, Set<Listener>>()
function on(topic: string, fn: Listener): () => void {
  let set = topics.get(topic)
  if (!set) topics.set(topic, (set = new Set()))
  set.add(fn)
  return () => {
    set.delete(fn)
    if (!set.size) topics.delete(topic)
  }
}
function emit(topic: string) {
  topics.get(topic)?.forEach((fn) => fn())
}

/* ------------------------------------------------------------------------------------------------ */
/* Types                                                                                             */
/* ------------------------------------------------------------------------------------------------ */

export interface UnitTrack {
  readonly unitId: string
  /** The unit's story (replaced in place when content hot-reloads). */
  beats: readonly Beat[]
  beatCount: number
  /** Beat position ∈ [0, n] from scroll (piecewise: article k spans [k, k+1)). */
  uRaw: number
  /** Smoothed uRaw (W1: gsap.quickTo 0.6 s, power3.out); = uRaw when !motion. Scenes read this. */
  u: number
  /** clamp(floor(uRaw), 0, n−1); React sees it only via useBeat. */
  beat: number
  /** Stage within one viewport: scenes mounted, the Driver runs. */
  near: boolean
  /** Written each frame by the renderer: a pixel of this unit was drawn. */
  onScreen: boolean
  /** The sticky stage box; view rects are relative to it. Set by the DOM side (ref callback). */
  box: HTMLElement | null
  /** Beat indices whose clue has been revealed (decision #17). */
  revealed: ReadonlySet<number>
  /** Per beat, 0…1 reveal progress, animated by the Driver toward `revealed` (a cut when !motion). */
  revealMix: number[]
  /** Reader-driven clock (decision #22) and its last delta; the Driver advances it only on reader activity. */
  clock: number
  delta: number
  /** performance.now() of the last reader action on this unit (scroll, reveal click, workbench slider). */
  lastInput: number
  /**
   * "Derivations drive the stage" (W-709 #11): the active beat's derivation-step override, cross-faded like a reveal
   * (stage/timing.ts `advanceUnit`, stage/drive.ts `driveUnit`). `derivTo` null means no override (the beat-driven
   * state stands); `derivFrom` is the layout it is fading from (null the first time an override is set). Set by
   * `setDerivOverride`; cleared automatically whenever the beat changes (`setBeat`).
   */
  derivFrom: StageLayout | null
  derivTo: StageLayout | null
  derivCaption: string | undefined
  /** 0 → 1 toward `derivTo` (a cut under reduced motion); bumped to 0 whenever the target changes. */
  derivMix: number
}

/** A view the DOM side asks the host to draw: one per (unit, kind) used anywhere in the unit's story. */
export interface ViewSpec {
  /** `${unitId}/${kind}` */
  key: string
  unitId: string
  kind: StageKind
}

/** A DOM label or readout a scene publishes for its view (rendered by the overlay, moved by useDomLabels). */
export interface StageLabel {
  /** Rich inline (trusted authored renderer). Readouts are updated later with plain text via writeReadout. */
  text: string
  /** Colour token (stage/tokens.ts INK key). Coloured text gets the 0.90 backing (D §1.5). */
  tone?: 'text' | 'plus' | 'minus' | 'state' | 'silver' | 'op'
  /** callout (oven, magnet) · axis · chip (state chip, KaTeX) · readout (top-right box, not anchored). */
  tier?: 'callout' | 'axis' | 'chip' | 'readout'
}

export interface StageStore {
  units: Map<string, UnitTrack>
  /** false under prefers-reduced-motion or ?motion=reduce (live). */
  motion: boolean
  /** Hovered/focused term link; scenes see it as `f.focus`. */
  focusTerm: TermId | null
  contextLost: boolean
  /** Upper DPR bound; the governor (W1) may lower it. */
  dprCap: number
  /** ?measure at host mount: preserveDrawingBuffer + window.__stage in production builds. */
  measure: boolean
  /** `${viewKey}:${name}` → overlay node written without React (labels, readouts). */
  dom: Map<string, HTMLElement>
  views: Map<string, ViewSpec>
  labels: Map<string, Readonly<Record<string, StageLabel>>>
  /** Incremented to remount the Canvas after a context restore (W1). */
  hostEpoch: number
}

const q = () => {
  if (typeof location === 'undefined') return new URLSearchParams()
  const hashQuery = location.hash.includes('?') ? location.hash.slice(location.hash.indexOf('?') + 1) : ''
  return new URLSearchParams(`${location.search.replace(/^\?/, '')}&${hashQuery}`)
}

export const stage: StageStore = {
  units: new Map(),
  motion: true,
  focusTerm: null,
  contextLost: false,
  dprCap: 2,
  measure: q().has('measure'),
  dom: new Map(),
  views: new Map(),
  labels: new Map(),
  hostEpoch: 0,
}

/* ------------------------------------------------------------------------------------------------ */
/* Units                                                                                             */
/* ------------------------------------------------------------------------------------------------ */

const refs = new Map<string, number>()
const pendingDelete = new Map<string, ReturnType<typeof setTimeout>>()

/** Ref-counted, idempotent. A release followed by a track in the same tick (StrictMode) keeps the object. */
export function trackUnit(unitId: string, beats: readonly Beat[]): UnitTrack {
  const pending = pendingDelete.get(unitId)
  if (pending !== undefined) {
    clearTimeout(pending)
    pendingDelete.delete(unitId)
  }
  refs.set(unitId, (refs.get(unitId) ?? 0) + 1)
  let t = stage.units.get(unitId)
  if (!t) {
    t = {
      unitId,
      beats,
      beatCount: beats.length,
      uRaw: 0,
      u: 0,
      beat: 0,
      near: false,
      onScreen: false,
      box: null,
      revealed: new Set(),
      revealMix: beats.map(() => 0),
      clock: 0,
      delta: 0,
      lastInput: 0,
      derivFrom: null,
      derivTo: null,
      derivCaption: undefined,
      derivMix: 1,
    }
    stage.units.set(unitId, t)
    emit('units')
  } else if (t.beats !== beats) {
    t.beats = beats
    t.beatCount = beats.length
    t.revealMix = beats.map((_, i) => t!.revealMix[i] ?? 0)
  }
  return t
}

export function releaseUnit(unitId: string): void {
  const n = (refs.get(unitId) ?? 0) - 1
  if (n > 0) {
    refs.set(unitId, n)
    return
  }
  refs.delete(unitId)
  if (pendingDelete.has(unitId)) return
  pendingDelete.set(
    unitId,
    setTimeout(() => {
      pendingDelete.delete(unitId)
      if (refs.has(unitId)) return
      stage.units.delete(unitId)
      emit('units')
    }, 0),
  )
}

/** Set the current beat; notifies React only on change. */
export function setBeat(t: UnitTrack, beat: number): void {
  const b = Math.min(Math.max(0, t.beatCount - 1), Math.max(0, Math.floor(beat)))
  if (b === t.beat) return
  t.beat = b
  // leaving a beat always returns its derivation (if any) to the beat-driven state (W-709 #11); the newly active
  // beat's own Derivation instance (if it has one) sets its own override right back, from its own selection state
  if (t.derivTo !== null || t.derivFrom !== null) {
    t.derivFrom = null
    t.derivTo = null
    t.derivCaption = undefined
    t.derivMix = 1
  }
  emit(`beat:${t.unitId}`)
}

/** Write the scroll position (W1's useStoryScroll, the Workbench slider). `u` defaults to `uRaw` (no smoothing). */
export function setScroll(t: UnitTrack, uRaw: number, u: number = uRaw): void {
  const n = t.beatCount
  t.uRaw = Math.min(n, Math.max(0, uRaw))
  t.u = Math.min(n, Math.max(0, u))
  t.lastInput = typeof performance !== 'undefined' ? performance.now() : 0
  setBeat(t, t.uRaw)
}

export function useBeat(unitId: string): number {
  return useSyncExternalStore(
    (fn) => on(`beat:${unitId}`, fn),
    () => stage.units.get(unitId)?.beat ?? 0,
    () => 0,
  )
}

/** Units currently tracked (StagePort, instrumentation). */
export function useUnitsVersion(): number {
  return useSyncExternalStore(
    (fn) => on('units', fn),
    () => stage.units.size,
    () => 0,
  )
}

/* ------------------------------------------------------------------------------------------------ */
/* Reveals (decision #17)                                                                            */
/* ------------------------------------------------------------------------------------------------ */

function beatIndex(t: UnitTrack, beat: number | string): number {
  return typeof beat === 'number' ? beat : t.beats.findIndex((b) => b.id === beat)
}

/** Show (or hide) a clue beat's answer. The Driver animates the stage from question to answer (cut if !motion). */
export function setRevealed(unitId: string, beat: number | string, revealed: boolean): void {
  const t = stage.units.get(unitId)
  if (!t) return
  const i = beatIndex(t, beat)
  if (i < 0 || !t.beats[i]?.reveal) return
  if (t.revealed.has(i) === revealed) return
  const next = new Set(t.revealed)
  if (revealed) next.add(i)
  else next.delete(i)
  t.revealed = next
  t.lastInput = typeof performance !== 'undefined' ? performance.now() : 0
  if (!stage.motion) t.revealMix[i] = revealed ? 1 : 0
  emit(`reveal:${unitId}`)
}

export function isRevealed(unitId: string, beat: number | string): boolean {
  const t = stage.units.get(unitId)
  return !!t && t.revealed.has(beatIndex(t, beat))
}

export function useRevealed(unitId: string, beat: number | string): boolean {
  return useSyncExternalStore(
    (fn) => on(`reveal:${unitId}`, fn),
    () => isRevealed(unitId, beat),
    () => false,
  )
}

/* ------------------------------------------------------------------------------------------------ */
/* Derivation-driven stage (W-709 #11)                                                               */
/* ------------------------------------------------------------------------------------------------ */

/** Bumped on every real change (store.ts-internal; drives the SVG route's per-frame change signature). */
let derivVersion = 0
export function derivOverrideVersion(): number {
  return derivVersion
}

/**
 * The active beat's derivation moves the stage to `target.layout` (null = back to the beat-driven state), captioned
 * `target.caption` (defaults to the beat's own caption). Idempotent on the SAME target (reference equality: content
 * objects are stable, so re-selecting the same line is a no-op); a new target starts the cross-fade from whatever was
 * showing (stage/timing.ts `advanceUnit` animates `derivMix` 0 → 1, a cut under reduced motion).
 */
export function setDerivOverride(unitId: string, target: { layout: StageLayout; caption?: string } | null): void {
  const t = stage.units.get(unitId)
  if (!t) return
  const to = target?.layout ?? null
  if (t.derivTo === to && t.derivCaption === target?.caption) return
  t.derivFrom = t.derivTo
  t.derivTo = to
  t.derivCaption = target?.caption
  t.derivMix = stage.motion ? 0 : 1
  derivVersion++
  emit(`deriv:${unitId}`)
}

/** The derivation's current target layout (null = none; the beat-driven state applies). */
export function useDerivLayout(unitId: string): StageLayout | null {
  return useSyncExternalStore(
    (fn) => on(`deriv:${unitId}`, fn),
    () => stage.units.get(unitId)?.derivTo ?? null,
    () => null,
  )
}

/** The derivation's current caption (only meaningful alongside a non-null `useDerivLayout`). */
export function useDerivCaption(unitId: string): string | undefined {
  return useSyncExternalStore(
    (fn) => on(`deriv:${unitId}`, fn),
    () => stage.units.get(unitId)?.derivCaption,
    () => undefined,
  )
}

/* ------------------------------------------------------------------------------------------------ */
/* Flags and focus                                                                                   */
/* ------------------------------------------------------------------------------------------------ */

export function setFocusTerm(id: TermId | null): void {
  if (stage.focusTerm === id) return
  stage.focusTerm = id
  emit('focus')
}

export function useFocusTerm(): TermId | null {
  return useSyncExternalStore(
    (fn) => on('focus', fn),
    () => stage.focusTerm,
    () => null,
  )
}

export function setMotion(motion: boolean): void {
  if (stage.motion === motion) return
  stage.motion = motion
  if (!motion)
    for (const t of stage.units.values()) {
      t.revealMix = t.beats.map((_, i) => (t.revealed.has(i) ? 1 : 0))
      t.derivMix = 1
    }
  emit('flags')
}

export function setContextLost(lost: boolean): void {
  if (stage.contextLost === lost) return
  stage.contextLost = lost
  emit('flags')
}

export function useStageFlag<K extends 'motion' | 'contextLost'>(k: K): StageStore[K] {
  return useSyncExternalStore(
    (fn) => on('flags', fn),
    () => stage[k],
    () => (k === 'motion' ? true : false) as StageStore[K],
  )
}

/* W1 additive: context-loss recovery (W-L1 §2.7). App keys <StageHost/> by the epoch, so a bump remounts
 * the Canvas (a fresh renderer + context). `giveUp` keeps the static reading version for the session. */
let hostGaveUp = false
export function bumpHostEpoch(): void {
  stage.hostEpoch++
  emit('epoch')
}
export function useHostEpoch(): number {
  return useSyncExternalStore(
    (fn) => on('epoch', fn),
    () => stage.hostEpoch,
    () => 0,
  )
}
/** A second context loss within 60 s: stay static for the rest of the session. */
export function giveUpHost(): void {
  hostGaveUp = true
  setContextLost(true)
}
export function hostGivenUp(): boolean {
  return hostGaveUp
}

/* W1 additive: the smoothed-scroll snap hook used by instrumentation (window.__stage.settle / scrollToBeat).
 * useStoryScroll registers one function per unit that completes its smoothing tween (u := uRaw). */
const snappers = new Map<string, () => void>()
export function registerScrollSnap(unitId: string, fn: () => void): () => void {
  snappers.set(unitId, fn)
  return () => {
    if (snappers.get(unitId) === fn) snappers.delete(unitId)
  }
}
export function snapAllScroll(): void {
  snappers.forEach((fn) => fn())
  for (const t of stage.units.values()) t.u = t.uRaw
}

/** Reduced motion: `?motion=reduce` (search or hash query) → the reader's topbar choice → the OS setting. */
export function prefersReducedMotion(): boolean {
  if (q().get('motion') === 'reduce') return true
  const choice = getMotionChoice()
  if (choice) return choice === 'reduce'
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
}

/* ------------------------------------------------------------------------------------------------ */
/* Views and labels                                                                                  */
/* ------------------------------------------------------------------------------------------------ */

export const viewKey = (unitId: string, kind: StageKind): string => `${unitId}/${kind}`
export const labelKey = (vKey: string, name: string): string => `${vKey}:${name}`

let viewsVersion = 0
/** Ask the host to draw `kind` for `unitId`. Idempotent by key; returns the unregister function. */
export function registerView(unitId: string, kind: StageKind): () => void {
  const key = viewKey(unitId, kind)
  if (!stage.views.has(key)) {
    stage.views.set(key, { key, unitId, kind })
    viewsVersion++
    emit('views')
  }
  return () => {
    if (stage.views.delete(key)) {
      viewsVersion++
      emit('views')
    }
  }
}

export function onViewsChange(fn: () => void): () => void {
  return on('views', fn)
}
export function useViewsVersion(): number {
  return useSyncExternalStore(onViewsChange, () => viewsVersion, () => 0)
}

const EMPTY: Readonly<Record<string, StageLabel>> = Object.freeze({})
/** A scene's label set for its view (replaces the previous set). */
export function publishLabels(vKey: string, labels: Readonly<Record<string, StageLabel>>): void {
  const prev = stage.labels.get(vKey)
  if (prev && JSON.stringify(prev) === JSON.stringify(labels)) return
  if (Object.keys(labels).length) stage.labels.set(vKey, labels)
  else stage.labels.delete(vKey)
  emit(`labels:${vKey}`)
}
export function useViewLabels(vKey: string): Readonly<Record<string, StageLabel>> {
  return useSyncExternalStore(
    (fn) => on(`labels:${vKey}`, fn),
    () => stage.labels.get(vKey) ?? EMPTY,
    () => EMPTY,
  )
}

/** Ref callback registering an overlay node under `key` (React 19 cleanup; deletes only its own node). */
export function domRef(key: string) {
  return (el: HTMLElement | null) => {
    if (!el) return
    stage.dom.set(key, el)
    return () => {
      if (stage.dom.get(key) === el) stage.dom.delete(key)
    }
  }
}

/**
 * Write a live text readout into an overlay node without React. `key` = labelKey(viewKey, name).
 * A node the overlay marked `data-outcomes="off"` (a classical-model lab beat, Round 3 #5) never shows a
 * quantum ± outcome: such text is written as '' (stage/readoutGuard.ts).
 */
export function writeReadout(key: string, text: string): void {
  const el = stage.dom.get(key)
  if (!el) return
  const t = el.dataset.outcomes === 'off' && isOutcomeText(text) ? '' : text
  if (el.textContent !== t) el.textContent = t
}
