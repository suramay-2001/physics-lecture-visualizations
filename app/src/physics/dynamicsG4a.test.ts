/**
 * Townsend pass G4a (Lectures 11 and 12): the additions to physics/dynamics.ts and physics/constants.ts against their independent numpy twins
 * (pipeline/claims_448/g4a.py -> __fixtures__/dynamics-g4a.json) and against closed forms.
 */
import { describe, expect, it } from 'vitest'
import twins from './__fixtures__/dynamics-g4a.json'
import {
  ammoniaChances, ammoniaH, ammoniaPeriod, energySpread, interferometerPort, rabiExactProbability, rabiFlipTime, rabiPeak, rabiProbability,
  twoLevelEnergies, twoLevelWeak,
} from './dynamics'
import { C_LIGHT, E_CHARGE, H_PLANCK, M_MUON, larmorG, photonEnergy, photonFrequency } from './constants'
import { vec } from './linalg'

const near = (a: number, b: number, eps = 1e-12) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(eps)

describe('Townsend G4a: the ammonia pair (Eqs. 4.46–4.56, 4.64)', () => {
  it('the nitrogen is above at first, half and half at T/4, below at T/2 and above again at T (twin and closed form sin²(At))', () => {
    twins.ammoniaTimes.forEach((t, i) => {
      const { above, below } = ammoniaChances(2, 1, t)
      near(above, twins.ammoniaAbove[i])
      near(below, twins.ammoniaBelow[i])
      near(below, Math.sin(t) ** 2)
    })
    const T = ammoniaPeriod(1)
    near(T, Math.PI)
    near(ammoniaChances(2, 1, T / 4).above, 0.5)
    near(ammoniaChances(2, 1, T / 2).below, 1)
    near(ammoniaChances(2, 1, T).above, 1)
    near(ammoniaPeriod(0.25), 4 * Math.PI)
  })
  it('the spread of H in |1⟩ is A, whatever E0 is (Eq. 4.64)', () => {
    near(energySpread(ammoniaH(2, 1), vec(1, 0)), 1)
    near(energySpread(ammoniaH(7, 0.4), vec(1, 0)), 0.4)
    near(energySpread(ammoniaH(2, 1), vec(0.6, 0.8)), energySpread(ammoniaH(2, 1), vec(0.6, 0.8)))
  })
  it('the levels in a field are ±√(1 + x²) (twin and closed form); the weak-field form 1 + x²/2 is close below x ≈ 0.3 and 6 percent high at 1', () => {
    twins.twoLevelXs.forEach((x, i) => {
      const [lo, hi] = twoLevelEnergies(x)
      near(lo, twins.twoLevel[i][0])
      near(hi, twins.twoLevel[i][1])
      near(hi, Math.sqrt(1 + x * x))
    })
    expect(twoLevelWeak(0.3) - twoLevelEnergies(0.3)[1]).toBeLessThan(1e-3)
    near(twoLevelWeak(1) / twoLevelEnergies(1)[1] - 1, 0.0607, 1e-4)
  })
})

describe('Townsend G4a: the neutron interferometer (Fig. 4.4, Eq. 4.33)', () => {
  it('port counts (1 ± cos(φ/2))/2 match the twin and add to 1; the fringe repeats at 4π, not 2π', () => {
    twins.portPhis.forEach((phi, i) => {
      near(interferometerPort(phi, 1), twins.portPlus[i])
      near(interferometerPort(phi, -1), twins.portMinus[i])
      near(interferometerPort(phi, 1) + interferometerPort(phi, -1), 1)
    })
    near(interferometerPort(0, 1), 1)
    near(interferometerPort(2 * Math.PI, 1), 0)
    near(interferometerPort(3 * Math.PI, 1), 0.5)
    near(interferometerPort(4 * Math.PI, 1), 1)
  })
})

describe('Townsend G4a: magnetic resonance (Eqs. 4.38–4.45)', () => {
  it('the closed form agrees with the twin (an eigenvalue exponential of the rotating-wave pair) at three detunings', () => {
    twins.rabiCases.forEach((c, i) => near(rabiProbability(c[0], c[1], c[2], c[3]), twins.rabiRwa[i]))
  })
  it('on resonance P = sin²(ω1 t/4): full flip at 2π/ω1, empty again at 4π/ω1', () => {
    const w1 = 0.05
    near(rabiFlipTime(w1), (2 * Math.PI) / w1)
    near(rabiProbability(1, w1, 1, rabiFlipTime(w1)), 1)
    near(rabiProbability(1, w1, 1, 2 * rabiFlipTime(w1)), 0)
    near(rabiProbability(1, w1, 1, 7.3), Math.sin((w1 * 7.3) / 4) ** 2)
  })
  it('the resonance curve is the ceiling of the oscillation: 1, ½ and ⅕ at detunings 0, ω1/2 and ω1', () => {
    near(rabiPeak(0), 1)
    near(rabiPeak(0.5), 0.5)
    near(rabiPeak(1), 0.2)
    near(rabiPeak(20, 30), 0.36)
    let top = 0
    for (let t = 0; t < 40; t += 0.01) top = Math.max(top, rabiProbability(1, 1, 1.5, t))
    expect(top).toBeLessThanOrEqual(rabiPeak(0.5) + 1e-12)
    expect(top).toBeGreaterThan(rabiPeak(0.5) - 1e-3)
  })
  it('integrating Eq. 4.38 as written agrees with the twin integrator and stays within 4e-5 of the rotating-wave flip at ω1/ω0 = 0.05', () => {
    twins.rabiExactCases.forEach((c, i) => near(rabiExactProbability(c[0], c[1], c[2], c[3]), twins.rabiExact[i], 1e-11))
    const exact = rabiExactProbability(1, 0.05, 1, rabiFlipTime(0.05))
    expect(1 - exact).toBeGreaterThan(3.8e-5)
    expect(1 - exact).toBeLessThan(4.0e-5)
  })
})

describe('Townsend G4a: constants', () => {
  it('g = 4π m f/(e B) matches the twin, and the muon mass is the CODATA 2018 value', () => {
    near(larmorG(2.5e6, 0.02, M_MUON), twins.larmorG, 1e-12)
    near(M_MUON, 1.883531627e-28, 1e-37)
  })
  it('a photon of wavelength λ has the frequency c/λ and the energy hc/λ', () => {
    near(photonEnergy(0.03) / E_CHARGE, twins.photonEnergyEv, 1e-16)
    near(photonEnergy(0.0125), H_PLANCK * photonFrequency(0.0125), 1e-30)
    near(photonFrequency(0.0125), C_LIGHT / 0.0125, 1)
  })
})
