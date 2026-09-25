import { describe, expect, it } from 'vitest'
import { quantizeHold, sampleBeats, smoothstep, TRANSITION_HALF_WIDTH as W } from './sample'

describe('sampleBeats (W-L1 §2.5)', () => {
  it('holds beat k over [k + w, k + 1 − w] with hold progress 0 → 1; beat 0 from 0, beat n−1 to n', () => {
    const n = 4
    expect(sampleBeats(0, n, true)).toMatchObject({ a: 0, b: 0, t: 0, beat: 0, hold: 0 })
    expect(sampleBeats(1 - W, n, true)).toMatchObject({ a: 0, b: 0, t: 0, beat: 0, hold: 1 })
    const mid = sampleBeats(1.5, n, true)
    expect(mid).toMatchObject({ a: 1, b: 1, t: 0, beat: 1 })
    expect(mid.hold).toBeCloseTo(0.5, 12)
    expect(sampleBeats(n, n, true)).toMatchObject({ a: 3, b: 3, beat: 3, hold: 1 })
    expect(sampleBeats(3 + W, n, true).hold).toBe(0)
  })

  it('changes a → b over [k − w, k + w] with smoothstep, sA = 1 and sB = 0', () => {
    const n = 3
    const at = (u: number) => sampleBeats(u, n, true)
    expect(at(1 - W + 1e-9)).toMatchObject({ a: 0, b: 1, sA: 1, sB: 0 })
    expect(at(1 - W + 1e-9).t).toBeLessThan(1e-6)
    expect(at(1)).toMatchObject({ a: 0, b: 1, t: 0.5, beat: 1 })
    expect(at(1 + W - 1e-9).t).toBeGreaterThan(1 - 1e-6)
    expect(at(1 - 0.1).t).toBeCloseTo(smoothstep((0.9 - (1 - W)) / (2 * W)), 12)
    // the text line decides the beat even inside the window
    expect(at(0.9).beat).toBe(0)
    expect(at(1.1).beat).toBe(1)
  })

  it('n = 1: never transitions; u outside [0, n] is clamped; NaN reads as 0', () => {
    expect(sampleBeats(0.5, 1, true)).toMatchObject({ a: 0, b: 0, t: 0 })
    expect(sampleBeats(-3, 3, true)).toMatchObject({ beat: 0, hold: 0 })
    expect(sampleBeats(99, 3, true)).toMatchObject({ beat: 2, hold: 1 })
    expect(sampleBeats(Number.NaN, 3, true)).toMatchObject({ beat: 0, hold: 0 })
  })

  it('reduced motion (decision #18): the beat still follows scroll, changes are cuts, holds jump in 3 steps', () => {
    const n = 3
    for (let u = 0; u <= n; u += 0.01) {
      const s = sampleBeats(u, n, false)
      expect(s.t).toBe(0)
      expect(s.a).toBe(s.b)
      expect(s.beat).toBe(Math.min(n - 1, Math.floor(u)))
      expect([0, 0.5, 1]).toContain(s.hold)
    }
    expect(quantizeHold(0.2)).toBe(0)
    expect(quantizeHold(0.5)).toBe(0.5)
    expect(quantizeHold(0.9)).toBe(1)
  })
})
