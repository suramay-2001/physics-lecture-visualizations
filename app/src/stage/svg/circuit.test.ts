/**
 * `circuit`: a qc/circuit.ts Circuit by columns with a cursor; its validation is the circuit module's own plus the
 * stage's caps; beside an `amplitudes` view it must read the same circuit and cursor, so the bars are the engine's
 * state after the drawn cursor (the H-then-CNOT Bell pair at three cursor positions).
 */
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { CircuitStageState, StageLayout } from '../../content/stage'
import { KIND_RENDER, passportOf } from '../../content/stage'
import type { Circuit } from '../../physics/qc/circuit'
import { runCircuit } from '../../physics/qc/circuit'
import { bell, ket } from '../../physics/qc/state'
import { interpolate } from '../interp'
import { resolve, validateLayout } from '../resolve'
import type { ResolvedAmplitudes, ResolvedCircuit } from '../types'
import { CircuitScene } from './CircuitScene'
import { glyphOf, resolveCircuitStage, validateCircuitStage } from './circuit'
import './kinds'

const BELL: Circuit = { version: 1, qubits: 2, columns: [[{ op: 'gate', gate: 'H', targets: [0] }], [{ op: 'gate', gate: 'X', controls: [0], targets: [1] }]] }
const circ = (x: Omit<CircuitStageState, 'kind'>): CircuitStageState => ({ kind: 'circuit', ...x })
const split = (upTo: number, ampUpTo = upTo, circuit2 = BELL): StageLayout => ({
  layout: 'split',
  top: { kind: 'circuit', circuit: BELL, upTo },
  bottom: { kind: 'amplitudes', state: { circuit: circuit2, upTo: ampUpTo } },
})
const gap = (a: { re: number; im: number }[], b: { re: number; im: number }[]) => Math.max(...a.map((x, k) => Math.hypot(x.re - b[k].re, x.im - b[k].im)))

describe('circuit: drawing a Circuit by columns', () => {
  it('is an SVG kind with the time-order passport', () => {
    expect(KIND_RENDER.circuit).toBe('svg')
    expect(passportOf(circ({ circuit: BELL }))).toMatchObject({ title: 'CIRCUIT · time runs →', note: 'not a place · a wire is a qubit' })
  })
  it('glyphs: boxes, ⊕ with controls, SWAP, meters, angles in degrees, classical conditions', () => {
    expect(glyphOf({ op: 'gate', gate: 'H', targets: [0] })).toMatchObject({ type: 'gate', label: 'H' })
    expect(glyphOf({ op: 'gate', gate: 'X', controls: [0, 1], targets: [2] })).toMatchObject({ type: 'not', controls: [0, 1], targets: [2] })
    expect(glyphOf({ op: 'gate', gate: 'SWAP', targets: [0, 2] })).toMatchObject({ type: 'swap', targets: [0, 2] })
    expect(glyphOf({ op: 'gate', gate: 'P', targets: [0], params: [Math.PI / 2] }).label).toBe('P(90°)')
    expect(glyphOf({ op: 'gate', gate: 'Sdg', targets: [0] }).label).toBe('S†')
    expect(glyphOf({ op: 'measure', qubit: 1, bit: 0 })).toMatchObject({ type: 'measure', label: 'c0', targets: [1] })
    expect(glyphOf({ op: 'gate', gate: 'X', targets: [1], cond: { bits: [0], equals: '1' } }).cond).toBe('if c0 = 1')
    expect(glyphOf({ op: 'oracle', mode: 'xor', table: [0, 1], inputs: [0], target: 1 })).toMatchObject({ type: 'oracle', label: 'U_f', targets: [0, 1] })
  })
  it('the cursor: after the last column by default, whole columns while holding, gliding between beats', () => {
    expect(resolveCircuitStage(circ({ circuit: BELL }), 0).cursor).toBe(2)
    const st = circ({ circuit: BELL, upTo: { from: 0, to: 2 } })
    expect([0, 0.2, 0.5, 0.8, 1].map((s) => resolveCircuitStage(st, s).cursor)).toEqual([0, 0, 1, 2, 2])
    const A = resolveCircuitStage(circ({ circuit: BELL, upTo: 0 }), 1)
    const B = resolveCircuitStage(circ({ circuit: BELL, upTo: 2 }), 0)
    expect((interpolate(A, B, 0.25) as ResolvedCircuit).cursor).toBe(0.5)
    const other = resolveCircuitStage(circ({ circuit: { ...BELL, qubits: 3 }, upTo: 0 }), 0)
    expect((interpolate(A, other, 0.4) as ResolvedCircuit).n).toBe(2)
    expect((interpolate(A, other, 0.6) as ResolvedCircuit).n).toBe(3)
  })
})

describe('circuit: validation (the circuit module’s validator + the stage caps)', () => {
  it('rejects what the validator rejects, more than 5 qubits or 24 columns, a cursor off the columns, an unrunnable circuit', () => {
    expect(validateCircuitStage(circ({ circuit: BELL }))).toEqual([])
    expect(validateCircuitStage(circ({ circuit: { ...BELL, version: 2 as never } }))[0]).toMatch(/^circuit: circuit.version/)
    expect(validateCircuitStage(circ({ circuit: { version: 1, qubits: 6, columns: [] } }))).toEqual(['circuit: the stage draws at most 5 qubits'])
    const long: Circuit = { version: 1, qubits: 1, columns: Array.from({ length: 25 }, () => [{ op: 'gate' as const, gate: 'H' as const, targets: [0] }]) }
    expect(validateCircuitStage(circ({ circuit: long }))).toEqual(['circuit: the stage draws at most 24 columns'])
    expect(validateCircuitStage(circ({ circuit: BELL, upTo: { from: 0, to: 3 } }))[0]).toMatch(/whole column 0–2/)
    const mid: Circuit = { version: 1, qubits: 2, clbits: 1, columns: [[{ op: 'measure', qubit: 0, bit: 0 }], [{ op: 'gate', gate: 'X', targets: [1], cond: { bits: [0], equals: '1' } }]] }
    expect(validateCircuitStage(circ({ circuit: mid }))[0]).toMatch(/mid-circuit measurement/)
    expect(validateCircuitStage(circ({ circuit: { ...mid, init: '+0' }, outcomes: '1' }))).toEqual([])
  })
  it('a split must read one circuit and one cursor: the bars are the state after the drawn cursor', () => {
    for (const k of [0, 1, 2]) expect(validateLayout(split(k)), `cursor ${k}`).toEqual([])
    expect(validateLayout(split(1, 2))).toEqual(['circuit + amplitudes: the bars must read the same circuit, cursor (upTo) and outcomes as the circuit beside them'])
    expect(validateLayout(split(1, 1, { ...BELL, init: '10' })).length).toBe(1)
  })
})

describe('the H-then-CNOT Bell pair at three cursor positions (the engine’s runner)', () => {
  it('00, then (|00⟩ + |10⟩)/√2, then (|00⟩ + |11⟩)/√2', () => {
    const want = [ket('00'), runCircuit(BELL).states[1], bell('00+11')]
    for (const k of [0, 1, 2]) {
      const l = split(k) as Extract<StageLayout, { layout: 'split' }>
      const bars = resolve(l.bottom, 1) as ResolvedAmplitudes
      expect(gap(bars.amps, want[k]), `after ${k}`).toBeLessThan(1e-15)
      expect((resolve(l.top, 1) as ResolvedCircuit).cursor).toBe(k)
    }
  })
})

describe('circuit: one scene, two modes', () => {
  it('draws with no NaN; the columns ahead of the cursor are dimmed; print carries the cursor line', () => {
    const r = resolveCircuitStage(circ({ circuit: BELL, upTo: 1 }), 1)
    for (const mode of ['stage', 'print'] as const) {
      const html = renderToString(createElement('svg', null, createElement(CircuitScene, { state: r, mode, width: 320, height: 200 })))
      expect(html, mode).not.toMatch(/NaN|Infinity|undefined/)
      expect(html).toContain('opacity="1"')
      expect(html).toContain('opacity="0.42"')
      expect(html).toContain('data-anchor="cursor"')
      if (mode === 'print') expect(html).toContain('after column 1 of 2')
    }
  })
})
