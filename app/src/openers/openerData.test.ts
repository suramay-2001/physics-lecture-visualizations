import { describe, expect, it } from 'vitest'
import { blochPoint, hopfMap, inverseStereo, linkingNumber } from '../physics/hopf'
import { finalState, groverAngle, groverCircuit, groverOptimalK, groverSuccess } from '../physics/qc/grover'
import { beltOpenerFrame, GROVER_OPENER, GROVER_TURN_FRAMES, groverOpenerFrame, groverSteps, groverWholeStepBars, hopfBead, hopfOpenerFibers, OPENER_FRAMES } from './openerData'

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

describe('Grover opener data (what Blender draws)', () => {
  const N = 2 ** GROVER_OPENER.n
  const alphaDeg = (groverAngle(N) * 180) / Math.PI
  const [s1, s2, s3] = GROVER_OPENER.stepStart.map((s) => s + GROVER_TURN_FRAMES - 1)

  it('runs three whole steps, each turn finishing exactly on its frame and holding until the next begins', () => {
    expect(GROVER_OPENER.steps).toBe(3)
    expect([groverSteps(0), groverSteps(19), groverSteps(s1), groverSteps(GROVER_OPENER.stepStart[1] - 1), groverSteps(s2), groverSteps(s3), groverSteps(OPENER_FRAMES - 1)]).toEqual([0, 0, 1, 1, 2, 3, 3])
    expect(s1 < GROVER_OPENER.stepStart[1] && s2 < GROVER_OPENER.stepStart[2] && s3 < OPENER_FRAMES).toBe(true)
  })
  it('at rest the arrow is at (2k+1)α: α, then each step turns it by exactly 2α', () => {
    close(groverOpenerFrame(0).angleDeg, alphaDeg)
    for (const [k, f] of [[1, s1], [2, s2], [3, s3]] as const) close(groverOpenerFrame(f).angleDeg, (2 * k + 1) * alphaDeg)
    close(groverOpenerFrame(s2).angleDeg - groverOpenerFrame(s1).angleDeg, 2 * alphaDeg)
  })
  it('the plane vector is a unit vector at every frame, and the bars carry the same length (the N amplitudes of one state)', () => {
    for (let f = 0; f < OPENER_FRAMES; f++) {
      const fr = groverOpenerFrame(f)
      close(Math.hypot(...fr.plane), 1)
      close(Math.sqrt(fr.bars.reduce((s, a) => s + a * a, 0)), 1)
    }
  })
  it('at rest the bars are the amplitudes of a full simulation of Grover’s circuit with k steps (marked string 101)', () => {
    for (const [k, f] of [[0, 0], [1, s1], [2, s2], [3, s3]] as const) {
      const sim = finalState(groverCircuit(GROVER_OPENER.n, ['101'], k)).map((z) => z.re)
      groverOpenerFrame(f).bars.forEach((a, x) => close(a, sim[x], 1e-9))
      groverWholeStepBars(k).forEach((a, x) => close(a, sim[x], 1e-9))
    }
  })
  it('the marked bar’s square is the chance of the marked string, and two steps is the best number for N = 8', () => {
    expect(groverOptimalK(N)).toBe(2)
    for (const [k, f] of [[1, s1], [2, s2], [3, s3]] as const) close(groverOpenerFrame(f).bars[GROVER_OPENER.marked] ** 2, groverSuccess(N, 1, k), 1e-12)
    expect(groverSuccess(N, 1, 3)).toBeLessThan(groverSuccess(N, 1, 2)) // the third step overshoots
  })
  it('the trail keeps one faint arrow per step already left behind', () => {
    expect(groverOpenerFrame(0).trail).toHaveLength(0)
    expect(groverOpenerFrame(s1).trail).toHaveLength(1) // the start
    expect(groverOpenerFrame(s2).trail).toHaveLength(2)
    expect(groverOpenerFrame(s3).trail).toHaveLength(3)
    expect(groverOpenerFrame(GROVER_OPENER.stepStart[1] + 5).trail).toHaveLength(2) // mid-turn: the start and the arrow of step 1 stay
  })
  it('is continuous: no frame moves the arrow by more than a fifth of a step’s turn, and nothing jumps at a seam', () => {
    for (let f = 1; f < OPENER_FRAMES; f++) {
      const turn = Math.abs(groverOpenerFrame(f).angleDeg - groverOpenerFrame(f - 1).angleDeg)
      expect(turn).toBeLessThan((2 * alphaDeg) / 5)
    }
  })
  it('sits on the 709 Grover plane’s stage ground', () => {
    expect(GROVER_OPENER.ground).toBe('#101830')
  })
})
