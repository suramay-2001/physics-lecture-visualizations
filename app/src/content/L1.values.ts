/**
 * Lecture 1 numbers, computed once with the engine (owner: P).
 *
 * Every number a learner reads in L1 (story, review, challenges) comes from `V` below and is backed by a
 * keyed `Claim` (`claim(key, …)`). `pipeline/make_claim_fixtures.py` recomputes each key with numpy by an
 * independent route (eigh, projectors, bisection) into `physics/__fixtures__/claims.json`;
 * `content/claims.test.ts` checks engine ↔ numpy per key and every displayed number against the claims
 * in scope. Split out of L1.ts so L1.story.ts / L1.review.ts can import it without an import cycle.
 */
import { averageDeflection, benchTheory } from '../physics/sg'
import { abs } from '../physics/complex'
import { M_SILVER, bohrMagneton, sgGradientForSeparation } from '../physics/constants'
import { binomialStd, zScore } from '../physics/random'
import { KET, expectation, ketFromBloch, nDotSigma, prob, probUpAlong, samePhysicalState, spread, SZ, tiltXZ, variance, type Vec3 } from '../physics/spin'
import { inner, normalize, vec, vscale } from '../physics/linalg'
import { keyedClaim } from './claimKit'

const DEG = Math.PI / 180
const Z: Vec3 = [0, 0, 1]

const ovenZ = benchTheory({ source: 'oven', axes: ['z'], keep: [] })
const repeatZ = benchTheory({ source: 'oven', axes: ['z', 'z'], keep: ['+'] })
const zx = benchTheory({ source: 'oven', axes: ['z', 'x'], keep: ['+'] })
const zxx = benchTheory({ source: 'oven', axes: ['z', 'x', 'x'], keep: ['+', '+'] })
const zxz = benchTheory({ source: 'oven', axes: ['z', 'x', 'z'], keep: ['+', '+'] })
const zMinusX = benchTheory({ source: 'oven', axes: ['z', 'x', 'z'], keep: ['+', '-'] })
// the fair control for l1-sequential:b6 (round 3 #18): same three magnets, same path, middle one along z
const zzz = benchTheory({ source: 'oven', axes: ['z', 'z', 'z'], keep: ['+', '+'] })
// "up OR right" is false only for (not up, not right). z-first: z must read − then x must read −.
const zFirstFalse = benchTheory({ source: '+z', axes: ['z', 'x'], keep: ['-'] })
// x-first: x reads − (left), then z reads − (down).
const xFirstFalse = benchTheory({ source: '+z', axes: ['x', 'z'], keep: ['-'] })
// Townsend pass (Exps. 3-4, the recombining device): the plate fractions with the path recorded and with a merge
const exp3 = benchTheory({ source: '+z', axes: ['x', 'z'], keep: ['+'] })
const exp4 = benchTheory({ source: '+z', axes: ['x', 'z'], keep: ['+'], merge: [true, false] })
const psi25 = ketFromBloch(50 * DEG, 0) // cos 25 deg |+z> + sin 25 deg |-z>
const tilt110 = benchTheory({ source: 'oven', axes: [110, 'z'], keep: ['+'] })
const chain40 = benchTheory({ source: 'oven', axes: ['z', 40, 'z'], keep: ['+', '+'] })
const psi23 = normalize(vec(2, 3))
const band = (n: number) => Math.sqrt(variance(nDotSigma(tiltXZ(45 * DEG)), KET['+z']) / n)

export const V = {
  /* l1-quantized */
  ovenZPlus: ovenZ.plus, // 0.5
  ovenZMinus: ovenZ.minus, // 0.5
  repeatZPlate: repeatZ.plus / (repeatZ.plus + repeatZ.minus), // 1 (of the atoms that reach the plate)
  repeatZMinus: repeatZ.minus, // 0
  zzzPlate: zzz.plus / (zzz.plus + zzz.minus), // 1 — z(+) → z(+) → z: the middle z measurement keeps |+z⟩
  /* l1-sequential */
  pXgivenZ: prob(KET['+x'], KET['+z']), // P(+x | +z) = 0.5
  pZgivenX: prob(KET['+z'], KET['+x']), // P(+z | +x) = 0.5
  zxPlus: zx.plus, // 0.25 of the oven
  zxAlive1: 1 - zx.blocked[0], // 0.5
  zxxAlive2: 1 - zxx.blocked[0] - zxx.blocked[1], // 0.25
  zxxPlate: zxx.plus / (zxx.plus + zxx.minus), // 1
  zxzAlive1: 1 - zxz.blocked[0], // 0.5
  zxzAlive2: 1 - zxz.blocked[0] - zxz.blocked[1], // 0.25
  zxzPlus: zxz.plus, // 0.125
  zxzMinus: zxz.minus, // 0.125
  zxzPlate: zxz.plus / (zxz.plus + zxz.minus), // 0.5 of the atoms that reach the plate
  zMinusXBlocked2: zMinusX.blocked[1], // 0.25
  /* l1-average */
  p45: probUpAlong(tiltXZ(45 * DEG), Z), // 0.8536
  avg45: averageDeflection(45, 'z'), // 0.7071
  p60: probUpAlong(tiltXZ(60 * DEG), Z), // 0.75
  cos60: averageDeflection(60, 'z'), // 0.5
  p90: probUpAlong(tiltXZ(90 * DEG), Z), // 0.5
  avg90: averageDeflection(90, 'z'), // 0
  theta34: (2 * Math.acos(Math.sqrt(0.75))) / DEG, // 60 (degrees)
  band10: band(10), // 0.2236
  band100: band(100), // 0.0707
  band1000: band(1000), // 0.0224
  // Light through a polarizer at χ behaves like a spin state at Bloch angle 2χ (P2 §6.3).
  photon45: probUpAlong(tiltXZ(2 * 45 * DEG), Z), // 0.5
  /* l1-logic */
  pLeftGivenUp: prob(KET['-x'], KET['+z']), // P(−x | +z) = 0.5
  pDownGivenLeft: prob(KET['-z'], KET['-x']), // P(−z | −x) = 0.5
  falseZFirst: zFirstFalse.minus, // 0
  falseXFirst: xFirstFalse.minus, // 0.25
  trueXFirst: 1 - xFirstFalse.minus, // 0.75
  /* l1-vectors */
  pUpRight: prob(KET['+z'], KET['+x']), // 0.5
  ampUpRight: Math.sqrt(prob(KET['+z'], KET['+x'])), // 0.7071 = 1/√2
  pRightRight: prob(KET['+x'], KET['+x']), // 1
  pRightLeft: prob(KET['+x'], KET['-x']), // 0
  negSame: samePhysicalState(KET['+x'], vscale(KET['+x'], -1)) ? 1 : 0, // 1 = true
  betaSq: 1 - 0.6 ** 2, // 0.64 (arithmetic on a given α)
  plusXAlongZ: benchTheory({ source: '+x', axes: ['z'], keep: [] }).plus, // 0.5
  plusXAlongX: benchTheory({ source: '+x', axes: ['x'], keep: [] }).plus, // 1
  ovenAlongX: benchTheory({ source: 'oven', axes: ['x'], keep: [] }).plus, // 0.5
  /* Townsend pass: l1-quantized:b5c, l1-sequential:b5a, l1-average:b4a, l1-vectors:b5a */
  l1TnMuB: bohrMagneton() / 1e-24, // the Bohr magneton in 1e-24 J/T (9.274)
  l1TnExp3Down: exp3.minus, // 1/4 of the beam reads down when the path is recorded
  l1TnExp4Down: exp4.minus, // 0 when the paths are merged
  l1TnExp4Up: exp4.plus, // 1
  l1TnSig100: binomialStd(100, 0.5), // 5
  l1TnZ55: zScore(55, 100, 0.5), // 1
  l1TnSig1e6: binomialStd(1e6, 0.5), // 500
  l1TnZ550k: zScore(550000, 1e6, 0.5), // 100
  l1TnC1: abs(inner(KET['+z'], psi25)), // 0.9063
  l1TnP1: prob(KET['+z'], psi25), // 0.8214
  l1TnP2: prob(KET['-z'], psi25), // 0.1786
  l1TnSum: prob(KET['+z'], psi25) + prob(KET['-z'], psi25), // 1
  /* practice questions */
  l1PTilt: tilt110.plus / (tilt110.plus + tilt110.minus), // 0.3290
  l1PAngle: Math.acos(2 * 0.2 - 1) / DEG, // 126.87 degrees
  l1PSpread: spread(SZ, psi23), // 6/13 hbar
  l1PMean: expectation(SZ, psi23), // -5/26 hbar
  l1PChain: chain40.minus / (1 - chain40.blocked[0]), // sin^2(40)/4
  l1PGradient: sgGradientForSeparation({ lengthM: 0.2, driftM: 0.4, tempK: 1000, separationM: 0.5e-3, massKg: M_SILVER }), // T/m
} as const

export type ValueKey = keyof typeof V

/** A claim tied to one L1 engine value: its text starts with `key · ` (read by content/claims.test.ts). */
export const claim = keyedClaim<ValueKey>()

// shared helpers moved to claimKit.ts (every lecture uses them); re-exported for L1's modules
export { claimKey, close, d, pct, tf, uf } from './claimKit'
