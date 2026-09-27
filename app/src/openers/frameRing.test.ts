import { describe, expect, it } from 'vitest'
import { RING_SIZE, frameAt, loadOrder, nearestDecoded, ringFrames } from './frameRing'

describe('opener frame ring (D §5.3 memory budget)', () => {
  it('holds at most 9 decoded frames: the current one, 6 ahead, 2 behind', () => {
    const r = ringFrames(50, 1, 120)
    expect(r).toHaveLength(RING_SIZE)
    expect(new Set(r)).toEqual(new Set([48, 49, 50, 51, 52, 53, 54, 55, 56]))
    expect(new Set(ringFrames(50, -1, 120))).toEqual(new Set([44, 45, 46, 47, 48, 49, 50, 51, 52]))
  })
  it('stays inside the film at both ends and still fills the ring', () => {
    const start = ringFrames(0, -1, 120)
    expect(start.every((f) => f >= 0 && f < 120)).toBe(true)
    expect(start).toHaveLength(RING_SIZE)
    const end = ringFrames(119, 1, 120)
    expect(end.every((f) => f >= 0 && f < 120)).toBe(true)
    expect(end).toHaveLength(RING_SIZE)
    expect(end[0]).toBe(119)
  })
  it('loads every 8th frame (and the last) first, then every other frame exactly once', () => {
    const o = loadOrder(120)
    expect(o.slice(0, 16)).toEqual([0, 8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96, 104, 112, 119])
    expect([...o].sort((a, b) => a - b)).toEqual(Array.from({ length: 120 }, (_, i) => i))
  })
  it('never shows a blank: the nearest decoded frame stands in', () => {
    expect(nearestDecoded(10, new Set([0, 8, 16]))).toBe(8)
    expect(nearestDecoded(12, new Set([8, 16]))).toBe(8)
    expect(nearestDecoded(13, new Set([8, 16]))).toBe(16)
    expect(nearestDecoded(5, new Set())).toBeNull()
  })
  it('maps scroll progress to frames 0…119', () => {
    expect(frameAt(0, 120)).toBe(0)
    expect(frameAt(1, 120)).toBe(119)
    expect(frameAt(-0.2, 120)).toBe(0)
    expect(frameAt(0.5, 120)).toBe(60)
  })
})
