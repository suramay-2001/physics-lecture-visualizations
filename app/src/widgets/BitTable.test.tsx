/**
 * Widget `bit-table` (Chapter F7). The widget builds a `bits` (or `plot`) stage state from its controls and draws it with the kinds' own
 * resolvers and scenes, so its numbers are the engine's (physics/qc/bits.ts). The Try-it lines of Chapter F7 promise the numbers checked
 * here; the controls themselves (gate buttons, bit flips, Step, the n slider) are exercised by the e2e spec (e2e/bit-table.spec.ts).
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { gf2Nullspace, gf2Rank } from '../physics/qc/bits'
import BitTable, { COST_RANGE, MAX_ROWS, STRING_WIDTH, costModel, fmtCost, gateModel, reduceModel, stringsModel } from './BitTable'

const clean = (html: string): string => html.replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/<!--.*?-->/g, '')
const text = (html: string) => clean(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
/** The accessible description of the widget's drawing (its svg), which carries the picture's own readout lines. */
const aria = (html: string): string => /<svg[^>]*aria-label="([^"]*)"/.exec(clean(html))?.[1] ?? ''

describe('bit-table gate mode: the picture and the lines are the engine’s', () => {
  it('AND as a table: four rows, a single 1, neither constant nor balanced', () => {
    const m = gateModel({ gate: 'AND', view: 'table', pick: null })
    expect(m.lines).toEqual(['4 rows', '1s: 1 of 4', 'not constant or balanced'])
    expect(m.note).toBe('Click an input to follow it to its output.')
  })
  it('XOR is balanced with two 1s; NAND has three 1s and is neither', () => {
    expect(gateModel({ gate: 'XOR', view: 'table', pick: null }).lines).toEqual(['4 rows', '1s: 2 of 4', 'balanced'])
    expect(gateModel({ gate: 'NAND', view: 'table', pick: null }).lines).toEqual(['4 rows', '1s: 3 of 4', 'not constant or balanced'])
  })
  it('the map view: AND merges three inputs; CNOT, Toffoli and SWAP are reversible', () => {
    expect(gateModel({ gate: 'AND', view: 'map', pick: null }).lines).toEqual(['3 inputs → one output'])
    for (const g of ['CNOT', 'Toffoli', 'SWAP', 'Fredkin', 'NOT'] as const) expect(gateModel({ gate: g, view: 'map', pick: null }).lines, g).toEqual(['reversible'])
  })
  it('Fredkin’s control is the first bit (N&C Fig. 3.15 puts it last): 101 → 110, and the note says so (review F7 nit 8)', () => {
    const m = gateModel({ gate: 'Fredkin', view: 'map', pick: '101' })
    expect(m.note).toBe('Fredkin(1 0 1) = 1 1 0 (control first; N&C Fig. 3.15 puts it last)')
    expect(gateModel({ gate: 'Fredkin', view: 'map', pick: '011' }).note).toContain('Fredkin(0 1 1) = 0 1 1')
  })
  it('clicking an input marks it and the note reads its output: AND(1 1) = 1, Toffoli(1 1 0) = 1 1 1, CNOT(1 0) = 1 1', () => {
    const and = gateModel({ gate: 'AND', view: 'table', pick: '11' })
    expect(and.note).toBe('AND(1 1) = 1')
    expect(and.state.kind === 'bits' && and.state.fn?.mark).toEqual(['11'])
    expect(gateModel({ gate: 'AND', view: 'table', pick: '10' }).note).toBe('AND(1 0) = 0')
    expect(gateModel({ gate: 'Toffoli', view: 'map', pick: '110' }).note).toBe('Toffoli(1 1 0) = 1 1 1')
    expect(gateModel({ gate: 'Toffoli', view: 'map', pick: '111' }).note).toBe('Toffoli(1 1 1) = 1 1 0')
    expect(gateModel({ gate: 'CNOT', view: 'map', pick: '10' }).note).toBe('CNOT(1 0) = 1 1')
    // a pick from another gate (a different width) is dropped, not drawn
    expect(gateModel({ gate: 'NOT', view: 'table', pick: '10' }).note).toBe('Click an input to follow it to its output.')
  })
})

describe('bit-table strings mode', () => {
  it('1011 and 0110: the XOR is 1101 (three places differ) and a·b = 1', () => {
    const m = stringsModel({ a: '1011', b: '0110', combine: 'xor' })
    expect(m.xor).toBe('1101')
    expect(m.dot).toBe(1)
    expect(m.lines).toEqual(['a ⊕ b = 1101', 'differ in 3 places'])
  })
  it('the same string twice: the XOR is 0000 and a·b is its weight mod 2', () => {
    expect(stringsModel({ a: '1011', b: '1011', combine: 'xor' }).xor).toBe('0000')
    expect(stringsModel({ a: '1011', b: '1011', combine: 'xor' }).dot).toBe(1)
    expect(stringsModel({ a: '1111', b: '1111', combine: 'dot' }).dot).toBe(0)
  })
  it('the dot row reads the AND row and the dot product', () => {
    expect(stringsModel({ a: '1011', b: '0110', combine: 'dot' }).lines).toEqual(['a AND b = 0010', 'a·b = 1'])
  })
})

describe('bit-table reduce mode', () => {
  it('001 over 111: two moves, then rank 2 and the null space {000, 110}', () => {
    expect(reduceModel({ rows: ['001', '111'], step: 0 })).toMatchObject({ total: 2, lines: ['move 0 of 2', 'the matrix as given'] })
    expect(reduceModel({ rows: ['001', '111'], step: 1 }).lines).toEqual(['move 1 of 2', 'swap rows 1 and 2'])
    expect(reduceModel({ rows: ['001', '111'], step: 2 }).lines).toEqual(['move 2 of 2', 'add row 2 to row 1', 'rank 2', 'null space: 000, 110'])
  })
  it('flipping the second row to 011 changes the null space to {000, 100}', () => {
    const m = reduceModel({ rows: ['001', '011'], step: 99 })
    expect(m.lines.at(-1)).toBe('null space: 000, 100')
    expect(m.lines.at(-2)).toBe('rank 2')
    // the same answers from the bare engine
    expect(gf2Rank([[0, 0, 1], [0, 1, 1]])).toBe(2)
    expect(gf2Nullspace([[0, 0, 1], [0, 1, 1]])).toEqual([[1, 0, 0]])
  })
})

describe('bit-table cost mode', () => {
  it('n = 10: n² = 100, 2ⁿ = 1024, 2^(n/2) = 32; n = 20: 2ⁿ = 1 048 576 and 2^(n/2) = 1024', () => {
    expect(costModel({ n: 10, vs: 'nSquared' }).costs).toEqual({ sq: 100, exp: 1024, root: 32 })
    expect(costModel({ n: 20, vs: 'sqrtTwoToN' }).costs).toEqual({ sq: 400, exp: 1048576, root: 1024 })
    expect(costModel({ n: 50, vs: 'nSquared' }).costs.sq).toBe(2500)
  })
  it('the plot marker sits at n on both curves, on a log axis', () => {
    const m = costModel({ n: 30, vs: 'nSquared' })
    expect(m.state.markers).toEqual([{ x: 30, label: 'n = 30' }])
    expect(m.state.yScale).toBe('log')
    expect(m.state.curve).toMatchObject({ fn: 'twoToN', vs: 'nSquared' })
  })
  it('big costs print in groups of three digits, and past a million millions as a power of ten', () => {
    expect(fmtCost(100)).toBe('100')
    expect(fmtCost(1024)).toBe('1024')
    expect(fmtCost(1048576)).toBe('1 048 576')
    expect(fmtCost(2 ** 30)).toBe('1 073 741 824')
    expect(fmtCost(2 ** 50)).toBe('1.1 × 10¹⁵')
    expect(fmtCost(32)).toBe('32')
  })
  it('the slider’s range and the limits the props gate reads', () => {
    expect(COST_RANGE).toEqual({ min: 1, max: 50 })
    expect(STRING_WIDTH).toBe(8)
    expect(MAX_ROWS).toBe(4)
  })
})

describe('bit-table: renders', () => {
  it('gate mode (the default): the picture, the gate buttons, the view buttons, the four inputs and the note', () => {
    const html = renderToString(<BitTable />)
    const t = text(html)
    expect(html).toContain('data-kind="bits"')
    for (const g of ['NOT', 'AND', 'OR', 'XOR', 'NAND', 'CNOT', 'SWAP', 'Toffoli', 'Fredkin']) expect(t).toContain(g)
    expect(t).toContain('Truth table')
    expect(t).toContain('Arrows')
    expect(t).toContain('Click an input to follow it to its output.')
    expect(aria(html)).toContain('1s: 1 of 4')
    expect(html).not.toMatch(/NaN|Infinity|undefined/)
  })
  it('gate mode with props: the map of CNOT; Toffoli offers eight inputs', () => {
    const map = renderToString(<BitTable mode="gate" gate="CNOT" view="map" />)
    expect(aria(map)).toContain('reversible')
    expect(map).toContain('data-anchor="inputs"')
    const tof = renderToString(<BitTable mode="gate" gate="Toffoli" view="map" />)
    for (const s of ['000', '001', '010', '011', '100', '101', '110', '111']) expect(text(tof)).toContain(s)
  })
  it('strings mode: the defaults 1011 and 0110, both computed rows named, one button per bit', () => {
    const html = renderToString(<BitTable mode="strings" />)
    expect(text(html)).toContain('a ⊕ b = 1101 and a·b = 1.')
    expect(aria(html)).toContain('a ⊕ b = 1101')
    expect((html.match(/class="bt-bit/g) ?? []).length).toBe(8)
    expect(html).toContain('aria-label="a, place 1: 1"')
    const dot = renderToString(<BitTable mode="strings" a="110" b="011" combine="dot" />)
    expect(aria(dot)).toContain('a·b = 1')
    expect((dot.match(/class="bt-bit/g) ?? []).length).toBe(6)
  })
  it('strings of unequal width are cut to the shorter; nothing wider than eight bits is drawn', () => {
    expect((renderToString(<BitTable mode="strings" a="10110" b="01" />).match(/class="bt-bit/g) ?? []).length).toBe(4)
    const wide = '1'.repeat(12)
    expect((renderToString(<BitTable mode="strings" a={wide} b={wide} />).match(/class="bt-bit/g) ?? []).length).toBe(16)
  })
  it('reduce mode: two rows 001 and 111 to start, Step and Back, the first line "move 0 of 2"', () => {
    const html = renderToString(<BitTable mode="reduce" />)
    const t = text(html)
    expect(t).toContain('Step')
    expect(t).toContain('Back')
    expect(t).toContain('Start over')
    expect(t).toContain('Press Step: 2 moves to go.')
    expect(aria(html)).toContain('move 0 of 2')
    const three = renderToString(<BitTable mode="reduce" rows={['110', '011', '101']} />)
    expect((three.match(/aria-label="row \d, place/g) ?? []).length).toBe(9)
  })
  it('cost mode: the slider, n = 10 and the three costs', () => {
    const html = renderToString(<BitTable mode="cost" />)
    const t = text(html)
    expect(t).toContain('n = 10: n² = 100, 2ⁿ = 1024, 2^(n/2) = 32.')
    expect(html).toContain('data-anchor="curve-vs"')
    expect(t).toContain('n (bits of input)')
    expect(text(renderToString(<BitTable mode="cost" n={20} />))).toContain('n = 20: n² = 400, 2ⁿ = 1 048 576, 2^(n/2) = 1024.')
    // an n off the slider is brought back onto it
    expect(text(renderToString(<BitTable mode="cost" n={999} />))).toContain('n = 50:')
    expect(html).not.toMatch(/NaN|Infinity|undefined/)
  })
})
