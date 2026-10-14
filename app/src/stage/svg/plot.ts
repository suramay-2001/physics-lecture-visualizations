/**
 * `plot` (709; SVG; P-Q10-story §9.2): a labelled 2-D curve for a derivation that sweeps a parameter. Content writes
 * only a NAMED engine curve and the range/samples to draw it at — never a point: this resolver samples the curve by
 * calling physics/qc/entangle.ts (`chshCurve`, `lhvChsh`), so the curve and every marker are the engine's own numbers.
 * Interpolation follows stage/interp.ts: the inputs (range, samples, markers, bands, yLines) lerp when the two sides
 * share the same curve and sample count, recomputing the curve; a different curve or sample count hard-switches.
 * B1 (P-B1-story §9.2 K-P, additive): SERIES mode draws up to 6 named series of physics/qec/curves.ts (`cleanRun`, `repLogicalVsD`, `repLogicalVsP`,
 * `surfaceVsP`, `surfaceVsD`) instead of one curve, on a linear or base-10 log x axis, with markers on the first series, vertical marks printed in a
 * paper (hollow, "as printed") and a small value table as readouts. Every y is the engine's; the fits are arithmetic on constants the papers print.
 * Lazy chunk (stage/svg/kinds.ts).
 */
import type { C } from '../../physics/complex'
import { c } from '../../physics/complex'
import type { Vec } from '../../physics/linalg'
import { missCurve } from '../../physics/bb84'
import { bigORatio, exponentialCost, quadraticCost, rootExponentialCost } from '../../physics/qc/bits'
import { dirichlet } from '../../physics/qc/fourier'
import { peBest } from '../../physics/qc/qft'
import { steaneCode } from '../../physics/qec/codes'
import { cleanRun, repetitionLogical, surfaceFit } from '../../physics/qec/curves'
import { TIMELIKE_LIMITS, productFlip, voteFail } from '../../physics/qec/timelike'
import { logicalFailure, qhbNeedReal, repetitionFail } from '../../physics/qec/rates'
import { chshCurve, lhvChsh, type Dir } from '../../physics/qc/entangle'
import type { PlotCurveName, PlotPointsState, PlotSeries, PlotSeriesState, PlotState } from '../../content/stage'
import { PLOT_PRESETS, PLOT_SERIES_FNS } from '../../content/stage'
import type { SvgReadout } from '../svgKinds'
import type { ResolvedPlot, ResolvedPlotSeries } from '../types'
import { fix, sci } from './draw'

/** Validation limits (P-Q10-story §9.2). */
export const PLOT_LIMITS = { samplesMin: 2, samplesMax: 256, samplesDefault: 64, markers: 8, bands: 4, yLines: 4, series: 6, reportedMarks: 6, labelLen: 24, dMax: 99, roundsMax: TIMELIKE_LIMITS.rMax, checksMax: TIMELIKE_LIMITS.mMax, xsMaxD: 50 } as const

const STEANE = steaneCode()
const X_AXIS: Dir = [1, 0, 0]
const Y_AXIS: Dir = [0, 1, 0]

/**
 * (|00⟩ + e^{iδ}|11⟩)/√2, Bergou §3.2's phase-dial example: the state `chshVsPhase` sweeps. A plain 4-vector built
 * here (not `physics/qc/state.ts bell`, which only writes real ±1 coefficients) since this one carries a phase.
 */
function phaseBell(deltaDeg: number): Vec {
  const theta = (deltaDeg * Math.PI) / 180
  const z: C = c(Math.SQRT1_2 * Math.cos(theta), Math.SQRT1_2 * Math.sin(theta))
  return [c(Math.SQRT1_2), c(0), c(0), z]
}

/**
 * The named curves a `plot` beat may draw. `chshVsPhase`: S(δ) for Bergou's phase-dial state at the settings a = X,
 * Y; b = X, Y (physics/qc/entangle.ts `chshCurve`) — the classic 2cos δ + 2sin δ, peaking at 2√2 near δ = 45°.
 * `chshClassicalBound`: the flat local-hidden-variable ceiling (physics/qc/entangle.ts `lhvChsh().maxS`, not a typed
 * 2), so the ceiling itself is an engine value, never a literal.
 */
const CURVE_FNS: { readonly [K in PlotCurveName]: (x: number) => number } = {
  chshVsPhase: (deltaDeg) => chshCurve(phaseBell, [X_AXIS, Y_AXIS], [X_AXIS, Y_AXIS], deltaDeg),
  chshClassicalBound: () => lhvChsh().maxS,
  // W-448 L8-B: the chance that a test of m sifted bits shows no error when each is wrong with probability ¼ (the full
  // intercept–resend attack of Lecture 8): (¾)^m, from physics/bb84.ts (whole m are `missProb`'s own points)
  bb84Miss: (m) => missCurve(0.25, m),
  // W-709 F7-A: Chapter F7's cost curves, from physics/qc/bits.ts: n², 2ⁿ, 2^(n/2) and the big-O ratio (3n² + 5n + 7)/n²
  nSquared: quadraticCost,
  twoToN: exponentialCost,
  sqrtTwoToN: rootExponentialCost,
  bigORatio,
  // W-709 F8-A: Chapter F8's peak shape, from physics/qc/fourier.ts: D₈(δ) = |sin 8πδ| / (8 |sin πδ|), the fraction of its straight length a chain of
  // 8 unit arrows keeps when each is δ of a turn further than the last (δ is read in turns, not degrees)
  // (a value that is only rounding noise, below 10⁻¹², is drawn and read as the 0 it is: the zero at δ = 1/8 is not "1.2 × 10⁻¹⁶")
  dirichlet8: (delta) => {
    const y = dirichlet(8, delta)
    return y < 1e-12 ? 0 : y
  },
  // W-709 Q18-A: the chance of phase estimation's best reading on three wires, max_x P(x) (physics/qc/qft.ts), for an eigenphase tau (turns) from 0 to 1; a cusp every 1/16
  peBest3: (tau) => peBest(tau, 3),
  // stage-code agent S3: Chapters Q21 and Q22 (physics/qec/rates.ts). Chances of a wrong reading against the chance p each copy / qubit is flipped
  repFail3: (p) => repetitionFail(p, 3),
  repFail5: (p) => repetitionFail(p, 5),
  // a lone bit is wrong exactly when it is flipped: y = p
  identityP: (p) => p,
  qhbNeed1: (n) => qhbNeedReal(n, 1, 1),
  steaneFailX: (p) => logicalFailure(STEANE, p, 'X'),
}
/** Each curve's own default range (degrees) when a beat does not write `curve.x`. */
const DEFAULT_RANGE: { readonly [K in PlotCurveName]: { from: number; to: number } } = {
  chshVsPhase: { from: 0, to: 90 },
  chshClassicalBound: { from: 0, to: 90 },
  bb84Miss: { from: 0, to: 40 },
  nSquared: { from: 1, to: 50 },
  twoToN: { from: 1, to: 50 },
  sqrtTwoToN: { from: 1, to: 50 },
  bigORatio: { from: 1, to: 20 },
  dirichlet8: { from: -0.5, to: 0.5 },
  peBest3: { from: 0, to: 1 },
  repFail3: { from: 0, to: 1 },
  repFail5: { from: 0, to: 1 },
  identityP: { from: 0, to: 1 },
  qhbNeed1: { from: 1, to: 10 },
  steaneFailX: { from: 0, to: 0.2 },
}

/** The name each curve carries at its right end when a second curve is drawn beside it, and the x axis's name (the cost curves are in n). */
const CURVE_NAME: { readonly [K in PlotCurveName]: string } = {
  chshVsPhase: 'S(δ)',
  chshClassicalBound: 'classical bound',
  bb84Miss: 'chance of no error',
  nSquared: 'n²',
  twoToN: '2ⁿ',
  sqrtTwoToN: '2^(n/2)',
  bigORatio: '(3n² + 5n + 7)/n²',
  dirichlet8: 'D₈(δ)',
  peBest3: 'best reading',
  repFail3: 'vote of 3',
  repFail5: 'vote of 5',
  identityP: 'lone bit',
  qhbNeed1: 'rooms needed',
  steaneFailX: 'Steane',
}
const CURVE_X: { readonly [K in PlotCurveName]?: string } = { nSquared: 'n', twoToN: 'n', sqrtTwoToN: 'n', bigORatio: 'n', dirichlet8: 'δ', peBest3: 'τ', repFail3: 'p', repFail5: 'p', identityP: 'p', qhbNeed1: 'n', steaneFailX: 'p' }
/** Decimals an x value is printed with where it is a fraction (a turn), not a whole number: 0.0625 needs four. */
const CURVE_XDIGITS: { readonly [K in PlotCurveName]?: number } = { dirichlet8: 4, peBest3: 4, repFail3: 4, repFail5: 4, identityP: 4, steaneFailX: 4 }

/** Curves whose y is a chance: the axis is never padded below 0 or above 1 (W-448 L8-B). */
const CURVE_BOUNDS: { readonly [K in PlotCurveName]?: { min: number; max: number } } = {
  bb84Miss: { min: 0, max: 1 },
  // the cost curves of Chapter F7 are never negative: their (linear) axis starts at 0
  nSquared: { min: 0, max: Infinity },
  twoToN: { min: 0, max: Infinity },
  sqrtTwoToN: { min: 0, max: Infinity },
  // a fraction of the straight length: between 0 and 1, never padded past either end
  dirichlet8: { min: 0, max: 1 },
  // a chance: between 0 and 1
  peBest3: { min: 0, max: 1 },
  // chances of a wrong reading (stage-code agent S3), and the rooms a code needs (never negative)
  repFail3: { min: 0, max: 1 },
  repFail5: { min: 0, max: 1 },
  identityP: { min: 0, max: 1 },
  steaneFailX: { min: 0, max: 1 },
  qhbNeed1: { min: 0, max: Infinity },
}

/** The curves whose x is a chance p: it must lie in [0, 1] (the engine refuses any other p). */
const CHANCE_X: ReadonlySet<PlotCurveName> = new Set<PlotCurveName>(['repFail3', 'repFail5', 'identityP', 'steaneFailX'])

export interface PlotInputs {
  /** A named curve (older beats); absent in series mode. */
  fn?: PlotCurveName
  vs?: PlotCurveName
  /** Series mode (B1). */
  series?: PlotSeries[]
  /** B3: authored whole x values of a discrete series (a function of d or of the rounds R). */
  xs?: number[]
  range: { from: number; to: number }
  samples: number
  markers: { x: number; label?: string }[]
  reportedMarks?: { x: number; label: string; source: string }[]
  bands: { yFrom: number; yTo: number; label?: string }[]
  yLines: { y: number; label?: string }[]
  yScale: 'linear' | 'log'
  xScale?: 'linear' | 'log'
  shot?: PlotState['shot']
}

/* ------------------------------------------------ B1 series ------------------------------------------------ */
/** What x means for each series function: the number of steps N, the distance d (odd), the chance p, or (B3) the rounds R (odd). */
export type SeriesXKind = 'N' | 'd' | 'p' | 'R'
export const SERIES_X: { readonly [K in PlotSeries['fn']]: SeriesXKind } = { cleanRun: 'N', repLogicalVsD: 'd', repLogicalVsP: 'p', surfaceVsP: 'p', surfaceVsD: 'd', voteFail: 'R' }
/** The default x range of each kind of x. */
export const SERIES_RANGE: { readonly [K in 'N' | 'd' | 'p']: { from: number; to: number } } = { N: { from: 1, to: 1000 }, d: { from: 3, to: 25 }, p: { from: 0.0001, to: 0.01 } }
/** B3: the rounds R of a repeated readout run 1 … 11 (odd). */
export const ROUNDS_RANGE = { from: 1, to: TIMELIKE_LIMITS.rMax } as const
const defaultRange = (kind: SeriesXKind): { from: number; to: number } => (kind === 'R' ? ROUNDS_RANGE : SERIES_RANGE[kind])
const SERIES_X_NAME = { N: 'steps N', d: 'd', p: 'p', R: 'rounds R' } as const
/** A function of d or of R is evaluated at whole odd numbers only (dots joined by a line). */
const isDiscreteX = (k: SeriesXKind): boolean => k === 'd' || k === 'R'
/** The drawn x range of a series state: its own, else the span of the authored `xs`, else the function's default. */
const rangeOfSeries = (st: { xRange?: { from: number; to: number }; xs?: number[] }, kind: SeriesXKind): { from: number; to: number } =>
  st.xRange ?? (Array.isArray(st.xs) && st.xs.length >= 2 && st.xs.every((v) => typeof v === 'number') ? { from: Math.min(...st.xs), to: Math.max(...st.xs) } : defaultRange(kind))

/** The value of one series at x (physics/qec/curves.ts; the params were validated). */
export function seriesValue(s: PlotSeries, x: number): number {
  const q = s.params ?? {}
  switch (s.fn) {
    case 'cleanRun':
      // `vote`: every step is protected by a majority vote of that many copies, so a step fails with the vote's chance
      return cleanRun(x, q.vote !== undefined ? repetitionLogical(q.vote, q.p as number) : (q.p as number))
    case 'repLogicalVsD':
      return repetitionLogical(x, q.p as number)
    case 'repLogicalVsP':
      return repetitionLogical(q.d as number, x)
    case 'surfaceVsP':
      return surfaceFit(q.d as number, x, q.preset as string)
    case 'surfaceVsD':
      return surfaceFit(x, q.p as number, q.preset as string)
    case 'voteFail':
      // a vote of x (odd) readings of the product of m checks, each check misread with chance q (physics/qec/timelike.ts)
      return voteFail(x, productFlip(q.q as number, q.m as number))
  }
}

const num = (x: number): string => (Math.abs(x) >= 0.01 || x === 0 ? fix(x, 3) : sci(x, 1))

function seriesLabel(s: PlotSeries): string {
  if (s.label) return s.label
  const q = s.params ?? {}
  switch (s.fn) {
    case 'cleanRun':
      return `clean run, p = ${num(q.p as number)}${q.vote !== undefined ? ` · vote of ${q.vote}` : ''}`
    case 'repLogicalVsD':
      return `vote, p = ${num(q.p as number)}`
    case 'repLogicalVsP':
      return `vote of ${q.d}`
    case 'surfaceVsP':
      return `${q.preset}, d = ${q.d}`
    case 'surfaceVsD':
      return `${q.preset}, p = ${num(q.p as number)}`
    case 'voteFail':
      return `vote, q = ${num(q.q as number)}, m = ${q.m}`
  }
}

/** The x values of a series: the odd whole numbers in the range for a function of d, otherwise `samples` + 1 points, evenly spaced or (log axis) evenly in the logarithm. */
export function seriesXs(kind: SeriesXKind, range: { from: number; to: number }, samples: number, xScale: 'linear' | 'log'): number[] {
  if (isDiscreteX(kind)) {
    const out: number[] = []
    for (let d = Math.ceil(range.from - 1e-9); d <= range.to + 1e-9; d++) if (d % 2 === 1 && d >= 1) out.push(d)
    return out
  }
  const n = Math.max(1, Math.round(samples))
  if (xScale === 'log') {
    const a = Math.log10(range.from)
    const b = Math.log10(range.to)
    return Array.from({ length: n + 1 }, (_, k) => 10 ** (a + ((b - a) * k) / n))
  }
  return Array.from({ length: n + 1 }, (_, k) => range.from + ((range.to - range.from) * k) / n)
}

function seriesFrom(inp: PlotInputs): ResolvedPlot {
  const list = inp.series!
  const kind = SERIES_X[list[0].fn]
  const xScale = inp.xScale ?? 'linear'
  const xs = inp.xs ?? seriesXs(kind, inp.range, inp.samples, xScale)
  const series: ResolvedPlotSeries[] = list.map((s) => ({ fn: s.fn, label: seriesLabel(s), params: { ...(s.params ?? {}) }, points: xs.map((x) => ({ x, y: seriesValue(s, x) })), discrete: isDiscreteX(kind) }))
  const points = series[0].points
  const markers = inp.markers.map((m) => ({ x: m.x, y: seriesValue(list[0], m.x), yVs: null, label: m.label }))
  const ys = [...series.flatMap((s) => s.points.map((p) => p.y)), ...inp.yLines.map((l) => l.y), ...inp.bands.flatMap((b) => [b.yFrom, b.yTo])]
  const log = inp.yScale === 'log'
  const lo = log ? Math.log10(Math.min(...ys)) : Math.min(...ys)
  const hi = log ? Math.log10(Math.max(...ys)) : Math.max(...ys)
  const pad = Math.max(1e-6, (hi - lo) * 0.08)
  // every series here is a chance (or a fit of one): a linear axis never goes below 0, nor above 1 when the data stay below it
  const yMin = log ? 10 ** (lo - pad) : Math.max(0, lo - pad)
  const yMax = log ? 10 ** (hi + pad) : hi <= 1 ? Math.min(1, hi + pad) : hi + pad
  return {
    kind: 'plot',
    fn: null,
    range: inp.range,
    points,
    markers,
    bands: inp.bands,
    yLines: inp.yLines,
    yMin,
    yMax,
    yScale: inp.yScale,
    vs: null,
    names: null,
    xLabel: SERIES_X_NAME[kind],
    ...(xScale === 'log' ? { xScale } : {}),
    series,
    ...(inp.xs ? { xs: inp.xs } : {}),
    ...(inp.reportedMarks?.length ? { reportedMarks: inp.reportedMarks } : {}),
    shot: inp.shot,
  }
}

/** Every derived field from the inputs (shared by resolve and interpolate): the curve's points, sampled fresh. */
export function plotFrom(inp: PlotInputs): ResolvedPlot {
  if (inp.series) return seriesFrom(inp)
  const fn = inp.fn as PlotCurveName
  const evaluate = CURVE_FNS[fn]
  const n = Math.max(1, Math.round(inp.samples))
  const logX = inp.xScale === 'log'
  const points = Array.from({ length: n + 1 }, (_, k) => {
    const x = logX ? 10 ** (Math.log10(inp.range.from) + ((Math.log10(inp.range.to) - Math.log10(inp.range.from)) * k) / n) : inp.range.from + ((inp.range.to - inp.range.from) * k) / n
    return { x, y: evaluate(x) }
  })
  const second = inp.vs ? CURVE_FNS[inp.vs] : null
  const vsPoints = second ? points.map((p) => ({ x: p.x, y: second(p.x) })) : null
  const markers = inp.markers.map((m) => ({ x: m.x, y: evaluate(m.x), yVs: second ? second(m.x) : null, label: m.label }))
  const ys = [...points.map((p) => p.y), ...(vsPoints ?? []).map((p) => p.y), ...inp.yLines.map((l) => l.y), ...inp.bands.flatMap((b) => [b.yFrom, b.yTo])]
  const log = inp.yScale === 'log'
  // a log axis is padded in decades (the same 8 % of the span), a linear one in y
  const lo = log ? Math.log10(Math.min(...ys)) : Math.min(...ys)
  const hi = log ? Math.log10(Math.max(...ys)) : Math.max(...ys)
  const pad = Math.max(1e-6, (hi - lo) * 0.08)
  // a chance cannot go below 0 or above 1: a curve that is one is not padded past those ends (linear axis)
  const bounds = CURVE_BOUNDS[fn]
  const yMin = log ? 10 ** (lo - pad) : Math.max(bounds?.min ?? -Infinity, lo - pad)
  const yMax = log ? 10 ** (hi + pad) : Math.min(bounds?.max ?? Infinity, hi + pad)
  return {
    kind: 'plot',
    fn,
    range: inp.range,
    points,
    markers,
    bands: inp.bands,
    yLines: inp.yLines,
    yMin,
    yMax,
    yScale: inp.yScale,
    vs: inp.vs && vsPoints ? { fn: inp.vs, points: vsPoints } : null,
    names: inp.vs ? { fn: CURVE_NAME[fn], vs: CURVE_NAME[inp.vs] } : null,
    xLabel: CURVE_X[fn] ?? null,
    ...(CURVE_XDIGITS[fn] ? { xDigits: CURVE_XDIGITS[fn] } : {}),
    ...(logX ? { xScale: 'log' as const } : {}),
    ...(inp.reportedMarks?.length ? { reportedMarks: inp.reportedMarks } : {}),
    shot: inp.shot,
  }
}

function inputsAt(st: PlotState | PlotSeriesState): PlotInputs {
  const common = {
    markers: st.markers ?? [],
    reportedMarks: st.reportedMarks,
    bands: st.bands ?? [],
    yLines: st.yLines ?? [],
    yScale: st.yScale ?? 'linear',
    ...(st.xScale === 'log' ? { xScale: 'log' as const } : {}),
    shot: st.shot,
  }
  if (st.series) return { series: st.series, ...(st.xs ? { xs: st.xs } : {}), range: rangeOfSeries(st, SERIES_X[st.series[0].fn]), samples: st.samples ?? PLOT_LIMITS.samplesDefault, ...common }
  const c = st.curve as NonNullable<PlotState['curve']>
  return { fn: c.fn, vs: c.vs, range: c.x ?? DEFAULT_RANGE[c.fn], samples: c.samples ?? PLOT_LIMITS.samplesDefault, ...common }
}

/** Nothing in `PlotState` sweeps across a beat's hold (P-Q10-story §9.2: x/samples are plain numbers): s is unused. */
export function resolvePlotStage(st: PlotState | PlotSeriesState | PlotPointsState, _s: number): ResolvedPlot {
  if (isPointsState(st)) return pointsFrom(st)
  return plotFrom(inputsAt(st))
}

/* ------------------------------------------------ B2 points mode ------------------------------------------------ */
export const POINT_LIMITS = { points: 24, groups: 4, label: 24, yLines: 4 } as const
export const isPointsState = (st: PlotState | PlotSeriesState | PlotPointsState): st is PlotPointsState => (st as PlotPointsState).points !== undefined

/** A scatter: the points as given (the recipe took every x and y from the engine), with padded drawn ranges; the neutral fields of the older modes are filled so nothing else changes. */
export function pointsFrom(st: PlotPointsState): ResolvedPlot {
  const pts = st.points.map((p) => ({ x: p.x, y: p.y, label: p.label, status: p.status ?? ('computed' as const), group: p.group ?? '' }))
  const groups = [...new Set(pts.map((p) => p.group))]
  const xScale = st.xScale ?? 'linear'
  const yScale = st.yScale ?? 'linear'
  const yLines = st.yLines ?? []
  const span = (vals: number[], log: boolean): [number, number] => {
    const t = log ? vals.map((v) => Math.log10(v)) : vals
    const lo = Math.min(...t)
    const hi = Math.max(...t)
    const pad = Math.max(log ? 0.15 : 1e-9, (hi - lo) * 0.1)
    return log ? [10 ** (lo - pad), 10 ** (hi + pad)] : [lo - pad, hi + pad]
  }
  const [xMin, xMax] = span(pts.map((p) => p.x), xScale === 'log')
  const [yMin0, yMax] = span([...pts.map((p) => p.y), ...yLines.map((l) => l.y)], yScale === 'log')
  const yMin = yScale === 'linear' && pts.every((p) => p.y >= 0) && yLines.every((l) => l.y >= 0) ? Math.max(0, yMin0) : yMin0
  return {
    kind: 'plot',
    fn: null,
    range: { from: xMin, to: xMax },
    points: [],
    markers: [],
    bands: [],
    yLines,
    yMin,
    yMax,
    yScale,
    vs: null,
    names: null,
    xLabel: st.xLabel ?? null,
    series: null,
    pointSet: { points: pts, groups, xLabel: st.xLabel ?? '', yLabel: st.yLabel ?? '', xScale, yScale, xMin, xMax, yMin, yMax, yLines },
    shot: st.shot,
  }
}

export function pointsProblems(st: PlotPointsState): string[] {
  const errs: string[] = []
  if (st.curve !== undefined || st.series !== undefined) errs.push('plot points: not with curve or series')
  const pts = st.points
  if (!Array.isArray(pts) || pts.length < 1 || pts.length > POINT_LIMITS.points) return [...errs, `plot points: one to ${POINT_LIMITS.points} points`]
  const finite = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
  pts.forEach((p, i) => {
    if (!finite(p?.x) || !finite(p?.y)) errs.push(`plot points[${i}]: x and y must be finite numbers`)
    if (p?.label !== undefined && (typeof p.label !== 'string' || p.label.length > POINT_LIMITS.label)) errs.push(`plot points[${i}].label: at most ${POINT_LIMITS.label} characters`)
    if (p?.group !== undefined && (typeof p.group !== 'string' || p.group.length < 1 || p.group.length > POINT_LIMITS.label)) errs.push(`plot points[${i}].group: 1 to ${POINT_LIMITS.label} characters`)
    if (p?.status !== undefined && !['computed', 'reported', 'bound'].includes(p.status)) errs.push(`plot points[${i}].status: 'computed', 'reported' or 'bound'`)
  })
  for (const f of ['xScale', 'yScale'] as const) if (st[f] !== undefined && st[f] !== 'linear' && st[f] !== 'log') errs.push(`plot ${f}: 'linear' or 'log'`)
  for (const f of ['xLabel', 'yLabel'] as const) if (st[f] !== undefined && (typeof st[f] !== 'string' || (st[f] as string).length > POINT_LIMITS.label)) errs.push(`plot ${f}: at most ${POINT_LIMITS.label} characters`)
  if (st.xScale === 'log' && pts.some((p) => !(p?.x > 0))) errs.push('plot xScale: log needs every x above 0')
  if (st.yScale === 'log' && (pts.some((p) => !(p?.y > 0)) || (st.yLines ?? []).some((l) => !(l.y > 0)))) errs.push('plot yScale: log needs every y above 0')
  if (new Set(pts.map((p) => p?.group ?? '')).size > POINT_LIMITS.groups) errs.push(`plot points: at most ${POINT_LIMITS.groups} groups`)
  if ((st.yLines ?? []).length > POINT_LIMITS.yLines) errs.push(`plot yLines: at most ${POINT_LIMITS.yLines}`)
  ;(st.yLines ?? []).forEach((l, i) => {
    if (!finite(l?.y)) errs.push(`plot yLines[${i}]: y must be a finite number`)
    if (l?.label !== undefined && (typeof l.label !== 'string' || l.label.length > POINT_LIMITS.label)) errs.push(`plot yLines[${i}].label: at most ${POINT_LIMITS.label} characters`)
  })
  return errs
}

/* ------------------------------------------------ interpolation ------------------------------------------------ */
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const pick = <T>(a: T, b: T, t: number): T => (t < 0.5 ? a : b)

function inputsOf(r: ResolvedPlot): PlotInputs {
  return {
    ...(r.series ? { series: r.series.map((s) => ({ fn: s.fn, params: s.params, label: s.label })), ...(r.xs ? { xs: r.xs } : {}) } : { fn: r.fn as PlotCurveName, vs: r.vs?.fn }),
    range: r.range,
    samples: r.series && r.series[0].discrete ? PLOT_LIMITS.samplesDefault : r.points.length - 1,
    markers: r.markers.map((m) => ({ x: m.x, label: m.label })),
    reportedMarks: r.reportedMarks,
    bands: r.bands,
    yLines: r.yLines,
    yScale: r.yScale,
    ...(r.xScale === 'log' ? { xScale: 'log' as const } : {}),
    shot: r.shot,
  }
}

export function interpPlotStage(a: ResolvedPlot, b: ResolvedPlot, t: number): ResolvedPlot {
  if (t <= 0) return a
  if (t >= 1) return b
  // B2: a scatter is a different picture from a curve (and from another scatter): it switches at the half-way point
  if (a.pointSet || b.pointSet) return t < 0.5 ? a : b
  const A = inputsOf(a)
  const B = inputsOf(b)
  // a different curve, series list or sample count is a structural change (as a different Euler rate is in complex-plane): pick
  if (A.fn !== B.fn || A.vs !== B.vs || JSON.stringify(A.series) !== JSON.stringify(B.series) || JSON.stringify(A.xs) !== JSON.stringify(B.xs) || A.samples !== B.samples || A.yScale !== B.yScale || A.xScale !== B.xScale || JSON.stringify(A.reportedMarks) !== JSON.stringify(B.reportedMarks))
    return plotFrom(pick(A, B, t))
  const markers = A.markers.length === B.markers.length ? A.markers.map((m, i) => ({ x: lerp(m.x, B.markers[i].x, t), label: pick(m.label, B.markers[i].label, t) })) : pick(A.markers, B.markers, t)
  const bands =
    A.bands.length === B.bands.length
      ? A.bands.map((bd, i) => ({ yFrom: lerp(bd.yFrom, B.bands[i].yFrom, t), yTo: lerp(bd.yTo, B.bands[i].yTo, t), label: pick(bd.label, B.bands[i].label, t) }))
      : pick(A.bands, B.bands, t)
  const yLines = A.yLines.length === B.yLines.length ? A.yLines.map((l, i) => ({ y: lerp(l.y, B.yLines[i].y, t), label: pick(l.label, B.yLines[i].label, t) })) : pick(A.yLines, B.yLines, t)
  // a log axis lerps its range in the logarithm, so a half-way frame is half-way on the screen
  const range = A.xScale === 'log' ? { from: 10 ** lerp(Math.log10(A.range.from), Math.log10(B.range.from), t), to: 10 ** lerp(Math.log10(A.range.to), Math.log10(B.range.to), t) } : { from: lerp(A.range.from, B.range.from, t), to: lerp(A.range.to, B.range.to, t) }
  return plotFrom({
    fn: A.fn,
    vs: A.vs,
    series: A.series,
    xs: A.xs,
    range,
    samples: A.samples,
    markers,
    reportedMarks: A.reportedMarks,
    bands,
    yLines,
    yScale: A.yScale,
    xScale: A.xScale,
    shot: pick(A.shot, B.shot, t),
  })
}

/* ------------------------------------------------ validation ------------------------------------------------ */
const isOdd = (d: unknown): d is number => typeof d === 'number' && Number.isInteger(d) && d >= 1 && d % 2 === 1
const isChance = (p: unknown): p is number => typeof p === 'number' && p >= 0 && p <= 1

/** What each series function needs in `params`. */
const SERIES_NEEDS: { readonly [K in PlotSeries['fn']]: readonly ('d' | 'p' | 'preset' | 'q' | 'm')[] } = { cleanRun: ['p'], repLogicalVsD: ['p'], repLogicalVsP: ['d'], surfaceVsP: ['d', 'preset'], surfaceVsD: ['p', 'preset'], voteFail: ['q', 'm'] }

function seriesProblems(list: PlotSeries[], st: PlotSeriesState): string[] {
  const errs: string[] = []
  if (!Array.isArray(list) || list.length < 1 || list.length > PLOT_LIMITS.series) return [`plot series: one to ${PLOT_LIMITS.series} series`]
  list.forEach((s, i) => {
    const where = `plot series[${i}]`
    if (!s || !(PLOT_SERIES_FNS as readonly string[]).includes(s.fn)) return void errs.push(`${where}.fn: ${PLOT_SERIES_FNS.map((v) => `'${v}'`).join(', ')}`)
    const q = s.params ?? {}
    for (const key of Object.keys(q)) if (!['d', 'p', 'preset', 'vote', 'q', 'm'].includes(key)) errs.push(`${where}.params.${key}: unknown (d, p, preset, vote, q, m)`)
    const need = SERIES_NEEDS[s.fn]
    for (const key of need) if (q[key] === undefined) errs.push(`${where}.params.${key}: ${s.fn} needs it`)
    for (const key of ['d', 'p', 'preset', 'q', 'm'] as const) if (q[key] !== undefined && !need.includes(key)) errs.push(`${where}.params.${key}: ${s.fn} does not use it (it needs ${need.join(' and ')})`)
    if (q.d !== undefined && need.includes('d') && !(isOdd(q.d) && q.d <= 399)) errs.push(`${where}.params.d: an odd whole number up to 399`)
    if (q.p !== undefined && need.includes('p') && !isChance(q.p)) errs.push(`${where}.params.p: a chance from 0 to 1`)
    if (q.q !== undefined && need.includes('q') && !isChance(q.q)) errs.push(`${where}.params.q: a chance from 0 to 1`)
    if (q.m !== undefined && need.includes('m') && !(typeof q.m === 'number' && Number.isInteger(q.m) && q.m >= 1 && q.m <= PLOT_LIMITS.checksMax)) errs.push(`${where}.params.m: a whole number 1–${PLOT_LIMITS.checksMax} (checks)`)
    if (q.preset !== undefined && need.includes('preset') && !(PLOT_PRESETS as readonly string[]).includes(q.preset)) errs.push(`${where}.params.preset: ${PLOT_PRESETS.map((v) => `'${v}'`).join(', ')}`)
    if (q.vote !== undefined) {
      if (s.fn !== 'cleanRun') errs.push(`${where}.params.vote: only cleanRun uses it (every step protected by a majority vote of that many copies)`)
      else if (!isOdd(q.vote) || q.vote > 99) errs.push(`${where}.params.vote: an odd whole number up to 99`)
    }
    if (s.label !== undefined && (typeof s.label !== 'string' || s.label.length < 1 || s.label.length > PLOT_LIMITS.labelLen)) errs.push(`${where}.label: 1–${PLOT_LIMITS.labelLen} characters`)
  })
  if (errs.length) return errs
  const kinds = new Set(list.map((s) => SERIES_X[s.fn]))
  if (kinds.size > 1) errs.push(`plot series: every series shares one x axis, but these mix ${[...kinds].map((k) => `${SERIES_X_NAME[k]}`).join(' and ')}`)
  const kind = SERIES_X[list[0].fn]
  // the range the author asked for (an `xs` list sets the drawn range only once it is valid; its own limits are checked below)
  const range = st.xRange ?? defaultRange(kind)
  if (st.xRange) {
    if (!(Number.isFinite(st.xRange.from) && Number.isFinite(st.xRange.to))) errs.push('plot xRange: non-finite range')
    else if (!(st.xRange.from < st.xRange.to)) errs.push('plot xRange: from must be less than to')
  }
  if (st.samples !== undefined && (!Number.isInteger(st.samples) || st.samples < PLOT_LIMITS.samplesMin || st.samples > PLOT_LIMITS.samplesMax)) errs.push(`plot samples: a whole number ${PLOT_LIMITS.samplesMin}–${PLOT_LIMITS.samplesMax}`)
  if (errs.length) return errs
  if (kind === 'p' && !(range.from >= 0 && range.to <= 1)) errs.push('plot xRange: x is a chance p, so the range runs inside [0, 1]')
  if (kind === 'N' && !(range.from >= 1)) errs.push('plot xRange: x is the number of steps N, so the range starts at 1 or more')
  if (kind === 'd' && !(range.from >= 1 && range.to <= PLOT_LIMITS.dMax)) errs.push(`plot xRange: x is the distance d, so the range runs inside [1, ${PLOT_LIMITS.dMax}]`)
  if (kind === 'R' && !(range.from >= 1 && range.to <= PLOT_LIMITS.roundsMax)) errs.push(`plot xRange: x is the rounds R, so the range runs inside [1, ${PLOT_LIMITS.roundsMax}]`)
  if (errs.length) return errs
  if (isDiscreteX(kind) && seriesXs(kind, range, 1, 'linear').length < 2) errs.push(`plot xRange: a function of ${kind} is drawn at its odd whole values, so the range needs at least two of them`)
  if (st.xs !== undefined) {
    const top = kind === 'R' ? PLOT_LIMITS.roundsMax : PLOT_LIMITS.dMax
    const maxLen = kind === 'R' ? (PLOT_LIMITS.roundsMax + 1) / 2 : PLOT_LIMITS.xsMaxD
    if (!isDiscreteX(kind)) errs.push('plot xs: only a function of d or of the rounds R is drawn at chosen whole values')
    else if (!Array.isArray(st.xs) || st.xs.length < 2 || st.xs.length > maxLen || !st.xs.every((v) => isOdd(v) && v <= top) || !st.xs.every((v, i, a) => i === 0 || v > a[i - 1]))
      errs.push(`plot xs: ${maxLen === 6 ? 'two to six' : `two to ${maxLen}`} odd whole numbers from 1 to ${top}, increasing`)
    else if (st.xRange && (st.xs[0] < st.xRange.from - 1e-9 || st.xs[st.xs.length - 1] > st.xRange.to + 1e-9)) errs.push(`plot xs: every x lies inside xRange [${st.xRange.from}, ${st.xRange.to}]`)
  }
  return errs
}

export function validatePlotStage(st: PlotState | PlotSeriesState | PlotPointsState): string[] {
  if (isPointsState(st)) return pointsProblems(st)
  const errs: string[] = []
  const hasCurve = st.curve !== undefined
  const hasSeries = st.series !== undefined
  if (hasCurve && hasSeries) return ['plot: either curve or series, not both']
  if (!hasCurve && !hasSeries) return ['plot: a curve or a list of series']
  if (st.xScale !== undefined && st.xScale !== 'linear' && st.xScale !== 'log') errs.push(`plot xScale: 'linear' or 'log'`)
  if (st.series) {
    errs.push(...seriesProblems(st.series, st))
  } else {
    const curve = st.curve as NonNullable<PlotState['curve']>
    if ('xRange' in st && st.xRange !== undefined) errs.push('plot xRange: only series mode has it (a curve takes curve.x)')
    if ('xs' in st && st.xs !== undefined) errs.push('plot xs: only series mode has it')
    if (!(curve.fn in CURVE_FNS)) errs.push(`plot curve.fn: unknown curve "${curve.fn}" (the engine function has not landed)`)
    if (curve.vs !== undefined) {
      if (!(curve.vs in CURVE_FNS)) errs.push(`plot curve.vs: unknown curve "${curve.vs}"`)
      else if (curve.vs === curve.fn) errs.push('plot curve.vs: a different curve from curve.fn')
    }
    if (curve.x) {
      if (!(Number.isFinite(curve.x.from) && Number.isFinite(curve.x.to))) errs.push('plot curve.x: non-finite range')
      else if (!(curve.x.from < curve.x.to)) errs.push('plot curve.x: from must be less than to')
    }
    if (curve.samples !== undefined) {
      if (!Number.isInteger(curve.samples) || curve.samples < PLOT_LIMITS.samplesMin || curve.samples > PLOT_LIMITS.samplesMax) errs.push(`plot curve.samples: a whole number ${PLOT_LIMITS.samplesMin}–${PLOT_LIMITS.samplesMax}`)
    }
  }
  if ((st.markers?.length ?? 0) > PLOT_LIMITS.markers) errs.push(`plot markers: at most ${PLOT_LIMITS.markers}`)
  if ((st.reportedMarks?.length ?? 0) > PLOT_LIMITS.reportedMarks) errs.push(`plot reportedMarks: at most ${PLOT_LIMITS.reportedMarks}`)
  if ((st.bands?.length ?? 0) > PLOT_LIMITS.bands) errs.push(`plot bands: at most ${PLOT_LIMITS.bands}`)
  if ((st.yLines?.length ?? 0) > PLOT_LIMITS.yLines) errs.push(`plot yLines: at most ${PLOT_LIMITS.yLines}`)
  if (st.yScale !== undefined && st.yScale !== 'linear' && st.yScale !== 'log') errs.push(`plot yScale: 'linear' or 'log'`)
  for (const [i, m] of (st.reportedMarks ?? []).entries()) {
    if (!(Number.isFinite(m?.x) && typeof m.label === 'string' && m.label.length >= 1 && m.label.length <= 40 && typeof m.source === 'string' && m.source.length >= 1)) errs.push(`plot reportedMarks[${i}]: { x, label (1–40 characters), source }`)
  }
  if (errs.length) return errs
  const range = st.series ? rangeOfSeries(st, SERIES_X[st.series[0].fn]) : ((st.curve as NonNullable<PlotState['curve']>).x ?? DEFAULT_RANGE[(st.curve as NonNullable<PlotState['curve']>).fn])
  if (st.xScale === 'log' && !(range.from > 0 && range.to > 0)) errs.push('plot xScale: log needs a range above 0')
  if (st.series && isDiscreteX(SERIES_X[st.series[0].fn]) && st.xScale === 'log') errs.push(`plot xScale: a function of ${SERIES_X[st.series[0].fn]} is drawn at odd whole values; use a linear x axis`)
  if (errs.length) return errs
  const fnNames = st.series ? [] : [(st.curve as NonNullable<PlotState['curve']>).fn, ...((st.curve as NonNullable<PlotState['curve']>).vs ? [(st.curve as NonNullable<PlotState['curve']>).vs as PlotCurveName] : [])]
  for (const fnName of fnNames) if (CHANCE_X.has(fnName) && !(range.from >= 0 && range.to <= 1)) errs.push(`plot curve.x: ${fnName} is a function of a chance p, so x runs inside [0, 1]`)
  if (errs.length) return errs
  if (st.yScale === 'log') {
    // a log axis cannot show zero or a negative value: every sample of the curve, every line and every band edge must be > 0
    if (st.series) {
      const xs = st.xs ?? seriesXs(SERIES_X[st.series[0].fn], range, 8, st.xScale ?? 'linear')
      for (const s of st.series) for (const x of xs) if (!(seriesValue(s, x) > 0)) return [...errs, 'plot yScale: log needs a series that stays above 0']
    } else
      for (const fnName of fnNames) {
        const evaluate = CURVE_FNS[fnName]
        for (const k of [0, 0.25, 0.5, 0.75, 1]) if (!(evaluate(range.from + (range.to - range.from) * k) > 0)) errs.push('plot yScale: log needs a curve that stays above 0')
      }
    for (const l of st.yLines ?? []) if (!(l.y > 0)) errs.push('plot yScale: log needs yLines above 0')
    for (const b of st.bands ?? []) if (!(b.yFrom > 0 && b.yTo > 0)) errs.push('plot yScale: log needs bands above 0')
  }
  for (const m of st.markers ?? []) {
    if (!(m.x >= range.from - 1e-9 && m.x <= range.to + 1e-9)) errs.push(`plot markers: x = ${m.x} is outside the drawn range [${range.from}, ${range.to}]`)
    else if (st.series && isDiscreteX(SERIES_X[st.series[0].fn]) && !isOdd(m.x)) errs.push(SERIES_X[st.series[0].fn] === 'd' ? `plot markers: x = ${m.x}; a function of d is marked at an odd whole d` : `plot markers: x = ${m.x}; a function of R is marked at an odd whole R`)
  }
  for (const m of st.reportedMarks ?? []) if (!(m.x >= range.from - 1e-9 && m.x <= range.to + 1e-9)) errs.push(`plot reportedMarks: x = ${m.x} is outside the drawn range [${range.from}, ${range.to}]`)
  for (const b of st.bands ?? []) if (!Number.isFinite(b.yFrom) || !Number.isFinite(b.yTo)) errs.push('plot bands: non-finite y')
  for (const l of st.yLines ?? []) if (!Number.isFinite(l.y)) errs.push('plot yLines: non-finite y')
  return errs
}

/* ------------------------------------------------ readouts ------------------------------------------------ */
/** A y value for text: three decimals from 0.1 up (as before), four down to 0.001, scientific below (3.2 × 10⁻¹³). */
export const yText = (y: number): string => (Math.abs(y) >= 1e7 ? sci(y) : Math.abs(y) >= 0.1 || y === 0 ? fix(y) : Math.abs(y) >= 0.001 ? y.toFixed(4) : sci(y))
/** An x value for text in series mode: whole numbers plainly, small chances in scientific form. */
export const xText = (x: number): string => (Number.isInteger(x) ? String(x) : Math.abs(x) >= 0.01 ? fix(x, 3) : sci(x, 1))

export function plotReadouts(r: ResolvedPlot): SvgReadout[] {
  const out: SvgReadout[] = []
  if (r.pointSet) {
    const P = r.pointSet
    out.push({ name: 'points', text: `${P.points.length} point${P.points.length === 1 ? '' : 's'}${P.groups.filter(Boolean).length > 1 ? ` in ${P.groups.length} groups` : ''}` })
    const reported = P.points.filter((p) => p.status !== 'computed').length
    if (reported) out.push({ name: 'printed', text: `${reported} as printed (hollow)`, tone: 'silver' })
    return out
  }
  if (r.series) {
    out.push({ name: 'range', text: `${r.xLabel} from ${xText(r.series[0].points[0].x)} to ${xText(r.series[0].points[r.series[0].points.length - 1].x)}` })
    r.series.forEach((s, i) => {
      const a = s.points[0]
      const b = s.points[s.points.length - 1]
      out.push({ name: `series-${i}`, text: `${s.label}: ${yText(a.y)} → ${yText(b.y)}` })
    })
    r.markers.forEach((m, i) => out.push({ name: `marker-${i}`, text: `${m.label ?? `${r.xLabel} = ${xText(m.x)}`}: ${r.series![0].label} = ${yText(m.y)}` }))
    ;(r.reportedMarks ?? []).forEach((m, i) => out.push({ name: `printed-${i}`, text: `as printed: ${m.label}`, tone: 'silver' }))
    return out
  }
  const last = r.points[r.points.length - 1]
  const xd = r.xDigits ?? 0
  out.push({ name: 'range', text: `${r.xLabel ?? 'x'} ∈ [${fix(r.range.from, xd)}, ${fix(r.range.to, xd)}]` })
  if (r.vs && r.names) {
    // two curves: each is named at its end and at every marker, so a reader never has to guess which value is which
    const lastVs = r.vs.points[r.vs.points.length - 1]
    out.push({ name: 'end', text: `${r.names.fn}(${fix(last.x, xd)}) = ${yText(last.y)}` })
    out.push({ name: 'end-vs', text: `${r.names.vs}(${fix(lastVs.x, xd)}) = ${yText(lastVs.y)}`, tone: 'op' })
    r.markers.forEach((m, i) => out.push({ name: `marker-${i}`, text: `${m.label ?? `${r.xLabel ?? 'x'} = ${fix(m.x, xd)}`}: ${r.names!.fn} = ${yText(m.y)}, ${r.names!.vs} = ${yText(m.yVs ?? NaN)}` }))
    return out
  }
  out.push({ name: 'end', text: `y(${fix(last.x, xd)}) = ${yText(last.y)}` })
  r.markers.forEach((m, i) => out.push({ name: `marker-${i}`, text: `${m.label ?? 'marker'}: y(${fix(m.x, xd)}) = ${yText(m.y)}` }))
  ;(r.reportedMarks ?? []).forEach((m, i) => out.push({ name: `printed-${i}`, text: `as printed: ${m.label}`, tone: 'silver' }))
  return out
}
