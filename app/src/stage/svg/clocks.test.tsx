/**
 * `clocks` (SVG; W-448 L11): the two phase clocks of a two-level system. Content writes only inputs (the two levels in units of ε,
 * the start state, the elapsed time εt/ħ in degrees, the panels and readouts); the resolver draws every hand angle, hand length,
 * gap and chance from the one engine (physics/dynamics.ts), shared with the `two-clocks` widget. These tests check the resolved
 * hands against a direct engine call and against the lecture's numbers, the unwrapped sweep, interpolation, the validation
 * limits, the readout text, and that the one scene packs its panels inside the box and draws all of it with no NaN.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { fidelityOf } from '../../content/fidelity'
import type { ClocksState } from '../../content/stage'
import { CLOCKS_PANELS, KIND_RENDER, PASSPORT, passportOf } from '../../content/stage'
import { ANCHORS, SHOTS } from '../../content/stageVocab'
import { clockHands, precession } from '../../physics/dynamics'
import { KET } from '../../physics/spin'
import { FigureFor } from '../figures/FigureFor'
import { interpolate } from '../interp'
import { resolve, validateLayout, validateStage } from '../resolve'
import { svgKindDef } from '../svgKinds'
import type { ResolvedClocks } from '../types'
import { CLOCKS_LIMITS, clocksInputs, clocksReadouts } from './clocks'
import { ClocksScene, clocksLayout } from './ClocksScene'
import './kinds'

const DEG = Math.PI / 180
const K = (x: Omit<ClocksState, 'kind' | 'levels'> & { levels?: ClocksState['levels'] }): ClocksState => ({ kind: 'clocks', levels: { upper: 3, lower: 1 }, ...x })
const R = (st: ClocksState, s = 1) => resolve(st, s) as ResolvedClocks
const close = (a: number, b: number, eps = 1e-12) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(eps)

describe('clocks: the SVG route, the passport and the vocabulary', () => {
  it('is an SVG kind registered by the lazy module, with its own passport (the hue legend) and drawer', () => {
    expect(KIND_RENDER.clocks).toBe('svg')
    expect(svgKindDef('clocks')).toBeDefined()
    expect(PASSPORT.clocks).toMatchObject({ title: 'PHASE CLOCKS · two energy levels', fidelityKey: 'clocks', legend: 'phase' })
    expect(PASSPORT.clocks.note).toMatch(/hand angles, hand lengths and the gap are exact/)
    expect(passportOf(K({ timeDeg: 0 }))).toBe(PASSPORT.clocks)
    for (const list of Object.values(fidelityOf('clocks'))) expect(list.length).toBeGreaterThan(0)
    expect(SHOTS.clocks).toEqual(['K-STD'])
    expect(ANCHORS.clocks).toEqual(['level-upper', 'level-lower', 'mean', 'gap-arrow', 'clock-upper', 'clock-lower', 'gap-dial', 'top-arrow'])
    expect(svgKindDef('clocks')!.print).toEqual({ w: 320, h: 380 })
  })
})

describe('clocks: the resolved hands are the engine’s', () => {
  it('E₊ = 3ε, E₋ = ε from |+x⟩ at εt/ħ = 30°: hands −90°, −30°, both of length 0.707, gap 60°; Ē = 2ε and ħω = 2ε are derived', () => {
    const r = R(K({ timeDeg: 30 }))
    expect([r.mean, r.hbarOmega]).toEqual([2, 2])
    close(r.hands.angleDeg[0], -90, 1e-9)
    close(r.hands.angleDeg[1], -30, 1e-9)
    close(r.hands.length[0], Math.SQRT1_2)
    close(r.gapDeg!, 60, 1e-9)
    const h = clockHands({ upper: 3, lower: 1 }, KET['+x'], 30 * DEG)
    h.turned.forEach((t, i) => close(r.hands.turned[i], t, 1e-12))
  })
  it('the quarter turn is εt/ħ = 45° (gap 90°, the arrow at +y), the lap is 180° (gap back to 0, P(+x) back to 1)', () => {
    const q = R(K({ timeDeg: 45 }))
    close(q.gapDeg!, 90, 1e-9)
    close(q.bloch[0], 0, 1e-12)
    close(q.bloch[1], 1, 1e-12)
    close(q.px, 0.5, 1e-12)
    const lap = R(K({ timeDeg: 180 }))
    expect(Math.min(lap.gapDeg!, 360 - lap.gapDeg!)).toBeLessThan(1e-9)
    close(lap.px, 1, 1e-12)
  })
  it('a sweep resolves at each hold progress; the drawn angle is UNWRAPPED (a hand that goes 1½ times round reads −3π)', () => {
    const st = K({ timeDeg: { from: 0, to: 540 } })
    close(R(st, 0).timeDeg, 0)
    close(R(st, 1).timeDeg, 540)
    close(R(st, 1).hands.turned[0], -3 * 540 * DEG, 1e-9)
    close(R(st, 1).hands.turned[1], -1 * 540 * DEG, 1e-9)
    close(R(st, 0.5).hands.turned[0], -3 * 270 * DEG, 1e-9)
    expect(clocksInputs(st, 0.25).timeDeg).toBe(135)
  })
  it('a start off the equator keeps its hand lengths; a start at a pole has one hand and no gap', () => {
    const r = R(K({ timeDeg: 20, start: { thetaDeg: 60, phiDeg: 25 } }))
    close(r.hands.length[0], Math.cos(30 * DEG))
    close(r.hands.length[1], Math.sin(30 * DEG))
    close(r.gapDeg!, 25 + 2 * 20, 1e-9)
    const pole = R(K({ timeDeg: 20, start: '+z' }))
    expect(pole.gapDeg).toBeNull()
    expect(pole.hands.length[1]).toBeLessThan(1e-12)
    expect(R(K({ timeDeg: 20, start: '-z' })).gapDeg).toBeNull()
  })
  it('P(+x), ⟨S_x⟩ and the arrow come from the engine’s evolved ket (the equator arrow is the Bloch vector’s x–y part)', () => {
    const r = R(K({ timeDeg: 15 }))
    const p = precession({ upper: 3, lower: 1 }, 15 * DEG)
    close(r.px, p.pPlusX)
    close(r.sx, p.sx)
    r.bloch.forEach((x, i) => close(x, p.bloch[i]))
    close(r.px, Math.cos(15 * DEG) ** 2) // cos²(ωt/2) with ωt = 2 × 15° = 30°
  })
  it('raising both levels by 2 changes the hands’ speeds but not the gap, P(+x) or the arrow', () => {
    const a = R(K({ timeDeg: 30 }))
    const b = R(K({ timeDeg: 30, levels: { upper: 5, lower: 3 } }))
    close(a.gapDeg!, b.gapDeg!, 1e-9)
    close(a.px, b.px)
    a.bloch.forEach((x, i) => close(x, b.bloch[i], 1e-12))
    expect(Math.abs(b.hands.turned[0])).toBeGreaterThan(Math.abs(a.hands.turned[0]))
  })
})

describe('clocks: interpolation and readouts', () => {
  it('time, levels and the start state lerp; panels and readouts switch at the half-way point; every output is recomputed', () => {
    const a = R(K({ timeDeg: 0, show: ['levels'] }))
    const b = R(K({ timeDeg: 90, levels: { upper: 5, lower: 3 }, show: ['clocks', 'gap'], readouts: ['phases'] }))
    const m = interpolate(a, b, 0.5) as ResolvedClocks
    expect(m.timeDeg).toBe(45)
    expect(m.levels).toEqual({ upper: 4, lower: 2 })
    expect(m.show).toEqual(['clocks', 'gap'])
    close(m.gapDeg!, 90, 1e-9) // (4 − 2) × 45°
    expect((interpolate(a, b, 0.25) as ResolvedClocks).show).toEqual(['levels'])
    expect(interpolate(a, b, 0)).toBe(a)
    expect(interpolate(a, b, 1)).toBe(b)
  })
  it('the readouts: the time always, then hands, gap and P(+x) as asked, whole degrees with a typographic minus', () => {
    const r = R(K({ timeDeg: 30, readouts: ['phases', 'gap', 'px'] }))
    expect(clocksReadouts(r).map((x) => x.name)).toEqual(['time', 'phases', 'gap', 'px'])
    expect(clocksReadouts(r).map((x) => x.text)).toEqual(['εt/ħ = 30°', 'hands −90°, −30°', 'gap = 60°', 'P(+x) = 0.75'])
    expect(clocksReadouts(R(K({ timeDeg: 20, start: '+z', readouts: ['phases', 'gap'] }))).map((x) => x.text)).toEqual(['εt/ħ = 20°', 'hand −60°', 'gap: one clock only'])
    expect(clocksReadouts(R(K({ timeDeg: 180 }))).map((x) => x.text)).toEqual(['εt/ħ = 180°'])
    // a gap that rounds to a full turn reads 0°, not 360°
    expect(clocksReadouts(R(K({ timeDeg: 179.9, readouts: ['gap'] }))).map((x) => x.text)[1]).toBe('gap = 0°')
  })
})

describe('clocks: validation', () => {
  const v = (x: Parameters<typeof K>[0]) => validateStage(K(x))
  it('a valid state passes at every shape the lecture uses', () => {
    expect(v({ timeDeg: 0, show: ['levels'] })).toEqual([])
    expect(v({ timeDeg: { from: 0, to: 90 }, readouts: ['phases', 'gap'] })).toEqual([])
    expect(v({ timeDeg: 30, levels: { upper: 6, lower: 4 } })).toEqual([])
    expect(v({ timeDeg: 30, start: { thetaDeg: 60, phiDeg: { from: 0, to: 90 } }, shot: 'K-STD' })).toEqual([])
    expect(v({ timeDeg: 30, start: '-y', show: ['gap', 'top'] })).toEqual([])
  })
  it('limits: the levels, the time, the start, the panels, the readouts', () => {
    expect(v({ timeDeg: 0, levels: { upper: 1, lower: 3 } }).join()).toMatch(/exceed lower/)
    expect(v({ timeDeg: 0, levels: { upper: 2, lower: 2 } }).join()).toMatch(/exceed lower/)
    expect(v({ timeDeg: 0, levels: { upper: 2.1, lower: 2 } }).join()).toMatch(/at least 0.25/)
    expect(v({ timeDeg: 0, levels: { upper: 3, lower: -1 } }).join()).toMatch(/lower is at least 0/)
    expect(v({ timeDeg: 0, levels: { upper: CLOCKS_LIMITS.energyMax + 1, lower: 1 } }).join()).toMatch(/at most 12/)
    expect(v({ timeDeg: 0, levels: { upper: Number.NaN, lower: 1 } }).join()).toMatch(/finite/)
    expect(v({ timeDeg: Number.NaN }).join()).toMatch(/non-finite/)
    expect(v({ timeDeg: { from: 0, to: 4000 } }).join()).toMatch(/at most ±3600/)
    expect(v({ timeDeg: 0, start: '+q' as never }).join()).toMatch(/unknown ket/)
    expect(v({ timeDeg: 0, start: { thetaDeg: 200, phiDeg: 0 } }).join()).toMatch(/between 0° and 180°/)
    expect(v({ timeDeg: 0, show: [] as never }).join()).toMatch(/non-empty list/)
    expect(v({ timeDeg: 0, show: ['levels', 'levels'] }).join()).toMatch(/each once/)
    expect(v({ timeDeg: 0, show: ['bogus' as never] }).join()).toMatch(/non-empty list/)
    expect(v({ timeDeg: 0, readouts: ['bogus' as never] }).join()).toMatch(/unknown/)
    expect(v({ timeDeg: 0, readouts: ['gap', 'gap'] }).join()).toMatch(/each once/)
  })
  it('the shot is the clocks’', () => {
    expect(v({ timeDeg: 0, shot: 'K-LEDGER' as never })[0]).toMatch(/unknown shot/)
  })
  it('clocks beside a Bloch sphere are different kinds, so a split validates', () => {
    expect(validateLayout({ layout: 'split', top: K({ timeDeg: 30 }), bottom: { kind: 'bloch', state: '+x', shot: 'B-POLE' } })).toEqual([])
  })
})

describe('clocks: the one scene (stage, reading version, print, widget)', () => {
  const draw = (r: ResolvedClocks, mode: 'stage' | 'print', w: number, h: number, bare = false) =>
    renderToString(
      <svg viewBox={`0 0 ${w} ${h}`}>
        <ClocksScene state={r} mode={mode} width={w} height={h} bare={bare} />
      </svg>,
    )
  it('draws every panel with its anchors, labels and no NaN, in every mode and at several box shapes', () => {
    const r = R(K({ timeDeg: 30, readouts: ['phases', 'gap', 'px'] }))
    for (const [mode, w, h, bare] of [['stage', 380, 560, false], ['stage', 640, 560, false], ['stage', 560, 440, true], ['print', 320, 380, false]] as const) {
      const html = draw(r, mode, w, h, bare)
      expect(html, `${mode} ${w}x${h}`).not.toMatch(/NaN|Infinity|undefined/)
      for (const a of ['level-upper', 'level-lower', 'mean', 'gap-arrow', 'clock-upper', 'clock-lower', 'gap-dial', 'top-arrow']) expect(html, a).toContain(`data-anchor="${a}"`)
      expect(html).toContain('data-kind="clocks"')
      expect(html).toContain('E₊ = 3ε')
      expect(html).toContain('E₋ = ε')
      expect(html).toContain('Ē = 2ε')
      expect(html).toContain('ħω = 2ε')
    }
  })
  it('the print figure and the reading version carry the readouts as text lines; the live stage leaves them to the overlay', () => {
    const r = R(K({ timeDeg: 30, readouts: ['phases', 'gap'] }))
    expect(draw(r, 'print', 320, 380)).toContain('hands −90°, −30°')
    expect(draw(r, 'stage', 560, 440, true)).toContain('gap = 60°')
    expect(draw(r, 'stage', 380, 560)).not.toContain('hands −90°, −30°')
  })
  it('only the panels asked for are drawn, and a lone panel takes the whole area', () => {
    const only = (show: ClocksState['show']) => draw(R(K({ timeDeg: 30, show })), 'stage', 380, 560)
    const levels = only(['levels'])
    expect(levels).toContain('data-panel="levels"')
    for (const p of ['clocks', 'gap', 'top']) expect(levels).not.toContain(`data-panel="${p}"`)
    const rest = only(['gap', 'top'])
    expect(rest).not.toContain('data-panel="levels"')
    expect(rest).toContain('data-panel="gap"')
    expect(rest).toContain('data-panel="top"')
  })
  it('a pole has one hand and says so; the equator panel names the pole instead of an azimuth', () => {
    const html = draw(R(K({ timeDeg: 30, start: '+z' })), 'stage', 380, 560)
    expect(html).toContain('one clock only')
    expect(html).toContain('a pole: no azimuth')
    expect(html).toContain('no amplitude')
    expect(html).not.toMatch(/NaN|Infinity|undefined/)
  })
  it('the hand hue is its own phase: the two hands differ in colour once they differ in angle', () => {
    const colours = (t: number) => [...draw(R(K({ timeDeg: t })), 'stage', 380, 560).matchAll(/style="stroke:(#[0-9a-f]{6})"/g)].map((m) => m[1])
    expect(new Set(colours(0)).size).toBeLessThan(new Set(colours(45)).size + 1)
    expect(draw(R(K({ timeDeg: 0 })), 'stage', 380, 560)).toMatch(/#[0-9a-f]{6}/)
  })
  it('the layout never leaves the drawing box, in any combination of panels', () => {
    const shows: ClocksState['show'][] = [undefined, ['levels'], ['clocks'], ['gap'], ['top'], ['levels', 'clocks'], ['gap', 'top'], ['levels', 'gap'], ['clocks', 'top'], [...CLOCKS_PANELS]]
    const r = (show: ClocksState['show']) => R(K({ timeDeg: 30, show, readouts: ['phases', 'gap', 'px'] }))
    for (const [w, h, own, slot] of [[380, 560, false, 'full'], [640, 560, false, 'full'], [480, 520, false, 'full'], [560, 440, true, 'full'], [320, 380, true, 'full'], [380, 300, false, 'top']] as const) {
      for (const show of shows) {
        const L = clocksLayout(r(show), w, h, own, slot)
        for (const [name, p] of Object.entries(L.panels)) {
          expect(p!.x, `${name} ${w}x${h}`).toBeGreaterThanOrEqual(L.area.x - 1e-9)
          expect(p!.y, `${name} ${w}x${h}`).toBeGreaterThanOrEqual(L.area.y - 1e-9)
          expect(p!.x + p!.w, `${name} ${w}x${h}`).toBeLessThanOrEqual(L.area.x + L.area.w + 1e-9)
          expect(p!.y + p!.h, `${name} ${w}x${h}`).toBeLessThanOrEqual(L.area.y + L.area.h + 1e-9)
        }
        expect(L.area.x + L.area.w).toBeLessThanOrEqual(w)
        expect(L.area.y + L.area.h).toBeLessThanOrEqual(h - (own ? 4 : slot === 'top' ? 10 : 80))
        // panels never overlap
        const rs = Object.values(L.panels) as { x: number; y: number; w: number; h: number }[]
        for (let i = 0; i < rs.length; i++)
          for (let j = i + 1; j < rs.length; j++) {
            const a = rs[i]
            const b = rs[j]
            expect(a.x < b.x + b.w - 1e-9 && b.x < a.x + a.w - 1e-9 && a.y < b.y + b.h - 1e-9 && b.y < a.y + a.h - 1e-9, `${w}x${h} ${show}`).toBe(false)
          }
      }
    }
  })
  it('the print figure is the stage picture: FigureFor draws the clocks scene in print ink', () => {
    const html = renderToString(<FigureFor layout={K({ timeDeg: 45 })} number="L11.1" caption="a quarter turn" />)
    expect(html).toContain('print-fig-svg svgk svgk-print')
    expect(html).toContain('data-kind="clocks"')
    expect(html).toContain('PHASE CLOCKS')
    expect(html).not.toMatch(/NaN|Infinity|undefined/)
  })
})
