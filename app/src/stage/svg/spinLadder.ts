/**
 * `spin-ladder` (SVG; Townsend pass G2b, Lecture 7): the m ladder of spin j. 2j + 1 levels from m = +j down to -j, optionally with the chances of
 * a state |j, m>_n on the z ladder (Townsend Fig. 3.10), the raising or lowering arrow with its square-root weight (Eq. 3.59), the labelled matrix of
 * J_x, J_y, J_z, J+, J- or J^2 beside the ladder (Eqs. 3.28-3.36), and the length |J| against the top projection j (Fig. 3.4). Content writes only
 * INPUTS (the spin, the state, the arrow, the operator, the readouts); this resolver takes every level, chance, coefficient, entry and length from
 * physics/angmom.ts, so the picture cannot disagree with the engine. The ladder is discrete: nothing sweeps. A change of j switches at the half-way
 * point; a change of state on the same ladder slides the bars. Lazy chunk (stage/svg/kinds.ts); fidelity `spin-ladder-*`.
 */
import { SPIN_LADDER_MATRICES, SPIN_LADDER_READOUTS, type SpinLadderState } from '../../content/stage'
import { J_VALUES, type AxisSpec, coneAngle, jLength, jMatrices, ladderCoeff, mLevels, zChances } from '../../physics/angmom'
import type { SvgReadout } from '../svgKinds'
import type { ResolvedSpinLadder, SpinLadderInputs } from '../types'
import { fix } from './draw'

const DEG = Math.PI / 180
export const SPIN_LADDER_LIMITS = { readouts: 3 } as const

const NAMED_AXES = ['x', 'y', 'z']
const isAxis = (a: unknown): a is AxisSpec =>
  typeof a === 'string' ? NAMED_AXES.includes(a) : typeof a === 'object' && a !== null && Number.isFinite((a as { thetaDeg: number }).thetaDeg) && Number.isFinite((a as { phiDeg: number }).phiDeg)

export function spinLadderInputs(st: SpinLadderState): SpinLadderInputs {
  return {
    j: st.j,
    ket: st.ket ? { axis: st.ket.axis, m: st.ket.m } : null,
    apply: st.apply ?? null,
    matrix: st.matrix ?? null,
    readouts: [...(st.readouts ?? [])],
    shot: st.shot,
  }
}

/** Every derived field from the inputs (shared by resolve and interpolate). */
export function spinLadderFrom(inp: SpinLadderInputs): ResolvedSpinLadder {
  const j = inp.j
  const levels = mLevels(j)
  const mats = jMatrices(j)
  const ket = inp.ket ? { axis: inp.ket.axis, m: inp.ket.m, chances: zChances(j, inp.ket.axis, inp.ket.m) } : null
  let apply: ResolvedSpinLadder['apply'] = null
  if (inp.apply && inp.ket) {
    const dir = inp.apply === 'J+' ? '+' : '-'
    const m = inp.ket.m
    const coeff = ladderCoeff(j, m, dir)
    const to = coeff < 1e-12 ? null : m + (dir === '+' ? 1 : -1)
    apply = { dir, from: m, to, coeff }
  }
  const pick = { Jx: mats.Jx, Jy: mats.Jy, Jz: mats.Jz, 'J+': mats.Jp, 'J-': mats.Jm, J2: mats.J2 }
  return {
    kind: 'spin-ladder',
    j,
    levels,
    length: jLength(j),
    coneDeg: levels.map((m) => coneAngle(j, m) / DEG),
    ket,
    apply,
    matrix: inp.matrix ? { name: inp.matrix, entries: pick[inp.matrix].map((row) => row.map((z) => ({ re: Math.abs(z.re) < 1e-12 ? 0 : z.re, im: Math.abs(z.im) < 1e-12 ? 0 : z.im }))) } : null,
    readouts: inp.readouts,
    inputs: inp,
    shot: inp.shot,
  }
}

export const resolveSpinLadderStage = (st: SpinLadderState): ResolvedSpinLadder => spinLadderFrom(spinLadderInputs(st))

/* ------------------------------------------------ interpolation ------------------------------------------------ */
const pick = <T>(a: T, b: T, t: number): T => (t < 0.5 ? a : b)

export function interpSpinLadderStage(a: ResolvedSpinLadder, b: ResolvedSpinLadder, t: number): ResolvedSpinLadder {
  if (t <= 0) return a
  if (t >= 1) return b
  const same = a.j === b.j && a.ket !== null && b.ket !== null && a.apply === null && b.apply === null
  if (!same) return pick(a, b, t)
  // the same ladder with a state on it before and after: the bars slide
  const out = spinLadderFrom(pick(a.inputs, b.inputs, t))
  if (out.ket) out.ket = { ...out.ket, chances: a.ket!.chances.map((x, i) => x + (b.ket!.chances[i] - x) * t) }
  return out
}

/* ------------------------------------------------ validation ------------------------------------------------ */
export function validateSpinLadderStage(st: SpinLadderState): string[] {
  const errs: string[] = []
  if (!(J_VALUES as readonly number[]).includes(st.j)) errs.push(`spin-ladder j: one of ${J_VALUES.join(', ')} (got ${String(st.j)})`)
  else {
    if (st.ket !== undefined) {
      if (!isAxis(st.ket.axis)) errs.push("spin-ladder ket.axis: 'x', 'y', 'z' or {thetaDeg, phiDeg}")
      else if (typeof st.ket.axis === 'object' && (st.ket.axis.thetaDeg < 0 || st.ket.axis.thetaDeg > 180)) errs.push('spin-ladder ket.axis: the polar angle thetaDeg is between 0 and 180')
      if (!mLevels(st.j).some((m) => Math.abs(m - st.ket!.m) < 1e-9)) errs.push(`spin-ladder ket.m: one of the levels ${mLevels(st.j).join(', ')} of j = ${st.j} (got ${String(st.ket.m)})`)
    }
    if (st.apply !== undefined) {
      if (st.apply !== 'J+' && st.apply !== 'J-') errs.push("spin-ladder apply: 'J+' or 'J-'")
      else if (st.ket === undefined || st.ket.axis !== 'z') errs.push("spin-ladder apply: needs a ket along axis 'z' (the arrow steps a level of the z ladder)")
    }
  }
  if (st.matrix !== undefined && !(SPIN_LADDER_MATRICES as readonly string[]).includes(st.matrix)) errs.push(`spin-ladder matrix: one of ${SPIN_LADDER_MATRICES.join(', ')}`)
  const ro = st.readouts ?? []
  for (const r of ro) if (!(SPIN_LADDER_READOUTS as readonly string[]).includes(r)) errs.push(`spin-ladder readouts: unknown "${r}"`)
  if (new Set(ro).size !== ro.length) errs.push('spin-ladder readouts: each once')
  if (ro.length > SPIN_LADDER_LIMITS.readouts) errs.push(`spin-ladder readouts: at most ${SPIN_LADDER_LIMITS.readouts}`)
  if (ro.includes('chances') && st.ket === undefined) errs.push("spin-ladder readouts: 'chances' needs a ket")
  return errs
}

/* ------------------------------------------------ text helpers ------------------------------------------------ */
/** A level as written on the ladder: +3/2, +1/2, 0, −1/2. */
export function mText(m: number): string {
  if (Math.abs(m) < 1e-9) return '0'
  const a = Math.abs(m)
  const body = Math.abs(a - Math.round(a)) < 1e-9 ? String(Math.round(a)) : `${Math.round(2 * a)}/2`
  return `${m < 0 ? '−' : '+'}${body}`
}

/** A non-negative real in its exact small form (3/4, √2, √3/2, √2/2), else three decimals. */
export function exactText(x: number): string {
  const a = Math.abs(x)
  const sgn = x < 0 ? '−' : ''
  if (a < 1e-12) return '0'
  const near = (u: number, v: number) => Math.abs(u - v) < 1e-9
  for (const q of [1, 2, 3, 4]) if (near(a * q, Math.round(a * q))) return sgn + (q === 1 ? `${Math.round(a)}` : `${Math.round(a * q)}/${q}`)
  const a2 = a * a
  for (const d of [1, 2, 4]) {
    const n = Math.round(a2 * d)
    if (!near(a2 * d, n)) continue
    if (d === 1) return `${sgn}√${n}`
    if (d === 2) return `${sgn}√${2 * n}/2`
    return `${sgn}√${n}/2`
  }
  return sgn + fix(a, 3)
}

/** A matrix entry: a real, a pure imaginary (written i√2/2) or, rarely, both (decimals). */
export function entryText(z: { re: number; im: number }): string {
  if (z.im === 0) return exactText(z.re)
  if (z.re === 0) {
    const t = exactText(Math.abs(z.im))
    return `${z.im < 0 ? '−' : ''}i${t === '1' ? '' : t}`
  }
  return `${fix(z.re, 2)}${z.im < 0 ? '−' : '+'}${fix(Math.abs(z.im), 2)}i`
}

const AXIS_TEXT = (a: AxisSpec): string => (typeof a === 'string' ? a : `(${fix(a.thetaDeg, 0)}°, ${fix(a.phiDeg, 0)}°)`)

/* ------------------------------------------------ readouts ------------------------------------------------ */
export function spinLadderReadouts(r: ResolvedSpinLadder): SvgReadout[] {
  const out: SvgReadout[] = [{ name: 'spin', text: `j = ${r.j === 0.5 ? '1/2' : r.j === 1.5 ? '3/2' : String(r.j)}` }]
  if (r.ket) out.push({ name: 'state', text: `|${mText(r.ket.m).replace('+', '')}⟩ along ${AXIS_TEXT(r.ket.axis)}` })
  if (r.apply) out.push({ name: 'arrow', text: r.apply.to === null ? `J${r.apply.dir === '+' ? '+' : '−'} gives 0` : `J${r.apply.dir === '+' ? '+' : '−'}: × ${fix(r.apply.coeff, 4)} ħ` })
  for (const name of r.readouts) {
    if (name === 'length') out.push({ name, text: `|J| = ${fix(r.length, 4)} ħ` })
    else if (name === 'cone') out.push({ name, text: `at m = j: ${fix(r.coneDeg[0], 2)}° from z` })
    else if (name === 'levels') out.push({ name, text: `2j + 1 = ${r.levels.length} levels` })
    else if (name === 'chances' && r.ket) out.push({ name, text: `chances ${r.ket.chances.map((x) => fix(x, 3)).join(' · ')}` })
  }
  return out
}
