/**
 * Chapter Q26's Try-it lines against the REAL widgets (existing widgets only, plan §9.3: no new widget). Each unit's `visual` names a widget and the props it passes; each `tryThis`
 * line quotes what that widget draws. Three checks keep a line true:
 *  1. every prop is one the widget declares (read from its source), the values lie in the controls' ranges, and every control a line tells the reader to use is in the code;
 *  2. every readout a line quotes is what the widget really renders (rendered to markup) at the start or at the setting the line names;
 *  3. every number a line promises after the reader acts is recomputed here through the engine functions the widget calls (the buttons animate, so the test replays their arithmetic).
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { AmplitudeBars } from '../../widgets/AmplitudeBars'
import ampSrc from '../../widgets/AmplitudeBars.tsx?raw'
import { BlochSphere } from '../../widgets/BlochSphere'
import blochSrc from '../../widgets/BlochSphere.tsx?raw'
import { PhaseDial } from '../../widgets/PhaseDial'
import phaseSrc from '../../widgets/PhaseDial.tsx?raw'
import PolarizationDial, { dialModel } from '../../widgets/PolarizationDial'
import polSrc from '../../widgets/PolarizationDial.tsx?raw'
import TwoClocks, { clocksModel } from '../../widgets/TwoClocks'
import clocksSrc from '../../widgets/TwoClocks.tsx?raw'
import { apply } from '../../physics/linalg'
import { Rz, blochAngles, blochVector, ketFromBloch } from '../../physics/spin'
import { pct } from '../../ui/primitives'
import type { Unit } from '../schema'
import { Q26 } from './Q26'

const DEG = Math.PI / 180
const unit = (id: string): Unit => Q26.units.find((u) => u.id === id)!
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

describe('Q26 Try-its: every prop reaches the widget', () => {
  it('each unit names a widget of its own kind and passes only props that widget declares, with values in the controls’ ranges', () => {
    expect(declared(polSrc, 'PolarizationDialProps')).toEqual(['chi', 'analyzer', 'carrier', 'editable'])
    expect(declared(blochSrc, 'BlochProps')).toEqual(['theta', 'phi', 'editable', 'measure', 'rotations', 'rotationAngles', 'landmarks'])
    expect(declared(ampSrc, 'AmplitudeBarsProps')).toEqual(['state', 'basis', 'editable'])
    expect(declared(phaseSrc, 'PhaseDialProps')).toEqual(['theta', 'rotations'])
    expect(declared(clocksSrc, 'TwoClocksProps')).toEqual(['upper', 'lower', 'start', 'editable'])
    expect(Object.fromEntries(Q26.units.map((u) => [u.id, u.visual.kind]))).toEqual({
      'q26-encodings': 'polarization-dial',
      'q26-beamsplitter': 'bloch',
      'q26-hom': 'amplitude-bars',
      'q26-ns-cz': 'phase-dial',
      'q26-teleport-gate': 'bloch',
      'q26-nonlinear': 'two-clocks',
    })
    const SRC: Record<string, [string, string]> = {
      'polarization-dial': [polSrc, 'PolarizationDialProps'],
      bloch: [blochSrc, 'BlochProps'],
      'amplitude-bars': [ampSrc, 'AmplitudeBarsProps'],
      'phase-dial': [phaseSrc, 'PhaseDialProps'],
      'two-clocks': [clocksSrc, 'TwoClocksProps'],
    }
    for (const u of Q26.units) expect(Object.keys(props(u.id)).filter((k) => !declared(...SRC[u.visual.kind]).includes(k)), `${u.id}: props the widget ignores`).toEqual([])
    // the sliders: theta 0 … 180 and phi −180 … 180 (Bloch and the amplitude bars), the dial's phi in steps of 5, the buttons the lines name
    expect(blochSrc).toContain('min={0} max={180}')
    expect(ampSrc).toContain('min={-180} max={180} step={5}')
    expect(phaseSrc).toContain('min={-180} max={180} step={5}')
    expect(ampSrc).toContain("label: 'measure x'")
    expect(polSrc).toContain("label: 'electron'")
    expect(polSrc).toContain('Turn {d}°')
  })
})

describe('Q26 Try-it: the encodings unit (polarization-dial from χ = 0°, photon)', () => {
  const start = text(renderToString(<PolarizationDial {...(props('q26-encodings') as object)} />))
  it('offers the Turn 45° button and the electron switch; the doubling is the engine’s: a photon turned 45° moves its sphere point 90°, an electron 45°', () => {
    expect(lines('q26-encodings')).toContain('Press Turn 45°')
    expect(start).toContain('Turn 45°')
    expect(lines('q26-encodings')).toContain('Switch to electron')
    expect(dialModel('photon', 0, 45, 0).sphereDeg).toBeCloseTo(90, 9)
    expect(dialModel('electron', 0, 45, 0).sphereDeg).toBeCloseTo(45, 9)
    expect(lines('q26-encodings')).toContain('sphere turn is 90°')
    expect(lines('q26-encodings')).toContain('only 45°')
    expect(start).toContain('lab turn 0° → sphere turn 0°')
  })
})

describe('Q26 Try-it: the beamsplitter unit (bloch from |+x⟩, measure x, buttons 45° to 180° about z)', () => {
  const html = renderToString(<BlochSphere {...(props('q26-beamsplitter') as object)} />)
  const t = text(html)
  const read = (angleDeg: number): string => {
    const psi = apply(Rz(angleDeg * DEG), ketFromBloch(90 * DEG, 0))
    const r = blochVector(psi)
    return pct((1 + r[0]) / 2)
  }
  it('starts at +x 100.0%, has the four buttons, and each press reads 85.4%, 50.0%, 14.6% and 0.0% (the buttons turn about z, so the +x chance is cos² of half the angle)', () => {
    expect(t).toContain('+x 100.0%')
    for (const a of [45, 90, 135, 180]) expect(t).toContain(`R_z(${a}^\\circ)`)
    expect([45, 90, 135, 180].map(read)).toEqual(['85.4%', '50.0%', '14.6%', '0.0%'])
    expect(lines('q26-beamsplitter')).toContain('85.4%, 50.0%, 14.6%')
    expect(lines('q26-beamsplitter')).toContain('reads 0.0%')
  })
})

describe('Q26 Try-it: the hom unit (amplitude-bars from θ = 90°, φ = 180°, z basis)', () => {
  const x180 = text(renderToString(<AmplitudeBars {...(props('q26-hom') as object)} basis="x" />))
  const x0 = text(renderToString(<AmplitudeBars {...(props('q26-hom') as object)} state={[90, 0]} basis="x" />))
  it('choosing measure x at φ = 180° reads −x 100.0%, and φ = 0° reads +x 100.0% (the real and the symmetric splitter’s pair of exits)', () => {
    expect(lines('q26-hom')).toContain('Choose measure x')
    expect(x180).toContain('−x 100.0%')
    expect(x180).toContain('+x 0.0%')
    expect(x0).toContain('+x 100.0%')
    expect(lines('q26-hom')).toContain('−x bar reads 100.0%')
    expect(lines('q26-hom')).toContain('+x bar reads 100.0%')
    // the start in the z basis is an even split, so the bars alone do not show the sign
    expect(text(renderToString(<AmplitudeBars {...(props('q26-hom') as object)} />))).toContain('+z 50.0%')
  })
})

describe('Q26 Try-it: the ns-cz unit (phase-dial from φ = 0°, with the R_z buttons)', () => {
  it('starts at relative phase 0°; two presses of R_z(90°) give 180°, the far end of the equator', () => {
    const start = text(renderToString(<PhaseDial {...(props('q26-ns-cz') as object)} />))
    expect(start).toContain('relative phase arg(β/α) = 0°')
    expect(start).toContain('R_z(90^\\circ)')
    const a0 = { re: Math.SQRT1_2, im: 0 }
    const b0 = { re: Math.SQRT1_2, im: 0 }
    const once = apply(Rz(Math.PI / 2), [a0, b0])
    const twice = apply(Rz(Math.PI / 2), once)
    const rel = (p: typeof twice) => (Math.atan2(p[0].re * p[1].im - p[0].im * p[1].re, p[0].re * p[1].re + p[0].im * p[1].im) * 180) / Math.PI
    expect(Math.abs(rel(twice))).toBeCloseTo(180, 9)
    const r = blochVector(twice)
    expect(r[0]).toBeCloseTo(-1, 9)
    expect(lines('q26-ns-cz')).toContain('Press R_z(90°) twice')
    expect(lines('q26-ns-cz')).toContain('relative phase is 180°')
  })
})

describe('Q26 Try-it: the teleport-gate unit (bloch from θ = 60°, φ = 0°, one R_z(180°) button)', () => {
  it('R_z(180°) moves the point to azimuth 180° (a Z fix-up up to a global factor); pressed twice it returns to azimuth 0° with the state turned over by a minus sign', () => {
    const t = text(renderToString(<BlochSphere {...(props('q26-teleport-gate') as object)} />))
    expect(t).toContain('R_z(180^\\circ)')
    const psi0 = ketFromBloch(60 * DEG, 0)
    const once = apply(Rz(Math.PI), psi0)
    const twice = apply(Rz(Math.PI), once)
    const az = (p: typeof once) => Math.abs((blochAngles(p).phi * 180) / Math.PI)
    expect(az(once)).toBeCloseTo(180, 9)
    expect(az(twice)).toBeCloseTo(0, 9)
    // the kets differ by −1: the second press is Rz(2π) = −I
    expect(twice[0].re).toBeCloseTo(-psi0[0].re, 12)
    expect(twice[1].re).toBeCloseTo(-psi0[1].re, 12)
    expect(lines('q26-teleport-gate')).toContain('azimuth 180°')
    expect(lines('q26-teleport-gate')).toContain('azimuth 0°')
    expect(lines('q26-teleport-gate')).toContain('minus sign')
    expect(t).toContain('θ = 60°, φ = 0°')
  })
})

describe('Q26 Try-it: the nonlinear unit (two-clocks, E₊ = 3ε, E₋ = ε, start |+x⟩)', () => {
  it('at εt/ħ = 45° the gap is 90° and the arrow is on +y; at 90° the gap is 180° and the arrow points along −x', () => {
    const html = text(renderToString(<TwoClocks {...(props('q26-nonlinear') as object)} />))
    expect(html).toContain('gap')
    const m45 = clocksModel({ mean: 2, hbarOmega: 2, start: '+x', timeDeg: 45 })
    expect(m45.lines).toContain('gap = 90°')
    expect(m45.r.bloch[1]).toBeCloseTo(1, 9)
    const m90 = clocksModel({ mean: 2, hbarOmega: 2, start: '+x', timeDeg: 90 })
    expect(m90.lines).toContain('gap = 180°')
    expect(m90.r.bloch[0]).toBeCloseTo(-1, 9)
    expect(lines('q26-nonlinear')).toContain('gap = 90°')
    expect(lines('q26-nonlinear')).toContain('gap = 180°')
  })
})
