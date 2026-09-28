/**
 * Q2's changes to the shared kinds (P-Q2-story §9.2, ruling Q2-4 `qc709-Q2Q3.md`): S1 `hilbert-plane.labels:
 * 'photon'`, S2 `amplitudes.globalPhaseDeg`. Unset ⇒ every kind reads exactly as before (448 and 709's
 * spin-labelled beats; no other chapter's picture changes).
 */
import { describe, expect, it } from 'vitest'
import { fidelityOf } from '../content/fidelity'
import '../content/qc709/fidelity'
import type { AmplitudesState, HilbertPlaneState } from '../content/stage'
import { PASSPORT_VARIANT, passportOf } from '../content/stage'
import { interpolate } from './interp'
import { resolve, validateStage } from './resolve'
import { basisKets, ketAt } from './scenes/HilbertPlaneScene'
import { ampReadouts, interpAmplitudes, resolveAmplitudes, validateAmplitudes } from './svg/amplitudes'
import type { ResolvedPlane } from './types'

const plane = (x: Omit<HilbertPlaneState, 'kind'>): HilbertPlaneState => ({ kind: 'hilbert-plane', ...x })
const amp = (x: Omit<AmplitudesState, 'kind'>): AmplitudesState => ({ kind: 'amplitudes', ...x })
const closeArr = (a: number[], b: number[], tol = 1e-9) => a.every((x, i) => Math.abs(x - b[i]) < tol)

describe('S1 hilbert-plane.labels: photon', () => {
  it('resolves to "photon" (default "spin"); unlabelled beats are unaffected', () => {
    expect((resolve(plane({ psi: '+z' }), 1) as ResolvedPlane).labels).toBe('spin')
    expect((resolve(plane({ psi: '+z', labels: 'photon' }), 1) as ResolvedPlane).labels).toBe('photon')
  })
  it('names the passport axes |x⟩, |y⟩, with a fresh fidelityKey that keeps plane-half-angles out', () => {
    const p = passportOf(plane({ labels: 'photon' }), 'qc709')
    expect(p).toBe(PASSPORT_VARIANT.planePhoton)
    expect(p.axes).toEqual(['$|x\\rangle$', '$|y\\rangle$'])
    expect(p.fidelityKey).toBe('plane-photon')
    expect(p.note).toMatch(/^not a place/)
    const ids = (f: ReturnType<typeof fidelityOf>) => [...f.exact, ...f.schematic, ...f.misleading].map((i) => i.id)
    expect(ids(fidelityOf('plane-photon', 'qc709'))).toContain('qc-plane-photon-angles')
    expect(ids(fidelityOf('plane-photon', 'qc709'))).not.toContain('plane-half-angles')
    // spin-labelled plane states (448 and 709) keep their own drawer, untouched
    expect(ids(fidelityOf('hilbert-plane', 'qc709'))).not.toContain('qc-plane-photon-angles')
    expect(ids(fidelityOf('hilbert-plane'))).not.toContain('qc-plane-photon-angles')
  })
  it('basisKets and ketAt read |x⟩, |y⟩ with no ± sign; the spin defaults are unchanged', () => {
    expect(basisKets(0, 'photon')).toEqual(['x', 'y'])
    expect(basisKets(Math.PI / 4, 'photon')).toEqual(["x'", "y'"])
    expect(basisKets(0)).toEqual(['+z', '−z'])
    expect(ketAt(0, 'photon')).toBe('$|x\\rangle$')
    expect(ketAt(Math.PI / 2, 'photon')).toBe('$|y\\rangle$')
    expect(ketAt(Math.PI / 4, 'photon')).toBeNull() // an explicit `badge` names a turned-frame arrow instead
    expect(ketAt(0)).toBe('$|{+z}\\rangle$')
  })
  it('a beat with no labels validates and resolves exactly as before (additive field)', () => {
    expect(validateStage(plane({ psi: '+x', others: [{ ket: '+z', role: 'basis' }] }))).toEqual([])
    expect(validateStage(plane({ psi: '+x', labels: 'photon' }))).toEqual([])
  })
  it('interpolation keeps labels discrete (switches at t = ½, as other discrete fields do)', () => {
    const a = resolve(plane({ psi: '+z', labels: 'photon' }), 1) as ResolvedPlane
    const b = resolve(plane({ psi: '+x' }), 1) as ResolvedPlane
    expect((interpolate(a, b, 0.25) as ResolvedPlane).labels).toBe('photon')
    expect((interpolate(a, b, 0.75) as ResolvedPlane).labels).toBe('spin')
  })
})

describe('S2 amplitudes.globalPhaseDeg', () => {
  it('multiplies every amplitude by e^{iγ}: sizes and chances unchanged, phases shift by γ', () => {
    const a = resolveAmplitudes(amp({ state: { dir: '+y' } }), 1)
    const b = resolveAmplitudes(amp({ state: { dir: '+y' }, globalPhaseDeg: -45 }), 1)
    expect(closeArr(b.sizes, a.sizes)).toBe(true)
    expect(closeArr(b.probs, a.probs)).toBe(true)
    expect(b.globalPhase).toBeCloseTo(-Math.PI / 4, 12)
    expect(b.phases[0] - a.phases[0]).toBeCloseTo(-Math.PI / 4, 9)
    expect(b.phases[1] - a.phases[1]).toBeCloseTo(-Math.PI / 4, 9)
  })
  it('γ = 0 (unset) is exactly the unrotated state: no readout line, and a re-derivation matches the plan’s |R\'⟩', () => {
    const r0 = resolveAmplitudes(amp({ state: { dir: '+y' } }), 1)
    expect(r0.globalPhase).toBe(0)
    expect(ampReadouts(r0).some((x) => x.name === 'phase')).toBe(false)
    // q2-photon:b4: |R'⟩ = e^{-i*45deg}|R⟩ = (0.5 - 0.5i, 0.5 + 0.5i)
    const r = resolveAmplitudes(amp({ state: { dir: '+y' }, globalPhaseDeg: -45 }), 1)
    expect(r.amps[0].re).toBeCloseTo(0.5, 9)
    expect(r.amps[0].im).toBeCloseTo(-0.5, 9)
    expect(r.amps[1].re).toBeCloseTo(0.5, 9)
    expect(r.amps[1].im).toBeCloseTo(0.5, 9)
    const line = ampReadouts(r).find((x) => x.name === 'phase')
    expect(line?.text).toBe('phase −45° · same state')
  })
  it('validates as a finite angle (a sweep too)', () => {
    expect(validateAmplitudes(amp({ state: { dir: '+y' }, globalPhaseDeg: Number.NaN }))[0]).toMatch(/globalPhaseDeg/)
    expect(validateAmplitudes(amp({ state: { dir: '+y' }, globalPhaseDeg: { from: 0, to: -45 } }))).toEqual([])
    expect(validateAmplitudes(amp({ state: { dir: '+y' } }))).toEqual([])
  })
  it('interpolates: a one-qubit direction still turns on the sphere, with the phase reapplied after', () => {
    const a = resolveAmplitudes(amp({ state: { dir: '+z' } }), 1)
    const b = resolveAmplitudes(amp({ state: { dir: '+y' }, globalPhaseDeg: -90 }), 1)
    const mid = interpAmplitudes(a, b, 0.5)
    expect(mid.globalPhase).toBeCloseTo(-Math.PI / 4, 12)
    expect(mid.sizes.reduce((s, x) => s + x * x, 0)).toBeCloseTo(1, 9)
  })
})
