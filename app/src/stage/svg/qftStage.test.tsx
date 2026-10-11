/**
 * The stage additions of Chapter Q18 (W-709 Q18-A and Q18-B; plan P-Q18-story §9.2, rulings qc709-Q18 R4): `plot` names the curve `peBest3` (the chance of phase
 * estimation's best reading on three wires), `amplitudes` takes `keep` (the chances of the first wires, the others summed over), and its dials may sit on a four-wire
 * register (16 bars). Every number is the engine's (qc/qft.ts); the tests check the stage against it, the old stages against being unchanged, every validation rule,
 * the interpolation rules, the passport and drawer of the new view, and the scenes in stage and print.
 */
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { fidelityOf } from '../../content/fidelity'
import type { AmplitudesState, CircuitStageState, PlotState } from '../../content/stage'
import { passportOf } from '../../content/stage'
import { runCircuit } from '../../physics/qc/circuit'
import { marginal } from '../../physics/qc/measure'
import { countingCircuit, peBest, peWorstBest, phaseEstimationCircuit, readingOfCircuit } from '../../physics/qc/qft'
import { interpolate } from '../interp'
import { resolve, validateLayout, validateStage } from '../resolve'
import type { ResolvedAmplitudes, ResolvedCircuit, ResolvedPlot } from '../types'
import { CircuitScene } from './CircuitScene'
import { AmplitudesScene } from './AmplitudesScene'
import { ampReadouts, resolveAmplitudes, validateAmplitudes } from './amplitudes'
import { PlotScene } from './PlotScene'
import { plotReadouts, resolvePlotStage, validatePlotStage } from './plot'
import './kinds'

const amp = (x: Omit<AmplitudesState, 'kind'>): AmplitudesState => ({ kind: 'amplitudes', ...x })
const pl = (x: Omit<PlotState, 'kind'>): PlotState => ({ kind: 'plot', ...x })
const svg = (node: ReturnType<typeof createElement>) => renderToString(createElement('svg', null, node))
const PE = phaseEstimationCircuit(1 / 3, 3)
const KICKED = phaseEstimationCircuit(5 / 8, 3)

describe('amplitudes: keep draws the chances of the first wires only', () => {
  const st = (keep: number, circuit = PE, upTo = circuit.columns.length) => amp({ state: { circuit, upTo }, mode: 'probability', keep })
  it('the bars are the engine’s marginal of the first three wires of the final state: 8 bars that add to 1, 0.6878 at 011 and 0.1749 at 010 for τ = 1/3', () => {
    const r = resolveAmplitudes(st(3), 1)
    expect(r.n).toBe(3)
    expect(r.probs).toHaveLength(8)
    const run = runCircuit(PE)
    const want = marginal(run.states[run.states.length - 1], [0, 1, 2])
    r.probs.forEach((p, k) => expect(p).toBeCloseTo(want[k], 12))
    expect(r.probs.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 12)
    expect(r.probs[3]).toBeCloseTo(0.6878, 4)
    expect(r.probs[2]).toBeCloseTo(0.1749, 4)
    expect(r.keep).toBe(3)
    r.probs.forEach((p, k) => expect(r.sizes[k] ** 2).toBeCloseTo(p, 12))
  })
  it('after the controlled powers (column 4) the chances of the three counting wires are flat (⅛ each): the phase is in the amplitudes, not the chances', () => {
    const r = resolveAmplitudes(st(3, KICKED, 4), 1)
    r.probs.forEach((p) => expect(p).toBeCloseTo(0.125, 12))
  })
  it('a four-wire reading keeps four wires and agrees with readingOfCircuit; the labels are the kept wires’ bits', () => {
    const C = phaseEstimationCircuit(11 / 16, 4)
    const r = resolveAmplitudes(st(4, C), 1)
    expect(r.n).toBe(4)
    const want = readingOfCircuit(C, 4)
    r.probs.forEach((p, k) => expect(p).toBeCloseTo(want[k], 12))
    expect(r.probs[11]).toBeCloseTo(1, 12)
    const html = svg(createElement(AmplitudesScene, { state: r, mode: 'stage', width: 420, height: 300 }))
    expect(html).toContain('|1011⟩')
    expect(html).not.toContain('|10110⟩')
    expect(html).not.toMatch(/NaN|Infinity|undefined/)
  })
  it('the readout says "first 3 wires" and names the chances of the tallest bars; the old stages have no keep key', () => {
    const lines = ampReadouts(resolveAmplitudes(st(3), 1)).map((x) => x.text)
    expect(lines).toContain('first 3 wires')
    expect(lines.some((t) => /^P\(011\) = 68\.8 %$/.test(t))).toBe(true)
    const plain = resolveAmplitudes(amp({ state: { circuit: PE }, mode: 'probability' }), 1)
    expect('keep' in plain).toBe(false)
    expect(plain.n).toBe(4)
  })
  it('validation: probability only; not with dft, inBasis, sum, dials, spin or index labels; a whole number below the register’s wires', () => {
    expect(validateAmplitudes(st(3))).toEqual([])
    expect(validateStage(st(3))).toEqual([])
    expect(validateAmplitudes(amp({ state: { circuit: PE }, keep: 3 }))[0]).toMatch(/probability/)
    expect(validateAmplitudes(amp({ state: { circuit: PE }, mode: 'signed', keep: 3 }))[0]).toMatch(/probability/)
    expect(validateAmplitudes({ ...st(3), dft: true })[0]).toMatch(/dft/)
    expect(validateAmplitudes({ ...st(3), sum: [0, 1] })[0]).toMatch(/sum/)
    expect(validateAmplitudes({ ...st(3), dials: true })[0]).toMatch(/dials/)
    expect(validateAmplitudes({ ...st(3), labels: 'index' })[0]).toMatch(/labels/)
    expect(validateAmplitudes(st(4))[0]).toMatch(/fewer wires/)
    expect(validateAmplitudes(st(0))[0]).toMatch(/whole number/)
    expect(validateAmplitudes(st(1.5))[0]).toMatch(/whole number/)
  })
  it('a circuit beside it must still read the same circuit and cursor; a split with keep validates', () => {
    const circ: CircuitStageState = { kind: 'circuit', circuit: PE, upTo: PE.columns.length }
    expect(validateLayout({ layout: 'split', top: circ, bottom: st(3) })).toEqual([])
    expect(validateLayout({ layout: 'split', top: { ...circ, upTo: 4 }, bottom: st(3) })[0]).toMatch(/same circuit/)
  })
  it('interpolation: a reading and the whole register are different lists and switch at ½; two readings lerp and renormalise', () => {
    const whole = resolveAmplitudes(amp({ state: { circuit: PE }, mode: 'probability' }), 1)
    const kept = resolveAmplitudes(st(3), 1)
    expect((interpolate(whole, kept, 0.3) as ResolvedAmplitudes).keep).toBeUndefined()
    expect((interpolate(whole, kept, 0.7) as ResolvedAmplitudes).keep).toBe(3)
    const kept2 = resolveAmplitudes(st(3, KICKED), 1)
    const mid = interpolate(kept, kept2, 0.5) as ResolvedAmplitudes
    expect(mid.keep).toBe(3)
    expect(mid.probs.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 12)
  })
  it('the passport is its own and says the other wires are summed over; the drawer is the base amplitudes drawer plus one line', () => {
    const p = passportOf(st(3), 'qc709')
    expect(p.title).toBe('STATE · chances of the first wires')
    expect(p.note).toMatch(/^not a place/)
    expect(p.note).toContain('summed over')
    expect(p.fidelityKey).toBe('amplitudes')
    expect(Object.values(fidelityOf('amplitudes', 'qc709')).flat().map((x) => x.id)).toContain('qc-amp-keep-sum')
  })
  it('the scene draws the 8-bar reading in stage and print with the kept wires’ labels', () => {
    const r = resolve(st(3), 1) as ResolvedAmplitudes
    for (const mode of ['stage', 'print'] as const) {
      const html = svg(createElement(AmplitudesScene, { state: r, mode, width: 340, height: 280 }))
      expect(html, mode).not.toMatch(/NaN|Infinity|undefined/)
      expect((html.match(/data-anchor="bar-/g) ?? []).length).toBe(8)
      expect(html).toContain('|011⟩')
    }
  })
})

describe('amplitudes: dials on a four-wire register (16 bars, up from 8)', () => {
  it('four wires with dials validate and draw 16 dials; five wires still do not', () => {
    const ok = amp({ state: { circuit: KICKED, upTo: 4 }, dials: true })
    expect(validateAmplitudes(ok)).toEqual([])
    const r = resolve(ok, 1) as ResolvedAmplitudes
    const html = svg(createElement(AmplitudesScene, { state: r, mode: 'stage', width: 420, height: 320 }))
    expect((html.match(/<circle/g) ?? []).length).toBeGreaterThanOrEqual(16)
    expect(html).not.toMatch(/NaN|Infinity|undefined/)
    const five = amp({ state: { ket: '+++++' }, dials: true })
    expect(validateAmplitudes(five)[0]).toMatch(/at most 16 bars carry a dial/)
  })
  it('after the controlled powers eight of the sixteen bars are nonzero, all of size 0.3536, and their phases are those of U_F|101⟩', () => {
    const r = resolveAmplitudes(amp({ state: { circuit: KICKED, upTo: 4 }, dials: true }), 1)
    const live = r.sizes.map((s, k) => [s, k] as const).filter(([s]) => s > 1e-9)
    expect(live).toHaveLength(8)
    live.forEach(([s]) => expect(s).toBeCloseTo(1 / Math.sqrt(8), 12))
    live.forEach(([, k], y) => {
      expect(k).toBe((y << 1) | 1)
      expect((((r.phases[k] * 180) / Math.PI + 360) % 360)).toBeCloseTo((225 * y) % 360, 6)
    })
  })
})

describe('plot: the curve peBest3 (the best reading of phase estimation on three wires)', () => {
  const P = (x: Omit<PlotState, 'kind'>): ResolvedPlot => resolvePlotStage(pl(x), 1)
  it('samples the engine’s peBest(τ, 3): 1 at each eighth, 0.4105 midway between two, never below 4/π², over the default range 0 to 1', () => {
    const r = P({ curve: { fn: 'peBest3', samples: 256 }, markers: [{ x: 0.625 }, { x: 0.6875 }, { x: 1 / 3 }] })
    expect(r.range).toEqual({ from: 0, to: 1 })
    expect(r.points).toHaveLength(257)
    r.points.forEach((p) => expect(p.y).toBeCloseTo(peBest(p.x, 3), 12))
    expect(r.markers.map((m) => m.y)).toEqual([peBest(0.625, 3), peBest(0.6875, 3), peBest(1 / 3, 3)])
    expect(r.markers[0].y).toBeCloseTo(1, 12)
    expect(r.markers[1].y).toBeCloseTo(peWorstBest(3), 12)
    expect(r.markers[2].y).toBeCloseTo(0.6878, 4)
    expect(Math.min(...r.points.map((p) => p.y))).toBeGreaterThan(4 / Math.PI ** 2)
    expect(r.xLabel).toBe('τ')
    expect(r.xDigits).toBe(4)
  })
  it('the chance axis is never padded past 1 or below 0, and a reference line at 4/π² sits under the curve', () => {
    const r = P({ curve: { fn: 'peBest3', samples: 256 }, yLines: [{ y: 4 / Math.PI ** 2, label: '4/π²' }] })
    expect(r.yMax).toBeLessThanOrEqual(1)
    expect(r.yMin).toBeGreaterThanOrEqual(0)
    expect(r.yMin).toBeLessThan(4 / Math.PI ** 2)
  })
  it('validation: a marker must lie in 0 … 1; 256 samples is allowed; the curve name is known', () => {
    expect(validatePlotStage(pl({ curve: { fn: 'peBest3', samples: 256 }, markers: [{ x: 0.625 }] }))).toEqual([])
    expect(validatePlotStage(pl({ curve: { fn: 'peBest3' }, markers: [{ x: 1.5 }] }))[0]).toMatch(/outside the drawn range/)
    expect(validateStage(pl({ curve: { fn: 'peBest3', samples: 256 } }))).toEqual([])
    expect(validatePlotStage(pl({ curve: { fn: 'peBest3' }, yScale: 'log' }))).toEqual([])
  })
  it('readouts name the markers with their x to four digits and the curve’s y', () => {
    const lines = plotReadouts(P({ curve: { fn: 'peBest3', samples: 64 }, markers: [{ x: 0.6875 }] })).map((x) => x.text)
    expect(lines[0]).toBe('τ ∈ [0, 1]')
    expect(lines.some((t) => /marker: y\(0\.6875\) = 0\.411/.test(t))).toBe(true)
  })
  it('the scene draws the curve in stage and print with the axis name τ and the 4/π² label, with no NaN', () => {
    const r = resolve(pl({ curve: { fn: 'peBest3', samples: 256 }, yLines: [{ y: 4 / Math.PI ** 2, label: '4/π²' }], markers: [{ x: 0.6875 }] }), 1) as ResolvedPlot
    for (const mode of ['stage', 'print'] as const) {
      const html = svg(createElement(PlotScene, { state: r, mode, width: 340, height: 300 }))
      expect(html, mode).not.toMatch(/NaN|Infinity|undefined/)
      expect(html).toContain('>τ<')
      expect(html).toContain('>4/π²<')
    }
  })
})

describe('amplitudes scene (Q18-B): crowded value labels, readouts that leave room for the dial row, a reading names its tallest bars', () => {
  const draw = (st: AmplitudesState, width: number) => svg(createElement(AmplitudesScene, { state: resolve(st, 1) as ResolvedAmplitudes, mode: 'stage', width, height: 320 }))
  it('eight complex bars in a narrow pane print each bar’s SIZE (0.35), where a wide pane still prints the whole amplitude', () => {
    const narrow = draw(amp({ state: { ket: '101' }, dft: true, dials: true }), 340)
    expect(narrow).toContain('>0.35<')
    expect(narrow).not.toMatch(/0\.25 [−-] 0\.25i|0\.25 \+ 0\.25i/)
    const wide = draw(amp({ state: { ket: '101' }, dft: true, dials: true }), 1100)
    expect(wide).toMatch(/0\.25 [−+] 0\.25i/)
    // real amplitudes never crowd: the signed Grover bars keep their signs
    expect(draw(amp({ state: { circuit: KICKED, upTo: 1 }, mode: 'signed' }), 340)).not.toContain('NaN')
  })
  it('with dials the readout column names two bars (the dials show every phase) and a reading names its two TALLEST bars', () => {
    const dialled = ampReadouts(resolveAmplitudes(amp({ state: { ket: '101' }, dft: true, dials: true }), 1)).map((x) => x.name)
    expect(dialled.filter((n) => n.startsWith('bar-'))).toHaveLength(2)
    const reading = ampReadouts(resolveAmplitudes(amp({ state: { circuit: PE }, mode: 'probability', keep: 3 }), 1)).map((x) => x.text)
    expect(reading).toContain('P(011) = 68.8 %')
    expect(reading).toContain('P(010) = 17.5 %')
    expect(reading.some((t) => /smaller bars$/.test(t))).toBe(true)
  })
})

describe('circuit scene (Q18): a controlled unitary is joined to its control; a box never outgrows its column', () => {
  const drawCircuit = (circuit: CircuitStageState, width: number) => svg(createElement(CircuitScene, { state: resolve(circuit, 1) as ResolvedCircuit, mode: 'stage', width, height: 360 }))
  const vertical = (html: string) => [...html.matchAll(/<line x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)" y2="([\d.]+)" class="fg-op" stroke-width="1.6"/g)].filter((m) => m[1] === m[3])
  it('the counting circuit draws a line from each of the three control dots to its Q box, besides the links of the QFT gates and the swap', () => {
    const st: CircuitStageState = { kind: 'circuit', circuit: countingCircuit(2, [3], 3), upTo: 11 }
    const html = drawCircuit(st, 528)
    // three controlled R_k† links and one SWAP link (the inverse QFT of 3 wires), plus the three Q feeds
    expect(vertical(html)).toHaveLength(3 + 3 + 1)
    expect(html).not.toMatch(/NaN|undefined/)
  })
  it('sixteen columns on five wires: no gate box is wider than its column, so R₄†, R₃†, R₂† and H do not overlap', () => {
    const st: CircuitStageState = { kind: 'circuit', circuit: phaseEstimationCircuit(11 / 16, 4), upTo: 16 }
    const html = drawCircuit(st, 528)
    const widths = [...html.matchAll(/<rect x="[\d.]+" y="[\d.]+" width="([\d.]+)" height="[\d.]+" rx="3" class="fg-op"/g)].map((m) => Number(m[1]))
    expect(widths).toHaveLength(18) // 4 H + 4 controlled powers + the inverse QFT's 4 H and 6 controlled turns
    const colW = (528 - 24 - (24 + 64)) / 16
    expect(Math.max(...widths)).toBeLessThanOrEqual(Math.max(18, colW * 0.94) + 1e-9)
  })
})
