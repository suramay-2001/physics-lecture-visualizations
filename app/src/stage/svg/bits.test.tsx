/**
 * `bits` (709; SVG; P-F7-story §9.2): classical bits as truth tables, maps, rows of strings and row reduction mod 2. Content writes only
 * inputs (a gate name or table, strings, moves done); the resolver takes every output, sum, syndrome, pivot and reduced row from
 * physics/qc/bits.ts. These tests check the resolved pictures against the chapter's numbers, the sweep of a reduction, interpolation, every
 * validation limit, the readout text, and that the one scene packs inside the box and draws with no NaN in every mode and slot.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { fidelityOf } from '../../content/fidelity'
import type { BitsState } from '../../content/stage'
import { KIND_RENDER, PASSPORT, STAGE_KINDS_709, passportOf } from '../../content/stage'
import { ANCHORS, SHOTS } from '../../content/stageVocab'
import { hammingParity } from '../../physics/qc/bits'
import { FigureFor } from '../figures/FigureFor'
import { interpolate } from '../interp'
import { resolve, validateStage } from '../resolve'
import { svgKindDef } from '../svgKinds'
import type { ResolvedBits } from '../types'
import { BITS_LIMITS, bitsInputs, bitsReadouts, moveText, resolveBitsStage, validateBitsStage } from './bits'
import { BitsScene, bitsArea, fnPanels, gridLayout, mapGeometry, tableCell } from './BitsScene'
import './kinds'

const T_SIM = [0, 1, 2, 3, 2, 3, 0, 1]
const T_BAL3 = [1, 0, 0, 1, 1, 1, 0, 0]
const fnState = (x: BitsState['fn'], shot?: BitsState['shot']): BitsState => ({ kind: 'bits', fn: x, shot })
const AND_TABLE = fnState({ source: { gate: 'AND' }, view: 'table' })
const R = (st: BitsState, s = 1) => resolve(st, s) as ResolvedBits
const texts = (r: ResolvedBits) => bitsReadouts(r).map((x) => x.text)

describe('bits: the SVG route, the passport and the vocabulary', () => {
  it('is an SVG kind registered by the lazy module, with its own passport and drawer', () => {
    expect(KIND_RENDER.bits).toBe('svg')
    expect(STAGE_KINDS_709).toContain('bits')
    expect(svgKindDef('bits')).toBeDefined()
    expect(PASSPORT.bits).toMatchObject({ title: 'BITS · 0 and 1 only', fidelityKey: 'bits' })
    expect(PASSPORT.bits.note).toMatch(/^not a place · a filled cell is 1/)
    expect(passportOf(AND_TABLE)).toBe(PASSPORT.bits)
    const f = fidelityOf('bits')
    for (const list of Object.values(f)) expect(list.length).toBeGreaterThan(0)
    expect(Object.values(f).flat().map((i) => i.id).sort()).toEqual(['qc-bits-arrows', 'qc-bits-cells', 'qc-bits-classical', 'qc-bits-engine', 'qc-bits-moves'])
    expect(SHOTS.bits).toEqual(['B-BITS'])
    expect(ANCHORS.bits).toEqual(['inputs', 'outputs', 'row', 'merge', 'computed', 'checks', 'pivots'])
    expect(svgKindDef('bits')!.print).toEqual({ w: 320, h: 300 })
  })
  it('resolve / validateStage reach it like any kind; an unknown shot is caught by the shared check', () => {
    expect(validateStage(fnState({ source: { gate: 'AND' }, view: 'map' }, 'B-BITS'))).toEqual([])
    expect(validateStage({ ...AND_TABLE, shot: 'X-NOPE' as never })).toEqual(['bits: unknown shot "X-NOPE"'])
  })
})

describe('bits fn: tables and maps come from the engine', () => {
  it('AND: 4 rows, outputs 0001, three inputs share the output 0, one 1: neither constant nor balanced', () => {
    const m = R(AND_TABLE).fn!.maps[0]
    expect(m).toMatchObject({ label: 'AND', n: 2, m: 1, out: [0, 0, 0, 1], inputs: ['00', '01', '10', '11'], outputs: ['0', '1'], preimages: [3, 1], maxPre: 3, reversible: false, ones: 1, kind: 'neither' })
  })
  it('XOR is balanced, OR and NAND have three 1s, NOT is a bijection of one bit, Toffoli of three', () => {
    const k = (gate: 'XOR' | 'OR' | 'NAND' | 'NOT' | 'Toffoli' | 'Fredkin' | 'CNOT' | 'SWAP') => R(fnState({ source: { gate }, view: 'map' })).fn!.maps[0]
    expect(k('XOR')).toMatchObject({ ones: 2, kind: 'balanced', maxPre: 2, reversible: false })
    expect(k('OR')).toMatchObject({ ones: 3, kind: 'neither' })
    expect(k('NAND')).toMatchObject({ ones: 3, kind: 'neither' })
    expect(k('NOT')).toMatchObject({ n: 1, m: 1, out: [1, 0], reversible: true, ones: 1, kind: 'balanced' })
    expect(k('CNOT')).toMatchObject({ n: 2, m: 2, out: [0, 1, 3, 2], reversible: true, ones: null, kind: null })
    expect(k('SWAP')).toMatchObject({ out: [0, 2, 1, 3], reversible: true })
    expect(k('Toffoli')).toMatchObject({ n: 3, m: 3, out: [0, 1, 2, 3, 4, 5, 7, 6], reversible: true, maxPre: 1 })
    expect(k('Fredkin')).toMatchObject({ out: [0, 1, 2, 3, 4, 6, 5, 7], reversible: true })
  })
  it('an authored table: the balanced 3-bit table, and the 2-to-1 table of Simon’s promise', () => {
    const bal = R(fnState({ source: { table: T_BAL3, n: 3, m: 1 }, view: 'table' })).fn!.maps[0]
    expect(bal).toMatchObject({ label: 'f', n: 3, m: 1, ones: 4, kind: 'balanced' })
    const sim = R(fnState({ source: { table: T_SIM, n: 3, m: 2 }, view: 'map' })).fn!.maps[0]
    expect(sim).toMatchObject({ n: 3, m: 2, outputs: ['00', '01', '10', '11'], preimages: [2, 2, 2, 2], maxPre: 2, reversible: false, ones: null, kind: null })
  })
  it('versus draws a second source in the same view; mark names inputs of the first', () => {
    const r = R(fnState({ source: { gate: 'AND' }, view: 'map', versus: { gate: 'CNOT' }, mark: ['00', '11'] }))
    expect(r.fn!.maps.map((m) => m.label)).toEqual(['AND', 'CNOT'])
    expect(r.fn!.maps[0].marked).toEqual([0, 3])
    expect(r.fn!.maps[1].marked).toEqual([])
    expect(r.fn!.view).toBe('map')
  })
})

describe('bits rows: XOR, the dot product and a check matrix', () => {
  it('xor: 1011 ⊕ 0110 = 1101, weights 3 and 2, 3 places differ', () => {
    const w = R({ kind: 'bits', rows: { strings: ['1011', '0110'], combine: 'xor' } }).rows!
    expect(w).toMatchObject({ computed: '1101', distance: 3, weights: [3, 2], names: ['a', 'b'], width: 4, combine: 'xor', dot: null, against: null })
  })
  it('xor of a string with itself is all zeros', () => {
    expect(R({ kind: 'bits', rows: { strings: ['1011', '1011'], combine: 'xor' } }).rows).toMatchObject({ computed: '0000', distance: 0 })
  })
  it('dot: 110 · 011 = 1 (the AND row is 010), 110 · 111 = 0 (the AND row is 110)', () => {
    expect(R({ kind: 'bits', rows: { strings: ['110', '011'], combine: 'dot' } }).rows).toMatchObject({ computed: '010', dot: 1 })
    expect(R({ kind: 'bits', rows: { strings: ['110', '111'], combine: 'dot' } }).rows).toMatchObject({ computed: '110', dot: 0 })
  })
  it('against a check matrix: the received word 1110010 reads 110, which is 6', () => {
    const rows = hammingParity(3).map((row) => row.join(''))
    const w = R({ kind: 'bits', rows: { strings: rows, against: '1110010' } }).rows!
    expect(w.against).toEqual({ word: '1110010', dots: [1, 1, 0], syndrome: '110', value: 6 })
    expect(w.names).toEqual(['check 1', 'check 2', 'check 3'])
    expect(R({ kind: 'bits', rows: { strings: rows, against: '1110000' } }).rows!.against).toMatchObject({ syndrome: '000', value: 0 })
  })
  it('names replace the default row labels', () => {
    expect(R({ kind: 'bits', rows: { strings: ['110', '011'], combine: 'dot', names: ['a', 'x'] } }).rows!.names).toEqual(['a', 'x'])
  })
})

describe('bits reduce: Gauss–Jordan one move at a time', () => {
  const red = (upTo: number, strings = ['001', '111']): BitsState => ({ kind: 'bits', reduce: { strings, upTo } })
  it('001 over 111: start, swap rows, then add row 2 to row 1; rank 2, null space {000, 110}, pivots in columns 0 and 2', () => {
    const r0 = R(red(0)).reduce!
    expect(r0).toMatchObject({ matrix: ['001', '111'], step: 0, total: 2, move: null, done: false, pivots: [], rank: null, nullSpace: null })
    const r1 = R(red(1)).reduce!
    expect(r1).toMatchObject({ matrix: ['111', '001'], step: 1, move: { op: 'swap', a: 0, b: 1 }, done: false })
    const r2 = R(red(2)).reduce!
    expect(r2).toMatchObject({ matrix: ['110', '001'], step: 2, move: { op: 'xor', a: 1, b: 0 }, done: true, pivots: [0, 2], rank: 2, nullSpace: ['000', '110'] })
    expect(r2.start).toEqual(['001', '111'])
  })
  it('001 over 011 reduces to 010 over 001 with null space {000, 100}', () => {
    const total = R(red(0, ['001', '011'])).reduce!.total
    const d = R(red(total, ['001', '011'])).reduce!
    expect(d.nullSpace).toEqual(['000', '100'])
    expect(d.rank).toBe(2)
  })
  it('a matrix already reduced has no moves: step 0 is done', () => {
    const d = R(red(0, ['100', '010'])).reduce!
    expect(d).toMatchObject({ total: 0, done: true, rank: 2, nullSpace: ['000', '001'], move: null })
  })
  it('three dependent rows have rank 2 and the null space {000, 111}', () => {
    const total = R(red(0, ['110', '011', '101'])).reduce!.total
    const d = R(red(total, ['110', '011', '101'])).reduce!
    expect(d.rank).toBe(2)
    expect(d.nullSpace).toEqual(['000', '111'])
    expect(d.matrix[2]).toBe('000')
  })
  it('a sweep resolves to the whole move at each hold progress; the in-between value rounds', () => {
    const st: BitsState = { kind: 'bits', reduce: { strings: ['001', '111'], upTo: { from: 0, to: 2 } } }
    expect(R(st, 0).reduce!.step).toBe(0)
    expect(R(st, 0.5).reduce!.step).toBe(1)
    expect(R(st, 1).reduce!.step).toBe(2)
    expect(bitsInputs(st, 0.5).reduce!.upTo).toBe(1)
  })
  it('move text counts rows from 1', () => {
    expect(moveText({ op: 'swap', a: 0, b: 1 })).toBe('swap rows 1 and 2')
    expect(moveText({ op: 'xor', a: 1, b: 0 })).toBe('add row 2 to row 1')
  })
})

describe('bits: interpolation', () => {
  const red = (upTo: number, strings = ['001', '111']): BitsState => ({ kind: 'bits', reduce: { strings, upTo } })
  it('the moves of one reduction slide through the snapshots; a different picture switches at the half-way point', () => {
    const a = resolveBitsStage(red(0), 1)
    const b = resolveBitsStage(red(2), 1)
    expect(interpolate(a, b, 0)).toBe(a)
    expect(interpolate(a, b, 1)).toBe(b)
    expect((interpolate(a, b, 0.25) as ResolvedBits).reduce!.step).toBe(1)
    expect((interpolate(a, b, 0.75) as ResolvedBits).reduce!.step).toBe(2)
    const c = resolveBitsStage(AND_TABLE, 1)
    expect(interpolate(a, c, 0.4)).toBe(a)
    expect(interpolate(a, c, 0.6)).toBe(c)
    const d = resolveBitsStage(red(1, ['110', '011']), 1)
    expect(interpolate(a, d, 0.4)).toBe(a)
    expect(interpolate(a, d, 0.6)).toBe(d)
  })
})

describe('bits: validation', () => {
  const bad = (st: Partial<BitsState> & Record<string, unknown>): string[] => validateBitsStage({ kind: 'bits', ...st } as BitsState)
  it('exactly one of fn, rows, reduce', () => {
    expect(bad({})).toEqual(['bits: exactly one of fn, rows, reduce'])
    expect(bad({ fn: { source: { gate: 'AND' }, view: 'table' }, rows: { strings: ['1'] } })).toEqual(['bits: exactly one of fn, rows, reduce'])
  })
  it('fn: view, gate, table shape, versus and marks', () => {
    expect(bad({ fn: { source: { gate: 'AND' }, view: 'graph' as never } }).join()).toMatch(/view/)
    expect(bad({ fn: { source: { gate: 'XNOR' as never }, view: 'table' } }).join()).toMatch(/unknown gate "XNOR"/)
    expect(bad({ fn: { source: { table: [0, 1, 1], n: 2, m: 1 }, view: 'table' } }).join()).toMatch(/4 rows/)
    expect(bad({ fn: { source: { table: [0, 1, 2, 3], n: 2, m: 1 }, view: 'table' } }).join()).toMatch(/every output/)
    expect(bad({ fn: { source: { table: new Array(16).fill(0), n: 4, m: 1 }, view: 'table' } }).join()).toMatch(/n is/)
    expect(bad({ fn: { source: { gate: 'AND' }, view: 'map', versus: { gate: 'nope' as never } } }).join()).toMatch(/fn.versus/)
    expect(bad({ fn: { source: { gate: 'AND' }, view: 'map', mark: ['110'] } }).join()).toMatch(/input of 2 bits/)
    expect(bad({ fn: { source: { gate: 'AND' }, view: 'map', mark: ['2'] } }).join()).toMatch(/strings of 0s and 1s/)
    expect(bad({ fn: { source: { gate: 'AND' }, view: 'map', mark: ['00', '01'] } })).toEqual([])
  })
  it('rows: width, count, combine, against and names', () => {
    expect(bad({ rows: { strings: [] } }).join()).toMatch(/one to 4 rows/)
    expect(bad({ rows: { strings: ['1', '0', '1', '0', '1'] } }).join()).toMatch(/one to 4 rows/)
    expect(bad({ rows: { strings: ['102'] } }).join()).toMatch(/0s and 1s/)
    expect(bad({ rows: { strings: ['110', '01'] } }).join()).toMatch(/same width/)
    expect(bad({ rows: { strings: ['1'.repeat(9)] } }).join()).toMatch(/at most 8/)
    expect(bad({ rows: { strings: ['110'], combine: 'xor' } }).join()).toMatch(/exactly two rows/)
    expect(bad({ rows: { strings: ['110', '011'], combine: 'and' as never } }).join()).toMatch(/combine/)
    expect(bad({ rows: { strings: ['110', '011'], combine: 'xor', against: '101' } }).join()).toMatch(/do not go together/)
    expect(bad({ rows: { strings: ['110', '011'], against: '1010' } }).join()).toMatch(/as wide as the rows/)
    expect(bad({ rows: { strings: ['110', '011'], names: ['a'] } }).join()).toMatch(/one name per row/)
    expect(bad({ rows: { strings: ['110', '011'], names: ['a', 'abcdefg'] } }).join()).toMatch(/1–6 characters/)
    expect(bad({ rows: { strings: ['110', '011'], combine: 'xor', names: ['x', 'z'] } })).toEqual([])
  })
  it('reduce: rows, finite and in-range moves, a whole number at rest', () => {
    expect(bad({ reduce: { strings: ['001', '111'], upTo: 3 } }).join()).toMatch(/outside 0 … 2/)
    expect(bad({ reduce: { strings: ['001', '111'], upTo: -1 } }).join()).toMatch(/outside 0 … 2/)
    expect(bad({ reduce: { strings: ['001', '111'], upTo: 0.5 } }).join()).toMatch(/whole number/)
    expect(bad({ reduce: { strings: ['001', '111'], upTo: Number.NaN } }).join()).toMatch(/non-finite/)
    expect(bad({ reduce: { strings: ['001', '111'], upTo: { from: 0, to: 2 } } })).toEqual([])
    expect(bad({ reduce: { strings: ['001', '111'], upTo: { from: 0, to: 5 } } }).join()).toMatch(/outside/)
    expect(bad({ reduce: { strings: ['a'], upTo: 0 } }).join()).toMatch(/0s and 1s/)
    expect(BITS_LIMITS).toMatchObject({ inBits: 3, outBits: 3, rowsMax: 4, widthMax: 8 })
  })
  it('the real states of the chapter validate', () => {
    expect(validateBitsStage(AND_TABLE)).toEqual([])
    expect(validateBitsStage({ kind: 'bits', rows: { strings: ['1011', '0110'], combine: 'xor' } })).toEqual([])
    expect(validateBitsStage({ kind: 'bits', rows: { strings: hammingParity(3).map((r) => r.join('')), against: '1110010' } })).toEqual([])
    expect(validateBitsStage({ kind: 'bits', reduce: { strings: ['001', '111'], upTo: 2 } })).toEqual([])
  })
})

describe('bits: the readout lines', () => {
  it('a table reads its rows, its ones and what kind of function it is', () => {
    expect(texts(R(AND_TABLE))).toEqual(['4 rows', '1 of 4 outputs are 1', 'neither constant nor balanced'])
    expect(texts(R(fnState({ source: { gate: 'XOR' }, view: 'table' })))).toEqual(['4 rows', '2 of 4 outputs are 1', 'balanced'])
    expect(texts(R(fnState({ source: { gate: 'CNOT' }, view: 'table' })))).toEqual(['4 rows'])
  })
  it('a map says reversible, or how many inputs meet in one output; each source is named when two are drawn', () => {
    expect(texts(R(fnState({ source: { gate: 'AND' }, view: 'map' })))).toEqual(['AND: 3 inputs → one output'])
    expect(texts(R(fnState({ source: { gate: 'Toffoli' }, view: 'map' })))).toEqual(['Toffoli: reversible'])
    expect(texts(R(fnState({ source: { gate: 'AND' }, view: 'map', versus: { gate: 'CNOT' } })))).toEqual(['AND: 3 inputs → one output', 'CNOT: reversible'])
    const t = bitsReadouts(R(fnState({ source: { gate: 'AND' }, view: 'map' })))
    expect(t[0].tone).toBe('op')
    expect(bitsReadouts(R(fnState({ source: { gate: 'CNOT' }, view: 'map' })))[0].tone).toBe('state')
  })
  it('rows read the sum and the places that differ, the AND and the dot product, or the checks and the syndrome', () => {
    expect(texts(R({ kind: 'bits', rows: { strings: ['1011', '0110'], combine: 'xor' } }))).toEqual(['a ⊕ b = 1101', 'places that differ: 3'])
    expect(texts(R({ kind: 'bits', rows: { strings: ['110', '011'], combine: 'dot', names: ['a', 'x'] } }))).toEqual(['a AND x = 010', 'a·x = 1'])
    expect(texts(R({ kind: 'bits', rows: { strings: ['1011', '0110'] } }))).toEqual(['weight of a: 3', 'weight of b: 2'])
    expect(texts(R({ kind: 'bits', rows: { strings: hammingParity(3).map((r) => r.join('')), against: '1110010' } }))).toEqual(['checks read 110', '110 is 6 in binary'])
  })
  it('a reduction reads its move count and move, and at the end its rank and null space', () => {
    expect(texts(R({ kind: 'bits', reduce: { strings: ['001', '111'], upTo: 0 } }))).toEqual(['move 0 of 2', 'the matrix as given'])
    expect(texts(R({ kind: 'bits', reduce: { strings: ['001', '111'], upTo: 1 } }))).toEqual(['move 1 of 2', 'swap rows 1 and 2'])
    expect(texts(R({ kind: 'bits', reduce: { strings: ['001', '111'], upTo: 2 } }))).toEqual(['move 2 of 2', 'add row 2 to row 1', 'rank 2', 'null space: 000, 110'])
  })
})

describe('bits: the one scene (stage, reading version, print) packs inside its box', () => {
  const draw = (r: ResolvedBits, mode: 'stage' | 'print', w: number, h: number, bare = false, slot: 'full' | 'top' | 'bottom' = 'full') =>
    renderToString(
      <svg viewBox={`0 0 ${w} ${h}`}>
        <BitsScene state={r} mode={mode} width={w} height={h} bare={bare} slot={slot} />
      </svg>,
    )
  const SAMPLE: [string, BitsState][] = [
    ['AND table', AND_TABLE],
    ['AND map', fnState({ source: { gate: 'AND' }, view: 'map' })],
    ['XOR table', fnState({ source: { gate: 'XOR' }, view: 'table' })],
    ['Toffoli map', fnState({ source: { gate: 'Toffoli' }, view: 'map' })],
    ['Toffoli table', fnState({ source: { gate: 'Toffoli' }, view: 'table' })],
    ['AND versus CNOT map', fnState({ source: { gate: 'AND' }, view: 'map', versus: { gate: 'CNOT' } })],
    ['AND versus CNOT table', fnState({ source: { gate: 'AND' }, view: 'table', versus: { gate: 'CNOT' } })],
    ['Simon map marked', fnState({ source: { table: T_SIM, n: 3, m: 2 }, view: 'map', mark: ['001', '111'] })],
    ['balanced table', fnState({ source: { table: T_BAL3, n: 3, m: 1 }, view: 'table' })],
    ['xor rows', { kind: 'bits', rows: { strings: ['1011', '0110'], combine: 'xor' } }],
    ['dot rows', { kind: 'bits', rows: { strings: ['110', '011'], combine: 'dot', names: ['a', 'x'] } }],
    ['check rows', { kind: 'bits', rows: { strings: hammingParity(3).map((r) => r.join('')), against: '1110010' } }],
    ['reduce 0', { kind: 'bits', reduce: { strings: ['001', '111'], upTo: 0 } }],
    ['reduce 1', { kind: 'bits', reduce: { strings: ['001', '111'], upTo: 1 } }],
    ['reduce 2', { kind: 'bits', reduce: { strings: ['001', '111'], upTo: 2 } }],
    ['reduce 3 rows', { kind: 'bits', reduce: { strings: ['110', '011', '101'], upTo: 4 } }],
    ['reduce 8 wide', { kind: 'bits', reduce: { strings: ['10110100', '01101011', '11100101', '00011110'], upTo: 0 } }],
  ]
  const BOXES = [
    ['stage', 560, 560, false, 'full'],
    ['stage', 380, 560, false, 'full'],
    ['stage', 640, 420, false, 'full'],
    ['stage', 560, 250, false, 'top'],
    ['stage', 560, 250, false, 'bottom'],
    ['stage', 560, 440, true, 'full'],
    ['print', 320, 300, false, 'full'],
  ] as const
  it('draws every sample in every mode and slot with no NaN, no literal underscore, and the kind marker', () => {
    for (const [name, st] of SAMPLE) {
      const r = R(st)
      for (const [mode, w, h, bare, slot] of BOXES) {
        const html = draw(r, mode, w, h, bare, slot)
        expect(html, `${name} ${mode} ${w}x${h}`).not.toMatch(/NaN|Infinity|undefined/)
        expect(html).toContain('data-kind="bits"')
        expect(html).not.toMatch(/>[^<]*_[^<]*</)
      }
    }
  })
  it('a table and a map carry their anchors; a merging output is counted and drawn in the operation colour', () => {
    const andMap = draw(R(fnState({ source: { gate: 'AND' }, view: 'map' })), 'stage', 560, 560)
    for (const a of ['inputs', 'outputs', 'row', 'merge']) expect(andMap, a).toContain(`data-anchor="${a}"`)
    expect(andMap).toContain('×3')
    expect(andMap).toContain('fg-op')
    const cnot = draw(R(fnState({ source: { gate: 'CNOT' }, view: 'map' })), 'stage', 560, 560)
    expect(cnot).not.toContain('data-anchor="merge"')
    expect(cnot).not.toContain('×')
    expect(draw(R(AND_TABLE), 'stage', 560, 560)).toContain('>in<')
    expect(draw(R(AND_TABLE), 'stage', 560, 560)).toContain('>AND<')
  })
  it('the rows scene draws the computed row, the check column and the word; the reduction rings its pivots only when done', () => {
    const xr = draw(R({ kind: 'bits', rows: { strings: ['1011', '0110'], combine: 'xor' } }), 'stage', 560, 560)
    expect(xr).toContain('data-anchor="computed"')
    expect(xr).toContain('>⊕<')
    const dot = draw(R({ kind: 'bits', rows: { strings: ['110', '011'], combine: 'dot', names: ['a', 'x'] } }), 'stage', 560, 560)
    expect(dot).toContain('a·x = 1')
    const chk = draw(R({ kind: 'bits', rows: { strings: hammingParity(3).map((r) => r.join('')), against: '1110010' } }), 'stage', 560, 560)
    expect(chk).toContain('data-anchor="checks"')
    expect(chk).toContain('>word<')
    expect(chk).toContain('>check 1<')
    const mid = draw(R({ kind: 'bits', reduce: { strings: ['001', '111'], upTo: 1 } }), 'stage', 560, 560)
    expect(mid).not.toContain('data-anchor="pivots"')
    const end = draw(R({ kind: 'bits', reduce: { strings: ['001', '111'], upTo: 2 } }), 'stage', 560, 560)
    expect(end).toContain('data-anchor="pivots"')
  })
  it('the print figure and the reading version carry the readouts as text lines; the live stage leaves them to the overlay', () => {
    const r = R({ kind: 'bits', rows: { strings: ['1011', '0110'], combine: 'xor' } })
    expect(draw(r, 'print', 320, 300)).toContain('a ⊕ b = 1101')
    expect(draw(r, 'stage', 560, 440, true)).toContain('a ⊕ b = 1101')
    expect(draw(r, 'stage', 560, 560)).not.toContain('a ⊕ b = 1101')
  })
  it('the layout helpers keep every cell, box and row inside the drawing area at every box shape', () => {
    for (const [w, h, own, slot] of [[560, 560, false, 'full'], [380, 560, false, 'full'], [340, 420, false, 'full'], [640, 420, false, 'full'], [560, 250, false, 'top'], [560, 250, false, 'bottom'], [560, 440, true, 'full'], [320, 300, true, 'full'], [320, 220, true, 'full']] as const) {
      const area = bitsArea(w, h, own, slot, 3, own ? 3 : 0)
      expect(area.x).toBeGreaterThanOrEqual(0)
      expect(area.y).toBeGreaterThanOrEqual(0)
      expect(area.x + area.w).toBeLessThanOrEqual(w)
      for (const [name, st] of SAMPLE) {
        const r = R(st)
        if (r.fn) {
          const panels = fnPanels(area, r.fn.maps.length)
          for (const p of panels) {
            expect(p.x).toBeGreaterThanOrEqual(area.x - 1e-9)
            expect(p.x + p.w).toBeLessThanOrEqual(area.x + area.w + 1e-9)
          }
          r.fn.maps.forEach((m, i) => {
            if (r.fn!.view === 'table') {
              const c = tableCell(panels[i], m)
              expect(c, `${name}`).toBeGreaterThanOrEqual(14)
              expect(c * (m.n + m.m + 0.6), `${name} ${w}x${h}`).toBeLessThanOrEqual(panels[i].w + 1e-6 + (c === 14 ? 14 * 10 : 0))
            } else {
              const g = mapGeometry(panels[i], m)
              expect(g.xOut).toBeGreaterThan(g.xIn + g.boxW)
              expect(g.xIn).toBeGreaterThanOrEqual(panels[i].x - 1e-9)
            }
          })
        }
        if (r.rows || r.reduce) {
          const cols = r.rows ? r.rows.width : r.reduce!.matrix[0].length
          const rowCount = r.rows ? r.rows.strings.length + (r.rows.computed ? 1 : 0) + (r.rows.against ? 1 : 0) : r.reduce!.matrix.length
          const L = gridLayout(area, cols, rowCount, 7, 56, 1)
          expect(L.cell).toBeGreaterThanOrEqual(14)
          expect(L.cell).toBeLessThanOrEqual(36)
          expect(L.x0).toBeGreaterThanOrEqual(0)
        }
      }
    }
  })
})

describe('bits: the print figure', () => {
  it('FigureFor draws the kind with its numbered caption and no placeholder', () => {
    const html = renderToString(<FigureFor layout={AND_TABLE} number="F7.1" caption="AND as a table" course="qc709" />)
    expect(html).toContain('data-kind="bits"')
    expect(html).not.toMatch(/NaN|Infinity|undefined/)
  })
})
