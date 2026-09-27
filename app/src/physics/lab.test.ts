/**
 * Engine helpers for the /lab (decisions/lab.md ruling 5) against independent numpy routes (pipeline/make_fixtures.py
 * "lab"): e^{−iτA} through numpy's eigen-decomposition, Bloch vectors from ⟨σ⟩ of the rotated ket, mixed-state spreads
 * from tr(ρS) and tr(ρS²), numpy's own inverse trig and hyperbolic functions.
 */
import { describe, expect, it } from 'vitest'
import fx from './__fixtures__/numpy.json'
import { c, expi } from './complex'
import { uncertaintyFromBloch } from './density'
import { LIMITS, checkRange, evalReal, parse, sampleParametric } from './expr'
import { type Mat, type Vec, apply, identity, maxDiff, mscale } from './linalg'
import { unitaryAction } from './operators'
import { KET, Rz, SX, SY, SZ, blochVector, rotateBloch, uncertaintyCheck, type Vec3 } from './spin'

const D = fx.lab
const M = (x: unknown) => x as Mat
const V = (x: unknown) => x as Vec
const close = (a: number, b: number, eps = 1e-9) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(eps)

describe('unitaryAction: e^{−iτA} as a turn about â by 2|a⃗|τ with the global phase −a₀τ', () => {
  it('U = numpy expm; the Bloch vector turns about â by 2|a⃗|τ; the phase is −a₀τ', () => {
    for (const k of D.unitary) {
      const u = unitaryAction(M(k.A), k.tau)!
      expect(maxDiff(u.U, M(k.U)), 'U').toBeLessThan(1e-9)
      rotateBloch(u.axis!, u.angle, k.r_before as Vec3).forEach((x, i) => close(x, k.r_after[i]))
      blochVector(apply(u.U, V(k.psi))).forEach((x, i) => close(x, k.r_after[i]))
      close(u.phase, -k.a0 * k.tau)
    }
  })
  it('S_z gives R_z(τ); a⃗ = 0 is a pure phase with no axis; a non-Hermitian A is not a turn', () => {
    const z = unitaryAction(SZ, 0.7)!
    expect(maxDiff(z.U, Rz(0.7))).toBeLessThan(1e-12)
    close(z.angle, 0.7)
    expect(z.axis).toEqual([0, 0, 1])
    const ph = unitaryAction(mscale(identity(2), 2), 0.5)!
    expect(ph.axis).toBeNull()
    close(ph.angle, 0)
    close(ph.phase, -1)
    expect(maxDiff(ph.U, mscale(identity(2), expi(-1)))).toBeLessThan(1e-12)
    expect(unitaryAction([[c(0), c(1)], [c(0), c(0)]], 1)).toBeNull()
  })
})

describe('uncertaintyFromBloch: spreads and the bound for pure AND mixed states', () => {
  it('matches numpy tr(ρS) spreads and tr(ρ[Sx, Sy]) bound inside the ball; the bound always holds', () => {
    for (const k of D.mixed) {
      const u = uncertaintyFromBloch(k.r as Vec3)
      u.spreads.forEach((x, i) => close(x, k.spreads[i]))
      close(u.product, k.product)
      close(u.bound, k.bound)
      expect(u.slack).toBeGreaterThan(-1e-12)
    }
  })
  it('on the surface it agrees with the ket route (uncertaintyCheck); at the centre the bound is 0 and the product ¼', () => {
    for (const name of ['+x', '+y', '+z', '-z'] as const) {
      const k = uncertaintyCheck(SX, SY, KET[name])
      const b = uncertaintyFromBloch(blochVector(KET[name]))
      close(b.product, k.product)
      close(b.bound, k.bound)
    }
    const oven = uncertaintyFromBloch([0, 0, 0])
    close(oven.product, 0.25)
    close(oven.bound, 0)
  })
})

describe('the grapher: extra functions, range checks, parametric sampling (S-lab §5)', () => {
  it('asin acos atan sinh cosh tanh = numpy in the grapher set; learner answers still reject them', () => {
    for (const f of D.fns) {
      const p = parse(f.src, { mode: 'real', limits: LIMITS.grapher, fns: 'grapher' })
      expect(p.ok, f.src).toBe(true)
      if (p.ok) close(evalReal(p.ast), f.v, 1e-12)
    }
    const answer = parse('asin(0.3)', { mode: 'real' })
    expect(answer.ok).toBe(false)
    if (!answer.ok) expect(answer.reason).toBe('unknown-identifier')
    // out of the domain: a gap, never a value
    const bad = parse('asin(2)', { mode: 'real', limits: LIMITS.grapher, fns: 'grapher' })
    expect(bad.ok && Number.isNaN(evalReal(bad.ast))).toBe(true)
  })
  it('checkRange: finite, ordered, within ±1e6', () => {
    expect(checkRange([0, 1])).toBe('ok')
    expect(checkRange([1, 1])).toBe('ok')
    expect(checkRange([1, 0])).toBe('empty')
    expect(checkRange([Number.NaN, 1])).toBe('non-finite')
    expect(checkRange([0, Number.POSITIVE_INFINITY])).toBe('non-finite')
    expect(checkRange([-1e308, 1e308])).toBe('too-wide')
  })
  it('sampleParametric interleaves coordinates, and a gap in one coordinate is a gap in all', () => {
    const t = (src: string) => {
      const p = parse(src, { mode: 'real', vars: ['t'], limits: LIMITS.grapher, fns: 'grapher' })
      if (!p.ok) throw new Error(src)
      return p.ast
    }
    const out = sampleParametric([t('cos t'), t('sin t'), t('1/t')], 't', [-1, 1], 3) // t = −1, 0, 1
    expect(out.length).toBe(9)
    close(out[0], Math.cos(-1))
    close(out[2], -1)
    expect([out[3], out[4], out[5]].every(Number.isNaN)).toBe(true)
    close(out[8], 1)
    expect([...sampleParametric([t('t'), t('t')], 't', [Number.NaN, 1], 4)].every(Number.isNaN)).toBe(true)
  })
})
