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
import { apply } from '../../physics/linalg'
import { blochVector, Rz, eigenHermitian2, ketFromBloch } from '../../physics/spin'
import { mat } from '../../physics/linalg'
import { BlochSphere } from '../../widgets/BlochSphere'
import { OperatorAction } from '../../widgets/OperatorAction'
import { Projector } from '../../widgets/Projector'
import projectorSrc from '../../widgets/Projector.tsx?raw'
import operatorActionSrc from '../../widgets/OperatorAction.tsx?raw'
import blochSrc from '../../widgets/BlochSphere.tsx?raw'
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
const WIDGET_SRC: Record<string, string> = { bloch: blochSrc, projector: projectorSrc, 'operator-action': operatorActionSrc }
/** The chance of the |−z⟩ row at plane angle t degrees: the Projector reads c₂ = ψ·(0, 1) = sin t at basis 0. */
const upRow = (tDeg: number): number => Math.sin(tDeg * DEG) ** 2
const pct = (x: number): string => `${(x * 100).toFixed(1)}%`

describe('Q17 Try-its: every prop reaches the widget', () => {
  it.each(Q17.units.map((u) => [u.id, u] as const))('%s: its visual passes only props the widget declares', (_, u) => {
    const src = WIDGET_SRC[u.visual.kind]
    expect(src, `${u.id}: add the widget kind "${u.visual.kind}" to WIDGET_SRC`).toBeDefined()
    expect(Object.keys(u.visual.props ?? {}).filter((k) => !declared(src).includes(k)), `${u.id}: props the "${u.visual.kind}" widget ignores`).toEqual([])
  })
  it('reads the declared props of the three widgets', () => {
    expect(declared(blochSrc)).toEqual(expect.arrayContaining(['theta', 'phi', 'editable', 'measure', 'rotations', 'rotationAngles']))
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

describe('Q17 Try-it: the oracle unit (bloch, rotations: [180])', () => {
  const u = unit('q17-oracle')
  const html = text(renderToString(<BlochSphere {...(u.visual.props as object)} />))
  it('starts at |+⟩: ⟨Sx⟩ = 1/2 ħ and the z bars read +z 50.0% and −z 50.0%; one button, Rz(180°)', () => {
    expect(html).toMatch(/⟨Sx⟩\s*1\/2 ħ/)
    expect(html).toContain('+z 50.0%')
    expect(html).toContain('−z 50.0%')
    expect((renderToString(<BlochSphere {...(u.visual.props as object)} />).match(/R_z\(\d+\^\\circ\)/g) ?? []).length).toBeGreaterThanOrEqual(1)
    expect(renderToString(<BlochSphere {...(u.visual.props as object)} />)).toContain('R_z(180^\\circ)')
    expect(renderToString(<BlochSphere {...(u.visual.props as object)} />)).not.toContain('R_z(45^\\circ)')
  })
  it('after the press the engine (the widget’s own Rz) puts ⟨Sx⟩ at −0.5 ħ and keeps the z chances at 50%, so |+⟩ became |−⟩ up to a phase', () => {
    const psi = ketFromBloch(Math.PI / 2, 0)
    const out = apply(Rz(Math.PI), psi)
    const r = blochVector(out)
    expect(r[0] / 2).toBeCloseTo(-0.5, 12)
    expect(r[2]).toBeCloseTo(0, 12)
    expect(Math.abs(r[2] / 2 + 0.5) - 0.5).toBeLessThan(1e-12)
    // overlap with |−x⟩ = (1, −1)/√2 has size 1: the same ray
    const minus = [{ re: Math.SQRT1_2, im: 0 }, { re: -Math.SQRT1_2, im: 0 }]
    const ov = minus.reduce((s, z, i) => ({ re: s.re + z.re * out[i].re + z.im * out[i].im, im: s.im + z.re * out[i].im - z.im * out[i].re }), { re: 0, im: 0 })
    expect(Math.hypot(ov.re, ov.im)).toBeCloseTo(1, 12)
  })
  it('the lines say exactly that (and name no number the widget does not show)', () => {
    const t = u.visual.tryThis.join(' ')
    expect(t).toContain('Rz(180°)')
    expect(t).toContain('1/2 ħ to −1/2 ħ')
    expect(t).toContain('+z 50.0% and −z 50.0%')
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
