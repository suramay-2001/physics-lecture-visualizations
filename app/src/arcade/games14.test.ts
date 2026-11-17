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
import { V as V14 } from '../content/L14.values'
import { V as V15 } from '../content/L15.values'
import { V as V16 } from '../content/L16.values'

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
}

describe('Spot the error: Lectures 14–16 (shape)', () => {
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
