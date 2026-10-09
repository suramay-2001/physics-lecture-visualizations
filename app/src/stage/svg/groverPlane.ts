/**
 * `grover-plane` (709; SVG; P-Q17-story §9.2): the real plane Grover's search lives in. The whole 2ⁿ-dimensional state stays in the
 * plane spanned by |x₀⊥⟩ (the unmarked strings, evenly) and |x₀⟩ (the marked strings, evenly); the start |w₀⟩ sits at
 * α = arcsin √(M/N) above the horizontal and every Grover step turns the arrow by 2α, so after k steps it points at (2k+1)α and its
 * vertical shadow squared is the chance of a marked string. Content writes only INPUTS (the register size n, how many strings are
 * marked, the number of steps, what to draw); this resolver takes α, every angle and every chance from physics/qc/grover.ts, so a
 * picture cannot disagree with the circuit beside it (the engine's own cross-check pins the plane to a full simulation). Interpolation
 * (stage/interp.ts) turns the arrow continuously by 2α per step between two whole steps of the SAME search, and switches everything
 * else at the half-way point; every output is recomputed from the interpolated inputs. Lazy chunk (stage/svg/kinds.ts).
 */
import type { GroverPlaneState, Scrub, StageState } from '../../content/stage'
import { GROVER_ARCS, GROVER_MIRRORS, GROVER_READOUTS } from '../../content/stage'
import type { Circuit, OracleOp } from '../../physics/qc/circuit'
import { groverAngle, groverOptimalK, groverPlane, groverSuccess } from '../../physics/qc/grover'
import { DEG, scrub } from '../resolve'
import type { SvgReadout } from '../svgKinds'
import type { GroverPlaneInputs, ResolvedGroverPlane } from '../types'
import { fix } from './draw'

/** Validation limits: n ≤ 10 (N = 1024), k ≤ 64 steps, a trail only up to 24 steps (the arrows must stay countable). */
export const GROVER_PLANE_LIMITS = { nMax: 10, kMax: 64, trailMax: 24 } as const

/** The inputs a state asks for, the sweep resolved at hold progress s. */
export function groverPlaneInputs(st: GroverPlaneState, s: number): GroverPlaneInputs {
  return {
    n: st.search.n,
    marked: st.search.marked ?? 1,
    k: scrub(st.k, s),
    half: st.half === 'oracle',
    mirrors: [...(st.mirrors ?? [])],
    trail: !!st.trail,
    arcs: [...(st.arcs ?? [])],
    proof: st.proof ?? null,
    readouts: [...(st.readouts ?? [])],
    shot: st.shot,
  }
}

const isWhole = (k: number): boolean => Math.abs(k - Math.round(k)) < 1e-9

/** Every derived field from the inputs (shared by resolve and interpolate). */
export function groverPlaneFrom(inp: GroverPlaneInputs): ResolvedGroverPlane {
  const N = 2 ** inp.n
  const M = inp.marked
  const alpha = groverAngle(N, M)
  const alphaDeg = alpha / DEG
  const whole = isWhole(inp.k)
  const kk = whole ? Math.round(inp.k) : inp.k
  const angle = (2 * kk + 1) * alpha
  // at a whole step the arrow IS the engine's plane state; between two steps (a sweep) it is the same rotation, turned part-way
  const arrow: [number, number] = whole ? groverPlane(N, M, kk) : [Math.cos(angle), Math.sin(angle)]
  const success = whole ? groverSuccess(N, M, kk) : Math.sin(angle) ** 2
  const steps = Math.ceil(inp.k - 1e-9)
  const kStar = groverOptimalK(N, M)
  return {
    kind: 'grover-plane',
    n: inp.n,
    N,
    M,
    alphaDeg,
    stepDeg: 2 * alphaDeg,
    k: kk,
    angleDeg: angle / DEG,
    arrow,
    success,
    trail: inp.trail ? Array.from({ length: Math.max(0, steps) }, (_, j) => ((2 * j + 1) * alpha) / DEG) : [],
    ghost: inp.half ? [arrow[0], -arrow[1]] : null,
    mirrors: inp.mirrors.map((name) => ({ name, angleDeg: name === 'x0perp' ? 0 : alphaDeg })),
    arcs: inp.arcs,
    proof: inp.proof
      ? inp.proof === 'v1'
        ? { which: 'v1', startDeg: 0, firstDeg: 0, secondDeg: 2 * alphaDeg }
        : { which: 'v2', startDeg: alphaDeg, firstDeg: -alphaDeg, secondDeg: 3 * alphaDeg }
      : null,
    kopt: { k: kStar, angleDeg: ((2 * kStar + 1) * alpha) / DEG, success: groverSuccess(N, M, kStar) },
    readouts: inp.readouts,
    inputs: inp,
    shot: inp.shot,
  }
}

export function resolveGroverPlaneStage(st: GroverPlaneState, s: number): ResolvedGroverPlane {
  return groverPlaneFrom(groverPlaneInputs(st, s))
}

/* ------------------------------------------------ interpolation ------------------------------------------------ */
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const pick = <T,>(a: T, b: T, t: number): T => (t < 0.5 ? a : b)

export function interpGroverPlaneStage(a: ResolvedGroverPlane, b: ResolvedGroverPlane, t: number): ResolvedGroverPlane {
  if (t <= 0) return a
  if (t >= 1) return b
  const A = a.inputs
  const B = b.inputs
  const d = pick(A, B, t)
  // the same search: the arrow turns by 2α per step between the two step counts; a different search switches at the half-way point
  const same = A.n === B.n && A.marked === B.marked
  return groverPlaneFrom({ ...d, k: same ? lerp(A.k, B.k, t) : d.k })
}

/* ------------------------------------------------ validation ------------------------------------------------ */
const scrubEnds = (v: Scrub): number[] => (typeof v === 'number' ? [v] : [v.from, v.to])
const scrubFinite = (v: Scrub): boolean => scrubEnds(v).every((x) => typeof x === 'number' && Number.isFinite(x))

export function validateGroverPlaneStage(st: GroverPlaneState): string[] {
  const errs: string[] = []
  const n = st.search?.n
  const M = st.search?.marked ?? 1
  if (!Number.isInteger(n) || n < 1 || n > GROVER_PLANE_LIMITS.nMax) errs.push(`grover-plane search.n: a whole number of qubits in 1…${GROVER_PLANE_LIMITS.nMax} (got ${String(n)})`)
  else if (!Number.isInteger(M) || M < 1 || M >= 2 ** n) errs.push(`grover-plane search.marked: a whole number with 1 ≤ M < N = ${2 ** n} (got ${String(M)})`)
  let ends: number[] = []
  if (!scrubFinite(st.k)) errs.push('grover-plane k: non-finite')
  else {
    ends = scrubEnds(st.k)
    for (const x of ends) if (!Number.isInteger(x) || x < 0 || x > GROVER_PLANE_LIMITS.kMax) errs.push(`grover-plane k: a whole number of steps in 0…${GROVER_PLANE_LIMITS.kMax} at its ends (got ${x})`)
  }
  if (st.half !== undefined && st.half !== 'oracle') errs.push(`grover-plane half: only 'oracle' (got ${String(st.half)})`)
  for (const [name, list, known] of [
    ['mirrors', st.mirrors, GROVER_MIRRORS],
    ['arcs', st.arcs, GROVER_ARCS],
    ['readouts', st.readouts, GROVER_READOUTS],
  ] as const) {
    if (list === undefined) continue
    if (!Array.isArray(list) || list.some((x) => !(known as readonly string[]).includes(x))) errs.push(`grover-plane ${name}: names from ${known.map((x) => `'${x}'`).join(', ')}`)
    else if (new Set(list).size !== list.length) errs.push(`grover-plane ${name}: each once`)
  }
  if (st.trail && ends.some((x) => x > GROVER_PLANE_LIMITS.trailMax)) errs.push(`grover-plane trail: only up to ${GROVER_PLANE_LIMITS.trailMax} steps (the arrows must stay countable)`)
  if (st.arcs?.includes('step') && ends.length && Math.max(...ends) < 1) errs.push("grover-plane arcs: 'step' needs at least one step (k ≥ 1)")
  if (st.proof !== undefined) {
    if (st.proof !== 'v1' && st.proof !== 'v2') errs.push(`grover-plane proof: 'v1' or 'v2' (got ${String(st.proof)})`)
    if (ends.some((x) => x !== 0)) errs.push('grover-plane proof: Theorem 1’s picture needs k = 0 (the test vector, not the search state)')
    if (st.half) errs.push('grover-plane proof: not together with `half` (one story per picture)')
  }
  return errs
}

/* ------------------------------------------------ layout ------------------------------------------------ */
/**
 * Across one layout: a `circuit` or an `amplitudes` view that reads Grover's circuit beside the plane must be the SAME search and the SAME
 * moment as the plane. The register has n wires, the marking column marks M strings, and the cursor sits where the plane says the state is:
 * after whole step k (column 1 + 4k), or right after step k + 1's marking column (2 + 4k) when the plane draws `half: 'oracle'`. A circuit
 * without a marking column (the fixed steps alone) is not Grover's search, so it is not compared; a swept k or cursor is not compared either.
 */
export function groverPlaneLayoutProblems(states: readonly StageState[]): string[] {
  const gp = states.find((s): s is GroverPlaneState => s.kind === 'grover-plane')
  if (!gp) return []
  const errs: string[] = []
  const M = gp.search.marked ?? 1
  for (const s of states) {
    let circuit: Circuit | undefined
    let upTo: Scrub | undefined
    let who = ''
    if (s.kind === 'circuit') {
      circuit = s.circuit
      upTo = s.upTo
      who = 'circuit'
    } else if (s.kind === 'amplitudes' && 'circuit' in s.state) {
      circuit = s.state.circuit
      upTo = s.state.upTo
      who = 'amplitudes'
    }
    if (!circuit) continue
    const mark = circuit.columns.flat().find((op): op is OracleOp => op.op === 'oracle' && op.label === 'U_f')
    if (!mark) continue
    if (circuit.qubits !== gp.search.n) errs.push(`grover-plane + ${who}: the plane has n = ${gp.search.n} but the circuit has ${circuit.qubits} wires`)
    const marked = mark.table.reduce<number>((a, v) => a + v, 0)
    if (marked !== M) errs.push(`grover-plane + ${who}: the plane marks M = ${M} but the circuit's oracle marks ${marked}`)
    if (typeof gp.k === 'number' && (upTo === undefined || typeof upTo === 'number')) {
      const want = (gp.half === 'oracle' ? 2 : 1) + 4 * gp.k
      const have = upTo ?? circuit.columns.length
      if (have !== want) errs.push(`grover-plane + ${who}: the plane is at k = ${gp.k}${gp.half ? ' (after the mark)' : ''}, which is column ${want}, but the ${who} cursor is at ${have}`)
    }
  }
  return errs
}

/* ------------------------------------------------ readouts ------------------------------------------------ */
/** The overlay's readout column (short lines, about 164 px wide) and the figure's own text lines. */
export function groverPlaneReadouts(r: ResolvedGroverPlane): SvgReadout[] {
  const kText = isWhole(r.k) ? String(Math.round(r.k)) : fix(r.k, 2)
  const out: SvgReadout[] = [
    { name: 'search', text: `${r.N} strings, ${r.M} marked` },
    { name: 'alpha', text: `α = ${fix(r.alphaDeg, 2)}°` },
    { name: 'steps', text: `k = ${kText}` },
  ]
  if (r.readouts.includes('angle')) out.push({ name: 'angle', text: `(2k+1)α = ${fix(r.angleDeg, 1)}°` })
  if (r.readouts.includes('success')) out.push({ name: 'success', text: `chance = ${fix(r.success, 4)}` })
  if (r.readouts.includes('kopt')) out.push({ name: 'kopt', text: `k* = ${r.kopt.k}, chance ${fix(r.kopt.success, 4)}` })
  return out
}
