/**
 * The SG bench's store (Babylon-free, three-free). The DOM controls, the in-scene affordances (knob drags and pad taps,
 * through LabHandle.onGui and the page) and `window.__lab.sg` all write through these actions; the page derives the
 * picture and the readouts with the model.
 *
 * Counting rules (the honest bookkeeping):
 *   - counts are cumulative over the volleys fired at ONE setup; any change to the bench (source, a tilt, a kept sign,
 *     adding or removing a magnet, a preset) starts a fresh plate, and the last counts are kept as "before the change";
 *   - every volley draws a new seed (`seedOf(volley index)`), so its counts are the engine's seeded samples;
 *   - with motion, a volley's counts reach the readouts when its atoms have landed (`commitFlight`, ≤ 1.8 s); with
 *     reduced motion at once. A second volley fired in flight lands the first one at once.
 */
import { createStore } from '../../createStore'
import type { Nudge } from '../../nudge'
import type { Sign } from '../../../physics/sg'
import {
  addCounts,
  cleanSetup,
  DEFAULT_SETUP,
  emptyCounts,
  MAX_MAGNETS,
  previousOf,
  seedOf,
  SETUPS,
  setupKey,
  snapTilt,
  SOURCES,
  stepTilt,
  volleyOf,
  wrapTilt,
  type Counts,
  type Previous,
  type SgSetup,
  type SgSource,
  type Volley,
} from './model'
import { buildPlate, emptyPlate, type Plate } from './plate'

export interface SgParams extends SgSetup {
  /** Field lines drawn in each magnet. */
  field: boolean
  /** The preset the bench came from (cleared by any edit). */
  preset: string | null
  /** Counts shown (cumulative for this setup, landed volleys only). */
  counts: Counts
  /** Counts once the volley in flight has landed (null: nothing in flight). */
  flight: Counts | null
  /** Volleys fired this session (the next seed's index). */
  volleys: number
  /** The last volley: its size and seed (shown in the paper column). */
  last: { n: number; seed: number } | null
  /** The plate's marks and the volley's flight paths (derived from the engine's fates; replaced on every change). */
  plate: Plate
  /** The counts of the setup before the last change. */
  previous: Previous | null
  /** The knob twin that has focus (the scene highlights that knob). */
  focus: number | null
  /** 'lr': the stage box is wide (readouts on the stage); 'tb': squarer (readouts in the paper column, sticky). */
  split: 'lr' | 'tb'
}

function initial(): SgParams {
  const p = SETUPS[DEFAULT_SETUP]
  const setup = cleanSetup(p)
  return { ...setup, field: false, preset: DEFAULT_SETUP, counts: emptyCounts(setup.tilts.length), flight: null, volleys: 0, last: null, plate: emptyPlate(setup), previous: null, focus: null, split: 'lr' }
}

export const INITIAL_PARAMS: SgParams = initial()
export const sgStore = createStore<SgParams>(INITIAL_PARAMS)
export const useSg = sgStore.use
const get = sgStore.get
const set = sgStore.set

let timer: ReturnType<typeof setTimeout> | null = null
const stopTimer = () => {
  if (timer !== null) clearTimeout(timer)
  timer = null
}

export const setupOf = (s: SgParams): SgSetup => ({ source: s.source, tilts: s.tilts, keep: s.keep })

/** A change to the bench: a fresh plate (the counts belonged to the old setup), kept as "before the change". */
function change(patch: Partial<SgSetup>, preset: string | null = null): void {
  const s = get()
  const next = cleanSetup({ ...setupOf(s), ...patch })
  if (setupKey(next) === setupKey(s)) {
    if (preset !== s.preset) set({ preset })
    return
  }
  stopTimer()
  const landed = s.flight ?? s.counts
  set({
    ...next,
    preset,
    counts: emptyCounts(next.tilts.length),
    flight: null,
    plate: emptyPlate(next),
    previous: previousOf(setupOf(s), landed) ?? s.previous,
  })
}

export const setSource = (src: SgSource): void => {
  if (SOURCES.includes(src)) change({ source: src })
}
export function setTilt(k: number, deg: number): void {
  const s = get()
  if (k < 0 || k >= s.tilts.length || !Number.isFinite(deg)) return
  const tilts = s.tilts.slice()
  tilts[k] = wrapTilt(deg)
  change({ tilts })
}
/** A drag of knob k to `deg` (snapped to 15°, or 1° with Shift). */
export const dragTilt = (k: number, deg: number, fine: boolean): void => setTilt(k, snapTilt(deg, fine))
/** The knob twin's arrow keys: to the next 15° mark (Shift: 1°). */
export function nudgeTilt(k: number, n: Nudge): void {
  const s = get()
  if (k < 0 || k >= s.tilts.length) return
  setTilt(k, stepTilt(s.tilts[k], n.dir, n.fine))
}
export function setKeep(k: number, sign: Sign): void {
  const s = get()
  if (k < 0 || k >= s.keep.length) return
  const keep = s.keep.slice()
  keep[k] = sign
  change({ keep })
}
/** Add a magnet at the end of the chain (z, keeping + at the magnet that was last). */
export function addMagnet(): void {
  const s = get()
  if (s.tilts.length >= MAX_MAGNETS) return
  change({ tilts: [...s.tilts, 0], keep: [...s.keep, '+'] })
}
/** Remove magnet k (the chain closes up; the stop of a removed magnet goes with it). */
export function removeMagnet(k: number): void {
  const s = get()
  if (s.tilts.length <= 1 || k < 0 || k >= s.tilts.length) return
  const tilts = s.tilts.filter((_, i) => i !== k)
  const keep = s.keep.filter((_, i) => i !== Math.min(k, s.keep.length - 1))
  change({ tilts, keep })
}
export const setField = (on: boolean): void => set({ field: on })
export const setFocus = (k: number | null): void => set({ focus: k })
export const setSplit = (split: 'lr' | 'tb'): void => set({ split })

/** An allowlisted preset (presets.ts); anything that is not an own key of the table is ignored. */
export function applySetup(id: string): void {
  const p = Object.hasOwn(SETUPS, id) ? SETUPS[id] : undefined
  if (!p) return
  change({ source: p.source, tilts: p.tilts.slice(), keep: p.keep.slice() }, id)
}

/** The volley in flight lands: its counts reach the readouts. */
export function commitFlight(): void {
  stopTimer()
  const s = get()
  if (!s.flight) return
  set({ counts: s.flight, flight: null, plate: { ...s.plate, arrive: null, flight: null, start: s.plate.count } })
}

/**
 * Fire n atoms (a new seed): the engine samples every fate now; the plate gets their marks and (with motion) the flight
 * of up to MAX_FLOWN of them. With motion the counts reach the readouts when the volley has landed (`ms` later).
 */
export function fire(n: number, opts: { motion: boolean } = { motion: false }): Volley | null {
  if (!Number.isInteger(n) || n <= 0 || n > 100000) return null
  if (get().flight) commitFlight()
  const s = get()
  const setup = setupOf(s)
  const seed = seedOf(s.volleys)
  const v = volleyOf(setup, n, seed)
  const plate = buildPlate(setup, s.plate, v, opts.motion)
  const total = addCounts(s.counts, v.counts)
  set({ volleys: s.volleys + 1, last: { n, seed }, plate, ...(opts.motion && plate.flight ? { flight: total } : { counts: total, flight: null }) })
  if (opts.motion && plate.flight) {
    stopTimer()
    timer = setTimeout(commitFlight, Math.ceil(plate.flight.end * 1000))
  }
  return v
}

/** Clear the plate and the counts (the setup stays). */
export function clearPlate(): void {
  stopTimer()
  const s = get()
  set({ counts: emptyCounts(s.tilts.length), flight: null, plate: emptyPlate(setupOf(s)) })
}

/** Tests only: back to the initial state (and no timer left). */
export function resetSg(): void {
  stopTimer()
  sgStore.reset()
}
