/**
 * `pauli-program` (P-B4-story §9.2 S-a; built in B3 for the measurement programs): a program of Pauli operations on wires. Content writes the program; the readouts are counts of the authored columns.
 * These tests check the SVG route (registration, passport, drawer, vocabulary, print figure), the resolver on the CNOT-by-measurement program, every validation limit with a message that names the field
 * (and the refusal of the compile and branch modes that chapter B4 will build), the readout text and its omissions, the interpolation of `upTo`, and that the one scene draws with no NaN in the live, reading
 * and print versions, gives every column and wire an accessible name, and packs inside its box clear of the text lines (down to 24 columns on a 320 px figure).
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { fidelityOf } from '../../content/fidelity'
import type { PauliProgramColumn, PauliProgramState } from '../../content/stage'
import { KIND_RENDER, PASSPORT, STAGE_KINDS_709, passportOf } from '../../content/stage'
import { ANCHORS, SHOTS } from '../../content/stageVocab'
import { FigureFor, FIGURE_KINDS } from '../figures/FigureFor'
import { interpolate } from '../interp'
import { resolve, validateLayout, validateStage } from '../resolve'
import { staticWidgetFor } from '../staticWidgets'
import { svgKindDef } from '../svgKinds'
import type { ResolvedPauliProgram } from '../types'
import { PauliProgramScene, columnTag, pauliProgramGeometry } from './PauliProgramScene'
import { PAULI_PROGRAM_LIMITS, TURN_LABEL, columnName, pauliProgramReadouts, pauliProgramSummary, programModeRefusal, validatePauliProgramStage } from './pauliProgram'
import './kinds'

const S = (st: Omit<PauliProgramState, 'kind'>): PauliProgramState => ({ kind: 'pauli-program', ...st })
const R = (st: Omit<PauliProgramState, 'kind'>, s = 1) => resolve(S(st), s) as ResolvedPauliProgram
const texts = (r: ResolvedPauliProgram) => pauliProgramReadouts(r).map((x) => x.text)
const bad = (st: Omit<PauliProgramState, 'kind'>) => validatePauliProgramStage(S(st))
type Mode = 'stage' | 'print'
const draw = (r: ResolvedPauliProgram, mode: Mode, w: number, h: number, bare = false, slot: 'full' | 'top' | 'bottom' = 'full') =>
  renderToString(
    <svg viewBox={`0 0 ${w} ${h}`}>
      <PauliProgramScene state={r} mode={mode} width={w} height={h} bare={bare} slot={slot} />
    </svg>,
  )

/** CNOT by measurement (Q22 / B3): control c, ancilla a, target t. */
const CNOT: Omit<PauliProgramState, 'kind'> = {
  program: {
    wires: 3,
    columns: [{ meas: { pauli: 'ZZI' } }, { meas: { pauli: 'IXX' } }, { meas: { pauli: 'IZI' } }],
    labels: ['c', 'a', 't'],
  },
}
const rot = (pauli: string, angle: 'c+' | 'c-' | 't+' | 't-'): PauliProgramColumn => ({ rot: { pauli, angle } })
/** Seven T-like rotations on three wires (the phase-polynomial shape of a Toffoli), three measurements and two injections. */
const MIXED: Omit<PauliProgramState, 'kind'> = {
  program: {
    wires: 3,
    columns: [
      rot('ZII', 't+'), rot('IZI', 't+'), rot('IIZ', 't+'), rot('ZZI', 't-'), rot('ZIZ', 't-'), rot('IZZ', 't-'), rot('ZZZ', 't+'),
      rot('XII', 'c+'), rot('IXI', 'c-'),
      { meas: { pauli: 'XXX', outcome: 0 } }, { meas: { pauli: 'ZII', outcome: 1 } }, { meas: { pauli: 'IIY' } },
      { inject: { pauli: 'ZZI', s: 0, t: 1 } }, { inject: { pauli: 'IIX' } },
    ],
  },
  upTo: 11,
}

describe('pauli-program: the SVG route, the passport, the drawer and the vocabulary', () => {
  it('is an SVG kind registered by the lazy module, with the plan’s passport, drawer, shot and anchors', () => {
    expect(KIND_RENDER['pauli-program']).toBe('svg')
    expect(STAGE_KINDS_709).toContain('pauli-program')
    expect(FIGURE_KINDS).toContain('pauli-program')
    expect(svgKindDef('pauli-program')).toBeDefined()
    expect(PASSPORT['pauli-program']).toMatchObject({ title: 'PROGRAM · Pauli operations, time →', fidelityKey: 'pauli-program' })
    expect(PASSPORT['pauli-program'].note).toBe('not a place · letters are Paulis on wires; spacing is a drawing')
    expect(passportOf(S(CNOT))).toBe(PASSPORT['pauli-program'])
    const f = fidelityOf('pauli-program')
    for (const list of Object.values(f)) expect(list.length).toBeGreaterThan(0)
    expect(f.exact.map((i) => i.id)).toEqual(['qc-program-letters'])
    expect(f.schematic.map((i) => i.id)).toEqual(['qc-program-layout'])
    expect(f.misleading.map((i) => i.id)).toEqual(['qc-program-magic-lane'])
    expect(SHOTS['pauli-program']).toEqual(['PP-PROGRAM'])
    expect(ANCHORS['pauli-program']).toEqual(['wire', 'column', 'rotation', 'meter', 'lane'])
    expect(svgKindDef('pauli-program')!.print).toEqual({ w: 320, h: 300 })
    expect(staticWidgetFor(S(CNOT))).toBeNull()
  })
  it('resolve / validateStage reach it like any kind; an unknown shot is caught by the shared check; a split with another kind validates', () => {
    const st = S({ ...CNOT, shot: 'PP-PROGRAM' })
    expect((resolve(st, 1) as ResolvedPauliProgram).columns).toHaveLength(3)
    expect(validateStage(st)).toEqual([])
    expect(validateStage({ ...st, shot: 'X-NOPE' as never })).toEqual(['pauli-program: unknown shot "X-NOPE"'])
    expect(validateLayout({ layout: 'split', top: st, bottom: { kind: 'plot', curve: { fn: 'identityP' } } })).toEqual([])
    expect(validateLayout({ layout: 'split', top: st, bottom: st })).toEqual(['layout repeats a kind: pauli-program + pauli-program'])
  })
})

describe('pauli-program: the resolved program is the authored one', () => {
  it('CNOT by measurement: three measurements, the touched wires of each column, default upTo = all, labels c / a / t', () => {
    const r = R(CNOT)
    expect(r.mode).toBe('program')
    expect(r.wires).toBe(3)
    expect(r.labels).toEqual(['c', 'a', 't'])
    expect(r.columns.map((c) => [c.type, c.letters.join(''), c.touched])).toEqual([
      ['meas', 'ZZI', [0, 1]],
      ['meas', 'IXX', [1, 2]],
      ['meas', 'IZI', [1]],
    ])
    expect(r.upTo).toBe(3)
    expect(r.counts).toEqual({ measurements: 3, rotations: 0, tCount: 0, injections: 0 })
    expect(r.hasLane).toBe(false)
    expect(texts(r)).toEqual(['3 measurements'])
  })
  it('wire labels default to 1 … n', () => {
    expect(R({ program: { wires: 4, columns: [{ meas: { pauli: 'ZIII' } }] } }).labels).toEqual(['1', '2', '3', '4'])
  })
  it('a rotation carries its angle label and whether it is T-like; a measurement its outcome; an injection its two outcomes', () => {
    const r = R(MIXED)
    expect(r.columns[0]).toMatchObject({ type: 'rot', angle: 't+', turn: '+π/4', tLike: true })
    expect(r.columns[3]).toMatchObject({ type: 'rot', angle: 't-', turn: '−π/4', tLike: true })
    expect(r.columns[7]).toMatchObject({ type: 'rot', angle: 'c+', turn: '+π/2', tLike: false })
    expect(r.columns[8]).toMatchObject({ type: 'rot', angle: 'c-', turn: '−π/2', tLike: false })
    expect(r.columns[9]).toMatchObject({ type: 'meas', outcome: 0 })
    expect(r.columns[10]).toMatchObject({ type: 'meas', outcome: 1 })
    expect(r.columns[11].outcome).toBeUndefined()
    expect(r.columns[12]).toMatchObject({ type: 'inject', s: 0, t: 1 })
    expect(r.columns[13]).toMatchObject({ type: 'inject' })
    expect(r.columns[13].s).toBeUndefined()
    expect(TURN_LABEL).toEqual({ 'c+': '+π/2', 'c-': '−π/2', 't+': '+π/4', 't-': '−π/4' })
    expect(r.hasLane).toBe(true)
  })
  it('the counts are of the authored columns whatever upTo is', () => {
    const r = R(MIXED)
    expect(r.upTo).toBe(11)
    expect(r.counts).toEqual({ measurements: 3, rotations: 9, tCount: 7, injections: 2 })
    expect(R({ ...MIXED, upTo: 0 }).counts).toEqual(r.counts)
  })
  it('compile and branch cannot be resolved (their compiler is not built): the resolver says so', () => {
    expect(() => resolve(S({ compile: { preset: 'cnot', upTo: 0 } }), 1)).toThrow(programModeRefusal('compile'))
    expect(() => resolve(S({ branch: { axes: ['Z'], outcomes: [0] } }), 1)).toThrow(programModeRefusal('branch'))
  })
})

describe('pauli-program: validation', () => {
  const ok = { wires: 3, columns: [{ meas: { pauli: 'ZZI' } } as PauliProgramColumn] }
  it('accepts the CNOT-by-measurement program, the limits themselves and a column of each type', () => {
    expect(bad(CNOT)).toEqual([])
    expect(bad(MIXED)).toEqual([])
    expect(bad({ program: { wires: 6, columns: Array.from({ length: 24 }, (_, i) => rot('ZIIIII', i % 2 ? 't+' : 'c-')) } })).toEqual([])
    expect(bad({ program: ok, upTo: 0 })).toEqual([])
    expect(bad({ program: ok, upTo: 1 })).toEqual([])
    expect(bad({ program: { ...ok, labels: ['abc', 'q1', '⟨a'] } })).toEqual([])
    expect(validateStage(S(CNOT))).toEqual([])
    expect(validateStage(S(MIXED))).toEqual([])
  })
  it('wires 1–6 and columns 1–24', () => {
    expect(bad({ program: { wires: 7, columns: [{ meas: { pauli: 'ZIIIIII' } }] } })).toEqual(['pauli-program program.wires: a whole number 1–6'])
    expect(bad({ program: { wires: 0, columns: [] } })[0]).toMatch(/^pauli-program program\.wires/)
    expect(bad({ program: { wires: 2.5, columns: [{ meas: { pauli: 'ZI' } }] } })[0]).toMatch(/^pauli-program program\.wires/)
    expect(PAULI_PROGRAM_LIMITS).toMatchObject({ wiresMax: 6, columnsMax: 24, labelMax: 3 })
    const many = Array.from({ length: 25 }, () => rot('ZI', 'c+'))
    expect(bad({ program: { wires: 2, columns: many } })).toEqual(['pauli-program program.columns: a list of 1–24 columns'])
    expect(bad({ program: { wires: 2, columns: [] } })).toEqual(['pauli-program program.columns: a list of 1–24 columns'])
  })
  it('a bad letter, a wrong-length Pauli, an all-I Pauli', () => {
    expect(bad({ program: { wires: 3, columns: [{ meas: { pauli: 'ZQI' } }] } })).toEqual(['pauli-program program.columns[0].meas.pauli: "ZQI" must use only the letters I, X, Y, Z'])
    expect(bad({ program: { wires: 3, columns: [{ meas: { pauli: 'zzi' } }] } })[0]).toMatch(/must use only the letters/)
    expect(bad({ program: { wires: 3, columns: [{ meas: { pauli: 'ZZ' } }] } })).toEqual(['pauli-program program.columns[0].meas.pauli: "ZZ" must have exactly 3 letters, one per wire (I = untouched)'])
    expect(bad({ program: { wires: 3, columns: [{ meas: { pauli: 'ZZII' } }] } })[0]).toMatch(/exactly 3 letters/)
    expect(bad({ program: { wires: 3, columns: [{ meas: { pauli: '+ZZI' } }] } })[0]).toMatch(/exactly 3 letters/)
    expect(bad({ program: { wires: 3, columns: [{ meas: { pauli: 'III' } }] } })).toEqual(['pauli-program program.columns[0].meas.pauli: "III" touches no wire (at least one letter must not be I)'])
    expect(bad({ program: { wires: 2, columns: [{ meas: { pauli: 'ZI' } }, { rot: { pauli: 'IQ', angle: 'c+' } }] } })[0]).toMatch(/^pauli-program program\.columns\[1\]\.rot\.pauli/)
  })
  it('a column is exactly one of rot, meas, inject, with its own fields only', () => {
    expect(bad({ program: { wires: 2, columns: [{ nope: { pauli: 'ZI' } } as never] } })[0]).toMatch(/^pauli-program program\.columns\[0\]: exactly one of rot, meas, inject/)
    expect(bad({ program: { wires: 2, columns: [{ rot: { pauli: 'ZI', angle: 'c+' }, meas: { pauli: 'ZI' } } as never] } })[0]).toMatch(/exactly one of rot, meas, inject \(got rot, meas\)/)
    expect(bad({ program: { wires: 2, columns: [{} as never] } })[0]).toMatch(/exactly one of rot, meas, inject \(got nothing\)/)
    expect(bad({ program: { wires: 2, columns: [{ rot: { pauli: 'ZI', angle: 'c+', extra: 1 } } as never] } })[0]).toMatch(/columns\[0\]\.rot\.extra: unknown field/)
    expect(bad({ program: { wires: 2, columns: [{ rot: { pauli: 'ZI', angle: 'x+' } } as never] } })[0]).toMatch(/^pauli-program program\.columns\[0\]\.rot\.angle: 'c\+', 'c-', 't\+', 't-'/)
    expect(bad({ program: { wires: 2, columns: [{ rot: { pauli: 'ZI' } } as never] } })[0]).toMatch(/rot\.angle/)
    expect(bad({ program: { wires: 2, columns: [{ meas: { pauli: 'ZI', outcome: 2 } } as never] } })).toEqual(['pauli-program program.columns[0].meas.outcome: 0 (+) or 1 (−)'])
    expect(bad({ program: { wires: 2, columns: [{ inject: { pauli: 'ZI', s: 3 } } as never] } })[0]).toMatch(/inject\.s: 0 \(\+\) or 1 \(−\)/)
    expect(bad({ program: { wires: 2, columns: [{ inject: { pauli: 'ZI', t: -1 } } as never] } })[0]).toMatch(/inject\.t/)
  })
  it('labels: one per wire, 1–3 characters, no spaces', () => {
    expect(bad({ program: { ...ok, labels: ['a', 'b'] } })).toEqual(['pauli-program program.labels: one label per wire (3)'])
    expect(bad({ program: { ...ok, labels: ['a', 'abcd', 'c'] } })).toEqual(['pauli-program program.labels[1]: 1–3 characters, no spaces'])
    expect(bad({ program: { ...ok, labels: ['a', '', 'c'] } })[0]).toMatch(/labels\[1\]/)
    expect(bad({ program: { ...ok, labels: ['a', 'b c', 'c'] } })[0]).toMatch(/labels\[1\]/)
  })
  it('upTo is a whole number from 0 to the number of columns', () => {
    expect(bad({ program: ok, upTo: 2 })).toEqual(['pauli-program upTo: a whole number 0–1 (columns drawn plainly)'])
    expect(bad({ program: ok, upTo: -1 })[0]).toMatch(/^pauli-program upTo/)
    expect(bad({ program: ok, upTo: 0.5 })[0]).toMatch(/^pauli-program upTo/)
  })
  it('exactly one of program, compile, branch', () => {
    expect(bad({})).toEqual(['pauli-program: exactly one of program, compile, branch (got none)'])
    expect(bad({ program: ok, compile: { preset: 'cnot', upTo: 0 } })).toEqual(['pauli-program: exactly one of program, compile, branch (got program and compile)'])
    expect(bad({ compile: { preset: 'cnot', upTo: 0 }, branch: { axes: ['Z'], outcomes: [] } })[0]).toMatch(/got compile and branch/)
  })
  it('refuses the compile and branch modes with the chapter B4 message (declared in the types, built later)', () => {
    for (const preset of ['toffoli-textbook', 'toffoli-phase', 'cnot', 'z-then-x'] as const)
      expect(bad({ compile: { preset, upTo: 0 } })).toEqual(["pauli-program compile mode comes with chapter B4's compiler (not built yet)"])
    expect(bad({ branch: { axes: ['Z', 'X'], outcomes: [0, 1] } })).toEqual(["pauli-program branch mode comes with chapter B4's compiler (not built yet)"])
    expect(validateStage(S({ compile: { preset: 'cnot', upTo: 2 } }))).toEqual(["pauli-program compile mode comes with chapter B4's compiler (not built yet)"])
  })
  it('an unknown field is refused, naming it', () => {
    expect(bad({ program: ok, extra: 1 } as never)).toEqual(['pauli-program extra: unknown field (allowed: program, compile, branch, upTo, shot)'])
    expect(bad({ program: { ...ok, extra: 1 } as never })[0]).toMatch(/^pauli-program program\.extra: unknown field/)
  })
})

describe('pauli-program: readouts', () => {
  it('counts of the authored columns: measurements first, then rotations, T-count, injections', () => {
    expect(texts(R(MIXED))).toEqual(['3 measurements', '9 rotations', 'T-count 7', '2 injections'])
    expect(texts(R({ program: { wires: 3, columns: Array.from({ length: 7 }, (_, i) => rot('ZII', i < 7 ? 't+' : 'c+')) } }))).toEqual(['0 measurements', '7 rotations', 'T-count 7'])
  })
  it('omits zero counts except the first, and uses the singular for one', () => {
    expect(texts(R({ program: { wires: 2, columns: [{ meas: { pauli: 'ZI' } }] } }))).toEqual(['1 measurement'])
    expect(texts(R({ program: { wires: 2, columns: [rot('ZI', 'c+')] } }))).toEqual(['0 measurements', '1 rotation'])
    expect(texts(R({ program: { wires: 2, columns: [rot('ZI', 'c+'), rot('IZ', 'c-')] } }))).toEqual(['0 measurements', '2 rotations'])
    expect(texts(R({ program: { wires: 2, columns: [{ inject: { pauli: 'ZI' } }] } }))).toEqual(['0 measurements', '1 injection'])
  })
  it('short lines, and an accessible summary', () => {
    for (const t of texts(R(MIXED))) expect(t.length).toBeLessThanOrEqual(20)
    expect(pauliProgramSummary(R(CNOT))).toBe('Pauli program, 3 wires, 3 columns; 3 measurements')
    expect(columnName(R(CNOT), R(CNOT).columns[0])).toBe('column 1: measurement of Z on c, Z on a')
    const m = R(MIXED)
    expect(columnName(m, m.columns[0])).toBe('column 1: T-like rotation by +π/4 (Z on 1)')
    expect(columnName(m, m.columns[7])).toBe('column 8: Clifford rotation by +π/2 (X on 1)')
    expect(columnName(m, m.columns[10])).toBe('column 11: measurement of Z on 1, outcome −')
    expect(columnName(m, m.columns[12])).toBe('column 13: magic-state injection through Z on 1, Z on 2, P⊗Z outcome +, X outcome −')
  })
})

describe('pauli-program: interpolation', () => {
  it('the same program lerps upTo as whole steps', () => {
    const a = R({ ...MIXED, upTo: 0 })
    const b = R({ ...MIXED, upTo: 6 })
    expect(interpolate(a, b, 0)).toBe(a)
    expect(interpolate(a, b, 1)).toBe(b)
    const seen = [0.1, 0.25, 0.5, 0.7, 0.9].map((t) => (interpolate(a, b, t) as ResolvedPauliProgram).upTo)
    expect(seen).toEqual([1, 2, 3, 4, 5])
    expect(seen.every(Number.isInteger)).toBe(true)
    // the in-between frame is a true picture of the same program
    const mid = interpolate(a, b, 0.5) as ResolvedPauliProgram
    expect(mid.columns).toEqual(a.columns)
    expect(mid.counts).toEqual(a.counts)
    // backwards too
    expect((interpolate(b, a, 0.5) as ResolvedPauliProgram).upTo).toBe(3)
  })
  it('a different program switches at the half-way point', () => {
    const a = R(CNOT)
    const b = R(MIXED)
    expect(interpolate(a, b, 0.49)).toBe(a)
    expect(interpolate(a, b, 0.5)).toBe(b)
    const relabelled = R({ program: { ...CNOT.program!, labels: ['x', 'y', 'z'] } })
    expect(interpolate(a, relabelled, 0.3)).toBe(a)
    expect(interpolate(a, relabelled, 0.7)).toBe(relabelled)
  })
})

describe('pauli-program: the one scene', () => {
  const BOXES: [Mode, number, number, boolean, 'full' | 'top' | 'bottom'][] = [
    ['stage', 506, 785, false, 'full'],
    ['stage', 375, 640, false, 'full'],
    ['stage', 700, 560, false, 'full'],
    ['stage', 506, 400, false, 'top'],
    ['stage', 320, 300, true, 'full'],
    ['print', 320, 300, false, 'full'],
  ]
  const wide = (wires: number, n: number): Omit<PauliProgramState, 'kind'> => ({
    program: { wires, columns: Array.from({ length: n }, (_, i) => (i % 3 === 0 ? rot('X'.padEnd(wires, 'Z').slice(0, wires), i % 2 ? 't-' : 't+') : i % 3 === 1 ? { meas: { pauli: 'Z'.padStart(wires, 'I'), outcome: (i % 2) as 0 | 1 } } : { inject: { pauli: 'Y'.padEnd(wires, 'I'), s: 0 as const, t: 1 as const } })) },
    upTo: Math.floor(n / 2),
  })
  const STATES: Omit<PauliProgramState, 'kind'>[] = [CNOT, { ...CNOT, upTo: 1 }, MIXED, { ...MIXED, upTo: 0 }, wide(6, 24), wide(1, 5), wide(4, 12), { program: { wires: 2, columns: [rot('ZZ', 'c+')] } }]
  it('draws every state in every box with no NaN, with its anchors, one named group per column and wire, and one letter per touched wire', () => {
    for (const st of STATES)
      for (const [mode, w, h, bare, slot] of BOXES) {
        const r = R(st)
        const html = draw(r, mode, w, h, bare, slot)
        const where = `${r.wires}w ${r.columns.length}c upTo ${r.upTo} ${mode} ${w}x${h} ${slot}`
        expect(html, where).not.toMatch(/NaN|Infinity|undefined/)
        expect(html).toContain('data-kind="pauli-program"')
        expect(html.match(/data-anchor="column"/g)?.length, where).toBe(r.columns.length)
        expect(html.match(/aria-label="column \d+:/g)?.length, where).toBe(r.columns.length)
        expect(html.match(/aria-label="wire /g)?.length, where).toBe(r.wires)
        expect(html.match(/data-letter="/g)?.length, where).toBe(r.columns.reduce((s, c) => s + c.touched.length, 0))
        expect(html.match(/data-dim="1"/g)?.length ?? 0, where).toBe(r.columns.length - r.upTo)
        expect(html.includes('data-anchor="rotation"'), where).toBe(r.counts.rotations > 0)
        expect(html.includes('data-anchor="meter"'), where).toBe(r.counts.measurements + r.counts.injections > 0)
        // the magic lane is drawn exactly when there is an injection, and says what it is
        expect(html.includes('magic lane (drawn for reading, not a wire)'), where).toBe(r.hasLane)
        expect(html.includes('data-lane-item="'), where).toBe(r.hasLane)
        expect(html.match(/data-lane-item="/g)?.length ?? 0, where).toBe(r.counts.injections)
        expect(html.includes('data-anchor="wire"'), where).toBe(true)
        expect(html.includes('data-cursor="'), where).toBe(r.upTo < r.columns.length)
      }
  })
  it('rotations: outlined for Clifford, filled for T-like, with the angle written above', () => {
    const html = draw(R(MIXED), 'stage', 506, 785)
    expect(html.match(/data-t-like="1"/g)?.length).toBe(7)
    expect(html.match(/data-t-like="0"/g)?.length).toBe(2)
    expect(html).toMatch(/class="fg-op-fill fg-op"/)
    expect(html).toMatch(/fill="none" class="fg-op"/)
    for (const t of ['+π/4', '−π/4', '+π/2', '−π/2']) expect(html).toContain(t)
    expect(columnTag(R(MIXED).columns[12])).toBe('s+ t−')
    expect(columnTag(R(MIXED).columns[13])).toBe('')
    expect(columnTag(R(CNOT).columns[0])).toBe('')
  })
  it('a measurement is a meter box: its outcome sign inside when authored, a dial when not; an injection is dashed', () => {
    const html = draw(R({ program: { wires: 2, columns: [{ meas: { pauli: 'ZZ', outcome: 0 } }, { meas: { pauli: 'XI', outcome: 1 } }, { meas: { pauli: 'IY' } }, { inject: { pauli: 'ZI', s: 1 } }] } }), 'stage', 506, 785)
    expect(html.match(/data-anchor="meter"/g)?.length).toBe(4)
    expect(html).toMatch(/class="fg-plus-t"[^>]*>\+</)
    expect(html).toMatch(/class="fg-minus-t"[^>]*>−</)
    expect(html.match(/stroke-dasharray="2.5 2"/g)?.length ?? 0).toBeGreaterThanOrEqual(2)
  })
  it('letters are in the tableau’s fixed hues, and untouched wires carry no letter', () => {
    const html = draw(R({ program: { wires: 3, columns: [{ meas: { pauli: 'XYZ' } }, { meas: { pauli: 'IZI' } }] } }), 'stage', 506, 785)
    expect(html.match(/data-letter="X"/g)?.length).toBe(1)
    expect(html.match(/data-letter="Y"/g)?.length).toBe(1)
    expect(html.match(/data-letter="Z"/g)?.length).toBe(2)
    expect(html).not.toContain('data-letter="I"')
    const fills = [...html.matchAll(/data-letter="([XYZ])"[\s\S]*?<text[^>]*style="fill:([^;"]+)/g)].map((m) => [m[1], m[2]])
    expect(new Set(fills.map((f) => f[1])).size).toBe(3)
  })
  it('packing: wires, symbols and lane sit inside the box, clear of the text lines and the legend, in every box and at 24 columns', () => {
    for (const st of STATES)
      for (const [mode, w, h, bare, slot] of BOXES) {
        const r = R(st)
        const g = pauliProgramGeometry(r, w, h, mode === 'print' || bare, slot)
        const where = `${r.wires}w ${r.columns.length}c ${mode} ${w}x${h} ${slot}`
        const m = r.columns.length
        // columns do not leave the wires, and their symbols do not touch their neighbours
        expect(g.colX(0) - g.cw / 2, `${where} left`).toBeGreaterThanOrEqual(g.x0 - 1)
        expect(g.colX(m - 1) + g.cw / 2, `${where} right`).toBeLessThanOrEqual(g.x1 + 0.5)
        expect(g.pitch - g.cw, `${where}: symbols touch`).toBeGreaterThanOrEqual(0.99)
        // wires fit the area; the lane, when drawn, sits under them; the legend baseline is below everything
        expect(g.wireY(0) - g.rowH / 2, `${where} wires top`).toBeGreaterThanOrEqual(g.area.y - 0.5)
        expect(g.wiresBottom, `${where} wires bottom`).toBeLessThanOrEqual(g.area.y + g.area.h)
        if (g.lane) {
          expect(g.lane.y, where).toBeGreaterThanOrEqual(g.wiresBottom)
          expect(g.lane.y + g.lane.h, where).toBeLessThanOrEqual(g.legendY - 8)
        } else expect(g.wiresBottom, where).toBeLessThanOrEqual(g.legendY - 8)
        // the symbols and the angle labels sit above the wires, below the area's top
        expect(g.chipY - g.chipR, `${where} symbols`).toBeGreaterThanOrEqual(g.area.y - 0.5)
        expect(g.chipY + g.chipR, where).toBeLessThan(g.wiresTop)
        if (g.headerRows) {
          expect(g.headerBase(0) - 9, `${where} header top`).toBeGreaterThanOrEqual(g.area.y - 1)
          expect(g.headerBase(g.headerRows - 1) + 2, `${where} header`).toBeLessThanOrEqual(g.chipY - g.chipR)
          // staggered angle labels (4.6 px a character at 9 px) clear one another
          const tagChars = Math.max(...r.columns.map((c) => columnTag(c).length))
          if (g.headerRows < 3) expect(tagChars * 4.6 + 2, where).toBeLessThanOrEqual(g.headerRows * g.pitch + 0.01)
        }
        // letters are readable
        expect(g.fs, where).toBeGreaterThanOrEqual(8)
        // the figure's text lines sit above the drawing; the live stage leaves the readout column its room
        if (g.lines.length) expect(6 + 13 * g.lines.length, where).toBeLessThanOrEqual(g.area.y + 1)
        if (mode === 'stage' && !bare && slot !== 'bottom') expect(g.area.y, where).toBeGreaterThanOrEqual(Math.min(26 + 17 * pauliProgramReadouts(r).length, 112))
        expect(g.area.y + g.area.h, where).toBeLessThanOrEqual(h)
        expect(g.rowH, where).toBeGreaterThanOrEqual(14)
      }
  })
  it('the print figure’s text lines name the wires, the columns and time, then the readouts', () => {
    const g = pauliProgramGeometry(R(MIXED), 320, 300, true)
    expect(g.lines[0]).toBe('3 wires · 14 columns · time →')
    expect(g.lines.join(' ')).toContain('3 measurements')
    expect(g.lines.join(' ')).toContain('T-count 7')
  })
})

describe('pauli-program: the print figure', () => {
  it('is the same scene in print ink, numbered, titled with the passport, with the readouts as its own lines', () => {
    const html = renderToString(<FigureFor layout={S({ ...CNOT, shot: 'PP-PROGRAM' })} number="B3.7" caption="CNOT by measurement" />)
    expect(html).toContain('<figure class="print-figure"')
    expect(html).toContain('<title>Fig. B3.7: PROGRAM · Pauli operations, time →</title>')
    expect(html).toContain('viewBox="0 0 320 300"')
    expect(html).toContain('svgk-print')
    expect(html).toContain('3 wires · 3 columns · time →')
    expect(html).toContain('3 measurements')
    expect(html).not.toMatch(/NaN|Infinity|undefined|no print drawing yet/)
  })
  it('draws a mixed program with the lane in a figure too', () => {
    const html = renderToString(<FigureFor layout={S(MIXED)} number="B3.8" />)
    expect(html).toContain('magic lane (drawn for reading, not a wire)')
    expect(html).toContain('T-count 7')
    expect(html).not.toMatch(/NaN|Infinity|undefined|no print drawing yet/)
  })
})
