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
import { abs, c, ZERO } from '../../physics/complex'
import { apply, dagger, inner, matmul, type Mat, outer, type Vec } from '../../physics/linalg'
import { eigh, kronM, traceN } from '../../physics/qc/cmat'
import type { Circuit } from '../../physics/qc/circuit'
import { runCircuit } from '../../physics/qc/circuit'
import { conditionalEntropy, densityOf, entanglementEntropy, fidelity, mixtureN, partialTrace, ptranspose, reducedBloch, reducedDensity, schmidt, spectrum, vonNeumann } from '../../physics/qc/density'
import { chshMaxHorodecki, coherenceCriterion, concurrence, concurrencePure, eofFromC } from '../../physics/qc/entangle'
import { applyGate, H, I2, Rx, Ry, Rz, X } from '../../physics/qc/gates'
import { SIGMA_Y } from '../../physics/spin'
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
/** The best CHSH score ANY pair of settings reaches on the running state (Horodecki's bound): below the classical
 *  bound 2 at p = 0.5, and exactly AT it (not above) right at the chapter's own CHSH threshold p = 1/√2 — the
 *  engine-backed replacement for the review's flagged "literal compared with itself" (P-Q12-review item 4). */
const CHSH_MAX_AT_05 = chshMaxHorodecki(RHO_PB05)
const CHSH_MAX_AT_THRESH = chshMaxHorodecki(PB(Math.SQRT1_2))

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
/** The running state's own concurrence at p = 0.5 (Wootters, mixed-state route): re-keys the ⚑ P3.5(b) Werner
 *  challenge onto PB(p), per the judge ruling (P-Q12-review item 6). */
const CONC_PB_05 = concurrence(RHO_PB05)
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
/** W's own single qubit, traced down alone: ρ_A = diag(⅔, ⅓) (Bergou Eq. 3.85), so P(+z) = ⅔ — NOT axis-blind like
 *  GHZ's qubit (½I). |0⟩ ≡ |+z⟩ (qc/state.ts), so this IS P(+z): the multipartite Try-it's engine-backed number. */
const W_QUBIT_RHO_A = reducedDensity(W3, [0])
const W_QUBIT_P_UP_Z = W_QUBIT_RHO_A[0][0].re


/* ---------------------------------------------------------------------------------------------- */
/* Notes L10 pp. 47-55 (new edition): the coherence criterion, local-unitary invariance of the flipped matrix, the  */
/* conjugation, C = 2|det Λ|, the conditional entropy and the α-family ρ(α) (Q12 delta of P-709-remap-L8L11 §3.5)    */
/* ---------------------------------------------------------------------------------------------- */

/** ρ(α) = α|S⟩⟨S| + ((1−α)/2)(|00⟩⟨00| + |11⟩⟨11|), |S⟩ = Ψ⁻ (notes Eq. 3.12): real, spin-flip invariant. */
export const famRho = (alpha: number): Mat =>
  mixtureN([
    { w: alpha, psi: bell('Psi-') },
    { w: (1 - alpha) / 2, psi: ket('00') },
    { w: (1 - alpha) / 2, psi: ket('11') },
  ])
/** The polar angle (degrees) whose cosine and sine are 0.6 and 0.8: Ry(2θ)|0⟩ = 0.6|0⟩ + 0.8|1⟩ (a stage input, not a displayed number). */
export const TILT_DEG = Math.atan2(0.8, 0.6) / DEG
/** |0⟩ ⊗ (0.6|0⟩ + 0.8|1⟩): a product pair whose coherence figure is 0.32. */
export const C_PRODA: Circuit = { version: 1, qubits: 2, columns: [[{ op: 'gate', gate: 'Ry', targets: [1], params: [2 * TILT_DEG * DEG] }]] }
const PRODA: Vec = runCircuit(C_PRODA).states.at(-1)!
/** (|01⟩ − i|10⟩)/√2, built H, CNOT, X on B, S† on A: maximally entangled with complex amplitudes. */
export const C_CONJ: Circuit = {
  version: 1,
  qubits: 2,
  columns: [
    [{ op: 'gate', gate: 'H', targets: [0] }],
    [{ op: 'gate', gate: 'X', controls: [0], targets: [1] }],
    [{ op: 'gate', gate: 'X', targets: [1] }],
    [{ op: 'gate', gate: 'Sdg', targets: [0] }],
  ],
}
const PSI_CONJ: Vec = runCircuit(C_CONJ).states.at(-1)!
const YYM: Mat = kronM(SIGMA_Y, SIGMA_Y)
/** cos θ|00⟩ + sin θ|11⟩ at cos θ = 0.6: the table Λ = diag(0.6, 0.8). */
const PSI_LAM: Vec = runCircuit(psiPrep(TILT_DEG)).states.at(-1)!

/** The sorted spectrum of ρ^{T_B} before and after the fixed local gates U_A = R_y(0.7)R_z(0.4), U_B = R_x(1.1) (notes Eqs. 3.25-3.26). */
const U_LOCAL: Mat = kronM(matmul(Ry(0.7), Rz(0.4)), Rx(1.1))
const LU_GAP = Math.max(
  ...eigh(ptranspose(matmul(matmul(U_LOCAL, RHO_PB05), dagger(U_LOCAL)), [1])).values.map((v, i) => Math.abs(v - eigh(ptranspose(RHO_PB05, [1])).values[i])),
)

const COIN_PAIR: Mat = mixtureN([
  { w: 0.5, psi: ket('00') },
  { w: 0.5, psi: ket('11') },
])
const POP_PAIR: Mat = mixtureN([
  { w: 0.5, psi: ket('01') },
  { w: 0.5, psi: ket('10') },
])

/** The root of f in [lo, hi] by bisection (f changes sign once there). */
function bisect(f: (x: number) => number, lo: number, hi: number): number {
  for (let k = 0; k < 90; k++) {
    const mid = (lo + hi) / 2
    if (f(lo) * f(mid) <= 0) hi = mid
    else lo = mid
  }
  return (lo + hi) / 2
}
const sigmaEigs = (alpha: number): number[] => eigh(ptranspose(famRho(alpha), [1])).values
const FAM_SPEC_TIE = spectrum(famRho(1 / 3))

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
  q12ChshMaxAt05: CHSH_MAX_AT_05,
  q12ChshMaxAtThresh: CHSH_MAX_AT_THRESH,
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
  q12ConcPBHalf: CONC_PB_05,
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
  q12WQubitPUpZ: W_QUBIT_P_UP_Z,

  /* 12.1 q12-coherence (notes L10 pp. 48-50) */
  q12CohProdA: coherenceCriterion(densityOf(PRODA)).F,
  /** The two non-zero amplitudes of the product |0⟩ ⊗ (0.6|0⟩ + 0.8|1⟩) named in q12-coherence:b2. */
  q12ProdAAmp0: abs(PRODA[0]),
  q12ProdAAmp1: abs(PRODA[1]),
  q12CohProdEq: coherenceCriterion(densityOf(ket('++'))).F,
  q12CohPopMax: coherenceCriterion(POP_PAIR).F,
  q12CohSinglet: coherenceCriterion(densityOf(bell('Psi-'))).F,
  q12CohPhiPlus: coherenceCriterion(densityOf(bell('Phi+'))).F,
  q12CohFlip: coherenceCriterion(densityOf(applyGate(bell('Phi+'), X, [1]))).F,

  /* q12-ppt (notes L10 pp. 52-53): the flipped matrix's eigenvalues are local-unitary invariants */
  q12PtLuGap: LU_GAP,

  /* q12-concurrence (notes L10 pp. 50-51): the conjugation, and C = 2|det Λ| for a pure pair */
  q12ConjC: concurrencePure(PSI_CONJ),
  q12ConjCNo: abs(inner(PSI_CONJ, apply(YYM, PSI_CONJ))),
  q12ConcLambda: concurrencePure(PSI_LAM),
  /** The diagonal of the table Λ named in q12-concurrence:b2. */
  q12LamDiag0: abs(PSI_LAM[0]),
  q12LamDiag1: abs(PSI_LAM[3]),

  /* q12-entropy (notes L10 pp. 54-55): S(A|B) = S(AB) - S(B) */
  q12CondBell: conditionalEntropy(bell('Phi+'), [1]),
  q12CondPure30: conditionalEntropy(PSI30, [1]),
  q12CondCoin: conditionalEntropy(COIN_PAIR, [1]),

  /* q12-family: ρ(α) = α|S⟩⟨S| + ((1−α)/2)(|00⟩⟨00| + |11⟩⟨11|). A stored SIZE is the magnitude of a negative number the prose prints with its minus sign. */
  q12FamRA: Math.hypot(...reducedBloch(famRho(0.6), 0)),
  q12FamF06: coherenceCriterion(famRho(0.6)).F,
  q12FamF08: coherenceCriterion(famRho(0.8)).F,
  q12FamSigMin06: -sigmaEigs(0.6)[0],
  q12FamSigMin08: -sigmaEigs(0.8)[0],
  q12FamDet06: Math.abs(sigmaEigs(0.6).reduce((p, x) => p * x, 1)),
  q12FamLamTie: FAM_SPEC_TIE[0] - FAM_SPEC_TIE[2],
  q12FamC02: concurrence(famRho(0.2)),
  q12FamC06: concurrence(famRho(0.6)),
  q12FamC08: concurrence(famRho(0.8)),
  q12FamSAB075: conditionalEntropy(famRho(0.75), [1]),
  q12FamSAB08: -conditionalEntropy(famRho(0.8), [1]),
  q12FamSABThresh: bisect((a) => conditionalEntropy(famRho(a), [1]), 0.5, 1),
  q12FamSAB1: conditionalEntropy(famRho(1), [1]),
  q12FamEf08: eofFromC(concurrence(famRho(0.8))),
  q12FamChshThresh: bisect((a) => chshMaxHorodecki(famRho(a)) - 2, 0.4, 1),
  q12FamChshAt08: chshMaxHorodecki(famRho(0.8)),

  /* drawing-circuit cross-checks (both must read 1: the circuit drawn on stage IS the state the claims above use) */
  q12WCircuitFid: W_CIRCUIT_FID,
  q12Psi30CircuitFid: PSI30_CIRCUIT_FID,
} as const

export type ValueKey = keyof typeof V
export const claim = keyedClaim<ValueKey>()
export { claimKey, close, d, pct, tf, uf }
