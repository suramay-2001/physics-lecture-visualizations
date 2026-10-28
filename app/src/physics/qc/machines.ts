/**
 * Quantum machines (Physics 709 chapter Q20, "Quantum machines: cloners, U-NOT, programmable processors"; Bergou Chapter 8, pp. 145-157).
 *
 * Wires: our q0 is Bergou's "qubit 1" (the data), q1 and q2 his qubits 2 and 3 (the program). The four-CNOT cloner of his Fig. 8.1 is CNOT 0->1, 0->2,
 * 1->0, 2->0 on three wires; the program (q1, q2) is a four-dimensional state Xi, drawn as a `unitary` box whose first column is Xi (Gram-Schmidt completion).
 * Programs: Xi00 = (|00> + |11>)/sqrt2 and Xi0x = |0>(|0> + |1>)/sqrt2 (Eq. 8.1), the mixture c0 Xi00 + c1 Xi0x with the angle parametrisation
 * c0 = cos u - sin u/sqrt3, c1 = 2 sin u/sqrt3 (always normalised: c0^2 + c1^2 + c0 c1 = 1), the four Bell states (Eq. 8.23) and the phase-flip program (Eq. 8.26).
 *
 * "Copy fidelity" F_c = <psi|rho|psi> is the SQUARE of Chapter Q9's root fidelity (Bergou Chapter 8 calls it "fidelity"). The Bloch angles of the running
 * input are (60, 90) degrees; the processor angle is alpha = 30 degrees; U(alpha) = e^{i alpha sigma_z} = R_z(-2 alpha) in the course's convention.
 *
 * Everything is checked against an independent numpy route (pipeline/machines_numpy.py: dense Kronecker CNOTs, tensor reshapes for the partial traces,
 * leggauss and scipy quadrature for the sphere, brentq for the U-NOT limit, a grid for the discriminator optimum).
 * Rule (l): imported only by the lazy chapter values (content/qc709/Q20.values.ts), the lazy `plot` tables and tests; never by the entry closure.
 */
import { type C, abs, abs2, add, c, conj, expi, mul, scale } from '../complex'
import { type Mat, type Vec, apply, dagger, fromColumns, identity, inner, madd, matmul, maxDiff, mscale, msub, norm, outer, vadd, vscale } from '../linalg'
import { rng } from '../random'
import { type ChannelMap, choi, unotMap } from './channels'
import { type Circuit, type GateName, type GateOp, type Op, runCircuit } from './circuit'
import { eigh, kronM, orthonormalize, traceN } from './cmat'
import { densityOf, partialTrace, purityN, reducedDensity } from './density'
import { I2, SWAP2, X, Y, Z, cnot, toffoli } from './gates'
import { usd } from './povm'
import { embed, kron, randomState } from './state'

const DEG = Math.PI / 180
const S2 = Math.SQRT1_2
const S3 = Math.sqrt(3)
const once = <T,>(f: () => T): (() => T) => {
  let v: T | undefined
  return () => (v ??= f())
}
const vsum = (vs: Vec[]): Vec => vs.reduce((a, b) => vadd(a, b))

/* ------------------------------------------------------------------ single-qubit helpers ------------------------------------------------------------------ */

/** The ket cos(theta/2)|0> + e^{i phi} sin(theta/2)|1> at the Bloch angles (degrees). */
export const blochKet = (thetaDeg: number, phiDeg: number): Vec => [c(Math.cos((thetaDeg * DEG) / 2)), scale(expi(phiDeg * DEG), Math.sin((thetaDeg * DEG) / 2))]

/** The ket orthogonal to (a, b): (-b*, a*) (the antipode on the sphere). */
export const perpKet = (psi: Vec): Vec => [c(-psi[1].re, psi[1].im), conj(psi[0])]

/** The complex conjugate ket (a*, b*): the y part of the arrow flips. */
export const conjKet = (psi: Vec): Vec => psi.map(conj)

/** The Bloch vector (Tr rho sigma_x, Tr rho sigma_y, Tr rho sigma_z) of a one-qubit density matrix. */
export const blochVector = (rho: Mat): [number, number, number] => [2 * rho[0][1].re, -2 * rho[0][1].im, rho[0][0].re - rho[1][1].re]

/** The length |r| of a one-qubit density matrix's Bloch vector. */
export const blochLength = (rho: Mat): number => Math.hypot(...blochVector(rho))

/** F_c = <psi|rho|psi> (Bergou's Chapter 8 "fidelity"; the square of the root fidelity of Chapter Q9). */
export const copyFidelity = (rho: Mat, psi: Vec): number => inner(psi, apply(rho, psi)).re

/** The azimuth, in degrees, of a pure one-qubit state's arrow on the equator (-180, 180]. */
export function blochAzimuthDeg(psi: Vec): number {
  const r = blochVector(densityOf(psi))
  return Math.atan2(r[1], r[0]) / DEG
}

/** The running input of the chapter: Bloch angles (60, 90) degrees, so r = (0, 0.866, 0.5) has a y part and conjugation is visible. */
export const PSI_RUN: Vec = blochKet(60, 90)

/* ------------------------------------------------------------------ programs and the cloner (Eqs. 8.1-8.8) ------------------------------------------------------------------ */

/** |Xi_00> = (|00> + |11>)/sqrt2 and |Xi_0x> = |0>(|0> + |1>)/sqrt2 (Eq. 8.1), as 4-vectors on (q1, q2). */
export const XI00: Vec = [c(S2), c(0), c(0), c(S2)]
export const XI0X: Vec = [c(S2), c(S2), c(0), c(0)]
/** The four Bell states as 4-vectors (standard names; Bergou's Psi+- are our Phi+-, his Phi+- our Psi+-). */
export const PHI_P: Vec = [c(S2), c(0), c(0), c(S2)]
export const PHI_M: Vec = [c(S2), c(0), c(0), c(-S2)]
export const PSI_P: Vec = [c(0), c(S2), c(S2), c(0)]
export const PSI_M: Vec = [c(0), c(S2), c(-S2), c(0)]
export type BellName = 'Phi+' | 'Phi-' | 'Psi+' | 'Psi-'
const BELLS: Record<BellName, Vec> = { 'Phi+': PHI_P, 'Phi-': PHI_M, 'Psi+': PSI_P, 'Psi-': PSI_M }

/** The mixed program c0 Xi00 + c1 Xi0x at the angle u (degrees): c0 = cos u - sin u/sqrt3, c1 = 2 sin u/sqrt3 (norm 1 for every u). */
export function clonerProgram(uDeg: number): { c0: number; c1: number; xi: Vec } {
  const u = uDeg * DEG
  const c0 = Math.cos(u) - Math.sin(u) / S3
  const c1 = (2 * Math.sin(u)) / S3
  return { c0, c1, xi: vadd(vscale(XI00, c0), vscale(XI0X, c1)) }
}

/** How a program is named: Xi00, Xi0x, a Bell state, the angle u of the mixture, or the phase-flip program about the direction (theta, phi) in degrees. */
export type ProgramSpec = '00' | '0x' | BellName | { uDeg: number } | { flip: [number, number] }

export function programVector(p: ProgramSpec): Vec {
  if (p === '00') return XI00
  if (p === '0x') return XI0X
  if (typeof p === 'string') return BELLS[p]
  if ('uDeg' in p) return clonerProgram(p.uDeg).xi
  return phaseFlipProgram(p.flip[0], p.flip[1]).xi
}

/** A 4x4 unitary whose FIRST column is the program xi (Gram-Schmidt completion with the basis vectors): the `unitary` box that prepares it from |00>. */
export function programBox(xi: Vec): Mat {
  const basis: Vec[] = [0, 1, 2, 3].map((k) => Array.from({ length: 4 }, (_, i) => c(i === k ? 1 : 0)))
  return fromColumns(orthonormalize([xi, ...basis]))
}

const rows = (m: Mat): [number, number][][] => m.map((row) => row.map((z): [number, number] => [z.re, z.im]))
const gate = (g: GateName, targets: number[], extra: Partial<GateOp> = {}): Op => ({ op: 'gate', gate: g, targets, ...extra })

/**
 * The cloner circuit (Fig. 8.1): three wires from 000; column 1 turns the data to Bloch polar angle theta (R_y) and prepares the program (box Xi on q1, q2);
 * column 2 gives the data its azimuth (P(phi)); columns 3-6 are CNOT 0->1, 0->2, 1->0, 2->0. Six columns.
 */
export function clonerCircuit(program: ProgramSpec, thetaDeg = 60, phiDeg = 90): Circuit {
  const xi = programVector(program)
  return {
    version: 1,
    qubits: 3,
    init: '000',
    wires: ['w₁', 'w₂', 'w₃'],
    columns: [
      [gate('Ry', [0], { params: [thetaDeg * DEG] }), { op: 'unitary', matrix: rows(programBox(xi)), targets: [1, 2], label: 'Ξ' }],
      [gate('P', [0], { params: [phiDeg * DEG] })],
      [gate('X', [1], { controls: [0] })],
      [gate('X', [2], { controls: [0] })],
      [gate('X', [0], { controls: [1] })],
      [gate('X', [0], { controls: [2] })],
    ],
  }
}

/** The four CNOTs of the cloner as one 8x8 matrix (CNOT 0->1 first). */
const U4 = once((): Mat => matmul(cnot(2, 0, 3), matmul(cnot(1, 0, 3), matmul(cnot(0, 2, 3), cnot(0, 1, 3)))))

/** The three-wire state after the four CNOTs, from data `psi` and program `xi`. */
export const clonerState = (psi: Vec, xi: Vec): Vec => apply(U4(), kron(psi, xi))

/** The final state of the drawn cloner circuit (through runCircuit). */
export const clonerRun = (program: ProgramSpec, thetaDeg = 60, phiDeg = 90): Vec => runCircuit(clonerCircuit(program, thetaDeg, phiDeg)).states.at(-1)!

/** The three reduced states of a final cloner state (wires 0, 1, 2). */
export const outputsOf = (state: Vec): [Mat, Mat, Mat] => [reducedDensity(state, [0]), reducedDensity(state, [1]), reducedDensity(state, [2])]

/** The three outputs of the DRAWN circuit (runCircuit, then reducedDensity). */
export const clonerOutputs = (program: ProgramSpec, thetaDeg = 60, phiDeg = 90): [Mat, Mat, Mat] => outputsOf(clonerRun(program, thetaDeg, phiDeg))

/** The circuit against the direct matrix route: max-abs difference of the two final states. */
export function clonerCircuitGap(program: ProgramSpec, thetaDeg = 60, phiDeg = 90): number {
  const direct = clonerState(blochKet(thetaDeg, phiDeg), programVector(program))
  const run = clonerRun(program, thetaDeg, phiDeg)
  return Math.max(...direct.map((z, i) => abs(c(z.re - run[i].re, z.im - run[i].im))))
}

/** F_c of wire 1 and of wire 2 at the program angle u, for the input at (theta, phi). */
export function clonerFidelities(uDeg: number, thetaDeg = 60, phiDeg = 90): { f1: number; f2: number } {
  const psi = blochKet(thetaDeg, phiDeg)
  const [r1, r2] = outputsOf(clonerState(psi, clonerProgram(uDeg).xi))
  return { f1: copyFidelity(r1, psi), f2: copyFidelity(r2, psi) }
}

/**
 * Max-abs gaps of the circuit's outputs against Eqs. 8.4 (rho_1, rho_2) and 8.6 (rho_3), and of the cross term against c0 c1 |psi><psi|
 * (the program's two branches Xi00, Xi0x run separately, their cross terms traced over wires 1, 2).
 */
export function clonerFormulaGap(uDeg: number, thetaDeg = 60, phiDeg = 90): { rho1: number; rho2: number; rho3: number; cross: number } {
  const { c0, c1 } = clonerProgram(uDeg)
  const psi = blochKet(thetaDeg, phiDeg)
  const pp = densityOf(psi)
  const half = mscale(identity(2), 0.5)
  const [o1, o2, o3] = clonerOutputs({ uDeg }, thetaDeg, phiDeg)
  const f1 = madd(mscale(pp, c0 * c0 + c0 * c1), mscale(half, c1 * c1))
  const f2 = madd(mscale(pp, c1 * c1 + c0 * c1), mscale(half, c0 * c0))
  const f3 = madd(mscale(densityOf(conjKet(psi)), c0 * c1), mscale(half, 1 - c0 * c1))
  const a = vscale(clonerState(psi, XI00), c0)
  const b = vscale(clonerState(psi, XI0X), c1)
  const crossOp = partialTrace(madd(outer(a, b), outer(b, a)), [1, 2])
  return { rho1: maxDiff(o1, f1), rho2: maxDiff(o2, f2), rho3: maxDiff(o3, f3), cross: maxDiff(crossOp, mscale(pp, c0 * c1)) }
}

/** Eq. 8.2: the drawn circuit's final state against psi (x) Xi00 (program 00) or psi moved to wire 2 with Xi00 on wires 1 and 3 (program 0x): max-abs gap. */
export function clonerEq82Gap(program: '00' | '0x', thetaDeg = 60, phiDeg = 90): number {
  const psi = blochKet(thetaDeg, phiDeg)
  const run = clonerRun(program, thetaDeg, phiDeg)
  const want: Vec = program === '00' ? kron(psi, XI00) : Array.from({ length: 8 }, (_, i) => mul(XI00[2 * ((i >> 2) & 1) + (i & 1)], psi[(i >> 1) & 1]))
  return Math.max(...want.map((z, i) => abs(c(z.re - run[i].re, z.im - run[i].im))))
}

/** Eq. 8.5: the equal split (u = 30 degrees): max-abs gap of wires 1 and 2 against 5/6 |psi><psi| + 1/6 |psi-perp><psi-perp|. */
export function clonerEq85Gap(thetaDeg = 60, phiDeg = 90): number {
  const psi = blochKet(thetaDeg, phiDeg)
  const want = madd(mscale(densityOf(psi), 5 / 6), mscale(densityOf(perpKet(psi)), 1 / 6))
  const [o1, o2] = clonerOutputs({ uDeg: 30 }, thetaDeg, phiDeg)
  return Math.max(maxDiff(o1, want), maxDiff(o2, want))
}

/** Eqs. 8.8 and 8.12: the max-abs gap of rho against 2/3 |psi-perp><psi-perp| + 1/3 |psi><psi|. */
export function unotTargetGap(rho: Mat, psi: Vec): number {
  return maxDiff(rho, madd(mscale(densityOf(perpKet(psi)), 2 / 3), mscale(densityOf(psi), 1 / 3)))
}

/** |c0^2 + c1^2 + c0 c1 - ||Xi||^2|: Eq. 8.3's normalisation against the program vector's own length. */
export function programNormGap(uDeg: number): number {
  const { c0, c1, xi } = clonerProgram(uDeg)
  return Math.abs(c0 * c0 + c1 * c1 + c0 * c1 - norm(xi) ** 2)
}

/** max - min of F_c of wire 1 over `nInputs` seeded random inputs (universality: 0 up to roundoff). */
export function universalSpread(uDeg: number, nInputs: number, seed: number): number {
  const rand = rng(seed)
  const xi = clonerProgram(uDeg).xi
  const fs = Array.from({ length: nInputs }, () => {
    const psi = randomState(1, rand)
    return copyFidelity(reducedDensity(clonerState(psi, xi), [0]), psi)
  })
  return Math.max(...fs) - Math.min(...fs)
}

/** The largest c0 c1 over `n` + 1 equally spaced angles u in [0, 60] degrees, with the angle where it is reached. */
export function maxC0C1(n = 6000): { value: number; uDeg: number } {
  let best = { value: -1, uDeg: 0 }
  for (let k = 0; k <= n; k++) {
    const u = (60 * k) / n
    const { c0, c1 } = clonerProgram(u)
    if (c0 * c1 > best.value) best = { value: c0 * c1, uDeg: u }
  }
  return best
}

/** The purity Tr rho^2 of a reduced state. */
export const outputPurity = (rho: Mat): number => purityN(rho)

/* ------------------------------------------------------------------ the U-NOT (Eqs. 8.6-8.12) ------------------------------------------------------------------ */

/** U0 = -i sigma_y: |0> -> +|1>, |1> -> -|0> (the book prints the opposite signs; no effect on rho). */
export const U0: Mat = [
  [c(0), c(-1)],
  [c(1), c(0)],
]

/** U0 rho U0^-1: wire 3 of the cloner turned by a half turn about y. */
export const unotTurned = (rho3: Mat): Mat => matmul(matmul(U0, rho3), dagger(U0))

/** The shrunk universal NOT: p (Tr rho I - rho) + (1 - p) Tr rho I/2, as a channel map (Q13's raw `unotMap` plus the depolarizing part). */
export const unotShrunk =
  (p: number) =>
  (rho: Mat): Mat =>
    madd(mscale(unotMap(rho), p), mscale(mscale(identity(2), traceN(rho).re), (1 - p) / 2))

/** The trace-one Choi spectrum (ascending) of a one-qubit map. */
export const choiSpectrum = (map: ChannelMap): number[] => eigh(mscale(choi(map, 2), 0.5)).values

/** The smallest eigenvalue of the trace-one Choi matrix: negative exactly when the map is not completely positive. */
export const choiMinEig = (map: ChannelMap): number => choiSpectrum(map)[0]

/** The p at which the shrunk U-NOT's smallest Choi eigenvalue crosses zero (bisection; 1/3). */
export function unotLimit(): number {
  let lo = 0
  let hi = 1
  for (let k = 0; k < 100; k++) {
    const mid = (lo + hi) / 2
    if (choiMinEig(unotShrunk(mid)) >= 0) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

/** max-abs of Tr(rho) I - rho - sigma_y rho^T sigma_y over the given states: the U-NOT is sigma_y (transpose) sigma_y. */
export function unotYTYGap(rhos: readonly Mat[]): number {
  return Math.max(
    ...rhos.map((rho) => {
      const rt = rho.map((row, i) => row.map((_, j) => rho[j][i]))
      return maxDiff(unotMap(rho), matmul(matmul(Y, rt), Y))
    }),
  )
}

/** Gauss-Legendre nodes and weights on [-1, 1] (Newton on the Legendre polynomial). */
function gaussLegendre(n: number): { x: number[]; w: number[] } {
  const x: number[] = []
  const w: number[] = []
  for (let i = 0; i < n; i++) {
    let z = Math.cos((Math.PI * (i + 0.75)) / (n + 0.5))
    const legendre = (zz: number): { p: number; dp: number } => {
      let p1 = 1
      let p2 = 0
      for (let j = 1; j <= n; j++) {
        const p3 = p2
        p2 = p1
        p1 = ((2 * j - 1) * zz * p2 - (j - 1) * p3) / j
      }
      return { p: p1, dp: (n * (zz * p1 - p2)) / (zz * zz - 1) }
    }
    for (let it = 0; it < 100; it++) {
      const { p, dp } = legendre(z)
      const dz = p / dp
      z -= dz
      if (Math.abs(dz) < 1e-15) break
    }
    const { dp } = legendre(z)
    x.push(z)
    w.push(2 / ((1 - z * z) * dp * dp))
  }
  return { x, w }
}

/** The average of a matrix-valued function of a pure qubit state over the whole Bloch sphere (Gauss-Legendre in cos(theta) times equally spaced phi; exact for polynomials of low degree). */
export function sphereAverage(f: (psi: Vec) => Mat, n = 48): Mat {
  const { x, w } = gaussLegendre(n)
  let acc: Mat | null = null
  for (let i = 0; i < n; i++) {
    const theta = Math.acos(x[i])
    for (let j = 0; j < n; j++) {
      const phi = (2 * Math.PI * j) / n
      const psi: Vec = [c(Math.cos(theta / 2)), scale(expi(phi), Math.sin(theta / 2))]
      const term = mscale(f(psi), w[i] / (2 * n))
      acc = acc ? madd(acc, term) : term
    }
  }
  return acc!
}

/** Measure along eta (random axis) on the input psi; on the reading "eta" prepare eta-perp, on "eta-perp" prepare eta: averaged over eta (Eqs. 8.9-8.12). */
export const measurePrepareUnot = (psi: Vec): Mat =>
  sphereAverage((eta) => {
    const x = abs2(inner(eta, psi))
    const ep = perpKet(eta)
    return madd(mscale(densityOf(ep), x), mscale(densityOf(eta), 1 - x))
  })

/** Measure-and-prepare cloning: prepare |eta eta> on the reading "eta", |eta-perp eta-perp> on the other; the single-copy F_c and the pair overlap <psi psi|rho_12|psi psi>. */
export function measurePrepareClone(psi: Vec): { single: number; both: number; rho12: Mat } {
  const rho12 = sphereAverage((eta) => {
    const x = abs2(inner(eta, psi))
    const ep = perpKet(eta)
    return madd(mscale(densityOf(kron(eta, eta)), x), mscale(densityOf(kron(ep, ep)), 1 - x))
  })
  const pp = kron(psi, psi)
  return { single: copyFidelity(partialTrace(rho12, [1]), psi), both: inner(pp, apply(rho12, pp)).re, rho12 }
}

/** The pair overlap <psi psi|rho_12|psi psi> of the cloner circuit's two outputs (wires 0, 1) at the program angle u. */
export function clonerPairOverlap(uDeg: number, psi: Vec): number {
  const r12 = reducedDensity(clonerState(psi, clonerProgram(uDeg).xi), [0, 1])
  const pp = kron(psi, psi)
  return inner(pp, apply(r12, pp)).re
}

/* ------------------------------------------------------------------ the no-go (Eqs. 8.13-8.19) ------------------------------------------------------------------ */

/** <psi|U2^-1 U1|psi> (a complex number): the factor that must not depend on psi (Eq. 8.17). */
export const processorExpectation = (U1: Mat, U2: Mat, psi: Vec): C => inner(psi, apply(matmul(dagger(U2), U1), psi))

/** The diameter of the set of values <psi|U2^-1 U1|psi> over a grid of states (theta in 37 steps, phi in four): 0 only when U2^-1 U1 is a phase. */
export function expectationSpread(U1: Mat, U2: Mat, nTheta = 37): number {
  const vals: C[] = []
  for (let i = 0; i < nTheta; i++) for (const ph of [0, 90, 180, 270]) vals.push(processorExpectation(U1, U2, blochKet((180 * i) / (nTheta - 1), ph)))
  let d = 0
  for (const a of vals) for (const b of vals) d = Math.max(d, abs(c(a.re - b.re, a.im - b.im)))
  return d
}

/**
 * Eq. 8.16 for the controlled-U processor G = U1 (x) |0><0| + U2 (x) |1><1| with programs |0> and |1> (so Pi'_k = Pi_k): the gap between the program overlap
 * <Pi2|Pi1> (0) and <psi|U2^-1 U1|psi><Pi2'|Pi1'>, and between the outputs' overlap and the inputs'.
 */
export function processorOverlapGap(U1: Mat, U2: Mat, psi: Vec): number {
  const P0: Mat = [[c(1), c(0)], [c(0), c(0)]]
  const P1: Mat = [[c(0), c(0)], [c(0), c(1)]]
  const G = madd(kronM(U1, P0), kronM(U2, P1))
  const e = [c(1), c(0)]
  const f = [c(0), c(1)]
  const out1 = apply(G, kron(psi, e))
  const out2 = apply(G, kron(psi, f))
  const lhs = inner(kron(psi, f), kron(psi, e))
  const rhs = mul(processorExpectation(U1, U2, psi), inner(f, e))
  const outs = inner(out2, out1)
  return Math.max(abs(c(lhs.re - rhs.re, lhs.im - rhs.im)), abs(c(lhs.re - outs.re, lhs.im - outs.im)))
}

/** The number of different operations an n-qubit program register can hold deterministically: its dimension 2^n (Eq. 8.19's counting). */
export const maxOperations = (nProgramQubits: number): number => 2 ** nProgramQubits

/** How many of the matrices differ by more than a global phase (|Tr A^-1 B|/d = 1 means the same operation). */
export function distinctOperations(ms: readonly Mat[]): number {
  const reps: Mat[] = []
  for (const m of ms) {
    const d = m.length
    const same = reps.some((r) => Math.abs(abs(traceN(matmul(dagger(r), m))) / d - 1) < 1e-9)
    if (!same) reps.push(m)
  }
  return reps.length
}

/** The operations that a measure-and-correct processor with two programs seems to hold, {U1, V U1, U2, V U2}, once Eq. 8.19 forces U2 = e^{i theta} U1: only two differ by more than a phase. */
export function measureCorrectOperations(U1: Mat, V: Mat, thetaDeg: number): number {
  const ph = expi(thetaDeg * DEG)
  const U2 = mscale(U1, ph)
  return distinctOperations([U1, matmul(V, U1), U2, matmul(V, U2)])
}

/* ------------------------------------------------------------------ probabilistic processors (Eqs. 8.20-8.21, 8.29-8.30) ------------------------------------------------------------------ */

/** |Xi(alpha)> = (e^{i alpha}|0> + e^{-i alpha}|1>)/sqrt2 (alpha in degrees). */
export const xiProgram = (alphaDeg: number): Vec => [scale(expi(alphaDeg * DEG), S2), scale(expi(-alphaDeg * DEG), S2)]

/** U(alpha) = e^{i alpha sigma_z} = diag(e^{i alpha}, e^{-i alpha}) (= R_z(-2 alpha)). */
export const uAlpha = (alphaDeg: number): Mat => [
  [expi(alphaDeg * DEG), c(0)],
  [c(0), expi(-alphaDeg * DEG)],
]

const normalized = (v: Vec): Vec => vscale(v, 1 / norm(v))
/** 1 - |<a|b>|: how far two kets are from being the same state (a global phase is free). */
export const rayGap = (a: Vec, b: Vec): number => 1 - abs(inner(normalized(a), normalized(b)))

/** A CNOT with the data as control and the program Xi(alpha) as target; the program wire read: 0 (success: data U(alpha) psi) or 1 (failure: U^-1(alpha) psi). */
export function cnotProcessor(alphaDeg: number, psi: Vec): { pSuccess: number; pFail: number; success: Vec; failure: Vec } {
  const s = apply(cnot(0, 1, 2), kron(psi, xiProgram(alphaDeg)))
  const v0: Vec = [s[0], s[2]]
  const v1: Vec = [s[1], s[3]]
  return { pSuccess: norm(v0) ** 2, pFail: norm(v1) ** 2, success: normalized(v0), failure: normalized(v1) }
}

/** max of the gaps of the success branch to U(alpha) psi and the failure branch to U^-1(alpha) psi (about 1e-16). */
export function cnotBranchGap(alphaDeg: number, psi: Vec): number {
  const r = cnotProcessor(alphaDeg, psi)
  return Math.max(rayGap(r.success, apply(uAlpha(alphaDeg), psi)), rayGap(r.failure, apply(uAlpha(-alphaDeg), psi)))
}

/** The chance that one of the first k rounds succeeds when round j runs Xi(2^(j-1) alpha) on what the earlier failures left: 1 - 2^-k (simulated round by round). */
export function rusSuccess(k: number, alphaDeg = 30, psi: Vec = blochKet(90, 0)): number {
  let data = psi
  let remain = 1
  let total = 0
  for (let j = 1; j <= k; j++) {
    const r = cnotProcessor(2 ** (j - 1) * alphaDeg, data)
    total += remain * r.pSuccess
    remain *= r.pFail
    data = r.failure
  }
  return total
}

/** max over the first k rounds of the gap between the round's success branch and U(alpha) psi. */
export function rusBranchGap(k: number, alphaDeg = 30, psi: Vec = blochKet(90, 0)): number {
  let data = psi
  let gap = 0
  for (let j = 1; j <= k; j++) {
    const r = cnotProcessor(2 ** (j - 1) * alphaDeg, data)
    gap = Math.max(gap, rayGap(r.success, apply(uAlpha(alphaDeg), psi)))
    data = r.failure
  }
  return gap
}

/** The fewest rounds whose success chance reaches `target`. */
export function rusRounds(target: number, alphaDeg = 30): number {
  for (let k = 1; k <= 60; k++) if (rusSuccess(k, alphaDeg) >= target) return k
  return Infinity
}

/** One round as a circuit: two wires from 00; R_y(90) turns the data to +x and H starts the program; P(-2 alpha) makes Xi(alpha) up to a global phase; CNOT 0->1; the program wire is read. Four columns. */
export function prCircuit(alphaDeg: number): Circuit {
  return {
    version: 1,
    qubits: 2,
    clbits: 1,
    init: '00',
    wires: ['d', 'p'],
    columns: [
      [gate('Ry', [0], { params: [Math.PI / 2] }), gate('H', [1])],
      [gate('P', [1], { params: [-2 * alphaDeg * DEG] })],
      [gate('X', [1], { controls: [0] })],
      [{ op: 'measure', qubit: 1, bit: 0 }],
    ],
  }
}

/**
 * Two rounds on three wires, the second program Xi(2 alpha) used only after a failed first reading, written with the first reading kept coherent: the second CNOT 0->2 is controlled
 * by wire 1 as well (a Toffoli, the same circuit as Eq. 8.30's larger program). Five columns; both program wires are read last.
 */
export function rusCircuit(alphaDeg: number): Circuit {
  return {
    version: 1,
    qubits: 3,
    clbits: 2,
    init: '000',
    wires: ['d', 'p₁', 'p₂'],
    columns: [
      [gate('Ry', [0], { params: [Math.PI / 2] }), gate('H', [1]), gate('H', [2])],
      [gate('P', [1], { params: [-2 * alphaDeg * DEG] }), gate('P', [2], { params: [-4 * alphaDeg * DEG] })],
      [gate('X', [1], { controls: [0] })],
      [gate('X', [2], { controls: [0, 1] })],
      [
        { op: 'measure', qubit: 1, bit: 0 },
        { op: 'measure', qubit: 2, bit: 1 },
      ],
    ],
  }
}

/** The larger-program processor (Eq. 8.30): CNOT 1->2 then Toffoli (0, 1 -> 2) on psi, Xi(alpha), Xi(2 alpha); the four readings of the program wires, and the data in the success and failure readings. */
export function toffoliProcessor(alphaDeg: number, psi: Vec): { pReadings: number[]; pSuccess: number; pFail: number; success: Vec[]; failure: Vec } {
  const s = apply(toffoli(0, 1, 2, 3), apply(cnot(0, 1, 3), kron(psi, kron(xiProgram(alphaDeg), xiProgram(2 * alphaDeg)))))
  const data = (m: number): Vec => [s[m], s[4 + m]]
  const pr = [0, 1, 2, 3].map((m) => norm(data(m)) ** 2)
  return {
    pReadings: pr,
    pSuccess: pr[0] + pr[1] + pr[2],
    pFail: pr[3],
    success: [0, 1, 2].map((m) => normalized(data(m))),
    failure: normalized(data(3)),
  }
}

/** max of |reading chance - 1/4| and the gaps of the success data to U(alpha) psi and of the failure data to U^-1(3 alpha) psi. */
export function toffoliGap(alphaDeg: number, psi: Vec): number {
  const t = toffoliProcessor(alphaDeg, psi)
  const goal = apply(uAlpha(alphaDeg), psi)
  return Math.max(...t.pReadings.map((p) => Math.abs(p - 0.25)), ...t.success.map((v) => rayGap(v, goal)), rayGap(t.failure, apply(uAlpha(-3 * alphaDeg), psi)))
}

/** The drawn two-round circuit's state after the Toffoli column against the direct operator route (a global phase is free). */
export function rusCircuitGap(alphaDeg: number, psi: Vec = blochKet(90, 0)): number {
  const run = runCircuit(rusCircuit(alphaDeg)).states[4]
  const direct = apply(toffoli(0, 1, 2, 3), apply(cnot(0, 1, 3), kron(psi, kron(xiProgram(alphaDeg), xiProgram(2 * alphaDeg)))))
  return rayGap(run, direct)
}

/** The chance, from the drawn two-round circuit (final state, no collapse), that one of its first two rounds succeeds: reading p1 = 0, or p1 = 1 and p2 = 0. */
export function rusCircuitSuccess(alphaDeg: number): number {
  const s = runCircuit(rusCircuit(alphaDeg)).states.at(-1)!
  // index = d p1 p2; success when p1 = 0 (indices 0, 1, 4, 5) or p1 = 1, p2 = 0 (indices 2, 6)
  return [0, 1, 4, 5, 2, 6].reduce((acc, i) => acc + abs2(s[i]), 0)
}

/** |<U(alpha) psi|U^-1(3 alpha) psi>|^2: the failing reading's data against the goal (0.25 at alpha = 30 degrees for +x). */
export function failureOverlap(alphaDeg: number, psi: Vec): number {
  const t = toffoliProcessor(alphaDeg, psi)
  return abs2(inner(t.success[0], t.failure))
}

/* ------------------------------------------------------------------ Bell programs and the phase flip (Eqs. 8.22-8.28) ------------------------------------------------------------------ */

/** The Pauli each Bell program applies in the cloner circuit (Eq. 8.23): Phi+ -> I, Phi- -> Z, Psi+ -> X, Psi- -> -i sigma_y. */
export const BELL_PAULI: Record<BellName, Mat> = { 'Phi+': I2, 'Phi-': Z, 'Psi+': X, 'Psi-': mscale(Y, c(0, -1)) }

/** max over the four Bell programs of the gap between the drawn circuit's final state and (Pauli psi) (x) (program unchanged). */
export function bellProgramGap(thetaDeg = 60, phiDeg = 90): number {
  const psi = blochKet(thetaDeg, phiDeg)
  return Math.max(
    ...(Object.keys(BELLS) as BellName[]).map((name) => {
      const run = clonerRun(name, thetaDeg, phiDeg)
      const want = kron(apply(BELL_PAULI[name], psi), BELLS[name])
      return Math.max(...want.map((z, i) => abs(c(z.re - run[i].re, z.im - run[i].im))))
    }),
  )
}

/**
 * The phase flip U_phi = I - 2|phi><phi| about the Bloch direction (theta, phi) and the program that applies it (Eqs. 8.24-8.26): coefficients of sigma_x, -i sigma_y and
 * sigma_z are -(mu nu* + mu* nu), mu nu* - mu* nu and |nu|^2 - |mu|^2 (the second is imaginary), and the program is that mix of Psi+, Psi-, Phi-.
 */
export function phaseFlipProgram(thetaDeg: number, phiDeg: number): { coef: [C, C, C]; xi: Vec; U: Mat } {
  const [mu, nu] = blochKet(thetaDeg, phiDeg)
  const m1 = mul(mu, conj(nu))
  const cx = c(-2 * m1.re)
  const cy = c(0, 2 * m1.im)
  const cz = c(abs2(nu) - abs2(mu))
  const xi = vsum([vscale(PSI_P, cx), vscale(PSI_M, cy), vscale(PHI_M, cz)])
  const phi: Vec = [mu, nu]
  return { coef: [cx, cy, cz], xi, U: msub(identity(2), mscale(densityOf(phi), 2)) }
}

/** The gap between cx X + cy(-i sigma_y) + cz Z and U_phi (Eq. 8.25). */
export function phaseFlipFormulaGap(thetaDeg: number, phiDeg: number): number {
  const { coef, U } = phaseFlipProgram(thetaDeg, phiDeg)
  const sum = madd(madd(mscale(X, coef[0]), mscale(mscale(Y, c(0, -1)), coef[1])), mscale(Z, coef[2]))
  return maxDiff(sum, U)
}

/**
 * Run the phase-flip program on `psi`, then project the program wires on (Psi+ + Psi- + Phi-)/sqrt3: the chance (1/3 for every direction and input) and the data left behind (U_phi psi).
 */
export function phaseFlipRun(psi: Vec, thetaDeg: number, phiDeg: number): { p: number; data: Vec } {
  const s = clonerState(psi, phaseFlipProgram(thetaDeg, phiDeg).xi)
  const M = vscale(vadd(vadd(PSI_P, PSI_M), PHI_M), 1 / S3)
  const amp: Vec = [0, 1].map((a) => [0, 1, 2, 3].reduce((acc, k) => add(acc, mul(conj(M[k]), s[4 * a + k])), c(0)))
  return { p: norm(amp) ** 2, data: normalized(amp) }
}

/** max over the given directions of the gaps between the data after the flip program and U_phi psi, and of |p - 1/3|. */
export function phaseFlipGap(psi: Vec, dirs: readonly [number, number][]): number {
  return Math.max(
    ...dirs.map(([t, p]) => {
      const r = phaseFlipRun(psi, t, p)
      return Math.max(Math.abs(r.p - 1 / 3), rayGap(r.data, apply(phaseFlipProgram(t, p).U, psi)))
    }),
  )
}

/** U_in of Eq. 8.27: |00> -> -|10>, |10> -> -|11>, |01> -> |00>, |11> -> |01>. */
export const uinMatrix = (): Mat => [
  [c(0), c(1), c(0), c(0)],
  [c(0), c(0), c(0), c(1)],
  [c(-1), c(0), c(0), c(0)],
  [c(0), c(0), c(-1), c(0)],
]

/** The tidier program of Eq. 8.28: U_in (|phi>|phi-perp> + |phi-perp>|phi>)/sqrt2. */
export function uinProgram(thetaDeg: number, phiDeg: number): Vec {
  const phi = blochKet(thetaDeg, phiDeg)
  const pp = perpKet(phi)
  return apply(uinMatrix(), vscale(vadd(kron(phi, pp), kron(pp, phi)), S2))
}

/** |<Eq. 8.28 program|Eq. 8.26 program>|: 1 when the two forms agree up to a global sign. */
export const uinOverlap = (thetaDeg: number, phiDeg: number): number => abs(inner(uinProgram(thetaDeg, phiDeg), phaseFlipProgram(thetaDeg, phiDeg).xi))

/** max-abs of U_in^-1 U_in - I. */
export const uinUnitaryGap = (): number => maxDiff(matmul(dagger(uinMatrix()), uinMatrix()), identity(4))

/* ------------------------------------------------------------------ the programmable discriminator (Eqs. 8.31-8.47) ------------------------------------------------------------------ */

/** The antisymmetric projector (I - SWAP)/2 on wires i, j of three (identity on the other). */
export const antisymmetric = (i: number, j: number): Mat => mscale(msub(identity(8), embed(SWAP2, 3, [i, j])), 0.5)

/** The discriminator's two inputs on (A, B, C): psi1 psi2 psi1 and psi1 psi2 psi2 (Eq. 8.31). */
export const discInputs = (psi1: Vec, psi2: Vec): [Vec, Vec] => [kron(psi1, kron(psi2, psi1)), kron(psi1, kron(psi2, psi2))]

/** The failure operator Pi0 = I - c1 I_A (x) P_BC - c2 I_B (x) P_AC (Eq. 8.37). */
const pi0 = (c1: number, c2: number): Mat => msub(msub(identity(8), mscale(antisymmetric(1, 2), c1)), mscale(antisymmetric(0, 2), c2))

/** The detection chances p1, p2 (Eq. 8.38), the average P, Pi0's smallest eigenvalue, and the zero-error gap max(||Pi2 in1||, ||Pi1 in2||) for the operators of Eq. 8.37. */
export function programmableUsd(psi1: Vec, psi2: Vec, c1: number, c2: number): { p1: number; p2: number; P: number; pi0MinEig: number; zeroGap: number } {
  const r = discChances(psi1, psi2, c1, c2)
  return { ...r, pi0MinEig: eigh(pi0(c1, c2)).values[0] }
}
function discChances(psi1: Vec, psi2: Vec, c1: number, c2: number): { p1: number; p2: number; P: number; zeroGap: number } {
  const [in1, in2] = discInputs(psi1, psi2)
  const Pi1 = mscale(antisymmetric(1, 2), c1)
  const Pi2 = mscale(antisymmetric(0, 2), c2)
  const p1 = inner(in1, apply(Pi1, in1)).re
  const p2 = inner(in2, apply(Pi2, in2)).re
  return { p1, p2, P: (p1 + p2) / 2, zeroGap: Math.max(norm(apply(Pi2, in1)), norm(apply(Pi1, in2))) }
}

/** The four orthonormal vectors of Eq. 8.40 spanning the subspace S. */
export function discBasis(): Vec[] {
  const sing = vscale(vadd([c(0), c(1), c(0), c(0)], vscale([c(0), c(0), c(1), c(0)], -1)), S2)
  const aBC = (a: Vec): Vec => kron(a, sing)
  const bAC = (b: Vec): Vec => apply(embed(SWAP2, 3, [0, 1]), kron(b, sing))
  const k0: Vec = [c(1), c(0)]
  const k1: Vec = [c(0), c(1)]
  const mix = (b: Vec): Vec => vscale(vadd(vscale(bAC(b), 2), vscale(aBC(b), -1)), 1 / S3)
  return [aBC(k0), mix(k0), aBC(k1), mix(k1)]
}

/** The 2x2 block of Pi0 in the basis of Eq. 8.40 (Eq. 8.41, closed form), its trace, its determinant (true and as printed), and the printed discriminant. */
export function discBlock(c1: number, c2: number): { matrix: Mat; trace: number; detTrue: number; detPrinted: number; discPrinted: number; discTrue: number; eigs: number[] } {
  const matrix: Mat = [
    [c(1 - c1 - c2 / 4), c((-S3 * c2) / 4)],
    [c((-S3 * c2) / 4), c(1 - (3 * c2) / 4)],
  ]
  const trace = matrix[0][0].re + matrix[1][1].re
  const detTrue = matrix[0][0].re * matrix[1][1].re - matrix[0][1].re * matrix[1][0].re
  const detPrinted = 1 - (2 - c1 - c2) + 0.75 * c1 * c2
  return { matrix, trace, detTrue, detPrinted, discPrinted: trace * trace - 4 * detPrinted, discTrue: trace * trace - 4 * detTrue, eigs: eigh(matrix).values }
}

/** max-abs gap between B^dagger Pi0 B (B the basis of Eq. 8.40) and two copies of the block of Eq. 8.41. */
export function discBlockGap(c1: number, c2: number): number {
  const B = fromColumns(discBasis())
  const blk = matmul(matmul(dagger(B), pi0(c1, c2)), B)
  const m = discBlock(c1, c2).matrix
  // the basis order is (b1, b2, b3, b4): the two copies are (b1, b2) and (b3, b4)
  const want: Mat = Array.from({ length: 4 }, (_, i) => Array.from({ length: 4 }, (_, j) => (Math.floor(i / 2) === Math.floor(j / 2) ? m[i % 2][j % 2] : c(0))))
  return maxDiff(blk, want)
}

/** The largest c with Pi0(c, c) >= 0, by bisection on its smallest eigenvalue (the optimum, by the symmetry of the problem and the convexity of Pi0 >= 0), and the success chance there. */
export function programmableUsdBest(psi1: Vec, psi2: Vec): { c: number; P: number } {
  let lo = 0
  let hi = 1.5
  for (let k = 0; k < 100; k++) {
    const mid = (lo + hi) / 2
    if (eigh(pi0(mid, mid)).values[0] >= -1e-13) lo = mid
    else hi = mid
  }
  const cBest = (lo + hi) / 2
  return { c: cBest, P: programmableUsd(psi1, psi2, cBest, cBest).P }
}

/** The best c1 + c2 on a grid of n + 1 points per side with Pi0 >= 0 (a test of the symmetric optimum: nothing on the grid beats 2 c). */
export function discGridBest(n: number): { c1: number; c2: number; sum: number } {
  let best = { c1: 0, c2: 0, sum: -1 }
  for (let i = 0; i <= n; i++)
    for (let j = 0; j <= n; j++) {
      const c1 = i / n
      const c2 = j / n
      if (c1 + c2 > best.sum && eigh(pi0(c1, c2)).values[0] >= -1e-12) best = { c1, c2, sum: c1 + c2 }
    }
  return best
}

/** The two states at overlap s: |0> and s|0> + sqrt(1 - s^2)|1>. */
export const pairAtOverlap = (s: number): [Vec, Vec] => [[c(1), c(0)], [c(s), c(Math.sqrt(1 - s * s))]]

/** The programmable discriminator's chance 1/3 (1 - s^2) from the 8x8 operators at c1 = c2 = 2/3, for the pair at overlap s. */
export function usdProgrammableAt(s: number): number {
  const [a, b] = pairAtOverlap(s)
  return discChances(a, b, 2 / 3, 2 / 3).P
}

/** The known-state chance 1 - s (Chapter Q14's `usd`), for the pair at overlap s. */
export function usdKnown(s: number): number {
  const [a, b] = pairAtOverlap(s)
  return usd([a, b])
}
