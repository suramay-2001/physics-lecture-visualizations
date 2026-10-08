/**
 * `amplitudes` (P-F1-story §9.2 S2; P-Q1-story §9.2 S5): content names a state and the engine makes every bar; the
 * fields F1 needs (dials, sum, labels) and the three modes; the stage's caps; interpolation that turns a one-qubit
 * direction on the sphere and renormalises otherwise; one scene in two modes.
 */
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { AmplitudesState } from '../../content/stage'
import { fidelityOf } from '../../content/fidelity'
import '../../content/qc709/fidelity'
import { KIND_RENDER, passportOf } from '../../content/stage'
import { abs2, add } from '../../physics/complex'
import type { Circuit } from '../../physics/qc/circuit'
import { runCircuit } from '../../physics/qc/circuit'
import { bell, ket, meanAmplitude } from '../../physics/qc/state'
import { KET } from '../../physics/spin'
import { interpolate } from '../interp'
import { resolve, validateLayout } from '../resolve'
import type { ResolvedAmplitudes } from '../types'
import { AmplitudesScene } from './AmplitudesScene'
import { ampReadouts, barLabel, resolveAmplitudes, validateAmplitudes } from './amplitudes'
import './kinds'

const amp = (x: Omit<AmplitudesState, 'kind'>): AmplitudesState => ({ kind: 'amplitudes', ...x })
const gap = (a: { re: number; im: number }[], b: { re: number; im: number }[]) => Math.max(...a.map((x, k) => Math.hypot(x.re - b[k].re, x.im - b[k].im)))
const H3: Circuit = {
  version: 1,
  qubits: 3,
  columns: [
    [
      { op: 'gate', gate: 'H', targets: [0] },
      { op: 'gate', gate: 'H', targets: [1] },
      { op: 'gate', gate: 'H', targets: [2] },
    ],
    [{ op: 'oracle', mode: 'phase', table: [0, 0, 0, 0, 0, 1, 0, 0], inputs: [0, 1, 2] }],
  ],
}

describe('amplitudes: the state comes from the engine', () => {
  it('is an SVG kind; ket, bell, a 448 direction and a circuit cursor are the four sources', () => {
    expect(KIND_RENDER.amplitudes).toBe('svg')
    expect(gap(resolveAmplitudes(amp({ state: { ket: '01' } }), 1).amps, ket('01'))).toBe(0)
    expect(gap(resolveAmplitudes(amp({ state: { bell: 'Phi+' } }), 1).amps, bell('00+11'))).toBe(0)
    const y = resolveAmplitudes(amp({ state: { dir: '+y' } }), 1)
    expect(gap(y.amps, KET['+y'])).toBe(0)
    expect(y.phases[1]).toBeCloseTo(Math.PI / 2, 15)
    const c1 = resolveAmplitudes(amp({ state: { circuit: H3, upTo: 1 } }), 1)
    expect(gap(c1.amps, runCircuit(H3).states[1])).toBe(0)
    expect(c1.upTo).toBe(1)
    const c2 = resolveAmplitudes(amp({ state: { circuit: H3, upTo: { from: 1, to: 2 } } }), 1)
    expect(c2.amps[5].re).toBeLessThan(0)
    expect(resolveAmplitudes(amp({ state: { circuit: H3 } }), 0).upTo).toBe(2) // default: after the last column
  })
  it('sizes, phases, chances and the mean by complex.ts and qc/state.ts; the sum of two bars by add', () => {
    const r = resolveAmplitudes(amp({ state: { dir: { thetaDeg: 90, phiDeg: 60 } }, sum: [0, 1] }), 1)
    expect(r.probs.reduce((a, p) => a + p, 0)).toBeCloseTo(1, 15)
    const total = add({ re: r.amps[0].re, im: r.amps[0].im }, { re: r.amps[1].re, im: r.amps[1].im })
    expect(r.sum!.size2).toBe(abs2(total))
    expect(r.sum!.size2).toBeCloseTo(1.5, 14) // |1 + e^{iπ/3}|² / 2
    const m = resolveAmplitudes(amp({ state: { circuit: H3 }, mode: 'signed' }), 1)
    expect(m.mean).toEqual(meanAmplitude(runCircuit(H3).states[2]))
  })
  it('labels: bits |00⟩ …, or for one qubit |0⟩ = |+z⟩ and |1⟩ = |−z⟩ (the 709 lock)', () => {
    expect(barLabel(2, 2, 'bits')).toBe('|10⟩')
    expect([barLabel(0, 1, 'spin'), barLabel(1, 1, 'spin')]).toEqual(['|0⟩ = |+z⟩', '|1⟩ = |−z⟩'])
  })
  it('modes change the passport; readouts name the nonzero bars (chances in probability mode)', () => {
    expect(passportOf(amp({ state: { ket: '0' } })).title).toBe('STATE · amplitudes')
    expect(passportOf(amp({ state: { ket: '0' }, mode: 'probability' })).title).toBe('STATE · chances')
    expect(passportOf(amp({ state: { ket: '0' }, mode: 'signed' })).title).toBe('STATE · real amplitudes')
    expect(ampReadouts(resolveAmplitudes(amp({ state: { bell: '00+11' }, mode: 'probability' }), 1)).map((x) => x.text)).toEqual(['P(00) = 50 %', 'P(11) = 50 %'])
    expect(ampReadouts(resolveAmplitudes(amp({ state: { dir: '+y' }, labels: 'spin' }), 1)).map((x) => x.text)).toEqual(['|+z⟩: 0.707', '|−z⟩: 0.707i'])
    const big = ampReadouts(resolveAmplitudes(amp({ state: { ket: '+0-1+' } }), 1)).map((x) => x.text)
    expect(big.at(-1)).toBe('8 of 32 nonzero')
  })
})

describe('amplitudes: validation (the stage caps n ≤ 5)', () => {
  it('rejects bad sources and caps', () => {
    expect(validateAmplitudes(amp({ state: { ket: '0q' } }))[0]).toMatch(/amplitudes ket: .*not one of/)
    expect(validateAmplitudes(amp({ state: { ket: '000000' } }))).toEqual(['amplitudes ket: the stage draws at most 5 qubits'])
    expect(validateAmplitudes(amp({ state: { bell: '00+00' } }))[0]).toMatch(/amplitudes bell/)
    expect(validateAmplitudes(amp({ state: { dir: '+w' as never } }))).toEqual(['amplitudes dir: a named ket (±x, ±y, ±z) or finite Bloch angles'])
    expect(validateAmplitudes(amp({ state: {} as never }))).toEqual(['amplitudes state: exactly one of ket, bell, dir, circuit'])
  })
  it('fields: spin labels one qubit; dials up to 8 bars; sum two different bars; signed needs real amplitudes', () => {
    expect(validateAmplitudes(amp({ state: { ket: '00' }, labels: 'spin' }))[0]).toMatch(/one qubit only/)
    expect(validateAmplitudes(amp({ state: { ket: '0000' }, dials: true }))[0]).toMatch(/at most 8 bars/)
    expect(validateAmplitudes(amp({ state: { ket: '000' }, dials: true }))).toEqual([])
    expect(validateAmplitudes(amp({ state: { ket: '0' }, sum: [0, 0] }))[0]).toMatch(/two different bars/)
    expect(validateAmplitudes(amp({ state: { ket: '0' }, sum: [0, 2] }))[0]).toMatch(/two different bars/)
    expect(validateAmplitudes(amp({ state: { dir: '+y' }, mode: 'signed' }))[0]).toMatch(/must be real/)
    expect(validateAmplitudes(amp({ state: { dir: '+x' }, mode: 'signed' }))).toEqual([])
    expect(validateAmplitudes(amp({ state: { ket: '0' }, mode: 'bogus' as never }))[0]).toMatch(/amplitudes mode/)
  })
  it('circuits: the circuit validator, at most 5 qubits and 24 columns, a whole cursor, a run that can be drawn', () => {
    expect(validateAmplitudes(amp({ state: { circuit: { ...H3, qubits: 0 } } }))[0]).toMatch(/circuit.qubits/)
    const six: Circuit = { version: 1, qubits: 6, columns: [] }
    expect(validateAmplitudes(amp({ state: { circuit: six } }))).toEqual(['amplitudes circuit: the stage draws at most 5 qubits'])
    const long: Circuit = { version: 1, qubits: 1, columns: Array.from({ length: 25 }, () => [{ op: 'gate' as const, gate: 'X' as const, targets: [0] }]) }
    expect(validateAmplitudes(amp({ state: { circuit: long } }))).toEqual(['amplitudes circuit: the stage draws at most 24 columns'])
    expect(validateAmplitudes(amp({ state: { circuit: H3, upTo: 3 } }))[0]).toMatch(/whole column 0–2/)
    expect(validateAmplitudes(amp({ state: { circuit: H3, upTo: 1.5 } }))[0]).toMatch(/whole column/)
    const mid: Circuit = { version: 1, qubits: 1, clbits: 1, columns: [[{ op: 'measure', qubit: 0, bit: 0 }], [{ op: 'gate', gate: 'H', targets: [0] }]] }
    expect(validateAmplitudes(amp({ state: { circuit: mid } }))[0]).toMatch(/mid-circuit measurement/)
    expect(validateAmplitudes(amp({ state: { circuit: { ...mid, init: '+' }, outcomes: '0' } }))).toEqual([])
  })
})

describe('amplitudes: interpolation', () => {
  it('a one-qubit direction turns on the sphere: the phase lerps and the chances stay ½ on the equator', () => {
    const A = resolveAmplitudes(amp({ state: { dir: '+x' } }), 1)
    const B = resolveAmplitudes(amp({ state: { dir: '-x' } }), 0)
    const mid = interpolate(A, B, 0.5) as ResolvedAmplitudes
    expect(mid.phases[1]).toBeCloseTo(Math.PI / 2, 12)
    expect(mid.probs[0]).toBeCloseTo(0.5, 14)
  })
  it('a register: the vectors lerp and renormalise (chances add to 1); a different register switches at ½', () => {
    const A = resolveAmplitudes(amp({ state: { ket: '00' } }), 1)
    const B = resolveAmplitudes(amp({ state: { bell: '00+11' } }), 0)
    const mid = interpolate(A, B, 0.5) as ResolvedAmplitudes
    expect(mid.probs.reduce((a, p) => a + p, 0)).toBeCloseTo(1, 14)
    expect(mid.probs[3]).toBeGreaterThan(0)
    const C = resolveAmplitudes(amp({ state: { ket: '0' } }), 0)
    expect((interpolate(A, C, 0.4) as ResolvedAmplitudes).n).toBe(2)
    expect((interpolate(A, C, 0.6) as ResolvedAmplitudes).n).toBe(1)
  })
  it('ψ → −ψ passes through zero: the in-between frame is one end, never an undrawable vector', () => {
    const A = resolveAmplitudes(amp({ state: { ket: '0' } }), 1)
    const B = { ...A, amps: A.amps.map((a) => ({ re: -a.re, im: -a.im })) }
    const mid = interpolate(A, B, 0.5) as ResolvedAmplitudes
    expect(mid.probs.reduce((a, p) => a + p, 0)).toBeCloseTo(1, 14)
  })
})

describe('amplitudes: one scene, two modes', () => {
  it('draws 2 to 32 bars in stage and print mode with no NaN; resolve and validateLayout reach the kind', () => {
    for (const st of [amp({ state: { dir: '+y' }, labels: 'spin', dials: true }), amp({ state: { dir: { thetaDeg: 90, phiDeg: 45 } }, sum: [0, 1], dials: true }), amp({ state: { ket: '+0-1+' } }), amp({ state: { circuit: H3 }, mode: 'signed' }), amp({ state: { bell: '01-10' }, mode: 'probability' })]) {
      expect(validateLayout(st), JSON.stringify(st.state)).toEqual([])
      const r = resolve(st, 1) as ResolvedAmplitudes
      for (const mode of ['stage', 'print'] as const) {
        const html = renderToString(createElement('svg', null, createElement(AmplitudesScene, { state: r, mode, width: 320, height: 240 })))
        expect(html, mode).not.toMatch(/NaN|Infinity|undefined/)
        expect((html.match(/data-anchor="bar-/g) ?? []).length).toBe(r.amps.length)
      }
    }
  })
})

describe('amplitudes: inBasis "bell" — a two-qubit state read as overlaps with Φ+, Φ−, Ψ+, Ψ− (numpy: B.conj().T @ psi)', () => {
  const R = Math.SQRT1_2
  const bars = (state: AmplitudesState['state'], rest: Partial<AmplitudesState> = {}) => resolveAmplitudes(amp({ state, inBasis: 'bell', ...rest }), 1)
  const want = (state: AmplitudesState['state'], v: number[]) => {
    const r = bars(state)
    r.amps.forEach((a, k) => {
      expect(a.re, `${JSON.stringify(state)} bar ${k}`).toBeCloseTo(v[k], 12)
      expect(a.im).toBeCloseTo(0, 12)
    })
  }

  it('|00⟩ has 1/√2 on Φ+ and on Φ− and nothing on Ψ±; |11⟩ the same with the Φ− sign flipped', () => {
    want({ ket: '00' }, [R, R, 0, 0])
    want({ ket: '11' }, [R, -R, 0, 0])
  })

  it('each Bell state is one full bar, in the order Φ+, Φ−, Ψ+, Ψ−', () => {
    want({ bell: 'Phi+' }, [1, 0, 0, 0])
    want({ bell: 'Phi-' }, [0, 1, 0, 0])
    want({ bell: 'Psi+' }, [0, 0, 1, 0])
    want({ bell: 'Psi-' }, [0, 0, 0, 1])
  })

  it('|+⟩|−⟩ has 0.707 on Φ− and −0.707 on the singlet (Q6’s HW2 P1(c) reading); |+⟩|0⟩ is (½, ½, ½, −½)', () => {
    want({ ket: '+-' }, [0, R, 0, -R])
    want({ ket: '+0' }, [0.5, 0.5, 0.5, -0.5])
  })

  it('the chances add to 1 in the Bell basis too (unitary), for a product state and for a circuit’s state', () => {
    const bellCircuit: Circuit = { version: 1, qubits: 2, columns: [[{ op: 'gate', gate: 'H', targets: [0] }], [{ op: 'gate', gate: 'X', targets: [1], controls: [0] }]] }
    for (const state of [{ ket: '+-' }, { ket: '1+' }, { circuit: bellCircuit }] as AmplitudesState['state'][]) {
      const r = bars(state)
      expect(r.probs.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 12)
    }
    // the circuit makes Φ+, so it is one bar
    expect(bars({ circuit: bellCircuit }).probs[0]).toBeCloseTo(1, 12)
  })

  it('a global phase moves the Bell bars’ phases together and no length; the computational reading is untouched without inBasis', () => {
    const r = bars({ ket: '00' }, { globalPhaseDeg: 90 })
    expect(r.sizes[0]).toBeCloseTo(R, 12)
    expect(r.phases[0]).toBeCloseTo(Math.PI / 2, 12)
    expect(resolveAmplitudes(amp({ state: { ket: '00' } }), 1).amps.map((a) => a.re)).toEqual([1, 0, 0, 0])
    expect(resolveAmplitudes(amp({ state: { ket: '00' } }), 1).basis).toBe('computational')
  })

  it('labels, readouts and passports name the Bell states', () => {
    expect([0, 1, 2, 3].map((k) => barLabel(k, 2, 'bits', 'bell'))).toEqual(['|Φ+⟩', '|Φ−⟩', '|Ψ+⟩', '|Ψ−⟩'])
    expect(barLabel(1, 2, 'bits')).toBe('|01⟩')
    const texts = ampReadouts(bars({ ket: '+-' })).map((x) => x.text)
    expect(texts.some((t) => t.startsWith('|Φ−⟩: '))).toBe(true)
    expect(texts.some((t) => t.startsWith('|Ψ−⟩: '))).toBe(true)
    const chances = ampReadouts(bars({ ket: '00' }, { mode: 'probability' })).map((x) => x.text)
    expect(chances).toContain('P(Φ+) = 50 %')
    expect(chances).toContain('P(Φ−) = 50 %')
    expect(passportOf(amp({ state: { ket: '00' }, inBasis: 'bell' })).axes).toEqual(['Bell states'])
    expect(passportOf(amp({ state: { ket: '00' }, inBasis: 'bell' })).title).toBe('STATE · Bell-basis amplitudes')
    expect(passportOf(amp({ state: { ket: '00' }, inBasis: 'bell', mode: 'probability' })).title).toBe('STATE · Bell-basis chances')
    expect(passportOf(amp({ state: { ket: '00' } })).axes).toEqual(['basis states'])
  })

  it('fidelity: the Bell drawer has its own entries and the computational drawer does not gain them', () => {
    const key = passportOf(amp({ state: { ket: '00' }, inBasis: 'bell' })).fidelityKey
    expect(key).toBe('amplitudes-bell')
    const ids = (k: Parameters<typeof fidelityOf>[0]) => [...fidelityOf(k, 'qc709').exact, ...fidelityOf(k, 'qc709').schematic, ...fidelityOf(k, 'qc709').misleading].map((x) => x.id)
    expect(ids('amplitudes-bell')).toContain('qc-amp-bell-engine')
    expect(ids('amplitudes-bell')).toContain('qc-amp-bell-same-state')
    expect(ids('amplitudes')).not.toContain('qc-amp-bell-engine')
  })

  it('validation: two qubits only; not with signed or sum; only "bell"', () => {
    expect(validateAmplitudes(amp({ state: { ket: '00' }, inBasis: 'bell' }))).toEqual([])
    expect(validateAmplitudes(amp({ state: { bell: 'Psi-' }, inBasis: 'bell', mode: 'probability', dials: true }))).toEqual([])
    expect(validateAmplitudes(amp({ state: { ket: '0' }, inBasis: 'bell' }))[0]).toMatch(/two qubits only/)
    expect(validateAmplitudes(amp({ state: { ket: '000' }, inBasis: 'bell' }))[0]).toMatch(/two qubits only/)
    expect(validateAmplitudes(amp({ state: { bell: 'Phi+' }, inBasis: 'bell', mode: 'signed' }))[0]).toMatch(/signed/)
    expect(validateAmplitudes(amp({ state: { bell: 'Phi+' }, inBasis: 'bell', sum: [0, 1] }))[0]).toMatch(/sum/)
    expect(validateAmplitudes(amp({ state: { bell: 'Phi+' }, inBasis: 'computational' as 'bell' }))[0]).toMatch(/inBasis/)
  })

  it('interpolation: the same basis lerps the Bell coefficients and renormalises; different bases switch at ½', () => {
    const a = bars({ ket: '00' })
    const b = bars({ ket: '11' })
    const mid = interpolate(a, b, 0.5) as ResolvedAmplitudes
    expect(mid.basis).toBe('bell')
    expect(mid.amps[0].re).toBeCloseTo(1, 12) // |00⟩ and |11⟩ half-way, renormalised, is Φ+ itself
    expect(mid.probs.reduce((x, y) => x + y, 0)).toBeCloseTo(1, 12)
    const comp = resolveAmplitudes(amp({ state: { ket: '00' } }), 1)
    expect((interpolate(comp, b, 0.3) as ResolvedAmplitudes).basis).toBe('computational')
    expect((interpolate(comp, b, 0.7) as ResolvedAmplitudes).basis).toBe('bell')
  })

  it('one scene, two modes: four bars, Bell labels, no NaN, in stage and print', () => {
    const st = amp({ state: { ket: '+-' }, inBasis: 'bell', dials: true })
    expect(validateLayout(st)).toEqual([])
    const r = resolve(st, 1) as ResolvedAmplitudes
    for (const mode of ['stage', 'print'] as const) {
      const html = renderToString(createElement('svg', null, createElement(AmplitudesScene, { state: r, mode, width: 320, height: 240 })))
      expect(html, mode).not.toMatch(/NaN|Infinity|undefined/)
      expect((html.match(/data-anchor="bar-/g) ?? []).length).toBe(4)
      expect(html).toContain('Φ')
      expect(html).toContain('Ψ')
    }
  })
})
