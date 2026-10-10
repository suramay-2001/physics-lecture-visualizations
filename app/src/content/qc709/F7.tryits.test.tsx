/**
 * Chapter F7's Try-it lines against the REAL widget (`bit-table`, widgets/BitTable.tsx). Each unit's `visual` names the widget and the props it passes; each
 * `tryThis` line quotes what the widget draws and what it says after the reader acts. Three checks keep a line true:
 *  1. every prop is one the widget declares (its own `BitTableProps`, read from the source), and every control a line tells the reader to press is in the
 *     widget's code (the gate buttons, the place buttons, Step, the a·b button, the n slider with a range that reaches the quoted value);
 *  2. every readout a line quotes is what the widget really renders at the start (rendered to markup, text compared), and
 *  3. every number or line a line promises AFTER the reader acts (a gate pressed, an input chosen, places flipped, Step pressed) is recomputed here through the
 *     same model functions the widget calls (gateModel, stringsModel, reduceModel, costModel), and tied to the chapter's own engine values.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { gateTable, gf2Nullspace, gf2Rank, gf2Span, hammingWeight, parseBits } from '../../physics/qc/bits'
import BitTable, { COST_RANGE, costModel, fmtCost, gateModel, reduceModel, stringsModel } from '../../widgets/BitTable'
import bitTableSrc from '../../widgets/BitTable.tsx?raw'
import type { Unit } from '../schema'
import { F7 } from './F7'
import { V } from './F7.values'

const unit = (id: string): Unit => F7.units.find((u) => u.id === id)!
const tries = (id: string): string => unit(id).visual.tryThis.join(' ')
const clean = (html: string): string => html.replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/<!--.*?-->/g, '')
const text = (html: string): string => clean(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
/** The accessible description of the widget's drawing: its readout lines. */
const aria = (html: string): string => /<svg[^>]*aria-label="([^"]*)"/.exec(clean(html))?.[1] ?? ''
const declared = (src: string, iface: string): string[] => {
  const body = new RegExp(`export interface ${iface}\\s*\\{([\\s\\S]*?)\\n\\}`).exec(src)?.[1] ?? ''
  return [...body.matchAll(/^\s*(\w+)\??:/gm)].map((m) => m[1])
}
const flip = (s: string, k: number): string => `${s.slice(0, k)}${s[k] === '1' ? '0' : '1'}${s.slice(k + 1)}`
const props = (id: string) => unit(id).visual.props as Record<string, unknown>

describe('F7 Try-its: every prop reaches the widget', () => {
  it.each(F7.units.map((u) => [u.id, u] as const))('%s: a bit-table spec that passes only props the widget declares', (_, u) => {
    expect(u.visual.kind).toBe('bit-table')
    expect(Object.keys(u.visual.props ?? {}).filter((k) => !declared(bitTableSrc, 'BitTableProps').includes(k))).toEqual([])
  })
  it('reads the declared props of the widget, and the controls the lines name are in its code', () => {
    expect(declared(bitTableSrc, 'BitTableProps')).toEqual(['mode', 'gate', 'view', 'a', 'b', 'combine', 'rows', 'n'])
    // gate mode: a button per gate, a Truth table / Arrows switch, one button per input, a status note
    expect(bitTableSrc).toContain('options={BITS_GATES.map((x) => ({ value: x, label: x }))}')
    expect(bitTableSrc).toContain("{ value: 'table', label: 'Truth table' }")
    expect(bitTableSrc).toContain("{ value: 'map', label: 'Arrows' }")
    // strings mode: one button per place of each string (a click flips it), and the a ⊕ b / a·b switch
    expect(bitTableSrc).toContain('onFlip={(k) => setB(flip(b, k))}')
    expect(bitTableSrc).toContain("{ value: 'dot', label: 'a·b' }")
    // reduce mode: Back, Step, Start over, and a flip per place of each row
    expect(bitTableSrc).toContain('onFlip={(k) => edit(rows.map((x, j) => (j === i ? flip(x, k) : x)))}')
    expect(bitTableSrc).toContain('Step\n')
    // cost mode: the n slider from COST_RANGE.min to COST_RANGE.max in steps of 1
    expect(bitTableSrc).toContain('min={COST_RANGE.min} max={COST_RANGE.max} step={1}')
    expect(COST_RANGE).toEqual({ min: 1, max: 50 })
  })
})

describe('F7 Try-it: the Boolean unit (AND as a truth table)', () => {
  const u = unit('f7-boolean')
  it('starts at AND as a table: the readouts say "1s: 1 of 4" and "not constant or balanced"', () => {
    const html = renderToString(<BitTable {...(u.visual.props as object)} />)
    expect(aria(html)).toContain('1s: 1 of 4')
    expect(aria(html)).toContain('not constant or balanced')
    expect(html).toContain('data-kind="bits"')
    for (const s of ['00', '01', '10', '11']) expect(text(html)).toContain(s)
    expect(props('f7-boolean')).toEqual({ mode: 'gate', gate: 'AND' })
  })
  it('pressing the inputs in turn: the note reads AND(0 0) = 0, AND(0 1) = 0, AND(1 0) = 0 and AND(1 1) = 1, and only 11 gives a 1', () => {
    const notes = ['00', '01', '10', '11'].map((pick) => gateModel({ gate: 'AND', view: 'table', pick }).note)
    expect(notes).toEqual(['AND(0 0) = 0', 'AND(0 1) = 0', 'AND(1 0) = 0', 'AND(1 1) = 1'])
    expect(gateTable('AND').out.indexOf(1)).toBe(V.f7AndOnlyAt)
    expect(gateTable('AND').out.reduce<number>((s, v) => s + v, 0)).toBe(V.f7AndOnes)
  })
  it('XOR reads "1s: 2 of 4" and "balanced"; NAND reads "1s: 3 of 4" and "not constant or balanced"', () => {
    expect(gateModel({ gate: 'XOR', view: 'table', pick: null }).lines).toEqual(['4 rows', '1s: 2 of 4', 'balanced'])
    expect(gateModel({ gate: 'NAND', view: 'table', pick: null }).lines).toEqual(['4 rows', '1s: 3 of 4', 'not constant or balanced'])
  })
  it('the lines say exactly that', () => {
    const t = tries('f7-boolean')
    for (const s of ['AND(0 0) = 0', 'AND(0 1) = 0', 'AND(1 0) = 0', 'AND(1 1) = 1', '“1s: 1 of 4”', '“1s: 2 of 4”', '“balanced”', '“1s: 3 of 4”', '“not constant or balanced”']) expect(t, s).toContain(s)
  })
})

describe('F7 Try-it: the reversible unit (AND as arrows)', () => {
  const u = unit('f7-reversible')
  it('starts at AND\'s arrows: "3 inputs → one output", and the output 0 is marked ×3', () => {
    const html = renderToString(<BitTable {...(u.visual.props as object)} />)
    expect(aria(html)).toContain('3 inputs → one output')
    expect(html).toContain('×3')
    expect(props('f7-reversible')).toEqual({ mode: 'gate', gate: 'AND', view: 'map' })
  })
  it('CNOT and Toffoli read "reversible", with one arrow into each output', () => {
    expect(gateModel({ gate: 'CNOT', view: 'map', pick: null }).lines).toEqual(['reversible'])
    expect(gateModel({ gate: 'Toffoli', view: 'map', pick: null }).lines).toEqual(['reversible'])
    expect(renderToString(<BitTable mode="gate" gate="CNOT" view="map" />)).not.toContain('×')
    expect(V.f7CnotBij).toBe(1)
  })
  it('pressing 110 then 111 under Toffoli: the notes read Toffoli(1 1 0) = 1 1 1 and Toffoli(1 1 1) = 1 1 0, and every other input stays put', () => {
    expect(gateModel({ gate: 'Toffoli', view: 'map', pick: '110' }).note).toBe('Toffoli(1 1 0) = 1 1 1')
    expect(gateModel({ gate: 'Toffoli', view: 'map', pick: '111' }).note).toBe('Toffoli(1 1 1) = 1 1 0')
    const out = gateTable('Toffoli').out
    expect(out.map((o, x) => (o === x ? -1 : x)).filter((x) => x >= 0)).toEqual([0b110, 0b111])
    expect(V.f7Tof110).toBe(0b111)
  })
  it('the lines say exactly that', () => {
    const t = tries('f7-reversible')
    for (const s of ['“3 inputs → one output”', '×3', '“reversible”', 'Toffoli(1 1 0) = 1 1 1', 'Toffoli(1 1 1) = 1 1 0', 'every other input stays put']) expect(t, s).toContain(s)
  })
})

describe('F7 Try-it: the XOR unit (two strings)', () => {
  const u = unit('f7-xor')
  it('starts with a = 1011 and b = 0110: the note reads "a ⊕ b = 1101 and a·b = 1.", the picture’s XOR row shows 1101 and the readout "differ in 3 places"', () => {
    const html = renderToString(<BitTable {...(u.visual.props as object)} />)
    expect(text(html)).toContain('a ⊕ b = 1101 and a·b = 1.')
    expect(aria(html)).toContain('a ⊕ b = 1101')
    expect(aria(html)).toContain('differ in 3 places')
    expect(props('f7-xor')).toEqual({ mode: 'strings', a: '1011', b: '0110' })
    const m = stringsModel({ a: '1011', b: '0110', combine: 'xor' })
    expect(parseBits(m.xor)).toBe(V.f7Xor1011With0110)
    expect(m.dot).toBe(V.f7Dot1011With0110)
  })
  it('three presses (places 1, 2 and 4) turn b = 0110 into 1011; then the note reads "a ⊕ b = 0000 and a·b = 1." and the a·b button shows the AND row', () => {
    let b = '0110'
    for (const k of [0, 1, 3]) b = flip(b, k)
    expect(b).toBe('1011')
    const x = stringsModel({ a: '1011', b, combine: 'xor' })
    expect(x.xor).toBe('0000')
    expect(x.dot).toBe(1)
    const d = stringsModel({ a: '1011', b, combine: 'dot' })
    expect(d.lines).toEqual(['a AND b = 1011', 'a·b = 1'])
    // a string XOR-ed with itself is 0, and its dot product with itself is its weight mod 2
    expect(x.dot).toBe(hammingWeight(0b1011) % 2)
  })
  it('the lines say exactly that', () => {
    const t = tries('f7-xor')
    for (const s of ['a = 1011 and b = 0110', '“a ⊕ b = 1101 and a·b = 1.”', '1101', '“differ in 3 places”', 'three presses, at places 1, 2 and 4', '“a ⊕ b = 0000 and a·b = 1.”', 'the a·b button', '“a·b = 1”']) {
      expect(t.replace('Press the a·b button', 'the a·b button'), s).toContain(s)
    }
  })
})

describe('F7 Try-it: the GF(2) unit (a matrix to reduce)', () => {
  const u = unit('f7-gf2')
  it('starts with the rows 001 and 111, before any move: "move 0 of 2"', () => {
    const html = renderToString(<BitTable {...(u.visual.props as object)} />)
    expect(aria(html)).toContain('move 0 of 2')
    expect(text(html)).toContain('Press Step: 2 moves to go.')
    expect(props('f7-gf2')).toEqual({ mode: 'reduce', rows: ['001', '111'] })
  })
  it('Step once reads "swap rows 1 and 2"; again "add row 2 to row 1", then "rank 2" and "null space: 000, 110"', () => {
    expect(reduceModel({ rows: ['001', '111'], step: 1 }).lines).toEqual(['move 1 of 2', 'swap rows 1 and 2'])
    expect(reduceModel({ rows: ['001', '111'], step: 2 }).lines).toEqual(['move 2 of 2', 'add row 2 to row 1', 'rank 2', 'null space: 000, 110'])
    expect(V.f7RankY).toBe(2)
    expect(V.f7ReduceMoves).toBe(2)
    expect(V.f7NullYVec).toBe(0b110)
  })
  it('pressing the first place of row 2 turns 111 into 011; Step twice then reads "rank 2" and "null space: 000, 100"', () => {
    const rows = ['001', flip('111', 0)]
    expect(rows).toEqual(['001', '011'])
    const m = reduceModel({ rows, step: 2 })
    expect(m.total).toBe(2)
    expect(m.lines).toEqual(['move 2 of 2', 'add row 2 to row 1', 'rank 2', 'null space: 000, 100'])
    // from the bare engine, as a check on the widget's model
    expect(gf2Rank([[0, 0, 1], [0, 1, 1]])).toBe(2)
    expect(gf2Span(gf2Nullspace([[0, 0, 1], [0, 1, 1]]), 3)).toEqual([0, 0b100])
  })
  it('the lines say exactly that', () => {
    const t = tries('f7-gf2')
    for (const s of ['The rows are 001 and 111', '“swap rows 1 and 2”', '“add row 2 to row 1”', '“rank 2”', '“null space: 000, 110”', 'turn 111 into 011', 'press Step twice', '“null space: 000, 100”']) expect(t, s).toContain(s)
  })
})

describe('F7 Try-it: the cost unit (the n slider)', () => {
  const u = unit('f7-cost')
  it('starts at n = 10: the note reads "n = 10: n² = 100, 2ⁿ = 1024, 2^(n/2) = 32."', () => {
    const html = renderToString(<BitTable {...(u.visual.props as object)} />)
    expect(text(html)).toContain('n = 10: n² = 100, 2ⁿ = 1024, 2^(n/2) = 32.')
    expect(props('f7-cost')).toEqual({ mode: 'cost', n: 10 })
    expect(costModel({ n: 10, vs: 'nSquared' }).costs).toEqual({ sq: V.f7Sq10, exp: V.f7Exp10, root: 32 })
  })
  it('sliding n to 20 gives n² = 400, 2ⁿ = 1 048 576 and 2^(n/2) = 1024 (the chapter’s f7Exp20 and f7Sqrt2e20); the slider reaches 20', () => {
    const c = costModel({ n: 20, vs: 'nSquared' }).costs
    expect(c).toEqual({ sq: 400, exp: V.f7Exp20, root: V.f7Sqrt2e20 })
    expect(text(renderToString(<BitTable mode="cost" n={20} />))).toContain(`n = 20: n² = 400, 2ⁿ = ${fmtCost(c.exp).replace(/ /g, ' ')}, 2^(n/2) = 1024.`)
    expect(COST_RANGE.min <= 20 && 20 <= COST_RANGE.max).toBe(true)
  })
  it('the lines say exactly that', () => {
    const t = tries('f7-cost')
    for (const s of ['The slider starts at n = 10', '“n = 10: n² = 100, 2ⁿ = 1024, 2^(n/2) = 32.”', 'Slide n to 20', '“n = 20: n² = 400, 2ⁿ = 1 048 576, 2^(n/2) = 1024.”', 'the log axis']) expect(t, s).toContain(s)
  })
})
