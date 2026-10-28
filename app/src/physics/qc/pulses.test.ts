/**
 * qc/pulses.ts against numpy/scipy (pipeline/make_q24_fixtures.py -> __fixtures__/qc-q24.json; routes in pipeline/q24_numpy.py: solve_ivp of Eq. 12.6, scipy expm, brentq,
 * scipy.integrate.quad double integrals), plus the cross-checks of P-Q24-story §9.1: Eq. 12.7 against the matrix exponential and against Townsend's closed form
 * (rabiProbability with w1 = 2 Omega), the composite identity, the echo, precession against RK4, the OU variance against double quadrature.
 */
import { describe, expect, it } from 'vitest'
import raw from '../__fixtures__/qc-q24.json?raw'
import { rabiProbability } from '../dynamics'
import { abs, abs2, c } from '../complex'
import { type Mat, identity, matmul, mscale } from '../linalg'
import { Rx, Ry, X, Y, Z } from './gates'
import {
  accumulatedErrorDeg,
  coherenceFactor,
  compositeU,
  crossIntegrate,
  divincenzo,
  echoCoherence,
  echoSequence,
  echoVariance,
  echoVarianceQuad,
  errorComposite,
  errorPlain,
  fieldStrength,
  fieldTiltDeg,
  gatesPerCoherence,
  gaussianCoherence,
  gaussianCoherenceClosed,
  omegaPrime,
  ouCoherence,
  ouVariance,
  ouVarianceQuad,
  piPulseTime,
  precessDensity,
  precessM,
  pulseTrainAngleDeg,
  pulseTrainP0,
  rabiCeiling,
  rabiPe,
  rabiPeFromU,
  rabiU,
  rabiUExpm,
  ramseyP1,
  ramseyState,
  t2star,
} from './pulses'

type CM = number[][][]
const F = JSON.parse(raw) as Record<string, any>
const toMat = (m: CM): Mat => m.map((row) => row.map(([re, im]) => c(re, im)))
const maxd = (A: Mat, B: Mat): number => Math.max(...A.flatMap((row, i) => row.map((x, j) => abs(c(x.re - B[i][j].re, x.im - B[i][j].im)))))

describe('Eq. 12.7 (numpy: solve_ivp of Eq. 12.6 as printed)', () => {
  for (const [i, k] of (F.rabi as any[]).entries())
    it(`case ${i} (Omega = ${k.Omega[0].toFixed(2)} + ${k.Omega[1].toFixed(2)}i, Delta = ${k.Delta.toFixed(2)}): the printed operator, the exponential route and scipy agree`, () => {
      const O = c(k.Omega[0], k.Omega[1])
      expect(maxd(rabiU(O, k.Delta, k.t), toMat(k.U))).toBeLessThan(1e-9)
      expect(maxd(rabiU(O, k.Delta, k.t), rabiUExpm(O, k.Delta, k.t))).toBeLessThan(1e-13)
    })
  it('the operator is unitary; P_e equals |U_eg|^2 and Eq. 12.8; the ceiling is Omega^2/Omega\'^2; Townsend\'s closed form agrees with w1 = 2 Omega', () => {
    const [Om, De, t] = [1.7, 0.9, 2.3]
    const U = rabiU(Om, De, t)
    expect(abs2(U[0][0]) + abs2(U[1][0])).toBeCloseTo(1, 14)
    expect(rabiPeFromU(U)).toBeCloseTo(rabiPe(Om, De, t), 14)
    expect(rabiPe(Om, De, t)).toBeCloseTo(rabiProbability(10, 2 * Om, 10 + De, t), 14)
    expect(rabiCeiling(2 * Math.PI, 4 * Math.PI)).toBeCloseTo(0.2, 14)
    expect(omegaPrime(2 * Math.PI, 4 * Math.PI)).toBeCloseTo(14.0496, 4)
    expect(piPulseTime(2 * Math.PI)).toBeCloseTo(0.5, 14)
  })
  it('on resonance U(2 pi/Omega) = -I and U(4 pi/Omega) = +I', () => {
    expect(maxd(rabiU(1, 0, 2 * Math.PI), mscale(identity(2), -1))).toBeLessThan(1e-13)
    expect(maxd(rabiU(1, 0, 4 * Math.PI), identity(2))).toBeLessThan(1e-13)
  })
  it('the phase of Omega picks the axis: real Omega > 0 gives R_x(-theta), Omega < 0 gives R_x(+theta), Omega = -i gives R_y(+theta) (Correction C1: the printed R_x sign)', () => {
    const th = Math.PI / 2
    expect(maxd(rabiU(1, 0, th), Rx(-th))).toBeLessThan(1e-14)
    expect(maxd(rabiU(1, 0, th), Rx(th))).toBeCloseTo(Math.SQRT2, 12)
    expect(maxd(rabiU(-1, 0, th), Rx(th))).toBeLessThan(1e-14)
    expect(maxd(rabiU(c(0, -1), 0, th), Ry(th))).toBeLessThan(1e-14)
  })
})

describe('composite pulses (numpy: expm, spectral norm)', () => {
  for (const k of F.pulseErr as any[])
    it(`eps = ${k.eps} (${k.mode}): plain ${k.plain.toExponential(3)}, composite ${k.comp.toExponential(3)}`, () => {
      expect(errorPlain(k.eps, k.mode)).toBeCloseTo(k.plain, 12)
      expect(errorComposite(k.eps, k.mode)).toBeCloseTo(k.comp, 12)
    })
  it('at eps = 0 the sequence equals R_x(pi); the errors scale as eps and eps^2 with coefficients pi/2 and pi^2/4', () => {
    expect(maxd(compositeU(0), Rx(Math.PI))).toBeLessThan(1e-14)
    expect(errorPlain(1e-4) / 1e-4).toBeCloseTo(Math.PI / 2, 3)
    expect(errorComposite(1e-4) / 1e-8).toBeCloseTo((Math.PI * Math.PI) / 4, 2)
  })
  it('the sandwich behind the identity: R_x(pi/2) R_y(pi) R_x(pi/2) = -iY, and Z = iYX', () => {
    expect(maxd(matmul(Rx(Math.PI / 2), matmul(Ry(Math.PI), Rx(Math.PI / 2))), mscale(Y, c(0, -1)))).toBeLessThan(1e-14)
    expect(maxd(mscale(matmul(Y, X), c(0, 1)), Z)).toBeLessThan(1e-14)
  })
})

describe('Ramsey and precession', () => {
  for (const k of F.ramsey as any[]) it(`phi = ${k.phi.toFixed(3)}: P(1) = cos^2(phi/2) = ${k.p1.toFixed(6)}`, () => {
    expect(ramseyP1(k.phi)).toBeCloseTo(k.p1, 14)
    expect(ramseyP1(k.phi)).toBeCloseTo(Math.cos(k.phi / 2) ** 2, 14)
  })
  it('the state after the sequence is e^{i phi/2} (-i sin(phi/2), cos(phi/2))', () => {
    const [a, b] = ramseyState(1.1)
    expect(abs(a)).toBeCloseTo(Math.sin(0.55), 14)
    expect(abs(b)).toBeCloseTo(Math.cos(0.55), 14)
  })
  for (const [i, k] of (F.precess as any[]).entries())
    it(`precession case ${i}: the Rodrigues turn, the density-matrix evolution and RK4 agree with numpy`, () => {
      const m = precessM(k.B, k.M0, k.t)
      m.forEach((v, j) => expect(v).toBeCloseTo(k.M[j], 12))
      precessDensity(k.B, k.M0, k.t).forEach((v, j) => expect(v).toBeCloseTo(k.M[j], 12))
      crossIntegrate(k.B, k.M0, k.t, 4000).forEach((v, j) => expect(v).toBeCloseTo(k.M[j], 9))
    })
  it('the field B = (1, 0, 0.8) tilts 38.66 degrees from x and has strength 1.2806', () => {
    expect(fieldTiltDeg(1, 0.8)).toBeCloseTo(38.6598, 4)
    expect(fieldStrength(1, 0.8)).toBeCloseTo(1.28062, 5)
  })
})

describe('noise (numpy: quad for the Gaussian average, double quad for the variances, brentq)', () => {
  for (const k of F.gauss as any[]) it(`Gaussian phase of rms ${k.sigma.toFixed(3)}: quadrature ${k.value.toFixed(8)} equals e^{-sigma^2/2}`, () => {
    expect(gaussianCoherence(k.sigma)).toBeCloseTo(k.value, 13)
    expect(gaussianCoherenceClosed(k.sigma)).toBeCloseTo(k.value, 13)
  })
  for (const k of F.ou as any[]) it(`OU variance at t = ${k.t}, tau_c = ${k.tauC}: closed form, double quadrature and numpy agree`, () => {
    expect(ouVariance(k.t, k.sigma, k.tauC)).toBeCloseTo(k.var, 12)
    expect(ouVarianceQuad(k.t, k.sigma, k.tauC)).toBeCloseTo(k.var, 11)
    expect(ouCoherence(k.t, k.sigma, k.tauC)).toBeCloseTo(Math.exp(-k.var / 2), 14)
  })
  for (const k of F.t2star as any[]) it(`T2* at sigma = 1, tau_c = ${k.tauC}: ${k.value.toFixed(6)}`, () => {
    expect(t2star(k.sigma, k.tauC)).toBeCloseTo(k.value, 10)
  })
  it('the limits: T2* -> 1/(sigma^2 tau_c) for fast noise and sqrt(2)/sigma for slow noise; the middle case sigma = tau_c = 1 solves t + e^{-t} = 2', () => {
    expect(t2star(1, 1e-3)).toBeCloseTo(1000 + 1e-3, 3)
    expect(t2star(1, 1e3)).toBeCloseTo(Math.SQRT2, 3)
    const t = t2star(1, 1)
    expect(t + Math.exp(-t)).toBeCloseTo(2, 12)
  })
  for (const k of F.echo as any[]) it(`echo variance at tau = ${k.tau}, tau_c = ${k.tauC}: closed form, quadrature and numpy agree`, () => {
    expect(echoVariance(k.tau, k.sigma, k.tauC)).toBeCloseTo(k.var, 12)
    expect(echoVarianceQuad(k.tau, k.sigma, k.tauC)).toBeCloseTo(k.var, 11)
    expect(echoCoherence(k.tau, k.sigma, k.tauC)).toBeCloseTo(Math.exp(-k.var / 2), 14)
  })
  for (const k of F.echoSequence as any[]) it(`echo sequence at a static frequency error ${k.delta} equals -I`, () => {
    expect(maxd(echoSequence(k.delta, k.tau), toMat(k.U))).toBeLessThan(1e-13)
    expect(maxd(echoSequence(k.delta, k.tau), mscale(identity(2), -1))).toBeLessThan(1e-13)
  })
  it('the echo wins for slow noise and does nothing for fast noise', () => {
    expect(echoCoherence(1, 1, 10)).toBeGreaterThan(5 * ouCoherence(2, 1, 10))
    expect(Math.abs(echoCoherence(1, 1, 0.1) - ouCoherence(2, 1, 0.1))).toBeLessThan(0.03)
  })
})

describe('imperfect pulse trains and the budget', () => {
  for (const k of F.pulseTrain as any[]) it(`${2 * k.N} pulses, eps = ${k.eps}, ${k.alternate ? 'alternating' : 'same sense'}: P(0) = ${k.p0.toFixed(6)}`, () => {
    expect(pulseTrainP0(k.eps, k.N, k.alternate)).toBeCloseTo(k.p0, 12)
  })
  it('20 pulses 1 % too large give 36 degrees; P(0) = cos^2(18 degrees); the alternating train gives 1', () => {
    expect(accumulatedErrorDeg(0.01, 10)).toBe(36)
    expect(pulseTrainAngleDeg(0.01, 10, false)).toBeCloseTo(36, 10)
    expect(accumulatedErrorDeg(0.005, 15)).toBe(27)
    expect(pulseTrainP0(0.01, 10, false)).toBeCloseTo(Math.cos((18 * Math.PI) / 180) ** 2, 12)
    expect(pulseTrainP0(0.01, 10, true)).toBeCloseTo(1, 12)
  })
  it('seven criteria, five for a computer and two for a network; five platforms; 1000 gates fit and 1/e of the phase signal is left after them', () => {
    const d = divincenzo()
    expect(d.criteria).toHaveLength(7)
    expect(d.criteria.filter((x) => x.kind === 'computer')).toHaveLength(5)
    expect(d.criteria.filter((x) => x.kind === 'network')).toHaveLength(2)
    expect(d.platforms).toHaveLength(5)
    expect(gatesPerCoherence(1000, 1)).toBe(1000)
    expect(coherenceFactor(1000, 1000)).toBeCloseTo(Math.exp(-1), 15)
  })
})
