/**
 * Every fact the opener captions state, checked against the engine (the frames illustrate; the DOM claims).
 */
import { describe, expect, it } from 'vitest'
import { expi, abs } from '../physics/complex'
import { apply, vscale, vsub, norm } from '../physics/linalg'
import { groverAngle, groverOptimalK, groverSuccess } from '../physics/qc/grover'
import { KET, Rz, blochVector, samePhysicalState } from '../physics/spin'
import { GROVER_OPENER, GROVER_TURN_FRAMES, beltOpenerFrame, groverOpenerFrame } from './openerData'
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

describe('Grover opener captions: the facts they state', () => {
  const N = 8
  const alphaDeg = (groverAngle(N) * 180) / Math.PI
  const [b1, b2, b3] = OPENERS.grover.beats
  const has = (text: string, ...parts: string[]) => parts.forEach((p) => expect(text, p).toContain(p))
  const rested = (k: number) => GROVER_OPENER.stepStart[k - 1] + GROVER_TURN_FRAMES - 1

  it('beat 1: eight strings, sin α = 1/√8, α = 20.7°; the arrow starts at α and the eight bars are equal', () => {
    has(b1.text, 'eight strings', `$\\alpha = ${alphaDeg.toFixed(1)}°$`, '$\\sin\\alpha = 1/\\sqrt{8}$')
    expect(Math.sin(groverAngle(N))).toBeCloseTo(1 / Math.sqrt(8), 12)
    const start = groverOpenerFrame(b1.to)
    expect(start.angleDeg).toBeCloseTo(alphaDeg, 9)
    start.bars.forEach((a) => expect(a).toBeCloseTo(1 / Math.sqrt(8), 12))
  })
  it('beat 2: a step turns the arrow by 2α = 41.4°; two steps put it at 5α = 103.5°, the nearest to vertical, with chance 0.9453', () => {
    has(b2.text, `$2\\alpha = ${(2 * alphaDeg).toFixed(1)}°$`, `$5\\alpha = ${(5 * alphaDeg).toFixed(1)}°$`, `$${groverSuccess(N, 1, 2).toFixed(4)}$`)
    expect(groverOpenerFrame(rested(2)).angleDeg - groverOpenerFrame(rested(1)).angleDeg).toBeCloseTo(2 * alphaDeg, 9)
    expect(groverOpenerFrame(b2.to).angleDeg).toBeCloseTo(5 * alphaDeg, 9)
    expect(groverOptimalK(N)).toBe(2) // 'as close to straight up as whole steps allow'
    expect(Math.abs(5 * alphaDeg - 90)).toBeLessThan(Math.abs(3 * alphaDeg - 90))
    expect(Math.abs(5 * alphaDeg - 90)).toBeLessThan(Math.abs(7 * alphaDeg - 90))
    const rest = groverOpenerFrame(b2.to).bars.filter((_, i) => i !== GROVER_OPENER.marked)
    rest.forEach((a) => expect(a).toBeLessThan(0)) // 'a bar below its line is a small negative amplitude': after two steps the seven others are
  })
  it('beat 3: a third step takes the arrow to 7α = 144.9° and the chance falls back to 0.3301', () => {
    has(b3.text, `$7\\alpha = ${(7 * alphaDeg).toFixed(1)}°$`, `$${groverSuccess(N, 1, 3).toFixed(4)}$`, 'Unit 17.4')
    expect(groverOpenerFrame(b3.to).angleDeg).toBeCloseTo(7 * alphaDeg, 9)
    expect(groverSuccess(N, 1, 3)).toBeLessThan(groverSuccess(N, 1, 2))
    const marked = groverOpenerFrame(b3.to).bars[GROVER_OPENER.marked]
    expect(marked).toBeLessThan(groverOpenerFrame(b2.to).bars[GROVER_OPENER.marked]) // 'the marked bar shrinks'
  })
  it('the beats start while the arrow is at rest, so a caption never opens mid-turn', () => {
    expect(b2.from).toBe(GROVER_OPENER.stepStart[0])
    expect(b3.from).toBe(GROVER_OPENER.stepStart[2])
    expect(groverOpenerFrame(b2.from - 1).steps).toBe(0)
    expect(groverOpenerFrame(b3.from - 1).steps).toBe(2)
  })
  it('sits on the 709 stage ground, in its own folder', () => {
    expect(OPENERS.grover.ground).toBe(GROVER_OPENER.ground)
    expect(OPENERS.grover.dir).toBe('openers/grover')
  })
})
