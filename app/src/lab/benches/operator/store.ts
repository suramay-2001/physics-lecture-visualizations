/**
 * The Operator Lab's store (Babylon-free, three-free). The DOM controls, the drag handles (LabHandle.onGui) and
 * `window.__lab` all write through these actions; the page derives the picture and the readouts with
 * `operatorModel` (model.ts). A change of the operator A hides the results again when "Predict first" is on, and
 * (P review item 6) shows its matrix in the z basis: the display basis cannot change while the results are hidden,
 * since the eigenbasis would show A as a diagonal matrix. The unit (ħ or none) is not stored: `unitOf` derives it.
 */
import type { Mat } from '../../../physics/linalg'
import { createStore } from '../../createStore'
import type { Nudge } from '../../nudge'
import {
  A0_MAX,
  A_MAX,
  aFromTip,
  cellsOf,
  editCell,
  inBasis,
  INITIAL_PARAMS,
  matrixOf,
  NUDGE,
  operatorModel,
  parseCells,
  presetParams,
  PSI_NAMED,
  psi0FromPoint,
  SETUPS,
  TAU_MAX,
  tauFromBead,
  type Basis,
  type HandleId,
  type OperatorParams,
  type OpPresetId,
} from './model'
import type { NamedKet, Vec3 } from '../../../physics/spin'

export const opStore = createStore<OperatorParams>(INITIAL_PARAMS)
export const useOperator = opStore.use
const get = opStore.get
const set = opStore.set

const clamp = (x: number, lo: number, hi: number) => (Number.isFinite(x) ? Math.min(hi, Math.max(lo, x)) : lo)
const capA = (a: Vec3): Vec3 => {
  const l = Math.hypot(...a)
  return l > A_MAX ? [(a[0] * A_MAX) / l, (a[1] * A_MAX) / l, (a[2] * A_MAX) / l] : a
}
/** Leaving typed cells for the parameters: start from the real parts of the typed operator. */
const paramsBase = (): { a0: number; a: Vec3 } => {
  const s = get()
  if (s.source === 'params') return { a0: s.a0, a: s.a }
  const m = operatorModel(s)
  return { a0: clamp(m.a0, -A0_MAX, A0_MAX), a: capA(m.a) }
}
/** Under "Predict first" a new A is shown in the z basis (its eigenbasis would show it diagonal: item 6). */
const hiddenBasis = (): Partial<OperatorParams> => (get().predict ? { basis: 'z' } : {})
/** Any change of A: back to the parameters (Hermitian, plain numbers), results hidden again under "Predict first". */
const setA = (a0: number, a: Vec3, extra: Partial<OperatorParams> = {}) =>
  set({ source: 'params', a0: clamp(a0, -A0_MAX, A0_MAX), a: capA(a), cellError: null, preset: null, revealed: false, ...hiddenBasis(), ...extra })

export function applyPreset(id: OpPresetId): void {
  const s = get()
  const { a0, a } = presetParams(id, s.sn)
  set({ source: 'params', a0, a, typed: null, cellVals: null, cellError: null, preset: id, revealed: false, frozenScale: null, ...hiddenBasis() })
}
/** S_n's angles (degrees); re-applies S_n when it is the current preset. */
export function setSn(theta: number, phi: number): void {
  set({ sn: { theta: clamp(theta, 0, 180), phi: clamp(phi, -180, 360) } })
  if (get().preset === 'sn') applyPreset('sn')
}
export const setA0 = (v: number): void => {
  const b = paramsBase()
  setA(v, b.a)
}
export function setAk(k: 0 | 1 | 2, v: number): void {
  const b = paramsBase()
  const a: Vec3 = [...b.a]
  a[k] = clamp(v, -A_MAX, A_MAX)
  setA(b.a0, a)
}

/**
 * One typed cell (display basis). Only that cell is read again: the other three keep their full-precision values
 * (item 10). A cell that does not parse keeps the last good matrix and reports where.
 */
export function setCell(r: 0 | 1, k: 0 | 1, text: string): void {
  const s = get()
  const fromParams = s.source !== 'cells' || !s.cellVals
  const cells = fromParams ? cellsOf(matrixOf(s), s.basis) : s.cells
  const vals: Mat = fromParams ? inBasis(matrixOf(s), s.basis) : s.cellVals!
  const res = editCell(cells, vals, r, k, text, s.basis)
  if (res.M) set({ source: 'cells', cells: res.cells, cellVals: res.vals, typed: res.M, cellError: null, preset: null, revealed: false })
  // the picture keeps the matrix it showed (a stale `typed` from an earlier session must not come back)
  else set({ source: 'cells', cells: res.cells, cellVals: res.vals, typed: matrixOf(s), cellError: res.error, preset: null })
}
/**
 * Display basis: the matrix (and the cells) change, the picture does not. Refused while the results are hidden
 * (item 6: the eigenbasis would show A diagonal; the radios are disabled too).
 */
export function setBasis(basis: Basis): void {
  const s = get()
  if (s.predict && !s.revealed) return
  const M = matrixOf(s)
  set({ basis, cells: cellsOf(M, basis), cellVals: inBasis(M, basis), cellError: null })
}

export const setPsi0Named = (k: NamedKet): void => set({ psi0: PSI_NAMED(k) })
export const setPsi0Angles = (theta: number, phi: number): void => set({ psi0: { named: null, theta: clamp(theta, 0, Math.PI), phi } })
export const setTau = (t: number): void => set({ tau: clamp(t, 0, TAU_MAX) })
export const setB = (id: OpPresetId | null): void => set({ B: id })
/** Predict first on: results hidden, and a preset or dragged A is shown in the z basis (typed cells stay as typed). */
export const setPredict = (on: boolean): void => set({ predict: on, revealed: false, guess: ['', ''], ...(on && get().source === 'params' ? { basis: 'z' as Basis } : {}) })
export const setGuess = (i: 0 | 1, text: string): void => set({ guess: i === 0 ? [text, get().guess[1]] : [get().guess[0], text] })
export const reveal = (): void => set({ revealed: true })
export const setSplit = (split: 'lr' | 'tb'): void => set({ split })
export const setFocus = (focus: HandleId | null): void => set({ focus })

/** A drag from the canvas (a point in physics coordinates) → the handle's parameter. */
export function dragHandle(handle: HandleId, phase: 'start' | 'move' | 'end', p: Vec3 | null): void {
  const s = get()
  if (handle === 'tip') {
    if (phase === 'start') set({ frozenScale: operatorModel(s).scale })
    const scale = get().frozenScale ?? operatorModel(get()).scale
    if (p) {
      const b = paramsBase()
      setA(b.a0, aFromTip(p, scale))
    }
    if (phase === 'end') set({ frozenScale: null })
    return
  }
  if (!p) return
  if (handle === 'psi0') set({ psi0: psi0FromPoint(p) })
  else setTau(tauFromBead(operatorModel(s), p, s.tau))
}

/** A keyboard nudge from a handle's DOM twin (Shift = the fine step). */
export function nudgeHandle(handle: HandleId, n: Nudge): void {
  const s = get()
  if (handle === 'tip') {
    const step = NUDGE.tip[n.fine ? 1 : 0] * n.dir
    // ← → move a_x, ↓ ↑ move a_z (up on screen), Page Down / Page Up move a_y
    const k = n.axis === 0 ? 0 : n.axis === 1 ? 2 : 1
    const b = paramsBase()
    setAk(k as 0 | 1 | 2, b.a[k] + step)
    return
  }
  if (handle === 'psi0') {
    const d = (NUDGE.psi0Deg[n.fine ? 1 : 0] * Math.PI) / 180
    const { theta, phi } = s.psi0
    if (n.axis === 0) setPsi0Angles(theta, phi + n.dir * d)
    else setPsi0Angles(theta - n.dir * d, phi)
    return
  }
  const m = operatorModel(s)
  const turn = (NUDGE.beadDeg[n.fine ? 1 : 0] * Math.PI) / 180
  setTau(s.tau + (n.dir * (m.len > 1e-9 ? turn / (2 * m.len) : 0.05)))
}

/** An allowlisted deep-link setup (presets.ts): replaces the bench's parameters; nothing else is read. */
export function applySetup(id: string): void {
  const setup = SETUPS[id]
  if (!setup) return
  opStore.set({ ...INITIAL_PARAMS, split: get().split, predict: get().predict })
  if (typeof setup.A === 'string') applyPreset(setup.A)
  else {
    const res = parseCells(setup.A.cells, 'z')
    if (res.ok) set({ source: 'cells', cells: setup.A.cells, cellVals: res.D, typed: res.M, preset: null, cellError: null })
  }
  if (setup.psi0) setPsi0Named(setup.psi0)
  if (setup.tau !== undefined) setTau(setup.tau)
  set({ B: setup.B ?? null })
}

