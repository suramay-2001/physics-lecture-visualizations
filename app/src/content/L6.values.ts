/**
 * Lecture 6 numbers, computed once with the engine (owner: P). Same contract as L1–L5.values.ts: every number a
 * learner reads in L6 comes from `V` and is backed by a keyed claim; the numpy twin of each key is in
 * physics/__fixtures__/claims.json (pipeline/make_claim_fixtures.py, "L6" block). Keys start with `l6`.
 *
 * Complex results are stored as their real or imaginary part (the part the prose states); yes/no facts are 1 or
 * 0; a displayed magnitude of a negative number gets its own key (the number reader sees digits, not signs).
 * Finite differences are never stored as values (two float routes differ in the tenth digit): the exact value is
 * stored, and the finite difference only as a yes/no agreement. "At every …" sweeps store the worst sample
 * (`worst`), so the value equals its target only if every sample does.
 * Angles: θ is the Bloch polar angle, φ the azimuth and the R_z angle (the notes' equatorial θ is our φ).
 */
import { basis_changes } from '../physics/__fixtures__/numpy.json'
import { axisAngle, qrotate } from '../physics/belt'
import { type C, abs, add, arg, c, conj, div, expi, mul, scale, sub } from '../physics/complex'
import { blochOfMixture, maxPPlus, pPlus, purity, purityOfNorm, rhoFromMixture } from '../physics/density'
import {
  apply, dagger, det2, identity, inner, isUnitary, madd, mat, matEq, matmul, maxDiff, mpow, mscale, msub, norm, normalize, vadd, vec, vscale, vsub,
  type Mat, type Vec,
} from '../physics/linalg'
import { decomposeHermitian, evolve, expm2, expmSeries, generatorOf } from '../physics/operators'
import { benchTheory } from '../physics/sg'
import {
  AXIS, KET, Rz, SX, SY, SZ, basisMatrix, blochAngles, blochVector, cross, eigenHermitian2, eigenvectorFor, expectation, ketAlong, ketFromBloch, neg3,
  nDotSigma, operatorInBasis, phaseShift, prob, probUpAlong, rotation, samePhysicalState, spinAlong, tiltXZ, toBasis, type NamedKet, type Vec3,
} from '../physics/spin'
import { portProbs } from '../physics/townsend448'
import { keyedClaim } from './claimKit'

const DEG = Math.PI / 180
const yes = (b: boolean) => (b ? 1 : 0)
/** The sample farthest from `target`: equal to the target only if EVERY sample is (a minimum would only prove "at least"). */
const worst = (xs: number[], target: number) => xs.reduce((w, x) => (Math.abs(x - target) > Math.abs(w - target) ? x : w), target)
const vecEq = (a: Vec, b: Vec) => norm(vsub(a, b)) < 1e-12
const gap3 = (a: Vec3, b: Vec3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
const len3 = (r: Vec3) => Math.hypot(r[0], r[1], r[2])
const coh = (psi: Vec): C => mul(conj(psi[0]), psi[1])
const degs = (from: number, to: number, step: number) => Array.from({ length: Math.round((to - from) / step) + 1 }, (_, k) => from + k * step)

/** ψ★ = cos 30°|+z⟩ + e^{i45°} sin 30°|−z⟩, the generic state of Unit 6.1: Bloch angles (60°, 45°). */
export const psiStar = ketFromBloch(60 * DEG, 45 * DEG)
/** The real state of Unit 6.3 (Lecture 4's (√3/2, ½), the plane arrow at 30°): Bloch angles (60°, 0). */
export const psi60 = ketFromBloch(60 * DEG, 0)
/** The notes' "halfway" state on the equator, longitude 45°: (1/√2, (1 + i)/2). */
export const psi45 = ketFromBloch(90 * DEG, 45 * DEG)
/** An equatorial state at longitude 120° (relative phase e^{2πi/3}). */
export const psi120 = ketFromBloch(90 * DEG, 120 * DEG)

const XB: Vec[] = [KET['+x'], KET['-x']]
const rStar = blochVector(psiStar)
const EQUATOR: NamedKet[] = ['+x', '+y', '-x', '-y']
const SIX: [NamedKet, Vec3][] = [
  ['+z', [0, 0, 1]],
  ['-z', [0, 0, -1]],
  ['+x', [1, 0, 0]],
  ['-x', [-1, 0, 0]],
  ['+y', [0, 1, 0]],
  ['-y', [0, -1, 0]],
]
/** The seeded numpy fixture states (seed 448): "every pure state lands on the sphere" is tried on them too. */
const FX_PSI = basis_changes.map((b) => b.psi as Vec)

/* l6-active */
const rz90x = apply(Rz(90 * DEG), KET['+x'])
const rz90psi60 = apply(Rz(90 * DEG), psi60)
const psi30eq = ketFromBloch(90 * DEG, 30 * DEG)
/** m̂ = (x̂ + ẑ)/√2: B_{z←x} = i · (a half turn about m̂). */
const M_HAT: Vec3 = [Math.SQRT1_2, 0, Math.SQRT1_2]
const halfTurn = rotation(M_HAT, Math.PI)
const Bzx = basisMatrix(XB)
/** The SO(3) check: axes and angles for "the average arrow turns like an ordinary 3-vector". */
const SO3_CASES: { n: Vec3; phi: number; psi: Vec }[] = [
  { n: [0, 0, 1], phi: 90 * DEG, psi: psi60 },
  { n: [0, 0, 1], phi: 37 * DEG, psi: psiStar },
  { n: [0.3, 0.5, 0.8], phi: 2.2, psi: psi60 },
  { n: [0.3, 0.5, 0.8], phi: 2.2, psi: psiStar },
  { n: M_HAT, phi: Math.PI, psi: psiStar },
]
const so3Gap = ({ n, phi, psi }: { n: Vec3; phi: number; psi: Vec }) => gap3(qrotate(axisAngle(n, phi), blochVector(psi)), blochVector(apply(rotation(n, phi), psi)))
const avgPsi = ketFromBloch(90 * DEG, Math.atan2(0.8, 0.6))
const avgPsiTurned = apply(Rz(90 * DEG), avgPsi)

/* l6-generator */
/** I − iφ S_z (ħ = 1): the two-term small turn. */
const small = (phi: number): Mat => msub(identity(2), mscale(SZ, c(0, phi)))
/** M = −(iπ/2) S_z: the exponent of a quarter turn. */
const Mq = mscale(SZ, c(0, -Math.PI / 2))
const seriesErr = (K: number) => maxDiff(expmSeries(Mq, K), expm2(Mq))
const compound = (N: number) => maxDiff(mpow(small(Math.PI / 2 / N), N), Rz(Math.PI / 2))
const H = 1e-6
const rateExact = apply(mscale(SZ, c(0, -1)), KET['+x'])
const rateFd = vscale(vsub(apply(Rz(H), KET['+x']), KET['+x']), 1 / H)
const velFd = (psi: Vec): Vec3 => {
  const a = blochVector(apply(Rz(H), psi))
  const b = blochVector(apply(Rz(-H), psi))
  return [(a[0] - b[0]) / (2 * H), (a[1] - b[1]) / (2 * H), (a[2] - b[2]) / (2 * H)]
}
const w01 = small(0.1)[0][0]

/* l6-mixture */
const r = (k: NamedKet) => blochVector(KET[k])
const half = (a: NamedKet, b: NamedKet) => blochOfMixture([{ w: 0.5, r: r(a) }, { w: 0.5, r: r(b) }])
const ovenZ = half('+z', '-z')
const ovenX = half('+x', '-x')
const mixZX = half('+z', '+x')
const t55 = half('+z', '-x')
const turned = (k: NamedKet) => blochVector(apply(Rz(90 * DEG), KET[k]))
const mixTurn = blochOfMixture([{ w: 0.5, r: turned('+z') }, { w: 0.5, r: turned('+x') }])
const ovenTurn = blochOfMixture([{ w: 0.5, r: turned('+x') }, { w: 0.5, r: turned('-x') }])
const SAMPLE_AXES: Vec3[] = [AXIS.x, AXIS.y, AXIS.z, tiltXZ(45 * DEG), tiltXZ(-120 * DEG), [0.3, 0.5, 0.8]]

/* challenges */
const v68 = vec(0.6, 0.8)
const v68i = vec(0.6, c(0, 0.8))
const vPhase = normalize(vec(c(1, 1), 2))
const antipode = ketAlong(neg3(rStar))

/* Townsend pass, G2a: the S_n eigenproblem, active versus passive, the Hermitian generator, the eigenket route, R_y in closed form, the interferometer */
const Y_AXIS: Vec3 = [0, 1, 0]
const nAt = (thetaDeg: number, phiDeg: number): Vec3 => [Math.sin(thetaDeg * DEG) * Math.cos(phiDeg * DEG), Math.sin(thetaDeg * DEG) * Math.sin(phiDeg * DEG), Math.cos(thetaDeg * DEG)]
const tnEigVec = eigenvectorFor(nDotSigma(nAt(70, 200)), 1)
const tnRatio = div(tnEigVec[1], tnEigVec[0])
const psiAct = ketFromBloch(50 * DEG, 30 * DEG)
/** The state turned BACK by `deg` about y, R_y(-deg) psi (the active reading of Townsend Eq. 2.93). */
const turnedBack = (deg: number): Vec => apply(rotation(Y_AXIS, -deg * DEG), psiAct)
const tnC: Vec = vec(0.6, c(0, 0.8))
/** Townsend's |-x> = R(pi/2 j)|-z> = (-1, 1)/sqrt2 (Eq. 2.90), the sign the book's turn gives. */
const bookMinusX: Vec = vec(-Math.SQRT1_2, Math.SQRT1_2)
const unitDiag = (G: Mat, dphi: number, i: 0 | 1): number => {
  const R = msub(identity(2), mscale(G, c(0, dphi))) // 1 - i G dphi, hbar = 1
  return matmul(dagger(R), R)[i][i].re
}
const GBAD = mscale(SZ, c(0, 1)) // the "generator" i S_z, which is not Hermitian
/** What Eq. 2.37's series still lacks after n terms, for the phase -i phi/2 of a turn by phi (degrees) on |+z>. */
const seriesLack = (n: number, phiDeg: number): number => {
  const x = c(0, (-phiDeg * DEG) / 2)
  let term = c(1)
  let sum = c(0)
  for (let k = 0; k < n; k++) {
    sum = add(sum, term)
    term = scale(mul(term, x), 1 / (k + 1))
  }
  return abs(sub(expi((-phiDeg * DEG) / 2), sum))
}
const RZ100 = Rz(100 * DEG)
const RY100 = rotation(Y_AXIS, 100 * DEG)
const RY70 = rotation(Y_AXIS, 70 * DEG)
const ryClosed = (thDeg: number): Mat => msub(mscale(identity(2), Math.cos((thDeg * DEG) / 2)), mscale(SY, c(0, 2 * Math.sin((thDeg * DEG) / 2))))
const ryPlusZ = apply(RY100, KET['+z'])
const minusN = ketAlong(neg3(tiltXZ(100 * DEG)))
const equatorAzimuth = (): number => {
  let best = 0
  let bestGap = Infinity
  for (let k = 0; k < 3600; k++) {
    const phiDeg = k / 10
    const psi = ketFromBloch(90 * DEG, phiDeg * DEG)
    const gap = Math.abs(expectation(SY, psi) + 1 / (2 * Math.SQRT2)) + (expectation(SX, psi) > 0 ? 0 : 10)
    if (gap < bestGap) {
      bestGap = gap
      best = phiDeg
    }
  }
  return best
}
/** The smallest turn (degrees, whole tenths) at which the + port of the interferometer for |+x> falls to 1/4. */
const portAngleQuarter = (): number => {
  for (let k = 0; k < 7200; k++) if (portProbs(KET['+x'], k / 10).plus <= 0.25 + 1e-9) return k / 10
  return NaN
}
const portPeriod = (): number => [360, 720].find((p) => [0, 40, 100, 150].every((ph) => Math.abs(portProbs(KET['+x'], ph + p).plus - portProbs(KET['+x'], ph).plus) < 1e-9)) ?? NaN

export const V = {
  /* l6-bloch */
  l6RStarX: rStar[0], // 0.6124
  l6RStarY: rStar[1], // 0.6124
  l6RStarZ: rStar[2], // 0.5
  l6AvgStarX: expectation(SX, psiStar), // 0.3062 (ħ)
  l6AvgStarY: expectation(SY, psiStar), // 0.3062 (ħ)
  l6AvgStarZ: expectation(SZ, psiStar), // 0.25 (ħ)
  l6CohStarRe: coh(psiStar).re, // 0.3062
  l6CohStarIm: coh(psiStar).im, // 0.3062
  l6PopStarUp: prob(KET['+z'], psiStar), // 0.75
  l6PopStarDown: prob(KET['-z'], psiStar), // 0.25
  l6UnitSphere: worst([...degs(0, 180, 30).map((t) => len3(blochVector(ketFromBloch(t * DEG, 45 * DEG)))), ...FX_PSI.map((p) => len3(blochVector(p)))], 1), // 1
  l6UnitCross: 4 * prob(KET['+z'], psiStar) * prob(KET['-z'], psiStar), // 0.75
  l6UnitHeight: (prob(KET['+z'], psiStar) - prob(KET['-z'], psiStar)) ** 2, // 0.25
  l6SixPoints: yes(SIX.every(([k, a]) => gap3(blochVector(KET[k]), a) < 1e-12)), // 1
  l6PzRule: probUpAlong(AXIS.z, rStar), // 0.75
  l6PzRuleBorn: yes(Math.abs(probUpAlong(AXIS.z, rStar) - prob(KET['+z'], psiStar)) < 1e-12), // 1
  l6TwoTheta: blochAngles(psiStar).theta / DEG, // 60
  l6TwoPhi: blochAngles(psiStar).phi / DEG, // 45
  l6TwoRecover: yes(samePhysicalState(ketFromBloch(blochAngles(vscale(psiStar, expi(1))).theta, blochAngles(vscale(psiStar, expi(1))).phi), vscale(psiStar, expi(1)))), // 1
  l6Polarized: prob(ketAlong(rStar), psiStar), // 1
  l6PolarizedMean: expectation(spinAlong(rStar), psiStar), // 0.5 (ħ)
  l6TownsendN: yes(vecEq(psiStar, vec(Math.sqrt(3) / 2, c(Math.SQRT1_2 / 2, Math.SQRT1_2 / 2)))), // 1: (cos 30°, e^{i45°} sin 30°)
  l6ZOrth: abs(inner(KET['+z'], KET['-z'])), // 0
  l6NegSame: yes(samePhysicalState(KET['+z'], vscale(KET['+z'], -1))), // 1
  l6NegSameZ: blochVector(vscale(KET['+z'], -1))[2], // 1: −|+z⟩ sits on the north pole
  l6Theta90: (2 * Math.acos(Math.sqrt(0.9))) / DEG, // 36.87
  l6Theta90P: worst([0, 90, 200].map((p) => prob(KET['+z'], ketFromBloch(2 * Math.acos(Math.sqrt(0.9)), p * DEG))), 0.9), // 0.9 at every φ
  l6HeightAt60: worst(degs(0, 330, 30).map((p) => blochVector(ketFromBloch(60 * DEG, p * DEG))[2]), 0.5), // 0.5 at every φ
  /* l6-equator */
  l6EqHalf: worst(EQUATOR.map((k) => prob(KET['+z'], KET[k])), 0.5), // 0.5
  l6PhaseX: blochAngles(KET['+x']).phi / DEG, // 0
  l6PhaseY: blochAngles(KET['+y']).phi / DEG, // 90
  l6PhaseMinusX: blochAngles(KET['-x']).phi / DEG, // 180
  l6PhaseMinusY: blochAngles(KET['-y']).phi / DEG, // −90
  l6Psi45Alpha: psi45[0].re, // 0.7071
  l6Psi45BetaRe: psi45[1].re, // 0.5
  l6Psi45BetaIm: psi45[1].im, // 0.5
  l6Psi45Rx: blochVector(psi45)[0], // 0.7071
  l6Psi45Ry: blochVector(psi45)[1], // 0.7071
  l6Psi45Rz: blochVector(psi45)[2], // 0
  l6UnitFactor: abs(div(psi45[1], KET['+x'][1])), // 1: the extra factor (1 + i)/√2 has size 1
  l6Psi45Pz: prob(KET['+z'], psi45), // 0.5
  l6Avg45X: expectation(SX, psi45), // 0.3536 (ħ)
  l6Avg45Y: expectation(SY, psi45), // 0.3536 (ħ)
  l6Avg45Z: expectation(SZ, psi45), // 0
  l6Coh45Re: coh(psi45).re, // 0.3536
  l6Coh45Im: coh(psi45).im, // 0.3536
  l6EqAnyX: blochVector(psi120)[0], // −0.5
  l6EqAnyXSize: Math.abs(blochVector(psi120)[0]), // 0.5
  l6EqAnyY: blochVector(psi120)[1], // 0.8660
  l6EqAnyZ: blochVector(psi120)[2], // 0
  l6AzimuthIsPhase: worst(degs(0, 180, 45).map((p) => blochAngles(ketFromBloch(90 * DEG, p * DEG)).phi - p * DEG), 0), // 0
  l6ArgIsPhase: worst(degs(0, 180, 45).map((p) => { const k = ketFromBloch(90 * DEG, p * DEG); return arg(div(k[1], k[0])) - p * DEG }), 0), // 0
  l6YFromPhase: yes(samePhysicalState(ketFromBloch(90 * DEG, 90 * DEG), KET['+y'])), // 1
  l6YX: prob(KET['+y'], KET['+x']), // 0.5
  l6CohYRe: coh(KET['+y']).re, // 0
  l6CohYIm: coh(KET['+y']).im, // 0.5
  l6PlusYRx: blochVector(KET['+y'])[0], // 0
  l6PlusYRy: blochVector(KET['+y'])[1], // 1
  l6GlobalX: blochVector(vscale(psi120, c(0, 1)))[0], // −0.5
  l6GlobalY: blochVector(vscale(psi120, c(0, 1)))[1], // 0.8660
  l6GlobalSame: yes(degs(0, 360, 30).every((x) => samePhysicalState(vscale(psi120, expi(x * DEG)), psi120) && gap3(blochVector(vscale(psi120, expi(x * DEG))), blochVector(psi120)) < 1e-12)), // 1
  l6PlusXAlongZ: benchTheory({ source: '+x', axes: ['z'], keep: [] }).plus, // 0.5
  l6OvenAlongZ: benchTheory({ source: 'oven', axes: ['z'], keep: [] }).plus, // 0.5
  l6PlusXAlongX: benchTheory({ source: '+x', axes: ['x'], keep: [] }).plus, // 1
  l6OvenAlongX: benchTheory({ source: 'oven', axes: ['x'], keep: [] }).plus, // 0.5
  l6BetaY: KET['+y'][1].im, // 0.7071: β = i/√2
  /* l6-active */
  l6PassiveU: toBasis(psi60, XB)[0].re, // 0.9659
  l6PassiveV: toBasis(psi60, XB)[1].re, // 0.2588
  l6PassiveMeanX: expectation(operatorInBasis(SZ, XB), toBasis(psi60, XB)), // 0.25
  l6PassiveMeanZ: expectation(SZ, psi60), // 0.25
  l6ActiveRx: blochVector(rz90x)[0], // 0
  l6ActiveRy: blochVector(rz90x)[1], // 1
  l6DiagTurns: blochAngles(apply(phaseShift(60 * DEG), psi30eq)).phi / DEG, // 90
  l6RzEven: yes(matEq(Rz(1), mscale(phaseShift(1), expi(-0.5)))), // 1
  l6RzSameState: yes(samePhysicalState(apply(Rz(60 * DEG), psi30eq), apply(phaseShift(60 * DEG), psi30eq))), // 1
  l6Rz90xRe: inner(KET['+y'], rz90x).re, // 0.7071
  l6Rz90xIm: inner(KET['+y'], rz90x).im, // −0.7071
  l6Rz90xImSize: Math.abs(inner(KET['+y'], rz90x).im), // 0.7071
  l6Rz90xState: yes(samePhysicalState(rz90x, KET['+y'])), // 1
  l6RzProps: yes(matEq(Rz(0), identity(2)) && isUnitary(Rz(1.3)) && matEq(Rz(-1.3), dagger(Rz(1.3))) && matEq(matmul(Rz(60 * DEG), Rz(30 * DEG)), Rz(90 * DEG))), // 1
  l6Psi60Rx: blochVector(psi60)[0], // 0.8660
  l6Psi60Rz: blochVector(psi60)[2], // 0.5
  l6TurnedRx: blochVector(rz90psi60)[0], // 0
  l6TurnedRy: blochVector(rz90psi60)[1], // 0.8660
  l6SzKept: worst(degs(0, 90, 15).map((p) => expectation(SZ, apply(Rz(p * DEG), psi60))), 0.25), // 0.25 at every sampled angle
  l6PyBefore: prob(KET['+y'], psi60), // 0.5
  l6PyAfter: prob(KET['+y'], rz90psi60), // 0.9330
  l6SyAfter: expectation(SY, rz90psi60), // 0.4330 (ħ)
  l6So3: worst(SO3_CASES.map(so3Gap), 0), // 0: quaternion (SO(3)) route = the spin rotation's Bloch vector
  l6Rz180xRe: inner(KET['-x'], apply(Rz(Math.PI), KET['+x'])).re, // 0
  l6Rz180xIm: inner(KET['-x'], apply(Rz(Math.PI), KET['+x'])).im, // −1
  l6Rz180xState: yes(samePhysicalState(apply(Rz(Math.PI), KET['+x']), KET['-x'])), // 1
  l6RzPlusZRe: apply(Rz(90 * DEG), KET['+z'])[0].re, // 0.7071
  l6RzPlusZIm: apply(Rz(90 * DEG), KET['+z'])[0].im, // −0.7071
  l6RzPlusZState: yes(degs(0, 180, 15).every((p) => samePhysicalState(apply(Rz(p * DEG), KET['+z']), KET['+z']))), // 1
  l6SuperMoves: yes(samePhysicalState(rz90psi60, psi60)), // 0: a superposition does move
  l6SuperOverlap: prob(psi60, rz90psi60), // 0.625
  l6DetB: det2(Bzx).re, // −1
  l6DetRz: det2(Rz(1.2)).re, // 1
  l6BIsHalfTurn: yes(matEq(Bzx, mscale(halfTurn, c(0, 1)))), // 1
  l6BArrowX: decomposeHermitian(Bzx)!.a[0], // 0.7071
  l6BArrowZ: decomposeHermitian(Bzx)!.a[2], // 0.7071
  l6PassiveIsActive: yes(samePhysicalState(toBasis(psiStar, XB), apply(halfTurn, psiStar))), // 1
  l6HalfTurnZ: blochVector(apply(halfTurn, KET['+z']))[0], // 1: +z → +x
  l6HalfTurnY: blochVector(apply(halfTurn, KET['+y']))[1], // −1: +y → −y
  /* l6-generator */
  l6SeriesErr1: seriesErr(1), // 0.3032
  l6SeriesErr2: seriesErr(2), // 0.0798
  l6SeriesErr3: seriesErr(3), // 0.0157
  l6SeriesErr5: seriesErr(5), // 3.24e-4
  l6SeriesErr10: seriesErr(10), // 1.75e-9
  l6SeriesLimit: yes(maxDiff(expm2(Mq), Rz(Math.PI / 2)) < 1e-12), // 1
  l6ExpDiagTop: mscale(SZ, c(0, -1.2))[0][0].im, // −0.6
  l6ExpDiagTopSize: Math.abs(mscale(SZ, c(0, -1.2))[0][0].im), // 0.6
  l6ExpDiagBottom: mscale(SZ, c(0, -1.2))[1][1].im, // 0.6
  l6ExpAngle: 2 * arg(Rz(1.2)[1][1]), // 1.2: R_z(1.2) multiplies β by e^{0.6i}
  l6ExpIsRz: yes(maxDiff(expm2(mscale(SZ, c(0, -1.2))), Rz(1.2)) < 1e-12), // 1
  l6SzEigUp: eigenHermitian2(SZ).values[0], // 0.5
  l6SzEigDown: eigenHermitian2(SZ).values[1], // −0.5
  l6SzEigVecs: yes(samePhysicalState(eigenHermitian2(SZ).vectors[0], KET['+z']) && samePhysicalState(eigenHermitian2(SZ).vectors[1], KET['-z'])), // 1
  l6PolesFixed: yes(samePhysicalState(apply(Rz(1.2), KET['+z']), KET['+z']) && samePhysicalState(apply(Rz(1.2), KET['-z']), KET['-z'])), // 1
  l6LinErr01: maxDiff(Rz(0.1), small(0.1)), // 0.00125
  l6LinRatio: maxDiff(Rz(0.1), small(0.1)) / maxDiff(Rz(0.01), small(0.01)), // ≈ 100
  l6RateTopIm: rateExact[0].im, // −0.3536
  l6RateTopImSize: Math.abs(rateExact[0].im), // 0.3536
  l6RateBottomIm: rateExact[1].im, // 0.3536
  l6RateFd: yes(norm(vsub(rateFd, rateExact)) < 1e-5), // 1: the finite difference agrees
  l6GenIsSz: yes(maxDiff(generatorOf(Rz), SZ) < 1e-9), // 1: the central difference recovers S_z
  l6BlochVelY: cross(AXIS.z, blochVector(KET['+x']))[1], // 1
  l6BlochVelFd: yes(gap3(velFd(KET['+x']), [0, 1, 0]) < 1e-6), // 1
  l6Compound1: compound(1), // 0.3032
  l6Compound10: compound(10), // 0.0313
  l6Compound100: compound(100), // 0.00309
  l6Compound1000: compound(1000), // 0.000309
  l6EvolveIsRz: yes(maxDiff(evolve(SZ, 1.2), Rz(1.2)) < 1e-12), // 1
  l6NoI: norm(apply(madd(identity(2), mscale(SZ, 0.1)), KET['+z'])), // 1.05
  l6WithI: norm(apply(small(0.1), KET['+z'])), // 1.00125
  l6WIm: w01.im, // −0.05: R_z(dφ) ≈ I − i dφ S_z multiplies α by 1 − 0.05i at dφ = 0.1
  l6WImSize: Math.abs(w01.im), // 0.05
  l6WSize: abs(w01), // 1.00125
  l6WAngle: arg(w01) / DEG, // −2.862
  l6WHalfStep: arg(Rz(0.1)[0][0]) / DEG, // −2.865 = −dφ/2
  l6BetaByI: Rz(Math.PI)[1][1].im, // 1: R_z(180°) multiplies β by i …
  l6AlphaByMinusI: Rz(Math.PI)[0][0].im, // −1: … and α by −i
  /* l6-mixture */
  l6BallPlusX: r('+x')[0], // 1
  l6BallOvenLen: len3(ovenZ), // 0
  l6BallP60Pure: pPlus(r('+x'), tiltXZ(60 * DEG)), // 0.9330
  l6BallP60Oven: pPlus(ovenZ, tiltXZ(60 * DEG)), // 0.5
  l6RecipesLen: worst([len3(ovenZ), len3(ovenX)], 0), // 0
  l6RecipesP: worst(SAMPLE_AXES.flatMap((n) => [pPlus(ovenZ, n), pPlus(ovenX, n)]), 0.5), // 0.5 along every sampled axis
  l6MixZXx: mixZX[0], // 0.5
  l6MixZXz: mixZX[2], // 0.5
  l6MixZXLen: len3(mixZX), // 0.7071
  l6MixZXPurity: purityOfNorm(len3(mixZX)), // 0.75
  l6MixZXPurityRho: purity(rhoFromMixture([{ w: 0.5, psi: KET['+z'] }, { w: 0.5, psi: KET['+x'] }])), // 0.75
  l6SupZXx: blochVector(normalize(vadd(KET['+z'], KET['+x'])))[0], // 0.7071
  l6SupZXz: blochVector(normalize(vadd(KET['+z'], KET['+x'])))[2], // 0.7071
  l6T55X: t55[0], // −0.5
  l6T55XSize: Math.abs(t55[0]), // 0.5
  l6T55Z: t55[2], // 0.5
  l6T55Sx: 0.5 * expectation(SX, KET['+z']) + 0.5 * expectation(SX, KET['-x']), // −0.25 (ħ)
  l6T55Purity: purity(rhoFromMixture([{ w: 0.5, psi: KET['+z'] }, { w: 0.5, psi: KET['-x'] }])), // 0.75
  l6OvenPurity: purity(rhoFromMixture([{ w: 0.5, psi: KET['+z'] }, { w: 0.5, psi: KET['-z'] }])), // 0.5
  l6T55Px: pPlus(t55, AXIS.x), // 0.25
  l6MixTurnX: mixTurn[0], // 0
  l6MixTurnY: mixTurn[1], // 0.5
  l6MixTurnZ: mixTurn[2], // 0.5
  l6MixTurnLen: len3(mixTurn), // 0.7071
  l6OvenTurned: len3(ovenTurn), // 0
  l6FilterX: benchTheory({ source: 'oven', axes: ['x', 'x'], keep: ['+'] }).plus, // 0.5
  l6FilterXMinus: benchTheory({ source: 'oven', axes: ['x', 'x'], keep: ['+'] }).minus, // 0
  l6FilterTilt: benchTheory({ source: 'oven', axes: ['x', 60], keep: ['+'] }).plus, // 0.4665 = ½ × 0.933
  /* challenges */
  l6ChPopUp: prob(KET['+z'], v68), // 0.36
  l6ChPopDown: prob(KET['-z'], v68), // 0.64
  l6ChRz: blochVector(v68)[2], // −0.28
  l6ChRzSize: Math.abs(blochVector(v68)[2]), // 0.28
  l6ChTheta: blochAngles(v68).theta / DEG, // 106.26
  l6ChHalfTheta: blochAngles(v68).theta / 2 / DEG, // 53.13
  l6ChAlphaBack: Math.cos(blochAngles(v68).theta / 2), // 0.6
  l6ChPhi: blochAngles(v68i).phi / DEG, // 90
  l6ChThetaI: blochAngles(v68i).theta / DEG, // 106.26
  l6ChCohIm: coh(v68i).im, // 0.48
  l6ChRy: blochVector(v68i)[1], // 0.96
  l6ChPy: prob(KET['+y'], v68i), // 0.98
  l6ChOpp: prob(antipode, psiStar), // 0
  l6ChOppPz: prob(KET['+z'], antipode), // 0.25
  l6ChOppTrap: prob(vscale(psiStar, -1), psiStar), // 1
  l6ChDisguise: yes(samePhysicalState(vscale(vec(c(0, 1), 1), Math.SQRT1_2), KET['-y'])), // 1
  l6ChDisguiseWrong: yes(samePhysicalState(vscale(vec(c(0, -1), 1), Math.SQRT1_2), KET['+y'])), // 1
  l6ChPhase: blochAngles(vPhase).phi / DEG, // −45
  l6ChPhaseRx: blochVector(vPhase)[0], // 0.6667
  l6ChPhaseRy: blochVector(vPhase)[1], // −0.6667
  l6ChPhaseRz: blochVector(vPhase)[2], // −0.3333
  l6ChPhaseRzSize: Math.abs(blochVector(vPhase)[2]), // 0.3333
  l6ChPx: prob(KET['+x'], ketFromBloch(90 * DEG, 60 * DEG)), // 0.75
  l6ChPxRx: blochVector(ketFromBloch(90 * DEG, 60 * DEG))[0], // 0.5
  l6ChActPx: prob(KET['+x'], apply(Rz(60 * DEG), psi60)), // 0.7165
  l6ChActRx: blochVector(apply(Rz(60 * DEG), psi60))[0], // 0.4330
  l6ChActRy: blochVector(apply(Rz(60 * DEG), psi60))[1], // 0.75
  l6ChActBefore: prob(KET['+x'], psi60), // 0.9330
  l6ChMinusY: (blochAngles(KET['-y']).phi / DEG + 360) % 360, // 270
  l6ChMinusYOk: yes(samePhysicalState(apply(Rz(270 * DEG), KET['+x']), KET['-y']) && samePhysicalState(apply(Rz(90 * DEG), KET['+x']), KET['+y'])), // 1
  l6ChRotAvgX: expectation(SX, avgPsiTurned), // −0.4 (ħ)
  l6ChRotAvgXSize: Math.abs(expectation(SX, avgPsiTurned)), // 0.4
  l6ChRotAvgY: expectation(SY, avgPsiTurned), // 0.3 (ħ)
  l6ChRotBeforeX: expectation(SX, avgPsi), // 0.3 (ħ)
  l6ChRotBeforeY: expectation(SY, avgPsi), // 0.4 (ħ)
  l6ChExpDiag: expm2(mat([[0, 0], [0, c(0, Math.PI)]]))[1][1].re, // −1
  l6ChLeftover: maxDiff(Rz(0.2), small(0.2)), // 0.00500
  l6ChLeftExactRe: Rz(0.2)[0][0].re, // 0.99500
  l6ChLeftExactImSize: Math.abs(Rz(0.2)[0][0].im), // 0.09983
  l6ChVelX: cross(AXIS.z, blochVector(KET['+y']))[0], // −1
  l6ChVelFd: yes(gap3(velFd(KET['+y']), [-1, 0, 0]) < 1e-6), // 1
  l6ChCertain: maxPPlus(mixZX), // 0.8536
  l6ChOneMagnet: benchTheory({ source: '+x', axes: ['x'], keep: [] }).plus - benchTheory({ source: 'oven', axes: ['x'], keep: [] }).plus, // 0.5
  l6ChBestTilt: Math.atan2(t55[0], t55[2]) / DEG, // −45
  l6ChBestTiltP: pPlus(t55, tiltXZ(-45 * DEG)), // 0.8536

  /* Townsend pass, G2a: l6-bloch:b7b, l6-active:b6b, l6-generator:b6b-b6d, practice questions */
  l6TNRatioAbs: abs(tnRatio), // 0.7002 = tan 35 deg
  l6TNRatioArg: (arg(tnRatio) / DEG + 360) % 360, // 200
  l6TNEig: eigenHermitian2(nDotSigma(nAt(70, 200))).values[0], // 1
  l6TActiveP: prob(KET['+z'], turnedBack(90)), // 0.8317: state turned back 90 deg about y, z magnet
  l6TPassiveP: prob(KET['+x'], psiAct), // 0.8317: the state kept, an x magnet
  l6TPassiveDiff: Math.abs(prob(KET['+z'], turnedBack(90)) - prob(KET['+x'], psiAct)), // 0
  l6TActive40: prob(KET['+z'], turnedBack(40)), // 0.9594
  l6TPassive40: prob(ketAlong(tiltXZ(40 * DEG)), psiAct), // 0.9594: the magnet tilted 40 deg toward +x
  l6TLinear: norm(vsub(apply(rotation(Y_AXIS, 90 * DEG), tnC), vadd(vscale(KET['+x'], tnC[0]), vscale(bookMinusX, tnC[1])))), // 0
  l6TUnit1Diag: unitDiag(SZ, 0.1, 0), // 1.0025
  l6TBadDiag0: unitDiag(GBAD, 0.1, 0), // 1.1025
  l6TBadDiag1: unitDiag(GBAD, 0.1, 1), // 0.9025
  l6TEigPhasePlus: arg(RZ100[0][0]) / DEG, // -50
  l6TEigPhaseMinus: arg(RZ100[1][1]) / DEG, // 50
  l6TRelPhase: arg(div(RZ100[1][1], RZ100[0][0])) / DEG, // 100
  l6TSeriesErr4: seriesLack(4, 100), // 0.0239
  l6TSeriesErr6: seriesLack(6, 100), // 0.00062
  l6TOwnAxisMove: gap3(blochVector(apply(rotation(tiltXZ(60 * DEG), 120 * DEG), psi60)), blochVector(psi60)), // 0: a turn about the state's own axis
  l6TPerpMoveDeg: blochAngles(apply(rotation(Y_AXIS, 60 * DEG), KET['+z'])).theta / DEG, // 60
  l6TRyCos: RY100[0][0].re, // 0.6428 = cos 50 deg
  l6TRySin: RY100[1][0].re, // 0.7660 = sin 50 deg
  l6TRyDefect: maxDiff(expm2(mscale(SY, c(0, -100 * DEG))), ryClosed(100)), // 0: the series sum against the closed form
  l6TRyPolar: blochAngles(ryPlusZ).theta / DEG, // 100
  l6TRyAzim: blochAngles(ryPlusZ).phi / DEG, // 0
  l6TRyGap: norm(vadd(apply(RY100, KET['-z']), minusN)), // 0: R_y(100) |-z> = -|-n>
  l6PAzim: equatorAzimuth(), // 315
  l6PChanceY: prob(KET['+y'], ketFromBloch(70 * DEG, 130 * DEG)), // 0.8599: (1 + sin 70° sin 130°)/2
  l6PPort: portProbs(KET['+x'], 150).plus, // 0.6294
  l6PRyX: prob(KET['+x'], apply(RY70, KET['+z'])), // 0.9698: (1 + sin 70°)/2
  l6PPortAngle: portAngleQuarter(), // 240
  l6PPeriod: portPeriod(), // 720
} as const

export type ValueKey = keyof typeof V

/** A claim tied to one L6 engine value: its text starts with `key · ` (read by content/claims.test.ts). */
export const claim = keyedClaim<ValueKey>()

export { close, d, pct, tf, uf } from './claimKit'
