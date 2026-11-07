/**
 * `wavefunction` with a `potential` (Lecture 17, ruling M3): the packet at t = 0 evolved under p̂²/2 + V on the lecture grid (physics/wave.ts `evolveV`). The resolver caches frames; these
 * tests check the resolved state against direct engine calls (the cache may differ from a one-shot call only by the split-step error), the readouts `reflected` and `transmitted`, the
 * profile and its energy line, interpolation, every refusal the contract lists (with the field named), the periodic-box guard, the new plot curve `stepDensityRatio`, and that the scene
 * draws the profile with no NaN in every mode.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { fidelityOf } from '../../content/fidelity'
import type { WavefunctionState } from '../../content/stage'
import { ANCHORS } from '../../content/stageVocab'
import { stepAmplitudes } from '../../physics/scatter'
import { GRID, chanceAbove, chanceBelow, evolveV, forcePotential, harmonicPotential, meanX, packet, spreadX, stepPotential } from '../../physics/wave'
import { interpolate } from '../interp'
import { resolve, validateStage } from '../resolve'
import type { PlotCurveName } from '../../content/stage'
import type { ResolvedPlot, ResolvedWavefunction } from '../types'
import { POTENTIAL_LIMITS, potentialReach, wavefunctionReadouts } from './wavefunction'
import { WavefunctionScene } from './WavefunctionScene'
import './kinds'

const W = (o: Omit<WavefunctionState, 'kind'>): WavefunctionState => ({ kind: 'wavefunction', ...o })
const PK = (x0: number, sigma: number, p0?: number): WavefunctionState['source'] => ({ packet: { x0, sigma, ...(p0 === undefined ? {} : { p0 }) } })
const R = (st: WavefunctionState, s = 1) => resolve(st, s) as ResolvedWavefunction
const close = (a: number, b: number, eps = 1e-9) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(eps)
const STEP = { step: { V0: 3.375 } }
const base = (o: Partial<WavefunctionState> = {}): WavefunctionState =>
  W({ source: PK(-8, 3, 3), potential: STEP, window: { x: [-16, 16] }, time: 6, readouts: ['reflected', 'transmitted'], ...o })

describe('wavefunction + potential: the resolved state is the engine’s evolution', () => {
  it('the position curve and the moments equal a direct evolveV of the packet (the cached frames differ only by the split-step error)', () => {
    const r = R(base())
    const w = evolveV(packet(GRID, { x0: -8, sigma: 3, p0: 3 }), GRID, stepPotential(GRID, 3.375), 6)
    r.position.x.forEach((x, k) => {
      const j = Math.round((x - GRID.x[0]) / GRID.dx)
      close(r.position.re[k], w.re[j], 2e-3)
      close(r.position.im[k], w.im[j], 2e-3)
    })
    close(r.stats.xmean!, meanX(w, GRID), 2e-3)
    close(r.stats.xspread!, spreadX(w, GRID), 2e-3)
  })
  it('time = 0 is the packet itself; a force adds Ft²/2 to the centre and leaves the width, a well turns the centre round', () => {
    const t0 = R(W({ source: PK(-8, 3, 3), potential: STEP, window: { x: [-16, 16] }, readouts: ['xmean'] }))
    close(t0.stats.xmean!, -8, 1e-9)
    const f = R(W({ source: PK(0, 1, 3), potential: { force: { F: 1 } }, time: 2, readouts: ['xmean', 'xspread'] }))
    close(f.stats.xmean!, 8, 1e-4)
    close(f.stats.xspread!, Math.SQRT2, 1e-4)
    const h = R(W({ source: PK(2, 1), potential: { harmonic: { omega: 1 } }, time: Math.PI, readouts: ['xmean', 'xspread'] }))
    close(h.stats.xmean!, -2, 2e-3)
    close(h.stats.xspread!, 1, 2e-3)
  })
  it('frames are cached in order: asking for an earlier time after a later one gives the same state, and the norm stays 1', () => {
    const a1 = R(base({ time: 4.3 }))
    R(base({ time: 9 }))
    const a2 = R(base({ time: 4.3 }))
    expect(a2.position.re).toEqual(a1.position.re)
    close(a2.stats.norm ?? 1, 1, 1e-8)
    const n = R(base({ time: 7.5, readouts: ['norm'] }))
    close(n.stats.norm!, 1, 1e-8)
  })
  it('a sweep of time resolves frame by frame (the story scrubs it)', () => {
    const lo = R(base({ time: { from: 0, to: 8 } }), 0)
    const hi = R(base({ time: { from: 0, to: 8 } }), 1)
    expect(lo.time).toBe(0)
    close(hi.time, 8, 1e-12)
    expect(lo.stats.reflected).toBeGreaterThan(0.99)
  })
})

describe('wavefunction + potential: reflected and transmitted', () => {
  it('the chances left of x = 0 and right of the edge are the engine’s, add to 1 once the packet has gone, and sit near R(E), T(E) for a broad packet', () => {
    const r = R(base({ source: PK(-14, 3, 3) , time: 8 }))
    const w = evolveV(packet(GRID, { x0: -14, sigma: 3, p0: 3 }), GRID, stepPotential(GRID, 3.375), 8)
    close(r.stats.reflected!, chanceBelow(w, GRID, 0), 1e-3)
    close(r.stats.transmitted!, chanceAbove(w, GRID, 0), 1e-3)
    close(r.stats.reflected! + r.stats.transmitted!, 1, 1e-4)
    expect(Math.abs(r.stats.reflected! - stepAmplitudes(4.5, 3.375).R)).toBeLessThan(0.05)
    expect(wavefunctionReadouts(r).map((x) => x.name)).toEqual(['reflected', 'transmitted'])
    expect(wavefunctionReadouts(r)[0].text).toMatch(/^P\(x < 0\) = 0\.\d{3}$/)
  })
  it('a barrier counts the chance beyond x = a as transmitted, and says so in the readout', () => {
    const r = R(W({ source: PK(-8, 1.5, 2), potential: { barrier: { V0: 3, a: 1 } }, window: { x: [-16, 16] }, time: 8, readouts: ['transmitted'] }))
    expect(r.stats.transmitted).toBeGreaterThan(0.05)
    expect(wavefunctionReadouts(r)[0].text).toMatch(/^P\(x > 1\) = 0\.\d{3}$/)
  })
})

describe('wavefunction + potential: the profile', () => {
  it('a step: V = 0, then V₀ with a vertical jump at x = 0, the energy line at ⟨p⟩²/2 = 4.5, and a vertical extent that covers it', () => {
    const p = R(base()).profile!
    expect(p.kind).toBe('step')
    expect(p.edges).toEqual([0])
    const j = p.x.findIndex((x, i) => x === 0 && p.v[i] === 0 && p.v[i + 1] === 3.375)
    expect(j).toBeGreaterThan(0)
    expect(p.v[j + 1]).toBe(3.375)
    expect(p.x[j + 1]).toBe(0)
    expect(p.energy).toBe(4.5)
    expect(p.hi).toBe(4.5)
    expect(p.lo).toBe(0)
  })
  it('a barrier has two edges; a well has none and no energy line; a force can go below zero', () => {
    const b = R(W({ source: PK(-8, 1.5, 2), potential: { barrier: { V0: 3, a: 1 } }, window: { x: [-16, 16] } })).profile!
    expect(b.edges).toEqual([0, 1])
    expect(Math.max(...b.v)).toBe(3)
    const h = R(W({ source: PK(2, 1), potential: { harmonic: { omega: 1 } } })).profile!
    expect(h.energy).toBeNull()
    expect(h.edges).toEqual([])
    close(h.v[h.v.length - 1], 32, 1e-9) // Ω²x²/2 at x = 8
    const f = R(W({ source: PK(0, 1, 3), potential: { force: { F: 1 } } })).profile!
    expect(f.lo).toBeLessThan(0)
  })
  it('the density scale has headroom for the overlap at a step and for a squeezed packet in a well', () => {
    expect(R(base()).scale.dens).toBeCloseTo(2 / (3 * Math.sqrt(2 * Math.PI)), 12)
    const well = R(W({ source: PK(2, 1), potential: { harmonic: { omega: 1 } } }))
    close(well.scale.dens, 2 / Math.sqrt(2 * Math.PI), 1e-12)
  })
})

describe('wavefunction + potential: interpolation, the contract and its refusals', () => {
  it('interpolation recomputes from the interpolated time and keeps the potential; the ends are the states themselves', () => {
    const a = R(base({ time: 0 }))
    const b = R(base({ time: 6 }))
    const m = interpolate(a, b, 0.5) as ResolvedWavefunction
    close(m.time, 3, 1e-12)
    expect(m.profile).not.toBeNull()
    expect(interpolate(a, b, 0)).toBe(a)
    expect(interpolate(a, b, 1)).toBe(b)
  })
  it('a valid state passes; every refusal names its field', () => {
    expect(validateStage(base())).toEqual([])
    expect(validateStage(W({ source: PK(2, 1), potential: { harmonic: { omega: 2 } }, time: 16, readouts: ['xmean'] }))).toEqual([])
    const bad = (st: WavefunctionState) => validateStage(st).join(' | ')
    expect(bad(W({ source: { plane: { p: 2 } }, potential: STEP }))).toMatch(/potential: needs a packet source/)
    expect(bad(W({ source: { box: { L: 4, n: 1 } }, potential: STEP }))).toMatch(/potential: needs a packet source/)
    expect(bad(base({ boost: 1 }))).toMatch(/wavefunction boost: refused with a potential/)
    expect(bad(base({ shift: 1 }))).toMatch(/wavefunction shift: refused with a potential/)
    expect(bad(base({ overlay: ['original'] }))).toMatch(/wavefunction overlay: refused/)
    expect(bad(base({ cells: 8 }))).toMatch(/wavefunction cells: refused/)
    expect(bad(base({ interval: [-1, 1] }))).toMatch(/wavefunction interval: refused/)
    expect(bad(base({ potential: { step: { V0: 9 } } }))).toMatch(/step V0/)
    expect(bad(base({ potential: { barrier: { V0: 3, a: 5 } } }))).toMatch(/barrier a/)
    expect(bad(base({ potential: { barrier: { V0: 3, a: 0.05 } } }))).toMatch(/barrier a/)
    expect(bad(base({ potential: { harmonic: { omega: 3 } }, readouts: [] }))).toMatch(/harmonic omega/)
    expect(bad(base({ potential: { force: { F: 3 } }, readouts: [] }))).toMatch(/force F/)
    expect(bad(base({ time: 17 }))).toMatch(/time/)
    expect(bad(base({ potential: { step: { V0: 1 }, force: { F: 1 } } as never }))).toMatch(/exactly one of/)
  })
  it('the readouts need a step or barrier; the packet must stay clear of the periodic edge, with the potential’s own reach', () => {
    expect(validateStage(W({ source: PK(2, 1), potential: { harmonic: { omega: 1 } }, readouts: ['reflected'] })).join(' ')).toMatch(/"reflected" needs a step or barrier/)
    expect(validateStage(W({ source: PK(0, 1, 3), potential: { force: { F: 1 } }, readouts: ['transmitted'] })).join(' ')).toMatch(/"transmitted" needs a step or barrier/)
    expect(validateStage(W({ source: PK(0, 1), readouts: ['reflected'] })).join(' ')).toMatch(/needs a step or barrier/)
    expect(validateStage(base({ source: PK(-12, 4, 6), time: 16 })).join(' ')).toMatch(/can reach the edge of the periodic box/)
    expect(potentialReach(-8, 3, 3, 6, STEP)).toBeLessThan(POTENTIAL_LIMITS.x0Max + 30)
    expect(potentialReach(2, 1, 0, 3, { harmonic: { omega: 1 } })).toBeCloseTo(2 + 5 * 1, 12)
    expect(potentialReach(0, 1, 3, 2, { force: { F: 1 } })).toBeCloseTo(6 + 2 + 5 * Math.SQRT2, 12)
  })
  it('the fidelity note, the anchor and the plot curve stepDensityRatio are registered', () => {
    expect(fidelityOf('wavefunction').exact.map((n) => n.id)).toContain('wavefunction-potential-splitstep')
    expect(ANCHORS.wavefunction).toContain('potential')
    const p = resolve({ kind: 'plot', curve: { fn: 'stepDensityRatio' as PlotCurveName, vs: 'stepT' as PlotCurveName, samples: 60 } }, 1) as ResolvedPlot
    expect(p.kind).toBe('plot')
  })
})

describe('wavefunction + potential: the scene', () => {
  const draw = (r: ResolvedWavefunction, mode: 'stage' | 'print', w: number, h: number, bare = false) =>
    renderToString(
      <svg viewBox={`0 0 ${w} ${h}`}>
        <WavefunctionScene state={r} mode={mode} width={w} height={h} bare={bare} />
      </svg>,
    )
  it('draws the profile with its anchor, the V(x) swatch and the energy label, in every mode, with no NaN', () => {
    const r = R(base())
    for (const [mode, w, h, bare] of [['stage', 380, 560, false], ['stage', 640, 560, false], ['stage', 560, 440, true], ['print', 320, 300, false]] as const) {
      const html = draw(r, mode, w, h, bare)
      expect(html, `${mode} ${w}x${h}`).not.toMatch(/NaN|Infinity|undefined/)
      expect(html).toContain('data-anchor="potential"')
      expect(html).toContain('V(x)')
      expect(html).toContain('⟨p⟩²/2')
    }
    expect(draw(R(W({ source: PK(2, 1), potential: { harmonic: { omega: 1 } } })), 'stage', 380, 560)).not.toContain('⟨p⟩²/2')
    expect(draw(R(W({ source: PK(0, 1) })), 'stage', 380, 560)).not.toContain('data-anchor="potential"')
  })
  it('the force and harmonic profiles draw too (the extent covers a negative V)', () => {
    for (const pot of [{ force: { F: 1 } }, { harmonic: { omega: 2 } }, { barrier: { V0: 3, a: 2 } }] as const) {
      const html = draw(R(W({ source: PK(0, 1, 1), potential: pot, time: 1 })), 'stage', 380, 560)
      expect(html).not.toMatch(/NaN|Infinity|undefined/)
      expect(html).toContain('data-anchor="potential"')
    }
  })
  it('a story reads the potential from the lecture grid: the same packet at the same time gives the same ψ as direct engine calls for the force and well potentials', () => {
    const w = evolveV(packet(GRID, { x0: 2, sigma: 1 }), GRID, harmonicPotential(GRID, 1), 1)
    const r = R(W({ source: PK(2, 1), potential: { harmonic: { omega: 1 } }, time: 1, readouts: ['xmean'] }))
    close(r.stats.xmean!, meanX(w, GRID), 1e-3)
    const w2 = evolveV(packet(GRID, { x0: 0, sigma: 1, p0: 1 }), GRID, forcePotential(GRID, -0.5), 2)
    close(R(W({ source: PK(0, 1, 1), potential: { force: { F: -0.5 } }, time: 2, readouts: ['xmean'] })).stats.xmean!, meanX(w2, GRID), 1e-3)
  })
})
