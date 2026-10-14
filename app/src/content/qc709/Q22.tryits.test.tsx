/**
 * Chapter Q22's Try-it lines against the REAL widgets (every widget exists; no new widget is needed). Each unit's `visual` names a widget and the props it passes; each
 * `tryThis` line quotes what that widget draws. Three checks keep a line true:
 *  1. every prop is one the widget declares (read from its source), and every control a line tells the reader to use is in the code;
 *  2. every readout a line quotes is what the widget really renders at the start (rendered to markup and compared), and
 *  3. every result a line promises AFTER the reader acts (a Step pressed, a place flipped, φ set) is recomputed here through the engine functions the widget calls
 *     (reduceModel, stringsModel, costModel) and tied to the chapter's own values.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { S } from '../../physics/qc/gates'
import { apply } from '../../physics/linalg'
import { ket } from '../../physics/qc/state'
import { linearCode } from '../../physics/qec/q22'
import { AmplitudeBars } from '../../widgets/AmplitudeBars'
import ampBarsSrc from '../../widgets/AmplitudeBars.tsx?raw'
import BitTable, { costModel, reduceModel, stringsModel } from '../../widgets/BitTable'
import bitTableSrc from '../../widgets/BitTable.tsx?raw'
import type { Unit } from '../schema'
import { Q22 } from './Q22'
import { M_7, V } from './Q22.values'

const unit = (id: string): Unit => Q22.units.find((u) => u.id === id)!
const tries = (id: string): string => unit(id).visual.tryThis.join(' ')
const props = (id: string) => unit(id).visual.props as Record<string, unknown>
const clean = (html: string): string => html.replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/<!--.*?-->/g, '')
const text = (html: string): string => clean(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
const declared = (src: string, iface: string): string[] => {
  const body = new RegExp(`export interface ${iface}\\s*\\{([\\s\\S]*?)\\n\\}`).exec(src)?.[1] ?? ''
  return [...body.matchAll(/^\s*(\w+)\??:/gm)].map((m) => m[1])
}
const flip = (s: string, k: number): string => `${s.slice(0, k)}${s[k] === '1' ? '0' : '1'}${s.slice(k + 1)}`
const last = (rows: string[]) => {
  const total = reduceModel({ rows, step: 0 }).total
  return reduceModel({ rows, step: total }).lines.join(' | ')
}

describe('Q22 Try-its: every prop reaches the widget', () => {
  it('each spec names a widget and passes only props the widget declares', () => {
    expect(declared(bitTableSrc, 'BitTableProps')).toEqual(['mode', 'gate', 'view', 'a', 'b', 'combine', 'rows', 'n'])
    expect(declared(ampBarsSrc, 'AmplitudeBarsProps')).toEqual(['state', 'basis', 'editable'])
    const allowed: Record<string, string[]> = { reduce: ['mode', 'rows'], strings: ['mode', 'a', 'b', 'combine'], cost: ['mode', 'n'] }
    for (const id of ['q22-linear-codes', 'q22-stabilizer', 'q22-check-matrix', 'q22-css', 'q22-decode', 'q22-gottesman-knill']) {
      expect(unit(id).visual.kind, id).toBe('bit-table')
      const p = props(id)
      expect(Object.keys(allowed), id).toContain(p.mode)
      expect(Object.keys(p).filter((k) => !allowed[p.mode as string].includes(k)), id).toEqual([])
    }
    expect(unit('q22-clifford').visual.kind).toBe('amplitude-bars')
    expect(Object.keys(props('q22-clifford')).sort()).toEqual(['basis', 'state'])
  })
  it('the controls the lines name are in the widgets’ code: Step and the place buttons, the φ control', () => {
    expect(bitTableSrc).toContain('Step')
    expect(bitTableSrc).toContain("aria-label={`${label}, place ${k + 1}: ${b}`}")
    expect(bitTableSrc).toContain('label={`row ${i + 1}`}')
    expect(ampBarsSrc).toContain('φ')
  })
})

describe('Q22 Try-it: the linear-codes unit (reduce, the four checks of the [6, 2] code)', () => {
  const rows = ['110000', '101000', '000110', '000101']
  it('the end of the elimination reads rank 4 and the four code words, as the line says', () => {
    expect(props('q22-linear-codes').rows).toEqual(rows)
    expect(tries('q22-linear-codes')).toContain('“rank 4”')
    const end = last(rows)
    expect(end).toContain('rank 4')
    expect(end).toContain('null space: 000000, 000111, 111000, 111111')
    expect(text(renderToString(<BitTable mode="reduce" rows={rows} />))).toContain('Step')
  })
  it('flipping place 1 of row 2 keeps the rank at 4 and changes the null space', () => {
    const edited = rows.map((r, i) => (i === 1 ? flip(r, 0) : r))
    expect(edited[1]).toBe('001000')
    const end = last(edited)
    expect(end).toContain('rank 4')
    expect(end).not.toContain('null space: 000000, 000111, 111000, 111111')
    expect(linearCode(['110000', '000111']).words()).toEqual(['000000', '000111', '110000', '110111'])
  })
})

describe('Q22 Try-it: the stabilizer unit (reduce, the rows of Z₁Z₂, Z₂Z₃, Z₁Z₃)', () => {
  const rows = ['000110', '000011', '000101']
  it('the end reads rank 2, so k = 3 − 2 = 1', () => {
    expect(props('q22-stabilizer').rows).toEqual(rows)
    expect(last(rows)).toContain('rank 2')
    expect(V.q22RankDep).toBe(2)
  })
  it('pressing place 4 of row 3 makes it 000001 and the rank 3', () => {
    const edited = rows.map((r, i) => (i === 2 ? flip(r, 3) : r))
    expect(edited[2]).toBe('000001')
    expect(last(edited)).toContain('rank 3')
  })
})

describe('Q22 Try-its: the strings widget (check matrix, CSS and decoding units)', () => {
  it('check matrix: a = 000110, b = 000100 gives a·b = 1; b = 011000 gives a·b = 0', () => {
    const p = props('q22-check-matrix')
    expect(p).toEqual({ mode: 'strings', a: '000110', b: '000100', combine: 'dot' })
    expect(stringsModel({ a: '000110', b: '000100', combine: 'dot' }).dot).toBe(1)
    expect(stringsModel({ a: '000110', b: '011000', combine: 'dot' }).dot).toBe(0)
    expect(text(renderToString(<BitTable mode="strings" a="000110" b="000100" combine="dot" />))).toContain('a·b = 1')
  })
  it('CSS: the Steane rows give a·b = 0 (overlap 2); 1100000 and 1010000 give a·b = 1', () => {
    expect(props('q22-css')).toEqual({ mode: 'strings', a: '0001111', b: '0110011', combine: 'dot' })
    expect(stringsModel({ a: '0001111', b: '0110011', combine: 'dot' }).dot).toBe(0)
    expect(text(renderToString(<BitTable mode="strings" a="0001111" b="0110011" combine="dot" />))).toContain('a·b = 0')
    expect(stringsModel({ a: '1100000', b: '1010000', combine: 'dot' }).dot).toBe(1)
    expect(V.q22Overlap).toBe(2)
  })
  it('decoding: the XOR of the error X₁X₂ and the fix X₃ is 1110000 (odd Hamming word); 1101000 ⊕ 0000001 is 1101001 (an X check)', () => {
    expect(props('q22-decode')).toEqual({ mode: 'strings', a: '1100000', b: '0010000', combine: 'xor' })
    expect(stringsModel({ a: '1100000', b: '0010000', combine: 'xor' }).xor).toBe('1110000')
    expect(text(renderToString(<BitTable mode="strings" a="1100000" b="0010000" combine="xor" />))).toContain('a ⊕ b = 1110000')
    expect(stringsModel({ a: '1101000', b: '0000001', combine: 'xor' }).xor).toBe('1101001')
    // 1110000 passes every check of the Hamming code but is not in the span of its checks (a logical X); 1101001 is in the span (a check)
    const checks = linearCode([...M_7])
    expect(checks.n).toBe(7)
    expect(linearCode(['0001111', '0110011', '1010101']).contains('1101001')).toBe(true)
    expect(linearCode(['0001111', '0110011', '1010101']).contains('1110000')).toBe(false)
  })
})

describe('Q22 Try-it: the Clifford unit (amplitude bars, |+x⟩ in the y basis)', () => {
  it('starts at 50 % for each y outcome', () => {
    expect(props('q22-clifford')).toEqual({ state: [90, 0], basis: 'y' })
    const t = text(renderToString(<AmplitudeBars state={[90, 0]} basis="y" />))
    expect(t).toContain('+y 50.0%')
    expect(t).toContain('−y 50.0%')
  })
  it('φ = 90° (the phase gate on |+x⟩) puts all the chance on +y', () => {
    const t = text(renderToString(<AmplitudeBars state={[90, 90]} basis="y" />))
    expect(t).toContain('+y 100.0%')
    const plusY = apply(S, ket('+'))
    // S|+x⟩ = (|0⟩ + i|1⟩)/√2, the +y state: its amplitudes 1/√2 and i/√2
    expect(plusY[1].im).toBeCloseTo(Math.SQRT1_2, 12)
    expect(plusY[0].re).toBeCloseTo(Math.SQRT1_2, 12)
  })
})

describe('Q22 Try-it: the Gottesman–Knill unit (cost, n = 50)', () => {
  it('at n = 50 the widget gives n² = 2500 and 2ⁿ = 1.1 × 10¹⁵', () => {
    expect(props('q22-gottesman-knill')).toEqual({ mode: 'cost', n: 50 })
    const t = text(renderToString(<BitTable mode="cost" n={50} />))
    expect(t).toContain('n² = 2500')
    expect(t).toContain('2ⁿ = 1.1 × 10¹⁵')
    const m = costModel({ n: 50, vs: 'nSquared' })
    expect(m.costs.sq).toBe(2500)
    expect(m.costs.exp / 1e15).toBeCloseTo(V.q22Amp50Mant, 12)
  })
})
