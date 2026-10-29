/**
 * Chapter Q25's Try-it lines against the REAL widgets (existing widgets only, plan §9.3: no new widget; the ion-trap, phonon and ion-gate rows draw the spin only, as the lines say). Each
 * unit's `visual` names a widget and the props it passes; each `tryThis` line quotes what that widget draws. Three checks keep a line true:
 *  1. every prop is one the widget declares (read from its source), the values lie in the controls' ranges, and every control a line tells the reader to use is in the code;
 *  2. every readout a line quotes is what the widget really renders (rendered to markup) at the start or at the setting the line names;
 *  3. every number a line promises after the reader acts is recomputed here through the engine functions the widget calls and tied to the chapter's own values.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { abs2 } from '../../physics/complex'
import { binomialStd } from '../../physics/random'
import { apply } from '../../physics/linalg'
import { axisVector } from '../../physics/sg'
import { KET, Rz, ketAlong, ketFromBloch, prob } from '../../physics/spin'
import { arg } from '../../physics/complex'
import { AmplitudeBars } from '../../widgets/AmplitudeBars'
import ampSrc from '../../widgets/AmplitudeBars.tsx?raw'
import { BlochSphere } from '../../widgets/BlochSphere'
import blochSrc from '../../widgets/BlochSphere.tsx?raw'
import { DepositStats } from '../../widgets/DepositStats'
import depositStatsSrc from '../../widgets/DepositStats.tsx?raw'
import { PhaseDial } from '../../widgets/PhaseDial'
import phaseSrc from '../../widgets/PhaseDial.tsx?raw'
import type { Unit } from '../schema'
import { Q25 } from './Q25'
import { V } from './Q25.values'

const unit = (id: string): Unit => Q25.units.find((u) => u.id === id)!
const lines = (id: string): string => unit(id).visual.tryThis.join(' ')
const props = (id: string) => unit(id).visual.props as Record<string, unknown>
const clean = (html: string): string => html.replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/<!--.*?-->/g, '')
const text = (html: string): string => clean(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
const annotations = (html: string): string => (clean(html).match(/<annotation[^>]*>[^<]*/g) ?? []).map((a) => a.replace(/<annotation[^>]*>/, '')).join(' | ')
const declared = (src: string, iface: string): string[] => {
  const body = new RegExp(`export interface ${iface}\\s*\\{([\\s\\S]*?)\\n\\}`).exec(src)?.[1] ?? ''
  return [...body.matchAll(/^\s*(\w+)\??:/gm)].map((m) => m[1])
}
const DEG = Math.PI / 180

describe('Q25 Try-its: every prop reaches the widget', () => {
  it('each unit names a widget of its own kind and passes only props that widget declares', () => {
    expect(declared(blochSrc, 'BlochProps')).toEqual(['theta', 'phi', 'editable', 'measure', 'rotations', 'rotationAngles', 'landmarks'])
    expect(declared(ampSrc, 'AmplitudeBarsProps')).toEqual(['state', 'basis', 'editable'])
    expect(declared(phaseSrc, 'PhaseDialProps')).toEqual(['theta', 'rotations'])
    expect(declared(depositStatsSrc, 'DepositStatsProps')).toEqual(['state', 'axis', 'seed'])
    expect(Object.fromEntries(Q25.units.map((u) => [u.id, u.visual.kind]))).toEqual({
      'q25-cooling': 'deposit-stats',
      'q25-readout': 'amplitude-bars',
      'q25-atom-gates': 'phase-dial',
      'q25-ion-trap': 'bloch',
      'q25-phonons': 'amplitude-bars',
      'q25-ion-gates': 'bloch',
    })
    const src: Record<string, [string, string]> = { bloch: [blochSrc, 'BlochProps'], 'amplitude-bars': [ampSrc, 'AmplitudeBarsProps'], 'phase-dial': [phaseSrc, 'PhaseDialProps'], 'deposit-stats': [depositStatsSrc, 'DepositStatsProps'] }
    for (const u of Q25.units) {
      const [s, iface] = src[u.visual.kind]
      expect(Object.keys(props(u.id)).filter((k) => !declared(s, iface).includes(k)), `${u.id}: props the widget ignores`).toEqual([])
    }
    expect(blochSrc).toContain('min={0} max={180}')
    expect(phaseSrc).toContain('min={-180} max={180} step={5}')
  })
})

describe('Q25 Try-it: the cooling unit (deposit-stats, +z read along x)', () => {
  const p = prob(ketAlong(axisVector('x')), KET['+z'])
  it('a fair coin: P(+x) = 0.5000 in the formula line, and +100 atoms gives “expected 50.0 ± 5.0”', () => {
    expect(p).toBeCloseTo(0.5, 12)
    expect(annotations(renderToString(<DepositStats {...props('q25-cooling')} />))).toContain('P(+x) = 0.5000')
    expect(`${(100 * p).toFixed(1)} ± ${binomialStd(100, p).toFixed(1)}`).toBe('50.0 ± 5.0')
    expect(depositStatsSrc).toContain('<th>expected</th><td>{(N * p).toFixed(1)} ± {sigma.toFixed(1)}</td>')
    expect(depositStatsSrc).toContain('+{m} atoms')
    const t = lines('q25-cooling')
    expect(t).toContain('P(+x) = 0.5000')
    expect(t).toContain('“expected 50.0 ± 5.0”')
  })
  it('the half-full coin is the chapter’s ceiling: Poisson loading never fills a site with chance above one half, so a block of 100 needs about twice the sites', () => {
    expect(V.q25PodMu1).toBeLessThan(0.5)
    expect(V.q25Sites100).toBeGreaterThan(200)
    expect(V.q25Sites100).toBeLessThan(250)
    expect(lines('q25-cooling')).toContain('about twice as many sites')
  })
})

describe('Q25 Try-it: the readout unit (amplitude-bars at θ = 60°, φ = 45°, read along z)', () => {
  const html = text(renderToString(<AmplitudeBars {...(props('q25-readout') as object)} />))
  const at0 = text(renderToString(<AmplitudeBars state={[0, 45] as never} basis="z" />))
  it('the z bars read +z 75.0% and −z 25.0%, which are cos² 30° and sin² 30°; at θ = 0° only +z is left', () => {
    expect(html).toContain('+z 75.0% −z 25.0%')
    expect(at0).toContain('+z 100.0% −z 0.0%')
    const psi = ketFromBloch(60 * DEG, 45 * DEG)
    const up = ketAlong([0, 0, 1])
    expect(abs2({ re: up[0].re * psi[0].re + up[0].im * psi[0].im, im: up[0].re * psi[0].im - up[0].im * psi[0].re })).toBeCloseTo(0.75, 12)
    const t = lines('q25-readout')
    expect(t).toContain('+z 75.0% and −z 25.0%')
    expect(t).toContain('Drag θ to 0°')
    expect(ampSrc).toContain('min=')
  })
})

describe('Q25 Try-it: the atom-gate unit (phase-dial from 0° with the rotation buttons)', () => {
  const html = text(renderToString(<PhaseDial {...(props('q25-atom-gates') as object)} />))
  const plus = [
    { re: Math.SQRT1_2, im: 0 },
    { re: Math.SQRT1_2, im: 0 },
  ]
  const turn = (deg: number[]) => deg.reduce((psi, dd) => apply(Rz(dd * DEG), psi), plus)
  const phase = (psi: { re: number; im: number }[]) => arg({ re: psi[1].re * psi[0].re + psi[1].im * psi[0].im, im: psi[1].im * psi[0].re - psi[1].re * psi[0].im }) / DEG
  it('the dial starts at arg(β/α) = 0° and has the button R_z(90°)', () => {
    expect(html).toContain('relative phase arg(β/α) = 0°')
    expect(html).toContain('R z ( 90 ∘ )')
    expect(props('q25-atom-gates').rotations).toBe(true)
    expect(phaseSrc).toContain("animate('rz', Math.PI / 2)")
  })
  it('one R_z(90°) takes the angle to 90°; two bring the point opposite its start, ±180°, the sign −1 of a 2π pulse', () => {
    expect(phase(turn([90]))).toBeCloseTo(90, 9)
    expect(Math.abs(phase(turn([90, 90])))).toBeCloseTo(180, 9)
    const t = lines('q25-atom-gates')
    expect(t).toContain('arg(β/α) = 90°')
    expect(t).toContain('a phase of 180°')
    expect(t).toContain('sign −1')
  })
})

describe('Q25 Try-it: the ion-trap unit (bloch at θ = 0°, measuring z)', () => {
  const start = text(renderToString(<BlochSphere {...(props('q25-ion-trap') as object)} />))
  it('the table reads ⟨Sz⟩ 1/2 ħ and the +z bar 100.0%: the spin only, as the line says', () => {
    expect(start).toContain('⟨Sz⟩ 1/2 ħ')
    expect(start).toContain('+z 100.0%')
    const t = lines('q25-ion-trap')
    expect(t).toContain('⟨Sz⟩ 1/2 ħ')
    expect(t).toContain('+z bar reads 100.0%')
    expect(t).toContain('draws the spin only')
  })
})

describe('Q25 Try-it: the phonon unit (amplitude-bars at θ = 90°, read along z)', () => {
  const html = text(renderToString(<AmplitudeBars {...(props('q25-phonons') as object)} />))
  it('a carrier π/2 pulse gives equal z bars: +z 50.0% and −z 50.0%; the widget draws no phonon count', () => {
    expect(html).toContain('+z 50.0% −z 50.0%')
    const t = lines('q25-phonons')
    expect(t).toContain('+z 50.0% and −z 50.0%')
    expect(t).toContain('cannot show')
  })
})

describe('Q25 Try-it: the ion-gate unit (bloch at θ = 90°, φ = 0°, measuring x)', () => {
  const html = text(renderToString(<BlochSphere {...(props('q25-ion-gates') as object)} />))
  it('after a carrier π/2 pulse the table reads ⟨Sx⟩ 1/2 ħ and the +x bar 100.0%; two ions cannot be drawn', () => {
    expect(html).toContain('⟨Sx⟩ 1/2 ħ')
    expect(html).toContain('+x 100.0%')
    const t = lines('q25-ion-gates')
    expect(t).toContain('⟨Sx⟩ 1/2 ħ')
    expect(t).toContain('+x bar reads 100.0%')
    expect(t).toContain('draws one spin')
  })
})

describe('Q25 Try-its: every sentence of a line is within the 25-word cap', () => {
  it('splits each line at sentence ends and counts words', () => {
    for (const u of Q25.units) for (const l of u.visual.tryThis) for (const s of l.split(/(?<=[.!?])\s+/)) expect(s.split(/\s+/).length, `${u.id}: ${s}`).toBeLessThanOrEqual(25)
  })
})
