/**
 * Every fact the opener captions state, checked against the engine (the frames illustrate; the DOM claims).
 */
import { describe, expect, it } from 'vitest'
import { expi, abs } from '../physics/complex'
import { apply, vscale, vsub, norm } from '../physics/linalg'
import { KET, Rz, blochVector, samePhysicalState } from '../physics/spin'
import { beltOpenerFrame } from './openerData'
import { OPENERS } from './openerCopy'

const plusZ = KET['+z']

describe('opener captions: the facts they state', () => {
  it('hopf beat 1: a phase e^{iχ} changes nothing measurable (same state, same Bloch point)', () => {
    for (const chi of [0.3, 1.7, Math.PI, 5.1]) {
      const psi = vscale(plusZ, expi(chi))
      expect(samePhysicalState(psi, plusZ)).toBe(true)
      blochVector(psi).forEach((v, i) => expect(Math.abs(v - blochVector(plusZ)[i])).toBeLessThan(1e-12))
      expect(norm(vsub(psi, plusZ))).toBeGreaterThan(0) // …yet a different vector
    }
  })
  it('belt beat 1: R_z(2π)|+z⟩ = −|+z⟩', () => {
    const out = apply(Rz(2 * Math.PI), plusZ)
    out.forEach((z, i) => expect(abs({ re: z.re + plusZ[i].re, im: z.im + plusZ[i].im })).toBeLessThan(1e-12))
  })
  it('belt beat 2: R_z(4π)|+z⟩ = +|+z⟩', () => {
    const out = apply(Rz(4 * Math.PI), plusZ)
    out.forEach((z, i) => expect(abs({ re: z.re - plusZ[i].re, im: z.im - plusZ[i].im })).toBeLessThan(1e-12))
  })
  it('belt beats line up with the film: 360° ends beat 1, 720° ends beat 2, flat at the end of beat 3', () => {
    const [b1, b2, b3] = OPENERS.belt.beats
    expect(beltOpenerFrame(b1.to).alphaDeg).toBeCloseTo(360, 9)
    expect(beltOpenerFrame(b2.to).alphaDeg).toBeCloseTo(720, 9)
    for (const w of beltOpenerFrame(b3.to).widths) expect(w[0]).toBeCloseTo(1, 9)
  })
  it('each opener’s beats cover its frames exactly once, in order', () => {
    for (const o of Object.values(OPENERS)) {
      expect(o.beats[0].from).toBe(0)
      expect(o.beats[o.beats.length - 1].to).toBe(o.frames - 1)
      for (let i = 1; i < o.beats.length; i++) expect(o.beats[i].from).toBe(o.beats[i - 1].to + 1)
    }
  })
})
