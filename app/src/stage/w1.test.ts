/**
 * W1 pure pieces: the scroll → beat-position map (useStoryScroll), the label layout pass (D §6.1
 * mechanism), the DPR governor (W-L1 §2.7) and the host-epoch / snap store additions.
 */
import { describe, expect, it } from 'vitest'
import { GOVERNOR, governorFeed, governorInit, p95 } from './governor'
import { candidates, grow, inside, intersects, placeLabel, safeArea, type LRect } from './labelLayout'
import { bumpHostEpoch, registerScrollSnap, releaseUnit, snapAllScroll, stage, trackUnit } from './store'
import { beatPosition } from './useStoryScroll'

describe('beatPosition (scroll centre line → u)', () => {
  // three articles: [100, 300) · gap · [320, 420) · [420, 820)
  const tops = [100, 320, 420]
  const heights = [200, 100, 400]
  it('is 0 before the first article and n past the last', () => {
    expect(beatPosition(0, tops, heights)).toBe(0)
    expect(beatPosition(99.9, tops, heights)).toBe(0)
    expect(beatPosition(820, tops, heights)).toBe(3)
    expect(beatPosition(5000, tops, heights)).toBe(3)
  })
  it('is k + fraction inside article k, whatever the article heights', () => {
    expect(beatPosition(100, tops, heights)).toBe(0)
    expect(beatPosition(200, tops, heights)).toBeCloseTo(0.5, 12)
    expect(beatPosition(370, tops, heights)).toBeCloseTo(1.5, 12)
    expect(beatPosition(620, tops, heights)).toBeCloseTo(2.5, 12)
  })
  it('holds k + 0.999 in the gap after article k (the beat does not change until the next text arrives)', () => {
    expect(beatPosition(310, tops, heights)).toBe(0.999)
    expect(Math.floor(beatPosition(319.9, tops, heights))).toBe(0)
  })
  it('is monotone over a scroll sweep', () => {
    let prev = -1
    for (let c = 0; c <= 900; c += 0.5) {
      const u = beatPosition(c, tops, heights)
      expect(u).toBeGreaterThanOrEqual(prev)
      prev = u
    }
  })
  it('handles no articles', () => expect(beatPosition(100, [], [])).toBe(0))
})

describe('label layout pass', () => {
  const bounds: LRect = { x: 0, y: 0, w: 400, h: 300 }
  const size = { w: 40, h: 16 }
  it('keeps the anchor when nothing is in the way', () => {
    expect(placeLabel({ x: 200, y: 150 }, size, [], bounds)).toEqual({ x: 200, y: 150, dx: 0, dy: 0 })
  })
  it('tries up, right, down, left at 20 then 36 px, in that order', () => {
    expect(candidates()).toEqual([
      [0, 0],
      [0, -20],
      [20, 0],
      [0, 20],
      [-20, 0],
      [0, -36],
      [36, 0],
      [0, 36],
      [-36, 0],
    ])
    // an obstacle on the anchor pushes the label up by 20
    const block: LRect = { x: 190, y: 145, w: 20, h: 10 }
    expect(placeLabel({ x: 200, y: 150 }, size, [block], bounds)).toMatchObject({ dx: 0, dy: -20 })
  })
  it('never overlaps a reserved zone or leaves the bounds; fades out when nothing fits', () => {
    const passport = grow({ x: 14, y: 14, w: 280, h: 44 }, 8)
    const p = placeLabel({ x: 60, y: 40 }, size, [passport], bounds)!
    const r = { x: p.x - size.w / 2, y: p.y - size.h / 2, ...size }
    expect(intersects(r, passport)).toBe(false)
    expect(inside(r, bounds)).toBe(true)
    const wall: LRect = { x: 0, y: 0, w: 400, h: 300 }
    expect(placeLabel({ x: 200, y: 150 }, size, [wall], bounds)).toBeNull()
  })
  it('two labels on the same anchor end up apart (placed labels are obstacles)', () => {
    const a = placeLabel({ x: 200, y: 150 }, size, [], bounds)!
    const ra = { x: a.x - 20, y: a.y - 8, ...size }
    const b = placeLabel({ x: 200, y: 150 }, size, [ra], bounds)!
    expect(intersects(ra, { x: b.x - 20, y: b.y - 8, ...size })).toBe(false)
  })
  it('safe area follows D §6.1 (top 72, bottom 132, sides 24)', () => {
    expect(safeArea(560, 800)).toEqual({ x: 24, y: 72, w: 512, h: 596 })
  })
})

describe('DPR governor', () => {
  const feed = (g: ReturnType<typeof governorInit>, ms: number, windows: number, max = 2) => {
    const changes: number[] = []
    for (let i = 0; i < windows * GOVERNOR.window; i++) {
      const c = governorFeed(g, ms, max)
      if (c !== null) changes.push(c)
    }
    return changes
  }
  it('p95 of a window', () => {
    expect(p95(Array.from({ length: 100 }, (_, i) => i + 1))).toBe(95)
  })
  it('two windows above 10 ms lower the cap by 0.5, never below 1', () => {
    const g = governorInit(2)
    expect(feed(g, 12, 1)).toEqual([])
    expect(feed(g, 12, 1)).toEqual([1.5])
    expect(feed(g, 12, 2)).toEqual([1])
    expect(feed(g, 12, 6)).toEqual([])
    expect(g.cap).toBe(1)
  })
  it('five windows under 5 ms restore it step by step, up to the device ratio', () => {
    const g = governorInit(1)
    expect(feed(g, 3, 4)).toEqual([])
    expect(feed(g, 3, 1)).toEqual([1.5])
    expect(feed(g, 3, 5)).toEqual([2])
    expect(feed(g, 3, 10)).toEqual([])
    const h = governorInit(1)
    expect(feed(h, 3, 10, 1.5)).toEqual([1.5])
  })
  it('a window in between resets both runs', () => {
    const g = governorInit(2)
    feed(g, 12, 1)
    feed(g, 7, 1)
    expect(feed(g, 12, 1)).toEqual([])
  })
})

describe('store additions (W1)', () => {
  it('bumpHostEpoch increments the epoch the host is keyed by', () => {
    const e = stage.hostEpoch
    bumpHostEpoch()
    expect(stage.hostEpoch).toBe(e + 1)
  })
  it('snapAllScroll completes smoothing: u := uRaw on every tracked unit, via each registered snapper', () => {
    const t = trackUnit('w1-snap', [])
    t.uRaw = 2.5
    t.u = 1
    let called = 0
    const off = registerScrollSnap('w1-snap', () => called++)
    snapAllScroll()
    expect([called, t.u]).toEqual([1, 2.5])
    off()
    snapAllScroll()
    expect(called).toBe(1)
    releaseUnit('w1-snap')
  })
})
