/**
 * Try-it gate for the Foundations chapters F5 and F6 (P-F5-review and P-F6-review, blocking item 1). Their builds passed
 * every lint while none of the 27 Try-it lines could be done: each unit named props (`mode: 'binomial'`, `opA: 'X'`,
 * `qubits: 2` …) that its widget silently ignored, so the learner saw a default scene that did not match the line.
 * Two checks keep that from coming back:
 *  1. Every prop a unit's `visual` passes is one the widget declares (read from the widget's own `…Props` interface).
 *  2. Every readout a Try-it line quotes is what its widget really draws, recomputed here through the same engine calls
 *     (the widget is rendered to markup and its text is compared with the line).
 * The widget's own quirks are pinned too, so a line that works around one ("ignore the readout's sign") stays true.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { abs2 } from '../../physics/complex'
import { apply, mat, vec } from '../../physics/linalg'
import { binomialStd } from '../../physics/random'
import { axisVector } from '../../physics/sg'
import { binaryEntropy } from '../../physics/qc/info'
import { kron } from '../../physics/qc/state'
import { inner } from '../../physics/linalg'
import { KET, ketAlong, ketFromBloch, prob } from '../../physics/spin'
import { AmplitudeBars } from '../../widgets/AmplitudeBars'
import { DepositStats } from '../../widgets/DepositStats'
import { OperatorAction } from '../../widgets/OperatorAction'
import type { Unit, WidgetKind } from '../schema'
import { V as V5 } from './F5.values'
import { V as V6 } from './F6.values'
import { QC_CHAPTERS } from './index'

const DEG = Math.PI / 180
const UNITS: Unit[] = QC_CHAPTERS.filter((l) => l.id === 'F5' || l.id === 'F6').flatMap((l) => l.units)
const unit = (id: string): Unit => UNITS.find((u) => u.id === id)!
const tries = (id: string): string => unit(id).visual.tryThis.join('\n')

/** The text of a server-rendered widget, markup and comment separators removed, TeX source of each formula kept. */
const text = (el: React.ReactElement): string =>
  renderToString(el)
    .replace(/&amp;/g, '&')
    .replace(/&#x27;/g, "'")
    .replace(/<!--.*?-->/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
const annotations = (el: React.ReactElement): string =>
  (renderToString(el).replace(/&amp;/g, '&').match(/<annotation[^>]*>[^<]*/g) ?? []).map((a) => a.replace(/<annotation[^>]*>/, '')).join(' | ')

const bars = (theta: number, phi = 0) => <AmplitudeBars state={[theta, phi]} basis="z" />
/** The widget's own chance of +z at polar angle θ: |⟨+z|ψ⟩|². */
const zChance = (theta: number): number => abs2(inner(ketAlong([0, 0, 1]), ketFromBloch(theta * DEG, 0)))
/** pct() of the widget: one decimal. */
const pc = (x: number): string => (x * 100).toFixed(1)

/* ---------------------------------------------------------------------------------------------- */
/* 1. props the widget takes                                                                        */
/* ---------------------------------------------------------------------------------------------- */

const SRC = import.meta.glob<string>('../../widgets/*.tsx', { query: '?raw', import: 'default', eager: true })
const FILE_OF: Partial<Record<WidgetKind, string>> = {
  'deposit-stats': 'DepositStats',
  'amplitude-bars': 'AmplitudeBars',
  'operator-action': 'OperatorAction',
  'operator-builder': 'OperatorBuilder',
}
/** The prop names of a widget's exported `…Props` interface. */
function declaredProps(kind: WidgetKind): string[] | null {
  const file = FILE_OF[kind]
  const src = file ? SRC[`../../widgets/${file}.tsx`] : undefined
  const body = src && /export interface \w+Props\s*\{([\s\S]*?)\n\}/.exec(src)?.[1]
  return body ? [...body.matchAll(/^\s*(\w+)\??:/gm)].map((m) => m[1]) : null
}

describe('F5 and F6 Try-its: every prop reaches the widget', () => {
  it('reads the declared props of the widgets these chapters use', () => {
    expect(declaredProps('deposit-stats')).toEqual(['state', 'axis', 'seed'])
    expect(declaredProps('amplitude-bars')).toEqual(['state', 'basis', 'editable'])
    expect(declaredProps('operator-action')).toEqual(['a', 'b', 'd', 'preset'])
  })
  it.each(UNITS.map((u) => [u.id, u] as const))('%s: its visual passes only props the widget declares', (_, u) => {
    const declared = declaredProps(u.visual.kind)
    expect(declared, `${u.id}: add the widget kind "${u.visual.kind}" to FILE_OF`).not.toBeNull()
    const passed = Object.keys(u.visual.props ?? {})
    expect(passed.filter((k) => !declared!.includes(k)), `${u.id}: props the "${u.visual.kind}" widget ignores`).toEqual([])
    expect(u.visual.tryThis.length, u.id).toBeGreaterThanOrEqual(2)
  })
})

/* ---------------------------------------------------------------------------------------------- */
/* 2a. F5: amplitude-bars chances (average, surprise) and deposit-stats (probability, spread)       */
/* ---------------------------------------------------------------------------------------------- */

describe('F5 Try-its quote what the widgets read', () => {
  it('average: θ = 60° reads 75.0 % / 25.0 %, so ⟨S_z⟩ = ½(0.75 − 0.25) = 0.25ħ; θ = 90° reads 50 %; θ = 0° reads 100 %', () => {
    const t = tries('f5-average')
    const p = zChance(60)
    expect(text(bars(60))).toContain(`+z ${pc(p)}%`)
    expect(text(bars(60))).toContain(`−z ${pc(1 - p)}%`)
    expect(t).toContain(`${pc(p)}\\%`)
    expect(t).toContain(`${pc(1 - p)}\\%`)
    expect(0.5 * (p - (1 - p))).toBeCloseTo(V5.f5SpinAvg, 12)
    expect(t).toContain(`${V5.f5SpinAvg.toFixed(2)}\\hbar`)
    expect(text(bars(90))).toContain('+z 50.0%')
    expect(text(bars(90))).toContain('−z 50.0%')
    expect(0.5 * (zChance(90) - (1 - zChance(90)))).toBeCloseTo(0, 12)
    expect(text(bars(0))).toContain('+z 100.0%')
    expect(t).toContain('50\\%')
    expect(t).toContain('100\\%')
  })
  it('surprise: θ = 90° reads 50.0 % (H = 1), θ = 60° reads 75.0 % / 25.0 % (h = 0.811), θ = 0° reads 100.0 % / 0.0 % (H = 0)', () => {
    const t = tries('f5-surprise')
    expect(zChance(90)).toBeCloseTo(0.5, 12)
    expect(binaryEntropy(zChance(90))).toBeCloseTo(1, 12)
    expect(binaryEntropy(zChance(60)).toFixed(3)).toBe('0.811')
    expect(binaryEntropy(zChance(60))).toBeCloseTo(V5.f5hThreeQuarter, 12)
    expect(binaryEntropy(zChance(0))).toBeCloseTo(0, 12)
    const h = text(<AmplitudeBars {...(unit('f5-surprise').visual.props as object)} />)
    expect(h).toContain('+z 50.0%')
    expect(text(bars(60))).toContain('+z 75.0%')
    expect(text(bars(0))).toContain('+z 100.0%')
    expect(text(bars(0))).toContain('−z 0.0%')
    for (const s of ['$50.0\\%$', '$75.0\\%$', '$25.0\\%$', '$100.0\\%$', '$0.0\\%$', 'h(0.75) = 0.811']) expect(t).toContain(s)
  })
  it('probability: +x read along z is a 0.5000 coin and the piles add to the atoms fired', () => {
    const p = prob(ketAlong(axisVector('z')), KET['+x'])
    expect(p).toBeCloseTo(0.5, 12)
    expect(text(<DepositStats {...(unit('f5-probability').visual.props as object)} />)).toContain('P(+z) = 0.5000')
    expect(text(<DepositStats {...(unit('f5-probability').visual.props as object)} />)).toContain('Born: 50.0%')
    expect(tries('f5-probability')).toContain('P(+z) = 0.5000')
  })
  it('spread: N = 20, 100 and 10000 read 10.0 ± 2.2, 50.0 ± 5.0 (band 40 to 60) and 5000.0 ± 50.0', () => {
    const t = tries('f5-spread')
    const p = prob(ketAlong(axisVector('z')), KET['+x'])
    for (const N of [20, 100, 10000]) expect(t, `N = ${N}`).toContain(`${(N * p).toFixed(1)} \\pm ${binomialStd(N, p).toFixed(1)}`)
    const sigma = binomialStd(100, p)
    expect([Math.max(0, 100 * p - 2 * sigma).toFixed(0), Math.min(100, 100 * p + 2 * sigma).toFixed(0)]).toEqual(['40', '60'])
    expect(t).toContain('$40$ to $60$')
    // the fraction's spread σ/N: 5 % at N = 100, 0.5 % at N = 10000 — ten times tighter for a hundred times the atoms
    expect(binomialStd(100, p) / 100).toBeCloseTo(0.05, 12)
    expect(binomialStd(10000, p) / 10000).toBeCloseTo(0.005, 12)
    expect(t).toContain('$0.5\\%$')
    expect(t).toContain('$5\\%$')
  })
})

/* ---------------------------------------------------------------------------------------------- */
/* 2b. F6: the amplitude list, the X operator preset and the same deposit coin                      */
/* ---------------------------------------------------------------------------------------------- */

describe('F6 Try-its quote what the widgets read', () => {
  it('pairs, kron and growth start from |0⟩: the widget reads (1, 0), and at θ = 90° two 50.0 % bars of size 1/√2', () => {
    for (const id of ['f6-pairs', 'f6-kron', 'f6-growth']) expect(unit(id).visual.props, id).toEqual({ state: '+z', basis: 'z' })
    const ann0 = annotations(bars(0))
    expect(ann0).toContain('\\langle{+z}|\\psi\\rangle = 1')
    expect(ann0).toContain('\\langle{-z}|\\psi\\rangle = 0')
    expect(text(bars(90))).toContain('+z 50.0%')
    expect(text(bars(90))).toContain('−z 50.0%')
    // the quirk the lines work around: the −z reading ket carries a phase, so |+⟩ reads (1/√2, −1/√2) in this widget
    const ann90 = annotations(bars(90))
    expect(ann90).toContain('\\langle{+z}|\\psi\\rangle = \\tfrac{1}{\\sqrt2}')
    expect(ann90).toContain('\\langle{-z}|\\psi\\rangle = -\\tfrac{1}{\\sqrt2}')
    expect(tries('f6-kron')).toContain('ignore the readout’s sign')
    expect(tries('f6-pairs')).toContain('the readout’s minus sign is a phase, not a size')
    // the phase slider at 180° leaves the chances alone (|−⟩ looks like |+⟩ in the z bars)
    expect(text(bars(90, 180))).toContain('+z 50.0%')
    expect(tries('f6-kron')).toContain('A sign never changes a chance')
  })
  it('kron: the three products the lines quote', () => {
    const round = (v: ReturnType<typeof kron>) => v.map((z) => Math.round(z.re * 1000) / 1000)
    expect(round(kron(KET['+x'], KET['+z']))).toEqual([0.707, 0, 0.707, 0])
    expect(round(kron(KET['+z'], KET['+x']))).toEqual([0.707, 0.707, 0, 0])
    expect(round(kron(KET['+x'], KET['-x']))).toEqual([0.5, -0.5, 0.5, -0.5])
    const t = tries('f6-kron')
    for (const s of ['(0.707, 0, 0.707, 0)', '(0.707, 0.707, 0, 0)', '(0.5, -0.5, 0.5, -0.5)']) expect(t).toContain(s)
  })
  it('pairs and growth: counts double, a sure |00⟩ has one 1, and two 50 % qubits make four chances of 25 %', () => {
    expect(V6.f6TwoQDim).toBe(4)
    expect(V6.f6Strings).toBe(8)
    expect(V6.f6TenDim).toBe(1024)
    expect(kron(KET['+z'], KET['+z']).map((z) => abs2(z))).toEqual([1, 0, 0, 0])
    const quarter = kron(KET['+x'], KET['+x']).map((z) => abs2(z))
    for (const q of quarter) expect(q).toBeCloseTo(0.25, 12)
    expect(tries('f6-growth')).toContain('$25\\%$')
    expect(tries('f6-growth')).toContain('$2^{10} = 1024$')
    expect(V6.f6Mem30).toBe(16)
    expect(tries('f6-growth')).toContain('$16$ GiB')
  })
  it('operator: the σx preset is X, X|0⟩ = |1⟩, (X⊗I)|+0⟩ = |+0⟩ and (Z⊗Z)|01⟩ = −|01⟩', () => {
    const X = mat([[0, 1], [1, 0]])
    const Z = mat([[1, 0], [0, -1]])
    const up = apply(X, vec(1, 0))
    expect([up[0].re, up[1].re]).toEqual([0, 1])
    expect(annotations(<OperatorAction {...(unit('f6-operator').visual.props as object)} />)).toContain('\\begin{pmatrix} 0 & 1 \\\\ 1 & 0 \\end{pmatrix}')
    expect(annotations(<OperatorAction preset="σz" />)).toContain('\\begin{pmatrix} 1 & 0 \\\\ 0 & -1 \\end{pmatrix}')
    const down = apply(Z, vec(0, 1))
    expect([down[0].re, down[1].re]).toEqual([0, -1])
    expect(V6.f6XIon01).toBe(1)
    expect(V6.f6XIon0Plus).toBe(1)
    expect(V6.f6ZZon01).toBe(1)
    expect(tries('f6-operator')).toContain('Press the “σz” preset')
  })
  it('product-or-not: the same 50/50 coin as F5, expected 50 ± 5 after +100, and det C = 0 versus ½', () => {
    const p = prob(ketAlong(axisVector('z')), KET['+x'])
    expect(unit('f6-product-or-not').visual.props).toEqual({ state: '+x', axis: 'z', seed: 709 })
    expect(tries('f6-product-or-not')).toContain(`${(100 * p).toFixed(0)} \\pm ${binomialStd(100, p).toFixed(0)}`)
    expect(V6.f6ProdDet).toBeCloseTo(0, 12)
    expect(V6.f6BellDet).toBeCloseTo(0.5, 12)
    expect(tries('f6-product-or-not')).toContain('\\det C = 0$ for it and $\\tfrac12$ for the Bell state')
  })
})
