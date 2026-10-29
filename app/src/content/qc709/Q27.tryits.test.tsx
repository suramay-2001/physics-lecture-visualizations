/**
 * Chapter Q27's Try-it lines against the REAL widgets (existing widgets only, plan §9.3: no new widget). Each unit's `visual` names a widget and the props it passes; each `tryThis`
 * line quotes what that widget draws. Three checks keep a line true:
 *  1. every prop is one the widget declares (read from its source), the values lie in the controls' ranges, and every control a line tells the reader to use is in the code;
 *  2. every readout a line quotes is what the widget really renders (rendered to markup) at the start or at the setting the line names;
 *  3. every number a line promises after the reader acts is recomputed here through the engine functions the widget calls and tied to the chapter's own values.
 * The transmon Try-it is an SVG widget (amplitude-bars, not the Bloch sphere): the chapter's stages are all SVG kinds, so the chapter draws no canvas.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { AmplitudeBars } from '../../widgets/AmplitudeBars'
import ampSrc from '../../widgets/AmplitudeBars.tsx?raw'
import ComplexPlaneQc, { ROOTS_RANGE, rootsUse } from '../../widgets/ComplexPlaneQc'
import PairGrid from '../../widgets/PairGrid'
import pairSrc from '../../widgets/PairGrid.tsx?raw'
import { PhaseDial } from '../../widgets/PhaseDial'
import phaseSrc from '../../widgets/PhaseDial.tsx?raw'
import TwoClocks, { MEAN_RANGE, clocksModel } from '../../widgets/TwoClocks'
import clocksSrc from '../../widgets/TwoClocks.tsx?raw'
import { blochKet } from '../../physics/qc/machines'
import type { Unit } from '../schema'
import { Q27 } from './Q27'
import { V } from './Q27.values'

const unit = (id: string): Unit => Q27.units.find((u) => u.id === id)!
const lines = (id: string): string => unit(id).visual.tryThis.join(' ')
const props = (id: string) => unit(id).visual.props as Record<string, unknown>
/** The text of a server-rendered widget, markup and comment separators removed. */
const text = (html: string): string =>
  html
    .replace(/&amp;/g, '&')
    .replace(/&#x27;/g, "'")
    .replace(/<!--.*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
const declared = (src: string, iface: string): string[] => {
  const body = new RegExp(`export interface ${iface}\\s*\\{([\\s\\S]*?)\\n\\}`).exec(src)?.[1] ?? ''
  return [...body.matchAll(/^\s*(\w+)\??:/gm)].map((m) => m[1])
}
const trySentences = (line: string): string[] => line.replace(/\b(pp?|Fig|Eq|vs)\./g, '$1').split(/(?<=[.!?])\s+/).filter(Boolean)
const tryWords = (s: string): number => s.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length

describe('Q27 Try-its: every prop reaches the widget', () => {
  it('each unit names a widget of its own kind and passes only props that widget declares, with values in the controls’ ranges', () => {
    expect(declared(clocksSrc, 'TwoClocksProps')).toEqual(['upper', 'lower', 'start', 'editable'])
    expect(declared(phaseSrc, 'PhaseDialProps')).toEqual(['theta', 'rotations'])
    expect(declared(ampSrc, 'AmplitudeBarsProps')).toEqual(['state', 'basis', 'editable'])
    expect(declared(pairSrc, 'PairGridProps')).toEqual(['mode', 'frame', 'alice', 'bob', 'preset', 't', 'coins', 'pA', 'pB', 'showDet'])
    expect(Object.fromEntries(Q27.units.map((u) => [u.id, u.visual.kind]))).toEqual({
      'q27-lc': 'two-clocks',
      'q27-superconductivity': 'complex-plane',
      'q27-josephson': 'phase-dial',
      'q27-transmon': 'amplitude-bars',
      'q27-cqed': 'pair-grid',
      'q27-dots': 'two-clocks',
    })
    const src: Record<string, [string, string]> = { 'two-clocks': [clocksSrc, 'TwoClocksProps'], 'phase-dial': [phaseSrc, 'PhaseDialProps'], 'amplitude-bars': [ampSrc, 'AmplitudeBarsProps'], 'pair-grid': [pairSrc, 'PairGridProps'] }
    for (const u of Q27.units.filter((x) => x.visual.kind !== 'complex-plane')) {
      const [s, i] = src[u.visual.kind]
      expect(Object.keys(props(u.id)).filter((k) => !declared(s, i).includes(k)), `${u.id}: props the widget ignores`).toEqual([])
    }
    const roots = props('q27-superconductivity') as { N: number; j: number }
    expect(roots.N).toBeGreaterThanOrEqual(ROOTS_RANGE.nMin)
    expect(roots.N).toBeLessThanOrEqual(ROOTS_RANGE.nMax)
    expect(roots.j).toBeGreaterThanOrEqual(ROOTS_RANGE.jMin)
    expect(roots.j).toBeLessThanOrEqual(ROOTS_RANGE.jMax)
    expect(phaseSrc).toContain('min={-180} max={180} step={5}')
    expect(pairSrc).toContain('label="t" value={t} min={0} max={90} step={5}')
  })
})

describe('Q27 Try-it: the LC unit (two clocks, mean energy)', () => {
  it('raising the mean energy from 2ε to 4ε changes the hands but not the gap or P(+x), as the line says', () => {
    const p = props('q27-lc') as { upper: number; lower: number }
    expect((p.upper + p.lower) / 2).toBe(2)
    expect(4).toBeLessThanOrEqual(MEAN_RANGE.max)
    const two = clocksModel({ mean: 2, hbarOmega: p.upper - p.lower, start: '+x', timeDeg: 45 })
    const four = clocksModel({ mean: 4, hbarOmega: p.upper - p.lower, start: '+x', timeDeg: 45 })
    expect(four.lines[1]).not.toBe(two.lines[1])
    expect(four.lines[2]).toBe(two.lines[2])
    expect(four.lines[3]).toBe(two.lines[3])
    expect(four.r.bloch.map((x) => x.toFixed(9))).toEqual(two.r.bloch.map((x) => x.toFixed(9)))
    expect(clocksSrc).toContain('label="mean energy Ē"')
    expect(lines('q27-lc')).toContain('Raise the mean energy Ē from 2ε to 4ε')
    expect(lines('q27-lc')).toContain('the gap, P(+x) and the arrow do not change')
  })
})

describe('Q27 Try-it: the superconductivity unit (complex-plane roots, N = 6, j = 1)', () => {
  it('six arrows close with sum = 0, and the note reads “corners used: 6 of 6, each 1 time”', () => {
    expect(rootsUse(6, 1)).toEqual({ corners: 6, each: 1 })
    const t = text(renderToString(<ComplexPlaneQc mode="roots" N={6} j={1} />))
    expect(t).toContain('sum = 0')
    expect(t).toContain('corners used: 6 of 6, each 1 time')
    expect(lines('q27-superconductivity')).toContain('“sum = 0”')
    expect(lines('q27-superconductivity')).toContain('“corners used: 6 of 6, each 1 time”')
    expect(lines('q27-superconductivity')).toContain('Six arrows 60° apart')
  })
})

describe('Q27 Try-it: the Josephson unit (phase dial at 90°)', () => {
  it('the readout at the start is “relative phase arg(β/α) = 90°”, and 180° is on the dial’s range', () => {
    const t = text(renderToString(<PhaseDial {...(props('q27-josephson') as { theta: number; rotations: boolean })} />))
    expect(t).toContain('relative phase arg(β/α) = 90°')
    expect(lines('q27-josephson')).toContain('“relative phase arg(β/α) = 90°”')
    expect(Math.sin(Math.PI / 2)).toBe(1)
    expect(Math.abs(Math.sin(Math.PI))).toBeLessThan(1e-15)
    expect(lines('q27-josephson')).toContain('set φ to 180° and the current is 0')
  })
})

describe('Q27 Try-it: the transmon unit (amplitude bars at θ = 90°)', () => {
  it('the two amplitudes are 1/√2 and the bars read +z 50.0% and −z 50.0%', () => {
    const t = text(renderToString(<AmplitudeBars {...(props('q27-transmon') as { state: [number, number]; basis: 'z'; editable: boolean })} />))
    expect(t).toContain('+z 50.0% −z 50.0%')
    expect(t).toContain('\\tfrac{1}{\\sqrt2}')
    const psi = blochKet(90, 0)
    expect(psi[0].re ** 2).toBeCloseTo(0.5, 12)
    expect(psi[1].re ** 2).toBeCloseTo(0.5, 12)
    expect(lines('q27-transmon')).toContain('the +z and −z bars read 50.0% each')
    expect(lines('q27-transmon')).toContain('the two amplitudes are 1/√2')
    expect(V.q27CosElem).toBe(0.5)
  })
})

describe('Q27 Try-it: the circuit-QED unit (pair grid, the ud–du family at t = 45°)', () => {
  it('equal weights on |ud⟩ and |du⟩: “Alice: u 0.5, d 0.5” and the real amplitudes 1/√2 and −1/√2', () => {
    const p = props('q27-cqed') as { preset: 'family'; t: number }
    expect(p.preset).toBe('family')
    expect(p.t).toBe(0)
    const t = text(renderToString(<PairGrid preset="family" t={45} />))
    expect(t).toContain('Alice: u 0.5, d 0.5')
    expect(t).toContain('Bob: u 0.5, d 0.5')
    expect(t).toContain('1/√2 −1/√2')
    expect(lines('q27-cqed')).toContain('Slide t to 45°')
    expect(lines('q27-cqed')).toContain('its relative sign is −1 where the exchange has −i')
    expect(V.q27ISwapQuarterP).toBe(0.5)
  })
})

describe('Q27 Try-it: the dots unit (two clocks, gap of one unit)', () => {
  it('at 90° the gap reads 90° and the arrow on the equator points along +y', () => {
    const p = props('q27-dots') as { upper: number; lower: number }
    const m = clocksModel({ mean: (p.upper + p.lower) / 2, hbarOmega: p.upper - p.lower, start: '+x', timeDeg: 90 })
    expect(m.lines).toContain('gap = 90°')
    expect(m.r.bloch[0]).toBeCloseTo(0, 9)
    expect(m.r.bloch[1]).toBeCloseTo(1, 9)
    expect(m.r.bloch[2]).toBeCloseTo(0, 9)
    const t = text(renderToString(<TwoClocks {...(p as { upper: number; lower: number })} />))
    expect(t).toContain('time εt/ħ')
    expect(lines('q27-dots')).toContain('Drag the time slider to 90°')
    expect(lines('q27-dots')).toContain('gap = 90°')
    expect(lines('q27-dots')).toContain('points along +y')
  })
})

describe('Q27 Try-it lines are plain: at most 25 words a sentence, one or two lines a unit', () => {
  it('lengths', () => {
    const long = Q27.units.flatMap((u) => u.visual.tryThis.flatMap((line, i) => trySentences(line).map((s) => ({ at: `${u.id}[${i}]`, words: tryWords(s), s })).filter((x) => x.words > 25)))
    expect(long).toEqual([])
    expect(Q27.units.map((u) => u.visual.tryThis.length)).toEqual([1, 1, 1, 1, 1, 1])
  })
})
