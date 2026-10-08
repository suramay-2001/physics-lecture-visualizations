/**
 * The SVG route's plumbing (content/stage.ts KIND_RENDER; stage/svgKinds.ts; stage/timing.ts): each of 448's own six kinds
 * stays a WebGL kind (the SVG kinds are shared stage code a 448 lecture may use), the registry refuses a WebGL kind, the one per-frame step (reveal mixes and the reader-driven clock) is
 * the Driver's, and a story needs WebGL exactly when one of its kinds does.
 */
import { describe, expect, it } from 'vitest'
import { KIND_RENDER, STAGE_KINDS_448, STAGE_KINDS_709, glKinds, svgKinds } from '../content/stage'
import { registerSvgKind, svgKindsReady } from './svgKinds'
import { REVEAL_SECONDS, SETTLE_SECONDS, advanceUnit } from './timing'
import { releaseUnit, trackUnit } from './store'
import { needsWebgl } from './useLiveStage'
import { DEMO } from '../content/__fixtures__/demoStory'

describe('KIND_RENDER', () => {
  it('each of 448’s own six kinds draws on the WebGL canvas; the SVG kinds are shared stage code, listed apart (W-448 #5)', () => {
    for (const k of STAGE_KINDS_448) expect(KIND_RENDER[k], k).toBe('gl')
    // the other list (named for 709, which built them) is the SVG kinds, and a 448 lecture may use any of them
    for (const k of STAGE_KINDS_709) expect(KIND_RENDER[k], k).toBe('svg')
    expect(glKinds([...STAGE_KINDS_448])).toEqual([...STAGE_KINDS_448])
    expect(svgKinds([...STAGE_KINDS_448])).toEqual([])
    expect(svgKindsReady([...STAGE_KINDS_448])).toBe(true)
  })
  it('the registry refuses a WebGL kind', () => {
    expect(() => registerSvgKind({ kind: 'bloch' } as never)).toThrow(/WebGL kind/)
  })
  it('a story needs WebGL when any kind does, and when no kinds are known (the old rule)', () => {
    expect(needsWebgl()).toBe(true)
    expect(needsWebgl([])).toBe(true)
    expect(needsWebgl(['lab-r3', 'hilbert-plane'])).toBe(true)
  })
})

describe('advanceUnit: the Driver’s per-frame step, shared with the SVG route', () => {
  const beats = DEMO.units[0].story!
  const reveal = beats.findIndex((b) => b.reveal)
  it('moves a reveal mix at 1/REVEAL_SECONDS per second with motion, and cuts without', () => {
    const t = trackUnit('svgroute-demo', beats)
    try {
      t.revealed = new Set([reveal])
      advanceUnit(t, 0.1, 0, true)
      expect(t.revealMix[reveal]).toBeCloseTo(0.1 / REVEAL_SECONDS, 12)
      advanceUnit(t, 0.1, 0, false)
      expect(t.revealMix[reveal]).toBe(1)
      t.revealed = new Set()
      advanceUnit(t, 0.1, 0, false)
      expect(t.revealMix[reveal]).toBe(0)
    } finally {
      releaseUnit('svgroute-demo')
    }
  })
  it('the clock runs only while the reader acted within SETTLE_SECONDS (or a reveal moves), and never without motion', () => {
    const t = trackUnit('svgroute-clock', beats)
    try {
      t.clock = 0
      t.lastInput = 1000
      advanceUnit(t, 0.05, 1000 + SETTLE_SECONDS * 500, true)
      expect(t.clock).toBeCloseTo(0.05, 12)
      advanceUnit(t, 0.05, 1000 + SETTLE_SECONDS * 2000, true)
      expect(t.clock).toBeCloseTo(0.05, 12)
      advanceUnit(t, 0.05, 1000, false)
      expect([t.clock, t.delta]).toEqual([0.05, 0])
    } finally {
      releaseUnit('svgroute-clock')
    }
  })
})
