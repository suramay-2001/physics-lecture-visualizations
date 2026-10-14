/**
 * `matrix` tableau view, Papers B3: strings of up to 4 letters, and the stabilizer UPDATE picture (`update: { generators, measure, outcome? }`): the generators before a measurement, the measured Pauli, a clash
 * mark on every generator that anticommutes with it, and the generators after, with the engine's case (physics/qec/update.ts `updateRule`: replaced / fixed / added) and the stored-qubit counts.
 * These tests check the three cases against hand reading and the engine, signs, the readout text, every validation limit with a message naming the field, the refusal to combine with the fields it cannot,
 * the 4-letter plain tableau, and that the one scene draws with no NaN in the live, reading and print versions, left to right on a wide box and stacked on a narrow one, inside its box.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { fidelityOf } from '../../content/fidelity'
import type { MatrixTableauState } from '../../content/stage'
import { PASSPORT_VARIANT, passportOf } from '../../content/stage'
import { ANCHORS } from '../../content/stageVocab'
import { Pauli } from '../../physics/qec/pauli'
import { updateRule } from '../../physics/qec/update'
import { FigureFor } from '../figures/FigureFor'
import { interpolate } from '../interp'
import { resolve, validateStage } from '../resolve'
import type { ResolvedMatrixTableau } from '../types'
import { MatrixScene, updateLayout } from './MatrixScene'
import { UPDATE_LIMITS, matrixReadouts, updateCaseText, updateReadouts, validateMatrixStage } from './matrix'
import './kinds'

type Upd = NonNullable<MatrixTableauState['update']>
const T = (update: Upd, extra: Partial<MatrixTableauState> = {}): MatrixTableauState => ({ kind: 'matrix', tableau: [], update, ...extra })
const R = (update: Upd) => resolve(T(update), 1) as ResolvedMatrixTableau
const bad = (update: Upd, extra: Partial<MatrixTableauState> = {}) => validateMatrixStage(T(update, extra))
const texts = (r: ResolvedMatrixTableau) => matrixReadouts(r).map((x) => x.text)
const strs = (rows: { sign: 1 | -1; letters: string[] }[]) => rows.map((x) => `${x.sign < 0 ? '-' : '+'}${x.letters.join('')}`)
type Mode = 'stage' | 'print'
const draw = (r: ResolvedMatrixTableau, mode: Mode, w: number, h: number, bare = false, slot: 'full' | 'top' | 'bottom' = 'full') =>
  renderToString(
    <svg viewBox={`0 0 ${w} ${h}`}>
      <MatrixScene state={r} mode={mode} width={w} height={h} bare={bare} slot={slot} />
    </svg>,
  )

const COIN: Upd = { generators: ['XI', 'IX'], measure: 'ZZ' }
const FIXED: Upd = { generators: ['ZZ', 'XX'], measure: 'ZZ' }
const ADDED: Upd = { generators: ['XXXX', 'ZZZZ'], measure: 'IZZI' }

describe('matrix update: the three cases of the engine’s rule', () => {
  it('[XI, IX] measuring ZZ: both anticommute, the first is replaced by ZZ and IX is multiplied by XI, giving [ZZ, XX]', () => {
    const r = R(COIN)
    const u = r.update!
    expect(u.case).toBe('replaced')
    expect(strs(u.before)).toEqual(['+XI', '+IX'])
    expect(u.before.map((x) => x.clash)).toEqual([true, true])
    expect(strs(u.after)).toEqual(['+ZZ', '+XX'])
    expect(u.after.map((x) => x.role)).toEqual(['replaced', 'multiplied'])
    expect(u.after.map((x) => x.from)).toEqual([0, 1])
    expect(u).toMatchObject({ n: 2, measure: ['Z', 'Z'], outcome: 0, replaced: 0, multiplied: [1], kBefore: 0, kAfter: 0 })
    expect(texts(r)).toEqual(['coin: XI → ZZ', 'IX × XI = XX', 'outcome +1 (chosen)', 'stored qubits: 0 (unchanged)'])
  })
  it('the other outcome writes −ZZ into the group; the multiplied row does not depend on the coin', () => {
    const r = R({ ...COIN, outcome: 1 })
    expect(strs(r.update!.after)).toEqual(['-ZZ', '+XX'])
    expect(r.update!.outcome).toBe(1)
    expect(texts(r)[0]).toBe('coin: XI → −ZZ')
    expect(texts(r)[2]).toBe('outcome −1 (chosen)')
  })
  it('only the generators that anticommute are touched: [ZI, IX] measuring XX replaces ZI and keeps IX', () => {
    const u = R({ generators: ['ZI', 'IX'], measure: 'XX' }).update!
    expect(u.before.map((x) => x.clash)).toEqual([true, false])
    expect(strs(u.after)).toEqual(['+XX', '+IX'])
    expect(u.after.map((x) => x.role)).toEqual(['replaced', 'kept'])
    expect(updateCaseText(u)).toBe('outcome is a coin: ZI replaced by XX')
  })
  it('[ZZ, XX] measuring ZZ: the outcome is fixed by the state, nothing changes', () => {
    const r = R(FIXED)
    const u = r.update!
    expect(u.case).toBe('fixed')
    expect(u.before.map((x) => x.clash)).toEqual([false, false])
    expect(strs(u.after)).toEqual(strs(u.before))
    expect(u.after.every((x) => x.role === 'kept')).toBe(true)
    expect(u).toMatchObject({ outcome: 0, replaced: null, multiplied: [], kBefore: 0, kAfter: 0 })
    expect(texts(r)).toEqual(['outcome fixed by the state', 'outcome +1 (forced)', 'stored qubits: 0 (unchanged)'])
  })
  it('a fixed outcome follows the signs and ignores the authored coin', () => {
    const neg = R({ generators: ['-ZZ', 'XX'], measure: 'ZZ', outcome: 0 })
    expect(neg.update!.case).toBe('fixed')
    expect(neg.update!.outcome).toBe(1)
    expect(texts(neg)).toEqual(['outcome fixed by the state', 'outcome −1 (forced)', 'stored qubits: 0 (unchanged)'])
    expect(strs(neg.update!.before)).toEqual(['-ZZ', '+XX'])
    // ZZ is the product of ZI and IZ: fixed too (+1)
    expect(R({ generators: ['ZI', 'IZ'], measure: 'ZZ' }).update).toMatchObject({ case: 'fixed', outcome: 0 })
  })
  it('the [[4,2,2]] code [XXXX, ZZZZ] measuring IZZI: it commutes with both, is not in the group, so it joins it and a stored qubit is lost (2 → 1)', () => {
    const r = R(ADDED)
    const u = r.update!
    expect(u.case).toBe('added')
    expect(u.before.map((x) => x.clash)).toEqual([false, false])
    expect(strs(u.after)).toEqual(['+XXXX', '+ZZZZ', '+IZZI'])
    expect(u.after.map((x) => x.role)).toEqual(['kept', 'kept', 'added'])
    expect(u.after.map((x) => x.from)).toEqual([0, 1, null])
    expect(u).toMatchObject({ n: 4, kBefore: 2, kAfter: 1, outcome: 0 })
    expect(texts(r)).toEqual(['IZZI joins the group', 'stored qubits: 2 → 1', 'outcome +1 (chosen)'])
    expect(texts(R({ ...ADDED, outcome: 1 }))[0]).toBe('−IZZI joins the group')
    expect(strs(R({ ...ADDED, outcome: 1 }).update!.after)[2]).toBe('-IZZI')
  })
  it('a four-generator state: the GHZ stabilizers measured on one qubit', () => {
    const r = R({ generators: ['ZZII', 'IZZI', 'IIZZ', 'XXXX'], measure: 'XIII' })
    const u = r.update!
    expect(u.before.map((x) => x.clash)).toEqual([true, false, false, false])
    expect(u.case).toBe('replaced')
    expect(strs(u.after)).toEqual(['+XIII', '+IZZI', '+IIZZ', '+XXXX'])
    expect(u.n).toBe(4)
  })
  it('everything is the engine’s: the picture equals updateRule on the parsed inputs, for every Pauli measured on two states', () => {
    const states: string[][] = [['XI', 'IX'], ['ZZ', 'XX'], ['ZI'], ['-XX', 'ZZ']]
    const letters = ['I', 'X', 'Y', 'Z']
    let checked = 0
    for (const gens of states)
      for (const a of letters)
        for (const b of letters) {
          if (a === 'I' && b === 'I') continue
          for (const outcome of [0, 1] as const) {
            const r = R({ generators: gens, measure: a + b, outcome })
            const want = updateRule(gens.map((g) => Pauli.parse(g)), Pauli.parse(a + b), outcome)
            const where = `${gens.join(',')} ${a}${b} outcome ${outcome}`
            expect(r.update!.case, where).toBe(want.kind)
            expect(r.update!.outcome, where).toBe(want.outcome)
            expect(r.update!.before.map((x) => x.clash), where).toEqual(want.before.map((_, i) => want.clashing.includes(i)))
            expect(strs(r.update!.after), where).toEqual(want.after.map((p) => `${p.sign() < 0 ? '-' : '+'}${p.letters().join('')}`))
            expect([r.update!.kBefore, r.update!.kAfter], where).toEqual([want.kBefore, want.kAfter])
            checked++
          }
        }
    expect(checked).toBe(4 * 15 * 2)
  })
})

describe('matrix update: the route, the passport, the vocabulary', () => {
  it('is a tableau view: the matrix passport, drawer and anchors; the update note is exact', () => {
    expect(passportOf(T(COIN))).toBe(PASSPORT_VARIANT.matrixTableau)
    expect(fidelityOf('matrix').exact.map((i) => i.id)).toContain('qc-update-rule')
    for (const a of ['update-before', 'update-measure', 'update-after', 'update-clash']) expect(ANCHORS.matrix).toContain(a)
  })
  it('validateStage / resolve reach it; the resolved rows are the generators before', () => {
    expect(validateStage(T(COIN))).toEqual([])
    expect(validateStage(T(ADDED))).toEqual([])
    const r = R(ADDED)
    expect(r.qubits).toBe(4)
    expect(r.rows.map((x) => x.pauli)).toEqual(['XXXX', 'ZZZZ'])
    expect(r.product).toBeNull()
    expect(r.wins).toBeNull()
  })
  it('a plain tableau resolves with update: null', () => {
    expect((resolve({ kind: 'matrix', tableau: ['ZZ', 'XX'] }, 1) as ResolvedMatrixTableau).update).toBeNull()
  })
  it('interpolation between update pictures is a hard switch (discrete signs and cases)', () => {
    const a = R(COIN)
    const b = R(ADDED)
    expect(interpolate(a, b, 0.3)).toBe(a)
    expect(interpolate(a, b, 0.7)).toBe(b)
  })
})

describe('matrix update: validation', () => {
  it('accepts the good cases, the limits themselves and signed generators', () => {
    expect(bad(COIN)).toEqual([])
    expect(bad(FIXED)).toEqual([])
    expect(bad(ADDED)).toEqual([])
    expect(bad({ generators: ['-ZZ', '+XX'], measure: 'IZ' })).toEqual([])
    expect(bad({ generators: ['XI'], measure: 'ZZ', outcome: 1 })).toEqual([])
    expect(bad({ generators: ['ZZII', 'IZZI', 'IIZZ', 'XXXX'], measure: 'XIII' })).toEqual([])
    expect(bad({ generators: ['Z'], measure: 'X' })).toEqual([])
    expect(UPDATE_LIMITS).toMatchObject({ qubitsMax: 4, generatorsMax: 4 })
    expect(validateMatrixStage({ kind: 'matrix', tableau: ['ZZ', 'XX'], update: FIXED })).toEqual([])
    expect(validateMatrixStage({ kind: 'matrix', tableau: ['XI', 'IX'], update: COIN })).toEqual([])
  })
  it('generators: 1–4 strings of 1–4 letters, one length, an optional sign', () => {
    expect(bad({ generators: [], measure: 'ZZ' })).toEqual(['matrix tableau update.generators: a list of 1–4 Pauli strings'])
    expect(bad({ generators: ['ZZII', 'IZZI', 'IIZZ', 'XXXX', 'XIXI'], measure: 'ZZZZ' })[0]).toMatch(/^matrix tableau update\.generators: a list of 1–4/)
    expect(bad({ generators: ['ZZZZZ'], measure: 'ZZZZZ' })[0]).toMatch(/^matrix tableau update\.generators\[0\]: "ZZZZZ" must be 1–4 letters/)
    expect(bad({ generators: ['ZQ'], measure: 'ZZ' })[0]).toMatch(/^matrix tableau update\.generators\[0\]: "ZQ"/)
    expect(bad({ generators: ['iZZ'], measure: 'ZZ' })[0]).toMatch(/generators\[0\]/)
    expect(bad({ generators: ['ZZ', 'XXX'], measure: 'ZZ' })).toEqual(['matrix tableau update.generators[1]: "XXX" must have 2 letters, like the first'])
    expect(bad({ generators: 'ZZ' as never, measure: 'ZZ' })[0]).toMatch(/^matrix tableau update\.generators/)
  })
  it('measure: letters only, the generators’ length, not the identity', () => {
    expect(bad({ generators: ['ZZ'], measure: '-ZZ' })[0]).toMatch(/^matrix tableau update\.measure: "-ZZ" must be 1–4 letters of I, X, Y, Z \(no sign/)
    expect(bad({ generators: ['ZZ'], measure: 'ZZZ' })).toEqual(['matrix tableau update.measure: "ZZZ" must have 2 letters, like the generators'])
    expect(bad({ generators: ['ZZ'], measure: 'ZQ' })[0]).toMatch(/^matrix tableau update\.measure/)
    expect(bad({ generators: ['ZZ'], measure: 'II' })).toEqual(['matrix tableau update.measure: "II" is the identity; measure a Pauli that is not all I'])
  })
  it('the generators must be independent and commuting (the engine’s stabilizer check)', () => {
    expect(bad({ generators: ['XI', 'ZI'], measure: 'ZZ' })[0]).toMatch(/^matrix tableau update\.generators: generators 0 \(\+XI\) and 1 \(\+ZI\) anticommute/)
    expect(bad({ generators: ['ZZ', 'ZZ'], measure: 'XX' })[0]).toMatch(/^matrix tableau update\.generators: the generators are dependent/)
    expect(bad({ generators: ['ZZ', 'XX', 'YY'], measure: 'XI' })[0]).toMatch(/dependent/)
    expect(bad({ generators: ['ZI', 'IZ', 'ZZ'], measure: 'XI' })[0]).toMatch(/dependent/)
  })
  it('outcome is 0 or 1', () => {
    expect(bad({ ...COIN, outcome: 2 as never })[0]).toMatch(/^matrix tableau update\.outcome: 0 \(\+1\) or 1 \(−1\)/)
  })
  it('refuses the fields it cannot combine with, naming each', () => {
    for (const [f, v] of [['product', true], ['values', { XI: 1 }], ['state', { ket: '|00>' }], ['targets', { XI: 1 }], ['players', ['A', 'B']]] as const)
      expect(bad(COIN, { [f]: v } as never), f).toEqual([`matrix tableau update: cannot be combined with ${f} (the update picture draws its own rows)`])
  })
  it('the tableau field is [] or the generators’ letters without their signs', () => {
    expect(validateMatrixStage({ kind: 'matrix', tableau: ['ZZ', 'XX'], update: COIN })[0]).toMatch(/^matrix tableau update: write tableau: \[\] \(or the generators' letters without their signs: \["XI","IX"\]\)/)
    expect(validateMatrixStage({ kind: 'matrix', tableau: ['ZZ'], update: { generators: ['-ZZ'], measure: 'XX' } })).toEqual([])
    expect(validateMatrixStage({ kind: 'matrix', tableau: [], update: undefined as never })).toEqual(['matrix tableau: at least one Pauli string'])
  })
  it('an unknown field of update is refused', () => {
    expect(bad({ ...COIN, extra: 1 } as never)[0]).toMatch(/^matrix tableau update\.extra: unknown field/)
  })
})

describe('matrix tableau: strings of up to 4 letters', () => {
  it('a plain tableau of 4-letter rows validates and resolves (rows IZZI, IXXI, XXII, XXXX, ZZZZ)', () => {
    const st: MatrixTableauState = { kind: 'matrix', tableau: ['IZZI', 'IXXI', 'XXII', 'XXXX', 'ZZZZ'] }
    expect(validateMatrixStage(st)).toEqual([])
    const r = resolve(st, 1) as ResolvedMatrixTableau
    expect(r.qubits).toBe(4)
    expect(r.rows.map((x) => x.letters.length)).toEqual([4, 4, 4, 4, 4])
    expect(validateMatrixStage({ kind: 'matrix', tableau: ['IZZII'] })).toEqual(['matrix tableau: each row must be 1–4 letters (I, X, Y, Z)'])
    expect(validateMatrixStage({ kind: 'matrix', tableau: ['ZZZZ'], product: true })).toEqual([])
    expect((resolve({ kind: 'matrix', tableau: ['IZZI', 'IXXI', 'XXII'], product: true }, 1) as ResolvedMatrixTableau).product).toMatchObject({ pauli: 'XZYI' })
  })
  it('draws a 4-letter tableau in the live and print versions with no NaN', () => {
    const r = resolve({ kind: 'matrix', tableau: ['IZZI', 'IXXI', 'XXII', 'XXXX'], product: true }, 1) as ResolvedMatrixTableau
    for (const [mode, w, h] of [['stage', 506, 785], ['print', 320, 260]] as const) {
      const html = draw(r, mode, w, h)
      expect(html).not.toMatch(/NaN|Infinity|undefined/)
      expect(html.match(/data-anchor="tableau-row-\d"/g)?.length).toBe(4)
    }
  })
})

describe('matrix update: the one scene', () => {
  const BOXES: [Mode, number, number, boolean, 'full' | 'top' | 'bottom', 'across' | 'down'][] = [
    ['stage', 506, 785, false, 'full', 'across'],
    ['stage', 700, 560, false, 'full', 'across'],
    ['stage', 375, 640, false, 'full', 'down'],
    ['stage', 506, 420, false, 'top', 'across'],
    ['stage', 320, 300, true, 'full', 'down'],
    ['print', 320, 260, false, 'full', 'down'],
  ]
  const STATES: Upd[] = [COIN, { ...COIN, outcome: 1 }, FIXED, ADDED, { generators: ['ZZII', 'IZZI', 'IIZZ', 'XXXX'], measure: 'XIII' }, { generators: ['-ZZ', 'XX'], measure: 'ZZ' }, { generators: ['Z'], measure: 'X' }]
  it('draws every state in every box with no NaN: before, measure and after blocks, one clash mark per clashing generator, the pills, accessible names', () => {
    for (const st of STATES)
      for (const [mode, w, h, bare, slot, layout] of BOXES) {
        const r = R(st)
        const u = r.update!
        const html = draw(r, mode, w, h, bare, slot)
        const where = `${JSON.stringify(st)} ${mode} ${w}x${h} ${slot}`
        expect(html, where).not.toMatch(/NaN|Infinity|undefined/)
        expect(html).toContain('data-view="update"')
        expect(html, where).toContain(`data-layout="${layout}"`)
        for (const b of ['before', 'measure', 'after']) expect(html, where).toContain(`data-update="${b}"`)
        for (const a of ['update-before', 'update-measure', 'update-after']) expect(html).toContain(`data-anchor="${a}"`)
        expect(html.match(/data-anchor="update-clash"/g)?.length ?? 0, where).toBe(u.before.filter((x) => x.clash).length)
        expect(html.match(/data-row="/g)?.length, where).toBe(u.before.length + u.after.length)
        // the measured Pauli and each replaced / added generator carry the orchid pill
        expect(html.match(/data-pill="1"/g)?.length, where).toBe(1 + u.after.filter((x) => x.role === 'replaced' || x.role === 'added').length)
        expect(html).toContain(`aria-label="measured Pauli: ${u.measure.join('')}"`)
        expect(html).toMatch(/aria-label="generators before the measurement: /)
        expect(html).toMatch(/aria-label="generators after the measurement: /)
        expect(html).toContain('anticommutes with the measured Pauli')
      }
  })
  it('a clash mark has an accessible name that says which generator anticommutes with what', () => {
    const html = draw(R(COIN), 'stage', 506, 785)
    expect(html).toContain('aria-label="XI anticommutes with ZZ"')
    expect(html).toContain('aria-label="IX anticommutes with ZZ"')
    expect(html).toContain('generators before the measurement: XI, IX; XI, IX anticommute with ZZ')
    expect(html).toContain('generators after the measurement: ZZ, XX; case replaced; stored qubits 0 to 0')
    expect(draw(R(FIXED), 'stage', 506, 785)).toContain('; all commute with ZZ')
    expect(draw(R({ generators: ['-ZZ', 'XX'], measure: 'ZZ' }), 'stage', 506, 785)).toContain('generators before the measurement: −ZZ, XX')
  })
  it('the notes beside the after rows say what the rule did', () => {
    const coin = draw(R(COIN), 'stage', 506, 785)
    expect(coin).toContain('= +P')
    expect(coin).toContain('g2·g1')
    expect(draw(R({ ...COIN, outcome: 1 }), 'stage', 506, 785)).toContain('= −P')
    expect(draw(R(ADDED), 'stage', 506, 785)).toContain('>new<')
  })
  it('layout: left to right on a wide box, stacked on a narrow one; the picture stays inside the box, clear of the text lines', () => {
    for (const st of STATES)
      for (const [mode, w, h, bare, slot, layout] of BOXES) {
        const u = R(st).update!
        const L = updateLayout(u, w, h, mode === 'print' || bare, slot)
        const where = `${JSON.stringify(st)} ${mode} ${w}x${h} ${slot}`
        expect(L.across ? 'across' : 'down', where).toBe(layout)
        expect(L.w0 * L.s, `${where} width`).toBeLessThanOrEqual(L.area.w + 1e-6)
        expect(L.h0 * L.s, `${where} height`).toBeLessThanOrEqual(L.area.h + 1e-6)
        expect(L.tx, where).toBeGreaterThanOrEqual(L.area.x - 1e-6)
        expect(L.ty, where).toBeGreaterThanOrEqual(L.area.y - 1e-6)
        expect(L.tx + L.w0 * L.s, where).toBeLessThanOrEqual(w)
        expect(L.ty + L.h0 * L.s, where).toBeLessThanOrEqual(h)
        // text is readable after the scale (11 px local text is the smallest)
        expect(11 * L.s, `${where}: text too small`).toBeGreaterThanOrEqual(6.5)
        if (L.lines.length) {
          expect(8 + 13 * L.lines.length, where).toBeLessThanOrEqual(L.area.y)
          for (const t of L.lines) expect(t.length, where).toBeLessThanOrEqual(52)
        }
        if (mode === 'stage' && !bare && slot !== 'bottom') expect(L.area.y, where).toBeGreaterThanOrEqual(Math.min(112, 60))
      }
  })
  it('the readouts are short tags: the case (and each product row), the outcome, the stored qubits', () => {
    expect(updateReadouts(R(COIN).update!).map((x) => x.name)).toEqual(['case', 'product1', 'outcome', 'k'])
    expect(updateReadouts(R(ADDED).update!).map((x) => x.name)).toEqual(['case', 'k', 'outcome'])
    for (const st of STATES) for (const t of texts(R(st))) expect(t.length).toBeLessThanOrEqual(80)
  })
})

describe('matrix update: the print figure', () => {
  it('is the same scene in print ink, numbered, titled with the passport, with the readouts as its own wrapped lines', () => {
    const html = renderToString(<FigureFor layout={T(ADDED, { shot: undefined })} number="B3.5" caption="a logical measurement" />)
    expect(html).toContain('<figure class="print-figure"')
    expect(html).toContain('<title>Fig. B3.5: PAULI TABLE</title>')
    expect(html).toContain('svgk-print')
    expect(html).toContain('IZZI joins the group')
    expect(html).toContain('stored qubits: 2 → 1')
    expect(html).toContain('data-view="update"')
    expect(html).not.toMatch(/NaN|Infinity|undefined|no print drawing yet/)
  })
  it('wraps the readouts into lines of at most 52 characters', () => {
    const L = updateLayout(R({ generators: ['ZZII', 'IZZI', 'IIZZ', 'XXXX'], measure: 'XIII' }).update!, 320, 260, true)
    expect(L.lines.length).toBeGreaterThanOrEqual(2)
    expect(L.lines.join(' ')).toContain('coin: ZZII → XIII')
  })
})
