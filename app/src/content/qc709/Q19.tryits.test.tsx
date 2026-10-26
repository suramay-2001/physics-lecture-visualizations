/**
 * Chapter Q19's Try-it lines against the REAL widgets (existing widgets only, ruling R-Q19 §9.3: no new widget). Each unit's `visual` names a widget and the props it passes; each
 * `tryThis` line quotes what that widget draws. Three checks keep a line true:
 *  1. every prop is one the widget declares (read from its source), the values lie in the controls' ranges, and every control a line tells the reader to use is in the code;
 *  2. every readout a line quotes is what the widget really renders (rendered to markup, or the model the widget draws from) at the start or after exactly the presses the line names;
 *  3. every number a line promises after the reader acts is recomputed here through the engine functions the widget calls and tied to the chapter's own values.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { binomialStd } from '../../physics/random'
import { axisLabel, axisVector } from '../../physics/sg'
import { KET, ketAlong, prob } from '../../physics/spin'
import { fix } from '../../stage/svg/draw'
import BitTable, { COST_RANGE, costModel, fmtCost, stringsModel } from '../../widgets/BitTable'
import bitTableSrc from '../../widgets/BitTable.tsx?raw'
import ComplexPlaneQc, { ROOTS_RANGE, rootsCorners, rootsState, rootsUse } from '../../widgets/ComplexPlaneQc'
import complexPlaneQcSrc from '../../widgets/ComplexPlaneQc.tsx?raw'
import { DepositStats } from '../../widgets/DepositStats'
import depositStatsSrc from '../../widgets/DepositStats.tsx?raw'
import OracleBench from '../../widgets/OracleBench'
import oracleBenchSrc from '../../widgets/OracleBench.tsx?raw'
import { BENCH_OPS, START, applyOp, benchModel, normalizeSetup, type BenchOp, type BenchSetup } from '../../widgets/oracleBenchModel'
import type { Unit } from '../schema'
import { Q19 } from './Q19'
import { V } from './Q19.values'

const unit = (id: string): Unit => Q19.units.find((u) => u.id === id)!
const lines = (id: string): string => unit(id).visual.tryThis.join(' ')
const props = (id: string) => unit(id).visual.props as Record<string, unknown>
const clean = (html: string): string => html.replace(/&amp;/g, '&').replace(/&#x27;/g, "'").replace(/<!--.*?-->/g, '')
const text = (html: string): string => clean(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
const annotations = (html: string): string => (clean(html).match(/<annotation[^>]*>[^<]*/g) ?? []).map((a) => a.replace(/<annotation[^>]*>/, '')).join(' | ')
const declared = (src: string, iface: string): string[] => {
  const body = new RegExp(`export interface ${iface}\\s*\\{([\\s\\S]*?)\\n\\}`).exec(src)?.[1] ?? ''
  return [...body.matchAll(/^\s*(\w+)\??:/gm)].map((m) => m[1])
}
const flip = (s: string, k: number): string => `${s.slice(0, k)}${s[k] === '1' ? '0' : '1'}${s.slice(k + 1)}`
const ones = (s: string): number => [...s].filter((c) => c === '1').length

/** The oracle bench after exactly these presses (an unavailable button throws, so a line cannot be "true" by skipping a step). */
function bench(id: string, ops: BenchOp[]) {
  const setup: BenchSetup = normalizeSetup({ ...props(id) })
  let st = START
  for (const op of ops) {
    const nx = applyOp(setup.mode, st, op)
    if (!nx) throw new Error(`${id}: ${op} is not available at ${JSON.stringify(st)}`)
    st = nx
  }
  return benchModel(setup, st)
}
const reading = (m: ReturnType<typeof benchModel>, key: string): string => m.readings.find((r) => r.key === key)?.text ?? ''

describe('Q19 Try-its: every prop reaches the widget', () => {
  it('each unit names a widget of its own kind and passes only props that widget declares, with values in the controls’ ranges', () => {
    expect(declared(depositStatsSrc, 'DepositStatsProps')).toEqual(['state', 'axis', 'seed'])
    expect(declared(oracleBenchSrc, 'OracleBenchProps')).toEqual(['mode', 'n', 'family', 'a', 'b', 'marked', 's', 'answer', 'x', 'step', 'editable'])
    expect(declared(complexPlaneQcSrc, 'ComplexPlaneQcProps')).toEqual(['mode', 'phi', 'n', 'phases', 'N', 'j'])
    expect(declared(bitTableSrc, 'BitTableProps')).toEqual(['mode', 'gate', 'view', 'a', 'b', 'combine', 'rows', 'n'])
    const kinds = Object.fromEntries(Q19.units.map((u) => [u.id, u.visual.kind]))
    expect(kinds).toEqual({
      'q19-random-walk': 'deposit-stats',
      'q19-scatter': 'oracle-bench',
      'q19-star-search': 'oracle-bench',
      'q19-extra-edge': 'complex-plane',
      'q19-simulation': 'bit-table',
      'q19-qaoa': 'bit-table',
    })
    const allowed: Record<string, string[]> = {
      'deposit-stats': declared(depositStatsSrc, 'DepositStatsProps'),
      'oracle-bench': declared(oracleBenchSrc, 'OracleBenchProps'),
      'complex-plane': ['mode', 'N', 'j'],
      'bit-table': declared(bitTableSrc, 'BitTableProps'),
    }
    for (const u of Q19.units) expect(Object.keys(props(u.id)).filter((k) => !allowed[u.visual.kind].includes(k)), `${u.id}: props the widget ignores`).toEqual([])
    const roots = props('q19-extra-edge') as { N: number; j: number }
    expect(roots.N).toBeGreaterThanOrEqual(ROOTS_RANGE.nMin)
    expect(roots.N).toBeLessThanOrEqual(ROOTS_RANGE.nMax)
    expect(roots.j).toBeGreaterThanOrEqual(ROOTS_RANGE.jMin)
    expect(roots.j).toBeLessThanOrEqual(ROOTS_RANGE.jMax)
    const cost = props('q19-simulation') as { n: number }
    expect(cost.n).toBeGreaterThanOrEqual(COST_RANGE.min)
    expect(cost.n).toBeLessThanOrEqual(COST_RANGE.max)
  })
  it('the oracle bench draws the setup the units name (normalisation changes none of the props): 8 strings, marked item 000', () => {
    for (const id of ['q19-scatter', 'q19-star-search']) {
      const asked = props(id)
      const got = normalizeSetup({ ...asked }) as unknown as Record<string, unknown>
      for (const k of Object.keys(asked)) expect(got[k], `${id}: ${k}`).toBe(asked[k])
      expect(asked).toMatchObject({ mode: 'grover', n: 3, marked: 0 })
    }
  })
  it('the controls the lines name are in the widgets’ code under those labels', () => {
    expect(BENCH_OPS.grover.map((o) => o.label)).toEqual(['Prepare', 'Mark (U_f)', 'Diffuse (D)', 'Whole step (Q)', 'Measure'])
    const bt = text(renderToString(<OracleBench {...props('q19-scatter')} />))
    for (const b of ['Prepare', 'Mark (U_f)', 'Diffuse (D)', 'Whole step (Q)']) expect(bt).toContain(b)
    expect(depositStatsSrc).toContain('{[10, 100, 1000, 10000].map((m) => (')
    expect(depositStatsSrc).toContain('+{m} atoms')
    expect(complexPlaneQcSrc).toContain('label="step (corners per arrow)"')
    expect(bitTableSrc).toContain('label="n (bits of input)"')
    expect(bitTableSrc).toContain("aria-label={`${label}, place ${k + 1}: ${b}`}")
  })
})

describe('Q19 Try-it: the random-walk unit (deposit-stats, +z read along x)', () => {
  const p = prob(ketAlong(axisVector('x')), KET['+z'])
  it('a fair coin: P(+x) = 0.5000 in the formula line, and +100 atoms gives “expected 50.0 ± 5.0”', () => {
    expect(p).toBeCloseTo(0.5, 12)
    expect(axisLabel('x')).toBe('x')
    expect(annotations(renderToString(<DepositStats {...props('q19-random-walk')} />))).toContain('P(+x) = 0.5000')
    expect(`${(100 * p).toFixed(1)} ± ${binomialStd(100, p).toFixed(1)}`).toBe('50.0 ± 5.0')
    expect(depositStatsSrc).toContain('<th>expected</th><td>{(N * p).toFixed(1)} ± {sigma.toFixed(1)}</td>')
    expect(lines('q19-random-walk')).toContain('“expected 50.0 ± 5.0”')
  })
  it('each atom is a step: the position is 2k − 100 and its spread 2 × 5.0 = 10 is the chapter’s square root of 100', () => {
    expect(2 * binomialStd(100, p)).toBeCloseTo(V.q19SigmaClass100, 12)
    expect(lines('q19-random-walk')).toContain('2 × 5.0 = 10, the square root of 100')
  })
  it('S7: after +100 and then +1000 the learner has 1100 atoms, 11 times as many, so the widget’s “ten times more atoms … about three times tighter” note is right (√11 = 3.3)', () => {
    expect(depositStatsSrc).toContain('ten times more atoms only makes it about three times tighter')
    expect(depositStatsSrc).toContain('{[10, 100, 1000, 10000].map((m) => (')
    expect((100 + 1000) / 100).toBe(11)
    expect(Math.sqrt((100 + 1000) / 100)).toBeCloseTo(3.3, 1)
    const l = lines('q19-random-walk')
    expect(l).toContain('Then press +1000, for 1100 atoms in all, about ten times more.')
    expect(l).toContain('ten times more atoms only makes the fraction about three times tighter')
    expect(l).not.toContain('+10000')
  })
})

describe('Q19 Try-it: the scatter unit (oracle bench, grover, n = 3, marked 000)', () => {
  const id = 'q19-scatter'
  it('Prepare, Mark (U_f): the headline “U_f applied”, the bar of |000⟩ flips to −0.354 and its chance still shows 0.125', () => {
    const m = bench(id, ['prepare', 'oracle'])
    expect(m.headline).toBe('U_f applied: the bar of |000⟩ flips to −0.354. Its chance is still 0.125.')
    expect(fix(1 / Math.sqrt(8))).toBe('0.354')
    expect(lines(id)).toContain('The headline reads “U_f applied”: the bar of |000⟩ flips to −0.354, while its chance still shows 0.125.')
  })
  it('Diffuse (D): “every bar reflected about the mean”, whole steps done 1, and the chance of |000⟩ is 0.781 (q19StarP2)', () => {
    const m = bench(id, ['prepare', 'oracle', 'diffuse'])
    expect(m.headline).toBe('D applied: every bar reflected about the mean. Whole steps done: 1. The chance of |000⟩ is 0.781.')
    expect(fix(V.q19StarP2)).toBe('0.781')
    expect(lines(id)).toContain('The headline reads “every bar reflected about the mean”, whole steps done 1, and the chance of |000⟩ is 0.781')
  })
})

describe('Q19 Try-it: the star-search unit (the same bench, whole steps)', () => {
  const id = 'q19-star-search'
  it('Whole step (Q): 0.781 after one whole step (the walk’s step 2, q19StarP2) and 0.945 after a second (step 4, q19StarP4)', () => {
    const one = bench(id, ['prepare', 'step'])
    const two = bench(id, ['prepare', 'step', 'step'])
    expect(reading(one, 'chance')).toBe('chance of 000: 0.781')
    expect(reading(two, 'chance')).toBe('chance of 000: 0.945')
    expect(fix(V.q19StarP2)).toBe('0.781')
    expect(fix(V.q19StarP4)).toBe('0.945')
    expect(lines(id)).toContain('The chance of |000⟩ reads 0.781 after one whole step')
    expect(lines(id)).toContain('The chance reads 0.945, the walk’s chance after four steps')
  })
  it('the line “α = 20.7°; best number of steps k* = 2, chance 0.945” is the bench’s own reading, with the chapter’s exact angle', () => {
    const m = bench(id, ['prepare'])
    expect(reading(m, 'kopt')).toBe('α = 20.7°; best number of steps k* = 2, chance 0.945')
    expect(fix(V.q19Alpha8, 1)).toBe('20.7')
    expect(lines(id)).toContain('“α = 20.7°; best number of steps k* = 2, chance 0.945”')
  })
})

describe('Q19 Try-it: the extra-edge unit (complex-plane roots, N = 6, j = 1)', () => {
  it('six arrows 60° apart close into a hexagon, and the note reads “corners used: 6 of 6, each 1 time”', () => {
    const st = rootsState(6, 1)
    expect(st.spokes?.phasesDeg).toEqual([0, 60, 120, 180, 240, 300])
    expect(rootsUse(6, 1)).toEqual({ corners: 6, each: 1 })
    const t = text(renderToString(<ComplexPlaneQc mode="roots" N={6} j={1} />))
    expect(t).toContain('corners used: 6 of 6, each 1 time')
    expect(lines('q19-extra-edge')).toContain('“corners used: 6 of 6, each 1 time”')
  })
  it('the sixth roots contain the zero-order roots of the unit: −1 (180°) and e^{±iπ/3} (60° and 300°)', () => {
    const phases = rootsState(6, 1).spokes!.phasesDeg
    for (const a of [60, 180, 300]) expect(phases).toContain(a)
  })
  it('step 3: “corners used: 2 of 6, each 3 times”, because the cube of a sixth root takes only +1 and −1', () => {
    expect(rootsUse(6, 3)).toEqual({ corners: 2, each: 3 })
    const t = text(renderToString(<ComplexPlaneQc mode="roots" N={6} j={3} />))
    expect(t).toContain('corners used: 2 of 6, each 3 times')
    expect(rootsCorners(6, 3)).toEqual([0, 3, 0, 3, 0, 3])
    const values = new Set(rootsCorners(6, 3).map((c) => Math.round(Math.cos((2 * Math.PI * c) / 6))))
    expect([...values].sort()).toEqual([-1, 1])
    expect(lines('q19-extra-edge')).toContain('“corners used: 2 of 6, each 3 times”')
  })
})

describe('Q19 Try-it: the simulation unit (bit-table cost, n = 50)', () => {
  it('at n = 50 the readout gives n² = 2500 and 2ⁿ = 1.1 × 10¹⁵ (the chapter’s q19Amps50 is 1.126 × 10¹⁵)', () => {
    const m = costModel({ n: 50, vs: 'nSquared' })
    expect(m.costs.sq).toBe(2500)
    expect(fmtCost(m.costs.sq)).toBe('2500')
    expect(fmtCost(m.costs.exp)).toBe('1.1 × 10¹⁵')
    expect(m.costs.exp / 1e15).toBeCloseTo(V.q19Amps50, 12)
    const t = text(renderToString(<BitTable {...props('q19-simulation')} />))
    expect(t).toContain('n = 50: n² = 2500, 2ⁿ = 1.1 × 10¹⁵')
    expect(lines('q19-simulation')).toContain('n² = 2500 and 2ⁿ = 1.1 × 10¹⁵')
  })
  it('sliding n to 10 and to 30 opens the gap (n² = 100 against 2ⁿ = 1024, then 900 against 1 073 741 824)', () => {
    expect(costModel({ n: 10, vs: 'nSquared' }).costs).toMatchObject({ sq: 100, exp: 1024 })
    expect(fmtCost(costModel({ n: 30, vs: 'nSquared' }).costs.exp).replace(/ /g, ' ')).toBe('1 073 741 824')
    expect(costModel({ n: 30, vs: 'nSquared' }).costs.sq).toBe(900)
    expect(lines('q19-simulation')).toContain('Slide n to 10 and then to 30')
  })
})

describe('Q19 Try-it: the QAOA unit (bit-table strings, 0101 and 1010)', () => {
  const p = props('q19-qaoa') as { a: string; b: string; combine: 'xor' | 'dot' }
  it('the note reads “a ⊕ b = 1111”: four ones, the cut of 0101 on the square (q19MaxCut)', () => {
    const m = stringsModel(p)
    expect(m.xor).toBe('1111')
    expect(ones(m.xor)).toBe(V.q19MaxCut)
    expect(text(renderToString(<BitTable {...props('q19-qaoa')} />))).toContain('a ⊕ b = 1111')
    expect(lines('q19-qaoa')).toContain('“a ⊕ b = 1111”')
  })
  it('the second string is the first moved one place round the ring, so each 1 of the XOR is a cut side', () => {
    expect(p.b).toBe(`${p.a.slice(1)}${p.a[0]}`)
  })
  it('flipping places 2 and 3 of a gives 0011 and places 1 and 2 of b gives 0110; the note then reads “a ⊕ b = 0101”, two ones, the cut of 0011 (q19Cut0011)', () => {
    const a = flip(flip(p.a, 1), 2)
    const b = flip(flip(p.b, 0), 1)
    expect([a, b]).toEqual(['0011', '0110'])
    const m = stringsModel({ a, b, combine: p.combine })
    expect(m.xor).toBe('0101')
    expect(ones(m.xor)).toBe(V.q19Cut0011)
    expect(lines('q19-qaoa')).toContain('“a ⊕ b = 0101”')
  })
})

/** S6: a Try-it line is read aloud like any other 709 sentence, so each sentence keeps the Ground-up cap (25 words; Q16 to Q18 stay at 25). Words are runs holding a letter or digit, as in symbols.test.ts. */
const tryWords = (sentence: string): number => sentence.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length
const trySentences = (line: string): string[] =>
  line
    .split(/(?<=[.!?])["”’)]*\s+/)
    .map((x) => x.trim())
    .filter(Boolean)

describe('Q19 Try-it lines keep the sentence cap (S6)', () => {
  it('every sentence of every Try-it line, in all six units, has at most 25 words', () => {
    const long = Q19.units.flatMap((u) => u.visual.tryThis.flatMap((line, i) => trySentences(line).map((s) => ({ at: `${u.id}[${i}]`, words: tryWords(s), s })).filter((x) => x.words > 25)))
    expect(long).toEqual([])
  })
  it('the guard sees the sentences (not vacuous): each unit has two lines and the longest sentence is 20 words or more', () => {
    expect(Q19.units.map((u) => u.visual.tryThis.length)).toEqual([2, 2, 2, 2, 2, 2])
    const longest = Math.max(...Q19.units.flatMap((u) => u.visual.tryThis.flatMap((line) => trySentences(line).map(tryWords))))
    expect(longest).toBeGreaterThanOrEqual(20)
    expect(longest).toBeLessThanOrEqual(25)
  })
})
