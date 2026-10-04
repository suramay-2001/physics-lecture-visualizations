/**
 * Chapter Q9 numbers (Physics 709, "Parts of a whole: reduced states, entropy, Schmidt"), computed once with the
 * engine. Plan: docs/roles/proposals/P-Q9-story.md; rulings docs/roles/decisions/qc709-Q8Q9.md.
 *
 * Every number a learner reads in Q9 comes from `V` and is backed by a keyed claim (content.test.tsx "claims
 * hold"); the numpy twin of each key is in physics/__fixtures__/claims-qc709/q9.json (pipeline/claims_qc709/q9.py,
 * an independent route: explicit 2x2/4x4/8x8 matrices and closed-form SVD/eigenvalue routines, never calling this
 * file's own helpers). Keys start with `q9` and are unique across both courses.
 *
 * The running pair P is Unit 8.4's mixture (½|0⟩⟨0| + ½|+⟩⟨+|, imported as `ZX` from Q8.values.ts) purified by a
 * controlled-H circuit (plan §0, ruling 3): Q9 and Q8 share one set of numbers.
 */
import { c, type C, ZERO } from '../../physics/complex'
import {
  type Mat,
  type Vec,
  apply,
  canonicalPhase,
  dagger,
  fromColumns,
  identity,
  inner,
  mat,
  matmul,
  maxDiff,
  norm2,
} from '../../physics/linalg'
import { eigh, kronM } from '../../physics/qc/cmat'
import type { Circuit, GateOp } from '../../physics/qc/circuit'
import { runCircuit } from '../../physics/qc/circuit'
import {
  densityGap,
  densityOf,
  type Ensemble,
  eigenEnsemble,
  ensembleUnitary,
  entanglementEntropy,
  fidelity,
  fvdg,
  mixtureN,
  partialTrace,
  purify,
  purityN,
  reducedBloch,
  reducedDensity,
  schmidt,
  spectrum,
  traceDistance,
  vonNeumann,
} from '../../physics/qc/density'
import { H, pauliString } from '../../physics/qc/gates'
import { measureInBasis } from '../../physics/qc/measure'
import { bell, coefMatrix, ghz, ket, schmidtRank } from '../../physics/qc/state'
import { C_COPY, C_PROD } from './Q6.values'
import { ZX } from './Q8.values'
import { claimKey, close, d, keyedClaim, pct, tf, uf } from '../claimKit'

const DEG = Math.PI / 180
const abs = (z: C) => Math.hypot(z.re, z.im)

/* ---------------------------------------------------------------------------------------------- */
/* The running states (plan §0: Name / Source / Value; Circuits)                                    */
/* ---------------------------------------------------------------------------------------------- */

const g = (gate: GateOp['gate'], target: number, controls?: number[]): GateOp => ({ op: 'gate', gate, targets: [target], ...(controls ? { controls } : {}) })
/** C_PUR: a controlled H, qubits 00, columns [H(1)] [H(0) controlled on 1] (new; builds the running pair P). */
export const C_PUR: Circuit = { version: 1, qubits: 2, init: '00', wires: ['A', 'B'], columns: [[g('H', 1)], [g('H', 0, [1])]] }

const PROD: Vec = runCircuit(C_PROD).states[1] // psi1 (x) |+), Q4/Q6's circuit
const PSI2: Vec = runCircuit(C_COPY).states[2] // (sqrt3|00) + |11))/2, Q4/Q6's circuit
const SING: Vec = bell('Psi-') // the singlet
const GHZ3: Vec = ghz(3)
const COIN: Mat = mixtureN([
  { w: 0.5, psi: ket('01') },
  { w: 0.5, psi: ket('10') },
])
const PP: Vec = runCircuit(C_PUR).states[2] // the running pair P
const HALF_I: Mat = mat([
  [0.5, 0],
  [0, 0.5],
])
const HALF4: Mat = mixtureN([
  { w: 0.25, psi: ket('00') },
  { w: 0.25, psi: ket('01') },
  { w: 0.25, psi: ket('10') },
  { w: 0.25, psi: ket('11') },
])
const PXX = pauliString('XX')
const PYY = pauliString('YY')
const PZZ = pauliString('ZZ')
const PXXI = pauliString('XXI')
const PYYI = pauliString('YYI')
const PZZI = pauliString('ZZI')
const traceOf = (A: Mat, rho: Mat) => {
  let s = ZERO
  for (let i = 0; i < A.length; i++) for (let j = 0; j < A.length; j++) s = { re: s.re + (A[i][j].re * rho[j][i].re - A[i][j].im * rho[j][i].im), im: s.im + (A[i][j].re * rho[j][i].im + A[i][j].im * rho[j][i].re) }
  return s.re
}

/* ---------------------------------------------------------------------------------------------- */
/* 9.1 q9-partial-trace                                                                             */
/* ---------------------------------------------------------------------------------------------- */

const RHO_A_PROD: Mat = reducedDensity(PROD, [0])
const RHO_A_PROD_IDEAL: Mat = mat([
  [0.75, Math.sqrt(3) / 4],
  [Math.sqrt(3) / 4, 0.25],
])
const RHO_PSI2: Mat = densityOf(PSI2)
const RHO_A_PSI2: Mat = reducedDensity(PSI2, [0])
const RHO_SING: Mat = densityOf(SING)
const RHO_A_SING: Mat = reducedDensity(SING, [0])
const R_A_SING = reducedBloch(SING, 0)
const SING_XX = traceOf(PXX, RHO_SING)
const SING_YY = traceOf(PYY, RHO_SING)
const SING_ZZ = traceOf(PZZ, RHO_SING)

/** The four beta states in Bergou/N&C index order (x, y): beta00=Phi+, beta01=Psi+, beta10=Phi-, beta11=Psi-. */
const BETA: Vec[] = [bell('Phi+'), bell('Psi+'), bell('Phi-'), bell('Psi-')]
const BETA_RA: Mat[] = BETA.map((b) => reducedDensity(b, [0]))
const BETA_RA_GAP: number[] = BETA_RA.map((r) => densityGap(r, HALF_I))
const BETA_GRID: [number, number, number][] = BETA.map((b) => {
  const rho = densityOf(b)
  return [traceOf(PXX, rho), traceOf(PYY, rho), traceOf(PZZ, rho)]
})

const RHO_GHZ: Mat = densityOf(GHZ3)
const R12: Mat = partialTrace(RHO_GHZ, [2])
const R12_GRID: [number, number, number] = [traceOf(PXXI, RHO_GHZ), traceOf(PYYI, RHO_GHZ), traceOf(PZZI, RHO_GHZ)]
const R12_ARROW_A = reducedBloch(R12, 0)
const R12_ARROW_B = reducedBloch(R12, 1)

/* ---------------------------------------------------------------------------------------------- */
/* 9.2 q9-same-part                                                                                 */
/* ---------------------------------------------------------------------------------------------- */

const COIN_XX = traceOf(PXX, COIN)
const COIN_YY = traceOf(PYY, COIN)
const COIN_ZZ = traceOf(PZZ, COIN)
const COIN_RA_GAP = densityGap(partialTrace(COIN, [1]), HALF_I)
const COIN_PUR = purityN(COIN)
const RHO_A_PSI_PLUS_GAP = densityGap(reducedDensity(bell('Psi+'), [0]), HALF_I)

/* ---------------------------------------------------------------------------------------------- */
/* 9.3 q9-entropy                                                                                   */
/* ---------------------------------------------------------------------------------------------- */

const S_ZX = vonNeumann(ZX)
const S_PURE = vonNeumann(densityOf(ket('0')))
const S_HALF = vonNeumann(HALF_I)
const S_QUARTER4 = vonNeumann(HALF4)
/** ρ(r) = diag((1+r)/2, (1-r)/2), a qubit with |r| along z (D7). */
const rhoZ = (r: number): Mat => mat([[(1 + r) / 2, 0], [0, (1 - r) / 2]])
const R_IN = [0, 0.5, Math.SQRT1_2, 1]
const S_OF_R = R_IN.map((r) => vonNeumann(rhoZ(r)))
const E_PROD = entanglementEntropy(PROD, [0])
const E_BELL = entanglementEntropy(bell('Phi+'), [0])
const E_PSI2 = entanglementEntropy(PSI2, [0])
const S_BOX = vonNeumann(R12)
/** HW2's thermal box at x = E_Z/k_BT = 2 (Q8's own constant), for the stretch challenge. */
const THERM_X = 2
const THERM_P_UP = (1 + Math.tanh(THERM_X / 2)) / 2
const S_THERMAL = vonNeumann(mat([[THERM_P_UP, 0], [0, 1 - THERM_P_UP]]))

/* ---------------------------------------------------------------------------------------------- */
/* 9.4 q9-schmidt                                                                                   */
/* ---------------------------------------------------------------------------------------------- */

const C_PP: Mat = coefMatrix(PP, [0]) // the 2x2 amplitude grid of P (rows = A's 0/1 basis)
const P_VT_OVERLAP = inner(C_PP[0], C_PP[1]).re

const ZX_EIGEN: Ensemble = eigenEnsemble(ZX) // descending p: lambda+, lambda-
const U_PLUS: Vec = canonicalPhase(ZX_EIGEN.kets[0])
const U_MINUS: Vec = canonicalPhase(ZX_EIGEN.kets[1])
const U_AB: Mat = fromColumns([U_PLUS, U_MINUS]) // columns u+, u- (A's eigenbasis)
const VT_EIG: Mat = matmul(dagger(U_AB), C_PP) // rows: vtilde+, vtilde- (A's eigenbasis)
const P_VT_EIG_OVERLAP = inner(VT_EIG[0], VT_EIG[1]).re
const P_VT_EIG_NORM2 = [norm2(VT_EIG[0]), norm2(VT_EIG[1])]
const P_SCHMIDT = P_VT_EIG_NORM2.map(Math.sqrt)

const SCHMIDT_P = schmidt(PP, [0])
const RANK_PROD = schmidtRank(PROD, [0])
const RANK_P = schmidtRank(PP, [0])
const RANK_BELL = schmidtRank(bell('Phi+'), [0])

const SPEC_A = spectrum(reducedDensity(PP, [0]))
const SPEC_B = spectrum(reducedDensity(PP, [1]))
const R_A_P = reducedBloch(PP, 0)
const R_B_P = reducedBloch(PP, 1)
const RHO_B_P = reducedDensity(PP, [1])

/** cos(22.5 deg)|00) + sin(22.5 deg)|11): the same Schmidt weights and E as P, by a local rotation on each qubit. */
const CS225: Vec = [c(Math.cos(22.5 * DEG)), ZERO, ZERO, c(Math.sin(22.5 * DEG))]
const SCHMIDT_CS225 = schmidt(CS225, [0])
const E_CS225 = entanglementEntropy(CS225, [0])

/* ---------------------------------------------------------------------------------------------- */
/* 9.5 q9-purification                                                                              */
/* ---------------------------------------------------------------------------------------------- */

const PUR_GAP = densityGap(reducedDensity(PP, [0]), ZX)
const PURIFY_GAP = densityGap(reducedDensity(purify(ZX), [0]), ZX)

/**
 * |Psi_eig) = sqrt(lambda+) |u+)_A |0)_B + sqrt(lambda-) |u-)_A |1)_B, written over the computational basis
 * |a b) (q0 = A, q1 = B): index 2a + b. u+ = (u+0, u+1) contributes to (a, b) = (0, 0) and (1, 0); u- contributes
 * to (0, 1) and (1, 1).
 */
function kronTag(u: Vec, weight: number, bit: 0 | 1): Vec {
  const out: Vec = [ZERO, ZERO, ZERO, ZERO]
  for (let a = 0; a < 2; a++) out[2 * a + bit] = { re: u[a].re * weight, im: u[a].im * weight }
  return out
}
const PSI_EIG_KET: Vec = (() => {
  const w0 = Math.sqrt(ZX_EIGEN.p[0])
  const w1 = Math.sqrt(ZX_EIGEN.p[1])
  const t0 = kronTag(U_PLUS, w0, 0)
  const t1 = kronTag(U_MINUS, w1, 1)
  return t0.map((x, i) => ({ re: x.re + t1[i].re, im: x.im + t1[i].im }))
})()

const EIGEN_ENSEMBLE_A: Ensemble = { p: ZX_EIGEN.p, kets: [U_PLUS, U_MINUS] }
const ZX_ENSEMBLE_A: Ensemble = { p: [0.5, 0.5], kets: [ket('0'), ket('+')] }
const PUR_U: Mat = ensembleUnitary(EIGEN_ENSEMBLE_A, ZX_ENSEMBLE_A)
const PUR_U_GAP = maxDiff(PUR_U, H)
const H_ON_B: Mat = kronM(identity(2), H)
const PUR_H_GAP = densityGap(densityOf(apply(H_ON_B, PSI_EIG_KET)), densityOf(PP))

const STEER_X = measureInBasis(PP, 1, 'x')
const STEER_X_F = [
  STEER_X.post[0] ? fidelity(reducedDensity(STEER_X.post[0], [0]), densityOf(U_PLUS)) : 0,
  STEER_X.post[1] ? fidelity(reducedDensity(STEER_X.post[1], [0]), densityOf(U_MINUS)) : 0,
]
const STEER_Z = measureInBasis(PP, 1, 'z')
const STEER_Z_F = [
  STEER_Z.post[0] ? fidelity(reducedDensity(STEER_Z.post[0], [0]), densityOf(ket('0'))) : 0,
  STEER_Z.post[1] ? fidelity(reducedDensity(STEER_Z.post[1], [0]), densityOf(ket('+'))) : 0,
]
const E_P = entanglementEntropy(PP, [0])

/* ---------------------------------------------------------------------------------------------- */
/* 9.6 q9-distance                                                                                  */
/* ---------------------------------------------------------------------------------------------- */

const RHO0 = densityOf(ket('0'))
const RHOP = densityOf(ket('+'))
const D0P = traceDistance(ket('0'), ket('+'))
const D0P_EIG = eigh([
  [{ re: RHO0[0][0].re - RHOP[0][0].re, im: 0 }, { re: RHO0[0][1].re - RHOP[0][1].re, im: RHO0[0][1].im - RHOP[0][1].im }],
  [{ re: RHO0[1][0].re - RHOP[1][0].re, im: RHO0[1][0].im - RHOP[1][0].im }, { re: RHO0[1][1].re - RHOP[1][1].re, im: 0 }],
]).values // ascending: [-0.707, 0.707]
const F0P = fidelity(ket('0'), ket('+'))
const SQ0P = Math.sqrt(Math.max(0, 1 - F0P * F0P))
const R0 = reducedBloch(ket('0'), 0)
const RPLUS = reducedBloch(ket('+'), 0)
const D0P_BALL = Math.hypot(R0[0] - RPLUS[0], R0[1] - RPLUS[1], R0[2] - RPLUS[2]) / 2
const F0_HALF = fidelity(ket('0'), HALF_I)

const FVDG_ZX = fvdg(ZX, HALF_I)
const D_ZX_HALF = FVDG_ZX.D
const F_ZX_HALF = FVDG_ZX.F

const ANG0P = 45

/** Two pure states with overlap size 0.6 exactly: |0) and 0.6|0) + 0.8|1). */
const PSI_06: Vec = [{ re: 0.6, im: 0 }, { re: 0.8, im: 0 }]
const F06 = fidelity(ket('0'), PSI_06)
const D06 = traceDistance(ket('0'), PSI_06)
const ANG06 = Math.atan2(0.8, 0.6) / DEG
const THETA06 = 2 * ANG06

const D_SING_COIN = traceDistance(RHO_SING, COIN)
const D_SING_COIN_A = traceDistance(RHO_A_SING, partialTrace(COIN, [1]))

export {
  BETA,
  BETA_RA,
  C_PP,
  CS225,
  GHZ3,
  H_ON_B,
  PP,
  PROD,
  PSI2,
  PSI_EIG_KET,
  R12,
  RHO_A_PROD_IDEAL,
  RHO_B_P,
  SING,
  COIN,
  HALF_I,
  HALF4,
  ZX,
}

export const V = {
  /* reusable constants */
  q9Half: 0.5,
  q9Quarter: 0.25,
  q9ThreeQuarter: 0.75,
  q9R2: Math.SQRT1_2,
  q9Sqrt32: Math.sqrt(3) / 2,

  /* 9.1 q9-partial-trace */
  q9ProdRA00: RHO_A_PROD[0][0].re,
  q9ProdRA01Abs: abs(RHO_A_PROD[0][1]),
  q9ProdRA11: RHO_A_PROD[1][1].re,
  q9ProdRAGap: densityGap(RHO_A_PROD, RHO_A_PROD_IDEAL),
  q9ProdRAPur: purityN(RHO_A_PROD),
  q9ProdExpZ1: traceOf(pauliString('Z'), RHO_A_PROD),
  q9ProdExpX1: traceOf(pauliString('X'), RHO_A_PROD),
  q9Psi2Coh: abs(RHO_PSI2[0][3]),
  q9Psi2RA00: RHO_A_PSI2[0][0].re,
  q9Psi2RA01: abs(RHO_A_PSI2[0][1]),
  q9Psi2RA11: RHO_A_PSI2[1][1].re,
  q9Psi2Pur: purityN(RHO_A_PSI2),
  q9Psi2ExpZ1: traceOf(pauliString('Z'), RHO_A_PSI2),
  q9Psi2ExpX1: traceOf(pauliString('X'), RHO_A_PSI2),
  q9SingRA00: RHO_A_SING[0][0].re,
  q9SingArrowsLen: Math.hypot(...R_A_SING),
  q9SingXX: SING_XX,
  q9SingYY: SING_YY,
  q9SingZZ: SING_ZZ,
  q9BellRA00: BETA_RA[2][0][0].re, // beta10 = Phi-, HW2 P2(d)
  q9BellRAGapMax: Math.max(...BETA_RA_GAP),
  q9BellGrid00XX: BETA_GRID[0][0],
  q9BellGrid00YY: BETA_GRID[0][1],
  q9BellGrid00ZZ: BETA_GRID[0][2],
  q9BellGrid01XX: BETA_GRID[1][0],
  q9BellGrid01YY: BETA_GRID[1][1],
  q9BellGrid01ZZ: BETA_GRID[1][2],
  q9BellGrid10XX: BETA_GRID[2][0],
  q9BellGrid10YY: BETA_GRID[2][1],
  q9BellGrid10ZZ: BETA_GRID[2][2],
  q9BellGrid11XX: BETA_GRID[3][0],
  q9BellGrid11YY: BETA_GRID[3][1],
  q9BellGrid11ZZ: BETA_GRID[3][2],
  q9GhzR1200: R12[0][0].re,
  q9GhzR1203: abs(R12[0][3]),
  q9GhzR12XX: R12_GRID[0],
  q9GhzR12YY: R12_GRID[1],
  q9GhzR12ZZ: R12_GRID[2],
  q9GhzR12ArrowsLen: Math.hypot(...R12_ARROW_A) + Math.hypot(...R12_ARROW_B),

  /* 9.2 q9-same-part */
  q9CoinRAGap: COIN_RA_GAP,
  q9CoinXX: COIN_XX,
  q9CoinYY: COIN_YY,
  q9CoinZZ: COIN_ZZ,
  q9CoinPur: COIN_PUR,
  q9BellPlusRAGap: RHO_A_PSI_PLUS_GAP,

  /* 9.3 q9-entropy */
  q9SZX: S_ZX,
  q9SPure: S_PURE,
  q9SHalf: S_HALF,
  q9SQuarter4: S_QUARTER4,
  q9S0: S_OF_R[0],
  q9S05: S_OF_R[1],
  q9S0707: S_OF_R[2],
  q9S1: S_OF_R[3],
  q9EProd: E_PROD,
  q9EBell: E_BELL,
  q9EPsi2: E_PSI2,
  q9SBox: S_BOX,
  q9SThermal: S_THERMAL,

  /* 9.4 q9-schmidt */
  q9P00: C_PP[0][0].re,
  q9P01: C_PP[0][1].re,
  q9P11: C_PP[1][1].re,
  q9PVtOverlap: P_VT_OVERLAP,
  q9PVtEigP0: VT_EIG[0][0].re,
  q9PVtEigP1: VT_EIG[0][1].re,
  q9PVtEigM0: VT_EIG[1][0].re,
  q9PVtEigM1Abs: Math.abs(VT_EIG[1][1].re),
  q9PVtEigOverlap: P_VT_EIG_OVERLAP,
  q9PVtEigNorm2Large: P_VT_EIG_NORM2[0],
  q9PVtEigNorm2Small: P_VT_EIG_NORM2[1],
  q9PSchmidtLarge: P_SCHMIDT[0],
  q9PSchmidtSmall: P_SCHMIDT[1],
  q9SvdLarge: SCHMIDT_P.coeffs[0],
  q9SvdSmall: SCHMIDT_P.coeffs[1],
  q9RankProd: RANK_PROD,
  q9RankP: RANK_P,
  q9RankBell: RANK_BELL,
  q9SpecALarge: SPEC_A[0],
  q9SpecASmall: SPEC_A[1],
  q9SpecBLarge: SPEC_B[0],
  q9SpecBSmall: SPEC_B[1],
  q9RA0: R_A_P[0],
  q9RA2: R_A_P[2],
  q9RB0: R_B_P[0],
  q9RALen: Math.hypot(...R_A_P),
  q9RBLen: Math.hypot(...R_B_P),
  q9RhoB00: RHO_B_P[0][0].re,
  q9RhoB01Abs: abs(RHO_B_P[0][1]),
  q9CS225In: 22.5,
  q9CS225SchmidtLarge: SCHMIDT_CS225.coeffs[0],
  q9CS225SchmidtSmall: SCHMIDT_CS225.coeffs[1],
  q9CS225E: E_CS225,

  /* 9.5 q9-purification */
  q9PurGap: PUR_GAP,
  q9PurifyGap: PURIFY_GAP,
  q9PurUGap: PUR_U_GAP,
  q9PurHGap: PUR_H_GAP,
  q9SteerX0: STEER_X.p[0],
  q9SteerX1: STEER_X.p[1],
  q9SteerXF0: STEER_X_F[0],
  q9SteerXF1: STEER_X_F[1],
  q9SteerZ0: STEER_Z.p[0],
  q9SteerZ1: STEER_Z.p[1],
  q9SteerZF0: STEER_Z_F[0],
  q9SteerZF1: STEER_Z_F[1],
  q9EP: E_P,

  /* 9.6 q9-distance */
  q9D0P: D0P,
  q9D0PEig: D0P_EIG[1], // the larger (positive) eigenvalue; the text reads +-0.707
  q9F0P: F0P,
  q9Sq0P: SQ0P,
  q9D0PBall: D0P_BALL,
  q9F0Half: F0_HALF,
  q9DZXHalf: D_ZX_HALF,
  q9FZXHalf: F_ZX_HALF,
  q9FvdgLower: FVDG_ZX.lower,
  q9FvdgUpper: FVDG_ZX.upper,
  q9Ang0P: ANG0P,
  q9F06: F06,
  q9F06Sq: F06 * F06,
  q9D06: D06,
  q9Ang06: ANG06,
  q9Theta06: THETA06,
  q9DSingCoin: D_SING_COIN,
  q9DSingCoinA: D_SING_COIN_A,
} as const

export type ValueKey = keyof typeof V
export const claim = keyedClaim<ValueKey>()
export { claimKey, close, d, pct, tf, uf }
