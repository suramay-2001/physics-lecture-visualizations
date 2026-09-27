/**
 * Q1's changes to the shared kinds (P-Q1-story §9.2), one test per new field: S1 `hilbert-plane.sumOf`, S2 `arcLabel`,
 * S3 `passportOf(state, course)` (the 709 names |0⟩ = |+z⟩ on the plane and the sphere), S4 `lab-r3.gradientScale`
 * (schematic: the drawn split only), S6 the 709 fidelity item `qc-plane-vectors-not-states`. 448 reads exactly as before.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { fidelityOf, FIDELITY } from '../content/fidelity'
import '../content/qc709/fidelity'
import type { HilbertPlaneState, LabState } from '../content/stage'
import { PASSPORT, PASSPORT_VARIANT, passportOf } from '../content/stage'
import { norm, vadd, vec } from '../physics/linalg'
import { ketFromBloch } from '../physics/spin'
import { FigureFor } from './figures/FigureFor'
import { interpolate } from './interp'
import { DEG, resolve, validateStage } from './resolve'
import { depositPoints, depositSeeds, SPOT } from './scenes/lab/deposit'
import { POLE_LABELS, poleLabelsFor } from './scenes/bloch/blochLabels'
import type { ResolvedLab, ResolvedPlane } from './types'

const plane = (x: Omit<HilbertPlaneState, 'kind'>): HilbertPlaneState => ({ kind: 'hilbert-plane', ...x })
const lab = (x: Partial<LabState> = {}): LabState => ({ kind: 'lab-r3', benches: [{ id: 'main', source: 'oven', devices: [{ axis: 'z' }] }], ...x })

describe('S1 hilbert-plane.sumOf: two vectors and their sum at its true length', () => {
  it('the sum is the engine’s vadd; its length (norm) is not 1; the plane zooms out to hold it', () => {
    const r = resolve(plane({ psi: { planeDeg: 15 }, others: [{ ket: { planeDeg: 60 }, role: 'second' }], sumOf: [{ planeDeg: 15 }, { planeDeg: 60 }] }), 1) as ResolvedPlane
    const want = vadd(vec(Math.cos(15 * DEG), Math.sin(15 * DEG)), vec(Math.cos(60 * DEG), Math.sin(60 * DEG)))
    expect(r.sum!.total.x).toBeCloseTo(want[0].re, 15)
    expect(r.sum!.len).toBeCloseTo(2 * Math.cos(22.5 * DEG), 14) // Q1 vs:b1: 1.8478
    expect(r.extent).toBeGreaterThanOrEqual(r.sum!.len)
    // Q1's check: the same sum through the Bloch half-angle (ketFromBloch(θ, 0) is the plane arrow at θ/2)
    expect(norm(vadd(ketFromBloch(Math.PI / 6, 0), ketFromBloch((2 * Math.PI) / 3, 0)))).toBeCloseTo(r.sum!.len, 14)
    const zz = resolve(plane({ psi: '+x', sumOf: ['+z', '-z'] }), 1) as ResolvedPlane
    expect(zz.sum!.len).toBeCloseTo(Math.SQRT2, 15)
    expect((resolve(plane({ psi: '+x' }), 1) as ResolvedPlane).sum).toBeNull()
  })
  it('between beats the summands turn and the sum is recomputed; a sum that appears fades in', () => {
    const A = resolve(plane({ sumOf: [{ planeDeg: 0 }, { planeDeg: 60 }] }), 1) as ResolvedPlane
    const B = resolve(plane({ sumOf: [{ planeDeg: 0 }, { planeDeg: 90 }] }), 0) as ResolvedPlane
    const mid = interpolate(A, B, 0.5) as ResolvedPlane
    expect(mid.sum!.len).toBeCloseTo(2 * Math.cos(37.5 * DEG), 12)
    const none = resolve(plane({ psi: '+z' }), 1) as ResolvedPlane
    expect((interpolate(none, B, 0.25) as ResolvedPlane).sum!.alpha).toBeCloseTo(0.25, 12)
  })
  it('validates its two kets; the print figure draws it with the engine’s length', () => {
    expect(validateStage(plane({ sumOf: ['+z', '+y' as never] }))[0]).toMatch(/sumOf\[1\]/)
    expect(validateStage(plane({ sumOf: ['+z'] as never }))).toEqual(['hilbert-plane sumOf: two plane vectors'])
    const html = renderToString(<FigureFor layout={plane({ psi: '+x', sumOf: ['+z', '-z'] })} number="Q1.1" />)
    expect(html).toContain('data-mark="sum"')
    expect(html).toContain('|sum| = 1.414')
  })
})

describe('S2 hilbert-plane.arcLabel', () => {
  it('names the arc (default θ/2), and only labels an arc that is drawn', () => {
    expect((resolve(plane({ psi: '+x', arc: true, arcLabel: '$\\theta$' }), 1) as ResolvedPlane).arcLabel).toBe('$\\theta$')
    expect((resolve(plane({ psi: '+x', arc: true }), 1) as ResolvedPlane).arcLabel).toBeNull()
    expect(validateStage(plane({ psi: '+x', arcLabel: '$\\theta$' }))).toEqual(['hilbert-plane arcLabel: labels the arc; set arc: true'])
    expect(validateStage(plane({ psi: '+x', arc: true, arcLabel: ' ' }))[0]).toMatch(/short label/)
  })
})

describe('S3 passportOf(state, course): 709 names |0⟩ = |+z⟩ on the plane and the sphere; 448 unchanged', () => {
  it('the plane and the sphere', () => {
    expect(passportOf(plane({}))).toBe(PASSPORT['hilbert-plane'])
    expect(passportOf(plane({}), 'sl448').axes[0]).toBe('$|{\\uparrow}\\rangle = |{+z}\\rangle$')
    expect(passportOf(plane({}), 'qc709')).toBe(PASSPORT_VARIANT.plane709)
    expect(passportOf(plane({}), 'qc709').axes).toEqual(['$|0\\rangle = |{+z}\\rangle$', '$|1\\rangle = |{-z}\\rangle$'])
    expect(passportOf({ kind: 'bloch', state: '+z' }, 'qc709').note).toBe('not a place · north pole |0⟩ = |+z⟩')
    expect(passportOf({ kind: 'bloch', state: '+z' })).toBe(PASSPORT.bloch)
    // light stays light in either course
    expect(passportOf({ kind: 'bloch', state: '+z', labels: 'poincare' }, 'qc709')).toBe(PASSPORT_VARIANT.poincare)
  })
  it('the sphere’s pole labels follow the course', () => {
    expect(poleLabelsFor('sl448')).toBe(POLE_LABELS.spin)
    expect(poleLabelsFor('qc709')['+z']).toBe('$|0\\rangle = |{+z}\\rangle$')
    expect(poleLabelsFor('qc709')['-z']).toBe('$|1\\rangle = |{-z}\\rangle$')
  })
})

describe('S4 lab-r3.gradientScale (schematic): the drawn split only', () => {
  it('resolves (default 1), interpolates, and never changes a fraction or a readout', () => {
    const a = resolve(lab(), 1) as ResolvedLab
    const b = resolve(lab({ gradientScale: 0.5, readouts: ['fractions'] }), 1) as ResolvedLab
    expect([a.gradientScale, b.gradientScale]).toEqual([1, 0.5])
    expect(b.benches[0].theory).toEqual(a.benches[0].theory)
    expect((interpolate(b, a, 0.5) as ResolvedLab).gradientScale).toBeCloseTo(0.75, 15)
  })
  it('keeps the spots on the plate: a factor in (0, 1.25]; "twice as far" is 0.5 → 1', () => {
    expect(validateStage(lab({ gradientScale: 1.25 }))).toEqual([])
    expect(validateStage(lab({ gradientScale: 2 }))[0]).toMatch(/gradientScale: a factor in \(0, 1.25\]/)
    expect(validateStage(lab({ gradientScale: 0 })).length).toBe(1)
  })
  it('the deposit’s spots move with the drawn split (the scene passes SPOT × gradientScale)', () => {
    const seeds = depositSeeds(11)
    const out = new Float32Array(600 * 3)
    const meanPlus = (spot: number) => {
      depositPoints(seeds, 600, { pPlus: 0.5, gradient: 1, classical: 0, spot }, out)
      let z = 0
      let n = 0
      for (let i = 0; i < 600; i++)
        if (out[i * 3 + 2] > 0) {
          z += out[i * 3 + 1]
          n++
        }
      return z / n
    }
    expect(meanPlus(SPOT) / meanPlus(SPOT * 0.5)).toBeCloseTo(2, 1)
  })
})

describe('S6 the 709 fidelity item qc-plane-vectors-not-states', () => {
  it('is in 709’s plane drawer, never in 448’s', () => {
    const ids = (f: ReturnType<typeof fidelityOf>) => [...f.exact, ...f.schematic, ...f.misleading].map((i) => i.id)
    expect(ids(fidelityOf('hilbert-plane', 'qc709'))).toContain('qc-plane-vectors-not-states')
    expect(ids(fidelityOf('hilbert-plane'))).not.toContain('qc-plane-vectors-not-states')
    expect(fidelityOf('hilbert-plane')).toBe(FIDELITY['hilbert-plane'])
  })
})
