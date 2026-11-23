/**
 * The nine experiment-track presets (widgets/opticsBench/presetsTrack.ts, pages O7 to O11): each is registered and valid, and the DEFAULT readouts of each equal
 * what the engine says for the numbers the page's "Try it" paragraph names (the page values V of O7.values.ts … O11.values.ts, which the numpy twins check), so
 * the picture that opens is the one the paragraph describes.
 */
import { describe, expect, it } from 'vitest'
import { V as V7 } from '../content/qc709/optics/O7.values'
import { V as V8 } from '../content/qc709/optics/O8.values'
import { V as V9 } from '../content/qc709/optics/O9.values'
import { V as V10 } from '../content/qc709/optics/O10.values'
import { V as V11 } from '../content/qc709/optics/O11.values'
import { defaultParams, OPTICS_PRESETS, type OpticsPreset } from './opticsBench/presets'
import { opticsPresetProblems } from './opticsBench/validate'

const IDS = ['mot-load', 'pgc-window', 'tweezer-well', 'parity-loading', 'sort-success', 'refill-rounds', 'photon-budget', 'count-histograms', 'exposure-optimum'] as const
const readout = (id: string, label: string, params?: Record<string, number>): number => {
  const p: OpticsPreset = OPTICS_PRESETS[id]
  const r = p.readouts({ ...defaultParams(p), ...params }).find((x) => x.label.startsWith(label))
  if (!r) throw new Error(`${id}: no readout "${label}"`)
  return r.value
}

describe('the 9 experiment-track presets', () => {
  it.each(IDS)('%s is registered, valid, has at most four curves and draws finite points', (id) => {
    expect(OPTICS_PRESETS[id]).toBeDefined()
    expect(opticsPresetProblems(id, OPTICS_PRESETS[id])).toEqual([])
    expect(OPTICS_PRESETS[id].curves(defaultParams(OPTICS_PRESETS[id])).length).toBeLessThanOrEqual(4)
  })
  it('the histogram and the refill curves are staircases; the PGC and the photon budget have a right-hand axis', () => {
    for (const id of ['count-histograms']) expect(OPTICS_PRESETS[id].curves(defaultParams(OPTICS_PRESETS[id])).every((c) => c.step), id).toBe(true)
    expect(OPTICS_PRESETS['refill-rounds'].curves(defaultParams(OPTICS_PRESETS['refill-rounds']))[0].step).toBe(true)
    for (const id of ['pgc-window', 'photon-budget']) expect(OPTICS_PRESETS[id].y2, id).toBeDefined()
  })
  it('O7 Try it: tau 100 ms and 10⁸ captures per second hold 10⁷ atoms; the 95 % time is 3.00 τ; the PGC step at −19.5γ and 1.2 per beam has |U₁| near 7.4 µK and sits 130 times under the Doppler limit', () => {
    expect(readout('mot-load', 'Steady state')).toBeCloseTo(10, 6)
    expect(readout('mot-load', 'That time')).toBeCloseTo(V7.o7Load95, 2) // 3.00 τ to two decimals
    expect(readout('mot-load', 'Time to 95')).toBeCloseTo(100 * Math.log(20), 10)
    expect(readout('mot-load', 'Atoms after one')).toBeCloseTo(10 * (1 - Math.exp(-1)), 12)
    expect(readout('pgc-window', 'Light shift')).toBeGreaterThan(V7.o7U1Pgc * 0.97) // s = 1.2 is a little above 7/6
    expect(readout('pgc-window', 'Light shift')).toBeLessThan(V7.o7U1Pgc * 1.05)
    expect(readout('pgc-window', 'Doppler limit over')).toBeGreaterThan(V7.o7DopplerOverTlim * 0.9)
    expect(readout('pgc-window', 'Doppler limit over')).toBeLessThan(V7.o7DopplerOverTlim * 1.01)
    expect(readout('pgc-window', 'Light shift', { s: 7 / 6 })).toBeCloseTo(V7.o7U1Pgc, 2)
  })
  it('O8 Try it: 1.4 mW in a 1.24 µm waist at 1061 nm is 0.152 mK deep, 25.0 and 4.81 kHz, and the trap light needs 819 s to heat it out', () => {
    expect(readout('tweezer-well', 'Depth')).toBeCloseTo(V8.o8Depth14, 3)
    expect(readout('tweezer-well', 'Radial')).toBeCloseTo(V8.o8FrAt14, 0)
    expect(readout('tweezer-well', 'Axial')).toBeCloseTo(V8.o8FzAt14, 1)
    expect(readout('tweezer-well', 'Thermal rms')).toBeGreaterThan(V8.o8Sigma20 * 0.97) // the preset's own waist is the rounded 1.24 µm
    expect(readout('tweezer-well', 'Heating time')).toBeGreaterThan(V8.o8HeatTime * 0.97)
    expect(readout('tweezer-well', 'Heating time')).toBeLessThan(V8.o8HeatTime * 1.03)
  })
  it('O9 Try it: mean 1 gives 0.4323 against 0.3679 without collisions, the ceiling is one half; 100 atoms at 0.512 need 229 sites; five rounds leave 0.0473 empty', () => {
    expect(readout('parity-loading', 'P(1) with pair')).toBeCloseTo(V9.o9P1Mu1, 4)
    expect(readout('parity-loading', 'Ceiling')).toBeCloseTo(0.5, 12)
    expect(readout('parity-loading', 'Best chance')).toBeCloseTo(V9.o9PoissonMax, 4)
    expect(readout('sort-success', 'Sites for')).toBe(V9.o9Sites100)
    expect(readout('sort-success', 'Sites for', { p: 0.5 })).toBe(V9.o9Sites100p50)
    expect(readout('sort-success', 'Sites for', { M: 50 })).toBe(V9.o9Sites50)
    expect(readout('refill-rounds', 'Empty after five')).toBeCloseTo(V9.o9Empty5, 4)
    expect(readout('refill-rounds', 'Equilibrium')).toBeCloseTo(V9.o9EmptyEq, 4)
    expect(readout('refill-rounds', 'Chance that')).toBeCloseTo(V9.o9AllFilled100, 3)
  })
  it('O10 Try it: s = 2 and δ = −2γ scatter 1.73 × 10⁶ photons a second, five counts at 5 % need 0.0578 ms and 100 photons of recoil heat is read from the gain per photon', () => {
    expect(readout('photon-budget', 'Scattering rate')).toBeCloseTo(V10.o10RExample, 2)
    expect(readout('photon-budget', 'Ideal lens', { NA: 0.65 })).toBeCloseTo(V10.o10CollNa65 * 100, 1)
    expect(readout('photon-budget', 'Time for')).toBeCloseTo(V10.o10TauM5, 3)
    expect(readout('photon-budget', 'Photons scattered', { eta: 0.0096 })).toBeCloseTo(V10.o10NScat5, 0)
  })
  it('O11 Try it: means 9.2 and 0.2 with cutoff 3 misread 0.323 %; the best exposure of the toy is 234 µs at 0.120 %', () => {
    expect(readout('count-histograms', 'Error at this') / 100).toBeCloseTo(V11.o11ExErr, 5)
    expect(readout('count-histograms', 'Bright atom missed') / 100).toBeCloseTo(V11.o11ExEb, 5)
    expect(readout('count-histograms', 'Dark site misread') / 100).toBeCloseTo(V11.o11ExEd, 5)
    expect(readout('count-histograms', 'Best cutoff')).toBe(3)
    expect(readout('exposure-optimum', 'Best exposure')).toBeCloseTo(V11.o11ToyTau, 6)
    expect(readout('exposure-optimum', 'Total error') / 100).toBeCloseTo(V11.o11ToyTotal, 5)
    expect(readout('exposure-optimum', 'Of which misread') / 100).toBeCloseTo(V11.o11ToyMisread, 6)
  })
})
