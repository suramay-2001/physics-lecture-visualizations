/**
 * `plot` (709; SVG; P-Q10-story §9.2): a labelled 2-D curve for a derivation that sweeps a parameter. Content writes
 * only a NAMED engine curve and the range/samples to draw it at — never a point: this resolver samples the curve by
 * calling physics/qc/entangle.ts (`chshCurve`, `lhvChsh`), so the curve and every marker are the engine's own numbers.
 * Interpolation follows stage/interp.ts: the inputs (range, samples, markers, bands, yLines) lerp when the two sides
 * share the same curve and sample count, recomputing the curve; a different curve or sample count hard-switches.
 * Lazy chunk (stage/svg/kinds.ts).
 */
import type { C } from '../../physics/complex'
import { c } from '../../physics/complex'
import type { Vec } from '../../physics/linalg'
import { missCurve } from '../../physics/bb84'
import { chshCurve, lhvChsh, type Dir } from '../../physics/qc/entangle'
import type { PlotCurveName, PlotState } from '../../content/stage'
import type { SvgReadout } from '../svgKinds'
import type { ResolvedPlot } from '../types'
import { fix, sci } from './draw'

/** Validation limits (P-Q10-story §9.2). */
export const PLOT_LIMITS = { samplesMin: 2, samplesMax: 256, samplesDefault: 64, markers: 8, bands: 4, yLines: 4 } as const

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
}
/** Each curve's own default range (degrees) when a beat does not write `curve.x`. */
const DEFAULT_RANGE: { readonly [K in PlotCurveName]: { from: number; to: number } } = {
  chshVsPhase: { from: 0, to: 90 },
  chshClassicalBound: { from: 0, to: 90 },
  bb84Miss: { from: 0, to: 40 },
}

/** Curves whose y is a chance: the axis is never padded below 0 or above 1 (W-448 L8-B). */
const CURVE_BOUNDS: { readonly [K in PlotCurveName]?: { min: number; max: number } } = { bb84Miss: { min: 0, max: 1 } }

export interface PlotInputs {
  fn: PlotCurveName
  range: { from: number; to: number }
  samples: number
  markers: { x: number; label?: string }[]
  bands: { yFrom: number; yTo: number; label?: string }[]
  yLines: { y: number; label?: string }[]
  yScale: 'linear' | 'log'
  shot?: PlotState['shot']
}

/** Every derived field from the inputs (shared by resolve and interpolate): the curve's points, sampled fresh. */
export function plotFrom(inp: PlotInputs): ResolvedPlot {
  const evaluate = CURVE_FNS[inp.fn]
  const n = Math.max(1, Math.round(inp.samples))
  const points = Array.from({ length: n + 1 }, (_, k) => {
    const x = inp.range.from + ((inp.range.to - inp.range.from) * k) / n
    return { x, y: evaluate(x) }
  })
  const markers = inp.markers.map((m) => ({ x: m.x, y: evaluate(m.x), label: m.label }))
  const ys = [...points.map((p) => p.y), ...inp.yLines.map((l) => l.y), ...inp.bands.flatMap((b) => [b.yFrom, b.yTo])]
  const log = inp.yScale === 'log'
  // a log axis is padded in decades (the same 8 % of the span), a linear one in y
  const lo = log ? Math.log10(Math.min(...ys)) : Math.min(...ys)
  const hi = log ? Math.log10(Math.max(...ys)) : Math.max(...ys)
  const pad = Math.max(1e-6, (hi - lo) * 0.08)
  // a chance cannot go below 0 or above 1: a curve that is one is not padded past those ends (linear axis)
  const bounds = CURVE_BOUNDS[inp.fn]
  const yMin = log ? 10 ** (lo - pad) : Math.max(bounds?.min ?? -Infinity, lo - pad)
  const yMax = log ? 10 ** (hi + pad) : Math.min(bounds?.max ?? Infinity, hi + pad)
  return {
    kind: 'plot',
    fn: inp.fn,
    range: inp.range,
    points,
    markers,
    bands: inp.bands,
    yLines: inp.yLines,
    yMin,
    yMax,
    yScale: inp.yScale,
    shot: inp.shot,
  }
}

function inputsAt(st: PlotState): PlotInputs {
  return {
    fn: st.curve.fn,
    range: st.curve.x ?? DEFAULT_RANGE[st.curve.fn],
    samples: st.curve.samples ?? PLOT_LIMITS.samplesDefault,
    markers: st.markers ?? [],
    bands: st.bands ?? [],
    yLines: st.yLines ?? [],
    yScale: st.yScale ?? 'linear',
    shot: st.shot,
  }
}

/** Nothing in `PlotState` sweeps across a beat's hold (P-Q10-story §9.2: x/samples are plain numbers): s is unused. */
export function resolvePlotStage(st: PlotState, _s: number): ResolvedPlot {
  return plotFrom(inputsAt(st))
}

/* ------------------------------------------------ interpolation ------------------------------------------------ */
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const pick = <T>(a: T, b: T, t: number): T => (t < 0.5 ? a : b)

function inputsOf(r: ResolvedPlot): PlotInputs {
  return {
    fn: r.fn,
    range: r.range,
    samples: r.points.length - 1,
    markers: r.markers.map((m) => ({ x: m.x, label: m.label })),
    bands: r.bands,
    yLines: r.yLines,
    yScale: r.yScale,
    shot: r.shot,
  }
}

export function interpPlotStage(a: ResolvedPlot, b: ResolvedPlot, t: number): ResolvedPlot {
  if (t <= 0) return a
  if (t >= 1) return b
  const A = inputsOf(a)
  const B = inputsOf(b)
  // a different curve or sample count is a structural change (as a different Euler rate is in complex-plane): pick
  if (A.fn !== B.fn || A.samples !== B.samples || A.yScale !== B.yScale) return plotFrom(pick(A, B, t))
  const markers = A.markers.length === B.markers.length ? A.markers.map((m, i) => ({ x: lerp(m.x, B.markers[i].x, t), label: pick(m.label, B.markers[i].label, t) })) : pick(A.markers, B.markers, t)
  const bands =
    A.bands.length === B.bands.length
      ? A.bands.map((bd, i) => ({ yFrom: lerp(bd.yFrom, B.bands[i].yFrom, t), yTo: lerp(bd.yTo, B.bands[i].yTo, t), label: pick(bd.label, B.bands[i].label, t) }))
      : pick(A.bands, B.bands, t)
  const yLines = A.yLines.length === B.yLines.length ? A.yLines.map((l, i) => ({ y: lerp(l.y, B.yLines[i].y, t), label: pick(l.label, B.yLines[i].label, t) })) : pick(A.yLines, B.yLines, t)
  return plotFrom({
    fn: A.fn,
    range: { from: lerp(A.range.from, B.range.from, t), to: lerp(A.range.to, B.range.to, t) },
    samples: A.samples,
    markers,
    bands,
    yLines,
    yScale: A.yScale,
    shot: pick(A.shot, B.shot, t),
  })
}

/* ------------------------------------------------ validation ------------------------------------------------ */
export function validatePlotStage(st: PlotState): string[] {
  const errs: string[] = []
  if (!(st.curve.fn in CURVE_FNS)) errs.push(`plot curve.fn: unknown curve "${st.curve.fn}" (the engine function has not landed)`)
  if (st.curve.x) {
    if (!(Number.isFinite(st.curve.x.from) && Number.isFinite(st.curve.x.to))) errs.push('plot curve.x: non-finite range')
    else if (!(st.curve.x.from < st.curve.x.to)) errs.push('plot curve.x: from must be less than to')
  }
  if (st.curve.samples !== undefined) {
    if (!Number.isInteger(st.curve.samples) || st.curve.samples < PLOT_LIMITS.samplesMin || st.curve.samples > PLOT_LIMITS.samplesMax)
      errs.push(`plot curve.samples: a whole number ${PLOT_LIMITS.samplesMin}–${PLOT_LIMITS.samplesMax}`)
  }
  if ((st.markers?.length ?? 0) > PLOT_LIMITS.markers) errs.push(`plot markers: at most ${PLOT_LIMITS.markers}`)
  if ((st.bands?.length ?? 0) > PLOT_LIMITS.bands) errs.push(`plot bands: at most ${PLOT_LIMITS.bands}`)
  if ((st.yLines?.length ?? 0) > PLOT_LIMITS.yLines) errs.push(`plot yLines: at most ${PLOT_LIMITS.yLines}`)
  if (st.yScale !== undefined && st.yScale !== 'linear' && st.yScale !== 'log') errs.push(`plot yScale: 'linear' or 'log'`)
  if (errs.length) return errs
  const range = st.curve.x ?? DEFAULT_RANGE[st.curve.fn]
  if (st.yScale === 'log') {
    // a log axis cannot show zero or a negative value: every sample of the curve, every line and every band edge must be > 0
    const evaluate = CURVE_FNS[st.curve.fn]
    for (const k of [0, 0.25, 0.5, 0.75, 1]) if (!(evaluate(range.from + (range.to - range.from) * k) > 0)) errs.push('plot yScale: log needs a curve that stays above 0')
    for (const l of st.yLines ?? []) if (!(l.y > 0)) errs.push('plot yScale: log needs yLines above 0')
    for (const b of st.bands ?? []) if (!(b.yFrom > 0 && b.yTo > 0)) errs.push('plot yScale: log needs bands above 0')
  }
  for (const m of st.markers ?? []) if (!(m.x >= range.from - 1e-9 && m.x <= range.to + 1e-9)) errs.push(`plot markers: x = ${m.x} is outside the drawn range [${range.from}, ${range.to}]`)
  for (const b of st.bands ?? []) if (!Number.isFinite(b.yFrom) || !Number.isFinite(b.yTo)) errs.push('plot bands: non-finite y')
  for (const l of st.yLines ?? []) if (!Number.isFinite(l.y)) errs.push('plot yLines: non-finite y')
  return errs
}

/* ------------------------------------------------ readouts ------------------------------------------------ */
/** A y value for text: three decimals from 0.1 up (as before), four down to 0.001, scientific below (3.2 × 10⁻¹³). */
export const yText = (y: number): string => (Math.abs(y) >= 0.1 || y === 0 ? fix(y) : Math.abs(y) >= 0.001 ? y.toFixed(4) : sci(y))
export function plotReadouts(r: ResolvedPlot): SvgReadout[] {
  const out: SvgReadout[] = []
  const last = r.points[r.points.length - 1]
  out.push({ name: 'range', text: `x ∈ [${fix(r.range.from, 0)}, ${fix(r.range.to, 0)}]` })
  out.push({ name: 'end', text: `y(${fix(last.x, 0)}) = ${yText(last.y)}` })
  r.markers.forEach((m, i) => out.push({ name: `marker-${i}`, text: `${m.label ?? 'marker'}: y(${fix(m.x, 0)}) = ${yText(m.y)}` }))
  return out
}
