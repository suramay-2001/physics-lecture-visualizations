/**
 * `circuit` additions of the Papers background chapter B1 (P-B1-story §9.2 K-F; additive): `faults` (a marker on each listed wire in the slot just before a column, with a label)
 * and `hook` (the fault on the CHECK wire that rides along it and spills through the CNOT columns still to come). The markers are places a fault can happen, never computed faults;
 * the hook's reach is read off the circuit itself (the leading CNOT columns and the wire they share). Every existing circuit state resolves exactly as before. These tests check the
 * resolved places and reach on an X-check and a Z-check circuit, every validation limit with a message that names the field, the readouts, the drawer / vocabulary, and that the
 * one scene draws a marker for every listed wire in both modes, inside the box, down to a 375 px phone.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { fidelityOf } from '../../content/fidelity'
import type { CircuitStageState } from '../../content/stage'
import { ANCHORS } from '../../content/stageVocab'
import type { Circuit } from '../../physics/qc/circuit'
import { Pauli } from '../../physics/qec/pauli'
import { FigureFor } from '../figures/FigureFor'
import { resolve, validateStage } from '../resolve'
import type { ResolvedCircuit } from '../types'
import { CircuitScene } from './CircuitScene'
import { CIRCUIT_FAULT_LIMITS, circuitPrintSize, circuitReadouts, leadingCnots, resolveCircuitStage, validateCircuitStage } from './circuit'
import './kinds'

const cnot = (control: number, target: number) => ({ op: 'gate' as const, gate: 'X' as const, controls: [control], targets: [target] })
/** The circuit of an X check on four data wires: the check qubit (wire 4, |+⟩) controls four CNOTs, then H and a measurement. */
const X_CHECK: Circuit = {
  version: 1,
  qubits: 5,
  clbits: 1,
  init: '0000+',
  wires: ['d1', 'd2', 'd3', 'd4', 'c'],
  columns: [[cnot(4, 0)], [cnot(4, 1)], [cnot(4, 2)], [cnot(4, 3)], [{ op: 'gate', gate: 'H', targets: [4] }], [{ op: 'measure', qubit: 4, bit: 0 }]],
}
/** The Z check: the data wires control, the check qubit (wire 4) is the target; a leading H column is not a CNOT column. */
const Z_CHECK: Circuit = {
  version: 1,
  qubits: 5,
  clbits: 1,
  wires: ['d1', 'd2', 'd3', 'd4', 'c'],
  columns: [[{ op: 'gate', gate: 'H', targets: [0] }], [cnot(0, 4)], [cnot(1, 4)], [cnot(2, 4)], [cnot(3, 4)], [{ op: 'measure', qubit: 4, bit: 0 }]],
}
const C = (st: Omit<CircuitStageState, 'kind'>): CircuitStageState => ({ kind: 'circuit', ...st })
const R = (st: Omit<CircuitStageState, 'kind'>) => resolveCircuitStage(C(st), 1)
const bad = (st: Omit<CircuitStageState, 'kind'>) => validateCircuitStage(C(st))
type Mode = 'stage' | 'print'
const draw = (r: ResolvedCircuit, mode: Mode, w: number, h: number, bare = false, slot: 'full' | 'top' | 'bottom' = 'full') =>
  renderToString(
    <svg viewBox={`0 0 ${w} ${h}`}>
      <CircuitScene state={r} mode={mode} width={w} height={h} bare={bare} slot={slot} />
    </svg>,
  )

describe('circuit B1: the vocabulary, the drawer and the old pictures', () => {
  it('has the new anchors and the fault-marker note; a circuit with neither field resolves with no markers and no hook', () => {
    expect(ANCHORS.circuit).toEqual(expect.arrayContaining(['faults', 'hook']))
    const f = fidelityOf('circuit')
    expect(f.schematic.map((i) => i.id)).toContain('qc-circuit-fault-markers')
    const r = R({ circuit: X_CHECK })
    expect(r.faults).toEqual([])
    expect(r.hook).toBeNull()
    expect(circuitReadouts(r).map((x) => x.name)).toEqual(['cursor'])
    expect(validateStage(C({ circuit: X_CHECK, faults: [{ col: 0, wires: [4] }], hook: { after: 1 } }))).toEqual([])
  })
})

describe('circuit B1: the leading CNOT columns and the check wire', () => {
  it('an X check: four CNOT columns sharing the control wire; a Z check after a Hadamard: four sharing the target wire', () => {
    expect(leadingCnots(X_CHECK)).toMatchObject({ first: 0, count: 4, check: 4, role: 'control' })
    expect(leadingCnots(Z_CHECK)).toMatchObject({ first: 1, count: 4, check: 4, role: 'target' })
    expect(leadingCnots({ version: 1, qubits: 1, columns: [[{ op: 'gate', gate: 'H', targets: [0] }]] })).toMatchObject({ count: 0, check: null })
    // two CNOT columns that share no wire: there is no check wire
    expect(leadingCnots({ version: 1, qubits: 4, columns: [[cnot(0, 1)], [cnot(2, 3)]] })).toMatchObject({ count: 2, check: null, role: null })
  })
  it('the hook after k CNOT columns reaches the data wires of the columns after it, at the right columns', () => {
    for (let after = 0; after <= 3; after++) {
      const r = R({ circuit: X_CHECK, hook: { after: after as 0 | 1 | 2 | 3 } })
      expect(r.hook).toEqual({ after, slot: after, check: 4, role: 'control', reach: Array.from({ length: 4 - after }, (_, i) => ({ col: after + i, wire: after + i })) })
    }
    // the Z check: the fault is on the target wire and reaches the control wires, the first CNOT column being column 1
    const z = R({ circuit: Z_CHECK, hook: { after: 1 } })
    expect(z.hook).toEqual({ after: 1, slot: 2, check: 4, role: 'target', reach: [{ col: 2, wire: 1 }, { col: 3, wire: 2 }, { col: 4, wire: 3 }] })
  })
  it('a fault on the check wire spreads exactly as the engine’s CNOT propagation says: X on a control reaches every later target, Z on a target reaches every later control', () => {
    // the engine's own propagation of the Pauli through the later CNOTs (physics/qec/pauli.ts conjugation)
    for (const after of [0, 1, 2, 3]) {
      let p = Pauli.single(5, 4, 'X')
      for (let k = after; k < 4; k++) p = p.conjugate('CNOT', 4, k)
      const reached = p.letters().flatMap((l, w) => (w < 4 && l === 'X' ? [w] : []))
      expect(R({ circuit: X_CHECK, hook: { after: after as 0 | 1 | 2 | 3 } }).hook!.reach.map((x) => x.wire)).toEqual(reached)
    }
    for (let after = 0; after <= 3; after++) {
      // the Z check's CNOT columns are columns 1 … 4, so after k of them the fault is in the slot before column k + 1
      let p = Pauli.single(5, 4, 'Z')
      for (let k = after; k < 4; k++) p = p.conjugate('CNOT', k, 4)
      const reached = p.letters().flatMap((l, w) => (w < 4 && l === 'Z' ? [w] : []))
      expect(R({ circuit: Z_CHECK, hook: { after: after as 0 | 1 | 2 | 3 } }).hook!.reach.map((x) => x.wire)).toEqual(reached)
    }
  })
})

describe('circuit B1: the fault places', () => {
  it('resolve as given, with the label or null; the circuit key (its identity for a transition) is unchanged by them', () => {
    const base = R({ circuit: X_CHECK })
    const r = R({ circuit: X_CHECK, faults: [{ col: 0, wires: [4], label: 'prep' }, { col: 2, wires: [0, 1, 2, 3] }, { col: 6, wires: [4], label: 'read' }] })
    expect(r.faults).toEqual([{ col: 0, wires: [4], label: 'prep' }, { col: 2, wires: [0, 1, 2, 3], label: null }, { col: 6, wires: [4], label: 'read' }])
    expect(r.key).toBe(base.key)
    expect(circuitReadouts(r).map((x) => x.text)).toEqual(['after column 6 of 6', '6 fault places'])
  })
  it('a hook is read out with the wires it reaches', () => {
    expect(circuitReadouts(R({ circuit: X_CHECK, hook: { after: 2 } })).map((x) => x.text)).toEqual(['after column 6 of 6', 'hook after 2: reaches d3, d4'])
  })
})

describe('circuit B1: validation — every limit, with a message that names the field', () => {
  it('faults: at most 24 places, columns 0 … K, wires in range and distinct, a short label, no place twice', () => {
    expect(bad({ circuit: X_CHECK, faults: [{ col: 6, wires: [0] }] })).toEqual([])
    expect(bad({ circuit: X_CHECK, faults: Array.from({ length: 24 }, (_, i) => ({ col: i % 7, wires: [i % 5] })) }).filter((e) => !/twice|already/.test(e))).toEqual([])
    expect(bad({ circuit: X_CHECK, faults: Array.from({ length: 25 }, (_, i) => ({ col: i % 7, wires: [i % 5] })) })).toEqual([`circuit faults: a list of at most ${CIRCUIT_FAULT_LIMITS.faults} fault places`])
    expect(bad({ circuit: X_CHECK, faults: [{ col: 7, wires: [0] }] })).toEqual(['circuit faults[0].col: a whole number 0–6 (the slot just before that column; 6 is after the last)'])
    expect(bad({ circuit: X_CHECK, faults: [{ col: -1, wires: [0] }] })[0]).toMatch(/^circuit faults\[0\]\.col/)
    expect(bad({ circuit: X_CHECK, faults: [{ col: 1.5, wires: [0] }] })[0]).toMatch(/^circuit faults\[0\]\.col/)
    expect(bad({ circuit: X_CHECK, faults: [{ col: 0, wires: [5] }] })).toEqual(['circuit faults[0].wires: one or more wires from 0 to 4'])
    expect(bad({ circuit: X_CHECK, faults: [{ col: 0, wires: [] }] })[0]).toMatch(/^circuit faults\[0\]\.wires/)
    expect(bad({ circuit: X_CHECK, faults: [{ col: 0, wires: [1, 1] }] })).toEqual(['circuit faults[0].wires: each wire once'])
    expect(bad({ circuit: X_CHECK, faults: [{ col: 0, wires: [1] }, { col: 0, wires: [0, 1] }] })).toEqual(['circuit faults[1]: wire 1 already has a marker in the slot before column 0'])
    expect(bad({ circuit: X_CHECK, faults: [{ col: 0, wires: [1], label: 'toolong' }] })).toEqual(['circuit faults[0].label: 1–6 characters'])
    expect(bad({ circuit: X_CHECK, faults: [{ col: 0, wires: [1], label: '' }] })[0]).toMatch(/^circuit faults\[0\]\.label/)
  })
  it('hook: after 0–3 and below the number of leading CNOT columns; the CNOT columns must share a wire', () => {
    expect(bad({ circuit: X_CHECK, hook: { after: 3 } })).toEqual([])
    expect(bad({ circuit: X_CHECK, hook: { after: 4 as never } })).toEqual(['circuit hook.after: 0, 1, 2 or 3 (the CNOT columns done before the fault)'])
    expect(bad({ circuit: X_CHECK, hook: { after: -1 as never } })[0]).toMatch(/^circuit hook\.after/)
    const two: Circuit = { version: 1, qubits: 3, columns: [[cnot(2, 0)], [cnot(2, 1)], [{ op: 'gate', gate: 'H', targets: [2] }]] }
    expect(bad({ circuit: two, hook: { after: 1 } })).toEqual([])
    expect(bad({ circuit: two, hook: { after: 2 } })).toEqual(['circuit hook.after: 2, but the circuit has 2 leading CNOT columns; after must be below that'])
    expect(bad({ circuit: { version: 1, qubits: 1, columns: [[{ op: 'gate', gate: 'H', targets: [0] }]] }, hook: { after: 0 } })).toEqual(['circuit hook: the circuit has no CNOT column to spread a fault through'])
    expect(bad({ circuit: { version: 1, qubits: 4, columns: [[cnot(0, 1)], [cnot(2, 3)]] }, hook: { after: 0 } })).toEqual(['circuit hook: the leading CNOT columns share no wire (the check qubit is the wire every one of them uses)'])
    expect(CIRCUIT_FAULT_LIMITS).toMatchObject({ faults: 24, label: 6, hookMax: 3 })
  })
  it('reaches validateStage like any state', () => {
    expect(validateStage(C({ circuit: X_CHECK, faults: [{ col: 9, wires: [0] }] }))[0]).toMatch(/^circuit faults\[0\]\.col/)
  })
})

describe('circuit B1: the one scene', () => {
  const BOXES: [Mode, number, number, boolean, 'full' | 'top' | 'bottom'][] = [
    ['stage', 506, 785, false, 'full'],
    ['stage', 375, 640, false, 'full'],
    ['stage', 506, 360, false, 'top'],
    ['stage', 320, 300, true, 'full'],
    ['print', 320, 300, false, 'full'],
  ]
  const states: Omit<CircuitStageState, 'kind'>[] = [
    { circuit: X_CHECK, faults: [{ col: 0, wires: [4], label: 'prep' }, { col: 2, wires: [0, 1, 2, 3, 4], label: 'idle' }, { col: 6, wires: [4], label: 'read' }], hook: { after: 1 } },
    { circuit: Z_CHECK, faults: [{ col: 1, wires: [4] }, { col: 3, wires: [2, 4] }], hook: { after: 2 }, upTo: 3 },
    { circuit: X_CHECK, hook: { after: 0 } },
  ]
  it('draws a diamond for every listed wire and the hook with its rings, in every box and mode, with no NaN and nothing outside the box', () => {
    for (const st of states)
      for (const [mode, w, h, bare, slot] of BOXES) {
        const r = R(st)
        const html = draw(r, mode, w, h, bare, slot)
        const where = `${mode} ${w}x${h} ${slot}`
        expect(html, where).not.toMatch(/NaN|Infinity|undefined/)
        const wires = r.faults.reduce((s, f) => s + f.wires.length, 0)
        const faultsGroup = html.split('data-anchor="faults"')[1]?.split('data-anchor="hook"')[0]?.split('data-anchor="cursor"')[0] ?? ''
        expect(faultsGroup.match(/<polygon/g)?.length ?? 0, `${where}: diamonds`).toBe(wires)
        if (r.faults.length) expect(html).toContain('data-anchor="faults"')
        if (r.hook) {
          expect(html).toContain('data-anchor="hook"')
          expect(html.split('data-anchor="hook"')[1].split('data-anchor="cursor"')[0].match(/stroke-dasharray="2 2"/g)?.length, `${where}: rings`).toBe(r.hook.reach.length)
        }
        // every coordinate the new groups write lies inside the box
        for (const group of [faultsGroup, html.split('data-anchor="hook"')[1]?.split('data-anchor="cursor"')[0] ?? ''])
          for (const m of group.matchAll(/(?:\bcx|\bx|\bx1|\bx2)="(-?[\d.]+)"/g)) {
            expect(Number(m[1]), `${where} x`).toBeGreaterThanOrEqual(-1)
            expect(Number(m[1]), `${where} x`).toBeLessThanOrEqual(w + 1)
          }
        for (const group of [faultsGroup, html.split('data-anchor="hook"')[1]?.split('data-anchor="cursor"')[0] ?? ''])
          for (const m of group.matchAll(/(?:\bcy|\by|\by1|\by2)="(-?[\d.]+)"/g)) {
            expect(Number(m[1]), `${where} y`).toBeGreaterThanOrEqual(-1)
            expect(Number(m[1]), `${where} y`).toBeLessThanOrEqual(h + 1)
          }
      }
  })
  it('each marker carries an accessible name and the slot it sits in; markers ahead of the cursor are dimmed with the columns', () => {
    const r = R({ circuit: X_CHECK, faults: [{ col: 0, wires: [4], label: 'prep' }, { col: 5, wires: [0, 4] }], upTo: 2 })
    const html = draw(r, 'stage', 506, 640)
    expect(html).toContain('fault place on c, before column 1 (prep)')
    expect(html).toContain('fault places on d1, c, before column 6')
    expect(html.match(/<g role="img" aria-label="fault place[^"]*" opacity="1"/g)).toHaveLength(1)
    expect(html.match(/<g role="img" aria-label="fault place[^"]*" opacity="0.42"/g)).toHaveLength(1)
  })
  it('the existing pictures are untouched: a circuit with no fault places draws no faults group', () => {
    const html = draw(R({ circuit: X_CHECK }), 'stage', 506, 640)
    expect(html).not.toContain('data-anchor="faults"')
    expect(html).not.toContain('data-anchor="hook"')
  })
  it('the print figure carries the fault readouts as its text lines', () => {
    const html = renderToString(<FigureFor layout={C({ circuit: X_CHECK, faults: [{ col: 0, wires: [4] }], hook: { after: 2 }, shot: 'Q-WIRES' })} number="B1.5" caption="a check circuit" />)
    expect(html).toContain('<title>Fig. B1.5: CIRCUIT · time runs →</title>')
    // the figure is a little taller than a plain circuit's 320 × 200, to hold the extra lines; a plain circuit keeps its size
    const { w, h } = circuitPrintSize(R({ circuit: X_CHECK, faults: [{ col: 0, wires: [4] }], hook: { after: 2 } }))
    expect(html).toContain(`viewBox="0 0 ${w} ${h}"`)
    expect(h).toBeGreaterThan(200)
    expect(circuitPrintSize(R({ circuit: X_CHECK }))).toEqual({ w: 320, h: 200 })
    expect(html).toContain('1 fault place')
    expect(html).toContain('hook after 2: reaches d3, d4')
    expect(html).not.toMatch(/NaN|Infinity|undefined|no print drawing yet/)
    void resolve
  })
})
