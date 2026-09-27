/**
 * The Grapher's store (Babylon-free, three-free). The DOM controls, the cursor handle (LabHandle.onGui, through the
 * page) and `window.__lab.grapher` all write through these actions; the page derives the picture and the readouts
 * with the model. Texts are stored as typed (never rewritten by rounding); after every change of a mode's inputs the
 * store re-reads that mode, and when everything the picture needs reads correctly it commits the new config (the
 * picture keeps the last committed config of each mode while a text does not read).
 */
import { createStore } from '../../createStore'
import type { Nudge } from '../../nudge'
import {
  A_MAX,
  A_MIN,
  DEFAULT_SETUP,
  FIELDS,
  readMode,
  RES,
  SETUPS,
  stepCursor,
  type BlochConfig,
  type Cursors,
  type CurveConfig,
  type FieldId,
  type GrapherMode,
  type Layers,
  type ModeConfig,
  type SurfaceConfig,
  type Texts,
} from './model'

export interface GrapherParams {
  mode: GrapherMode
  text: Texts
  /** Samples per side (surface) or per path (curve, Bloch path). */
  res: Record<GrapherMode, number>
  a: number
  layers: Layers
  equal: boolean
  /** The layer comparison (f = g, crossings, f < g) is shown (P review item 9: off for the Try this until the student
   *  opens it). */
  compare: boolean
  cursor: Cursors
  /** The last inputs of each mode that all read correctly: what the picture shows. */
  committed: { surface: SurfaceConfig; curve: CurveConfig; bloch: BlochConfig }
  /** The preset the inputs came from (cleared by any edit). */
  preset: string | null
  /** The cursor's DOM twin has focus. */
  focus: boolean
  /** A drag of the cursor is in progress (live regions stay quiet until it ends). */
  dragging: boolean
  /** 'lr': the stage box is wide (readouts on the stage); 'tb': squarer (readouts in the paper column, sticky). */
  split: 'lr' | 'tb'
}

const INITIAL_TEXT: Texts = {
  sv1: 'x',
  sv2: 'y',
  f: '',
  g: '',
  x0: '0',
  x1: '1',
  y0: '0',
  y1: '1',
  ...SETUPS.helix.texts,
  ...SETUPS.equator.texts,
  ...SETUPS[DEFAULT_SETUP].texts,
} as Texts

function initial(): GrapherParams {
  const res = { surface: SETUPS[DEFAULT_SETUP].res ?? RES.surface.initial, curve: SETUPS.helix.res ?? RES.curve.initial, bloch: SETUPS.equator.res ?? RES.bloch.initial }
  const layers = SETUPS[DEFAULT_SETUP].layers ?? { solid: true, wire: true }
  const read = (m: GrapherMode) => {
    const c = readMode(m, INITIAL_TEXT, layers, res[m]).config
    if (!c) throw new Error(`the initial ${m} inputs do not read`)
    return c
  }
  return {
    mode: SETUPS[DEFAULT_SETUP].mode,
    text: INITIAL_TEXT,
    res,
    a: SETUPS[DEFAULT_SETUP].a ?? 0,
    layers,
    equal: !!SETUPS[DEFAULT_SETUP].equal,
    compare: SETUPS[DEFAULT_SETUP].compare ?? true,
    cursor: { surface: [0.25, 0.125], curve: 0.25, bloch: 0.25 },
    committed: { surface: read('surface') as SurfaceConfig, curve: read('curve') as CurveConfig, bloch: read('bloch') as BlochConfig },
    preset: DEFAULT_SETUP,
    focus: false,
    dragging: false,
    split: 'lr',
  }
}

export const INITIAL_PARAMS: GrapherParams = initial()
export const grStore = createStore<GrapherParams>(INITIAL_PARAMS)
export const useGrapher = grStore.use
const get = grStore.get
const set = grStore.set

const modeOf = (f: FieldId): GrapherMode => (FIELDS.surface as readonly string[]).includes(f) ? 'surface' : (FIELDS.curve as readonly string[]).includes(f) ? 'curve' : 'bloch'

/** Re-read one mode and commit it when it reads (keeping the old object when nothing the picture uses changed). */
function recommit(mode: GrapherMode, s: GrapherParams = get()): Partial<GrapherParams> {
  const c = readMode(mode, s.text, s.layers, s.res[mode]).config
  if (!c || c.key === s.committed[mode].key) return {}
  return { committed: { ...s.committed, [mode]: c } as GrapherParams['committed'] }
}
const apply = (patch: Partial<GrapherParams>, mode: GrapherMode) => {
  const next = { ...get(), ...patch }
  set({ ...patch, ...recommit(mode, next) })
}

export function setText(field: FieldId, value: string): void {
  const s = get()
  if (s.text[field] === value) return
  apply({ text: { ...s.text, [field]: value }, preset: null }, modeOf(field))
}
export const setMode = (mode: GrapherMode): void => set({ mode })
export function setRes(mode: GrapherMode, n: number): void {
  const r = RES[mode]
  const k = Number.isFinite(n) ? Math.round(Math.min(r.max, Math.max(r.min, n))) : r.initial
  apply({ res: { ...get().res, [mode]: k }, preset: null }, mode)
}
export const setA = (a: number): void => set({ a: Number.isFinite(a) ? Math.min(A_MAX, Math.max(A_MIN, a)) : 0 })
export function setLayer(layer: keyof Layers, on: boolean): void {
  apply({ layers: { ...get().layers, [layer]: on } }, 'surface')
}
export const setEqual = (on: boolean): void => set({ equal: on })
export const setCompare = (on: boolean): void => set({ compare: on })
export const setFocus = (on: boolean): void => set({ focus: on })
export const setDragging = (on: boolean): void => set({ dragging: on })
export const setSplit = (split: 'lr' | 'tb'): void => set({ split })

/** The cursor of the current mode: (u, v) on a surface, u along t on a path (fractions of the ranges). */
export function setCursor(value: number | [number, number]): void {
  const s = get()
  const c = { ...s.cursor }
  if (s.mode === 'surface' && Array.isArray(value)) c.surface = value
  else if (s.mode === 'curve' && typeof value === 'number') c.curve = value
  else if (s.mode === 'bloch' && typeof value === 'number') c.bloch = value
  else return
  set({ cursor: c })
}
/** A keyboard nudge from the cursor's twin: one sample per step (Shift: a tenth), ← → along the first input, ↓ ↑ the second. */
export function nudgeCursor(n: Nudge): void {
  const s = get()
  const m = s.committed[s.mode].n
  if (s.mode === 'surface') {
    const [u, v] = s.cursor.surface
    setCursor(n.axis === 0 ? [stepCursor(u, n.dir, n.fine, m), v] : [u, stepCursor(v, n.dir, n.fine, m)])
  } else setCursor(stepCursor(s.mode === 'curve' ? s.cursor.curve : s.cursor.bloch, n.dir, n.fine, m))
}

/** An allowlisted preset (presets.ts): types its texts for the student and sets its options; nothing else is read. */
export function applySetup(id: string): void {
  const setup = Object.hasOwn(SETUPS, id) ? SETUPS[id] : undefined
  if (!setup) return
  const s = get()
  const text = { ...s.text, ...setup.texts } as Texts
  const res = setup.res ? { ...s.res, [setup.mode]: setup.res } : s.res
  const layers = setup.layers ?? s.layers
  const cursor = { ...s.cursor }
  if (setup.cursor !== undefined) {
    if (setup.mode === 'surface' && Array.isArray(setup.cursor)) cursor.surface = setup.cursor
    else if (typeof setup.cursor === 'number') cursor[setup.mode === 'curve' ? 'curve' : 'bloch'] = setup.cursor
  }
  const next: GrapherParams = { ...s, mode: setup.mode, text, res, layers, cursor, a: setup.a ?? s.a, equal: setup.equal ?? s.equal, compare: setup.compare ?? s.compare, preset: id }
  set({ ...next, ...recommit(setup.mode, next) })
}

/** The committed config the picture samples now. */
export const configOf = (s: GrapherParams): ModeConfig => s.committed[s.mode]
