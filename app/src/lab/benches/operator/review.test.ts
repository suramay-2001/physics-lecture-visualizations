/**
 * The independent P review of the Operator Lab (docs/roles/audits/P-oplab-review.md, 2026-09-27): a test per
 * finding that pins the reviewed defect's absence (the reviewed code shows each of them: the texts, the leaks, the
 * units). Item 1, the crash, is crash.test.ts (its sweeps were run against the reviewed model: all four threw); the
 * label clashes of items 3 and 12 are measured on the page in e2e/lab.spec.ts. Hand values in the comments.
 */
import { describe, expect, it } from 'vitest'
import { c } from '../../../physics/complex'
import { dagger, identity, matEq, matmul, type Mat } from '../../../physics/linalg'
import { eigen2 } from '../../../physics/operators'
import { blochVector, expectation, KET, ketFromBloch, prob, spread, type NamedKet } from '../../../physics/spin'
import { cnumSig, commaChunks, sig, withHbarPow } from '../../format'
import { classReadout } from '../../../stage/scenes/operator/opLabels'
import { OPERATOR_FIDELITY } from './fidelity'
import { labelsOf, poleEnd } from './labels'
import {
  classLine,
  INITIAL_PARAMS,
  OP_PRESETS,
  operatorModel,
  parseCells,
  presetParams,
  PSI_NAMED,
  statsFromBloch,
  type Cells,
  type OperatorModel,
  type OperatorParams,
  type OpPresetId,
} from './model'

const P = (patch: Partial<OperatorParams>): OperatorParams => ({ ...INITIAL_PARAMS, ...patch })
const withPreset = (id: OpPresetId, patch: Partial<OperatorParams> = {}): OperatorParams => P({ preset: id, ...presetParams(id), ...patch })
const typed = (cells: Cells, patch: Partial<OperatorParams> = {}): OperatorParams => {
  const res = parseCells(cells, 'z')
  if (!res.ok) throw new Error('cells')
  return P({ source: 'cells', cells, cellVals: res.D, typed: res.M, preset: null, ...patch })
}
const all = (m: OperatorModel) => [...m.readouts.op, ...m.readouts.state]
const text = (m: OperatorModel, key: string) => all(m).find((r) => r.key === key)?.text
const KETS = Object.keys(KET) as NamedKet[]
/** [[1, 2], [0, −1]]: real eigenvalues ±1, not Hermitian, not normal (|⟨λ₁|λ₂⟩|² = ½). */
const UPPER: Cells = [
  ['1', '2'],
  ['0', '-1'],
]
/** [[0, −1], [1, 0]]: eigenvalues ±i. */
const ROT: Cells = [
  ['0', '-1'],
  ['1', '0'],
]
const SPIN: OpPresetId[] = ['sx', 'sy', 'sz', 'sn']
const PLAIN: OpPresetId[] = ['proj-z', 'hadamard', 'identity']

describe('item 1 (the fix): ⟨A⟩, ΔA, P(λ₊) from the Bloch vector equal the engine’s expectation, spread and prob', () => {
  it('random Hermitian A (entries ≤ 3) on random states: agree to 1e-9', () => {
    let seed = 7
    const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31) * 2 - 1
    for (let n = 0; n < 300; n++) {
      const a0 = 3 * rnd()
      const a: [number, number, number] = [3 * rnd(), 3 * rnd(), 3 * rnd()]
      const M: Mat = [
        [c(a0 + a[2]), c(a[0], -a[1])],
        [c(a[0], a[1]), c(a0 - a[2])],
      ]
      const psi = ketFromBloch(Math.acos(rnd()), Math.PI * rnd())
      const s = statsFromBloch(a0, a, blochVector(psi))
      expect(s.mean).toBeCloseTo(expectation(M, psi), 9)
      expect(s.spread).toBeCloseTo(spread(M, psi), 6) // the engine's √(⟨A²⟩ − ⟨A⟩²) loses digits near 0
      expect(s.pPlus).toBeCloseTo(prob(eigen2(M).vectors[0], psi), 9)
    }
  })
})

describe('item 2: a non-Hermitian A never says "eigenstate"', () => {
  it('from every named ket, including the true eigenvectors of A (|+z⟩ for [[1,2],[0,−1]]): "no turn: A is not Hermitian"', () => {
    for (const cells of [UPPER, ROT])
      for (const k of KETS) {
        const m = operatorModel(typed(cells, { psi0: PSI_NAMED(k) }))
        expect(m.hermitian).toBe(false)
        expect(m.eigenstate).toBe(false)
        expect(m.twins.bead.disabled).toBe(true)
        expect(m.twins.bead.disabledText).toBe('no turn: A is not Hermitian')
        expect([...all(m).map((r) => r.text), m.twins.bead.value, m.twins.bead.disabledText].join(' | ')).not.toMatch(/eigenstate/)
      }
    // a Hermitian A still says it, for its eigenstate only
    const sz = operatorModel(withPreset('sz', { psi0: PSI_NAMED('+z') }))
    expect(sz.twins.bead.disabledText).toBe('ψ₀ is an eigenstate: only the phase changes')
  })
})

describe('item 3 and 12: label specs (the placement is measured in e2e)', () => {
  it('[A,B]/2i is anchored at the midpoint of its arrow, not past its tip', () => {
    const m = operatorModel(withPreset('sx', { B: 'sy' }))
    const cross = labelsOf(m).find((l) => l.key === 'cross')!
    // a⃗ × b⃗ = ẑ/4, drawn at scale 1: midpoint (0, 0, 0.125)
    expect(cross.at).toEqual([0, 0, 0.125])
  })
  it('S_x: â is the pole +x, so the pole labels read "|λ₊⟩ = |+x⟩" and "|λ₋⟩ = |−x⟩" and the separate ket labels go', () => {
    const L = labelsOf(operatorModel(withPreset('sx')))
    expect(L.find((l) => l.key === 'pole+x')!.text).toBe('$|\\lambda_+\\rangle = |{+x}\\rangle$')
    expect(L.find((l) => l.key === 'pole-x')!.text).toBe('$|\\lambda_-\\rangle = |{-x}\\rangle$')
    expect(L.find((l) => l.key === 'ket+')!.at).toBeNull()
    expect(L.find((l) => l.key === 'ket-')!.at).toBeNull()
    // S_z: +z is λ₊; a dragged â 5° off a pole is not merged (the "=" would be false): the avoidance pass separates them
    expect(poleEnd([0, 0, 1], '+z')).toBe('+')
    expect(poleEnd([0, 0, 1], '-z')).toBe('-')
    const off: [number, number, number] = [Math.sin(0.087), 0, Math.cos(0.087)]
    expect(poleEnd(off, '+z')).toBeNull()
    const Loff = labelsOf(operatorModel(P({ preset: null, a: [0.5 * off[0], 0, 0.5 * off[2]] })))
    expect(Loff.find((l) => l.key === 'ket+')!.at).not.toBeNull()
    expect(Loff.find((l) => l.key === 'pole+z')!.text).toBe('$|{+z}\\rangle$')
    // every label has a view (the rect it stays inside) and a priority; the state and the bead are placed first
    for (const l of L) {
      expect(l.view, l.key).toMatch(/^(op|state)$/)
      expect(typeof l.priority, l.key).toBe('number')
    }
    expect(L.find((l) => l.key === 'psi0')!.priority).toBe(0)
  })
})

describe('item 4 and 16: the fidelity note', () => {
  it('the turn, not "a unitary", is what is not drawn; the gauge shows Re a₀; a lap can change sign and phase', () => {
    const f = [...OPERATOR_FIDELITY.exact, ...OPERATOR_FIDELITY.schematic, ...OPERATOR_FIDELITY.misleading]
    const t = (id: string) => f.find((i) => i.id === id)!.text
    expect(t('lab-op-unitary')).toMatch(/^The turn \$U\(\\tau\) = e\^\{-i\\tau A\}\$ is not drawn in operator space/)
    expect(t('lab-op-outline')).toMatch(/the gauge only the real part of \$a_0\$/)
    expect(t('lab-op-global-phase')).toMatch(/changed sign \(and phase \$e\^\{-ia_0\\tau\}\$\)/)
  })
})

describe('item 5: a non-Hermitian A: "not unitary in general", never "not a turn"', () => {
  it('A = S_x + 0.3i·I is a turn times a growth factor; the readout does not call it "not a turn"', () => {
    const cells: Cells = [
      ['0.3i', '0.5'],
      ['0.5', '0.3i'],
    ]
    const m = operatorModel(typed(cells))
    expect(m.hermitian).toBe(false)
    expect(text(m, 'nounitary')).toBe('A is not Hermitian: exp(−iτA) is not unitary in general, so no turn is drawn')
    expect(all(m).some((r) => /not a turn/.test(r.text))).toBe(false)
  })
})

describe('item 6: Predict first hides everything that gives the eigenvalues away', () => {
  it('the bead twin: no turn angle, no "eigenstate"; the tip twin hidden; no non-Hermitian lines; no outline', () => {
    for (const id of OP_PRESETS.map((q) => q.id))
      for (const k of ['+z', '+x'] as NamedKet[]) {
        const m = operatorModel(withPreset(id, { predict: true, revealed: false, psi0: PSI_NAMED(k) }))
        expect(m.pending).toBe(true)
        expect(m.twins.bead.value).toBe('τ = π/2')
        expect(m.twins.bead.disabledText).toBe('hidden until you check')
        expect(m.twins.tip.disabled).toBe(true)
        expect(JSON.stringify(m.twins)).not.toMatch(/turn|eigenstate/)
      }
    for (const cells of [UPPER, ROT]) {
      const m = operatorModel(typed(cells, { predict: true, revealed: false }))
      expect(m.readouts.op.map((r) => r.key)).toEqual(['A-head', 'A-0', 'A-1', 'pending'])
      expect(m.readouts.state.map((r) => r.key)).toEqual(['psi0', 'basis', 'before'])
      expect(JSON.stringify(m.readouts)).not.toMatch(/Hermitian|unitary|imaginary/)
      expect(m.view.outline).toBe(false)
      expect(m.twins.bead.disabledText).toBe('hidden until you check')
    }
    // revealed: the turn is back
    const shown = operatorModel(withPreset('sx', { predict: true, revealed: true }))
    expect(shown.twins.bead.value).toBe('τ = π/2, turn 90°')
  })
})

describe('item 7: units — a spin preset carries ħ in every readout, every other A in none', () => {
  // the readouts that are quantities of A (or B, or both), and must carry their unit
  const DIM = ['a0', 'a', 'len', 'lam', 'lam+', 'lam-', 'mean', 'b', 'comm']
  const zero = (t: string) => /= 0$/.test(t)
  it('spin presets: ħ on each dimensioned readout (a⃗ too), ħ² on a⃗ × b⃗, /ħ in U and the overall factor', () => {
    for (const id of SPIN) {
      const m = operatorModel(withPreset(id, { B: 'sy', psi0: PSI_NAMED('+y') }))
      for (const r of all(m).filter((r) => DIM.includes(r.key))) expect(zero(r.text) || / ħ²?$/.test(r.text) || /ħ · ΔA = .* ħ$/.test(r.text), `${id} ${r.key}: ${r.text}`).toBe(true)
      expect(text(m, 'a')).toMatch(/\) ħ$/)
      expect(text(m, 'A-head')).toMatch(/\(units of ħ\)$/)
      expect(text(m, 'U-head')).toMatch(/exp\(−iτA\/ħ\)/)
      expect(text(m, 'phase')).toMatch(/^overall factor exp\(−ia₀τ\/ħ\), −a₀τ\/ħ = /)
      if (m.comm!.cross!.some((x) => Math.abs(x) > 0.005)) expect(text(m, 'comm')).toMatch(/ ħ²$/)
    }
    expect(text(operatorModel(withPreset('sx', { B: 'sy' })), 'b')).toBe('B = S_y · b = (0, 0.5, 0) ħ')
  })
  it('plain presets, and any A after a drag, a slider or a typed cell: no ħ anywhere; b⃗ keeps B’s own unit', () => {
    const plain = [
      ...PLAIN.map((id) => withPreset(id)),
      // S_x after a drag of the tip (preset gone) and after a typed cell (its own matrix, typed)
      P({ preset: null, a: [0.6, 0.1, 0.2] }),
      typed([
        ['0', '0.5'],
        ['0.5', '0'],
      ]),
      typed(UPPER),
    ]
    for (const p of plain) {
      const m = operatorModel(p)
      expect(all(m).map((r) => r.text).join(' | '), JSON.stringify(p.cells)).not.toMatch(/ħ/)
      expect(m.twins.tip.value).not.toMatch(/ħ/)
    }
    // a plain A with a spin B: b⃗ in ħ, a⃗ × b⃗ in ħ (one power)
    const m = operatorModel(withPreset('proj-z', { B: 'sx' }))
    expect(text(m, 'b')).toBe('B = S_x · b = (0.5, 0, 0) ħ')
    expect(text(m, 'comm')).toBe('[A,B]/2i: a×b = (0, 0.25, 0) ħ')
    expect(withHbarPow('0', 2)).toBe('0')
  })
})

describe('item 8: the overall factor is named as such, beside the eigenstate’s own phase', () => {
  it('S_z from |+z⟩ at τ = π/2: the factor e^{−ia₀τ} is 0° while the ket turns by χ = −45°', () => {
    const m = operatorModel(withPreset('sz', { psi0: PSI_NAMED('+z'), tau: Math.PI / 2 }))
    expect(text(m, 'phase')).toBe('overall factor exp(−ia₀τ/ħ), −a₀τ/ħ = 0°')
    expect(text(m, 'eigen')).toBe('ψ₀ is an eigenstate: only the phase changes')
    expect(text(m, 'home')).toBe('same point as ψ₀ · ket = exp(iχ)·ψ₀, χ = −45°')
    expect(all(m).some((r) => /^phase /.test(r.text))).toBe(false)
  })
})

describe('item 9: a non-normal A says its eigenvectors are not orthogonal', () => {
  it('[[1,2],[0,−1]]: |⟨λ₁|λ₂⟩|² = ½, and the readout says "eigenvectors not orthogonal (A not normal)"', () => {
    const m = operatorModel(typed(UPPER))
    expect(m.cls.normal).toBe(false)
    expect(prob(m.eig.vectors[0], m.eig.vectors[1])).toBeCloseTo(0.5, 12)
    expect(text(m, 'normal')).toBe('eigenvectors not orthogonal (A not normal)')
    // a normal non-Hermitian A (±i) and every Hermitian A do not
    expect(text(operatorModel(typed(ROT)), 'normal')).toBeUndefined()
    for (const id of OP_PRESETS.map((q) => q.id)) expect(text(operatorModel(withPreset(id)), 'normal')).toBeUndefined()
  })
  it('the class line has the lecture scene’s words (classReadout), except that "not normal" moves to its own line', () => {
    const models = [...OP_PRESETS.map((q) => operatorModel(withPreset(q.id))), ...[UPPER, ROT].map((cells) => operatorModel(typed(cells)))]
    models.push(
      operatorModel(
        typed([
          ['1', '1'],
          ['0', '2'],
        ]),
      ),
    )
    for (const m of models) {
      const lecture = classReadout(m.cls)
      expect(classLine(m.cls)).toBe(lecture === 'not normal' ? null : lecture)
      expect(text(m, 'class')).toBe(lecture === 'not normal' ? undefined : lecture)
    }
  })
})

describe('item 11: a non-Hermitian A shows the part that makes it so (4 significant figures)', () => {
  it('M₁₀ = 0.5 + 0.001i: the matrix, a⃗ and λ show their imaginary parts', () => {
    const m = operatorModel(
      typed([
        ['0', '0.5'],
        ['0.5+0.001i', '0'],
      ]),
    )
    expect(m.hermitian).toBe(false)
    expect(text(m, 'A-0')).toBe('[ 0             1/2 ]')
    expect(text(m, 'A-1')).toBe('[ 1/2 + 0.001i  0   ]')
    // a_x = (M₀₁ + M₁₀)/2 = 0.5 + 0.0005i, a_y = i(M₀₁ − M₁₀)/2 = 0.0005 (exact forms stay exact: 1/2)
    expect(text(m, 'a')).toBe('a = (1/2 + 0.0005i, 0.0005, 0)')
    // λ² = 0.5 (0.5 + 0.001i): λ₁ = 0.5 + 0.0005i to 4 figures
    expect(text(m, 'lam+')).toBe('λ₁ = 0.5 + 0.0005i')
    expect(text(m, 'lam-')).toBe('λ₂ = −0.5 − 0.0005i')
    // exact forms stay exact; residue below the cut-off is 0
    expect(cnumSig(c(Math.SQRT1_2, -0.5))).toBe('1/√2 − i/2')
    expect(cnumSig(c(2, 1e-15))).toBe('2')
    expect(cnumSig(c(1e-15, 2))).toBe('2i')
    expect(sig(-1.23456e-7)).toBe('−1.235e-7')
  })
})

describe('item 13: a huge typed |a⃗| gives its scale in 2 significant figures', () => {
  it('[[1e6, 1e6], [1e6, −1e6]]: scale 1.5/(√2·10⁶) reads "1.1e-6", never "0"', () => {
    const m = operatorModel(
      typed([
        ['1e6', '1e6'],
        ['1e6', '-1e6'],
      ]),
    )
    expect(text(m, 'scale')).toBe('arrows drawn at scale 0.0000011')
    expect(operatorModel(P({ preset: null, a: [0, 0, 3] })).readouts.op.find((r) => r.key === 'scale')!.text).toBe('arrows drawn at scale ½')
  })
})

describe('item 14: no ∥ glyph; a non-Hermitian A "commutes", an observable is "compatible"', () => {
  it('the commutator lines', () => {
    for (const id of OP_PRESETS.map((q) => q.id)) for (const B of OP_PRESETS.map((q) => q.id)) expect(JSON.stringify(operatorModel(withPreset(id, { B })).readouts)).not.toMatch(/∥/)
    expect(text(operatorModel(withPreset('sz', { B: 'sz' })), 'compat')).toBe('compatible ([A,B] = 0 ⇔ a × b = 0): yes')
    const nh = operatorModel(typed(UPPER, { B: 'sz' }))
    expect(text(nh, 'compat')).toBe('commute ([A,B] = 0): no')
    expect(text(nh, 'comm')).toBeUndefined()
  })
})

describe('item 15: kets and vectors wrap only between amplitudes', () => {
  it('ket and vector readouts carry chunks, one amplitude or component each, that join back to the text', () => {
    const m = operatorModel(withPreset('sx', { psi0: PSI_NAMED('+y'), tau: 0.7, B: 'sy' }))
    for (const key of ['a', 'ahat', 'vec0', 'vec1', 'b', 'comm', 'before', 'after']) {
      const r = all(m).find((q) => q.key === key)!
      expect(r.chunks, key).toBeDefined()
      expect(r.chunks!.join(' '), key).toBe(r.text)
    }
    const after = all(m).find((q) => q.key === 'after')!
    expect(after.chunks!.length).toBe(2)
    expect(commaChunks('after: (0.15 − 0.63i, −0.54 − 0.54i)')).toEqual(['after: (0.15 − 0.63i,', '−0.54 − 0.54i)'])
  })
})

describe('Hermitian part: a typed matrix within 1e-9 of Hermitian is used as (M + M†)/2', () => {
  it('2+9e-10i: the model’s M is exactly Hermitian, and the turn exactly unitary', () => {
    const m = operatorModel(
      typed([
        ['1', '2+9e-10i'],
        ['2', '-1'],
      ]),
    )
    expect(m.hermitian).toBe(true)
    // exactly: M₀₁ = conj(M₁₀), real diagonal
    expect([m.M[0][1].re, m.M[0][1].im]).toEqual([m.M[1][0].re, -m.M[1][0].im])
    expect([m.M[0][0].im, m.M[1][1].im]).toEqual([0, 0])
    const U = m.act!.U
    expect(matEq(matmul(dagger(U), U), identity(2), 1e-12)).toBe(true)
  })
})
