/**
 * Chapter Q1 numbers (Physics 709, "Stern–Gerlach and the rules of the game"), computed once with the engine.
 * Plan: docs/roles/proposals/P-Q1-story.md; rulings docs/roles/decisions/qc709-pilots.md and qc709-nc.md.
 *
 * Same contract as 448's `L{n}.values.ts`: every number a learner reads in Q1 comes from `V` and is backed by a keyed
 * claim; the numpy twin of each key is in physics/__fixtures__/claims-qc709/q1.json (pipeline/claims_qc709/q1.py,
 * computed by other routes: Lüders density matrices, eigh kets, polynomial integration). Keys start with `q1`.
 *
 * Scaled units, so a twin agrees to 1e-12 in absolute terms: forces in 10⁻²¹ N, accelerations in 10⁴ m/s², μ_B in
 * 10⁻²⁴ J/T, the silver mass in 10⁻²⁵ kg, deflections in mm, times in µs. A value shown with a minus sign in the
 * prose is stored as its size (the number reader reads digits, not signs); yes/no facts are 1 or 0.
 *
 * Engine gaps (P-Q1-story §9.1 E1, E3; not built, see the chapter's report): `physics/constants.ts` (e, ħ, m_e, g_e)
 * and `larmorOmega`. Until they land, Q1 prints no value of ħ, g or the precession rate: μ_B is the engine's
 * `SILVER.muB`, and every force, acceleration and deflection is built from it and the bench of `P0`.
 */
import { I, abs, c, mul } from '../../physics/complex'
import { SILVER, sgDeflection, type SGParams } from '../../physics/field'
import { bilinear, commutator, inner, isHermitian, matEq, matmul, mscale, norm, norm2, normalize, vadd, vec, vscale, type Vec } from '../../physics/linalg'
import { rng } from '../../physics/random'
import { angleBetween, eigh, weightedInner } from '../../physics/qc/cmat'
import { ket } from '../../physics/qc/state'
import { benchTheory, sequenceOutcomes } from '../../physics/sg'
import { KET, SIGMA_Z, SX, SY, SZ, ketFromBloch, projector, prob, samePhysicalState } from '../../physics/spin'
import { keyedClaim } from '../claimKit'

const yes = (b: boolean) => (b ? 1 : 0)
/** The sample farthest from `target` (equal to it only if EVERY sample is). */
const worst = (xs: number[], target: number) => xs.reduce((w, x) => (Math.abs(x - target) > Math.abs(w - target) ? x : w), target)
const vecEq = (a: Vec, b: Vec, eps = 1e-12) => a.length === b.length && a.every((x, i) => abs(c(x.re - b[i].re, x.im - b[i].im)) < eps)

/**
 * The chapter's bench (P-Q1-story "Conventions"): a silver atom with μ_z = μ_B in 1000 T/m, a magnet 3.5 cm long, at
 * 550 m/s; D = 0 reads the deflection at the magnet's exit. The gate's illustrative values (physics/field.test.ts).
 */
export const P0: SGParams = { muZ: SILVER.muB, dBdz: 1000, m: SILVER.m, v: 550, L: 0.035, D: 0 }

/** Fig. 2's two arrows: 15° and 60° in the plane (Bloch angles 30° and 120°). */
const fig2A = ketFromBloch(Math.PI / 6, 0)
const fig2B = ketFromBloch((2 * Math.PI) / 3, 0)
/** Bergou's qubit at 30° in the plane (Bloch angle 60°). */
const psi30 = ketFromBloch(Math.PI / 3, 0)
/** q1-inner-product:b5's weight 2I − σ_y (Hermitian, eigenvalues 1 and 3). */
export const M_WEIGHT = [
  [c(2), I],
  [c(0, -1), c(2)],
]
const alphaMinusI = vec(1, c(0, -1))
const zxz = benchTheory({ source: 'oven', axes: ['z', 'x', 'z'], keep: ['+', '+'] })
const zzz = benchTheory({ source: 'oven', axes: ['z', 'z', 'z'], keep: ['+', '+'] })
const ovenZZ = benchTheory({ source: 'oven', axes: ['z', 'z'], keep: ['+'] })
const seqZ = sequenceOutcomes({ source: '+z', axes: ['x', 'z'] })
const notUnit = vscale(vadd(KET['+z'], KET['+x']), Math.SQRT1_2)
const diff = vadd(KET['+z'], vscale(KET['+x'], -1))
const conjLin = inner(vscale(KET['+y'], c(2, 1)), KET['+z'])
const conjLinCh = inner(vscale(vec(1, 0), c(2, 1)), vec(0.6, 0.8))

/**
 * N10's "lazy" scaling c·v = 0 for every c: it satisfies both of the notes' scaling rules on 50 seeded samples of
 * complex scalars and vectors of ℂ², and it fails 1·v = v for every nonzero v. A content check, not engine physics.
 */
function lazyScalingPassesNotesRules(): boolean {
  const rand = rng(709)
  const z = () => c(2 * rand() - 1, 2 * rand() - 1)
  const lazy = (_k: unknown, v: Vec): Vec => v.map(() => c(0))
  const add = vadd
  for (let s = 0; s < 50; s++) {
    const [c1, c2, a, b] = [z(), z(), z(), z()]
    const al = vec(z(), z())
    const be = vec(z(), z())
    const ga = vec(z(), z())
    // (c1 + c2)(α + β) = c1α + c1β + c2α + c2β
    const lhs1 = lazy(c(c1.re + c2.re, c1.im + c2.im), add(al, be))
    const rhs1 = add(add(lazy(c1, al), lazy(c1, be)), add(lazy(c2, al), lazy(c2, be)))
    // a(bγ) = (ab)γ
    const lhs2 = lazy(a, lazy(b, ga))
    const rhs2 = lazy(mul(a, b), ga)
    if (!vecEq(lhs1, rhs1) || !vecEq(lhs2, rhs2)) return false
    // …but 1·α = α fails for a nonzero α
    if (norm(al) > 0 && vecEq(lazy(c(1), al), al)) return false
  }
  return true
}

export const V = {
  /* q1-two-spots */
  q1Force: (SILVER.muB * P0.dBdz) / 1e-21, // 9.274: F_z = μ_B G, in 10⁻²¹ N
  q1Accel: (SILVER.muB * P0.dBdz) / SILVER.m / 1e4, // 5.1776: a = F/m, in 10⁴ m/s²
  q1Mass: SILVER.m / 1e-25, // 1.7912: the silver atom's mass, in 10⁻²⁵ kg
  q1Flight: P0.L / P0.v / 1e-6, // 63.636: time inside the magnet, in µs
  q1MuB: SILVER.muB / 1e-24, // 9.274: the Bohr magneton, in 10⁻²⁴ J/T
  q1DeflHalf: sgDeflection({ ...P0, muZ: SILVER.muB / 2 }) / sgDeflection(P0), // 0.5: half the moment, half the height
  q1OvenZ: benchTheory({ source: 'oven', axes: ['z'], keep: [] }).plus, // 0.5
  q1Defl: sgDeflection(P0) * 1000, // 0.1048 mm
  q1DeflG2: sgDeflection({ ...P0, dBdz: 2 * P0.dBdz }) * 1000, // 0.2097 mm
  q1DeflRatio: sgDeflection({ ...P0, dBdz: 2 * P0.dBdz }) / sgDeflection(P0), // 2
  q1Spots: Object.keys(sequenceOutcomes({ source: 'oven', axes: ['z'] })).length, // 2
  q1SignDown: -sgDeflection({ ...P0, muZ: -SILVER.muB }) * 1000, // 0.1048 mm DOWNWARD (the size of a negative Δz)
  /* q1-sequences */
  q1OvenZZ: ovenZZ.plus, // 0.5
  q1Repeat: benchTheory({ source: '+z', axes: ['z'], keep: [] }).plus, // 1
  q1ProjIdem: yes(matEq(matmul(projector(KET['+z']), projector(KET['+z'])), projector(KET['+z']))), // 1: P² = P
  q1ZthenX: benchTheory({ source: '+z', axes: ['x'], keep: [] }).plus, // 0.5
  q1Zxz: zxz.plus, // 0.125
  q1ZxzBlocked1: zxz.blocked[0], // 0.5
  q1ZxzBlocked2: zxz.blocked[1], // 0.25
  q1XZ: benchTheory({ source: '+x', axes: ['z'], keep: [] }).plus, // 0.5
  q1Commutator: yes(matEq(commutator(SZ, SX), mscale(SY, I))), // 1: [S_z, S_x] = i S_y (ħ = 1)
  q1SyNoZero: yes(eigh(SY).values.every((x) => Math.abs(x) > 1e-9)), // 1: S_y (±½) has no zero eigenvalue, so neither has i S_y
  q1Zzz: zzz.plus, // 0.5
  q1Zxzx: benchTheory({ source: 'oven', axes: ['z', 'x', 'z', 'x'], keep: ['+', '+', '+'] }).plus, // 0.0625
  /* q1-superposition */
  q1ZOrth: abs(inner(KET['+z'], KET['-z'])), // 0
  q1ShadowsSum: worst(
    Array.from({ length: 37 }, (_, k) => ketFromBloch((k / 36) * Math.PI, 0)).map((psi) => prob(KET['+z'], psi) + prob(KET['-z'], psi)),
    1,
  ), // 1 at every sampled angle
  q1AmpX: abs(inner(KET['+z'], KET['+x'])), // 0.7071 = 1/√2
  q1PX: prob(KET['+z'], KET['+x']), // 0.5
  q1PMinusX: prob(KET['+z'], KET['-x']), // 0.5
  q1SeqZ: seqZ['++'], // 0.25
  q1PY: prob(KET['-z'], KET['+y']), // 0.5
  q1AmpY: inner(KET['-z'], KET['+y']).im, // 0.7071: the amplitude 0.707 i
  q1YnotX: yes(samePhysicalState(KET['+y'], KET['+x'])), // 0
  q1Qubit30: prob(KET['+z'], psi30), // 0.75
  q1Qubit30Minus: prob(KET['-z'], psi30), // 0.25
  q1Alpha30: inner(KET['+z'], psi30).re, // 0.8660
  q1Beta30: inner(KET['-z'], psi30).re, // 0.5
  q1ZeroIsUp: yes(vecEq(ket('0'), KET['+z'])), // 1
  q1SupZ: benchTheory({ source: '+x', axes: ['z'], keep: [] }).plus, // 0.5
  q1MixZ: benchTheory({ source: 'oven', axes: ['z'], keep: [] }).plus, // 0.5
  q1SupX: benchTheory({ source: '+x', axes: ['x'], keep: [] }).plus, // 1
  q1MixX: benchTheory({ source: 'oven', axes: ['x'], keep: [] }).plus, // 0.5
  q1ZeroSum: norm(vadd(KET['+z'], vscale(KET['+z'], -1))), // 0
  q1LenSqrt2: norm(vadd(KET['+z'], KET['-z'])), // 1.4142
  q1PNotUnit: norm(notUnit), // 1.3066
  q1PNotUnitTop: notUnit[0].re, // 1.2071: the first entry of (|+z⟩ + |+x⟩)/√2 (the second is 0.5)
  q1PNotUnitLen2: norm2(notUnit), // 1.7071: its squared length
  q1PNotUnitBottom: notUnit[1].re, // 0.5: its second entry
  q1PNotUnitCross: 2 * 0.5 * inner(KET['+z'], KET['+x']).re, // 0.7071: the cross term 2·(1/√2)²·⟨+z|+x⟩ of its squared length
  q1P34i: prob(KET['-z'], vec(0.6, c(0, 0.8))), // 0.64
  q1P34iUp: prob(KET['+z'], vec(0.6, c(0, 0.8))), // 0.36
  q1Sq34i: -mul(c(0, 0.8), c(0, 0.8)).re, // 0.64: (0.8i)² = −0.64, stored as its size
  q1PNorm: prob(KET['+z'], normalize(vec(1, 2))), // 0.2
  q1PDiff: prob(KET['+z'], normalize(diff)), // 0.1464
  q1DiffLen2: norm2(diff), // 0.5858
  q1DiffTop2: diff[0].re ** 2, // 0.0858
  /* q1-vector-space */
  q1Fig2Sum: norm(vadd(fig2A, fig2B)), // 1.8478 = 2 cos 22.5°
  q1Commute: yes(vecEq(vadd(fig2A, fig2B), vadd(fig2B, fig2A))), // 1
  q1Inverse: norm(vadd(KET['+x'], vscale(KET['+x'], -1))), // 0
  q1KetZeroNotZero: norm(ket('0')), // 1
  q1ScaleTwice: yes(vecEq(vscale(vscale(fig2A, 2), 3), vscale(fig2A, 6))), // 1
  q1Lazy: yes(lazyScalingPassesNotesRules()), // 1
  q1PolySum: vadd(vec(1, 2, 0), vec(0, 1, -1))[1].re, // 3: (1 + 2x) + (x − x²) has x-coefficient 3
  q1Degree: vadd(vec(0, 1, 1), vec(1, 0, -1))[2].re, // 0: the x² terms cancel
  q1VPoly: vadd(vec(1, 2, 0), vscale(vec(0, 1, -1), 3))[1].re, // 5
  q1RealScalars: vscale(vec(1, 0), I)[0].im, // 1: i·(1, 0) = (i, 0) leaves the real pairs
  q1ZeroVec: norm(vec(0, 0)), // 0
  /* q1-inner-product */
  q1BraY: inner(KET['+y'], KET['+y']).re, // 1
  q1ConjLinRe: conjLin.re, // 1.4142
  q1ConjLinMinusIm: -conjLin.im, // 0.7071: ⟨cβ|α⟩ = 1.414 − 0.707i
  q1Dot: inner(vec(1, 2), vec(3, -1)).re, // 1
  q1Norm34i: inner(vec(3, c(0, 4)), vec(3, c(0, 4))).re, // 25
  q1Len34i: norm(vec(3, c(0, 4))), // 5
  q1Bilinear34i: bilinear(vec(3, c(0, 4)), vec(3, c(0, 4))).re, // −7
  q1MHerm: yes(isHermitian(M_WEIGHT)), // 1
  q1MEigLow: eigh(M_WEIGHT).values[0], // 1
  q1MEigHigh: eigh(M_WEIGHT).values[1], // 3
  q1MNorm10: weightedInner(M_WEIGHT, vec(1, 0), vec(1, 0)).re, // 2
  q1MNorm1i: weightedInner(M_WEIGHT, vec(1, I), vec(1, I)).re, // 2
  q1MNorm1mi: weightedInner(M_WEIGHT, alphaMinusI, alphaMinusI).re, // 6
  q1Axler: inner(vscale(KET['+z'], I), KET['+z']).im, // −1: physics conjugates the bra
  q1AxlerIm: mul(I, inner(KET['+z'], KET['+z'])).im, // +1: Axler's first-slot rule
  q1Shadow: inner(KET['+z'], KET['+x']).re, // 0.7071
  q1Angle: (angleBetween(KET['+z'], KET['+x']) * 180) / Math.PI, // 45
  q1Fig3: inner(vec(2, 0), vec(1, 1)).re / norm(vec(2, 0)), // 1 = |(1, 1)| cos 45°
  q1BadM11: weightedInner(SIGMA_Z, vec(1, 1), vec(1, 1)).re, // 0
  q1BadM01: weightedInner(SIGMA_Z, vec(0, 1), vec(0, 1)).re, // −1
  q1Orth: abs(inner(vec(1, I), vec(I, 1))), // 0
  q1ConjLinCh: conjLinCh.im, // −0.6
  q1ConjLinChRe: conjLinCh.re, // 1.2
} as const

export type ValueKey = keyof typeof V
export const claim = keyedClaim<ValueKey>()
export { close, d, pct, tf, uf } from '../claimKit'
