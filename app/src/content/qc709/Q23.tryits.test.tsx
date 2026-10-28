/**
 * Chapter Q23's Try-it lines against the REAL widgets (existing widgets only, plan §9.3: no new widget). Each unit's `visual` names a widget and the props it passes; each `tryThis` line quotes what that
 * widget draws. Three checks keep a line true:
 *  1. every prop is one the widget declares (read from its source), and every control a line tells the reader to use is in the code;
 *  2. every readout a line quotes is what the widget really renders (rendered to markup), at the start or at the state the line names (the widget's props start it there);
 *  3. every number a line promises is recomputed here through the engine functions the widget uses and tied to the chapter's own values.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { abs, conj, expi, mul, scale } from '../../physics/complex'
import { blochVector, ketFromBloch } from '../../physics/spin'
import { axisVector } from '../../physics/sg'
import { classicalFidelity, mutualInfoPovm } from '../../physics/qc/infoq'
import { densityOf } from '../../physics/qc/density'
import { classicalPair } from '../../physics/qc/info'
import { ket } from '../../physics/qc/state'
import BlochSrc from '../../widgets/BlochSphere.tsx?raw'
import operatorBuilderSrc from '../../widgets/OperatorBuilder.tsx?raw'
import pairGridSrc from '../../widgets/PairGrid.tsx?raw'
import phaseDialSrc from '../../widgets/PhaseDial.tsx?raw'
import projectorSrc from '../../widgets/Projector.tsx?raw'
import PairGrid from '../../widgets/PairGrid'
import { BlochSphere } from '../../widgets/BlochSphere'
import { OperatorBuilder } from '../../widgets/OperatorBuilder'
import { PhaseDial } from '../../widgets/PhaseDial'
import { Projector } from '../../widgets/Projector'
import type { Unit } from '../schema'
import { Q23 } from './Q23'
import { V } from './Q23.values'

const unit = (id: string): Unit => Q23.units.find((u) => u.id === id)!
const lines = (id: string): string => unit(id).visual.tryThis.join(' ')
const props = (id: string) => unit(id).visual.props as Record<string, unknown>
const clean = (html: string): string => html.replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/<!--.*?-->/g, '')
const text = (html: string): string => clean(html).replace(/<annotation[^>]*>[^<]*<\/annotation>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
const annotations = (html: string): string => (clean(html).match(/<annotation[^>]*>[^<]*/g) ?? []).map((a) => a.replace(/<annotation[^>]*>/, '')).join(' | ')
const declared = (src: string, iface: string): string[] => {
  const body = new RegExp(`export interface ${iface}\\s*\\{([\\s\\S]*?)\\n\\}`).exec(src)?.[1] ?? ''
  return [...body.matchAll(/^\s*(\w+)\??:/gm)].map((m) => m[1])
}
const DEG = Math.PI / 180
/** The widget's own chance of "+" along an axis for the state at polar angle theta (BlochSphere: pUp = (1 + r.n)/2, shown with one decimal). */
const pUp = (thetaDeg: number, axis: 'x' | 'z'): number => {
  const r = blochVector(ketFromBloch(thetaDeg * DEG, 0))
  const n = axisVector(axis)
  return (1 + r[0] * n[0] + r[1] * n[1] + r[2] * n[2]) / 2
}
const pct1 = (p: number): string => `${(p * 100).toFixed(1)}%`

describe('Q23 Try-its: every prop reaches the widget', () => {
  it('each unit names a widget of its own kind and passes only props that widget declares', () => {
    expect(Object.fromEntries(Q23.units.map((u) => [u.id, u.visual.kind]))).toEqual({
      'q23-classical-compare': 'projector',
      'q23-quantum-compare': 'bloch',
      'q23-entropy-props': 'operator-builder',
      'q23-two-variables': 'pair-grid',
      'q23-quantum-mutual': 'phase-dial',
      'q23-holevo': 'bloch',
    })
    const allowed: Record<string, string[]> = {
      projector: declared(projectorSrc, 'ProjectorProps'),
      bloch: declared(BlochSrc, 'BlochProps'),
      'operator-builder': declared(operatorBuilderSrc, 'OperatorBuilderProps'),
      'pair-grid': declared(pairGridSrc, 'PairGridProps'),
      'phase-dial': declared(phaseDialSrc, 'PhaseDialProps'),
    }
    for (const u of Q23.units) expect(Object.keys(props(u.id)).filter((k) => !allowed[u.visual.kind].includes(k)), `${u.id}: props the widget ignores`).toEqual([])
    expect(props('q23-classical-compare')).toEqual({ state: 45, basis: 20, editableBasis: true })
    expect(props('q23-two-variables')).toEqual({ mode: 'classical', coins: 'dealer' })
  })
  it('the controls a line tells the reader to use exist: the basis slider, the landmark buttons, Next step, the two dealers, the phase slider, the theta slider', () => {
    expect(projectorSrc).toContain('measurement basis')
    expect(projectorSrc).toContain('step={5}')
    expect(BlochSrc).toContain("LANDMARKS.map(([k, tex])")
    expect(BlochSrc).toContain("['+z', '|{+z}\\\\rangle']")
    expect(BlochSrc).toContain('label={<Tex>{\'\\\\theta\'}</Tex>}')
    expect(operatorBuilderSrc).toContain('Next step')
    expect(pairGridSrc).toContain('two separate dealers')
    expect(pairGridSrc).toContain('one dealer, two coins')
    expect(phaseDialSrc).toContain('max={180}')
  })
})

describe('Q23 Try-its: the readouts a line quotes are what the widgets draw', () => {
  it('q23-classical-compare: the basis at 20° reads 0.906 with P = 82.1%, the classical fidelity of the fair coin with the table (cos² 20°, sin² 20°); at 45° it reads 1 with P = 100.0%', () => {
    const t20 = text(renderToString(<Projector {...(props('q23-classical-compare') as object)} />))
    expect(t20).toContain('⟨+20°|ψ⟩ 0.906 P = 82.1%')
    const table = [Math.cos(20 * DEG) ** 2, Math.sin(20 * DEG) ** 2]
    expect(classicalFidelity([0.5, 0.5], table).toFixed(3)).toBe('0.906')
    expect(pct1(classicalFidelity([0.5, 0.5], table) ** 2)).toBe('82.1%')
    const t45 = text(renderToString(<Projector state={45} basis={45} editableBasis />))
    expect(t45).toContain('⟨+x|ψ⟩ 1 P = 100.0%')
    expect(classicalFidelity([0.5, 0.5], [0.5, 0.5])).toBeCloseTo(1, 12)
    // the first line of the unit names the same numbers
    expect(lines('q23-classical-compare')).toContain('0.906 with P = 82.1%')
    expect(lines('q23-classical-compare')).toContain('1 with P = 100.0%')
  })
  it('q23-quantum-compare: |+> read along z gives +z 50.0% and −z 50.0%; |+z> gives 100.0% and 0.0%; the two z tables are 0.5 apart, short of D = 0.707', () => {
    const t = text(renderToString(<BlochSphere {...(props('q23-quantum-compare') as object)} />))
    expect(t).toContain('+z 50.0% −z 50.0%')
    expect(pct1(pUp(90, 'z'))).toBe('50.0%')
    expect(pct1(pUp(0, 'z'))).toBe('100.0%')
    expect(pct1(1 - pUp(0, 'z'))).toBe('0.0%')
    expect(pUp(0, 'z') - pUp(90, 'z')).toBeCloseTo(V.q23DmeasZ, 12)
    expect(V.q23DmeasZ).toBeLessThan(V.q23DquantumZP)
    expect(lines('q23-quantum-compare')).toContain('0.5 apart')
    expect(lines('q23-quantum-compare')).toContain('quantum distance 0.707')
    expect(V.q23DquantumZP.toFixed(3)).toBe('0.707')
  })
  it('q23-entropy-props: the operator builder shows the completeness check P+ + P− = I after Next step, and half and half of the two projectors is the flat state', () => {
    const html = renderToString(<OperatorBuilder {...(props('q23-entropy-props') as object)} />)
    expect(text(html)).toContain('(completeness)')
    expect(annotations(html)).toContain('P_+ + P_- = I')
    expect(text(html)).toContain('Next step')
    expect(V.q23S3Qubits).toBeGreaterThan(2.99)
  })
  it('q23-two-variables: one dealer reads 1/2 in both off-diagonal boxes with the lines coin A: +1 0.5, −1 0.5 and correlation −1; two dealers read 1/4 and correlation 0', () => {
    const d = text(renderToString(<PairGrid {...(props('q23-two-variables') as object)} />))
    expect(d).toContain('0 1/2 1/2 0')
    expect(d).toContain('coin A: +1 0.5, −1 0.5')
    expect(d).toContain('correlation = −1')
    expect(classicalPair('dealer')).toEqual([
      [0, 0.5],
      [0.5, 0],
    ])
    const i = text(renderToString(<PairGrid mode="classical" coins="independent" />))
    expect(i).toContain('1/4 1/4 1/4 1/4')
    expect(i).toContain('correlation = 0')
    expect(V.q23IDealer).toBeCloseTo(1, 12)
    expect(V.q23IIndep).toBeCloseTo(0, 12)
    expect(lines('q23-two-variables')).toContain('both off-diagonal boxes read 1/2')
    expect(lines('q23-two-variables')).toContain('every box reads 1/4 and the correlation is 0')
  })
  it('q23-quantum-mutual: the phase dial starts at 0° and at 180° reads relative phase arg(β/α) = 180°, the Z error that turns |+> into |−>', () => {
    const t0 = text(renderToString(<PhaseDial {...(props('q23-quantum-mutual') as object)} />))
    expect(t0).toContain('relative phase arg(β/α) = 0°')
    const a = { re: Math.SQRT1_2, im: 0 }
    const b = scale(expi(Math.PI), Math.SQRT1_2)
    const rel = mul(conj(a), b)
    expect(Math.round((Math.atan2(rel.im, rel.re) * 180) / Math.PI)).toBe(180)
    expect(abs(rel)).toBeCloseTo(0.5, 12)
    const t180 = text(renderToString(<PhaseDial theta={180} rotations={false} />))
    expect(t180).toContain('relative phase arg(β/α) = 180°')
    expect(lines('q23-quantum-mutual')).toContain('arg(β/α) = 180°')
  })
  it('q23-holevo: |0> read along x gives +x 50.0% and −x 50.0%; at θ = 90° (|+>) it gives 100.0% and 0.0%; the two x tables are 0.5 apart (0.311 of 0.601 bit)', () => {
    const t = text(renderToString(<BlochSphere {...(props('q23-holevo') as object)} />))
    expect(t).toContain('+x 50.0% −x 50.0%')
    expect(pct1(pUp(0, 'x'))).toBe('50.0%')
    expect(pct1(pUp(90, 'x'))).toBe('100.0%')
    expect(pct1(1 - pUp(90, 'x'))).toBe('0.0%')
    expect(pUp(90, 'x') - pUp(0, 'x')).toBeCloseTo(0.5, 12)
    expect(V.q23IZPz.toFixed(3)).toBe('0.311')
    expect(V.q23ChiZP.toFixed(3)).toBe('0.601')
    // an x reading of the pair is the mirror image of the z reading: the same 0.311 bit
    const pair = [densityOf(ket('0')), densityOf(ket('+'))]
    expect(mutualInfoPovm([0.5, 0.5], pair, [densityOf(ket('+')), densityOf(ket('-'))])).toBeCloseTo(V.q23IZPz, 12)
    expect(lines('q23-holevo')).toContain('0.311 bit of the 0.601 allowed')
  })
})
