/**
 * D's pure lab helpers: bench chain layout, module matching, atom fates and the deposit generator.
 * These draw the engine's numbers; the tests check that the drawing is faithful to them (fates and
 * deposits follow the given fractions; geometry is continuous and keeps the D §3.1 / §4.0 conventions).
 */
import { describe, expect, it } from 'vitest'
import { benchTheory } from '../../../physics/sg'
import { fateOf, makeSeeds, type Fate } from './atoms'
import { depositPoints, depositSeeds, SPOT } from './deposit'
import { benchLayout, defl, LAB, matchModules } from './layout'

describe('lab layout (D §3.1, §4.0)', () => {
  it('deflection profile is continuous in value and slope at the magnet exit', () => {
    const L = LAB.L
    const h = 1e-6
    expect(Math.abs(defl(L - h) - defl(L + h))).toBeLessThan(4 * L * h) // only the slope × 2h apart
    const slopeIn = (defl(L) - defl(L - h)) / h
    const slopeOut = (defl(L + h) - defl(L)) / h
    expect(slopeIn).toBeCloseTo(slopeOut, 3)
  })

  it('single module: module centred at y = 0, oven mouth at −3.75, plate at +4.2, spots at ±0.9', () => {
    const b = benchLayout([0], [])
    expect(b.modules[0].center.y).toBeCloseTo(0, 9)
    expect(b.oven.y).toBeCloseTo(-3.75, 9)
    expect(b.plateCenter.y).toBeCloseTo(4.2, 9)
    // the last module uses the full K: a v = 1 on-axis atom lands at ±0.9 (= SPOT)
    expect(LAB.K * defl(LAB.L + LAB.plateGap)).toBeCloseTo(SPOT, 2)
    expect(b.stops.length).toBe(0)
  })

  it('a kept beam feeds the next module, which sits on it (translated + turned), with a stop on the other beam', () => {
    const up = benchLayout([0, 0], ['+'])
    const down = benchLayout([0, 0], ['-'])
    expect(up.modules[1].center.y).toBeGreaterThan(5.5)
    expect(up.modules[1].center.z).toBeGreaterThan(0.3) // kept + beam goes up (z)
    expect(down.modules[1].center.z).toBeLessThan(-0.3)
    expect(up.stops[0].pos.z).toBeLessThan(0) // the blocked − beam is stopped below
    // tilting the first magnet to x moves the kept beam sideways instead
    const x = benchLayout([Math.PI / 2, 0], ['+'])
    expect(x.modules[1].center.x).toBeGreaterThan(0.3)
    expect(Math.abs(x.modules[1].center.z)).toBeLessThan(1e-9)
  })

  it('a preparation module sits one spacing upstream and moves the oven with it', () => {
    const b = benchLayout([0], [], { showPrep: true })
    expect(b.prep).not.toBeNull()
    expect(b.prep!.center.y).toBeCloseTo(-LAB.spacing, 9)
    expect(b.oven.y).toBeLessThan(-LAB.spacing - 3)
  })

  it('the prep module takes the source axis and keeps the source sign (|−z⟩ keeps −, |+x⟩ is an x magnet)', () => {
    const plusZ = benchLayout([0], [], { prep: { tilt: 0, sign: 1 } })
    const minusZ = benchLayout([0], [], { prep: { tilt: 0, sign: -1 } })
    const plusX = benchLayout([0], [], { prep: { tilt: Math.PI / 2, sign: 1 } })
    // the first real module sits on the KEPT beam of the prep: up for +, down for −, sideways (+x) for an x prep
    expect(plusZ.modules[0].center.z).toBeGreaterThan(0.05)
    expect(minusZ.modules[0].center.z).toBeLessThan(-0.05)
    expect(minusZ.prepSign).toBe(-1)
    expect(plusX.prep!.tilt).toBeCloseTo(Math.PI / 2, 12)
    expect(plusX.modules[0].center.x).toBeGreaterThan(0.05)
    expect(Math.abs(plusX.modules[0].center.z)).toBeLessThan(1e-9)
    // the prep stop blocks the other beam
    expect(minusZ.prepStop!.pos.z).toBeGreaterThan(0)
  })

  it('matches modules across a bench change (index when equal, LCS otherwise)', () => {
    const z = 0
    const x = Math.PI / 2
    expect(matchModules([z, x, z], [z, x, x])).toEqual([0, 1, 2])
    expect(matchModules([z], [z, z])).toEqual([0, -1])
    expect(matchModules([z, x, z], [z, z])).toEqual([0, 2])
  })
})

describe('atom fates follow the engine fractions', () => {
  it('fateOf partitions [0, 1) into blocked[k], plus, minus', () => {
    const th = benchTheory({ source: 'oven', axes: ['z', 'x', 'z'], keep: ['+', '+'] }) // blocked ½, ¼; ⅛ / ⅛
    const f: Fate = { end: -1, signs: [] }
    expect(fateOf(0.3, th, [1, 1], 3, f).end).toBe(0)
    expect(f.signs).toEqual([-1])
    expect(fateOf(0.6, th, [1, 1], 3, f).end).toBe(1)
    expect(f.signs).toEqual([1, -1])
    expect(fateOf(0.8, th, [1, 1], 3, f)).toEqual({ end: -1, signs: [1, 1, 1] })
    expect(fateOf(0.95, th, [1, 1], 3, f)).toEqual({ end: -1, signs: [1, 1, -1] })
  })

  it('2000 seeded atoms reproduce the fractions within 3σ', () => {
    const th = benchTheory({ source: 'oven', axes: ['z', 'z'], keep: ['+'] })
    const s = makeSeeds()
    const f: Fate = { end: -1, signs: [] }
    let blocked = 0
    for (let i = 0; i < s.fate.length; i++) if (fateOf(s.fate[i], th, [1], 2, f).end === 0) blocked++
    const n = s.fate.length
    expect(Math.abs(blocked / n - 0.5)).toBeLessThan(3 * Math.sqrt(0.25 / n))
  })
})

describe('plate deposit (one generator for 3D and the 2D Plate)', () => {
  it('+ fraction of the seeded sample tracks pPlus; spots sit at ±SPOT along n̂', () => {
    const s = depositSeeds(1000)
    const out = new Float32Array(1400 * 3)
    for (const p of [0.5, 0.854, 0.75]) {
      const plus = depositPoints(s, 1400, { pPlus: p, gradient: 1, classical: 0 }, out)
      expect(Math.abs(plus / 1400 - p)).toBeLessThan(3 * Math.sqrt((p * (1 - p)) / 1400) + 1e-9)
    }
    depositPoints(s, 1400, { pPlus: 0.5, gradient: 1, classical: 0 }, out)
    let zp = 0
    let np = 0
    for (let i = 0; i < 1400; i++)
      if (out[i * 3 + 2] > 0) {
        zp += out[i * 3 + 1]
        np++
      }
    // lip: off-axis atoms deflect less, so the mean sits a little inside ±SPOT (speed spread pushes it out)
    expect(zp / np).toBeGreaterThan(0.6 * SPOT)
    expect(zp / np).toBeLessThan(1.4 * SPOT)
  })

  it('uniform field (gradient 0) lands every atom in one central spot; the classical model is unsigned', () => {
    const s = depositSeeds(7)
    const out = new Float32Array(200 * 3)
    depositPoints(s, 200, { pPlus: 0.5, gradient: 0, classical: 0 }, out)
    for (let i = 0; i < 200; i++) expect(Math.abs(out[i * 3 + 1])).toBeLessThan(0.1)
    depositPoints(s, 200, { pPlus: 0.5, gradient: 1, classical: 1 }, out)
    for (let i = 0; i < 200; i++) expect(out[i * 3 + 2]).toBe(0)
  })
})
