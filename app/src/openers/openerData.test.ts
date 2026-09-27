import { describe, expect, it } from 'vitest'
import { blochPoint, hopfMap, inverseStereo, linkingNumber } from '../physics/hopf'
import { beltOpenerFrame, hopfBead, hopfOpenerFibers, OPENER_FRAMES } from './openerData'

const close = (a: number, b: number, eps = 1e-9) => expect(Math.abs(a - b)).toBeLessThan(eps)

describe('Hopf opener data (what Blender draws)', () => {
  const fibers = hopfOpenerFibers()
  it('has 128 ring fibers plus the |+z⟩ circle and the |−z⟩ line', () => {
    expect(fibers.filter((f) => typeof f.role === 'number')).toHaveLength(128)
    expect(fibers.map((f) => f.role)).toContain('plus')
    expect(fibers.map((f) => f.role)).toContain('minus')
  })
  it('every drawn point lies on its fiber: the Hopf map sends it to its Bloch point', () => {
    for (const f of fibers) {
      const b = blochPoint((f.thetaDeg * Math.PI) / 180, f.phi)
      for (const p of f.points) hopfMap(inverseStereo(p)).forEach((v, i) => close(v, b[i], 1e-9))
    }
  })
  it('no ring fiber is clipped: every one is a whole circle (only the |−z⟩ line is cut)', () => {
    for (const f of fibers) expect(f.closed, f.id).toBe(f.role !== 'minus')
  })
  it('any two fibers link exactly once (checked on a sample pair per ring pair)', () => {
    const firstOf = (ring: number) => fibers.find((f) => f.role === ring)!
    for (let a = 0; a < 5; a++) for (let b = a + 1; b < 5; b++) close(Math.abs(linkingNumber(firstOf(a).points, firstOf(b).points)), 1, 0.02)
    close(Math.abs(linkingNumber(fibers[0].points, firstOf(2).points)), 1, 0.02)
  })
  it('the bead laps the |+z⟩ circle once in frames 0–29 and stays on it', () => {
    for (let f = 0; f < OPENER_FRAMES; f++) {
      const p = hopfBead(f)
      close(Math.hypot(p[0], p[1]), 1)
      close(p[2], 0)
    }
    hopfBead(29).forEach((v, i) => close(v, hopfBead(0)[i]))
  })
})

describe('belt opener data', () => {
  it('turns the block 360° by frame 39 and 720° by frame 79, then holds it', () => {
    close(beltOpenerFrame(39).alphaDeg, 360)
    close(beltOpenerFrame(79).alphaDeg, 720)
    for (let f = 80; f < OPENER_FRAMES; f++) beltOpenerFrame(f).block.forEach((v, i) => close(v, [1, 0, 0, 0][i]))
  })
  it('the spinor sign: −1 after one turn, +1 after two', () => {
    close(beltOpenerFrame(39).block[0], -1)
    close(beltOpenerFrame(79).block[0], 1)
  })
  it('is continuous across the stage seams (frames 79 → 80) and ends flat at frame 119', () => {
    const a = beltOpenerFrame(79)
    const b = beltOpenerFrame(80)
    a.points.forEach((p, k) => p.forEach((v, i) => close(v, b.points[k][i], 1e-9)))
    for (const w of beltOpenerFrame(119).widths) [1, 0, 0].forEach((v, i) => close(w[i], v, 1e-9))
  })
})
