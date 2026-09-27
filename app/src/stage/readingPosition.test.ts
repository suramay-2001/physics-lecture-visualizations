/**
 * stage/readingPosition.ts without a browser: a fake document of beat articles (top, height in viewport px) and a
 * window whose scrollTo is recorded. The browser behaviour (Story ↔ Read, the track toggle, a bridge's return) is
 * covered end to end by e2e/nav.spec.ts, e2e/story.spec.ts and e2e/bridge.spec.ts.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { probeReadingPosition, restoreReadingPosition } from './readingPosition'

interface FakeBeat {
  beat: string
  top: number
  height: number
}

function page(beats: FakeBeat[], vh = 800, scrollY = 1000) {
  const scrolls: number[] = []
  const els = beats.map((b) => ({
    dataset: { beat: b.beat },
    getBoundingClientRect: () => ({ top: b.top, bottom: b.top + b.height, height: b.height, width: 500 }) as DOMRect,
  }))
  vi.stubGlobal('document', { querySelectorAll: () => els })
  vi.stubGlobal('innerHeight', vh)
  vi.stubGlobal('scrollY', scrollY)
  vi.stubGlobal('window', { scrollTo: ({ top }: { top: number }) => scrolls.push(top) })
  return scrolls
}

afterEach(() => vi.unstubAllGlobals())

describe('reading position', () => {
  it('probes the beat under the centre line and how far into it the line sits', () => {
    page([
      { beat: 'q0-a:b1', top: -300, height: 400 },
      { beat: 'q0-a:b2', top: 200, height: 400 }, // centre 400 → 200 px into 400 = 0.5
      { beat: 'q0-a:b3', top: 700, height: 400 },
    ])
    expect(probeReadingPosition()).toEqual({ beat: 'q0-a:b2', frac: 0.5 })
  })

  it('takes the nearest beat when the centre line falls in a gap, and nothing when every beat is far away', () => {
    page([
      { beat: 'q0-a:b1', top: 0, height: 350 },
      { beat: 'q0-a:b2', top: 420, height: 300 },
    ])
    expect(probeReadingPosition()).toEqual({ beat: 'q0-a:b2', frac: 0 })
    page([{ beat: 'q0-a:b1', top: 3000, height: 300 }])
    expect(probeReadingPosition()).toBeNull()
  })

  it('restores: the same point of the beat lands on the centre line (document px), clamped at the top', () => {
    const scrolls = page([{ beat: 'q0-a:b2', top: 600, height: 400 }], 800, 1000)
    // point = 1000 + 600 + 0.25·400 = 1700; minus half the viewport = 1300
    expect(restoreReadingPosition({ beat: 'q0-a:b2', frac: 0.25 })).toBe(true)
    expect(scrolls).toEqual([1300])
    expect(restoreReadingPosition({ beat: 'q0-a:b9', frac: 0.25 })).toBe(false)
    const top = page([{ beat: 'q0-a:b1', top: 10, height: 100 }], 800, 0)
    restoreReadingPosition({ beat: 'q0-a:b1', frac: 5 }) // frac is clamped to 1: 110 − 400 < 0 → 0
    expect(top).toEqual([0])
  })

  it('a probe followed by a restore is a fixed point', () => {
    const scrolls = page([
      { beat: 'l1-average:b3', top: 150, height: 500 },
      { beat: 'l1-average:b4', top: 650, height: 500 },
    ])
    const pos = probeReadingPosition()!
    restoreReadingPosition(pos)
    expect(scrolls).toEqual([1000]) // already there: the page does not move
  })
})
