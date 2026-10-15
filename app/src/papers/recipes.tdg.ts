/**
 * The fourteen `tdg-*` recipes of the paper lecture P1 (P-P1-story §9.1; rulings papers-P1.md R8): each is an allow-listed engine computation (physics/qec/tdg.ts and the
 * engine files beside it) with typed parameters, returning props for a stage kind and the named numbers a computed claim may cite. Registered in papers/recipes.ts
 * `RECIPES`. They live in their own file so that chapters built in parallel append to separate files (as recipes.qec.b2.ts does). Pure: no clock, no randomness.
 * Conventions: a value computed from one of the paper's PRINTED inputs says so in the recipe's title (the spec's ref then carries `uses`); scientific notation is
 * returned as a mantissa `...M` and a whole exponent `...E` because the number reader of the claim ledger reads only decimals; a negative base-10 logarithm is
 * returned as a positive magnitude `nl...` (a negative claim value never backs a printed magnitude).
 */
import type { PlotPoint, PlotPointsState, StageState } from '../content/stage'
import { bbCodeOf } from '../physics/qec/bbfamily'
import { codeFactoryAdapterQubits, surfaceQubitsForLogical, surfaceToModuleRatio } from '../physics/qec/overhead'
import {
  TDG_FIG10A_BICYCLE,
  TDG_FIG10A_SURFACE,
  TDG_FIT,
  TDG_PRINTED_A,
  tdgBasisFacts,
  tdgBeta,
  tdgBlocks,
  tdgCrossing,
  tdgCultivationParts,
  tdgCultivationTime,
  tdgDistillationTime,
  tdgDistribute,
  tdgDurations,
  tdgF,
  tdgFamily,
  tdgLpuGraph,
  tdgLpuModes,
  tdgMaxModules,
  tdgNativeSets,
  tdgParts,
  tdgPairingRows,
  tdgPiid,
  tdgQubits,
  tdgShiftClasses,
  tdgSlope,
  tdgSurfaceRow,
  tdgSurfaceTfim,
  tdgTfim,
  tdgTfimRotations,
  tdgYield,
  TDG_LIT19B_CYCLES,
  type LpuMeasure,
  type TdgSeries,
} from '../physics/qec/tdg'
import { instructionCounts } from '../physics/qec/overhead'
import { tcountLaw } from '../physics/qec/tcount'
import { TDG_FIG9_BETAS, TDG_FIG9_OFFLINE, TDG_FIG9_STATES } from '../physics/qec/tdgFig9'
import { bool, int, list, num, oneOf, optional, shape } from './params'
import type { RecipeDef } from './recipes'

const def = <P>(d: RecipeDef<P>): RecipeDef<P> => d

const CODES = ['gross', 'two-gross'] as const
const SERIES = ['g-idle', 'g-aut', 'g-X', 'g-XX', 'g-Y', 'g-XxX', '2g-idle', '2g-aut'] as const
const OPS = Array.from({ length: 12 }, (_, i) => [`X${i + 1}`, `Z${i + 1}`]).flat() as unknown as readonly string[]

/** Scientific notation of a positive number: mantissa in [1, 10) and the whole exponent. */
const sci = (x: number): { m: number; e: number } => {
  const e = Math.floor(Math.log10(x))
  return { m: x / 10 ** e, e }
}
const pt = (x: number, y: number, label?: string, status?: PlotPoint['status'], group?: string): PlotPoint => ({ x, y, ...(label ? { label } : {}), ...(status ? { status } : {}), ...(group ? { group } : {}) })
const pts = (points: PlotPoint[], extra: Omit<PlotPointsState, 'kind' | 'points'>): StageState => ({ kind: 'plot', points, ...extra })

/* ---------------------------------------------------------------------------------------------- */
/* tdg-machine: the bicycle machine (module-map)                                                   */
/* ---------------------------------------------------------------------------------------------- */

const HIGHLIGHTS = ['none', 'code', 'lpu', 'pivot', 'in-module', 'inter-module', 't-injection', 'ghz'] as const
const MACHINE_READOUTS = ['q', 'n', 'parts', 'perLogical', 'yield'] as const

export const tdgMachineRecipe = def({
  id: 'tdg-machine',
  version: 1,
  title: 'The machine of Eq. 25 from Table 1 (c and a computed; u, f, and the factory distance are the paper’s printed inputs), drawn as modules in a line',
  kinds: ['module-map'],
  params: shape({
    code: oneOf(CODES),
    factory: oneOf(['1e-3', '1e-4', 'none'] as const),
    M: optional(int(1, 1000)),
    budget: optional(int(500, 1_000_000)),
    layout: optional(oneOf(['linear', 'triangular'] as const)),
    highlight: optional(oneOf(HIGHLIGHTS)),
    focus: optional(int(0, 999)),
    readouts: optional(list(oneOf(MACHINE_READOUTS), 1, 5)),
  }),
  rules: (p) => {
    const bad: string[] = []
    if ((p.M === undefined) === (p.budget === undefined)) bad.push('params.M: give exactly one of M and budget')
    const fac = p.factory === 'none' ? null : p.factory
    if (p.budget !== undefined && tdgMaxModules(p.code, p.budget, fac) < 1) bad.push('params.budget: not even one module fits')
    if (p.layout === 'triangular' && (p.M ?? tdgMaxModules(p.code, p.budget ?? 0, fac)) > 6) bad.push('params.layout: the triangular layout takes at most 6 modules')
    if (p.readouts?.includes('q') && p.factory === 'none') bad.push('params.readouts: q needs a factory')
    if (p.highlight === 't-injection' && p.factory === 'none') bad.push('params.highlight: t-injection needs a factory')
    return bad
  },
  run: (p) => {
    const fac = p.factory === 'none' ? null : p.factory
    const M = p.M ?? tdgMaxModules(p.code, p.budget!, fac)
    const t = tdgQubits(p.code, M, fac)
    const values: Record<string, number> = {
      c: t.c,
      u: t.u,
      a: t.a,
      aPrime: t.aPrime,
      f: t.f,
      d: t.d,
      dFactory: t.dFactory,
      M,
      n: t.n,
      q: t.q,
      perModule: t.perModule,
      perLogical: (t.c + t.u) / 12,
      surfQ13: surfaceQubitsForLogical(12, 13),
      ratio13: surfaceToModuleRatio(12, t.c + t.u, 13),
      ratio11: surfaceToModuleRatio(12, t.c + t.u, 11),
      surfQ17: 12 * 2 * 17 * 17,
      cPerLogical: t.c / 12,
      dataShare: 11 / 12,
      aPrimeD9: codeFactoryAdapterQubits(9),
    }
    if (fac) {
      values.qA29 = tdgQubits(p.code, M, fac, 29).q
      values.qGap = values.qA29 - t.q
    }
    const stage: StageState = {
      kind: 'module-map',
      machine: { code: p.code, factory: p.factory, M, layout: p.layout ?? 'linear' },
      ...(p.highlight ? { highlight: p.highlight } : {}),
      ...(p.focus !== undefined ? { focus: p.focus } : {}),
      ...(p.readouts ? { readouts: p.readouts } : {}),
    }
    return { stage, values }
  },
})

/* ---------------------------------------------------------------------------------------------- */
/* tdg-basis: the four basis operators on the torus (code, bb cells)                               */
/* ---------------------------------------------------------------------------------------------- */

export const tdgBasisRecipe = def({
  id: 'tdg-basis',
  version: 1,
  title: 'The paper’s logical operators of Eqs. 31-36 marked on the torus (weights, overlaps, 0-or-2 meeting with the Z checks, ranks from the engine)',
  kinds: ['code'],
  params: shape({ code: oneOf(CODES), ops: optional(list(oneOf(OPS), 1, 4)), shift: optional(shape({ a: int(-24, 24), b: int(-24, 24) })) }),
  rules: (p) => (p.ops && new Set(p.ops).size !== p.ops.length ? ['params.ops: each operator once'] : []),
  run: (p) => {
    const bb = bbCodeOf(p.code)
    const f = tdgBasisFacts(p.code)
    const values: Record<string, number> = {
      n: bb.n,
      k: bb.k,
      checkWeight: bb.HX.rowWeight(0),
      wX1: f.weights[0],
      wX7: f.weights[1],
      wZ1: f.weights[2],
      wZ7: f.weights[3],
      wMin: Math.min(...f.weights),
      wMax: Math.max(...f.weights),
      ovY: Math.min(f.overlaps[0], f.overlaps[1]),
      ovOthers: Math.max(...f.overlaps.slice(2)),
      meetsMin: f.meetsMin,
      meetsMax: f.meetsMax,
      rankAbove: f.rankAbove,
      cells: bb.cells,
      checks: 2 * bb.cells,
      touching: f.touching,
      touchShare: f.touching / bb.cells,
    }
    const stage: StageState = {
      kind: 'code',
      bb: { preset: p.code, form: 'toric' },
      ...(p.ops ? { paperOps: { ops: p.ops, ...(p.shift ? { shift: [p.shift.a, p.shift.b] as [number, number] } : {}) } } : {}),
    }
    return { stage, values }
  },
})

/* ---------------------------------------------------------------------------------------------- */
/* tdg-pairing: X-bar_i against Z-bar_j (bits grid)                                                */
/* ---------------------------------------------------------------------------------------------- */

export const tdgPairingRecipe = def({
  id: 'tdg-pairing',
  version: 1,
  title: 'The 12 x 12 table "X-bar i anticommutes with Z-bar j" of the paper’s basis, from the engine’s commutation test',
  kinds: ['bits'],
  params: shape({ code: oneOf(CODES) }),
  run: (p) => {
    const rows = tdgPairingRows(p.code)
    const ones = rows.join('').split('').filter((c) => c === '1').length
    const diag = rows.filter((r, i) => r[i] === '1').length
    return { stage: { kind: 'bits', grid: { rows } }, values: { diag, off: ones - diag, size: rows.length } }
  },
})

/* ---------------------------------------------------------------------------------------------- */
/* tdg-shift-action: the logical action of a shift (bits grid)                                     */
/* ---------------------------------------------------------------------------------------------- */

export const tdgShiftActionRecipe = def({
  id: 'tdg-shift-action',
  version: 1,
  title: 'The logical action M of a shift x^a y^b in the paper’s basis (column j = the image of X-bar j), its blocks against the printed tables of Eqs. 37-38 (uses the printed A_x and A_y)',
  kinds: ['bits'],
  params: shape({ code: oneOf(CODES), a: int(-24, 24), b: int(-24, 24), block: oneOf(['upper', 'lower', 'both'] as const) }),
  run: (p) => {
    const bb = bbCodeOf(p.code)
    const m = tdgBlocks(p.code, p.a, p.b, p.a !== 0 && p.b === 0 ? 'x' : p.b !== 0 && p.a === 0 ? 'y' : null)
    const bx = tdgBlocks(p.code, 1, 0, 'x')
    const classes = tdgShiftClasses(p.code)
    const rows = p.block === 'upper' ? m.upper : p.block === 'lower' ? m.lower : m.M.toRows().map((r) => r.join(''))
    const col0 = bx.M.toRows().map((r) => r[0])
    const ones = col0.flatMap((v, i) => (v ? [i + 1] : []))
    const values: Record<string, number> = {
      img1: ones[0],
      img2: ones[1],
      imgCount: ones.length,
      offBlock: m.offBlockOnes,
      gapUpper: bx.gapUpper,
      gapLowerT: bx.gapLowerT,
      lowerDiff: bx.gapLowerPrinted,
      printedAsym: bx.printedVsTranspose,
      order: classes.orderX,
      classes: classes.classes,
      nontrivial: classes.classes - 1,
      maxFactors: classes.maxFactors,
      shifts: bb.cells,
      printedRows: TDG_PRINTED_A[p.code].Ax.length,
      identity: m.M.toRows().every((r, i) => r.every((v, j) => v === (i === j ? 1 : 0))) ? 1 : 0,
    }
    return { stage: { kind: 'bits', grid: { rows } }, values }
  },
})

/* ---------------------------------------------------------------------------------------------- */
/* tdg-native: native measurements and rotations (pauli-program / offline plot)                    */
/* ---------------------------------------------------------------------------------------------- */

export const tdgNativeRecipe = def({
  id: 'tdg-native',
  version: 1,
  title: 'Native measurements (Eq. 14) and the rotations they give (Eqs. 15-16) from the engine’s shift actions, under both readings; the cost beta = 1 + 6k (Eq. 17)',
  kinds: ['pauli-program', 'plot'],
  params: shape({ code: oneOf(CODES), reading: optional(oneOf(['actual', 'as-printed'] as const)), view: optional(oneOf(['rotation', 'offline'] as const)) }),
  run: (p) => {
    const nat = tdgNativeSets(p.code, p.reading ?? 'actual')
    const values: Record<string, number> = {
      native: nat.native,
      rot: nat.rotations,
      rotAll: nat.rotationsAny,
      pivotI: nat.pivotI,
      pivotLetter: nat.pivotLetter,
      beta0: tdgBeta(0),
      beta1: tdgBeta(1),
      beta2: tdgBeta(2),
      beta3: tdgBeta(3),
      beta4: tdgBeta(4),
      threeMeasures: 3,
      offMean245G: TDG_FIG9_OFFLINE.gross.rotations245.minOverQ.mean,
      offMean245T: TDG_FIG9_OFFLINE['two-gross'].rotations245.minOverQ.mean,
      offMean510G: TDG_FIG9_OFFLINE.gross.rotations510.minOverQ.mean,
      offMean510T: TDG_FIG9_OFFLINE['two-gross'].rotations510.minOverQ.mean,
      offStates: TDG_FIG9_STATES,
      offShare19: TDG_FIG9_OFFLINE[p.code].rotations245.minOverQ.hist[19] / TDG_FIG9_STATES,
    }
    if (p.view === 'offline') {
      // the histogram of beta over all 4^11 Paulis (cheapest pivot letter), computed OFFLINE by pipeline/tdg_fig9.py: the page only draws the stored result
      const pointsOf = (reading: 'rotations245' | 'rotations510', group: string): PlotPoint[] =>
        TDG_FIG9_BETAS.map((b) => pt(b, TDG_FIG9_OFFLINE[p.code][reading].minOverQ.hist[b] / TDG_FIG9_STATES, undefined, 'computed', group))
      return {
        stage: pts([...pointsOf('rotations245', '245 rotations (offline)'), ...pointsOf('rotations510', '510 rotations (offline)')], { xLabel: 'measurements beta', yLabel: 'share of all Paulis', xScale: 'linear', yScale: 'linear' }),
        values,
      }
    }
    // one native rotation as Eq. 16 draws it: X on the pivot, then Y (x) R, then Z on the pivot (R is the rest of the module, drawn as the second wire)
    const stage: StageState = {
      kind: 'pauli-program',
      program: { wires: 2, labels: ['piv', 'R'], columns: [{ meas: { pauli: 'XI' } }, { meas: { pauli: 'YZ' } }, { meas: { pauli: 'ZI' } }] },
    }
    return { stage, values }
  },
})

/* ---------------------------------------------------------------------------------------------- */
/* tdg-lpu: the LPU graph (surgery-graph)                                                          */
/* ---------------------------------------------------------------------------------------------- */

const LPU_OPS = ['X1', 'Z1', 'Y1', 'X7', 'Z7', 'Y7'] as const
export const tdgLpuRecipe = def({
  id: 'tdg-lpu',
  version: 1,
  title: 'The LPU’s gauging graph (App. A.3): dots on the support of X-bar 1 and X-bar 7, links from the Z checks that meet them twice; kept cycles are the paper’s printed counts (uses a3-kept, a3-2g)',
  kinds: ['surgery-graph'],
  params: shape({ code: oneOf(CODES), mode: oneOf(['l', 'r', 'full'] as const), measure: optional(oneOf(LPU_OPS)), readouts: optional(list(oneOf(['V', 'E', 'cycles', 'kept', 'u'] as const), 1, 5)) }),
  run: (p) => {
    const l = tdgLpuGraph(p.code, 'l')
    const r = tdgLpuGraph(p.code, 'r')
    const f = tdgLpuGraph(p.code, 'full')
    const modes = tdgLpuModes()
    const values: Record<string, number> = {
      lV: l.V,
      lE: l.E,
      lEbase: l.edges.filter((e) => e.kind === 'l').length,
      lRank: l.rank,
      rV: r.V,
      rE: r.E,
      rRank: r.rank,
      V: f.V,
      Vq: f.Vq,
      E: f.E,
      rank: f.rank,
      kept: f.kept,
      u: f.u,
      bridge: f.bridge,
      modeL: modes.left,
      modeR: modes.right,
      modeFull: modes.full,
      modeTotal: modes.total,
      perSide: modes.left + modes.right,
      pairs: modes.total * modes.total,
      inter: (modes.left + modes.right) ** 2,
      joinCycles: f.bridge - 1,
      shareHalf: modes.left / modes.total,
      half6: Math.ceil((tdgParts('gross', null).d - 1) / 2),
      half9: Math.ceil((tdgParts('two-gross', null).d - 1) / 2),
    }
    const stage: StageState = {
      kind: 'surgery-graph',
      lpu: { code: p.code, mode: p.mode, ...(p.measure ? { measure: p.measure as LpuMeasure } : {}) },
      ...(p.readouts ? { readouts: p.readouts } : {}),
    }
    return { stage, values }
  },
})

/* ---------------------------------------------------------------------------------------------- */
/* tdg-distribute: a long Pauli over modules (pauli-program)                                       */
/* ---------------------------------------------------------------------------------------------- */

export const tdgDistributeRecipe = def({
  id: 'tdg-distribute',
  version: 1,
  title: 'A Pauli on n data qubits split over M = ceil(n / 11) modules: M − 1 ZZ links between the pivots, then one Y (x) P_i measurement per module (Eq. 5)',
  kinds: ['pauli-program'],
  params: shape({ n: int(12, 66) }),
  run: (p) => {
    const d = tdgDistribute(p.n)
    const wires = d.M
    const col = (letters: Record<number, string>): string => Array.from({ length: wires }, (_, i) => letters[i] ?? 'I').join('')
    const columns = [
      ...Array.from({ length: d.zz }, (_, i) => ({ meas: { pauli: col({ [i]: 'Z', [i + 1]: 'Z' }) } })),
      ...Array.from({ length: wires }, (_, i) => ({ meas: { pauli: col({ [i]: 'Y' }) } })),
    ]
    const d100 = tdgDistribute(100)
    return {
      stage: { kind: 'pauli-program', program: { wires, labels: Array.from({ length: wires }, (_, i) => `M${i + 1}`), columns } },
      values: { M: d.M, zz: d.zz, local: d.local, columns: columns.length, M100: d100.M, zz100: d100.zz, local100: d100.local, per: 11 },
    }
  },
})

/* ---------------------------------------------------------------------------------------------- */
/* tdg-durations: instruction counts and prices (pauli-program)                                    */
/* ---------------------------------------------------------------------------------------------- */

export const tdgDurationsRecipe = def({
  id: 'tdg-durations',
  version: 1,
  title: 'The five kinds of step, their counts and prices in timesteps (Table 2, A.5; C = 10 or 18 printed), with a short example program on three modules',
  kinds: ['pauli-program'],
  params: shape({ code: oneOf(CODES) }),
  run: (p) => {
    const g = tdgDurations('gross')
    const t = tdgDurations('two-gross')
    const bb = bbCodeOf(p.code)
    const ic = instructionCounts(bb.l, bb.m)
    const values: Record<string, number> = {
      tauI: g.idle,
      tauU: g.shift,
      tauM: g.measure,
      tauM2g: t.measure,
      C: g.C,
      C2g: t.C,
      cycleSteps: g.cycleSteps,
      nShift: ic.shifts,
      nIn: ic.inModule,
      nInter: ic.interModule,
      nT: ic.tInjection,
      nAll: ic.shifts + ic.inModule + ic.interModule + ic.tInjection + 1,
      exTotal: g.measure + g.measure + g.shift + 351 + g.measure,
    }
    const stage: StageState = {
      kind: 'pauli-program',
      program: {
        wires: 3,
        labels: ['M1', 'M2', 'M3'],
        columns: [{ rot: { pauli: 'IXI', angle: 'c+' } }, { meas: { pauli: 'IYI' } }, { meas: { pauli: 'ZZI' } }, { inject: { pauli: 'IIZ' } }],
      },
    }
    return { stage, values }
  },
})

/* ---------------------------------------------------------------------------------------------- */
/* tdg-failure: the failure spectrum and the rates it gives (plot points)                          */
/* ---------------------------------------------------------------------------------------------- */

const P_GRID = [1e-5, 3e-5, 1e-4, 3e-4, 1e-3, 3e-3, 1e-2]
const nl = (x: number): number => -Math.log10(x)

export const tdgFailureRecipe = def({
  id: 'tdg-failure',
  version: 1,
  title: 'Eqs. 82-83 with Table 6’s printed fit parameters: the failure spectrum f(w), P against p, and the rebuilt rates of Table 2 (uses t6-*; Table 2 values stay reported)',
  kinds: ['plot'],
  params: shape({
    series: list(oneOf(SERIES), 1, 3),
    view: oneOf(['pp', 'fw', 'table2', 'compare'] as const),
    marker: optional(num(1e-6, 1e-2)),
    d: optional(int(3, 25)),
  }),
  rules: (p) => {
    const bad: string[] = []
    if (p.view === 'compare' && p.series.length > 2) bad.push('params.series: the comparison draws at most two series')
    if (p.view !== 'compare' && p.d !== undefined) bad.push('params.d: only the compare view takes d')
    if (p.view === 'compare' && (p.d === undefined || p.d % 2 === 0)) bad.push('params.d: the compare view needs an odd distance d')
    if (p.marker !== undefined && p.view !== 'pp') bad.push('params.marker: only the pp view takes a marker')
    return bad
  },
  run: (p) => {
    const P = (s: TdgSeries, x: number): number => tdgPiid(s, x)
    const s0 = p.series[0]
    const values: Record<string, number> = {
      nlGIdle3: nl(P('g-idle', 1e-3)),
      nlGAut3: nl(P('g-aut', 1e-3)),
      nlGY3: nl(P('g-Y', 1e-3)),
      nlGC3: nl(P('g-XxX', 1e-3)),
      nlGC4: nl(P('g-XxX', 1e-4)),
      logGC4: Math.log10(P('g-XxX', 1e-4)),
      nlTIdle3: nl(P('2g-idle', 1e-3)),
      nlTAut3: nl(P('2g-aut', 1e-3)),
      slope: tdgSlope('g-idle', 1e-6, 1e-5),
      qFaults: 15,
      w0g: TDG_FIT['g-idle'].w0,
      w0t: TDG_FIT['2g-idle'].w0,
      nGIdle: TDG_FIT['g-idle'].N,
      kGIdle: TDG_FIT['g-idle'].K,
    }
    const pc3 = sci(P('g-XxX', 1e-3))
    const pc4inv = sci(1 / P('g-XxX', 1e-4))
    const t2i = sci(P('2g-idle', 1e-3))
    const surf17 = sci(0.1 * (1e-3 / 1e-2) ** (17 / 2))
    const pt3 = sci(3e-6 + P('g-XxX', 1e-3))
    Object.assign(values, {
      pc3M: pc3.m,
      pc3E: -pc3.e,
      perFail4M: pc4inv.m,
      perFail4E: pc4inv.e,
      p2gIdle3M: t2i.m,
      p2gIdle3E: -t2i.e,
      surf17M: surf17.m,
      surf17E: -surf17.e,
      pt3M: pt3.m,
      pt3E: -pt3.e,
      pcOverFactory: P('g-XxX', 1e-3) / 3e-6,
    })
    let stage: StageState
    if (p.view === 'pp') {
      const points = p.series.flatMap((s) => P_GRID.map((x) => pt(x, P(s, x), undefined, 'computed', s)))
      if (p.marker !== undefined) points.push(pt(p.marker, P(s0, p.marker), `p = ${p.marker}`, 'computed', 'marker'))
      stage = pts(points, { xLabel: 'physical error rate p', yLabel: 'logical error rate P', xScale: 'log', yScale: 'log' })
    } else if (p.view === 'fw') {
      const w0 = TDG_FIT[s0].w0
      const points = [1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 8].map((r) => pt(Math.round(w0 * r), tdgF(s0, Math.round(w0 * r)), undefined, 'computed', s0))
      stage = pts(points, { xLabel: 'faults w', yLabel: 'failing share f(w)', xScale: 'linear', yScale: 'log' })
    } else if (p.view === 'table2') {
      const T2: [TdgSeries, number, number, string][] = [
        ['g-idle', -8.8, -14.8, 'I'],
        ['g-aut', -6.4, -12.2, 'U'],
        ['g-Y', -5.0, -9.0, 'M'],
        ['g-XxX', -2.7, -7.3, 'C'],
        ['2g-idle', -20.1, -38.3, 'I2'],
        ['2g-aut', -14.5, -37, 'U2'],
      ]
      const points = T2.flatMap(([s, e3, e4, lab], i) => [
        pt(i + 1, P(s, 1e-3), lab, 'computed', 'rebuilt (p=1e-3)'),
        pt(i + 1, 10 ** e3, undefined, 'reported', 'printed (p=1e-3)'),
        pt(i + 1, P(s, 1e-4), undefined, 'computed', 'rebuilt (p=1e-4)'),
        pt(i + 1, 10 ** e4, undefined, 'reported', 'printed (p=1e-4)'),
      ])
      stage = pts(points, { xLabel: 'instruction', yLabel: 'logical error rate', xScale: 'linear', yScale: 'log' })
    } else {
      const surf = (x: number): number => 0.1 * (x / 0.01) ** (p.d! / 2)
      const points = [...p.series.flatMap((s) => [1e-4, 3e-4, 1e-3, 3e-3].map((x) => pt(x, P(s, x), undefined, 'computed', s))), ...[1e-4, 3e-4, 1e-3, 3e-3].map((x) => pt(x, surf(x), undefined, 'reported', `surface d=${p.d} formula`))]
      stage = pts(points, { xLabel: 'physical error rate p', yLabel: 'logical error rate', xScale: 'log', yScale: 'log' })
    }
    return { stage, values }
  },
})

/* ---------------------------------------------------------------------------------------------- */
/* tdg-tfim: the TFIM bill (plot points)                                                           */
/* ---------------------------------------------------------------------------------------------- */

export const tdgTfimRecipe = def({
  id: 'tdg-tfim',
  version: 1,
  title: 'The TFIM program: 184 000 rotations, Eq. 26 failure from Table 9’s printed counts (uses t9-*, t6-*) and Table 2’s assumed two-gross rates, the thresholds, and the surface baseline of Eq. 96',
  kinds: ['plot'],
  params: shape({ view: oneOf(['failure', 'surface'] as const), codes: optional(oneOf(['gross', 'two-gross', 'both'] as const)), nT: optional(oneOf(['table9', 'text', 'both'] as const)) }),
  run: (p) => {
    const NR = tdgTfimRotations()
    const g4 = tdgTfim('gross', 1e-4)
    const g3 = sci(tdgTfim('gross', 1e-3).failure)
    const cg = tdgCrossing('gross')
    const ct = tdgCrossing('two-gross')
    const T9 = 1.5542e7
    const TEXT = 1.9e7
    const th = (d: number, nT: number): { m: number; e: number } => sci(tdgSurfaceTfim(d, nT))
    const values: Record<string, number> = {
      NR,
      fail4: g4.failure,
      fail3M: g3.m,
      fail3E: g3.e,
      crossGM: sci(cg.crossing).m,
      crossGE: -sci(cg.crossing).e,
      crossTM: sci(ct.crossing).m,
      crossTE: -sci(ct.crossing).e,
      expG: cg.exponent,
      expT: ct.exponent,
      tPerRot: T9 / NR,
      tLaw: tcountLaw(5e-9),
      tPerRotText: TEXT / NR,
    }
    for (const d of [7, 9, 17, 19]) {
      values[`thM${d}`] = th(d, T9).m
      values[`thT${d}`] = th(d, TEXT).m
    }
    let stage: StageState
    if (p.view === 'failure') {
      const gp = [1e-5, 3e-5, 1e-4, 3e-4, 1e-3]
      const points: PlotPoint[] = []
      if (p.codes !== 'two-gross') gp.forEach((x) => points.push(pt(x, tdgTfim('gross', x).failure, undefined, 'computed', 'gross')))
      if (p.codes !== 'gross') [1e-4, 1e-3].forEach((x) => points.push(pt(x, tdgTfim('two-gross', x).failure, undefined, 'computed', 'two-gross')))
      stage = pts(points, { xLabel: 'physical error rate p', yLabel: 'TFIM failure sum', xScale: 'log', yScale: 'log', yLines: [{ y: 1e-3, label: 'target 1e-3' }] })
    } else {
      const ds = [7, 9, 11, 13, 15, 17, 19]
      const which = p.nT ?? 'both'
      const points = [
        ...(which !== 'text' ? ds.map((d) => pt(d, tdgSurfaceTfim(d, T9), undefined, 'computed', 'N_T of Table 9')) : []),
        ...(which !== 'table9' ? ds.map((d) => pt(d, tdgSurfaceTfim(d, TEXT), undefined, 'computed', 'N_T of the text')) : []),
      ]
      stage = pts(points, { xLabel: 'surface-code distance d', yLabel: 'p at failure 1e-3', xScale: 'linear', yScale: 'log' })
    }
    return { stage, values }
  },
})

/* ---------------------------------------------------------------------------------------------- */
/* tdg-capability: bicycle against surface rows of Fig. 10a (plot points)                          */
/* ---------------------------------------------------------------------------------------------- */

const F10A_BIC_NT = [1.4e1, 3.5e6, 2.2e5, 3.7e4, 7.0e15, 4.5e14] // printed (reported)
const F10A_SURF_N_PRINTED = [45, 42, 21, 250, 27, 416]

export const tdgCapabilityRecipe = def({
  id: 'tdg-capability',
  version: 1,
  title: 'Fig. 10a: the bicycle machines’ logical qubits from Eq. 25 against their printed T counts (reported), and the surface rows from Eq. 89 with the printed factory figures (uses f10a-*, t3-*)',
  kinds: ['plot'],
  params: shape({ all: optional(bool()) }),
  run: () => {
    const bic = TDG_FIG10A_BICYCLE.map(([code, fac, budget]) => 11 * tdgMaxModules(code, budget, fac))
    const surf = TDG_FIG10A_SURFACE.map(([pp, q, d, f, t]) => tdgSurfaceRow(pp, q, d, f, t))
    const d5 = tdgSurfaceRow(1e-3, 5000, 5, 454, 351)
    const d5b = tdgSurfaceRow(1e-3, 5000, 5, 0, 351)
    const values: Record<string, number> = {
      rowD5N: surf[0].n,
      rowD5Nt: surf[0].NT,
      rowD5N50: d5b.n,
      rowD5NtN50: d5b.NT,
      rowD5Printed: F10A_SURF_N_PRINTED[0],
      capFail: 1 / 3,
      d5NtCheck: d5.NT,
    }
    bic.forEach((n, i) => {
      values[`bicN${i + 1}`] = n
      values[`nRatio${i + 1}`] = n / surf[i].n
      values[`surfN${i + 1}`] = surf[i].n
      values[`surfT${i + 1}`] = surf[i].time
    })
    ;[1, 2, 3, 4, 5].forEach((j) => (values[`surfNT${j}M`] = sci(surf[j].NT).m))
    const points = [
      ...bic.map((n, i) => pt(n, F10A_BIC_NT[i], `BB ${n}`, 'reported', 'bicycle (printed)')),
      ...surf.map((r) => pt(r.n, r.NT, `SC ${r.n}`, 'computed', 'surface (Eq. 89)')),
    ]
    return { stage: pts(points, { xLabel: 'logical qubits n', yLabel: 'T count N_T', xScale: 'log', yScale: 'log' }), values }
  },
})

/* ---------------------------------------------------------------------------------------------- */
/* tdg-family: the larger bicycle codes (plot points)                                              */
/* ---------------------------------------------------------------------------------------------- */

export const tdgFamilyRecipe = def({
  id: 'tdg-family',
  version: 1,
  title: 'The family l = 6(r + b), m = 6r with the paper’s two polynomials: n and k from the ranks, the conjectured distance 6(2r + b − 1) as printed, and k d^2 / n',
  kinds: ['plot'],
  params: shape({ rMax: int(1, 3) }),
  run: (p) => {
    const rows = [tdgFamily(1, 0), tdgFamily(1, 1), tdgFamily(2, 0), tdgFamily(2, 1), tdgFamily(3, 0)]
    const values: Record<string, number> = { limit: (12 * (12 * 12)) / 72, k: rows[0].k }
    rows.forEach((r, i) => {
      values[`famN${i + 1}`] = r.n
      values[`famRatio${i + 1}`] = r.ratio
      values[`famD${i + 1}`] = r.d
      values[`famK${i + 1}`] = r.k
    })
    const shown = rows.filter((r) => r.r <= p.rMax)
    const points = shown.map((r) => pt(r.n, r.ratio, `[[${r.n},${r.k},${r.d}]]`, 'computed', 'bicycle family')).concat([pt(1000, 24, 'limit 24', 'reported', 'limit')])
    return { stage: pts(points, { xLabel: 'physical qubits n', yLabel: 'k d^2 / n', xScale: 'linear', yScale: 'linear', yLines: [{ y: 1, label: 'surface code' }] }), values }
  },
})

/* ---------------------------------------------------------------------------------------------- */
/* tdg-yield: fabrication yield (plot points)                                                      */
/* ---------------------------------------------------------------------------------------------- */

export const tdgYieldRecipe = def({
  id: 'tdg-yield',
  version: 1,
  title: 'Chip yield y^J (§5, p. 31) with J = 2 per qubit + 3 per coupler; two couplers per qubit is OUR assumption (uses x-p31)',
  kinds: ['plot'],
  params: shape({ marker: optional(int(10, 100_000)) }),
  run: (p) => {
    const sizes = [100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000]
    const points = sizes.map((s) => pt(s, tdgYield(s).yieldProb, undefined, 'computed', 'y^J'))
    if (p.marker !== undefined) points.push(pt(p.marker, tdgYield(p.marker).yieldProb, `${p.marker} qubits`, 'computed', 'marker'))
    const values: Record<string, number> = {
      oneIn5000: Math.round(tdgYield(5000).oneIn),
      junctions5000: tdgYield(5000).junctions,
      yield1000: tdgYield(1000).yieldProb,
      qubits6936: 12 * 2 * 17 * 17,
      junctions6936: tdgYield(6936).junctions,
      oneIn6936: Math.round(tdgYield(6936).oneIn),
      yield378: tdgYield(378).yieldProb,
    }
    return { stage: pts(points, { xLabel: 'qubits on the chip', yLabel: 'chip yield y^J', xScale: 'log', yScale: 'log' }), values }
  },
})

/* ---------------------------------------------------------------------------------------------- */
/* tdg-factory: cultivation and distillation times (plot points)                                   */
/* ---------------------------------------------------------------------------------------------- */

export const tdgFactoryRecipe = def({
  id: 'tdg-factory',
  version: 1,
  title: 'Cultivation’s mean time from the printed discard rates and coefficients (A.6, Eqs. 73-80; uses t5-*) and distillation’s rule of six timesteps per code cycle (uses lit19b-t1)',
  kinds: ['plot'],
  params: shape({ d1: int(3, 5) }),
  rules: (p) => (p.d1 === 3 || p.d1 === 5 ? [] : ['params.d1: the cultivation circuits are d1 = 3 and 5']),
  run: (p) => {
    const c3 = tdgCultivationTime(3)
    const c5 = tdgCultivationTime(5)
    const c = p.d1 === 3 ? c3 : c5
    const values: Record<string, number> = {
      esc3: c3.escape,
      esc5: c5.escape,
      cult3: c3.fromPrinted,
      cult3Exact: c3.exact,
      cult5: c5.fromPrinted,
      cult5Exact: c5.exact,
      dist4g: tdgDistillationTime(TDG_LIT19B_CYCLES.line1),
      dist4tg: tdgDistillationTime(TDG_LIT19B_CYCLES.line5),
      printed4g: 73,
      printed4tg: 407,
      cycles4g: TDG_LIT19B_CYCLES.line1,
      cycles4tg: TDG_LIT19B_CYCLES.line5,
      perCycle: 6,
      coef3a: 1.54,
      coef3b: 3.23,
      factRatio: 2e-8 / 2e-9,
    }
    const parts = tdgCultivationParts(p.d1 as 3 | 5)
    const points = [pt(1, parts.cult, 'cultivate', 'computed', 'stage times'), pt(2, parts.esc, 'escape', 'computed', 'stage times'), pt(3, c.fromPrinted, 'mean time', 'computed', 'sum')]
    return { stage: pts(points, { xLabel: 'stage', yLabel: 'mean timesteps', xScale: 'linear', yScale: 'linear' }), values }
  },
})

/** Every `tdg-*` recipe, in the order the registry lists them. */
export const TDG_RECIPES = {
  'tdg-machine': tdgMachineRecipe,
  'tdg-basis': tdgBasisRecipe,
  'tdg-pairing': tdgPairingRecipe,
  'tdg-shift-action': tdgShiftActionRecipe,
  'tdg-native': tdgNativeRecipe,
  'tdg-lpu': tdgLpuRecipe,
  'tdg-distribute': tdgDistributeRecipe,
  'tdg-durations': tdgDurationsRecipe,
  'tdg-failure': tdgFailureRecipe,
  'tdg-tfim': tdgTfimRecipe,
  'tdg-capability': tdgCapabilityRecipe,
  'tdg-family': tdgFamilyRecipe,
  'tdg-yield': tdgYieldRecipe,
  'tdg-factory': tdgFactoryRecipe,
} as const
