/**
 * Chapter Q24's Try-it lines against the REAL widgets (existing widgets only, plan §9.3: no new widget). Each unit's `visual` names a widget and the props it passes; each `tryThis`
 * line quotes what that widget draws. Three checks keep a line true:
 *  1. every prop is one the widget declares (read from its source), the values lie in the controls' ranges, and every control a line tells the reader to use is in the code;
 *  2. every readout a line quotes is what the widget really renders (rendered to markup) at the start or at the setting the line names;
 *  3. every number a line promises after the reader acts is recomputed here through the engine functions the widget calls (spin.ts `Rz`, `apply`, `prob`) and tied to the chapter's own values.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { AmplitudeBars } from '../../widgets/AmplitudeBars'
import ampSrc from '../../widgets/AmplitudeBars.tsx?raw'
import { BlochSphere } from '../../widgets/BlochSphere'
import blochSrc from '../../widgets/BlochSphere.tsx?raw'
import { PhaseDial } from '../../widgets/PhaseDial'
import phaseSrc from '../../widgets/PhaseDial.tsx?raw'
import { arg, c } from '../../physics/complex'
import { apply } from '../../physics/linalg'
import { KET, Rz, prob } from '../../physics/spin'
import type { Unit } from '../schema'
import { Q24 } from './Q24'
import { V } from './Q24.values'

const unit = (id: string): Unit => Q24.units.find((u) => u.id === id)!
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
const DEG = Math.PI / 180

describe('Q24 Try-its: every prop reaches the widget', () => {
  it('each unit names a widget of its own kind and passes only props that widget declares, with values in the controls’ ranges', () => {
    expect(declared(blochSrc, 'BlochProps')).toEqual(['theta', 'phi', 'editable', 'measure', 'rotations', 'rotationAngles', 'landmarks'])
    expect(declared(ampSrc, 'AmplitudeBarsProps')).toEqual(['state', 'basis', 'editable'])
    expect(declared(phaseSrc, 'PhaseDialProps')).toEqual(['theta', 'rotations'])
    expect(Object.fromEntries(Q24.units.map((u) => [u.id, u.visual.kind]))).toEqual({
      'q24-divincenzo': 'bloch',
      'q24-lindblad': 'bloch',
      'q24-bloch-eq': 'amplitude-bars',
      'q24-rabi': 'bloch',
      'q24-ramsey': 'bloch',
      'q24-decoupling': 'phase-dial',
    })
    for (const u of Q24.units) {
      const [src, iface] = u.visual.kind === 'bloch' ? [blochSrc, 'BlochProps'] : u.visual.kind === 'amplitude-bars' ? [ampSrc, 'AmplitudeBarsProps'] : [phaseSrc, 'PhaseDialProps']
      expect(Object.keys(props(u.id)).filter((k) => !declared(src, iface).includes(k)), `${u.id}: props the widget ignores`).toEqual([])
    }
    expect(blochSrc).toContain('min={0} max={180}')
    expect(blochSrc).toContain('min={-180} max={180}')
    expect(phaseSrc).toContain('min={-180} max={180} step={5}')
    expect(blochSrc).toContain('rotationAngles')
  })
})

describe('Q24 Try-it: the first unit (bloch at θ = 0°, measuring z)', () => {
  const start = text(renderToString(<BlochSphere {...(props('q24-divincenzo') as object)} />))
  const pole = text(renderToString(<BlochSphere {...(props('q24-divincenzo') as object)} theta={180} />))
  it('the table reads ⟨Sz⟩ 1/2 ħ and the +z bar 100.0% at the start, and ⟨Sz⟩ -1/2 ħ at θ = 180°', () => {
    expect(start).toContain('⟨Sz⟩ 1/2 ħ')
    expect(start).toContain('+z 100.0%')
    expect(pole).toContain('⟨Sz⟩ -1/2 ħ')
    const t = lines('q24-divincenzo')
    expect(t).toContain('⟨Sz⟩ 1/2 ħ')
    expect(t).toContain('+z bar reads 100.0%')
    expect(t).toContain('⟨Sz⟩ reads -1/2 ħ')
    expect(blochSrc).toContain('min={0} max={180}')
  })
})

describe('Q24 Try-it: the Lindblad unit (bloch at θ = 90°, φ = 0°, measuring x)', () => {
  const html = text(renderToString(<BlochSphere {...(props('q24-lindblad') as object)} />))
  it('the table reads ⟨Sx⟩ 1/2 ħ and the +x bar 100.0%: the equator state, the arrow the plan starts the decay from', () => {
    expect(html).toContain('⟨Sx⟩ 1/2 ħ')
    expect(html).toContain('+x 100.0%')
    expect(V.q24RT1x).toBeLessThan(1)
    const t = lines('q24-lindblad')
    expect(t).toContain('⟨Sx⟩ 1/2 ħ')
    expect(t).toContain('+x bar reads 100.0%')
    expect(t).toContain('pure states only')
  })
})

describe('Q24 Try-it: the driven-qubit unit (amplitude-bars for |+x⟩ in the z basis)', () => {
  const start = text(renderToString(<AmplitudeBars {...(props('q24-bloch-eq') as object)} />))
  const turned = text(renderToString(<AmplitudeBars state={[90, 120] as never} basis="z" />))
  it('the z bars read 50.0% and 50.0% and stay there when the relative phase changes: detuning turns the phase, not the populations', () => {
    expect(start).toContain('+z 50.0% −z 50.0%')
    expect(turned).toContain('+z 50.0% −z 50.0%')
    const t = lines('q24-bloch-eq')
    expect(t).toContain('+z 50.0% and −z 50.0%')
    expect(t).toContain('Change φ')
    expect(ampSrc).toContain("label={<Tex>{'\\\\phi'}</Tex>} value={ph} min={-180} max={180}")
  })
})

describe('Q24 Try-it: the Rabi unit (bloch from θ = 0°)', () => {
  const at0 = text(renderToString(<BlochSphere {...(props('q24-rabi') as object)} />))
  const at90 = text(renderToString(<BlochSphere {...(props('q24-rabi') as object)} theta={90} />))
  const at180 = text(renderToString(<BlochSphere {...(props('q24-rabi') as object)} theta={180} />))
  it('the readout |α|², |β|² reads 1, 0 at the start, 1/2, 1/2 at 90° (half a π pulse) and 0, 1 at 180° (a π pulse)', () => {
    expect(at0).toContain('|α|², |β|² 1, 0')
    expect(at90).toContain('|α|², |β|² 1/2, 1/2')
    expect(at180).toContain('|α|², |β|² 0, 1')
    const t = lines('q24-rabi')
    expect(t).toContain('|α|², |β|² reads 1, 0')
    expect(t).toContain('1/2, 1/2')
    expect(t).toContain('0, 1')
  })
  it('half a π pulse leaves the excited chance at 1/2: the chapter’s P_e at half the π time on resonance (a quarter unit of time at Ω = 2π) is 1/2, the 1/2, 1/2 of the readout', () => {
    expect(V.q24PeQuarter).toBeCloseTo(0.5, 12)
    expect(V.q24Tpi / 2).toBeCloseTo(V.q24TQuarter, 12)
  })
})

describe('Q24 Try-it: the Ramsey unit (bloch from θ = 90°, φ = 0°, with the R_z buttons 60°, 90°, 180°)', () => {
  const html = text(renderToString(<BlochSphere {...(props('q24-ramsey') as object)} />))
  it('the three buttons exist and the bar starts at +x 100.0%', () => {
    expect(html).toContain('R z ( 60 ∘ )')
    expect(html).toContain('R z ( 90 ∘ )')
    expect(html).toContain('R z ( 180 ∘ )')
    expect(html).toContain('+x 100.0%')
    expect(props('q24-ramsey').rotations).toBe(true)
    expect(props('q24-ramsey').rotationAngles).toEqual([60, 90, 180])
  })
  it('after R_z(60°) the +x bar reads 75.0% (the chapter’s P(1) at 60°) and after R_z(90°) more it reads 6.7%, the engine’s cos² of half the total angle', () => {
    const after = (deg: number[]) => prob(KET['+x'], deg.reduce((psi, d) => apply(Rz(d * DEG), psi), KET['+x']))
    expect(after([60])).toBeCloseTo(V.q24RamseyP1Deg60, 12)
    expect(after([60])).toBeCloseTo(0.75, 12)
    expect(after([60, 90])).toBeCloseTo(Math.cos(75 * DEG) ** 2, 12)
    expect((100 * after([60, 90])).toFixed(1)).toBe('6.7')
    const t = lines('q24-ramsey')
    expect(t).toContain('+x bar reads 75.0%')
    expect(t).toContain('cos²(30°)')
    expect(t).toContain('150°')
    expect(t).toContain('6.7%')
    expect(t).toContain('cos²(75°)')
  })
})

describe('Q24 Try-it: the decoupling unit (phase-dial from φ = 0° with the rotation buttons)', () => {
  const html = text(renderToString(<PhaseDial {...(props('q24-decoupling') as object)} />))
  it('the dial starts at arg(β/α) = 0° and has the buttons R_z(90°) and R_z(-45°)', () => {
    expect(html).toContain('relative phase arg(β/α) = 0°')
    expect(html).toContain('R z ( 90 ∘ )')
    expect(html).toContain('R z ( − 45 ∘ )')
    expect(props('q24-decoupling').rotations).toBe(true)
    expect(phaseSrc).toContain("animate('rz', Math.PI / 2)")
    expect(phaseSrc).toContain("animate('rz', -Math.PI / 4)")
  })
  it('R_z(90°) takes arg(β/α) to 90°, and two R_z(-45°) bring it back to 0°', () => {
    const plus = [c(1), c(1)].map((z) => ({ re: z.re * Math.SQRT1_2, im: 0 }))
    const turn = (deg: number[]) => deg.reduce((psi, d) => apply(Rz(d * DEG), psi), plus)
    const phase = (psi: { re: number; im: number }[]) => (arg({ re: psi[1].re * psi[0].re + psi[1].im * psi[0].im, im: psi[1].im * psi[0].re - psi[1].re * psi[0].im }) / DEG)
    expect(phase(turn([90]))).toBeCloseTo(90, 9)
    expect(phase(turn([90, -45, -45]))).toBeCloseTo(0, 9)
    const t = lines('q24-decoupling')
    expect(t).toContain('arg(β/α) = 90°')
    expect(t).toContain('R_z(-45°) twice')
    expect(t).toContain('back at 0°')
  })
})

describe('Q24 Try-its: every sentence of a line is within the 25-word cap', () => {
  it('splits each line at sentence ends and counts words', () => {
    for (const u of Q24.units) for (const l of u.visual.tryThis) for (const s of l.split(/(?<=[.!?])\s+/)) expect(s.split(/\s+/).length, `${u.id}: ${s}`).toBeLessThanOrEqual(25)
  })
})
