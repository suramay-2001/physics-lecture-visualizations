/**
 * Chapter F8 numbers (Physics 709, "Hidden rhythms"), computed once with the engine.
 * Plan: docs/roles/proposals/P-F8-story.md; rulings docs/roles/decisions/qc709-F7F8.md, qc709-foundations.md.
 *
 * Every number a learner reads in F8 comes from `V` and is backed by a keyed claim (content.test.tsx "claims hold"); the numpy twin of each key is
 * in physics/__fixtures__/claims-qc709/f8.json (pipeline/claims_qc709/f8.py, an independent route: Python's own `%`, `pow` and `math.gcd`, numpy
 * `ifft(norm='ortho')` for the Fourier matrix, numpy exponentials for the roots and the kernel, exact Fractions for the continued fractions). Keys
 * start with `f8` and are unique across both courses. A LIST a claim talks about (the powers of 2 mod 21, the places of a comb) is kept in the
 * exported arrays below and checked whole by its claim; its key in `V` is a checksum of it (documented at the key) so the numpy twin can recompute it.
 *
 * Running examples (plan "Conventions"): N = 21, x = 2 (order 6; 21 = 3 × 7); the 32-input comb `COMB32` (the places x < 32 where 2^x ≡ 1 mod 21);
 * the N = 8 combs `ket('++0')` (step 2), `ket('+00')` (step 4), `ket('++1')` (the step-2 comb shifted by one place), `'000+011+110'` (step 3).
 */
import { abs, abs2, add, arg, c, cpow, expi, mul, sub } from '../../physics/complex'
import { identity, matmul, dagger, maxDiff } from '../../physics/linalg'
import { phasorSum, rootsOfUnity } from '../../physics/qc/complexExtra'
import {
  binaryFraction,
  chord,
  continuedFraction,
  convergents,
  dft,
  dftMatrix,
  dirichlet,
  geometricSum,
  geometricSumDirect,
  orderFromPeak,
  peakSuccesses,
} from '../../physics/qc/fourier'
import { egcd, euclidSteps, factorFromOrder, gcd, mod, modInverse, modPow, multOrder, powersMod, unitsCount } from '../../physics/qc/numtheory'
import { ket, superpose } from '../../physics/qc/state'
import { claimKey, close, d, keyedClaim, pct, tf, uf } from '../claimKit'

/** The 32-input comb of the running example: a 1 at every place x below 32 where 2^x ≡ 1 (mod 21), written as the terms `superpose` reads. */
export const COMB32 = '00000+00110+01100+10010+11000+11110'
/** The step-3 comb on eight places, 0, 3 and 6 (3 does not divide 8). */
export const COMB3_8 = '000+011+110'

/* ---------------------------------------------------------------------------------------------- */
/* Lists                                                                                            */
/* ---------------------------------------------------------------------------------------------- */
/** 2⁰ … 2⁶ mod 21: 1, 2, 4, 8, 16, 11, 1. */
export const P2: number[] = powersMod(2, 21, 7)
/** 3⁰ … 3⁷ mod 21: 1, 3, 9, 6, 18, 12, 15, 3 (never 1 again). */
export const P3: number[] = powersMod(3, 21, 8)
/** The places x < 32 where 2^x mod 21 = 1. */
export const PLACES32: number[] = Array.from({ length: 32 }, (_, x) => x).filter((x) => modPow(2, x, 21) === 1)
/** The places the stage's COMB32 terms name, read back as numbers. */
const placesOf = (terms: string): number[] => [...terms.matchAll(/[01]+/g)].map((m) => parseInt(m[0], 2))
/** The least period of the list f(x) = 2^x mod 21, found by comparing the list with itself shifted (an independent route to the order). */
const periodOfList = (len: number): number => {
  const f = powersMod(2, 21, len)
  for (let r = 1; r < len / 2; r++) if (f.slice(0, len - r).every((v, x) => v === f[x + r])) return r
  return -1
}

/* ---------------------------------------------------------------------------------------------- */
/* Helpers read by the values                                                                       */
/* ---------------------------------------------------------------------------------------------- */
const sum = (xs: readonly number[]): number => xs.reduce((a, b) => a + b, 0)
/** |Σ_k ω_N^{jk}| for k = 0 … N − 1. */
const rootPowerSum = (N: number, j: number): number => abs(phasorSum(Array.from({ length: N }, (_, k) => (2 * Math.PI * ((j * k) % N)) / N)))
const F8 = dftMatrix(8)
const prob = (v: { re: number; im: number }[]): number[] => v.map((z) => abs2(z))
const COMB2 = dft(ket('++0'))
const COMB4 = dft(ket('+00'))
const COMB2_SHIFT = dft(ket('++1'))
const COMB3 = dft(superpose(COMB3_8))
const COMB32_T = dft(superpose(COMB32))
const P32 = prob(COMB32_T)
const top = (p: readonly number[], count: number): number[] =>
  p
    .map((v, k) => [Math.round(v * 1e9), k] as const)
    .sort((a, b) => b[0] - a[0] || a[1] - b[1])
    .slice(0, count)
    .map(([, k]) => k)
    .sort((a, b) => a - b)
const omega = (N: number, k = 1) => rootsOfUnity(N)[k % N]
const CF5_32 = continuedFraction(5, 32)
const CONV5_32 = convergents(CF5_32)
const SUCCESS = peakSuccesses(5, 2, 21)
const fracPart = (x: number): number => x - Math.floor(x + 1e-12)
/** 1 when every x coprime to 21 has an order that divides the count of units, else 0. */
const orderDividesUnits21 = (() => {
  for (let x = 1; x < 21; x++) {
    const r = multOrder(x, 21)
    if (r !== null && unitsCount(21) % r !== 0) return 0
  }
  return 1
})()
/** The least |ĉ_k| gap over all k between the comb {1, 3, 5, 7} and the comb {0, 2, 4, 6}: the shift moves no size. */
const shiftSizeGap = Math.max(...COMB2_SHIFT.map((z, k) => Math.abs(abs(z) - abs(COMB2[k]))))
/** max_k | |ĉ_k| − √(A/N) D_A(rk/N) | for the step-3 comb on eight places (A = 3 teeth: 0, 3, 6). */
const kernelGap = Math.max(...COMB3.map((z, k) => Math.abs(abs(z) - Math.sqrt(3 / 8) * dirichlet(3, (3 * k) / 8))))
/** The largest turn gap, in degrees, between the phase of (F_8)_{kj} and 45·jk degrees, over all 64 entries. */
const phaseGap = (() => {
  let g = 0
  for (let k = 0; k < 8; k++)
    for (let j = 0; j < 8; j++) {
      const want = (45 * ((j * k) % 8) * Math.PI) / 180
      const diff = Math.abs(((arg(F8[k][j]) - want + Math.PI) % (2 * Math.PI)) - Math.PI)
      g = Math.max(g, Math.min(diff, 2 * Math.PI - diff))
    }
  return g
})()
const FACTORS = factorFromOrder(2, 6, 21)!
const minWindow8 = (() => {
  let m = 1
  for (let k = -64; k <= 64; k++) m = Math.min(m, dirichlet(8, k / (64 * 16)))
  return m
})()
const roots5 = rootsOfUnity(5)
const rootsMinGap5 = Math.min(...roots5.flatMap((a, i) => roots5.filter((_, j) => j !== i).map((b) => abs(sub(a, b)))))
const rootsAreRoots5 = Math.max(...roots5.map((z) => abs(sub(cpow(z, 5), c(1)))))
const lastPos = (xs: readonly number[]): number => xs.length - 1
/** The first δ on the grid k/(16M) at which D_M(δ) is 0: the full step where M arrows turned δ of a turn each have closed up (1/M). */
const firstZero = (M: number): number => {
  for (let k = 1; k <= 16 * M; k++) if (dirichlet(M, k / (16 * M)) < 1e-9) return k / (16 * M)
  return NaN
}
const sumC = (zs: readonly { re: number; im: number }[]) => zs.reduce((a, z) => add(a, z), c(0))
/** The places where the transform of the step-2 comb has a spike (a size above 0.1). */
const spikes2 = COMB2.map((z, k) => [abs(z), k] as const).filter(([a]) => a > 0.1).map(([, k]) => k)

export const V = {
  /* f8-clock */
  f8Clock14: mod(14, 12),
  f8Clock9p5: mod(9 + 5, 12),
  f8NegMod: mod(-3, 12),
  /** checksum of the list 1, 2, 4, 8, 16, 11 (2⁰ … 2⁵ mod 21) */
  f8Pow2Sum6: sum(P2.slice(0, 6)),
  f8Pow2Back: P2[lastPos(P2)],
  f8Period2Pow: periodOfList(60),
  /** checksum of the places x < 32 where 2^x ≡ 1 (mod 21): 0 + 6 + 12 + 18 + 24 + 30 */
  f8Comb32Sum: sum(PLACES32),
  f8Comb32Count: PLACES32.length,
  f8Comb32Step: PLACES32[1] - PLACES32[0],
  f8CombChance: abs2(superpose(COMB32)[0]),
  f8Pow2e100: modPow(2, 100, 21),
  f8HundredMod6: mod(100, 6),
  f8Pow2e4: modPow(2, 4, 21),

  /* f8-euclid */
  f8Gcd8436: gcd(84, 36),
  f8Mod8436: mod(84, 36),
  f8Ratio8436: 84 / 36,
  f8EuclidLines8436: euclidSteps(84, 36).length,
  f8BezoutX: egcd(84, 36).x,
  f8BezoutY: egcd(84, 36).y,
  f8Gcd321: gcd(3, 21),
  f8Inv2mod21: modInverse(2, 21) ?? -1,
  f8Inv4mod21: modInverse(4, 21) ?? -1,
  f8Mul2x11: mod(2 * 11, 21),
  f8Mul4x16: mod(4 * 16, 21),
  f8Inv3Exists: modInverse(3, 21) === null ? 0 : 1,
  f8Order2mod21: multOrder(2, 21) ?? -1,
  f8Order5mod21: multOrder(5, 21) ?? -1,
  f8Units21: unitsCount(21),
  f8OrderDividesUnits: orderDividesUnits21,
  f8HalfPow: modPow(2, 3, 21),
  f8EightSqMinus1: modPow(2, 3, 21) ** 2 - 1,
  f8EightSqMinus1Mod21: mod(modPow(2, 3, 21) ** 2 - 1, 21),
  f8FacA: gcd(modPow(2, 3, 21) - 1, 21),
  f8FacB: gcd(modPow(2, 3, 21) + 1, 21),
  f8FacProduct: FACTORS[0] * FACTORS[1],
  /** checksum of the list 3, 9, 6, 18, 12, 15 (3¹ … 3⁶ mod 21) */
  f8Pow3Sum6: sum(P3.slice(1, 7)),
  f8Pow3Back: P3[lastPos(P3)],
  f8Pow3Hits1: P3.slice(1, 7).filter((v) => v === 1).length,
  f8Order3Exists: multOrder(3, 21) === null ? 0 : 1,

  /* f8-roots */
  f8Omega5Re: omega(5).re,
  f8Omega5Im: omega(5).im,
  f8Omega5pow5Gap: abs(sub(cpow(omega(5), 5), c(1))),
  f8Angle5: (arg(omega(5)) * 180) / Math.PI,
  f8Roots5AllRoots: rootsAreRoots5,
  f8Roots5MinGap: rootsMinGap5,
  f8RootSum5: rootPowerSum(5, 1),
  f8RootSum2: rootPowerSum(2, 1),
  f8ShiftSum5: abs(sub(mul(omega(5), sumC(roots5)), sumC(roots5))),
  f8PowSum8j3: rootPowerSum(8, 3),
  f8PowSum8j2: rootPowerSum(8, 2),
  f8PowSum8j8: rootPowerSum(8, 8),
  f8Star8Corners: 8 / gcd(3, 8),
  f8RootSum12: rootPowerSum(12, 1),
  f8Every3rd12: abs(phasorSum(Array.from({ length: 4 }, (_, k) => (2 * Math.PI * 3 * k) / 12))),
  f8First3of12: abs(phasorSum([0, 1, 2].map((k) => (2 * Math.PI * k) / 12))),
  f8Omega12CubeGap: abs(sub(omega(12, 3), c(0, 1))),

  /* f8-dft */
  f8DftEntry11Re: F8[1][1].re,
  f8DftEntry11Im: F8[1][1].im,
  f8DftEntry00: F8[0][0].re,
  f8DftEntry12Im: F8[1][2].im,
  /** the largest gap, in degrees, between the colour-turn of (F_8)_{kj} and 45jk degrees over all 64 entries */
  f8DftPhaseGap: (phaseGap * 180) / Math.PI,
  f8DftUnitary: maxDiff(matmul(dagger(F8), F8), identity(8)),
  f8Comb2Peak: abs(COMB2[0]),
  f8Comb2Others: Math.max(...COMB2.filter((_, k) => k !== 0 && k !== 4).map(abs)),
  f8Comb4Peak: abs(COMB4[0]),
  f8Comb4Others: Math.max(...COMB4.filter((_, k) => k % 2 === 1).map(abs)),
  f8Spike2Spacing: spikes2[1] - spikes2[0],
  f8ShiftC0Re: COMB2_SHIFT[0].re,
  f8ShiftC4Re: COMB2_SHIFT[4].re,
  f8ShiftSizeGap: shiftSizeGap,
  f8Omega84Re: omega(8, 4).re,
  f8Comb3P0: prob(COMB3)[0],
  f8Comb3P3: prob(COMB3)[3],
  f8Comb3P5: prob(COMB3)[5],
  f8NoverR83a: 8 / 3,
  f8NoverR83b: 16 / 3,
  f8CombKernelGap: kernelGap,

  /* f8-geometric */
  f8GeomHalf4: geometricSum(c(0.5), 4).re,
  f8GeomDirect: geometricSumDirect(c(0.5), 4).re,
  f8Chain240: abs(phasorSum([0, (240 * Math.PI) / 180])),
  f8Chord60: chord(Math.PI / 3),
  f8Chord90: chord(Math.PI / 2),
  f8Chord1rad: chord(1),
  f8TwoOverPi: 2 / Math.PI,
  f8Dir8Half: dirichlet(8, 1 / 16),
  f8WorstChance8: dirichlet(8, 1 / 16) ** 2,
  f8FourOverPi2: 4 / Math.PI ** 2,
  f8MinOnWindow8: minWindow8,
  f8GeomU: 0.5,
  f8Delta8Half: firstZero(8) / 2,
  f8Delta8Full: firstZero(8),
  f8Dir80: dirichlet(8, 0),
  f8Dir8Full: dirichlet(8, 1 / 8) < 1e-12 ? 0 : dirichlet(8, 1 / 8),
  f8Dir64half: dirichlet(64, 1 / 128),
  f8Dir64Zero: dirichlet(64, 1 / 64) < 1e-12 ? 0 : dirichlet(64, 1 / 64),
  f8Delta64Half: firstZero(64) / 2,
  f8DirLimitGap: dirichlet(10000, 1 / 20000) - 2 / Math.PI,

  /* f8-fractions */
  f8Bin101: binaryFraction('101'),
  f8Bin1Half: binaryFraction('1'),
  f8Bin001Eighth: binaryFraction('001'),
  f8Angle101: binaryFraction('101') * 360,
  f8Bin101x2frac: fracPart(2 * binaryFraction('101')),
  f8Angle101x2: ((arg(cpow(expi(2 * Math.PI * binaryFraction('101')), 2)) * 180) / Math.PI + 360) % 360,
  /** the last partial quotient 2 of 5/32 = [0; 6, 2, 2] turned over: 1/2 */
  f8CfLast: 1 / CF5_32[3],
  f8Frac1132: 11 / 32,
  f8Frac2132: 21 / 32,
  /** the three convergents 1/6, 2/13, 5/32 of 5/32 (their values; the quotients are checked whole) */
  f8Conv1: CONV5_32[1].p / CONV5_32[1].q,
  f8Conv2: CONV5_32[2].p / CONV5_32[2].q,
  f8Conv3: CONV5_32[3].p / CONV5_32[3].q,
  /** checksum of the six tallest bars of the 32-point transform of the comb: 0 + 5 + 11 + 16 + 21 + 27 */
  f8Comb6TopSum: sum(top(P32, 6)),
  f8Gap5: Math.abs(CONV5_32[3].p / CONV5_32[3].q - CONV5_32[1].p / CONV5_32[1].q),
  f8HalfQsq6: 1 / (2 * (multOrder(2, 21) ?? 0) ** 2),
  f8Pow213mod21: modPow(2, 13, 21),
  f8Pick5: orderFromPeak(5, 5, 2, 21) ?? -1,
  f8Pick27: orderFromPeak(27, 5, 2, 21) ?? -1,
  f8Pick11None: orderFromPeak(11, 5, 2, 21) === null ? 0 : 1,
  f8Conv1132: (() => {
    const t = convergents(continuedFraction(11, 32))
    return t[2].p / t[2].q
  })(),
  f8Conv1632: (() => {
    const t = convergents(continuedFraction(16, 32))
    return t[t.length - 1].p / t[t.length - 1].q
  })(),
  f8Conv2132: (() => {
    const t = convergents(continuedFraction(21, 32))
    return t[3].p / t[3].q
  })(),
  f8Pow23mod21: modPow(2, 3, 21),
  f8SuccessCount: SUCCESS.length,
  f8SuccessP: SUCCESS.reduce((a, y) => a + P32[y], 0),
} as const

/** The lists, kept whole for the claims that quote them (their checksums are in `V`). */
export const LISTS = { P2, P3, PLACES32, CF5_32, CONV5_32, SUCCESS, TOP6: top(P32, 6), COMB32_PLACES: placesOf(COMB32), TOP3_OF_COMB3: top(prob(COMB3), 3) } as const

export type ValueKey = keyof typeof V
export const claim = keyedClaim<ValueKey>()
export { claimKey, close, d, pct, tf, uf }
