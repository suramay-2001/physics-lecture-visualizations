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
import { KET, nDotSigma, prob, probUpAlong, samePhysicalState, tiltXZ, variance, type Vec3 } from '../physics/spin'
import { vscale } from '../physics/linalg'
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
} as const

export type ValueKey = keyof typeof V

/** A claim tied to one L1 engine value: its text starts with `key · ` (read by content/claims.test.ts). */
export const claim = keyedClaim<ValueKey>()

// shared helpers moved to claimKit.ts (every lecture uses them); re-exported for L1's modules
export { claimKey, close, d, pct, tf, uf } from './claimKit'
