/**
 * Chapter Q16's Try-it lines against the REAL widgets (ruling R5 of qc709-Q15Q17.md: one-qubit stand-ins until an oracle bench exists).
 * Each unit's `visual` names a widget and the props it passes; each `tryThis` line quotes what that widget draws. Two checks keep a line true:
 *  1. every prop is one the widget declares (the widget's own `…Props` interface, read from its source), and the slider a line tells the
 *     reader to move is in the widget's code with a range that reaches the quoted value;
 *  2. every readout a line quotes is what the widget really renders at the start (the widget is rendered to markup and its text compared),
 *     and every number a line promises AFTER the reader acts (θ dragged to 0°, φ set to 0°, a phase set to 0° or 180°) is recomputed here
 *     through the same engine calls the widget uses, and tied to the chapter's own engine (the oracles module) where the line names a function.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { abs2 } from '../../physics/complex'
import { apply, inner } from '../../physics/linalg'
import { KET, ketAlong } from '../../physics/spin'
import { H } from '../../physics/qc/gates'
import { runCircuit } from '../../physics/qc/circuit'
import { phasorSum } from '../../physics/qc/complexExtra'
import { bvCircuit, signMean } from '../../physics/qc/oracles'
import { AmplitudeBars } from '../../widgets/AmplitudeBars'
import amplitudeBarsSrc from '../../widgets/AmplitudeBars.tsx?raw'
import ComplexPlaneQc from '../../widgets/ComplexPlaneQc'
import complexPlaneQcSrc from '../../widgets/ComplexPlaneQc.tsx?raw'
import complexPlaneSrc from '../../widgets/ComplexPlane.tsx?raw'
import type { Unit } from '../schema'
import { Q16 } from './Q16'
import { V } from './Q16.values'

const DEG = Math.PI / 180
const unit = (id: string): Unit => Q16.units.find((u) => u.id === id)!
const tries = (id: string): string => unit(id).visual.tryThis.join(' ')

/** The text of a server-rendered widget, markup and comment separators removed. */
const clean = (html: string): string => html.replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/<!--.*?-->/g, '')
const text = (html: string): string => clean(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
/** The TeX source of every formula the widget typesets (KaTeX keeps it in an annotation), joined. */
const tex = (html: string): string => (clean(html).match(/<annotation[^>]*>[^<]*/g) ?? []).map((a) => a.replace(/<annotation[^>]*>/, '')).join(' | ')
/** The accessible description of the complex-plane widget's drawing: its readouts ("sum = 0; size 0; size² 0"). */
const aria = (html: string): string => /aria-label="([^"]*)"/.exec(clean(html))?.[1] ?? ''

const declared = (src: string, iface: string): string[] => {
  const body = new RegExp(`export interface ${iface}\\s*\\{([\\s\\S]*?)\\n\\}`).exec(src)?.[1] ?? ''
  return [...body.matchAll(/^\s*(\w+)\??:/gm)].map((m) => m[1])
}
const WIDGET: Record<string, { src: string; iface: string }> = {
  'amplitude-bars': { src: amplitudeBarsSrc, iface: 'AmplitudeBarsProps' },
  'complex-plane': { src: complexPlaneSrc, iface: 'ComplexPlaneProps' },
}

describe('Q16 Try-its: every prop reaches the widget', () => {
  it.each(Q16.units.map((u) => [u.id, u] as const))('%s: its visual passes only props the widget declares', (_, u) => {
    const w = WIDGET[u.visual.kind]
    expect(w, `${u.id}: add the widget kind "${u.visual.kind}" to WIDGET`).toBeDefined()
    expect(Object.keys(u.visual.props ?? {}).filter((k) => !declared(w.src, w.iface).includes(k)), `${u.id}: props the "${u.visual.kind}" widget ignores`).toEqual([])
  })
  it('reads the declared props of the widgets', () => {
    expect(declared(amplitudeBarsSrc, 'AmplitudeBarsProps')).toEqual(['state', 'basis', 'editable'])
    expect(declared(complexPlaneSrc, 'ComplexPlaneProps')).toEqual(['mode', 'z', 'w', 'phi', 'n', 'phases', 'N', 'j'])
    expect(declared(complexPlaneQcSrc, 'ComplexPlaneQcProps')).toEqual(['mode', 'phi', 'n', 'phases', 'N', 'j'])
  })
  it('the phasor widget forwards `phases` to its pane (a prop the pane would otherwise never see)', () => {
    expect(complexPlaneSrc).toContain('<QcPane mode={mode} phi={phi} n={n} phases={phases} N={N} j={j} />')
  })
})

describe('Q16 Try-it: the Hadamard unit (amplitude-bars on |1⟩ = |−z⟩, measured along x)', () => {
  const u = unit('q16-hadamard-n')
  const at = (props: object) => renderToString(<AmplitudeBars {...props} />)
  it('starts with the rows ⟨+x|ψ⟩ = 1/√2 and ⟨−x|ψ⟩ = −1/√2 and two bars of 50.0 %', () => {
    const html = at(u.visual.props as object)
    expect(tex(html)).toContain('\\langle{+x}|\\psi\\rangle = \\tfrac{1}{\\sqrt2}')
    expect(tex(html)).toContain('\\langle{-x}|\\psi\\rangle = -\\tfrac{1}{\\sqrt2}')
    expect(text(html)).toMatch(/\+x 50\.0% −x 50\.0%/)
    expect(text(html)).toMatch(/θ[^°]*180°/)
  })
  it('those rows are the amplitudes H puts on |0⟩ and |1⟩: the engine’s H|1⟩ is (1/√2, −1/√2), the chapter’s q16H1Bar and q16H1Minus', () => {
    const psi = KET['-z']
    const plusRow = inner(ketAlong([1, 0, 0]), psi)
    const minusRow = inner(ketAlong([-1, 0, 0]), psi)
    expect(plusRow.re).toBeCloseTo(V.q16H1Bar, 12)
    expect(minusRow.re).toBeCloseTo(V.q16H1Minus, 12)
    const h = apply(H, psi)
    expect(h[0].re).toBeCloseTo(plusRow.re, 12)
    expect(h[1].re).toBeCloseTo(minusRow.re, 12)
    expect(plusRow.im).toBeCloseTo(0, 12)
    expect(minusRow.im).toBeCloseTo(0, 12)
  })
  it('the θ slider ranges 0°–180° in steps of 5°, so θ = 0° is the state |0⟩, and there both rows read 1/√2, with no minus sign', () => {
    expect(amplitudeBarsSrc).toContain("label={<Tex>{'\\\\theta'}</Tex>} value={th} min={0} max={180} step={5}")
    const html = at({ state: [0, 0], basis: 'x', editable: true })
    expect(tex(html)).toContain('\\langle{+x}|\\psi\\rangle = \\tfrac{1}{\\sqrt2}')
    expect(tex(html)).toContain('\\langle{-x}|\\psi\\rangle = \\tfrac{1}{\\sqrt2}')
    expect(tex(html)).not.toContain('-\\tfrac')
    expect(KET['+z'].map(abs2)).toEqual([1, 0])
  })
  it('the lines say exactly that', () => {
    const t = tries('q16-hadamard-n')
    expect(t).toContain('|1⟩ = |−z⟩, measured along x')
    expect(t).toContain('⟨+x|ψ⟩ = 1/√2 and ⟨−x|ψ⟩ = −1/√2')
    expect(t).toContain('each bar says 50.0%')
    expect(t).toContain('Drag the θ slider to 0°')
    expect(t).toContain('both rows now read 1/√2')
  })
})

describe('Q16 Try-it: the Bernstein–Vazirani unit (amplitude-bars on |−x⟩, measured along x)', () => {
  const u = unit('q16-bv')
  const at = (props: object) => renderToString(<AmplitudeBars {...props} />)
  it('starts at θ = 90°, φ = 180° with ⟨+x|ψ⟩ = 0 and ⟨−x|ψ⟩ = 1: one bar of 100.0 %', () => {
    const html = at(u.visual.props as object)
    expect(tex(html)).toContain('\\langle{+x}|\\psi\\rangle = 0')
    expect(tex(html)).toContain('\\langle{-x}|\\psi\\rangle = 1')
    expect(text(html)).toMatch(/\+x 0\.0% −x 100\.0%/)
    expect(text(html)).toMatch(/θ[^°]*90°[\s\S]*[φϕ][^°]*180°/)
  })
  it('the φ slider reaches 0° (range −180°…180°), and at θ = 90°, φ = 0° the state is |+x⟩: ⟨+x|ψ⟩ = 1, ⟨−x|ψ⟩ = 0', () => {
    expect(amplitudeBarsSrc).toContain("label={<Tex>{'\\\\phi'}</Tex>} value={ph} min={-180} max={180} step={5}")
    const html = at({ state: [90, 0], basis: 'x', editable: true })
    expect(tex(html)).toContain('\\langle{+x}|\\psi\\rangle = 1')
    expect(tex(html)).toContain('\\langle{-x}|\\psi\\rangle = 0')
    expect(text(html)).toMatch(/\+x 100\.0% −x 0\.0%/)
  })
  it('these two states are what one-bit Bernstein–Vazirani holds before the last H, and H sends them to |1⟩ (a = 1) and |0⟩ (a = 0): the engine’s oracles module agrees', () => {
    const s1 = runCircuit(bvCircuit(1, 0, 1)).states
    const s0 = runCircuit(bvCircuit(0, 0, 1)).states
    // the state after the query is |−x⟩ for a = 1 and |+x⟩ for a = 0
    s1[2].forEach((z, i) => expect(z.re).toBeCloseTo(KET['-x'][i].re, 12))
    s0[2].forEach((z, i) => expect(z.re).toBeCloseTo(KET['+x'][i].re, 12))
    // and the last H returns |1⟩ and |0⟩
    expect(abs2(s1[3][1])).toBeCloseTo(1, 12)
    expect(abs2(s0[3][0])).toBeCloseTo(1, 12)
    expect(abs2(apply(H, KET['-x'])[1])).toBeCloseTo(1, 12)
    expect(abs2(apply(H, KET['+x'])[0])).toBeCloseTo(1, 12)
  })
  it('the lines say exactly that', () => {
    const t = tries('q16-bv')
    expect(t).toContain('The rows read ⟨+x|ψ⟩ = 0 and ⟨−x|ψ⟩ = 1')
    expect(t).toContain('one bar, at 100.0%')
    expect(t).toContain('H sends |−x⟩ to |1⟩, so the hidden bit is a = 1')
    expect(t).toContain('Set the φ slider to 0° (θ stays 90°)')
    expect(t).toContain('⟨+x|ψ⟩ = 1')
    expect(t).toContain('H sends |+x⟩ to |0⟩, so a = 0')
  })
})

describe('Q16 Try-it: the Deutsch–Jozsa unit (phasor arrows 0° and 180°: the two signs of a one-bit f)', () => {
  const u = unit('q16-dj')
  const at = (phases: number[]) => renderToString(<ComplexPlaneQc mode="phasor" phases={phases} />)
  it('starts with arrows at 0° and 180°: sum = 0, size 0 (the signs cancel)', () => {
    const html = at((u.visual.props as { phases: number[] }).phases)
    expect(aria(html)).toBe('sum = 0; size 0; size² 0')
    expect(text(html)).toContain('phase of arrow 1 0°')
    expect(text(html)).toContain('phase of arrow 2 180°')
    expect(Math.hypot(phasorSum([0, 180 * DEG]).re, phasorSum([0, 180 * DEG]).im)).toBeLessThan(1e-12)
  })
  it('turning arrow 2 to 0° gives sum = 2, size 2 (the signs agree); the phase sliders run 0°…360° in steps of 5°', () => {
    expect(complexPlaneQcSrc).toContain('label={`phase of arrow ${k + 1}`} value={p} min={0} max={360} step={5}')
    const html = at([0, 0])
    expect(aria(html)).toBe('sum = 2; size 2; size² 4')
    expect(phasorSum([0, 0]).re).toBeCloseTo(2, 12)
  })
  it('these sums are the signs of a one-bit f: f = (0, 1) is balanced and its two signs add to 0; f = (0, 0) is constant and they add to 2 (the oracles module’s signMean)', () => {
    expect(2 * signMean([0, 1])).toBeCloseTo(0, 12)
    expect(2 * signMean([0, 0])).toBeCloseTo(2, 12)
    expect(2 * signMean([1, 1])).toBeCloseTo(-2, 12)
  })
  it('the lines say exactly that', () => {
    const t = tries('q16-dj')
    expect(t).toContain('At 0° and 180°')
    expect(t).toContain('the readout says sum = 0 and size 0')
    expect(t).toContain('Turn the phase of arrow 2 to 0°')
    expect(t).toContain('the readout says sum = 2 and size 2')
  })
})

describe('Q16 Try-it: the classical-cost unit (three phasor arrows at 0°: three agreeing answers)', () => {
  const u = unit('q16-classical-cost')
  const at = (phases: number[]) => renderToString(<ComplexPlaneQc mode="phasor" phases={phases} />)
  it('starts with three arrows at 0°: sum = 3, size 3', () => {
    const html = at((u.visual.props as { phases: number[] }).phases)
    expect(aria(html)).toBe('sum = 3; size 3; size² 9')
    expect(text(html)).toContain('phase of arrow 3 0°')
    expect((u.visual.props as { phases: number[] }).phases).toEqual([0, 0, 0])
  })
  it('turning arrow 3 to 180° gives sum = 1, size 1: one answer disagrees', () => {
    const html = at([0, 0, 180])
    expect(aria(html)).toBe('sum = 1; size 1; size² 1')
    expect(phasorSum([0, 0, Math.PI]).re).toBeCloseTo(1, 12)
  })
  it('the signs +, +, + add to 3 and +, +, − to 1, as the mean of signs says (the oracles module’s signMean times the count)', () => {
    expect(3 * signMean([0, 0, 0])).toBeCloseTo(3, 12)
    expect(3 * signMean([0, 0, 1])).toBeCloseTo(1, 12)
  })
  it('the lines say exactly that', () => {
    const t = tries('q16-classical-cost')
    expect(t).toContain('The readout says sum = 3 and size 3')
    expect(t).toContain('Turn the phase of arrow 3 to 180°')
    expect(t).toContain('the readout says sum = 1 and size 1')
  })
})
