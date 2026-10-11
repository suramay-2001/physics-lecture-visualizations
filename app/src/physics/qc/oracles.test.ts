/**
 * qc/oracles.ts against numpy (pipeline/make_oracles_fixtures.py → __fixtures__/qc-oracles.json: explicit dense matrices for both circuit forms,
 * parities from strings of bits, a frozenset minimax, exact Fractions over every balanced function and every k-subset, a brute-force search for
 * the (a, b) that fits Bergou's n + 1 answers), plus property tests: the circuits equal the closed forms, the two circuit forms agree, constant
 * and balanced functions land where the promise says, every Bernstein–Vazirani pair returns (−1)^b|a⟩, and 2^{n−1} + 1 is the exact minimax.
 */
import { describe, expect, it } from 'vitest'
import raw from '../__fixtures__/qc-oracles.json?raw'
import { abs2, c } from '../complex'
import { type Vec, isUnitary } from '../linalg'
import { walshHadamard } from './gates'
import { type Bit, dotMod2, isBalanced, isConstant } from './bits'
import { circuitUnitary, runCircuit } from './circuit'
import {
  DJ_FAMILIES,
  balancedStepTable,
  balancedTables,
  bvCircuit,
  bvClassicalRun,
  bvTable,
  djCircuit,
  djDeterministicWorst,
  djFamilyTable,
  djMinimaxQueries,
  djOutputAmplitude,
  djRandomMiss,
  djVerdict,
  dotOddCount,
  hadamardColumn,
  hadamardRun,
  mostLikelyString,
  onesCount,
  queryCircuit,
  signMean,
  walshSum,
} from './oracles'
import { meanAmplitude } from './state'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FX: any = JSON.parse(raw)
const close = (a: number, b: number, eps = 1e-12) => expect(Math.abs(a - b), `${a} ≈ ${b}`).toBeLessThan(eps)
const cv = (v: [number, number][]): Vec => v.map(([re, im]) => c(re, im))
const vecGap = (a: Vec, b: Vec): number => (a.length !== b.length ? Infinity : Math.max(0, ...a.map((x, i) => Math.hypot(x.re - b[i].re, x.im - b[i].im))))
const last = (circ: Parameters<typeof runCircuit>[0]): Vec => runCircuit(circ).states.at(-1)!
const F_BALN: Bit[] = [0, 1, 1, 1, 1, 0, 0, 0]
const F_BAL = bvTable(0b101, 0, 3)
const tableOfMask = (m: number, N: number): Bit[] => Array.from({ length: N }, (_, x) => ((m >> x) & 1) as Bit)

describe('walshSum and the sign formula (Eqs. 7.1–7.2, 7.10–7.11)', () => {
  it('Σ_x (−1)^{x·z} = 2ⁿ at z = 0 and 0 elsewhere, against the dense Kronecker product', () => {
    for (const k of FX.walsh.cases) {
      for (let z = 0; z < 2 ** k.n; z++) {
        close(walshSum(z, k.n), k.sums[z], 1e-12)
        close(walshSum(z, k.n), z === 0 ? 2 ** k.n : 0, 1e-12)
      }
    }
  })
  it('the running examples: z = 010 sums to 0 and z = 000 to 8 for n = 3', () => {
    expect(walshSum(0b010, 3)).toBe(0)
    expect(walshSum(0, 3)).toBe(8)
  })
  it('x·z = 1 for exactly 2ⁿ⁻¹ strings when x ≠ 0, and for none when x = 0; for x = 101 the four are 001, 011, 100, 110', () => {
    for (const k of FX.walsh.cases) for (let x = 0; x < 2 ** k.n; x++) expect(dotOddCount(x, k.n), `n=${k.n} x=${x}`).toBe(k.oddCount[String(x)])
    for (let n = 1; n <= 5; n++) {
      expect(dotOddCount(0, n)).toBe(0)
      for (let x = 1; x < 2 ** n; x++) expect(dotOddCount(x, n)).toBe(2 ** (n - 1))
    }
    expect([...Array(8).keys()].filter((z) => dotMod2(0b101, z)).map((z) => z.toString(2).padStart(3, '0'))).toEqual(['001', '011', '100', '110'])
  })
  it('hadamardColumn is the column x of H^{⊗3} (dense numpy) and of the engine’s walshHadamard', () => {
    const W = walshHadamard(3)
    for (let x = 0; x < 8; x++) {
      expect(vecGap(hadamardColumn(x, 3).map((v) => c(v)), cv(FX.walsh.columns3[x]))).toBeLessThan(1e-12)
      expect(vecGap(hadamardColumn(x, 3).map((v) => c(v)), W.map((row) => row[x]))).toBeLessThan(1e-12)
    }
  })
  it('H⊗H|11⟩ = ½(|00⟩ − |01⟩ − |10⟩ + |11⟩), and H|1⟩ has bars +0.7071 and −0.7071', () => {
    const two = last(hadamardRun(0b11, 2))
    expect(two.map((z) => z.re)).toEqual([0.5, -0.5, -0.5, 0.5].map((v) => expect.closeTo(v, 12)))
    const one = last(hadamardRun(1, 1))
    close(one[0].re, Math.SQRT1_2)
    close(one[1].re, -Math.SQRT1_2)
  })
  it('two columns of Hadamards return |x⟩ (numpy: (H^{⊗n})² = I) and the circuit agrees for every x, n ≤ 4', () => {
    for (const g of FX.walsh.twiceGap) expect(g).toBeLessThan(1e-12)
    for (let n = 1; n <= 4; n++)
      for (let x = 0; x < 2 ** n; x++) {
        const out = last(hadamardRun(x, n, true))
        close(abs2(out[x]), 1)
        close(Math.max(...out.map((z, i) => (i === x ? 0 : abs2(z)))), 0)
      }
  })
  it('the circuit of H^{⊗n} on |x⟩ is the closed form for every x, n ≤ 4, and the mean amplitude is 0 for x ≠ 0', () => {
    for (let n = 1; n <= 4; n++)
      for (let x = 0; x < 2 ** n; x++) {
        const out = last(hadamardRun(x, n))
        expect(vecGap(out, hadamardColumn(x, n).map((v) => c(v)))).toBeLessThan(1e-12)
        close(meanAmplitude(out).re, x === 0 ? 2 ** (-n / 2) : 0)
      }
  })
})

describe('bvTable and the function families', () => {
  it('a = 101, b = 0 on three bits is [0,1,0,1,1,0,1,0], and b = 1 flips every entry', () => {
    expect(F_BAL).toEqual([0, 1, 0, 1, 1, 0, 1, 0])
    expect(bvTable(0b101, 1, 3)).toEqual(F_BAL.map((v) => 1 - v))
  })
  it('matches numpy for all 62 pairs (a, b) of n = 1 … 4 and the table is balanced exactly when a ≠ 0', () => {
    for (const k of FX.bv.cases) {
      expect(bvTable(k.a, k.b, k.n), `n=${k.n} a=${k.a} b=${k.b}`).toEqual(k.table)
      expect(isBalanced(bvTable(k.a, k.b, k.n))).toBe(k.a !== 0)
      expect(k.balanced).toBe(k.a !== 0 ? 1 : 0)
      expect(djVerdict(bvTable(k.a, k.b, k.n))).toBe(k.a === 0 ? 'constant' : 'balanced')
    }
  })
  it('balancedTables(n) lists C(2ⁿ, 2ⁿ⁻¹) distinct balanced tables: 2, 6, 70, 12870', () => {
    expect([1, 2, 3, 4].map((n) => balancedTables(n).length)).toEqual([2, 6, 70, 12870])
    expect(new Set(balancedTables(3).map((t) => t.join(''))).size).toBe(70)
    expect(balancedTables(3).every(isBalanced)).toBe(true)
    expect(balancedTables(3).some((t) => t.join('') === F_BALN.join(''))).toBe(true)
  })
  it('F_BALN is balanced and not linear: no (a, b) of three bits gives its table', () => {
    expect(isBalanced(F_BALN)).toBe(true)
    for (let a = 0; a < 8; a++) for (const b of [0, 1] as const) expect(bvTable(a, b, 3)).not.toEqual(F_BALN)
  })
  it('djVerdict names the promise', () => {
    expect(djVerdict([1, 1, 1, 1])).toBe('constant')
    expect(djVerdict([0, 1, 1, 0])).toBe('balanced')
    expect(djVerdict([0, 0, 0, 1])).toBe('neither')
  })
})

describe('Deutsch–Jozsa: both circuit forms against numpy', () => {
  it('the running functions: output of the phase form and of Bergou’s ancilla form equal the dense-matrix state', () => {
    for (const [name, k] of Object.entries(FX.dj) as [string, { table: Bit[]; phase: [number, number][]; ancilla: [number, number][] }][]) {
      if (!k.table) continue
      expect(vecGap(last(djCircuit(k.table, 'phase')), cv(k.phase)), `${name} phase`).toBeLessThan(1e-12)
      expect(vecGap(last(djCircuit(k.table, 'ancilla')), cv(k.ancilla)), `${name} ancilla`).toBeLessThan(1e-12)
    }
  })
  it('F_BALN: after the query the eight bars are ±0.3536 with four minus signs and mean 0; the output has chance 0 on 000 and 0.25 on 100–111', () => {
    const run = runCircuit(djCircuit(F_BALN, 'phase')).states
    run[2].forEach((z, x) => close(z.re, F_BALN[x] ? -1 / Math.sqrt(8) : 1 / Math.sqrt(8)))
    close(meanAmplitude(run[2]).re, 0)
    close(abs2(run[3][0]), 0)
    ;[4, 5, 6, 7].forEach((z) => close(abs2(run[3][z]), 0.25))
    ;[0, 1, 2, 3].forEach((z) => close(abs2(run[3][z]), 0))
    close(run[3][4].re, -0.5)
  })
  it('a constant f lands on |0…0⟩ with amplitude (−1)^{f(0)}; f ≡ 1 gives −1 and the mean of the signs is −1', () => {
    const one = last(djCircuit([1, 1, 1, 1, 1, 1, 1, 1], 'phase'))
    close(one[0].re, -1)
    close(abs2(one[0]), 1)
    const zero = last(djCircuit([0, 0, 0, 0, 0, 0, 0, 0], 'phase'))
    close(zero[0].re, 1)
    close(signMean([1, 1, 1, 1]), -1)
    close(signMean([0, 1, 1, 0]), 0)
  })
  it('F_BAL = x·101 lands on |101⟩ with chance 1 (its signs are those of H^{⊗3}|101⟩)', () => {
    const out = last(djCircuit(F_BAL, 'phase'))
    close(abs2(out[0b101]), 1)
    const mid = runCircuit(djCircuit(F_BAL, 'phase')).states[2]
    expect(vecGap(mid, hadamardColumn(0b101, 3).map((v) => c(v)))).toBeLessThan(1e-12)
  })
  it('every balanced table on 2 and 3 bits: the phase-form output equals the dense state and has amplitude 0 on 000 (Eq. 7.7)', () => {
    for (const k of FX.dj.balanced3) {
      const out = last(djCircuit(k.table, 'phase'))
      expect(vecGap(out, cv(k.phase))).toBeLessThan(1e-12)
      close(abs2(out[0]), 0)
    }
    for (const k of FX.dj.balanced2) {
      const out = last(djCircuit(k.table, 'phase'))
      expect(vecGap(out, cv(k.phase))).toBeLessThan(1e-12)
      close(abs2(out[0]), 0)
    }
    expect(FX.dj.balanced3.length).toBe(70)
  })
  it('all 12870 balanced tables on 4 bits have output amplitude 0 on 0000 (closed form and numpy), and a sample runs through the circuit', () => {
    expect(FX.dj.balanced4MaxZeroAmp).toBeLessThan(1e-12)
    const all = balancedTables(4)
    expect(all.length).toBe(12870)
    for (const t of all) expect(Math.abs(djOutputAmplitude(t))).toBeLessThan(1e-12)
    for (let i = 0; i < all.length; i += 997) close(abs2(last(djCircuit(all[i], 'phase'))[0]), 0)
  })
  it('Eq. 7.7 (the closed form) equals the circuit’s all-zeros amplitude for all 256 tables on three bits, in the phase and ancilla forms', () => {
    for (let m = 0; m < 256; m++) {
      const t = tableOfMask(m, 8)
      close(djOutputAmplitude(t), FX.dj.allTables3Zero[m])
      close(last(djCircuit(t, 'phase'))[0].re, djOutputAmplitude(t))
    }
  })
  it('the two forms agree: the ancilla form ends in (phase-form output) ⊗ |−⟩ for every table on three bits (kickback)', () => {
    const s = Math.SQRT1_2
    for (let m = 0; m < 256; m++) {
      const t = tableOfMask(m, 8)
      const ph = last(djCircuit(t, 'phase'))
      const an = last(djCircuit(t, 'ancilla'))
      const want: Vec = ph.flatMap((z) => [c(z.re * s, z.im * s), c(-z.re * s, -z.im * s)])
      expect(vecGap(an, want), `mask ${m}`).toBeLessThan(1e-12)
    }
  })
  it('the output amplitude at any z is 2^{−n}Σ(−1)^{f(x)+x·z}: Bernstein–Vazirani’s Eq. 7.12 is its special case', () => {
    const out = last(djCircuit(F_BALN, 'phase'))
    for (let z = 0; z < 8; z++) close(out[z].re, djOutputAmplitude(F_BALN, z))
  })
  it('both circuits are unitary matrices, with the cursor columns [H], [oracle], [H] and the target in |−⟩', () => {
    for (const form of ['phase', 'ancilla'] as const) {
      const C = djCircuit(F_BALN, form)
      expect(isUnitary(circuitUnitary(C))).toBe(true)
      expect(C.columns.length).toBe(3)
      expect(C.qubits).toBe(form === 'phase' ? 3 : 4)
      expect(C.init).toBe(form === 'phase' ? '000' : '000-')
    }
    expect(djCircuit(F_BALN, 'ancilla').wires).toEqual(['x₂', 'x₁', 'x₀', 'y'])
  })
  it('rejects bad inputs', () => {
    expect(() => djCircuit([0, 1, 1], 'phase')).toThrow()
    expect(() => djCircuit(new Array(32).fill(0), 'phase')).toThrow()
    expect(() => hadamardRun(8, 3)).toThrow()
    expect(() => walshSum(8, 3)).toThrow()
    expect(() => bvTable(16, 0, 4)).toThrow()
    expect(() => bvTable(1, 2, 3)).toThrow()
  })
})

describe('Bernstein–Vazirani (Eqs. 7.8–7.12)', () => {
  it('every pair (a, b) for n = 1 … 4 returns exactly (−1)^b|a⟩, as the dense numpy circuit does', () => {
    for (const k of FX.bv.cases) {
      const out = last(bvCircuit(k.a, k.b, k.n))
      expect(vecGap(out, out.map((_, i) => (i === k.a ? c(k.b ? -1 : 1) : c(0))))).toBeLessThan(1e-12)
      expect(k.outIndex).toBe(k.a)
      close(k.outAmp[0], k.b ? -1 : 1)
    }
  })
  it('the running example: a = 1011, b = 1 gives one bar of amplitude −1 on |1011⟩; before the last Hadamards sixteen bars of size 0.25', () => {
    const states = runCircuit(bvCircuit(0b1011, 1, 4)).states
    close(states[3][0b1011].re, -1)
    close(abs2(states[3][0b1011]), 1)
    states[2].forEach((z) => close(Math.abs(z.re), 0.25))
    for (let i = 0; i < 16; i++) close(states[2][i].re, FX.bv.preAmps[i][0])
    close(meanAmplitude(states[2]).re, 0)
    // the signs are those of H^{⊗4}|1011⟩ times (−1)^b
    expect(vecGap(states[2], hadamardColumn(0b1011, 4).map((v) => c(-v)))).toBeLessThan(1e-12)
  })
  it('b is a global sign: b = 0 and b = 1 give the same chances (and the same state up to −1)', () => {
    for (let n = 1; n <= 4; n++)
      for (let a = 0; a < 2 ** n; a++) {
        const p0 = last(bvCircuit(a, 0, n)).map(abs2)
        const p1 = last(bvCircuit(a, 1, n)).map(abs2)
        p0.forEach((p, i) => close(p, p1[i]))
      }
  })
  it('BV functions with a ≠ 0 are balanced, so Deutsch–Jozsa’s output is non-zero exactly then (all 32 pairs of n = 4)', () => {
    let count = 0
    for (let a = 0; a < 16; a++)
      for (const b of [0, 1] as const) {
        const t = bvTable(a, b, 4)
        expect(isBalanced(t)).toBe(a !== 0)
        expect(isConstant(t)).toBe(a === 0)
        expect(abs2(last(bvCircuit(a, b, 4))[0]) > 0.5).toBe(a === 0)
        count++
      }
    expect(count).toBe(32)
  })
  it('Bergou’s classical method asks 00…0 then each single-1 string: n + 1 queries, and exactly one (a, b) fits the answers (numpy search)', () => {
    for (const k of FX.bvClassical) {
      const run = bvClassicalRun(bvTable(k.a, k.b, k.n), k.n)
      expect(run.asked).toEqual(k.asked)
      expect(run.asked.length).toBe(k.n + 1)
      expect(k.count).toBe(k.n + 1)
      expect(k.fits).toEqual([[k.a, k.b]])
      expect([run.a, run.b]).toEqual([k.a, k.b])
    }
    expect(bvClassicalRun(bvTable(0b1011, 1, 4), 4).asked.length).toBe(5)
  })
  it('the method refuses a table that is not a·x ⊕ b', () => {
    expect(() => bvClassicalRun(F_BALN, 3)).toThrow()
    expect(() => bvClassicalRun([0, 1], 2)).toThrow()
  })
})

describe('one classical query (the f-CNOT alone)', () => {
  it('on |x⟩|0⟩ the target ends as f(x), for every x, as numpy’s permutation matrix says; the inputs are untouched', () => {
    for (const k of FX.query) {
      const out = last(queryCircuit(F_BALN, k.x))
      const idx = out.findIndex((z) => abs2(z) > 0.5)
      expect(idx).toBe(k.index)
      expect(idx % 2).toBe(F_BALN[k.x])
      expect(idx >> 1).toBe(k.x)
    }
    expect(last(queryCircuit(F_BALN, 0b011))[0b0111].re).toBe(1)
    expect(last(queryCircuit(F_BALN, 0b110))[0b1100].re).toBe(1)
  })
  it('the BV oracle on four bits needs five wires, and a classical query of 1000 returns a·x ⊕ b = 0 for a = 1011, b = 1', () => {
    const C = queryCircuit(bvTable(0b1011, 1, 4), 0b1000)
    expect(C.qubits).toBe(5)
    const idx = last(C).findIndex((z) => abs2(z) > 0.5)
    expect(idx % 2).toBe(0)
    expect(dotMod2(0b1011, 0b1000) ^ 1).toBe(0)
  })
})

describe('classical query cost (Bergou p. 117; N&C p. 35)', () => {
  it('the exact minimax over every decision tree is 2^{n−1} + 1 for n = 1, 2, 3 (numpy’s frozenset minimax agrees: 2, 3, 5)', () => {
    for (const n of [1, 2, 3]) {
      expect(djMinimaxQueries(n)).toBe(FX.minimax[String(n)])
      expect(djMinimaxQueries(n)).toBe(2 ** (n - 1) + 1)
      expect(djDeterministicWorst(n)).toBe(djMinimaxQueries(n))
    }
    expect(djMinimaxQueries(3)).toBe(5)
  })
  it('the closed form runs on: 2^9 + 1 = 513 for n = 10; the minimax refuses n = 4 (too many positions) and n = 0', () => {
    expect(djDeterministicWorst(10)).toBe(513)
    expect(djDeterministicWorst(1)).toBe(2)
    expect(() => djMinimaxQueries(4)).toThrow()
    expect(() => djMinimaxQueries(0)).toThrow()
    expect(() => djDeterministicWorst(0)).toThrow()
  })
  it('after N/2 queries all answered 0 a constant f and a balanced f both still fit; one more query settles it', () => {
    const N = 8
    const asked = [0, 1, 2, 3]
    const fits = [new Array(N).fill(0) as Bit[], ...balancedTables(3)].filter((t) => asked.every((x) => t[x] === 0))
    expect(fits.some(isConstant)).toBe(true)
    expect(fits.some(isBalanced)).toBe(true)
    const fifth = fits.filter((t) => t[4] === 0)
    expect(fifth.every(isConstant)).toBe(true)
  })
  it('the chance that k distinct random queries miss a balanced f is 2·C(N/2, k)/C(N, k): 0.1429 for N = 8, k = 3; 0.0019 for N = 1024, k = 10', () => {
    for (const k of FX.miss.exact) close(djRandomMiss(k.N, k.k), k.p, 1e-14)
    close(djRandomMiss(8, 3), 1 / 7, 1e-15)
    expect(djRandomMiss(1024, 10)).toBeGreaterThan(0.0018)
    expect(djRandomMiss(1024, 10)).toBeLessThan(0.0020)
  })
  it('matches a count over every balanced function and every k-subset (N = 4 and N = 8, all k)', () => {
    for (const [N, key] of [[4, 'brute4'], [8, 'brute8']] as const) for (let k = 1; k <= N; k++) close(djRandomMiss(N, k), FX.miss[key][String(k)], 1e-14)
  })
  it('edge cases: one query never misses, more than half the inputs cannot all agree, k = 0 is 1, and the chance falls as k grows', () => {
    expect(djRandomMiss(8, 1)).toBeCloseTo(1, 14)
    expect(djRandomMiss(8, 5)).toBe(0)
    expect(djRandomMiss(1024, 513)).toBe(0)
    expect(djRandomMiss(8, 0)).toBe(1)
    let prev = 1
    for (let k = 1; k <= 8; k++) {
      expect(djRandomMiss(8, k)).toBeLessThanOrEqual(prev + 1e-15)
      prev = djRandomMiss(8, k)
    }
    expect(() => djRandomMiss(7, 2)).toThrow()
    expect(() => djRandomMiss(8, 9)).toThrow()
  })
  it('for N much larger than k it is about 2^{1−k} and does not depend on n: the N = 2²⁰, k = 10 value is within 1% of 2⁻⁹', () => {
    expect(Math.abs(djRandomMiss(2 ** 20, 10) / 2 ** -9 - 1)).toBeLessThan(0.01)
  })
})

describe('the oracle bench’s functions and readings (balancedStepTable, djFamilyTable, onesCount, mostLikelyString) against numpy', () => {
  it('the step function is balanced for every n, linear only for n ≤ 2, and equals the numpy mask 1 ≤ x ≤ N/2', () => {
    for (const k of FX.bench.step) {
      expect(balancedStepTable(k.n), `n = ${k.n}`).toEqual(k.table)
      expect(isBalanced(balancedStepTable(k.n))).toBe(k.balanced)
      expect(onesCount(balancedStepTable(k.n))).toBe(k.ones)
      // a search over every (a, b) agrees with numpy about whether the step is a·x ⊕ b
      const affine = Array.from({ length: 2 ** k.n }, (_, a) => [0, 1].some((b) => bvTable(a, b, k.n).every((v, x) => v === balancedStepTable(k.n)[x]))).some(Boolean)
      expect(affine, `n = ${k.n}`).toBe(k.affine)
    }
    expect(FX.bench.step.map((k: { affine: boolean }) => k.affine)).toEqual([true, true, false, false])
    expect(balancedStepTable(3)).toEqual(F_BALN)
  })
  it('the family tables are the numpy tables: constant b, a·x ⊕ b (a = 0 gives the constant b) and the step', () => {
    for (const k of FX.bench.linear) {
      expect(djFamilyTable('linear', k.n, k.a, k.b), `n=${k.n} a=${k.a} b=${k.b}`).toEqual(k.table)
      expect(onesCount(k.table)).toBe(k.ones)
    }
    for (const k of FX.bench.constant) {
      expect(djFamilyTable('constant', k.n, 7, k.b)).toEqual(k.table)
      expect(onesCount(djFamilyTable('constant', k.n, 0, k.b))).toBe(k.ones)
    }
    for (const n of [1, 2, 3, 4]) {
      expect(djFamilyTable('balanced', n, 3, 1)).toEqual(balancedStepTable(n))
      expect(djFamilyTable('linear', n, 0, 1)).toEqual(djFamilyTable('constant', n, 5, 1))
    }
    expect(DJ_FAMILIES).toEqual(['constant', 'linear', 'balanced'])
  })
  it('every family is inside the promise or says so: constant and balanced for the promised ones, a nonzero a gives a balanced linear f', () => {
    for (const n of [1, 2, 3, 4]) {
      expect(djVerdict(djFamilyTable('constant', n, 0, 0))).toBe('constant')
      expect(djVerdict(djFamilyTable('balanced', n, 0, 0))).toBe('balanced')
      for (let a = 1; a < 2 ** n; a++) for (const b of [0, 1] as const) expect(djVerdict(djFamilyTable('linear', n, a, b))).toBe('balanced')
      for (const b of [0, 1] as const) expect(djVerdict(djFamilyTable('linear', n, 0, b))).toBe('constant')
    }
  })
  it('the most likely reading of the Deutsch–Jozsa state matches numpy (index, string, chance, ties) for 70 balanced, all linear and all constant tables', () => {
    expect(FX.bench.likely.length).toBeGreaterThan(100)
    for (const k of FX.bench.likely) {
      const m = mostLikelyString(last(djCircuit(k.table, 'phase')))
      expect(m.index, k.name).toBe(k.index)
      expect(m.bits, k.name).toBe(k.bits)
      expect(m.ties, k.name).toBe(k.ties)
      close(m.p, k.p, 1e-12)
    }
  })
  it('a linear f lands on the single string a (ties 1, chance 1), the step function at n = 3 spreads over four strings of chance ¼ (the plan’s q16DjBalnP), a constant f lands on 0…0', () => {
    for (let a = 0; a < 8; a++) {
      const m = mostLikelyString(last(bvCircuit(a, 1, 3)))
      expect([m.index, m.ties]).toEqual([a, 1])
      close(m.p, 1)
    }
    const step = mostLikelyString(last(djCircuit(balancedStepTable(3), 'phase')))
    expect(step.ties).toBe(4)
    close(step.p, 0.25)
    expect(step.index).toBe(4)
    const one = mostLikelyString(last(djCircuit(djFamilyTable('constant', 3, 0, 1), 'phase')))
    expect([one.index, one.bits, one.ties]).toEqual([0, '000', 1])
  })
  it('refuses what is not a register, and a uniform state ties on every string', () => {
    expect(() => mostLikelyString([c(1)])).toThrow()
    expect(() => mostLikelyString([c(1), c(0), c(0)])).toThrow()
    const u = Array.from({ length: 8 }, () => c(Math.SQRT1_2 / 2))
    expect(mostLikelyString(u).ties).toBe(8)
    // two chances equal up to rounding noise are a tie, and the smaller index is reported (the larger one is 1e-13 taller)
    const noisy = mostLikelyString([c(Math.sqrt(0.5 - 1e-13)), c(Math.sqrt(0.5))])
    expect([noisy.index, noisy.ties]).toEqual([0, 2])
    expect(() => balancedStepTable(0)).toThrow()
    expect(() => djFamilyTable('linear', 5, 0, 0)).toThrow()
  })
})
