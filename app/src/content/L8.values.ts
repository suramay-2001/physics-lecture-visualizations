/**
 * Lecture 8 numbers, computed once with the engine (owner: P). Same contract as L1–L9.values.ts: every number a learner reads in
 * L8 comes from `V` and is backed by a keyed claim; the numpy twin of each key is in physics/__fixtures__/claims.json
 * (pipeline/make_claim_fixtures.py, "Lecture 8" block). Keys start with `l8`.
 *
 * Rosetta (rulings 448-L8L11, L8 R3): the notes' ϑ is χ here and the added turn is φ; H and V are the engine's +z and −z, D and A its +x
 * and −x, C± its ±y (physics/polarization.ts); the bases are H/V and D/A (the notes' Z and X); the message bit is x. A displayed
 * magnitude of a negative number gets its own key (the number reader sees digits, not signs). Yes/no facts are 1 or 0. "At every ..."
 * sweeps store the worst sample (`worst`), so the value equals its target only if every sample does. Angles in degrees are inputs: they
 * are written with ° in the prose and are never read as results.
 *
 * This file imports physics/qc (shared engine) but no stage module: a lecture chunk must not pull in stage/svg.
 */
import { abs, c } from '../physics/complex'
import { pauliVariancesOfRho, rhoFromBloch } from '../physics/density'
import { type Mat, apply, identity, inner, isUnitary, madd, matEq, matmul, maxDiff, mscale } from '../physics/linalg'
import { xor } from '../physics/qc/bits'
import {
  BOARD_P8, BASES, bb84ErrorProb, bb84Q, checkBoard, eveKnown, minTestSize, missProb, testResult, type Basis, type Bit,
} from '../physics/bb84'
import {
  POL, Rpol, analyzerPorts, analyzerProb, blockingAngle, circularPhase, polBloch, polKet, rpolFromGenerator, sphereTurn,
} from '../physics/polarization'
import {
  KET, SIGMA_X, SIGMA_Y, SIGMA_Z, blochVector, eigenHermitian2, ketFromBloch, mutuallyUnbiased, operatorInBasis, prob, probUpAlong, rayAngle, rotation,
  samePhysicalState, tiltXZ, variance,
} from '../physics/spin'
import { keyedClaim } from './claimKit'

const DEG = Math.PI / 180
const yes = (b: boolean) => (b ? 1 : 0)
/** The sample farthest from `target`: equal to the target only if EVERY sample is (a minimum would only prove "at least"). */
const worst = (xs: number[], target: number) => xs.reduce((w, x) => (Math.abs(x - target) > Math.abs(w - target) ? x : w), target)
const PAULI = [SIGMA_X, SIGMA_Y, SIGMA_Z] as const

/* l8-variance-sum: the generic state θ = 60°, φ = 45° */
const STAR = ketFromBloch(60 * DEG, 45 * DEG)
const rStar = blochVector(STAR)
const varStar = PAULI.map((S) => variance(S, STAR))
const totals: number[] = []
for (let i = 0; i <= 12; i++)
  for (let j = 0; j < 12; j++) {
    const psi = ketFromBloch(i * 15 * DEG, j * 30 * DEG)
    totals.push(variance(SIGMA_X, psi) + variance(SIGMA_Y, psi) + variance(SIGMA_Z, psi))
  }
const plusZ = KET['+z']
const MAGIC = Math.acos(1 / Math.sqrt(3))
const magic = ketFromBloch(MAGIC, 45 * DEG)
const rMagic = blochVector(magic)
const varMagic = PAULI.map((S) => variance(S, magic))
const mixR = [0, 0, 0.6] as [number, number, number]
const mixVars = pauliVariancesOfRho(rhoFromBloch(mixR))
const centreVars = pauliVariancesOfRho(rhoFromBloch([0, 0, 0]))

/* l8-polarization / l8-turning */
const DEG30 = 30 * DEG
const rpol30 = Rpol(DEG30)
const cols30 = [apply(rpol30, POL.H), apply(rpol30, POL.V)]
const chiPairs: [number, number][] = [[10, 70], [0, 45], [60, 15], [33, 120], [-20, 80], [90, 5]]
const overlapGaps = chiPairs.map(([a, b]) => Math.abs(inner(polKet(b * DEG), polKet(a * DEG)).re - Math.cos((a - b) * DEG)))

/* l8-photon-spin */
const h = 1e-6
const dR = mscale(madd(Rpol(h), mscale(identity(2), -1)), 1 / h) // (R(h) − I)/h
const iDR = mscale(dR, c(0, 1))
const rpolForms = [-2, -0.7, 0.3, 1, 2.5].map((phi) => maxDiff(Rpol(phi), rpolFromGenerator(phi)))
const eigSy = eigenHermitian2(SIGMA_Y)
const circBasis = [POL.Cp, POL.Cm]
const jz = operatorInBasis(SIGMA_Y, circBasis)
const rP30 = polBloch(30 * DEG)
const minusI: Mat = [[c(-1), c(0)], [c(0), c(-1)]]
const R180 = Rpol(Math.PI)
const R360 = Rpol(2 * Math.PI)
const Ry360 = rotation([0, 1, 0], 2 * Math.PI)
const Ry720 = rotation([0, 1, 0], 4 * Math.PI)
const p30 = polKet(30 * DEG)

/* l8-key */
const OTP_X = 0b1011
const OTP_K = 0b0110
const OTP_C = xor(OTP_X, OTP_K)

/* l8-bb84: matching bases and the board */
const baseChance = (pred: (a: Basis, b: Basis) => boolean): number => BASES.flatMap((a) => BASES.map((b) => (pred(a, b) ? 0.25 : 0) as number)).reduce((x: number, y: number) => x + y, 0)
const mismatchErr: number[] = []
const matchErr: number[] = []
for (const aBasis of BASES)
  for (const aBit of [0, 1] as const)
    for (const bBasis of BASES) (aBasis === bBasis ? matchErr : mismatchErr).push(bb84ErrorProb({ alice: { basis: aBasis, bit: aBit }, bob: { basis: bBasis } }))
const board = checkBoard(BOARD_P8)
const boardTest = testResult(
  BOARD_P8.map((r, i) => ({
    n: i + 1, aBit: r.aBit, aBasis: r.aBasis, bBasis: r.bBasis, bBit: r.bBit, eIntercept: false, eBasis: r.aBasis, eBit: null, kept: r.aBasis === r.bBasis,
    error: r.aBasis === r.bBasis && r.aBit !== r.bBit, eveKnows: false,
  })),
  { rounds: [1, 5] },
)

/* l8-attack */
const aliceH = { basis: 'HV' as Basis, bit: 0 as Bit }
const aliceD = { basis: 'DA' as Basis, bit: 0 as Bit }
const daErr = BASES.map((e) => bb84ErrorProb({ alice: aliceD, bob: { basis: 'DA' }, eve: { basis: e } }))
const Q = bb84Q(1)

/* l8-test */
const MISS20 = missProb(Q, 20)
const MISS100 = missProb(Q, 100)

export const V = {
  /* l8-variance-sum */
  l8rStarX: rStar[0], // 0.6124
  l8rStarY: rStar[1], // 0.6124
  l8rStarZ: rStar[2], // 0.5
  l8rSq: rStar[0] ** 2 + rStar[1] ** 2 + rStar[2] ** 2, // 1: a pure state
  l8VarStarX: varStar[0], // 0.625
  l8VarStarY: varStar[1], // 0.625
  l8VarStarZ: varStar[2], // 0.75
  l8SigmaSqI: yes(PAULI.every((S) => matEq(matmul(S, S), identity(2)))), // 1: σ_i² = I
  l8VarSumWorst: worst(totals, 2), // 2 over a 13 × 12 grid of states
  l8VarsPlusZ: yes(PAULI.map((S) => Math.round(variance(S, plusZ))).join('') === '110'), // (1, 1, 0)
  l8VarXPlusZ: variance(SIGMA_X, plusZ), // 1
  l8RiSqEqual: rMagic[0] ** 2, // ⅓ at the magic angle
  l8VarsEqual: worst(varMagic, 2 / 3), // ⅔, all three
  l8MagicTheta: MAGIC / DEG, // 54.7356°
  l8MixR: Math.hypot(...mixR), // 0.6
  l8MixSum06: mixVars[0] + mixVars[1] + mixVars[2], // 2.64
  l8MixSum0: centreVars[0] + centreVars[1] + centreVars[2], // 3
  /* l8-polarization */
  l8HV: abs(inner(POL.H, POL.V)), // 0
  l8PH30: analyzerProb(30 * DEG, 0), // 0.75
  l8PV30: analyzerPorts(30 * DEG, 0)[1], // 0.25
  l8DH: abs(inner(POL.D, POL.H)), // 0.7071
  l8AH: abs(inner(POL.A, POL.H)), // 0.7071
  l8PDH: prob(POL.D, POL.H), // 0.5
  l8DA: abs(inner(POL.D, POL.A)), // 0
  l8MubPol: yes(mutuallyUnbiased([POL.H, POL.V], [POL.D, POL.A])), // 1
  l8Pal60: analyzerProb(60 * DEG, 0), // 0.25
  l8PDD: prob(POL.D, POL.D), // 1
  l8PHD: prob(POL.H, POL.D), // 0.5
  /* l8-turning */
  l8RHv30: rpol30[1][0].re, // +0.5: ⟨V|R(30°)|H⟩
  l8RpolCols: yes(cols30[0].every((z, i) => Math.abs(z.re - [Math.cos(DEG30), Math.sin(DEG30)][i]) < 1e-12) && cols30[1].every((z, i) => Math.abs(z.re - [-Math.sin(DEG30), Math.cos(DEG30)][i]) < 1e-12)), // 1
  l8RpolUnitary: yes(isUnitary(rpol30)), // 1
  l8OverlapCos: worst(overlapGaps, 0), // 0: cos(χ_a)cos χ + sin(χ_a)sin χ = cos(χ − χ_a)
  l8Pal15: analyzerProb(60 * DEG, 45 * DEG), // 0.9330
  l8PalOther15: analyzerPorts(60 * DEG, 45 * DEG)[1], // 0.0670
  l8Pal90: analyzerProb(90 * DEG, 0), // 0
  l8Pal45: analyzerProb(45 * DEG, 0), // 0.5
  l8Spin180: probUpAlong(tiltXZ(Math.PI), tiltXZ(0)), // 0: a magnet turned 180° empties the + spot
  l8BlockAngle: blockingAngle(60 * DEG) / DEG, // 150: the analyzer angle that blocks a χ = 60° beam, in 90°…180°
  /* l8-photon-spin */
  l8GenSy: yes(maxDiff(iDR, SIGMA_Y) < 1e-5), // 1: i dR/dφ at 0 is σ_y
  l8EigSyHalf: eigenHermitian2(mscale(SIGMA_Y, 0.5)).values[0], // ½: the electron's turn generator S_y has eigenvalues ±½
  l8RpolForm: yes(Math.max(...rpolForms) < 1e-12), // 1: R = cos φ I − i sin φ σ_y
  l8EigSy: yes(eigSy.values[0] === 1 && eigSy.values[1] === -1), // 1: eigenvalues +1, −1
  l8CpEigen: yes(samePhysicalState(eigSy.vectors[0], POL.Cp) && samePhysicalState(eigSy.vectors[1], POL.Cm)), // 1
  l8PhaseCp40: circularPhase(1, 40 * DEG) / DEG, // −40
  l8PhaseCm40: circularPhase(-1, 40 * DEG) / DEG, // +40
  l8rP30X: rP30[0], // 0.8660
  l8rP30Z: rP30[2], // 0.5
  l8Turn45: sphereTurn('photon', 45 * DEG) / DEG, // 90
  l8Turn90: sphereTurn('photon', 90 * DEG) / DEG, // 180
  l8ETurn45: sphereTurn('electron', 45 * DEG) / DEG, // 45
  l8ETurn180: sphereTurn('electron', 180 * DEG) / DEG, // 180
  l8RayHV: rayAngle(POL.H, POL.V) / DEG, // 90
  l8JzCirc: yes(matEq(jz, SIGMA_Z)), // 1: B† σ_y B = σ_z in the (C₊, C₋) basis
  l8R180: yes(matEq(R180, minusI)), // 1
  l8R360: yes(matEq(R360, identity(2))), // 1
  l8Ry360: yes(matEq(Ry360, minusI)), // 1
  l8Ry720: yes(matEq(Ry720, identity(2))), // 1
  l8Ray180: yes(samePhysicalState(apply(R180, p30), p30)), // 1
  /* l8-key */
  l8Otp: yes(OTP_C === 0b1101 && xor(OTP_C, OTP_K) === OTP_X), // 1: 1011 ⊕ 0110 = 1101, and 1101 ⊕ 0110 = 1011
  l8PHH: prob(POL.H, POL.H), // 1
  l8OtpOne: xor(0, 1), // x = 0, k = 1 → c = 1
  /* l8-bb84 */
  l8PMatch: baseChance((a, b) => a === b), // ½
  l8ErrNoEve: Math.max(...matchErr), // 0
  l8MismatchRandom: mismatchErr.reduce((s, x) => s + x, 0) / mismatchErr.length, // ½
  l8BoardKept: yes(board.kept.join() === '1,4,5,6'), // 1
  l8BoardSift: yes(board.alice === '0010' && board.bob === '0010'), // 1
  l8BoardLuck: yes(board.luck.join() === '2,8'), // 1
  l8BoardOk: yes(board.ok), // 1
  l8BoardTest: boardTest.nErr / boardTest.m, // 0: 0 errors in 2 tested bits
  l8BoardLeft: yes(boardTest.remaining.map((n) => String(BOARD_P8[n - 1].aBit)).join('') === '00'), // 1: rounds 4 and 6 hold 00
  /* l8-attack */
  l8ErrEveWrong: bb84ErrorProb({ alice: aliceH, bob: { basis: 'HV' }, eve: { basis: 'DA' } }), // ½
  l8ErrEveRight: bb84ErrorProb({ alice: aliceH, bob: { basis: 'HV' }, eve: { basis: 'HV' } }), // 0
  l8Q: Q, // ¼
  l8QfromDA: daErr.reduce((s, x) => s + x, 0) / daErr.length, // ¼ from a D/A round too
  l8PerPhoton: baseChance((a, b) => a === b) * Q, // ⅛ per photon sent
  l8EveKnows: eveKnown(1), // ½
  l8Exit: bb84ErrorProb({ alice: aliceD, bob: { basis: 'DA' }, eve: { basis: 'HV' } }), // ½
  l8ExitDA: bb84ErrorProb({ alice: aliceD, bob: { basis: 'DA' }, eve: { basis: 'DA' } }), // 0
  l8Qf05: bb84Q(0.5), // ⅛
  l8KnowF05: eveKnown(0.5), // ¼
  /* l8-test */
  l8Agree: 1 - Q, // ¾: a tested bit agrees
  l8Miss20: MISS20, // 0.0032
  l8Miss100: MISS100, // 3.17e-13
  l8Miss100Mant: MISS100 / 1e-13, // 3.17: the mantissa of (¾)^100 = 3.17 × 10⁻¹³
  l8Risk: 0.01, // the miss chance Alice and Bob accept: 1 %
  l8Confidence: 1 - 0.01, // 99 % detection
  l8Miss16: missProb(Q, 16), // 0.010023
  l8Miss17: missProb(Q, 17), // 0.0075
  l8M99: minTestSize(Q, 0.01), // 17
} as const

export type ValueKey = keyof typeof V

/** A claim tied to one L8 engine value: its text starts with `key · ` (read by content/claims.test.ts). */
export const claim = keyedClaim<ValueKey>()

export { close, d, pct, tf, uf } from './claimKit'
