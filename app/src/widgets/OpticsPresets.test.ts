/**
 * The twelve Optics Lab presets (widgets/opticsBench/presets.ts): each is registered and valid, the three that need two vertical axes have
 * one, and the default readouts of each equal what the engine says for the page's stated numbers (so a "Try it" line that names a preset
 * describes the picture that opens).
 */
import { describe, expect, it } from 'vitest'
import { HBAR } from '../physics/constants'
import * as E from '../physics/optics/cooling'
import * as C from '../physics/optics/collisions'
import { defaultParams, OPTICS_PRESETS, type OpticsPreset } from './opticsBench/presets'
import { opticsPresetProblems } from './opticsBench/validate'

const IDS = ['slower-force', 'zeeman-slower', 'molasses-force', 'doppler-limit', 'sisyphus-hills', 'vsr-force', 'quadrupole-orbit', 'airy-levels', 'dipole-well', 'mot-force', 'ramsey-fountain', 'matter-wave-onset'] as const
const readout = (id: string, label: string): number => {
  const p: OpticsPreset = OPTICS_PRESETS[id]
  const r = p.readouts(defaultParams(p)).find((x) => x.label.startsWith(label))
  if (!r) throw new Error(`${id}: no readout "${label}"`)
  return r.value
}

describe('the 12 optics presets', () => {
  it.each(IDS)('%s is registered, valid, and has at most four curves', (id) => {
    expect(OPTICS_PRESETS[id]).toBeDefined()
    expect(opticsPresetProblems(id, OPTICS_PRESETS[id])).toEqual([])
    expect(OPTICS_PRESETS[id].curves(defaultParams(OPTICS_PRESETS[id])).length).toBeLessThanOrEqual(4)
  })
  it('the demo preset `lorentzian` is still there (the platform tests use it), and the three presets that read two quantities have a right-hand axis', () => {
    expect(OPTICS_PRESETS.lorentzian).toBeDefined()
    for (const id of ['zeeman-slower', 'dipole-well', 'matter-wave-onset']) {
      expect(OPTICS_PRESETS[id].y2, id).toBeDefined()
      expect(OPTICS_PRESETS[id].curves(defaultParams(OPTICS_PRESETS[id])).some((c) => c.axis === 'right'), id).toBe(true)
    }
    for (const id of IDS.filter((x) => !['zeeman-slower', 'dipole-well', 'matter-wave-onset'].includes(x))) expect(OPTICS_PRESETS[id].y2, id).toBeUndefined()
  })
  it('O1: at s = 1 and δ = −3γ the push peaks at half the maximum deceleration and the Zeeman slower for 880 m/s at η = ½ is 0.85 m long with 1,070 G at its entry', () => {
    expect(readout('slower-force', 'Peak deceleration') / E.maxAcceleration(E.NA_D2) / 1e-3).toBeCloseTo(0.5, 6)
    const sl = E.zeemanSlower(E.NA_D2, 880, 0.5)
    expect(readout('zeeman-slower', 'Length')).toBeCloseTo(sl.z0, 12)
    expect(readout('zeeman-slower', 'Entry field') / 1e4).toBeCloseTo(sl.B0, 3)
    expect(readout('zeeman-slower', 'Chirp') * 1e12).toBeCloseTo(E.chirpRate(E.NA_D2, 0.5), 0)
  })
  it('O2: the molasses friction at s = 1, δ = −γ/2 is 4/9 ħk²; the best detuning of the temperature curve is −γ/2', () => {
    expect(readout('molasses-force', 'Friction')).toBeCloseTo(4 / 9, 12)
    expect(readout('molasses-force', 'Capture')).toBeCloseTo(E.captureVelocity(E.NA_D2), 12)
    expect(readout('doppler-limit', 'Best detuning')).toBeCloseTo(-0.5, 12)
  })
  it('O3: U₁ for ⁸⁷Rb at δ = −4γ, s = ½ is −17.9 µK, the hill is two thirds of it, and the friction is 8 times the Doppler maximum', () => {
    expect(readout('sisyphus-hills', 'Light shift U₁')).toBeCloseTo(-17.9, 1)
    expect(readout('sisyphus-hills', 'Hill height')).toBeCloseTo((2 / 3) * 17.9, 1)
    expect(readout('sisyphus-hills', 'Friction over')).toBeCloseTo(8, 10)
    expect(readout('vsr-force', 'Resonance speed v_r, σ⁺σ⁻') / readout('vsr-force', 'Resonance speed v_r, lin⊥lin')).toBeCloseTo(2, 12)
  })
  it('O4: a = 243 m/s² for A = 1 T/m, n = 5.6 million at ρ = 1 cm, and the levels rise faster than the n^(2/3) rule between the first two', () => {
    expect(readout('quadrupole-orbit', 'Acceleration')).toBeCloseTo(242.9, 0)
    expect(readout('quadrupole-orbit', 'Orbit number') / 1e6).toBeCloseTo(5.64, 2)
    expect(readout('airy-levels', 'E₂/E₁ over')).toBeGreaterThan(1)
  })
  it('O5: the dipole depth at s = 10^8.3, δ = 10^6 γ is 11.7 mK; the MOT is overdamped; the half-size is ħ|δ|/μ′A', () => {
    expect(readout('dipole-well', 'Depth')).toBeCloseTo(11.7, 0)
    expect(readout('mot-force', 'Damping ratio')).toBeGreaterThan(1)
    expect(readout('mot-force', 'Cloud half-size')).toBeCloseTo(4.33, 2)
  })
  it('O6: a 15 cm fountain has T = 0.350 s and a 1.43 Hz fringe, 58 times narrower than a thermal beam; Na with C₆ = 1556 au has T_Q = 0.68 mK', () => {
    expect(readout('ramsey-fountain', 'Time between')).toBeCloseTo(C.fountainTime(0.15), 12)
    expect(readout('ramsey-fountain', 'Width ratio')).toBeCloseTo(C.ramseyWidth(0.006) / C.ramseyWidth(C.fountainTime(0.15)), 6)
    expect(readout('matter-wave-onset', 'Onset temperature') / 1e3).toBeCloseTo(0.677, 2)
    expect(HBAR).toBeGreaterThan(0)
  })
})
