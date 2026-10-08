/**
 * `amplitudes` (709; SVG; P-F1-story §9.2 S2, P-Q1-story §9.2 S5): a state as one bar per basis state. Content names
 * the state only (`ket`, `bell`, a 448 direction `dir`, or a circuit and its cursor); the engine makes the vector
 * (physics/qc/state.ts `ket`, `bell`, `meanAmplitude`; physics/spin.ts `KET`, `ketFromBloch`; physics/qc/circuit.ts
 * `runCircuit`) and physics/complex.ts gives every size, phase and chance. Interpolation: a one-qubit direction turns on
 * the sphere (angles lerp, the ket is rebuilt, as the `bloch` kind); otherwise the amplitudes lerp and are
 * renormalised, and every observable is recomputed from the vector on screen. Lazy chunk (stage/svg/kinds.ts).
 */
import type { AmplitudesState, Dir, Scrub } from '../../content/stage'
import { type C, abs, abs2, add, arg, c, mul } from '../../physics/complex'
import { type Vec, inner } from '../../physics/linalg'
import { type Circuit, runCircuit, validateCircuit } from '../../physics/qc/circuit'
import { BELL_BASIS, bell, bitsOfIndex, ket, meanAmplitude, nQubits } from '../../physics/qc/state'
import { ketFromBloch } from '../../physics/spin'
import { DEG, dirAngles, dirKet, scrub } from '../resolve'
import type { SvgReadout } from '../svgKinds'
import type { ResolvedAmplitudes } from '../types'
import { degs, fix, fmtC } from './draw'

/** Every amplitude of `psi` times e^{iγ} (P-Q2-story §9.2 S2): sizes and chances are unchanged, phases shift by γ. */
function rotateGlobalPhase(psi: Vec, gamma: number): Vec {
  if (gamma === 0) return psi
  const e = c(Math.cos(gamma), Math.sin(gamma))
  return psi.map((a) => mul(a, e))
}

/** The overlaps ⟨Bell_k|ψ⟩ of a two-qubit state with Φ+, Φ−, Ψ+, Ψ− (qc/state.ts `BELL_BASIS`, in that order): the
 *  state's coefficients in the Bell basis (numpy twin: `B.conj().T @ psi` for the Bell kets as columns). */
export function bellCoefficients(psi: Vec): Vec {
  if (psi.length !== 4) throw new Error('amplitudes inBasis bell: two qubits only (the Bell basis has four states)')
  return BELL_BASIS.map((b) => inner(b.ket, psi))
}

/** The stage's caps (the brief: n ≤ 5 on the stage; circuits ≤ 24 columns); dials only while bars stay wide. */
export const AMP_LIMITS = { qubits: 5, columns: 24, dialQubits: 3 } as const
export const AMP_MODES = ['amplitude', 'probability', 'signed'] as const

const SUB = '₀₁₂₃₄₅₆₇₈₉'
const sub = (k: number) => String(k).split('').map((d) => SUB[Number(d)]).join('')

/** A bar's label: |01⟩ (bits), or for one qubit in 'spin' labels |0⟩ = |+z⟩ and |1⟩ = |−z⟩ (the 709 lock). */
export function barLabel(k: number, n: number, labels: 'bits' | 'spin', basis: ResolvedAmplitudes['basis'] = 'computational'): string {
  if (basis === 'bell') return `|${BELL_BASIS[k].name}⟩`
  if (labels === 'spin' && n === 1) return k === 0 ? '|0⟩ = |+z⟩' : '|1⟩ = |−z⟩'
  return `|${bitsOfIndex(k, n)}⟩`
}
/** The short name of bar k in readouts: a₀, a₁ … */
export const ampName = (k: number): string => `a${sub(k)}`

/** The vector a source names at hold progress s (and its sphere angles or circuit cursor when it has them). */
export function sourceAt(src: AmplitudesState['state'], s: number): { psi: Vec; dir: { theta: number; phi: number } | null; upTo: number | null } {
  if ('ket' in src) return { psi: ket(src.ket), dir: null, upTo: null }
  if ('bell' in src) return { psi: bell(src.bell), dir: null, upTo: null }
  if ('dir' in src) return { psi: dirKet(src.dir, s), dir: dirAngles(src.dir, s), upTo: null }
  const k = circuitCursor(src.circuit, src.upTo, s)
  const run = runCircuit(src.circuit, src.outcomes !== undefined ? { outcomes: src.outcomes } : {})
  return { psi: run.states[k], dir: null, upTo: k }
}

/** The cursor after column k: `upTo` rounded to a whole column (default: after the last column). */
export const circuitCursor = (circuit: Circuit, upTo: Scrub | undefined, s: number): number =>
  Math.max(0, Math.min(circuit.columns.length, Math.round(upTo === undefined ? circuit.columns.length : scrub(upTo, s))))

type Rest = Pick<ResolvedAmplitudes, 'mode' | 'dials' | 'labels' | 'basis' | 'dir' | 'upTo' | 'shot' | 'globalPhase'> & { sum: [number, number] | null }

/** Every observable of a vector, by the engine (shared by resolve and interpolate). */
export function ampsFrom(psi: Vec, rest: Rest): ResolvedAmplitudes {
  const n = nQubits(psi)
  const amps = psi.map((a) => ({ re: a.re, im: a.im }))
  const sizes = psi.map((a) => abs(a))
  let sum: ResolvedAmplitudes['sum'] = null
  if (rest.sum) {
    const [i, j] = rest.sum
    const total: C = add(psi[i], psi[j])
    sum = { i, j, total: { re: total.re, im: total.im }, size: abs(total), size2: abs2(total) }
  }
  const m = meanAmplitude(psi)
  return {
    kind: 'amplitudes',
    n,
    amps,
    sizes,
    phases: psi.map((a, k) => (sizes[k] > 1e-12 ? arg(a) : 0)),
    probs: psi.map((a) => abs2(a)),
    mode: rest.mode,
    dials: rest.dials,
    labels: rest.labels,
    basis: rest.basis,
    sum,
    mean: { re: m.re, im: m.im },
    dir: rest.dir,
    upTo: rest.upTo,
    globalPhase: rest.globalPhase,
    shot: rest.shot,
  }
}

export function resolveAmplitudes(st: AmplitudesState, s: number): ResolvedAmplitudes {
  const src = sourceAt(st.state, s)
  const gamma = st.globalPhaseDeg === undefined ? 0 : scrub(st.globalPhaseDeg, s) * DEG
  const phased = rotateGlobalPhase(src.psi, gamma)
  const psi = st.inBasis === 'bell' ? bellCoefficients(phased) : phased
  return ampsFrom(psi, { mode: st.mode ?? 'amplitude', dials: !!st.dials, labels: st.labels ?? 'bits', basis: st.inBasis === 'bell' ? 'bell' : 'computational', sum: st.sum ?? null, dir: src.dir, upTo: src.upTo, globalPhase: gamma, shot: st.shot })
}

/* ------------------------------------------------ interpolation ------------------------------------------------ */
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const pick = <T>(a: T, b: T, t: number): T => (t < 0.5 ? a : b)

export function interpAmplitudes(a: ResolvedAmplitudes, b: ResolvedAmplitudes, t: number): ResolvedAmplitudes {
  if (t <= 0) return a
  if (t >= 1) return b
  const d = pick(a, b, t)
  // bars in different bases are different lists: a straight line between them would blend unlike things
  if (a.basis !== b.basis) return d
  const globalPhase = lerp(a.globalPhase, b.globalPhase, t)
  const rest: Rest = {
    mode: d.mode,
    dials: d.dials,
    labels: d.labels,
    basis: d.basis,
    sum: d.sum ? [d.sum.i, d.sum.j] : null,
    dir: null,
    upTo: a.upTo !== null && b.upTo !== null ? lerp(a.upTo, b.upTo, t) : d.upTo,
    globalPhase,
    shot: d.shot,
  }
  // one qubit on the sphere: turn the direction, rebuild the ket (the Bloch kind's rule), then reapply the phase
  if (a.dir && b.dir) {
    const dir = { theta: lerp(a.dir.theta, b.dir.theta, t), phi: lerp(a.dir.phi, b.dir.phi, t) }
    return ampsFrom(rotateGlobalPhase(ketFromBloch(dir.theta, dir.phi), globalPhase), { ...rest, dir })
  }
  if (a.n !== b.n) return d
  // the same register: a straight line between the vectors, renormalised (a half-way zero vector cannot be drawn)
  const v = a.amps.map((x, k) => c(lerp(x.re, b.amps[k].re, t), lerp(x.im, b.amps[k].im, t)))
  const len = Math.sqrt(v.reduce((acc, x) => acc + abs2(x), 0))
  if (len < 1e-6) return d
  return ampsFrom(
    v.map((x) => c(x.re / len, x.im / len)),
    rest,
  )
}

/* ------------------------------------------------ validation ------------------------------------------------ */
const finite = (v: Scrub | undefined): boolean => v === undefined || (typeof v === 'number' ? Number.isFinite(v) : Number.isFinite(v.from) && Number.isFinite(v.to))
const ends = (v: Scrub): number[] => (typeof v === 'number' ? [v] : [v.from, v.to])

function dirOk(d: Dir): boolean {
  if (typeof d === 'string') return ['+z', '-z', '+x', '-x', '+y', '-y'].includes(d)
  return typeof d === 'object' && d !== null && 'thetaDeg' in d && finite(d.thetaDeg) && finite(d.phiDeg)
}

/** Problems with a circuit a stage reads (its own validator, then the stage's caps and a run that can be drawn). */
export function stageCircuitProblems(circuit: Circuit, upTo: Scrub | undefined, outcomes: string | undefined, where: string): string[] {
  const v = validateCircuit(circuit)
  if (!v.ok) return [`${where}: ${v.reason}`]
  if (circuit.qubits > AMP_LIMITS.qubits) return [`${where}: the stage draws at most ${AMP_LIMITS.qubits} qubits`]
  if (circuit.columns.length > AMP_LIMITS.columns) return [`${where}: the stage draws at most ${AMP_LIMITS.columns} columns`]
  if (upTo !== undefined && (!finite(upTo) || !ends(upTo).every((x) => Number.isInteger(x) && x >= 0 && x <= circuit.columns.length)))
    return [`${where}: upTo is a whole column 0–${circuit.columns.length} (a sweep's ends too)`]
  try {
    runCircuit(circuit, outcomes !== undefined ? { outcomes } : {})
  } catch (e) {
    return [`${where}: ${e instanceof Error ? e.message : 'the circuit does not run'}`]
  }
  return []
}

export function validateAmplitudes(st: AmplitudesState): string[] {
  const src = st.state as Record<string, unknown> | undefined
  if (!src || typeof src !== 'object') return ['amplitudes state: a source ({ket}, {bell}, {dir} or {circuit, upTo})']
  const keys = ['ket', 'bell', 'dir', 'circuit'].filter((k) => k in src)
  if (keys.length !== 1) return ['amplitudes state: exactly one of ket, bell, dir, circuit']
  const errs: string[] = []
  const s = st.state
  if ('ket' in s) {
    try {
      if (nQubits(ket(s.ket)) > AMP_LIMITS.qubits) errs.push(`amplitudes ket: the stage draws at most ${AMP_LIMITS.qubits} qubits`)
    } catch (e) {
      errs.push(`amplitudes ket: ${e instanceof Error ? e.message : 'not a ket label'}`)
    }
  } else if ('bell' in s) {
    try {
      if (nQubits(bell(s.bell)) > AMP_LIMITS.qubits) errs.push(`amplitudes bell: the stage draws at most ${AMP_LIMITS.qubits} qubits`)
    } catch (e) {
      errs.push(`amplitudes bell: ${e instanceof Error ? e.message : 'not a two-term state'}`)
    }
  } else if ('dir' in s) {
    if (!dirOk(s.dir)) errs.push('amplitudes dir: a named ket (±x, ±y, ±z) or finite Bloch angles')
  } else errs.push(...stageCircuitProblems(s.circuit, s.upTo, s.outcomes, 'amplitudes circuit'))
  if (st.mode !== undefined && !(AMP_MODES as readonly string[]).includes(st.mode)) errs.push(`amplitudes mode: one of ${AMP_MODES.join(', ')}`)
  if (st.labels !== undefined && st.labels !== 'bits' && st.labels !== 'spin') errs.push(`amplitudes labels: 'bits' or 'spin'`)
  if (st.globalPhaseDeg !== undefined && !finite(st.globalPhaseDeg)) errs.push('amplitudes globalPhaseDeg: a finite angle (degrees; a sweep too)')
  if (st.inBasis !== undefined && st.inBasis !== 'bell') errs.push(`amplitudes inBasis: 'bell' (the Bell basis, two qubits)`)
  if (errs.length) return errs
  // the register first (a sum's bars must exist before it is formed)
  if (st.inBasis === 'bell') {
    if (resolveAmplitudes({ ...st, sum: undefined, inBasis: undefined }, 0).n !== 2) errs.push(`amplitudes inBasis 'bell': two qubits only (the Bell basis has four states)`)
    if (st.mode === 'signed') errs.push(`amplitudes inBasis 'bell': not with mode 'signed' (a mean over Bell bars is no inversion)`)
    if (st.sum) errs.push(`amplitudes inBasis 'bell': not with sum (a₀ … name computational bars)`)
    if (errs.length) return errs
  }
  const r = resolveAmplitudes({ ...st, sum: undefined }, 0)
  if (st.labels === 'spin' && r.n !== 1) errs.push(`amplitudes labels 'spin': one qubit only (|0⟩ = |+z⟩, |1⟩ = |−z⟩)`)
  if (st.dials && r.n > AMP_LIMITS.dialQubits) errs.push(`amplitudes dials: at most ${2 ** AMP_LIMITS.dialQubits} bars carry a dial`)
  if (st.sum) {
    const N = 2 ** r.n
    const [i, j] = st.sum
    if (!Number.isInteger(i) || !Number.isInteger(j) || i < 0 || j < 0 || i >= N || j >= N || i === j) errs.push(`amplitudes sum: two different bars in 0–${N - 1}`)
  }
  if (errs.length) return errs
  if (st.mode === 'signed')
    for (const x of [0, 0.5, 1])
      if (resolveAmplitudes(st, x).amps.some((a) => Math.abs(a.im) > 1e-9)) {
        errs.push(`amplitudes mode 'signed': every amplitude must be real (a complex one at s = ${x})`)
        break
      }
  return errs
}

/* ------------------------------------------------ readouts ------------------------------------------------ */
/** Up to four lines about the nonzero bars (short: the column stays clear of the passport), then the sum or the mean. */
export function ampReadouts(r: ResolvedAmplitudes): SvgReadout[] {
  const out: SvgReadout[] = []
  const nz = r.sizes.map((x, k) => [x, k] as const).filter(([x]) => x > 1e-9)
  const shown = nz.slice(0, 4)
  const spin = r.labels === 'spin' && r.n === 1
  const lab = (k: number) => (spin ? (k === 0 ? '|+z⟩' : '|−z⟩') : barLabel(k, r.n, 'bits', r.basis))
  const chance = (k: number) => (spin ? (k === 0 ? 'P(+z)' : 'P(−z)') : r.basis === 'bell' ? `P(${BELL_BASIS[k].name})` : `P(${bitsOfIndex(k, r.n)})`)
  if (r.upTo !== null) out.push({ name: 'after', text: `after column ${Math.round(r.upTo)}` })
  // P-Q2-story S2: a global phase moves no bar and no chance; the readout says so
  if (r.globalPhase !== 0) out.push({ name: 'phase', text: `phase ${degs(r.globalPhase, 0)} · same state` })
  for (const [, k] of shown)
    out.push({ name: `bar-${k}`, text: r.mode === 'probability' ? `${chance(k)} = ${fix(r.probs[k] * 100, 1)} %` : `${lab(k)}: ${fmtC(r.amps[k])}` })
  if (nz.length > shown.length) out.push({ name: 'more', text: `${nz.length} of ${r.amps.length} nonzero` })
  if (r.mode === 'signed') out.push({ name: 'mean', text: `mean = ${fix(r.mean.re)}` })
  if (r.sum) {
    out.push({ name: 'sum', text: `${ampName(r.sum.i)} + ${ampName(r.sum.j)} = ${fmtC(r.sum.total)}` })
    out.push({ name: 'sum-size2', text: `|${ampName(r.sum.i)} + ${ampName(r.sum.j)}|² = ${fix(r.sum.size2)}` })
  }
  return out
}
