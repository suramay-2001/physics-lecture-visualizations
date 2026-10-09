/**
 * `clocks` (SVG; W-448 L11): the two phase clocks of a two-level system, beside an energy ladder. A state with two energies is
 * a superposition of two energy eigenstates; each component's amplitude is a clock hand that turns clockwise at E/ħ, and the
 * angle between the two hands is the relative phase, which is the state's Bloch azimuth. Content writes only INPUTS (the two
 * levels in units of ε, the starting state, the elapsed time εt/ħ in degrees, which panels to draw, which readouts); this
 * resolver draws every hand angle, hand length, gap and chance from the one engine (physics/dynamics.ts), shared with the
 * `two-clocks` widget, so the Try-it and the story cannot disagree. Ē and ħω are derived, never authored.
 * Interpolation follows stage/interp.ts: the levels, the time and the start state lerp (a hand that turns 540° turns 540°; the
 * unwrapped angle is what is drawn), everything else switches at the half-way point; every output is recomputed from the
 * interpolated inputs. Lazy chunk (stage/svg/kinds.ts).
 */
import type { ClocksState, Scrub } from '../../content/stage'
import { CLOCKS_PANELS, CLOCKS_READOUTS } from '../../content/stage'
import { clockHands, precession, twoLevelH } from '../../physics/dynamics'
import { KET, ketFromBloch } from '../../physics/spin'
import { DEG, dirAngles, scrub } from '../resolve'
import type { SvgReadout } from '../svgKinds'
import type { ClocksInputs, ResolvedClocks } from '../types'
import { fix } from './draw'

/** Validation limits: the levels stay small exact numbers on a ladder that fits the stage. */
export const CLOCKS_LIMITS = { energyMax: 12, gapMin: 0.25, timeMax: 3600 } as const

const NAMED = Object.keys(KET)

/** The inputs a state asks for, sweeps resolved at hold progress s. */
export function clocksInputs(st: ClocksState, s: number): ClocksInputs {
  const a = dirAngles(st.start ?? '+x', s)
  return {
    upper: st.levels.upper,
    lower: st.levels.lower,
    thetaDeg: a.theta / DEG,
    phiDeg: a.phi / DEG,
    timeDeg: scrub(st.timeDeg, s),
    show: [...(st.show ?? CLOCKS_PANELS)],
    readouts: [...(st.readouts ?? [])],
    shot: st.shot,
  }
}

/** Every derived field from the inputs (shared by resolve and interpolate). */
export function clocksFrom(inp: ClocksInputs): ResolvedClocks {
  const tl = twoLevelH(inp.upper, inp.lower)
  const start = ketFromBloch(inp.thetaDeg * DEG, inp.phiDeg * DEG)
  const levels = { upper: inp.upper, lower: inp.lower }
  const t = inp.timeDeg * DEG
  const h = clockHands(levels, start, t)
  const p = precession(levels, t, start)
  const startHands = clockHands(levels, start, 0)
  return {
    kind: 'clocks',
    levels,
    mean: tl.mean,
    hbarOmega: tl.hbarOmega,
    timeDeg: inp.timeDeg,
    start: { thetaDeg: inp.thetaDeg, phiDeg: inp.phiDeg },
    hands: { turned: h.turned, angleDeg: [h.angle[0] / DEG, h.angle[1] / DEG], length: h.length },
    startAngle: startHands.turned,
    gapDeg: h.gap === null ? null : h.gap / DEG,
    px: p.pPlusX,
    sx: p.sx,
    bloch: p.bloch,
    show: inp.show,
    readouts: inp.readouts,
    inputs: inp,
    shot: inp.shot,
  }
}

export function resolveClocksStage(st: ClocksState, s: number): ResolvedClocks {
  return clocksFrom(clocksInputs(st, s))
}

/* ------------------------------------------------ interpolation ------------------------------------------------ */
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const pick = <T>(a: T, b: T, t: number): T => (t < 0.5 ? a : b)

export function interpClocksStage(a: ResolvedClocks, b: ResolvedClocks, t: number): ResolvedClocks {
  if (t <= 0) return a
  if (t >= 1) return b
  const A = a.inputs
  const B = b.inputs
  const d = pick(A, B, t)
  return clocksFrom({
    ...d,
    upper: lerp(A.upper, B.upper, t),
    lower: lerp(A.lower, B.lower, t),
    thetaDeg: lerp(A.thetaDeg, B.thetaDeg, t),
    phiDeg: lerp(A.phiDeg, B.phiDeg, t),
    timeDeg: lerp(A.timeDeg, B.timeDeg, t),
  })
}

/* ------------------------------------------------ validation ------------------------------------------------ */
const scrubFinite = (v: Scrub): boolean => (typeof v === 'number' ? Number.isFinite(v) : Number.isFinite(v.from) && Number.isFinite(v.to))
const scrubEnds = (v: Scrub): number[] => (typeof v === 'number' ? [v] : [v.from, v.to])

export function validateClocksStage(st: ClocksState): string[] {
  const errs: string[] = []
  const { upper, lower } = st.levels ?? ({} as ClocksState['levels'])
  if (!Number.isFinite(upper) || !Number.isFinite(lower)) errs.push('clocks levels: upper and lower must be finite numbers (units of ε)')
  else {
    if (lower < 0) errs.push('clocks levels: lower is at least 0 (the ladder starts at the zero of energy)')
    if (upper > CLOCKS_LIMITS.energyMax) errs.push(`clocks levels: upper is at most ${CLOCKS_LIMITS.energyMax} ε`)
    if (!(upper - lower >= CLOCKS_LIMITS.gapMin)) errs.push(`clocks levels: upper must exceed lower by at least ${CLOCKS_LIMITS.gapMin} ε (the splitting ħω = E₊ − E₋)`)
  }
  if (!scrubFinite(st.timeDeg)) errs.push('clocks timeDeg: non-finite')
  else for (const x of scrubEnds(st.timeDeg)) if (Math.abs(x) > CLOCKS_LIMITS.timeMax) errs.push(`clocks timeDeg: at most ±${CLOCKS_LIMITS.timeMax}° (got ${x})`)
  const s = st.start
  if (s !== undefined) {
    if (typeof s === 'string') {
      if (!NAMED.includes(s)) errs.push(`clocks start: unknown ket "${s}"`)
    } else if (!scrubFinite(s.thetaDeg) || !scrubFinite(s.phiDeg)) errs.push('clocks start: non-finite angle')
    else for (const x of scrubEnds(s.thetaDeg)) if (x < 0 || x > 180) errs.push('clocks start: the polar angle θ is between 0° and 180°')
  }
  if (st.show) {
    if (!st.show.length || new Set(st.show).size !== st.show.length || !st.show.every((p) => (CLOCKS_PANELS as readonly string[]).includes(p)))
      errs.push(`clocks show: a non-empty list of ${CLOCKS_PANELS.map((p) => `'${p}'`).join(', ')}, each once`)
  }
  for (const r of st.readouts ?? []) if (!(CLOCKS_READOUTS as readonly string[]).includes(r)) errs.push(`clocks readouts: unknown "${r}"`)
  if (new Set(st.readouts ?? []).size !== (st.readouts ?? []).length) errs.push('clocks readouts: each once')
  return errs
}

/* ------------------------------------------------ readouts ------------------------------------------------ */
/** An angle in degrees, whole, with the typographic minus. */
const deg0 = (x: number): string => `${fix(x, 0)}°`
/** An angle in [0°, 360°) rounded to whole degrees (359.7° reads 0°, not 360°). */
const gap0 = (x: number): string => `${Math.round(x) % 360}°`

export function clocksReadouts(r: ResolvedClocks): SvgReadout[] {
  // short lines: the readout column is about 160 px wide beside the passport
  const out: SvgReadout[] = [{ name: 'time', text: `εt/ħ = ${deg0(r.timeDeg)}` }]
  const both = Math.min(...r.hands.length) > 1e-9
  if (r.readouts.includes('phases'))
    out.push({ name: 'phases', text: both ? `hands ${deg0(r.hands.angleDeg[0])}, ${deg0(r.hands.angleDeg[1])}` : `hand ${deg0(r.hands.length[0] > r.hands.length[1] ? r.hands.angleDeg[0] : r.hands.angleDeg[1])}` })
  if (r.readouts.includes('gap')) out.push({ name: 'gap', text: r.gapDeg === null ? 'gap: one clock only' : `gap = ${gap0(r.gapDeg)}` })
  if (r.readouts.includes('px')) out.push({ name: 'px', text: `P(+x) = ${fix(r.px, 3)}` })
  return out
}
