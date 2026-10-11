/**
 * Chapter Q16's Try-it lines against the REAL widget. Every unit's `visual` is now the oracle bench (rulings qc709-deferred-features D1 replaced the one-qubit stand-ins
 * of qc709-Q15Q17 R5). Each unit's `visual` names the widget and the props it passes; each `tryThis` line says what to press and quotes what the bench then reads. Three
 * checks keep a line true:
 *  1. every prop is one the widget declares (its own `OracleBenchProps`, read from its source) and survives the widget's normalisation unchanged;
 *  2. every button, choice and slider a line names is in the widget's markup under that label;
 *  3. every reading a line quotes is what the bench's model returns after exactly the presses the line names (the model reads the engine: oracles.ts, runCircuit), and the
 *     number is the chapter's own engine value (Q16.values: q16MinusCount, q16HHBack, q16DjBalnZero, q16DjConstAmp, q16DetWorst3, q16BvAmp, q16BvP, q16BvClassical).
 * The buttons themselves are exercised by the e2e spec (e2e/oracle-bench.spec.ts), which presses them and reads what the page draws.
 */
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { runCircuit } from '../../physics/qc/circuit'
import { djDeterministicWorst, hadamardColumn } from '../../physics/qc/oracles'
import { fix } from '../../stage/svg/draw'
import OracleBench from '../../widgets/OracleBench'
import oracleBenchSrc from '../../widgets/OracleBench.tsx?raw'
import { BENCH_OPS, START, applyOp, benchModel, normalizeSetup, type BenchOp, type BenchSetup } from '../../widgets/oracleBenchModel'
import type { Unit } from '../schema'
import { Q16 } from './Q16'
import { V } from './Q16.values'

const unit = (id: string): Unit => Q16.units.find((u) => u.id === id)!
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

const declared = (src: string, iface: string): string[] => {
  const body = new RegExp(`export interface ${iface}\\s*\\{([\\s\\S]*?)\\n\\}`).exec(src)?.[1] ?? ''
  return [...body.matchAll(/^\s*(\w+)\??:/gm)].map((m) => m[1])
}
const THREE = ['prepare', 'oracle', 'final'] as const

describe('Q16 Try-its: every prop reaches the widget', () => {
  it.each(Q16.units.map((u) => [u.id, u] as const))('%s: its visual is the oracle bench and passes only props the widget declares', (_, u) => {
    expect(u.visual.kind).toBe('oracle-bench')
    expect(Object.keys(u.visual.props ?? {}).filter((k) => !declared(oracleBenchSrc, 'OracleBenchProps').includes(k)), `${u.id}: props the widget ignores`).toEqual([])
  })
  it('reads the declared props of the widget', () => {
    expect(declared(oracleBenchSrc, 'OracleBenchProps')).toEqual(['mode', 'n', 'family', 'a', 'b', 'marked', 's', 'answer', 'x', 'step', 'editable'])
  })
  it.each(Q16.units.map((u) => [u.id] as const))('%s: the widget draws what the unit names (normalisation changes none of the props)', (id) => {
    const asked = props(id) as Record<string, unknown>
    const got = setupOf(id) as unknown as Record<string, unknown>
    for (const k of Object.keys(asked)) expect(got[k], `${id}: ${k}`).toBe(asked[k])
  })
})

describe('Q16 Try-it: the Hadamard unit (hadamard, n = 3, x = 101)', () => {
  const id = 'q16-hadamard-n'
  it('Hadamards: eight bars of size 0.354 with the signs of H⊗³|101⟩, four below the axis (q16MinusCount)', () => {
    const m = bench(id, ['hadamard'])
    const psi = runCircuit(m.circuit).states[1]
    // the bars ARE the engine's closed form 2^{−n/2}(−1)^{x·z} for x = 101
    hadamardColumn(5, 3).forEach((v, z) => expect(psi[z].re).toBeCloseTo(v, 12))
    expect(psi.every((z) => fix(Math.abs(z.re)) === '0.354')).toBe(true)
    expect(psi.filter((z) => z.re < 0)).toHaveLength(V.q16MinusCount)
    expect(reading(m, 'signs')).toBe(`bars below the axis: ${V.q16MinusCount} of 8`)
    expect(reading(m, 'size')).toBe('size of each bar after one column: 0.354')
    expect(m.headline).toBe('One column of Hadamards: 8 bars of size 0.354, 4 pointing up and 4 pointing down.')
    expect(lines(id)).toContain('Press Hadamards. The eight bars are the signs of H⊗³|101⟩: four stand above the axis, four hang below, each of size 0.354.')
  })
  it('Hadamards again: all the weight lands on |101⟩ with amplitude 1 (q16HHBack: two columns give back the string)', () => {
    const m = bench(id, ['hadamard', 'again'])
    expect(reading(m, 'amp')).toBe('amplitude of |101⟩: 1')
    expect(reading(m, 'chance')).toBe('chance of 101: 1')
    expect(m.headline).toBe('Hadamards again: all the weight is back on |101⟩, with amplitude 1.')
    expect(V.q16HHBack).toBeCloseTo(1, 12)
    expect(lines(id)).toContain('Press Hadamards again. All the weight lands on |101⟩, with amplitude 1: two columns of Hadamards give back the string you began with.')
  })
  it('the buttons the lines name are in the widget, and nothing of a later unit is: no function, no cost line, no algorithm name, no oracle', () => {
    const h = html(id)
    const t = text(h)
    for (const b of ['Hadamards', 'Hadamards again']) expect(t).toContain(b)
    expect(BENCH_OPS.hadamard.map((o) => o.label)).toEqual(['Hadamards', 'Hadamards again'])
    expect(h).toContain('role="radio" aria-checked="true"')
    expect(t).toContain('Hadamard signs')
    for (const later of ['Bernstein', 'Vazirani', 'Deutsch', 'Grover', 'Simon', 'a·x', '⊕', 'O_f', 'U_f', 'classical', 'Prepare', 'Final Hadamards', 'Hidden string', 'f(x)'])
      expect(t, `unit 1 shows “${later}”, which a later unit introduces`).not.toContain(later)
    expect(t, 'unit 1 names an oracle, which unit 2 introduces').not.toMatch(/oracle/i)
    expect(t).toContain('Hadamard bench')
    // the setting offered is the starting string x, and the Algorithm choice offers only Hadamard signs
    expect(h.match(/role="radio"/g)).toHaveLength(1)
    expect(h).toContain('aria-label="Starting string x, bit 1 of 3: 1"')
    expect(reading(bench(id, []), 'x')).toBe('starting string x = 101')
    expect(benchModel(setupOf(id), START).readings.map((r) => r.key)).toEqual(['x'])
  })
})

describe('Q16 Try-it: the Deutsch–Jozsa unit (dj, n = 3, the balanced step function)', () => {
  const id = 'q16-dj'
  it('Prepare, Oracle, Final Hadamards on the balanced f: the amplitude of |000⟩ reads 0 and all zeros has chance 0 (q16DjBalnZero)', () => {
    const m = bench(id, [...THREE])
    expect(reading(m, 'amp0')).toBe('amplitude of |000⟩: 0')
    expect(reading(m, 'p0')).toBe(`chance of all zeros: ${fix(V.q16DjBalnZero)}`)
    expect(V.q16DjBalnZero).toBe(0)
    expect(lines(id)).toContain('Press Prepare, Oracle and Final Hadamards. This f is balanced: the amplitude of |000⟩ reads 0, so the chance of all zeros is 0.')
  })
  it('“constant” and “f = 1”, then the three steps: the amplitude of |000⟩ reads −1 (q16DjConstAmp) and all zeros has chance 1', () => {
    const m = bench(id, [...THREE], { family: 'constant', b: 1 })
    expect(reading(m, 'amp0')).toBe(`amplitude of |000⟩: ${fix(V.q16DjConstAmp)}`)
    expect(V.q16DjConstAmp).toBeCloseTo(-1, 12)
    expect(reading(m, 'p0')).toBe('chance of all zeros: 1')
    expect(lines(id)).toContain('Choose “constant” and “f = 1”, then run the three steps again. The amplitude of |000⟩ now reads −1, and all zeros has chance 1.')
  })
  it('the choices the line names are in the widget: the function choice offers “constant”, and then “f = 1”', () => {
    const balanced = html(id)
    expect(balanced).toContain('aria-label="Function f"')
    expect(balanced).toContain('>constant</button>')
    const constant = html(id, { family: 'constant' })
    expect(constant).toContain('>f = 1</button>')
    expect(constant).toContain('>f = 0</button>')
    expect(oracleBenchSrc).toContain("{ value: '1', label: 'f = 1' }")
  })
})

describe('Q16 Try-it: the classical-cost unit (dj, n = 3: the cost line, then n = 4)', () => {
  const id = 'q16-classical-cost'
  it('the cost line reads 1 oracle call in the circuit and 5 for a classical computer at n = 3 (q16DetWorst3), 9 at n = 4, and the circuit calls the oracle once at both', () => {
    const three = reading(bench(id, []), 'cost')
    const four = reading(bench(id, [], { n: 4 }), 'cost')
    expect(three).toBe(`oracle calls: 1 in this circuit, ${V.q16DetWorst3} for a classical computer that must be sure`)
    expect(V.q16DetWorst3).toBe(5)
    expect(four).toBe(`oracle calls: 1 in this circuit, ${djDeterministicWorst(4)} for a classical computer that must be sure`)
    expect(djDeterministicWorst(4)).toBe(9)
    const t = lines(id)
    expect(t).toContain('The cost line under the buttons reads: 1 oracle call in the circuit, 5 for a classical computer that must be sure at n = 3.')
    expect(t).toContain('Slide n to 4: the classical count becomes 9, and the circuit still calls the oracle once.')
  })
  it('all four steps at n = 4: one call decides — all zeros has chance 0, so f is balanced', () => {
    const m = bench(id, [...THREE, 'measure'], { n: 4 })
    expect(reading(m, 'verdict')).toBe('reading: all zeros has chance 0, so f is balanced')
    expect(lines(id)).toContain('Press all four steps: that one call decides.')
  })
  it('the slider the line names is in the widget and reaches n = 4', () => {
    expect(text(html(id))).toContain('wires n')
    expect(oracleBenchSrc).toContain('label="wires n"')
    expect(normalizeSetup({ mode: 'dj', n: 4 }).n).toBe(4)
  })
})

describe('Q16 Try-it: the Bernstein–Vazirani unit (bv, n = 4, a = 1011, b = 1)', () => {
  const id = 'q16-bv'
  it('Prepare, Oracle, Final Hadamards: a = 1011 is read with chance 1 (q16BvP) and the amplitude on |1011⟩ is −1 (q16BvAmp)', () => {
    const m = bench(id, [...THREE])
    expect(reading(m, 'readoff')).toBe(`read-off a = 1011, chance ${fix(V.q16BvP)}`)
    expect(reading(m, 'amp')).toBe(`amplitude of |1011⟩: ${fix(V.q16BvAmp)}`)
    expect(V.q16BvP).toBeCloseTo(1, 12)
    expect(V.q16BvAmp).toBeCloseTo(-1, 12)
    expect(lines(id)).toContain('Press Prepare, Oracle and Final Hadamards. One run reads a = 1011 with chance 1, and the amplitude on |1011⟩ is −1.')
  })
  it('“b = 0” and run again: the same string 1011, amplitude 1 — b only sets a sign', () => {
    const m = bench(id, [...THREE], { b: 0 })
    expect(reading(m, 'readoff')).toBe('read-off a = 1011, chance 1')
    expect(reading(m, 'amp')).toBe('amplitude of |1011⟩: 1')
    expect(reading(m, 'b')).toBe('the bit b is only the sign of that amplitude')
    expect(lines(id)).toContain('Switch to “b = 0” and run again: the same string 1011 is read, now with amplitude 1. The bit b only sets a sign, which no reading can see.')
    expect(html(id)).toContain('>b = 0</button>')
  })
  it('the cost line counts 1 oracle call and 5 classical queries (q16BvClassical)', () => {
    expect(reading(bench(id, []), 'cost')).toBe(`oracle calls: 1 in this circuit, ${V.q16BvClassical} classical`)
    expect(V.q16BvClassical).toBe(5)
    expect(lines(id)).toContain('The cost line counts 1 oracle call in the circuit and 5 classical queries.')
  })
})
