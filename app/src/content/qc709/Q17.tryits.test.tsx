/**
 * Chapter Q17's Try-it lines against the REAL widget. Every unit's `visual` is now the oracle bench in Grover mode (rulings qc709-deferred-features D1 replaced the
 * one-qubit stand-ins of qc709-Q15Q17 R7). Each unit's `visual` names the widget and the props it passes; each `tryThis` line says what to press and quotes what the bench
 * then reads. Three checks keep a line true:
 *  1. every prop is one the widget declares (its own `OracleBenchProps`, read from its source) and survives the widget's normalisation unchanged;
 *  2. every button and slider a line names is in the widget's markup under that label;
 *  3. every reading a line quotes is what the bench's model returns after exactly the presses the line names (the model reads the engine: grover.ts, runCircuit, and the
 *     plane kind's own resolver), and the number is the chapter's own engine value (Q17.values: q17Blind, q17Bar, q17MeanAfterOracle, q17AlphaDeg, q17Angle1, q17TwoAlphaDeg,
 *     q17P1 … q17P3, q17Kopt8) or the engine's for the extra case the line names (N = 16).
 * The buttons themselves are exercised by the e2e spec (e2e/oracle-bench.spec.ts), which presses them and reads what the page draws.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { runCircuit } from '../../physics/qc/circuit'
import { groverOptimalK, groverSuccess } from '../../physics/qc/grover'
import { fix } from '../../stage/svg/draw'
import { resolveGroverPlaneStage } from '../../stage/svg/groverPlane'
import OracleBench from '../../widgets/OracleBench'
import oracleBenchSrc from '../../widgets/OracleBench.tsx?raw'
import { BENCH_OPS, START, applyOp, benchModel, normalizeSetup, type BenchOp, type BenchSetup } from '../../widgets/oracleBenchModel'
import type { Unit } from '../schema'
import { Q17 } from './Q17'
import { V } from './Q17.values'

const unit = (id: string): Unit => Q17.units.find((u) => u.id === id)!
const lines = (id: string): string => unit(id).visual.tryThis.join(' ')
const props = (id: string): Partial<BenchSetup> => unit(id).visual.props as Partial<BenchSetup>
const setupOf = (id: string, patch: Partial<BenchSetup> = {}): BenchSetup => normalizeSetup({ ...props(id), ...patch })
/** The bench after exactly these presses (an unavailable button throws, so a line cannot be "true" by skipping a step). */
function bench(id: string, ops: BenchOp[], patch: Partial<BenchSetup> = {}) {
  const mode = setupOf(id, patch).mode
  let st = START
  for (const op of ops) {
    const nx = applyOp(mode, st, op)
    if (!nx) throw new Error(`${id}: ${op} is not available at ${JSON.stringify(st)}`)
    st = nx
  }
  return benchModel(setupOf(id, patch), st)
}
const reading = (m: ReturnType<typeof benchModel>, key: string): string => m.readings.find((r) => r.key === key)?.text ?? ''
const text = (html: string): string => html.replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/<!--.*?-->/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
const html = (id: string, patch: object = {}) => renderToString(<OracleBench {...props(id)} {...patch} />)
const plane = (m: ReturnType<typeof benchModel>) => resolveGroverPlaneStage(m.planeState!, 1)
const states = (m: ReturnType<typeof benchModel>) => runCircuit(m.circuit).states

const declared = (src: string, iface: string): string[] => {
  const body = new RegExp(`export interface ${iface}\\s*\\{([\\s\\S]*?)\\n\\}`).exec(src)?.[1] ?? ''
  return [...body.matchAll(/^\s*(\w+)\??:/gm)].map((m) => m[1])
}
const STEP: BenchOp = 'step'

describe('Q17 Try-its: every prop reaches the widget', () => {
  it.each(Q17.units.map((u) => [u.id, u] as const))('%s: its visual is the oracle bench in Grover mode and passes only props the widget declares', (_, u) => {
    expect(u.visual.kind).toBe('oracle-bench')
    expect(Object.keys(u.visual.props ?? {}).filter((k) => !declared(oracleBenchSrc, 'OracleBenchProps').includes(k)), `${u.id}: props the widget ignores`).toEqual([])
    expect((u.visual.props as { mode: string }).mode).toBe('grover')
  })
  it('reads the declared props of the widget', () => {
    expect(declared(oracleBenchSrc, 'OracleBenchProps')).toEqual(['mode', 'n', 'family', 'a', 'b', 'marked', 's', 'answer', 'step', 'editable'])
  })
  it.each(Q17.units.map((u) => [u.id] as const))('%s: the widget draws what the unit names (normalisation changes none of the props): N = 8, x₀ = 101', (id) => {
    const asked = props(id) as Record<string, unknown>
    const got = setupOf(id) as unknown as Record<string, unknown>
    for (const k of Object.keys(asked)) expect(got[k], `${id}: ${k}`).toBe(asked[k])
    expect(asked).toMatchObject({ n: 3, marked: 5 })
  })
  it('the buttons the lines name are in the widget under those labels, and the slider reaches n = 4', () => {
    expect(BENCH_OPS.grover.map((o) => o.label)).toEqual(['Prepare', 'Mark (U_f)', 'Diffuse (D)', 'Whole step (Q)', 'Measure'])
    const t = text(html('q17-oracle'))
    for (const b of ['Prepare', 'Mark (U_f)', 'Diffuse (D)', 'Whole step (Q)']) expect(t).toContain(b)
    expect(t).toContain('wires n')
    expect(normalizeSetup({ mode: 'grover', n: 4 }).n).toBe(4)
  })
})

describe('Q17 Try-it: the oracle unit (grover N = 8, x₀ = 101)', () => {
  const id = 'q17-oracle'
  it('Prepare, Mark (U_f): the bar of |101⟩ flips to −0.354 (q17Bar) while its chance still reads 0.125 (q17Blind)', () => {
    const m = bench(id, ['prepare', 'oracle'])
    const psi = states(m)[2]
    expect(fix(psi[5].re)).toBe(`−${fix(V.q17Bar)}`)
    expect(fix(V.q17Bar)).toBe('0.354')
    expect(reading(m, 'chance')).toBe(`chance of 101: ${fix(V.q17Blind)}`)
    expect(fix(V.q17Blind)).toBe('0.125')
    expect(lines(id)).toContain('Press Prepare, then Mark (U_f). The bar of |101⟩ flips below the axis to −0.354, while the chance of reading it still shows 0.125.')
  })
  it('the mean line drops from 0.354 to 0.265 (q17MeanAfterOracle); seven bars stand above it and one hangs below', () => {
    const before = bench(id, ['prepare'])
    const after = bench(id, ['prepare', 'oracle'])
    expect(reading(before, 'mean')).toBe(`mean amplitude: ${fix(V.q17Bar)}`)
    expect(reading(after, 'mean')).toBe(`mean amplitude: ${fix(V.q17MeanAfterOracle)}`)
    expect(fix(V.q17MeanAfterOracle)).toBe('0.265')
    const psi = states(after)[2]
    const mean = V.q17MeanAfterOracle
    expect(psi.filter((z) => z.re > mean)).toHaveLength(7)
    expect(psi.filter((z) => z.re < mean)).toHaveLength(1)
    expect(lines(id)).toContain('The mean line drops from 0.354 to 0.265: seven bars stand above it and one hangs below. Marking alone changes no chance.')
  })
})

describe('Q17 Try-it: the plane unit', () => {
  const id = 'q17-plane'
  it('Prepare: the arrow is |w₀⟩ at α = 20.7° (q17AlphaDeg) and its vertical shadow squared is 0.125 (q17StartChance)', () => {
    const m = bench(id, ['prepare'])
    const r = plane(m)
    expect(m.planeLive).toBe(true)
    expect(r.alphaDeg).toBeCloseTo(V.q17AlphaDeg, 9)
    expect(r.angleDeg).toBeCloseTo(V.q17AlphaDeg, 9)
    expect(fix(r.alphaDeg, 1)).toBe('20.7')
    expect(r.success).toBeCloseTo(V.q17StartChance, 12)
    expect(fix(r.success)).toBe('0.125')
    const t = lines(id)
    expect(t).toContain('Press Prepare. The plane shows the start |w₀⟩ as an arrow α = 20.7° above the across axis; its vertical shadow squared is the chance 0.125.')
  })
  it('Mark (U_f): a dashed ghost arrow, the mirror image of the first in the across axis; the solid arrow and its chance (0.125) have not moved', () => {
    const before = plane(bench(id, ['prepare']))
    const m = bench(id, ['prepare', 'oracle'])
    const r = plane(m)
    expect(r.ghost).toEqual([before.arrow[0], -before.arrow[1]])
    expect(r.arrow).toEqual(before.arrow)
    expect(r.angleDeg).toBeCloseTo(before.angleDeg, 12)
    expect(fix(r.success)).toBe('0.125')
    // the ghost is the state the circuit is in: its marked component is the arrow's, reversed
    expect(states(m)[2][5].re).toBeCloseTo(r.ghost![1], 12)
    expect(lines(id)).toContain('Press Mark (U_f). A dashed arrow appears, the mirror image of the first in the across axis. The solid arrow and its chance, 0.125, have not moved.')
  })
})

describe('Q17 Try-it: the two-reflections unit', () => {
  const id = 'q17-two-reflections'
  it('Prepare, Mark (U_f): both mirror lines are drawn, the across axis (U_f) and the line through |w₀⟩ (the rest of the step)', () => {
    const m = bench(id, ['prepare', 'oracle'])
    expect(m.planeState).toMatchObject({ half: 'oracle', mirrors: ['x0perp', 'w0'] })
    expect(plane(m).mirrors.map((x) => x.name)).toEqual(['x0perp', 'w0'])
    expect(plane(m).mirrors[1].angleDeg).toBeCloseTo(V.q17AlphaDeg, 9)
    expect(lines(id)).toContain('Press Prepare, then Mark (U_f). Two mirror lines appear: the across axis, which U_f uses, and the line through |w₀⟩, which the rest of the step uses.')
  })
  it('Diffuse (D): the arrow lands at 62.1° (q17Angle1, the (2k+1)α of the next unit), 41.4° beyond its start at 20.7° (q17TwoAlphaDeg): one turn of 2α', () => {
    const m = bench(id, ['prepare', 'oracle', 'diffuse'])
    const r = plane(m)
    expect(r.k).toBe(1)
    expect(r.angleDeg).toBeCloseTo(V.q17Angle1, 9)
    expect(fix(r.angleDeg, 1)).toBe('62.1')
    expect(r.stepDeg).toBeCloseTo(V.q17TwoAlphaDeg, 9)
    expect(fix(r.stepDeg, 1)).toBe('41.4')
    expect(r.angleDeg - r.alphaDeg).toBeCloseTo(r.stepDeg, 9)
    expect(m.planeState).not.toHaveProperty('half')
    // the circuit is in the same state: the marked bar is sin 62.1°
    expect(states(m)[5][5].re).toBeCloseTo(r.arrow[1], 12)
    expect(m.planeState).toMatchObject({ arcs: ['alpha', 'step'] })
    expect(lines(id)).toContain('Press Diffuse (D), the mirror through |w₀⟩. The arrow lands at 62.1°, 41.4° beyond its start at 20.7°: two mirrors have made one turn of 2α.')
  })
})

describe('Q17 Try-it: the iterate unit', () => {
  const id = 'q17-iterate'
  it('Prepare, then Whole step (Q) once, twice, three times: the chance of |101⟩ reads 0.781, 0.945 and 0.33 (q17P1, q17P2, q17P3)', () => {
    const chances = [1, 2, 3].map((k) => reading(bench(id, ['prepare', ...Array<BenchOp>(k).fill(STEP)]), 'chance'))
    expect(chances).toEqual([V.q17P1, V.q17P2, V.q17P3].map((p) => `chance of 101: ${fix(p)}`))
    expect([V.q17P1, V.q17P2, V.q17P3].map((p) => fix(p))).toEqual(['0.781', '0.945', '0.33'])
    const t = lines(id)
    expect(t).toContain('Press Prepare, then Whole step (Q). The chance of |101⟩ reads 0.781 after one step, and 0.945 after a second.')
    expect(t).toContain('A third step lowers it to 0.33')
  })
  it('after three steps the arrow has turned past straight up: (2k+1)α = 144.9° > 90° (q17Angle3)', () => {
    const r = plane(bench(id, ['prepare', STEP, STEP, STEP]))
    expect(r.angleDeg).toBeCloseTo(V.q17Angle3, 9)
    expect(r.angleDeg).toBeGreaterThan(90)
    expect(lines(id)).toContain('the arrow has turned past straight up')
  })
})

describe('Q17 Try-it: the optimal unit (k*, then n = 4)', () => {
  const id = 'q17-optimal'
  it('for eight strings the readings say k* = 2 with chance 0.945 (q17Kopt8, q17P2); two whole steps reach it', () => {
    expect(reading(bench(id, []), 'kopt')).toBe(`α = 20.7°; best number of steps k* = ${V.q17Kopt8}, chance ${fix(V.q17P2)}`)
    expect(V.q17Kopt8).toBe(2)
    expect(reading(bench(id, ['prepare', STEP, STEP]), 'chance')).toBe(`chance of 101: ${fix(V.q17P2)}`)
    expect(lines(id)).toContain('For eight strings the readings say k* = 2 with chance 0.945. Press Prepare, then Whole step (Q) twice, to reach it.')
  })
  it('at n = 4 (sixteen strings) k* = 3 with chance 0.961, and a fourth step drops the chance to 0.582', () => {
    const k = groverOptimalK(16)
    expect(k).toBe(3)
    expect(reading(bench(id, [], { n: 4 }), 'kopt')).toBe(`α = 14.5°; best number of steps k* = 3, chance ${fix(groverSuccess(16, 1, 3))}`)
    expect(fix(groverSuccess(16, 1, 3))).toBe('0.961')
    const four = bench(id, ['prepare', STEP, STEP, STEP, STEP], { n: 4, marked: 5 })
    expect(reading(four, 'chance')).toBe(`chance of 0101: ${fix(groverSuccess(16, 1, 4))}`)
    expect(fix(groverSuccess(16, 1, 4))).toBe('0.582')
    expect(lines(id)).toContain('Slide n to 4, sixteen strings: k* becomes 3 with chance 0.961, and a fourth step drops the chance to 0.582.')
  })
})
