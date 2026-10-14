/**
 * Stage-code agent S4 (P-Q21-story §9.2, P-Q22-story §9.2; no new field): the circuit and tableau pictures of the error-correction chapters, drawn by the existing
 * kinds. The screenshot pass (the Q0 demo unit `q0-demo-ec`: classically conditioned X columns, the Rx error label, 5 wires × 11 columns, a tableau whose `state` is a
 * 3-qubit circuit, a CNOT product grid, the tableau split) found four defects; these tests pin their fixes and check each picture against the engine:
 *   - a gate label wider than its box ("Ry(106°)") ran out of a narrow column over the wire's starting ket: it is written on two lines, name over angle
 *   - the classical condition "if c0,c1 = 10" of the last column ran under the cursor line and off the figure: it hangs left of the gate's edge, and in a narrow column
 *     it is written "c0c1=10"
 *   - a meter's bit name under it fell on the next wire when the rows are close (print, five wires): it sits beside the meter then
 *   - the tableau's "the state gives" column left a row blank when the state is not an eigenstate of it: it reads "—"
 */
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { CircuitStageState, MatrixState } from '../../content/stage'
import { CIRCUIT_LIMITS, runCircuit, validateCircuit, type Circuit } from '../../physics/qc/circuit'
import { marginal } from '../../physics/qc/measure'
import { resolve, validateLayout, validateStage } from '../resolve'
import type { ResolvedCircuit, ResolvedMatrix } from '../types'
import { CircuitScene } from './CircuitScene'
import { MatrixScene } from './MatrixScene'
import { glyphOf } from './circuit'
import './kinds'

const THETA = 2 * Math.acos(0.6)
const enc = (): Circuit['columns'] => [
  [{ op: 'gate', gate: 'Ry', targets: [0], params: [THETA] }],
  [{ op: 'gate', gate: 'X', controls: [0], targets: [1] }],
  [{ op: 'gate', gate: 'X', controls: [0], targets: [2] }],
]
const parity = (): Circuit['columns'] => [
  [{ op: 'gate', gate: 'X', controls: [0], targets: [3] }],
  [{ op: 'gate', gate: 'X', controls: [1], targets: [3] }],
  [{ op: 'gate', gate: 'X', controls: [1], targets: [4] }],
  [{ op: 'gate', gate: 'X', controls: [2], targets: [4] }],
]
const read = (): Circuit['columns'][number] => [{ op: 'measure', qubit: 3, bit: 0 }, { op: 'measure', qubit: 4, bit: 1 }]
const BF = (error: 'none' | 'X2' | 'rx60'): Circuit => ({
  version: 1,
  qubits: 5,
  clbits: 2,
  columns: [
    ...enc(),
    ...(error === 'none' ? [] : [[error === 'X2' ? { op: 'gate' as const, gate: 'X' as const, targets: [1] } : { op: 'gate' as const, gate: 'Rx' as const, targets: [1], params: [Math.PI / 3] }]]),
    ...parity(),
    read(),
    [
      { op: 'gate', gate: 'X', targets: [0], cond: { bits: [0, 1], equals: '10' } },
      { op: 'gate', gate: 'X', targets: [1], cond: { bits: [0, 1], equals: '11' } },
      { op: 'gate', gate: 'X', targets: [2], cond: { bits: [0, 1], equals: '01' } },
    ],
  ],
})
const H3 = (): Circuit['columns'][number] => [0, 1, 2].map((q) => ({ op: 'gate' as const, gate: 'H' as const, targets: [q] }))
const PF: Circuit = { version: 1, qubits: 5, clbits: 2, columns: [...enc(), H3(), [{ op: 'gate', gate: 'Z', targets: [0] }], H3(), ...parity(), read()] }
const ENC3: Circuit = { version: 1, qubits: 3, columns: enc() }

const circ = (circuit: Circuit, upTo: number, outcomes?: string): CircuitStageState => ({ kind: 'circuit', circuit, upTo, outcomes, shot: 'Q-WIRES' })
const rc = (st: CircuitStageState) => resolve(st, 1) as ResolvedCircuit
const draw = (r: ResolvedCircuit, mode: 'stage' | 'print', w: number, h: number) =>
  renderToString(createElement('svg', { viewBox: `0 0 ${w} ${h}` }, createElement(CircuitScene, { state: r, mode, width: w, height: h })))
const strip = (html: string) => html.replace(/<!-- -->/g, '')

describe('S4: the plans’ circuits are valid circuits and the engine agrees with the pictures', () => {
  it('C_BF(X2): 5 wires, 10 columns, three conditioned X gates; the helpers read 11 and the fix restores a|000⟩ + b|111⟩ (0.6 and 0.8)', () => {
    const c = BF('X2')
    expect(validateCircuit(c).ok).toBe(true)
    expect(c.qubits).toBe(5)
    expect(c.columns.length).toBe(10)
    const run = runCircuit(c, { outcomes: '11' })
    const end = run.states[run.states.length - 1]
    expect(end[0b00011].re).toBeCloseTo(0.6, 12)
    expect(end[0b11111].re).toBeCloseTo(0.8, 12)
    // before the readout the helpers read 11 with chance 1 (a flip on the middle qubit lights both)
    expect(marginal(run.states[8], [3, 4])[3]).toBeCloseTo(1, 12)
    const html = strip(draw(rc(circ(c, 10, '11')), 'stage', 506, 785))
    expect(html.match(/if c0,c1 = \d\d|c0c1=\d\d/g)?.length).toBe(3)
  })
  it('C_BF(rx60): the error is Rx(60°) on the middle qubit, labelled with its angle; both helpers read 1 with chance sin²30° = ¼', () => {
    const c = BF('rx60')
    expect(validateCircuit(c).ok).toBe(true)
    const g = glyphOf(c.columns[3][0])
    expect(g.label).toBe('Rx(60°)')
    const run = runCircuit(c, { outcomes: '11' })
    expect(marginal(run.states[8], [3, 4])[3]).toBeCloseTo(0.25, 12)
    expect(marginal(run.states[8], [3, 4])[0]).toBeCloseTo(0.75, 12)
  })
  it('C_PF: 5 wires × 11 columns is inside the circuit limits and validates; a Z error between the Hadamards reads the bit-flip syndrome 10', () => {
    expect(validateCircuit(PF).ok).toBe(true)
    expect(PF.columns.length).toBe(11)
    expect(PF.qubits).toBeLessThanOrEqual(CIRCUIT_LIMITS.qubits)
    const run = runCircuit(PF, { outcomes: '10' })
    expect(marginal(run.states[10], [3, 4])[0b10]).toBeCloseTo(1, 12)
  })
  it('every picture validates through the shared entry points, alone and in the circuit + amplitudes split of the plan', () => {
    for (const st of [circ(BF('X2'), 10, '11'), circ(BF('rx60'), 4, '11'), circ(PF, 11, '10'), circ(ENC3, 3), circ(BF('none'), 9, '00')]) expect(validateStage(st)).toEqual([])
    const top = circ(BF('X2'), 10, '11')
    const bottom = { kind: 'amplitudes' as const, state: { circuit: BF('X2'), upTo: 10, outcomes: '11' }, mode: 'amplitude' as const, shot: 'A-BARS' as const }
    expect(validateLayout({ layout: 'split', top, bottom })).toEqual([])
    expect(validateLayout({ layout: 'split', top: { ...top, upTo: 9 }, bottom })[0]).toMatch(/same circuit/)
  })
})

describe('S4: a gate label that does not fit its box is written on two lines, never over the starting ket', () => {
  it('Ry(106°) in a narrow column: the name and the angle are two lines inside the box; in a wide column it is one line', () => {
    const narrow = strip(draw(rc(circ(BF('X2'), 10, '11')), 'stage', 506, 785))
    expect(narrow).not.toContain('>Ry(106°)<')
    expect(narrow).toContain('>Ry<')
    expect(narrow).toContain('>106°<')
    const wide = strip(draw(rc(circ(ENC3, 3)), 'stage', 560, 460))
    expect(wide).toContain('>Ry(106°)<')
    expect(wide).not.toContain('>106°<')
  })
  it('the box holds its label: the two lines are at most as wide as the box, in the print figure too', () => {
    for (const [mode, w, h] of [['stage', 506, 785], ['print', 320, 200]] as const) {
      const r = rc(circ(BF('rx60'), 4, '11'))
      const html = strip(draw(r, mode, w, h))
      expect(html, `${mode}`).not.toMatch(/NaN|Infinity|undefined/)
      expect(html).toContain('>Rx<')
      expect(html).toContain('>60°<')
    }
  })
  it('a label with no parenthesis that is too long shrinks to fit; a short one is unchanged', () => {
    const c: Circuit = { version: 1, qubits: 1, columns: Array.from({ length: 12 }, (_, i) => [{ op: 'gate' as const, gate: 'X' as const, targets: [0], label: i === 3 ? 'VERYLONGNAME' : 'U' }]) }
    const html = strip(draw(rc(circ(c, 12)), 'print', 320, 200))
    expect(html).toMatch(/style="font-size:[0-9.]+px"[^>]*>VERYLONGNAME</)
    expect(html).toContain('>U<')
  })
})

describe('S4: the classical condition stays inside the circuit and clear of the cursor line', () => {
  it('on the last column it hangs left of the gate (text-anchor end); in a narrow column it reads c0c1=10, in a wide one "if c0,c1 = 10"', () => {
    const narrow = strip(draw(rc(circ(BF('X2'), 10, '11')), 'stage', 506, 785))
    expect(narrow.match(/text-anchor="end"[^>]*>c0c1=1[01]</g)?.length ?? 0).toBeGreaterThanOrEqual(0)
    for (const t of ['c0c1=10', 'c0c1=11', 'c0c1=01']) expect(narrow).toContain(`>${t}<`)
    expect(narrow).not.toContain('if c0,c1')
    // every condition on the last column is anchored at its end, inside the span
    const anchors = [...narrow.matchAll(/<text[^>]*text-anchor="(\w+)"[^>]*>c0c1=\d\d</g)].map((m) => m[1])
    expect(anchors).toEqual(['end', 'end', 'end'])
    // two columns of room: the full sentence, centred
    const c: Circuit = {
      version: 1,
      qubits: 2,
      clbits: 1,
      columns: [[{ op: 'measure', qubit: 0, bit: 0 }], [{ op: 'gate', gate: 'X', targets: [1], cond: { bits: [0], equals: '1' } }], [{ op: 'gate', gate: 'H', targets: [1] }]],
    }
    const wide = strip(draw(rc(circ(c, 3, '1')), 'stage', 560, 300))
    expect(wide).toContain('>if c0 = 1<')
    expect(wide).toMatch(/text-anchor="middle"[^>]*>if c0 = 1</)
  })
  it('the glyph still carries the full sentence (the resolved state is unchanged)', () => {
    expect(glyphOf({ op: 'gate', gate: 'X', targets: [0], cond: { bits: [0, 1], equals: '10' } }).cond).toBe('if c0,c1 = 10')
  })
})

describe('S4: a meter’s bit name sits under it when the rows have room, beside it when they are close', () => {
  const meterLabelY = (html: string) => {
    const m = /<g[^>]*data-anchor="measure"[\s\S]*?<text x="([\d.]+)" y="([\d.]+)"[^>]*>c0</.exec(html)
    return m ? [Number(m[1]), Number(m[2])] : null
  }
  const meterBox = (html: string) => {
    const m = /<g[^>]*data-anchor="measure"[\s\S]*?<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)"/.exec(html)
    return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null
  }
  it('stage: under the meter (text below the box); print at 5 wires: beside it (text level with the box, to its right)', () => {
    const stage = strip(draw(rc(circ(BF('X2'), 10, '11')), 'stage', 506, 785))
    const [bx, by, bw] = meterBox(stage)!
    const [lx, ly] = meterLabelY(stage)!
    expect(ly).toBeGreaterThan(by + bw) // below the box
    expect(lx).toBeLessThan(bx + bw) // centred under it
    const print = strip(draw(rc(circ(BF('X2'), 10, '11')), 'print', 320, 200))
    const [px, py, pw] = meterBox(print)!
    const [qx, qy] = meterLabelY(print)!
    expect(qx).toBeGreaterThan(px + pw) // to the right of the box
    expect(qy).toBeLessThan(py + pw) // level with it, not on the next wire
  })
})

describe('S4: the cursor’s label clears the figure’s own text lines', () => {
  it('print, cursor mid-circuit: "after 4" sits at least 12 px below the last text line (they overlapped before)', () => {
    const html = strip(draw(rc(circ(BF('rx60'), 4, '11')), 'print', 320, 200))
    const line = [...html.matchAll(/<text x="8" y="([\d.]+)"[^>]*>after column/g)].map((m) => Number(m[1]))
    const cursor = [...html.matchAll(/<text x="[\d.]+" y="([\d.]+)"[^>]*>after 4</g)].map((m) => Number(m[1]))
    expect(line).toHaveLength(1)
    expect(cursor).toHaveLength(1)
    expect(cursor[0] - line[0]).toBeGreaterThanOrEqual(12)
  })
})

describe('S4: the tableau of a state that is not an eigenstate of a row says so', () => {
  const tab = (rows: string[], circuit: Circuit, upTo: number): MatrixState => ({ kind: 'matrix', tableau: rows, state: { circuit, upTo }, shot: 'M-GRID' })
  it('the encoded state is a +1 eigenstate of ZZI and IZZ and of neither X-type row: those two read +1 and XXX reads “—” (the engine’s eigenvalue is null)', () => {
    const r = resolve(tab(['ZZI', 'IZZ', 'XXX'], ENC3, 3), 1) as ResolvedMatrix
    expect(r.view).toBe('tableau')
    const rows = (r as Extract<ResolvedMatrix, { view: 'tableau' }>).rows
    expect(rows.map((x) => x.eigen)).toEqual([1, 1, null])
    for (const mode of ['stage', 'print'] as const) {
      const html = strip(renderToString(createElement('svg', null, createElement(MatrixScene, { state: r, mode, width: 506, height: 600 }))))
      expect(html, mode).not.toMatch(/NaN|Infinity|undefined/)
      if (mode === 'stage') {
        expect(html).toContain('the state gives')
        expect(html.match(/>\+1</g)?.length).toBe(2)
        expect(html.match(/>—</g)?.length).toBe(1)
      }
    }
  })
  it('the CNOT product grid is X ⊗ X (CNOT · (X ⊗ I) · CNOT) and the tableau split validates with the circuit above it', () => {
    const st: MatrixState = { kind: 'matrix', source: { product: [{ gate: { name: 'CNOT' } }, { pauli: 'XI' }, { gate: { name: 'CNOT' } }] }, labels: 'kets', values: 'exact', shot: 'M-GRID' }
    expect(validateStage(st)).toEqual([])
    const r = resolve(st, 1) as ResolvedMatrix
    const cells = (r as Extract<ResolvedMatrix, { view: 'grid' }>).cells
    const want = [[0, 0, 0, 1], [0, 0, 1, 0], [0, 1, 0, 0], [1, 0, 0, 0]]
    cells.forEach((row, i) => row.forEach((z, j) => expect(z.re, `[${i}][${j}]`).toBeCloseTo(want[i][j], 12)))
    expect(validateLayout({ layout: 'split', top: circ(ENC3, 3), bottom: tab(['ZZI', 'IZZ', 'XXX'], ENC3, 3) })).toEqual([])
  })
})
