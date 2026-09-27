/**
 * Lecture 7 numbers, computed once with the engine (owner: P). Same contract as L1–L6.values.ts: every number a
 * learner reads in L7 comes from `V` and is backed by a keyed claim; the numpy twin of each key is in
 * physics/__fixtures__/claims.json (pipeline/make_claim_fixtures.py, "L7" block). Keys start with `l7`.
 *
 * Complex results are stored as their real or imaginary part (the part the prose states); yes/no facts are 1 or
 * 0; a displayed magnitude of a negative number gets its own key (the number reader sees digits, not signs).
 * "At every …" sweeps store the worst sample (`worst`), so the value equals its target only if every sample does.
 * Angles: θ is the Bloch polar angle, φ the azimuth and the R_z angle (the notes' equatorial θ is our φ).
 * Commutators are never averaged with `expectation` (it throws on a non-Hermitian operator): `sandwich` keeps the
 * imaginary part that the uncertainty bound needs.
 */
import { type C, abs, arg, c, expi, mul } from '../physics/complex'
import { anticommutator, apply, commutator, identity, inner, madd, matEq, matmul, maxDiff, mscale, msub, norm, norm2, normalize, vscale, vsub, type Vec } from '../physics/linalg'
import { decomposeHermitian, expm2, generatorOf } from '../physics/operators'
import { benchTheory, sequenceOutcomes } from '../physics/sg'
import {
  KET, Rz, SX, SY, SZ, blochAngle, blochVector, collapse, cross, eigenHermitian2, expectation, fromSpectrum, jointProb, ketFromBloch, measure, prob,
  probUpAlong, projector, rayAngle, relativeSign, rotation, samePhysicalState, sandwich, spinAlong, spread, spreadsFromBloch, tiltXZ, uncertaintyCheck,
  variance, type Vec3,
} from '../physics/spin'
import { axisAngle, qrotate } from '../physics/belt'
import { keyedClaim } from './claimKit'

const DEG = Math.PI / 180
const yes = (b: boolean) => (b ? 1 : 0)
/** The sample farthest from `target`: equal to the target only if EVERY sample is (a minimum would only prove "at least"). */
const worst = (xs: number[], target: number) => xs.reduce((w, x) => (Math.abs(x - target) > Math.abs(w - target) ? x : w), target)
const vecEq = (a: Vec, b: Vec) => norm(vsub(a, b)) < 1e-12
const gap3 = (a: Vec3, b: Vec3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
const zero2 = mscale(identity(2), 0)
const degs = (from: number, to: number, step: number) => Array.from({ length: Math.round((to - from) / step) + 1 }, (_, k) => from + k * step)

/** The equatorial state at azimuth φ (degrees): (|+z⟩ + e^{iφ}|−z⟩)/√2. */
export const eq = (phiDeg: number): Vec => ketFromBloch(90 * DEG, phiDeg * DEG)
/** A state at Bloch angles (θ, φ) in degrees. */
export const at = (thetaDeg: number, phiDeg: number): Vec => ketFromBloch(thetaDeg * DEG, phiDeg * DEG)
/** The generic state of Units 7.5–7.6: θ = 60°, φ = 45°. */
export const psi6045 = at(60, 45)
/** Lecture 4's real state (√3/2, ½): θ = 60°, φ = 0. */
export const psi60 = at(60, 0)
/** Townsend's Example 1.2 state, ½|+z⟩ + (i√3/2)|−z⟩. */
const psiT: Vec = [c(0.5), c(0, Math.sqrt(3) / 2)]
/** Spin along an axis tilted 60° (and 45°) from +z toward +x. */
const S60 = spinAlong(tiltXZ(60 * DEG))
const S45 = spinAlong(tiltXZ(45 * DEG))
const P = projector
const rel = (a: Vec, b: Vec): C => relativeSign(a, b)
const sd = spread
const prod = (psi: Vec) => sd(SX, psi) * sd(SY, psi)
const bound = (psi: Vec) => 0.5 * Math.abs(expectation(SZ, psi))
const S_ALL = [SX, SY, SZ]
const sumVar = (psi: Vec) => S_ALL.reduce((s, A) => s + variance(A, psi), 0)

/* l7-full-turn */
const rz2x = apply(Rz(2 * Math.PI), KET['+x'])
const rz4x = apply(Rz(4 * Math.PI), KET['+x'])
const refB0 = blochVector(psi60Turned(0))
const refB1 = blochVector(psi60Turned(90))
function psi60Turned(phiDeg: number): Vec {
  return apply(Rz(phiDeg * DEG), at(60, 30))
}
/** ⟨+x|R_z(φ)|+x⟩ = cos(φ/2): the first φ > 0 (whole degrees up to 1440°) where the ket is home, sign included. */
const firstHome = degs(1, 1440, 1).find((p) => Math.abs(sandwich(Rz(p * DEG), KET['+x']).re - 1) < 1e-12 && Math.abs(sandwich(Rz(p * DEG), KET['+x']).im) < 1e-12) ?? Number.NaN

/* l7-order */
const branch = apply(P(KET['+x']), KET['+z'])
const up = collapse(P(KET['+x']), KET['+z'])
const seqXZ = sequenceOutcomes({ source: '+z', axes: ['x', 'z'] })

/* l7-compatible */
const B = madd(identity(2), mscale(SZ, 4))
const Pz = P(KET['+z'])
const Px = P(KET['+x'])
const Rx = (e: number) => rotation([1, 0, 0], e)
const Ry = (e: number) => rotation([0, 1, 0], e)
const EPS = 0.01
const smallGap = maxDiff(msub(matmul(Rx(EPS), Ry(EPS)), matmul(Ry(EPS), Rx(EPS))), mscale(SZ, c(0, -EPS * EPS)))
const xThenY = blochVector(apply(Ry(Math.PI / 2), apply(Rx(Math.PI / 2), KET['+z'])))
const yThenX = blochVector(apply(Rx(Math.PI / 2), apply(Ry(Math.PI / 2), KET['+z'])))
const nA: Vec3 = [Math.sin(30 * DEG), 0, Math.cos(30 * DEG)]
const mA: Vec3 = [0, Math.sin(50 * DEG), Math.cos(50 * DEG)]
const commArrow = decomposeHermitian(mscale(commutator(SX, SY), c(0, -1)))!
const commTilt = commutator(SZ, S60)

/* l7-spreads */
const r6045 = blochVector(psi6045)
const r60 = blochVector(psi60)
const SUM_STATES = [at(60, 0), at(60, 45), at(90, 45), at(120, 200), at(33, 77)]
const psi90 = ketFromBloch(2 * Math.acos(Math.sqrt(0.9)), 0)
const FORMULA_STATES = [psi60, psi6045, at(120, 200), at(33, 77), KET['+y']]
const formulaGap = worst(
  FORMULA_STATES.flatMap((psi) => {
    const r = blochVector(psi)
    return S_ALL.map((A, j) => Math.abs(variance(A, psi) - (1 - r[j] ** 2) / 4))
  }),
  0,
)
const fromBlochGap = worst(FORMULA_STATES.flatMap((psi) => spreadsFromBloch(blochVector(psi)).map((s, j) => Math.abs(s * s - variance(S_ALL[j], psi)))), 0)

/* l7-uncertainty */
const EIGHT = [KET['+z'], KET['+x'], KET['+y'], at(60, 0), at(60, 45), at(90, 45), at(30, 90), at(45, 30)]
const exactGap = worst(
  EIGHT.map((psi) => prod(psi) ** 2 - bound(psi) ** 2 - (expectation(SX, psi) * expectation(SY, psi)) ** 2),
  0,
)
/** A 3° grid over the sphere (it contains the poles and the equator at 45°, where the extremes sit). */
const GRID = degs(0, 180, 3).flatMap((t) => degs(0, 357, 3).map((p) => at(t, p)))
const gridProd = GRID.map(prod)
const gridGap = GRID.map((psi) => prod(psi) - bound(psi))
const XZ_CIRCLE = degs(0, 180, 15).map((t) => at(t, 0))
const refAOp = (s: 1 | -1) => madd(mscale(SX, 2), mscale(SY, c(0, 2 * s)))
const iComm = mul(c(0, 1), sandwich(commutator(SX, SY), KET['+z']))

export const V = {
  /* l7-two-angles */
  l7EqR60x: blochVector(eq(60))[0], // 0.5
  l7EqR60y: blochVector(eq(60))[1], // 0.8660
  l7EqR60z: blochVector(eq(60))[2], // 0
  l7EqHalfZ: worst([0, 60, 200].map((p) => prob(KET['+z'], eq(p))), 0.5), // 0.5 at every sampled φ
  l7Ov120Re: inner(eq(0), eq(120)).re, // 0.25
  l7Ov120Im: inner(eq(0), eq(120)).im, // 0.4330
  l7Ov120Abs: abs(inner(eq(0), eq(120))), // 0.5
  l7Ov120Arg: arg(inner(eq(0), eq(120))) / DEG, // 60
  l7Ov120P: prob(KET['+x'], eq(120)), // 0.25
  l7Ov90P: prob(KET['+x'], eq(90)), // 0.5
  l7EtaXmX: rayAngle(KET['+x'], KET['-x']) / DEG, // 90
  l7EtaXY: rayAngle(KET['+x'], KET['+y']) / DEG, // 45
  l7SepXY: blochAngle(KET['+x'], KET['+y']) / DEG, // 90
  l7PXY: prob(KET['+x'], KET['+y']), // 0.5
  l7PzT120: prob(KET['+z'], at(120, 0)), // 0.25
  l7PzT120Rule: probUpAlong(tiltXZ(120 * DEG), [0, 0, 1]), // 0.25
  l7EtaZX: rayAngle(KET['+z'], KET['+x']) / DEG, // 45
  l7PZX: prob(KET['+z'], KET['+x']), // 0.5
  l7EtaShort: rayAngle(eq(10), eq(350)) / DEG, // 10
  l7SepShort: blochAngle(eq(10), eq(350)) / DEG, // 20
  l7OvShort: abs(inner(eq(10), eq(350))), // 0.9848
  l7PShort: prob(eq(10), eq(350)), // 0.9698
  l7HalfRule: worst(
    [
      [eq(10), eq(350)],
      [KET['+x'], KET['+y']],
      [KET['+z'], at(120, 0)],
      [at(60, 90), KET['+y']],
      [at(33, 77), at(120, 200)],
    ].map(([a, b]) => rayAngle(a, b) - blochAngle(a, b) / 2),
    0,
  ), // 0: η = Δφ/2 for every sampled pair
  l7Orth30: prob(eq(30), eq(210)), // 0
  l7EtaOff: rayAngle(KET['+y'], at(60, 90)) / DEG, // 15
  l7POff: prob(KET['+y'], at(60, 90)), // 0.9330
  l7TryP10: prob(KET['+x'], eq(-10)), // 0.9924
  l7TryPx60: prob(KET['+x'], at(60, 0)), // 0.9330
  /* l7-full-turn */
  l7RzShift: yes(vecEq(apply(Rz(100 * DEG), eq(30)), vscale(eq(130), expi(-50 * DEG)))), // 1
  l7Rz90Same: yes(samePhysicalState(apply(Rz(90 * DEG), KET['+x']), KET['+y'])), // 1
  l7Rz90Re: inner(KET['+y'], apply(Rz(90 * DEG), KET['+x'])).re, // 0.7071
  l7Rz90Im: inner(KET['+y'], apply(Rz(90 * DEG), KET['+x'])).im, // −0.7071
  l7Rz90ImSize: Math.abs(inner(KET['+y'], apply(Rz(90 * DEG), KET['+x'])).im), // 0.7071
  l7Rz2piNeg: yes(matEq(Rz(2 * Math.PI), mscale(identity(2), -1))), // 1
  l7Rz2piX: sandwich(Rz(2 * Math.PI), KET['+x']).re, // −1
  l7Rz2piRx: blochVector(rz2x)[0], // 1
  l7Rz2piP: prob(KET['+x'], rz2x), // 1
  l7Rz4piId: yes(matEq(Rz(4 * Math.PI), identity(2))), // 1
  l7Rz4piX: sandwich(Rz(4 * Math.PI), KET['+x']).re, // 1
  l7Rz2piSame: yes(samePhysicalState(KET['+x'], rz2x)), // 1
  l7Rz4piBack: yes(vecEq(rz4x, KET['+x'])), // 1
  l7ExpRz: yes(maxDiff(expm2(mscale(SZ, c(0, -1.234))), Rz(1.234)) < 1e-12), // 1
  l7GenSz: yes(maxDiff(generatorOf(Rz), SZ) < 1e-8), // 1
  l7PoleFixed: yes(samePhysicalState(apply(Rz(1.234), KET['+z']), KET['+z'])), // 1
  l7RefB0x: refB0[0], // 0.75
  l7RefB0y: refB0[1], // 0.4330
  l7RefB0z: refB0[2], // 0.5
  l7RefB1x: refB1[0], // −0.4330
  l7RefB1xSize: Math.abs(refB1[0]), // 0.4330
  l7RefB1y: refB1[1], // 0.75
  l7RefB1z: refB1[2], // 0.5
  l7RefBSo3: gap3(qrotate(axisAngle([0, 0, 1], 90 * DEG), refB0), refB1), // 0
  l7Rz180Same: yes(samePhysicalState(apply(Rz(Math.PI), KET['+x']), KET['-x'])), // 1
  l7Rz180Re: inner(KET['-x'], apply(Rz(Math.PI), KET['+x'])).re, // 0
  l7Rz180Im: inner(KET['-x'], apply(Rz(Math.PI), KET['+x'])).im, // −1
  l7Eq360a: eq(360)[0].re, // 0.7071
  l7Eq360Same: yes(vecEq(eq(360), eq(0))), // 1: the formula repeats every 360°
  l7Rz2piA: rz2x[0].re, // −0.7071
  l7Rz2piASize: Math.abs(rz2x[0].re), // 0.7071
  l7ExpMinusPi: expi(-Math.PI).re, // −1
  l7OvFull: abs(inner(KET['+x'], rz2x)), // 1: cos η = 1, so η = 0
  l7FullSign: rel(KET['+x'], rz2x).re, // −1
  l7FullSign4: rel(KET['+x'], rz4x).re, // 1
  l7Rz2piZ: sandwich(Rz(2 * Math.PI), KET['+z']).re, // −1
  l7Cos90: sandwich(Rz(90 * DEG), KET['+x']).re, // 0.7071
  l7Cos180: sandwich(Rz(180 * DEG), KET['+x']).re, // 0
  l7FirstHome: firstHome, // 720
  /* l7-order */
  l7PxFromZ: expectation(Px, KET['+z']), // 0.5
  l7BranchLen: norm(branch), // 0.7071
  l7BranchIsX: yes(up.post !== null && samePhysicalState(up.post, KET['+x']) && vecEq(normalize(branch), up.post)), // 1
  l7MeasureHalf: worst(measure(SX, KET['+z'], 0.3).probs, 0.5), // 0.5
  l7ZxPlus: benchTheory({ source: '+z', axes: ['z', 'x'], keep: ['+'] }).plus, // 0.5
  l7ZxMinus: benchTheory({ source: '+z', axes: ['z', 'x'], keep: ['+'] }).minus, // 0.5
  l7ZxBlocked: benchTheory({ source: '+z', axes: ['z', 'x'], keep: ['+'] }).blocked[0], // 0
  l7XzBlocked: benchTheory({ source: '+z', axes: ['x', 'z'], keep: ['+'] }).blocked[0], // 0.5
  l7XzPlusMinus: benchTheory({ source: '+z', axes: ['x', 'z'], keep: ['+'] }).minus, // 0.25
  l7XzMinusMinus: benchTheory({ source: '+z', axes: ['x', 'z'], keep: ['-'] }).minus, // 0.25
  l7XzPMinusZ: benchTheory({ source: '+z', axes: ['x', 'z'], keep: ['+'] }).minus + benchTheory({ source: '+z', axes: ['x', 'z'], keep: ['-'] }).minus, // 0.5
  l7SeqMinusZ: seqXZ['+-'] + seqXZ['--'], // 0.5, with no beam stop at all
  l7ZzFirstMinus: benchTheory({ source: '+z', axes: ['z', 'z'], keep: ['+'] }).minus, // 0: z first, no −z ever
  l7XzzPlus: benchTheory({ source: '+z', axes: ['x', 'z', 'z'], keep: ['+', '+'] }).plus, // 0.25
  l7XzzMinus: benchTheory({ source: '+z', axes: ['x', 'z', 'z'], keep: ['+', '+'] }).minus, // 0
  l7PzZ: prob(KET['+z'], KET['+z']), // 1
  l7XzzRepeatPlus: benchTheory({ source: '+x', axes: ['z', 'z'], keep: ['+'] }).plus, // 0.5
  l7ZzMinus: benchTheory({ source: '+x', axes: ['z', 'z'], keep: ['+'] }).minus, // 0
  l7PzX: prob(KET['+z'], KET['+x']), // 0.5
  l7TiltKeepPlus: benchTheory({ source: '+z', axes: [60, 'z'], keep: ['+'] }).minus, // 0.1875
  l7TiltKeepMinus: benchTheory({ source: '+z', axes: [60, 'z'], keep: ['-'] }).minus, // 0.1875
  l7TiltMinusZ: benchTheory({ source: '+z', axes: [60, 'z'], keep: ['+'] }).minus + benchTheory({ source: '+z', axes: [60, 'z'], keep: ['-'] }).minus, // 0.375
  l7TiltPass: probUpAlong(tiltXZ(60 * DEG), [0, 0, 1]), // 0.75
  /* l7-compatible */
  l7BEig1: eigenHermitian2(fromSpectrum([3, -1], [KET['+z'], KET['-z']])).values[0], // 3
  l7BEig2: eigenHermitian2(fromSpectrum([3, -1], [KET['+z'], KET['-z']])).values[1], // −1
  l7BIsI4Sz: yes(matEq(fromSpectrum([3, -1], [KET['+z'], KET['-z']]), B)), // 1
  l7BVecs: yes(samePhysicalState(eigenHermitian2(B).vectors[0], KET['+z']) && samePhysicalState(eigenHermitian2(B).vectors[1], KET['-z'])), // 1
  l7CommSzB: maxDiff(commutator(SZ, B), zero2), // 0
  l7JointZX: jointProb([Pz, Px], KET['+z']), // 0.5
  l7JointXZ: jointProb([Px, Pz], KET['+z']), // 0.25
  l7JointBench: yes(
    Math.abs(jointProb([Pz, Px], KET['+z']) - benchTheory({ source: '+z', axes: ['z', 'x'], keep: ['+'] }).plus) < 1e-12 &&
      Math.abs(jointProb([Px, Pz], KET['+z']) - benchTheory({ source: '+z', axes: ['x', 'z'], keep: ['+'] }).plus) < 1e-12,
  ), // 1
  l7ProjCommute: yes(matEq(matmul(Px, Pz), matmul(Pz, Px))), // 0
  l7JointDiff: jointProb([Pz, Px], KET['+z']) - jointProb([Px, Pz], KET['+z']), // 0.25
  l7SxSyIm: matmul(SX, SY)[0][0].im, // 0.25
  l7SySxIm: matmul(SY, SX)[0][0].im, // −0.25
  l7SySxImSize: Math.abs(matmul(SY, SX)[0][0].im), // 0.25
  l7CommXY: yes(matEq(commutator(SX, SY), mscale(SZ, c(0, 1)))), // 1
  l7CommCyclic: yes(matEq(commutator(SY, SZ), mscale(SX, c(0, 1))) && matEq(commutator(SZ, SX), mscale(SY, c(0, 1)))), // 1
  l7CommRev: yes(matEq(commutator(SY, SX), mscale(SZ, c(0, -1)))), // 1
  l7CommArrowZ: commArrow.a[2], // 0.5: −i[Sx, Sy] has the arrow of Sz
  l7CommArrowCross: yes(gap3(commArrow.a, (([a, b]) => cross(a, b).map((x) => 2 * x) as Vec3)([[0.5, 0, 0], [0, 0.5, 0]] as [Vec3, Vec3])) < 1e-12), // 1: 2 a×b
  l7XYendY: xThenY[1], // −1
  l7YXendX: yThenX[0], // 1
  l7SmallTurns: yes(smallGap < 1e-6), // 1
  l7IdEig: worst(eigenHermitian2(identity(2)).values, 1), // 1: both eigenvalues are 1
  l7CommIdX: maxDiff(commutator(identity(2), SX), zero2), // 0
  l7JointYZX: jointProb([Pz, Px], KET['+y']), // 0.25
  l7JointYXZ: jointProb([Px, Pz], KET['+y']), // 0.25
  l7FinalZX: yes(samePhysicalState(normalize(apply(Px, apply(Pz, KET['+y']))), KET['+x'])), // 1
  l7FinalXZ: yes(samePhysicalState(normalize(apply(Pz, apply(Px, KET['+y']))), KET['+z'])), // 1
  l7CommOpp: maxDiff(commutator(SZ, mscale(SZ, -1)), zero2), // 0
  l7CrossRule: yes(matEq(commutator(spinAlong(nA), spinAlong(mA)), mscale(spinAlong(cross(nA, mA)), c(0, 1)))), // 1: [S_n, S_m] = i (n × m)·S
  l7Cross60: Math.hypot(...cross([0, 0, 1], tiltXZ(60 * DEG))), // 0.8660
  l7CommXZNonzero: maxDiff(commutator(SX, SZ), zero2), // 0.5
  l7CoTilt: 2 * commTilt[0][1].re, // 0.8660
  l7CoTiltOk: yes(matEq(commTilt, mscale(SY, c(0, Math.sin(60 * DEG))))), // 1
  /* l7-spreads */
  l7Tilt60P: probUpAlong(tiltXZ(60 * DEG), [0, 0, 1]), // 0.75
  l7Tilt60Avg: expectation(S60, KET['+z']), // 0.25 (ħ)
  l7Tilt60Sd: sd(S60, KET['+z']), // 0.4330 (ħ)
  l7Tilt60Var: variance(S60, KET['+z']), // 0.1875 (ħ²)
  l7SqQuarter: yes(S_ALL.every((A) => matEq(matmul(A, A), mscale(identity(2), 0.25)))), // 1
  l7SpreadFormula: formulaGap, // 0
  l7SpreadFromBloch: fromBlochGap, // 0
  l7R60x: r60[0], // 0.8660
  l7R60z: r60[2], // 0.5
  l7Sd60x: sd(SX, psi60), // 0.25
  l7Sd60y: sd(SY, psi60), // 0.5
  l7Sd60z: sd(SZ, psi60), // 0.4330
  l7VarZz: variance(SZ, KET['+z']), // 0: ΔS_z = 0 (stored squared: a square root near 0 amplifies float residue)
  l7SdZx: sd(SX, KET['+z']), // 0.5
  l7SdZy: sd(SY, KET['+z']), // 0.5
  l7SemX100: sd(SX, KET['+z']) / Math.sqrt(100), // 0.05 (ħ)
  l7SemX10000: sd(SX, KET['+z']) / Math.sqrt(10000), // 0.005 (ħ)
  l7AvgZ60: expectation(SZ, psi60), // 0.25 (ħ)
  l7PplusRule: 0.5 + expectation(SZ, psi60), // 0.75
  l7PminusRule: 0.5 - expectation(SZ, psi60), // 0.25
  l7PplusBorn: yes(Math.abs(0.5 + expectation(SZ, psi60) - prob(KET['+z'], psi60)) < 1e-12), // 1
  l7TPz: prob(KET['+z'], psiT), // 0.25
  l7TPminus: prob(KET['-z'], psiT), // 0.75
  l7TAvg: expectation(SZ, psiT), // −0.25 (ħ)
  l7TAvgSize: Math.abs(expectation(SZ, psiT)), // 0.25
  l7TSd: sd(SZ, psiT), // 0.4330 (ħ)
  l7TIsSphere: yes(vecEq(psiT, at(120, 90))), // 1
  l7OwnAxisVar: worst(SUM_STATES.map((psi) => variance(spinAlong(blochVector(psi)), psi)), 0), // 0 for every sampled state
  l7OwnAxisP: worst(SUM_STATES.map((psi) => probUpAlong(blochVector(psi), blochVector(psi))), 1), // 1
  l7Sd6045x: sd(SX, psi6045), // 0.3953 (ħ)
  l7Dist6045x: Math.hypot(r6045[1], r6045[2]), // 0.7906
  l7DistRule: yes(Math.abs(sd(SX, psi6045) - 0.5 * Math.hypot(r6045[1], r6045[2])) < 1e-12), // 1
  l7SumSq: worst(SUM_STATES.map(sumVar), 0.5), // 0.5 (ħ²) for every sampled state
  l7Sd90: sd(SZ, psi90), // 0.3 (ħ)
  l7Avg90: expectation(SZ, psi90), // 0.4 (ħ)
  l7Var90: variance(SZ, psi90), // 0.09 (ħ²)
  l7P90: prob(KET['+z'], psi90), // 0.9
  /* l7-uncertainty */
  l7Prod6045: prod(psi6045), // 0.15625 (ħ²)
  l7IdLeft: (1 - r6045[0] ** 2) * (1 - r6045[1] ** 2), // 0.390625
  l7IdRight: r6045[2] ** 2 + r6045[0] ** 2 * r6045[1] ** 2, // 0.390625
  l7Bound6045: bound(psi6045), // 0.125 (ħ²)
  l7BoundComm: 0.5 * abs(sandwich(commutator(SX, SY), psi6045)), // 0.125: the same bound from the commutator
  l7Holds6045: yes(uncertaintyCheck(SX, SY, psi6045).slack >= 0), // 1
  l7Rx2: r6045[0] ** 2, // 0.375
  l7OneMinusRx2: 1 - r6045[0] ** 2, // 0.625
  l7SatP0: prod(at(0, 0)), // 0.25
  l7SatP60: prod(at(60, 0)), // 0.125
  l7SatB60: bound(at(60, 0)), // 0.125
  l7SatP90Sq: variance(SX, at(90, 0)) * variance(SY, at(90, 0)), // 0: (ΔS_xΔS_y)² at θ = 90°
  l7SatSlack: worst(XZ_CIRCLE.map((psi) => variance(SX, psi) * variance(SY, psi) - uncertaintyCheck(SX, SY, psi).bound ** 2), 0), // 0: product² = bound² along the x–z circle
  l7CommXYNonzero: maxDiff(commutator(SX, SY), zero2), // 0.5
  l7CommAvgX: abs(sandwich(commutator(SX, SY), KET['+x'])), // 0
  l7VarXx: variance(SX, KET['+x']), // 0: ΔS_x = 0 in |+x⟩
  l7SdXy: sd(SY, KET['+x']), // 0.5
  l7RobProd: uncertaintyCheck(SX, S45, KET['+y']).product, // 0.25
  l7RobBound: uncertaintyCheck(SX, S45, KET['+y']).bound, // 0.1768
  l7RefAPlus: norm2(apply(refAOp(1), KET['+z'])), // 0
  l7RefAMinus: norm2(apply(refAOp(-1), KET['+z'])), // 4
  l7RefAi: iComm.re, // −0.5
  l7RefAFormulaPlus: 2 + iComm.re / (sd(SX, KET['+z']) * sd(SY, KET['+z'])), // 0
  l7RefAFormulaMinus: 2 - iComm.re / (sd(SX, KET['+z']) * sd(SY, KET['+z'])), // 4
  l7ExactEq: exactGap, // 0: (ΔSxΔSy)² − (½⟨Sz⟩)² = (⟨Sx⟩⟨Sy⟩)² for eight states
  l7MaxProd: Math.max(...gridProd), // 0.25 (ħ²)
  l7MaxGap: Math.max(...gridGap), // 0.125 (ħ²)
  l7Prod9045: prod(at(90, 45)), // 0.125
  l7Bound9045: bound(at(90, 45)), // 0
  l7Anti: maxDiff(anticommutator(SX, SY), zero2), // 0: {Sx, Sy} = 0
  l7BoundSharp: uncertaintyCheck(SX, SY, KET['+z']).product / abs(sandwich(commutator(SX, SY), KET['+z'])), // 0.5: the ½ in the bound, met at |+z⟩
  l7TAlpha: at(120, 90)[0].re, // 0.5: Townsend's amplitude of |+z⟩
} as const

export type ValueKey = keyof typeof V

/** A claim tied to one L7 engine value: its text starts with `key · ` (read by content/claims.test.ts). */
export const claim = keyedClaim<ValueKey>()

export { close, d, pct, tf, uf } from './claimKit'
