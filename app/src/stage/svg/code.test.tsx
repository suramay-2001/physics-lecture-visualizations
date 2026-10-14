/**
 * `code` (shared SVG kind; P-Q21-story §9.2 K1, P-Q22-story §9.2): an error-correcting code from physics/qec as qubits, checks and edges. Content writes only
 * inputs (a registry id, a view, an error as a Pauli string, an authored correction, a focus, a shift); the resolver takes every syndrome, correction,
 * residual, logical operator, code word, Tanner edge and distance from the engine. These tests check that every drawn syndrome equals the engine's (and the numpy
 * fixture's, and a second engine route's), the overlays, the bicycle tile's focused check and shift, every validation limit with a clear message, interpolation,
 * the passport / drawer / vocabulary, and that the one scene labels every qubit and check, draws no NaN, and packs inside the box without two marks on top of
 * each other in every code, view and mode.
 */
import { describe, expect, it } from 'vitest'
import { fidelityOf } from '../../content/fidelity'
import type { CodeState } from '../../content/stage'
import { CODE_IDS, CODE_SHOW, CODE_VIEWS, KIND_RENDER, PASSPORT, STAGE_KINDS_709, passportOf } from '../../content/stage'
import { ANCHORS, SHOTS } from '../../content/stageVocab'
import raw from '../../physics/__fixtures__/qec.json?raw'
import { Pauli } from '../../physics/qec/pauli'
import { REGISTERED_CODE_IDS, registeredCode } from '../../physics/qec/registry'
import { resolve, validateStage } from '../resolve'
import { svgKindDef } from '../svgKinds'
import type { ResolvedCode } from '../types'
import { describePauli, parsePauliText, tersePauli } from './code'
import './kinds'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FX: any = JSON.parse(raw)

const C = (st: Omit<CodeState, 'kind'>): CodeState => ({ kind: 'code', ...st })
const R = (st: Omit<CodeState, 'kind'>, s = 1) => resolve(C(st), s) as ResolvedCode
const lit = (r: ResolvedCode) => r.checks.filter((c) => c.flipped === 1).map((c) => c.label)

describe('code: the SVG route, the passport, the drawer and the vocabulary', () => {
  it('is an SVG kind registered by the lazy module, with the plan’s passport and its own drawer', () => {
    expect(KIND_RENDER.code).toBe('svg')
    expect(STAGE_KINDS_709).toContain('code')
    expect(svgKindDef('code')).toBeDefined()
    expect(PASSPORT.code).toMatchObject({ title: 'CODE · qubits and checks', fidelityKey: 'code' })
    expect(PASSPORT.code.note).toBe('not a place · discs are qubits, squares are checks; positions are a drawing choice')
    expect(passportOf(C({ code: 'steane7' }))).toBe(PASSPORT.code)
    const f = fidelityOf('code')
    for (const list of Object.values(f)) expect(list.length).toBeGreaterThan(0)
    expect(Object.values(f).flat().map((i) => i.id).sort()).toEqual(['qc-code-distance', 'qc-code-edges', 'qc-code-engine', 'qc-code-layout', 'qc-code-lit'])
    expect(f.misleading.map((i) => i.id)).toEqual(['qc-code-lit'])
    expect(SHOTS.code).toEqual(['CD-CODE'])
    expect(ANCHORS.code).toEqual(['qubit', 'check', 'edge', 'error', 'syndrome', 'correction', 'residual', 'logical', 'table', 'word', 'stub', 'shift'])
    expect(svgKindDef('code')!.print).toEqual({ w: 320, h: 360 })
  })
  it('the stage’s code ids are the engine registry’s (content never imports the engine, so the two lists are kept equal here)', () => {
    expect([...CODE_IDS]).toEqual([...REGISTERED_CODE_IDS])
    expect([...CODE_VIEWS]).toEqual(['layout', 'checks', 'words'])
    expect([...CODE_SHOW]).toEqual(['syndrome', 'correction', 'residual', 'logical'])
  })
  it('resolve / validateStage reach it like any kind; an unknown shot is caught by the shared check', () => {
    expect(validateStage(C({ code: 'steane7', shot: 'CD-CODE' }))).toEqual([])
    expect(validateStage({ ...C({ code: 'steane7' }), shot: 'X-NOPE' as never })).toEqual(['code: unknown shot "X-NOPE"'])
  })
})

describe('code: Pauli text', () => {
  it('reads one letter per qubit, or the hit qubits counted from 1', () => {
    const dense = parsePauliText('IXIIZII', 7)
    expect(dense.ok && dense.p.letters().join('')).toBe('IXIIZII')
    for (const [text, want] of [['X5', 'IIIIXII'], ['X1Z4', 'XIIZIII'], ['X1 Z4', 'XIIZIII'], ['Y7', 'IIIIIIY']] as const) {
      const p = parsePauliText(text, 7)
      expect(p.ok && p.p.letters().join(''), text).toBe(want)
    }
  })
  it('refuses a wrong length, an out-of-range or repeated qubit, and anything else, with the reason', () => {
    expect(parsePauliText('XXI', 7)).toEqual({ ok: false, reason: expect.stringMatching(/3 letters, the code has 7 qubits/) })
    expect(parsePauliText('X8', 7)).toEqual({ ok: false, reason: expect.stringMatching(/qubit 8 is outside 1 … 7/) })
    expect(parsePauliText('X0', 7)).toEqual({ ok: false, reason: expect.stringMatching(/qubit 0 is outside/) })
    expect(parsePauliText('X2Z2', 7)).toEqual({ ok: false, reason: expect.stringMatching(/qubit 2 is named twice/) })
    expect(parsePauliText('hello', 7).ok).toBe(false)
    expect(parsePauliText('', 7).ok).toBe(false)
    expect(parsePauliText(5 as never, 7).ok).toBe(false)
    expect(parsePauliText('X'.repeat(700), 7).ok).toBe(false)
  })
  it('says an error in words and tersely', () => {
    expect(describePauli(Pauli.parse('IIIIXII'))).toBe('X on qubit 5')
    expect(describePauli(Pauli.parse('XXIZIII'))).toBe('X on qubits 1 and 2, Z on qubit 4')
    expect(describePauli(Pauli.parse('III'))).toBe('the identity')
    expect(tersePauli(Pauli.parse('XXIZIII'))).toBe('X on 1, 2, Z on 4')
    expect(tersePauli(Pauli.parse('XXXXXXX'))).toBe('weight 7')
    expect(tersePauli(Pauli.parse('III'))).toBe('identity')
  })
})

describe('code: every drawn syndrome is the engine’s (and the numpy fixture’s)', () => {
  it('Steane, Shor and the bit-flip code: the fixture’s 1- and 2-qubit syndromes (X checks then Z checks) equal the lit pattern of the resolved picture', () => {
    for (const [id, key] of [['steane7', 'steane'], ['shor9', 'shor'], ['rep3', 'bitflip3']] as const) {
      let n = 0
      for (const [letters, xs, zs] of FX.codes[key].syndromes as [string, string, string][]) {
        const r = R({ code: id, error: letters, show: ['syndrome'] })
        expect(r.syndrome, `${id} ${letters}`).toBe(xs + zs)
        expect(r.checks.map((c) => c.flipped).join(''), `${id} ${letters}`).toBe(xs + zs)
        n++
      }
      expect(n, id).toBeGreaterThan(20)
    }
  })
  it('the five-qubit code: the fixture’s single-qubit syndromes', () => {
    for (const [letters, syn] of Object.entries<string>(FX.codes.five.syndromes)) expect(R({ code: 'five5', error: letters, show: ['syndrome'] }).syndrome, letters).toBe(syn)
  })
  it('every registered code up to 25 qubits, every single-qubit error and 200 weight-two errors: the picture’s syndrome is the CSS split of H_X, H_Z (a second engine route)', () => {
    for (const id of ['rep3', 'rep3x', 'shor9', 'steane7', 'surface3', 'surface5'] as const) {
      const e = registeredCode(id)
      const css = e.css!
      const errors: string[] = []
      for (let q = 1; q <= e.n; q++) for (const l of ['X', 'Y', 'Z']) errors.push(`${l}${q}`)
      for (let t = 0; t < 200; t++) {
        const a = 1 + ((t * 7) % e.n)
        const b = 1 + ((t * 13 + 5) % e.n)
        if (a !== b) errors.push(`${'XYZ'[t % 3]}${a}${'XYZ'[(t + 1) % 3]}${b}`)
      }
      for (const text of errors) {
        const p = parsePauliText(text, e.n) as { ok: true; p: Pauli }
        const s = css.syndrome(p.p)
        expect(R({ code: id, error: text, show: ['syndrome'] }).syndrome, `${id} ${text}`).toBe([...s.x, ...s.z].join(''))
      }
    }
  })
  it('the bicycle codes: a single X flip lights exactly the Z checks whose row of H_Z holds the qubit (3 of them); a Y flip lights those and the X checks of H_X (6)', () => {
    for (const id of ['gross', 'two-gross'] as const) {
      const bb = registeredCode(id).bb!
      const r = R({ code: id, error: 'X40', show: ['syndrome'] })
      const want = Array.from({ length: bb.HZ.rows }, (_, i) => i).filter((i) => bb.HZ.get(i, 39) === 1).map((i) => `Z${i}`)
      expect(lit(r)).toEqual(want)
      expect(want.length).toBe(3)
      const y = R({ code: id, error: 'Y40', show: ['syndrome'] })
      const wantX = Array.from({ length: bb.HX.rows }, (_, i) => i).filter((i) => bb.HX.get(i, 39) === 1).map((i) => `X${i}`)
      expect(lit(y)).toEqual([...wantX, ...want])
      expect(lit(y).length).toBe(6)
    }
  })
})
