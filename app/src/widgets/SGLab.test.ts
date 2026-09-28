/**
 * P-Q1 review item 21: the SG bench's ×10/×100/×1000 buttons drew their atoms inside a setState updater. React's
 * StrictMode runs an updater twice in dev, so every click consumed two batches of the seeded generator and dev showed
 * another tally than production (seed 709, first 200 atoms: 86/114 in dev, 100/100 in production). The fix draws the
 * batch once in the click handler and hands React the pure `addBatch` updater.
 *
 * No DOM here (vitest runs in node), so React's two update modes are modelled directly: production calls an updater
 * once; StrictMode calls it twice with the same previous state and keeps the second result.
 */
import { describe, expect, it } from 'vitest'
import { rng } from '../physics/random'
import { fireMany, type Bench, type Tally } from '../physics/sg'
import { addBatch } from './sgBatch'

type Updater = (t: Tally | null) => Tally
const run = (prev: Tally | null, u: Updater, strict: boolean): Tally => {
  if (strict) u(prev)
  return u(prev)
}

/** Two clicks of ×100 on a fresh widget, the fixed way: draw in the handler, then a pure updater. */
function twoClicks(bench: Bench, seed: number, strict: boolean): Tally {
  const rand = rng(seed)
  let t: Tally | null = null
  for (let c = 0; c < 2; c++) t = run(t, addBatch(fireMany(bench, 100, rand)), strict)
  return t!
}

/** The same two clicks the old way: the draws inside the updater. */
function twoClicksOld(bench: Bench, seed: number, strict: boolean): Tally {
  const rand = rng(seed)
  let t: Tally | null = null
  for (let c = 0; c < 2; c++) t = run(t, (p) => fireMany(bench, 100, rand, p ?? undefined), strict)
  return t!
}

describe('SG bench: seeded tallies are the same in dev (StrictMode) and production', () => {
  const oven: Bench = { source: 'oven', axes: ['z'], keep: [] }
  const zxz: Bench = { source: 'oven', axes: ['z', 'x', 'z'], keep: ['+', '+'] }

  it('the old updater drifts under StrictMode (the bug the review reproduced: 86/114 against 100/100)', () => {
    expect(twoClicksOld(oven, 709, false)).toMatchObject({ plus: 100, minus: 100 })
    expect(twoClicksOld(oven, 709, true)).toMatchObject({ plus: 86, minus: 114 })
  })

  it('seed 709, oven into one z magnet: 100/100 in both modes, the first 200 draws of the generator', () => {
    const dev = twoClicks(oven, 709, true)
    const prod = twoClicks(oven, 709, false)
    expect(dev).toEqual(prod)
    expect(prod).toEqual(fireMany(oven, 200, rng(709)))
    expect(prod).toMatchObject({ plus: 100, minus: 100 })
  })

  it('z, x, z (keep +, +): blocked counts add up per stop, and dev equals production', () => {
    const dev = twoClicks(zxz, 709, true)
    expect(dev).toEqual(twoClicks(zxz, 709, false))
    expect(dev).toEqual(fireMany(zxz, 200, rng(709)))
    expect(dev.plus + dev.minus + dev.blocked[0] + dev.blocked[1]).toBe(200)
  })

  it('addBatch is pure: it never changes its inputs, and calling it twice gives the same tally', () => {
    const prev: Tally = { plus: 3, minus: 4, blocked: [1, 2] }
    const batch: Tally = { plus: 5, minus: 6, blocked: [7, 8] }
    const u = addBatch(batch)
    expect(u(prev)).toEqual({ plus: 8, minus: 10, blocked: [8, 10] })
    expect(u(prev)).toEqual(u(prev))
    expect(prev).toEqual({ plus: 3, minus: 4, blocked: [1, 2] })
    expect(batch).toEqual({ plus: 5, minus: 6, blocked: [7, 8] })
    expect(u(null)).toEqual(batch)
    expect(u(null).blocked).not.toBe(batch.blocked)
  })
})
