/**
 * `wavefunction` (SVG; W-448 L12): a complex function along a line, drawn from physics/wave.ts. Content writes only inputs (the source, how it is
 * moved, which curves, cells, interval and readouts); the resolver takes every sample, scale, moment and chance from the engine. These tests check
 * the resolved curves against direct engine calls and the lecture's numbers, the three sources, the order of boost / shift / time, the cells and the
 * interval, interpolation, the validation limits (including the periodic-box guard), the readout text, and that the one scene packs its panels inside
 * the box and draws all of it with no NaN.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { fidelityOf } from '../../content/fidelity'
import type { WavefunctionState } from '../../content/stage'
import { KIND_RENDER, PASSPORT, WAVEFUNCTION_CELLS, passportOf } from '../../content/stage'
import { ANCHORS, SHOTS } from '../../content/stageVocab'
import { GRID, boost, freeEvolve, interval, meanX, packet, translate } from '../../physics/wave'
import { FigureFor } from '../figures/FigureFor'
import { interpolate } from '../interp'
import { resolve, validateLayout, validateStage } from '../resolve'
import { svgKindDef } from '../svgKinds'
import type { ResolvedWavefunction } from '../types'
import { WAVEFUNCTION_LIMITS, packetReach, wavefunctionInputs, wavefunctionReadouts } from './wavefunction'
import { WavefunctionScene, wavefunctionLayout, wavefunctionPrintSize } from './WavefunctionScene'
import './kinds'

const PK = (x0: number | { from: number; to: number }, sigma: number | { from: number; to: number }, p0?: number): WavefunctionState['source'] => ({ packet: { x0, sigma, ...(p0 === undefined ? {} : { p0 }) } })
const W = (source: WavefunctionState['source'], o: Omit<WavefunctionState, 'kind' | 'source'> = {}): WavefunctionState => ({ kind: 'wavefunction', source, ...o })
const R = (st: WavefunctionState, s = 1) => resolve(st, s) as ResolvedWavefunction
const close = (a: number, b: number, eps = 1e-9) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(eps)
const at = (r: ResolvedWavefunction, x: number) => r.position.x.findIndex((v) => Math.abs(v - x) < 1e-9)

describe('wavefunction: the SVG route, the passport and the vocabulary', () => {
  it('is an SVG kind registered by the lazy module, with its own passport (the hue legend) and drawer', () => {
    expect(KIND_RENDER.wavefunction).toBe('svg')
    expect(svgKindDef('wavefunction')).toBeDefined()
    expect(PASSPORT.wavefunction).toMatchObject({ title: 'WAVEFUNCTION · amplitude along a line', fidelityKey: 'wavefunction', legend: 'phase' })
    expect(PASSPORT.wavefunction.note).toMatch(/every sample is the engine’s/)
    expect(passportOf(W(PK(0, 1)))).toBe(PASSPORT.wavefunction)
    const f = fidelityOf('wavefunction')
    for (const list of Object.values(f)) expect(list.length).toBeGreaterThan(0)
    expect(f.exact.map((n) => n.id)).toEqual(['wavefunction-engine'])
    expect(f.schematic.map((n) => n.id)).toEqual(['wavefunction-scales'])
    expect(f.misleading.map((n) => n.id)).toEqual(['wavefunction-not-a-wave', 'wavefunction-no-delta'])
    expect(SHOTS.wavefunction).toEqual(['W-STD'])
    expect(ANCHORS.wavefunction).toEqual(['psi-re', 'psi-im', 'density', 'phase-band', 'interval', 'cell-bar', 'original', 'xpsi', 'ppsi', 'momentum-panel'])
    expect(svgKindDef('wavefunction')!.print).toEqual({ w: 320, h: 300 })
  })
})

describe('wavefunction: a packet is the engine’s', () => {
  it('σ = 1 at x₀ = 0: the density at 0 is 0.399 per ℓ, the norm 1, Δx = 1, ⟨p⟩ = 0 and Δp = ½, the product ½ ħ; samples equal packet()', () => {
    const r = R(W(PK(0, 1), { readouts: ['norm', 'xmean', 'xspread', 'pmean', 'pspread', 'product', 'peak'] }))
    const j = at(r, 0)
    close(r.position.density[j], 1 / Math.sqrt(2 * Math.PI), 1e-12)
    close(r.stats.norm!, 1)
    close(r.stats.xmean!, 0, 1e-9)
    close(r.stats.xspread!, 1)
    close(r.stats.pmean!, 0, 1e-9)
    close(r.stats.pspread!, 0.5, 1e-8)
    close(r.stats.product!, 0.5, 1e-8)
    close(r.stats.peak!, 0.3989422804, 1e-9)
    const w = packet(GRID, { x0: 0, sigma: 1 })
    r.position.x.forEach((x, k) => {
      const jj = Math.round((x + 32) / GRID.dx)
      close(r.position.re[k], w.re[jj], 1e-15)
      close(r.position.im[k], w.im[jj], 1e-15)
    })
  })
  it('the position window is [−8, 8] by default and the curve has at most 520 samples including both ends', () => {
    const r = R(W(PK(0, 1)))
    expect(r.window).toEqual({ x: [-8, 8], p: [-8, 8] })
    expect(r.position.x[0]).toBe(-8)
    expect(r.position.x[r.position.x.length - 1]).toBe(8)
    expect(r.position.x.length).toBeLessThanOrEqual(520)
    const wide = R(W(PK(0, 1), { window: { x: [-12, 12] } }))
    expect(wide.position.x[0]).toBe(-12)
  })
  it('a shift of 3 moves ⟨x⟩ to 3 and the norm stays 1; the original is the unmoved packet (dashed overlay)', () => {
    const r = R(W(PK(0, 1), { shift: 3, overlay: ['original'], readouts: ['xmean'] }))
    close(r.stats.xmean!, 3, 1e-9)
    close(r.stats.norm!, 1)
    expect(r.original).not.toBeNull()
    close(r.original!.density[at(r, 0)], 1 / Math.sqrt(2 * Math.PI), 1e-12)
    close(r.position.density[at(r, 3)], 1 / Math.sqrt(2 * Math.PI), 1e-9)
    expect(R(W(PK(0, 1), { shift: 3 })).original).toBeNull()
    const direct = translate(packet(GRID, { x0: 0, sigma: 1 }), GRID, 3)
    close(meanX(direct, GRID), 3, 1e-9)
  })
  it('boost then shift then time: the order is the one in the contract (the combined result equals the three engine calls)', () => {
    const r = R(W(PK(0, 1, 1), { boost: 1.5, shift: 2, time: 2 }))
    let w = boost(packet(GRID, { x0: 0, sigma: 1, p0: 1 }), GRID, 1.5)
    w = freeEvolve(translate(w, GRID, 2), GRID, 2)
    r.position.x.forEach((x, k) => {
      const jj = Math.round((x + 32) / GRID.dx)
      close(r.position.re[k], w.re[jj], 1e-9)
      close(r.position.im[k], w.im[jj], 1e-9)
    })
    // the packet moves at p₀ + boost = 2.5: its centre is 2 + 2.5 × 2 = 7
    close(R(W(PK(0, 1, 1), { boost: 1.5, shift: 2, time: 2, readouts: ['xmean', 'pmean'] })).stats.xmean!, 7, 1e-8)
  })
  it('time spreads the packet as σ√(1 + (t/2σ²)²) and keeps Δp: the scale of the picture stays that of the unmoved packet', () => {
    const r = R(W(PK(0, 1, 3), { time: 4 }))
    close(r.stats.xspread!, Math.sqrt(5), 1e-7)
    close(r.stats.pspread!, 0.5, 1e-7)
    close(r.scale.dens, 1 / Math.sqrt(2 * Math.PI), 1e-12)
    expect(Math.max(...r.position.density)).toBeLessThan(0.7 * r.scale.dens)
  })
  it('the momentum panel is φ(p): a Gaussian of width Δp = 1/2σ about p₀, with a phase, and ∫|φ|²dp = 1', () => {
    const r = R(W(PK(0, 1, 3), { panels: ['position', 'momentum'] }))
    expect(r.momentum).not.toBeNull()
    const m = r.momentum!
    expect(m.x[0]).toBeGreaterThanOrEqual(-8 - 1e-9)
    const jMax = m.density.indexOf(Math.max(...m.density))
    close(m.x[jMax], 3, 0.11)
    close(Math.max(...m.density), 1 / (Math.sqrt(2 * Math.PI) * 0.5), 5e-3)
    expect(R(W(PK(0, 1))).momentum).toBeNull()
  })
  it('the overlays are x̂ψ = xψ and p̂ψ = −iψ′ (for the unit packet at x = 1: Im p̂ψ = 0.246, Re = 0; x̂ψ(2) = 1.263 for the packet at 2)', () => {
    const a = R(W(PK(0, 1), { overlay: ['ppsi'] }))
    const j = at(a, 1)
    close(a.ppsi!.re[j], 0, 1e-9)
    close(a.ppsi!.im[j], 0.2460, 5e-4)
    const b = R(W(PK(2, 1), { overlay: ['xpsi'] }))
    close(b.xpsi!.re[at(b, 2)], 1.2634, 5e-4)
    expect(b.scale.amp).toBeGreaterThanOrEqual(1.2634)
    expect(R(W(PK(2, 1))).xpsi).toBeNull()
  })
  it('the cells are n equal chances that add to 1; the middle cell [0, w) holds 0.477 of 8 and 0.0987 of 64; the interval is 0.683 for [−1, 1]', () => {
    const r8 = R(W(PK(0, 1), { cells: 8, readouts: ['cell'] }))
    expect(r8.cells!.n).toBe(8)
    close(r8.cells!.chances.reduce((x, y) => x + y, 0), 1, 1e-9)
    close(r8.stats.cell!.chance, 0.4773, 5e-4)
    close(r8.stats.cell!.width, 2)
    const r64 = R(W(PK(0, 1), { cells: 64, readouts: ['cell'] }))
    close(r64.stats.cell!.chance, 0.0987, 5e-5)
    close(r64.stats.cell!.perLength, 0.395, 5e-4)
    const iv = R(W(PK(0, 1), { interval: [-1, 1], readouts: ['interval'] }))
    close(iv.stats.interval!, 0.682689, 1e-6)
    close(iv.stats.interval!, interval(packet(GRID, { x0: 0, sigma: 1 }), GRID, -1, 1), 1e-12)
    expect(R(W(PK(0, 0.25), { interval: [-0.25, 0.25] })).stats.interval!).toBeCloseTo(0.6827, 3)
  })
})

describe('wavefunction: plane waves are analytic', () => {
  it('a plane wave has a flat density 1, no norm or spread of x, momentum p and wavelength 2π/p (p = 3: 2.09 ℓ)', () => {
    const r = R(W({ plane: { p: 3 } }, { readouts: ['pmean', 'pspread', 'wavelength'] }))
    for (const d of r.position.density) close(d, 1, 1e-12)
    expect(r.stats.norm).toBeNull()
    expect(r.stats.xmean).toBeNull()
    close(r.stats.pmean!, 3)
    close(r.stats.pspread!, 0)
    close(r.stats.wavelength!, (2 * Math.PI) / 3)
    expect(wavefunctionReadouts(r).map((x) => x.text)).toEqual(['⟨p⟩ = 3 ħ/ℓ', 'Δp = 0 ħ/ℓ', 'λ = 2π/p = 2.09 ℓ'])
  })
  it('a shift multiplies by e^{−ipa}, a time by e^{−ip²t/2}, a boost adds to p: analytic phases at x = 0', () => {
    const phase = (r: ResolvedWavefunction) => Math.atan2(r.position.im[at(r, 0)], r.position.re[at(r, 0)])
    close(phase(R(W({ plane: { p: 2 } }, { shift: 0.7 }))), -1.4)
    close(phase(R(W({ plane: { p: 2 } }, { time: 1 }))), -2)
    close(R(W({ plane: { p: 2 } }, { boost: 1, readouts: ['pmean'] })).stats.pmean!, 3)
  })
  it('two waves beat: density 2 where they are in step, 0 half a fringe away (fringe = 2π/(p₂ − p₁)); the momentum panel shows two spikes', () => {
    const r = R(W({ twoWaves: { p1: 2, p2: 4 } }, { panels: ['position', 'momentum'], show: ['density'] }))
    close(r.position.density[at(r, 0)] > 1.99 ? 2 : 0, 2)
    close(r.stats.pmean ?? NaN, 3)
    expect(r.momentumSpikes).toEqual([2, 4])
    expect(r.momentum).toBeNull()
    close(r.scale.dens, 2)
  })
})

describe('wavefunction: interpolation and readouts', () => {
  it('σ, x₀, the shift and the time lerp; the source and panels switch at the half-way point; every output is recomputed', () => {
    const a = R(W(PK(0, 1), { shift: 0 }))
    const b = R(W(PK(2, 0.5), { shift: 4, panels: ['position', 'momentum'] }))
    const m = interpolate(a, b, 0.5) as ResolvedWavefunction
    expect(m.source).toEqual({ kind: 'packet', x0: 1, sigma: 0.75, p0: 0 })
    expect(m.shift).toBe(2)
    expect(m.panels).toEqual(['position', 'momentum'])
    expect((interpolate(a, b, 0.25) as ResolvedWavefunction).panels).toEqual(['position'])
    close(m.stats.xmean!, 3, 1e-8)
    expect(interpolate(a, b, 0)).toBe(a)
    expect(interpolate(a, b, 1)).toBe(b)
    const plane = R(W({ plane: { p: 3 } }))
    expect((interpolate(a, plane, 0.25) as ResolvedWavefunction).source.kind).toBe('packet')
    expect((interpolate(a, plane, 0.75) as ResolvedWavefunction).source.kind).toBe('plane')
  })
  it('a sweep resolves at each hold progress (never wrapped or snapped)', () => {
    const st = W(PK(0, 1), { shift: { from: 0, to: 3 } })
    close(R(st, 0).shift, 0)
    close(R(st, 0.5).shift, 1.5)
    close(R(st, 1).shift, 3)
    expect(wavefunctionInputs(W(PK({ from: 0, to: 2 }, { from: 1, to: 0.5 })), 0.5).source).toEqual({ kind: 'packet', x0: 1, sigma: 0.75, p0: 0 })
  })
  it('the cells fade: they appear and go with an opacity, and a change of count switches at the half-way point', () => {
    const none = R(W(PK(0, 1)))
    const eight = R(W(PK(0, 1), { cells: 8 }))
    const sixty = R(W(PK(0, 1), { cells: 64 }))
    expect((interpolate(none, eight, 0.25) as ResolvedWavefunction).cells).toMatchObject({ n: 8, alpha: 0.25 })
    expect((interpolate(eight, none, 0.25) as ResolvedWavefunction).cells).toMatchObject({ n: 8, alpha: 0.75 })
    expect((interpolate(eight, sixty, 0.25) as ResolvedWavefunction).cells!.n).toBe(8)
    expect((interpolate(eight, sixty, 0.75) as ResolvedWavefunction).cells!.n).toBe(64)
    expect((interpolate(eight, sixty, 0.75) as ResolvedWavefunction).cells!.alpha).toBe(1)
  })
  it('the interval’s ends lerp when both states have one', () => {
    const a = R(W(PK(0, 1), { interval: [-1, 1] }))
    const b = R(W(PK(0, 1), { interval: [-2, 2] }))
    expect((interpolate(a, b, 0.5) as ResolvedWavefunction).interval).toEqual([-1.5, 1.5])
  })
  it('the readouts in the order asked, only what the state has; the cell reads on two lines', () => {
    const r = R(W(PK(2, 1), { cells: 8, interval: [0, 2], readouts: ['xmean', 'norm', 'interval', 'cell', 'peak'] }))
    const t = wavefunctionReadouts(r).map((x) => x.text)
    expect(t[0]).toBe('⟨x⟩ = 2 ℓ')
    expect(t[1]).toBe('∫|ψ|²dx = 1')
    expect(t[2]).toBe('P(0 < x < 2) = 0.477')
    expect(t[3]).toBe('cell [0, 2): 0.477')
    expect(t[4]).toMatch(/per ℓ$/)
    expect(t[5]).toBe('  = 0.239 per ℓ')
    expect(wavefunctionReadouts(R(W(PK(0, 1)))).length).toBe(0)
  })
})

describe('wavefunction: validation', () => {
  const v = (source: WavefunctionState['source'], o: Omit<WavefunctionState, 'kind' | 'source'> = {}) => validateStage(W(source, o))
  it('a valid state passes at every shape the lectures use', () => {
    expect(v(PK(0, 1))).toEqual([])
    expect(v(PK(0, { from: 1, to: 0.125 }), { show: ['density'], interval: [-0.25, 0.25], readouts: ['interval', 'peak'] })).toEqual([])
    expect(v(PK(0, 1, 3), { time: { from: 0, to: 4 }, panels: ['position', 'momentum'], show: ['re', 'im', 'phase'] })).toEqual([])
    expect(v({ plane: { p: 3 } }, { shift: { from: 0, to: 0.7 }, show: ['re', 'im', 'phase'], readouts: ['wavelength'] })).toEqual([])
    expect(v({ twoWaves: { p1: 2, p2: 4 } }, { time: 1, show: ['density'] })).toEqual([])
    expect(v(PK(2, 1), { overlay: ['xpsi', 'ppsi'], shot: 'W-STD' })).toEqual([])
    for (const n of WAVEFUNCTION_CELLS) expect(v(PK(0, 1), { cells: n, readouts: ['cell'] })).toEqual([])
  })
  it('limits: σ, x₀, p₀, the plane momenta, the boost, the shift, the time', () => {
    expect(v(PK(0, 0.1)).join()).toMatch(/packet sigma: between 0.125 and 4/)
    expect(v(PK(0, 5)).join()).toMatch(/packet sigma/)
    expect(v(PK(7, 1)).join()).toMatch(/packet x0/)
    expect(v(PK(0, 1, 7)).join()).toMatch(/packet p0/)
    expect(v({ plane: { p: 9 } }).join()).toMatch(/plane p: at most ±8/)
    expect(v({ twoWaves: { p1: 2, p2: 2 } }).join()).toMatch(/must differ/)
    expect(v({ twoWaves: { p1: 2, p2: 9 } }).join()).toMatch(/at most ±8/)
    expect(v(PK(0, 1), { boost: 7 }).join()).toMatch(/boost: between -6 and 6/)
    expect(v(PK(0, 1), { shift: { from: 0, to: 9 } }).join()).toMatch(/shift/)
    expect(v(PK(0, 1), { time: -1 }).join()).toMatch(/time: between 0 and 8/)
    expect(v(PK(0, 1), { time: Number.NaN }).join()).toMatch(/non-finite/)
    expect(v({ plane: { p: 1 }, packet: { x0: 0, sigma: 1 } } as never).join()).toMatch(/exactly one/)
  })
  it('the periodic box: a packet that would wrap round is refused with a message that names its numbers', () => {
    expect(v(PK(0, 1, 6), { time: 8 }).join()).toMatch(/reaches the edge of the periodic box/)
    expect(v(PK(0, 0.125), { time: 8 }).join()).toMatch(/reaches the edge/)
    expect(v(PK(6, 1, 3), { shift: 8, time: 4 }).join()).toMatch(/reaches the edge/)
    expect(v(PK(0, 1, 3), { time: 4 })).toEqual([])
    close(packetReach(0, 1, 3, 0, 0, 4), 12 + 5 * Math.sqrt(5), 1e-12)
    expect(WAVEFUNCTION_LIMITS.edge).toBe(28)
  })
  it('panels, show, overlay, cells, interval and readouts', () => {
    expect(v(PK(0, 1), { panels: [] as never }).join()).toMatch(/panels: a non-empty list/)
    expect(v(PK(0, 1), { panels: ['position', 'position'] }).join()).toMatch(/each once/)
    expect(v(PK(0, 1), { show: [] as never }).join()).toMatch(/show: a non-empty list/)
    expect(v(PK(0, 1), { show: ['bogus' as never] }).join()).toMatch(/show/)
    expect(v(PK(0, 1), { overlay: ['bogus' as never] }).join()).toMatch(/unknown/)
    expect(v(PK(0, 1), { panels: ['momentum'], overlay: ['xpsi'] }).join()).toMatch(/needs the 'position' panel/)
    expect(v(PK(0, 1), { panels: ['momentum'], cells: 8 }).join()).toMatch(/cells: needs the 'position' panel/)
    expect(v(PK(0, 1), { panels: ['momentum'], interval: [-1, 1] }).join()).toMatch(/interval: needs the 'position' panel/)
    expect(v(PK(0, 1), { cells: 10 as never }).join()).toMatch(/cells: one of 4, 8, 16, 64, 512/)
    expect(v(PK(0, 1), { interval: [1, -1] }).join()).toMatch(/a < b inside the position window/)
    expect(v(PK(0, 1), { interval: [-1, 9] }).join()).toMatch(/inside the position window/)
    expect(v(PK(0, 1), { window: { x: [-20, 8] } }).join()).toMatch(/window.x/)
    expect(v(PK(0, 1), { readouts: ['bogus' as never] }).join()).toMatch(/unknown/)
    expect(v(PK(0, 1), { readouts: ['interval'] }).join()).toMatch(/needs an interval/)
    expect(v(PK(0, 1), { readouts: ['cell'] }).join()).toMatch(/needs cells/)
    expect(v(PK(0, 1), { readouts: ['wavelength'] }).join()).toMatch(/needs a plane source/)
    expect(v(PK(0, 1), { readouts: ['norm', 'norm'] }).join()).toMatch(/each once/)
  })
  it('a plane or two-wave source takes no cells, interval, original or packet-only readout', () => {
    expect(v({ plane: { p: 2 } }, { cells: 8 }).join()).toMatch(/not normalisable/)
    expect(v({ plane: { p: 2 } }, { interval: [-1, 1] }).join()).toMatch(/not normalisable/)
    expect(v({ plane: { p: 2 } }, { overlay: ['original'] }).join()).toMatch(/takes no 'original'/)
    expect(v({ plane: { p: 2 } }, { readouts: ['norm'] }).join()).toMatch(/needs a packet source/)
    expect(v({ twoWaves: { p1: 2, p2: 4 } }, { readouts: ['wavelength'] }).join()).toMatch(/needs a plane source/)
  })
  it('the shot is the wavefunction’s, and a split with a Bloch sphere validates (different kinds)', () => {
    expect(v(PK(0, 1), { shot: 'K-STD' as never })[0]).toMatch(/unknown shot/)
    expect(validateLayout({ layout: 'split', top: W(PK(0, 1), { shift: 1 }), bottom: { kind: 'bloch', state: '+x', shot: 'B-STD' } })).toEqual([])
  })
})

describe('wavefunction: the one scene (stage, reading version, print)', () => {
  const draw = (r: ResolvedWavefunction, mode: 'stage' | 'print', w: number, h: number, bare = false) =>
    renderToString(
      <svg viewBox={`0 0 ${w} ${h}`}>
        <WavefunctionScene state={r} mode={mode} width={w} height={h} bare={bare} />
      </svg>,
    )
  it('draws every curve with its anchor, in every mode and at several box shapes, with no NaN', () => {
    const r = R(W(PK(0, 1), { show: ['re', 'im', 'density', 'phase'], overlay: ['original', 'xpsi', 'ppsi'], shift: 1, interval: [-1, 1], cells: 8, panels: ['position', 'momentum'], readouts: ['norm', 'xmean', 'interval'] }))
    for (const [mode, w, h, bare] of [['stage', 380, 560, false], ['stage', 640, 560, false], ['stage', 560, 440, true], ['print', 320, 420, false]] as const) {
      const html = draw(r, mode, w, h, bare)
      expect(html, `${mode} ${w}x${h}`).not.toMatch(/NaN|Infinity|undefined/)
      for (const a of ['psi-re', 'psi-im', 'density', 'phase-band', 'interval', 'cell-bar', 'original', 'xpsi', 'ppsi', 'momentum-panel']) expect(html, a).toContain(`data-anchor="${a}"`)
      expect(html).toContain('data-kind="wavefunction"')
      expect(html).toContain('ψ(x) · position')
      expect(html).toContain('φ(p) · momentum')
    }
  })
  it('only what is asked for is drawn: no density without "density", no momentum panel by default', () => {
    const html = draw(R(W(PK(0, 1), { show: ['re'] })), 'stage', 380, 560)
    expect(html).toContain('data-anchor="psi-re"')
    for (const a of ['density', 'psi-im', 'phase-band', 'interval', 'cell-bar', 'original', 'momentum-panel']) expect(html, a).not.toContain(`data-anchor="${a}"`)
    expect(html).not.toContain('φ(p) · momentum')
  })
  it('the print figure and the reading version carry the readouts as text lines; the live stage leaves them to the overlay', () => {
    const r = R(W(PK(0, 1), { readouts: ['xmean', 'xspread'] }))
    expect(draw(r, 'print', 320, 300)).toContain('⟨x⟩ = 0 ℓ')
    expect(draw(r, 'stage', 560, 440, true)).toContain('Δx = 1 ℓ')
    expect(draw(r, 'stage', 380, 560)).not.toContain('Δx = 1 ℓ')
  })
  it('a plane wave in momentum space is a spike with its momentum; a packet’s phase band is made of hues', () => {
    const html = draw(R(W({ plane: { p: 3 } }, { panels: ['position', 'momentum'], show: ['re', 'phase'] })), 'stage', 380, 560)
    expect(html).toContain('p = 3')
    expect(html).toMatch(/style="fill:#[0-9a-f]{6}"/)
    expect(html).not.toMatch(/NaN|Infinity|undefined/)
  })
  it('the layout never leaves the drawing box, one panel or two', () => {
    const states = [W(PK(0, 1)), W(PK(0, 1), { panels: ['momentum'] }), W(PK(0, 1), { panels: ['position', 'momentum'], readouts: ['norm', 'xmean', 'xspread'] })]
    for (const [w, h, own, slot] of [[380, 560, false, 'full'], [640, 560, false, 'full'], [560, 440, true, 'full'], [320, 300, true, 'full'], [380, 300, false, 'top']] as const) {
      for (const st of states) {
        const L = wavefunctionLayout(R(st), w, h, own, slot)
        for (const [name, p] of Object.entries(L.panels)) {
          expect(p!.x, `${name} ${w}x${h}`).toBeGreaterThanOrEqual(L.area.x - 1e-9)
          expect(p!.y).toBeGreaterThanOrEqual(L.area.y - 1e-9)
          expect(p!.x + p!.w).toBeLessThanOrEqual(L.area.x + L.area.w + 1e-9)
          expect(p!.y + p!.h).toBeLessThanOrEqual(L.area.y + L.area.h + 1e-9)
        }
        expect(L.area.x + L.area.w).toBeLessThanOrEqual(w)
        expect(L.area.y + L.area.h).toBeLessThanOrEqual(h - (own ? 4 : slot === 'top' ? 10 : 80))
      }
    }
  })
  it('the print figure is the stage picture: FigureFor draws the scene in print ink, taller for two panels', () => {
    const html = renderToString(<FigureFor layout={W(PK(0, 1), { shift: 3, overlay: ['original'] })} number="L12.1" caption="a shift" />)
    expect(html).toContain('print-fig-svg svgk svgk-print')
    expect(html).toContain('data-kind="wavefunction"')
    expect(html).toContain('WAVEFUNCTION')
    expect(html).not.toMatch(/NaN|Infinity|undefined/)
    expect(wavefunctionPrintSize(R(W(PK(0, 1)))).h).toBe(300)
    expect(wavefunctionPrintSize(R(W(PK(0, 1), { panels: ['position', 'momentum'] }))).h).toBe(420)
  })
})
