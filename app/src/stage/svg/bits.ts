/**
 * `bits` (709; SVG; P-F7-story §9.2): classical bits with no amplitudes. One state draws exactly one picture:
 *   fn      a gate or an authored table as a TRUTH TABLE (filled cell = 1) or as a MAP (inputs at the left, outputs at the right, one arrow
 *           per input; an output that receives more than one arrow is marked: that is a gate that cannot run backwards), optionally with a
 *           second source beside it;
 *   rows    strings of bits as rows of cells, with a computed last row (XOR, or the AND whose parity is the dot product) or each row's dot
 *           product with a word written at its end (the syndrome of a check matrix);
 *   reduce  Gauss–Jordan elimination over GF(2), shown after a chosen number of moves (a row swap or a row XOR), with the pivots outlined,
 *           the rank and the whole null space once it is done.
 * Content writes only INPUTS (a gate name or a table, strings, the number of moves done); this resolver takes every output, sum,
 * syndrome, pivot and reduced row from physics/qc/bits.ts (gateTable, preimageCount, isBijection, gf2RowReduceSteps, gf2Nullspace,
 * syndromeOf …), the same engine the Try-it widget and the numpy twin check. Interpolation follows stage/interp.ts: the number of
 * moves of a reduction lerps when both sides reduce the same matrix; everything else is a different picture and switches at the half-way
 * point. Lazy chunk (stage/svg/kinds.ts).
 * B2 (P-B2-story §9.2 K-B, additive): two more pictures. `bitmap`: a bivariate bicycle code's check matrix (physics/qec/bb.ts `bbCode`: H_X, H_Z or both) as
 * pixels, a filled pixel for each 1, one drawn run for each run of 1s, with the separators between the L and R qubits and between the X and Z checks, and optional
 * outlined bands of rows or columns. `grid`: a small labelled table of bits, either the logical action of a qubit shift on the 12 logical X operators of the gross
 * or two-gross code (`logicalXAction` on the paper's basis) or an authored table of strings.
 */
import type { BitsRowsState, BitsSource, BitsState, Scrub } from '../../content/stage'
import { BITS_COMBINE, BITS_VIEWS } from '../../content/stage'
import {
  BITS_GATES,
  type Bit,
  bitString,
  checkTable,
  dotMod2,
  gateTable,
  gf2Nullspace,
  gf2RowReduceSteps,
  gf2Span,
  hammingWeight,
  isBalanced,
  isBijection,
  isConstant,
  maxPreimages,
  parseBits,
  parity,
  preimageCount,
  syndromeOf,
} from '../../physics/qc/bits'
import { BITMAP_CODES, BITMAP_WHICH } from '../../content/stage'
import type { BitmapCode, BitsBitmapState, BitsGridState } from '../../content/stage'
import { GROSS_SPEC, TWO_GROSS_SPEC, bbCode, logicalXAction, makeLogicalSolver, paperLogicalBasis, type BBCode } from '../../physics/qec/bb'
import { scrub } from '../resolve'
import type { SvgReadout } from '../svgKinds'
import type { BitsInputs, ResolvedBits, ResolvedBitsBitmap, ResolvedBitsFn, ResolvedBitsGrid, ResolvedBitsMap, ResolvedBitsReduce, ResolvedBitsRows } from '../types'

/** Validation limits: small enough that every cell stays readable on a phone-width stage. */
export const BITS_LIMITS = { inBits: 3, outBits: 3, rowsMax: 4, widthMax: 8, nameLen: 6, marksMax: 8, bitmapRows: 288, bitmapCols: 576, bands: 4, gridMax: 12 } as const

const isBits = (s: unknown): s is string => typeof s === 'string' && /^[01]+$/.test(s)

/* ------------------------------------------------ resolve ------------------------------------------------ */

/** A source as a resolved map: the gate's table (or the authored one) with its counts, kind and marked inputs. */
export function bitsMap(src: BitsSource, mark: readonly string[] = []): ResolvedBitsMap {
  const t = 'gate' in src ? gateTable(src.gate) : checkTable(src.table, src.n, src.m)
  const { n, m, out } = t
  const inputs = Array.from({ length: 2 ** n }, (_, x) => bitString(x, n))
  const outputs = Array.from({ length: 2 ** m }, (_, y) => bitString(y, m))
  const preimages = outputs.map((_, y) => preimageCount(out, y))
  const col = m === 1 ? (out as Bit[]) : null
  return {
    label: 'gate' in src ? src.gate : 'f',
    n,
    m,
    out,
    inputs,
    outputs,
    preimages,
    maxPre: maxPreimages(out),
    reversible: n === m && isBijection(out, m),
    ones: col ? col.reduce<number>((s, v) => s + v, 0) : null,
    kind: col ? (isConstant(col) ? 'constant' : isBalanced(col) ? 'balanced' : 'neither') : null,
    marked: mark.map((s) => parseBits(s)).filter((x) => x < 2 ** n),
  }
}

const NAMES = ['a', 'b', 'c', 'd']

function rowsOf(r: BitsRowsState): ResolvedBitsRows {
  const w = r.strings[0].length
  const xs = r.strings.map(parseBits)
  const names = r.names ?? r.strings.map((_, i) => (r.against !== undefined ? `check ${i + 1}` : NAMES[i]))
  const out: ResolvedBitsRows = {
    names,
    strings: [...r.strings],
    width: w,
    weights: xs.map(hammingWeight),
    combine: r.combine ?? null,
    computed: null,
    distance: null,
    dot: null,
    against: null,
  }
  if (r.combine === 'xor') {
    const s = xs[0] ^ xs[1]
    out.computed = bitString(s, w)
    out.distance = hammingWeight(s)
  } else if (r.combine === 'dot') {
    const a = xs[0] & xs[1]
    out.computed = bitString(a, w)
    out.dot = parity(a)
    // the same number by the engine's own dot product
    if (out.dot !== dotMod2(xs[0], xs[1])) throw new Error('bits rows: the parity of the AND row is not the dot product')
  }
  if (r.against !== undefined) {
    const u = parseBits(r.against)
    const dots = xs.map((x) => dotMod2(x, u))
    const syndrome = syndromeOf(
      r.strings.map((s) => [...s].map(Number)),
      r.against,
    )
    if (syndrome !== dots.join('')) throw new Error('bits rows: the syndrome and the row-by-row dot products disagree')
    out.against = { word: r.against, dots, syndrome, value: parseBits(syndrome) }
  }
  return out
}

function reduceOf(strings: readonly string[], upTo: number): ResolvedBitsReduce {
  const M = strings.map((s) => [...s].map(Number))
  const cols = M[0].length
  const run = gf2RowReduceSteps(M)
  const total = run.steps.length
  const step = Math.min(total, Math.max(0, Math.round(upTo)))
  const bitsOf = (R: readonly (readonly number[])[]): string[] => R.map((row) => row.join(''))
  const done = step === total
  const last = step > 0 ? run.steps[step - 1] : null
  return {
    start: bitsOf(run.start),
    matrix: bitsOf(last ? last.R : run.start),
    step,
    total,
    move: last ? { op: last.op, a: last.a, b: last.b } : null,
    done,
    pivots: done ? run.pivots : [],
    rank: done ? run.rank : null,
    nullSpace: done ? gf2Span(gf2Nullspace(M, cols), cols).map((x) => bitString(x, cols)) : null,
  }
}

/* ------------------------------------------------ B2: bitmap and grid ------------------------------------------------ */
const BB_MEMO = new Map<BitmapCode, BBCode>()
/** The gross or two-gross code from the paper's own parameters (built once). */
function bbOf(which: BitmapCode): BBCode {
  let c = BB_MEMO.get(which)
  if (!c) {
    c = bbCode(which === 'gross' ? GROSS_SPEC : TWO_GROSS_SPEC)
    BB_MEMO.set(which, c)
  }
  return c
}

function bitmapOf(b: BitsBitmapState): ResolvedBitsBitmap {
  const code = bbOf(b.matrix.bb)
  const which = b.matrix.which
  const blocks = which === 'HX' ? [code.HX] : which === 'HZ' ? [code.HZ] : [code.HX, code.HZ]
  const runs: [number, number, number][] = []
  let ones = 0
  let wMax = 0
  let wMin = Infinity
  let row = 0
  for (const H of blocks) {
    for (let i = 0; i < H.rows; i++, row++) {
      const w = H.rowWeight(i)
      ones += w
      wMax = Math.max(wMax, w)
      wMin = Math.min(wMin, w)
      let j = 0
      while (j < H.cols) {
        if (!H.get(i, j)) {
          j++
          continue
        }
        let k = j
        while (k < H.cols && H.get(i, k)) k++
        runs.push([row, j, k - j])
        j = k
      }
    }
  }
  return {
    code: b.matrix.bb,
    which,
    name: `${b.matrix.bb} [[${code.n}, ${code.k}]]`,
    rows: row,
    cols: code.n,
    ones,
    rowWeightMax: wMax,
    rowWeightMin: wMin,
    split: code.cells,
    xRows: blocks.length === 2 ? code.HX.rows : null,
    runs,
    commute: code.HX.mul(code.HZ.transpose()).isZero(),
    l: code.l,
    m: code.m,
    bands: (b.bands ?? []).map((x) => ({ rows: x.rows ?? null, cols: x.cols ?? null })),
  }
}

const gridLabels = (n: number, prefix: string): string[] => Array.from({ length: n }, (_, i) => `${prefix}${i + 1}`)

function gridOf(g: BitsGridState): ResolvedBitsGrid {
  if ('shiftAction' in g) {
    const { code: which, shift } = g.shiftAction
    const code = bbOf(which)
    const basis = paperLogicalBasis(code, which).X
    const M = logicalXAction(code, basis, code.shiftPermutation(shift[0], shift[1]), makeLogicalSolver(code, basis))
    if (!M) throw new Error('bits grid.shiftAction: the shift does not map the code to itself')
    const cells = Array.from({ length: M.rows }, (_, i) => Array.from({ length: M.cols }, (_, j) => M.get(i, j) as 0 | 1))
    const ones = cells.reduce<number>((s, r) => s + r.reduce<number>((t, b) => t + b, 0), 0)
    return {
      view: 'shift',
      rows: M.rows,
      cols: M.cols,
      cells,
      rowLabels: gridLabels(M.rows, 'X'),
      colLabels: gridLabels(M.cols, 'X'),
      ones,
      shift: { code: which, a: shift[0], b: shift[1], name: `x^${shift[0]} y^${shift[1]}`, identity: cells.every((r, i) => r.every((b, j) => b === (i === j ? 1 : 0))), ones, columnsWeights: Array.from({ length: M.cols }, (_, j) => cells.reduce<number>((s, r) => s + r[j], 0)) },
    }
  }
  const cells = g.rows.map((s) => [...s].map((ch) => (ch === '1' ? 1 : 0) as 0 | 1))
  return {
    view: 'rows',
    rows: cells.length,
    cols: cells[0].length,
    cells,
    rowLabels: gridLabels(cells.length, ''),
    colLabels: gridLabels(cells[0].length, ''),
    ones: cells.reduce<number>((s, r) => s + r.reduce<number>((t, b) => t + b, 0), 0),
    shift: null,
  }
}

const BITMAP_MEMO = new Map<string, ResolvedBitsBitmap>()
const GRID_MEMO = new Map<string, ResolvedBitsGrid>()
const memo = <T>(m: Map<string, T>, key: string, make: () => T): T => {
  const hit = m.get(key)
  if (hit) return hit
  const v = make()
  if (m.size > 24) m.delete(m.keys().next().value as string)
  m.set(key, v)
  return v
}

/** Every derived field from the inputs (shared by resolve and interpolate). */
export function bitsFrom(inp: BitsInputs): ResolvedBits {
  let fn: ResolvedBitsFn | null = null
  if (inp.fn) {
    const maps = [bitsMap(inp.fn.source, inp.fn.mark)]
    if (inp.fn.versus) maps.push(bitsMap(inp.fn.versus))
    fn = { view: inp.fn.view, maps }
  }
  return {
    kind: 'bits',
    fn,
    rows: inp.rows ? rowsOf(inp.rows) : null,
    reduce: inp.reduce ? reduceOf(inp.reduce.strings, inp.reduce.upTo) : null,
    ...(inp.bitmap ? { bitmap: memo(BITMAP_MEMO, JSON.stringify(inp.bitmap), () => bitmapOf(inp.bitmap as BitsBitmapState)) } : {}),
    ...(inp.grid ? { grid: memo(GRID_MEMO, JSON.stringify(inp.grid), () => gridOf(inp.grid as BitsGridState)) } : {}),
    inputs: inp,
    shot: inp.shot,
  }
}

export function bitsInputs(st: BitsState, s: number): BitsInputs {
  return { fn: st.fn, rows: st.rows, reduce: st.reduce ? { strings: st.reduce.strings, upTo: scrub(st.reduce.upTo, s) } : undefined, ...(st.bitmap ? { bitmap: st.bitmap } : {}), ...(st.grid ? { grid: st.grid } : {}), shot: st.shot }
}

export function resolveBitsStage(st: BitsState, s: number): ResolvedBits {
  return bitsFrom(bitsInputs(st, s))
}

/* ------------------------------------------------ interpolation ------------------------------------------------ */
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export function interpBitsStage(a: ResolvedBits, b: ResolvedBits, t: number): ResolvedBits {
  if (t <= 0) return a
  if (t >= 1) return b
  const A = a.inputs.reduce
  const B = b.inputs.reduce
  // the same matrix reduced to a different stage of the elimination: slide through the snapshots
  if (A && B && A.strings.join() === B.strings.join()) return bitsFrom({ ...(t < 0.5 ? a.inputs : b.inputs), reduce: { strings: A.strings, upTo: lerp(A.upTo, B.upTo, t) } })
  return t < 0.5 ? a : b
}

/* ------------------------------------------------ validation ------------------------------------------------ */
const scrubFinite = (v: Scrub): boolean => (typeof v === 'number' ? Number.isFinite(v) : Number.isFinite(v.from) && Number.isFinite(v.to))
const scrubEnds = (v: Scrub): number[] => (typeof v === 'number' ? [v] : [v.from, v.to])

function sourceProblems(src: BitsSource | undefined, where: string): string[] {
  if (!src || typeof src !== 'object') return [`${where}: a source ({ gate } or { table, n, m })`]
  if ('gate' in src) return (BITS_GATES as readonly string[]).includes(src.gate) ? [] : [`${where}: unknown gate "${src.gate}" (${BITS_GATES.join(', ')})`]
  if (!Array.isArray(src.table)) return [`${where}: a source is { gate } or { table, n, m }`]
  try {
    checkTable(src.table, src.n, src.m)
    return []
  } catch (e) {
    return [`${where}: ${(e as Error).message}`]
  }
}

function stringsProblems(strings: unknown, where: string): string[] {
  if (!Array.isArray(strings) || strings.length < 1 || strings.length > BITS_LIMITS.rowsMax) return [`${where}: one to ${BITS_LIMITS.rowsMax} rows`]
  if (!strings.every(isBits)) return [`${where}: every row is a string of 0s and 1s`]
  const w = strings[0].length
  if (w > BITS_LIMITS.widthMax) return [`${where}: at most ${BITS_LIMITS.widthMax} bits per row`]
  if (!strings.every((s: string) => s.length === w)) return [`${where}: every row has the same width`]
  return []
}

const isIntPair = (v: unknown): v is [number, number] => Array.isArray(v) && v.length === 2 && v.every((x) => Number.isInteger(x))

function bitmapProblems(b: BitsBitmapState): string[] {
  const errs: string[] = []
  if (!b.matrix || typeof b.matrix !== 'object') return ['bits bitmap.matrix: { bb, which }']
  if (!(BITMAP_CODES as readonly string[]).includes(b.matrix.bb)) errs.push(`bits bitmap.matrix.bb: ${BITMAP_CODES.map((v) => `'${v}'`).join(' or ')}`)
  if (!(BITMAP_WHICH as readonly string[]).includes(b.matrix.which)) errs.push(`bits bitmap.matrix.which: ${BITMAP_WHICH.map((v) => `'${v}'`).join(', ')}`)
  if (errs.length) return errs
  const code = bbOf(b.matrix.bb)
  const rows = (b.matrix.which === 'both' ? 2 : 1) * code.cells
  if (rows > BITS_LIMITS.bitmapRows || code.n > BITS_LIMITS.bitmapCols) errs.push(`bits bitmap: ${rows} × ${code.n} cells; at most ${BITS_LIMITS.bitmapRows} × ${BITS_LIMITS.bitmapCols}`)
  if (b.bands !== undefined) {
    if (!Array.isArray(b.bands) || b.bands.length < 1 || b.bands.length > BITS_LIMITS.bands) return [...errs, `bits bitmap.bands: one to ${BITS_LIMITS.bands} bands`]
    b.bands.forEach((x, i) => {
      const where = `bits bitmap.bands[${i}]`
      if (!x || (x.rows === undefined && x.cols === undefined)) return void errs.push(`${where}: rows, cols or both ([from, to])`)
      for (const [name, range, max] of [['rows', x.rows, rows], ['cols', x.cols, code.n]] as const) {
        if (range === undefined) continue
        if (!isIntPair(range) || range[0] < 0 || range[1] < range[0] || range[1] >= max) errs.push(`${where}.${name}: [from, to] whole numbers with 0 ≤ from ≤ to ≤ ${max - 1} (this matrix has ${max} ${name})`)
      }
    })
  }
  return errs
}

function gridProblems(g: BitsGridState): string[] {
  if (!g || typeof g !== 'object') return ['bits grid: { shiftAction } or { rows }']
  if ('shiftAction' in g && 'rows' in g) return ['bits grid: shiftAction or rows, not both']
  if ('shiftAction' in g) {
    const sa = g.shiftAction
    if (!sa || !(BITMAP_CODES as readonly string[]).includes(sa.code)) return [`bits grid.shiftAction.code: ${BITMAP_CODES.map((v) => `'${v}'`).join(' or ')}`]
    if (!isIntPair(sa.shift)) return ['bits grid.shiftAction.shift: [a, b], two whole numbers (the monomial x^a y^b)']
    const code = bbOf(sa.code)
    if (Math.abs(sa.shift[0]) > code.l || Math.abs(sa.shift[1]) > code.m) return [`bits grid.shiftAction.shift: |a| ≤ ${code.l} and |b| ≤ ${code.m} on this torus`]
    return []
  }
  if (!('rows' in g) || !Array.isArray(g.rows) || g.rows.length < 1 || g.rows.length > BITS_LIMITS.gridMax) return [`bits grid.rows: one to ${BITS_LIMITS.gridMax} rows`]
  if (!g.rows.every(isBits)) return ['bits grid.rows: every row is a string of 0s and 1s']
  if (g.rows[0].length > BITS_LIMITS.gridMax) return [`bits grid.rows: at most ${BITS_LIMITS.gridMax} bits per row`]
  if (!g.rows.every((s) => s.length === g.rows[0].length)) return ['bits grid.rows: every row has the same width']
  return []
}

export function validateBitsStage(st: BitsState): string[] {
  const errs: string[] = []
  const parts = [st.fn, st.rows, st.reduce, st.bitmap, st.grid].filter((x) => x !== undefined).length
  if (parts !== 1) return ['bits: exactly one of fn, rows, reduce, bitmap, grid']
  if (st.bitmap) return bitmapProblems(st.bitmap)
  if (st.grid) return gridProblems(st.grid)
  if (st.fn) {
    const f = st.fn
    if (!(BITS_VIEWS as readonly string[]).includes(f.view)) errs.push(`bits fn.view: ${BITS_VIEWS.map((v) => `'${v}'`).join(' or ')}`)
    errs.push(...sourceProblems(f.source, 'bits fn.source'))
    if (f.versus !== undefined) errs.push(...sourceProblems(f.versus, 'bits fn.versus'))
    if (f.mark !== undefined) {
      if (!Array.isArray(f.mark) || f.mark.length > BITS_LIMITS.marksMax || !f.mark.every(isBits)) errs.push(`bits fn.mark: at most ${BITS_LIMITS.marksMax} strings of 0s and 1s`)
      else if (!errs.length) {
        const n = bitsMap(f.source).n
        if (!f.mark.every((s) => s.length === n)) errs.push(`bits fn.mark: each is an input of ${n} bits`)
      }
    }
  }
  if (st.rows) {
    const r = st.rows
    errs.push(...stringsProblems(r.strings, 'bits rows.strings'))
    if (!errs.length) {
      if (r.combine !== undefined) {
        if (!(BITS_COMBINE as readonly string[]).includes(r.combine)) errs.push(`bits rows.combine: ${BITS_COMBINE.map((v) => `'${v}'`).join(' or ')}`)
        if (r.strings.length !== 2) errs.push('bits rows.combine: needs exactly two rows')
        if (r.against !== undefined) errs.push('bits rows: combine and against do not go together')
      }
      if (r.against !== undefined && !(isBits(r.against) && r.against.length === r.strings[0].length)) errs.push('bits rows.against: a word of 0s and 1s as wide as the rows')
      if (r.names !== undefined) {
        const lenOk = Array.isArray(r.names) && r.names.length === r.strings.length
        if (!lenOk) errs.push('bits rows.names: one name per row')
        else if (!r.names.every((x) => typeof x === 'string' && x.length >= 1 && x.length <= BITS_LIMITS.nameLen)) errs.push(`bits rows.names: 1–${BITS_LIMITS.nameLen} characters each`)
      }
    }
  }
  if (st.reduce) {
    const r = st.reduce
    errs.push(...stringsProblems(r.strings, 'bits reduce.strings'))
    if (!scrubFinite(r.upTo)) errs.push('bits reduce.upTo: non-finite')
    else if (!errs.length) {
      const total = gf2RowReduceSteps(r.strings.map((s) => [...s].map(Number))).steps.length
      for (const x of scrubEnds(r.upTo)) {
        if (x < 0 || x > total) errs.push(`bits reduce.upTo: ${x} is outside 0 … ${total} (the elimination makes ${total} moves)`)
        else if (typeof r.upTo === 'number' && !Number.isInteger(x)) errs.push('bits reduce.upTo: a whole number of moves at rest')
      }
    }
  }
  return errs
}

/* ------------------------------------------------ readouts ------------------------------------------------ */
const rowName = (k: number): string => String(k + 1)

/** The text of a move, rows counted from 1. */
export const moveText = (mv: { op: 'swap' | 'xor'; a: number; b: number }): string => (mv.op === 'swap' ? `swap rows ${rowName(mv.a)} and ${rowName(mv.b)}` : `add row ${rowName(mv.a)} to row ${rowName(mv.b)}`)

export function bitsReadouts(r: ResolvedBits): SvgReadout[] {
  const out: SvgReadout[] = []
  if (r.fn) {
    const f = r.fn
    f.maps.forEach((m, i) => {
      if (f.view === 'table') {
        const tag = f.maps.length > 1 ? `${m.label}: ` : ''
        out.push({ name: `rows-${i}`, text: `${tag}${2 ** m.n} rows` })
        if (m.ones !== null) out.push({ name: `ones-${i}`, text: `${tag}1s: ${m.ones} of ${2 ** m.n}` })
        if (m.kind !== null) out.push({ name: `kind-${i}`, text: `${tag}${m.kind === 'neither' ? 'not constant or balanced' : m.kind}` })
      } else out.push({ name: `merge-${i}`, text: `${f.maps.length > 1 ? `${m.label}: ` : ''}${m.reversible ? 'reversible' : `${m.maxPre} ${m.maxPre === 1 ? 'input' : 'inputs'} → one output`}`, tone: m.reversible ? 'state' : 'op' })
    })
  }
  if (r.rows) {
    const w = r.rows
    const [na, nb] = w.names
    if (w.against) {
      out.push({ name: 'syndrome', text: `checks read ${w.against.syndrome}` })
      out.push({ name: 'syndrome-value', text: `${w.against.syndrome} is ${w.against.value} in binary` })
    } else if (w.combine === 'xor') {
      out.push({ name: 'xor', text: `${na} ⊕ ${nb} = ${w.computed}` })
      out.push({ name: 'distance', text: `differ in ${w.distance} places` })
    } else if (w.combine === 'dot') {
      out.push({ name: 'and', text: `${na} AND ${nb} = ${w.computed}` })
      out.push({ name: 'dot', text: `${na}·${nb} = ${w.dot}` })
    } else w.strings.forEach((_, i) => out.push({ name: `wt-${i}`, text: `weight of ${w.names[i]}: ${w.weights[i]}` }))
  }
  if (r.reduce) {
    const d = r.reduce
    out.push({ name: 'step', text: `move ${d.step} of ${d.total}` })
    out.push({ name: 'move', text: d.move ? moveText(d.move) : 'the matrix as given' })
    if (d.done) {
      out.push({ name: 'rank', text: `rank ${d.rank}` })
      out.push({ name: 'null', text: `null space: ${d.nullSpace!.join(', ')}` })
    }
  }
  if (r.bitmap) {
    const m = r.bitmap
    out.push({ name: 'size', text: `${m.rows} × ${m.cols} cells` })
    out.push({ name: 'ones', text: `${m.ones} ones` })
    out.push({ name: 'weight', text: `row weight ${m.rowWeightMin === m.rowWeightMax ? m.rowWeightMax : `${m.rowWeightMin}–${m.rowWeightMax}`}` })
    out.push({ name: 'commute', text: m.commute ? 'H_X H_Zᵀ = 0' : 'H_X H_Zᵀ ≠ 0', tone: m.commute ? 'plus' : 'minus' })
  }
  if (r.grid) {
    const g = r.grid
    if (g.shift) {
      out.push({ name: 'shift', text: `shift ${g.shift.name}`, tone: 'op' })
      out.push({ name: 'ones', text: g.shift.identity ? 'the identity on the logicals' : `${g.shift.ones} ones in ${g.rows} × ${g.cols}` })
    } else {
      out.push({ name: 'size', text: `${g.rows} × ${g.cols} table` })
      out.push({ name: 'ones', text: `${g.ones} ones` })
    }
  }
  return out
}
