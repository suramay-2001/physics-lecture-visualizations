/**
 * Chapter Q21's Try-it lines against the REAL widgets (existing widgets only: bit-table, amplitude-bars, complex-plane; each line is checked against the widget's code).
 * Each unit's `visual` names a widget and the props it passes; each `tryThis` line quotes what that widget draws. Three checks keep a line true:
 *  1. every prop is one the widget declares and the values lie in the controls' ranges,
 *  2. every readout a line quotes is what the widget really renders at the start (the widget is rendered to markup and its text compared), and
 *  3. every number a line promises AFTER the reader acts (a Step pressed, a place flipped, a slider moved, an arrow dragged) is recomputed here through the engine functions the
 *     widget calls (reduceModel, dotMod2, costModel, phasorSum, the amplitude bars' state) and tied to the chapter's own values.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { dotMod2 } from '../../physics/qc/bits'
import { phasorSum } from '../../physics/qc/complexExtra'
import { AmplitudeBars } from '../../widgets/AmplitudeBars'
import amplitudeBarsSrc from '../../widgets/AmplitudeBars.tsx?raw'
import BitTable, { costModel, reduceModel } from '../../widgets/BitTable'
import bitTableSrc from '../../widgets/BitTable.tsx?raw'
import ComplexPlaneQc from '../../widgets/ComplexPlaneQc'
import complexPlaneQcSrc from '../../widgets/ComplexPlaneQc.tsx?raw'
import type { Unit } from '../schema'
import { Q21 } from './Q21'
import { V } from './Q21.values'

const DEG = Math.PI / 180
const unit = (id: string): Unit => Q21.units.find((u) => u.id === id)!
const tries = (id: string): string => unit(id).visual.tryThis.join(' ')
const props = (id: string) => unit(id).visual.props as Record<string, unknown>
const clean = (html: string): string => html.replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/<!--.*?-->/g, '')
const text = (html: string): string => clean(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
const declared = (src: string, iface: string): string[] => {
  const body = new RegExp(`export interface ${iface}\\s*\\{([\\s\\S]*?)\\n\\}`).exec(src)?.[1] ?? ''
  return [...body.matchAll(/^\s*(\w+)\??:/gm)].map((m) => m[1])
}
const bars = (state: [number, number], basis: 'x' | 'z') => text(renderToString(<AmplitudeBars state={state} basis={basis} />))
const strings = (a: string, b: string) => text(renderToString(<BitTable mode="strings" a={a} b={b} combine="dot" />))

describe('Q21 Try-its: every prop reaches the widget', () => {
  it('each spec names a widget and passes only props the widget declares', () => {
    expect(declared(bitTableSrc, 'BitTableProps')).toEqual(['mode', 'gate', 'view', 'a', 'b', 'combine', 'rows', 'n'])
    expect(declared(amplitudeBarsSrc, 'AmplitudeBarsProps')).toEqual(['state', 'basis', 'editable'])
    expect(declared(complexPlaneQcSrc, 'ComplexPlaneQcProps')).toEqual(['mode', 'phi', 'n', 'phases', 'N', 'j'])
    const kinds: Record<string, string> = {
      'q21-classical': 'bit-table',
      'q21-bit-flip': 'bit-table',
      'q21-phase-flip': 'amplitude-bars',
      'q21-shor': 'bit-table',
      'q21-digitize': 'amplitude-bars',
      'q21-kl': 'bit-table',
      'q21-dfs': 'complex-plane',
    }
    for (const [id, kind] of Object.entries(kinds)) expect(unit(id).visual.kind, id).toBe(kind)
    const allowed: Record<string, string[]> = { reduce: ['mode', 'rows'], strings: ['mode', 'a', 'b', 'combine'], cost: ['mode', 'n'] }
    for (const id of ['q21-classical', 'q21-bit-flip', 'q21-shor', 'q21-kl']) {
      const p = props(id)
      expect(Object.keys(allowed), id).toContain(p.mode)
      expect(Object.keys(p).filter((k) => !allowed[p.mode as string].includes(k)), id).toEqual([])
    }
    for (const id of ['q21-phase-flip', 'q21-digitize']) expect(Object.keys(props(id)).sort(), id).toEqual(['basis', 'state'])
    expect(Object.keys(props('q21-dfs')).sort()).toEqual(['mode', 'phases'])
    expect(props('q21-dfs').mode).toBe('phasor')
  })
  it('the controls the lines name are in the widgets’ code: Step and Add a row, the place buttons, the measure choice, the φ slider, the phase sliders', () => {
    expect(bitTableSrc).toContain('Step')
    expect(bitTableSrc).toContain('Add a row')
    expect(bitTableSrc).toContain("aria-label={`${label}, place ${k + 1}: ${b}`}")
    expect(amplitudeBarsSrc).toContain('measure ')
    expect(amplitudeBarsSrc).toContain('\\phi')
    expect(complexPlaneQcSrc).toContain('`phase of arrow ${k + 1}`')
    expect(complexPlaneQcSrc).toContain('min={0} max={360} step={5}')
  })
})

describe('Q21 Try-it: the classical unit (bit-table reduce, rows 110 and 011)', () => {
  const rows = (props('q21-classical') as { rows: string[] }).rows
  it('one Step is “add row 2 to row 1”, then rank 2 and the null space 000, 111: exactly the two code words', () => {
    expect(rows).toEqual(['110', '011'])
    const done = reduceModel({ rows, step: reduceModel({ rows, step: 0 }).total })
    expect(done.lines).toEqual(['move 1 of 1', 'add row 2 to row 1', 'rank 2', 'null space: 000, 111'])
    expect(V.q21RepNullWords).toBe(2)
  })
  it('a third row 101 = 110 ⊕ 011 changes neither the rank nor the null space', () => {
    const three = [...rows, '101']
    const done = reduceModel({ rows: three, step: reduceModel({ rows: three, step: 0 }).total })
    expect(done.lines).toContain('rank 2')
    expect(done.lines).toContain('null space: 000, 111')
  })
  it('the lines say exactly that', () => {
    const t = tries('q21-classical')
    for (const s of ['“add row 2 to row 1”', '“rank 2”', '“null space: 000, 111”', 'Add a row', '101 = 110 ⊕ 011']) expect(t, s).toContain(s)
  })
})

describe('Q21 Try-it: the bit-flip and Shor units (bit-table strings with the dot product)', () => {
  it('bit-flip: a = 110 and b = 010 read “a·b = 1”; flipping places 1 and 3 of row a (counted left to right) makes 011, which still does; b = 001 gives 0 for check 1 and 1 for check 2, the syndrome 01', () => {
    const p = props('q21-bit-flip') as { a: string; b: string; combine: string }
    expect([p.a, p.b, p.combine]).toEqual(['110', '010', 'dot'])
    expect(strings(p.a, p.b)).toContain('a·b = 1')
    // the widget's own flip, and its place labels count left to right from 1
    expect(bitTableSrc).toContain("const flip = (s: string, k: number): string => `${s.slice(0, k)}${s[k] === '1' ? '0' : '1'}${s.slice(k + 1)}`")
    expect(bitTableSrc).toContain('place ${k + 1}')
    const flip = (s: string, k: number): string => `${s.slice(0, k)}${s[k] === '1' ? '0' : '1'}${s.slice(k + 1)}`
    const flipped = flip(flip(p.a, 1 - 1), 3 - 1)
    expect(flipped).toBe('011')
    expect(flip(flip(p.a, 1 - 1), 2 - 1)).toBe('000')
    expect(strings(flipped, p.b)).toContain('a·b = 1')
    expect(dotMod2(0b011, 0b010)).toBe(1)
    expect(dotMod2(0b110, 0b001)).toBe(0)
    expect(dotMod2(0b011, 0b001)).toBe(1)
    expect(V.q21T91X3).toBe(0b01)
    const t = tries('q21-bit-flip')
    for (const s of ['“a·b = 1”', 'place 1 and place 3 of row a', '110', '011', '001', 'syndrome of qubit 3']) expect(t, s).toContain(s)
  })
  it('shor: a = 110, b = 100 read “a·b = 1”; a = 011 gives 0, so group 1 reads (−1, +1), the helper pattern 10', () => {
    const p = props('q21-shor') as { a: string; b: string }
    expect([p.a, p.b]).toEqual(['110', '100'])
    expect(strings(p.a, p.b)).toContain('a·b = 1')
    expect(dotMod2(0b011, 0b100)).toBe(0)
    expect(V.q21ShorZg1).toBe(0b10)
    const t = tries('q21-shor')
    for (const s of ['“a·b = 1”', '011', '(-1, +1)', 'Unit 21.4']) expect(t, s).toContain(s)
  })
})

describe('Q21 Try-it: the phase-flip and digitize units (amplitude bars)', () => {
  it('phase-flip: |+x⟩ reads +x 100.0%; φ = 180° (that is Z) reads −x 100.0%; in the z basis it is +z 50.0% and −z 50.0%', () => {
    expect(props('q21-phase-flip')).toEqual({ state: [90, 0], basis: 'x' })
    expect(bars([90, 0], 'x')).toContain('+x 100.0%')
    expect(bars([90, 180], 'x')).toContain('−x 100.0%')
    const z = bars([90, 180], 'z')
    expect(z).toContain('+z 50.0%')
    expect(z).toContain('−z 50.0%')
    const t = tries('q21-phase-flip')
    for (const s of ['“+x 100.0%”', '“−x 100.0%”', '“+z 50.0% −z 50.0%”', '180°']) expect(t, s).toContain(s)
  })
  it('digitize: a 20° tilt reads +z 97.0% and −z 3.0%, tied to cos² 10° and sin² 10°', () => {
    expect(props('q21-digitize')).toEqual({ state: [20, 0], basis: 'z' })
    const b = bars([20, 0], 'z')
    expect(b).toContain('+z 97.0%')
    expect(b).toContain('−z 3.0%')
    expect(Math.cos(10 * DEG) ** 2).toBeCloseTo(0.9698, 4)
    expect(tries('q21-digitize')).toContain('“+z 97.0% −z 3.0%”')
  })
})

describe('Q21 Try-it: the Knill–Laflamme unit (bit-table cost) and the dephasing unit (phasor)', () => {
  it('kl: the cost line reads n = 5: n² = 25, 2ⁿ = 32 (the 2 × 16 rooms); at n = 4 it is 2ⁿ = 16, below the 26 rooms needed', () => {
    expect(props('q21-kl')).toEqual({ mode: 'cost', n: 5 })
    expect(text(renderToString(<BitTable mode="cost" n={5} />))).toContain('n = 5: n² = 25, 2ⁿ = 32')
    expect(costModel({ n: 5, vs: 'nSquared' }).costs.exp).toBe(V.q21Qhb5)
    expect(costModel({ n: 4, vs: 'nSquared' }).costs.exp).toBe(V.q21Qhb4Have)
    expect(V.q21Qhb4Need).toBeGreaterThan(V.q21Qhb4Have)
    const t = tries('q21-kl')
    for (const s of ['“n = 5: n² = 25, 2ⁿ = 32”', '2 \\times 16', '“2ⁿ = 16”', '26 rooms']) expect(t, s).toContain(s)
  })
  it('dfs: phases 60° and 300° read “sum = 1; size 1”, so their average z is 0.5; turning arrow 2 to 240° reads sum = 0, so z = 0', () => {
    expect(props('q21-dfs')).toEqual({ mode: 'phasor', phases: [60, 300] })
    const start = text(renderToString(<ComplexPlaneQc mode="phasor" phases={[60, 300]} />))
    expect(start).toContain('sum = 1')
    expect(start).toContain('size 1')
    const s = phasorSum([60 * DEG, 300 * DEG])
    expect(s.re).toBeCloseTo(1, 12)
    expect(s.re / 2).toBeCloseTo(V.q21Z60, 12)
    expect(text(renderToString(<ComplexPlaneQc mode="phasor" phases={[60, 240]} />))).toContain('sum = 0')
    const turned = phasorSum([60 * DEG, 240 * DEG])
    expect(Math.hypot(turned.re, turned.im)).toBeLessThan(1e-12)
    const t = tries('q21-dfs')
    for (const x of ['“sum = 1; size 1”', '0.5', 'arrow 2', '240°', '“sum = 0”']) expect(t, x).toContain(x)
  })
})
