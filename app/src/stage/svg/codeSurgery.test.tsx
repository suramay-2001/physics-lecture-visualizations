/**
 * `code` with a `surgery` source (B3, P-B3 S-d): two distance-d rotated patches and the seam between them, in the three steps of lattice surgery. Content writes d, the product (XX or ZZ), the step and what
 * to mark; the resolver takes every check, its class (kept / new / widened), the seam and the counts from physics/qec/surgery.ts. These tests check the counts for d = 3 and 5 against hand arithmetic, the class
 * counts, that the product of the new checks is the measured logical product, every refusal with a message that names the field, the readouts, the fidelity note, and that the one scene draws all three steps in
 * three modes with no NaN, packs inside the box, keeps its labels off each other and names every qubit and check.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { fidelityOf } from '../../content/fidelity'
import type { CodeState } from '../../content/stage'
import { CODE_SURGERY_SHOW, CODE_SURGERY_STEPS } from '../../content/stage'
import { productOfNewChecks, surgeryLayout } from '../../physics/qec/surgery'
import { FigureFor } from '../figures/FigureFor'
import { interpolate } from '../interp'
import { resolve, validateStage } from '../resolve'
import type { ResolvedCode } from '../types'
import { CodeScene } from './CodeScene'
import { CodeSurgeryScene, surgeryGeometry } from './CodeSurgeryScene'
import { codeReadouts, codeSummary, validateCodeStage } from './code'
import './kinds'

type Sg = NonNullable<CodeState['surgery']>
const C = (surgery: Sg, extra: Omit<CodeState, 'kind' | 'surgery'> = {}): CodeState => ({ kind: 'code', surgery, ...extra })
const R = (surgery: Sg, extra: Omit<CodeState, 'kind' | 'surgery'> = {}) => resolve(C(surgery, extra), 1) as ResolvedCode
const bad = (surgery: Sg, extra: Omit<CodeState, 'kind' | 'surgery'> = {}) => validateCodeStage(C(surgery, extra))
type Mode = 'stage' | 'print'
const draw = (r: ResolvedCode, mode: Mode, w: number, h: number, bare = false, slot: 'full' | 'top' | 'bottom' = 'full') =>
  renderToString(
    <svg viewBox={`0 0 ${w} ${h}`}>
      <CodeScene state={r} mode={mode} width={w} height={h} bare={bare} slot={slot} />
    </svg>,
  )

describe('code surgery: the counts are the layout’s', () => {
  it('d = 3 and d = 5, XX: a merged patch of d × (2d + 1) qubits, a seam of d, d + 1 new checks, d − 1 widened, one stored qubit', () => {
    for (const d of [3, 5] as const) {
      const r = R({ d, product: 'XX', step: 'merged' })
      const s = r.surgery!
      expect([s.rows, s.cols]).toEqual([d, 2 * d + 1])
      expect([s.n, s.k, s.seam, s.newChecks, s.widened]).toEqual([d * (2 * d + 1), 1, d, d + 1, d - 1])
      expect(s.qubits).toHaveLength(d * (2 * d + 1))
      expect(s.qubits.filter((q) => q.role === 'A')).toHaveLength(d * d)
      expect(s.qubits.filter((q) => q.role === 'B')).toHaveLength(d * d)
      expect(s.qubits.filter((q) => q.role === 'seam')).toHaveLength(d)
      // the merged rotated patch has n − 1 checks, split into the three classes
      expect(s.checks).toHaveLength(s.n - 1)
      const count = (cls: string) => s.checks.filter((c) => c.cls === cls).length
      expect([count('new'), count('widened')]).toEqual([d + 1, d - 1])
      expect(count('kept')).toBe(s.n - 1 - (d + 1) - (d - 1))
      // the new checks are all of the measured type and touch the seam; a widened one is of the other type
      for (const c of s.checks.filter((c) => c.cls === 'new')) {
        expect(c.kind).toBe('X')
        expect(c.qubits.some((q) => s.qubits[q].role === 'seam')).toBe(true)
      }
      for (const c of s.checks.filter((c) => c.cls === 'widened')) expect(c.kind).toBe('Z')
    }
  })
  it('numbers for d = 3: 21 qubits, 14 kept + 4 new + 2 widened checks; for d = 5: 55 qubits, 54 checks', () => {
    const a = R({ d: 3, product: 'XX', step: 'merged' }).surgery!
    expect([a.n, a.checks.length, a.checks.filter((c) => c.cls === 'kept').length]).toEqual([21, 20, 14])
    const b = R({ d: 5, product: 'XX', step: 'merged' }).surgery!
    expect([b.n, b.checks.length, b.newChecks, b.widened]).toEqual([55, 54, 6, 4])
  })
  it('ZZ stacks the patches: a (2d + 1) × d grid with the seam as a row, the new checks are Z checks and the measured product is Z̄_A Z̄_B', () => {
    const s = R({ d: 3, product: 'ZZ', step: 'merged' }).surgery!
    expect([s.rows, s.cols, s.n, s.newChecks, s.widened]).toEqual([7, 3, 21, 4, 2])
    expect(s.qubits.filter((q) => q.role === 'seam').every((q) => q.y === 3)).toBe(true)
    expect(s.checks.filter((c) => c.cls === 'new').every((c) => c.kind === 'Z')).toBe(true)
    expect(s.measured).toMatchObject({ type: 'Z', name: 'Z̄_A Z̄_B' })
    expect(s.seamPrep).toBe('+')
    expect(R({ d: 3, product: 'XX', step: 'merged' }).surgery!.seamPrep).toBe('0')
    const x = R({ d: 3, product: 'XX', step: 'merged' }).surgery!
    expect(x.qubits.filter((q) => q.role === 'seam').every((q) => q.x === 3)).toBe(true)
    expect(x.measured).toMatchObject({ type: 'X', name: 'X̄_A X̄_B' })
  })
  it('the product of the new checks is the measured logical product: X on A’s facing column and B’s (weight 2d), as the engine’s symmetric difference', () => {
    for (const d of [3, 5] as const)
      for (const product of ['XX', 'ZZ'] as const) {
        const s = R({ d, product, step: 'merged' }).surgery!
        const L = surgeryLayout(d, product)
        expect(s.measured.qubits).toEqual(L.measured.qubits)
        expect(s.measured.qubits).toEqual(productOfNewChecks(L))
        expect(s.measured.qubits).toHaveLength(2 * d)
        // by hand: the symmetric difference of the new checks’ supports
        const odd = new Map<number, number>()
        for (const c of s.checks.filter((c) => c.cls === 'new')) for (const q of c.qubits) odd.set(q, (odd.get(q) ?? 0) + 1)
        expect([...odd].filter(([, n]) => n % 2 === 1).map(([q]) => q).sort((a, b) => a - b)).toEqual(s.measured.qubits)
      }
  })
  it('before the merge and after the split the two patches are alone: 2d² qubits, 2 stored, 2(d² − 1) kept checks, no new and no widened', () => {
    for (const step of ['separate', 'split'] as const)
      for (const d of [3, 5] as const) {
        const s = R({ d, product: 'XX', step }).surgery!
        expect([s.n, s.k]).toEqual([2 * d * d, 2])
        expect(s.checks).toHaveLength(2 * (d * d - 1))
        expect(s.checks.every((c) => c.cls === 'kept')).toBe(true)
        // no check reaches the seam
        expect(s.checks.some((c) => c.qubits.some((q) => s.qubits[q].role === 'seam'))).toBe(false)
        expect(s.qubits.filter((q) => q.role === 'seam')).toHaveLength(d)
      }
    expect(R({ d: 3, product: 'XX', step: 'merged' }).surgery!.k).toBe(1)
  })
  it('the qubits carry plain names; the seam qubit says what the step did to it', () => {
    const sep = R({ d: 3, product: 'XX', step: 'separate' }).surgery!
    expect(sep.qubits.find((q) => q.role === 'seam')!.aria).toBe('seam qubit 1, prepared in |0⟩, not yet part of a patch')
    expect(R({ d: 3, product: 'ZZ', step: 'separate' }).surgery!.qubits.find((q) => q.role === 'seam')!.aria).toMatch(/prepared in \|\+⟩/)
    expect(R({ d: 3, product: 'XX', step: 'merged' }).surgery!.qubits.find((q) => q.role === 'seam')!.aria).toBe('seam qubit 1, part of the merged patch')
    expect(R({ d: 3, product: 'XX', step: 'split' }).surgery!.qubits.find((q) => q.role === 'seam')!.aria).toBe('seam qubit 1, read out')
    expect(sep.qubits[0].aria).toBe('data qubit 1 of patch A')
  })
  it('the readouts are the layout’s counts; the id and name say which surgery', () => {
    const r = R({ d: 3, product: 'XX', step: 'merged' })
    expect(codeReadouts(r).map((x) => x.text)).toEqual(['n = 21', 'k = 1', 'seam: 3 qubits', 'new checks: 4', 'widened checks: 2'])
    expect(r.name).toBe('lattice surgery · d = 3 · XX')
    expect(r.id).toBe('surgery-d3-XX-merged')
    expect(r.family).toBe('surgery')
    expect(r.view).toBe('patch')
    expect(codeSummary(r)).toContain('lattice surgery · d = 3 · XX; n = 21; k = 1; seam: 3 qubits')
    expect(codeReadouts(R({ d: 5, product: 'XX', step: 'separate' })).map((x) => x.text)).toEqual(['n = 50', 'k = 2', 'seam: 5 qubits', 'new checks: 6', 'widened checks: 4'])
  })
  it('a transition switches at the half-way point, like every code picture', () => {
    const a = resolve(C({ d: 3, product: 'XX', step: 'separate' }), 1)
    const b = resolve(C({ d: 3, product: 'XX', step: 'merged' }), 1)
    expect(interpolate(a, b, 0.3)).toBe(a)
    expect(interpolate(a, b, 0.7)).toBe(b)
  })
})

describe('code surgery: the drawer', () => {
  it('the code drawer gains the schematic note about the seam and a run that is not drawn; the misleading note is still the lit check', () => {
    const f = fidelityOf('code')
    expect(f.schematic.map((i) => i.id)).toContain('qc-code-surgery-schematic')
    expect(f.schematic.find((i) => i.id === 'qc-code-surgery-schematic')!.text).toMatch(/outcomes of the new checks are random.*not a run/)
    expect(f.misleading.map((i) => i.id)).toEqual(['qc-code-bp-plain', 'qc-code-lit'])
  })
})

describe('code surgery: validation names the field', () => {
  it('accepts every step, product and d with the names that make sense there', () => {
    for (const d of [3, 5] as const)
      for (const product of ['XX', 'ZZ'] as const) {
        expect(bad({ d, product, step: 'separate', show: ['seam'] })).toEqual([])
        expect(bad({ d, product, step: 'split', show: ['seam'] })).toEqual([])
        expect(bad({ d, product, step: 'merged', show: ['new', 'widened', 'seam', 'product'] })).toEqual([])
      }
    expect(validateStage(C({ d: 3, product: 'XX', step: 'merged' }, { shot: 'CD-CODE' }))).toEqual([])
    expect(validateStage(C({ d: 3, product: 'XX', step: 'merged' }, { view: 'patch' }))).toEqual([])
    expect([...CODE_SURGERY_STEPS]).toEqual(['separate', 'merged', 'split'])
    expect([...CODE_SURGERY_SHOW]).toEqual(['new', 'widened', 'seam', 'product'])
  })
  it('refuses a distance other than 3 or 5, an unknown product or step, unknown keys and bad show lists', () => {
    expect(bad({ d: 4 as never, product: 'XX', step: 'merged' })).toEqual(['code surgery.d: 3 or 5 (each patch has this distance)'])
    expect(bad({ d: 7 as never, product: 'XX', step: 'merged' })[0]).toMatch(/surgery\.d/)
    expect(bad({ d: 3, product: 'XZ' as never, step: 'merged' })).toEqual(["code surgery.product: 'XX' or 'ZZ'"])
    expect(bad({ d: 3, product: 'XX', step: 'cut' as never })).toEqual(["code surgery.step: one of 'separate', 'merged', 'split'"])
    expect(bad({ d: 3, product: 'XX', step: 'merged', zz: 1 } as never)).toEqual(['code surgery.zz: unknown (d, product, step, show)'])
    expect(bad({ d: 3, product: 'XX', step: 'merged', show: ['lit' as never] })).toEqual(["code surgery.show: a list of 'new', 'widened', 'seam', 'product'"])
    expect(bad({ d: 3, product: 'XX', step: 'merged', show: ['seam', 'seam'] })).toEqual(['code surgery.show: each name once'])
  })
  it('the new and widened checks and their product exist only in the merged patch: asking for them elsewhere is refused with the step to use', () => {
    for (const step of ['separate', 'split'] as const)
      for (const name of ['new', 'widened', 'product'] as const) expect(bad({ d: 3, product: 'XX', step, show: [name] }), `${step} ${name}`).toEqual([`code surgery.show: '${name}' marks checks that exist only in the merged patch; use step 'merged'`])
  })
  it('exactly one source: a registry id, toric, rotated or planar next to a surgery is refused, and so are the other views and the fields of another source', () => {
    expect(bad({ d: 3, product: 'XX', step: 'merged' }, { code: 'steane7' })).toEqual(['code: exactly one of code, toric, rotated, planar, surgery (this state names code and surgery)'])
    expect(bad({ d: 3, product: 'XX', step: 'merged' }, { rotated: { d: 3 } })[0]).toMatch(/exactly one of code, toric, rotated, planar, surgery/)
    expect(bad({ d: 3, product: 'XX', step: 'merged' }, { view: 'layout' })).toEqual(["code view: a surgery source is drawn as 'patch', not 'layout'"])
    expect(bad({ d: 3, product: 'XX', step: 'merged' }, { view: 'torus' })[0]).toMatch(/not 'torus'/)
    expect(bad({ d: 3, product: 'XX', step: 'merged' }, { error: 'X1' })[0]).toMatch(/^code error: a surgery source takes only `surgery`/)
    expect(bad({ d: 3, product: 'XX', step: 'merged' }, { fault: { type: 'X', qubits: [0] } })[0]).toMatch(/^code fault:/)
    expect(bad({ d: 3, product: 'XX', step: 'merged' }, { measure: 'IZZI' })[0]).toMatch(/^code measure:/)
    expect(bad({ d: 3, product: 'XX', step: 'merged' }, { show: ['syndrome'] })[0]).toMatch(/^code show:/)
    // a state with none of the sources still says which five there are, for the old four it keeps the old message
    expect(validateCodeStage({ kind: 'code' } as CodeState)[0]).toMatch(/exactly one of code, toric, rotated, planar/)
  })
})

/** Every text element of a rendered figure with its box (a character is 0.56 of the font size wide, 11 px tall). */
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

const BOXES = [
  ['stage', 640, 560, false, 'full'],
  ['stage', 375, 520, false, 'full'],
  ['stage', 375, 400, false, 'top'],
  ['print', 320, 360, false, 'full'],
  ['stage', 360, 330, true, 'full'],
] as const
const ALL_SHOW: Sg['show'] = ['new', 'widened', 'seam', 'product']
const CASES: CodeState[] = []
for (const d of [3, 5] as const)
  for (const product of ['XX', 'ZZ'] as const) {
    CASES.push(C({ d, product, step: 'separate', show: ['seam'] }), C({ d, product, step: 'merged', show: ALL_SHOW }), C({ d, product, step: 'merged' }), C({ d, product, step: 'split', show: ['seam'] }))
  }

describe('code surgery: the scene', () => {
  it('draws every step in the live stage, the reading version and the print figure with no NaN, and names every qubit and check', () => {
    for (const st of CASES) {
      const r = resolve(st, 1) as ResolvedCode
      const s = r.surgery!
      for (const [mode, w, h, bare, slot] of BOXES) {
        const html = draw(r, mode, w, h, bare, slot)
        const where = `d${s.d} ${s.product} ${s.step} ${JSON.stringify(s.show)} ${mode} ${w}x${h}`
        expect(html, where).not.toMatch(/NaN|Infinity|undefined/)
        expect(html).toContain('data-source="surgery"')
        expect(html).toContain(`data-step="${s.step}"`)
        expect((html.match(/data-qubit="\d+"/g) ?? []).length, `${where}: qubits`).toBe(s.qubits.length)
        expect((html.match(/aria-label="[^"]*qubit [^"]*"/g) ?? []).length, `${where}: qubit names`).toBe(s.qubits.length)
        expect((html.match(/data-check="\d+"/g) ?? []).length, `${where}: checks`).toBe(s.checks.length)
        expect((html.match(/aria-label="[XZ] check[^"]*on \d+ qubits[^"]*"/g) ?? []).length, `${where}: check names`).toBe(s.checks.length)
        expect((html.match(/data-class="new"/g) ?? []).length).toBe(s.step === 'merged' ? s.newChecks : 0)
        expect((html.match(/data-class="widened"/g) ?? []).length).toBe(s.step === 'merged' ? s.widened : 0)
        expect((html.match(/data-widened="1"/g) ?? []).length, `${where}: widened outlines`).toBe(s.show.includes('widened') ? s.widened : 0)
        expect((html.match(/data-product="1"/g) ?? []).length, `${where}: product outlines`).toBe(s.show.includes('product') ? s.newChecks : 0)
        expect((html.match(/data-seam="1"/g) ?? []).length, `${where}: seam rings`).toBe(s.show.includes('seam') ? s.seam : 0)
        expect((html.match(/data-readout="1"/g) ?? []).length, `${where}: read out`).toBe(s.step === 'split' ? s.seam : 0)
        if (s.show.includes('product')) expect(html).toContain('product of the new checks = ')
        else expect(html).not.toContain('product of the new checks')
        // the seam is named in every step except a merged patch that was not asked to mark it
        if (s.step === 'split') expect(html).toContain('>read out<')
        else if (s.step === 'separate' || s.show.includes('seam')) expect(html).toContain('>seam<')
        else expect(html).not.toContain('>seam<')
        if (s.step === 'separate') expect((html.match(new RegExp(`>${s.seamPrep === '+' ? '\\+' : '0'}<`, 'g')) ?? []).length, `${where}: seam preparation`).toBe(s.seam)
      }
    }
  })
  it('the measured letters sit on the facing columns (rows) when the product is shown, and nowhere else', () => {
    const r = resolve(C({ d: 3, product: 'XX', step: 'merged', show: ['product'] }), 1) as ResolvedCode
    const html = draw(r, 'print', 320, 360)
    const letters = html.match(/font-weight:800;fill:[^"]*">X</g) ?? []
    expect(letters).toHaveLength(6)
    expect(draw(resolve(C({ d: 3, product: 'XX', step: 'merged' }), 1) as ResolvedCode, 'print', 320, 360)).not.toMatch(/font-weight:800/)
  })
  it('packs inside the box: every qubit and the labels, clear of the text lines, the foot and the legend', () => {
    for (const st of CASES) {
      const r = resolve(st, 1) as ResolvedCode
      const s = r.surgery!
      for (const [mode, w, h, bare, slot] of BOXES) {
        const g = surgeryGeometry(r, w, h, mode === 'print' || bare, slot, mode)
        const where = `d${s.d} ${s.product} ${s.step} ${mode} ${w}x${h} ${slot}`
        for (const q of s.qubits) {
          const p = g.at(q.x, q.y)
          expect(p.x - g.disc, `${where} qubit ${q.index} left`).toBeGreaterThanOrEqual(0)
          expect(p.x + g.disc, `${where} qubit ${q.index} right`).toBeLessThanOrEqual(w)
          expect(p.y - g.disc, `${where} qubit ${q.index} top`).toBeGreaterThanOrEqual(g.area.y - 1)
          expect(p.y + g.disc, `${where} qubit ${q.index} bottom`).toBeLessThanOrEqual(g.footY - 10)
        }
        // neighbouring qubits never touch
        expect(g.unit - 2 * g.disc, where).toBeGreaterThan(2)
        if (g.lines.length) expect(6 + 13 * g.lines.length, where).toBeLessThanOrEqual(g.area.y + 1)
        if (g.foot.length) expect(g.footY + 13 * (g.foot.length - 1), where).toBeLessThanOrEqual(g.legendY - 8)
        expect(g.area.y + g.area.h, where).toBeLessThanOrEqual(h)
      }
    }
  })
  it('no two text labels overlap, in any box, and none leaves it', () => {
    for (const st of CASES) {
      const r = resolve(st, 1) as ResolvedCode
      for (const [mode, w, h, bare, slot] of BOXES) {
        const t = textBoxes(draw(r, mode, w, h, bare, slot))
        const where = `d${r.surgery!.d} ${r.surgery!.product} ${r.surgery!.step} ${mode} ${w}x${h} ${slot}`
        for (let i = 0; i < t.length; i++) for (let j = i + 1; j < t.length; j++) expect(clash(t[i], t[j]), `${where}: "${t[i].text}" and "${t[j].text}"`).toBe(false)
        for (const b of t) {
          expect(b.x0, `${where}: ${b.text}`).toBeGreaterThanOrEqual(-1)
          expect(b.x1, `${where}: ${b.text}`).toBeLessThanOrEqual(w + 1)
        }
      }
    }
  })
  it('the print figure is 320 × 360 and carries the counts as text lines; CodeSurgeryScene is the one scene (CodeScene dispatches to it)', () => {
    const html = renderToString(<FigureFor layout={C({ d: 3, product: 'XX', step: 'merged', show: ['new', 'product'] })} number="B3.7" />)
    expect(html).toContain('viewBox="0 0 320 360"')
    expect(html).toContain('lattice surgery · d = 3 · XX')
    expect(html).toContain('new checks: 4')
    expect(html).toContain('svgk-print')
    expect(html).not.toMatch(/NaN|Infinity|undefined|no print drawing yet/)
    const r = resolve(C({ d: 3, product: 'XX', step: 'merged' }), 1) as ResolvedCode
    const viaDispatch = renderToString(<svg><CodeScene state={r} mode="print" width={320} height={360} /></svg>)
    const direct = renderToString(<svg><CodeSurgeryScene state={r} mode="print" width={320} height={360} /></svg>)
    expect(viaDispatch).toBe(direct)
  })
})
