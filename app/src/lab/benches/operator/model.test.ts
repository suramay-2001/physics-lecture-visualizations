/**
 * The Operator Lab's numbers against direct engine calls and hand values (P truth: every readout comes from
 * app/src/physics). Hand values: S_x eigenvalues ±½; U(2π) = −I for A = S_z; [S_x, S_y] = iS_z, whose arrow ẑ/2 makes
 * the drawn a⃗ × b⃗ point along ẑ; S_z written in the x basis is [[0, ½], [½, 0]].
 */
import { describe, expect, it } from 'vitest'
import { c, type C } from '../../../physics/complex'
import { apply, commutator, identity, matEq, mscale, type Mat, type Vec } from '../../../physics/linalg'
import { decompose, eigen2, unitaryAction } from '../../../physics/operators'
import { blochVector, expectation, KET, prob, rotateBloch, samePhysicalState, spread, SX, SY, SZ, type Vec3 } from '../../../physics/spin'
import { presetFrom } from '../../presets'
import {
  A_MAX,
  aFromTip,
  arcPoints,
  cellsOf,
  cellText,
  checkGuess,
  drawScaleFor,
  inBasis,
  INITIAL_PARAMS,
  matrixOf,
  OP_PRESETS,
  operatorModel,
  parseCells,
  presetMatrix,
  presetParams,
  PSI_NAMED,
  psi0FromPoint,
  SETUPS,
  tauFromBead,
  tauText,
  TRY_THIS,
  type OperatorModel,
  type OperatorParams,
  type OpPresetId,
} from './model'

const P = (patch: Partial<OperatorParams>): OperatorParams => ({ ...INITIAL_PARAMS, ...patch })
const withPreset = (id: OpPresetId, patch: Partial<OperatorParams> = {}): OperatorParams => {
  const { a0, a } = presetParams(id)
  return P({ preset: id, a0, a, unit: OP_PRESETS.find((p) => p.id === id)!.unit, ...patch })
}
const text = (m: OperatorModel, key: string) => [...m.readouts.op, ...m.readouts.state].find((r) => r.key === key)?.text
const near = (a: readonly number[], b: readonly number[], eps = 1e-12) => a.length === b.length && a.every((x, i) => Math.abs(x - b[i]) < eps)
const cnear = (a: C, b: C, eps = 1e-12) => Math.abs(a.re - b.re) < eps && Math.abs(a.im - b.im) < eps

describe('presets are the engine’s operators', () => {
  it('S_x: eigenvalues ±½ (±ħ/2), eigenvectors |±x⟩, â = x̂, Hermitian', () => {
    const m = operatorModel(withPreset('sx'))
    expect(matEq(m.M, SX)).toBe(true)
    expect(m.eig.values.map((z) => z.re)).toEqual([0.5, -0.5])
    expect(text(m, 'lam+')).toBe('λ₊ = +0.5 ħ')
    expect(text(m, 'lam-')).toBe('λ₋ = −0.5 ħ')
    expect(samePhysicalState(m.eig.vectors[0], KET['+x'])).toBe(true)
    expect(samePhysicalState(m.eig.vectors[1], KET['-x'])).toBe(true)
    expect(text(m, 'vec0')).toBe('|λ₊⟩ = (1/√2, 1/√2)')
    expect(text(m, 'vec1')).toBe('|λ₋⟩ = (1/√2, −1/√2)')
    expect(m.axis).toEqual([1, 0, 0])
    expect(text(m, 'class')).toMatch(/^Hermitian/)
  })

  it('every preset: λ± = a₀ ± |a⃗| (engine eigen2), â = a⃗/|a⃗|, the matrix is the engine’s', () => {
    for (const p of OP_PRESETS) {
      const m = operatorModel(withPreset(p.id))
      expect(matEq(m.M, presetMatrix(p.id)), p.id).toBe(true)
      const e = eigen2(presetMatrix(p.id))
      expect(cnear(m.eig.values[0], e.values[0]) && cnear(m.eig.values[1], e.values[1]), p.id).toBe(true)
      expect(Math.abs(e.values[0].re - (m.a0 + m.len)) < 1e-12 && Math.abs(e.values[1].re - (m.a0 - m.len)) < 1e-12, p.id).toBe(true)
      if (m.len > 0) expect(near(m.axis!, m.a.map((x) => x / m.len)), p.id).toBe(true)
    }
  })

  it('|+z⟩⟨+z| is the point a₀ = ½, a⃗ = ẑ/2 with eigenvalues 1 and 0, and carries no ħ', () => {
    const m = operatorModel(withPreset('proj-z'))
    expect(m.a0).toBeCloseTo(0.5, 12)
    expect(near(m.a, [0, 0, 0.5])).toBe(true)
    expect(text(m, 'lam+')).toBe('λ₊ = +1')
    expect(text(m, 'lam-')).toBe('λ₋ = 0')
    expect(text(m, 'class')).toContain('projector')
  })

  it('I: one eigenvalue for every state, no axis, no turn (only the phase −τ)', () => {
    const m = operatorModel(withPreset('identity', { tau: Math.PI / 2 }))
    expect(m.axis).toBeNull()
    expect(text(m, 'lam')).toBe('λ = +1 for every state')
    expect(m.eigenstate).toBe(true)
    expect(text(m, 'turn')).toBe('no turn (A = a₀I)')
    expect(text(m, 'phase')).toBe('phase −a₀τ = −90°')
  })
})

describe('the turn U(τ) = e^{−iτA} (engine unitaryAction)', () => {
  it('A = S_z: U(2π) = −I; from |+x⟩ one lap (τ = 2π) is home with the ket −|+x⟩, two laps give +|+x⟩', () => {
    const lap = operatorModel(withPreset('sz', { psi0: PSI_NAMED('+x'), tau: 2 * Math.PI }))
    expect(matEq(lap.act!.U, mscale(identity(2), -1))).toBe(true)
    expect(lap.act!.angle).toBeCloseTo(2 * Math.PI, 12)
    expect(near(lap.r, [1, 0, 0], 1e-12)).toBe(true)
    expect(text(lap, 'after')).toBe('after: (−1/√2, −1/√2)')
    expect(text(lap, 'home')).toBe('same point as ψ₀ · ket = −ψ₀')
    expect(text(lap, 'turn')).toBe('turn 360° (1 lap) about â')
    const two = operatorModel(withPreset('sz', { psi0: PSI_NAMED('+x'), tau: 4 * Math.PI }))
    expect(matEq(two.act!.U, identity(2))).toBe(true)
    expect(text(two, 'home')).toBe('same point as ψ₀ · ket = +ψ₀')
    expect(text(two, 'after')).toBe('after: (1/√2, 1/√2)')
  })

  it('the Try this is true as worded: for S_z the turn angle is τ, so one lap of the point is τ = 2π', () => {
    expect(TRY_THIS).toContain('\\tau = 2\\pi')
    expect(TRY_THIS).toContain('\\tau = 4\\pi')
    const setup = SETUPS['sz-lap']
    expect(setup).toMatchObject({ A: 'sz', psi0: '+x', tau: 0 })
    const m = operatorModel(withPreset('sz', { psi0: PSI_NAMED('+x'), tau: 2 * Math.PI }))
    expect(m.act!.angle).toBeCloseTo(2 * Math.PI, 12)
  })

  it('the bead is U(τ)ψ₀ and sits where â turns r₀ by 2|a⃗|τ (engine rotateBloch); ⟨A⟩, P(λ₊), ΔA are the engine’s', () => {
    for (const id of ['sx', 'sy', 'sz', 'sn', 'hadamard', 'proj-z'] as OpPresetId[])
      for (const k of ['+z', '-x', '+y'] as const)
        for (const tau of [0, 0.3, Math.PI / 2, 2.2, 5]) {
          const m = operatorModel(withPreset(id, { psi0: PSI_NAMED(k), tau }))
          const act = unitaryAction(m.M, tau)!
          const psi = apply(act.U, KET[k])
          expect(near(m.r, blochVector(psi), 1e-12)).toBe(true)
          expect(near(m.r, rotateBloch(act.axis!, act.angle, blochVector(KET[k])), 1e-9), `${id} ${k} ${tau}`).toBe(true)
          expect(m.stats!.mean).toBeCloseTo(expectation(m.M, psi), 12)
          expect(m.stats!.pPlus).toBeCloseTo(prob(eigen2(m.M).vectors[0], psi), 12)
          expect(m.stats!.spread).toBeCloseTo(spread(m.M, psi), 12)
          // A commutes with U: the statistics are the same on ψ₀
          expect(m.stats!.mean).toBeCloseTo(expectation(m.M, KET[k]), 9)
        }
  })

  it('S_x from |+z⟩: ⟨A⟩ = 0, P(λ₊) = ½, ΔA = ħ/2; a quarter turn takes the bead to −ŷ', () => {
    const m = operatorModel(withPreset('sx', { psi0: PSI_NAMED('+z'), tau: Math.PI }))
    expect(text(m, 'mean')).toBe('⟨A⟩ = 0 · ΔA = 0.5 ħ')
    expect(text(m, 'pplus')).toBe('P(λ₊) = 0.500')
    // angle 2·½·π = π about x: +z → −z
    expect(near(m.r, [0, 0, -1], 1e-12)).toBe(true)
    const q = operatorModel(withPreset('sx', { psi0: PSI_NAMED('+z'), tau: Math.PI / 2 }))
    expect(near(q.r, [0, -1, 0], 1e-12)).toBe(true)
    expect(text(q, 'U-head')).toBe('U = exp(−iτA/ħ) · τ = π/2')
  })

  it('an eigenstate’s orbit is a point: only the phase changes (ket = e^{−iλτ}ψ₀)', () => {
    const m = operatorModel(withPreset('sz', { psi0: PSI_NAMED('+z'), tau: 1 }))
    expect(m.eigenstate).toBe(true)
    expect(m.orbit).toBeNull()
    expect(m.view.draggable.bead).toBe(false)
    expect(text(m, 'eigen')).toBe('ψ₀ is an eigenstate: only the phase changes')
    const expected: Vec = [c(Math.cos(-0.5), Math.sin(-0.5)), c(0)]
    expect(cnear(m.psi[0], expected[0]) && cnear(m.psi[1], expected[1])).toBe(true)
    expect(text(m, 'home')).toBe('same point as ψ₀ · ket = exp(iχ)·ψ₀, χ = −29°')
  })

  it('the arc has ≤ one lap of points, from ψ₀ to the bead', () => {
    const m = operatorModel(withPreset('sz', { psi0: PSI_NAMED('+x'), tau: Math.PI / 2 }))
    expect(near(m.view.arc[0], [1, 0, 0])).toBe(true)
    expect(near(m.view.arc[m.view.arc.length - 1], m.r, 1e-12)).toBe(true)
    expect(arcPoints([0, 0, 1], 9, [1, 0, 0]).length).toBe(73)
  })
})

describe('commutator mode: [A, B]/2i is the arrow a⃗ × b⃗', () => {
  it('[S_x, S_y] = iS_z (arrow ẑ/2), so the drawn a⃗ × b⃗ = ẑ/4 points along ẑ; not compatible', () => {
    const K = decompose(commutator(SX, SY))
    expect(cnear(K.a0, c(0)) && cnear(K.a[0], c(0)) && cnear(K.a[1], c(0)) && cnear(K.a[2], c(0, 0.5))).toBe(true)
    const m = operatorModel(withPreset('sx', { B: 'sy' }))
    expect(near(m.comm!.cross!, [0, 0, 0.25])).toBe(true)
    expect(m.comm!.compatible).toBe(false)
    expect(text(m, 'comm')).toBe('[A,B]/2i: a×b = (0, 0, 0.25)')
    expect(text(m, 'compat')).toBe('compatible ([A,B] = 0 ⇔ a ∥ b): no')
    expect(m.view.cross).toEqual(m.comm!.cross)
  })
  it('parallel arrows commute (S_z with S_z, and with |+z⟩⟨+z|)', () => {
    for (const B of ['sz', 'proj-z'] as OpPresetId[]) {
      const m = operatorModel(withPreset('sz', { B }))
      expect(m.comm!.compatible, B).toBe(true)
      expect(near(m.comm!.cross!, [0, 0, 0])).toBe(true)
    }
  })
  it('a⃗ × b⃗ equals the engine commutator for any pair of presets', () => {
    for (const A of OP_PRESETS)
      for (const B of OP_PRESETS) {
        const m = operatorModel(withPreset(A.id, { B: B.id }))
        const k = decompose(commutator(presetMatrix(A.id), presetMatrix(B.id)))
        expect(near(m.comm!.cross!, k.a.map((z) => z.im / 2)), `${A.id} ${B.id}`).toBe(true)
        expect(k.a.every((z) => Math.abs(z.re) < 1e-12)).toBe(true)
      }
  })
})

describe('display basis: the matrix changes, the picture does not', () => {
  it('S_z in the x basis is [[0, ½], [½, 0]]; in the y basis too', () => {
    const x = inBasis(SZ, 'x')
    expect(matEq(x, [[c(0), c(0.5)], [c(0.5), c(0)]] as Mat)).toBe(true)
    const m = operatorModel(withPreset('sz', { basis: 'x' }))
    expect(text(m, 'A-head')).toBe('A in the x basis (units of ħ)')
    expect(text(m, 'A-0')).toBe('[ 0    1/2 ]')
    expect(text(m, 'A-1')).toBe('[ 1/2  0   ]')
  })
  it('the view is the same in z, x and y', () => {
    const views = (['z', 'x', 'y'] as const).map((basis) => operatorModel(withPreset('sn', { basis, psi0: PSI_NAMED('+y'), tau: 1 })).view)
    expect(views[1]).toEqual(views[0])
    expect(views[2]).toEqual(views[0])
  })
  it('kets are shown in the display basis: |+x⟩ is (1, 0) in the x basis', () => {
    const m = operatorModel(withPreset('sx', { basis: 'x', psi0: PSI_NAMED('+x'), tau: 0 }))
    expect(text(m, 'before')).toBe('before: (1, 0)')
  })
})

describe('typed cells (parseMatrix2)', () => {
  it('cellText writes what the parser reads back; cells round-trip in every basis', () => {
    expect(cellText(c(0.5, 0))).toBe('0.5')
    expect(cellText(c(0, -0.5))).toBe('-0.5i')
    expect(cellText(c(0, 1))).toBe('i')
    expect(cellText(c(0.25, -0.433))).toBe('0.25 - 0.433i')
    for (const id of OP_PRESETS.map((p) => p.id))
      for (const basis of ['z', 'x', 'y'] as const) {
        const M = presetMatrix(id)
        const res = parseCells(cellsOf(M, basis), basis)
        expect(res.ok, `${id} ${basis}`).toBe(true)
        if (res.ok) expect(matEq(res.M, M, 1e-4), `${id} ${basis}`).toBe(true)
      }
  })
  it('a typed non-Hermitian matrix: complex eigenvalues shown, silver outline, no turn, no bead', () => {
    const res = parseCells(
      [
        ['0', '-1'],
        ['1', '0'],
      ],
      'z',
    )
    expect(res.ok).toBe(true)
    const m = operatorModel(P({ source: 'cells', typed: res.ok ? res.M : null, unit: 'none' }))
    expect(m.hermitian).toBe(false)
    expect(m.view.outline).toBe(true)
    expect(m.act).toBeNull()
    expect(m.view.showBead).toBe(false)
    expect(text(m, 'nonherm')).toBe('a has imaginary parts: not Hermitian')
    expect(text(m, 'lam+')).toBe('λ₁ = i')
    expect(text(m, 'lam-')).toBe('λ₂ = −i')
    expect(text(m, 'nounitary')).toBe('A is not Hermitian: exp(−iτA) is not a turn')
    expect(m.view.axis).toBeNull()
  })
  it('a cell that does not parse reports its cell, the caret position and the reason', () => {
    const res = parseCells(
      [
        ['0', '1 +'],
        ['1', '0'],
      ],
      'z',
    )
    expect(res.ok).toBe(false)
    if (!res.ok) {
      expect(res.error.cell).toEqual([0, 1])
      expect(res.error.reason).toBe('unexpected-end')
      expect(res.error.pos).toBeGreaterThanOrEqual(2)
    }
    const bad = parseCells(
      [
        ['0', 'alert(1)'],
        ['1', '0'],
      ],
      'z',
    )
    expect(bad.ok).toBe(false)
  })
  it('the typed matrix in another basis is converted to z (S_x typed in the y basis)', () => {
    const cells = cellsOf(SX, 'y')
    const res = parseCells(cells, 'y')
    expect(res.ok && matEq(res.M, SX, 1e-4)).toBe(true)
    expect(matrixOf(P({ source: 'cells', typed: res.ok ? res.M : null }))).toBe(res.ok ? res.M : null)
  })
})

describe('drags → parameters', () => {
  it('the tip: a⃗ = p / scale, capped at |a⃗| = 3', () => {
    expect(aFromTip([0.2, 0, 0.4], 1)).toEqual([0.2, 0, 0.4])
    expect(aFromTip([0.5, 0, 0], 0.5)).toEqual([1, 0, 0])
    const far = aFromTip([10, 0, 0], 1)
    expect(Math.hypot(...far)).toBeCloseTo(A_MAX, 12)
  })
  it('the tip scale is frozen while dragging (no jump across |a⃗| = 1.5)', () => {
    expect(drawScaleFor([1.4])).toBe(1)
    expect(drawScaleFor([2])).toBe(0.5)
    expect(drawScaleFor([100])).toBeCloseTo(0.015, 12)
    expect(operatorModel(P({ a: [2, 0, 0], frozenScale: 1 })).scale).toBe(1)
  })
  it('ψ₀: a point of the sphere → Bloch angles; within 4° of a named ket it snaps onto it', () => {
    expect(psi0FromPoint([0.999, 0.03, 0]).named).toBe('+x')
    const free = psi0FromPoint([0, Math.SQRT1_2, Math.SQRT1_2])
    expect(free.named).toBeNull()
    expect(free.theta).toBeCloseTo(Math.PI / 4, 12)
    expect(free.phi).toBeCloseTo(Math.PI / 2, 12)
  })
  it('the bead: the angle about â unwraps past a lap (S_z from |+x⟩: +y → π/2, … → 2π, then on)', () => {
    let s = withPreset('sz', { psi0: PSI_NAMED('+x'), tau: 0 })
    const path: Vec3[] = [
      [0.7, 0.7, 0],
      [0, 1, 0],
      [-1, 0.01, 0],
      [-0.1, -1, 0],
      [1, -0.02, 0],
      [0.02, 1, 0],
    ]
    const taus: number[] = []
    for (const p of path) {
      s = { ...s, tau: tauFromBead(operatorModel(s), p, s.tau) }
      taus.push(s.tau)
    }
    expect(taus[0]).toBeCloseTo(Math.PI / 4, 12)
    expect(taus[1]).toBeCloseTo(Math.PI / 2, 12)
    expect(taus[2]).toBeCloseTo(Math.PI, 12) // snapped onto the half turn
    expect(taus[4]).toBeCloseTo(2 * Math.PI, 12) // one lap, exactly: the Try this
    expect(taus[5]).toBeCloseTo(2.5 * Math.PI, 12)
    // dragging backwards below ψ₀ stops at τ = 0
    const back = tauFromBead(operatorModel(withPreset('sz', { psi0: PSI_NAMED('+x'), tau: 0 })), [0.7, -0.7, 0], 0)
    expect(back).toBe(0)
  })
})

describe('Predict first (off by default)', () => {
  it('off: results at once; on: λ, â, the arrow and the turn stay hidden until revealed', () => {
    expect(INITIAL_PARAMS.predict).toBe(false)
    const hidden = operatorModel(withPreset('sy', { predict: true, revealed: false }))
    expect(text(hidden, 'lam+')).toBeUndefined()
    expect(text(hidden, 'after')).toBeUndefined()
    expect(hidden.view.showArrow).toBe(false)
    expect(hidden.view.axis).toBeNull()
    expect(hidden.view.gauge).toEqual({ a0: null, plus: null, minus: null })
    const shown = operatorModel(withPreset('sy', { predict: true, revealed: true }))
    expect(text(shown, 'lam+')).toBe('λ₊ = +0.5 ħ')
  })
  it('a prediction is checked against the engine’s eigenvalues, in either order, within 0.01', () => {
    const e = eigen2(SY)
    expect(checkGuess(['1/2', '-1/2'], e).ok).toEqual([true, true])
    expect(checkGuess(['-0.5', '0.5'], e).ok).toEqual([true, true])
    expect(checkGuess(['1', '-0.5'], e).ok).toEqual([false, true])
    expect(checkGuess(['i', '-i'], eigen2([[c(0), c(-1)], [c(1), c(0)]])).ok).toEqual([true, true])
    expect(checkGuess(['', 'x'], e).ok).toEqual([false, false])
  })
})

describe('deep-link setups: an allowlist', () => {
  it('each setup id is allowlisted; crafted ids are not', () => {
    for (const id of Object.keys(SETUPS)) expect(presetFrom(SETUPS, id)).toBe(id)
    for (const bad of ['constructor', '__proto__', 'toString', 'hasOwnProperty', 'sx ', 'SX', 'sx&a0=5', 'sx;a0=5', '', 'x'.repeat(40)])
      expect(presetFrom(SETUPS, bad), bad).toBeNull()
  })
  it('τ readouts in π form where exact', () => {
    expect(tauText(Math.PI / 2)).toBe('π/2')
    expect(tauText(2 * Math.PI)).toBe('2π')
    expect(tauText(3 * Math.PI / 4)).toBe('3π/4')
    expect(tauText(Math.PI)).toBe('π')
    expect(tauText(1)).toBe('1')
    expect(tauText(0)).toBe('0')
  })
})
