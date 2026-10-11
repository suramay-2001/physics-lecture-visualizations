/**
 * Chapter Q18's Try-it lines against the REAL widgets (ruling R7 of qc709-Q18.md: existing widgets, each line checked against the widget's code; `oracle-bench` stays deferred).
 * Each unit's `visual` names a widget and the props it passes; each `tryThis` line quotes what that widget draws. Three checks keep a line true:
 *  1. every prop is one the widget declares (read from its source), the values lie in the controls' ranges, and every control a line tells the reader to use is in the code;
 *  2. every readout a line quotes is what the widget really renders at the start (the widget is rendered to markup and its text compared), and
 *  3. every number a line promises AFTER the reader acts (a Step pressed, a place flipped, a slider moved, an arrow dragged) is recomputed here through the engine functions the
 *     widget calls (reduceModel, rootsUse, rootsCorners, phasorSum, the Projector's shadow) and tied to the chapter's own values.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { phasorSum } from '../../physics/qc/complexExtra'
import { gcd, mod, multOrder } from '../../physics/qc/numtheory'
import { peDistribution } from '../../physics/qc/qft'
import BitTable, { reduceModel } from '../../widgets/BitTable'
import bitTableSrc from '../../widgets/BitTable.tsx?raw'
import ComplexPlaneQc, { ROOTS_RANGE, rootsCorners, rootsUse } from '../../widgets/ComplexPlaneQc'
import complexPlaneQcSrc from '../../widgets/ComplexPlaneQc.tsx?raw'
import { Projector } from '../../widgets/Projector'
import projectorSrc from '../../widgets/Projector.tsx?raw'
import type { Unit } from '../schema'
import { Q18 } from './Q18'
import { V } from './Q18.values'

const DEG = Math.PI / 180
const unit = (id: string): Unit => Q18.units.find((u) => u.id === id)!
const tries = (id: string): string => unit(id).visual.tryThis.join(' ')
const props = (id: string) => unit(id).visual.props as Record<string, unknown>
const clean = (html: string): string => html.replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/<!--.*?-->/g, '')
const text = (html: string): string => clean(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
/** The accessible description of a widget's drawing: its readout lines. */
const aria = (html: string): string => /<svg[^>]*aria-label="([^"]*)"/.exec(clean(html))?.[1] ?? ''
const declared = (src: string, iface: string): string[] => {
  const body = new RegExp(`export interface ${iface}\\s*\\{([\\s\\S]*?)\\n\\}`).exec(src)?.[1] ?? ''
  return [...body.matchAll(/^\s*(\w+)\??:/gm)].map((m) => m[1])
}
const roots = (N: number, j: number) => renderToString(<ComplexPlaneQc mode="roots" N={N} j={j} />)
const phasor = (phases: number[]) => renderToString(<ComplexPlaneQc mode="phasor" phases={phases} />)
const pct = (x: number): string => `${(x * 100).toFixed(1)}%`
/** The chance of the |−z⟩ row at plane angle t degrees: the Projector reads c₂ = sin t at basis 0. */
const upRow = (tDeg: number): number => Math.sin(tDeg * DEG) ** 2

describe('Q18 Try-its: every prop reaches the widget', () => {
  it('each spec names a widget and passes only props the widget (in that mode) declares, with values in the controls’ ranges', () => {
    const qc = declared(complexPlaneQcSrc, 'ComplexPlaneQcProps')
    expect(qc).toEqual(['mode', 'phi', 'n', 'phases', 'N', 'j'])
    expect(declared(bitTableSrc, 'BitTableProps')).toEqual(['mode', 'gate', 'view', 'a', 'b', 'combine', 'rows', 'n'])
    expect(declared(projectorSrc, 'ProjectorProps')).toEqual(['state', 'basis', 'editableBasis', 'labels'])
    const allowed: Record<string, string[]> = { roots: ['mode', 'N', 'j'], phasor: ['mode', 'phases'], reduce: ['mode', 'rows'] }
    for (const id of ['q18-simon', 'q18-qft', 'q18-kickback', 'q18-phase-est', 'q18-order']) {
      const p = props(id)
      expect(Object.keys(allowed), id).toContain(p.mode)
      expect(Object.keys(p).filter((k) => !allowed[p.mode as string].includes(k)), id).toEqual([])
    }
    expect(Object.keys(props('q18-counting')).sort()).toEqual(['basis', 'editableBasis', 'state'])
    for (const id of ['q18-qft', 'q18-kickback', 'q18-order']) {
      const p = props(id) as { N: number; j: number }
      expect(p.N).toBeGreaterThanOrEqual(ROOTS_RANGE.nMin)
      expect(p.N).toBeLessThanOrEqual(ROOTS_RANGE.nMax)
      expect(p.j).toBeGreaterThanOrEqual(ROOTS_RANGE.jMin)
      expect(p.j).toBeLessThanOrEqual(ROOTS_RANGE.jMax)
    }
  })
  it('the controls the lines name are in the widgets’ code: Step and the place buttons, the step slider and its “45° each” format, the phase sliders, the Projector’s drag', () => {
    expect(bitTableSrc).toContain('Step')
    expect(bitTableSrc).toContain("aria-label={`${label}, place ${k + 1}: ${b}`}")
    expect(bitTableSrc).toContain('label={`row ${i + 1}`}')
    expect(complexPlaneQcSrc).toContain('label="step (corners per arrow)"')
    expect(complexPlaneQcSrc).toContain('format={(v) => `${v} (${fixDeg((360 * v) / N)}° each)`}')
    expect(complexPlaneQcSrc).toContain('`phase of arrow ${k + 1}`')
    expect(complexPlaneQcSrc).toContain('min={0} max={360} step={5}')
    expect(projectorSrc).toContain('useDrag(svgRef, vp, (x, y) => setT(Math.atan2(y, x)))')
  })
})

describe('Q18 Try-it: the Simon unit (bit-table reduce, rows 110 and 110)', () => {
  const rows = (props('q18-simon') as { rows: string[] }).rows
  it('starts with two equal rows at move 0; one Step is “add row 1 to row 2” and then rank 1 with the null space 000, 001, 110, 111', () => {
    expect(rows).toEqual(['110', '110'])
    const start = reduceModel({ rows, step: 0 })
    expect(start.total).toBe(1)
    expect(start.lines).toContain('the matrix as given')
    const done = reduceModel({ rows, step: 1 })
    expect(done.lines).toEqual(['move 1 of 1', 'add row 1 to row 2', 'rank 1', 'null space: 000, 001, 110, 111'])
    expect(text(renderToString(<BitTable mode="reduce" rows={rows} />))).toContain('Step')
  })
  it('flipping place 3 of row 2 makes 111; one Step then reads rank 2 and the null space 000, 110, so s = 110', () => {
    const flipped = [rows[0], `${rows[1].slice(0, 2)}${rows[1][2] === '1' ? '0' : '1'}`]
    expect(flipped).toEqual(['110', '111'])
    const done = reduceModel({ rows: flipped, step: reduceModel({ rows: flipped, step: 0 }).total })
    expect(done.lines).toContain('rank 2')
    expect(done.lines).toContain('null space: 000, 110')
    expect(V.q18SimonRank).toBe(2)
    expect(V.q18SimonSolved).toBe(0b110)
  })
  it('the lines say exactly that', () => {
    const t = tries('q18-simon')
    for (const s of ['“add row 1 to row 2”', '“rank 1”', '“null space: 000, 001, 110, 111”', 'four candidates', 'place 3 of row 2', '“rank 2”', '“null space: 000, 110”', 's = 110']) expect(t, s).toContain(s)
  })
})

describe('Q18 Try-it: the QFT unit (roots N = 8, step 1)', () => {
  it('starts closed: the readout says “sum = 0”; the step slider reads “1 (45° each)”; the eight arrows are the amplitudes of U_F|001⟩ times √8', () => {
    const html = roots(8, 1)
    expect(aria(html)).toContain('sum = 0')
    expect(text(html)).toContain('corners used: 8 of 8, each 1 time')
    expect(rootsCorners(8, 1)).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
    expect((360 * 1) / 8).toBe(45)
    // the amplitudes of U_F|001⟩ are ω^y/√8: their sum is √8 times the overlap with the even mix, which is 0
    const amps = Array.from({ length: 8 }, (_, y) => ({ re: Math.cos((2 * Math.PI * y) / 8) / Math.sqrt(8), im: Math.sin((2 * Math.PI * y) / 8) / Math.sqrt(8) }))
    expect(Math.hypot(amps.reduce((s, z) => s + z.re, 0), amps.reduce((s, z) => s + z.im, 0))).toBeLessThan(1e-12)
    expect(amps[0].re * Math.sqrt(8)).toBeCloseTo(1, 12)
  })
  it('step 0 gives eight arrows to the right, “sum = 8”; step 4 uses two corners four times each (the signs of U_F|100⟩, the third wire’s sign)', () => {
    expect(aria(roots(8, 0))).toContain('sum = 8')
    expect(rootsUse(8, 4)).toEqual({ corners: 2, each: 4 })
    expect(text(roots(8, 4))).toContain('corners used: 2 of 8, each 4 times')
    expect(rootsCorners(8, 4)).toEqual([0, 4, 0, 4, 0, 4, 0, 4])
    expect(V.q18Qft101Bar).toBeCloseTo(1 / Math.sqrt(8), 12)
  })
  it('the lines say exactly that', () => {
    const t = tries('q18-qft')
    for (const s of ['√8 times the amplitudes of U_F|001⟩', '“1 (45° each)”', '“sum = 0”', 'Set the step to 0', 'the sum is 8', 'Set it to 4', '“corners used: 2 of 8, each 4 times”', 'only signs']) expect(t, s).toContain(s)
  })
})

describe('Q18 Try-it: the kickback unit (roots N = 8, step 5 = τ 0.625)', () => {
  it('starts with all eight corners used once; the controls receive k = 1, 2, 4: the corners 5, 2, 4, that is 225°, 90°, 180° (the chapter’s kick angles)', () => {
    expect(rootsUse(8, 5)).toEqual({ corners: 8, each: 1 })
    expect(text(roots(8, 5))).toContain('corners used: 8 of 8, each 1 time')
    const corners = rootsCorners(8, 5)
    expect([1, 2, 4].map((k) => corners[k])).toEqual([5, 2, 4])
    expect([1, 2, 4].map((k) => (360 * corners[k]) / 8)).toEqual([225, 90, 180])
    expect(V.q18KickQ2).toBeCloseTo(225, 9)
    expect(V.q18KickQ1).toBeCloseTo(90, 9)
    expect(V.q18KickQ0).toBeCloseTo(180, 9)
    expect(V.q18Tau).toBe(5 / 8)
  })
  it('step 4 is τ = 0.5: two corners, four times each; U² and U⁴ land on corner 0 (whole turns) and U on corner 4 (180°)', () => {
    expect(rootsUse(8, 4)).toEqual({ corners: 2, each: 4 })
    expect(text(roots(8, 4))).toContain('corners used: 2 of 8, each 4 times')
    const corners = rootsCorners(8, 4)
    expect([2, 4].map((k) => corners[k])).toEqual([0, 0])
    expect(corners[1]).toBe(4)
    expect((360 * 4) / 8).toBe(180)
  })
  it('the lines say exactly that', () => {
    const t = tries('q18-kickback')
    for (const s of ['the k-th power of U', 'τ = 0.625', '“corners used: 8 of 8, each 1 time”', 'k = 1, 2, 4', 'the corners 5, 2, 4', '225°, 90° and 180°', 'Set the step to 4', 'τ = 0.5', '“2 of 8, each 4 times”', 'only the control of U turns, by 180°']) expect(t, s).toContain(s)
  })
})

describe('Q18 Try-it: the phase-estimation unit (phasor, arrows at 0° and 300°)', () => {
  it('starts with two arrows 0° and 300°: the readout says “size 1.732” and “size² 3”, so the chance is 3/4 = 0.75, the engine’s one-wire reading of τ = 1/3 at x = 1', () => {
    expect(props('q18-phase-est')).toEqual({ mode: 'phasor', phases: [0, 300] })
    const html = phasor([0, 300])
    expect(aria(html)).toContain('size 1.732')
    expect(aria(html)).toContain('size² 3')
    const s = phasorSum([0, 300 * DEG])
    expect(Math.hypot(s.re, s.im)).toBeCloseTo(Math.sqrt(3), 12)
    expect(peDistribution(1 / 3, 1)[1]).toBeCloseTo(0.75, 12)
    expect(peDistribution(1 / 3, 1)[0]).toBeCloseTo(0.25, 12)
    // 360°·(τ − x/2) for τ = 1/3: x = 1 → −60° = 300°, x = 0 → 120°
    expect((360 * (1 / 3 - 1 / 2) + 360) % 360).toBeCloseTo(300, 9)
    expect(360 * (1 / 3)).toBeCloseTo(120, 9)
  })
  it('arrow 2 at 120° reads “size 1” (chance 0.25, the reading 0); at 0° it reads “size 2” (chance 1: τ = 1/2, the reading 1)', () => {
    expect(aria(phasor([0, 120]))).toContain('size 1;')
    expect(aria(phasor([0, 0]))).toContain('size 2;')
    expect(peDistribution(1 / 2, 1)[1]).toBeCloseTo(1, 12)
    expect(complexPlaneQcSrc).toContain('`phase of arrow ${k + 1}`')
  })
  it('the lines say exactly that', () => {
    const t = tries('q18-phase-est')
    for (const s of ['τ = 1/3', 'at 0° and at 360°·(τ − x/2)', '0° and 300°', '“size 1.732”', '1.732²/4 = 0.75', 'Set arrow 2 to 120°', 'size 1, chance 0.25', 'Set it to 0°', 'size 2', 'certain']) expect(t, s).toContain(s)
  })
})

describe('Q18 Try-it: the counting unit (projector at 30°, N = 4, M = 1)', () => {
  const html = text(renderToString(<Projector {...(props('q18-counting') as object)} />))
  it('at 30° the ⟨−z|ψ⟩ row reads 1/2 and P = 25.0% (M/N for one marked of four); the engine’s α is 30°', () => {
    expect(html).toMatch(/⟨-z\|ψ⟩\s*1\/2\s*P = 25\.0%/)
    expect(upRow(V.q18CntAlpha)).toBeCloseTo(1 / 4, 12)
    expect((props('q18-counting') as { state: number }).state).toBeCloseTo(V.q18CntAlpha, 12)
    expect(pct(upRow(30))).toBe('25.0%')
  })
  it('set to 45° (the angle the reading 010 gives back, α = 180°·2/8) the row reads P = 50.0%, so M = 2 of 4', () => {
    expect(pct(upRow(45))).toBe('50.0%')
    expect((180 * 2) / 8).toBe(45)
    expect(4 * upRow(45)).toBeCloseTo(2, 12)
    expect(V.q18CntEst2).toBeCloseTo(2, 12)
  })
  it('the lines say exactly that', () => {
    const t = tries('q18-counting')
    for (const s of ['|+z⟩, as the across axis |x₀⊥⟩', '|−z⟩, as the marked axis |x₀⟩', 'At 30°', '1/2 and P = 25.0%', 'which is M/N', 'Set the slider to 45°', 'the reading 010', 'P = 50.0%', 'M = 2 of 4']) expect(t, s).toContain(s)
  })
})

describe('Q18 Try-it: the order unit (roots N = 6, step 1)', () => {
  it('starts with six arrows 60° apart, “corners used: 6 of 6, each 1 time” and “sum = 0”', () => {
    expect(props('q18-order')).toEqual({ mode: 'roots', N: 6, j: 1 })
    const html = roots(6, 1)
    expect(text(html)).toContain('corners used: 6 of 6, each 1 time')
    expect(aria(html)).toContain('sum = 0')
    expect((360 * 1) / 6).toBe(60)
    expect(V.q18Ord).toBe(6)
  })
  it('step 2 (by 4) uses three corners twice each because 4 has order 3; step 3 (by 8) uses two corners three times because 8 × 8 = 64 ≡ 1 (mod 21)', () => {
    expect(rootsUse(6, 2)).toEqual({ corners: 3, each: 2 })
    expect(text(roots(6, 2))).toContain('corners used: 3 of 6, each 2 times')
    expect(gcd(2, 6)).toBe(2)
    expect(multOrder(4, 21)).toBe(3)
    expect(V.q18Ord4).toBe(3)
    expect(rootsUse(6, 3)).toEqual({ corners: 2, each: 3 })
    expect(text(roots(6, 3))).toContain('corners used: 2 of 6, each 3 times')
    expect(mod(2 ** 3, 21)).toBe(8)
    expect(mod(8 * 8, 21)).toBe(1)
    expect(multOrder(8, 21)).toBe(2)
  })
  it('the lines say exactly that', () => {
    const t = tries('q18-order')
    for (const s of ['60° apart', '“corners used: 6 of 6, each 1 time”', 'the sum is 0', 'Set the step to 2', '“3 of 6, each 2 times”', 'since 4 has order 3', 'Set it to 3', '“2 of 6, each 3 times”', '8 times 8 is 64, which is 1 mod 21']) expect(t, s).toContain(s)
  })
})
