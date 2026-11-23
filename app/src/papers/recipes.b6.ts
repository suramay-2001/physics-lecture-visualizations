/**
 * The seven `b6-*`-chapter recipes of the Papers background chapter B6, "Readout in the error-correction cycle" (P-B6-story §9.3; rulings gandalf-batch.md G1–G3): allow-listed engine
 * computations (physics/qec/timing.ts, which B6 owns, with the track's physics/optics/imaging.ts `bestThreshold` and B1's physics/qec/curves.ts) with typed parameters, returning props for
 * the `timeline` and `plot` kinds and the named numbers a computed claim may cite. Registered in papers/recipes.ts `RECIPES` through `B6_RECIPES`; their own file so chapters built in
 * parallel append to separate files. Pure: no clock, no randomness. The inputs T₁, T₂, the photon rates, the gate error and the distance are OUR toy values ("model, not data", ruling G3):
 * the paper prints none of them. Conventions as recipes.tdg.ts: scientific notation as a mantissa `...M` and a whole positive exponent `...E` (the value is M × 10^−E).
 */
import type { PlotPoint, PlotPointsState, StageState, TimelineSegment } from '../content/stage'
import {
  argminTime,
  elementarySymmetric,
  erasureRepetition,
  idleSmallT,
  idleTotal,
  logicalToy,
  lossPerRound,
  maclaurinBound,
  minFaults,
  noLossChance,
  pauliTwirl,
  pipelineSim,
  pipelinedTotal,
  readoutError,
  refineMinimum,
  blochShrink,
  unpipelinedTotal,
  voteExact,
  voteLeading,
  poissonBinomialTail,
} from '../physics/qec/timing'
import { choose } from '../physics/qec/curves'
import { bool, int, num, oneOf, optional, shape } from './params'
import type { RecipeDef } from './recipes'

const def = <P>(d: RecipeDef<P>): RecipeDef<P> => d

const pt = (x: number, y: number, label?: string, status?: PlotPoint['status'], group?: string): PlotPoint => ({ x, y, ...(label ? { label } : {}), ...(status ? { status } : {}), ...(group ? { group } : {}) })
const pts = (points: PlotPoint[], extra: Omit<PlotPointsState, 'kind' | 'points'>): StageState => ({ kind: 'plot', points, ...extra })
/** Scientific notation of a positive number below 1: the mantissa in [1, 10) and the whole exponent (the value is M × 10^−E). */
const sciNeg = (x: number): { m: number; e: number } => {
  const e = -Math.floor(Math.log10(x))
  return { m: x * 10 ** e, e }
}
const oddD = (d: number, at: string): string[] => (d % 2 === 0 ? [`${at}: an odd whole number`] : [])

/* ---------------------------------------------------------------------------------------------- */
/* cycle-budget: what one round is made of, and the share the camera takes                          */
/* ---------------------------------------------------------------------------------------------- */

export const cycleBudgetRecipe = def({
  id: 'cycle-budget',
  version: 1,
  title: 'One round of checks as boxes on a time axis: `layers` gate layers of `tGateUs` µs each, a move, the camera exposure, a reset; the readout share and the gate-to-camera ratio (our arithmetic on the times given)',
  kinds: ['timeline', 'plot'],
  params: shape({
    layers: int(1, 8),
    tGateUs: num(0.001, 5000),
    tMove: optional(num(0, 2)),
    tRead: num(0.0001, 20),
    tReset: optional(num(0, 2)),
    view: optional(oneOf(['timeline', 'share'] as const)),
    /** No total printed above the picture (a clue's picture must not print the answer). */
    quiet: optional(bool()),
  }),
  run: (p) => {
    const gate = (p.layers * p.tGateUs) / 1000
    const move = p.tMove ?? 0
    const reset = p.tReset ?? 0
    const round = gate + move + p.tRead + reset
    const values: Record<string, number> = {
      layers: p.layers,
      tGateUs: p.tGateUs,
      tMove: move,
      tRead: p.tRead,
      tReset: reset,
      gateMs: gate,
      roundMs: round,
      readFrac: p.tRead / round,
      ratio: (p.tRead * 1000) / p.tGateUs,
      gateShare: gate / round,
    }
    if ((p.view ?? 'timeline') === 'share') {
      // the readout share against the camera time, the other times as given (our arithmetic)
      const points: PlotPoint[] = []
      for (const t of [0.001, 0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 3, 5]) points.push(pt(t, t / (gate + move + reset + t), undefined, 'computed', 'readout share'))
      points.push(pt(p.tRead, p.tRead / round, 'this round', 'computed', 'this round'))
      return { stage: pts(points, { xLabel: 'camera exposure (ms)', yLabel: 'share of the round', xScale: 'log' }), values }
    }
    const small = p.tRead < 0.01
    const k = small ? 1000 : 1
    const segs: TimelineSegment[] = []
    let t = 0
    const add = (kind: TimelineSegment['kind'], len: number, label?: string) => {
      if (len <= 0) return
      segs.push({ kind, from: t * k, to: (t + len) * k, ...(label ? { label } : {}) })
      t += len
    }
    for (let i = 0; i < p.layers; i++) add('gate', p.tGateUs / 1000)
    add('move', move)
    add('acquire', p.tRead)
    add('reset', reset)
    return { stage: { kind: 'timeline', rows: [{ label: 'one round', segments: segs }], unit: small ? 'µs' : 'ms', readouts: p.quiet ? [] : ['total'] }, values }
  },
})

/* ---------------------------------------------------------------------------------------------- */
/* idle-twirl: what waiting costs a qubit, as three Pauli chances                                   */
/* ---------------------------------------------------------------------------------------------- */

const TIMES_MS = [0.5, 1, 2, 4, 8, 16, 32, 64]

export const idleTwirlRecipe = def({
  id: 'idle-twirl',
  version: 1,
  title: 'The Pauli twirl of a qubit that waits (Tomita and Svore, Eqs. 9–10): p_X = p_Y and p_Z from T₁ and T₂ (our toy values, in seconds) over a wait of `tMs` milliseconds, the Bloch shrink factors and the straight-line rule',
  kinds: ['plot'],
  params: shape({
    T1: num(0.001, 1e12),
    T2: num(0.001, 1e12),
    tMs: num(0.001, 1000),
    view: optional(oneOf(['chances', 'shrink', 'line', 'bars'] as const)),
  }),
  rules: (p) => (p.T2 > 2 * p.T1 ? ['params.T2: at most 2 T₁'] : []),
  run: (p) => {
    const t = p.tMs / 1000
    const q = pauliTwirl(t, p.T1, p.T2)
    const total = q.pX + q.pY + q.pZ
    const sh = blochShrink(q)
    const small = idleSmallT(t, p.T1, p.T2)
    const values: Record<string, number> = {
      T1: p.T1,
      T2: p.T2,
      tMs: p.tMs,
      pX: q.pX,
      pY: q.pY,
      pZ: q.pZ,
      total,
      pXM: sciNeg(q.pX).m,
      pXE: sciNeg(q.pX).e,
      pZM: sciNeg(q.pZ).m,
      pZE: sciNeg(q.pZ).e,
      totalM: sciNeg(total).m,
      totalE: sciNeg(total).e,
      pZPct: 100 * q.pZ,
      totalPct: 100 * total,
      smallT: small,
      smallRatio: total / small,
      shrinkXY: sh.x,
      shrinkZ: sh.z,
      pzOverPx: q.pZ / q.pX,
    }
    const view = p.view ?? 'chances'
    let stage: StageState
    if (view === 'bars') {
      stage = pts([pt(1, q.pX, 'p_X', 'computed'), pt(2, q.pY, 'p_Y', 'computed'), pt(3, q.pZ, 'p_Z', 'computed')], { xLabel: 'the three chances', yLabel: `chance after ${p.tMs} ms`, yScale: 'log' })
    } else {
      const points: PlotPoint[] = []
      for (const ms of TIMES_MS) {
        const r = pauliTwirl(ms / 1000, p.T1, p.T2)
        const s = blochShrink(r)
        if (view === 'chances') {
          points.push(pt(ms, r.pX, undefined, 'computed', 'p_X = p_Y'))
          points.push(pt(ms, r.pZ, undefined, 'computed', 'p_Z'))
        } else if (view === 'shrink') {
          points.push(pt(ms, s.x, undefined, 'computed', 'x and y shrink'))
          points.push(pt(ms, s.z, undefined, 'computed', 'z shrink'))
        } else {
          points.push(pt(ms, r.pX + r.pY + r.pZ, undefined, 'computed', 'exact'))
          points.push(pt(ms, idleSmallT(ms / 1000, p.T1, p.T2), undefined, 'computed', 'straight line'))
        }
      }
      stage = pts(points, view === 'shrink' ? { xLabel: 'wait (ms)', yLabel: 'shrink factor', xScale: 'log' } : { xLabel: 'wait (ms)', yLabel: 'chance', xScale: 'log', yScale: 'log' })
    }
    return { stage, values }
  },
})

/* ---------------------------------------------------------------------------------------------- */
/* readout-ucurve: reading error against waiting error                                              */
/* ---------------------------------------------------------------------------------------------- */

const memo = new Map<string, unknown>()
const cached = <T>(key: unknown[], f: () => T): T => {
  const k = JSON.stringify(key)
  if (!memo.has(k)) memo.set(k, f())
  return memo.get(k) as T
}
const GRID = { lo: 0.05, hi: 20, step: 0.05 } as const

export const readoutUcurveRecipe = def({
  id: 'readout-ucurve',
  version: 1,
  title: 'Our toy U-curve: p_eff(t) = p_g + p_idle(t) + p_m(t) for a camera exposure of t ms (bright rate `rb`, background `rg` photons per ms, best whole-count cutoff; T₁, T₂ in seconds), its minimum on a 0.05 ms grid, and the logical error A (p_eff/p_th)^((d+1)/2) at distance d',
  kinds: ['plot'],
  params: shape({
    rb: num(1, 20),
    rg: num(0.05, 2),
    pg: num(0.0001, 0.01),
    T1: num(0.5, 1000),
    T2: num(0.1, 100),
    pth: num(0.001, 0.05),
    A: num(0.001, 1),
    d: int(3, 25),
    view: optional(oneOf(['parts', 'logical'] as const)),
  }),
  rules: (p) => [...oddD(p.d, 'params.d'), ...(p.T2 > 2 * p.T1 ? ['params.T2: at most 2 T₁'] : []), ...(p.rb <= p.rg ? ['params.rb: above the background rate rg'] : [])],
  run: (p) => {
    const pm = (t: number): number => cached(['pm', p.rb, p.rg, t], () => readoutError(p.rb, p.rg, t))
    const peff = (t: number): number => p.pg + idleTotal(t / 1000, p.T1, p.T2) + pm(t)
    const pl = (t: number, d: number): number => logicalToy(peff(t), p.A, p.pth, d)
    const grid = cached(['min', p.rb, p.rg, p.pg, p.T1, p.T2], () => argminTime(peff, GRID.lo, GRID.hi, GRID.step))
    const gridD = cached(['minD', p.rb, p.rg, p.pg, p.T1, p.T2, p.pth, p.A, p.d], () => argminTime((t) => pl(t, p.d), GRID.lo, GRID.hi, GRID.step))
    const refined = cached(['refine', p.rb, p.rg, p.pg, p.T1, p.T2], () => refineMinimum(peff, grid.t - GRID.step, grid.t + GRID.step, 1e-7))
    const values: Record<string, number> = {
      rb: p.rb,
      rg: p.rg,
      pg: p.pg,
      T1: p.T1,
      T2: p.T2,
      pth: p.pth,
      A: p.A,
      d: p.d,
      pm1: pm(1),
      pm2: pm(2),
      pm4: pm(4),
      pm4M: sciNeg(pm(4)).m,
      pm4E: sciNeg(pm(4)).e,
      peff1: peff(1),
      peff2: peff(2),
      peff4: peff(4),
      peff10: peff(10),
      tStar: grid.t,
      tStarD: gridD.t,
      tStarRefined: refined.t,
      peffStar: grid.value,
      pLStar: pl(grid.t, p.d),
      pLAt10: pl(10, p.d),
      amp2: pl(2 * grid.t, p.d) / pl(grid.t, p.d),
      exponent: (p.d + 1) / 2,
      peffStarOverPth: grid.value / p.pth,
      peff1OverPth: peff(1) / p.pth,
    }
    const star = sciNeg(values.pLStar)
    const at10 = sciNeg(values.pLAt10)
    Object.assign(values, { pLStarM: star.m, pLStarE: star.e, pLAt10M: at10.m, pLAt10E: at10.e })
    const ts = [1, 2, 3, 4, 6, 8, 12]
    const view = p.view ?? 'parts'
    let stage: StageState
    if (view === 'parts') {
      const points: PlotPoint[] = []
      for (const t of ts) {
        points.push(pt(t, pm(t), undefined, 'computed', 'reading error'))
        points.push(pt(t, idleTotal(t / 1000, p.T1, p.T2), undefined, 'computed', 'waiting error'))
        points.push(pt(t, peff(t), undefined, 'computed', 'total p_eff'))
      }
      points.push(pt(grid.t, grid.value, 'best t*', 'computed', 'best'))
      stage = pts(points, { xLabel: 'camera exposure t (ms)', yLabel: 'chance per round', yScale: 'log', yLines: [{ y: p.pth, label: 'p_th' }] })
    } else {
      const points: PlotPoint[] = []
      for (const d of [3, 11, 25]) for (const t of ts) if (peff(t) < p.pth) points.push(pt(t, logicalToy(peff(t), p.A, p.pth, d), undefined, 'computed', `d = ${d}`))
      stage = pts(points, { xLabel: 'exposure t (ms)', yLabel: 'logical error p_L', yScale: 'log' })
    }
    return { stage, values }
  },
})

/* ---------------------------------------------------------------------------------------------- */
/* fault-counts: why the exponent is (d + 1)/2                                                      */
/* ---------------------------------------------------------------------------------------------- */

const D_ODD = [3, 5, 7, 9, 11, 13]

export const faultCountsRecipe = def({
  id: 'fault-counts',
  version: 1,
  title: 'A vote of d copies, each wrong with chance p: the exact failure against the cheapest failing fault sets C(d, (d+1)/2) p^((d+1)/2); and, for unequal rates (`mixed`: n₁ places at p₁, n₂ at p₂), the elementary symmetric polynomial against Maclaurin’s bound',
  kinds: ['plot'],
  params: shape({
    d: int(3, 25),
    p: num(1e-6, 0.4),
    view: optional(oneOf(['exact', 'ratio', 'mixed'] as const)),
    mixed: optional(shape({ n1: int(1, 8), p1: num(1e-6, 0.4), n2: int(1, 8), p2: num(1e-6, 0.4) })),
  }),
  rules: (p) => {
    const bad = oddD(p.d, 'params.d')
    if (p.view === 'mixed' && p.mixed === undefined) bad.push("params.mixed: view 'mixed' needs the rates")
    if (p.mixed !== undefined && p.mixed.n1 + p.mixed.n2 < 3) bad.push('params.mixed: at least three places')
    return bad
  },
  run: (p) => {
    const k = (p.d + 1) / 2
    const exact = voteExact(p.d, p.p)
    const lead = voteLeading(p.d, p.p)
    const ex = sciNeg(exact)
    const values: Record<string, number> = { d: p.d, p: p.p, k, ways: choose(p.d, k), exact, lead, ratio: exact / lead, exactM: ex.m, exactE: ex.e, doubling: 2 ** k }
    let stage: StageState
    if (p.mixed) {
      const rates = [...Array<number>(p.mixed.n1).fill(p.mixed.p1), ...Array<number>(p.mixed.n2).fill(p.mixed.p2)]
      const n = rates.length
      const kk = Math.floor(n / 2) + 1
      const e = elementarySymmetric(rates, kk)
      const bound = maclaurinBound(rates, kk)
      const ps = poissonBinomialTail(rates, kk)
      const em = sciNeg(e)
      const bm = sciNeg(bound)
      const xm = sciNeg(ps)
      Object.assign(values, { places: n, p1: p.mixed.p1, p2: p.mixed.p2, kMixed: kk, eK: e, eKM: em.m, eKE: em.e, bound, boundM: bm.m, boundE: bm.e, boundRatio: e / bound, mixedExact: ps, mixedExactM: xm.m, mixedExactE: xm.e })
      stage = pts([pt(1, e, 'leading term e_k', 'computed'), pt(2, bound, 'Maclaurin bound', 'computed'), pt(3, ps, 'exact failure', 'computed')], { xLabel: 'unequal rates', yLabel: 'chance', yScale: 'log' })
    } else {
      const points: PlotPoint[] = []
      for (const d of D_ODD) {
        const ex1 = voteExact(d, p.p)
        const ld = voteLeading(d, p.p)
        if ((p.view ?? 'exact') === 'ratio') points.push(pt(d, ex1 / ld, undefined, 'computed', 'exact / leading'))
        else {
          points.push(pt(d, ex1, undefined, 'computed', 'exact vote'))
          points.push(pt(d, ld, undefined, 'computed', 'leading term'))
        }
      }
      stage = pts(points, (p.view ?? 'exact') === 'ratio' ? { xLabel: 'copies d', yLabel: 'exact over leading term' } : { xLabel: 'copies d', yLabel: 'failure chance', yScale: 'log' })
    }
    return { stage, values }
  },
})

/* ---------------------------------------------------------------------------------------------- */
/* pipeline-schedule: hiding the classical work                                                     */
/* ---------------------------------------------------------------------------------------------- */

type Seg = TimelineSegment
function serialRows(d: number, g: number, r: number, c: number): { cam: Seg[]; cls: Seg[] } {
  const cam: Seg[] = []
  const cls: Seg[] = []
  let t = 0
  for (let k = 0; k < d; k++) {
    cam.push({ kind: 'gate', from: t, to: t + g })
    cam.push({ kind: 'acquire', from: t + g, to: t + g + r })
    cls.push({ kind: 'classify', from: t + g + r, to: t + g + r + c })
    t += g + r + c
  }
  return { cam, cls }
}
function pipedRows(d: number, g: number, r: number, c: number): { cam: Seg[]; cls: Seg[] } {
  const cam: Seg[] = []
  const cls: Seg[] = []
  let acq = 0
  let free = 0
  for (let k = 0; k < d; k++) {
    cam.push({ kind: 'gate', from: acq, to: acq + g })
    cam.push({ kind: 'acquire', from: acq + g, to: acq + g + r })
    acq += g + r
    const start = Math.max(acq, free)
    cls.push({ kind: 'classify', from: start, to: start + c })
    free = start + c
  }
  return { cam, cls }
}

export const pipelineScheduleRecipe = def({
  id: 'pipeline-schedule',
  version: 1,
  title: 'd rounds of gates (g ms) and camera exposure (r ms) with classification (c ms) one after another, or overlapped; the totals, the saving and the point where overlap stops helping (generic form of the paper’s Eqs. 4–5)',
  kinds: ['timeline', 'plot'],
  params: shape({
    d: int(1, 25),
    g: num(0.0001, 10),
    r: num(0.001, 20),
    c: num(0.0001, 20),
    view: optional(oneOf(['serial', 'pipelined', 'both', 'vsC'] as const)),
    /** No totals printed above the picture (a clue's picture must not print the answer). */
    quiet: optional(bool()),
  }),
  run: (p) => {
    const serial = unpipelinedTotal(p.d, p.g, p.r, p.c)
    const pipe = pipelinedTotal(p.d, p.g, p.r, p.c)
    const values: Record<string, number> = {
      d: p.d,
      g: p.g,
      r: p.r,
      c: p.c,
      serial,
      pipe,
      sim: pipelineSim(p.d, p.g, p.r, p.c),
      saving: serial - pipe,
      breakEven: p.g + p.r,
      bottleneck: p.c > p.g + p.r ? 1 : 0,
      share: (serial - pipe) / serial,
    }
    const view = p.view ?? 'both'
    if (view === 'vsC') {
      const points: PlotPoint[] = []
      for (const c of [0.05, 0.1, 0.2, 0.4, 0.8, 1.2, 1.6, 2]) {
        points.push(pt(c, unpipelinedTotal(p.d, p.g, p.r, c), undefined, 'computed', 'one after another'))
        points.push(pt(c, pipelinedTotal(p.d, p.g, p.r, c), undefined, 'computed', 'overlapped'))
      }
      return { stage: pts(points, { xLabel: 'classifier time c (ms)', yLabel: 'total time (ms)' }), values }
    }
    const rows: { label: string; group?: string; segments: Seg[] }[] = []
    if (view === 'serial' || view === 'both') {
      const s = serialRows(p.d, p.g, p.r, p.c)
      rows.push({ label: 'gates, camera', group: 'one after another', segments: s.cam }, { label: 'classifier', group: 'one after another', segments: s.cls })
    }
    if (view === 'pipelined' || view === 'both') {
      const s = pipedRows(p.d, p.g, p.r, p.c)
      rows.push({ label: 'gates, camera ', group: 'overlapped', segments: s.cam }, { label: 'classifier ', group: 'overlapped', segments: s.cls })
    }
    return { stage: { kind: 'timeline', rows, unit: 'ms', readouts: p.quiet ? [] : view === 'both' ? ['total', 'saving'] : ['total'] }, values }
  },
})

/* ---------------------------------------------------------------------------------------------- */
/* loss-budget: atoms that leave                                                                    */
/* ---------------------------------------------------------------------------------------------- */

export const lossBudgetRecipe = def({
  id: 'loss-budget',
  version: 1,
  title: 'Atoms lost over rounds: a surface-code patch of distance d holds 2d² − 1 atoms; each is lost in an image with chance `loss` (a reported input or a stated assumption); expected losses per round, the chance of none in `rounds` rounds',
  kinds: ['plot'],
  params: shape({
    d: int(3, 25),
    loss: num(1e-6, 0.1),
    rounds: int(1, 1000),
  }),
  rules: (p) => oddD(p.d, 'params.d'),
  run: (p) => {
    const n = 2 * p.d * p.d - 1
    const S = 1 - p.loss
    const per = lossPerRound(n, S)
    const values: Record<string, number> = {
      d: p.d,
      loss: p.loss,
      rounds: p.rounds,
      atoms: n,
      lossPerRound: per,
      lossOverRounds: per * p.rounds,
      noLoss: noLossChance(n, S, p.rounds),
      roundsToLoss: 1 / (n * p.loss),
      survival: S,
      lossM: sciNeg(p.loss).m,
      lossE: sciNeg(p.loss).e,
    }
    const points: PlotPoint[] = []
    for (const r of [1, 5, 10, 20, 40, 80, 120, 200]) {
      points.push(pt(r, noLossChance(n, S, r), undefined, 'computed', 'no atom lost'))
    }
    points.push(pt(p.rounds, values.noLoss, `${p.rounds} rounds`, 'computed', 'this run'))
    return { stage: pts(points, { xLabel: 'rounds', yLabel: 'chance of no loss' }), values }
  },
})

/* ---------------------------------------------------------------------------------------------- */
/* erasure-vs-error: a known place is cheaper than an unknown one                                   */
/* ---------------------------------------------------------------------------------------------- */

export const erasureVsErrorRecipe = def({
  id: 'erasure-vs-error',
  version: 1,
  title: 'A repetition vote of d copies when a copy is erased with known place (chance e) against flipped with unknown place (chance p): the failure chances and the fewest faults that fail the vote',
  kinds: ['plot'],
  params: shape({
    d: int(3, 25),
    e: num(1e-6, 0.5),
    p: num(1e-6, 0.4),
  }),
  rules: (p) => oddD(p.d, 'params.d'),
  run: (p) => {
    const er = erasureRepetition(p.d, p.e)
    const fl = voteExact(p.d, p.p)
    const em = sciNeg(er)
    const values: Record<string, number> = {
      d: p.d,
      e: p.e,
      p: p.p,
      erasure: er,
      erasureM: em.m,
      erasureE: em.e,
      erasureMicro: Number((er * 1e6).toPrecision(12)),
      flip: fl,
      minErasure: minFaults(p.d, 'erasure'),
      minFlip: minFaults(p.d, 'flip'),
    }
    const points: PlotPoint[] = []
    for (const d of D_ODD) {
      points.push(pt(d, erasureRepetition(d, p.e), undefined, 'computed', 'erased, place known'))
      points.push(pt(d, voteExact(d, p.p), undefined, 'computed', 'flipped, place unknown'))
    }
    return { stage: pts(points, { xLabel: 'copies d', yLabel: 'failure chance', yScale: 'log' }), values }
  },
})

export const B6_RECIPES = {
  'cycle-budget': cycleBudgetRecipe,
  'idle-twirl': idleTwirlRecipe,
  'readout-ucurve': readoutUcurveRecipe,
  'fault-counts': faultCountsRecipe,
  'pipeline-schedule': pipelineScheduleRecipe,
  'loss-budget': lossBudgetRecipe,
  'erasure-vs-error': erasureVsErrorRecipe,
} as const
