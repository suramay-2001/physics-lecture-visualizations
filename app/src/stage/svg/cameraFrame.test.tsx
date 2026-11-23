/**
 * `camera-frame` (SVG; GANDALF platform G2, P-optics-experiment-track §7 and P-B5-story §9.2): one simulated grey-level frame. Content writes only inputs; the resolver takes every grey
 * level from physics/optics/imaging.ts. These tests check the registration, that the resolved frame equals direct engine calls (and is the same for the same seed), the panels (photons,
 * counts, occupancy, weights, Wiener), the validation messages (unknown fields refused by name), interpolation, the readout text, and that the one scene keeps its cells inside the box
 * (all modes and slots) and draws no NaN.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { fidelityOf } from '../../content/fidelity'
import type { CameraFrameState } from '../../content/stage'
import { KIND_RENDER, PASSPORT, STAGE_KINDS_709, passportOf } from '../../content/stage'
import { ANCHORS, SHOTS } from '../../content/stageVocab'
import { cameraFrame, filterWeights, frameMeans, psfShare, randomBits, sitesFromBits } from '../../physics/optics/imaging'
import { FIGURE_KINDS, FigureFor } from '../figures/FigureFor'
import { interpolate } from '../interp'
import { resolve, validateStage } from '../resolve'
import { svgKindDef } from '../svgKinds'
import type { ResolvedCameraFrame } from '../types'
import { CameraFrameScene, cameraFrameLayout } from './CameraFrameScene'
import { cameraFrameReadouts } from './cameraFrame'
import './kinds'

const S = (o: Partial<CameraFrameState> = {}): CameraFrameState => ({ kind: 'camera-frame', rows: 6, cols: 6, occupancy: `${'0'.repeat(16)}1${'0'.repeat(19)}`, photons: 30, psf: 0.8, background: 0.3, ...o })
const R = (st: CameraFrameState) => resolve(st, 1) as ResolvedCameraFrame
const problems = (st: unknown): string[] => validateStage(st as CameraFrameState)

describe('camera-frame: the SVG route, the passport and the vocabulary', () => {
  it('is an SVG kind registered by the lazy module, with its own passport, drawer, shots and anchors', () => {
    expect(KIND_RENDER['camera-frame']).toBe('svg')
    expect(STAGE_KINDS_709).toContain('camera-frame')
    expect(FIGURE_KINDS).toContain('camera-frame')
    expect(svgKindDef('camera-frame')!.print).toEqual({ w: 320, h: 300 })
    expect(PASSPORT['camera-frame']).toMatchObject({ title: 'CAMERA FRAME · counts per pixel · simulated', fidelityKey: 'camera-frame' })
    expect(passportOf(S())).toBe(PASSPORT['camera-frame'])
    const f = fidelityOf('camera-frame')
    expect(f.exact.map((n) => n.id)).toEqual(['camera-frame-cells'])
    expect(f.schematic.map((n) => n.id)).toEqual(['camera-frame-weights'])
    expect(f.misleading.map((n) => n.id)).toEqual(['camera-frame-draw'])
    expect(SHOTS['camera-frame']).toEqual(['CF-FRAME'])
    expect(ANCHORS['camera-frame']).toEqual(['cell', 'roi', 'atom', 'weights'])
  })
})

describe('camera-frame: the resolved grey levels are the engine’s', () => {
  it('photons are the engine’s means: the atom’s photons times its PSF share per pixel plus the background; the frame holds the atom’s photons less the tail outside', () => {
    const r = R(S({ show: 'photons' }))
    expect(r.sites).toEqual([{ r: 2, c: 4 }])
    const want = frameMeans({ rows: 6, cols: 6, sites: [{ r: 2, c: 4 }], photons: 30, psf: 0.8, background: 0.3 })
    r.panels[0].values.forEach((v, i) => expect(v).toBeCloseTo(want[i], 12))
    expect(r.panels[0].values[2 * 6 + 4]).toBeCloseTo(0.3 + 30 * psfShare(2, 2, 0.8) * psfShare(4, 4, 0.8), 12)
    expect(r.panels[0].lo).toBe(0)
    expect(r.panels[0].hi).toBeCloseTo(Math.max(...want), 12)
  })
  it('counts are one seeded draw: the same seed gives the same frame, another seed another; noise none draws the means', () => {
    const st = S({ noise: 'poisson', seed: 7 })
    const a = R(st)
    expect(a.panels[0].show).toBe('counts')
    expect(R(st).panels[0].values).toEqual(a.panels[0].values)
    expect(R({ ...st, seed: 8 }).panels[0].values).not.toEqual(a.panels[0].values)
    const f = cameraFrame({ rows: 6, cols: 6, sites: [{ r: 2, c: 4 }], photons: 30, psf: 0.8, background: 0.3, noise: 'poisson', seed: 7 })
    expect(a.panels[0].values).toEqual(f.counts)
    expect(R(S({ noise: 'none' })).panels[0].show).toBe('photons')
    expect(R(S({ noise: 'none', show: 'counts' })).panels[0].values).toEqual(R(S({ show: 'photons' })).panels[0].values)
  })
  it('EMCCD counts carry the gain: the unit says counts, and a bright pixel is far above the Poisson photon count', () => {
    const r = R(S({ noise: 'emccd', gain: 300, sigma: 40, seed: 3, photons: 30 }))
    expect(r.panels[0].unit).toBe('counts per pixel')
    expect(Math.max(...r.panels[0].values)).toBeGreaterThan(300)
  })
  it('occupancy from a string, from sites, and from a seeded random filling; the occupancy panel marks the atoms', () => {
    expect(R(S()).sites).toEqual(sitesFromBits(6, 6, S().occupancy as string))
    const sites = R({ kind: 'camera-frame', rows: 5, cols: 5, sites: [[0, 0], [4, 3]], show: 'occupancy' })
    expect(sites.sites).toEqual([{ r: 0, c: 0 }, { r: 4, c: 3 }])
    expect(sites.panels[0].values.filter((v) => v === 1)).toHaveLength(2)
    expect(sites.panels[0].values[4 * 5 + 3]).toBe(1)
    const rnd = R({ kind: 'camera-frame', rows: 6, cols: 6, occupancy: { p: 0.5, seed: 11 }, show: 'truth' })
    expect(rnd.sites).toEqual(sitesFromBits(6, 6, randomBits(6, 6, 0.5, 11)))
    expect(rnd.panels[0].show).toBe('occupancy')
  })
  it('the ROI sits around the first atom, clamped inside the frame, and the expected photons in it come from the means', () => {
    const r = R(S({ roi: true, readouts: ['atoms', 'roi'] }))
    expect(r.roi).toEqual({ r0: 1, c0: 3, size: 3 })
    const m = frameMeans({ rows: 6, cols: 6, sites: [{ r: 2, c: 4 }], photons: 30, psf: 0.8, background: 0.3 })
    let sum = 0
    for (let i = 1; i < 4; i++) for (let j = 3; j < 6; j++) sum += m[i * 6 + j]
    expect(r.roiMean).toBeCloseTo(sum, 12)
    const corner = R({ kind: 'camera-frame', rows: 6, cols: 6, sites: [[0, 5]], roi: { size: 5 } })
    expect(corner.roi).toEqual({ r0: 0, c0: 1, size: 5 })
  })
  it('weights panels hold a filter over the ROI only: llr is ln(1 + s share / b), gauss the PSF share, square all ones, centre one pixel', () => {
    const panel = (filter: 'square' | 'gauss' | 'llr' | 'centre') => R(S({ roi: { size: 3 }, panel: [{ show: 'weights', filter }] })).panels[0]
    const l = panel('llr')
    const w = filterWeights('llr', 3, 0.8, 30, 0.3)
    expect(l.values[2 * 6 + 4]).toBeCloseTo(w[4], 12)
    expect(l.values[0]).toBe(0)
    expect(l.title).toBe('weights · llr')
    expect(panel('square').values.filter((v) => v === 1)).toHaveLength(9)
    expect(panel('centre').values.filter((v) => v === 1)).toHaveLength(1)
    expect(panel('gauss').values[2 * 6 + 4]).toBeCloseTo(psfShare(1, 1, 0.8) ** 2, 12)
  })
  it('Wiener on: the denoised panel has less pixel-to-pixel variance than the counts it came from, and the mean is kept', () => {
    const r = R(S({ noise: 'poisson', seed: 5, denoise: 'wiener', photons: 40, background: 2, panel: [{ show: 'counts' }, { show: 'denoised' }] }))
    expect(r.panels.map((p) => p.show)).toEqual(['counts', 'denoised'])
    const v = (a: number[]) => {
      const m = a.reduce((x, y) => x + y, 0) / a.length
      return a.reduce((x, y) => x + (y - m) ** 2, 0) / a.length
    }
    const mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length
    expect(mean(r.panels[1].values)).toBeCloseTo(mean(r.panels[0].values), 9)
    expect(v(r.panels[1].values)).toBeLessThan(v(r.panels[0].values))
  })
})

describe('camera-frame: validation names the problem', () => {
  it('accepts the plan’s shapes', () => {
    for (const st of [S(), S({ roi: true, show: 'photons' }), S({ noise: 'emccd', gain: 300, sigma: 40 }), S({ denoise: 'wiener', noise: 'poisson', panel: [{ show: 'counts' }, { show: 'denoised' }], panels: 2 })]) expect(problems(st), JSON.stringify(st)).toEqual([])
    expect(problems({ kind: 'camera-frame', rows: 12, cols: 12, sites: [[11, 11]], roi: { size: 5 }, panel: [{ show: 'photons' }, { show: 'weights', filter: 'llr' }, { show: 'truth' }], background: 0.5 })).toEqual([])
  })
  it('refuses an unknown field by name, a grid out of range, and both occupancy and sites', () => {
    expect(problems({ ...S(), crosstalk: 0.1 }).join()).toContain('unknown field "crosstalk"')
    expect(problems(S({ rows: 13 })).join()).toContain('rows')
    expect(problems(S({ cols: 0 })).join()).toContain('cols')
    expect(problems(S({ sites: [[0, 0]] })).join()).toContain('occupancy or sites')
    expect(problems(S({ occupancy: '0101' })).join()).toContain('a string of 36 bits')
    expect(problems(S({ occupancy: { p: 2, seed: 1 } })).join()).toContain('occupancy.p')
    expect(problems({ kind: 'camera-frame', rows: 4, cols: 4, sites: [[4, 0]] }).join()).toContain('sites[0]')
  })
  it('range-checks the optics inputs and ties the EMCCD fields to the emccd noise', () => {
    expect(problems(S({ photons: 300 })).join()).toContain('photons')
    expect(problems(S({ psf: 0.1 })).join()).toContain('psf')
    expect(problems(S({ background: 9 })).join()).toContain('background')
    expect(problems(S({ noise: 'emccd' })).join()).toContain('needs a gain')
    expect(problems(S({ gain: 100 })).join()).toContain("only with noise 'emccd'")
    expect(problems(S({ noise: 'loud' as 'none' })).join()).toContain('noise')
    expect(problems(S({ seed: 1.5 })).join()).toContain('seed')
  })
  it('keeps the panels honest: weights need an ROI and a filter, llr a background, denoised the Wiener switch, a filter only goes with weights, show or panel not both', () => {
    expect(problems(S({ panel: [{ show: 'weights', filter: 'gauss' }] })).join()).toContain('region of interest')
    expect(problems(S({ roi: true, panel: [{ show: 'weights' }] })).join()).toContain('need a filter')
    expect(problems(S({ roi: true, background: 0, panel: [{ show: 'weights', filter: 'llr' }] })).join()).toContain('background above 0')
    expect(problems(S({ show: 'denoised' })).join()).toContain("denoise: 'wiener'")
    expect(problems(S({ panel: [{ show: 'counts', filter: 'gauss' }] })).join()).toContain('only goes with weights')
    expect(problems(S({ show: 'counts', panel: [{ show: 'counts' }] })).join()).toContain('show or panel')
    expect(problems(S({ panel: [{ show: 'photons' }, { show: 'counts' }, { show: 'truth' }, { show: 'photons' }] })).join()).toContain('one to 3 panels')
    expect(problems(S({ panel: [{ show: 'photons' }], panels: 2 })).join()).toContain('same number')
    expect(problems(S({ roi: { size: 7 } })).join()).toContain('roi.size')
    expect(problems(S({ occupancy: '0'.repeat(36), roi: true })).join()).toContain('needs an atom')
    expect(problems(S({ readouts: ['roi'] })).join()).toContain("'roi' needs")
    expect(problems(S({ shot: 'CF-BOGUS' as 'CF-FRAME' })).length).toBeGreaterThan(0)
  })
})

describe('camera-frame: interpolation and text', () => {
  it('a frame is one draw: a change of frame switches at the half-way point; the ends are the resolved states themselves', () => {
    const a = R(S({ noise: 'poisson', seed: 1 }))
    const b = R(S({ noise: 'poisson', seed: 2 }))
    expect(interpolate(a, b, 0)).toBe(a)
    expect(interpolate(a, b, 1)).toBe(b)
    expect(interpolate(a, b, 0.25)).toBe(a)
    expect(interpolate(a, b, 0.75)).toBe(b)
  })
  it('writes the readouts the way the page quotes them', () => {
    expect(cameraFrameReadouts(R(S())).map((x) => x.text)).toEqual(['1 atom'])
    const two = R({ kind: 'camera-frame', rows: 4, cols: 4, sites: [[0, 0], [3, 3]], roi: true, readouts: ['atoms', 'roi'] })
    const t = cameraFrameReadouts(two).map((x) => x.text)
    expect(t[0]).toBe('2 atoms')
    expect(t[1]).toMatch(/^ROI 3×3: \d+(\.\d)? photons expected$/)
    expect(cameraFrameReadouts(R(S({ readouts: [] })))).toEqual([])
  })
})

describe('camera-frame: the scene stays in its box and draws no NaN', () => {
  const states: CameraFrameState[] = [
    S(),
    S({ noise: 'poisson', seed: 3, roi: true }),
    S({ rows: 12, cols: 12, occupancy: { p: 0.4, seed: 5 }, noise: 'emccd', gain: 300, sigma: 40 }),
    S({ roi: { size: 3 }, panel: [{ show: 'truth' }, { show: 'counts' }, { show: 'weights', filter: 'llr' }], noise: 'poisson', seed: 2 }),
    S({ rows: 1, cols: 1, occupancy: '1', roi: true }),
    S({ rows: 12, cols: 3, occupancy: '0'.repeat(36), panel: [{ show: 'photons' }, { show: 'counts' }] }),
  ]
  it.each(states.map((st, i) => ({ i, st })))('state $i: every panel inside the box, all modes and slots', ({ st }) => {
    const r = R(st)
    for (const [w, h, own, slot] of [[460, 560, false, null], [460, 560, false, 'top'], [460, 560, false, 'bottom'], [300, 420, false, null], [320, 300, true, null]] as const) {
      const L = cameraFrameLayout(r, w, h, own, slot)
      const P = r.panels.length
      expect(L.cell).toBeGreaterThanOrEqual(3)
      expect(L.x0(0)).toBeGreaterThanOrEqual(0)
      expect(L.x0(P - 1) + L.cell * r.cols).toBeLessThanOrEqual(w + 1e-9)
      expect(L.legendY + 22).toBeLessThanOrEqual(h + 1e-9)
      expect(own ? 16 + 13 * (L.lines.length - 1) : 0).toBeLessThan(L.titleY)
      const html = renderToString(<svg><CameraFrameScene state={r} mode={own ? 'print' : 'stage'} width={w} height={h} slot={slot} /></svg>)
      expect(html).not.toMatch(/NaN|undefined|Infinity/)
      expect(html).toContain('data-kind="camera-frame"')
      expect((html.match(/<rect/g) ?? []).length).toBeLessThanOrEqual(P * (r.rows * r.cols + 10) + 10)
    }
  })
  it('names the cells and the legend, outlines the ROI and rings the atoms (not on the occupancy panel)', () => {
    const html = renderToString(<svg><CameraFrameScene state={R(S({ roi: true, panel: [{ show: 'truth' }, { show: 'photons' }] }))} mode="print" width={320} height={300} /></svg>)
    expect(html).toContain('row 2, column 4: 1 atom')
    expect(html).toContain('data-anchor="roi"')
    expect((html.match(/data-anchor="atom"/g) ?? []).length).toBe(1)
    expect(html).toMatch(/0 to [\d.]+ photons per pixel/)
    expect(html).toContain('1 atom')
  })
  it('the print figure is the stage picture: FigureFor draws it in print ink', () => {
    const html = renderToString(<FigureFor layout={S({ noise: 'poisson', seed: 4 })} number="O11.1" caption="one simulated frame" />)
    expect(html).toContain('data-kind="camera-frame"')
    expect(html).toContain('1 atom')
  })
})
