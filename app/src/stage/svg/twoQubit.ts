/**
 * `two-qubit` (709; SVG): two Bloch balls A, B side by side (their reduced Bloch vectors, `physics/qc/density.ts
 * reducedBloch`), and a 3×3 ⟨σᵢ⊗σⱼ⟩ correlation grid (`physics/qc/measure.ts expectationN` on a pure ket, or
 * Tr(ρ·σᵢ⊗σⱼ) when only a density matrix is given). Content names the source only — `ket` (any two-qubit ket
 * `amplitudes` accepts, reused via its own `AmpSource`/`sourceAt`), `family: 'cos-sin'` (sweepable), `rho` (the
 * `matrix` kind's own ρ sources), `reduce` (a three-qubit ket, two kept qubits) — never a Bloch vector or a
 * correlation; the engine computes every one. Lazy chunk (stage/svg/kinds.ts).
 */
import type { AmpSource, Scrub, TwoQubitSource, TwoQubitState } from '../../content/stage'
import { c, ZERO } from '../../physics/complex'
import { dagger, matmul, type Mat, type Vec } from '../../physics/linalg'
import { traceN } from '../../physics/qc/cmat'
import { mixtureN, partialTrace, purityN, reducedBloch, reducedDensity, vonNeumann } from '../../physics/qc/density'
import { chshFromAxes, chshMaxHorodecki, concurrence, concurrencePure } from '../../physics/qc/entangle'
import { GATES_1Q, applyGate, pauliString } from '../../physics/qc/gates'
import { expectationN, measureInBasis } from '../../physics/qc/measure'
import { embed, nQubits } from '../../physics/qc/state'
import { DEG, dirAngles, scrub } from '../resolve'
import type { SvgReadout } from '../svgKinds'
import type { ResolvedTwoQubit, V3 } from '../types'
import { sourceAt, stageCircuitProblems } from './amplitudes'
import { fix } from './draw'

/** The stage's caps: ≤ 2 measurement directions per ball (CHSH settings, Q10). */
export const TWO_QUBIT_LIMITS = { maxAxes: 2 } as const

/** Local gates take no angle: a restriction to the param-less one-qubit gates (I, X, Y, Z, H, S, Sdg, T, Tdg). */
const LOCAL_GATE_NAMES = new Set(Object.keys(GATES_1Q))
const AXES: readonly ('X' | 'Y' | 'Z')[] = ['X', 'Y', 'Z']
const axisV3 = (ax: 'x' | 'y' | 'z'): V3 => (ax === 'x' ? [1, 0, 0] : ax === 'y' ? [0, 1, 0] : [0, 0, 1])

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const lerp3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]
const pick = <T,>(a: T, b: T, t: number): T => (t < 0.5 ? a : b)

/** The two-qubit ket cos θ|00⟩ + sin θ|11⟩ (θ in radians). */
function cosSinKet(theta: number): Vec {
  return [c(Math.cos(theta)), ZERO, ZERO, c(Math.sin(theta))]
}

/** A JSON identity of the source, EXCLUDING a cos-sin family's angle: two beats of the same family hard-match here
 *  regardless of θ, so `interpTwoQubitStage` lerps the angle instead of crossfading (the one documented exception). */
function sourceKey(src: TwoQubitSource): string {
  if ('family' in src) return 'family:cos-sin'
  return JSON.stringify(src)
}

/** The non-computed part of a resolved state: static per-beat fields plus the identity key used by interpolation. */
type StaticTQ = Pick<ResolvedTwoQubit, 'labels' | 'local' | 'condition' | 'arrows' | 'grid' | 'highlight' | 'axesA' | 'axesB' | 'readouts' | 'shot' | 'key'>

function staticFieldsOf(st: TwoQubitState, s: number): StaticTQ {
  const labels = st.labels ?? 'A-B'
  const local = st.local ?? []
  const condition = st.condition ?? null
  const arrows = st.arrows ?? 'reduced'
  const grid = st.grid ?? 'none'
  const highlight = st.highlight ?? []
  const readouts = st.readouts ?? []
  const axesA = (st.axes?.a ?? []).map((d) => dirAngles(d, s))
  const axesB = (st.axes?.b ?? []).map((d) => dirAngles(d, s))
  const key = JSON.stringify({
    src: sourceKey(st.source),
    local,
    condition,
    arrows,
    grid,
    highlight,
    labels,
    readouts,
    nAxesA: axesA.length,
    nAxesB: axesB.length,
  })
  return { labels, local, condition, arrows, grid, highlight, axesA, axesB, readouts, shot: st.shot, key }
}

/** T_ij = ⟨σᵢ⊗σⱼ⟩ on wires (qa, qb) of psi (any register size: `expectationN` reads straight off the full ket, so a
 *  `reduce` source needs no partial trace to get an exact grid). */
function gridFromKet(psi: Vec, qa: number, qb: number, mode: 'T' | 'T-minus-rr', rA: V3, rB: V3): number[][] {
  const T = AXES.map((pi) => AXES.map((pj) => expectationN(psi, pauliString(pi + pj), [qa, qb]).re))
  return mode === 'T' ? T : T.map((row, i) => row.map((v, j) => v - rA[i] * rB[j]))
}
/** T_ij = Tr(ρ·σᵢ⊗σⱼ) directly on an already-reduced 2-qubit ρ (the `rho.mixture` case: no pure ket is available). */
function gridFromRho(rho: Mat, mode: 'T' | 'T-minus-rr', rA: V3, rB: V3): number[][] {
  const T = AXES.map((pi) => AXES.map((pj) => traceN(matmul(rho, pauliString(pi + pj))).re))
  return mode === 'T' ? T : T.map((row, i) => row.map((v, j) => v - rA[i] * rB[j]))
}

/** The two entanglement readouts asked for in `stat.readouts`, from the pair's own two-qubit state (`pure` when a two-qubit ket
 *  exists, so C comes from the pure-state form; otherwise the density matrix). Null when not asked for: nothing is computed. */
function entangleReadouts(rho2: Mat, pure: Vec | null, stat: StaticTQ): Pick<ResolvedTwoQubit, 'concurrence' | 'chsh'> {
  const C = stat.readouts.includes('concurrence') ? (pure ? concurrencePure(pure) : concurrence(rho2)) : null
  let chsh: ResolvedTwoQubit['chsh'] = null
  if (stat.readouts.includes('chsh')) {
    const v3 = (d: { theta: number; phi: number }): V3 => [Math.sin(d.theta) * Math.cos(d.phi), Math.sin(d.theta) * Math.sin(d.phi), Math.cos(d.theta)]
    const atAxes = stat.axesA.length === 2 && stat.axesB.length === 2 ? chshFromAxes(rho2, [v3(stat.axesA[0]), v3(stat.axesA[1])], [v3(stat.axesB[0]), v3(stat.axesB[1])]) : null
    chsh = { max: chshMaxHorodecki(rho2), atAxes }
  }
  return { concurrence: C, chsh }
}

/** Apply `local`'s one-qubit gates to the (sub-)register's wires qa (logical 0) / qb (logical 1), then read A's and
 *  B's reduced Bloch vectors, then (if `condition` is set) override them with the conditioned post-measurement pair. */
function fromPsi(psi: Vec, qa: number, qb: number, stat: StaticTQ): ResolvedTwoQubit {
  let v = psi
  for (const l of stat.local) v = applyGate(v.slice(), GATES_1Q[l.gate], [l.qubit === 0 ? qa : qb])
  let rA = reducedBloch(v, qa) as V3
  let rB = reducedBloch(v, qb) as V3
  const cond = stat.condition
  if (cond) {
    const measuredWire = cond.qubit === 0 ? qa : qb
    const partnerWire = cond.qubit === 0 ? qb : qa
    const m = measureInBasis(v, measuredWire, cond.basis)
    const post = m.post[cond.outcome]
    const partnerR = (post ? reducedBloch(post, partnerWire) : [0, 0, 0]) as V3
    const sign = cond.outcome === 0 ? 1 : -1
    const measuredR = axisV3(cond.basis).map((x) => x * sign) as V3
    if (cond.qubit === 0) {
      rA = measuredR
      rB = partnerR
    } else {
      rB = measuredR
      rA = partnerR
    }
  }
  const T = stat.grid === 'none' ? null : gridFromKet(v, qa, qb, stat.grid, rA, rB)
  const rho2 = reducedDensity(v, [qa, qb])
  const purity = purityN(rho2)
  const entropy = vonNeumann(partialTrace(rho2, [1]))
  return { kind: 'two-qubit', ...stat, rA, rB, T, purity, entropy, ...entangleReadouts(rho2, v.length === 4 ? v : null, stat), sweep: null }
}

/** The `rho.mixture` path: no pure ket exists, so local gates conjugate ρ and the grid reads ρ directly. */
function fromRho(rho0: Mat, stat: StaticTQ): ResolvedTwoQubit {
  let rho = rho0
  for (const l of stat.local) {
    const U = embed(GATES_1Q[l.gate], 2, [l.qubit])
    rho = matmul(matmul(U, rho), dagger(U))
  }
  const rA = reducedBloch(rho, 0) as V3
  const rB = reducedBloch(rho, 1) as V3
  const T = stat.grid === 'none' ? null : gridFromRho(rho, stat.grid, rA, rB)
  const purity = purityN(rho)
  const entropy = vonNeumann(partialTrace(rho, [1]))
  return { kind: 'two-qubit', ...stat, rA, rB, T, purity, entropy, ...entangleReadouts(rho, null, stat), sweep: null }
}

export function resolveTwoQubitStage(st: TwoQubitState, s: number): ResolvedTwoQubit {
  const stat = staticFieldsOf(st, s)
  const src = st.source
  if ('ket' in src) return fromPsi(sourceAt(src.ket, s).psi, 0, 1, stat)
  if ('family' in src) {
    const thetaDeg = scrub(src.thetaDeg, s)
    const r = fromPsi(cosSinKet(thetaDeg * DEG), 0, 1, stat)
    return { ...r, sweep: { thetaDeg } }
  }
  if ('rho' in src) {
    if ('ket' in src.rho) return fromPsi(sourceAt(src.rho.ket, s).psi, 0, 1, stat)
    const rho = mixtureN(src.rho.mixture.map((m) => ({ w: scrub(m.w, s), psi: sourceAt(m.ket, s).psi })))
    return fromRho(rho, stat)
  }
  const psi3 = sourceAt(src.reduce.ket, s).psi
  const [qa, qb] = src.reduce.keep
  return fromPsi(psi3, qa, qb, stat)
}

/** A scrub (or a transition) of the SAME cos-sin family lerps θ and rebuilds everything at the new angle; a between-
 *  beat move of the same key but no sweep (e.g. a static source, or a mixture weight) lerps the derived numbers
 *  directly, as `matrix` lerps its cells; any other change hard crossfades (`pick`). */
export function interpTwoQubitStage(a: ResolvedTwoQubit, b: ResolvedTwoQubit, t: number): ResolvedTwoQubit {
  if (t <= 0) return a
  if (t >= 1) return b
  if (a.key !== b.key) return pick(a, b, t)
  if (a.sweep && b.sweep) {
    const thetaDeg = lerp(a.sweep.thetaDeg, b.sweep.thetaDeg, t)
    const stat = pick(a, b, t)
    const r = fromPsi(cosSinKet(thetaDeg * DEG), 0, 1, stat)
    return { ...r, sweep: { thetaDeg } }
  }
  const d = pick(a, b, t)
  const T = a.T && b.T ? a.T.map((row, i) => row.map((v, j) => lerp(v, b.T![i][j], t))) : null
  // the entanglement readouts lerp like purity and entropy do (the key matched, so both ends ask for the same ones)
  const concurrence = a.concurrence !== null && b.concurrence !== null ? lerp(a.concurrence, b.concurrence, t) : d.concurrence
  const chsh =
    a.chsh && b.chsh
      ? { max: lerp(a.chsh.max, b.chsh.max, t), atAxes: a.chsh.atAxes !== null && b.chsh.atAxes !== null ? lerp(a.chsh.atAxes, b.chsh.atAxes, t) : d.chsh!.atAxes }
      : d.chsh
  return { ...d, rA: lerp3(a.rA, b.rA, t), rB: lerp3(a.rB, b.rB, t), T, purity: lerp(a.purity, b.purity, t), entropy: lerp(a.entropy, b.entropy, t), concurrence, chsh }
}

/* ------------------------------------------------ validation ------------------------------------------------ */

const finiteScrub = (v: Scrub | undefined): boolean => v === undefined || (typeof v === 'number' ? Number.isFinite(v) : Number.isFinite(v.from) && Number.isFinite(v.to))

function ketSourceProblems(src: AmpSource, where: string): string[] {
  if ('circuit' in src) return stageCircuitProblems(src.circuit, src.upTo, src.outcomes, where)
  try {
    sourceAt(src, 0)
    return []
  } catch (e) {
    return [`${where}: ${e instanceof Error ? e.message : 'not a valid state source'}`]
  }
}
/** The qubit count of a resolved ket source, or an error string (never throws). */
function qubitCount(src: AmpSource, where: string): { n: number } | { err: string } {
  const problems = ketSourceProblems(src, where)
  if (problems.length) return { err: problems[0] }
  try {
    return { n: nQubits(sourceAt(src, 0).psi.length) }
  } catch (e) {
    return { err: `${where}: ${e instanceof Error ? e.message : 'not a valid state source'}` }
  }
}

function sourceProblems(src: TwoQubitSource): string[] {
  if (!src || typeof src !== 'object') return ['two-qubit source: a source ({ket}, {family}, {rho} or {reduce})']
  if ('ket' in src) {
    const q = qubitCount(src.ket, 'two-qubit ket')
    if ('err' in q) return [q.err]
    return q.n === 2 ? [] : [`two-qubit ket: needs a two-qubit state (got ${q.n} qubits)`]
  }
  if ('family' in src) {
    const errs: string[] = []
    if (src.family !== 'cos-sin') errs.push(`two-qubit family: unknown family "${String(src.family)}"`)
    if (!finiteScrub(src.thetaDeg)) errs.push('two-qubit family: non-finite thetaDeg')
    return errs
  }
  if ('rho' in src) {
    if ('ket' in src.rho) {
      const q = qubitCount(src.rho.ket, 'two-qubit rho.ket')
      if ('err' in q) return [q.err]
      return q.n === 2 ? [] : [`two-qubit rho.ket: needs a two-qubit state (got ${q.n} qubits)`]
    }
    const parts = src.rho.mixture
    const errs: string[] = []
    if (!parts.length) errs.push('two-qubit rho.mixture: empty')
    parts.forEach((p, i) => {
      const q = qubitCount(p.ket, `two-qubit rho.mixture[${i}].ket`)
      if ('err' in q) errs.push(q.err)
      else if (q.n !== 2) errs.push(`two-qubit rho.mixture[${i}].ket: needs a two-qubit state (got ${q.n} qubits)`)
    })
    if (!errs.length)
      for (const s of [0, 0.5, 1]) {
        const sum = parts.reduce((acc, p) => acc + scrub(p.w, s), 0)
        if (Math.abs(sum - 1) > 1e-9) {
          errs.push(`two-qubit rho.mixture: weights sum to ${sum} at s=${s}, not 1`)
          break
        }
      }
    return errs
  }
  if ('reduce' in src) {
    const errs: string[] = []
    const q = qubitCount(src.reduce.ket, 'two-qubit reduce.ket')
    if ('err' in q) errs.push(q.err)
    else if (q.n !== 3) errs.push(`two-qubit reduce.ket: needs a three-qubit state (got ${q.n} qubits)`)
    const [qa, qb] = src.reduce.keep
    if (!Number.isInteger(qa) || !Number.isInteger(qb) || qa < 0 || qa > 2 || qb < 0 || qb > 2 || qa === qb)
      errs.push('two-qubit reduce.keep: two distinct qubits, 0–2')
    return errs
  }
  return ['two-qubit source: exactly one of ket, family, rho, reduce']
}

export function validateTwoQubitStage(st: TwoQubitState): string[] {
  const errs = sourceProblems(st.source)
  if (errs.length) return errs
  const src = st.source
  ;(st.local ?? []).forEach((l, i) => {
    if (l.qubit !== 0 && l.qubit !== 1) errs.push(`two-qubit local[${i}]: qubit must be 0 or 1`)
    if (!LOCAL_GATE_NAMES.has(l.gate)) errs.push(`two-qubit local[${i}]: gate "${l.gate}" needs an angle or is multi-qubit; use one of ${[...LOCAL_GATE_NAMES].join(', ')}`)
  })
  if (st.condition) {
    if (!('ket' in src)) errs.push('two-qubit condition: only on a pure ket source')
    if (st.condition.qubit !== 0 && st.condition.qubit !== 1) errs.push('two-qubit condition.qubit: 0 or 1')
    if (!['x', 'y', 'z'].includes(st.condition.basis)) errs.push('two-qubit condition.basis: x, y or z')
    if (st.condition.outcome !== 0 && st.condition.outcome !== 1) errs.push('two-qubit condition.outcome: 0 or 1')
  }
  if (st.arrows !== undefined && st.arrows !== 'reduced' && st.arrows !== 'none') errs.push(`two-qubit arrows: 'reduced' or 'none'`)
  if (st.grid !== undefined && !['none', 'T', 'T-minus-rr'].includes(st.grid)) errs.push(`two-qubit grid: 'none', 'T' or 'T-minus-rr'`)
  for (const h of st.highlight ?? []) if (!/^[xyz]{2}$/.test(h)) errs.push(`two-qubit highlight: "${h}" must be two of x, y, z`)
  if ((st.axes?.a?.length ?? 0) > TWO_QUBIT_LIMITS.maxAxes) errs.push(`two-qubit axes.a: at most ${TWO_QUBIT_LIMITS.maxAxes} directions`)
  if ((st.axes?.b?.length ?? 0) > TWO_QUBIT_LIMITS.maxAxes) errs.push(`two-qubit axes.b: at most ${TWO_QUBIT_LIMITS.maxAxes} directions`)
  for (const r of st.readouts ?? []) if (!['purity', 'rLength', 'entropy', 'concurrence', 'chsh'].includes(r)) errs.push(`two-qubit readouts: unknown readout "${r}"`)
  if (st.labels !== undefined && st.labels !== 'A-B' && st.labels !== 'q1-q2') errs.push(`two-qubit labels: 'A-B' or 'q1-q2'`)
  if (errs.length) return errs
  if (st.condition && 'ket' in src) {
    const cond = st.condition
    for (const s of [0, 0.5, 1]) {
      const psi = sourceAt(src.ket, s).psi
      const m = measureInBasis(psi, cond.qubit, cond.basis)
      if (m.p[cond.outcome] < 1e-9) {
        errs.push(`two-qubit condition: outcome ${cond.outcome} has probability ~0 at s=${s}, nothing to show`)
        break
      }
    }
  }
  return errs
}

/* ------------------------------------------------ readouts ------------------------------------------------ */

export function twoQubitReadouts(r: ResolvedTwoQubit): SvgReadout[] {
  const out: SvgReadout[] = []
  if (r.readouts.includes('purity')) out.push({ name: 'purity', text: `Tr ρ² = ${fix(r.purity)}` })
  if (r.readouts.includes('rLength')) out.push({ name: 'rLength', text: `|r_A| = ${fix(Math.hypot(...r.rA))} · |r_B| = ${fix(Math.hypot(...r.rB))}` })
  if (r.readouts.includes('entropy')) out.push({ name: 'entropy', text: `S(ρ_A) = ${fix(r.entropy)} bit` })
  if (r.concurrence !== null) out.push({ name: 'concurrence', text: `C = ${fix(r.concurrence)}` })
  if (r.chsh) {
    if (r.chsh.atAxes !== null) out.push({ name: 'chsh-axes', text: `S = ${fix(r.chsh.atAxes)}` })
    out.push({ name: 'chsh', text: `max S = ${fix(r.chsh.max)}` })
  }
  return out
}
