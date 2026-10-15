/**
 * `bits` additions of the background chapter B2 (P-B2-story §9.2 K-B; additive): a `bitmap` of a bicycle code's check matrix (H_X, H_Z or both) as pixels, and a labelled `grid` (the
 * logical action of a qubit shift on the 12 logical X operators, or an authored table). Content writes only the code's name and which matrix, bands to outline, a shift or strings;
 * the resolver takes every pixel, count and table entry from physics/qec/bb.ts. These tests rebuild the matrices from the drawn runs and compare them with the engine's, check the
 * counts (864 ones, row weight 6, H_X H_Zᵀ = 0), verify the shift action through the group law (the action of x^a y^b then x^c y^d is the action of x^(a+c) y^(b+d)), every validation
 * limit with a message that names the field, the readouts, the drawer / vocabulary, and that the one scene draws a run of 1s as ONE rectangle in a path (not a cell each) and packs.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { fidelityOf } from '../../content/fidelity'
import type { BitsState } from '../../content/stage'
import { BITMAP_CODES, BITMAP_WHICH, PASSPORT } from '../../content/stage'
import { ANCHORS } from '../../content/stageVocab'
import { GROSS_SPEC, TWO_GROSS_SPEC, bbCode, logicalXAction, makeLogicalSolver, paperLogicalBasis } from '../../physics/qec/bb'
import type { GF2Matrix } from '../../physics/qec/gf2'
import { FigureFor } from '../figures/FigureFor'
import { interpolate } from '../interp'
import { resolve, validateStage } from '../resolve'
import type { ResolvedBits } from '../types'
import { BITS_LIMITS, bitsReadouts, validateBitsStage } from './bits'
import { BitsScene, bitmapLayout, bitsArea, gridTableLayout, runsPath } from './BitsScene'
import './kinds'

const B = (x: Omit<BitsState, 'kind'>): BitsState => ({ kind: 'bits', ...x })
const R = (x: Omit<BitsState, 'kind'>) => resolve(B(x), 1) as ResolvedBits
const bad = (x: Omit<BitsState, 'kind'>) => validateBitsStage(B(x))
const texts = (r: ResolvedBits) => bitsReadouts(r).map((x) => x.text)
type Mode = 'stage' | 'print'
const draw = (r: ResolvedBits, mode: Mode, w: number, h: number, bare = false, slot: 'full' | 'top' | 'bottom' = 'full') =>
  renderToString(
    <svg viewBox={`0 0 ${w} ${h}`}>
      <BitsScene state={r} mode={mode} width={w} height={h} bare={bare} slot={slot} />
    </svg>,
  )

const GROSS = bbCode(GROSS_SPEC)
const TWO = bbCode(TWO_GROSS_SPEC)
const dense = (M: GF2Matrix) => Array.from({ length: M.rows }, (_, i) => Array.from({ length: M.cols }, (_, j) => M.get(i, j)))
/** The matrix the drawn runs spell out. */
function fromRuns(r: ResolvedBits, rowFrom: number, rowTo: number): number[][] {
  const m = r.bitmap!
  const out = Array.from({ length: rowTo - rowFrom }, () => new Array<number>(m.cols).fill(0))
  for (const [row, col, len] of m.runs) if (row >= rowFrom && row < rowTo) for (let k = 0; k < len; k++) out[row - rowFrom][col + k] = 1
  return out
}

describe('bits B2: the vocabulary and the drawer', () => {
  it('has the new anchors, the passport is unchanged, and the two new notes are in the drawer', () => {
    expect(ANCHORS.bits).toEqual(expect.arrayContaining(['bitmap', 'grid', 'band']))
    expect(PASSPORT.bits).toMatchObject({ title: 'BITS · 0 and 1 only', fidelityKey: 'bits' })
    const f = fidelityOf('bits')
    expect(f.exact.map((i) => i.id)).toContain('qc-bits-bitmap')
    expect(f.misleading.map((i) => i.id)).toContain('qc-bits-basis-dependent')
    expect([...BITMAP_CODES]).toEqual(['gross', 'two-gross'])
    expect([...BITMAP_WHICH]).toEqual(['HX', 'HZ', 'both'])
  })
})

describe('bits B2: the bitmap is the engine’s check matrix', () => {
  it('H_X, H_Z and both of the gross and two-gross codes: the drawn runs spell out exactly the engine’s matrices', () => {
    for (const [name, code] of [['gross', GROSS], ['two-gross', TWO]] as const) {
      const hx = R({ bitmap: { matrix: { bb: name, which: 'HX' } } })
      expect([hx.bitmap!.rows, hx.bitmap!.cols]).toEqual([code.cells, code.n])
      expect(fromRuns(hx, 0, code.cells)).toEqual(dense(code.HX))
      const hz = R({ bitmap: { matrix: { bb: name, which: 'HZ' } } })
      expect(fromRuns(hz, 0, code.cells)).toEqual(dense(code.HZ))
      const both = R({ bitmap: { matrix: { bb: name, which: 'both' } } })
      expect([both.bitmap!.rows, both.bitmap!.cols, both.bitmap!.xRows]).toEqual([2 * code.cells, code.n, code.cells])
      expect(fromRuns(both, 0, code.cells)).toEqual(dense(code.HX))
      expect(fromRuns(both, code.cells, 2 * code.cells)).toEqual(dense(code.HZ))
      expect(hx.bitmap!.xRows).toBeNull()
    }
  })
  it('the counts are the engine’s: 6 ones in every row, 864 ones in each of the two matrices, H_X H_Zᵀ = 0, the L and R halves meet in the middle, the name carries [[n, k]]', () => {
    const g = R({ bitmap: { matrix: { bb: 'gross', which: 'HX' } } }).bitmap!
    expect([g.ones, g.rowWeightMin, g.rowWeightMax, g.split, g.commute, g.l, g.m, g.name]).toEqual([432, 6, 6, 72, true, 12, 6, 'gross [[144, 12]]'])
    const t = R({ bitmap: { matrix: { bb: 'two-gross', which: 'HZ' } } }).bitmap!
    expect([t.ones, t.rows, t.cols, t.split, t.name]).toEqual([864, 144, 288, 144, 'two-gross [[288, 12]]'])
    expect(R({ bitmap: { matrix: { bb: 'two-gross', which: 'both' } } }).bitmap!.ones).toBe(1728)
    // runs of adjacent 1s are merged: there are fewer runs than ones, and each run lies inside one row
    const b = R({ bitmap: { matrix: { bb: 'gross', which: 'both' } } }).bitmap!
    expect(b.runs.length).toBeLessThan(b.ones)
    for (const [row, col, len] of b.runs) {
      expect(row).toBeLessThan(b.rows)
      expect(col + len).toBeLessThanOrEqual(b.cols)
    }
    expect(b.runs.reduce((s, r) => s + r[2], 0)).toBe(b.ones)
  })
  it('readouts: size, ones, row weight, and the commutation of the two matrices', () => {
    expect(texts(R({ bitmap: { matrix: { bb: 'gross', which: 'both' } } }))).toEqual(['144 × 144 cells', '864 ones', 'row weight 6', 'H_X H_Zᵀ = 0'])
    expect(texts(R({ bitmap: { matrix: { bb: 'two-gross', which: 'HX' } } }))[0]).toBe('144 × 288 cells')
    expect(BITS_LIMITS).toMatchObject({ bitmapRows: 288, bitmapCols: 576, bands: 4, gridMax: 12 })
  })
  it('bands are carried as given (inclusive ranges in the matrix drawn)', () => {
    const r = R({ bitmap: { matrix: { bb: 'gross', which: 'both' }, bands: [{ rows: [0, 11] }, { cols: [72, 83] }, { rows: [72, 83], cols: [0, 11] }] } })
    expect(r.bitmap!.bands).toEqual([{ rows: [0, 11], cols: null }, { rows: null, cols: [72, 83] }, { rows: [72, 83], cols: [0, 11] }])
  })
})

describe('bits B2: the shift action grid is the engine’s, and a group', () => {
  const basis = (which: 'gross' | 'two-gross') => paperLogicalBasis(which === 'gross' ? GROSS : TWO, which).X
  const direct = (which: 'gross' | 'two-gross', a: number, b: number): GF2Matrix => {
    const code = which === 'gross' ? GROSS : TWO
    return logicalXAction(code, basis(which), code.shiftPermutation(a, b), makeLogicalSolver(code, basis(which)))!
  }
  it('is the 12 × 12 matrix logicalXAction returns, with X1 … X12 on both sides', () => {
    for (const [a, b] of [[1, 0], [0, 1], [3, -1], [2, 5]] as const) {
      const r = R({ grid: { shiftAction: { code: 'gross', shift: [a, b] } } })
      expect([r.grid!.rows, r.grid!.cols]).toEqual([12, 12])
      expect(r.grid!.cells).toEqual(dense(direct('gross', a, b)))
      expect(r.grid!.rowLabels).toEqual(Array.from({ length: 12 }, (_, i) => `X${i + 1}`))
      expect(r.grid!.colLabels).toEqual(r.grid!.rowLabels)
      expect(r.grid!.shift).toMatchObject({ code: 'gross', a, b, name: `x^${a} y^${b}` })
    }
    expect(R({ grid: { shiftAction: { code: 'two-gross', shift: [1, 1] } } }).grid!.cells).toEqual(dense(direct('two-gross', 1, 1)))
  })
  it('the group law: the action of x^a y^b followed by x^c y^d is the action of x^(a+c) y^(b+d); the shift by the torus’ period is the identity', () => {
    const mat = (a: number, b: number) => R({ grid: { shiftAction: { code: 'gross', shift: [a, b] } } }).grid!.cells
    const mul = (P: number[][], Q: number[][]) => P.map((row) => Q[0].map((_, j) => row.reduce((s, v, k) => s ^ (v & Q[k][j]), 0)))
    for (const [a, b, c, d] of [[1, 0, 0, 1], [1, 0, 1, 0], [3, -1, 2, 4], [5, 2, -5, -2], [0, 1, 0, 5]] as const) expect(mul(mat(c, d), mat(a, b)), `${a},${b} then ${c},${d}`).toEqual(mat(a + c, b + d))
    const id = R({ grid: { shiftAction: { code: 'gross', shift: [12, 0] } } })
    expect(id.grid!.shift!.identity).toBe(true)
    expect(R({ grid: { shiftAction: { code: 'gross', shift: [0, 6] } } }).grid!.shift!.identity).toBe(true)
    expect(R({ grid: { shiftAction: { code: 'gross', shift: [0, 0] } } }).grid!.shift!.identity).toBe(true)
    expect(R({ grid: { shiftAction: { code: 'gross', shift: [1, 0] } } }).grid!.shift!.identity).toBe(false)
    // the action is invertible: every column of the matrix is a nonzero combination, and the number of ones is the table's
    const one = R({ grid: { shiftAction: { code: 'gross', shift: [1, 0] } } }).grid!
    expect(one.ones).toBe(one.cells.flat().reduce<number>((s, v) => s + v, 0))
    expect(one.shift!.columnsWeights.every((w) => w > 0)).toBe(true)
  })
  it('an authored table is drawn as given, labelled from 1', () => {
    const r = R({ grid: { rows: ['101', '011', '110', '000'] } })
    expect([r.grid!.rows, r.grid!.cols, r.grid!.ones, r.grid!.view]).toEqual([4, 3, 6, 'rows'])
    expect(r.grid!.cells).toEqual([[1, 0, 1], [0, 1, 1], [1, 1, 0], [0, 0, 0]])
    expect(r.grid!.rowLabels).toEqual(['1', '2', '3', '4'])
    expect(texts(r)).toEqual(['4 × 3 table', '6 ones'])
    expect(texts(R({ grid: { shiftAction: { code: 'gross', shift: [0, 0] } } }))).toEqual(['shift x^0 y^0', 'the identity on the logicals'])
    expect(texts(R({ grid: { shiftAction: { code: 'gross', shift: [1, 0] } } }))[1]).toMatch(/^\d+ ones in 12 × 12$/)
  })
})

describe('bits B2: validation — every limit, with a message that names the field', () => {
  it('exactly one picture: fn, rows, reduce, bitmap or grid', () => {
    expect(bad({})).toEqual(['bits: exactly one of fn, rows, reduce, bitmap, grid'])
    expect(bad({ bitmap: { matrix: { bb: 'gross', which: 'HX' } }, grid: { rows: ['1'] } })).toEqual(['bits: exactly one of fn, rows, reduce, bitmap, grid'])
    expect(bad({ bitmap: { matrix: { bb: 'gross', which: 'HX' } }, rows: { strings: ['1'] } })).toEqual(['bits: exactly one of fn, rows, reduce, bitmap, grid'])
  })
  it('bitmap: a known code and matrix, at most 4 bands, ranges inside the matrix drawn', () => {
    expect(bad({ bitmap: { matrix: { bb: 'gross', which: 'both' } } })).toEqual([])
    expect(bad({ bitmap: { matrix: { bb: 'nope' as never, which: 'HX' } } })).toEqual(["bits bitmap.matrix.bb: 'gross' or 'two-gross' or 'fifteen'"])
    expect(bad({ bitmap: { matrix: { bb: 'gross', which: 'XZ' as never } } })).toEqual(["bits bitmap.matrix.which: 'HX', 'HZ', 'both'"])
    expect(bad({ bitmap: {} as never })).toEqual(['bits bitmap.matrix: { bb, which }'])
    const band = { rows: [0, 3] as [number, number] }
    expect(bad({ bitmap: { matrix: { bb: 'gross', which: 'HX' }, bands: [band, band, band, band] } })).toEqual([])
    expect(bad({ bitmap: { matrix: { bb: 'gross', which: 'HX' }, bands: [band, band, band, band, band] } })).toEqual(['bits bitmap.bands: one to 4 bands'])
    expect(bad({ bitmap: { matrix: { bb: 'gross', which: 'HX' }, bands: [] } })).toEqual(['bits bitmap.bands: one to 4 bands'])
    expect(bad({ bitmap: { matrix: { bb: 'gross', which: 'HX' }, bands: [{}] } })).toEqual(['bits bitmap.bands[0]: rows, cols or both ([from, to])'])
    expect(bad({ bitmap: { matrix: { bb: 'gross', which: 'HX' }, bands: [{ rows: [0, 72] }] } })).toEqual(['bits bitmap.bands[0].rows: [from, to] whole numbers with 0 ≤ from ≤ to ≤ 71 (this matrix has 72 rows)'])
    expect(bad({ bitmap: { matrix: { bb: 'gross', which: 'both' }, bands: [{ rows: [0, 143] }] } })).toEqual([])
    expect(bad({ bitmap: { matrix: { bb: 'gross', which: 'HX' }, bands: [{ cols: [5, 3] }] } })[0]).toMatch(/^bits bitmap\.bands\[0\]\.cols: \[from, to\] whole numbers with 0 ≤ from ≤ to ≤ 143/)
    expect(bad({ bitmap: { matrix: { bb: 'gross', which: 'HX' }, bands: [{ cols: [0, 1.5] as never }] } })[0]).toMatch(/\.cols/)
    expect(bad({ bitmap: { matrix: { bb: 'two-gross', which: 'both' }, bands: [{ rows: [0, 288] }] } })[0]).toMatch(/this matrix has 288 rows/)
  })
  it('grid: a shift action needs a code and two whole numbers within the torus; rows: at most 12 × 12 of 0s and 1s', () => {
    expect(bad({ grid: { shiftAction: { code: 'gross', shift: [12, 6] } } })).toEqual([])
    expect(bad({ grid: { shiftAction: { code: 'nope' as never, shift: [1, 0] } } })).toEqual(["bits grid.shiftAction.code: 'gross' or 'two-gross'"])
    expect(bad({ grid: { shiftAction: { code: 'gross', shift: [1.5, 0] as never } } })).toEqual(['bits grid.shiftAction.shift: [a, b], two whole numbers (the monomial x^a y^b)'])
    expect(bad({ grid: { shiftAction: { code: 'gross', shift: [1] as never } } })[0]).toMatch(/^bits grid\.shiftAction\.shift/)
    expect(bad({ grid: { shiftAction: { code: 'gross', shift: [13, 0] } } })).toEqual(['bits grid.shiftAction.shift: |a| ≤ 12 and |b| ≤ 6 on this torus'])
    expect(bad({ grid: { shiftAction: { code: 'gross', shift: [0, 7] } } })[0]).toMatch(/\|b\| ≤ 6/)
    expect(bad({ grid: { shiftAction: { code: 'two-gross', shift: [0, 12] } } })).toEqual([])
    expect(bad({ grid: { rows: ['1'.repeat(12)].concat(Array.from({ length: 11 }, () => '0'.repeat(12))) } })).toEqual([])
    expect(bad({ grid: { rows: [] } })).toEqual(['bits grid.rows: one to 12 rows'])
    expect(bad({ grid: { rows: Array.from({ length: 13 }, () => '01') } })).toEqual(['bits grid.rows: one to 12 rows'])
    expect(bad({ grid: { rows: ['0'.repeat(13)] } })).toEqual(['bits grid.rows: at most 12 bits per row'])
    expect(bad({ grid: { rows: ['012'] } })).toEqual(['bits grid.rows: every row is a string of 0s and 1s'])
    expect(bad({ grid: { rows: ['01', '011'] } })).toEqual(['bits grid.rows: every row has the same width'])
    expect(bad({ grid: {} as never })[0]).toMatch(/^bits grid\.rows/)
  })
  it('reaches validateStage like any state', () => {
    expect(validateStage(B({ bitmap: { matrix: { bb: 'gross', which: 'both' } }, shot: 'B-BITS' }))).toEqual([])
    expect(validateStage(B({ grid: { rows: ['0'.repeat(13)] } }))[0]).toMatch(/^bits grid\.rows/)
  })
})

describe('bits B2: interpolation', () => {
  it('a bitmap and a grid are whole pictures: a change switches at the half-way point', () => {
    const a = R({ bitmap: { matrix: { bb: 'gross', which: 'HX' } } })
    const b = R({ grid: { rows: ['1'] } })
    expect(interpolate(a, b, 0.4)).toBe(a)
    expect(interpolate(a, b, 0.6)).toBe(b)
  })
})

describe('bits B2: the one scene', () => {
  const BOXES: [Mode, number, number, boolean, 'full' | 'top' | 'bottom'][] = [
    ['stage', 506, 785, false, 'full'],
    ['stage', 375, 640, false, 'full'],
    ['stage', 506, 360, false, 'top'],
    ['stage', 320, 300, true, 'full'],
    ['print', 320, 300, false, 'full'],
  ]
  const states: Omit<BitsState, 'kind'>[] = [
    { bitmap: { matrix: { bb: 'gross', which: 'both' }, bands: [{ rows: [0, 11] }, { cols: [72, 83] }] } },
    { bitmap: { matrix: { bb: 'two-gross', which: 'both' } } },
    { bitmap: { matrix: { bb: 'two-gross', which: 'HZ' } } },
    { grid: { shiftAction: { code: 'gross', shift: [3, -1] } } },
    { grid: { rows: ['101', '011', '110'] } },
    { grid: { rows: Array.from({ length: 12 }, (_, i) => '0'.repeat(i) + '1' + '0'.repeat(11 - i)) } },
  ]
  it('draws every state in every box with no NaN; a bitmap block is ONE path of rectangles, one for each run, not an element for each cell', () => {
    for (const st of states)
      for (const [mode, w, h, bare, slot] of BOXES) {
        const r = R(st)
        const html = draw(r, mode, w, h, bare, slot)
        const where = `${JSON.stringify(st)} ${mode} ${w}x${h} ${slot}`
        expect(html, where).not.toMatch(/NaN|Infinity|undefined/)
        if (r.bitmap) {
          const m = r.bitmap
          expect(html).toContain('data-anchor="bitmap"')
          expect(html.match(/data-block="/g), where).toHaveLength(m.xRows !== null ? 2 : 1)
          // the total number of rectangles in the paths equals the number of runs, and there are never more elements than a handful
          const d = [...html.matchAll(/<path d="([^"]*)"[^>]*data-block/g)].map((x) => x[1]).join('')
          expect(d.match(/M/g)?.length, `${where}: one rectangle for each run`).toBe(m.runs.length)
          expect(html.match(/<rect/g)?.length ?? 0, `${where}: no element for each cell`).toBeLessThanOrEqual(2 + m.bands.length)
          expect(html.match(/data-anchor="band"/g)?.length ?? 0).toBe(m.bands.length)
          expect(html).toContain('L qubits')
          expect(html).toContain('R qubits')
        } else {
          const g = r.grid!
          expect(html).toContain('data-anchor="grid"')
          expect(html.match(/<rect/g)?.length, where).toBe(g.rows * g.cols)
          for (const label of [...g.rowLabels, ...g.colLabels]) expect(html).toContain(`>${label}<`)
        }
      }
  })
  it('packing: the matrix lies inside the box and below the figure’s text lines; a grid’s cells are at least 12 px and fit', () => {
    for (const st of states)
      for (const [mode, w, h, bare, slot] of BOXES) {
        const r = R(st)
        const own = mode === 'print' || bare
        const readouts = bitsReadouts(r)
        const area = bitsArea(w, h, own, slot, readouts.length, own ? readouts.length : 0)
        const where = `${JSON.stringify(st)} ${mode} ${w}x${h} ${slot}`
        if (r.bitmap) {
          const L = bitmapLayout(r, area)
          expect(L.x0, where).toBeGreaterThanOrEqual(area.x)
          expect(L.x0 + L.w, where).toBeLessThanOrEqual(area.x + area.w + 0.01)
          expect(L.y0, where).toBeGreaterThanOrEqual(area.y)
          expect(L.y0 + L.h, where).toBeLessThanOrEqual(area.y + area.h + 0.01)
          expect(L.cell, where).toBeGreaterThan(0.4)
          expect(L.x0 + L.w).toBeLessThanOrEqual(w)
        } else {
          const T = gridTableLayout(r, area)
          expect(T.cell, where).toBeGreaterThanOrEqual(12)
          expect(T.x0 + T.cell * r.grid!.cols, where).toBeLessThanOrEqual(w)
          expect(T.x0 - T.labelW, where).toBeGreaterThanOrEqual(0)
          expect(T.y0 + T.cell * r.grid!.rows, where).toBeLessThanOrEqual(h)
        }
      }
  })
  it('runsPath writes one rectangle for each run in the rows asked for', () => {
    const r = R({ bitmap: { matrix: { bb: 'gross', which: 'both' } } })
    const L = bitmapLayout(r, bitsArea(506, 785, false, 'full', 4, 0))
    const m = r.bitmap!
    const upper = m.runs.filter(([row]) => row < m.xRows!).length
    expect(runsPath(m.runs, L, 0, m.xRows!).match(/M/g)).toHaveLength(upper)
    expect(runsPath(m.runs, L, 0, m.rows).match(/M/g)).toHaveLength(m.runs.length)
    expect(runsPath(m.runs, L, 5, 5)).toBe('')
  })
  it('the X block is drawn in the X hue and the Z block in the Z hue, so the two read as the two kinds of check', () => {
    const html = draw(R({ bitmap: { matrix: { bb: 'gross', which: 'both' } } }), 'stage', 506, 785)
    const fills = [...html.matchAll(/data-block="(H_[XZ])"/g)].map((m) => m[1])
    expect(fills).toEqual(['H_X', 'H_Z'])
    const styles = [...html.matchAll(/style="fill:([^"]*)"[^>]*data-block/g)].map((m) => m[1])
    expect(new Set(styles).size).toBe(2)
  })
  it('the print figure carries the readouts as its text lines', () => {
    const html = renderToString(<FigureFor layout={B({ bitmap: { matrix: { bb: 'gross', which: 'both' } }, shot: 'B-BITS' })} number="B2.3" caption="the check matrices" />)
    expect(html).toContain('<title>Fig. B2.3: BITS · 0 and 1 only</title>')
    expect(html).toContain('144 × 144 cells')
    expect(html).toContain('H_X H_Zᵀ = 0')
    expect(html).not.toMatch(/NaN|Infinity|undefined|no print drawing yet/)
    expect(renderToString(<FigureFor layout={B({ grid: { shiftAction: { code: 'gross', shift: [1, 0] } } })} number="B2.4" />)).not.toMatch(/NaN|Infinity|undefined|no print drawing yet/)
  })
})
