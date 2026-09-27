/**
 * `window.__lab` (W-lab §5): the lab's measurement surface, installed only in DEV or with `?measure` (like
 * `window.__stage`). Babylon-free: it lives in the lab page chunk and reads what the mounted Babylon side
 * registers (`labMounted`), so it keeps answering after the engine is disposed (lab first, then leave).
 *
 *   counters  contexts · contextsLost · live · framesDrawn · mounts · disposals · mounted · engines() · tripwire()
 *   drivers   setPhi(deg) · state() · shot(az, el, d, fov)
 *   measures  project([x, y, z], view?) · beadScreen() · handleScreen(id)
 *             bench({ frames, gui: 'on' | 'static' | 'off', drag?: handle id of the mounted bench })
 *   faults    loseContext()
 *   labels    labels(): the visible projected labels and the overlay furniture (page px) of the mounted stage
 *   benches   op: the Operator Lab's hooks while its page is mounted (registered by the bench, so this module stays
 *             free of bench code): state(), readouts(), drag(handle, points), setup(id), dragStep(handle)
 *             grapher: the Grapher's hooks while its page is mounted: state(), readouts(), setup(id), drag(points),
 *             sample() (the last re-sample: time, samples, gaps, a finite view), flush(), dragStep('cursor' | 'a')
 *             sg: the SG bench's hooks while its page is mounted: state(), readouts(), setup(id), fire(n), land(), clear(),
 *             drag(knob, points), pick(pad), knobPoint(k, deg), dragStep('volley')
 */
import type { LabelRect } from '../stage/labelLayout'
import { glCounters, wrapGetContext } from '../stage/glCounters'
import { stage } from '../stage/store'
import type { V3 } from './axes'
import type { LabBench, LabGuiMode, LabProbe } from './handle'
import { labelBoxes } from './labelBoxes'

/** The Operator Lab's measurement hooks (benches/operator/OperatorBench.tsx registers them while mounted). */
export interface OperatorLabApi {
  /** The bench's parameters (plain data). */
  state(): unknown
  /** The readout lines the model computed from the engine, by view: key → text. */
  readouts(): { op: Record<string, string>; state: Record<string, string> }
  /** Drive a handle through the same path as a pointer drag: start at points[0], move through the rest, end. */
  drag(handle: string, points: [number, number, number][]): void
  /** Apply an allowlisted setup id (ignored otherwise). */
  setup(id: string): void
  /** A drag-bench step: frame i moves `handle` along a fixed path (store → engine model → handle.update). */
  dragStep(handle: string): ((i: number) => void) | null
}
/** The SG bench's measurement hooks (benches/sg/SgBench.tsx registers them while mounted). */
export interface SgLabApi {
  /** The bench's parameters without the plate's arrays (plus marks drawn, atoms landed, a volley in flight). */
  state(): unknown
  /** The readout lines the model computed from the engine: key → text. */
  readouts(): Record<string, string>
  setup(id: string): void
  /** Fire n atoms (a new seed), with the stage's motion setting. */
  fire(n: number): void
  /** Land the volley in flight now (its counts reach the readouts). */
  land(): void
  clear(): void
  /** Drive a knob through the same path as a pointer drag (points on its ring's plane). */
  drag(handle: string, points: [number, number, number][]): void
  /** A pad tap through the same path as the scene's (keep-k-plus, keep-k-minus, remove-k, add). */
  pick(handle: string): void
  /** The physics point on magnet k's protractor ring at `deg` (where a knob drag to that tilt would point). */
  knobPoint(k: number, deg: number): [number, number, number] | null
  /** A frame-bench step: 'volley' fires 10 000 atoms and draws them in flight at a clock that sweeps the flight. */
  dragStep(handle: string): ((i: number) => void) | null
}
/** The Grapher's measurement hooks (benches/grapher/GrapherBench.tsx registers them while mounted). */
export interface GrapherLabApi {
  state(): unknown
  /** The readout lines of the current picture: key → text. */
  readouts(): Record<string, string>
  setup(id: string): void
  /** Drive the cursor through the same path as a pointer drag (points on its constraint surface). */
  drag(points: [number, number, number][]): void
  /** The picture's last re-sample: its time (ms), the samples per layer, the gaps, and whether every number is finite. */
  sample(): { ms: number; samples: number; gaps: number; finite: boolean; mode: string }
  /** Re-sample now (skips the throttle; tests). */
  flush(): void
  /** A frame-bench step: frame i moves the cursor ('cursor') or re-samples at a new a ('a'). */
  dragStep(handle: string): ((i: number) => void) | null
}
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
  project(p: V3, view?: string): [number, number] | null
  beadScreen(): [number, number] | null
  handleScreen(id: string): [number, number] | null
  bench(opts?: { frames?: number; gui?: LabGuiMode; drag?: string }): Promise<LabBench | null>
  loseContext(): boolean
  /** Visible projected labels (key, page rect) and the furniture they must keep clear of (passports, readout lines, caption). */
  labels(): { labels: { key: string; box: LabelRect }[]; furniture: { what: string; box: LabelRect }[] }
  /** The Operator Lab's hooks (null unless its page is mounted). */
  readonly op: OperatorLabApi | null
  /** The Grapher's hooks (null unless its page is mounted). */
  readonly grapher: GrapherLabApi | null
  /** The SG bench's hooks (null unless its page is mounted). */
  readonly sg: SgLabApi | null
}

const counters = { mounts: 0, disposals: 0, framesDrawn: 0, trips: [] as string[] }
let probe: LabProbe | null = null
let engineInstances: (() => number) | null = null
let operatorApi: OperatorLabApi | null = null
let grapherApi: GrapherLabApi | null = null
let sgApi: SgLabApi | null = null

/** The Operator Lab page registers its hooks while mounted; returns the unregister call. */
export function registerOperatorApi(api: OperatorLabApi): () => void {
  operatorApi = api
  return () => {
    if (operatorApi === api) operatorApi = null
  }
}

/** The Grapher page registers its hooks while mounted; returns the unregister call. */
export function registerGrapherApi(api: GrapherLabApi): () => void {
  grapherApi = api
  return () => {
    if (grapherApi === api) grapherApi = null
  }
}

/** The SG bench page registers its hooks while mounted; returns the unregister call. */
export function registerSgApi(api: SgLabApi): () => void {
  sgApi = api
  return () => {
    if (sgApi === api) sgApi = null
  }
}

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
    project: (p, view) => probe?.project(p, view) ?? null,
    beadScreen: () => probe?.beadScreen() ?? null,
    handleScreen: (id) => probe?.handleScreen(id) ?? null,
    bench: (opts = {}) => {
      if (!probe) return Promise.resolve(null)
      const step = opts.drag ? ((operatorApi ?? grapherApi ?? sgApi)?.dragStep(opts.drag) ?? undefined) : undefined
      return probe.bench({ frames: opts.frames, gui: opts.gui, step })
    },
    loseContext: () => probe?.loseContext() ?? false,
    labels: () => labelBoxes(document),
    get op() {
      return operatorApi
    },
    get grapher() {
      return grapherApi
    },
    get sg() {
      return sgApi
    },
  }
  return true
}
