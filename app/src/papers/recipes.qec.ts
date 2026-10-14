/**
 * The error-correction recipes of the background chapter B1 (P-B1-story §9.1; rulings papers-B1B2.md R8–R9): each is an
 * allow-listed engine computation (physics/qec) with typed parameters, returning props for a stage kind and the named numbers
 * a computed claim may cite. They are registered in papers/recipes.ts `RECIPES`; this file only holds their definitions so
 * recipes.ts stays readable. Pure: no clock, no randomness except the seeded `sample`.
 */
import type { RecipeDef, RecipeOutput } from './recipes'
import { bool, ident, int, list, num, oneOf, optional, pauliText, plain, shape, type Param } from './params'
import { cssDistance, repetitionCode, rotatedSurfaceCode, shorCode, steaneCode, type CSSCode } from '../physics/qec/codes'
import { toricCode, toricInStabilizer, toricLit, toricMaxOverlap, toricOperator } from '../physics/qec/toric'
import { planarSurfaceCode, surfaceSizes } from '../physics/qec/planar'
import { CORNERS, scheduleCheck, scheduleCount, type Corner } from '../physics/qec/schedule'
import { checkCircuitCount, circuitDistance, hookWeights, memoryCircuit } from '../physics/qec/faults'
import { decodeHistory, failureSpectrum, historyOf, repetitionGraph, sampleHistory, type RepFault } from '../physics/qec/spacetime'
import { SURFACE_PRESETS, cleanRun, dNeeded, logicalBudget, patchQubits, repetitionLogical, stepsFor, suppressionPerStep, surfaceFit, type SurfacePreset } from '../physics/qec/curves'
import { frameThrough } from '../physics/qec/frame'
import type { Circuit, Op } from '../physics/qc/circuit'

const def = <P>(d: RecipeDef<P>): RecipeDef<P> => d

export { CORNERS, type Corner }
export const TORIC_OPERATORS = ['z-loop-h', 'z-loop-v', 'x-cut-h', 'x-cut-v', 'plaquette'] as const

const edgeRef = shape({ dir: oneOf(['h', 'v'] as const), i: int(0, 7), j: int(0, 7) })
const repFault = shape({ kind: oneOf(['data', 'meas'] as const), at: int(0, 8), t: int(1, 6) })
const frameGate = shape({ gate: oneOf(['H', 'S', 'CNOT'] as const), target: int(0, 2), control: optional(int(0, 2)) })
const reportedMark = shape({ id: ident(), x: num(0, 1e12), label: optional(plain(24)) })

const sum = (xs: readonly number[]): number => xs.reduce((a, b) => a + b, 0)
const bitsOf = (n: number, qubits: readonly number[]): number[] => {
  const v = new Array<number>(n).fill(0)
  for (const q of qubits) v[q] ^= 1
  return v
}
const weightOf = (v: readonly number[]): number => sum(v)

/* ---------------------------------------------------------------------------------------------- */
/* toric-code                                                                                      */
/* ---------------------------------------------------------------------------------------------- */

export const toricCodeRecipe = def({
  id: 'toric-code',
  version: 1,
  title: 'Kitaev’s toric code on an L × M torus: stars, plaquettes, errors, loops and cuts',
  kinds: ['code'],
  params: shape({
    L: int(2, 8),
    M: optional(int(2, 8)),
    view: optional(oneOf(['torus', 'tanner'] as const)),
    error: optional(shape({ type: oneOf(['X', 'Z'] as const), edges: list(edgeRef, 1, 24) })),
    operator: optional(oneOf(TORIC_OPERATORS)),
    operator2: optional(oneOf(TORIC_OPERATORS)),
    at: optional(int(0, 7)),
    at2: optional(int(0, 7)),
    show: optional(list(oneOf(['syndrome', 'logical', 'stars', 'plaquettes'] as const), 1, 4)),
    distance: optional(bool()),
  }),
  rules: (p) => {
    const M = p.M ?? p.L
    const bad: string[] = []
    p.error?.edges.forEach((e, i) => {
      if (e.i >= p.L || e.j >= M) bad.push(`params.error.edges[${i}]: vertex (${e.i}, ${e.j}) is outside the ${p.L} × ${M} torus`)
    })
    if (p.at !== undefined && p.at >= Math.max(p.L, M)) bad.push(`params.at: expected a whole number below ${Math.max(p.L, M)}`)
    if (p.at2 !== undefined && p.at2 >= Math.max(p.L, M)) bad.push(`params.at2: expected a whole number below ${Math.max(p.L, M)}`)
    if (p.operator2 !== undefined && p.operator === undefined) bad.push('params.operator2: needs params.operator')
    if (p.at2 !== undefined && (p.operator === undefined || p.at === undefined)) bad.push('params.at2: needs params.operator and params.at')
    if (p.show?.includes('syndrome') && !p.error) bad.push(`params.show: 'syndrome' needs params.error`)
    if (p.show?.includes('logical') && !p.operator) bad.push(`params.show: 'logical' needs params.operator`)
    if (p.view === 'tanner' && 2 * p.L * M > 25) bad.push(`params.view: the Tanner picture is drawn for at most 25 qubits (this torus has ${2 * p.L * M}); use 'torus'`)
    if (p.distance && p.L * M > 16) bad.push('params.distance: the exact search is limited to tori with L·M ≤ 16')
    return bad
  },
  run: (p) => {
    const t = toricCode(p.L, p.M)
    const M = t.M
    const values: Record<string, number> = {
      n: t.n,
      stars: t.stars.length,
      plaquettes: t.plaquettes.length,
      rankX: t.code.rankX,
      rankZ: t.code.rankZ,
      k: t.code.k,
      checkWeight: t.code.degrees().checkWeight,
      maxOverlap: toricMaxOverlap(t),
      perLogical: t.n / t.code.k,
    }
    const edgeId = (e: { dir: 'h' | 'v'; i: number; j: number }): number => (e.dir === 'h' ? t.hEdge(e.i, e.j) : t.vEdge(e.i, e.j))
    const fault = p.error ? { type: p.error.type, qubits: p.error.edges.map(edgeId) } : undefined
    if (fault) values.lit = toricLit(t, fault.type, fault.qubits).length
    const at = p.at ?? 0
    const op = p.operator ? toricOperator(t, p.operator, at) : undefined
    if (op) {
      values.operatorLit = toricLit(t, op.type, op.qubits).length
      values.operatorWeight = op.qubits.length
      values.operatorStabilizer = toricInStabilizer(t, op.type, op.qubits) ? 1 : 0
      if (p.operator2) {
        const op2 = toricOperator(t, p.operator2, at)
        values.overlap = op.qubits.filter((q) => op2.qubits.includes(q)).length
      }
      if (p.at2 !== undefined) {
        const other = toricOperator(t, p.operator!, p.at2)
        const diff = [...new Set([...op.qubits, ...other.qubits])].filter((q) => op.qubits.includes(q) !== other.qubits.includes(q))
        values.sameClass = toricInStabilizer(t, op.type, diff) ? 1 : 0
      }
    }
    if (p.distance) {
      const r = cssDistance(t.code, { maxWeight: Math.max(p.L, M) })
      if (!r.exact) throw new Error('the exact distance search did not finish')
      values.d = r.lower
    }
    const stage = {
      kind: 'code' as const,
      toric: p.M === undefined ? { L: p.L } : { L: p.L, M: p.M },
      view: p.view === 'tanner' ? ('layout' as const) : ('torus' as const),
      ...(fault ? { fault } : {}),
      ...(p.operator ? { operator: p.operator, at } : {}),
      ...(p.operator2 ? { operator2: p.operator2 } : {}),
      ...(p.show ? { show: p.show } : {}),
    }
    return { stage, values } as RecipeOutput
  },
})

/* ---------------------------------------------------------------------------------------------- */
/* rotated-patch                                                                                   */
/* ---------------------------------------------------------------------------------------------- */

export const rotatedPatchRecipe = def({
  id: 'rotated-patch',
  version: 1,
  title: 'A surface-code patch: the rotated layout (d = 3 to 9) or the unrotated planar one (d = 3 to 7)',
  kinds: ['code'],
  params: shape({
    d: int(3, 9),
    layout: optional(oneOf(['rotated', 'planar'] as const)),
    operator: optional(oneOf(['xbar', 'zbar'] as const)),
    error: optional(shape({ type: oneOf(['X', 'Y', 'Z'] as const), qubits: list(int(0, 96), 1, 8) })),
    show: optional(list(oneOf(['syndrome', 'logical', 'weights'] as const), 1, 3)),
    distance: optional(bool()),
    sizesAt: optional(int(3, 99)),
  }),
  rules: (p) => {
    const bad: string[] = []
    const layout = p.layout ?? 'rotated'
    if (p.d % 2 === 0) bad.push(`params.d: expected an odd distance, got ${p.d}`)
    if (layout === 'planar' && p.d > 7) bad.push('params.d: the unrotated planar patch is drawn for d = 3, 5, 7')
    if (p.distance && p.d > 5) bad.push('params.distance: the exact search is limited to d ≤ 5')
    if (p.sizesAt !== undefined && p.sizesAt % 2 === 0) bad.push(`params.sizesAt: expected an odd distance, got ${p.sizesAt}`)
    const n = layout === 'planar' ? p.d * p.d + (p.d - 1) * (p.d - 1) : p.d * p.d
    p.error?.qubits.forEach((q, i) => {
      if (q >= n) bad.push(`params.error.qubits[${i}]: qubit ${q} is outside the ${n} data qubits`)
    })
    if (p.show?.includes('syndrome') && !p.error) bad.push(`params.show: 'syndrome' needs params.error`)
    if (p.show?.includes('logical') && !p.operator) bad.push(`params.show: 'logical' needs params.operator`)
    if (p.show?.includes('weights') && layout === 'planar') bad.push(`params.show: 'weights' is drawn on the rotated layout`)
    if (p.operator && layout === 'planar') bad.push('params.operator: xbar and zbar are drawn on the rotated layout')
    return bad
  },
  run: (p) => {
    const layout = p.layout ?? 'rotated'
    const sizes = surfaceSizes(p.d)
    const values: Record<string, number> = { unrotData: sizes.unrotated.data, unrotTotal: sizes.unrotated.total, rotTotal: sizes.rotated.total, ratio: sizes.ratio }
    let code: CSSCode
    if (layout === 'rotated') {
      const r = rotatedSurfaceCode(p.d)
      code = r.code
      values.data = r.code.n
      values.checks = r.checks.length
      values.w4 = r.checks.filter((c) => c.qubits.length === 4).length
      values.w2 = r.checks.filter((c) => c.qubits.length === 2).length
      const col = Array.from({ length: r.code.n }, (_, q) => r.code.HZ.colWeight(q))
      values.litOne = col.filter((c) => c === 1).length
      values.litTwo = col.filter((c) => c === 2).length
      if (p.operator) values.overlap = r.logicalX.filter((q) => r.logicalZ.includes(q)).length
    } else {
      const pl = planarSurfaceCode(p.d)
      code = pl.code
      values.data = pl.n
      values.checks = pl.code.HX.rows + pl.code.HZ.rows
    }
    values.total = values.data + values.checks
    values.k = code.k
    const deg = code.degrees()
    values.checkWeight = deg.checkWeight
    values.qubitDegree = deg.qubitDegree
    if (p.error) {
      const v = bitsOf(code.n, p.error.qubits)
      const litX = weightOf(code.HZ.mulVec(v)) // an X error is seen by the Z checks
      const litZ = weightOf(code.HX.mulVec(v)) // a Z error by the X checks
      values.lit = p.error.type === 'X' ? litX : p.error.type === 'Z' ? litZ : litX + litZ
    }
    if (p.distance) {
      const r = cssDistance(code, { maxWeight: p.d })
      if (!r.exact) throw new Error('the exact distance search did not finish')
      values.d = r.lower
    }
    if (p.sizesAt !== undefined) {
      const s = surfaceSizes(p.sizesAt)
      values.sizesRotTotal = s.rotated.total
      values.sizesUnrotTotal = s.unrotated.total
      values.sizesRatio = s.ratio
    }
    const stage = {
      kind: 'code' as const,
      ...(layout === 'rotated' ? { rotated: { d: p.d } } : { planar: { d: p.d } }),
      view: 'patch' as const,
      ...(p.error ? { fault: { type: p.error.type, qubits: p.error.qubits } } : {}),
      ...(p.operator ? { operator: p.operator } : {}),
      ...(p.show ? { show: p.show } : {}),
    }
    return { stage, values } as RecipeOutput
  },
})

/* ---------------------------------------------------------------------------------------------- */
/* qec-small-code                                                                                  */
/* ---------------------------------------------------------------------------------------------- */

const SMALL: Record<'rep3' | 'shor9' | 'steane7', () => CSSCode> = { rep3: () => repetitionCode(3, 'bit-flip'), shor9: shorCode, steane7: steaneCode }

export const qecSmallCodeRecipe = def({
  id: 'qec-small-code',
  version: 1,
  title: 'A small registered code (repetition, Shor, Steane) as its Tanner graph or generator table',
  kinds: ['code'],
  params: shape({
    code: oneOf(['rep3', 'shor9', 'steane7'] as const),
    view: optional(oneOf(['tanner', 'checks'] as const)),
  }),
  run: (p) => {
    const c = SMALL[p.code]()
    const deg = c.degrees()
    const checks = c.HX.rows + c.HZ.rows
    const values = { n: c.n, checks, nodes: c.n + checks, edges: c.HX.totalWeight() + c.HZ.totalWeight(), checkWeight: deg.checkWeight, qubitDegree: deg.qubitDegree, k: c.k }
    return { stage: { kind: 'code', code: p.code, view: p.view === 'checks' ? 'checks' : 'layout' }, values } as RecipeOutput
  },
})

/* ---------------------------------------------------------------------------------------------- */
/* check-schedule                                                                                  */
/* ---------------------------------------------------------------------------------------------- */

let countCache: { total: number; conflictFree: number; valid: number } | null = null

export const checkScheduleRecipe = def({
  id: 'check-schedule',
  version: 1,
  title: 'The four-step order of a rotated patch’s check circuits: clashes, sequential equivalence and (d = 3) the circuit distance',
  kinds: ['code'],
  params: shape({
    d: int(3, 7),
    xOrder: list(oneOf(CORNERS), 4, 4),
    zOrder: list(oneOf(CORNERS), 4, 4),
    rounds: optional(int(1, 4)),
    distance: optional(bool()),
  }),
  rules: (p) => {
    const bad: string[] = []
    if (p.d % 2 === 0) bad.push(`params.d: expected an odd distance, got ${p.d}`)
    if (new Set(p.xOrder).size !== 4) bad.push('params.xOrder: lists a corner twice (the four corners TL, TR, BL, BR once each)')
    if (new Set(p.zOrder).size !== 4) bad.push('params.zOrder: lists a corner twice (the four corners TL, TR, BL, BR once each)')
    if (p.distance && p.d !== 3) bad.push('params.distance: the circuit distance is computed for d = 3 only')
    if (p.rounds !== undefined && !p.distance) bad.push('params.rounds: only with params.distance')
    return bad
  },
  run: (p) => {
    const r = scheduleCheck(p.d, p.xOrder, p.zOrder)
    const values: Record<string, number> = { conflictFree: r.conflictFree ? 1 : 0, valid: r.valid ? 1 : 0, badPairs: r.violations.length }
    if (p.d === 3) {
      countCache ??= scheduleCount(3)
      values.pairs = countCache.total
      values.pairsConflictFree = countCache.conflictFree
      values.pairsValid = countCache.valid
    }
    if (p.distance) {
      const c = circuitDistance(memoryCircuit(3, p.xOrder, p.zOrder, p.rounds ?? 3))
      if (c.dCirc === null) throw new Error('the circuit distance is above 3: not certified here')
      values.dCirc = c.dCirc
      values.faultEvents = c.events
      values.signatures = c.signatures
    }
    return { stage: { kind: 'code', rotated: { d: p.d }, view: 'patch', schedule: { xOrder: p.xOrder, zOrder: p.zOrder } }, values } as RecipeOutput
  },
})

/* ---------------------------------------------------------------------------------------------- */
/* check-circuit                                                                                   */
/* ---------------------------------------------------------------------------------------------- */

/** The ancilla circuit that measures one X check (check qubit in |+>, CNOT check -> data, X readout) or Z check (CNOT data -> check, Z readout). */
function checkCircuitOf(type: 'X' | 'Z', w: number): Circuit {
  const cols: Op[][] = []
  for (let i = 0; i < w; i++) cols.push([{ op: 'gate', gate: 'X', targets: type === 'X' ? [i] : [w], controls: type === 'X' ? [w] : [i] }])
  cols.push([{ op: 'gate', gate: type === 'X' ? 'H' : 'I', targets: [w] }]) // the X readout's basis change, or a wait before the Z readout
  cols.push([{ op: 'measure', qubit: w, bit: 0 }])
  return { version: 1, qubits: w + 1, clbits: 1, init: type === 'X' ? '0'.repeat(w) + '+' : '0'.repeat(w + 1), wires: [...Array.from({ length: w }, (_, i) => `d${i + 1}`), 'c'], columns: cols }
}

export const checkCircuitRecipe = def({
  id: 'check-circuit',
  version: 1,
  title: 'The circuit that measures one X or Z check: fault places and the hook',
  kinds: ['circuit'],
  params: shape({
    type: oneOf(['X', 'Z'] as const),
    weight: optional(int(2, 4)),
    show: optional(list(oneOf(['faults', 'hook'] as const), 1, 2)),
    hookAfter: optional(int(0, 3)),
  }),
  rules: (p) => {
    const w = p.weight ?? 4

    const bad: string[] = []
    if (w === 3) bad.push('params.weight: a surface-code check has weight 2 or 4, got 3')
    if (p.show?.includes('hook') && p.hookAfter === undefined) bad.push(`params.show: 'hook' needs params.hookAfter`)
    if (p.hookAfter !== undefined && p.hookAfter >= w) bad.push(`params.hookAfter: expected a whole number below the weight ${w}`)
    return bad
  },
  run: (p) => {
    const w = p.weight ?? 4
    const count = checkCircuitCount(p.type, w)
    const hook = hookWeights(w)
    const circuit = checkCircuitOf(p.type, w)
    const values: Record<string, number> = { locations: count.places.total, n: count.n, expected: count.expected, events: count.events, hookEffMax: hook.maxEffective }
    hook.data.forEach((v, k) => (values[`hookData${k}`] = v))
    hook.effective.forEach((v, k) => (values[`hookEff${k}`] = v))
    const last = circuit.columns.length - 1 // the measurement column
    const faults = [
      { col: 0, wires: [w], label: 'prep' },
      ...Array.from({ length: w }, (_, i) => ({ col: 0, wires: [i] })),
      ...Array.from({ length: w }, (_, i) => ({ col: i + 1, wires: [i, w] })),
      ...Array.from({ length: w }, (_, i) => ({ col: last, wires: [i] })),
      { col: last, wires: [w], label: 'meas' },
    ]
    const stage = {
      kind: 'circuit' as const,
      circuit,
      ...(p.show?.includes('faults') ? { faults } : {}),
      ...(p.show?.includes('hook') ? { hook: { after: p.hookAfter as 0 | 1 | 2 | 3 } } : {}),
    }
    return { stage, values } as RecipeOutput
  },
})

/* ---------------------------------------------------------------------------------------------- */
/* repetition-history                                                                              */
/* ---------------------------------------------------------------------------------------------- */

export const repetitionHistoryRecipe = def({
  id: 'repetition-history',
  version: 1,
  title: 'A repetition code over several rounds: detectors, matching, failure counts',
  kinds: ['spacetime'],
  params: shape({
    n: int(3, 9),
    rounds: int(1, 6),
    faults: optional(list(repFault, 1, 12)),
    sample: optional(shape({ p: num(0, 1), q: num(0, 1), seed: int(0, 2147483647) })),
    decode: optional(bool()),
    spectrum: optional(bool()),
    maxW: optional(int(1, 4)),
    full: optional(bool()),
    pAt: optional(num(0, 0.5)),
  }),
  rules: (p) => {
    const bad: string[] = []
    const edges = (2 * p.n - 1) * p.rounds
    p.faults?.forEach((f, i) => {
      if (f.kind === 'data' && f.at >= p.n) bad.push(`params.faults[${i}].at: expected a qubit below ${p.n}, got ${f.at}`)
      if (f.kind === 'meas' && f.at >= p.n - 1) bad.push(`params.faults[${i}].at: expected a check below ${p.n - 1}, got ${f.at}`)
      if (f.t > p.rounds) bad.push(`params.faults[${i}].t: expected a round up to ${p.rounds}, got ${f.t}`)
    })
    if (p.faults && p.sample) bad.push('params.sample: not together with params.faults')
    if (p.spectrum && (p.faults || p.sample || p.decode)) bad.push('params.spectrum: the failure counts draw no single history (no faults, sample or decode)')
    if ((p.maxW !== undefined || p.full || p.pAt !== undefined) && !p.spectrum) bad.push('params.maxW, params.full and params.pAt need params.spectrum')
    if (p.full && edges > 15) bad.push(`params.full: a full enumeration is limited to 15 fault places (this history has ${edges})`)
    if (p.pAt !== undefined && !p.full) bad.push('params.pAt: needs params.full')
    if (p.spectrum && !p.full) {
      const w = p.maxW ?? 2
      if (w === 3 && edges > 45) bad.push(`params.maxW: weight 3 is limited to 45 fault places (this history has ${edges})`)
      if (w === 4 && edges > 15) bad.push(`params.maxW: weight 4 is limited to 15 fault places (this history has ${edges})`)
    }
    return bad
  },
  run: (p) => {
    const g = repetitionGraph(p.n, p.rounds)
    const values: Record<string, number> = { detectors: g.detectors.length, edges: g.edges.length }
    if (p.spectrum) {
      const maxW = p.maxW ?? 2
      const sp = failureSpectrum(g, p.full ? 15 : maxW, p.full ?? false)
      for (const r of sp.rows)
        if (r.w <= maxW) {
          values[`w${r.w}Total`] = r.total
          values[`w${r.w}Fail`] = r.fail
          values[`w${r.w}Tie`] = r.tie
          values[`w${r.w}Bad`] = r.bad
        }
      if (p.full && p.pAt !== undefined) values.pL = sp.pL!(p.pAt)
      return { stage: { kind: 'spacetime', history: { code: 'rep', n: p.n, rounds: p.rounds }, spectrum: { maxW } }, values } as RecipeOutput
    }
    const faults: RepFault[] = p.faults ?? (p.sample ? sampleHistory(g, p.sample.p, p.sample.q, p.sample.seed) : [])
    const h = historyOf(g, faults)
    values.faultCount = faults.length
    values.lit = h.lit.length
    values.trueFlip = h.trueFlip
    if (p.decode) {
      const dec = decodeHistory(g, h.lit)
      values.matchWeight = dec.weight
      values.decodedFlip = dec.decodedFlip
      values.failed = dec.decodedFlip !== h.trueFlip ? 1 : 0
      values.tie = dec.tie ? 1 : 0
    }
    const history = { code: 'rep' as const, n: p.n, rounds: p.rounds, ...(p.faults ? { faults: p.faults } : {}), ...(p.sample ? { sample: p.sample } : {}) }
    const show = p.decode ? ['faults', 'detectors', 'matching', 'verdict'] : ['faults', 'detectors']
    return { stage: { kind: 'spacetime', history, show }, values } as RecipeOutput
  },
})

/* ---------------------------------------------------------------------------------------------- */
/* logical-error-curves                                                                            */
/* ---------------------------------------------------------------------------------------------- */

/** The axis a picture uses when `x` is left out: a vote is drawn against d when p is given, a fit against p when a list of d is given. */
const xOf = (p: { family: string; x?: 'p' | 'd' | 'N'; p?: number; d?: number[] }): 'p' | 'd' | 'N' =>
  p.x ?? (p.family === 'surface' ? (p.d ? 'p' : 'd') : p.family === 'repetition' ? (p.p !== undefined ? 'd' : 'p') : 'N')

const presetsOf = (id: 'tdg-2.6' | 'tdg-A10' | 'bev22' | 'all' | undefined): readonly SurfacePreset[] =>
  id === undefined ? SURFACE_PRESETS.filter((s) => s.id === 'tdg-A10') : id === 'all' ? SURFACE_PRESETS : SURFACE_PRESETS.filter((s) => s.id === id)

const leParams = shape({
  family: oneOf(['clean-run', 'repetition', 'surface', 'budget'] as const),
  preset: optional(oneOf(['tdg-2.6', 'tdg-A10', 'bev22', 'all'] as const)),
  x: optional(oneOf(['p', 'd', 'N'] as const)),
  p: optional(num(1e-12, 0.5)),
  d: optional(list(int(3, 99), 1, 6)),
  target: optional(shape({ N: num(1, 1e15), success: num(0.01, 0.999999) })),
  markers: optional(list(int(1, 1e12), 1, 6)),
  suppress: optional(num(2, 1e12)),
  reportedMarks: optional(list(reportedMark, 1, 4)),
})
type LEParams = typeof leParams extends Param<infer T> ? T : never

export const logicalErrorCurvesRecipe = def({
  id: 'logical-error-curves',
  version: 1,
  title: 'Curves of logical error: clean-run chance, a repetition vote, the published surface-code fits',
  kinds: ['plot'],
  params: leParams,
  rules: (p) => {
    const bad: string[] = []
    const odd = (xs: readonly number[] | undefined, at: string) => {
      if (xs?.some((d) => d % 2 === 0)) bad.push(`${at}: expected odd distances, got ${xs.join(', ')}`)
      if (xs && new Set(xs).size !== xs.length) bad.push(`${at}: lists a distance twice`)
    }
    odd(p.d, 'params.d')
    if (p.markers && p.family !== 'clean-run') bad.push(`params.markers: only with family 'clean-run'`)
    if (p.markers && p.p === undefined) bad.push('params.markers: needs params.p')
    if (p.suppress !== undefined && (p.family !== 'surface' || p.p === undefined)) bad.push(`params.suppress: needs family 'surface' and params.p`)
    if (p.preset !== undefined && p.family !== 'surface') bad.push(`params.preset: only with family 'surface'`)
    if (p.family === 'clean-run' && p.p === undefined && !p.target) bad.push(`params.p: family 'clean-run' needs the per-step chance p (or a target)`)
    if (p.family === 'budget' && !p.target) bad.push(`params.target: family 'budget' needs params.target`)
    const x = xOf(p)
    if (p.family === 'repetition' && x === 'd' && p.p === undefined) bad.push(`params.p: a vote against d needs the flip chance p`)
    if (p.family === 'repetition' && x === 'p' && !p.d) bad.push(`params.d: a vote against p needs the list of d`)
    if (p.family === 'surface' && x === 'p' && !p.d) bad.push(`params.d: a fit against p needs the list of d`)
    if (p.family === 'surface' && x === 'd' && p.p === undefined) bad.push(`params.p: a fit against d needs p`)
    if ((p.family === 'surface' || p.family === 'repetition') && x === 'N') bad.push(`params.x: 'N' belongs to family 'clean-run'`)
    if (p.family === 'surface' && p.d && x === 'p' && p.d.length * presetsOf(p.preset).length > 6) bad.push('params.d: at most 6 curves (d list × presets)')
    if (p.reportedMarks && x !== 'p') bad.push(`params.reportedMarks: marks sit on a p axis (params.x 'p')`)
    return bad
  },
  run: (p) => {
    const values: Record<string, number> = {}
    const budget = p.target ? logicalBudget(p.target.N, p.target.success) : undefined
    if (budget !== undefined) values.budget = budget
    if (p.p !== undefined) for (const N of p.markers ?? []) values[`cleanRun${N}`] = cleanRun(N, p.p)
    if (p.p !== undefined && p.target) values.expFaults = p.target.N * p.p
    for (const d of p.d ?? []) values[`qubitsD${d}`] = patchQubits(d)
    if (p.family === 'repetition' && p.p !== undefined) {
      for (const d of p.d ?? []) values[`repD${d}`] = repetitionLogical(d, p.p)
      if (budget !== undefined) {
        const dn = dNeeded((d) => repetitionLogical(d, p.p!), budget)
        if (dn === null) throw new Error('no distance up to 399 reaches the target')
        values.repDNeeded = dn
      }
    }
    const presets = p.family === 'surface' ? presetsOf(p.preset) : []
    for (const s of presets) {
      if (p.p !== undefined) {
        for (const d of p.d ?? []) values[`fit${s.code}D${d}`] = surfaceFit(d, p.p, s.id)
        values[`lambda${s.code}`] = suppressionPerStep(p.p, s.id)
        if (budget !== undefined) {
          const dn = dNeeded((d) => surfaceFit(d, p.p!, s.id), budget)
          if (dn === null) throw new Error('no distance up to 399 reaches the target')
          values[`dNeeded${s.code}`] = dn
          values[`qubits${s.code}`] = patchQubits(dn)
        }
        if (p.suppress !== undefined) values[`steps${s.code}`] = stepsFor(p.suppress, values[`lambda${s.code}`])
      }
    }
    if (p.preset === 'all' && p.p !== undefined && p.d?.length) {
      const d0 = p.d[0]
      values.fitRatio = surfaceFit(d0, p.p, 'tdg-A10') / surfaceFit(d0, p.p, 'bev22')
    }
    // ---- the picture
    const yLines = p.family === 'clean-run' && p.target ? [{ y: p.target.success, label: `target ${p.target.success.toPrecision(3)}` }] : budget !== undefined && p.family !== 'clean-run' ? [{ y: budget, label: 'target' }] : undefined
    const stage = plotStage(p, budget, presets, yLines)
    return { stage, values } as RecipeOutput
  },
})

function plotStage(p: LEParams, budget: number | undefined, presets: readonly SurfacePreset[], yLines: { y: number; label: string }[] | undefined) {
  const base = { kind: 'plot' as const, ...(yLines ? { yLines } : {}), ...(p.reportedMarks ? { reportedMarks: p.reportedMarks.map((m) => ({ x: m.x, label: m.label ?? m.id, source: m.id })) } : {}) }
  if (p.family === 'clean-run' || p.family === 'budget') {
    const series: { fn: 'cleanRun'; params: { p: number }; label: string }[] = []
    if (p.p !== undefined) series.push({ fn: 'cleanRun', params: { p: p.p }, label: `p = ${p.p}` })
    if (budget !== undefined) series.push({ fn: 'cleanRun', params: { p: budget }, label: 'at the target' })
    const markers = (p.markers ?? (p.target ? [p.target.N] : undefined))?.map((N) => ({ x: N, label: `N = ${N}` }))
    return { ...base, series, xScale: 'log' as const, yScale: 'linear' as const, xRange: { from: 1, to: Math.max(1e4, ...(markers?.map((m) => m.x * 10) ?? [])) }, ...(markers ? { markers } : {}) }
  }
  if (p.family === 'repetition') {
    if (xOf(p) === 'd')
      return { ...base, series: [{ fn: 'repLogicalVsD' as const, params: { p: p.p! }, label: `p = ${p.p}` }], yScale: 'log' as const, xRange: { from: Math.min(3, ...(p.d ?? [3])), to: Math.max(13, ...(p.d ?? [13])) }, ...(p.d ? { markers: p.d.map((d) => ({ x: d, label: `d = ${d}` })) } : {}) }
    return { ...base, series: (p.d ?? []).map((d) => ({ fn: 'repLogicalVsP' as const, params: { d }, label: `d = ${d}` })), xRange: { from: Math.min(0.02, ...(p.reportedMarks ?? []).map((m) => m.x * 0.5)), to: 0.98 } }
  }
  if (xOf(p) === 'p')
    return {
      ...base,
      series: presets.flatMap((s) => (p.d ?? []).map((d) => ({ fn: 'surfaceVsP' as const, params: { d, preset: s.id }, label: presets.length > 1 ? `${s.code} d = ${d}` : `d = ${d}` }))),
      xScale: 'log' as const,
      yScale: 'log' as const,
      xRange: { from: 1e-4, to: 2e-2 },
    }
  return {
    ...base,
    series: presets.map((s) => ({ fn: 'surfaceVsD' as const, params: { p: p.p!, preset: s.id }, label: s.code })),
    yScale: 'log' as const,
    xRange: { from: 3, to: Math.max(25, ...(p.d ?? [25])) },
    ...(p.d ? { markers: p.d.map((d) => ({ x: d, label: `d = ${d}` })) } : {}),
  }
}

/* ---------------------------------------------------------------------------------------------- */
/* pauli-frame                                                                                     */
/* ---------------------------------------------------------------------------------------------- */

export const pauliFrameRecipe = def({
  id: 'pauli-frame',
  version: 1,
  title: 'A Pauli frame pushed through H, S and CNOT gates (conjugation)',
  kinds: ['circuit'],
  params: shape({
    qubits: int(1, 3),
    gates: list(frameGate, 1, 8),
    frame: pauliText(1, 3),
    upTo: optional(int(0, 8)),
  }),
  rules: (p) => {
    const bad: string[] = []
    if (p.frame.length !== p.qubits) bad.push(`params.frame: expected ${p.qubits} letters (one per qubit), got ${p.frame.length}`)
    p.gates.forEach((g, i) => {
      const at = `params.gates[${i}]`
      if (g.target >= p.qubits) bad.push(`${at}.target: wire ${g.target} is outside the register`)
      if (g.gate === 'CNOT') {
        if (g.control === undefined) bad.push(`${at}.control: CNOT needs a control wire`)
        else if (g.control >= p.qubits) bad.push(`${at}.control: wire ${g.control} is outside the register`)
        else if (g.control === g.target) bad.push(`${at}.control: the control must differ from the target`)
      } else if (g.control !== undefined) bad.push(`${at}.control: ${g.gate} takes no control`)
    })
    if (p.upTo !== undefined && p.upTo > p.gates.length) bad.push(`params.upTo: expected a whole number from 0 to ${p.gates.length}`)
    return bad
  },
  run: (p) => {
    const run = frameThrough(p.frame, p.gates)
    const values: Record<string, number> = {}
    run.weights.forEach((w, k) => (values[`weight${k}`] = w))
    const columns: Op[][] = p.gates.map((g) => [g.gate === 'CNOT' ? { op: 'gate', gate: 'X', targets: [g.target], controls: [g.control as number] } : { op: 'gate', gate: g.gate, targets: [g.target] }])
    const upTo = p.upTo ?? p.gates.length
    const circuit: Circuit = { version: 1, qubits: p.qubits, columns }
    return { stage: { kind: 'circuit', circuit, upTo, observable: { pauli: run.frames[upTo], at: upTo } }, values } as RecipeOutput
  },
})
