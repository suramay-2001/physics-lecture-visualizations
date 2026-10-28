/**
 * Chapter Q20's Try-it lines against the REAL widgets (existing widgets only, plan §9.3: no new widget). Each unit's `visual` names a widget and the props it passes; each `tryThis`
 * line quotes what that widget draws. Three checks keep a line true:
 *  1. every prop is one the widget declares (read from its source), the values lie in the controls' ranges, and every control a line tells the reader to use is in the code;
 *  2. every readout a line quotes is what the widget really renders (rendered to markup) at the start or at the setting the line names;
 *  3. every number a line promises after the reader acts is recomputed here through the engine functions the widget calls and tied to the chapter's own values.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { BlochSphere } from '../../widgets/BlochSphere'
import blochSrc from '../../widgets/BlochSphere.tsx?raw'
import PairGrid from '../../widgets/PairGrid'
import pairSrc from '../../widgets/PairGrid.tsx?raw'
import { PhaseDial } from '../../widgets/PhaseDial'
import phaseSrc from '../../widgets/PhaseDial.tsx?raw'
import { blochAzimuthDeg, cnotProcessor } from '../../physics/qc/machines'
import { blochKet } from '../../physics/qc/machines'
import type { Unit } from '../schema'
import { Q20 } from './Q20'
import { V } from './Q20.values'

const unit = (id: string): Unit => Q20.units.find((u) => u.id === id)!
const lines = (id: string): string => unit(id).visual.tryThis.join(' ')
const props = (id: string) => unit(id).visual.props as Record<string, unknown>
/** The text of a server-rendered widget, markup and comment separators removed. */
const text = (html: string): string =>
  html
    .replace(/&amp;/g, '&')
    .replace(/&#x27;/g, "'")
    .replace(/<!--.*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
const declared = (src: string, iface: string): string[] => {
  const body = new RegExp(`export interface ${iface}\\s*\\{([\\s\\S]*?)\\n\\}`).exec(src)?.[1] ?? ''
  return [...body.matchAll(/^\s*(\w+)\??:/gm)].map((m) => m[1])
}

describe('Q20 Try-its: every prop reaches the widget', () => {
  it('each unit names a widget of its own kind and passes only props that widget declares, with values in the controls’ ranges', () => {
    expect(declared(blochSrc, 'BlochProps')).toEqual(['theta', 'phi', 'editable', 'measure', 'rotations', 'rotationAngles', 'landmarks'])
    expect(declared(phaseSrc, 'PhaseDialProps')).toEqual(['theta', 'rotations'])
    expect(declared(pairSrc, 'PairGridProps')).toEqual(['mode', 'frame', 'alice', 'bob', 'preset', 't', 'coins', 'pA', 'pB', 'showDet'])
    expect(Object.fromEntries(Q20.units.map((u) => [u.id, u.visual.kind]))).toEqual({
      'q20-cloner': 'bloch',
      'q20-unot': 'bloch',
      'q20-no-go': 'bloch',
      'q20-probabilistic': 'phase-dial',
      'q20-bell-programs': 'pair-grid',
      'q20-discriminator': 'bloch',
    })
    for (const u of Q20.units) {
      const src = u.visual.kind === 'bloch' ? [blochSrc, 'BlochProps'] : u.visual.kind === 'phase-dial' ? [phaseSrc, 'PhaseDialProps'] : [pairSrc, 'PairGridProps']
      expect(Object.keys(props(u.id)).filter((k) => !declared(src[0], src[1]).includes(k)), `${u.id}: props the widget ignores`).toEqual([])
    }
    // the sliders: theta 0 … 180 and phi −180 … 180 (Bloch), the dial's phi −180 … 180 in steps of 5, the family's t
    expect(blochSrc).toContain('min={0} max={180}')
    expect(blochSrc).toContain('min={-180} max={180}')
    expect(phaseSrc).toContain('min={-180} max={180} step={5}')
  })
})

describe('Q20 Try-it: the cloner unit (bloch at θ = 60°, φ = 90°, measuring y)', () => {
  const html = text(renderToString(<BlochSphere {...(props('q20-cloner') as object)} />))
  it('the +y bar reads 93.3% and ⟨Sy⟩ reads √3/4 ħ: this is the input, whose y part is the engine’s 0.866', () => {
    expect(html).toContain('+y 93.3%')
    expect(html).toContain('⟨Sy⟩ √3/4 ħ')
    expect(100 * (1 + V.q20PsiY) / 2).toBeCloseTo(93.3, 1)
    expect(lines('q20-cloner')).toContain('+y 93.3%')
    expect(lines('q20-cloner')).toContain('√3/4 ħ')
  })
  it('a clone’s arrow is two thirds as long, so its +y bar would read 78.9%', () => {
    expect(100 * (1 + V.q20ShrinkClone * V.q20PsiY) / 2).toBeCloseTo(78.87, 1)
    expect(lines('q20-cloner')).toContain('78.9%')
    expect(lines('q20-cloner')).toContain('two thirds')
  })
})

describe('Q20 Try-it: the U-NOT unit (bloch at θ = 60°, φ = 90°, no measurement)', () => {
  const start = text(renderToString(<BlochSphere {...(props('q20-unot') as object)} />))
  const opposite = text(renderToString(<BlochSphere {...(props('q20-unot') as object)} theta={120} phi={-90} />))
  it('the start reads ⟨Sy⟩ √3/4 ħ and ⟨Sz⟩ 1/4 ħ; at θ = 120°, φ = -90° both change sign: this is the opposite state', () => {
    expect(start).toContain('⟨Sy⟩ √3/4 ħ')
    expect(start).toContain('⟨Sz⟩ 1/4 ħ')
    expect(opposite).toContain('⟨Sy⟩ -√3/4 ħ')
    expect(opposite).toContain('⟨Sz⟩ -1/4 ħ')
    const t = lines('q20-unot')
    expect(t).toContain('⟨Sy⟩ √3/4 ħ')
    expect(t).toContain('⟨Sz⟩ 1/4 ħ')
    expect(t).toContain('θ = 120°, φ = -90°')
    expect(t).toContain('⟨Sy⟩ -√3/4 ħ')
    expect(t).toContain('⟨Sz⟩ -1/4 ħ')
  })
  it('a real machine reaches a third of that arrow: ⟨Sy⟩ = −(1/3)(√3/4) ħ = −√3/12 ħ, a third of the engine’s length', () => {
    expect(V.q20UnotShrink * Math.sqrt(3) / 4).toBeCloseTo(Math.sqrt(3) / 12, 12)
    expect(lines('q20-unot')).toContain('-√3/12 ħ')
    expect(lines('q20-unot')).toContain('a third')
  })
})

describe('Q20 Try-it: the no-go unit (bloch at θ = 60°, φ = 0°, measuring z)', () => {
  const at60 = text(renderToString(<BlochSphere {...(props('q20-no-go') as object)} />))
  const at120 = text(renderToString(<BlochSphere {...(props('q20-no-go') as object)} theta={120} />))
  it('the +z bar reads 75.0% at θ = 60° and 25.0% at θ = 120°: cos θ = 2·chance − 1 = 0.5 and −0.5, the engine’s ⟨σz⟩', () => {
    expect(at60).toContain('+z 75.0%')
    expect(at120).toContain('+z 25.0%')
    expect(2 * 0.75 - 1).toBeCloseTo(V.q20ExpZ60, 12)
    expect(2 * 0.25 - 1).toBeCloseTo(V.q20ExpZ120, 12)
    const t = lines('q20-no-go')
    expect(t).toContain('+z bar reads 75.0%')
    expect(t).toContain('cos θ = 0.5')
    expect(t).toContain('bar reads 25.0%')
    expect(t).toContain('cos θ = -0.5')
    expect(t).toContain('(1 + cos θ)/2')
  })
})

describe('Q20 Try-it: the probabilistic unit (phase-dial from φ = 0°, no rotation buttons)', () => {
  const start = text(renderToString(<PhaseDial {...(props('q20-probabilistic') as object)} />))
  const moved = text(renderToString(<PhaseDial {...(props('q20-probabilistic') as object)} theta={-60} />))
  it('the dial starts at arg(β/α) = 0° and, moved to φ = -60°, reads arg(β/α) = -60°', () => {
    expect(start).toContain('relative phase arg(β/α) = 0°')
    expect(moved).toContain('relative phase arg(β/α) = -60°')
    const t = lines('q20-probabilistic')
    expect(t).toContain('arg(β/α) = 0°')
    expect(t).toContain('arg(β/α) = -60°')
    expect(props('q20-probabilistic').rotations).toBe(false)
  })
  it('that is where |+⟩ lands after one success at α = 30°: the engine’s azimuth is −60°', () => {
    expect(blochAzimuthDeg(cnotProcessor(30, blochKet(90, 0)).success)).toBeCloseTo(-60, 9)
    expect(lines('q20-probabilistic')).toContain('α = 30°')
  })
})

describe('Q20 Try-it: the Bell-program unit (pair-grid, the ud–du family at t = 45°)', () => {
  const html = text(renderToString(<PairGrid {...(props('q20-bell-programs') as object)} />))
  it('only the boxes ud and du hold weight, 1/√2 and −1/√2: the singlet, the program for −iσy', () => {
    expect(html).toContain('0 1/√2 −1/√2 0')
    expect(html).toContain('t 45°')
    const t = lines('q20-bell-programs')
    expect(t).toContain('t = 45°')
    expect(t).toContain('1/√2 and −1/√2')
    expect(t).toContain('uu and dd stay empty')
  })
})

describe('Q20 Try-it: the discriminator unit (bloch at θ = 120°, φ = 0°, measuring z)', () => {
  const html = text(renderToString(<BlochSphere {...(props('q20-discriminator') as object)} />))
  it('the +z bar reads 25.0%, which is s² for s = 0.5 (the overlap with |0⟩), and the machine’s chance is then 0.25', () => {
    expect(html).toContain('+z 25.0%')
    expect(V.q20DiscOverlap ** 2).toBeCloseTo(0.25, 12)
    expect(V.q20DiscP05).toBeCloseTo(0.25, 12)
    const t = lines('q20-discriminator')
    expect(t).toContain('+z 25.0%')
    expect(t).toContain('s = 0.5')
    expect(t).toContain('= 0.25')
  })
})

describe('Q20 Try-its: every sentence of a line is within the 25-word cap', () => {
  it('splits each line at sentence ends and counts words', () => {
    for (const u of Q20.units) for (const l of u.visual.tryThis) for (const s of l.split(/(?<=[.!?])\s+/)) expect(s.split(/\s+/).length, `${u.id}: ${s}`).toBeLessThanOrEqual(25)
  })
})
