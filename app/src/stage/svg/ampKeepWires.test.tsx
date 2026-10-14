/**
 * Stage-code agent S2 (P-Q21-story §9.2, additive): `amplitudes.keep` also accepts a LIST of wires (counted from 0 at the top, as the circuit format counts): the
 * marginal over exactly those wires, labelled by their bits in the order listed. It is how the helper wires below a code's data wires are read. Every chance is the
 * engine's `marginal`; a count keeps working as before.
 */
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { fidelityOf } from '../../content/fidelity'
import type { AmplitudesState } from '../../content/stage'
import { passportOf } from '../../content/stage'
import type { Circuit } from '../../physics/qc/circuit'
import { runCircuit } from '../../physics/qc/circuit'
import { marginal } from '../../physics/qc/measure'
import { interpolate } from '../interp'
import { resolve, validateLayout, validateStage } from '../resolve'
import type { ResolvedAmplitudes } from '../types'
import { AmplitudesScene } from './AmplitudesScene'
import { ampReadouts, resolveAmplitudes, validateAmplitudes } from './amplitudes'
import './kinds'

const amp = (x: Omit<AmplitudesState, 'kind'>): AmplitudesState => ({ kind: 'amplitudes', ...x })
const svg = (node: ReturnType<typeof createElement>) => renderToString(createElement('svg', null, node))

/** The bit-flip code with two helper wires: data q0 q1 q2 encoded from H on q0, an error X on `hit`, then the helpers q3 = q0 ⊕ q1 and q4 = q1 ⊕ q2 by CNOTs. */
const CODE = (hit: number): Circuit => ({
  version: 1,
  qubits: 5,
  columns: [
    [{ op: 'gate', gate: 'H', targets: [0] }],
    [{ op: 'gate', gate: 'X', controls: [0], targets: [1] }],
    [{ op: 'gate', gate: 'X', controls: [0], targets: [2] }],
    [{ op: 'gate', gate: 'X', targets: [hit] }],
    [{ op: 'gate', gate: 'X', controls: [0], targets: [3] }],
    [{ op: 'gate', gate: 'X', controls: [1], targets: [3] }],
    [{ op: 'gate', gate: 'X', controls: [1], targets: [4] }],
    [{ op: 'gate', gate: 'X', controls: [2], targets: [4] }],
  ],
})
const st = (keep: number | number[], hit = 1, circuit = CODE(hit)): AmplitudesState => amp({ state: { circuit, upTo: circuit.columns.length }, mode: 'probability', keep })
const finalState = (c: Circuit) => runCircuit(c).states[runCircuit(c).states.length - 1]

describe('amplitudes keep as a list of wires', () => {
  it('the helper wires [3, 4] read the syndrome: an error on qubit 1 gives 11 with chance 1, on qubit 0 gives 10, on qubit 2 gives 01, and no error gives 00', () => {
    const at = (hit: number | null) => {
      const c = hit === null ? { ...CODE(1), columns: CODE(1).columns.filter((_, i) => i !== 3) } : CODE(hit)
      return resolveAmplitudes(st([3, 4], 1, c), 1)
    }
    for (const [hit, bar] of [[1, 3], [0, 2], [2, 1], [null, 0]] as const) {
      const r = at(hit)
      expect(r.n, `hit ${hit}`).toBe(2)
      expect(r.probs).toHaveLength(4)
      expect(r.probs[bar], `hit ${hit}`).toBeCloseTo(1, 12)
      expect(r.probs.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 12)
    }
  })

  it('every bar is the engine’s marginal over the listed wires, in the order listed (the first listed is the most significant bit): [3, 4] and [4, 3] read the same chances with the labels swapped', () => {
    const c = CODE(0)
    const psi = finalState(c)
    const a = resolveAmplitudes(st([3, 4], 0, c), 1)
    const b = resolveAmplitudes(st([4, 3], 0, c), 1)
    marginal(psi, [3, 4]).forEach((p, k) => expect(a.probs[k]).toBeCloseTo(p, 12))
    marginal(psi, [4, 3]).forEach((p, k) => expect(b.probs[k]).toBeCloseTo(p, 12))
    // 10 on (q3, q4) is 01 on (q4, q3)
    expect(a.probs[2]).toBeCloseTo(1, 12)
    expect(b.probs[1]).toBeCloseTo(1, 12)
    expect(a.keepWires).toEqual([3, 4])
    expect(b.keepWires).toEqual([4, 3])
    expect(a.keep).toBe(2)
  })

  it('a wire in the middle, a single wire and a non-contiguous set work; data wires too', () => {
    const c = CODE(1)
    const psi = finalState(c)
    for (const wires of [[1], [4], [0, 2], [2, 0, 4], [0, 1, 2]]) {
      const r = resolveAmplitudes(st(wires, 1, c), 1)
      expect(r.n, wires.join()).toBe(wires.length)
      marginal(psi, wires).forEach((p, k) => expect(r.probs[k], `${wires.join()}[${k}]`).toBeCloseTo(p, 12))
    }
    // the encoded data wires of an error-free code are 000 or 111, half and half
    const clean = resolveAmplitudes(st([0, 1, 2], 1, { ...CODE(1), columns: CODE(1).columns.filter((_, i) => i !== 3) }), 1)
    expect(clean.probs[0]).toBeCloseTo(0.5, 12)
    expect(clean.probs[7]).toBeCloseTo(0.5, 12)
  })

  it('the count form is unchanged and a list [0, 1] is the same reading as the count 2 (no keepWires key on a count)', () => {
    const c = CODE(1)
    const byCount = resolveAmplitudes(st(2, 1, c), 1)
    const byList = resolveAmplitudes(st([0, 1], 1, c), 1)
    expect(byList.probs).toEqual(byCount.probs)
    expect('keepWires' in byCount).toBe(false)
    expect(byCount.keep).toBe(2)
    expect(byList.keepWires).toEqual([0, 1])
  })

  it('bars are labelled by the listed wires’ bits (two characters for two wires), never the whole register’s', () => {
    const r = resolve(st([3, 4]), 1) as ResolvedAmplitudes
    for (const mode of ['stage', 'print'] as const) {
      const html = svg(createElement(AmplitudesScene, { state: r, mode, width: 340, height: 280 }))
      expect(html).toContain('|11⟩')
      expect(html).not.toContain('|110⟩')
      expect(html).not.toMatch(/NaN|Infinity|undefined/)
    }
  })

  it('the readout names the wires counted from 0, and the tallest bar’s chance', () => {
    const lines = ampReadouts(resolveAmplitudes(st([3, 4]), 1)).map((x) => x.text)
    expect(lines).toContain('wires 3, 4 (from 0)')
    expect(lines.some((t) => /^P\(11\) = 100 %$/.test(t))).toBe(true)
    expect(ampReadouts(resolveAmplitudes(st([4]), 1)).map((x) => x.text)).toContain('wire 4 (from 0)')
    // a count still says "first k wires"
    expect(ampReadouts(resolveAmplitudes(st(2), 1)).map((x) => x.text)).toContain('first 2 wires')
  })

  it('validation: whole, distinct wires of the register counted from 0; fewer than all of them; the same companions as the count', () => {
    expect(validateAmplitudes(st([3, 4]))).toEqual([])
    expect(validateStage(st([3, 4]))).toEqual([])
    expect(validateAmplitudes(st([]))[0]).toMatch(/one or more whole numbers from 0/)
    expect(validateAmplitudes(st([1.5]))[0]).toMatch(/one or more whole numbers from 0/)
    expect(validateAmplitudes(st([-1]))[0]).toMatch(/one or more whole numbers from 0/)
    expect(validateAmplitudes(st([3, 3]))[0]).toMatch(/each wire once/)
    expect(validateAmplitudes(st([3, 5]))[0]).toMatch(/wire 5 is not in a register of 5 wires \(counted from 0: 0 … 4\)/)
    expect(validateAmplitudes(st([0, 1, 2, 3, 4]))[0]).toMatch(/fewer wires than the register's 5/)
    expect(validateAmplitudes(amp({ state: { circuit: CODE(1) }, keep: [3, 4] }))[0]).toMatch(/probability/)
    expect(validateAmplitudes({ ...st([3, 4]), dials: true })[0]).toMatch(/dials/)
    expect(validateAmplitudes({ ...st([3, 4]), sum: [0, 1] })[0]).toMatch(/sum/)
    expect(validateAmplitudes({ ...st([3, 4]), labels: 'index' })[0]).toMatch(/labels/)
    expect(validateAmplitudes(st(0))[0]).toMatch(/whole number of wires/)
  })

  it('a circuit beside it must still read the same circuit and cursor; a split with a wire list validates', () => {
    const c = CODE(1)
    expect(validateLayout({ layout: 'split', top: { kind: 'circuit', circuit: c, upTo: c.columns.length }, bottom: st([3, 4]) })).toEqual([])
    expect(validateLayout({ layout: 'split', top: { kind: 'circuit', circuit: c, upTo: 4 }, bottom: st([3, 4]) })[0]).toMatch(/same circuit/)
  })

  it('interpolation: a list, a count and the whole register are different lists and switch at ½; two equal lists lerp and renormalise', () => {
    const whole = resolveAmplitudes(amp({ state: { circuit: CODE(1) }, mode: 'probability' }), 1)
    const list = resolveAmplitudes(st([3, 4]), 1)
    const count = resolveAmplitudes(st(2), 1)
    expect((interpolate(whole, list, 0.3) as ResolvedAmplitudes).keep).toBeUndefined()
    expect((interpolate(whole, list, 0.7) as ResolvedAmplitudes).keepWires).toEqual([3, 4])
    // [3, 4] and the count 2 keep different wires: no blend between them
    expect((interpolate(count, list, 0.3) as ResolvedAmplitudes).keepWires).toBeUndefined()
    expect((interpolate(count, list, 0.7) as ResolvedAmplitudes).keepWires).toEqual([3, 4])
    const other = resolveAmplitudes(st([3, 4], 0), 1)
    const mid = interpolate(list, other, 0.5) as ResolvedAmplitudes
    expect(mid.keepWires).toEqual([3, 4])
    expect(mid.probs.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 12)
  })

  it('the passport says the wires are chosen, and the drawer is the amplitudes drawer with the keep line; the count’s passport is unchanged', () => {
    const p = passportOf(st([3, 4]), 'qc709')
    expect(p.title).toBe('STATE · chances of chosen wires')
    expect(p.note).toContain('summed over')
    expect(p.fidelityKey).toBe('amplitudes')
    expect(Object.values(fidelityOf('amplitudes', 'qc709')).flat().map((x) => x.id)).toContain('qc-amp-keep-sum')
    expect(passportOf(st(2), 'qc709').title).toBe('STATE · chances of the first wires')
  })
})
