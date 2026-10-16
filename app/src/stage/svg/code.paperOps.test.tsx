/**
 * `code`, bb source, the `paperOps` overlay (Papers P1): the L and R qubits in the support of 1–4 of the paper's logical operators of the gross and two-gross codes, marked on the l × m torus of
 * cells. The resolver takes every support from physics/qec/bb.ts (`paperLogicalBasis`; a shift by `shiftPermutation` + `Pauli.permuted`); these tests check it against the engine (weights, the
 * qubits two operators share, the commutation table of tdgPairingRows), the shift, every validation limit with a message that names the field, the readouts, the passport and drawer, and that the
 * one scene draws the marks in the live stage, the reading version and the print figure with no NaN, inside the drawing area, with its labels clear of each other.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { fidelityOf } from '../../content/fidelity'
import type { CodeState } from '../../content/stage'
import { CODE_PAPER_OPS, PASSPORT, PASSPORT_VARIANT, passportOf } from '../../content/stage'
import { paperLogicalBasis } from '../../physics/qec/bb'
import { bbCodeOf } from '../../physics/qec/bbfamily'
import { tdgPairingRows } from '../../physics/qec/tdg'
import { FigureFor } from '../figures/FigureFor'
import { interpolate } from '../interp'
import { firstNonFinite, resolve, validateStage } from '../resolve'
import type { ResolvedCode } from '../types'
import { bbReadouts, paperOpLabel } from './code.bb'
import { CodeScene, codeGeometry } from './CodeScene'
import './kinds'

const C = (st: Omit<CodeState, 'kind'>): CodeState => ({ kind: 'code', ...st })
const R = (st: Omit<CodeState, 'kind'>) => resolve(C(st), 1) as ResolvedCode
const bad = (st: Omit<CodeState, 'kind'>): string[] => validateStage(C(st))
const ops = (preset: 'gross' | 'two-gross', names: string[], shift?: [number, number]): Omit<CodeState, 'kind'> => ({ bb: { preset }, paperOps: { ops: names, ...(shift ? { shift } : {}) } })
const texts = (r: ResolvedCode) => bbReadouts(r).map((x) => x.text)
const bar = (name: string): string => `${name[0]}̄${name.slice(1)}`
const draw = (r: ResolvedCode, mode: 'stage' | 'print', w: number, h: number, bare = false, slot: 'full' | 'top' | 'bottom' = 'full') =>
  renderToString(
    <svg viewBox={`0 0 ${w} ${h}`}>
      <CodeScene state={r} mode={mode} width={w} height={h} bare={bare} slot={slot} />
    </svg>,
  )

describe('code paperOps: the supports are the engine’s', () => {
  it('gross: X̄1 and Z̄1 have weight 12 and share one qubit, so they anticommute', () => {
    const r = R(ops('gross', ['X1', 'Z1']))
    const P = r.bbx!.paperOps!
    expect(P.ops.map((o) => [o.name, o.type, o.label, o.weight])).toEqual([
      ['X1', 'X', bar('X1'), 12],
      ['Z1', 'Z', bar('Z1'), 12],
    ])
    expect(P.pairs).toEqual([{ a: bar('X1'), b: bar('Z1'), share: 1, commute: false }])
    expect(P.both).toHaveLength(1)
    expect(P.xOnly).toHaveLength(11)
    expect(P.zOnly).toHaveLength(11)
    expect(P.shift).toBeNull()
    // the same numbers as the engine itself
    const basis = paperLogicalBasis(bbCodeOf('gross'), 'gross')
    expect(P.ops[0].qubits).toEqual(basis.X[0].support())
    expect(P.ops[1].qubits).toEqual(basis.Z[0].support())
    expect(P.both).toEqual(basis.X[0].support().filter((q) => basis.Z[0].support().includes(q)))
  })
  it('two-gross: weight 20 each, and they still share one qubit', () => {
    const P = R(ops('two-gross', ['X1', 'Z1'])).bbx!.paperOps!
    expect(P.ops.map((o) => o.weight)).toEqual([20, 20])
    expect(P.pairs[0]).toMatchObject({ share: 1, commute: false })
    expect(R(ops('two-gross', ['X1'])).n).toBe(288)
  })
  it('X-type operators come from basis.X[i − 1] and Z-type from basis.Z[i − 1], for every i', () => {
    for (const code of ['gross', 'two-gross'] as const) {
      const basis = paperLogicalBasis(bbCodeOf(code), code)
      for (let i = 1; i <= 12; i++) {
        const P = R(ops(code, [`X${i}`, `Z${i}`])).bbx!.paperOps!
        expect(P.ops[0].qubits, `${code} X${i}`).toEqual(basis.X[i - 1].support())
        expect(P.ops[1].qubits, `${code} Z${i}`).toEqual(basis.Z[i - 1].support())
      }
    }
  })
  it('the number of shared qubits decides commutation exactly as the engine’s pairing table does: X̄i with Z̄j anticommute only for i = j', () => {
    for (const code of ['gross', 'two-gross'] as const) {
      const table = tdgPairingRows(code)
      for (let i = 1; i <= 12; i++)
        for (let j = 1; j <= 12; j++) {
          const pair = R(ops(code, [`X${i}`, `Z${j}`])).bbx!.paperOps!.pairs[0]
          expect(pair.commute, `${code} X${i} Z${j}`).toBe(table[i - 1][j - 1] === '0')
          expect(pair.share % 2 === 0, `${code} X${i} Z${j}`).toBe(pair.commute)
        }
    }
  })
  it('up to four operators: every pair is listed (same-type pairs have no commutation verdict); qubits in an X-type and a Z-type operator are the Y set', () => {
    const P = R(ops('gross', ['X1', 'X7', 'Z1', 'Z7'])).bbx!.paperOps!
    expect(P.pairs.map((q) => [q.a, q.b])).toEqual([
      [bar('X1'), bar('X7')],
      [bar('X1'), bar('Z1')],
      [bar('X1'), bar('Z7')],
      [bar('X7'), bar('Z1')],
      [bar('X7'), bar('Z7')],
      [bar('Z1'), bar('Z7')],
    ])
    expect(P.pairs.map((q) => q.commute)).toEqual([null, false, true, true, false, null])
    const x = new Set(P.ops.filter((o) => o.type === 'X').flatMap((o) => o.qubits))
    const z = new Set(P.ops.filter((o) => o.type === 'Z').flatMap((o) => o.qubits))
    expect(P.both).toEqual([...x].filter((q) => z.has(q)).sort((a, b) => a - b))
    expect(P.xOnly.length + P.zOnly.length + P.both.length).toBe(new Set([...x, ...z]).size)
    expect(new Set([...P.xOnly, ...P.zOnly, ...P.both]).size).toBe(P.xOnly.length + P.zOnly.length + P.both.length)
  })
})

describe('code paperOps: a shift moves the operators by the monomial x^a y^b', () => {
  it('the support is the engine’s shiftPermutation of the Pauli, its weight and its commutation with every check are unchanged', () => {
    const code = bbCodeOf('gross')
    const basis = paperLogicalBasis(code, 'gross')
    for (const [a, b] of [[1, 0], [0, 1], [3, 2], [-2, 5], [12, 6], [0, 0]] as [number, number][]) {
      const P = R(ops('gross', ['X1', 'Z7'], [a, b])).bbx!.paperOps!
      const perm = code.shiftPermutation(a, b)
      expect(P.ops[0].qubits, `shift ${a},${b}`).toEqual(basis.X[0].permuted(perm).support())
      expect(P.ops[1].qubits).toEqual(basis.Z[6].permuted(perm).support())
      expect(P.ops.map((o) => o.weight)).toEqual([12, 12])
      // a shifted logical operator is still a logical operator: X-type commutes with every Z check, Z-type with every X check
      const x = new Array<number>(code.n).fill(0)
      for (const q of P.ops[0].qubits) x[q] = 1
      expect(code.HZ.mulVec(x).every((v) => v === 0)).toBe(true)
      const z = new Array<number>(code.n).fill(0)
      for (const q of P.ops[1].qubits) z[q] = 1
      expect(code.HX.mulVec(z).every((v) => v === 0)).toBe(true)
      expect(P.shift).toMatchObject({ a, b })
    }
  })
  it('a shift of (0, 0) leaves the support as it was; a real shift moves it; the shift is named as a monomial', () => {
    const plain = R(ops('gross', ['X1'])).bbx!.paperOps!.ops[0].qubits
    expect(R(ops('gross', ['X1'], [0, 0])).bbx!.paperOps!.ops[0].qubits).toEqual(plain)
    expect(R(ops('gross', ['X1'], [1, 0])).bbx!.paperOps!.ops[0].qubits).not.toEqual(plain)
    expect(R(ops('gross', ['X1'], [2, 1])).bbx!.paperOps!.shift!.name).toBe('x^2 y')
    expect(R(ops('gross', ['X1'], [1, 0])).bbx!.paperOps!.shift!.name).toBe('x')
    expect(R(ops('gross', ['X1'], [0, 0])).bbx!.paperOps!.shift!.name).toBe('1')
  })
  it('a full turn of the torus (ℓ, m) is the identity: the support comes back', () => {
    expect(R(ops('gross', ['Z3'], [12, 6])).bbx!.paperOps!.ops[0].qubits).toEqual(R(ops('gross', ['Z3'])).bbx!.paperOps!.ops[0].qubits)
  })
})

describe('code paperOps: the readouts print the engine’s numbers in the plan’s words', () => {
  it('each operator’s weight and the qubits each pair shares', () => {
    const r = R(ops('gross', ['X1', 'Z1']))
    expect(texts(r)).toEqual(['n = 144 · k = 12', 'd = 12 (printed)', '12 × 6 cells', 'check weight 6', `${bar('X1')} weight 12`, `${bar('Z1')} weight 12`, `${bar('X1')} and ${bar('Z1')} share 1 · anticommute`])
    expect(texts(R(ops('two-gross', ['X7', 'Z1'], [1, 2])))).toContain('all shifted by x y^2')
    expect(texts(R(ops('gross', ['X1', 'X7'])))).toContain(`${bar('X1')} and ${bar('X7')} share 0`)
    expect(bbReadouts(r).map((x) => x.name)).toContain('op-X1')
    expect(paperOpLabel('Z12')).toBe(bar('Z12'))
  })
})

describe('code paperOps: the passport and the drawer', () => {
  it('a state with paperOps takes the variant passport and its own drawer; any other code state is unchanged', () => {
    const st = C(ops('gross', ['X1']))
    expect(passportOf(st)).toBe(PASSPORT_VARIANT.codePaperOps)
    expect(passportOf(st).title).toBe(PASSPORT.code.title)
    expect(passportOf(st).fidelityKey).toBe('code-paper-ops')
    expect(passportOf(C({ bb: { preset: 'gross' } }))).toBe(PASSPORT.code)
    expect(passportOf(C({ code: 'steane7' }))).toBe(PASSPORT.code)
    const f = fidelityOf('code-paper-ops')
    expect(f.exact.map((i) => i.id)).toEqual(['qc-code-paper-ops'])
    expect(f.schematic.map((i) => i.id)).toEqual(['qc-code-paper-ops-layout'])
    expect(f.misleading.map((i) => i.id)).toEqual(['qc-code-paper-ops-basis'])
    expect(f.misleading[0].text).toMatch(/paper’s choice of basis, one of many/)
    // the code drawer is exactly what it was (the pinned list of stage/svg/code.test.tsx)
    expect(Object.values(fidelityOf('code')).flat().map((i) => i.id)).not.toContain('qc-code-paper-ops')
  })
})

describe('code paperOps: validation names the field', () => {
  it('accepts every operator name, one to four distinct, with or without a shift', () => {
    expect(CODE_PAPER_OPS).toHaveLength(24)
    for (const name of CODE_PAPER_OPS) expect(bad(ops('gross', [name])), name).toEqual([])
    expect(bad(ops('two-gross', ['X1', 'X7', 'Z1', 'Z7'], [-12, 12]))).toEqual([])
    expect(bad({ ...ops('gross', ['X1']), view: 'cells' })).toEqual([])
  })
  it('the operators: one to four of X1 … X12, Z1 … Z12, each once', () => {
    const msg = ["code paperOps.ops: one to four of 'X1' … 'X12' and 'Z1' … 'Z12' (the paper's logical operators)"]
    expect(bad(ops('gross', []))).toEqual(msg)
    expect(bad(ops('gross', ['X1', 'X2', 'X3', 'X4', 'X5']))).toEqual(msg)
    expect(bad(ops('gross', ['X0']))).toEqual(msg)
    expect(bad(ops('gross', ['X13']))).toEqual(msg)
    expect(bad(ops('gross', ['Y1']))).toEqual(msg)
    expect(bad(ops('gross', ['x1']))).toEqual(msg)
    expect(bad(ops('gross', ['X1', 'X1']))).toEqual(['code paperOps.ops: each operator once'])
    expect(bad({ bb: { preset: 'gross' }, paperOps: {} as never })).toEqual(msg)
  })
  it('the shift: two whole numbers with |a| ≤ ℓ and |b| ≤ m', () => {
    expect(bad(ops('gross', ['X1'], [13, 0]))).toEqual(['code paperOps.shift: [a, b] whole numbers with |a| ≤ 12, |b| ≤ 6'])
    expect(bad(ops('gross', ['X1'], [0, 7]))).toEqual(['code paperOps.shift: [a, b] whole numbers with |a| ≤ 12, |b| ≤ 6'])
    expect(bad(ops('two-gross', ['X1'], [0, 12]))).toEqual([])
    expect(bad(ops('two-gross', ['X1'], [0, 13]))).toEqual(['code paperOps.shift: [a, b] whole numbers with |a| ≤ 12, |b| ≤ 12'])
    expect(bad(ops('gross', ['X1'], [1.5, 0]))).toEqual(['code paperOps.shift: [a, b] whole numbers with |a| ≤ 12, |b| ≤ 6'])
    expect(bad({ bb: { preset: 'gross' }, paperOps: { ops: ['X1'], shift: [1] as never } })).toEqual(['code paperOps.shift: [a, b] whole numbers with |a| ≤ 12, |b| ≤ 6'])
  })
  it('only the gross and two-gross presets in their default form have the paper’s operators', () => {
    expect(bad({ bb: { preset: 'b72' }, paperOps: { ops: ['X1'] } })).toEqual(["code paperOps: only the gross and two-gross presets have the paper's operators (this state uses the preset b72)"])
    expect(bad({ bb: { spec: { l: 6, m: 6, A: [[3, 0], [0, 1], [0, 2]], B: [[0, 3], [1, 0], [2, 0]] } }, paperOps: { ops: ['X1'] } })).toEqual(["code paperOps: only the gross and two-gross presets have the paper's operators (this state uses a spec)"])
    expect(bad({ bb: { preset: 'gross', form: 'bravyi' }, paperOps: { ops: ['X1'] } })).toEqual(["code paperOps: the paper's operators are written for the default (toric) form of the gross codes; drop form: 'bravyi'"])
    expect(bad({ bb: { preset: 'gross', form: 'toric' }, paperOps: { ops: ['X1'] } })).toEqual([])
  })
  it('only the cells view draws it', () => {
    expect(bad({ ...ops('gross', ['X1']), view: 'layers' })).toEqual(["code paperOps: only the 'cells' view draws it (this state is the 'layers' view)"])
    expect(bad({ bb: { preset: 'gross', form: 'bravyi' }, view: 'cycle', cycle: { variant: 'printed', round: 1 }, paperOps: { ops: ['X1'] } }).join(' ')).toContain("code paperOps: only the 'cells' view draws it")
  })
  it('the other sources refuse it', () => {
    expect(bad({ code: 'steane7', paperOps: { ops: ['X1'] } })).toEqual(['code paperOps: only a bb source (the gross or two-gross preset, cells view) takes it'])
    expect(bad({ toric: { L: 3 }, paperOps: { ops: ['X1'] } })).toEqual(['code paperOps: only a bb source (the gross or two-gross preset, cells view) takes it'])
    expect(bad({ rotated: { d: 3 }, paperOps: { ops: ['X1'] } })).toEqual(['code paperOps: only a bb source (the gross or two-gross preset, cells view) takes it'])
    expect(bad({ planar: { d: 3 }, paperOps: { ops: ['X1'] } })).toEqual(['code paperOps: only a bb source (the gross or two-gross preset, cells view) takes it'])
    expect(bad({ bp: { code: 'rep7', error: [1], p: 0.05, iter: 1 }, paperOps: { ops: ['X1'] } })).toEqual(['code paperOps: not for a bp source'])
    expect(bad({ surgery: { d: 3, product: 'XX', step: 'merged' }, paperOps: { ops: ['X1'] } })[0]).toMatch(/^code paperOps: a surgery source takes only `surgery`/)
  })
  it('existing bb states validate exactly as before', () => {
    expect(bad({ bb: { preset: 'gross' }, check: { kind: 'X', cell: [0, 0] }, longEdges: true, shift: [1, 0] })).toEqual([])
    expect(bad({ bb: { preset: 'gross' }, shift: [13, 0] })[0]).toMatch(/code shift: \[a, b\] whole numbers/)
  })
})

describe('code paperOps: interpolation', () => {
  it('adding the overlay is a change of picture: it switches at the half-way point', () => {
    const a = R({ bb: { preset: 'gross' } })
    const b = R(ops('gross', ['X1', 'Z1']))
    expect(interpolate(a, b, 0.2)).toBe(a)
    expect(interpolate(a, b, 0.8)).toBe(b)
    expect(() => draw(interpolate(a, b, 0.6) as ResolvedCode, 'print', 320, 360)).not.toThrow()
  })
})

/** Every text element of a rendered figure with its box (6.2 px a character at 10–12 px type, 11 px tall). */
function textBoxes(html: string): { text: string; x0: number; x1: number; y0: number; y1: number }[] {
  const out: { text: string; x0: number; x1: number; y0: number; y1: number }[] = []
  for (const m of html.matchAll(/<text([^>]*)>(.*?)<\/text>/g)) {
    const attrs = m[1]
    const x = Number(/\bx="([-\d.]+)"/.exec(attrs)?.[1])
    const y = Number(/\by="([-\d.]+)"/.exec(attrs)?.[1])
    const anchor = /text-anchor="(\w+)"/.exec(attrs)?.[1] ?? 'start'
    const size = Number(/font-size:\s*([\d.]+)/.exec(attrs)?.[1] ?? 11)
    const text = m[2].replace(/<[^>]*>/g, '')
    if (!Number.isFinite(x) || !Number.isFinite(y) || !text) continue
    const w = text.length * size * 0.56
    const x0 = anchor === 'end' ? x - w : anchor === 'middle' ? x - w / 2 : x
    out.push({ text, x0, x1: x0 + w, y0: y - size * 0.8, y1: y + 2 })
  }
  return out
}
const clash = (a: ReturnType<typeof textBoxes>[number], b: ReturnType<typeof textBoxes>[number]) => a.x0 < b.x1 - 0.5 && b.x0 < a.x1 - 0.5 && a.y0 < b.y1 - 0.5 && b.y0 < a.y1 - 0.5

const STATES: Omit<CodeState, 'kind'>[] = [
  ops('gross', ['X1', 'Z1']),
  ops('gross', ['X1']),
  ops('two-gross', ['X1', 'X7', 'Z7'], [1, 2]),
  ops('gross', ['X1', 'X7', 'Z1', 'Z7']),
  ops('two-gross', ['Z12', 'X12']),
]
const BOXES: ['stage' | 'print', number, number, boolean, 'full' | 'top' | 'bottom'][] = [
  ['stage', 506, 785, false, 'full'],
  ['stage', 700, 560, false, 'full'],
  ['stage', 506, 460, false, 'top'],
  ['stage', 320, 420, true, 'full'],
  ['print', 320, 360, false, 'full'],
]

describe('code paperOps: the scene', () => {
  it('draws every set of marks in every box, with no NaN, one mark per qubit of the support, inside the drawing area', () => {
    for (const st of STATES) {
      expect(bad(st), JSON.stringify(st)).toEqual([])
      const r = R(st)
      expect(firstNonFinite(r)).toBeNull()
      const P = r.bbx!.paperOps!
      for (const [mode, w, h, bare, slot] of BOXES) {
        const html = draw(r, mode, w, h, bare, slot)
        const where = `${JSON.stringify(st)} ${mode} ${w}x${h} ${slot}`
        expect(html, where).not.toMatch(/NaN|undefined|Infinity/)
        expect(html).toContain('data-anchor="logical"')
        const count = (re: RegExp) => (html.match(re) ?? []).length
        // the marks: a filled disc per qubit of the X-only, Z-only and both sets (the last also ringed)
        expect(count(/data-set="x"/g), where).toBe(1)
        expect(count(/data-qubit="/g), `${where}: marked qubits`).toBe(P.xOnly.length + P.zOnly.length + P.both.length)
        const g = codeGeometry(r, w, h, mode === 'print' || bare, slot)
        for (const q of [...P.xOnly, ...P.zOnly, ...P.both]) {
          const p = g.at(r.qubits[q].x, r.qubits[q].y)
          expect(p.x, where).toBeGreaterThanOrEqual(g.area.x - 1)
          expect(p.x, where).toBeLessThanOrEqual(g.area.x + g.area.w + 1)
          expect(p.y, where).toBeGreaterThanOrEqual(g.area.y - 1)
          expect(p.y, where).toBeLessThanOrEqual(g.area.y + g.area.h)
        }
        // the legend names the marks
        expect(html).toContain(P.ops[0].label)
        expect(html.includes('in both: a Y'), where).toBe(P.both.length > 0)
        // the weight rows are text lines of the figure (print and bare)
        if (mode === 'print' || bare) for (const o of P.ops) expect(html, where).toContain(`${o.label} weight ${o.weight}`)
      }
    }
  })
  it('X-type marks use the X hue, Z-type the Z hue, a qubit in both the X hue with a Z-hue ring', () => {
    const r = R(ops('gross', ['X1', 'Z1']))
    const html = draw(r, 'print', 320, 360)
    const group = (set: string) => new RegExp(`data-set="${set}">([\\s\\S]*?)</g>(?:<g role|</g>)`).exec(html)?.[1] ?? ''
    const fillOf = (s: string) => [...s.matchAll(/<circle[^>]*style="fill:([^"]+)"/g)].map((m) => m[1])
    const xs = new Set(fillOf(group('x')))
    const zs = new Set(fillOf(group('z')))
    expect(xs.size).toBe(1)
    expect(zs.size).toBe(1)
    expect([...xs][0]).not.toBe([...zs][0])
    const both = group('both')
    expect(fillOf(both)).toEqual([...xs])
    expect(both).toContain(`stroke:${[...zs][0]}`)
  })
  it('names the marks for a screen reader', () => {
    const html = draw(R(ops('gross', ['X1', 'Z1'])), 'print', 320, 360)
    expect(html).toContain(`aria-label="support of ${bar('X1')} only: 11 qubits"`)
    expect(html).toContain(`aria-label="support of ${bar('Z1')} only: 11 qubits"`)
    expect(html).toContain('aria-label="in both (a Y there): 1 qubit"')
  })
  it('no two text labels overlap, in any box, and none leaves it', () => {
    for (const st of STATES)
      for (const [mode, w, h, bare, slot] of BOXES) {
        const r = R(st)
        const t = textBoxes(draw(r, mode, w, h, bare, slot))
        const where = `${JSON.stringify(st)} ${mode} ${w}x${h} ${slot}`
        for (let i = 0; i < t.length; i++) for (let j = i + 1; j < t.length; j++) expect(clash(t[i], t[j]), `${where}: "${t[i].text}" and "${t[j].text}"`).toBe(false)
        for (const b of t) {
          expect(b.x0, `${where}: ${b.text}`).toBeGreaterThanOrEqual(-1)
          expect(b.x1, `${where}: ${b.text}`).toBeLessThanOrEqual(w + 1)
        }
      }
  })
  it('the print figure is the code kind’s 320 × 360 and carries the readouts', () => {
    const html = renderToString(<FigureFor layout={C(ops('gross', ['X1', 'Z1']))} number="P1.4" />)
    expect(html).toContain('viewBox="0 0 320 360"')
    expect(html).toContain('<title>Fig. P1.4: CODE · qubits and checks</title>')
    expect(html).toContain(`${bar('X1')} weight 12`)
    expect(html).toContain(`${bar('X1')} and ${bar('Z1')} share 1`)
    expect(html).toContain('svgk-print')
    expect(html).not.toMatch(/NaN|Infinity|undefined|no print drawing yet/)
  })
})
