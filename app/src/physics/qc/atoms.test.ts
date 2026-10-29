/**
 * qc/atoms.ts against numpy/scipy (pipeline/make_q25_fixtures.py -> __fixtures__/qc-q25.json; routes in pipeline/q25_numpy.py: scipy.stats laws, gammaincc, brentq on the envelopes,
 * dense expm / eigh of three- and nine-level atoms, the unwrapped bright-dark phase for the Raman pi time), the closed forms, and the guard that the Chapter Q25 engine stays out of the
 * entry closure (it is imported only by Q25.values.ts, the lazy plot kind and tests).
 */
import { describe, expect, it } from 'vitest'
import raw from '../__fixtures__/qc-q25.json?raw'
import { c } from '../complex'
import { type Mat } from '../linalg'
import { G_STANDARD, dopplerTemperature, recoilTemperature, recoilVelocity } from '../optics/cooling'
import {
  PRINTED_T_DOPPLER_UK,
  RYD_IDEAL,
  TABLE_13_1,
  TABLE_COLUMNS,
  bestCutoff,
  binomialTail,
  blockadeRadiusScale,
  forceOverGravity,
  gammaIdentityGap,
  groundSublevels,
  poissonConvolutionGap,
  gateError,
  heatPerPhoton,
  logSlope,
  parityLoad,
  photonExponent,
  poissonCdf,
  poissonPmf,
  poissonSf,
  quantumEnvelope,
  ramanLoss,
  ramanLossEstimate,
  ramanPiPulse,
  readoutError,
  rydbergBest,
  rydbergError,
  rydbergGate,
  rydbergIdealGap,
  sandwichGapX,
  sandwichGapY,
  scaleFor,
  semiEnvelope,
  sitesFor,
  stopRow,
  t2starCoeff,
  t2starOverT0,
  t2starQuantum,
  t2starSemi,
  thermalPhotons,
  thermalSpeed,
  thermalT0,
  vdwScale,
  wCoupling,
  wCouplingClosed,
  zzCzGap,
} from './atoms'

const FX: any = JSON.parse(raw)
const rel = (a: number, b: number, eps: number) => expect(Math.abs(a - b) / Math.abs(b), `${a} vs ${b}`).toBeLessThan(eps)
const near = (a: number, b: number, eps: number) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(eps)
const cmat = (m: number[][][]): Mat => m.map((row) => row.map(([re, im]) => c(re, im)))
const OMEGAS = [2 * Math.PI * 50e3, 2 * Math.PI * 50e3, 2 * Math.PI * 10e3]

describe('Table 13.1 and the cooling numbers (the Optics Lab engine reused, ruling Z4)', () => {
  it('recoil speed, recoil and Doppler temperatures and the push of the four columns equal the numpy values', () => {
    for (const k of TABLE_COLUMNS) {
      const a = TABLE_13_1[k]
      rel(recoilVelocity(a), FX.table[k].vRec, 1e-12)
      rel(dopplerTemperature(a), FX.table[k].TD, 1e-12)
      rel(recoilTemperature(a), FX.table[k].Tr, 1e-12)
      rel(forceOverGravity(a), FX.table[k].accelOverG, 1e-12)
    }
    expect(TABLE_COLUMNS).toEqual(['Rb', 'Cs', 'Sr461', 'Sr689'])
  })
  it('the narrow-line Doppler temperature is 0.178 microkelvin, not the printed 1.02; the other three follow the formula within 2 percent', () => {
    near(dopplerTemperature(TABLE_13_1.Sr689) * 1e6, 0.1776, 1e-3)
    expect(Math.abs(dopplerTemperature(TABLE_13_1.Sr689) * 1e6 - PRINTED_T_DOPPLER_UK.Sr689)).toBeGreaterThan(0.8)
    for (const k of ['Rb', 'Cs', 'Sr461'] as const) expect(Math.abs(dopplerTemperature(TABLE_13_1[k]) * 1e6 / PRINTED_T_DOPPLER_UK[k] - 1)).toBeLessThan(0.02)
  })
  it('the stopping row of rubidium at 300 K (photons v/v_rec, time N/(gamma/2), length v t/2) equals the numpy route; the Optics Lab route v^2/2a agrees', () => {
    const r = stopRow(TABLE_13_1.Rb, 300)
    rel(r.speed, FX.stopRb300.speed, 1e-12)
    rel(r.photons, FX.stopRb300.photons, 1e-12)
    rel(r.time, FX.stopRb300.time, 1e-12)
    rel(r.length, FX.stopRb300.length, 1e-12)
    rel(r.length, (r.speed * r.time) / 2, 1e-12)
    rel(r.time, r.photons / (TABLE_13_1.Rb.gamma / 2), 1e-12)
  })
  it('heating per photon is a third of the recoil temperature; thermal speeds, photon numbers and the optical exponent agree', () => {
    rel(heatPerPhoton(TABLE_13_1.Rb) * 100, FX.table.Rb.Tr / 3 * 100, 1e-12)
    for (const e of FX.thermalSpeed) rel(thermalSpeed(e.T, TABLE_13_1.Cs.massKg), e.v, 1e-12)
    rel(thermalPhotons(9.19263177e9, 300), FX.photons.nbarCs300, 1e-9)
    rel(photonExponent(FX.photons.nu698, 300), FX.photons.exp698, 1e-9)
    expect(G_STANDARD).toBeCloseTo(9.80665, 12)
  })
})

describe('loading, counting and the readout error', () => {
  it('the odd-number chance of Poisson loading is (1 - e^{-2 mu})/2, never above one half; the binomial tail and the site count agree with scipy', () => {
    for (const e of FX.parity) {
      rel(parityLoad(e.mu), e.closed, 1e-12)
      rel(parityLoad(e.mu), e.series, 1e-12)
    }
    expect(parityLoad(30)).toBeLessThanOrEqual(0.5)
    rel(binomialTail(200, 0.5, 100), FX.binomial.tail200, 1e-9)
    rel(binomialTail(224, 0.5, 100), FX.binomial.tail224, 1e-9)
    expect(sitesFor(100, 0.99)).toBe(FX.binomial.sites100)
  })
  it('the Poisson pmf, cumulative and tail equal scipy.stats', () => {
    for (const e of FX.poisson) {
      rel(poissonPmf(e.n, e.mean), e.pmf, 1e-12)
      rel(poissonCdf(e.n, e.mean), e.cdf, 1e-12)
      rel(poissonSf(e.n, e.mean), e.sf, 1e-10)
    }
  })
  it('the equal-weight error for means 0.2 and 8.2 equals scipy at cutoffs 1 to 10, is smallest at 3 and the scale for 1e-3 is 1.51 at cutoff 4', () => {
    for (const e of FX.readout) rel(readoutError(e.nc, 0.2, 8.2), e.err, 1e-10)
    const b = bestCutoff(0.2, 8.2)
    expect(b.nc).toBe(FX.readoutBest.nc)
    rel(b.error, FX.readoutBest.err, 1e-10)
    rel(readoutError(3, 0.2, 8.2, 1, 0), FX.readoutBest.dark, 1e-9)
    rel(readoutError(3, 0.2, 8.2, 0, 1), FX.readoutBest.bright, 1e-10)
    expect(scaleFor(1e-3, 0.2, 8.2)).toEqual({ scale: FX.scaleFor.scale, nc: FX.scaleFor.nc })
  })
  it('the incomplete-gamma form of the book equals the Poisson sum (gap near 1e-13) for three cases', () => {
    for (const e of FX.gammaId) near(gammaIdentityGap(e.nc, e.mean), 0, 1e-9)
  })
})

describe('counting rules', () => {
  it('ground sublevels: caesium 7 + 9 = 16, strontium-87 10; two Poisson counts add into one Poisson law (gap near 1e-17)', () => {
    expect(groundSublevels(3.5, 0.5)).toBe(16)
    expect(groundSublevels(4.5, 0)).toBe(10)
    near(poissonConvolutionGap(8, 0.2), 0, 1e-15)
    near(poissonConvolutionGap(3.3, 4.1), 0, 1e-15)
  })
})

describe('thermal dephasing (Eqs. 13.9-13.10)', () => {
  it('the 1/e time of the semiclassical envelope is 1.947 hbar/(eta k_B T) = 2 sqrt(e^{2/3} - 1) T_0/2 and equals the numpy brentq at four temperatures', () => {
    near(t2starCoeff(), FX.t2starCoeff, 1e-14)
    near(t2starOverT0(), 0.9735, 1e-4)
    for (const e of FX.t2star) {
      rel(thermalT0(e.T, e.eta), e.T0, 1e-12)
      rel(t2starSemi(e.T, e.eta), e.semi, 1e-10)
      near(semiEnvelope(e.semi, e.T0), Math.exp(-1), 1e-10)
    }
  })
  it('the exact thermal product has the 1/e time of the numpy product, longer than the semiclassical one at low temperature', () => {
    for (const e of FX.t2star) {
      rel(t2starQuantum(e.T, e.eta, OMEGAS), e.quantum, 1e-9)
      near(quantumEnvelope(e.quantum, e.T, e.eta, OMEGAS), Math.exp(-1), 1e-9)
    }
    expect(t2starQuantum(1e-6, 2.5e-4, OMEGAS) / t2starSemi(1e-6, 2.5e-4)).toBeGreaterThan(2.7)
  })
})

describe('Raman light, the sandwich and the Rydberg gate', () => {
  it('R_y(pi/2) R_z R_y(-pi/2) = R_x and R_x(-pi/2) R_z R_x(pi/2) = R_y to machine precision', () => {
    for (const e of FX.sandwich) {
      near(sandwichGapX(e.theta), 0, 1e-14)
      near(sandwichGapY(e.theta), 0, 1e-14)
    }
  })
  it('the Raman pi time is 2 pi Delta (1 + O(1/Delta^2)) and the loss of a pi pulse equals the numpy value; at large detuning it tends to (pi/2) gamma/|Delta|', () => {
    for (const e of FX.raman) {
      const r = ramanLoss(e.Delta, e.gamma)
      rel(r.time, e.time, 1e-9)
      rel(r.loss, e.loss, 1e-6)
      near(r.time / (2 * Math.PI * e.Delta), e.timeOver, 1e-9)
    }
    expect(ramanPiPulse(50).peak).toBeGreaterThan(0.99)
    expect(Math.abs(ramanLoss(1000, 1).loss / ramanLossEstimate(1000, 1) - 1)).toBeLessThan(0.01)
  })
  it('the blockade-limit gate is diag(1, -1, -1, -1) = (Z kron Z) CZ; the finite and leaky blocks and their errors equal numpy', () => {
    near(rydbergIdealGap(), 0, 1e-12)
    near(zzCzGap(), 0, 1e-15)
    near(FX.rydIdeal, 0, 1e-8)
    for (const e of FX.rydBlock) {
      const M = rydbergGate(e.Omega, e.B, e.gamma)
      const N = cmat(e.M)
      M.forEach((row, i) => row.forEach((z, j) => near(Math.hypot(z.re - N[i][j].re, z.im - N[i][j].im), 0, 1e-12)))
      near(rydbergError(e.Omega, e.B, e.gamma), e.err, 1e-12)
    }
    near(gateError(RYD_IDEAL), 0, 1e-15)
  })
  it('the best error over the 200-point scan equals numpy at three decays and falls as the minus two thirds power of B tau', () => {
    for (const e of FX.rydBest) {
      const b = rydbergBest(e.gamma)
      near(b.omega, e.omega, 1e-12)
      near(b.error, e.error, 1e-12)
    }
    const taus = [1e4, 1e5, 1e6]
    const bests = taus.map((t) => rydbergBest(1 / t))
    near(logSlope(taus, bests.map((b) => b.error)), -FX.rydSlopes.error, 1e-9)
    near(logSlope(taus, bests.map((b) => b.omega)), -FX.rydSlopes.omega, 1e-9)
  })
  it('the Rydberg scalings and the W coupling: 2^11 = 2048, 2^{11/6}, sqrt(N) from the dense solver for N up to 24 and numpy at 100', () => {
    expect(vdwScale(50, 100)).toBe(2048)
    near(blockadeRadiusScale(25, 50), 2 ** (11 / 6), 1e-12)
    for (const e of FX.wCoupling) {
      if (e.N <= 24) near(wCoupling(e.N), e.value, 1e-9)
      near(wCouplingClosed(e.N), e.value, 1e-12)
    }
  })
})

describe('Chapter Q25 engine stays out of the entry closure', () => {
  it('only Q25.values.ts, the lazy plot kind and tests import atoms.ts or iontrap.ts', () => {
    const files = import.meta.glob('../../**/*.{ts,tsx}', { query: '?raw', import: 'default', eager: true }) as Record<string, string>
    const importers = Object.entries(files)
      .filter(([, src]) => /\bfrom\s+["'][^"']*\/qc\/(atoms|iontrap)["']/.test(src))
      .map(([path]) => path.replace('../../', ''))
      .filter((p) => !/\.test\.tsx?$/.test(p))
      .sort()
    expect(importers.filter((p) => !['content/qc709/Q25.values.ts', 'stage/svg/plot.ts'].includes(p))).toEqual([])
    expect(importers).toContain('content/qc709/Q25.values.ts')
  })
})
