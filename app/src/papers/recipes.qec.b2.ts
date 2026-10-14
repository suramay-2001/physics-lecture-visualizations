/**
 * The quantum-LDPC and bivariate-bicycle recipes of the background chapter B2 (P-B2-story §9.1; rulings papers-B1B2.md R4-R9): each is an allow-listed engine computation (physics/qec:
 * bbfamily.ts, bp.ts, qldpc.ts) with typed parameters, returning props for a stage kind and the named numbers a computed claim may cite. Registered in papers/recipes.ts `RECIPES`.
 * They live beside recipes.qec.ts (the B1 recipes) so that chapters built in parallel append to separate files. Pure: no clock, no randomness (the tableau run uses a fixed seed).
 */
import type { RecipeDef } from './recipes'
import { bool, int, list, num, oneOf, optional, shape } from './params'
import type { PlotPoint } from '../content/stage'
import { type BBSpec } from '../physics/qec/bb'
import {
  BB_PRESET_NAMES,
  ISO_HINTS,
  bbClashQubits,
  bbCodeOf,
  bbCodeOfSpec,
  bbCycleDetectors,
  bbDistanceRecord,
  bbIsomorphism,
  bbLayers,
  bbPreset,
  bbRoundEdges,
  bbScheduleCheck,
  bbShiftSummary,
  cycleSteps,
  kd2n,
  logicalShiftMatrix,
  matrixOrder,
  permutationPreserves,
  type BBPresetName,
} from '../physics/qec/bbfamily'
import { differByStabilizer, fourCycles, minSumBP, osd0 } from '../physics/qec/bp'
import { cssDistance, rotatedSurfaceCode } from '../physics/qec/codes'
import { GF2Matrix } from '../physics/qec/gf2'
import { hammingRow, surfaceRate, toricRow } from '../physics/qec/qldpc'
import { toricCode } from '../physics/qec/toric'

const def = <P>(d: RecipeDef<P>): RecipeDef<P> => d

const PRESETS = BB_PRESET_NAMES
const monoRef = shape({ dx: int(-1000, 1000), dy: int(-1000, 1000) })
const cellRef = shape({ i: int(0, 23), j: int(0, 23) })
const TABLE3_NAMES = ['b72', 'b90', 'b108', 'b144', 'b288', 'b360', 'b756'] as const
const SPEC_PARAM = shape({ l: int(2, 24), m: int(2, 24), A: list(monoRef, 1, 4), B: list(monoRef, 1, 4) })
type SpecParam = { l: number; m: number; A: { dx: number; dy: number }[]; B: { dx: number; dy: number }[] }
const specOf = (s: SpecParam): BBSpec => ({ name: 'custom', l: s.l, m: s.m, A: s.A.map((t) => [t.dx, t.dy] as [number, number]), B: s.B.map((t) => [t.dx, t.dy] as [number, number]) })
const statusOf = (kind: 'exact' | 'exact-offline' | 'reported' | 'bound'): NonNullable<PlotPoint['status']> => (kind === 'reported' ? 'reported' : kind === 'bound' ? 'bound' : 'computed')
const dLabel = (kind: string, d: number): string => (kind === 'bound' ? `d≤${d}` : `d=${d}`)

/* ---------------------------------------------------------------------------------------------- */
/* qldpc-family                                                                                    */
/* ---------------------------------------------------------------------------------------------- */

const KD2N_CODES = ['gross', 'two-gross', 'b72', 'b90', 'b108', 'b144', 'b288', 'b360', 'b756', 'toy-24', 'surface-d3', 'surface-d5', 'surface-d7', 'surface-d13', 'toric-L4'] as const

export const qldpcFamilyRecipe = def({
  id: 'qldpc-family',
  version: 1,
  title: 'Sparse against dense codes, the rate of the surface code, k d² / n, and the seven codes of Table 3 of Bravyi et al.',
  kinds: ['plot'],
  params: shape({
    view: oneOf(['check-weight', 'rate', 'kd2n', 'table3'] as const),
    hammingR: optional(list(int(3, 7), 1, 5)),
    toricL: optional(list(int(2, 8), 1, 6)),
    d: optional(list(int(3, 25), 1, 8)),
    codes: optional(list(oneOf(KD2N_CODES), 1, 10)),
    logX: optional(bool()),
  }),
  rules: (p) => {
    const bad: string[] = []
    if (p.view === 'check-weight' && !p.hammingR && !p.toricL) bad.push('params.hammingR: the check-weight view needs params.hammingR or params.toricL')
    if (p.view === 'rate' && !p.d) bad.push('params.d: the rate view needs params.d')
    if (p.view === 'rate') p.d?.forEach((d, i) => d % 2 === 0 && bad.push(`params.d[${i}]: expected an odd distance, got ${d}`))
    if (p.view === 'kd2n' && !p.codes) bad.push('params.codes: the kd2n view needs params.codes')
    if (p.view !== 'check-weight' && (p.hammingR || p.toricL)) bad.push('params.hammingR: only the check-weight view takes hammingR and toricL')
    if (p.view !== 'rate' && p.d) bad.push('params.d: only the rate view takes d')
    if (p.view !== 'kd2n' && p.codes) bad.push('params.codes: only the kd2n view takes codes')
    return bad
  },
  run: (p) => {
    const values: Record<string, number> = {}
    for (const r of [3, 4, 5, 6, 7]) {
      const row = hammingRow(r)
      values[`hammingW${row.n}`] = row.checkWeight
      values[`hammingK${row.n}`] = row.k
    }
    values.hammingRate63 = values.hammingK63 / 63
    values.toricW = toricRow(4).checkWeight
    values.surfaceRate3 = surfaceRate(3)
    values.surfaceRate17 = surfaceRate(17)
    values.surfaceData17 = 17 * 17
    values.surfaceData13 = 13 * 13
    values.surfaceDataFor12 = 12 * 13 * 13
    values.surfaceRatio13 = values.surfaceDataFor12 / 144
    const patch = rotatedSurfaceCode(9)
    values.kd2nSurface = kd2n(patch.code.k, 9, patch.code.n)
    const torus = toricCode(4)
    values.kd2nToric = kd2n(torus.code.k, 4, torus.n)
    for (const name of TABLE3_NAMES) {
      const c = bbCodeOf(name)
      const nn = name.slice(1)
      values[`n${nn}`] = c.n
      values[`k${nn}`] = c.k
    }
    const rec72 = bbDistanceRecord('b72')
    values.d72 = rec72.value
    values.d72Z = rec72.value
    for (const [name, key] of [['b72', '72'], ['b90', '90'], ['b108', '108'], ['b144', '144'], ['b288', '288']] as const) values[`kd2n${key}`] = kd2n(bbCodeOf(name).k, bbDistanceRecord(name).value, bbCodeOf(name).n)
    const pts: PlotPoint[] = []
    if (p.view === 'check-weight') {
      for (const r of p.hammingR ?? []) {
        const row = hammingRow(r)
        pts.push({ x: row.n, y: row.checkWeight, label: `r=${r}`, status: 'computed', group: 'CSS of Hamming codes' })
      }
      for (const L of p.toricL ?? []) {
        const row = toricRow(L)
        pts.push({ x: row.n, y: row.checkWeight, label: `L=${L}`, status: 'computed', group: 'toric code' })
      }
      return { stage: { kind: 'plot', points: pts, xLabel: 'qubits n', yLabel: 'check weight', xScale: 'log' }, values }
    }
    if (p.view === 'rate') {
      for (const d of p.d ?? []) pts.push({ x: d, y: surfaceRate(d), label: `d=${d}`, status: 'computed', group: 'surface patch' })
      return { stage: { kind: 'plot', points: pts, xLabel: 'distance d', yLabel: 'rate k/n', yScale: 'log' }, values }
    }
    if (p.view === 'table3') {
      for (const name of TABLE3_NAMES) {
        const c = bbCodeOf(name)
        const r = bbDistanceRecord(name)
        pts.push({ x: c.n, y: c.k, label: dLabel(r.kind, r.value), status: statusOf(r.kind), group: 'BB codes' })
      }
      return { stage: { kind: 'plot', points: pts, xLabel: 'qubits n', yLabel: 'logical qubits k', xScale: 'log' }, values }
    }
    for (const name of p.codes ?? []) {
      if (name.startsWith('surface-d')) {
        const d = Number(name.slice(9))
        const c = rotatedSurfaceCode(d)
        pts.push({ x: c.code.n, y: kd2n(c.code.k, d, c.code.n), label: `patch d=${d}`, status: 'computed', group: 'planar codes' })
      } else if (name === 'toric-L4') pts.push({ x: torus.n, y: values.kd2nToric, label: 'toric L=4', status: 'computed', group: 'planar codes' })
      else {
        const c = bbCodeOf(name as BBPresetName)
        const r = bbDistanceRecord(name as BBPresetName)
        pts.push({ x: c.n, y: kd2n(c.k, r.value, c.n), label: `[[${c.n},${c.k},${r.kind === 'bound' ? '≤' : ''}${r.value}]]`, status: statusOf(r.kind), group: 'BB codes' })
      }
    }
    return { stage: { kind: 'plot', points: pts, xLabel: 'qubits n', yLabel: 'k d² / n', ...(p.logX ? { xScale: 'log' as const } : {}), yLines: [{ y: 1, label: 'planar: 1' }] }, values }
  },
})

/* ---------------------------------------------------------------------------------------------- */
/* bb-code                                                                                         */
/* ---------------------------------------------------------------------------------------------- */

export const bbCodeRecipe = def({
  id: 'bb-code',
  version: 1,
  title: 'A bivariate bicycle code from polynomials on a torus: cells, long edges, patterns, the check matrices, layers, counts',
  kinds: ['code', 'bits'],
  params: shape({
    preset: optional(oneOf(PRESETS)),
    spec: optional(SPEC_PARAM),
    form: optional(oneOf(['toric', 'bravyi'] as const)),
    view: optional(oneOf(['torus', 'matrix', 'layers'] as const)),
    check: optional(shape({ kind: oneOf(['X', 'Z'] as const), cell: cellRef })),
    longEdges: optional(bool()),
    pattern: optional(shape({ poly: oneOf(['A', 'B', 'At', 'Bt'] as const), anchor: cellRef })),
    which: optional(oneOf(['HX', 'HZ', 'both'] as const)),
    show: optional(list(oneOf(['bands'] as const), 1, 1)),
    distance: optional(bool()),
  }),
  rules: (p) => {
    const bad: string[] = []
    if ((p.preset === undefined) === (p.spec === undefined)) bad.push('params.preset: give exactly one of params.preset and params.spec')
    const spec = p.preset ? bbPreset(p.preset, p.form ?? 'toric') : p.spec ? specOf(p.spec) : null
    const view = p.view ?? 'torus'
    if (spec) {
      if (p.spec && spec.l * spec.m > 400) bad.push('params.spec: l·m must be at most 400')
      const cell = (c: { i: number; j: number } | undefined, at: string) => c && (c.i >= spec.l || c.j >= spec.m) && bad.push(`${at}: cell (${c.i}, ${c.j}) is outside the ${spec.l} × ${spec.m} torus`)
      cell(p.check?.cell, 'params.check.cell')
      cell(p.pattern?.anchor, 'params.pattern.anchor')
      if (view === 'layers' && !(spec.A.length === 3 && spec.B.length === 3)) bad.push('params.view: the layers view needs three monomials in A and in B')
      if (p.distance && 2 * spec.l * spec.m > 32 && !(p.preset && p.preset !== 'toy-24' && p.preset !== 'toric-3x3')) bad.push('params.distance: the exact search is limited to n ≤ 32')
    }
    if (view === 'matrix' && p.preset !== 'gross' && p.preset !== 'two-gross') bad.push("params.view: the matrix view draws the gross or two-gross code (params.preset 'gross' or 'two-gross')")
    if (view !== 'torus' && (p.check || p.longEdges || p.pattern)) bad.push("params.check: check, longEdges and pattern belong to the 'torus' view")
    if (p.longEdges && !p.check) bad.push('params.longEdges: needs params.check')
    if (view !== 'matrix' && (p.which || p.show)) bad.push("params.which: which and show belong to the 'matrix' view")
    return bad
  },
  run: (p) => {
    const view = p.view ?? 'torus'
    const form = p.form ?? 'toric'
    const spec = p.preset ? bbPreset(p.preset, form) : specOf(p.spec!)
    const code = p.preset ? bbCodeOf(p.preset, form) : bbCodeOfSpec(spec)
    const ring = code.ring
    const ab = ring.mul(code.A, code.B)
    const ba = ring.mul(code.B, code.A)
    const values: Record<string, number> = {
      n: code.n,
      k: code.k,
      checkWeight: code.checkWeight,
      qubitDegree: code.css.degrees().qubitDegree,
      rankX: code.HX.rank(),
      rankZ: code.HZ.rank(),
      ker: ring.matrix(code.A).vstack(ring.matrix(code.B)).nullspace().rows,
      aWeight: code.A.reduce((s, b) => s + b, 0),
      abWeight: ab.reduce((s, b) => s + b, 0),
      abCommute: ab.every((b, t) => b === ba[t]) ? 1 : 0,
      rate: code.k / (2 * code.n),
    }
    const sx = new Set(code.HX.rowSupport(0))
    const overlaps = Array.from({ length: code.HZ.rows }, (_, r) => code.HZ.rowSupport(r).filter((q) => sx.has(q)).length)
    values.overlap2 = overlaps.filter((o) => o === 2).length
    values.overlap0 = overlaps.filter((o) => o === 0).length
    const edges = code.tanner().edges
    const mine = edges.filter((e) => e.checkKind === 'X' && e.check === 0)
    values.localEdges = mine.filter((e) => e.kind === 'local').length
    values.longEdges = mine.filter((e) => e.kind === 'long').length
    values.longTotal = edges.filter((e) => e.kind === 'long').length
    values.edgeTotal = edges.length
    values.longShare = values.longTotal / values.edgeTotal
    if (spec.A.length === 3 && spec.B.length === 3) {
      const { layers } = bbLayers(code)
      values.layerDegree = Math.max(layers[0].maxDegree, layers[1].maxDegree)
      values.layerEdges = layers[0].edges + layers[1].edges
      values.layerEdgesEach = layers[0].edges
    }
    if (p.preset === 'toric-3x3') {
      // Kitaev's torus under L(i, j) = h(i, j), R(i, j) = v(i + 1, j − 1): the rows of both check matrices match as sets
      const t = toricCode(3)
      const perm = new Array<number>(18)
      for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++) {
          perm[i * 3 + j] = t.hEdge(i, j)
          perm[9 + i * 3 + j] = t.vEdge(i + 1, j - 1)
        }
      const key = (H: GF2Matrix, pm: readonly number[]): string =>
        Array.from({ length: H.rows }, (_, r) => H.rowSupport(r).map((q) => pm[q]).sort((a, b) => a - b).join(',')).sort().join('|')
      const id = Array.from({ length: 18 }, (_, q) => q)
      values.toricIsBB = key(code.HX, perm) === key(t.code.HX, id) && key(code.HZ, perm) === key(t.code.HZ, id) ? 1 : 0
    }
    if (p.distance) {
      const known = p.preset && p.preset !== 'toy-24' && p.preset !== 'toric-3x3' ? bbDistanceRecord(p.preset).value : null
      const d = known ?? (p.preset ? bbDistanceRecord(p.preset).value : cssDistance(code.css, { maxWeight: 6 }).lower)
      values.d = d
      values.kd2n = kd2n(code.k, d, code.n)
    }
    if (view === 'matrix') {
      const half = code.cells
      const bands = p.show ? [{ cols: [0, half - 1] as [number, number] }, { cols: [half, 2 * half - 1] as [number, number] }] : undefined
      return { stage: { kind: 'bits', bitmap: { matrix: { bb: p.preset as 'gross' | 'two-gross', which: p.which ?? 'both' }, ...(bands ? { bands } : {}) } }, values }
    }
    const src = p.preset
      ? { preset: p.preset, form: view === 'layers' && (p.preset === 'gross' || p.preset === 'two-gross') ? ('bravyi' as const) : form }
      : { spec: { l: spec.l, m: spec.m, A: spec.A.map((t) => [t[0], t[1]] as [number, number]), B: spec.B.map((t) => [t[0], t[1]] as [number, number]) } }
    const stage = {
      kind: 'code' as const,
      bb: src,
      view: view === 'layers' ? ('layers' as const) : ('cells' as const),
      ...(p.check ? { check: { kind: p.check.kind, cell: [p.check.cell.i, p.check.cell.j] as [number, number] } } : {}),
      ...(p.longEdges ? { longEdges: true } : {}),
      ...(p.pattern ? { pattern: { poly: p.pattern.poly, anchor: [p.pattern.anchor.i, p.pattern.anchor.j] as [number, number] } } : {}),
    }
    return { stage, values }
  },
})

/* ---------------------------------------------------------------------------------------------- */
/* bb-presentations                                                                                */
/* ---------------------------------------------------------------------------------------------- */

export const bbPresentationsRecipe = def({
  id: 'bb-presentations',
  version: 1,
  title: 'The gross and two-gross codes written two ways: paper-tdg’s polynomials and Bravyi et al.’s, matched by shifts',
  kinds: ['code'],
  params: shape({ code: oneOf(['gross', 'two-gross'] as const), step: optional(int(1, 3)) }),
  run: (p) => {
    const toric = bbCodeOf(p.code, 'toric')
    const bravyi = bbCodeOf(p.code, 'bravyi')
    const hint = ISO_HINTS[p.code]
    const values: Record<string, number> = {
      iso: bbIsomorphism(toric, bravyi, hint) ? 1 : 0,
      isoNoShift: bbIsomorphism(toric, bravyi, { alpha: [0, 0], beta: [0, 0], u: 1 }) ? 1 : 0,
      isoNoMap: bbIsomorphism(toric, bravyi, { ...hint, u: 1 }) ? 1 : 0,
    }
    const step = p.step ?? 3
    const stage =
      step === 1
        ? { kind: 'code' as const, bb: { preset: p.code, form: 'bravyi' as const }, view: 'cells' as const, pattern: { poly: 'A' as const, anchor: [0, 0] as [number, number] } }
        : step === 2
          ? { kind: 'code' as const, bb: { preset: p.code, form: 'toric' as const }, view: 'cells' as const, pattern: { poly: 'A' as const, anchor: [...hint.alpha] as [number, number] } }
          : { kind: 'code' as const, bb: { preset: p.code, form: 'toric' as const }, view: 'cells' as const, pattern: { poly: 'B' as const, anchor: [...hint.beta] as [number, number] } }
    return { stage, values }
  },
})

/* ---------------------------------------------------------------------------------------------- */
/* bb-schedule                                                                                     */
/* ---------------------------------------------------------------------------------------------- */

const SCHEDULE_PRESETS = ['gross', 'two-gross', 'b72', 'b108', 'b144', 'b288'] as const

export const bbScheduleRecipe = def({
  id: 'bb-schedule',
  version: 1,
  title: 'The depth-8 syndrome cycle of Bravyi et al. Table 5 on a bicycle code: clashes, out-of-order pairs, steps, a tableau run',
  kinds: ['code'],
  params: shape({
    preset: oneOf(SCHEDULE_PRESETS),
    variant: oneOf(['printed', 'swap-z-reads'] as const),
    round: optional(int(1, 8)),
    cycles: optional(int(1, 20)),
    tableau: optional(bool()),
  }),
  rules: (p) => {
    const bad: string[] = []
    if (p.tableau && bbCodeOf(p.preset, 'bravyi').cells > 72) bad.push('params.tableau: the tableau run is limited to codes of at most 72 cells (b72, gross)')
    return bad
  },
  run: (p) => {
    const code = bbCodeOf(p.preset, 'bravyi')
    const rep = bbScheduleCheck(code, p.variant)
    const round = p.round ?? 1
    const values: Record<string, number> = {
      conflict: rep.clashes,
      badPairs: rep.badPairs,
      pairs: rep.pairs,
      maxOverlap: rep.maxOverlap,
      depth: rep.rounds,
      steps: cycleSteps(p.cycles ?? 1),
      activeEdges: bbRoundEdges(code, p.variant, round).length,
      clashQubits: bbClashQubits(code, p.variant).length,
    }
    if (p.tableau) {
      const t = bbCycleDetectors(code, p.variant, 2, 5)
      values.tableauClean = t.clean ? 1 : 0
      values.tableauBad = t.clean ? 0 : 1
      values.tableauDetectors = t.detectors
    }
    return { stage: { kind: 'code', bb: { preset: p.preset, form: 'bravyi' }, view: 'cycle', cycle: { variant: p.variant, round } }, values }
  },
})

/* ---------------------------------------------------------------------------------------------- */
/* bb-shift                                                                                        */
/* ---------------------------------------------------------------------------------------------- */

export const bbShiftRecipe = def({
  id: 'bb-shift',
  version: 1,
  title: 'A translation of the torus as a symmetry of a bicycle code and its action on the logical qubits',
  kinds: ['code', 'bits'],
  params: shape({
    preset: oneOf(['gross', 'two-gross'] as const),
    shift: shape({ a: int(-12, 12), b: int(-12, 12) }),
    view: optional(oneOf(['torus'] as const)),
    matrix: optional(bool()),
    group: optional(bool()),
  }),
  rules: (p) => {
    const bad: string[] = []
    if (p.group && p.preset !== 'gross') bad.push("params.group: the table of trivial shifts is drawn for the 'gross' code")
    if (p.group && p.matrix) bad.push('params.group: not together with params.matrix')
    const mm = p.preset === 'gross' ? 6 : 12
    if (Math.abs(p.shift.b) > mm) bad.push(`params.shift.b: expected a whole number with |b| ≤ ${mm}`)
    return bad
  },
  run: (p) => {
    const code = bbCodeOf(p.preset)
    const { a, b } = p.shift
    const M = logicalShiftMatrix(code, p.preset, a, b)
    const diag = (m: GF2Matrix): boolean => Array.from({ length: m.rows }, (_, i) => m.rowBits(i)).every((row, i) => row.every((x, j) => x === (i === j ? 1 : 0)))
    const ones = Array.from({ length: M.rows }, (_, i) => M.rowWeight(i)).reduce((s, w) => s + w, 0)
    const values: Record<string, number> = {
      preserves: code.shiftPreservesCode(a, b) ? 1 : 0,
      ones,
      identity: diag(M) ? 1 : 0,
      order: matrixOrder(M) ?? 0,
    }
    const swap = Array.from({ length: code.n }, (_, q) => q)
    ;[swap[0], swap[1]] = [1, 0]
    values.swapKeeps = permutationPreserves(code, swap) ? 1 : 0
    if (p.preset === 'gross') {
      const s = bbShiftSummary('gross')
      values.preservedAll = s.preserved
      values.swapPreserves = s.swapPreserves ? 1 : 0
      values.orderMx = s.orderX
      values.orderMy = s.orderY
      values.onesX = s.onesX
      values.distinct = s.distinct
      values.trivial = s.trivial
      values.groupOrder = s.groupOrder
    }
    const torus = { kind: 'code' as const, bb: { preset: p.preset }, view: 'cells' as const, shift: [a, b] as [number, number] }
    if (p.group) {
      const rows = Array.from({ length: 6 }, (_, bb) => Array.from({ length: 12 }, (_, aa) => (diag(logicalShiftMatrix(code, 'gross', aa, bb)) ? '1' : '0')).join(''))
      return { stage: { kind: 'bits', grid: { rows } }, values }
    }
    if (p.matrix) return { stage: { layout: 'split', top: torus, bottom: { kind: 'bits', grid: { shiftAction: { code: p.preset, shift: [a, b] } } } }, values }
    return { stage: torus, values }
  },
})

/* ---------------------------------------------------------------------------------------------- */
/* bp-decode                                                                                       */
/* ---------------------------------------------------------------------------------------------- */

export const bpDecodeRecipe = def({
  id: 'bp-decode',
  version: 1,
  title: 'Min-sum belief propagation and OSD-0 on a repetition code and on the 3 × 3 toric code',
  kinds: ['code'],
  params: shape({
    code: oneOf(['rep7', 'toric3'] as const),
    error: list(int(0, 17), 1, 6),
    p: num(0.001, 0.4),
    iter: int(1, 18),
    osd: optional(bool()),
    tie: optional(oneOf(['low', 'high'] as const)),
    show: optional(list(oneOf(['beliefs'] as const), 1, 1)),
  }),
  rules: (p) => {
    const bad: string[] = []
    const n = p.code === 'toric3' ? 18 : 7
    p.error.forEach((q, i) => q >= n && bad.push(`params.error[${i}]: expected a bit below ${n} for ${p.code}`))
    if (new Set(p.error).size !== p.error.length) bad.push('params.error: each bit once')
    if (p.tie && !p.osd) bad.push('params.tie: only with params.osd')
    return bad
  },
  run: (p) => {
    const toric = p.code === 'toric3'
    const t = toric ? toricCode(3) : null
    const H = toric ? t!.code.HZ : GF2Matrix.fromSupports(Array.from({ length: 6 }, (_, i) => [i, i + 1]), 7)
    const n = H.cols
    const e = new Array<number>(n).fill(0)
    for (const q of p.error) e[q] = 1
    const syn = H.mulVec(e)
    const res = minSumBP(H, syn, p.p, p.iter)
    const shown = res.history[res.history.length - 1]
    const values: Record<string, number> = {
      llr: res.channel,
      converged: res.converged ? 1 : 0,
      iterations: res.iterations,
      hardWeight: shown.hardWeight,
      starLlr: shown.marginals[p.error[0]],
      fourCycles: fourCycles(H),
    }
    if (toric) {
      let alt = n
      for (let r = 0; r < t!.code.HX.rows; r++) {
        const row = t!.code.HX.rowBits(r)
        alt = Math.min(alt, e.map((b, q) => b ^ row[q]).reduce((s, b) => s + b, 0))
      }
      values.altWeight = alt
    } else values.altWeight = p.error.length
    if (p.osd) {
      const o = osd0(H, syn, shown.marginals, p.tie ?? 'low')
      values.osdWeight = o.weight
      values.osdValid = o.valid ? 1 : 0
      values.osdDiffStabilizer = toric && differByStabilizer(t!.code.HX, o.estimate, e) ? 1 : 0
    }
    return { stage: { kind: 'code', bp: { code: p.code, error: p.error, p: p.p, iter: p.iter, ...(p.osd ? { osd: true } : {}), ...(p.tie ? { tie: p.tie } : {}) } }, values }
  },
})
