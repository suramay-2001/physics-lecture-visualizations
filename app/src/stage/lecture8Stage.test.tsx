/**
 * Lecture 8's changes to the shared kinds (W-448 L8-A, docs/roles/interface-changes.md): the two spheres (hilbert-plane
 * `labels: 'polarization'` over bloch `labels: 'poincare'` with `photonTurnDeg`), the variance-budget readout on bloch and
 * bloch-ball, and the revised polarization-sphere passport and fidelity. Every drawn number is checked against a direct
 * engine call, so the doubling and the budget are never the scene's own.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { FIDELITY, FIDELITY_VARIANT, fidelityOf } from '../content/fidelity'
import { PASSPORT_VARIANT, passportOf, type BallState, type BlochState, type HilbertPlaneState } from '../content/stage'
import { pauliVariances, varianceTotal } from '../physics/density'
import { POL, photonTurn, polBloch, sphereTurn } from '../physics/polarization'
import { blochVector, ketFromBloch } from '../physics/spin'
import { apply } from '../physics/linalg'
import { budgetPct, budgetText } from './budget'
import { FigureFor } from './figures/FigureFor'
import { interpolate } from './interp'
import { DEG, polarizationLayoutProblems, resolve, validateLayout, validateStage } from './resolve'
import { basisKets, ketAt } from './scenes/HilbertPlaneScene'
import { POLE_LABELS, blochReadout } from './scenes/bloch/blochLabels'
import type { ResolvedBall, ResolvedBloch, ResolvedPlane, V3 } from './types'

const bloch = (x: Omit<BlochState, 'kind'>): BlochState => ({ kind: 'bloch', ...x })
const ball = (x: Omit<BallState, 'kind'>): BallState => ({ kind: 'bloch-ball', ...x })
const plane = (x: Omit<HilbertPlaneState, 'kind'>): HilbertPlaneState => ({ kind: 'hilbert-plane', ...x })
const close = (a: number, b: number, eps = 1e-12) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(eps)
const pol = (x: Omit<BlochState, 'kind' | 'labels'>) => bloch({ labels: 'poincare', ...x })

describe('photonTurnDeg: the light’s turn is the engine’s, the sphere turns twice as far', () => {
  it('a 45° lab turn of |H⟩ is a 90° turn of its point: the Bloch vector is polBloch and photonTurn|H⟩', () => {
    const r = resolve(pol({ state: '+z', photonTurnDeg: 45 }), 0) as ResolvedBloch
    const want = polBloch(45 * DEG)
    r.r.forEach((x, i) => close(x, want[i]))
    blochVector(apply(photonTurn(45 * DEG), POL.H)).forEach((x, i) => close(x, r.r[i]))
    close(r.rot!.angle, 90 * DEG)
    expect(r.photon).toBe(true)
    close(sphereTurn('photon', 45 * DEG), 90 * DEG)
    expect(blochReadout(r)).toBe('lab 45° → sphere 90°')
  })
  it('a sweep: at hold progress s the lab turn is 90s° and the point sits at (sin 2χ, 0, cos 2χ)', () => {
    const st = pol({ state: '+z', photonTurnDeg: { from: 0, to: 90 } })
    for (const s of [0, 0.25, 0.5, 1]) {
      const r = resolve(st, s) as ResolvedBloch
      polBloch(90 * s * DEG).forEach((x, i) => close(x, r.r[i]))
    }
    // the full 180° of lab turn goes round the sphere once
    const full = resolve(pol({ state: '+z', photonTurnDeg: 180 }), 0) as ResolvedBloch
    close(full.rot!.angle, 360 * DEG)
    close(full.r[2], 1)
  })
  it('the circular state sits on the turning axis: it does not move (it only gains a phase)', () => {
    const r = resolve(pol({ state: '+y', photonTurnDeg: { from: 0, to: 90 } }), 1) as ResolvedBloch
    r.r.forEach((x, i) => close(x, [0, 1, 0][i]))
    // the ket is multiplied by e^{−iφ}: still the same point
    expect(Math.hypot(r.ket[0].re, r.ket[0].im)).toBeCloseTo(Math.SQRT1_2, 12)
  })
  it('between beats the same turn interpolates its angle and keeps the photon flag', () => {
    const a = resolve(pol({ state: '+z', photonTurnDeg: 0 }), 0) as ResolvedBloch
    const b = resolve(pol({ state: '+z', photonTurnDeg: 90 }), 0) as ResolvedBloch
    const mid = interpolate(a, b, 0.5) as ResolvedBloch
    expect(mid.photon).toBe(true)
    polBloch(45 * DEG).forEach((x, i) => close(x, mid.r[i], 1e-9))
  })
  it('validation: needs the polarization sphere, and is exclusive with rotate', () => {
    expect(validateStage(bloch({ state: '+z', photonTurnDeg: 45 }))[0]).toMatch(/labels: 'poincare'/)
    expect(validateStage(pol({ state: '+z', photonTurnDeg: 45, rotate: { axis: 'y', angleDeg: 10 } })).join()).toMatch(/exclusive with rotate/)
    expect(validateStage(pol({ state: '+z', photonTurnDeg: 45 }))).toEqual([])
    expect(validateStage(pol({ state: '+z', photonTurnDeg: Number.NaN }))[0]).toMatch(/non-finite/)
  })
})

describe('the electron comparison stays 1×', () => {
  it('rotate about y by 180° takes |+z⟩ to |−z⟩: 180° in the lab, 180° on the sphere', () => {
    const r = resolve(bloch({ state: '+z', rotate: { axis: 'y', angleDeg: 180 } }), 0) as ResolvedBloch
    r.r.forEach((x, i) => close(x, [0, 0, -1][i], 1e-12))
    expect(r.photon).toBe(false)
    expect(blochReadout(r)).toBe('rotation Ry(180°)')
  })
})

describe('the variance budget: (Δσ_i)² = 1 − r_i², total 3 − r², from the resolved state', () => {
  it('bloch: variances are pauliVariances(r) and total 2 for every pure state', () => {
    for (const st of [bloch({ state: { thetaDeg: 60, phiDeg: 45 }, readouts: ['budget'] }), bloch({ state: '+z', readouts: ['budget'] })]) {
      const r = resolve(st, 0) as ResolvedBloch
      r.variances.forEach((x, i) => close(x, pauliVariances(r.r)[i]))
      close(r.variances.reduce((a, b) => a + b, 0), 2)
      expect(r.readouts).toContain('budget')
    }
    const star = resolve(bloch({ state: { thetaDeg: 60, phiDeg: 45 } }), 0) as ResolvedBloch
    // the plan’s numbers: r = (0.612, 0.612, 0.5) → (0.625, 0.625, 0.75)
    close(star.variances[0], 0.625, 1e-9)
    close(star.variances[2], 0.75, 1e-9)
    const z = resolve(bloch({ state: '+z' }), 0) as ResolvedBloch
    expect(z.variances.map((x) => Math.round(x * 1e9) / 1e9)).toEqual([1, 1, 0])
  })
  it('the magic angle: three equal variances of ⅔ at θ = arccos(1/√3)', () => {
    const r = resolve(bloch({ state: { thetaDeg: Math.acos(1 / Math.sqrt(3)) / DEG, phiDeg: 45 } }), 0) as ResolvedBloch
    r.variances.forEach((x) => close(x, 2 / 3, 1e-9))
  })
  it('bloch-ball: inside the ball the total is 3 − r²; the budget bars shrink to 1 at the centre', () => {
    const b = resolve(ball({ point: { r: [0, 0, 0.6] }, readouts: ['budget'] }), 0) as ResolvedBall
    close(b.variances.reduce((a, c) => a + c, 0), varianceTotal([0, 0, 0.6]))
    close(b.variances.reduce((a, c) => a + c, 0), 2.64)
    expect(b.budgetShown).toBe(1)
    const centre = resolve(ball({ point: 'oven', readouts: ['budget'] }), 0) as ResolvedBall
    expect(centre.variances).toEqual([1, 1, 1])
    expect((resolve(ball({ point: 'oven' }), 0) as ResolvedBall).budgetShown).toBe(0)
  })
  it('a ball point may sweep its length (r_z from 1 to 0): every sample is a state, the total rises 2 → 3', () => {
    const st = ball({ point: { r: [0, 0, { from: 1, to: 0 }] }, readouts: ['budget'] })
    expect(validateStage(st)).toEqual([])
    const tot = (s: number) => (resolve(st, s) as ResolvedBall).variances.reduce((a, b) => a + b, 0)
    close(tot(0), 2)
    close(tot(0.5), 2.75)
    close(tot(1), 3)
    expect(validateStage(ball({ point: { r: [0, 0, { from: 1, to: 1.2 }] } }))[0]).toMatch(/not a state/)
  })
  it('interpolating between two ball beats lerps the budget presence', () => {
    const a = resolve(ball({ point: 'oven' }), 0) as ResolvedBall
    const b = resolve(ball({ point: 'oven', readouts: ['budget'] }), 0) as ResolvedBall
    close((interpolate(a, b, 0.25) as ResolvedBall).budgetShown, 0.25)
  })
  it('the readout text and bar widths: "total = 3 − r² = 2.00", 1 fills a bar, the total bar spans 0…3', () => {
    expect(budgetText([0.625, 0.625, 0.75])).toBe('total = 3 − r² = 2.00')
    expect(budgetText([1, 1, 1])).toBe('total = 3 − r² = 3.00')
    expect(budgetPct(1)).toBe(100)
    expect(budgetPct(0.625)).toBeCloseTo(62.5, 12)
    expect(budgetPct(2, 3)).toBeCloseTo(66.667, 3)
  })
  it('the print figure carries the variances and the photon turn as text', () => {
    const html = renderToString(<FigureFor layout={pol({ state: '+z', photonTurnDeg: 45, readouts: ['budget'] })} number="L8.1" />)
    expect(html).toContain('lab 45° → sphere 90°')
    expect(html).toContain('total = 3 − r² = 2.00')
    expect(html).toContain('|H⟩')
    expect(html).toContain('|C₊⟩')
    const ballHtml = renderToString(<FigureFor layout={ball({ point: { r: [0, 0, 0.6] }, readouts: ['budget'] })} number="L8.2" />)
    expect(ballHtml).toContain('total = 3 − r² = 2.64')
  })
})

describe('the polarization naming: poles, the plane, the passports and the drawers', () => {
  it('the sphere’s poles read H/V on z, D/A on x and C± on y; the spin set is unchanged', () => {
    expect(POLE_LABELS.poincare['+z']).toBe('$|H\\rangle$')
    expect(POLE_LABELS.poincare['-z']).toBe('$|V\\rangle$')
    expect(POLE_LABELS.poincare['+x']).toBe('$|D\\rangle$')
    expect(POLE_LABELS.poincare['-x']).toBe('$|A\\rangle$')
    expect(POLE_LABELS.poincare['+y']).toBe('$|C_+\\rangle$')
    expect(POLE_LABELS.poincare['-y']).toBe('$|C_-\\rangle$')
    expect(POLE_LABELS.spin['+z']).toBe('$|{+z}\\rangle$')
  })
  it('the passports: ⟨σ⟩ axes in the H/V basis (no Stokes S₁–S₃), and the plane’s angle is the polarizer’s angle', () => {
    const p = passportOf(bloch({ state: '+z', labels: 'poincare' }))
    expect(p).toBe(PASSPORT_VARIANT.poincare)
    expect(p.title).toBe('STATE SPACE · polarization sphere (light)')
    expect(p.axes).toEqual(['⟨σx⟩', '⟨σy⟩', '⟨σz⟩'])
    expect(p.note).toMatch(/H\/V basis/)
    const q = passportOf(plane({ psi: '+z', labels: 'polarization' }))
    expect(q).toBe(PASSPORT_VARIANT.planePolarization)
    expect(q.fidelityKey).toBe('plane-polarization')
    expect(q.note).toMatch(/polarizer’s angle/)
    // the other labels keep their passports
    expect(passportOf(plane({ psi: '+z' }))).not.toBe(q)
    expect(passportOf(plane({ psi: '+z', labels: 'photon' }))).toBe(PASSPORT_VARIANT.planePhoton)
  })
  it('the plane names its arrows and frames H/V and D/A', () => {
    expect(basisKets(0, 'polarization')).toEqual(['H', 'V'])
    expect(basisKets(Math.PI / 4, 'polarization')).toEqual(['D', 'A'])
    expect(basisKets(0.3, 'polarization')).toEqual(['e₁', 'e₂'])
    expect(basisKets(0, 'spin')).toEqual(['+z', '−z'])
    expect(ketAt(0, 'polarization')).toBe('$|H\\rangle$')
    expect(ketAt(Math.PI / 2, 'polarization')).toBe('$|V\\rangle$')
    expect(ketAt(Math.PI / 4, 'polarization')).toBe('$|D\\rangle$')
    expect(ketAt(-Math.PI / 4, 'polarization')).toBe('$|A\\rangle$')
    expect(ketAt(Math.PI, 'polarization')).toBe('$-|H\\rangle$')
    expect(ketAt(0, 'spin')).toBe('$|{+z}\\rangle$')
  })
  it('the revised poincare drawer drops S₁–S₃; plane-polarization has all three lists; the bloch drawers gain the budget item', () => {
    const texts = (f: typeof FIDELITY.bloch) => [...f.exact, ...f.schematic, ...f.misleading].map((i) => i.text).join(' ')
    expect(texts(FIDELITY_VARIANT.poincare)).not.toMatch(/S_1|S_2|S_3/)
    expect(FIDELITY_VARIANT.poincare.schematic.find((i) => i.id === 'poincare-axes')!.text).toMatch(/H\/V basis/)
    expect(fidelityOf('plane-polarization')).toBe(FIDELITY_VARIANT.planePolarization)
    for (const list of Object.values(fidelityOf('plane-polarization'))) expect(list.length).toBeGreaterThan(0)
    expect(FIDELITY.bloch.exact.some((i) => i.id === 'bloch-budget')).toBe(true)
    expect(FIDELITY['bloch-ball'].exact.some((i) => i.id === 'ball-budget')).toBe(true)
  })
  it('the plane resolves with its labels', () => {
    expect((resolve(plane({ psi: { planeDeg: 30 }, labels: 'polarization', basis: 'z', shadows: true }), 0) as ResolvedPlane).labels).toBe('polarization')
    expect((resolve(plane({ psi: { planeDeg: 30 } }), 0) as ResolvedPlane).labels).toBe('spin')
  })
})

describe('the two spheres: a plane over a sphere must show the same light', () => {
  const ok = { layout: 'split' as const, top: plane({ psi: { planeDeg: { from: 0, to: 90 } }, labels: 'polarization' }), bottom: pol({ state: '+z', photonTurnDeg: { from: 0, to: 90 } }) }
  it('matching sweeps pass; a plane that disagrees with the sphere is caught', () => {
    expect(validateLayout(ok)).toEqual([])
    const bad = { ...ok, top: plane({ psi: { planeDeg: { from: 0, to: 45 } }, labels: 'polarization' }) }
    expect(validateLayout(bad).join()).toMatch(/different light/)
  })
  it('a static pair: the plane at 30° over the sphere of the same ket', () => {
    const top = plane({ psi: { planeDeg: 30 }, labels: 'polarization', basis: 'z', shadows: true })
    const good = { layout: 'split' as const, top, bottom: pol({ state: { thetaDeg: 60, phiDeg: 0 } }) }
    expect(validateLayout(good)).toEqual([])
    const wrong = { layout: 'split' as const, top, bottom: pol({ state: { thetaDeg: 90, phiDeg: 0 } }) }
    expect(validateLayout(wrong).join()).toMatch(/different light/)
    // the sphere’s own ket at 2χ: |p(30°)⟩ sits at θ = 60°
    close(blochVector(ketFromBloch(60 * DEG, 0))[2], Math.cos(60 * DEG))
  })
  it('a sphere carrying a circular state is not on the real slice and is left alone; the plane alone needs no sphere', () => {
    const circ = { layout: 'split' as const, top: plane({ psi: { planeDeg: { from: 0, to: 90 } }, labels: 'polarization' }), bottom: pol({ state: '+y', photonTurnDeg: { from: 0, to: 90 } }) }
    expect(validateLayout(circ)).toEqual([])
    expect(polarizationLayoutProblems([plane({ psi: '+z', labels: 'polarization' })])).toEqual([])
    // plain spin plane over a spin sphere is not touched
    expect(polarizationLayoutProblems([plane({ psi: '+x' }), bloch({ state: '+z' })])).toEqual([])
  })
  it('a V3 helper sanity check', () => {
    const v: V3 = [0, 0, 1]
    expect(v[2]).toBe(1)
  })
})
