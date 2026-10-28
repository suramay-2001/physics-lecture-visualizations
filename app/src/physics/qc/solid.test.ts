/**
 * qc/solid.ts against numpy (pipeline/make_solid_fixtures.py -> __fixtures__/qc-solid.json; the routes are in pipeline/solid_numpy.py: LAPACK's tridiagonal solver and 50-digit mpmath for
 * the charge qubit, scipy's Mathieu characteristic values, `quad` + `brentq` for the Cooper gap equation, Boltzmann sums, `expm` of Kronecker Paulis), plus the cross-checks of
 * P-Q27-story §9.1 (the circuit against the matrices, the two-site rates, the dispersive expansion, Eq. 15.14 with the page's own phase) and properties.
 */
import { describe, expect, it } from 'vitest'
import raw from '../__fixtures__/qc-solid.json?raw'
import { c } from '../complex'
import { type Mat, type Vec, apply, identity, matmul, maxDiff, mscale } from '../linalg'
import { validateCircuit, runCircuit } from './circuit'
import { concurrencePure } from './entangle'
import { eigh } from './cmat'
import { SWAP2 } from './gates'
import {
  MU_0,
  anharmonicity,
  anharmonicityFormula,
  chargeDispersion,
  chargeH,
  commutatorGap,
  cooperBinding,
  cooperBindingExp,
  cooperBindingQuad,
  cooperativity,
  cutGap,
  czCircuitGap,
  czDotCircuit,
  czProduct,
  dispersionKoch,
  dispersionPrinted,
  dispersiveExpansionGap,
  dispersiveShift,
  dispersiveShiftExact,
  dotBox,
  exchangeEnergies,
  exchangeEvolution,
  f01Band,
  f01Spread,
  firstGap,
  fluxQuantum,
  fullGap,
  gapSlope,
  groundTemperature,
  harmonicGap,
  heisenbergEvolution,
  hfOverK,
  iswapGap,
  iswapTime,
  jcLevels,
  josephsonEJ,
  josephsonFreq,
  josephsonI0,
  josephsonL,
  josephsonLcFreq,
  josephsonPhase,
  josephsonRateGaps,
  lcFreq,
  lcImpedance,
  lcOmega,
  lcWavelength,
  leakRatio,
  loopFlux,
  londonLength,
  oscillatorHGap,
  piTime,
  rabiField,
  s1s2Eigen,
  spinDownChance,
  sqrtSwap,
  sqrtSwapCzGap,
  sqrtSwapSquareGap,
  squidFluxFor,
  squidScale,
  swapChance,
  swapPulseGap,
  halfSwapChance,
  thermalGround,
  thermalMicroEv,
  thermalN,
  transmonLadder,
  transmonLevels,
  twoLevelCut,
  twoSiteStep,
  vacuumRabi,
  zeemanField,
  zeemanFreq,
} from './solid'

const FX = JSON.parse(raw)
type Sc = { v: number; tol: number }
const near = (x: number, s: Sc, label = ''): void => {
  expect(Math.abs(x - s.v), `${label}: ${x} vs ${s.v}`).toBeLessThanOrEqual(s.tol)
}
const pairs = (m: [number, number][][]): Mat => m.map((row) => row.map(([re, im]) => c(re, im)))
const L = 3e-9
const C = 0.3e-12
const f = lcFreq(L, C)

describe('the LC circuit (Unit 27.1)', () => {
  it('frequency, wavelength, impedance, rung temperature', () => {
    near(lcOmega(L, C), FX.lc.omega, 'omega')
    near(f, FX.lc.freq, 'f')
    near(lcWavelength(f), FX.lc.wavelength, 'lambda')
    near(lcImpedance(L, C), FX.lc.impedance, 'Z')
    near(hfOverK(f), FX.lc.hfOverK, 'hf/k')
  })
  it('thermal photon number and ground-state chance', () => {
    near(thermalN(f, 300), FX.lc.nbar300, 'n300')
    near(thermalGround(f, 300), FX.lc.p0_300, 'p300')
    near(thermalGround(f, 1), FX.lc.p0_1K, 'p1K')
    near(thermalGround(f, 0.02), FX.lc.p0_20mK, 'p20mK')
    near(thermalN(f, 0.02), FX.lc.nbar20mK, 'n20mK')
    near(groundTemperature(f, 0.99), FX.lc.t99, 't99')
    expect(thermalGround(f, groundTemperature(f, 0.37))).toBeCloseTo(0.37, 13)
  })
  it('the truncated oscillator: [Phi, Q] = i and H = omega (n + 1/2) below the cut-off; the 1 -> 2 pulse is sqrt 2 stronger', () => {
    near(commutatorGap(8), { v: 0, tol: 1e-12 }, 'comm')
    near(oscillatorHGap(L, C), { v: 0, tol: 1e-12 }, 'H')
    near(leakRatio(), FX.lc.leak, 'leak')
    expect(commutatorGap(3)).toBeLessThan(1e-12)
  })
})

describe('Cooper pairs, flux, London (Unit 27.2)', () => {
  it.each(Object.keys(FX.cooper))('binding energy at N_F V = %s: closed form, quadrature and the exponential form', (nv) => {
    const x = Number(nv)
    near(cooperBinding(x, 1), FX.cooper[nv].closed, 'closed')
    near(cooperBindingQuad(x, 1), FX.cooper[nv].exact, 'quadrature')
    near(cooperBindingExp(x, 1), FX.cooper[nv].exp, 'exp')
  })
  it('the closed form and the quadrature solve the same equation to 1e-9', () => {
    for (const nv of [0.15, 0.3, 0.6]) expect(Math.abs(cooperBindingQuad(nv, 2) / cooperBinding(nv, 2) - 1)).toBeLessThan(1e-9)
  })
  it('flux quantum, loop flux, London length, Josephson frequency', () => {
    near(fluxQuantum(), FX.flux.phi0, 'phi0')
    near(loopFlux(1e-3, 1e-12), FX.flux.loop, 'loop')
    near(londonLength(1e28), FX.flux.london, 'london')
    near(josephsonFreq(1), { v: FX.flux.josephsonHzPerV.v, tol: 1 }, 'f_J')
    expect(MU_0).toBeCloseTo(1.25663706212e-6, 15)
  })
})

describe('Josephson relations (Unit 27.3)', () => {
  const i0 = josephsonI0(3e-9)
  it('I_0, L_J, the shifted circuit frequency, E_J, the SQUID scale', () => {
    near(i0, FX.josephson.i0, 'I0')
    for (const t of ['0', '30', '60', '80']) {
      near(josephsonL(i0, (Number(t) * Math.PI) / 180), FX.josephson.lj[t], `Lj ${t}`)
      near(josephsonLcFreq(i0, C, (Number(t) * Math.PI) / 180), FX.josephson.freq[t], `f ${t}`)
    }
    near(josephsonEJ(i0), FX.josephson.ej, 'EJ')
    for (const p of Object.keys(FX.josephson.squid)) near(squidScale(Number(p)), FX.josephson.squid[p], `squid ${p}`)
    expect(squidScale(squidFluxFor(0.25))).toBeCloseTo(0.25, 14)
  })
  it('the tunnelling equations give dn1/dt = 2K sqrt(n1 n2) sin(theta2 - theta1), and theta dot = qV for equal densities', () => {
    const psi = (n1: number, th: number): Vec => [c(Math.sqrt(n1)), c(Math.sqrt(1 - n1) * Math.cos(th), Math.sqrt(1 - n1) * Math.sin(th))]
    expect(josephsonRateGaps(0.7, 0.9, 0.3, psi(0.6, 0.8)).rateGap).toBeLessThan(1e-5)
    const eq = josephsonRateGaps(0.7, 0.9, 0.3, psi(0.5, 0.8))
    expect(eq.rateGap).toBeLessThan(1e-5)
    expect(eq.phaseGap).toBeLessThan(1e-5)
    const v = twoSiteStep(0.7, 0.9, 0.3, psi(0.5, 0.8), 3)
    expect(Math.hypot(v[0].re, v[0].im) ** 2 + Math.hypot(v[1].re, v[1].im) ** 2).toBeCloseTo(1, 13)
    expect(josephsonPhase(1e-6, 1 / josephsonFreq(1e-6))).toBeCloseTo(2 * Math.PI, 12)
  })
})

describe('the charge qubit and the transmon (Unit 27.4)', () => {
  it.each(Object.keys(FX.levels))('lowest five levels at E_J/E_C_ng = %s against LAPACK', (key) => {
    const [r, ng] = key.split('_').map(Number)
    const got = transmonLevels(1, r, ng, 5)
    got.forEach((x, k) => expect(Math.abs(x - FX.levels[key][k]), `${key} level ${k}`).toBeLessThan(2e-11))
  })
  it('the same levels from the dense Jacobi route', () => {
    const dense = eigh(chargeH(1, 10, 0.3, 14)).values.slice(0, 4)
    transmonLevels(1, 10, 0.3, 4, 14).forEach((x, k) => expect(Math.abs(x - dense[k])).toBeLessThan(1e-11))
  })
  it.each(Object.keys(FX.mathieu))('levels against the Mathieu characteristic values a_nu(q), q = -2E_J/E_C (%s)', (key) => {
    const [r, ng] = key.split('_').map(Number)
    const got = transmonLevels(1, r, ng, 4)
    got.forEach((x, k) => expect(Math.abs(x - FX.mathieu[key][k]), `${key} level ${k}`).toBeLessThan(1e-8))
  })
  it('the two-level cut: sigma_z coefficient is -E_C(n_g - 1/2), gap 2U, slopes', () => {
    const cut = twoLevelCut(1, 0.2, 0.3)
    near(cut.zco, FX.cut.zco, 'zco')
    expect(cut.zco).toBeGreaterThan(0)
    near(cut.xco, FX.cut.xco, 'xco')
    near(cut.U, FX.cut.U, 'U')
    near(fullGap(1, 0.2, 0.3), FX.cut.gapFull, 'full gap')
    near(fullGap(1, 0.2, 0.5), FX.cut.gapDegenerate, 'degenerate gap')
    near(cutGap(1, 0.2, 0.5), { v: 0.2, tol: 1e-14 }, 'cut at 1/2 is E_J')
    near(gapSlope(1, 0.2, 0.5), FX.cut.slopeSweet, 'slope at 1/2')
    near(gapSlope(1, 0.2, 0.3), FX.cut.slopeOff, 'slope at 0.3')
  })
  it('the band: f01 swings at ratio 1 and is flat at ratio 20', () => {
    for (const r of Object.keys(FX.spread)) near(f01Spread(Number(r)), FX.spread[r], `spread ${r}`)
    expect(f01Band(1, 0.5)).toBe(1)
    expect(f01Band(1, 0.25)).toBeCloseTo(f01Band(1, 0.75), 12)
  })
  it('charge dispersion against 50-digit mpmath, and the printed and corrected formulas', () => {
    for (const r of Object.keys(FX.dispersion)) near(chargeDispersion(Number(r)), FX.dispersion[r], `eps0 r=${r}`)
    for (const r of Object.keys(FX.dispersionFormulas)) {
      near(dispersionPrinted(Number(r)), FX.dispersionFormulas[r].printed, `printed ${r}`)
      near(dispersionKoch(Number(r)), FX.dispersionFormulas[r].koch, `koch ${r}`)
    }
    expect(dispersionKoch(10) / chargeDispersion(10)).toBeGreaterThan(1.04)
    expect(dispersionKoch(10) / chargeDispersion(10)).toBeLessThan(1.06)
    expect(dispersionPrinted(10) / chargeDispersion(10)).toBeGreaterThan(1e5)
  })
  it('anharmonicity, the ladder and the harmonic estimate', () => {
    for (const r of Object.keys(FX.anharmonicity)) near(anharmonicity(Number(r)), FX.anharmonicity[r], `alpha ${r}`)
    for (const r of Object.keys(FX.ladder)) transmonLadder(Number(r)).forEach((x, k) => expect(Math.abs(x - FX.ladder[r][k]), `ladder ${r}.${k}`).toBeLessThan(1e-10))
    expect(anharmonicityFormula(20)).toBeCloseTo(-1 / Math.sqrt(640), 14)
    expect(harmonicGap(20)).toBeCloseTo(Math.sqrt(40), 14)
    expect(firstGap(20)).toBeLessThan(harmonicGap(20))
    expect(anharmonicity(1)).toBeGreaterThan(0)
  })
})

describe('circuit QED (Unit 27.5)', () => {
  it('the Jaynes-Cummings blocks, the vacuum Rabi splitting and the dispersive expansion', () => {
    for (const key of Object.keys(FX.cqed.jc)) {
      const [d, n] = key.split('_').map(Number)
      jcLevels(d, 10, n).forEach((x, k) => expect(Math.abs(x - FX.cqed.jc[key][k]), key).toBeLessThan(1e-12))
    }
    for (const n of [0, 1, 2, 3, 4]) expect(vacuumRabi(10, n)).toBeCloseTo(20 * Math.sqrt(n + 1), 12)
    expect(dispersiveShiftExact(10, 100)).toBeCloseTo((Math.sqrt(10400) - 100) / 2, 12)
    expect(dispersiveExpansionGap(10, 100, 0)).toBeLessThan(1e-2)
    expect(dispersiveExpansionGap(10, 1000, 0)).toBeLessThan(dispersiveExpansionGap(10, 100, 0) / 900)
  })
  it('cooperativity, shift and the iSWAP time', () => {
    const g = 2 * Math.PI * 1e7
    near(cooperativity(g, 2 * Math.PI * 1e3, 1 / 100e-6), FX.cqed.coop, 'cooperativity')
    expect(dispersiveShift(g, 2 * Math.PI * 1e8)).toBeCloseTo(2 * Math.PI * 1e6, 3)
    expect(iswapTime(g, 2 * Math.PI * 1e8)).toBeCloseTo(250e-9, 18)
    expect(iswapTime(g, 2 * Math.PI * 2e8)).toBeCloseTo(500e-9, 18)
  })
  it('the exchange evolution against expm, the iSWAP matrix and the swap chances', () => {
    expect(maxDiff(exchangeEvolution(Math.PI / 2), pairs(FX.cqed.exchange))).toBeLessThan(1e-13)
    expect(iswapGap()).toBeLessThan(1e-13)
    for (const t of Object.keys(FX.cqed.swap)) near(swapChance(Number(t)), FX.cqed.swap[t], `swap ${t}`)
    expect(swapChance(Math.PI / 4)).toBeCloseTo(0.5, 13)
  })
})

describe('the spin qubit and the dot (Unit 27.6)', () => {
  it('Zeeman frequency, temperature, thermal chances, Rabi field and pi time', () => {
    near(zeemanFreq(0.1), FX.spin.freq01, 'f 0.1 T')
    near(zeemanFreq(1.4), FX.spin.freq14, 'f 1.4 T')
    near(hfOverK(zeemanFreq(0.1)), FX.spin.hfOverK, 'hf/k')
    near(spinDownChance(zeemanFreq(0.1), 0.1), FX.spin.down100mK, 'down 100 mK')
    near(spinDownChance(zeemanFreq(0.1), 0.02), FX.spin.down20mK, 'down 20 mK')
    near(rabiField(2 * Math.PI * 1e7), FX.spin.rabiField, 'B_x')
    near(piTime(2 * Math.PI * 1e7), FX.spin.piTime, 'pi time')
    near(zeemanField(5.305164769729844e9), FX.spin.fieldFor5GHz, 'field for 5.3 GHz')
    expect(zeemanFreq(zeemanField(3e9) * 1)).toBeCloseTo(zeemanFreq(zeemanField(3e9)), 3)
  })
  it('s1.s2 has eigenvalues -3/4 and 1/4 (three times); the singlet is D + K and the triplet D - K', () => {
    s1s2Eigen().forEach((x, k) => expect(Math.abs(x - FX.exchange.s1s2Eigen[k])).toBeLessThan(1e-14))
    const e = exchangeEnergies(1, 0.1)
    expect(e.singlet).toBeCloseTo(1.1, 14)
    expect(e.triplet).toBeCloseTo(0.9, 14)
  })
  it('the pulses: full = e^{i pi/4} SWAP, half = sqrt SWAP with the phase e^{i pi/8}, against expm', () => {
    expect(maxDiff(heisenbergEvolution(Math.PI), pairs(FX.exchange.swapPulse))).toBeLessThan(1e-13)
    expect(maxDiff(sqrtSwap(), pairs(FX.exchange.sqrtSwap))).toBeLessThan(1e-13)
    expect(swapPulseGap()).toBeLessThan(1e-13)
    expect(sqrtSwapSquareGap()).toBeLessThan(1e-13)
    expect(halfSwapChance()).toBeCloseTo(0.5, 13)
    const S = sqrtSwap()
    expect(S[0][0].re).toBeCloseTo(Math.cos(Math.PI / 8), 13)
    expect(S[0][0].im).toBeCloseTo(Math.sin(Math.PI / 8), 13)
    expect(maxDiff(matmul(S, S), mscale(SWAP2, c(Math.cos(Math.PI / 4), Math.sin(Math.PI / 4))))).toBeLessThan(1e-13)
  })
  it('Eq. 15.14 holds exactly with the page\'s own sqrt SWAP phase, and the drawn circuit makes |++> a maximally entangled state', () => {
    expect(sqrtSwapCzGap()).toBeLessThan(1e-13)
    expect(maxDiff(czProduct(), pairs(FX.exchange.czProduct))).toBeLessThan(1e-13)
    expect(czCircuitGap()).toBeLessThan(1e-13)
    expect(validateCircuit(czDotCircuit()).ok).toBe(true)
    const run = runCircuit(czDotCircuit())
    expect(concurrencePure(run.states.at(-1)!)).toBeCloseTo(1, 12)
    expect(concurrencePure(run.states[1])).toBeCloseTo(0, 12)
    const cz = apply(czProduct(), run.states[1])
    expect(cz.length).toBe(4)
    expect(identity(4).length).toBe(4)
  })
  it('the dot as a box', () => {
    const b = dotBox(100e-9, 0.067)
    near(b.E1meV, FX.dot.E1meV, 'E1')
    near(b.gapMeV, FX.dot.gapMeV, 'gap')
    near(b.gapK, FX.dot.gapK, 'gap in kelvin')
    expect(b.gapMeV).toBeCloseTo(3 * b.E1meV, 12)
    expect(thermalMicroEv(0.1)).toBeCloseTo(8.617333262, 8)
  })
})
