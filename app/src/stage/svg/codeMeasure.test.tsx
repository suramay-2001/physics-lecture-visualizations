/**
 * `code`, B3 additions (P-B3 S-d): the registry id `c422` (the [[4, 2, 2]] code: XXXX and ZZZZ on a square) and `measure` on the checks view (a Pauli string to be measured next, as an extra row, judged by
 * the engine: does it commute with every check, is it already in the group, would it join the checks and take k down by one). Content writes the id and the string; the resolver takes the verdict from
 * StabilizerCode.syndrome / membership / k. These tests check the code against hand arithmetic, every verdict against a second route (the symplectic rank by hand), the validation messages, the readouts,
 * and that the checks scene draws the extra row in every box with no NaN.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { CodeState } from '../../content/stage'
import { CODE_IDS } from '../../content/stage'
import { GF2Matrix } from '../../physics/qec/gf2'
import { Pauli } from '../../physics/qec/pauli'
import { REGISTERED_CODE_IDS, decoderOf, distanceOf, registeredCode } from '../../physics/qec/registry'
import { FigureFor } from '../figures/FigureFor'
import { resolve, validateStage } from '../resolve'
import type { ResolvedCode } from '../types'
import { CodeScene, checksGeometry, codeGeometry } from './CodeScene'
import { codeReadouts, validateCodeStage } from './code'
import './kinds'

const C = (st: Omit<CodeState, 'kind'>): CodeState => ({ kind: 'code', ...st })
const R = (st: Omit<CodeState, 'kind'>) => resolve(C(st), 1) as ResolvedCode
const bad = (st: Omit<CodeState, 'kind'>) => validateCodeStage(C(st))
const draw = (r: ResolvedCode, mode: 'stage' | 'print', w: number, h: number, bare = false, slot: 'full' | 'top' | 'bottom' = 'full') =>
  renderToString(
    <svg viewBox={`0 0 ${w} ${h}`}>
      <CodeScene state={r} mode={mode} width={w} height={h} bare={bare} slot={slot} />
    </svg>,
  )

/** The rank of the symplectic rows of the generators plus one more Pauli, by hand (a separate route from StabilizerCode.k). */
function kAfterAdding(id: string, extra: string): number {
  const e = registeredCode(id)
  const rows = [...e.stabilizer.generators.map((g) => g.symplectic()), Pauli.parse(extra).symplectic()]
  return e.n - GF2Matrix.fromRows(rows, 2 * e.n).rank()
}

describe('c422: the [[4, 2, 2]] code', () => {
  it('is registered and in the stage’s list: XXXX and ZZZZ on four qubits, k = 2, d = 2, no single logical pair, no decoder', () => {
    expect(REGISTERED_CODE_IDS).toContain('c422')
    expect([...CODE_IDS]).toEqual([...REGISTERED_CODE_IDS])
    const e = registeredCode('c422')
    expect([e.n, e.k, e.rank]).toEqual([4, 2, 2])
    expect(e.stabilizer.generators.map((g) => g.letters().join(''))).toEqual(['XXXX', 'ZZZZ'])
    expect(e.checkKind).toEqual(['X', 'Z'])
    expect(e.logical).toBeNull()
    expect(decoderOf(e)).toBeNull()
    expect(distanceOf(e)).toEqual({ d: 2, reported: null, exact: true })
    expect(e.stabilizer.check().ok).toBe(true)
  })
  it('the four qubits are the corners of a unit square; the X and Z squares sit left and right of its centre so both stay visible, and they share one face', () => {
    const e = registeredCode('c422')
    expect(e.qubitPos).toEqual([[0, 0], [1, 0], [1, 1], [0, 1]])
    expect(e.checkPos[0][1]).toBe(0.5)
    expect(e.checkPos[1][1]).toBe(0.5)
    expect(e.checkPos[0][0]).toBeLessThan(0.5)
    expect(e.checkPos[1][0]).toBeGreaterThan(0.5)
    expect(e.faces).toEqual([{ qubits: [0, 1, 2, 3], checks: [0, 1] }])
  })
  it('detects every one-qubit error and corrects none: all twelve single Paulis light a check, X1 and X2 light the same one', () => {
    const e = registeredCode('c422')
    for (let q = 0; q < 4; q++)
      for (const l of ['X', 'Y', 'Z'] as const) expect(e.stabilizer.syndrome(Pauli.single(4, q, l)).some((b) => b === 1)).toBe(true)
    expect(e.stabilizer.syndrome(Pauli.single(4, 0, 'X'))).toEqual(e.stabilizer.syndrome(Pauli.single(4, 1, 'X')))
    // asking for the lookup decoder's correction is refused, as for the bicycle codes
    expect(bad({ code: 'c422', error: 'X1', show: ['correction'] })).toEqual(['code correction: c422 has no lookup decoder; write the `correction`'])
    expect(bad({ code: 'c422', error: 'X1', correction: 'X2', show: ['syndrome', 'correction'] })).toEqual([])
    expect(validateStage(C({ code: 'c422', error: 'X2', show: ['syndrome'] }))).toEqual([])
  })
  it('the words view needs exactly one logical qubit, so it is refused (k = 2)', () => {
    expect(bad({ code: 'c422', view: 'words' })[0]).toMatch(/encodes 2 qubits; the words view needs exactly one/)
  })
})

describe('measure: the engine’s verdict on a Pauli to be measured next', () => {
  it('IZZI commutes with XXXX (two positions anticommute) and ZZZZ, is not in the group, and would take k from 2 to 1', () => {
    const m = R({ code: 'c422', view: 'checks', measure: 'IZZI' }).table!.measure!
    expect(m).toMatchObject({ letters: 'IZZI', status: 'new', anticommutes: [], kBefore: 2, kAfter: 1 })
    expect(m.text).toBe('commutes with every check · not in the group · k: 2 → 1')
    expect(kAfterAdding('c422', 'IZZI')).toBe(1)
  })
  it('XXII also commutes with both checks (it meets ZZZZ in two places); XIII anticommutes with the Z check; YYYY and ZZZZ are already in the group', () => {
    expect(R({ code: 'c422', view: 'checks', measure: 'XXII' }).table!.measure!.status).toBe('new')
    const x = R({ code: 'c422', view: 'checks', measure: 'XIII' }).table!.measure!
    expect(x).toMatchObject({ status: 'disturbs', anticommutes: ['Z1'], kAfter: 2 })
    expect(x.text).toBe('anticommutes with check Z1')
    expect(R({ code: 'c422', view: 'checks', measure: 'ZIII' }).table!.measure!.anticommutes).toEqual(['X1'])
    expect(R({ code: 'c422', view: 'checks', measure: 'YIII' }).table!.measure!.anticommutes).toEqual(['X1', 'Z1'])
    expect(R({ code: 'c422', view: 'checks', measure: 'YIII' }).table!.measure!.text).toBe('anticommutes with checks X1, Z1')
    for (const g of ['YYYY', 'ZZZZ', 'XXXX']) {
      const f = R({ code: 'c422', view: 'checks', measure: g }).table!.measure!
      expect(f).toMatchObject({ status: 'fixed', kBefore: 2, kAfter: 2 })
      expect(f.text).toBe('commutes with every check · in the group: outcome already fixed · k: 2 stays')
    }
  })
  it('agrees with the symplectic arithmetic on Steane’s code: a logical Z̄ is new (k 1 → 0), a Z check is in the group, a single X anticommutes with the Z checks that touch it', () => {
    const z = R({ code: 'steane7', view: 'checks', measure: 'ZZZZZZZ' }).table!.measure!
    expect([z.status, z.kBefore, z.kAfter]).toEqual(['new', 1, 0])
    expect(kAfterAdding('steane7', 'ZZZZZZZ')).toBe(0)
    expect(R({ code: 'steane7', view: 'checks', measure: 'ZIZIZIZ' }).table!.measure!.status).toBe('fixed')
    const x = R({ code: 'steane7', view: 'checks', measure: 'XIIIIII' }).table!.measure!
    expect(x.status).toBe('disturbs')
    // exactly the Z checks whose support contains qubit 1 (counted from 1), by the arithmetic of the engine’s own syndrome
    const e = registeredCode('steane7')
    const want = e.stabilizer.generators.flatMap((g, i) => (g.commutesWith(Pauli.single(7, 0, 'X')) ? [] : [`${e.checkKind[i]}${[...e.checkKind.slice(0, i + 1)].filter((k) => k === e.checkKind[i]).length}`]))
    expect(x.anticommutes).toEqual(want)
  })
  it('a verdict for every Pauli string of two letters on c422 equals the by-hand rank (new ⇔ commutes and k drops)', () => {
    const letters = ['I', 'X', 'Y', 'Z'] as const
    let checked = 0
    for (const a of letters)
      for (const b of letters)
        for (const c of letters)
          for (const d of letters) {
            const s = a + b + c + d
            if (s === 'IIII') continue
            const m = R({ code: 'c422', view: 'checks', measure: s }).table!.measure!
            if (m.status === 'new') expect(kAfterAdding('c422', s), s).toBe(1)
            else expect(m.kAfter, s).toBe(2)
            checked++
          }
    expect(checked).toBe(255)
  })
})

describe('measure: validation names the field', () => {
  it('accepts the checks view of a registry code', () => {
    expect(bad({ code: 'c422', view: 'checks', measure: 'IZZI' })).toEqual([])
    expect(bad({ code: 'steane7', view: 'checks', measure: 'ZZZZZZZ', errors: ['X1'] })).toEqual([])
  })
  it('refuses a string of the wrong length, a letter that is not I X Y Z, the identity, and any other view or source', () => {
    expect(bad({ code: 'c422', view: 'checks', measure: 'IZZ' })).toEqual(['code measure: "IZZ" has 3 letters, the code has 4 qubits'])
    expect(bad({ code: 'c422', view: 'checks', measure: 'izzi' })).toEqual(['code measure: a Pauli string of letters I, X, Y, Z (no sign)'])
    expect(bad({ code: 'c422', view: 'checks', measure: '+IZZI' })).toEqual(['code measure: a Pauli string of letters I, X, Y, Z (no sign)'])
    expect(bad({ code: 'c422', view: 'checks', measure: 'IIII' })).toEqual(['code measure: not all I (the identity measures nothing)'])
    expect(bad({ code: 'c422', measure: 'IZZI' })).toEqual(["code measure: only the 'checks' view draws a measured row (this state is the 'layout' view)"])
    expect(bad({ code: 'steane7', view: 'words', measure: 'ZZZZZZZ' })[0]).toMatch(/code measure: only the 'checks' view/)
    expect(bad({ rotated: { d: 3 }, measure: 'IZZI' })[0]).toMatch(/^code measure: only a registry code takes it/)
  })
})

describe('measure: readouts and scene', () => {
  it('prints three short pieces for a new check, one line for one that disturbs, and the fixed outcome', () => {
    const texts = (m: string) => codeReadouts(R({ code: 'c422', view: 'checks', measure: m })).filter((x) => x.name.startsWith('measure')).map((x) => x.text)
    expect(texts('IZZI')).toEqual(['commutes with all checks', 'not in the group', 'k: 2 → 1'])
    expect(texts('XIII')).toEqual(['anticommutes with check Z1'])
    expect(texts('YYYY')).toEqual(['commutes with all checks', 'in the group: outcome fixed', 'k: 2 stays'])
    expect(codeReadouts(R({ code: 'c422', view: 'checks' })).filter((x) => x.name.startsWith('measure'))).toEqual([])
  })
  it('the checks scene draws the extra row in the measured hue in every box, names it, and keeps the table inside the area', () => {
    for (const st of [C({ code: 'c422', view: 'checks', measure: 'IZZI' }), C({ code: 'steane7', view: 'checks', measure: 'ZZZZZZZ', errors: ['X1', 'Z3'] }), C({ code: 'five5', view: 'checks', measure: 'XXXXX' })]) {
      const r = resolve(st, 1) as ResolvedCode
      for (const [mode, w, h, bare, slot] of [['stage', 640, 560, false, 'full'], ['stage', 375, 520, false, 'full'], ['stage', 375, 380, false, 'top'], ['print', 320, 360, false, 'full'], ['stage', 360, 330, true, 'full']] as const) {
        const html = draw(r, mode, w, h, bare, slot)
        const where = `${r.id} ${mode} ${w}x${h}`
        expect(html, where).not.toMatch(/NaN|Infinity|undefined/)
        expect(html).toContain('data-measure="')
        expect(html).toContain(`aria-label="measure ${r.table!.measure!.letters}: `)
        expect(html).toContain('>measure<')
        const g = codeGeometry(r, w, h, mode === 'print' || bare, slot)
        const G = checksGeometry(r, g.area)
        expect(G.cell, where).toBeGreaterThanOrEqual(14)
        const hasErr = r.table!.errors.length > 0
        const bottom = G.y0 + (r.table!.rows.length + 1) * G.cell + G.cell * 1.4 + (hasErr ? G.cell * (r.table!.errors.length + 2.1) + 13 : 0)
        expect(bottom, where).toBeLessThanOrEqual(g.area.y + g.area.h + 1)
      }
    }
  })
  it('the print figure carries the verdict, one short line each; the resolved one-line text is the plan’s', () => {
    const html = renderToString(<FigureFor layout={C({ code: 'c422', view: 'checks', measure: 'IZZI' })} number="B3.9" />)
    for (const t of ['commutes with all checks', 'not in the group', 'k: 2 → 1']) expect(html).toContain(t)
    expect(R({ code: 'c422', view: 'checks', measure: 'IZZI' }).table!.measure!.text).toBe('commutes with every check · not in the group · k: 2 → 1')
    expect(html).not.toMatch(/NaN|Infinity|undefined|no print drawing yet/)
  })
})
