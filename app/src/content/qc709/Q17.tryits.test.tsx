/**
 * Chapter Q17's Try-it lines against the REAL widgets (ruling R7 of qc709-Q15Q17.md: one-qubit stand-ins until a Grover bench exists).
 * Each unit's `visual` names a widget and the props it passes; each `tryThis` line quotes what that widget draws. Two checks keep a line true:
 *  1. every prop is one the widget declares (the widget's own `…Props` interface, read from its source), and the props come from the engine
 *     (the Projector's angle is α, 3α, 5α for N = 8; the matrix is the mirror through |w₀⟩);
 *  2. every readout a line quotes is what the widget really renders at the start (the widget is rendered to markup and its text compared),
 *     and every number a line promises AFTER the reader acts (the Rz(180°) button, the σz preset, a drag to 103.5°) is recomputed here
 *     through the same engine calls the widget uses.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { blochVector, eigenHermitian2 } from '../../physics/spin'
import { mat } from '../../physics/linalg'
import { PhaseDial } from '../../widgets/PhaseDial'
import { OperatorAction } from '../../widgets/OperatorAction'
import { Projector } from '../../widgets/Projector'
import projectorSrc from '../../widgets/Projector.tsx?raw'
import operatorActionSrc from '../../widgets/OperatorAction.tsx?raw'
import phaseDialSrc from '../../widgets/PhaseDial.tsx?raw'
import type { Unit } from '../schema'
import { Q17 } from './Q17'
import { ALPHA_DEG, V } from './Q17.values'

const DEG = Math.PI / 180
const unit = (id: string): Unit => Q17.units.find((u) => u.id === id)!

/** The text of a server-rendered widget, markup and comment separators removed. */
const text = (html: string): string =>
  html
    .replace(/&amp;/g, '&')
    .replace(/&#x27;/g, "'")
    .replace(/<!--.*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')

const declared = (src: string): string[] => {
  const body = /export interface \w+Props\s*\{([\s\S]*?)\n\}/.exec(src)?.[1] ?? ''
  return [...body.matchAll(/^\s*(\w+)\??:/gm)].map((m) => m[1])
}
const PHASE_DIAL_SRC = phaseDialSrc
const WIDGET_SRC: Record<string, string> = { 'phase-dial': phaseDialSrc, projector: projectorSrc, 'operator-action': operatorActionSrc }
/** The chance of the |−z⟩ row at plane angle t degrees: the Projector reads c₂ = ψ·(0, 1) = sin t at basis 0. */
const upRow = (tDeg: number): number => Math.sin(tDeg * DEG) ** 2
const pct = (x: number): string => `${(x * 100).toFixed(1)}%`

describe('Q17 Try-its: every prop reaches the widget', () => {
  it.each(Q17.units.map((u) => [u.id, u] as const))('%s: its visual passes only props the widget declares', (_, u) => {
    const src = WIDGET_SRC[u.visual.kind]
    expect(src, `${u.id}: add the widget kind "${u.visual.kind}" to WIDGET_SRC`).toBeDefined()
    expect(Object.keys(u.visual.props ?? {}).filter((k) => !declared(src).includes(k)), `${u.id}: props the "${u.visual.kind}" widget ignores`).toEqual([])
  })
  it('reads the declared props of the widgets', () => {
    expect(declared(phaseDialSrc)).toEqual(['theta', 'rotations'])
    expect(declared(projectorSrc)).toEqual(['state', 'basis', 'editableBasis', 'labels'])
    expect(declared(operatorActionSrc)).toEqual(['a', 'b', 'd', 'preset'])
  })
  it('the engine, not a typed number, sets the Projector angles and the matrix: α, 3α, 5α and the mirror through |w₀⟩', () => {
    expect((unit('q17-plane').visual.props as { state: number }).state).toBeCloseTo(V.q17AlphaDeg, 12)
    expect((unit('q17-iterate').visual.props as { state: number }).state).toBeCloseTo(3 * V.q17AlphaDeg, 12)
    expect((unit('q17-optimal').visual.props as { state: number }).state).toBeCloseTo(5 * V.q17AlphaDeg, 12)
    expect(ALPHA_DEG).toBe(V.q17AlphaDeg)
    const p = unit('q17-two-reflections').visual.props as { a: number; b: number; d: number }
    expect([p.a, p.b, p.d]).toEqual([V.q17Cos2a, V.q17Sin2a, -V.q17Cos2a])
  })
})

describe('Q17 Try-it: the oracle unit (phase-dial: the mark of a two-string search is a sign on |1⟩, a relative phase of 180°)', () => {
  const u = unit('q17-oracle')
  const at = (theta: number) => text(renderToString(<PhaseDial {...(u.visual.props as object)} theta={theta} />))
  it('starts at φ = 0 (the even mix |+⟩): relative phase 0°, the point on +x; no R_z buttons (rotations: false)', () => {
    expect(at(0)).toContain('relative phase arg(β/α) = 0°')
    const html = renderToString(<PhaseDial {...(u.visual.props as object)} />)
    expect(html).not.toContain('R_z(90')
    expect(text(html)).toContain('multiply both by')
    expect((u.visual.props as { theta: number }).theta).toBe(0)
  })
  it('at φ = 180° (the slider’s end) the readout says 180°, the Bloch point is at −x, and the phasors have equal size: |−⟩, same chances', () => {
    expect(at(180)).toContain('relative phase arg(β/α) = 180°')
    const sq = Math.SQRT1_2
    const plus = [{ re: sq, im: 0 }, { re: sq, im: 0 }]
    const minus = [{ re: sq, im: 0 }, { re: -sq, im: 0 }]
    expect(blochVector(plus)[0]).toBeCloseTo(1, 12)
    expect(blochVector(minus)[0]).toBeCloseTo(-1, 12)
    expect(Math.hypot(minus[0].re, minus[0].im)).toBeCloseTo(Math.hypot(minus[1].re, minus[1].im), 12)
    expect(PHASE_DIAL_SRC).toContain("['+x', 58, 0]")
    expect(PHASE_DIAL_SRC).toContain("min={-180} max={180}")
  })
  it('the lines say exactly that', () => {
    const t = u.visual.tryThis.join(' ')
    expect(t).toContain('moving the φ slider to 180°')
    expect(t).toContain('relative phase]] arg(β/α) = 180°')
    expect(t).toContain('from +x to −x')
    expect(t).toContain('The two phasors keep the same length')
  })
})

describe('Q17 Try-it: the plane unit (projector at α)', () => {
  const u = unit('q17-plane')
  const html = text(renderToString(<Projector {...(u.visual.props as object)} />))
  it('at 20.7° the ⟨−z|ψ⟩ row reads 0.354 and P = 12.5%, the ⟨+z|ψ⟩ row 0.935 and 87.5%; the note compares with the sphere’s doubled angles', () => {
    expect(html).toMatch(/⟨-z\|ψ⟩\s*0\.354\s*P = 12\.5%/)
    expect(html).toMatch(/⟨\+z\|ψ⟩\s*0\.935\s*P = 87\.5%/)
    expect(html).toContain('State-space angles are half the Bloch-sphere angles')
    expect(upRow(V.q17AlphaDeg)).toBeCloseTo(V.q17StartChance, 12)
    expect(u.visual.tryThis[0]).toContain('0.354 and P = 12.5%')
    expect(u.visual.tryThis[0]).toContain('20.7°')
  })
  it('the basis slider is off (editableBasis false): the readout rows are the z basis only', () => {
    expect(html).not.toContain('measurement basis')
  })
})

describe('Q17 Try-it: the two-reflections unit (operator-action, the mirror through |w₀⟩)', () => {
  const u = unit('q17-two-reflections')
  const html = text(renderToString(<OperatorAction {...(u.visual.props as object)} />))
  it('shows the matrix a = 3/4, b = 0.661, d = −3/4 (the widget prints exact fractions), and offers the σz preset', () => {
    expect(html).toContain('\\tfrac34 & 0.661')
    expect(html).toContain('-\\tfrac34')
    expect(html).toContain('0.661')
    expect(html).toContain('σz')
    expect(operatorActionSrc).toContain("'σz': [1, 0, -1]")
    expect(u.visual.tryThis[0]).toContain('a = 3/4, b = 0.661 and d = −3/4')
    expect(u.visual.tryThis[1]).toContain('diag(1, −1)')
  })
  it('the eigenvalues the widget lists once "show eigen-directions" is ticked are 1 and −1 (the widget’s own eigenHermitian2)', () => {
    const p = u.visual.props as { a: number; b: number; d: number }
    const eig = eigenHermitian2(mat([[p.a, p.b], [p.b, p.d]]))
    expect([...eig.values].sort((x, y) => y - x).map((x) => Math.round(x * 1000) / 1000)).toEqual([1, -1])
    // the kept line is at α, the flipped line at right angles to it
    const k = eig.values[0] > 0 ? eig.vectors[0] : eig.vectors[1]
    expect(Math.abs(Math.atan2(k[1].re, k[0].re)) / DEG % 180).toBeCloseTo(V.q17AlphaDeg, 6)
    // σz: diag(1, −1), the mark's mirror
    const z = eigenHermitian2(mat([[1, 0], [0, -1]]))
    expect([...z.values].sort((x, y) => y - x)).toEqual([1, -1])
    expect(u.visual.tryThis[0]).toContain('the eigenvalues read 1 and −1')
  })
})

describe('Q17 Try-its: the iterate and optimal units (projector at 3α and 5α; the lines quote the engine’s chances)', () => {
  it('3α = 62.1°: the ⟨−z|ψ⟩ row reads 0.884 and P = 78.1% (one step); 103.5° reads 94.5% (two); 145° about 33% (three)', () => {
    const u = unit('q17-iterate')
    const html = text(renderToString(<Projector {...(u.visual.props as object)} />))
    expect(html).toMatch(/⟨-z\|ψ⟩\s*0\.884\s*P = 78\.1%/)
    expect(upRow(3 * V.q17AlphaDeg)).toBeCloseTo(V.q17P1, 12)
    expect(pct(upRow(V.q17Angle2))).toBe('94.5%')
    expect(pct(upRow(V.q17Angle3))).toBe('33.0%')
    const t = u.visual.tryThis.join(' ')
    expect(t).toContain('62.1°')
    expect(t).toContain('0.884 and P = 78.1%')
    expect(t).toContain('about 94.5%')
    expect(t).toContain('about 103.5°')
    expect(t).toContain('about 33%')
    expect(t).toContain('about 145°')
  })
  it('5α = 103.5°: the row reads P = 94.5%; dragged to straight up (90°) it reads 100.0%', () => {
    const u = unit('q17-optimal')
    const html = text(renderToString(<Projector {...(u.visual.props as object)} />))
    expect(html).toMatch(/⟨-z\|ψ⟩\s*0\.972\s*P = 94\.5%/)
    expect(upRow(5 * V.q17AlphaDeg)).toBeCloseTo(V.q17P2, 12)
    expect(pct(upRow(90))).toBe('100.0%')
    const t = u.visual.tryThis.join(' ')
    expect(t).toContain('P = 94.5%')
    expect(t).toContain('P = 100.0%')
    expect(t).toContain('2α = 41.4°')
  })
})
