/**
 * P review item 1 (blocking): typed Hermitian matrices used to crash the bench. The stats called `expectation`,
 * which throws when ⟨ψ|A|ψ⟩ has an imaginary part above a fixed 1e-9: rounding in ⟨A²⟩ does that for entries ≥ 10⁴
 * (about a third of τ values), and a crafted 2+9e-10i passes the Hermitian test yet still threw. The model now reads
 * ⟨A⟩, ΔA and P(λ₊) off the Bloch vector, so it is total: these sweeps would have thrown before the fix.
 */
import { describe, expect, it } from 'vitest'
import { KET, type NamedKet } from '../../../physics/spin'
import { INITIAL_PARAMS, operatorModel, parseCells, PSI_NAMED, TAU_MAX, type Basis, type Cells, type OperatorParams } from './model'

const typed = (cells: Cells, basis: Basis = 'z', patch: Partial<OperatorParams> = {}): OperatorParams => {
  const res = parseCells(cells, basis)
  if (!res.ok) throw new Error(`cells do not parse: ${JSON.stringify(res.error)}`)
  return { ...INITIAL_PARAMS, source: 'cells', cells, typed: res.M, preset: null, basis, ...patch }
}
const BIG: Cells = [
  ['1e6', '1e6'],
  ['1e6', '-1e6'],
]
const CRAFTED: Cells = [
  ['1', '2+9e-10i'],
  ['2', '-1'],
]
const KETS = Object.keys(KET) as NamedKet[]
const finite = (m: ReturnType<typeof operatorModel>) => [...m.readouts.op, ...m.readouts.state].every((r) => !/NaN|Infinity|undefined/.test(r.text))

describe('item 1: typed Hermitian matrices never crash the model (τ-sweep)', () => {
  it('[[1e6, 1e6], [1e6, −1e6]] from every named ket, τ over [0, 4π] in 400 steps, every display basis', () => {
    for (const basis of ['z', 'x', 'y'] as Basis[])
      for (const k of KETS)
        for (let i = 0; i <= 400; i++) {
          const p = typed(BIG, 'z', { basis, psi0: PSI_NAMED(k), tau: (i / 400) * TAU_MAX })
          const m = operatorModel(p)
          expect(m.hermitian).toBe(true)
          expect(finite(m), `${basis} ${k} ${i}`).toBe(true)
          // ⟨A⟩ lies between the eigenvalues ±√2·10⁶, ΔA ≤ |a⃗|, P ∈ [0, 1]
          expect(Math.abs(m.stats!.mean)).toBeLessThanOrEqual(Math.SQRT2 * 1e6 * (1 + 1e-9))
          expect(m.stats!.spread).toBeLessThanOrEqual(Math.SQRT2 * 1e6 * (1 + 1e-9))
          expect(m.stats!.pPlus).toBeGreaterThanOrEqual(0)
          expect(m.stats!.pPlus).toBeLessThanOrEqual(1)
        }
  })
  it('the review’s case: from |+z⟩ at τ = π/2 (Im ⟨A²⟩ was 1.2e-4); ⟨A⟩ and ΔA are the hand values', () => {
    const m = operatorModel(typed(BIG, 'z', { psi0: PSI_NAMED('+z'), tau: Math.PI / 2 }))
    // A = 10⁶ (σx + σz): a⃗ = 10⁶ (1, 0, 1); r is some point, so check ⟨A⟩ = a⃗·r and ΔA² = |a⃗|² − (a⃗·r)²
    const ar = 1e6 * (m.r[0] + m.r[2])
    expect(m.stats!.mean).toBeCloseTo(ar, 3)
    expect(m.stats!.spread).toBeCloseTo(Math.sqrt(Math.max(0, 2e12 - ar * ar)), 1)
  })
  it('a crafted 2+9e-10i (Hermitian within 1e-9) never throws, typed in any basis, over a τ-sweep', () => {
    for (const basis of ['z', 'x', 'y'] as Basis[])
      for (const k of KETS)
        for (let i = 0; i <= 100; i++) {
          const m = operatorModel(typed(CRAFTED, basis, { psi0: PSI_NAMED(k), tau: (i / 100) * TAU_MAX }))
          expect(finite(m)).toBe(true)
        }
  })
  it('fuzz: any typed 2×2 up to 10⁶ (Hermitian or not), any ψ₀, τ, basis and B: no throw, no NaN in a readout', () => {
    let seed = 12345
    const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31)
    const num = () => {
      const mag = 10 ** (rnd() * 12 - 6)
      const x = (rnd() < 0.5 ? -1 : 1) * mag
      return rnd() < 0.15 ? 0 : Math.min(1e6, Math.max(-1e6, x))
    }
    const cellOf = (re: number, im: number) => (im === 0 ? `${re}` : `${re} + ${im}*i`)
    for (let n = 0; n < 600; n++) {
      const herm = rnd() < 0.5
      const d0 = num()
      const d1 = num()
      const ore = num()
      const oim = num()
      const cells: Cells = herm
        ? [
            [cellOf(d0, 0), cellOf(ore, oim)],
            [cellOf(ore, -oim), cellOf(d1, 0)],
          ]
        : [
            [cellOf(d0, num()), cellOf(ore, oim)],
            [cellOf(num(), num()), cellOf(d1, 0)],
          ]
      const res = parseCells(cells, 'z')
      if (!res.ok) continue
      const p: OperatorParams = {
        ...INITIAL_PARAMS,
        source: 'cells',
        cells,
        typed: res.M,
        preset: null,
        basis: (['z', 'x', 'y'] as Basis[])[n % 3],
        psi0: { named: null, theta: rnd() * Math.PI, phi: rnd() * 2 * Math.PI },
        tau: rnd() * TAU_MAX,
        B: rnd() < 0.3 ? 'sy' : null,
      }
      const m = operatorModel(p)
      expect(finite(m), JSON.stringify(cells)).toBe(true)
    }
  })
})
