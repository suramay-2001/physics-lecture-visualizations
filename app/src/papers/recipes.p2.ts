/**
 * The recipes of the Papers lecture P2, the GANDALF paper (P-P2-story §9.3; rulings gandalf-batch.md G1–G4): allow-listed engine computations (physics/readout/gandalf.ts, wrapping
 * physics/qec/timing.ts and physics/optics/imaging.ts) with typed parameters, returning props for the timeline, plot and camera-frame kinds and the named numbers a computed claim may cite.
 * Registered in papers/recipes.ts `RECIPES` through `P2_RECIPES`; their own file so chapters built in parallel append to separate files. The network sizes of the lecture and the linear cleaner
 * come from B5's `conv-stack` and `linear-denoise`; nothing is built twice. Printed numbers enter only as params that a claim marks `uses` (the paper's own, as printed); the toy inputs of the
 * post-selection and of the reading-against-idle trade-off are ours, labelled so on the page, never fitted to the paper.
 */
import type { CameraFrameState, PlotPoint, PlotPointsState, StageState, TimelineState } from '../content/stage'
import {
  FIG15,
  argminGrid,
  batchTime,
  cyclePipelined,
  cycleUnpipelined,
  effectiveRate,
  errorAfter,
  etaFactor,
  gateReadShare,
  hidesCleanly,
  impliedClassTime,
  impliedReadGate,
  impliedReadGatePipelined,
  keepFraction,
  keptError,
  latencyFromThroughput,
  logicalToy,
  perSiteMicros,
  pipelineGain,
  poissonOverlapError,
  ratio,
  runtimeScale,
  snrRatio,
  timelineSegments,
  type TradeInputs,
} from '../physics/readout/gandalf'
import { unpipelinedTotal } from '../physics/qec/timing'
import { int, list, num, oneOf, optional, plain, shape } from './params'
import type { RecipeDef } from './recipes'

const def = <P>(d: RecipeDef<P>): RecipeDef<P> => d
const pt = (x: number, y: number, label?: string, status?: PlotPoint['status'], group?: string): PlotPoint => ({ x, y, ...(label ? { label } : {}), ...(status ? { status } : {}), ...(group ? { group } : {}) })
const pts = (points: PlotPoint[], extra: Omit<PlotPointsState, 'kind' | 'points'>): StageState => ({ kind: 'plot', points, ...extra })

/* ---------------------------------------------------------------------------------------------- */
/* platform-gap: Table 1 (gate and readout, two platforms) and Eq. 1                               */
/* ---------------------------------------------------------------------------------------------- */

export const platformGapRecipe = def({
  id: 'platform-gap',
  version: 1,
  title: 'Table 1 of the paper (a two-qubit gate and a readout, a neutral-atom and a superconducting machine) on a log time axis, with the readout-to-gate ratios, the share of a gate-plus-readout round the readout takes (our calculation) and Eq. 1’s runtime scale',
  kinds: ['plot'],
  params: shape({
    gateNaNs: optional(num(1, 1e6)),
    readoutNaNs: optional(num(1, 1e9)),
    gateScNs: optional(num(1, 1e6)),
    readoutScNs: optional(num(1, 1e9)),
    slower: optional(int(2, 100000)),
  }),
  run: (p) => {
    const gn = p.gateNaNs ?? 400
    const rn = p.readoutNaNs ?? 1e6
    const gs = p.gateScNs ?? 34
    const rs = p.readoutScNs ?? 500
    const stage = pts(
      [pt(1, gn, 'gate 400 ns', 'reported', 'two-qubit gate'), pt(1, rn, 'readout 1 ms', 'reported', 'readout'), pt(2, gs, 'gate 34 ns', 'reported', 'two-qubit gate'), pt(2, rs, 'readout 500 ns', 'reported', 'readout')],
      { xLabel: '1 atoms, 2 supercond.', yLabel: 'time (ns)', yScale: 'log' },
    )
    return {
      stage,
      values: { gapNA: ratio(rn, gn), gapSC: ratio(rs, gs), fracNA: gateReadShare(gn, rn), fracSC: gateReadShare(gs, rs), scale: runtimeScale(p.slower ?? 1000) },
    }
  },
})

/* ---------------------------------------------------------------------------------------------- */
/* readout-timeline: Eqs. 4 and 5 as boxes on a time line                                          */
/* ---------------------------------------------------------------------------------------------- */

const TL_MODES = ['cycle', 'a', 'b', 'c', 'ac', 'abc'] as const
export const readoutTimelineRecipe = def({
  id: 'readout-timeline',
  version: 1,
  title: 'Fig. 11 as boxes: one QEC cycle, or d rounds run baseline (a), unpipelined with the denoiser (b) or pipelined (c); `drawn` rounds are drawn, the totals count `d` rounds (Eq. 4 is the baseline, Eq. 5 the pipelined total with t_den + t_c)',
  kinds: ['timeline'],
  params: shape({
    mode: oneOf(TL_MODES),
    drawn: int(1, 8),
    d: int(1, 1000),
    tg: num(0.0001, 20),
    tr: num(0.0001, 100),
    tden: num(0, 20),
    tc: num(0, 20),
    treset: optional(num(0, 20)),
  }),
  rules: (p) => {
    const bad: string[] = []
    if (p.mode === 'cycle' && !(p.treset !== undefined && p.treset > 0)) bad.push("params.treset: mode 'cycle' needs a reset time above 0")
    if (p.mode !== 'cycle' && p.treset !== undefined) bad.push("params.treset: only with mode 'cycle'")
    if (p.mode !== 'cycle' && p.drawn > p.d) bad.push('params.drawn: no more rounds drawn than counted (d)')
    return bad
  },
  run: (p) => {
    const o = { drawn: p.drawn, tg: p.tg, tr: p.tr, tden: p.tden, tc: p.tc, ...(p.treset !== undefined ? { treset: p.treset } : {}) }
    const rows = p.mode === 'ac' ? [...timelineSegments('a', o), ...timelineSegments('c', o)] : p.mode === 'abc' ? [...timelineSegments('a', o), ...timelineSegments('b', o), ...timelineSegments('c', o)] : timelineSegments(p.mode, o)
    const stage: TimelineState = { kind: 'timeline', rows, unit: 'ms', readouts: p.mode === 'ac' ? ['total', 'saving'] : ['total'] }
    const classical = p.tden + p.tc
    const tUnp = cycleUnpipelined(p.d, p.tg, p.tr, p.tc)
    const tPip = cyclePipelined(p.d, p.tg, p.tr, p.tden, p.tc)
    return {
      stage,
      values: {
        tUnp,
        tPip,
        tUnpDen: unpipelinedTotal(p.d, p.tg, p.tr, classical),
        saving: pipelineGain(p.d, p.tg, p.tr, p.tden, p.tc),
        speedup: tUnp / tPip,
        classical,
        hides: hidesCleanly(p.tg, p.tr, p.tden, p.tc) ? 1 : 0,
        cycle: p.tg + p.tr + (p.treset ?? 0),
      },
    }
  },
})

/* ---------------------------------------------------------------------------------------------- */
/* fig15-readback: the printed bars of Fig. 15 and the times they imply                            */
/* ---------------------------------------------------------------------------------------------- */

const F15 = FIG15
const nearestGap = (x: number): number => Math.min(...[...F15.unp, ...F15.pip, ...F15.gan].map((b) => Math.abs(b - x)))

export const fig15ReadbackRecipe = def({
  id: 'fig15-readback',
  version: 1,
  title: 'The nine printed bars of Fig. 15 (total time of 100 rounds at tolerances 1, 2 and 3 %) read back: the classification time the pipelined baseline implies, t_r + t_g at each tolerance for the baseline and (with an assumed t_den + t_c) for GANDALF, the bar ratios and the comparison with the text’s 0.19 s and 0.152 s',
  kinds: ['plot'],
  params: shape({
    tol: int(1, 3),
    view: oneOf(['bars', 'readback', 'text'] as const),
    tdc: optional(num(0, 5)),
    tg: optional(num(0, 1)),
    d: optional(int(2, 1000)),
    trFixed: optional(num(0.1, 10)),
  }),
  run: (p) => {
    const i = p.tol - 1
    const d = p.d ?? FIG15.rounds
    const tg = p.tg ?? 0.01
    const tdc = p.tdc ?? 0.1
    const tc = impliedClassTime(F15.unp[0], F15.pip[0], d)
    const trg = F15.unp.map((u) => impliedReadGate(u, d, tc))
    const ganTrg = F15.gan.map((g) => impliedReadGatePipelined(g, d, tdc))
    const trFixed = p.trFixed ?? 1.5
    const equalBase = cyclePipelined(d, tg, trFixed, 0, tc)
    const equalGan = cyclePipelined(d, tg, trFixed, 0, tdc)
    const bar = (v: readonly number[], g: string, label: string): PlotPoint[] => v.map((y, k) => pt(k + 1, y, k === 0 ? label : `${y}`, 'reported', g))
    let stage: StageState
    if (p.view === 'readback')
      stage = pts([...trg.map((y, k) => pt(k + 1, y, k === 0 ? 'baseline t_r + t_g' : undefined, 'computed', 'baseline')), ...ganTrg.map((y, k) => pt(k + 1, y, k === 0 ? 'GANDALF, assumed' : undefined, 'computed', 'GANDALF'))], {
        xLabel: 'tolerance (%)',
        yLabel: 't_r + t_g (ms)',
      })
    else {
      const bars = [...bar(F15.unp, 'unpipelined', 'unpipelined'), ...bar(F15.pip, 'pipelined', 'pipelined'), ...bar(F15.gan, 'GANDALF', 'GANDALF')]
      stage = pts(p.view === 'text' ? [...bars, pt(3, 190, 'text: 0.19 s', 'reported', 'the text'), pt(3, 152, 'text: 0.152 s', 'reported', 'the text')] : bars, { xLabel: 'tolerance (%)', yLabel: '100 rounds (ms)' })
    }
    return {
      stage,
      values: {
        unp: F15.unp[i],
        pip: F15.pip[i],
        gan: F15.gan[i],
        save: F15.unp[i] - F15.pip[i],
        savePct: (F15.unp[i] - F15.pip[i]) / F15.unp[i],
        tc,
        trgBase: trg[i],
        ganTrg: ganTrg[i],
        ganTr: ganTrg[i] - tg,
        ratio: ratio(F15.pip[i], F15.gan[i]),
        equalBase,
        equalGan,
        equalDiff: equalBase - equalGan,
        gap190: nearestGap(190),
        gap152: nearestGap(152),
        textRatio: ratio(190, 152),
      },
    }
  },
})

/* ---------------------------------------------------------------------------------------------- */
/* eta-factor: the relative infidelity reduction as a factor                                       */
/* ---------------------------------------------------------------------------------------------- */

export const etaFactorRecipe = def({
  id: 'eta-factor',
  version: 1,
  title: 'The paper’s η = 1 − δ_method/δ_baseline (percent): the factor 1/(1 − η) by which the error is divided, the share of errors left, and the error left from a baseline error (percent)',
  kinds: ['plot'],
  params: shape({ eta: num(0, 99.9), base: optional(num(0, 100)) }),
  run: (p) => {
    const f = etaFactor(p.eta / 100)
    const curve = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90].map((e) => pt(e, etaFactor(e / 100), undefined, 'computed', '1/(1 − η)'))
    const stage = pts([...curve, pt(p.eta, f, `η = ${p.eta} %`, 'computed', 'this η')], { xLabel: 'η (%)', yLabel: 'factor 1/(1 − η)' })
    return { stage, values: { eta: p.eta, factor: f, left: 1 - p.eta / 100, newErr: errorAfter(p.base ?? 4, p.eta / 100), base: p.base ?? 4 } }
  },
})

/* ---------------------------------------------------------------------------------------------- */
/* latency-tp: Tables 3, 4 and 5                                                                   */
/* ---------------------------------------------------------------------------------------------- */

const T3 = { side: [4, 8, 32, 64], lat: [0.201, 0.514, 9.091, 33.49] } as const
const T4 = { batch: [1, 8, 32, 64, 128], tp: [460.0, 3330.3, 9225.0, 11721.4, 12711.4], lat: [2.174, 0.3, 0.108, 0.085, 0.079] } as const
const T5 = { models: [4, 8, 16, 32], lat: [0.094, 0.089, 0.085, 0.083] } as const

export const latencyTpRecipe = def({
  id: 'latency-tp',
  version: 1,
  title: 'Tables 3, 4 and 5 of the paper (denoising latency against array size, against batch size, against parallel models): the printed latencies beside what our arithmetic makes of them (a latency is 1000/throughput; the cost per site)',
  kinds: ['plot'],
  params: shape({ view: oneOf(['table3', 'table4', 'table5'] as const) }),
  run: (p) => {
    let stage: StageState
    if (p.view === 'table3')
      stage = pts(
        [
          ...T3.side.map((n, k) => pt(n * n, T3.lat[k], `${n}×${n}`, 'reported', 'printed latency')),
          ...T3.side.map((n, k) => pt(n * n, (T3.lat[0] * (n * n)) / (T3.side[0] * T3.side[0]), k === 3 ? 'in proportion to pixels' : undefined, 'computed', 'if proportional')),
        ],
        { xLabel: 'pixels', yLabel: 'latency (ms)', xScale: 'log', yScale: 'log' },
      )
    else if (p.view === 'table4')
      stage = pts([...T4.batch.map((b, k) => pt(b, T4.lat[k], k === 0 ? 'printed' : undefined, 'reported', 'printed latency')), ...T4.batch.map((b, k) => pt(b, latencyFromThroughput(T4.tp[k]), k === 4 ? '1000 / TP' : undefined, 'computed', '1000/throughput'))], {
        xLabel: 'batch size',
        yLabel: 'ms per image',
        xScale: 'log',
        yScale: 'log',
      })
    else stage = pts(T5.models.map((m, k) => pt(m, T5.lat[k] * 1000, `${T5.lat[k]} ms`, 'reported', 'printed latency')), { xLabel: 'parallel models', yLabel: 'latency (µs)' })
    return {
      stage,
      values: {
        pixelRatio: (T3.side[3] * T3.side[3]) / (T3.side[0] * T3.side[0]),
        latRatio: ratio(T3.lat[3], T3.lat[0]),
        perSite4: perSiteMicros(T3.lat[0], T3.side[0]),
        perSite64: perSiteMicros(T3.lat[3], T3.side[3]),
        latTp: Math.max(...T4.tp.map((t, k) => Math.abs(latencyFromThroughput(t) - T4.lat[k]))),
        batch128: batchTime(128, T4.tp[4]),
        lat34: ratio(T4.lat[0], T3.lat[0]),
        single3x3: latencyFromThroughput(T4.tp[0]),
      },
    }
  },
})

/* ---------------------------------------------------------------------------------------------- */
/* dual-path: the two optical paths and the dataset's counts                                       */
/* ---------------------------------------------------------------------------------------------- */

const ARRAY_SITES: [number, number][] = [
  [1, 1],
  [1, 4],
  [1, 7],
  [4, 1],
  [4, 7],
  [7, 1],
  [7, 4],
  [7, 7],
  [4, 4],
]
const frame = (photons: number, background: number, seed: number): CameraFrameState => ({
  kind: 'camera-frame',
  rows: 9,
  cols: 9,
  sites: ARRAY_SITES,
  photons,
  psf: 0.8,
  background,
  noise: 'poisson',
  seed,
  panel: [{ show: 'occupancy' }, { show: 'photons' }, { show: 'counts' }],
})

export const dualPathRecipe = def({
  id: 'dual-path',
  version: 1,
  title: 'The paper’s two optical paths of one 3 × 3 array: simulated bright and dim frames (the dim path attenuated by a factor), or an illustrative Poisson overlap against exposure; with the equivalent exposures and the dataset’s counts from the printed numbers',
  kinds: ['camera-frame', 'plot'],
  params: shape({
    attenuation: int(2, 100),
    view: oneOf(['frames', 'overlap'] as const),
    seed: optional(int(0, 1_000_000)),
    images: optional(int(1, 100000)),
    atoms: optional(int(1, 100)),
    durations: optional(int(1, 100)),
    longMin: optional(num(1, 1000)),
    longMax: optional(num(1, 1000)),
    split: optional(list(num(0, 100), 3, 3)),
  }),
  run: (p) => {
    const long0 = p.longMin ?? 15
    const long1 = p.longMax ?? 100
    const images = p.images ?? 3000
    const atoms = p.atoms ?? 9
    const per = images * atoms
    let stage: StageState
    if (p.view === 'frames') {
      const seed = p.seed ?? 5
      stage = frame(60 / p.attenuation, 0.4 / p.attenuation, seed)
    } else {
      const rb = 3
      const rd = 0.3
      const ts = [1.5, 2, 3, 4, 5, 6, 8, 10, 15, 20, 30, 50, 100]
      stage = pts(
        ts.map((t) => pt(t, Math.max(poissonOverlapError(rb * t, rd * t), 1e-9), undefined, 'computed', t <= 10 ? 'short (dim path)' : 'long (primary path)')),
        { xLabel: 'exposure (ms)', yLabel: 'chance of a wrong bit', xScale: 'log', yScale: 'log' },
      )
    }
    const split = p.split ?? [65, 15, 20]
    return {
      stage,
      values: {
        attenuation: p.attenuation,
        expLo: long0 / p.attenuation,
        expHi: long1 / p.attenuation,
        snrLoss: snrRatio(p.attenuation),
        sites: per,
        split: split[0] + split[1] + split[2],
        sitesAllDurations: per * (p.durations ?? 14),
      },
    }
  },
})

/* ---------------------------------------------------------------------------------------------- */
/* printed-ratio: one printed number over another                                                  */
/* ---------------------------------------------------------------------------------------------- */

export const printedRatioRecipe = def({
  id: 'printed-ratio',
  version: 1,
  title: 'Two numbers the paper prints, side by side as points, and their ratio (our arithmetic on the printed numbers; the recipe reference names them in `uses`)',
  kinds: ['plot'],
  params: shape({
    a: num(0, 1e9),
    b: num(1e-9, 1e9),
    aLabel: plain(24),
    bLabel: plain(24),
    status: optional(oneOf(['reported', 'computed'] as const)),
    yLabel: optional(plain(24)),
    log: optional(oneOf(['linear', 'log'] as const)),
  }),
  run: (p) => {
    const st = p.status ?? 'reported'
    const stage = pts([pt(1, p.a, p.aLabel, st, 'numerator'), pt(2, p.b, p.bLabel, st, 'denominator')], { xLabel: '1 numerator, 2 denom.', yLabel: p.yLabel ?? 'printed value', ...(p.log === 'log' ? { yScale: 'log' as const } : {}) })
    return { stage, values: { a: p.a, b: p.b, ratio: ratio(p.a, p.b), diff: p.a - p.b } }
  },
})

/* ---------------------------------------------------------------------------------------------- */
/* post-select: a toy of two overlapping score clouds                                              */
/* ---------------------------------------------------------------------------------------------- */

export const postSelectRecipe = def({
  id: 'post-select',
  version: 1,
  title: 'A toy of confidence-based post-selection (ours, not the paper’s data): dark scores N(−s, 1) and bright N(+s, 1), decide bright above 0, keep an image only when |score| ≥ cut; the kept share and the error of the kept ones',
  kinds: ['plot'],
  params: shape({ sep: num(0.5, 4), cut: num(0, 4) }),
  run: (p) => {
    const cuts = Array.from({ length: 8 }, (_, k) => k * 0.5)
    const stage = pts(
      [...cuts.map((c) => pt(c, Math.max(keptError(p.sep, c), 1e-9), undefined, 'computed', 'error of kept')), ...cuts.map((c) => pt(c, keepFraction(p.sep, c), undefined, 'computed', 'share kept')), pt(p.cut, Math.max(keptError(p.sep, p.cut), 1e-9), 'this cut', 'computed', 'this cut')],
      { xLabel: 'cut-off on |score|', yLabel: 'toy chance', yScale: 'log' },
    )
    return { stage, values: { keep: keepFraction(p.sep, p.cut), errKept: keptError(p.sep, p.cut), errAll: keptError(p.sep, 0), dropped: 1 - keepFraction(p.sep, p.cut) } }
  },
})

/* ---------------------------------------------------------------------------------------------- */
/* trade-toy: reading error against idle error (our toy; never fitted to the paper's Fig. 14)      */
/* ---------------------------------------------------------------------------------------------- */

const TOY: TradeInputs = { rb: 6, rd: 0.6, pg: 0.002, T1: 8000, T2: 300 }
const TOY_A = 0.1
const TOY_PTH = 0.03

export const tradeToyRecipe = def({
  id: 'trade-toy',
  version: 1,
  title: 'A toy of why readout time enters the logical rate twice (our inputs, illustrative): waiting error from the Pauli twirl, reading error from the Poisson overlap, their sum, and p_L = A (p_eff/p_th)^((d+1)/2); whether the minimum lies inside the range and how a worse classifier’s penalty falls with time',
  kinds: ['plot'],
  params: shape({ view: oneOf(['parts', 'logical', 'ratio'] as const), d: int(3, 25), worse: optional(num(1.5, 10)) }),
  rules: (p) => (p.d % 2 === 0 ? ['params.d: an odd distance'] : []),
  run: (p) => {
    const ts = [0.5, 1, 1.5, 2, 3, 4, 6, 10]
    const e = ts.map((t) => effectiveRate(t, TOY))
    const worse = p.worse ?? 3
    const pL = (t: number, m = 1): number => logicalToy(effectiveRate(t, { ...TOY, mScale: m }).total, TOY_A, TOY_PTH, p.d)
    const min = argminGrid((t) => pL(t), 0.5, 10, 950)
    const r = (t: number): number => pL(t, worse) / pL(t)
    const [r1, r4, r10] = [1.5, 4, 10].map(r)
    let stage: StageState
    if (p.view === 'parts')
      stage = pts([...ts.map((t, k) => pt(t, e[k].idle, undefined, 'computed', 'waiting')), ...ts.map((t, k) => pt(t, Math.max(e[k].meas, 1e-9), undefined, 'computed', 'reading')), ...ts.map((t, k) => pt(t, e[k].total, undefined, 'computed', 'sum'))], { xLabel: 'readout time (ms)', yLabel: 'toy chance per cycle', yScale: 'log' })
    else if (p.view === 'logical') stage = pts(ts.map((t) => pt(t, pL(t), undefined, 'computed', 'toy p_L')), { xLabel: 'readout time (ms)', yLabel: 'toy logical rate', yScale: 'log' })
    else stage = pts([1, 1.5, 2, 3, 4, 6, 8, 10].map((t) => pt(t, r(t), undefined, 'computed', 'worse over better')), { xLabel: 'readout time (ms)', yLabel: 'ratio of toy p_L', yScale: 'log' })
    return { stage, values: { interior: min.interior ? 1 : 0, tStar: min.t, ratioShort: r1, ratioMid: r4, ratioLong: r10, grows: r1 > r4 && r4 > r10 && r10 > 1 ? 1 : 0 } }
  },
})

export const P2_RECIPES = {
  'platform-gap': platformGapRecipe,
  'readout-timeline': readoutTimelineRecipe,
  'fig15-readback': fig15ReadbackRecipe,
  'eta-factor': etaFactorRecipe,
  'latency-tp': latencyTpRecipe,
  'dual-path': dualPathRecipe,
  'printed-ratio': printedRatioRecipe,
  'post-select': postSelectRecipe,
  'trade-toy': tradeToyRecipe,
} as const
