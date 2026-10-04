/**
 * Chapter Q8 numbers (Physics 709, "Mixtures, the density matrix and the Bloch ball"), computed once with the
 * engine. Plan: docs/roles/proposals/P-Q8-story.md; rulings docs/roles/decisions/qc709-Q8Q9.md.
 *
 * Every number a learner reads in Q8 comes from `V` and is backed by a keyed claim (content.test.tsx "claims
 * hold"); the numpy twin of each key is in physics/__fixtures__/claims-qc709/q8.json (pipeline/claims_qc709/q8.py,
 * an independent route: explicit 2×2/4×4 matrices and closed-form Boltzmann/eigenvalue formulas, never calling
 * this file's own helpers). Keys start with `q8` and are unique across both courses.
 *
 * Additional named exports (BOX, PHI_PLUS, RHO_N, ZX, …) are plain engine objects used only to compute challenge
 * answers (Q8.ts) directly from the engine; they are not part of `V` (no displayed text reads them) and so carry
 * no numpy twin of their own — Q8.ts never types a literal for a challenge answer, it calls the engine again here.
 */
import { c, expi, mul } from '../../physics/complex'
import { type Mat, type Vec, canonicalPhase, commutator, dagger, identity, madd, mat, matmul, maxDiff, mscale, outer, vec } from '../../physics/linalg'
import { detN, eigh, traceN } from '../../physics/qc/cmat'
import type { Circuit, GateOp } from '../../physics/qc/circuit'
import { densityGap, densityOf, eigenEnsemble, ensembleUnitary, evolveRho, isDensity, mixtureN, partialTrace, purityN, reducedBloch, spectrum, thermalPolarization, type Ensemble } from '../../physics/qc/density'
import { H, pauliString } from '../../physics/qc/gates'
import { expectationN, marginal } from '../../physics/qc/measure'
import { bell, ghz, ket } from '../../physics/qc/state'
import { KET, ketFromBloch } from '../../physics/spin'
import { claimKey, close, d, keyedClaim, pct, tf, uf } from '../claimKit'

const DEG = Math.PI / 180
const abs = (z: { re: number; im: number }) => Math.hypot(z.re, z.im)
const degOf = (z: { re: number; im: number }) => Math.atan2(z.im, z.re) / DEG

/* ---------------------------------------------------------------------------------------------- */
/* q8-why: the GHZ box                                                                             */
/* ---------------------------------------------------------------------------------------------- */
/** Q7's GHZ state and its measuring circuit (Chapter Q7's own shorthand, reused: read qubit 3, the one the box
 * leaves behind — ruling qc709-Q8Q9.md / P-Q8-story §12 Q2). */
const g = (gate: GateOp['gate'], target: number, param?: number): GateOp => ({ op: 'gate', gate, targets: [target], ...(param !== undefined ? { params: [param] } : {}) })
const cx = (ctrl: number, target: number): GateOp => ({ op: 'gate', gate: 'X', targets: [target], controls: [ctrl] })
const mOp = (qubit: number, bit: number) => ({ op: 'measure' as const, qubit, bit })
export const C_GHZ: Circuit = { version: 1, qubits: 3, init: '000', wires: ['1', '2', '3'], columns: [[g('H', 0)], [cx(0, 1)], [cx(0, 2)]] }
export const C_GHZM = (q: number): Circuit => ({ ...C_GHZ, clbits: 1, columns: [...C_GHZ.columns, [mOp(q, 0)]] })

const GHZ3 = ghz(3)
/** The box: qubits 1, 2 (engine q0, q1) after qubit 3 (q2) is read and the record lost — ρ₁₂ = Tr₃|GHZ⟩⟨GHZ| (p. 35). */
const BOX: Mat = partialTrace(densityOf(GHZ3), [2])
const BOX_DIRECT: Mat = mixtureN([
  { w: 0.5, psi: ket('00') },
  { w: 0.5, psi: ket('11') },
])
const PHI_PLUS: Vec = bell('00+11')
const RHO_PHI: Mat = densityOf(PHI_PLUS)
const PXX = pauliString('XX')
const PYY = pauliString('YY')
const PZZ = pauliString('ZZ')
const traceOf = (A: Mat, rho: Mat) => traceN(matmul(A, rho)).re

/* ---------------------------------------------------------------------------------------------- */
/* q8-pure-rho / q8-trace-rule: one pure state, ρ = |ψ⟩⟨ψ|                                          */
/* ---------------------------------------------------------------------------------------------- */
/** Unit 3.2's running example: θ = 60°, φ = 45°. */
const N: Vec = ketFromBloch(60 * DEG, 45 * DEG)
const RHO_N: Mat = densityOf(N)
const RHO_N_R = reducedBloch(RHO_N, 0) // (Tr Xρ, Tr Yρ, Tr Zρ)
/** Ĥ = (ħω/2) Z, in units of ħω (H gate is reserved for the Hadamard elsewhere in 709). */
const Hs: Mat = mscale(pauliString('Z'), 0.5)
const RHO_N_QUARTER: Mat = evolveRho(Hs, RHO_N, Math.PI / 2)
const RHO_N_QUARTER_R = reducedBloch(RHO_N_QUARTER, 0)
const COMM_H_RHO_N = commutator(Hs, RHO_N)
const P0: Mat = outer(ket('0'), ket('0'))
const P1: Mat = outer(ket('1'), ket('1'))
const NONSEL: Mat = madd(matmul(matmul(P0, RHO_N), P0), matmul(matmul(P1, RHO_N), P1))

/* ---------------------------------------------------------------------------------------------- */
/* q8-mixed: ensembles, purity, the Bloch ball, a thermal box, HW2 P4                               */
/* ---------------------------------------------------------------------------------------------- */
/** Half |0⟩, half |+⟩ (notes p. 36–37). */
const ZX: Mat = mixtureN([
  { w: 0.5, psi: ket('0') },
  { w: 0.5, psi: ket('+') },
])
const ZX_R = reducedBloch(ZX, 0)
/** The centre of the ball, built two ways. */
const RHO_HALF_I: Mat = mscale(identity(2), 0.5)
/** A one-qubit ρ at |r| = 0.5 along z, for the generic "purity vs |r|" claim of Unit 8.5. */
const RHO_R_HALF: Mat = [
  [{ re: 0.75, im: 0 }, { re: 0, im: 0 }],
  [{ re: 0, im: 0 }, { re: 0.25, im: 0 }],
]
/** A thermal box at x = E_Z / k_BT = 2 (Bergou p. 36): p↑ = (1 + tanh(x/2))/2. */
const THERM_X = 2
const THERM_RZ = thermalPolarization(THERM_X)
const THERM_P_UP = (1 + THERM_RZ) / 2
const THERM_P_DOWN = 1 - THERM_P_UP
/** HW2 P4: ρ = p|1⟩⟨1| + (1 − p)|+⟩⟨+|, at p = 0.25. */
const P4_P = 0.25
const RHO_P4: Mat = mixtureN([
  { w: P4_P, psi: ket('1') },
  { w: 1 - P4_P, psi: ket('+') },
])
const RHO_P4_R = reducedBloch(RHO_P4, 0)

/* ---------------------------------------------------------------------------------------------- */
/* q8-ball: ρ = ½(I + r·σ), positivity, a bad matrix                                                */
/* ---------------------------------------------------------------------------------------------- */
const BAD: Mat = mat([
  [0.5, Math.SQRT1_2],
  [Math.SQRT1_2, 0.5],
])
const BAD_R = reducedBloch(BAD, 0)
const BAD_EIG = eigh(BAD).values // ascending

/* ---------------------------------------------------------------------------------------------- */
/* q8-recipes: eigen-recipes, convexity, unitary freedom, the trine                                 */
/* ---------------------------------------------------------------------------------------------- */
const Z_POLES: Ensemble = { p: [0.5, 0.5], kets: [ket('0'), ket('1')] }
const X_POLES: Ensemble = { p: [0.5, 0.5], kets: [ket('+'), ket('-')] }
const Y_POLES: Ensemble = { p: [0.5, 0.5], kets: [KET['+y'], KET['-y']] }
const HALF_I_FROM_Z = mixtureN(Z_POLES.p.map((w, i) => ({ w, psi: Z_POLES.kets[i] })))
const HALF_I_FROM_X = mixtureN(X_POLES.p.map((w, i) => ({ w, psi: X_POLES.kets[i] })))
const HALF_I_FROM_Y = mixtureN(Y_POLES.p.map((w, i) => ({ w, psi: Y_POLES.kets[i] })))
const ZX_ENSEMBLE: Ensemble = { p: [0.5, 0.5], kets: [ket('0'), ket('+')] }
const ZX_EIGEN = eigenEnsemble(ZX) // descending p
const U_PLUS = canonicalPhase(ZX_EIGEN.kets[0])
const U_MINUS = canonicalPhase(ZX_EIGEN.kets[1])
const RHO_FROM_EIGEN = mixtureN([
  { w: ZX_EIGEN.p[0], psi: U_PLUS },
  { w: ZX_EIGEN.p[1], psi: U_MINUS },
])
const U_FREE_POLES = ensembleUnitary(Z_POLES, X_POLES)
const U_FREE_ZX = ensembleUnitary(ZX_ENSEMBLE, { p: ZX_EIGEN.p, kets: [U_PLUS, U_MINUS] })
/** A convex mix of two recipes' matrices, at t = ¼ and t = ¾ (D11). */
const CONV_RHO_025: Mat = mixtureN([
  { w: 0.25, psi: ket('0') },
  { w: 0.75, psi: ket('+') },
])
/** The trine: three states 120° apart on the x–z great circle, equal weight. */
const TRINE_KETS: Vec[] = [ketFromBloch(0, 0), ketFromBloch(120 * DEG, 0), ketFromBloch(120 * DEG, 180 * DEG)]
const TRINE: Ensemble = { p: [1 / 3, 1 / 3, 1 / 3], kets: TRINE_KETS }
const TRINE_RHO = mixtureN(TRINE.p.map((w, i) => ({ w, psi: TRINE.kets[i] })))
const TRINE_R = reducedBloch(TRINE_RHO, 0)
const U_TRINE = ensembleUnitary(TRINE, Z_POLES)

/* ---------------------------------------------------------------------------------------------- */
/* Challenge-only states (not part of V; no displayed text reads them)                              */
/* ---------------------------------------------------------------------------------------------- */
/** q8-p-diag/coh: ψ = (√3|0⟩ + |1⟩)/2. */
export const RHO_PSI1: Mat = densityOf(vec(Math.sqrt(3) / 2, 0.5))
/** q8-p-minus: the coherence of |+⟩⟨+| and |−⟩⟨−|. */
export const RHO_PLUS: Mat = outer(ket('+'), ket('+'))
export const RHO_MINUS: Mat = outer(ket('-'), ket('-'))
export { BOX, PHI_PLUS, RHO_N, RHO_N_QUARTER, ZX, RHO_P4, BAD, N, Hs, GHZ3 }

export const V = {
  /* reusable constants (recurring exact values, as other chapters' q#Half / q#R2) */
  q8Half: 0.5,
  q8NegHalf: -0.5,
  q8Quarter: 0.25,
  q8NegQuarter: -0.25,
  q8ThreeQuarter: 0.75,
  q8Eighth: 0.125,
  q8Third: 1 / 3,
  q8R2: Math.SQRT1_2,
  q8Sqrt3_2: Math.sqrt(3) / 2,

  /* q8-why: the GHZ box */
  q8GhzP3: marginal(GHZ3, [2])[0],
  q8BoxTr3Gap: densityGap(BOX, BOX_DIRECT),
  q8BoxCoh: abs(BOX[0][3]),
  q8BoxXX: traceOf(PXX, BOX),
  q8BoxYY: traceOf(PYY, BOX),
  q8BoxZZ: traceOf(PZZ, BOX),
  q8BoxPur: purityN(BOX),
  q8BoxArrowsZero: Math.hypot(...reducedBloch(BOX, 0)) + Math.hypot(...reducedBloch(BOX, 1)),
  q8PhiXX: expectationN(PHI_PLUS, PXX).re,
  q8PhiYY: expectationN(PHI_PLUS, PYY).re,
  q8PhiZZ: expectationN(PHI_PLUS, PZZ).re,
  q8PhiCoh: abs(RHO_PHI[0][3]),
  q8PhiPur: purityN(RHO_PHI),
  q8PhiArrowsZero: Math.hypot(...reducedBloch(RHO_PHI, 0)) + Math.hypot(...reducedBloch(RHO_PHI, 1)),

  /* q8-pure-rho */
  q8RhoN00: RHO_N[0][0].re,
  q8RhoN11: RHO_N[1][1].re,
  q8RhoN01Abs: abs(RHO_N[0][1]),
  q8RhoN01Deg: degOf(RHO_N[0][1]),
  q8RhoNTr: traceN(RHO_N).re,
  q8RhoNSqGap: densityGap(matmul(RHO_N, RHO_N), RHO_N),
  q8RhoNHermGap: maxDiff(RHO_N, dagger(RHO_N)),
  q8PhaseGap: densityGap(densityOf(N.map((x) => mul(x, expi(37 * DEG)))), RHO_N),

  /* q8-trace-rule */
  q8TrXN: RHO_N_R[0],
  q8TrYN: RHO_N_R[1],
  q8TrZN: RHO_N_R[2],
  q8VNComm01Abs: abs(COMM_H_RHO_N[0][1]),
  q8VNCommDiagGap: Math.hypot(COMM_H_RHO_N[0][0].re, COMM_H_RHO_N[1][1].re),
  q8VNCheck: Math.hypot(COMM_H_RHO_N[0][1].re - RHO_N[0][1].re, COMM_H_RHO_N[0][1].im - RHO_N[0][1].im),
  q8RhoQuarterDiag0: RHO_N_QUARTER[0][0].re,
  q8RhoQuarterDiag1: RHO_N_QUARTER[1][1].re,
  q8RhoQuarter01Abs: abs(RHO_N_QUARTER[0][1]),
  q8RhoQuarter01Deg: degOf(RHO_N_QUARTER[0][1]),
  q8QuarterTurnDeg: Math.abs(degOf(RHO_N_QUARTER[0][1]) - degOf(RHO_N[0][1])),
  q8NQuarterRx: RHO_N_QUARTER_R[0],
  q8NQuarterRy: RHO_N_QUARTER_R[1],
  q8NQuarterRz: RHO_N_QUARTER_R[2],
  q8MeasP0: traceOf(P0, RHO_N),
  q8MeasP1: traceOf(P1, RHO_N),
  q8NonSelOffDiag: Math.hypot(NONSEL[0][1].re, NONSEL[0][1].im),
  q8NonSel0: NONSEL[0][0].re,
  q8NonSel1: NONSEL[1][1].re,
  q8CommDiagGap: Math.hypot(commutator(Hs, [[RHO_N_QUARTER[0][0], c(0, 0)], [c(0, 0), RHO_N_QUARTER[1][1]]])[0][0].re, 0),

  /* q8-mixed */
  q8ZXRx: ZX_R[0],
  q8ZXRy: ZX_R[1],
  q8ZXRz: ZX_R[2],
  q8ZXRLen: Math.hypot(...ZX_R),
  q8ZX00: ZX[0][0].re,
  q8ZX01: ZX[0][1].re,
  q8ZX11: ZX[1][1].re,
  q8ZX00Sq: ZX[0][0].re ** 2,
  q8ZX01Sq: ZX[0][1].re ** 2,
  q8ZXPur: purityN(ZX),
  q8ZXDet: detN(ZX).re,
  q8HalfIGapZ: densityGap(HALF_I_FROM_Z, RHO_HALF_I),
  q8HalfIGapX: densityGap(HALF_I_FROM_X, RHO_HALF_I),
  q8HalfIGapY: densityGap(HALF_I_FROM_Y, RHO_HALF_I),
  q8ThermX: THERM_X,
  q8ThermPUp: THERM_P_UP,
  q8ThermPDown: THERM_P_DOWN,
  q8ThermSz: THERM_RZ / 2,
  q8ThermR: THERM_RZ,
  q8P4In: P4_P,
  q8P4Pur: purityN(RHO_P4),
  q8P4Rho00: RHO_P4[0][0].re,
  q8P4Rho01: RHO_P4[0][1].re,
  q8P4Rho11: RHO_P4[1][1].re,
  q8P4SigX: RHO_P4_R[0],
  q8P4SigY: RHO_P4_R[1],
  q8P4SigZ: RHO_P4_R[2],
  q8PurRCentre: purityN(RHO_HALF_I),
  q8PurRHalf: purityN(RHO_R_HALF),
  q8PurRSurface: purityN(RHO_N),

  /* q8-ball */
  q8ZXA0: traceN(ZX).re / 2,
  q8ZXAx: ZX_R[0] / 2,
  q8ZXAy: ZX_R[1] / 2 + 0,
  q8ZXAz: ZX_R[2] / 2,
  q8NDet: detN(RHO_N).re,
  q8NEigLarge: spectrum(RHO_N)[0],
  q8NEigSmall: spectrum(RHO_N)[1],
  q8NRLen: Math.hypot(...reducedBloch(RHO_N, 0)),
  q8TrSigSigDiag: traceN(matmul(pauliString('X'), pauliString('X'))).re,
  q8TrSigSigOff: traceN(matmul(pauliString('X'), pauliString('Z'))).re,
  q8BadRx: BAD_R[0],
  q8BadRLen: Math.hypot(...BAD_R),
  q8BadDet: detN(BAD).re,
  q8BadEigLarge: BAD_EIG[1],
  q8BadEigSmall: BAD_EIG[0],
  q8BadEigSmallAbs: Math.abs(BAD_EIG[0]),
  q8BadIsDensity: isDensity(BAD) ? 1 : 0,

  /* q8-recipes */
  q8HalfGapZ: densityGap(HALF_I_FROM_Z, RHO_HALF_I),
  q8HalfGapX: densityGap(HALF_I_FROM_X, RHO_HALF_I),
  q8HalfGapY: densityGap(HALF_I_FROM_Y, RHO_HALF_I),
  q8ZXEigLarge: ZX_EIGEN.p[0],
  q8ZXEigSmall: ZX_EIGEN.p[1],
  q8UPlus0: U_PLUS[0].re,
  q8UPlus1: U_PLUS[1].re,
  q8UMinus0: U_MINUS[0].re,
  q8UMinus1: U_MINUS[1].re,
  q8UHEigPlus: expectationN(U_PLUS, H).re,
  q8UHEigMinus: expectationN(U_MINUS, H).re,
  q8EigRecipeGap: densityGap(RHO_FROM_EIGEN, ZX),
  q8ConvRx025: reducedBloch(CONV_RHO_025, 0)[0],
  q8ConvRz025: reducedBloch(CONV_RHO_025, 0)[2],
  q8ConvPur025: purityN(CONV_RHO_025),
  q8UfreePolesGap: maxDiff(U_FREE_POLES, H),
  q8UfreeZXGap: maxDiff(U_FREE_ZX, H),
  q8TrineGap: densityGap(TRINE_RHO, RHO_HALF_I),
  q8TrineRLen: Math.hypot(...TRINE_R),
  q8TrineUUnitary: maxDiff(matmul(dagger(U_TRINE), U_TRINE), identity(U_TRINE.length)),
} as const

export type ValueKey = keyof typeof V
export const claim = keyedClaim<ValueKey>()
export { claimKey, close, d, pct, tf, uf }
