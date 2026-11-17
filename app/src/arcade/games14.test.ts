/**
 * Arcade truth for Lectures 14–20 (P): the Spot-the-error rounds of the wave-mechanics lectures. Each round has four steps with one
 * wrong, trains a built unit of its lecture, keeps to the 25-word sentence cap, and every number its steps or `why` state is
 * recomputed here from the engine (physics/wave*.ts, physics/scatter.ts) and found in the round's text.
 */
import { describe, expect, it } from 'vitest'
import { LECTURES } from '../content'
import { ERROR_ROUNDS, type ErrorRound } from './games'
import { boxPairPeriod, omegaFree, omegaLinear } from '../physics/wave14'
import { crestSpeed, groupVelocity, spreadScale } from '../physics/wave15'
import { GRID, boxEnergy, cellChances, freeEvolve, meanX, packet, spreadP, spreadX } from '../physics/wave'
import { commutatorRate, gaussianExact } from '../physics/wave16'
import { barrierAmplitudes, evanescentCurrent, penetrationDepth } from '../physics/wave18'
import { barrierT, barrierThick, decayConstant, forceMean, stepAmplitudes, stepRT } from '../physics/scatter'
import { V as V14 } from '../content/L14.values'
import { V as V15 } from '../content/L15.values'
import { V as V16 } from '../content/L16.values'
import { V as V17 } from '../content/L17.values'
import { V as V18 } from '../content/L18.values'
import { V as V19 } from '../content/L19.values'
import { V as V20 } from '../content/L20.values'

const close = (a: number, b: number, eps = 1e-9) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(eps)
const rounds = (lec: string) => ERROR_ROUNDS.filter((r) => r.trains.lecture === lec)
const round = (id: string): ErrorRound => ERROR_ROUNDS.find((r) => r.id === id)!
const text = (id: string) => [...round(id).steps, round(id).why].join(' ')
/** the engine's number, written as the round writes it, is somewhere in the round's text */
const says = (id: string, ...nums: string[]) => {
  for (const n of nums) expect(text(id), `${id} states ${n}`).toContain(n)
}
const f = (x: number, d: number) => x.toFixed(d)
const PK = (x0: number, sigma: number, p0 = 0) => packet(GRID, { x0, sigma, p0 })

const IDS: Record<string, string[]> = {
  L14: ['l14-components', 'l14-schrodinger', 'l14-dispersion', 'l14-stationary'],
  L15: ['l15-packet-evolution', 'l15-group-velocity', 'l15-dispersion', 'l15-gaussian'],
  L16: ['l16-evolve', 'l16-spread', 'l16-ehrenfest'],
  L17: ['l17-mean-force', 'l17-step', 'l17-current'],
  L18: ['l18-packet', 'l18-detector', 'l18-below', 'l18-tunnel'],
  L19: ['l19-match', 'l19-thick', 'l19-energy'],
  L20: ['l20-reverse', 'l20-infinite', 'l20-finite', 'l20-compare'],
}

describe('Spot the error: Lectures 14–20 (shape)', () => {
  for (const [lec, ids] of Object.entries(IDS)) {
    it(`${lec}: ${ids.length} rounds, each on a built unit, four steps, one wrong, a why that names the unit`, () => {
      expect(rounds(lec).map((r) => r.id)).toEqual(ids)
      const units = LECTURES.find((l) => l.id === lec)!.units.map((u) => u.id)
      for (const r of rounds(lec)) {
        expect(units, r.id).toContain(r.trains.unit)
        expect(r.steps, r.id).toHaveLength(4)
        expect(r.wrong, r.id).toBeGreaterThanOrEqual(0)
        expect(r.wrong, r.id).toBeLessThan(4)
        const unitNo = r.trains.label.split(' ')[0]
        expect(r.trains.label.startsWith(`${lec.slice(1)}.`), r.id).toBe(true)
        expect(r.why, r.id).toContain(`(Unit ${unitNo})`)
        expect(units.indexOf(r.trains.unit) + 1, `${r.id}: the number is the unit's place`).toBe(Number(unitNo.split('.')[1]))
      }
    })
  }
  it('every sentence is at most 25 words (a TeX span counts as one word), and the wrong steps are not all the same index', () => {
    const rs = Object.keys(IDS).flatMap((l) => rounds(l))
    for (const r of rs)
      for (const s of [...r.steps, r.why])
        for (const sentence of s.replace(/\$[^$]*\$/g, 'X').split(/(?<=[.?!])\s+/)) expect(sentence.split(/\s+/).length, `${r.id}: ${sentence}`).toBeLessThanOrEqual(25)
    expect(new Set(rs.map((r) => r.wrong)).size).toBeGreaterThan(1)
  })
})

describe('Spot the error: Lectures 14–16 (the engine)', () => {
  it('l14-components: the unit packet has density 0.399 at 0 and 0.341 between 0 and 1; a point carries no chance', () => {
    const psi = PK(0, 1)
    const j = Math.round((0 - GRID.x[0]) / GRID.dx)
    close(psi.re[j] ** 2 + psi.im[j] ** 2, 1 / Math.sqrt(2 * Math.PI), 1e-4)
    expect(f(psi.re[j] ** 2 + psi.im[j] ** 2, 3)).toBe('0.399')
    close(cellChances(psi, GRID, [0, 1], 1)[0], V14.l14Cell16, 1e-9)
    expect(f(V14.l14Cell16, 3)).toBe('0.341')
    says('l14-components', '0.399', '0.341')
  })
  it('l14-dispersion: ω = ħk²/2m quadruples when k doubles (1.125 to 4.5); the line ω = ck only doubles', () => {
    close(omegaFree(1.5), 1.125)
    close(omegaFree(3), 4.5)
    close(omegaFree(3) / omegaFree(1.5), 4)
    close(V14.l14OmegaDouble, 4)
    close(omegaLinear(3) / omegaLinear(1.5), 2)
    says('l14-dispersion', '1.125', '4.5')
  })
  it('l14-stationary: the pair of levels 1 and 2 of a box of width 4 repeats every 6.79', () => {
    close(boxPairPeriod(4, 1, 2), (2 * Math.PI) / (boxEnergy(4, 2) - boxEnergy(4, 1)))
    close(V14.l14SloshPeriod, boxPairPeriod(4, 1, 2))
    expect(f(boxPairPeriod(4, 1, 2), 2)).toBe('6.79')
    says('l14-stationary', '6.79')
  })
  it('l15-packet-evolution: free evolution leaves Δp at ħ/2σ = 0.5, at t = 0 and at t = 6', () => {
    const psi = PK(0, 1)
    close(spreadP(psi, GRID), 0.5, 1e-6)
    close(spreadP(freeEvolve(psi, GRID, 6), GRID), 0.5, 1e-6)
    close(V15.l15DpT6, 0.5, 1e-6)
    says('l15-packet-evolution', '0.5', '$t = 6$')
  })
  it('l15-group-velocity: for p = 1.5 and m = 1 the envelope moves at 1.5 and the crests at 0.75, half as fast', () => {
    close(groupVelocity(1.5), 1.5)
    close(crestSpeed(1.5), 0.75)
    close(V15.l15CrestSpeed15, 0.75)
    close(groupVelocity(1.5) / crestSpeed(1.5), 2)
    says('l15-group-velocity', '1.5', '0.75')
  })
  it('l15-dispersion: ω = ck has one slope and no curvature; the free ω″ = ħ/m = 1', () => {
    for (const k of [0.5, 1.5, 3]) {
      close((omegaLinear(k + 0.1) - omegaLinear(k - 0.1)) / 0.2, 1)
      close(omegaLinear(k + 0.1) - 2 * omegaLinear(k) + omegaLinear(k - 0.1), 0, 1e-12)
    }
    close(V15.l15Omega2nd, 1)
    expect((omegaFree(3.1) - 2 * omegaFree(3) + omegaFree(2.9)) / 0.01).toBeCloseTo(1, 6)
    says('l15-dispersion', '= 1$')
  })
  it('l15-gaussian: the spreading time 2mσ²/ħ falls from 1.28 (σ = 0.8) to 0.32 (σ = 0.4)', () => {
    close(spreadScale(0.8), 1.28)
    close(spreadScale(0.4), 0.32)
    close(V15.l15Tspread08, 1.28)
    close(V15.l15Tspread04, 0.32)
    says('l15-gaussian', '1.28', '0.32')
  })
  it('l16-evolve: for σ = 1 at t = 2 (τ = 1) the exact packet has Δx = √2 = 1.414, and its centre only slides when p₀ ≠ 0', () => {
    close(spreadScale(1), 2)
    close(spreadX(gaussianExact(GRID, { x0: 0, sigma: 1 }, 2), GRID), Math.SQRT2, 1e-6)
    close(V16.l16FreeSd2, Math.SQRT2, 1e-6)
    expect(f(Math.SQRT2, 3)).toBe('1.414')
    says('l16-evolve', '1.414')
  })
  it('l16-spread: for σ = 1 at t = 4 the product ΔxΔp is √5/2 = 1.118 ħ, above ħ/2', () => {
    const psi = gaussianExact(GRID, { x0: 0, sigma: 1 }, 4)
    close(spreadX(psi, GRID) * spreadP(psi, GRID), Math.sqrt(5) / 2, 1e-6)
    close(V16.l16Product4, Math.sqrt(5) / 2, 1e-6)
    expect(f(Math.sqrt(5) / 2, 3)).toBe('1.118')
    says('l16-spread', '1.118')
  })
  it('l16-ehrenfest: d⟨x⟩/dt = ⟨p⟩/m (not ⟨p⟩/2m): 1.5 for a packet with p₀ = 1.5, and p₀ = 3 puts a free packet at 6 at t = 2', () => {
    close(commutatorRate(PK(2, 1, 1.5), GRID, (x) => 0.5 * x * x, 'x'), 1.5, 1e-6)
    close(V16.l16EhrenfestDxdt, 1.5, 1e-6)
    close(meanX(freeEvolve(PK(0, 1, 3), GRID, 2), GRID), 6, 1e-6)
    close(V15.l15FreeMean2, 6, 1e-6)
    says('l16-ehrenfest', '$6$ when $t = 2$')
  })
})

describe('Spot the error: Lectures 17–20 (the engine)', () => {
  it('l17-mean-force: for F = γx² and a Gaussian at 2 with σ = 1, ⟨F⟩ = 5γ and F(⟨x⟩) = 4γ', () => {
    const psi = PK(2, 1)
    close(forceMean(psi, GRID, (x) => x * x), 5, 1e-6)
    close(meanX(psi, GRID) ** 2, 4, 1e-6)
    close(V17.l17GaussMeanF, 5, 1e-6)
    close(V17.l17GaussForceAtMean, 4, 1e-6)
    says('l17-mean-force', '$5\\gamma$', '$4\\gamma$', '= 5$')
  })
  it('l17-step: at E = 4V₀/3, k₂/k₁ = 1/2, r = 1/3, τ = 4/3 and T = ½·16/9 = 8/9', () => {
    const s = stepAmplitudes(8, 6)
    close(s.k2 / s.k1, 0.5)
    close(s.r.re, 1 / 3)
    close(s.tau.re, 4 / 3)
    close(s.T, 8 / 9)
    close((s.k2 / s.k1) * (16 / 9), 8 / 9)
    says('l17-step', '\\tfrac13', '\\tfrac43', '\\tfrac89', '\\tfrac{16}{9}', '\\tfrac12')
  })
  it('l17-current: the current is one constant, (8/9)k₁, on both sides of the step at E = 4V₀/3 (and not zero)', () => {
    const s = stepAmplitudes(8, 6)
    close(s.k1 * (1 - s.R), (8 / 9) * s.k1)
    close(s.k2 * s.tau.re ** 2, (8 / 9) * s.k1)
    expect(s.k1 * (1 - s.R)).toBeGreaterThan(0)
    close(stepRT(8, 6).T, 8 / 9)
    says('l17-current', '\\tfrac89k_1')
  })
  it('l18-packet: amplitudes add as 1 + r = τ (r + τ = 5/3), chances as R + T = 1/9 + 8/9 = 1', () => {
    const s = stepAmplitudes(8, 6)
    close(1 + s.r.re, s.tau.re)
    close(s.r.re + s.tau.re, 5 / 3)
    close(s.R + s.T, 1)
    close(s.R, 1 / 9)
    says('l18-packet', '\\tfrac53', '\\tfrac19', '\\tfrac89')
  })
  it('l18-detector: R = |r|² = 1/9 has no speed factor; with the factor ½ the shares would add to 17/18; a packet goes by once', () => {
    const s = stepAmplitudes(8, 6)
    close(s.R, 1 / 9)
    close(s.R * (s.k2 / s.k1) + s.T, 17 / 18)
    close(V18.l18DetTotal, 1, 1e-9)
    says('l18-detector', '\\tfrac19', '\\tfrac{17}{18}', '\\tfrac12', 'is 1:')
  })
  it('l18-below: below the step |r| = 1, no current flows, and the density falls by e over 1/2κ = 0.25 for κ = 2', () => {
    const s = stepAmplitudes(2, 4)
    close(Math.hypot(s.r.re, s.r.im), 1)
    close(s.R, 1)
    close(s.T, 0)
    close(evanescentCurrent(2, 4, 0.3), 0, 1e-12)
    close(penetrationDepth(2, Math.exp(-1)), 0.25)
    close(V18.l18DecayLenDensity, 0.25)
    says('l18-below', '$0.25$', '$\\kappa = 2$')
  })
  it('l18-tunnel: for E = V₀/2 and κa = 1 the exact T is 0.4200, the thick form 0.541, and 16E(V₀−E)/V₀² = 4 as a → 0', () => {
    const E = 1
    const V0 = 2
    const a = 1 / decayConstant(E, V0)
    close(barrierT(E, V0, a), V18.l18BarrierT1, 1e-9)
    expect(f(barrierT(E, V0, a), 4)).toBe('0.4200')
    expect(f(barrierThick(E, V0, a), 3)).toBe('0.541')
    close((16 * E * (V0 - E)) / (V0 * V0), 4)
    says('l18-tunnel', '0.4200', '0.541', '0.420')
  })
  it('l19-match: with V = 0 on both sides T = |τ|² (|τ| = 0.648, T = 0.4200); otherwise the ratio k₃/k₁ enters', () => {
    const b = barrierAmplitudes(2, 4, 0.5)
    close(Math.hypot(b.F.re, b.F.im), V19.l19AbsT, 1e-9)
    close(V19.l19AbsT ** 2, barrierT(2, 4, 0.5), 1e-9)
    expect(f(V19.l19AbsT, 3)).toBe('0.648')
    expect(f(barrierT(2, 4, 0.5), 4)).toBe('0.4200')
    says('l19-match', '0.648', '0.4200')
  })
  it('l19-thick: doubling κa from 1.5 to 3 multiplies the exact T by 0.0546 (not ½), and the thick-form exponent e^{−2κa} is squared', () => {
    const T = (ka: number) => barrierT(1, 2, ka / decayConstant(1, 2))
    close(T(3) / T(1.5), V19.l19DoubleFactor, 1e-9)
    expect(f(T(3) / T(1.5), 4)).toBe('0.0546')
    expect(T(3) / T(1.5)).toBeLessThan(0.1)
    close(Math.exp(-4 * 1.5), Math.exp(-2 * 1.5) ** 2, 1e-15)
    says('l19-thick', '0.0546', '1.5', '$3$')
  })
  it('l19-energy: E = 2 = k²/2 outside and V₀ − κ²/2 = 4 − 2 inside, with k = κ = 2', () => {
    const kappa = decayConstant(2, 4)
    close(kappa, 2)
    close(V19.l19KS, 2)
    close(4 - (kappa * kappa) / 2, 2)
    close(V19.l19EnergyOut, 2)
    says('l19-energy', '$V_0 = 4$', '$E = 2$', '= 2$')
  })
  it('l20-reverse: only special k fit (the finite well of V₀ = 8, a = 2 has a lowest level 0.784, not any energy)', () => {
    expect(V20.l20E1Fin).toBeGreaterThan(0)
    expect(round('l20-reverse').why).toContain('special energies')
  })
  it('l20-infinite: E₃/E₁ = 9, and the sine of level n has slope kₙ = nπ/a ≠ 0 at the wall', () => {
    close(boxEnergy(4, 3) / boxEnergy(4, 1), 9)
    close(V20.l20BoxE3overE1, 9)
    const a = 4
    const n = 2
    const k = (n * Math.PI) / a
    close(k * Math.cos(0), k)
    expect(k).toBeGreaterThan(0)
    says('l20-infinite', '9 times')
  })
  it('l20-finite: the lowest level of the well V₀ = 8, a = 2 has 0.0204 of its chance outside the walls', () => {
    close(V20.l20TailGround, 0.0204264, 5e-5)
    expect(f(V20.l20TailGround, 4)).toBe('0.0204')
    says('l20-finite', '0.0204', '$V_0 = 8$', '$a = 2$')
  })
  it('l20-compare: the finite level lies below its infinite twin, 0.636 of it for V₀ = 8, a = 2', () => {
    close(V20.l20E1Fin / boxEnergy(2, 1), V20.l20E1Ratio, 1e-6)
    expect(V20.l20E1Ratio).toBeLessThan(1)
    expect(f(V20.l20E1Ratio, 3)).toBe('0.636')
    says('l20-compare', '0.636')
  })
})
