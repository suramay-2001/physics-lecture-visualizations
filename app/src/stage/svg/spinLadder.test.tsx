/**
 * `spin-ladder` (SVG; Townsend pass G2b, Lecture 7): the m ladder of spin j, drawn from physics/angmom.ts. Content writes only inputs (the spin, a state, an
 * arrow, an operator, readouts); the resolver takes every level, chance, coefficient, entry and length from the engine. These tests check the resolved
 * numbers against direct engine calls and the lecture's numbers, the validation messages, interpolation, the readout and entry text, the new `polChain`
 * curve, and that the one scene packs its panels inside the box and draws all of it with no NaN.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { fidelityOf } from '../../content/fidelity'
import type { PlotState, SpinLadderState } from '../../content/stage'
import { KIND_RENDER, PASSPORT, SPIN_LADDER_MATRICES, STAGE_KINDS_709, passportOf } from '../../content/stage'
import { ANCHORS, SHOTS } from '../../content/stageVocab'
import { J_VALUES, jMatrices, ladderCoeff, zChances } from '../../physics/angmom'
import { chainTransmission } from '../../physics/townsend448'
import { FigureFor, FIGURE_KINDS } from '../figures/FigureFor'
import { interpolate } from '../interp'
import { resolve, validateStage } from '../resolve'
import { svgKindDef } from '../svgKinds'
import type { ResolvedPlot, ResolvedSpinLadder } from '../types'
import { SpinLadderScene, spinLadderLayout } from './SpinLadderScene'
import { entryText, exactText, mText, spinLadderReadouts } from './spinLadder'
import './kinds'

const S = (j: SpinLadderState['j'], o: Omit<SpinLadderState, 'kind' | 'j'> = {}): SpinLadderState => ({ kind: 'spin-ladder', j, ...o })
const R = (st: SpinLadderState, s = 1) => resolve(st, s) as ResolvedSpinLadder
const close = (a: number, b: number, eps = 1e-9) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(eps)

describe('spin-ladder: the SVG route, the passport and the vocabulary', () => {
  it('is an SVG kind registered by the lazy module, shared stage code, with its own passport and drawer', () => {
    expect(KIND_RENDER['spin-ladder']).toBe('svg')
    expect(STAGE_KINDS_709).toContain('spin-ladder')
    expect(FIGURE_KINDS).toContain('spin-ladder')
    expect(svgKindDef('spin-ladder')).toBeDefined()
    expect(svgKindDef('spin-ladder')!.print).toEqual({ w: 320, h: 300 })
    expect(PASSPORT['spin-ladder']).toMatchObject({ title: 'SPIN j · the m ladder', fidelityKey: 'spin-ladder' })
    expect(passportOf(S(1))).toBe(PASSPORT['spin-ladder'])
    const f = fidelityOf('spin-ladder')
    expect(f.exact.map((n) => n.id)).toEqual(['spin-ladder-exact'])
    expect(f.schematic.map((n) => n.id)).toEqual(['spin-ladder-layout'])
    expect(f.misleading.map((n) => n.id)).toEqual(['spin-ladder-cone'])
    expect(SHOTS['spin-ladder']).toEqual(['SL-LADDER'])
    expect(ANCHORS['spin-ladder']).toContain('arrow')
  })
})

describe('spin-ladder: the resolved numbers are the engine’s', () => {
  it('2j + 1 levels from +j down, |J| and the cone angle of the top level (Townsend Figs. 3.4-3.6)', () => {
    for (const [j, n, len, cone] of [[0.5, 2, 0.8660254, 54.7356103], [1, 3, Math.SQRT2, 45], [1.5, 4, 1.9364917, 39.2315205], [2, 5, Math.sqrt(6), 35.2643897]] as const) {
      const r = R(S(j))
      expect(r.levels).toHaveLength(n)
      expect(r.levels[0]).toBe(j)
      expect(r.levels.at(-1)).toBe(-j)
      close(r.length, len, 1e-6)
      close(r.coneDeg[0], cone, 1e-6)
      close(r.coneDeg[0] + r.coneDeg.at(-1)!, 180, 1e-9)
    }
  })

  it('a state along y puts the S_y = hbar beam on the z ladder as 1/4, 1/2, 1/4 (Fig. 3.10); axis z puts everything on one level', () => {
    const r = R(S(1, { ket: { axis: 'y', m: 1 } }))
    expect(r.ket!.chances.map((x) => Math.round(x * 1e6) / 1e6)).toEqual([0.25, 0.5, 0.25])
    expect(R(S(1, { ket: { axis: 'y', m: 0 } })).ket!.chances.map((x) => Math.round(x * 1e6) / 1e6)).toEqual([0.5, 0, 0.5])
    expect(R(S(0.5, { ket: { axis: 'y', m: 0.5 } })).ket!.chances.map((x) => Math.round(x * 1e6) / 1e6)).toEqual([0.5, 0.5])
    expect(R(S(1.5, { ket: { axis: 'x', m: 0.5 } })).ket!.chances.map((x) => Math.round(x * 1e6) / 1e6)).toEqual([0.375, 0.125, 0.125, 0.375])
    expect(R(S(1, { ket: { axis: 'z', m: 0 } })).ket!.chances.map((x) => Math.round(x))).toEqual([0, 1, 0])
    const tilt = { thetaDeg: 50, phiDeg: 0 }
    expect(R(S(1, { ket: { axis: tilt, m: 1 } })).ket!.chances).toEqual(zChances(1, tilt, 1))
  })

  it('J+ and J- carry the engine’s square-root weight, and give 0 on the end level (Eqs. 3.59-3.60)', () => {
    close(R(S(1, { ket: { axis: 'z', m: 0 }, apply: 'J+' })).apply!.coeff, Math.SQRT2)
    expect(R(S(1, { ket: { axis: 'z', m: 0 }, apply: 'J+' })).apply).toMatchObject({ dir: '+', from: 0, to: 1 })
    close(R(S(1.5, { ket: { axis: 'z', m: -0.5 }, apply: 'J+' })).apply!.coeff, 2)
    close(R(S(1.5, { ket: { axis: 'z', m: 0.5 }, apply: 'J+' })).apply!.coeff, Math.sqrt(3))
    expect(R(S(1, { ket: { axis: 'z', m: 1 }, apply: 'J+' })).apply).toMatchObject({ to: null, coeff: 0 })
    expect(R(S(1, { ket: { axis: 'z', m: -1 }, apply: 'J-' })).apply).toMatchObject({ to: null })
    expect(R(S(1.5, { ket: { axis: 'z', m: 0.5 }, apply: 'J-' })).apply).toMatchObject({ dir: '-', to: -0.5 })
    close(ladderCoeff(1.5, 0.5, '-'), R(S(1.5, { ket: { axis: 'z', m: 0.5 }, apply: 'J-' })).apply!.coeff)
  })

  it('the matrix is the engine’s: J_x of spin 1 is the 1/sqrt2 grid, J2 a multiple of the identity (Eqs. 3.28-3.29)', () => {
    const jx = R(S(1, { matrix: 'Jx' })).matrix!
    close(jx.entries[0][1].re, Math.SQRT1_2)
    close(jx.entries[1][2].re, Math.SQRT1_2)
    expect(jx.entries[0][0]).toEqual({ re: 0, im: 0 })
    close(R(S(1, { matrix: 'Jy' })).matrix!.entries[0][1].im, -Math.SQRT1_2)
    for (const j of J_VALUES)
      for (const name of SPIN_LADDER_MATRICES) {
        const M = R(S(j, { matrix: name })).matrix!
        expect(M.entries).toHaveLength(2 * j + 1)
        const ref = jMatrices(j)[{ Jx: 'Jx', Jy: 'Jy', Jz: 'Jz', 'J+': 'Jp', 'J-': 'Jm', J2: 'J2' }[name] as 'Jx']
        M.entries.forEach((row, a) => row.forEach((z, b) => (close(z.re, ref[a][b].re, 1e-12), close(z.im, ref[a][b].im, 1e-12))))
      }
    close(R(S(1, { matrix: 'J2' })).matrix!.entries[2][2].re, 2)
    close(R(S(0.5, { matrix: 'J2' })).matrix!.entries[0][0].re, 0.75)
  })
})

describe('spin-ladder: validation messages name the field', () => {
  const bad = (st: unknown) => validateStage(st as SpinLadderState)
  it('refuses a bad j, level, axis, arrow and readout', () => {
    expect(validateStage(S(1))).toEqual([])
    expect(validateStage(S(2, { ket: { axis: { thetaDeg: 50, phiDeg: 20 }, m: -2 }, readouts: ['length', 'cone', 'levels'] }))).toEqual([])
    expect(bad({ kind: 'spin-ladder', j: 3 }).join()).toMatch(/spin-ladder j/)
    expect(bad(S(1, { ket: { axis: 'y', m: 0.5 } })).join()).toMatch(/ket\.m/)
    expect(bad({ kind: 'spin-ladder', j: 1, ket: { axis: 'q', m: 1 } }).join()).toMatch(/ket\.axis/)
    expect(bad(S(1, { ket: { axis: { thetaDeg: 200, phiDeg: 0 }, m: 1 } })).join()).toMatch(/thetaDeg/)
    expect(bad(S(1, { apply: 'J+' })).join()).toMatch(/apply: needs a ket/)
    expect(bad(S(1, { ket: { axis: 'x', m: 1 }, apply: 'J+' })).join()).toMatch(/apply: needs a ket along axis 'z'/)
    expect(bad({ kind: 'spin-ladder', j: 1, matrix: 'Jq' }).join()).toMatch(/matrix/)
    expect(bad(S(1, { readouts: ['length', 'length'] })).join()).toMatch(/each once/)
    expect(bad(S(1, { readouts: ['length', 'cone', 'levels', 'chances'], ket: { axis: 'y', m: 1 } })).join()).toMatch(/at most 3/)
    expect(bad(S(1, { readouts: ['chances'] })).join()).toMatch(/needs a ket/)
    expect(bad({ kind: 'spin-ladder', j: 1, readouts: ['nope'] }).join()).toMatch(/unknown "nope"/)
  })
})

describe('spin-ladder: interpolation and text', () => {
  it('a change of j switches at the half-way point; the bars of one ladder slide', () => {
    const a = R(S(1, { ket: { axis: 'z', m: 1 } }))
    const b = R(S(1.5, { ket: { axis: 'z', m: 1.5 } }))
    expect((interpolate(a, b, 0.25) as ResolvedSpinLadder).j).toBe(1)
    expect((interpolate(a, b, 0.75) as ResolvedSpinLadder).j).toBe(1.5)
    const y = R(S(1, { ket: { axis: 'y', m: 1 } }))
    const mid = interpolate(R(S(1, { ket: { axis: 'z', m: 1 } })), y, 0.5) as ResolvedSpinLadder
    close(mid.ket!.chances[0], 0.5 * (1 + 0.25))
    close(mid.ket!.chances[1], 0.25)
  })

  it('writes levels, exact entries and readouts the way the page quotes them', () => {
    expect([mText(1.5), mText(0.5), mText(0), mText(-1), mText(-0.5)]).toEqual(['+3/2', '+1/2', '0', '−1', '−1/2'])
    expect([exactText(0.75), exactText(Math.SQRT2), exactText(Math.sqrt(3) / 2), exactText(Math.SQRT1_2), exactText(Math.sqrt(6) / 2), exactText(0)]).toEqual(['3/4', '√2', '√3/2', '√2/2', '√6/2', '0'])
    expect([entryText({ re: 0, im: -Math.SQRT1_2 }), entryText({ re: 0, im: 1 }), entryText({ re: 2, im: 0 })]).toEqual(['−i√2/2', 'i', '2'])
    const t = spinLadderReadouts(R(S(1, { ket: { axis: 'y', m: 1 }, readouts: ['length', 'cone', 'levels', 'chances'].slice(0, 3) as SpinLadderState['readouts'] }))).map((x) => x.text)
    expect(t).toContain('|J| = 1.4142 ħ')
    expect(t).toContain('at m = j: 45° from z')
    expect(t).toContain('2j + 1 = 3 levels')
    expect(spinLadderReadouts(R(S(1, { ket: { axis: 'y', m: 1 }, readouts: ['chances'] }))).map((x) => x.text)).toContain('chances 0.25 · 0.5 · 0.25')
    expect(spinLadderReadouts(R(S(1, { ket: { axis: 'z', m: 1 }, apply: 'J+' }))).map((x) => x.text)).toContain('J+ gives 0')
  })
})

describe('spin-ladder: the scene stays in its box and draws no NaN', () => {
  const states: SpinLadderState[] = [
    S(0.5),
    S(1, { ket: { axis: 'y', m: 1 } }),
    S(1.5, { ket: { axis: 'z', m: -0.5 }, apply: 'J+' }),
    S(1, { ket: { axis: 'z', m: 1 }, apply: 'J+' }),
    S(2, { matrix: 'Jy' }),
    S(1.5, { matrix: 'J+', ket: { axis: 'z', m: 0.5 }, readouts: ['levels'] }),
    S(1, { readouts: ['length', 'cone'] }),
    S(0.5, { readouts: ['length', 'cone', 'levels'] }),
  ]
  it.each(states.map((st, i) => ({ i, st })))('state $i: panels inside the box, all three modes', ({ st }) => {
    const r = R(st)
    for (const [w, h, own] of [[460, 360, false], [300, 420, false], [320, 300, true]] as const) {
      const L = spinLadderLayout(r, w, h, own)
      for (const p of [L.ladder, ...(L.side ? [L.side] : [])]) {
        expect(p.x).toBeGreaterThanOrEqual(0)
        expect(p.x + p.w).toBeLessThanOrEqual(w + 1e-9)
        expect(p.y + p.h).toBeLessThanOrEqual(h + 1e-9)
      }
      const html = renderToString(<svg><SpinLadderScene state={r} mode={own ? 'print' : 'stage'} width={w} height={h} /></svg>)
      expect(html).not.toMatch(/NaN|undefined|Infinity/)
      expect(html).toContain('data-kind="spin-ladder"')
    }
  })

  it('the print figure is the stage picture: FigureFor draws it in print ink', () => {
    const html = renderToString(<FigureFor layout={S(1, { ket: { axis: 'y', m: 1 }, readouts: ['levels'] })} number="L7.9" caption="a spin-1 beam" />)
    expect(html).toContain('data-kind="spin-ladder"')
    expect(html).toContain('0.25')
    expect(html).toContain('2j + 1 = 3 levels')
  })
})

describe('plot: the new named curve polChain (Townsend Problem 2.13)', () => {
  const P = (o: Partial<PlotState> = {}): PlotState => ({ kind: 'plot', curve: { fn: 'polChain' }, ...o }) as PlotState
  it('y(N) = cos^{2N}(90 deg / N): 0 at N = 1, 1/4 at 2, 0.5308 at 4, and the markers read the exact values', () => {
    expect(validateStage(P({ markers: [{ x: 2 }, { x: 4 }, { x: 10 }] }))).toEqual([])
    const r = resolve(P({ markers: [{ x: 2 }, { x: 4 }, { x: 10 }] }), 1) as ResolvedPlot
    const ys = [2, 4, 10].map((n) => chainTransmission(n, 90))
    expect(ys.map((y) => Math.round(y * 1e4) / 1e4)).toEqual([0.25, 0.5308, 0.7805])
    expect(r.markers.map((m) => Math.round(m.y * 1e4) / 1e4)).toEqual([0.25, 0.5308, 0.7805])
    close(chainTransmission(1, 90), 0, 1e-12)
  })
})
