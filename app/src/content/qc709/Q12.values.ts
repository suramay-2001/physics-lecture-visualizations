/**
 * Chapter Q12 numbers (Physics 709, "Detecting and measuring entanglement"), computed once with the engine. Plan:
 * docs/roles/proposals/P-Q12-story.md; rulings docs/roles/decisions/qc709-Q10Q13.md, qc709-remap.md.
 *
 * Every number a learner reads in Q12 comes from `V` and is backed by a keyed claim (content.test.tsx "claims
 * hold"); the numpy twin of each key is in physics/__fixtures__/claims-qc709/q12.json (pipeline/claims_qc709/q12.py,
 * an independent route: explicit 4×4/8×8 matrices, `np.linalg.eigh`, an axis-swap partial transpose, Wootters
 * concurrence by the eigenvalues of ρρ̃, never calling this file's own helpers). Keys start with `q12` and are
 * unique across both courses.
 *
 * E2's `physics/qc/entangle.ts` has `isPPT`, `negativity`, `concurrencePure`, `concurrence`, `eofFromC` (the merged
 * set; see docs/roles/interface-changes.md W-709 #16). The plan's §9.1 also named `pptSpectrum`, `witnessFromPPT`,
 * `procrustean` and `ckw`, which did NOT land in that merge — this file computes them from the merged primitives
 * (`ptranspose`, `eigh` via `spectrum`/raw eigensolve, `reducedDensity`) by the same route a future wrapper would,
 * exactly as `Q9.values.ts` built `rhoZ`/`traceOf` from E1 primitives. Per `app/src/stage/**` NOT being touched,
 * nothing here calls a function that does not exist.
 */
import { c, ZERO } from '../../physics/complex'
import { apply, matmul, type Mat, outer, type Vec } from '../../physics/linalg'
import { eigh, kronM, traceN } from '../../physics/qc/cmat'
import type { Circuit } from '../../physics/qc/circuit'
import { runCircuit } from '../../physics/qc/circuit'
import { entanglementEntropy, fidelity, mixtureN, partialTrace, ptranspose, reducedDensity, schmidt, spectrum, vonNeumann } from '../../physics/qc/density'
import { concurrence, concurrencePure, eofFromC } from '../../physics/qc/entangle'
import { H, I2 } from '../../physics/qc/gates'
import { bell, coefMatrix, ghz, ket, wState } from '../../physics/qc/state'
import { claimKey, close, d, keyedClaim, pct, tf, uf } from '../claimKit'

const DEG = Math.PI / 180

/* ---------------------------------------------------------------------------------------------- */
/* Local helpers for the three E2 names the merge did not ship (pptSpectrum, witnessFromPPT,        */
/* procrustean, ckw): built from the merged primitives only, every number traced to an engine call. */
/* ---------------------------------------------------------------------------------------------- */

/** ρ^{T_B} for a 2-qubit ρ (the second qubit, q1, is Bob — physics/qc/entangle.ts's own convention). */
const ptB = (rho: Mat): Mat => ptranspose(rho, [1])

/** The RAW (unclamped) eigenvalues of ρ^{T_B}, ascending — `density.ts`'s own `spectrum()` clamps negatives away,
 *  which would hide the Peres test's whole point, so this calls `eigh` directly on the same matrix. */
function pptSpectrum(rho: Mat): number[] {
  return eigh(ptB(rho)).values
}

/** `isPPT`/`negativity`'s own witness construction (Bergou Eq. 3.27): the eigenvector |η⟩ of ρ^{T_B}'s most negative
 *  eigenvalue, and W = (|η⟩⟨η|)^{T_B} (ptranspose is an involution, so applying it again undoes it exactly). */
function witnessFromPPT(rho: Mat): { W: Mat; lambda: number; eta: Vec } {
  const { values, vectors } = eigh(ptB(rho))
  const lambda = values[0]
  const eta = vectors[0]
  const W = ptB(outer(eta, eta))
  return { W, lambda, eta }
}

/**
 * U_A on wires (A, A'): the {|00⟩, |01⟩} block rotates by tanθ, √(1 − tan²θ) (0 ≤ θ ≤ π/4, so tanθ ≤ 1); the
 * {|10⟩, |11⟩} block is untouched (Bergou §3.6.2). A real orthogonal 4×4 matrix: its columns are orthonormal, so
 * it is unitary.
 */
function uaMatrix(thetaDeg: number): [number, number][][] {
  const t = Math.tan(thetaDeg * DEG)
  const s = Math.sqrt(Math.max(0, 1 - t * t))
  const re = (x: number): [number, number] => [x, 0]
  return [
    [re(t), re(s), re(0), re(0)],
    [re(s), re(-t), re(0), re(0)],
    [re(0), re(0), re(1), re(0)],
    [re(0), re(0), re(0), re(1)],
  ]
}

/**
 * The Procrustean circuit (Bergou §3.6.2; wires A, A′, B): prepare cosθ|00⟩ + sinθ|11⟩ on A, B (an Ry on A then a
 * CNOT A → B), append the ancilla A′ = |0⟩ (already there), apply U_A on (A, A′), then measure A′. Reused by
 * `Q12.story.ts` for the `circuit`/`amplitudes` stages, so the picture and the numbers below are the SAME run.
 */
function procCircuit(thetaDeg: number): Circuit {
  return {
    version: 1,
    qubits: 3,
    clbits: 1,
    wires: ['A', "A'", 'B'],
    columns: [
      [{ op: 'gate', gate: 'Ry', targets: [0], params: [2 * thetaDeg * DEG] }],
      [{ op: 'gate', gate: 'X', controls: [0], targets: [2] }],
      [{ op: 'unitary', matrix: uaMatrix(thetaDeg), targets: [0, 1] }],
      [{ op: 'measure', qubit: 1, bit: 0 }],
    ],
  }
}

/**
 * Run `procCircuit` to both branches: outcome 0 on A′ (probability ps = 2sin²θ) leaves the A,B pair in Φ+; outcome
 * 1 leaves |00⟩ (erratum B9 — not |10⟩). `coefMatrix(post, [1])` cuts the post-measurement 3-qubit state by A′
 * (row index); the branch's own row is the (already normalized) 2-qubit A,B ket, in the SAME ordering `ket`/`bell`
 * use.
 */
function procrustean(circuit: Circuit): { ps: number; success: Vec; fail: Vec } {
  const r0 = runCircuit(circuit, { outcomes: '0' })
  const success = coefMatrix(r0.states[r0.states.length - 1], [1])[0]
  // At θ = 45° the failure branch has probability exactly 0 (a maximal pair never fails): `runCircuit` then
  // throws rather than hand back an undefined state, so fall back to the branch's own closed form, |00⟩ (erratum
  // B9), which is what the ZERO-probability branch would have been had it occurred.
  let fail: Vec = ket('00')
  try {
    const r1 = runCircuit(circuit, { outcomes: '1' })
    fail = coefMatrix(r1.states[r1.states.length - 1], [1])[1]
  } catch {
    /* probability 0 branch: keep the closed-form |00⟩ */
  }
  return { ps: r0.prob, success, fail }
}

/**
 * A 2-qubit circuit preparing cosθ|00⟩ + sinθ|11⟩ exactly (an Ry on A then a CNOT A → B): the `AmpSource`
 * `{circuit, upTo: 2}` route Q12.story.ts uses everywhere it needs this family as a `matrix`/`amplitudes` source
 * (those kinds have no `family: 'cos-sin'` shorthand of their own — only `two-qubit` does).
 */
export function psiPrep(thetaDeg: number): Circuit {
  return {
    version: 1,
    qubits: 2,
    columns: [
      [{ op: 'gate', gate: 'Ry', targets: [0], params: [2 * thetaDeg * DEG] }],
      [{ op: 'gate', gate: 'X', controls: [0], targets: [1] }],
    ],
  }
}

/**
 * The real orthogonal (Householder) reflection that maps |0…0⟩ to a given REAL unit vector `target`: H = I −
 * 2vvᵀ/(v·v), v = target − |0…0⟩; H|0…0⟩ = target exactly, and H is unitary for ANY target (a reflection is its own
 * inverse). The one-op `unitary` circuit this builds is how `Q12.story.ts` draws the W state (not expressible as a
 * two-term `bell(...)` content string) as a real, re-runnable `circuit`/`amplitudes` source.
 */
function householderTo(target: Vec): [number, number][][] {
  const n = target.length
  const v = target.map((z, i) => z.re - (i === 0 ? 1 : 0))
  const vv = v.reduce((s, x) => s + x * x, 0)
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => [(i === j ? 1 : 0) - (vv > 1e-14 ? (2 * v[i] * v[j]) / vv : 0), 0] as [number, number]))
}

/** A 3-qubit circuit whose single `unitary` op sends |000⟩ to exactly `wState(3)` (the Householder reflection above). */
export const C_WSTATE: Circuit = { version: 1, qubits: 3, columns: [[{ op: 'unitary', matrix: householderTo(wState(3)), targets: [0, 1, 2] }]] }

/** The CKW monogamy inequality's three concurrences for a 3-qubit pure state (Bergou Eq. 3.84): the two pairwise
 *  Wootters concurrences, and C_{A:BC} = 2√(λ1λ2) from A's own two reduced eigenvalues (treating BC as one
 *  effective "qubit" — A's Schmidt rank across A | BC is at most 2, since A alone is a single qubit). */
function ckwOf(psi3: Vec): { cAB: number; cAC: number; cAbc: number; lhs: number; rhs: number } {
  const cAB = concurrence(reducedDensity(psi3, [0, 1]))
  const cAC = concurrence(reducedDensity(psi3, [0, 2]))
  const specA = spectrum(reducedDensity(psi3, [0]))
  const cAbc = 2 * Math.sqrt(Math.max(0, specA[0] * specA[1]))
  return { cAB, cAC, cAbc, lhs: cAB * cAB + cAC * cAC, rhs: cAbc * cAbc }
}

/** |ψ(θ)⟩ = cosθ|00⟩ + sinθ|11⟩, θ in degrees. */
const cosSin = (thetaDeg: number): Vec => {
  const t = thetaDeg * DEG
  return [c(Math.cos(t)), ZERO, ZERO, c(Math.sin(t))]
}

/* ---------------------------------------------------------------------------------------------- */
/* The running families (plan's stage shorthand §0: PB(p), W(w), PSI(θ), GHZ, W3)                   */
/* ---------------------------------------------------------------------------------------------- */

/** PB(p) = p|Ψ−⟩⟨Ψ−| + (1−p)|00⟩⟨00| (Bergou Eq. 3.23). */
const PB = (p: number): Mat => mixtureN([{ w: p, psi: bell('Psi-') }, { w: 1 - p, psi: ket('00') }])
/** The Werner state w|Ψ−⟩⟨Ψ−| + (1−w)¼I. */
const WER = (w: number): Mat =>
  mixtureN([
    { w, psi: bell('Psi-') },
    { w: (1 - w) / 4, psi: ket('00') },
    { w: (1 - w) / 4, psi: ket('01') },
    { w: (1 - w) / 4, psi: ket('10') },
    { w: (1 - w) / 4, psi: ket('11') },
  ])

const PSI30: Vec = cosSin(30)
const RHO_PB05: Mat = PB(0.5)
const GHZ3: Vec = ghz(3)
const W3: Vec = wState(3)

/** A separable example for the witness's "non-negative on separable" side: a coin mixture of |00⟩ and |+−⟩. */
const RHO_SEP: Mat = mixtureN([
  { w: 0.5, psi: ket('00') },
  { w: 0.5, psi: ket('+-') },
])

/* ---------------------------------------------------------------------------------------------- */
/* 12.1 q12-ppt                                                                                     */
/* ---------------------------------------------------------------------------------------------- */

const PPT_SPEC_05 = pptSpectrum(RHO_PB05) // ascending: [-0.1036, 0.25, 0.25, 0.6036]
const LAM_MIN_AT = [0.2, 0.5, Math.SQRT1_2, 1].map((p) => pptSpectrum(PB(p))[0])
const WER_PPT_AT = [1 / 3, 0.5, 1].map((w) => pptSpectrum(WER(w))[0])
const SEP_PT_SPEC = pptSpectrum(RHO_SEP)

/* ---------------------------------------------------------------------------------------------- */
/* 12.2 q12-witness                                                                                 */
/* ---------------------------------------------------------------------------------------------- */

const WITNESS = witnessFromPPT(RHO_PB05)
const WITNESS_TR = traceN(matmul(RHO_PB05, WITNESS.W)).re

/* ---------------------------------------------------------------------------------------------- */
/* 12.3 q12-locc                                                                                    */
/* ---------------------------------------------------------------------------------------------- */

export const C_PROC30 = procCircuit(30)
export const C_PROC45 = procCircuit(45)
const PROC_30 = procrustean(C_PROC30)
const PROC_45 = procrustean(C_PROC45)

/* ---------------------------------------------------------------------------------------------- */
/* 12.4 q12-entropy                                                                                 */
/* ---------------------------------------------------------------------------------------------- */

const RHO_A_30 = reducedDensity(PSI30, [0])
const E_30 = entanglementEntropy(PSI30, [0])
/** After a Hadamard on qubit A: a local unitary, so S(ρ_A) is unchanged (Bergou §3.7.1). */
const PSI30_AFTER_H: Vec = apply(kronM(H, I2), PSI30)
const E_30_AFTER_H = entanglementEntropy(PSI30_AFTER_H, [0])
const E_ADD = vonNeumann(kronM(RHO_A_30, RHO_A_30))
const WERNER_SA = vonNeumann(partialTrace(WER(0.5), [1]))
/** A product state's half is pure: E = 0, for any product (here |01⟩). */
const E_PROD = entanglementEntropy(ket('01'), [0])
const E_BELL = entanglementEntropy(bell('Phi+'), [0])

/* ---------------------------------------------------------------------------------------------- */
/* 12.5 q12-concurrence                                                                             */
/* ---------------------------------------------------------------------------------------------- */

const SCHMIDT_30 = schmidt(PSI30, [0]) // coeffs (amplitude-like); squared = the Schmidt weights (probabilities)
const CONC_PURE_30 = concurrencePure(PSI30)
const A_30 = coefMatrix(PSI30, [0]) // the 2x2 coefficient matrix of |ψ(30°)⟩
const detA30 = A_30[0][0].re * A_30[1][1].re - A_30[0][1].re * A_30[1][0].re
const TWO_DET_A = 2 * Math.abs(detA30)
const EOF_C_30 = eofFromC(CONC_PURE_30)
const WER_CONC_AT = [1 / 3, 0.5, 1].map((w) => concurrence(WER(w)))

/* ---------------------------------------------------------------------------------------------- */
/* 12.6 q12-multipartite                                                                            */
/* ---------------------------------------------------------------------------------------------- */

/** Cross-check the two drawing circuits against the direct vectors the claims above use (fidelity 1 = exact match). */
const W_CIRCUIT_FID = fidelity(runCircuit(C_WSTATE).states[1], W3)
const PSI30_CIRCUIT_FID = fidelity(runCircuit(psiPrep(30)).states[2], PSI30)

const GHZ_PAIR_RHO = reducedDensity(GHZ3, [0, 1])
const GHZ_PAIR_CONC = concurrence(GHZ_PAIR_RHO)
const GHZ_PAIR_SPEC = spectrum(GHZ_PAIR_RHO) // descending, clamped: [0.5, 0.5, 0, 0]
const CKW = ckwOf(W3)

export const V = {
  /* reusable constants */
  q12Half: 0.5,
  q12Quarter: 0.25,
  q12Third: 1 / 3,
  q12R2: Math.SQRT1_2,

  /* 12.1 q12-ppt */
  q12BergRho0500: RHO_PB05[0][0].re,
  q12BergRho0511: RHO_PB05[1][1].re,
  q12BergRho0512Abs: Math.hypot(RHO_PB05[1][2].re, RHO_PB05[1][2].im),
  q12BergPptSpec05Min: PPT_SPEC_05[0],
  q12BergPptSpec05Mid: PPT_SPEC_05[1],
  q12BergPptSpec05Max: PPT_SPEC_05[3],
  q12BergPptSpec05Sum: PPT_SPEC_05.reduce((s, x) => s + x, 0),
  q12BergLamMinAt02: LAM_MIN_AT[0],
  q12BergLamMinAt05: LAM_MIN_AT[1],
  q12BergLamMinAtChsh: LAM_MIN_AT[2],
  q12BergLamMinAt1: LAM_MIN_AT[3],
  q12ChshThresh: Math.SQRT1_2,
  q12WerPptAtThird: WER_PPT_AT[0],
  q12WerPptAtHalf: WER_PPT_AT[1],
  q12WerPptAt1: WER_PPT_AT[2],
  q12SepPtSpecMin: Math.min(...SEP_PT_SPEC),

  /* 12.2 q12-witness */
  q12WitnessLamMin: WITNESS.lambda,
  q12WitnessVal: WITNESS_TR,
  /** The size shown in prose ("$\langle W\rangle = -0.104$" reads naturally with the minus inline, but the
   *  sentence sometimes gives just the magnitude, e.g. "has size 0.104"): a separate key, as Q9's `…Abs` keys. */
  q12WitnessValAbs: Math.abs(WITNESS_TR),
  q12WitnessIsLamMin: close(WITNESS_TR, WITNESS.lambda, 1e-9) ? 1 : 0,

  /* 12.3 q12-locc */
  q12ProcPs30: PROC_30.ps,
  q12ProcPs45: PROC_45.ps,
  q12ProcSuccessFidToPhiPlus: fidelity(PROC_30.success, bell('Phi+')),
  q12ProcFailFidToKet00: fidelity(PROC_30.fail, ket('00')),

  /* 12.4 q12-entropy */
  q12SchmidtLam30Large: SCHMIDT_30.coeffs[0] ** 2,
  q12SchmidtLam30Small: SCHMIDT_30.coeffs[1] ** 2,
  q12E30: E_30,
  q12E30Local: E_30_AFTER_H,
  q12Eadd: E_ADD,
  q12WernerSA: WERNER_SA,
  q12Eprod: E_PROD,
  q12Ebell: E_BELL,

  /* 12.5 q12-concurrence */
  q12ConcPure30: CONC_PURE_30,
  q12TwoDetA: TWO_DET_A,
  q12EofC30: EOF_C_30,
  q12WerConcAtThird: WER_CONC_AT[0],
  q12WerConcAtHalf: WER_CONC_AT[1],
  q12WerConcAt1: WER_CONC_AT[2],

  /* 12.6 q12-multipartite */
  q12GhzPairConc: GHZ_PAIR_CONC,
  q12GhzPairSpecMax: GHZ_PAIR_SPEC[0],
  q12GhzPairSpecMin: GHZ_PAIR_SPEC[3],
  q12WpairConc: CKW.cAB,
  q12WacConc: CKW.cAC,
  q12CAbc: CKW.cAbc,
  q12CkwLeft: CKW.lhs,
  q12CkwRight: CKW.rhs,

  /* drawing-circuit cross-checks (both must read 1: the circuit drawn on stage IS the state the claims above use) */
  q12WCircuitFid: W_CIRCUIT_FID,
  q12Psi30CircuitFid: PSI30_CIRCUIT_FID,
} as const

export type ValueKey = keyof typeof V
export const claim = keyedClaim<ValueKey>()
export { claimKey, close, d, pct, tf, uf }
