/**
 * The SG bench's store: the counting rules (store.ts) and the controls' actions.
 *   - counts are cumulative over volleys at one setup, with a new seed per volley, equal to the engine's samples;
 *   - any change to the bench starts a fresh plate and keeps the old counts as "before the change";
 *   - with motion the counts reach the readouts when the volley lands; a second volley lands the first;
 *   - tilts, keeps, add/remove, sources and presets; crafted preset ids change nothing.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireMany } from '../../../physics/sg'
import { rng } from '../../../physics/random'
import { benchOf, seedOf, SETUPS } from './model'
import {
  addMagnet,
  applySetup,
  clearPlate,
  commitFlight,
  dragTilt,
  fire,
  INITIAL_PARAMS,
  nudgeTilt,
  removeMagnet,
  resetSg,
  setKeep,
  setSource,
  setTilt,
  setupOf,
  sgStore,
} from './store'

afterEach(() => {
  resetSg()
  vi.useRealTimers()
})
const s = () => sgStore.get()

describe('counting', () => {
  it('volleys add up at one setup, each with a new seed, equal to the engine’s fireMany with that seed', () => {
    fire(1000)
    fire(100)
    const st = s()
    expect(st.counts.n).toBe(1100)
    expect(st.volleys).toBe(2)
    expect(st.last).toEqual({ n: 100, seed: seedOf(1) })
    const b = benchOf(setupOf(st))
    const a = fireMany(b, 1000, rng(seedOf(0)))
    const c = fireMany(b, 100, rng(seedOf(1)))
    expect(st.counts.plus).toBe(a.plus + c.plus)
    expect(st.counts.minus).toBe(a.minus + c.minus)
    expect(st.counts.blocked).toEqual([a.blocked[0] + c.blocked[0]])
    expect(st.plate.count).toBe(st.counts.plus + st.counts.minus)
  })

  it('a change to the bench starts a fresh plate and keeps the old counts as "before the change"; Clear keeps nothing', () => {
    fire(1000)
    const plus = s().counts.plus
    setTilt(1, 60)
    expect(s().counts.n).toBe(0)
    expect(s().plate.count).toBe(0)
    expect(s().previous?.chain).toBe('oven → z keep + → x')
    expect(s().previous?.text).toMatch(new RegExp(`^\\+ ${plus} / 1\u202f000 `))
    fire(100)
    clearPlate()
    expect(s().counts.n).toBe(0)
    expect(s().tilts).toEqual([0, 60])
    // the seeds go on: a cleared plate never reuses one
    fire(100)
    expect(s().last?.seed).toBe(seedOf(2))
  })

  it('with motion, the counts reach the readouts when the volley lands; a second volley lands the first at once', () => {
    vi.useFakeTimers()
    fire(1000, { motion: true })
    expect(s().counts.n).toBe(0)
    expect(s().flight?.n).toBe(1000)
    expect(s().plate.flight).not.toBeNull()
    fire(100, { motion: true })
    expect(s().counts.n).toBe(1000)
    expect(s().flight?.n).toBe(1100)
    vi.advanceTimersByTime(1800)
    expect(s().counts.n).toBe(1100)
    expect(s().flight).toBeNull()
    expect(s().plate.flight).toBeNull()
    expect(s().plate.start).toBe(s().plate.count)
    commitFlight() // nothing in flight: no change
    expect(s().counts.n).toBe(1100)
  })

  it('a change while a volley flies drops it (the counts belonged to the old setup)', () => {
    vi.useFakeTimers()
    fire(1000, { motion: true })
    setKeep(0, '-')
    vi.advanceTimersByTime(2000)
    expect(s().counts.n).toBe(0)
    expect(s().previous?.text).toMatch(/\/ 1\u202f000/)
  })

  it('refuses nonsense volleys', () => {
    for (const n of [0, -5, 1.5, NaN, 1e9]) expect(fire(n)).toBeNull()
    expect(s().volleys).toBe(0)
  })
})

describe('controls', () => {
  it('tilts: typed (wrapped), dragged (snapped to 15°, Shift 1°), nudged to the next mark', () => {
    setTilt(0, -30)
    expect(s().tilts[0]).toBe(330)
    dragTilt(1, 52, false)
    expect(s().tilts[1]).toBe(45)
    dragTilt(1, 52.4, true)
    expect(s().tilts[1]).toBe(52)
    nudgeTilt(1, { axis: 0, dir: 1, fine: false })
    expect(s().tilts[1]).toBe(60)
    nudgeTilt(1, { axis: 0, dir: -1, fine: true })
    expect(s().tilts[1]).toBe(59)
    setTilt(7, 10) // no magnet 8
    expect(s().tilts).toEqual([330, 59])
  })

  it('add and remove keep one kept sign per stop; 1–4 magnets', () => {
    addMagnet()
    addMagnet()
    addMagnet()
    expect(s().tilts).toEqual([0, 90, 0, 0])
    expect(s().keep).toEqual(['+', '+', '+'])
    setKeep(2, '-')
    removeMagnet(1)
    expect(s().tilts).toEqual([0, 0, 0])
    expect(s().keep).toEqual(['+', '-'])
    removeMagnet(2)
    expect(s().tilts).toEqual([0, 0])
    expect(s().keep).toEqual(['+'])
    removeMagnet(0)
    removeMagnet(0)
    expect(s().tilts).toHaveLength(1)
    expect(s().keep).toEqual([])
  })

  it('sources, including the sealed |±y⟩ boxes', () => {
    setSource('+y')
    expect(s().source).toBe('+y')
    setSource('nope' as never)
    expect(s().source).toBe('+y')
  })

  it('presets: an allowlisted id sets its setup; crafted ids change nothing', () => {
    applySetup('l1-zxz')
    expect(setupOf(s())).toEqual({ source: 'oven', tilts: [0, 90, 0], keep: ['+', '+'] })
    expect(s().preset).toBe('l1-zxz')
    for (const bad of ['__proto__', 'constructor', 'l1-zxz&tilts=60', 'toString', ''] as const) {
      applySetup(bad)
      expect(setupOf(s())).toEqual({ source: 'oven', tilts: [0, 90, 0], keep: ['+', '+'] })
    }
    // an edit clears the preset
    setTilt(1, 45)
    expect(s().preset).toBeNull()
    // re-applying the preset the bench already matches only marks it
    resetSg()
    expect(s().preset).toBe(INITIAL_PARAMS.preset)
    applySetup('l1-zx')
    const p = SETUPS['l1-zx']
    expect(setupOf(s())).toEqual({ source: p.source, tilts: p.tilts, keep: p.keep })
  })
})
