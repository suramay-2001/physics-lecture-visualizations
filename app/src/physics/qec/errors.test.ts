/**
 * The Chapter Q21 helpers against their numpy twin (pipeline/qec_q21_numpy.py → make_qec_q21_fixtures.py → __fixtures__/qec-q21.json) and against properties:
 * every syndrome of every weight-1 error on the bit-flip, phase-flip and Shor codes (symplectic route vs a dense state vector), Knill–Laflamme tables and their
 * eigenvalues, Pauli coefficients, the environment's four notes of a seeded unitary, the lists of Pauli errors, dephasing factors and the break-even chance.
 */
import { describe, expect, it } from 'vitest'
import raw from '../__fixtures__/qec-q21.json?raw'
import { abs, c } from '../complex'
import { rng } from '../random'
import { randomUnitary } from '../qc/cmat'
import { Rx } from '../qc/gates'
import {
  codeSyndrome,
  denseCheckValues,
  dephasingFactor,
  envPauliExpansion,
  gaussianDephasingFactor,
  klMatrix,
  pauliCoefficients,
  pauliExpansionResidual,
  paulisOfWeight,
  pauliName,
  repetitionBreakEven,
  uniformDephasingFactor,
} from './errors'
import { Pauli } from './pauli'
import { repetitionFail } from './rates'
import { registeredCode } from './registry'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FX: any = JSON.parse(raw)
const cx = (z: [number, number]) => c(z[0], z[1])
const DEG = Math.PI / 180

describe('codeSyndrome and denseCheckValues against the dense numpy route', () => {
  for (const id of ['rep3', 'rep3x', 'shor9'] as const) {
    it(`${id}: all weight-1 errors read the same ±1 on every check in both routes and in numpy`, () => {
      const entry = registeredCode(id)
      const block = FX.syndromes[id]
      const gens = entry.stabilizer.generators.map((g) => g.letters().join(''))
      expect([...gens].sort()).toEqual([...block.generators].sort())
      let n = 0
      for (const [err, values] of Object.entries<number[]>(block.errors)) {
        const p = Pauli.parse(err)
        const sym = codeSyndrome(entry, p)
        const dense = denseCheckValues(entry, p, 0.6, 0.8)
        block.generators.forEach((g: string, k: number) => {
          const i = gens.indexOf(g)
          expect(sym[i], `${id} ${err} ${g}`).toBe(values[k] > 0 ? 1 : -1)
          expect(dense[i], `${id} ${err} ${g}`).toBeCloseTo(values[k], 12)
          expect(Math.abs(Math.abs(dense[i]) - 1), `${id} ${err} ${g}`).toBeLessThan(1e-12)
        })
        n++
      }
      expect(n).toBe(id === 'shor9' ? 28 : 10)
    })
  }
  it('the dense readings of an error the code can tell apart do not depend on a and b', () => {
    const entry = registeredCode('rep3')
    for (const [a, b] of [[1, 0], [0.6, 0.8], [Math.SQRT1_2, -Math.SQRT1_2]]) expect(denseCheckValues(entry, Pauli.parse('IXI'), a, b).map((x) => Math.round(x))).toEqual([-1, -1])
  })
  it('Table 9.1: the readings of X1, X2, X3 on the bit-flip code are (−1,+1), (−1,−1), (+1,−1)', () => {
    const e = registeredCode('rep3')
    expect(['XII', 'IXI', 'IIX'].map((s) => codeSyndrome(e, Pauli.parse(s)))).toEqual([[-1, 1], [-1, -1], [1, -1]])
  })
  it('the 28 errors of weight ≤ 1 on the Shor code give 22 different syndromes', () => {
    const e = registeredCode('shor9')
    expect(new Set(paulisOfWeight(9, 1).map((p) => codeSyndrome(e, p).join(','))).size).toBe(22)
  })
  it('names a Pauli by its non-identity letters', () => {
    expect(pauliName(Pauli.parse('ZZIIIIIII'))).toBe('Z1Z2')
    expect(pauliName(Pauli.parse('IIIIXIIII'))).toBe('X5')
  })
})

describe('klMatrix against dense Gram matrices', () => {
  it('matches numpy: C on |0̄⟩ and |1̄⟩, eigenvalues and the gap, for all six sets', () => {
    for (const k of FX.kl) {
      const entry = registeredCode(k.code)
      const r = klMatrix(entry, k.errors.map((s: string) => Pauli.parse(s)))
      r.C.forEach((row, i) =>
        row.forEach((z, j) => {
          expect(z.re, `${k.code} ${k.errors} C[${i}][${j}] re`).toBeCloseTo(k.C[i][j][0], 12)
          expect(z.im, `${k.code} ${k.errors} C[${i}][${j}] im`).toBeCloseTo(k.C[i][j][1], 12)
          expect(r.C1[i][j].re).toBeCloseTo(k.C1[i][j][0], 12)
        }),
      )
      r.eigenvalues.forEach((x, i) => expect(x).toBeCloseTo(k.eigenvalues[i], 9))
      expect(r.gap).toBeCloseTo(k.gap, 12)
    }
  })
  it('the bit-flip code passes for {I, X1, X2, X3} (table I4), fails for {I, Z1}; the Shor code passes for {I, Z1, Z2} with eigenvalues 0, 1, 2', () => {
    const rep = registeredCode('rep3')
    const a = klMatrix(rep, ['III', 'XII', 'IXI', 'IIX'].map((s) => Pauli.parse(s)))
    expect(a.gap).toBeLessThan(1e-12)
    a.C.forEach((row, i) => row.forEach((z, j) => expect(abs(c(z.re - (i === j ? 1 : 0), z.im))).toBeLessThan(1e-12)))
    expect(klMatrix(rep, ['III', 'ZII'].map((s) => Pauli.parse(s))).gap).toBeCloseTo(2, 12)
    const sh = klMatrix(registeredCode('shor9'), [Pauli.identity(9), Pauli.parse('ZIIIIIIII'), Pauli.parse('IZIIIIIII')])
    expect(sh.gap).toBeLessThan(1e-12)
    expect(sh.eigenvalues.map((x) => Math.round(x * 1e9) / 1e9)).toEqual([0, 1, 2])
  })
  it('agrees with the stabilizer test: the set is correctable exactly when the table passes', () => {
    const shor = registeredCode('shor9')
    const sets: [string, boolean][] = [['X1,X2,Z1,Y1', true], ['X1,X2,Z1', true], ['X1,Z1', true]]
    for (const [s] of sets) {
      const errs = [Pauli.identity(9), ...s.split(',').map((t) => Pauli.parse(Array.from({ length: 9 }, (_, j) => (j === Number(t[1]) - 1 ? t[0] : 'I')).join('')))]
      expect(shor.stabilizer.corrects(errs)).toBe(klMatrix(shor, errs).gap < 1e-12)
    }
    const rep = registeredCode('rep3')
    const bad = ['III', 'ZII'].map((s) => Pauli.parse(s))
    expect(rep.stabilizer.corrects(bad)).toBe(klMatrix(rep, bad).gap < 1e-12)
  })
})

describe('Pauli coefficients and the environment split', () => {
  it('c_P = Tr(PA)/2 matches numpy and rebuilds A', () => {
    for (const e of FX.coeffs) {
      const A = e.A.map((row: [number, number][]) => row.map(cx))
      const co = pauliCoefficients(A)
      for (const k of ['I', 'X', 'Y', 'Z'] as const) {
        expect(co[k].re, k).toBeCloseTo(e.c[k][0], 12)
        expect(co[k].im, k).toBeCloseTo(e.c[k][1], 12)
      }
      expect(pauliExpansionResidual(A)).toBeLessThan(1e-12)
    }
  })
  it('Rx(60°) = cos 30° I − i sin 30° X', () => {
    const co = pauliCoefficients(Rx(60 * DEG))
    expect(co.I.re).toBeCloseTo(Math.cos(30 * DEG), 12)
    expect(co.X.im).toBeCloseTo(-0.5, 12)
    expect(abs(co.Y) + abs(co.Z)).toBeLessThan(1e-12)
  })
  it('the four environment notes of the seeded unitary match numpy, and the split holds for fresh unitaries and states', () => {
    const U = FX.env.U.map((row: [number, number][]) => row.map(cx))
    const psi = FX.env.psi.map(cx)
    const r = envPauliExpansion(U, psi)
    for (const k of ['I', 'X', 'Y', 'Z'] as const) r.e[k].forEach((z, i) => expect(abs(c(z.re - FX.env.e[k][i][0], z.im - FX.env.e[k][i][1])), k).toBeLessThan(1e-12))
    expect(r.gap).toBeLessThan(1e-12)
    expect(FX.env.gap).toBeLessThan(1e-12)
    const rand = rng(11)
    for (let t = 0; t < 8; t++) {
      const V = randomUnitary(4, rand)
      const th = rand() * Math.PI
      expect(envPauliExpansion(V, [c(Math.cos(th)), c(Math.sin(th) * Math.cos(1), Math.sin(th) * Math.sin(1))]).gap).toBeLessThan(1e-12)
    }
  })
})

describe('paulisOfWeight, dephasing and the break-even chance', () => {
  it('lists Σ_{j≤t} C(n,j) 3^j distinct strings of weight ≤ t, as numpy does', () => {
    for (const [key, v] of Object.entries<{ count: number; strings: string[] }>(FX.weights)) {
      const [n, t] = key.split(',').map(Number)
      const list = paulisOfWeight(n, t)
      expect(list.length, key).toBe(v.count)
      if (v.strings.length) expect(list.map((p) => p.letters().join('')).sort()).toEqual([...v.strings].sort())
      expect(new Set(list.map((p) => p.letters().join(''))).size).toBe(list.length)
      expect(Math.max(...list.map((p) => p.weight()))).toBeLessThanOrEqual(t)
    }
    expect(paulisOfWeight(3, 1).length).toBe(10)
    expect(paulisOfWeight(9, 1).length).toBe(28)
    expect(paulisOfWeight(5, 1).length).toBe(16)
    expect(paulisOfWeight(5, 2).length - paulisOfWeight(5, 1).length).toBe(90)
  })
  it('z for discrete phases, the uniform circle and a Gaussian match numpy; weights must be a distribution', () => {
    for (const e of FX.dephasing.discrete) {
      const z = dephasingFactor(e.degrees.map((x: number) => x * DEG), e.weights)
      expect(z.re).toBeCloseTo(e.z[0], 12)
      expect(z.im).toBeCloseTo(e.z[1], 12)
    }
    expect(abs(uniformDephasingFactor())).toBeLessThan(1e-12)
    for (const g of FX.dephasing.gaussian) expect(gaussianDephasingFactor(g.sigma).re).toBeCloseTo(g.z, 10)
    expect(() => dephasingFactor([0, 1], [0.5, 0.6])).toThrow()
    expect(() => gaussianDephasingFactor(0)).toThrow()
  })
  it('the break-even chance of an n-copy vote is ½, as the polynomial roots say', () => {
    for (const n of [3, 5, 7]) {
      expect(repetitionBreakEven(n)).toBeCloseTo(FX.breakEven[String(n)], 12)
      expect(repetitionFail(repetitionBreakEven(n), n)).toBeCloseTo(repetitionBreakEven(n), 12)
    }
  })
})
