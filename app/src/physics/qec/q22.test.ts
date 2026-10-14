/**
 * Chapter Q22's engine additions (qec/q22.ts) against their numpy twin (pipeline/make_q22_fixtures.py -> __fixtures__/q22.json): linear codes (words, weight
 * enumerators, distances, duals, the single-flip table), coset states and their Hadamard image, Clifford conjugation and the 24 Cliffords, the tableau trace of
 * three circuits against dense stabilizer groups, and the Steane code's failure polynomial and pseudo-threshold. Plus properties that hold without a twin.
 */
import { describe, expect, it, vi } from 'vitest'
import raw from '../__fixtures__/q22.json?raw'
import type { Circuit, Op } from '../qc/circuit'
import { runCircuit } from '../qc/circuit'
import { H, S, T, cnot } from '../qc/gates'
import { steaneCode } from './codes'
import { failuresByWeight, logicalFailure } from './rates'
import { cliffordClosure, cliffordConjugate, cosetState, decodeSingleFlip, hadamardImage, linearCode, linearCodeFromChecks, pseudoThreshold, sameStabilizerGroup, singleFlipSyndromes, tableauTrace } from './q22'
import { Pauli } from './pauli'
import { StabilizerCode } from './stabilizer'

vi.setConfig({ testTimeout: 60_000 })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FX: any = JSON.parse(raw)

describe('linear codes against Python integers and brute-force duals', () => {
  it('every word, weight enumerator, distance and dual of fourteen codes agrees', () => {
    expect(FX.linear.length).toBe(14)
    for (const e of FX.linear) {
      const C = linearCode(e.basic)
      expect([C.n, C.k]).toEqual([e.n, e.k])
      expect(C.words()).toEqual(e.words)
      expect(C.weightEnumerator()).toEqual(e.enum)
      expect(C.distance()).toBe(e.distance)
      const D = C.dual()
      expect(D.words()).toEqual(e.dualWords)
      expect(D.weightEnumerator()).toEqual(e.dualEnum)
      if (e.dualDistance !== null) expect(D.distance()).toBe(e.dualDistance)
      // M G = 0 and the dual's dual is the code
      expect(C.checkMatrix().mul(C.generator()).isZero()).toBe(true)
      expect(D.dual().words()).toEqual(e.words)
      for (const w of e.words) expect(C.syndrome(w)).toBe('0'.repeat(e.n - e.k))
    }
  })
  it('a code from checks is the kernel of its check matrix', () => {
    const C = linearCodeFromChecks(['110000', '101000', '000110', '000101'])
    expect(C.words()).toEqual(['000000', '000111', '111000', '111111'])
    expect(C.distance()).toBe(3)
    expect(C.rate).toBeCloseTo(1 / 3, 12)
    expect(() => linearCode(['110', '110'])).toThrow()
    expect(() => linearCodeFromChecks(['11', '11'])).toThrow()
  })
  it('the single-flip table decodes one flip and is fooled by two, as the twin says', () => {
    const D = FX.decode
    expect(singleFlipSyndromes(D.checks)).toEqual(D.columns)
    for (const e of D.cases) expect(decodeSingleFlip(D.checks, e.received)).toEqual({ syndrome: e.syndrome, place: e.place, word: e.word })
    // distance 3 fixes every single flip of every word, and two flips of 000000 land on a different code word
    const C = linearCodeFromChecks(D.checks)
    for (const w of C.words())
      for (let j = 0; j < 6; j++) {
        const r = [...w]
        r[j] = r[j] === '0' ? '1' : '0'
        expect(decodeSingleFlip(D.checks, r.join('')).word).toBe(w)
      }
    expect(decodeSingleFlip(D.checks, '011000').word).toBe('111000')
  })
})

describe('coset states and their Hadamard image', () => {
  const C2 = linearCode(['0001111', '0110011', '1010101'])
  it('match the numpy cosets and np.kron Hadamards', () => {
    expect(C2.words()).toEqual(FX.coset.c2)
    for (const s of FX.coset.states) {
      const st = cosetState(C2, s.x)
      expect(st.map((a) => [a.bits, a.amp])).toEqual(s.coset.map(([b, a]: [string, number]) => [b, expect.closeTo(a, 12)]))
      const img = hadamardImage(st)
      expect(img.length).toBe(s.image.length)
      img.forEach((a, i) => {
        expect(a.bits).toBe(s.image[i][0])
        expect(a.amp).toBeCloseTo(s.image[i][1], 12)
      })
    }
  })
  it('|0bar> has 8 words of 0.3536 and its Hadamard image 16 words of 0.25 (Bergou Eq. 9.43)', () => {
    const z = cosetState(C2, '0000000')
    expect(z.length).toBe(8)
    expect(z[0].amp).toBeCloseTo(1 / Math.sqrt(8), 12)
    const h = hadamardImage(z)
    expect(h.length).toBe(16)
    for (const a of h) expect(a.amp).toBeCloseTo(0.25, 12)
    // |1bar> = X on everything: the odd words; the image has the signs (-1)^{x.u}
    expect(cosetState(C2, '1111111').every((a) => a.bits.split('1').length % 2 === 0)).toBe(true)
  })
})

describe('Clifford conjugation and the 24 Cliffords', () => {
  const GATE: Record<string, Parameters<typeof cliffordConjugate>[0]> = { H, S, T, CNOT: cnot(0, 1, 2) }
  it('every expansion agrees with the numpy traces, including the non-Clifford T', () => {
    const cases: [string, string, [string, number, number][]][] = []
    for (const [g, table] of Object.entries(FX.conjugate.one)) for (const [p, terms] of Object.entries(table as object)) cases.push([g, p, terms as [string, number, number][]])
    for (const [p, terms] of Object.entries(FX.conjugate.two.CNOT)) cases.push(['CNOT', p, terms as [string, number, number][]])
    expect(cases.length).toBe(4 * 3 + 16)
    for (const [g, p, terms] of cases) {
      const out = cliffordConjugate(GATE[g], p)
      expect(out.expansion.map((e) => e.pauli), `${g} ${p}`).toEqual(terms.map((t) => t[0]))
      out.expansion.forEach((e, i) => {
        expect(e.re).toBeCloseTo(terms[i][1], 9)
        expect(e.im).toBeCloseTo(terms[i][2], 9)
      })
      expect(out.clifford, `${g} ${p}`).toBe(g !== 'T' || p === 'I' || p === 'Z')
    }
  })
  it('H swaps X and Z and turns Y into -Y; S turns X into Y; CNOT copies X forward and Z backward; T X T-dagger is (X + Y)/sqrt2', () => {
    expect(cliffordConjugate(H, 'X')).toMatchObject({ clifford: true, sign: 1, pauli: 'Z' })
    expect(cliffordConjugate(H, 'Y')).toMatchObject({ clifford: true, sign: -1, pauli: 'Y' })
    expect(cliffordConjugate(S, 'X')).toMatchObject({ sign: 1, pauli: 'Y' })
    expect(cliffordConjugate(S, 'Y')).toMatchObject({ sign: -1, pauli: 'X' })
    expect(cliffordConjugate(S, 'Z')).toMatchObject({ sign: 1, pauli: 'Z' })
    expect(cliffordConjugate(cnot(0, 1, 2), 'XI')).toMatchObject({ sign: 1, pauli: 'XX' })
    expect(cliffordConjugate(cnot(0, 1, 2), 'IZ')).toMatchObject({ sign: 1, pauli: 'ZZ' })
    const t = cliffordConjugate(T, 'X')
    expect(t.clifford).toBe(false)
    expect(t.expansion.map((e) => [e.pauli, e.re])).toEqual([['X', expect.closeTo(Math.SQRT1_2, 9)], ['Y', expect.closeTo(Math.SQRT1_2, 9)]])
    expect(() => cliffordConjugate(H, 'XX')).toThrow()
  })
  it('the closure of H and S has 24 elements up to a global phase, like the twin', () => {
    const c = cliffordClosure(1)
    expect(c.size).toBe(FX.conjugate.closure)
    expect(c.size).toBe(24)
    expect(new Set(c.words).size).toBe(24)
  })
})

describe('the tableau trace of three circuits against dense stabilizer groups', () => {
  const toCircuit = (n: number, init: string, columns: Record<string, unknown>[][]): Circuit => ({
    version: 1,
    qubits: n,
    init,
    clbits: 2,
    columns: columns.map(
      (col) =>
        col.map((op): Op => {
          if ('m' in op) return { op: 'measure', qubit: op.m as number, bit: op.bit as number }
          const q = op.q as number[]
          const cond = op.cond ? { bits: (op.cond as [number[], string])[0], equals: (op.cond as [number[], string])[1] } : undefined
          if (op.g === 'CNOT') return { op: 'gate', gate: 'X', controls: [q[0]], targets: [q[1]] }
          return { op: 'gate', gate: op.g as 'H', targets: [q[0]], ...(cond ? { cond } : {}) }
        }),
    ),
  })
  it('after every column the signed generators lie in, and generate, the dense group', () => {
    for (const c of FX.trace) {
      const trace = tableauTrace(toCircuit(c.n, c.init, c.columns), c.outcomes)
      expect(trace.steps.length).toBe(c.columns.length + 1)
      trace.steps.forEach((gens, k) => {
        const group: string[] = c.groups[k]
        expect(group.length, `${c.name} step ${k}`).toBe(2 ** c.n)
        for (const g of gens) expect(group, `${c.name} step ${k}: ${g}`).toContain(g)
        expect(new StabilizerCode(gens.map((g) => Pauli.parse(g))).rank, `${c.name} step ${k}: independent`).toBe(c.n)
      })
    }
  })
  it('the encoder follows Z1 Z2 Z3 to Z1, Z1Z2, Z1Z3 to X1, X1X2, X1X3, and measuring X on qubit 1 swaps Z1 for X1', () => {
    const enc = FX.trace[0]
    const t = tableauTrace(toCircuit(3, '000', enc.columns))
    expect(sameStabilizerGroup(t.steps[0], ['+ZII', '+IZI', '+IIZ'])).toBe(true)
    expect(sameStabilizerGroup(t.steps[2], ['+ZII', '+ZZI', '+ZIZ'])).toBe(true)
    expect(sameStabilizerGroup(t.steps[3], ['+XII', '+XXI', '+XIX'])).toBe(true)
    const mx = FX.trace[1]
    const m = tableauTrace(toCircuit(3, '000', mx.columns), '0')
    expect(m.outcomes).toBe('0')
    expect(sameStabilizerGroup(m.steps[3], ['+XII', '+IZI', '+IIZ'])).toBe(true)
    expect(sameStabilizerGroup(tableauTrace(toCircuit(3, '000', mx.columns), '1').steps[3], ['-XII', '+IZI', '+IIZ'])).toBe(true)
  })
  it('the bit-flip cycle ends with the helpers at 11 for certain and the data back in 000 + 111, like the dense run', () => {
    const cyc = FX.trace[2]
    const circuit = toCircuit(5, '00000', cyc.columns)
    const t = tableauTrace(circuit, '11')
    expect(t.outcomes).toBe('11')
    const r = runCircuit({ ...circuit, clbits: 2 }, { outcomes: '11' })
    expect(r.prob).toBeCloseTo(1, 9)
    for (const g of t.steps.at(-1)!) expect(cyc.groups.at(-1)).toContain(g)
    // the data are back in |000> and the helpers read 1 for certain: the group of Z1, Z2, Z3, -Z4, -Z5
    expect(sameStabilizerGroup(t.steps.at(-1)!, ['+ZIIII', '+IZIII', '+IIZII', '-IIIZI', '-IIIIZ'])).toBe(true)
  })
  it('a T gate is refused', () => {
    const bad: Circuit = { version: 1, qubits: 1, columns: [[{ op: 'gate', gate: 'T', targets: [0] }]] }
    expect(() => tableauTrace(bad)).toThrow(/not a Clifford/)
  })
})

describe('the Steane code against X flips', () => {
  it('failures by weight, P_L at three p, and the crossing agree with the twin', () => {
    const code = steaneCode()
    expect(failuresByWeight(code, 'X')).toEqual(FX.threshold.fails)
    for (const [p, v] of Object.entries(FX.threshold.pL)) {
      const [a, b] = p.split('/').map(Number)
      expect(logicalFailure(code, a / b, 'X')).toBeCloseTo(v as number, 12)
    }
    expect(pseudoThreshold(code, 'X')).toBeCloseTo(FX.threshold.pStar, 9)
    expect(pseudoThreshold(code, 'Z')).toBeCloseTo(FX.threshold.pStar, 9)
  })
  it('the code helps below p* and hurts above it', () => {
    const code = steaneCode()
    const ps = pseudoThreshold(code, 'X')
    expect(logicalFailure(code, 0.5 * ps, 'X')).toBeLessThan(0.5 * ps)
    expect(logicalFailure(code, 1.5 * ps, 'X')).toBeGreaterThan(1.5 * ps)
    expect(Pauli.parse('XYZ').weight()).toBe(3)
  })
})
