/**
 * Widget W3 `two-clocks` (448 Lecture 11). The widget builds a `clocks` stage state from its controls and draws it with the kind's own
 * resolver and scene, so its numbers are the engine's (physics/dynamics.ts). The Try-it lines of the lecture promise the numbers
 * checked here; the controls themselves (Play, sliders, the start picker) are exercised by the e2e spec.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { clockHands, precession } from '../physics/dynamics'
import { KET } from '../physics/spin'
import TwoClocks, { MEAN_RANGE, PLAY_RATE, SPLIT_RANGE, clocksModel, fmtE, levelsOf } from './TwoClocks'

const DEG = Math.PI / 180
const close = (a: number, b: number, eps = 1e-12) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(eps)
const text = (html: string) => html.replace(/<!-- -->/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')

describe('two-clocks: the levels the sliders ask for', () => {
  it('Ē ± ħω/2, and Ē is raised when the lower level would go below the zero of energy', () => {
    expect(levelsOf(2, 2)).toEqual({ upper: 3, lower: 1, mean: 2 })
    expect(levelsOf(4, 2)).toEqual({ upper: 5, lower: 3, mean: 4 })
    expect(levelsOf(0.5, 4)).toEqual({ upper: 4, lower: 0, mean: 2 })
    expect(MEAN_RANGE.max).toBe(8)
    expect(SPLIT_RANGE.max).toBe(4)
    expect(PLAY_RATE * 4).toBe(180) // a full lap of the arrow in four seconds when ħω = 2ε
    expect([fmtE(1), fmtE(0), fmtE(3), fmtE(2.5)]).toEqual(['ε', '0', '3ε', '2.5ε'])
  })
})

describe('two-clocks: the picture is the engine’s', () => {
  it('Ē = 2ε, ħω = 2ε (the lecture’s 3ε and ε), |+x⟩: at εt/ħ = 45° the gap is 90° and the arrow is at +y', () => {
    const m = clocksModel({ mean: 2, hbarOmega: 2, start: '+x', timeDeg: 45 })
    close(m.r.gapDeg!, 90, 1e-9)
    close(m.r.bloch[1], 1, 1e-12)
    expect(m.lines).toEqual(['εt/ħ = 45°', 'hands −135°, −45°', 'gap = 90°', 'P(+x) = 0.5'])
    const h = clockHands({ upper: 3, lower: 1 }, KET['+x'], 45 * DEG)
    h.turned.forEach((t, i) => close(m.r.hands.turned[i], t))
    close(m.r.px, precession({ upper: 3, lower: 1 }, 45 * DEG).pPlusX)
  })
  it('raising Ē by 2 (both levels up by 2) speeds the hands but leaves the gap, P(+x) and the arrow alone', () => {
    const a = clocksModel({ mean: 2, hbarOmega: 2, start: '+x', timeDeg: 30 })
    const b = clocksModel({ mean: 4, hbarOmega: 2, start: '+x', timeDeg: 30 })
    expect(b.state.kind === 'clocks' && b.state.levels).toEqual({ upper: 5, lower: 3 })
    close(a.r.gapDeg!, b.r.gapDeg!, 1e-9)
    close(a.r.px, b.r.px)
    a.r.bloch.forEach((x, i) => close(x, b.r.bloch[i]))
    expect(Math.abs(b.r.hands.turned[0])).toBeGreaterThan(Math.abs(a.r.hands.turned[0]))
    expect(Math.abs(b.r.hands.turned[1])).toBeGreaterThan(Math.abs(a.r.hands.turned[1]))
  })
  it('a larger splitting ħω turns the arrow faster: the gap at the same time is (E₊ − E₋) times the time', () => {
    for (const w of [1, 2, 3, 4]) close(clocksModel({ mean: 4, hbarOmega: w, start: '+x', timeDeg: 20 }).r.gapDeg!, w * 20, 1e-9)
  })
  it('starting in |+z⟩ gives one clock and no gap: nothing a reader could see moves', () => {
    const m = clocksModel({ mean: 2, hbarOmega: 2, start: '+z', timeDeg: 90 })
    expect(m.r.gapDeg).toBeNull()
    expect(m.lines).toContain('gap: one clock only')
    close(m.r.bloch[2], 1)
    close(m.r.px, 0.5)
  })
  it('the third start has θ = 60°: hand lengths cos 30° and sin 30°, azimuth φ₀ + ωt', () => {
    const m = clocksModel({ mean: 2, hbarOmega: 2, start: 'tilt', timeDeg: 30 })
    close(m.r.hands.length[0], Math.cos(30 * DEG))
    close(m.r.hands.length[1], Math.sin(30 * DEG))
    close(m.r.gapDeg!, 60, 1e-9)
  })
})

describe('two-clocks: renders', () => {
  it('draws the ladder, both dials, the gap and the equator, the controls and the note, with no NaN', () => {
    const html = renderToString(<TwoClocks />)
    const t = text(html)
    for (const a of ['level-upper', 'level-lower', 'gap-arrow', 'clock-upper', 'clock-lower', 'gap-dial', 'top-arrow']) expect(html).toContain(`data-anchor="${a}"`)
    expect(t).toContain('E₊ = 3ε')
    expect(t).toContain('time εt/ħ')
    expect(t).toContain('mean energy Ē')
    expect(t).toContain('splitting ħω')
    expect(t).toContain('Play')
    expect(html).not.toMatch(/NaN|Infinity|undefined/)
  })
  it('props: other levels and another start; editable false draws no level sliders or start picker', () => {
    const t = text(renderToString(<TwoClocks upper={5} lower={3} start="+z" />))
    expect(t).toContain('E₊ = 5ε')
    expect(t).toContain('one clock only')
    const fixed = text(renderToString(<TwoClocks editable={false} />))
    expect(fixed).not.toContain('mean energy Ē')
    expect(fixed).not.toContain('splitting ħω')
    expect(fixed).toContain('Play')
    expect(fixed).toContain('time εt/ħ')
  })
})
