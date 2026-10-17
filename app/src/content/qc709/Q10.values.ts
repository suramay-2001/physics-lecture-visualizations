/**
 * Chapter Q10 numbers (Physics 709, "Entanglement, no signalling and Bell's inequality"), computed once with the
 * engine (E2 `physics/qc/entangle.ts`). Plan: docs/roles/proposals/P-Q10-story.md; rulings
 * docs/roles/decisions/qc709-Q10Q13.md, qc709-remap.md.
 *
 * Every decimal or fraction a learner reads in Q10 comes from `V` and is backed by a keyed claim
 * (content.test.tsx "claims hold"); the numpy twin of each key is in
 * physics/__fixtures__/claims-qc709/q10.json (pipeline/claims_qc709/q10.py, an independent route: direct 2x2/4x4
 * matrix construction, never calling this file's own helpers). Keys start with `q10` and are unique across both
 * courses.
 *
 * Additional named exports (SEP33, BOX, PHI, PSI_MINUS, PRODX, chi, LHV, PR, …) are plain engine objects used only to
 * compute challenge answers and stage sources (Q10.ts, Q10.story.ts); they carry no numpy twin of their own, exactly
 * as Q8.values.ts's BOX/RHO_N do — bare integers and vectors shown undecorated in prose need no claim (the number
 * reader only tracks decimals, fractions, percents and glyphs), only the decimal magnitudes do.
 */
import { abs, c, mul, polar, sub } from '../../physics/complex'
import { type Mat, type Vec, madd, mscale } from '../../physics/linalg'
import { eigh } from '../../physics/qc/cmat'
import { bellThreeDirections, correlator, chsh, chshCurve, lhvChsh, prBox, negativity, type Dir } from '../../physics/qc/entangle'
import { densityGap, densityOf, mixtureN, ptranspose, reducedBloch } from '../../physics/qc/density'
import { measureInBasis } from '../../physics/qc/measure'
import { pauliString, X, Y, Z } from '../../physics/qc/gates'
import { SIGMA_X, SIGMA_Z } from '../../physics/spin'
import { bell, coefMatrix, ket } from '../../physics/qc/state'
import { claimKey, close, d, keyedClaim, pct, tf, uf } from '../claimKit'

const DEG = Math.PI / 180

/* ---------------------------------------------------------------------------------------------- */
/* Running states (plan §0 "Name / Source / Value")                                                 */
/* ---------------------------------------------------------------------------------------------- */

/** Bergou Eq. 3.3: ⅓|00⟩⟨00| + ⅔|11⟩⟨11| — a separable mixture that is not an equal coin. */
export const SEP33: Mat = mixtureN([
  { w: 1 / 3, psi: ket('00') },
  { w: 2 / 3, psi: ket('11') },
])
/** Chapter Q8's coin box, ½|00⟩⟨00| + ½|11⟩⟨11| — separable, and PPT. */
export const BOX: Mat = mixtureN([
  { w: 0.5, psi: ket('00') },
  { w: 0.5, psi: ket('11') },
])
export const PHI: Vec = bell('Phi+')
export const PSI_MINUS: Vec = bell('Psi-')
/** |+x⟩|+x⟩: a product state, for the CHSH-never-beats-2 beat. */
export const PRODX: Vec = ket('++')

/** |χ(δ)⟩ = (|00⟩ + e^{iδ}|11⟩)/√2 (Bergou Eq. 3.12), δ in degrees — built directly (q0 the left factor). */
export function chi(deltaDeg: number): Vec {
  const r = Math.SQRT1_2
  return [c(r), c(0), c(0), polar(r, deltaDeg * DEG)]
}

/** The x, y settings Bergou measures |χ⟩ with, each qubit the same pair (Bergou Eqs. 3.11–3.13). */
const AX: readonly [Dir, Dir] = [
  [1, 0, 0],
  [0, 1, 0],
]
/** N&C's tilted settings on Bob's qubit (§2.6 Eqs. 2.227–2.230): S = −(Z+X)/√2, T = (Z−X)/√2. */
const S_OP: Mat = madd(mscale(SIGMA_Z, -Math.SQRT1_2), mscale(SIGMA_X, -Math.SQRT1_2))
const T_OP: Mat = madd(mscale(SIGMA_Z, Math.SQRT1_2), mscale(SIGMA_X, -Math.SQRT1_2))

/** The CHSH operator C = XX + XY + YX − YY (Bergou Eq. 3.17, erratum-corrected: the second square is (b1−b2)/√2). */
const C_OP: Mat = madd(madd(pauliString('XX'), pauliString('XY')), madd(pauliString('YX'), mscale(pauliString('YY'), -1)))

/* ---------------------------------------------------------------------------------------------- */
/* Helper exports used only to compute challenge answers and captions (no numpy twin needed)        */
/* ---------------------------------------------------------------------------------------------- */

/** The box's and Φ+'s ⟨X1X2⟩ and ⟨Z1Z2⟩ (se:b2, ch:b1's "always agree"/"never" correlators). */
export const BOX_XX = correlator(BOX, X, X)
export const PHI_ZZ = correlator(PHI, Z, Z)

/** The partial transpose's eigenvalues, ascending (box: all ≥ 0; Φ+: one negative, the Peres test). */
export const BOX_PT_EIGS: number[] = eigh(ptranspose(BOX, [1])).values.slice().sort((a, b) => a - b)
export const PHI_PT_EIGS: number[] = eigh(ptranspose(densityOf(PHI), [1])).values.slice().sort((a, b) => a - b)
export const PHI_NEGATIVITY: number = negativity(densityOf(PHI))

export const LHV = lhvChsh()
export const PR = prBox()

/** Alice reads qubit 0 in `basis`; Bob's (qubit 1) reduced Bloch vector in each branch, and its chance-weighted average. */
function conditionedAverage(basis: 'x' | 'y' | 'z'): { branch0: [number, number, number]; branch1: [number, number, number]; avg: [number, number, number] } {
  const m = measureInBasis(PHI, 0, basis)
  const b0 = reducedBloch(m.post[0]!, 1)
  const b1 = reducedBloch(m.post[1]!, 1)
  const avg: [number, number, number] = [m.p[0] * b0[0] + m.p[1] * b1[0], m.p[0] * b0[1] + m.p[1] * b1[1], m.p[0] * b0[2] + m.p[1] * b1[2]]
  return { branch0: b0, branch1: b1, avg }
}
export const COND_Z = conditionedAverage('z')
export const COND_X = conditionedAverage('x')
/** Bob's qubit with no measurement at all: the reduced state of Φ+, ½I (ns:b2's "measured or not"). */
export const BOB_NO_MEAS = reducedBloch(PHI, 1)
/** Bob's probabilities after Bergou's phase-gate-and-H scheme: any local unitary on a ½I qubit still reads 50/50. */
export const BOB_FRINGE = measureInBasis(PHI, 1, 'x').p

/** One worked instruction card (hi:b1's example): a1 = 1, a2 = −1, b1 = −1, b2 = −1. */
export const CARD_EXAMPLE = LHV.assignments.find(([a1, a2, b1, b2]) => a1 === 1 && a2 === -1 && b1 === -1 && b2 === -1)!
/** The warm-up card a1 = 1, a2 = 1, b1 = 1, b2 = −1 (hi's warm-up challenge): X = a1(b1+b2) + a2(b1−b2). */
export const X_WARMUP = 1 * (1 + -1) + 1 * (1 - -1)

export const PROD_S = chsh(PRODX, X, Y, X, Y)

/* ---------------------------------------------------------------------------------------------- */
/* Notes L10 pp. 47-58 (new edition): the two-term pair, the singlet's correlations, Bell's three directions */
/* ---------------------------------------------------------------------------------------------- */

/** σ·n for an analyser direction in the x-z plane at angle `deg` from +z toward +x: cos(deg) Z + sin(deg) X. */
const sigmaAt = (deg: number): Mat => madd(mscale(Z, Math.cos(deg * DEG)), mscale(X, Math.sin(deg * DEG)))
/** The singlet's correlation P(a, b) = <S|(σ·a)⊗(σ·b)|S> for analyser angles in degrees (notes Eq. 3.36: −cos of the angle between). */
export const singletP = (aDeg: number, bDeg: number): number => correlator(PSI_MINUS, sigmaAt(aDeg), sigmaAt(bDeg))

/** Bell's three directions a, b, c: a perpendicular to b, c halfway between (notes Eqs. 3.43-3.44), as angles from +z. */
export const DIR_A = 0
export const DIR_B = 90
export const DIR_C = 45
/** The eight hidden-label rows (λa, λb, λc) and the largest violation over them (engine: 0). */
export const BELL3 = bellThreeDirections()
const BELL_LHS = Math.abs(singletP(DIR_A, DIR_B) - singletP(DIR_A, DIR_C))
const BELL_RHS = 1 + singletP(DIR_B, DIR_C)

/** |det Λ| of α|01⟩ + β|10⟩ at α = 0.6, β = 0.8 (entangled exactly when αβ ≠ 0; Q6's factoring test). */
const FAM_PAIR: Vec = [c(0), c(0.6), c(0.8), c(0)]
const FAM_L = coefMatrix(FAM_PAIR)
const FAM_DET = abs(sub(mul(FAM_L[0][0], FAM_L[1][1]), mul(FAM_L[0][1], FAM_L[1][0])))

/** Two fixed separable states, |00⟩ and |++⟩, mixed half and half: the partial transpose of the mixture against the mixture of the partial transposes. */
const SEP_MIX: Mat = mixtureN([
  { w: 0.5, psi: ket('00') },
  { w: 0.5, psi: ket('++') },
])
const SEP_CONVEX_GAP = densityGap(
  mixtureN([
    { w: 0.5 / 3, psi: ket('00') },
    { w: (0.5 * 2) / 3, psi: ket('11') },
    { w: 0.25, psi: ket('00') },
    { w: 0.25, psi: ket('++') },
  ]),
  madd(mscale(SEP33, 0.5), mscale(SEP_MIX, 0.5)),
)

/** The notes' CHSH choice on the singlet: a = 0, a' = π/2, b = π/4, b' = −π/4 (angles of π/4, π/4, π/4 and 3π/4 between them). */
const NOTES_S = chsh(PSI_MINUS, sigmaAt(0), sigmaAt(90), sigmaAt(45), sigmaAt(-45))

/* ---------------------------------------------------------------------------------------------- */
/* V: the claim ledger (every decimal/fraction a learner reads)                                     */
/* ---------------------------------------------------------------------------------------------- */

export const V = {
  /** The box, Φ+'s and the N&C singlet's negative Peres eigenvalue, Bergou's ½I-or-not, 50/50 — all ½, engine-backed
   * via the Peres eigenvalue itself (the smallest eigenvalue of Φ+'s partial transpose is −½). */
  q10Half: -PHI_PT_EIGS[0],
  /** Bergou Eq. 3.3's separable mixture: r_A = r_B = (0, 0, −⅓), engine-backed via the reduced Bloch vector itself. */
  q10Third: -reducedBloch(SEP33, 0)[2],
  /** ⟨σ_xσ_x⟩ = ⟨σ_xσ_y⟩ = ⟨σ_yσ_x⟩ for |χ(45°)⟩, and N&C's three matching correlators: 1/√2, engine-backed via the
   * correlator itself rather than the typed constant Math.SQRT1_2. */
  q10R2: correlator(chi(45), X, X),
  /** S = chsh(|χ(45°)⟩, X, Y, X, Y): Bergou's violating pair at its best (maximal) phase. */
  q10ChiS: chsh(chi(45), X, Y, X, Y),
  /** The CHSH dial sampled at δ = 45° by the independent sweep route, chshCurve (not `chsh` directly). */
  q10DialAt45: chshCurve(chi, AX, AX, 45),
  /** The Tsirelson bound from the CHSH operator's own spectrum: ‖C‖ = the largest |eigenvalue| of C. */
  q10Tsirelson: Math.max(...eigh(C_OP).values.map(Math.abs)),
  /** N&C's singlet version (§2.6): the same 2√2, from the tilted Q, R, S, T settings (N&C's score is
   * ⟨QS⟩+⟨RS⟩+⟨RT⟩-⟨QT⟩; `chsh(a1,a2,b1,b2)` = ⟨a1b1⟩+⟨a1b2⟩+⟨a2b1⟩-⟨a2b2⟩, so a1 = R = X, a2 = Q = Z). */
  q10NCS: chsh(PSI_MINUS, X, Z, S_OP, T_OP),
  /** Notes L10 pp. 47-58: the singlet's correlation parallel, at 45° and perpendicular (−cos of the angle between), Bell's two sides, the pair α|01⟩ + β|10⟩, convexity, the notes' S. */
  q10SingletPar: singletP(0, 0),
  q10SingletBis: singletP(0, 45),
  q10SingletPerp: singletP(0, 90),
  q10BellAssignments: BELL3.assignments.length,
  q10BellDetViol: BELL3.maxViolation,
  q10BellLhs: BELL_LHS,
  q10BellRhs: BELL_RHS,
  q10BellRatio: BELL_LHS / BELL_RHS,
  q10FamDet: FAM_DET,
  /** The two amplitudes α = |⟨01|ψ⟩| and β = |⟨10|ψ⟩| of the stage's pair (named in q10-separable:b1). */
  q10FamAlpha: abs(FAM_PAIR[1]),
  q10FamBeta: abs(FAM_PAIR[2]),
  q10SepConvexGap: SEP_CONVEX_GAP,
  q10NotesS: NOTES_S,
} as const

const claim = keyedClaim<keyof typeof V>()

export const cHalf = claim('q10Half', 'a Peres eigenvalue, a reduced state or a fringe chance of one half', () => close(V.q10Half, 0.5))
export const cThird = claim('q10Third', 'a separable mixture’s reduced Bloch component of one third', () => close(V.q10Third, 1 / 3))
export const cR2 = claim('q10R2', 'a CHSH correlator of size 1/√2 ≈ 0.707', () => close(V.q10R2, Math.SQRT1_2))
export const cChiS = claim('q10ChiS', 'the violating pair’s CHSH value, 2√2 ≈ 2.828', () => close(V.q10ChiS, 2 * Math.SQRT2))
export const cDial45 = claim('q10DialAt45', 'the CHSH dial at 45°, 2√2 ≈ 2.828, by the independent sweep route', () => close(V.q10DialAt45, 2 * Math.SQRT2))
export const cTsirelson = claim('q10Tsirelson', 'the Tsirelson bound, 2√2 ≈ 2.828, from the CHSH operator’s own spectrum', () => close(V.q10Tsirelson, 2 * Math.SQRT2))
export const cNCS = claim('q10NCS', 'N&C’s singlet CHSH value, also 2√2', () => close(V.q10NCS, 2 * Math.SQRT2))

export const cSingletPar = claim('q10SingletPar', 'parallel analysers on the singlet: correlation −1', () => close(V.q10SingletPar, -1))
export const cSingletBis = claim('q10SingletBis', 'the singlet’s correlation at 45° is −0.707', () => close(V.q10SingletBis, -Math.SQRT1_2))
export const cSingletPerp = claim('q10SingletPerp', 'perpendicular analysers on the singlet: correlation 0', () => close(V.q10SingletPerp, 0, 1e-9))
export const cBellAssignments = claim('q10BellAssignments', 'three ±1 labels give 8 assignments', () => V.q10BellAssignments === 8)
export const cBellDetViol = claim('q10BellDetViol', 'no one of the 8 assignments breaks the three-direction inequality', () => close(V.q10BellDetViol, 0, 1e-12))
export const cBellLhs = claim('q10BellLhs', 'the singlet gives Bell’s left side 0.707 (a ⊥ b, c halfway)', () => close(V.q10BellLhs, Math.SQRT1_2))
export const cBellRhs = claim('q10BellRhs', 'a hidden label allows at most 1 − 0.707 = 0.293', () => close(V.q10BellRhs, 1 - Math.SQRT1_2))
export const cBellRatio = claim('q10BellRatio', 'the singlet’s left side is 2.414 times the allowed right side', () => close(V.q10BellRatio, Math.SQRT1_2 / (1 - Math.SQRT1_2), 1e-9))
export const cFamDet = claim('q10FamDet', 'for α = 0.6, β = 0.8 the pair’s |det Λ| = |αβ| = 0.48', () => close(V.q10FamDet, 0.48))
export const cFamAlpha = claim('q10FamAlpha', 'the pair’s first amplitude is α = 0.6', () => close(V.q10FamAlpha, 0.6, 1e-9))
export const cFamBeta = claim('q10FamBeta', 'its second amplitude is β = 0.8', () => close(V.q10FamBeta, 0.8, 1e-9))
export const cSepConvexGap = claim('q10SepConvexGap', 'mixing the mixtures ⅓|00⟩⟨00| + ⅔|11⟩⟨11| and ½|00⟩⟨00| + ½|++⟩⟨++| half and half gives one list of four products (weights adding to 1): gap 0', () => close(V.q10SepConvexGap, 0, 1e-12))
export const cNotesS = claim('q10NotesS', 'the singlet at the notes’ four directions scores S = −2.828', () => close(V.q10NotesS, -2 * Math.SQRT2))

export { close, d, pct, tf, uf, claimKey }
