/**
 * The stage additions of Chapter F8 (W-709 F8-A; plan P-F8-story §9.2, rulings qc709-F7F8 F8 R2): `amplitudes` draws the discrete Fourier transform of its
 * state (`dft: true`) and numbers its bars by place (`labels: 'index'`); `matrix` takes the source `{dft: N}`; `plot` names the curve `dirichlet8`. Every
 * number is the engine's (qc/fourier.ts); the tests check the stage against it, the old stages against being unchanged, every validation rule, the
 * interpolation rules, the passport and fidelity drawer of the new view, and the scenes in stage and print.
 */
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { fidelityOf } from '../../content/fidelity'
import type { AmplitudesState, MatrixGridState, PlotState } from '../../content/stage'
import { passportOf } from '../../content/stage'
import { c } from '../../physics/complex'
import { identity, matmul, dagger, maxDiff } from '../../physics/linalg'
import { dft, dftMatrix, dirichlet } from '../../physics/qc/fourier'
import { ket, superpose } from '../../physics/qc/state'
import { interpolate } from '../interp'
import { resolve, validateLayout, validateStage } from '../resolve'
import type { ResolvedAmplitudes, ResolvedMatrixGrid, ResolvedPlot } from '../types'
import { AmplitudesScene } from './AmplitudesScene'
import { ampReadouts, barLabel, resolveAmplitudes, validateAmplitudes } from './amplitudes'
import { MatrixScene } from './MatrixScene'
import { matrixReadouts, resolveMatrixStage, validateMatrixStage } from './matrix'
import { PlotScene } from './PlotScene'
import { plotReadouts, resolvePlotStage, validatePlotStage } from './plot'
import './kinds'

const amp = (x: Omit<AmplitudesState, 'kind'>): AmplitudesState => ({ kind: 'amplitudes', ...x })
const mat = (source: MatrixGridState['source'], rest: Partial<Omit<MatrixGridState, 'kind' | 'source'>> = {}): MatrixGridState => ({ kind: 'matrix', source, ...rest })
const pl = (x: Omit<PlotState, 'kind'>): PlotState => ({ kind: 'plot', ...x })
const COMB32 = '00000+00110+01100+10010+11000+11110'
const gap = (a: { re: number; im: number }[], b: { re: number; im: number }[]) => Math.max(...a.map((x, k) => Math.hypot(x.re - b[k].re, x.im - b[k].im)))
const svg = (node: ReturnType<typeof createElement>) => renderToString(createElement('svg', null, node))

describe('amplitudes: dft draws the Fourier transform of the state', () => {
  it('the bars are the engine’s dft of the source, for a ket, a signed sum and a phase-turned state', () => {
    const sources: AmplitudesState['state'][] = [{ ket: '++0' }, { ket: '+00' }, { ket: '++1' }, { terms: COMB32 }, { terms: '000+011+110' }]
    for (const src of sources) {
      const r = resolveAmplitudes(amp({ state: src, dft: true }), 1)
      const psi = 'ket' in src ? ket(src.ket) : superpose((src as { terms: string }).terms)
      expect(gap(r.amps, dft(psi))).toBeLessThan(1e-14)
      expect(r.dft).toBe(true)
    }
    // a global phase commutes with the transform
    const a = resolveAmplitudes(amp({ state: { ket: '++1' }, dft: true, globalPhaseDeg: 90 }), 1)
    const b = resolveAmplitudes(amp({ state: { ket: '++1' }, dft: true }), 1)
    a.probs.forEach((p, k) => expect(p).toBeCloseTo(b.probs[k], 12))
  })
  it('a comb of step 2 in 8 gives two spikes 0.7071 high at 0 and 4; step 4 gives four of 0.5; a shifted comb turns the spike at 4 to −0.7071 (hue π)', () => {
    const two = resolveAmplitudes(amp({ state: { ket: '++0' }, dft: true }), 1)
    two.sizes.forEach((s, k) => expect(s).toBeCloseTo(k === 0 || k === 4 ? Math.SQRT1_2 : 0, 12))
    const four = resolveAmplitudes(amp({ state: { ket: '+00' }, dft: true }), 1)
    four.sizes.forEach((s, k) => expect(s).toBeCloseTo(k % 2 === 0 ? 0.5 : 0, 12))
    const shifted = resolveAmplitudes(amp({ state: { ket: '++1' }, dft: true }), 1)
    expect(shifted.amps[0].re).toBeCloseTo(Math.SQRT1_2, 12)
    expect(shifted.amps[4].re).toBeCloseTo(-Math.SQRT1_2, 12)
    expect(shifted.phases[0]).toBeCloseTo(0, 12)
    expect(Math.abs(shifted.phases[4])).toBeCloseTo(Math.PI, 12)
    expect(shifted.sizes[4]).toBeCloseTo(two.sizes[4], 12)
  })
  it('the 32-input comb of period 6: the six tall bars are 0, 5, 11, 16, 21, 27; the chances add to 1', () => {
    const r = resolveAmplitudes(amp({ state: { terms: COMB32 }, dft: true, mode: 'probability' }), 1)
    const tall = r.probs.map((p, k) => [p, k] as const).filter(([p]) => p > 0.1).map(([, k]) => k)
    expect(tall).toEqual([0, 5, 11, 16, 21, 27])
    expect(r.probs.reduce((x, y) => x + y, 0)).toBeCloseTo(1, 12)
    expect(r.probs[5] + r.probs[27]).toBeCloseTo(0.2336, 4)
  })
  it('stages that do not use dft resolve exactly as before: no dft key on the result, and the same bars', () => {
    const r = resolveAmplitudes(amp({ state: { ket: '++0' } }), 1)
    expect('dft' in r).toBe(false)
    expect(r.labels).toBe('bits')
    expect(gap(r.amps, ket('++0'))).toBe(0)
  })
  it('the engine route and the stage route agree through resolve() too, with a state on a circuit-free source', () => {
    const r = resolve(amp({ state: { ket: '+0' }, dft: true }), 1) as ResolvedAmplitudes
    // |+0⟩ on two qubits is the comb {0, 2} of step 2 in 4 places; its transform has spikes at 0 and 2, each 1/√2
    expect(r.sizes.map((s) => Math.round(s * 1e6) / 1e6)).toEqual([0.707107, 0, 0.707107, 0])
  })

  it('labels "index" numbers the bars; readouts name c_j, or ĉ_k in the Fourier view, and the chance by its place', () => {
    expect(barLabel(5, 5, 'index')).toBe('5')
    expect(barLabel(27, 5, 'index')).toBe('27')
    expect(barLabel(5, 5, 'bits')).toBe('|00101⟩')
    const input = ampReadouts(resolveAmplitudes(amp({ state: { ket: '++0' }, labels: 'index' }), 1)).map((x) => x.text)
    expect(input).toEqual(['c₀: 0.5', 'c₂: 0.5', 'c₄: 0.5', 'c₆: 0.5'])
    const out = ampReadouts(resolveAmplitudes(amp({ state: { ket: '++0' }, dft: true, labels: 'index' }), 1)).map((x) => x.text)
    expect(out).toEqual(['Fourier view', 'ĉ₀: 0.707', 'ĉ₄: 0.707'])
    const chances = ampReadouts(resolveAmplitudes(amp({ state: { terms: '000+011+110' }, dft: true, labels: 'index', mode: 'probability' }), 1)).map((x) => x.text)
    expect(chances[0]).toBe('Fourier view')
    expect(chances).toContain('P(0) = 37.5 %')
    expect(chances).toContain('P(3) = 24.3 %')
    expect(chances).toContain('P(5) = 24.3 %')
  })
  it('the Fourier readouts name the FOUR TALLEST bars (ties to the lower place), then say how many smaller bars there are', () => {
    const lines = ampReadouts(resolveAmplitudes(amp({ state: { terms: COMB32 }, dft: true, labels: 'index', mode: 'probability' }), 1)).map((x) => x.text)
    expect(lines).toHaveLength(6)
    expect(lines[0]).toBe('Fourier view')
    expect(lines[1]).toMatch(/^P\(0\) = 18\.[78] %$/)
    expect(lines.slice(2, 4)).toEqual(['P(5) = 11.7 %', 'P(11) = 11.7 %'])
    expect(lines[4]).toMatch(/^P\(16\) = 18\.[78] %$/)
    expect(lines[5]).toBe('26 smaller bars') // 30 nonzero bars (places 8 and 24 are exactly 0), 4 named
  })

  it('validation: not with inBasis, sum, signed or spin labels; only true; the cap of 5 qubits still holds', () => {
    expect(validateAmplitudes(amp({ state: { ket: '++0' }, dft: true, labels: 'index', mode: 'probability' }))).toEqual([])
    expect(validateAmplitudes(amp({ state: { ket: '00' }, dft: true, inBasis: 'bell' }))[0]).toMatch(/inBasis/)
    expect(validateAmplitudes(amp({ state: { ket: '00' }, dft: true, sum: [0, 1] }))[0]).toMatch(/sum/)
    expect(validateAmplitudes(amp({ state: { ket: '00' }, dft: true, mode: 'signed' }))[0]).toMatch(/signed/)
    expect(validateAmplitudes(amp({ state: { ket: '0' }, dft: true, labels: 'spin' }))[0]).toMatch(/spin/)
    expect(validateAmplitudes(amp({ state: { ket: '00' }, dft: false as unknown as true }))[0]).toMatch(/dft/)
    expect(validateAmplitudes(amp({ state: { ket: '000000' }, dft: true }))[0]).toMatch(/at most 5 qubits/)
    expect(validateAmplitudes(amp({ state: { ket: '00' }, labels: 'roman' as 'bits' }))[0]).toMatch(/index/)
    expect(validateStage(amp({ state: { ket: '++0' }, dft: true, labels: 'index' }))).toEqual([])
    expect(validateLayout(amp({ state: { ket: '++0' }, dft: true, labels: 'index' }))).toEqual([])
  })
  it('interpolation: a list and its transform are different lists and switch at ½; two transforms lerp and renormalise', () => {
    const list = resolveAmplitudes(amp({ state: { ket: '++0' } }), 1)
    const tr = resolveAmplitudes(amp({ state: { ket: '++0' }, dft: true }), 1)
    expect((interpolate(list, tr, 0.3) as ResolvedAmplitudes).dft).toBeUndefined()
    expect((interpolate(list, tr, 0.7) as ResolvedAmplitudes).dft).toBe(true)
    const t2 = resolveAmplitudes(amp({ state: { ket: '+00' }, dft: true }), 1)
    const mid = interpolate(tr, t2, 0.5) as ResolvedAmplitudes
    expect(mid.dft).toBe(true)
    expect(mid.probs.reduce((x, y) => x + y, 0)).toBeCloseTo(1, 12)
  })
  it('the passport and the drawer of the Fourier view are their own; the computational drawer is unchanged', () => {
    const p = passportOf(amp({ state: { ket: '++0' }, dft: true }), 'qc709')
    expect(p.title).toBe('LIST · Fourier view')
    expect(p.fidelityKey).toBe('amplitudes-fourier')
    expect(passportOf(amp({ state: { ket: '++0' }, dft: true, mode: 'probability' }), 'qc709').title).toBe('LIST · Fourier chances')
    expect(passportOf(amp({ state: { ket: '++0' } }), 'qc709').fidelityKey).toBe('amplitudes')
    const ids = (k: Parameters<typeof fidelityOf>[0]) => Object.values(fidelityOf(k, 'qc709')).flat().map((x) => x.id)
    expect(ids('amplitudes-fourier')).toContain('qc-amp-fourier-engine')
    expect(ids('amplitudes')).not.toContain('qc-amp-fourier-engine')
  })
  it('one scene draws the 8-bar and the 32-bar Fourier view, numbered by place, in stage and print, with no NaN', () => {
    for (const [st, N] of [
      [amp({ state: { ket: '++0' }, dft: true, labels: 'index' }), 8],
      [amp({ state: { terms: COMB32 }, dft: true, labels: 'index', mode: 'probability' }), 32],
    ] as const) {
      const r = resolve(st, 1) as ResolvedAmplitudes
      for (const mode of ['stage', 'print'] as const) {
        const html = svg(createElement(AmplitudesScene, { state: r, mode, width: 340, height: 280 }))
        expect(html, mode).not.toMatch(/NaN|Infinity|undefined/)
        expect((html.match(/data-anchor="bar-/g) ?? []).length).toBe(N)
        expect(html).toContain(N === 32 ? '>27<' : '>7<')
        expect(html).not.toContain('|000')
      }
    }
  })
})

describe('matrix: the source {dft: N}', () => {
  it('the grid is the engine’s F_N: F_8’s first entries are 0.3536 and (F_8)₁₁ = 0.25 + 0.25i, and F†F is the identity', () => {
    const r = resolveMatrixStage(mat({ dft: 8 }, { values: 'none', labels: 'indices' }), 1) as ResolvedMatrixGrid
    expect(r.n).toBe(8)
    expect(r.cells[0][0].re).toBeCloseTo(1 / Math.sqrt(8), 14)
    expect(r.cells[1][1].re).toBeCloseTo(0.25, 14)
    expect(r.cells[1][1].im).toBeCloseTo(0.25, 14)
    const prod = resolveMatrixStage(mat({ product: [{ adjoint: { dft: 8 } }, { dft: 8 }] }, { values: 'none' }), 1) as ResolvedMatrixGrid
    expect(maxDiff(prod.cells.map((row) => row.map((z) => c(z.re, z.im))), identity(8))).toBeLessThan(1e-13)
    const F = dftMatrix(8)
    expect(maxDiff(matmul(dagger(F), F), identity(8))).toBeLessThan(1e-13)
  })
  it('validation: a whole N from 2 to 16 at the source; the grid itself draws sides 2, 4 and 8', () => {
    for (const N of [2, 4, 8]) expect(validateMatrixStage(mat({ dft: N }, { labels: 'indices' })), `N = ${N}`).toEqual([])
    expect(validateMatrixStage(mat({ dft: 1 }))[0]).toMatch(/2 to 16/)
    expect(validateMatrixStage(mat({ dft: 17 }))[0]).toMatch(/2 to 16/)
    expect(validateMatrixStage(mat({ dft: 2.5 }))[0]).toMatch(/2 to 16/)
    expect(validateMatrixStage(mat({ dft: 3 }))[0]).toMatch(/power of two/)
    expect(validateMatrixStage(mat({ dft: 16 }))[0]).toMatch(/power of two from 2 to 8/)
    expect(validateMatrixStage(mat({ product: [{ dft: 4 }, { dft: 8 }] }))[0]).toMatch(/same side/)
    expect(validateStage(mat({ product: [{ adjoint: { dft: 8 } }, { dft: 8 }] }, { values: 'exact' }))).toEqual([])
  })
  it('N = 2 is the Hadamard gate, and N = 4 has the entries ±½ and ±i/2 that "exact" values name', () => {
    const r = resolveMatrixStage(mat({ dft: 2 }), 1) as ResolvedMatrixGrid
    expect(r.cells[1][1].re).toBeCloseTo(-Math.SQRT1_2, 14)
    const r4 = resolveMatrixStage(mat({ dft: 4 }), 1) as ResolvedMatrixGrid
    expect(r4.cells[1][1].im).toBeCloseTo(0.5, 14)
    expect(r4.cells[1][2].re).toBeCloseTo(-0.5, 14)
  })
  it('the scene draws F_8 and F†F in stage and print, with no NaN, and the readouts of a plain grid', () => {
    for (const st of [mat({ dft: 8 }, { values: 'none', labels: 'indices' }), mat({ product: [{ adjoint: { dft: 8 } }, { dft: 8 }] }, { values: 'exact' })]) {
      const r = resolve(st, 1) as ResolvedMatrixGrid
      for (const mode of ['stage', 'print'] as const) {
        const html = svg(createElement(MatrixScene, { state: r, mode, width: 340, height: 300 }))
        expect(html, mode).not.toMatch(/NaN|Infinity|undefined/)
      }
      expect(matrixReadouts(r)).toEqual([])
    }
  })
})

describe('plot: the curve dirichlet8 (D₈(δ) = |sin 8πδ| / (8 |sin πδ|), δ in turns)', () => {
  const P = (x: Omit<PlotState, 'kind'>): ResolvedPlot => resolvePlotStage(pl(x), 1)
  it('samples the engine’s kernel: 1 at δ = 0, 0.6407 at 1/16, 0 at 1/8 (rounding noise drawn as 0), with the default range ±½', () => {
    const r = P({ curve: { fn: 'dirichlet8', samples: 64 }, markers: [{ x: 0 }, { x: 0.0625 }, { x: 0.125 }] })
    expect(r.range).toEqual({ from: -0.5, to: 0.5 })
    expect(r.markers[0].y).toBe(1)
    expect(r.markers[1].y).toBeCloseTo(dirichlet(8, 1 / 16), 14)
    expect(r.markers[1].y).toBeCloseTo(0.6407, 4)
    expect(r.markers[2].y).toBe(0)
    r.points.forEach((p) => expect(p.y).toBeCloseTo(dirichlet(8, p.x) < 1e-12 ? 0 : dirichlet(8, p.x), 14))
    expect(r.xLabel).toBe('δ')
    expect(r.xDigits).toBe(4)
    expect(r.yMin).toBe(0)
    expect(r.yMax).toBe(1)
  })
  it('an older curve has no xDigits (it prints exactly as before)', () => {
    expect('xDigits' in P({ curve: { fn: 'twoToN' } })).toBe(false)
    expect('xDigits' in P({ curve: { fn: 'chshVsPhase' } })).toBe(false)
  })
  it('readouts print a fraction of a turn with its decimals: "δ ∈ [−0.25, 0.25]", "y(0.0625) = 0.641"', () => {
    const r = P({ curve: { fn: 'dirichlet8', x: { from: -0.25, to: 0.25 } }, markers: [{ x: 0 }, { x: 0.0625 }, { x: 0.125 }] })
    const lines = plotReadouts(r).map((x) => x.text)
    expect(lines[0]).toBe('δ ∈ [−0.25, 0.25]')
    expect(lines).toContain('marker: y(0) = 1')
    expect(lines).toContain('marker: y(0.0625) = 0.641')
    expect(lines).toContain('marker: y(0.125) = 0')
    expect(lines).toContain('y(0.25) = 0')
  })
  it('the 2/π line sits under the peak and the curve crosses it between ±1/16 and ±1/8', () => {
    const r = P({ curve: { fn: 'dirichlet8', x: { from: -0.25, to: 0.25 } }, yLines: [{ y: 2 / Math.PI, label: '2/π' }], markers: [{ x: 0.0625 }] })
    expect(r.yLines[0].y).toBeCloseTo(0.6366, 4)
    expect(r.markers[0].y).toBeGreaterThan(r.yLines[0].y)
    expect(dirichlet(8, 0.07)).toBeLessThan(2 / Math.PI)
  })
  it('validation and the scene: markers must lie in the range; the axis names are the fractions', () => {
    expect(validatePlotStage(pl({ curve: { fn: 'dirichlet8', x: { from: -0.25, to: 0.25 } }, markers: [{ x: 0.0625 }] }))).toEqual([])
    expect(validatePlotStage(pl({ curve: { fn: 'dirichlet8', x: { from: -0.25, to: 0.25 } }, markers: [{ x: 0.4 }] }))[0]).toMatch(/outside the drawn range/)
    const r = P({ curve: { fn: 'dirichlet8', x: { from: -0.25, to: 0.25 } }, markers: [{ x: 0.0625 }], yLines: [{ y: 2 / Math.PI, label: '2/π' }] })
    for (const mode of ['stage', 'print'] as const) {
      const html = svg(createElement(PlotScene, { state: r, mode, width: 340, height: 260 }))
      expect(html, mode).not.toMatch(/NaN|Infinity|undefined/)
      expect(html).toContain('>−0.25<')
      expect(html).toContain('>0.25<')
      expect(html).toContain('>δ<')
      expect(html).toContain('>2/π<')
    }
  })
})
