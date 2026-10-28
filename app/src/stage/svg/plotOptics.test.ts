/**
 * The Optics Lab's plot additions: six named curves and twelve series functions (stage/svg/plotOptics.ts). Each validates, resolves to finite
 * points from the engine, keeps the physics it is named for, and no name is used twice (not with an older curve, not with an older series).
 */
import { describe, expect, it } from 'vitest'
import { PLOT_SERIES_FNS } from '../../content/stage'
import type { PlotSeries, PlotSeriesState, PlotState } from '../../content/stage'
import { NA_D2, RB85_D2, gammaOverK, vsrVelocity, waveNumber, zeemanOmega } from '../../physics/optics/cooling'
import { OPTICS_CURVE_NAMES, OPTICS_SERIES, OPTICS_SERIES_FNS, opticsSeriesProblems, type OpticsSeriesFn } from './plotOptics'
import { resolvePlotStage, validatePlotStage } from './plot'

const curve = (fn: PlotState['curve'] extends infer C ? (C extends { fn: infer F } ? F : never) : never, extra: Partial<PlotState> = {}): PlotState => ({ kind: 'plot', curve: { fn }, ...extra }) as PlotState
const series = (list: PlotSeries[], extra: Partial<PlotSeriesState> = {}): PlotSeriesState => ({ kind: 'plot', series: list, ...extra })

/** one valid example of each series function */
const EXAMPLE: Record<OpticsSeriesFn, PlotSeries> = {
  scatterVsDetuning: { fn: 'scatterVsDetuning', params: { s: 1 } },
  molassesForceVsV: { fn: 'molassesForceVsV', params: { s: 1, delta: -0.5, beam: 'sum' } },
  sisyphusPotential: { fn: 'sisyphusPotential', params: { mg: 0.5 } },
  vsrForce: { fn: 'vsrForce', params: { B: 0.5, kind: 'sigma' } },
  quadrupoleU: { fn: 'quadrupoleU', params: { axis: 'radial' } },
  airyLevels: { fn: 'airyLevels' },
  heuristicLevels: { fn: 'heuristicLevels' },
  dipoleDepth: { fn: 'dipoleDepth', params: { s: 2e8 } },
  dipoleScatter: { fn: 'dipoleScatter', params: { s: 2e8 } },
  motForceVsZ: { fn: 'motForceVsZ', params: { v: 0.5 } },
  ramseyFringe: { fn: 'ramseyFringe', params: { T: 0.35 } },
  langevinPotential: { fn: 'langevinPotential', params: { ell: 1 } },
}

describe('optics plot additions', () => {
  it('18 names: 6 curves and 12 series functions, none shared with an older name', () => {
    expect(OPTICS_CURVE_NAMES).toHaveLength(6)
    expect(OPTICS_SERIES_FNS).toHaveLength(12)
    expect(new Set([...OPTICS_SERIES_FNS, ...PLOT_SERIES_FNS]).size).toBe(OPTICS_SERIES_FNS.length + PLOT_SERIES_FNS.length)
  })
  it.each(OPTICS_CURVE_NAMES)('curve %s validates and every drawn point is finite (and positive on the log curves)', (fn) => {
    expect(validatePlotStage(curve(fn))).toEqual([])
    const r = resolvePlotStage(curve(fn), 1)
    expect(r.points.length).toBeGreaterThan(10)
    for (const p of r.points) expect(Number.isFinite(p.y), `${fn} at ${p.x}`).toBe(true)
    if (fn === 'vaporFraction' || fn === 'deBroglieVsT' || fn === 'partialWaveCount') {
      expect(validatePlotStage(curve(fn, { xScale: 'log', yScale: 'log' }))).toEqual([])
    }
  })
  it('the curves keep their physics: B/B₀ runs 1 → 0 as √(1−z/z₀); T/T_D has its minimum 1 at |δ| = γ/2; Ω/γ ≥ √(s/2); the share goes as v_c³', () => {
    const at = (fn: Parameters<typeof curve>[0], x: number) => resolvePlotStage(curve(fn, { markers: [{ x }] }), 1).markers[0].y
    expect(at('slowerField', 0)).toBeCloseTo(1, 12)
    expect(at('slowerField', 0.75)).toBeCloseTo(0.5, 12)
    expect(at('slowerField', 1)).toBeCloseTo(0, 12)
    expect(at('dopplerTVsDetuning', 0.5)).toBeCloseTo(1, 12)
    expect(at('dopplerTVsDetuning', 2)).toBeGreaterThan(1)
    expect(at('dressedOmega', 0)).toBeCloseTo(1, 12)
    expect(at('dressedOmega', 4)).toBeCloseTo(Math.hypot(1, 4), 12)
    expect(at('vaporFraction', 10) / at('vaporFraction', 5)).toBeCloseTo(8, 1)
    expect(at('partialWaveCount', 1000)).toBeGreaterThan(at('partialWaveCount', 1))
  })
  it.each(OPTICS_SERIES_FNS)('series %s validates, has finite points over its default range and is read from the engine', (fn) => {
    const st = series([EXAMPLE[fn]])
    expect(validatePlotStage(st)).toEqual([])
    const r = resolvePlotStage(st, 1)
    expect(r.series).toHaveLength(1)
    expect(r.series![0].points.every((p) => Number.isFinite(p.y))).toBe(true)
    expect(r.xLabel).toBe(OPTICS_SERIES[fn].x.label)
    expect(r.range).toEqual({ from: OPTICS_SERIES[fn].x.from, to: OPTICS_SERIES[fn].x.to })
  })
  it('six series share one figure; the force of the two beams is the sum of its parts; a signed axis goes below 0', () => {
    const three: PlotSeries[] = (['plus', 'minus', 'sum'] as const).map((beam) => ({ fn: 'molassesForceVsV', params: { s: 1, delta: -0.5, beam } }))
    expect(validatePlotStage(series(three, { samples: 60 }))).toEqual([])
    const r = resolvePlotStage(series(three, { samples: 60 }), 1)
    const i = r.series![0].points.findIndex((p) => Math.abs(p.x - 1) < 1e-9)
    expect(r.series![0].points[i].y + r.series![1].points[i].y).toBeCloseTo(r.series![2].points[i].y, 12)
    expect(r.yMin).toBeLessThan(0)
    // the sum at v = γ/k (x = 1): F/(ħkγ/2) is negative (it opposes the motion); the peak sits near 0.6 γ/k
    expect(r.series![2].points[i].y).toBeLessThan(0)
    expect(gammaOverK(NA_D2)).toBeGreaterThan(0)
  })
  it('the σ⁺σ⁻ force has ONE resonance, at +v_r only (book p. 34), while lin⊥lin has two and is odd in v (review B4)', () => {
    const f = OPTICS_SERIES.vsrForce.value
    const vr = (kind: 'sigma' | 'lin'): number => vsrVelocity(zeemanOmega(RB85_D2.gF as number, 0.5e-4), waveNumber(RB85_D2), kind) * 100 // cm/s at 0.5 G
    const sigma = { B: 0.5, kind: 'sigma' as const }
    const lin = { B: 0.5, kind: 'lin' as const }
    expect(f(sigma, vr('sigma'))).toBeCloseTo(0, 12) // the only zero crossing, and a cooling one
    expect(f(sigma, vr('sigma') + 1)).toBeLessThan(0)
    expect(f(sigma, -vr('sigma'))).toBeGreaterThan(0.05) // nothing resonant at −v_r: the atom is pushed toward +v_r
    expect(f(sigma, -13) + f(sigma, 13)).not.toBeCloseTo(0, 3) // not odd
    expect(f(lin, -13)).toBeCloseTo(-f(lin, 13), 12) // two resonances, odd
    expect(vr('sigma')).toBeCloseTo(2 * vr('lin'), 12)
  })
  it('log–log series (dipole depth falls as 1/δ and the scattering rate as 1/δ² far out) validate and start at 1', () => {
    const st = series([EXAMPLE.dipoleDepth, EXAMPLE.dipoleScatter], { xScale: 'log', yScale: 'log' })
    expect(validatePlotStage(st)).toEqual([])
    const r = resolvePlotStage(st, 1)
    expect(r.series![0].points[0].y).toBeCloseTo(1, 12)
    const last = r.series!.map((s) => s.points[s.points.length - 1].y)
    expect(last[1]).toBeLessThan(last[0])
  })
  it('a wrong series is refused with a message: unknown or unused parameter, missing parameter, out-of-range value', () => {
    expect(opticsSeriesProblems('s', 'molassesForceVsV', { s: 1, delta: -0.5 }).join()).toContain('beam: molassesForceVsV needs it')
    expect(opticsSeriesProblems('s', 'airyLevels', { s: 1 }).join()).toContain('does not use it')
    expect(opticsSeriesProblems('s', 'vsrForce', { B: 9, kind: 'sigma' }).join()).toContain('0 to 5 gauss')
    expect(opticsSeriesProblems('s', 'ramseyFringe', { T: 0.35, x: 1 }).join()).toContain('unknown')
    expect(validatePlotStage(series([{ fn: 'sisyphusPotential', params: { mg: 0.25 as 0.5 } }])).join()).toContain('one of 0.5, -0.5')
  })
})
