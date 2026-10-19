/**
 * The two Townsend-pass (G3) stage additions: `amplitudes.inBasis: { local }` (each wire read along its own axis; bars are the engine's
 * `localBasisAmplitudes`) and the `plot` curve `bellBisectGap`. Defaults are untouched, so every 709 stage resolves as before.
 */
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { AmplitudesState, PlotState } from '../../content/stage'
import { passportOf } from '../../content/stage'
import { abs2 } from '../../physics/complex'
import { bellBisectGap } from '../../physics/qc/entangle'
import { localBasisAmplitudes } from '../../physics/qc/measure'
import { bell, ket } from '../../physics/qc/state'
import { interpolate } from '../interp'
import { resolve, validateStage } from '../resolve'
import type { ResolvedAmplitudes } from '../types'
import { AmplitudesScene } from './AmplitudesScene'
import { ampReadouts, barLabel, resolveAmplitudes, validateAmplitudes } from './amplitudes'
import { resolvePlotStage, validatePlotStage } from './plot'
import './kinds'

const amp = (x: Omit<AmplitudesState, 'kind'>): AmplitudesState => ({ kind: 'amplitudes', ...x })
const pl = (x: Omit<PlotState, 'kind'>): PlotState => ({ kind: 'plot', ...x })
const close = (a: number, b: number, eps = 1e-12) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(eps)

describe('amplitudes inBasis { local } (Townsend pass G3)', () => {
  it('draws the engine overlaps: the triplet |1,0> along x, x gives chances 1/2, 0, 0, 1/2; the singlet 0, 1/2, 1/2, 0', () => {
    const trip = resolveAmplitudes(amp({ state: { bell: '01+10' }, inBasis: { local: 'xx' }, mode: 'probability' }), 1)
    const sing = resolveAmplitudes(amp({ state: { bell: '01-10' }, inBasis: { local: 'xx' }, mode: 'probability' }), 1)
    ;[0.5, 0, 0, 0.5].forEach((v, k) => close(trip.probs[k], v))
    ;[0, 0.5, 0.5, 0].forEach((v, k) => close(sing.probs[k], v))
    expect(trip.basis).toBe('local')
    expect(trip.localAxes).toBe('xx')
    const direct = localBasisAmplitudes(bell('01+10'), ['x', 'x'])
    trip.amps.forEach((a, k) => {
      close(a.re, direct[k].re)
      close(a.im, direct[k].im)
    })
    close(trip.probs.reduce((s, p) => s + p, 0), 1)
  })

  it('labels each bar by one sign and axis letter per wire, and the readout says which axes it reads', () => {
    expect([0, 1, 2, 3].map((k) => barLabel(k, 2, 'bits', 'local', 'xx'))).toEqual(['|+x +x⟩', '|+x −x⟩', '|−x +x⟩', '|−x −x⟩'])
    expect(barLabel(5, 3, 'bits', 'local', 'zxx')).toBe('|−z +x −x⟩')
    const r = resolveAmplitudes(amp({ state: { bell: '01-10' }, inBasis: { local: 'xx' }, mode: 'probability' }), 1)
    const lines = ampReadouts(r).map((x) => x.text)
    expect(lines).toContain('read along x, x')
    expect(lines.join('|')).toContain('P(+x −x) = 50 %')
    const z = resolveAmplitudes(amp({ state: { bell: '01-10' }, inBasis: { local: 'zx' } }), 1)
    expect(barLabel(1, 2, 'bits', z.basis, z.localAxes)).toBe('|+z −x⟩')
  })

  it('a three-wire register reads along z, x, x (the GHZ rows) and still adds to 1', () => {
    const r = resolveAmplitudes(amp({ state: { terms: '000-011-101-110' }, inBasis: { local: 'zxx' }, mode: 'probability' }), 1)
    expect(r.probs.length).toBe(8)
    close(r.probs.reduce((s, p) => s + p, 0), 1)
  })

  it('validation: two or three letters of x, y, z that match the wires; not with dft, sum, keep, labels or signed', () => {
    const base = { state: { bell: '01-10' } as const }
    expect(validateAmplitudes(amp({ ...base, inBasis: { local: 'xx' } }))).toEqual([])
    expect(validateAmplitudes(amp({ ...base, inBasis: { local: 'zy' }, mode: 'probability', dials: true }))).toEqual([])
    expect(validateAmplitudes(amp({ ...base, inBasis: { local: 'xxx' } }))[0]).toMatch(/3 letters for a register of 2 wires/)
    expect(validateAmplitudes(amp({ ...base, inBasis: { local: 'x' } }))[0]).toMatch(/two or three letters/)
    expect(validateAmplitudes(amp({ ...base, inBasis: { local: 'xw' } }))[0]).toMatch(/each x, y or z/)
    expect(validateAmplitudes(amp({ ...base, inBasis: { local: 'xx' }, mode: 'signed' }))[0]).toMatch(/signed/)
    expect(validateAmplitudes(amp({ ...base, inBasis: { local: 'xx' }, sum: [0, 1] }))[0]).toMatch(/sum/)
    expect(validateAmplitudes(amp({ ...base, inBasis: { local: 'xx' }, labels: 'bits' }))[0]).toMatch(/labels/)
    expect(validateAmplitudes(amp({ ...base, inBasis: { local: 'xx' }, dft: true }))[0]).toMatch(/inBasis/)
    expect(validateAmplitudes(amp({ state: { ket: '000' }, inBasis: { local: 'xx' } }))[0]).toMatch(/2 letters for a register of 3 wires/)
    expect(validateAmplitudes(amp({ state: { terms: '000-011-101-110' }, inBasis: { local: 'zxx' }, keep: 2, mode: 'probability' }))[0]).toMatch(/keep: not with inBasis/)
    expect(validateAmplitudes(amp({ ...base, inBasis: { local: 'xx', extra: 1 } as unknown as { local: string } }))[0]).toMatch(/only the field/)
    expect(validateAmplitudes(amp({ ...base, inBasis: 'computational' as 'bell' }))[0]).toMatch(/inBasis/)
  })

  it('interpolation between two local readings of different axes hard-switches; the same axes lerp', () => {
    const a = resolve(amp({ state: { ket: '00' }, inBasis: { local: 'xx' }, mode: 'probability' }), 0) as ResolvedAmplitudes
    const b = resolve(amp({ state: { ket: '00' }, inBasis: { local: 'zx' }, mode: 'probability' }), 0) as ResolvedAmplitudes
    expect((interpolate(a, b, 0.25) as typeof a).localAxes).toBe('xx')
    expect((interpolate(a, b, 0.75) as typeof a).localAxes).toBe('zx')
  })

  it('leaves the computational reading and the 709 passport as before; the scene prints the signed labels', () => {
    const plain = resolveAmplitudes(amp({ state: { ket: '01' } }), 1)
    expect(plain.basis).toBe('computational')
    expect('localAxes' in plain).toBe(false)
    expect(passportOf(amp({ state: { bell: '01-10' }, inBasis: { local: 'xx' } })).fidelityKey).toBe('amplitudes')
    const st = amp({ state: { bell: '01-10' }, inBasis: { local: 'xx' }, mode: 'probability' })
    expect(validateStage(st)).toEqual([])
    const r = resolve(st, 1) as ResolvedAmplitudes
    for (const mode of ['stage', 'print'] as const) {
      const html = renderToString(createElement('svg', null, createElement(AmplitudesScene, { state: r, mode, width: 320, height: 240 })))
      expect(html, mode).not.toMatch(/NaN|Infinity|undefined/)
      expect(html, mode).toContain('+x −x')
    }
  })

  it('a pair read along x is not the pair in the z table: |+x,+z> is a product with chances 1/2, 0, 1/2, 0 along z, z', () => {
    const r = resolveAmplitudes(amp({ state: { terms: '00+10' }, mode: 'probability' }), 1)
    close(r.probs[0], 0.5)
    close(r.probs[2], 0.5)
    expect(abs2(ket('00')[0])).toBe(1)
  })
})

describe('plot curve bellBisectGap (Townsend pass G3)', () => {
  it('samples the engine margin at Θ in degrees; default range 0 to 180; largest 1/8 at 60, zero at 90', () => {
    const r = resolvePlotStage(pl({ curve: { fn: 'bellBisectGap', samples: 180 }, markers: [{ x: 60 }, { x: 90 }] }), 1)
    expect(r.range).toEqual({ from: 0, to: 180 })
    close(r.markers[0].y, 1 / 8)
    close(r.markers[1].y, 0)
    expect(r.xLabel).toBe('Θ')
    r.points.forEach((p) => close(p.y, bellBisectGap((p.x * Math.PI) / 180)))
    const top = r.points.reduce((a, b) => (b.y > a.y ? b : a))
    close(top.x, 60)
    expect(Math.min(...r.points.map((p) => p.y))).toBeLessThan(0)
  })

  it('validates like the other named curves (markers inside the range, the y-lines as given)', () => {
    expect(validatePlotStage(pl({ curve: { fn: 'bellBisectGap' }, markers: [{ x: 60 }], yLines: [{ y: 0, label: 'holds below' }] }))).toEqual([])
    expect(validateStage(pl({ curve: { fn: 'bellBisectGap' }, markers: [{ x: 200 }] })).join()).toMatch(/outside the drawn range/)
  })
})
