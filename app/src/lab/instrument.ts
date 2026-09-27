/**
 * `window.__lab` (W-lab §5): the lab's measurement surface, installed only in DEV or with `?measure` (like
 * `window.__stage`). Babylon-free: it lives in the lab page chunk and reads what the mounted Babylon side
 * registers (`labMounted`), so it keeps answering after the engine is disposed (lab first, then leave).
 *
 *   counters  contexts · contextsLost · live · framesDrawn · mounts · disposals · mounted · engines() · tripwire()
 *   drivers   setPhi(deg) · state() · shot(az, el, d, fov)
 *   measures  project([x, y, z]) · beadScreen() · bench({ frames, gui })
 *   faults    loseContext()
 */
import { glCounters, wrapGetContext } from '../stage/glCounters'
import { stage } from '../stage/store'
import type { V3 } from './axes'
import type { LabBench, LabProbe } from './handle'
import { getLab, setPhi, type LabState } from './labStore'

export interface LabApi {
  readonly contexts: number
  readonly contextsLost: number
  /** contexts − contextsLost: WebGL contexts alive on the page (the lecture host's included). */
  readonly live: number
  /** Babylon frames drawn this session (every engine). */
  readonly framesDrawn: number
  readonly mounts: number
  readonly disposals: number
  readonly mounted: boolean
  /** Babylon engines alive (EngineStore.Instances), 0 before Babylon ever loaded. */
  engines(): number
  /** Cross-origin script or file loads the tripwire refused (babylon/tripwire.ts). */
  tripwire(): string[]
  setPhi(deg: number): void
  state(): LabState
  shot(azDeg: number, elDeg: number, d: number, fovDeg: number): boolean
  project(p: V3): [number, number] | null
  beadScreen(): [number, number] | null
  bench(opts?: { frames?: number; gui?: boolean }): Promise<LabBench | null>
  loseContext(): boolean
}

const counters = { mounts: 0, disposals: 0, framesDrawn: 0, trips: [] as string[] }
let probe: LabProbe | null = null
let engineInstances: (() => number) | null = null

export const labMeasuring = (): boolean => import.meta.env.DEV || stage.measure

/** Babylon side: one frame drawn. */
export function labFrameDrawn(): void {
  counters.framesDrawn++
}
/** Babylon side: an engine is up. Returns the call for its disposal. */
export function labMounted(p: LabProbe, instances: () => number): () => void {
  counters.mounts++
  probe = p
  engineInstances = instances
  return () => {
    counters.disposals++
    if (probe === p) probe = null
  }
}
/** Babylon side: the tripwire refused a load. */
export function labTrip(url: string): void {
  counters.trips.push(url)
}

const G = globalThis as unknown as { __lab?: LabApi }

/** Install `window.__lab` (idempotent). Returns false when disabled (production without ?measure). */
export function installLabInstrument(): boolean {
  if (!labMeasuring() || typeof window === 'undefined') return false
  wrapGetContext()
  if (G.__lab) return true
  G.__lab = {
    get contexts() {
      return glCounters.contexts
    },
    get contextsLost() {
      return glCounters.lost
    },
    get live() {
      return glCounters.contexts - glCounters.lost
    },
    get framesDrawn() {
      return counters.framesDrawn
    },
    get mounts() {
      return counters.mounts
    },
    get disposals() {
      return counters.disposals
    },
    get mounted() {
      return probe !== null
    },
    engines: () => engineInstances?.() ?? 0,
    tripwire: () => counters.trips.slice(),
    setPhi: (deg) => setPhi(deg),
    state: () => getLab(),
    shot: (az, el, d, fov) => {
      if (!probe) return false
      probe.shot(az, el, d, fov)
      return true
    },
    project: (p) => probe?.project(p) ?? null,
    beadScreen: () => probe?.beadScreen() ?? null,
    bench: (opts) => (probe ? probe.bench(opts) : Promise.resolve(null)),
    loseContext: () => probe?.loseContext() ?? false,
  }
  return true
}
