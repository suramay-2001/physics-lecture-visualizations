/**
 * The §2.6 rules: interpolate inputs, recompute outputs. Every in-between frame is checked against a
 * DIRECT engine call at the same inputs, so a frame can never show a number that is false for its picture.
 */
import { describe, expect, it } from 'vitest'
import type { Beat, StageState } from '../content/stage'
import { benchTheory } from '../physics/sg'
import { KET, blochVector, prob, rotation } from '../physics/spin'
import { apply, vec } from '../physics/linalg'
import { driveUnit, slotRect, storyKinds } from './drive'
import { interpolate, slerp } from './interp'
import { DEG, resolve, validateLayout, validateStage, validateTransition } from './resolve'
import type { ResolvedBall, ResolvedBloch, ResolvedHopf, ResolvedLab, ResolvedOperator, ResolvedPlane, V3 } from './types'

const close = (a: number, b: number, eps = 1e-9) => expect(Math.abs(a - b)).toBeLessThan(eps)
const T11 = Array.from({ length: 11 }, (_, i) => i / 10)
const n3 = (v: V3) => Math.hypot(...v)

describe('resolve: observables come from the engine', () => {
  it('lab-r3: fractions equal benchTheory at the resolved tilts; chips name the kept beams', () => {
    const st: StageState = {
      kind: 'lab-r3',
      benches: [{ id: 'main', source: 'oven', devices: [{ axis: 'z', keep: '+' }, { axis: 'x', keep: '+' }, { axis: { tiltDeg: { from: 0, to: 60 } } }] }],
    }
    expect(validateStage(st)).toEqual([])
    const r = resolve(st, 0.5) as ResolvedLab
    const want = benchTheory({ source: 'oven', axes: [0, 90, 30], keep: ['+', '+'] })
    close(r.benches[0].theory.plus, want.plus)
    close(r.benches[0].theory.minus, want.minus)
    r.benches[0].theory.blocked.forEach((b, i) => close(b, want.blocked[i]))
    expect(r.benches[0].chips.map((c) => (c === 'oven' ? 'oven' : c.named))).toEqual(['oven', '+z', '+x'])
    const th = r.benches[0].theory
    close(th.plus + th.minus + th.blocked.reduce((a, b) => a + b, 0), 1)
  })

  it('lab-r3 validation: y axis, missing keep, keep on the last device, bench ids', () => {
    const bad: StageState = { kind: 'lab-r3', benches: [{ id: 'A', source: 'oven', devices: [{ axis: 'y' }, { axis: 'z', keep: '+' }] }] }
    const errs = validateStage(bad).join('\n')
    expect(errs).toMatch(/single bench has id 'main'/)
    expect(errs).toMatch(/flies along y/)
    expect(errs).toMatch(/'keep' is required/)
    expect(errs).toMatch(/last device/)
  })

  it('lab-r3 fires (interface change #2): default 1, false → 0, lerped across a transition; physics unchanged', () => {
    const two = (aFires?: boolean, bFires?: boolean): StageState => ({
      kind: 'lab-r3',
      benches: [
        { id: 'A', source: 'oven', devices: [{ axis: 'z', keep: '+' }, { axis: 'x' }], ...(aFires === undefined ? {} : { fires: aFires }) },
        { id: 'B', source: 'oven', devices: [{ axis: 'x', keep: '+', openOther: true }, { axis: 'z' }], ...(bFires === undefined ? {} : { fires: bFires }) },
      ],
    })
    const b2 = resolve(two(true, false) as never, 0) as ResolvedLab
    const b3 = resolve(two(false, true) as never, 0) as ResolvedLab
    expect([b2.benches[0].fires, b2.benches[1].fires, b3.benches[0].fires, b3.benches[1].fires]).toEqual([1, 0, 0, 1])
    expect((resolve(two() as never, 0) as ResolvedLab).benches.map((b) => b.fires)).toEqual([1, 1])
    const mid = interpolate(b2, b3, 0.5) as ResolvedLab
    expect(mid.benches.map((b) => b.fires)).toEqual([0.5, 0.5])
    // firing is presentation only: the Born fractions do not depend on it
    expect(b2.benches[1].theory).toEqual(b3.benches[1].theory)
    expect(validateStage(two(true, false))).toEqual([])
    expect(validateStage(two(false, false)).join()).toMatch(/no bench fires/)
    expect(validateStage({ ...(two(false, false) as object), flow: 'off' } as StageState)).toEqual([])
  })

  it('hilbert-plane: blochDeg is drawn at the half angle; probabilities are prob() in the frame', () => {
    const r = resolve({ kind: 'hilbert-plane', psi: { blochDeg: 90 }, basis: 'z', shadows: true }, 0) as ResolvedPlane
    close(r.psi!, Math.PI / 4)
    close(r.probs![0], 0.5)
    const x = resolve({ kind: 'hilbert-plane', psi: '+x', basis: 'x' }, 0) as ResolvedPlane
    close(x.probs![0], 1)
    close(x.probs![1], 0)
    const neg = resolve({ kind: 'hilbert-plane', psi: { neg: '+x' } }, 0) as ResolvedPlane
    close(neg.psi!, Math.PI / 4 + Math.PI)
    close(neg.probs![0], 0.5) // same physical state as |+x⟩ in the z frame
  })

  it('bloch: P(+) = (1 + n̂·r)/2 and R_z(360°) flips the ket sign but not the point', () => {
    const b = resolve({ kind: 'bloch', state: '+x', measure: 'z' }, 0) as ResolvedBloch
    close(b.pPlus!, 0.5)
    const full = resolve({ kind: 'bloch', state: '+z', rotate: { axis: 'z', angleDeg: 360 } }, 0) as ResolvedBloch
    expect(full.r.map((x) => +x.toFixed(9))).toEqual([0, 0, 1])
    close(full.ket[0].re, -1) // R_z(2π) = −I
  })

  it('bloch-ball: oven at the centre, purity (1 + |r|²)/2, mixture weights validated', () => {
    const o = resolve({ kind: 'bloch-ball', point: 'oven', recipe: true }, 0) as ResolvedBall
    close(o.rNorm, 0)
    close(o.purity, 0.5)
    expect(o.recipe!.length).toBe(2)
    const m = resolve({ kind: 'bloch-ball', point: { mix: [{ of: '+z', w: 0.5 }, { of: '+x', w: 0.5 }] }, measure: 45 }, 0) as ResolvedBall
    close(m.rNorm, Math.SQRT1_2)
    close(m.pPlus!, (1 + Math.SQRT1_2) / 2) // decision #6: 0.854 at the best axis
    expect(validateStage({ kind: 'bloch-ball', point: { mix: [{ of: '+z', w: 0.7 }] } }).join()).toMatch(/sum/)
    expect(validateStage({ kind: 'bloch-ball', point: { r: [1, 1, 0] } }).join()).toMatch(/not a state/)
  })

  it('hopf: R_z(α) moves the base by α and the bead by −α/2 along its fiber (decision #15)', () => {
    const h = resolve({ kind: 'hopf', fibers: 'one', marked: { state: '+x', rotate: { axis: 'z', angleDeg: 360 } } }, 0) as ResolvedHopf
    close(h.marked!.phi, 2 * Math.PI)
    close(h.marked!.chi, -Math.PI)
    close(h.reveal, 2)
  })

  it('operator-space: eigenvalues a₀ ± |a⃗|, class Hermitian; matrix specs compile through expr.ts', () => {
    const o = resolve({ kind: 'operator-space', op: { a0: 0.5, a: [0, 0.3, 0.4] } }, 0) as ResolvedOperator
    close(o.eig[0], 1)
    close(o.eig[1], 0)
    expect(o.cls.hermitian).toBe(true)
    const sx = resolve({ kind: 'operator-space', op: { named: 'Sx' } }, 0) as ResolvedOperator
    expect(sx.eig).toEqual([0.5, -0.5])
    // σ_y typed as entries: a⃗ = (0, 1, 0), eigenvalues ±1 (the matrix is parsed, never evaluated as code)
    const sy = resolve({ kind: 'operator-space', op: { matrix: [['0', '-i'], ['i', '0']] } }, 0) as ResolvedOperator
    expect(validateStage({ kind: 'operator-space', op: { matrix: [['0', '-i'], ['i', '0']] } })).toEqual([])
    expect([sy.valid, sy.a0, ...sy.a, ...sy.eig].map((x) => (typeof x === 'number' ? +x.toFixed(12) : x))).toEqual([true, 0, 0, 1, 0, 1, -1])
    // the projector |+z⟩⟨+z|: (a₀, a⃗) = (½, 0, 0, ½); non-Hermitian and non-compiling cells are flagged
    const p = resolve({ kind: 'operator-space', op: { matrix: [['1', '0'], ['0', '0']] } }, 0) as ResolvedOperator
    expect([p.a0, ...p.a]).toEqual([0.5, 0, 0, 0.5])
    expect(validateStage({ kind: 'operator-space', op: { matrix: [['0', '1'], ['0', '0']] } }).join()).toMatch(/not Hermitian/)
    expect(validateStage({ kind: 'operator-space', op: { matrix: [['alert(1)', '0'], ['0', '1']] } }).join()).toMatch(/does not compile/)
    expect((resolve({ kind: 'operator-space', op: { matrix: [['0', '1'], ['0', '0']] } }, 0) as ResolvedOperator).valid).toBe(false)
  })

  it('layouts never repeat a kind; transitions: antipodal Bloch needs a path', () => {
    const lab: StageState = { kind: 'lab-r3', benches: [{ id: 'main', source: 'oven', devices: [{ axis: 'z' }] }] }
    expect(validateLayout({ layout: 'split', top: lab, bottom: lab }).join()).toMatch(/repeats a kind/)
    expect(validateTransition({ kind: 'bloch', state: '+z' }, { kind: 'bloch', state: '-z' }).join()).toMatch(/antipodal/)
    expect(validateTransition({ kind: 'bloch', state: '+z' }, { kind: 'bloch', state: '-z', path: { about: 'x' } })).toEqual([])
  })
})

describe('interpolate: inputs lerped, outputs recomputed (11 t-steps)', () => {
  it('lab tilt lerp recomputes benchTheory, checked against a direct call', () => {
    const a = resolve({ kind: 'lab-r3', benches: [{ id: 'main', source: '+z', devices: [{ axis: 0 }] }] }, 0) as ResolvedLab
    const b = resolve({ kind: 'lab-r3', benches: [{ id: 'main', source: '+z', devices: [{ axis: 180 }] }] }, 0) as ResolvedLab
    for (const t of T11) {
      const m = interpolate(a, b, t) as ResolvedLab
      const deg = 180 * t // as authored: 0° → 180° passes 90°
      close(m.benches[0].tilts[0], deg * DEG)
      close(m.benches[0].theory.plus, benchTheory({ source: '+z', axes: [deg], keep: [] }).plus)
    }
  })

  it('bloch slerp never leaves S² and P(+) matches prob() at every step', () => {
    const a = resolve({ kind: 'bloch', state: '+z', measure: 'x' }, 0) as ResolvedBloch
    const b = resolve({ kind: 'bloch', state: '+y', measure: 'x' }, 0) as ResolvedBloch
    for (const t of T11) {
      const m = interpolate(a, b, t) as ResolvedBloch
      close(n3(m.r), 1)
      close(m.pPlus!, (1 + m.r[0]) / 2)
      close(m.pPlus!, prob(KET['+x'], m.ket))
    }
  })

  it('bloch shared rotation lerps the angle: R_z(0 → 360°) is a full lap and the ket ends at −|ψ⟩', () => {
    const a = resolve({ kind: 'bloch', state: '+x', rotate: { axis: 'z', angleDeg: 0 } }, 0) as ResolvedBloch
    const b = resolve({ kind: 'bloch', state: '+x', rotate: { axis: 'z', angleDeg: 360 } }, 0) as ResolvedBloch
    const half = interpolate(a, b, 0.5) as ResolvedBloch
    close(half.r[0], -1) // halfway round, not standing still
    const end = interpolate(a, b, 0.999999) as ResolvedBloch
    const want = apply(rotation([0, 0, 1], 2 * Math.PI * 0.999999), KET['+x'])
    close(end.ket[0].re, want[0].re, 1e-6)
    close(end.ket[0].re, -Math.SQRT1_2, 1e-5)
  })

  it('bloch path.about rotates about the authored axis (stays on the latitude)', () => {
    const a = resolve({ kind: 'bloch', state: '+z' }, 0) as ResolvedBloch
    const b = resolve({ kind: 'bloch', state: '-z', path: { about: 'x' } }, 0) as ResolvedBloch
    for (const t of T11) {
      const m = interpolate(a, b, t) as ResolvedBloch
      close(m.r[0], 0)
      close(n3(m.r), 1)
    }
  })

  it('bloch-ball: pure→mixed is a straight chord, pure→pure slerps, selective is a cut', () => {
    const pure = resolve({ kind: 'bloch-ball', point: '+x' }, 0) as ResolvedBall
    const oven = resolve({ kind: 'bloch-ball', point: 'oven' }, 0) as ResolvedBall
    for (const t of T11) {
      const m = interpolate(pure, oven, t) as ResolvedBall
      close(m.r[0], 1 - t)
      close(m.purity, (1 + (1 - t) ** 2) / 2)
    }
    const up = resolve({ kind: 'bloch-ball', point: '+z' }, 0) as ResolvedBall
    for (const t of T11) close((interpolate(up, pure, t) as ResolvedBall).rNorm, 1)
    const sel = resolve({ kind: 'bloch-ball', point: '+x', update: 'selective' }, 0) as ResolvedBall
    expect((interpolate(sel, up, 0.4) as ResolvedBall).r).toEqual(sel.r)
    expect((interpolate(sel, up, 0.6) as ResolvedBall).r).toEqual(up.r)
  })

  it('hopf χ is linear with no wrap (0 → 720° passes 360°); the base point slerps', () => {
    const a = resolve({ kind: 'hopf', fibers: 'one', marked: { state: '+x', globalPhaseDeg: 0 } }, 0) as ResolvedHopf
    const b = resolve({ kind: 'hopf', fibers: 'all', marked: { state: '+x', globalPhaseDeg: 720 } }, 0) as ResolvedHopf
    close((interpolate(a, b, 0.5) as ResolvedHopf).marked!.chi, 2 * Math.PI)
    close((interpolate(a, b, 0.5) as ResolvedHopf).reveal, 3.5)
    const c = resolve({ kind: 'hopf', fibers: 'one', marked: { state: '+z' } }, 0) as ResolvedHopf
    for (const t of T11) close(n3((interpolate(c, a, t) as ResolvedHopf).marked!.r), 1)
  })

  it('operator space is linear in ℝ⁴ and eigenvalues are recomputed', () => {
    const a = resolve({ kind: 'operator-space', op: { a0: 0, a: [1, 0, 0] } }, 0) as ResolvedOperator
    const b = resolve({ kind: 'operator-space', op: { a0: 1, a: [0, 0, 1] } }, 0) as ResolvedOperator
    for (const t of T11) {
      const m = interpolate(a, b, t) as ResolvedOperator
      close(m.a0, t)
      close(m.a[0], 1 - t)
      const len = Math.hypot(1 - t, t)
      close(m.eig[0], t + len)
      close(m.eig[1], t - len)
    }
  })

  it('slerp keeps length and handles antipodes', () => {
    const r = slerp([0, 0, 1], [0, 0, -1], 0.5)
    close(n3(r), 1)
    close(r[2], 0)
    expect(blochVector(vec(1, 0))).toEqual([0, 0, 1])
  })
})

describe('driveUnit: beats → frames, rects, weights, reveals', () => {
  const lab = (deg: number): StageState => ({ kind: 'lab-r3', benches: [{ id: 'main', source: '+z', devices: [{ axis: deg }] }] })
  const plane = (deg: number): StageState => ({ kind: 'hilbert-plane', psi: { blochDeg: deg } })
  const beats: Beat[] = [
    { id: 'u:b1', phase: 'lecture', text: 'a', stage: lab(0) },
    { id: 'u:b2', phase: 'books', text: 'b', stage: { layout: 'split', top: lab(90), bottom: plane(90) } },
    { id: 'u:b3', phase: 'clue', text: 'c?', stage: plane(90), reveal: { text: 'because', stage: plane(180) } },
  ]
  const box = { w: 600, h: 800 }
  const kinds = storyKinds(beats)

  it('kinds, weights and rects follow the layout; the lab view resizes full → top without a remount', () => {
    expect(kinds).toEqual(['lab-r3', 'hilbert-plane'])
    const d0 = driveUnit(beats, 0.2, true, () => 0, box, kinds)
    expect(d0.kinds.get('lab-r3')!.weight).toBe(1)
    expect(d0.kinds.get('hilbert-plane')!.weight).toBe(0)
    const mid = driveUnit(beats, 1, true, () => 0, box, kinds)
    const l = mid.kinds.get('lab-r3')!
    expect(l.t).toBe(0.5)
    expect(l.rect[3]).toBeCloseTo((800 + slotRect('top', 600, 800)[3]) / 2, 9)
    expect(mid.kinds.get('hilbert-plane')!.weight).toBe(0.5)
    const d1 = driveUnit(beats, 1.5, true, () => 0, box, kinds)
    expect(d1.kinds.get('lab-r3')!.rect).toEqual(slotRect('top', 600, 800))
    expect(d1.kinds.get('hilbert-plane')!.rect).toEqual(slotRect('bottom', 600, 800))
    // the in-between lab frame is physics-consistent: fractions at the lerped tilt
    const m = mid.kinds.get('lab-r3')!.state as ResolvedLab
    close(m.benches[0].theory.plus, benchTheory({ source: '+z', axes: [45], keep: [] }).plus)
  })

  it('a clue holds the question picture until revealed; the reveal is a click-driven transition', () => {
    const q = driveUnit(beats, 2.5, true, () => 0, box, kinds)
    close((q.kinds.get('hilbert-plane')!.state as ResolvedPlane).psi!, Math.PI / 4)
    expect(q.revealed).toBe(false)
    const half = driveUnit(beats, 2.5, true, (i) => (i === 2 ? 0.5 : 0), box, kinds)
    expect(half.kinds.get('hilbert-plane')!.t).toBe(0.5)
    close((half.kinds.get('hilbert-plane')!.state as ResolvedPlane).psi!, (3 * Math.PI) / 8)
    const done = driveUnit(beats, 2.5, true, (i) => (i === 2 ? 1 : 0), box, kinds)
    close((done.kinds.get('hilbert-plane')!.state as ResolvedPlane).psi!, Math.PI / 2)
    expect(done.revealed).toBe(true)
    // reduced motion: the reveal is a cut
    const cut = driveUnit(beats, 2.5, false, (i) => (i === 2 ? 0.4 : 0), box, kinds)
    expect(cut.kinds.get('hilbert-plane')!.t).toBe(0)
  })
})
