/**
 * `two-qubit` (P-709-remap §6.1): two reduced Bloch balls (A, B) plus a 3×3 ⟨σᵢ⊗σⱼ⟩ correlation grid. Content names a
 * ket / cos-sin family / ρ / reduce source; the engine makes every reduced vector, grid cell, trace and entropy.
 */
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { AmpSource, TwoQubitSource, TwoQubitState } from '../../content/stage'
import { KIND_RENDER, passportOf } from '../../content/stage'
import { interpolate } from '../interp'
import { resolve, validateLayout } from '../resolve'
import type { ResolvedTwoQubit } from '../types'
import { TwoQubitScene } from './TwoQubitScene'
import { interpTwoQubitStage, resolveTwoQubitStage, twoQubitReadouts, validateTwoQubitStage } from './twoQubit'
import './kinds'

const tq = (source: TwoQubitSource, rest: Partial<Omit<TwoQubitState, 'kind' | 'source'>> = {}): TwoQubitState => ({ kind: 'two-qubit', source, ...rest })
const near = (x: number, y: number, eps = 1e-9) => Math.abs(x - y) < eps
const vecNear = (a: readonly number[], b: readonly number[], eps = 1e-9) => a.every((x, i) => near(x, b[i], eps))

describe('two-qubit: every number comes from the engine', () => {
  it('is an SVG kind', () => {
    expect(KIND_RENDER['two-qubit']).toBe('svg')
  })

  it('|00⟩: full arrows (both +z) and a zero grid off T_zz = 1', () => {
    const r = resolveTwoQubitStage(tq({ ket: { ket: '00' } }, { arrows: 'reduced', grid: 'T' }), 1)
    expect(vecNear(r.rA, [0, 0, 1])).toBe(true)
    expect(vecNear(r.rB, [0, 0, 1])).toBe(true)
    expect(Math.hypot(...r.rA)).toBeCloseTo(1, 12)
    const T = r.T!
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) expect(T[i][j], `T[${i}][${j}]`).toBeCloseTo(i === 2 && j === 2 ? 1 : 0, 9)
  })

  it('Φ⁺: zero arrows (maximally mixed) and T = diag(1, −1, 1)', () => {
    const r = resolveTwoQubitStage(tq({ ket: { bell: 'Phi+' } }, { arrows: 'reduced', grid: 'T' }), 1)
    expect(vecNear(r.rA, [0, 0, 0])).toBe(true)
    expect(vecNear(r.rB, [0, 0, 0])).toBe(true)
    const T = r.T!
    const want = [
      [1, 0, 0],
      [0, -1, 0],
      [0, 0, 1],
    ]
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) expect(T[i][j], `T[${i}][${j}]`).toBeCloseTo(want[i][j], 9)
    // a pure Bell pair: purity of the reduced 2-qubit rho is still 1 (it IS the full register)
    expect(r.purity).toBeCloseTo(1, 9)
    // S(ρ_A) of a maximally mixed single qubit is 1 bit
    expect(r.entropy).toBeCloseTo(1, 9)
  })

  it('cos-sin at 30°: each reduced arrow has length cos 60° (= cos 2θ), along z', () => {
    const r = resolveTwoQubitStage(tq({ family: 'cos-sin', thetaDeg: 30 }, { arrows: 'reduced' }), 1)
    expect(r.sweep).toEqual({ thetaDeg: 30 })
    expect(Math.hypot(...r.rA)).toBeCloseTo(Math.cos((60 * Math.PI) / 180), 9)
    expect(vecNear(r.rA, [0, 0, Math.cos((60 * Math.PI) / 180)])).toBe(true)
    expect(vecNear(r.rB, r.rA)).toBe(true)
  })

  it('reduce of GHZ (keep 0, 1): two zero arrows and T_zz = 1', () => {
    const r = resolveTwoQubitStage(tq({ reduce: { ket: { bell: '000+111' }, keep: [0, 1] } }, { arrows: 'reduced', grid: 'T' }), 1)
    expect(vecNear(r.rA, [0, 0, 0])).toBe(true)
    expect(vecNear(r.rB, [0, 0, 0])).toBe(true)
    expect(r.T![2][2]).toBeCloseTo(1, 9)
    expect(r.T![0][0]).toBeCloseTo(0, 9)
  })

  it('grid T-minus-rr subtracts the product of the two reduced vectors cell by cell', () => {
    const base = tq({ ket: { ket: '00' } }, { arrows: 'reduced', grid: 'T' })
    const t = resolveTwoQubitStage(base, 1)
    const tmr = resolveTwoQubitStage({ ...base, grid: 'T-minus-rr' }, 1)
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) expect(tmr.T![i][j]).toBeCloseTo(t.T![i][j] - t.rA[i] * t.rB[j], 9)
    // |00⟩ is a product state: the connected correlation vanishes entirely
    for (const row of tmr.T!) for (const v of row) expect(Math.abs(v)).toBeLessThan(1e-9)
  })

  it('local: an X on qubit A of |00⟩ flips its arrow to −z', () => {
    const r = resolveTwoQubitStage(tq({ ket: { ket: '00' } }, { local: [{ qubit: 0, gate: 'X' }] }), 1)
    expect(vecNear(r.rA, [0, 0, -1])).toBe(true)
    expect(vecNear(r.rB, [0, 0, 1])).toBe(true)
  })

  it('condition: measuring A of Φ⁺ along z at outcome 0 leaves A at +z and B exactly at +z too', () => {
    const r = resolveTwoQubitStage(tq({ ket: { bell: 'Phi+' } }, { condition: { qubit: 0, basis: 'z', outcome: 0 } }), 1)
    expect(vecNear(r.rA, [0, 0, 1])).toBe(true)
    expect(vecNear(r.rB, [0, 0, 1])).toBe(true)
  })

  it('rho.mixture: an equal mix of |00⟩ and |11⟩ is maximally mixed on each qubit, with T_zz = 1 and no coherence', () => {
    const r = resolveTwoQubitStage(
      tq({ rho: { mixture: [{ w: 0.5, ket: { ket: '00' } }, { w: 0.5, ket: { ket: '11' } }] } }, { arrows: 'reduced', grid: 'T' }),
      1,
    )
    expect(vecNear(r.rA, [0, 0, 0])).toBe(true)
    expect(vecNear(r.rB, [0, 0, 0])).toBe(true)
    expect(r.T![2][2]).toBeCloseTo(1, 9)
    expect(r.purity).toBeCloseTo(0.5, 9) // Tr ρ² of an equal 2-outcome mixture of orthogonal states
  })
})

describe('two-qubit: interpolation', () => {
  it('two cos-sin beats lerp the angle and rebuild (a smooth shrink, not a crossfade)', () => {
    const a = resolveTwoQubitStage(tq({ family: 'cos-sin', thetaDeg: 0 }), 1)
    const b = resolveTwoQubitStage(tq({ family: 'cos-sin', thetaDeg: 90 }), 0)
    const mid = interpolate(a, b, 0.5) as ResolvedTwoQubit
    expect(mid.sweep).toEqual({ thetaDeg: 45 })
    expect(Math.hypot(...mid.rA)).toBeCloseTo(Math.cos(Math.PI / 2), 9) // cos(2·45°) = 0
  })

  it('a different source hard crossfades (pick(a, b, t))', () => {
    const a = resolveTwoQubitStage(tq({ ket: { ket: '00' } }), 1)
    const b = resolveTwoQubitStage(tq({ ket: { bell: 'Phi+' } }), 1)
    expect((interpolate(a, b, 0.3) as ResolvedTwoQubit).rA).toEqual(a.rA)
    expect((interpolate(a, b, 0.7) as ResolvedTwoQubit).rA).toEqual(b.rA)
  })

  it('t ≤ 0 / t ≥ 1 return the endpoints unchanged', () => {
    const a = resolveTwoQubitStage(tq({ ket: { ket: '00' } }), 1)
    const b = resolveTwoQubitStage(tq({ ket: { bell: 'Phi+' } }), 1)
    expect(interpTwoQubitStage(a, b, 0)).toBe(a)
    expect(interpTwoQubitStage(a, b, 1)).toBe(b)
  })
})

describe('two-qubit: validation', () => {
  it('rejects a source whose ket is not two qubits', () => {
    expect(validateTwoQubitStage(tq({ ket: { ket: '0' } }))[0]).toMatch(/needs a two-qubit state/)
    expect(validateTwoQubitStage(tq({ ket: { ket: '000' } }))[0]).toMatch(/needs a two-qubit state/)
    expect(validateTwoQubitStage(tq({ ket: { ket: '00' } }))).toEqual([])
  })

  it('reduce needs a three-qubit ket and two distinct kept qubits 0–2', () => {
    expect(validateTwoQubitStage(tq({ reduce: { ket: { ket: '00' }, keep: [0, 1] } }))[0]).toMatch(/needs a three-qubit state/)
    expect(validateTwoQubitStage(tq({ reduce: { ket: { bell: '000+111' }, keep: [0, 0] } }))[0]).toMatch(/two distinct qubits/)
    expect(validateTwoQubitStage(tq({ reduce: { ket: { bell: '000+111' }, keep: [0, 3] as [number, number] } }))[0]).toMatch(/two distinct qubits/)
    expect(validateTwoQubitStage(tq({ reduce: { ket: { bell: '000+111' }, keep: [0, 1] } }))).toEqual([])
  })

  it('condition is rejected off a ket source', () => {
    expect(validateTwoQubitStage(tq({ family: 'cos-sin', thetaDeg: 30 }, { condition: { qubit: 0, basis: 'z', outcome: 0 } }))[0]).toMatch(/only on a pure ket source/)
    expect(validateTwoQubitStage(tq({ ket: { bell: 'Phi+' } }, { condition: { qubit: 0, basis: 'z', outcome: 0 } }))).toEqual([])
  })

  it('condition is rejected when the outcome has probability ~0', () => {
    expect(validateTwoQubitStage(tq({ ket: { ket: '00' } }, { condition: { qubit: 0, basis: 'z', outcome: 1 } }))[0]).toMatch(/probability ~0/)
  })

  it('at most 2 axes per side', () => {
    const three = [{ thetaDeg: 0, phiDeg: 0 }, { thetaDeg: 10, phiDeg: 0 }, { thetaDeg: 20, phiDeg: 0 }]
    expect(validateTwoQubitStage(tq({ ket: { ket: '00' } }, { axes: { a: three } }))[0]).toMatch(/at most 2 directions/)
    expect(validateTwoQubitStage(tq({ ket: { ket: '00' } }, { axes: { a: three.slice(0, 2), b: three.slice(0, 2) } }))).toEqual([])
  })

  it('highlight cells are two of x, y, z; readouts accept concurrence and chsh and reject unknown names', () => {
    expect(validateTwoQubitStage(tq({ ket: { ket: '00' } }, { highlight: ['xx', 'zz'] }))).toEqual([])
    expect(validateTwoQubitStage(tq({ ket: { ket: '00' } }, { highlight: ['xw' as never] }))[0]).toMatch(/must be two of x, y, z/)
    expect(validateTwoQubitStage(tq({ ket: { ket: '00' } }, { readouts: ['purity', 'rLength', 'entropy', 'concurrence', 'chsh'] }))).toEqual([])
    expect(validateTwoQubitStage(tq({ ket: { ket: '00' } }, { readouts: ['negativity' as never] }))[0]).toMatch(/unknown readout/)
  })

  it('local rejects a gate that needs an angle or is multi-qubit (no params field to carry it)', () => {
    expect(validateTwoQubitStage(tq({ ket: { ket: '00' } }, { local: [{ qubit: 0, gate: 'Rx' as never }] }))[0]).toMatch(/needs an angle/)
    expect(validateTwoQubitStage(tq({ ket: { ket: '00' } }, { local: [{ qubit: 0, gate: 'SWAP' as never }] }))[0]).toMatch(/needs an angle/)
    expect(validateTwoQubitStage(tq({ ket: { ket: '00' } }, { local: [{ qubit: 1, gate: 'H' }] }))).toEqual([])
  })

  it('a mixture whose weights do not sum to 1 is rejected', () => {
    expect(
      validateTwoQubitStage(tq({ rho: { mixture: [{ w: 0.5, ket: { ket: '00' } }, { w: 0.6, ket: { ket: '11' } }] } }))[0],
    ).toMatch(/weights sum to/)
  })
})

describe('two-qubit: readouts', () => {
  it('names purity, the two reduced lengths and the entropy as plain text', () => {
    const r = resolveTwoQubitStage(tq({ ket: { bell: 'Phi+' } }, { readouts: ['purity', 'rLength', 'entropy'] }), 1)
    const texts = twoQubitReadouts(r).map((x) => x.text)
    expect(texts.some((t) => t.startsWith('Tr ρ² = 1'))).toBe(true)
    expect(texts.some((t) => t.includes('|r_A| = 0'))).toBe(true)
    expect(texts.some((t) => t.startsWith('S(ρ_A) = 1'))).toBe(true)
  })
})

describe('two-qubit: one scene, two modes', () => {
  it('draws both balls and the grid in stage and print mode with no NaN; resolve and validateLayout reach the kind', () => {
    const states: TwoQubitState[] = [
      tq({ ket: { ket: '00' } }, { arrows: 'reduced', grid: 'T' }),
      tq({ ket: { bell: 'Phi+' } }, { arrows: 'reduced', grid: 'T', highlight: ['xx', 'zz'], readouts: ['purity', 'rLength', 'entropy'] }),
      tq({ family: 'cos-sin', thetaDeg: 30 }, { grid: 'T-minus-rr' }),
      tq({ reduce: { ket: { bell: '000+111' }, keep: [0, 1] } }, { grid: 'T' }),
    ]
    for (const st of states) {
      expect(validateLayout(st), JSON.stringify(st.source)).toEqual([])
      const r = resolve(st, 1) as ResolvedTwoQubit
      for (const mode of ['stage', 'print'] as const) {
        const html = renderToString(createElement('svg', null, createElement(TwoQubitScene, { state: r, mode, width: 320, height: 260 })))
        expect(html, mode).not.toMatch(/NaN|Infinity|undefined/)
        expect(html, mode).toContain('data-anchor="ball-a"')
        expect(html, mode).toContain('data-anchor="ball-b"')
        if (r.grid !== 'none') expect(html, mode).toContain('data-anchor="cell"')
      }
    }
  })

  it('the passport names the space, with no phase legend (the grid is signed, not a phase)', () => {
    expect(passportOf(tq({ ket: { ket: '00' } })).title).toBe('STATE · two qubits')
    expect(passportOf(tq({ ket: { ket: '00' } })).legend).toBeUndefined()
  })
})

describe('two-qubit: concurrence and chsh readouts (E2: qc/entangle.ts concurrence / chshMaxHorodecki / chshFromAxes; numpy twins in the test comments)', () => {
  const both = { readouts: ['concurrence', 'chsh'] as ('concurrence' | 'chsh')[] }
  const at = (source: TwoQubitSource, rest: Partial<Omit<TwoQubitState, 'kind' | 'source'>> = {}) => resolveTwoQubitStage(tq(source, { ...both, ...rest }), 1)
  const werner = (w: number): TwoQubitSource => {
    // w|Ψ⁻⟩⟨Ψ⁻| + (1 − w) I/4 as a mixture of the four Bell states: (1 + 3w)/4 on Ψ⁻, (1 − w)/4 on each of the others
    const rest = (1 - w) / 4
    return { rho: { mixture: [{ w: rest, ket: { bell: 'Phi+' } }, { w: rest, ket: { bell: 'Phi-' } }, { w: rest, ket: { bell: 'Psi+' } }, { w: (1 + 3 * w) / 4, ket: { bell: 'Psi-' } }] } }
  }

  it('Φ⁺: C = 1 and the largest CHSH score is 2√2 (numpy: 1.0, 2.828427)', () => {
    const r = at({ ket: { bell: 'Phi+' } })
    expect(r.concurrence).toBeCloseTo(1, 12)
    expect(r.chsh!.max).toBeCloseTo(2 * Math.SQRT2, 12)
    expect(r.chsh!.atAxes).toBeNull() // no settings drawn, so only the ceiling is read
  })

  it('a product state: C = 0 and the largest CHSH score is 2 (|00⟩ and |++⟩; numpy: 0, 2.0)', () => {
    for (const ket of ['00', '++']) {
      const r = at({ ket: { ket } })
      expect(r.concurrence, ket).toBeCloseTo(0, 12)
      expect(r.chsh!.max, ket).toBeCloseTo(2, 12)
    }
  })

  it('Werner(½): C = 0.25 and the ceiling 2√2·w = 1.414 (numpy: 0.25, 1.414214); the mixed-state path (no pure ket) agrees with the formula max(0, (3w − 1)/2)', () => {
    const r = at(werner(0.5))
    expect(r.concurrence).toBeCloseTo(0.25, 9)
    expect(r.chsh!.max).toBeCloseTo(Math.SQRT2, 9)
    for (const w of [0.2, 1 / 3, 0.6, 1]) expect(at(werner(w)).concurrence!, `w = ${w}`).toBeCloseTo(Math.max(0, (3 * w - 1) / 2), 7)
  })

  it('the cos-sin family: C = sin 2θ and the ceiling 2√(1 + sin²2θ) (30°: 0.866, 2.6458; numpy)', () => {
    const r = at({ family: 'cos-sin', thetaDeg: 30 })
    expect(r.concurrence).toBeCloseTo(Math.sqrt(3) / 2, 12)
    expect(r.chsh!.max).toBeCloseTo(2.645751311064591, 9)
  })

  it('a reduce source reads the PAIR it keeps: GHZ’s kept pair has C = 0; Φ⁺ on wires 0, 1 beside a spare wire has C = 1 on [0, 1] and 0 on [0, 2]', () => {
    expect(at({ reduce: { ket: { bell: '000+111' }, keep: [0, 1] } }).concurrence).toBeCloseTo(0, 9)
    const pairPlusSpare: AmpSource = { circuit: { version: 1, qubits: 3, columns: [[{ op: 'gate', gate: 'H', targets: [0] }], [{ op: 'gate', gate: 'X', targets: [1], controls: [0] }]] } }
    expect(at({ reduce: { ket: pairPlusSpare, keep: [0, 1] } }).concurrence).toBeCloseTo(1, 9)
    expect(at({ reduce: { ket: pairPlusSpare, keep: [0, 2] } }).concurrence).toBeCloseTo(0, 9)
  })

  it('a local gate on one qubit changes neither number (entanglement is invariant under local unitaries)', () => {
    const r = at({ ket: { bell: 'Phi+' } }, { local: [{ qubit: 0, gate: 'H' }, { qubit: 1, gate: 'S' }] })
    expect(r.concurrence).toBeCloseTo(1, 12)
    expect(r.chsh!.max).toBeCloseTo(2 * Math.SQRT2, 12)
  })

  it('the score at drawn settings, when both balls carry two: |+⟩|+⟩ with x, y gives 1; the singlet with N&C’s settings gives 2√2; Φ⁺ with x, y gives 2 (numpy: 1.0, 2.828427, 2.0)', () => {
    const xy: ('+x' | '+y')[] = ['+x', '+y']
    expect(at({ ket: { ket: '++' } }, { axes: { a: xy, b: xy } }).chsh!.atAxes).toBeCloseTo(1, 12)
    const ncB = [{ thetaDeg: 135, phiDeg: 180 }, { thetaDeg: 45, phiDeg: 180 }]
    expect(at({ ket: { bell: 'Psi-' } }, { axes: { a: ['+x', '+z'], b: ncB } }).chsh!.atAxes).toBeCloseTo(2 * Math.SQRT2, 12)
    expect(at({ ket: { bell: 'Phi+' } }, { axes: { a: xy, b: xy } }).chsh!.atAxes).toBeCloseTo(2, 12)
    // the score at any settings never exceeds the ceiling
    const r = at({ ket: { bell: 'Phi+' } }, { axes: { a: xy, b: xy } })
    expect(r.chsh!.atAxes!).toBeLessThanOrEqual(r.chsh!.max + 1e-12)
    // one direction on a ball is not a CHSH setting pair: only the ceiling is read
    expect(at({ ket: { bell: 'Phi+' } }, { axes: { a: ['+x'], b: xy } }).chsh!.atAxes).toBeNull()
  })

  it('nothing is computed (null) when the readout is not asked for', () => {
    const r = resolveTwoQubitStage(tq({ ket: { bell: 'Phi+' } }, { readouts: ['purity'] }), 1)
    expect(r.concurrence).toBeNull()
    expect(r.chsh).toBeNull()
  })

  it('readouts name the numbers; the settings line appears only with two directions on each ball', () => {
    const plain = twoQubitReadouts(at({ ket: { bell: 'Phi+' } })).map((x) => x.text)
    expect(plain).toContain('C = 1')
    expect(plain).toContain('max S = 2.828 · any settings')
    expect(plain.some((t) => t.includes('these settings'))).toBe(false)
    const xy: ('+x' | '+y')[] = ['+x', '+y']
    const withAxes = twoQubitReadouts(at({ ket: { bell: 'Phi+' } }, { axes: { a: xy, b: xy } })).map((x) => x.text)
    expect(withAxes).toContain('S = 2 · these settings')
    expect(twoQubitReadouts(at(werner(0.5))).map((x) => x.text)).toContain('C = 0.25')
  })

  it('a sweep of the cos-sin family rebuilds both numbers at the swept angle (mid of 0° and 45°: C = sin 45°); a static pair lerps them', () => {
    const a = resolveTwoQubitStage(tq({ family: 'cos-sin', thetaDeg: 0 }, both), 1)
    const b = resolveTwoQubitStage(tq({ family: 'cos-sin', thetaDeg: 45 }, both), 1)
    const mid = interpTwoQubitStage(a, b, 0.5)
    expect(mid.concurrence).toBeCloseTo(Math.sin(Math.PI / 4), 12)
    expect(mid.chsh!.max).toBeCloseTo(2 * Math.sqrt(1 + 0.5), 12)
    const p = resolveTwoQubitStage(tq({ ket: { bell: 'Phi+' } }, both), 1)
    expect(interpTwoQubitStage(p, p, 0.5).concurrence).toBeCloseTo(1, 12)
  })

  it('one scene, two modes: the readout lines draw in stage and print with no NaN', () => {
    const xy: ('+x' | '+y')[] = ['+x', '+y']
    const st = tq({ ket: { bell: 'Phi+' } }, { ...both, axes: { a: xy, b: xy }, grid: 'T' })
    expect(validateLayout(st)).toEqual([])
    const r = resolve(st, 1) as ResolvedTwoQubit
    for (const mode of ['stage', 'print'] as const) {
      const html = renderToString(createElement('svg', null, createElement(TwoQubitScene, { state: r, mode, width: 320, height: 260 })))
      expect(html, mode).not.toMatch(/NaN|Infinity|undefined/)
    }
  })
})
