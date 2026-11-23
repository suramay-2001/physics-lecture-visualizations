/**
 * physics/readout/classify.ts against its numpy twin (pipeline/claims_papers/b5.py -> __fixtures__/claims-papers/b5.json and readout-b5.json), plus the properties that need
 * no twin: probabilities sum to one, the likelihood-ratio statistic reaches the Bayes error and no weighted sum beats it, a flat sum is the Poisson-sum error, the learned
 * filter of one isolated atom is s/(b + p s), a linear map then a linear statistic is one linear statistic.
 */
import { describe, expect, it } from 'vitest'
import claims from '../__fixtures__/claims-papers/b5.json'
import checks from '../__fixtures__/readout-b5.json'
import { normalTail } from '../optics/imaging'
import * as C from './classify'

const K = claims.values as Record<string, number>
const X = checks.values as Record<string, number>
const near = (got: number, want: number, tol = 1e-12): void => expect(Math.abs(got - want), `${got} vs ${want}`).toBeLessThan(tol)

const SIG = 0.9
const NPH = 20
const BG = 0.4
const sig = C.classSignals(SIG, NPH)
const bright = sig.map((s) => BG + s)
const dark = [BG, BG, BG]

describe('the spot on the grid', () => {
  it('pixel and box shares, the class signals and the crosstalk window', () => {
    near(C.psfPixelShare(SIG, 0), X['eng.psfShare.0.0.9'])
    near(C.psfPixelShare(SIG, 0) ** 2, K.b5PsfCenter)
    near(sig[0], K.b5SigC)
    near(sig[1], K.b5SigE)
    near(sig[2], K.b5SigK)
    near(C.boxShare(3, SIG), K.b5PsfRoi3)
    near(C.boxShare(5, SIG), K.b5PsfRoi5)
    near(C.windowShare(2, SIG, 1), K.b5CrossFrac2)
    near(C.windowShare(4, SIG, 1), K.b5CrossFrac4)
    near(1 - C.boxShare(3, 0.6), K.b5OutsideSig06)
    near(1 - C.boxShare(3, 1.2), K.b5OutsideSig12)
    near(C.boxShare(5, 1.2), X['ch.roi.box5s12'])
    near(C.psfPixelShare(0.6, 0) ** 2, X['ch.roi.centre06'])
  })
  it('psfFrame puts the whole atom on the grid (a wide frame) and the background everywhere', () => {
    const f = C.psfFrame([[4, 4]], SIG, NPH, BG, 9, 9)
    near(f.reduce((a, b) => a + b, 0), NPH + 81 * BG, 1e-3)
    near(f[4 * 9 + 4] - BG, NPH * K.b5PsfCenter, 1e-12)
  })
})

describe('the likelihood-ratio weights and the exact errors', () => {
  const w = C.llrWeights(sig, BG)
  it('weights, threshold, one pixel and d′²', () => {
    near(w[0], K.b5WLlrC)
    near(w[1], K.b5WLlrE)
    near(w[2], K.b5WLlrK)
    near(C.CLASSES_3X3.reduce((t, m, i) => t + m * sig[i], 0), K.b5LlrThreshold)
    near(C.llrOnePixel(3, 1.2, 0.4), K.b5LlrOnePixel)
    near(C.dprime2([sig[2], sig[1], sig[2], sig[1], sig[0], sig[1], sig[2], sig[1], sig[2]], BG), K.b5Dprime2)
    const ne = C.normalError(Math.sqrt(K.b5Dprime2), normalTail)
    near(ne / 10 ** Math.floor(Math.log10(ne)), K.b5NormalErrM, 1e-9)
    expect(-Math.floor(Math.log10(ne))).toBe(K.b5NormalErrE)
  })
  it('the errors of the centre, the flat sum, the Gaussian-shaped sum and the likelihood ratio agree with the full enumeration', () => {
    near(C.statisticError([1, 0, 0], bright, dark).err, K.b5ErrCenter)
    near(C.statisticError([1, 1, 1], bright, dark).err, K.b5ErrSquare3)
    near(C.statisticError(sig, bright, dark).err, K.b5ErrGauss)
    near(C.statisticError(w, bright, dark).err, K.b5ErrLlr)
    near(C.bayesError(bright, dark), K.b5ErrBayes)
  })
  it('the likelihood-ratio statistic reaches the Bayes error and no other weights beat it', () => {
    const llr = C.statisticError(w, bright, dark).err
    near(llr, C.bayesError(bright, dark), 1e-12)
    for (const other of [[1, 1, 1], sig, [1, 0, 0], [3, 2, 1], [1, 2, 3], [w[0] * 1.2, w[1], w[2] * 0.8]]) expect(C.statisticError(other, bright, dark).err).toBeGreaterThanOrEqual(llr - 1e-15)
  })
  it('a flat sum is a Poisson sum: the same error by the Poisson route', () => {
    const m1 = 9 * BG + NPH * C.boxShare(3, SIG)
    near(C.poissonSumError(m1, 9 * BG).err, K.b5SquarePoisson)
    near(C.poissonSumError(m1, 9 * BG).err, K.b5ErrSquare3)
  })
  it('exposure: twice the light and background halves ... the errors at tau = 1/2 and 2 and the square-root law', () => {
    const scaled = (tau: number) => ({ b: bright.map((x) => tau * x), d: dark.map((x) => tau * x), w: C.llrWeights(sig.map((x) => tau * x), tau * BG) })
    near(C.statisticError(scaled(0.5).w, scaled(0.5).b, scaled(0.5).d).err, K.b5ErrLlrTauHalf)
    near(C.statisticError(scaled(2).w, scaled(2).b, scaled(2).d).err, K.b5ErrLlrTau2)
    near(C.statisticError([1, 1, 1], scaled(2).b, scaled(2).d).err, K.b5ErrSquareTau2)
    const d = (t: number) => C.dprime2(sig.map((x) => t * x), t * BG)
    near(Math.sqrt(d(4) / d(1)), K.b5DprimeRatio4)
  })
  it('another set of inputs (sigma 1.2, 12 photons, background 0.2)', () => {
    const s = C.classSignals(1.2, 12)
    const b = s.map((x) => 0.2 + x)
    near(C.statisticError(C.llrWeights(s, 0.2), b, [0.2, 0.2, 0.2]).err, X['eng.errLlr.sigma1.2.photons12.b0.2'])
    near(C.statisticError([1, 1, 1], b, [0.2, 0.2, 0.2]).err, X['eng.errSquare.sigma1.2.photons12.b0.2'])
  })
  it('refuses a wrong number of classes and a zero background', () => {
    expect(() => C.statisticError([1, 1], [1, 1], [1, 1])).toThrow(RangeError)
    expect(() => C.llrWeight(1, 0)).toThrow(RangeError)
  })
})

describe('the learned filter and the linear cascades', () => {
  const strip = (c: number) => Array.from({ length: 7 }, (_, i) => NPH * C.psfPixelShare(SIG, i - c))
  const sA = strip(2)
  const sB = strip(4)
  const rel = (w: number[]) => w.map((x) => x / Math.max(...w))
  it('an isolated atom: weights ∝ s/(b + p s); with a neighbour the neighbour’s pixels turn negative', () => {
    const iso = rel(C.populationFilter([sA], 0, 0.5, BG))
    const xt = rel(C.populationFilter([sA, sB], 0, 0.5, BG))
    iso.forEach((x, i) => near(x, X[`eng.iso.${i}`], 1e-10))
    xt.forEach((x, i) => near(x, X[`eng.xtW.${i}`], 1e-10))
    const ratio = sA.map((s) => s / (BG + 0.5 * s))
    rel(ratio).forEach((x, i) => near(x, iso[i], 1e-10))
    for (let i = 0; i < 4; i++) near(xt[i], K[`b5XtW${i}`], 1e-10)
    for (const i of [4, 5, 6]) near(-xt[i], K[`b5XtN${i}`], 1e-10)
    near(iso[4], K.b5XtIso4, 1e-10)
    near(iso[5], K.b5XtIso5, 1e-10)
  })
  it('q and the shrink factor', () => {
    const r = C.isolatedQ(sA, BG, 0.5)
    near(r.q, K.b5Q, 1e-10)
    near(r.shrink, K.b5LsShrink, 1e-12)
    near(C.isolatedQ([1], 1, 0.5).shrink, 0.25 * C.isolatedQ([1], 1, 0.5).q / (1 + 0.25 * C.isolatedQ([1], 1, 0.5).q), 1e-15)
  })
  it('d² of the pipelines: raw = q = Wiener (rank one), blur-then-centre loses, ordering holds', () => {
    const I = Array.from({ length: 7 }, (_, i) => Array.from({ length: 7 }, (_, j) => (i === j ? 1 : 0)))
    const raw = C.linearD2(I, sA, BG, 0.5)
    near(raw, K.b5D2Raw, 1e-10)
    const W = C.wienerSmoother(sA, BG, 0.5)
    near(C.linearD2(W, sA, BG, 0.5), K.b5D2Wiener, 1e-10)
    near(C.linearD2([C.blurMatrix(7)[2]], sA, BG, 0.5), K.b5D2BlurCentre, 1e-10)
    near(C.linearD2(I.slice(1, 4), sA, BG, 0.5), K.b5D2Crop3, 1e-10)
    near(C.linearD2(I.slice(2, 3), sA, BG, 0.5), K.b5D2Centre, 1e-10)
    // the Wiener smoother is rank one: every row is a multiple of the template's shape through one row vector
    for (let i = 0; i < 7; i++) near(W[i][3] / sA[i], W[2][3] / sA[2], 1e-9)
    near(C.blurMatrix(7)[3][3], X['ch.wi.centre'], 1e-15)
  })
  it('a singular system on its range', () => {
    expect(C.solveSym([[1, 1], [1, 1]], [2, 2]).reduce((a, b) => a + b)).toBeCloseTo(2, 12)
  })
})

describe('network sizes', () => {
  it('parameters and receptive fields, counted from the printed layer lists', () => {
    const cnn = C.convParams(3, 1, 32) + C.convParams(3, 32, 64) + C.convParams(3, 64, 128) + C.denseParams(4 * 4 * 128, 128) + C.denseParams(128, 2)
    expect(cnn).toBe(K.b5CnnSiteParams)
    expect(C.receptiveField([3, 3, 3].map((k) => ({ k, stride: 1 })))).toBe(K.b5RfCnn)
    expect(C.receptiveField([3, 3, 3, 3].map((k) => ({ k, stride: 1 })))).toBe(X['ch.cnn.rf'])
    expect(C.receptiveField([[4, 2], [4, 2], [4, 2], [4, 1], [4, 1]].map(([k, stride]) => ({ k, stride })))).toBe(K.b5Rf70)
    expect(C.receptiveField([3, 3, 3, 3].map((k) => ({ k, stride: 2 })))).toBe(K.b5RfGdfD)
    expect(C.convParams(3, 16, 32)).toBe(X['ch.cnn.conv'])
    const gen = C.convParams(3, 1, 64, false) + C.convParams(3, 64, 128, false) + C.convParams(3, 128, 256, false) + 6 * C.convParams(3, 256, 256, false) + C.convParams(4, 256, 128, false) + C.convParams(4, 256, 64, false) + C.convParams(3, 128, 1, false)
    expect(gen).toBe(K.b5GenParams2)
    expect(gen - 3 * C.convParams(3, 256, 256, false)).toBe(K.b5GenParams1)
  })
})

describe('the cleaner’s prior and the GAN terms', () => {
  it('posterior, the flip prior, the shift of the log-odds, the GAN terms and the smoothed floor', () => {
    near(C.posteriorBright(-1, 0.5), K.b5PostEqual)
    near(C.posteriorBright(-1, 0.9), K.b5PostPrior90)
    near(C.flipPrior(-1), K.b5FlipPrior)
    near(C.logitShift(0.5, 0.9), K.b5ShiftLogit)
    near(C.posteriorBright(-2, 0.8), X['ch.p2.post'])
    near(C.ganTerms(0.5).generator, K.b5GanEq)
    near(C.ganTerms(0.2).generator, K.b5GanFake02)
    near(C.ganTerms(0.25).generator, X['ch.p2.gan'])
    near(C.smoothedBceFloor(0.9), K.b5SmoothFloor)
    near(C.posteriorBright(-1, C.flipPrior(-1)), 0.5, 1e-15)
  })
})
