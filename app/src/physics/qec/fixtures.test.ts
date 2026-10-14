/**
 * The TypeScript error-correction engine against its numpy twin (pipeline/qec_numpy.py → pipeline/make_qec_fixtures.py → __fixtures__/qec.json). The twin reaches
 * every answer by a different route (Python big-integer XOR bases and brute-force counting for GF(2); dense 2ⁿ × 2ⁿ matrices for Pauli products and conjugations;
 * a dense state vector for stabilizer states; itertools enumeration for distances; np.kron circulants and a Groebner basis for the BB codes; information-set
 * decoding on Python integers with its own seed), so agreement is evidence. Light logical operators found by the twin are re-checked here against THIS engine's
 * check matrices (zero syndrome, outside the stabilizer span).
 */
import { describe, expect, it } from 'vitest'
import raw from '../__fixtures__/qec.json?raw'
import { GF2Matrix } from './gf2'
import { Pauli, type CliffordGate } from './pauli'
import { Tableau } from './tableau'
import { GROSS_SPEC, REPORTED, TWO_GROSS_SPEC, bbCode, logicalXAction, makeLogicalSolver, paperLogicalBasis } from './bb'
import { cssDistance, fiveQubitCode, fourTwoTwoCode, repetitionCode, rotatedSurfaceCode, shorCode, stabilizerDistance, steaneCode, type CSSCode } from './codes'
import { adapterQubits, bbModuleQubits, surfaceCheckQubits, surfaceDataQubits, surfaceQubitsPerLogical, surfaceToModuleRatio } from './overhead'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FX: any = JSON.parse(raw)

const rowsOf = (M: GF2Matrix): string[] => Array.from({ length: M.rows }, (_, i) => M.rowBits(i).join(''))
const supOf = (M: GF2Matrix): number[][] => Array.from({ length: M.rows }, (_, i) => M.rowSupport(i))
const sortedRows = (s: number[][]): string[] => s.map((r) => r.join(',')).sort()

describe('fixtures: GF(2) against Python integers and brute-force counting', () => {
  it('rank, null-space size and row-space membership agree on every random matrix (30 shapes up to 40 columns)', () => {
    expect(FX.gf2.matrices.length).toBe(30)
    for (const e of FX.gf2.matrices) {
      const M = GF2Matrix.fromText(e.rows.join(' '))
      expect(M.cols).toBe(e.cols)
      expect(M.rank()).toBe(e.rank)
      expect(M.nullspace().rows).toBe(e.cols - e.rank)
      if (e.nullCount !== null) expect(2 ** M.nullspace().rows).toBe(e.nullCount) // the count of solutions by brute force
      for (const v of e.vectors) expect(M.rowspaceContains(v.v.split('').map(Number)), `${e.rows[0]}… ${v.v}`).toBe(v.inRowspace)
    }
  })
})

describe('fixtures: Pauli algebra against dense matrices', () => {
  it('all 256 products of two-qubit strings and 200 products of three-qubit strings: letters and the exponent of i', () => {
    for (const [key, [phase, letters]] of Object.entries<[number, string]>({ ...FX.pauli.product2, ...FX.pauli.product3 })) {
      const [a, b] = key.split(',')
      const prod = Pauli.parse(a).mul(Pauli.parse(b))
      expect(prod.letters().join(''), key).toBe(letters)
      expect(prod.phase, key).toBe(phase)
    }
    expect(Object.keys(FX.pauli.product2).length).toBe(256)
  })

  it('commutation of every pair of two-qubit strings', () => {
    for (const [key, commutes] of Object.entries<boolean>(FX.pauli.commute2)) {
      const [a, b] = key.split(',')
      expect(Pauli.parse(a).commutesWith(Pauli.parse(b)), key).toBe(commutes)
    }
  })

  it('Clifford conjugation of every three-qubit string by H, S, S†, X, Y, Z, CNOT, CZ and SWAP on chosen wires (576 entries)', () => {
    let count = 0
    for (const [key, [phase, letters]] of Object.entries<[number, string]>(FX.pauli.conj3)) {
      const m = /^([A-Za-z]+)(\d+):([IXYZ]+)$/.exec(key)!
      const gate = m[1] as CliffordGate
      const wires = m[2].split('').map(Number)
      const out = Pauli.parse(m[3]).conjugate(gate, ...wires)
      expect(out.letters().join(''), key).toBe(letters)
      expect(out.phase, key).toBe(phase)
      count++
    }
    expect(count).toBe(576)
  })
})

describe('fixtures: the tableau against a dense state vector', () => {
  it('40 random Clifford circuits (half with Z measurements): final stabilizer group, outcomes replayed, certain outcomes equal and certain, coins are coins', () => {
    expect(FX.tableau.length).toBe(40)
    let coins = 0
    let certain = 0
    for (const [t, e] of FX.tableau.entries()) {
      const tab = new Tableau(e.n)
      let k = 0
      let flips = 0
      for (const op of e.ops) {
        if ('g' in op) {
          tab.apply(op.g as CliffordGate, ...(op.q as number[]))
          continue
        }
        const fx = e.outcomes[k++]
        expect(fx.q).toBe(op.m)
        if (fx.certain) {
          expect(tab.isDeterministicZ(fx.q), `circuit ${t}`).toBe(true)
          expect(tab.measureZ(fx.q)).toEqual({ outcome: fx.out, deterministic: true })
          certain++
        } else {
          expect(tab.isDeterministicZ(fx.q), `circuit ${t}`).toBe(false)
          expect(tab.measureZ(fx.q, fx.out)).toEqual({ outcome: fx.out, deterministic: false })
          flips++
          coins++
        }
      }
      expect(tab.invariantsHold()).toBe(true)
      expect(tab.stabilizerGroup().map(String).sort(), `circuit ${t}`).toEqual(e.group)
      expect(e.prob).toBeCloseTo(0.5 ** flips, 9)
    }
    expect(coins).toBeGreaterThan(5)
    expect(certain).toBeGreaterThan(5)
  })
})

describe('fixtures: named codes against independently built check matrices, ranks, exhaustive distances and syndromes', () => {
  const fixedOrder: [string, CSSCode][] = [
    ['steane', steaneCode()],
    ['shor', shorCode()],
    ['fourTwoTwo', fourTwoTwoCode()],
    ['bitflip3', repetitionCode(3)],
    ['bitflip5', repetitionCode(5)],
  ]

  it.each(fixedOrder)('%s: H_X and H_Z equal the twin’s rows in order; n, k, d_X, d_Z agree; every Pauli error of weight ≤ 2 has the twin’s syndrome', (key, code) => {
    const e = FX.codes[key]
    expect(code.n).toBe(e.n)
    expect(supOf(code.HX)).toEqual(e.hx)
    expect(supOf(code.HZ)).toEqual(e.hz)
    expect(code.k).toBe(e.k)
    expect(code.rankX).toBe(e.rankX)
    expect(code.rankZ).toBe(e.rankZ)
    const d = cssDistance(code)
    expect(d.exact).toBe(true)
    expect(d.X.upper).toBe(e.dX)
    expect(d.Z.upper).toBe(e.dZ)
    // the twin’s witnesses are logical operators of THIS engine’s code
    const zero = new Array<number>(e.n).fill(0)
    const st = code.stabilizer()
    const xw = new Array<number>(e.n).fill(0)
    for (const j of e.witnessX) xw[j] = 1
    const zw = new Array<number>(e.n).fill(0)
    for (const j of e.witnessZ) zw[j] = 1
    expect(st.isLogical(new Pauli(xw, zero))).toBe(true)
    expect(st.isLogical(new Pauli(zero, zw))).toBe(true)
    for (const [s, sx, sz] of e.syndromes as [string, string, string][]) {
      const syn = code.syndrome(Pauli.parse(s))
      expect(syn.x.join(''), s).toBe(sx)
      expect(syn.z.join(''), s).toBe(sz)
    }
  })

  it.each([3, 5])('surface code d = %i: the same set of checks as the twin’s face lattice, the same k and the same exhaustive distance', (d) => {
    const e = FX.codes[`surface${d}`]
    const S = rotatedSurfaceCode(d)
    expect(sortedRows(supOf(S.code.HX))).toEqual(sortedRows(e.hx))
    expect(sortedRows(supOf(S.code.HZ))).toEqual(sortedRows(e.hz))
    expect(S.code.k).toBe(e.k)
    const r = cssDistance(S.code)
    expect(r.X.upper).toBe(e.dX)
    expect(r.Z.upper).toBe(e.dZ)
    expect(e.dX).toBe(d)
    expect(e.dZ).toBe(d)
  })

  it('the 5-qubit code: k from the rank, distance 3 by brute force over all 4⁵ Paulis (dense), and the 15 single-error syndromes', () => {
    const e = FX.codes.five
    const code = fiveQubitCode()
    expect(code.generators.map((g) => g.letters().join(''))).toEqual(e.generators)
    expect(code.rank).toBe(e.rank)
    expect(code.k).toBe(e.k)
    expect(stabilizerDistance(code).upper).toBe(e.d)
    for (const [s, bitsText] of Object.entries<string>(e.syndromes)) expect(code.syndrome(Pauli.parse(s)).join(''), s).toBe(bitsText)
  })
})

describe('fixtures: bivariate bicycle codes against np.kron circulants, a Groebner basis and the paper’s printed matrices', () => {
  const specs = [
    ['gross', GROSS_SPEC, 'gross'],
    ['twoGross', TWO_GROSS_SPEC, 'two-gross'],
  ] as const

  it.each(specs)('%s: the check matrices equal the twin’s row by row (same qubit and check order), with the same ranks, k, weights and degrees', (key, spec) => {
    const e = FX.bb[key]
    const code = bbCode(spec)
    expect(code.n).toBe(e.n)
    expect(supOf(code.HX)).toEqual(e.hx)
    expect(supOf(code.HZ)).toEqual(e.hz)
    expect(code.css.rankX).toBe(e.rankX)
    expect(code.css.rankZ).toBe(e.rankZ)
    expect(code.k).toBe(e.k)
    expect(code.checkWeight).toBe(e.checkWeight)
    expect([...new Set(Array.from({ length: code.n }, (_, q) => code.HX.colWeight(q)))].sort()).toEqual(e.colWeightX)
    expect([...new Set(Array.from({ length: code.n }, (_, q) => code.HZ.colWeight(q)))].sort()).toEqual(e.colWeightZ)
  })

  it.each(specs)('%s: k from the Groebner basis of (x^ℓ−1, y^m−1, A, B) over GF(2), which never builds a matrix, is 12, equal to n − rank H_X − rank H_Z', (key, spec, which) => {
    const e = FX.bb[key]
    expect(e.kGroebner).toBe(12)
    expect(bbCode(spec).k).toBe(e.kGroebner)
    expect(REPORTED[which].k).toBe(e.kGroebner)
  })

  it.each(specs)('%s: the paper’s basis built again in Python has the same weights and the logical action of x and y that this engine computes (and that the twin checked against the printed matrices)', (key, spec, which) => {
    const e = FX.bb[key]
    const code = bbCode(spec)
    const B = paperLogicalBasis(code, which)
    expect(B.X.map((p) => p.weight())).toEqual(e.logicalWeightsX)
    expect(B.Z.map((p) => p.weight())).toEqual(e.logicalWeightsZ)
    const solver = makeLogicalSolver(code, B.X)
    expect(rowsOf(logicalXAction(code, B.X, code.shiftPermutation(1, 0), solver)!)).toEqual(e.logicalAction.x)
    expect(rowsOf(logicalXAction(code, B.X, code.shiftPermutation(0, 1), solver)!)).toEqual(e.logicalAction.y)
    const classes = new Set<string>()
    for (let a = 0; a < spec.l; a++) for (let b = 0; b < spec.m; b++) classes.add(logicalXAction(code, B.X, code.shiftPermutation(a, b), solver)!.toText())
    expect(classes.size).toBe(e.shiftClasses)
    expect(e.shiftClasses).toBe(36)
  })

  it.each(specs)('%s: the light logical operator the twin found (its own seed) is a logical operator of this engine’s code, of the weight it reports, never below the paper’s d', (key, spec, which) => {
    const e = FX.bb[key]
    const code = bbCode(spec)
    expect(e.isd.weight).toBeLessThanOrEqual(e.isd.target) // the search reached the weight the paper reports
    const x = new Array<number>(code.n).fill(0)
    for (const j of e.isd.support) x[j] = 1
    expect(code.HZ.mulVec(x).every((b) => b === 0)).toBe(true)
    expect(code.HX.rowspaceContains(x)).toBe(false)
    expect(e.isd.support.length).toBe(e.isd.weight)
    expect(e.isd.weight).toBeGreaterThanOrEqual(REPORTED[which].d)
  })
})

describe('fixtures: overhead arithmetic typed again', () => {
  it('surface-code data, check and total qubits, module totals, ratios and adapter sizes agree', () => {
    for (const [d, v] of Object.entries<{ data: number; checks: number; perLogical: number }>(FX.overhead.surface)) {
      expect(surfaceDataQubits(Number(d))).toBe(v.data)
      expect(surfaceCheckQubits(Number(d))).toBe(v.checks)
      expect(surfaceQubitsPerLogical(Number(d))).toBe(v.perLogical)
    }
    expect(bbModuleQubits(12, 6).total).toBe(FX.overhead.module.gross)
    expect(bbModuleQubits(12, 12).total).toBe(FX.overhead.module.twoGross)
    expect(surfaceToModuleRatio(12, 288, 11)).toBeCloseTo(FX.overhead.ratio.grossD11, 12)
    expect(surfaceToModuleRatio(12, 576, 17)).toBeCloseTo(FX.overhead.ratio.twoGrossD17, 12)
    expect(adapterQubits(12)).toBe(FX.overhead.adapter['12'])
    expect(adapterQubits(18)).toBe(FX.overhead.adapter['18'])
  })
})
