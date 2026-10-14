/**
 * qec/pauli.ts against matrices. The engine multiplies Pauli strings by adding symplectic vectors and a phase exponent; here every
 * product, commutation and Clifford conjugation is compared with the 2ⁿ × 2ⁿ matrix route from qc/gates.ts (`pauliString`, `cnot`, `cz`, `swap`)
 * and qc/state.ts (`embed`), which are tested separately and share no code with pauli.ts. The locked conventions (q0 leftmost; Hermitian
 * letters with Y = iXZ; phase = exponent of i) are asserted by name.
 */
import { describe, expect, it } from 'vitest'
import { type C, c } from '../complex'
import { type Mat, matEq, matmul, mscale, dagger } from '../linalg'
import { H as H2, S as S2, Sdg as Sdg2, X as X2, Y as Y2, Z as Z2, cnot, cz, paulisCommute, pauliMul, pauliString, pauliStrings, swap } from '../qc/gates'
import { embed } from '../qc/state'
import { rng } from '../random'
import { LETTERS, type CliffordGate, type Letter, Pauli, lettersOf, product, symplecticDot, symplecticProduct, symplecticSupport } from './pauli'

const IPOW: C[] = [c(1), c(0, 1), c(-1), c(0, -1)]
/** The matrix of a Pauli with its phase: i^phase times the Kronecker product of the letters. */
const dense = (p: Pauli): Mat => mscale(pauliString(p.letters().join('')), IPOW[p.phase])

const allStrings = (n: number): Pauli[] => pauliStrings(n).map((s) => Pauli.parse(s))

function randomPauli(n: number, rand: () => number, anyPhase = true): Pauli {
  const letters = Array.from({ length: n }, () => LETTERS[Math.floor(rand() * 4)])
  return Pauli.fromLetters(letters, anyPhase ? Math.floor(rand() * 4) : 2 * Math.floor(rand() * 2))
}

describe('pauli: strings and symplectic vectors', () => {
  it('parses and prints the whole Pauli group, with the sign convention +, +i, −, −i', () => {
    expect(Pauli.parse('XZIY').toString()).toBe('+XZIY')
    expect(Pauli.parse('-XZIY').toString()).toBe('-XZIY')
    expect(Pauli.parse('iXZ').toString()).toBe('+iXZ')
    expect(Pauli.parse('-i XZ').toString()).toBe('-iXZ')
    expect(Pauli.parse('+XZ').phase).toBe(0)
    expect(Pauli.parse('-XZ').phase).toBe(2)
    expect(Pauli.parse('iXZ').phase).toBe(1)
    expect(Pauli.parse('-iXZ').phase).toBe(3)
    expect(() => Pauli.parse('XAZ')).toThrow()
  })

  it('the symplectic vector (x | z) has I = (0,0), X = (1,0), Z = (0,1), Y = (1,1), and round-trips', () => {
    const p = Pauli.parse('IXZY')
    expect(p.symplectic()).toEqual([0, 1, 0, 1, 0, 0, 1, 1])
    expect(Pauli.fromSymplectic(p.symplectic()).equals(p)).toBe(true)
    expect(lettersOf(p.symplectic())).toEqual(['I', 'X', 'Z', 'Y'])
    expect(symplecticSupport(p.symplectic())).toEqual([1, 2, 3])
    expect(p.weight()).toBe(3)
    expect(p.support()).toEqual([1, 2, 3])
    expect(() => Pauli.fromSymplectic([1, 0, 1])).toThrow()
  })

  it('single / identity / sign / hermitian behave', () => {
    expect(Pauli.single(4, 2, 'Z').toString()).toBe('+IIZI')
    expect(Pauli.identity(3).toString()).toBe('+III')
    expect(Pauli.parse('-XZ').sign()).toBe(-1)
    expect(Pauli.parse('XZ').sign()).toBe(1)
    expect(() => Pauli.parse('iXZ').sign()).toThrow()
    expect(Pauli.parse('-XZ').isHermitian()).toBe(true)
    expect(Pauli.parse('iXZ').isHermitian()).toBe(false)
    expect(Pauli.parse('XZ').negate().toString()).toBe('-XZ')
    expect(() => Pauli.single(3, 3, 'X')).toThrow()
  })
})

describe('pauli: products', () => {
  it('the single-qubit table: XZ = −iY, ZX = +iY, XY = iZ, YX = −iZ, YZ = iX, ZY = −iX, and every square is +I', () => {
    const t = (a: Letter, b: Letter) => Pauli.single(1, 0, a).mul(Pauli.single(1, 0, b)).toString()
    expect(t('X', 'Z')).toBe('-iY')
    expect(t('Z', 'X')).toBe('+iY')
    expect(t('X', 'Y')).toBe('+iZ')
    expect(t('Y', 'X')).toBe('-iZ')
    expect(t('Y', 'Z')).toBe('+iX')
    expect(t('Z', 'Y')).toBe('-iX')
    for (const l of LETTERS) expect(t(l, l)).toBe('+I')
  })

  it('agrees with qc/gates pauliMul on every pair of strings on 1, 2 and 3 qubits', () => {
    for (const n of [1, 2, 3]) {
      const all = allStrings(n)
      for (const a of all)
        for (const b of all) {
          const mine = a.mul(b)
          const ref = pauliMul(a.letters().join(''), b.letters().join(''))
          expect(mine.letters().join('')).toBe(ref.string)
          const want = ref.phase
          expect(IPOW[mine.phase].re).toBeCloseTo(want.re, 12)
          expect(IPOW[mine.phase].im).toBeCloseTo(want.im, 12)
        }
    }
  })

  it('P·Q equals the matrix product of the matrices, for random Paulis with any phase on 1 to 4 qubits', () => {
    const rand = rng(21)
    for (let t = 0; t < 150; t++) {
      const n = 1 + (t % 4)
      const a = randomPauli(n, rand)
      const b = randomPauli(n, rand)
      expect(matEq(dense(a.mul(b)), matmul(dense(a), dense(b)), 1e-12), `${a} · ${b}`).toBe(true)
    }
  })

  it('associativity, P·P = ±I for Hermitian P, the identity is neutral, and a mismatch of sizes throws', () => {
    const rand = rng(22)
    for (let t = 0; t < 100; t++) {
      const n = 1 + (t % 6)
      const a = randomPauli(n, rand)
      const b = randomPauli(n, rand)
      const d = randomPauli(n, rand)
      expect(a.mul(b).mul(d).equals(a.mul(b.mul(d)))).toBe(true)
      expect(a.mul(Pauli.identity(n)).equals(a)).toBe(true)
      const h = randomPauli(n, rand, false)
      expect(h.mul(h).equals(Pauli.identity(n))).toBe(true) // (±P)² = +I
    }
    expect(() => Pauli.identity(2).mul(Pauli.identity(3))).toThrow()
    expect(product([Pauli.parse('XI'), Pauli.parse('IZ'), Pauli.parse('XI')]).toString()).toBe('+IZ')
    expect(product([], 3).toString()).toBe('+III')
  })
})

describe('pauli: commutation', () => {
  it('symplecticProduct is 1 exactly when the matrices anticommute (all pairs on 2 qubits) and matches paulisCommute from qc/gates', () => {
    const all = allStrings(2)
    for (const a of all)
      for (const b of all) {
        const A = dense(a)
        const B = dense(b)
        const comm = matEq(matmul(A, B), matmul(B, A), 1e-12)
        expect(symplecticProduct(a, b) === 0, `${a} ${b}`).toBe(comm)
        expect(a.commutesWith(b)).toBe(comm)
        expect(paulisCommute(a.letters().join(''), b.letters().join(''))).toBe(comm)
        expect(symplecticDot(a.symplectic(), b.symplectic())).toBe(symplecticProduct(a, b))
      }
  })

  it('XX and ZZ commute (two anticommutations cancel), XI and ZI do not, XXXX and ZZII commute', () => {
    expect(Pauli.parse('XX').commutesWith(Pauli.parse('ZZ'))).toBe(true)
    expect(Pauli.parse('XI').commutesWith(Pauli.parse('ZI'))).toBe(false)
    expect(Pauli.parse('XXXX').commutesWith(Pauli.parse('ZZII'))).toBe(true)
  })
})

describe('pauli: conjugation by Clifford gates', () => {
  const embed1 = (U: Mat, q: number, n: number): Mat => embed(U, n, [q])
  const gates1: [CliffordGate, Mat][] = [
    ['H', H2],
    ['S', S2],
    ['Sdg', Sdg2],
    ['X', X2],
    ['Y', Y2],
    ['Z', Z2],
  ]

  it('the one-qubit rules match U P U† for every string with every phase, on 1 and 3 qubits and every wire', () => {
    for (const n of [1, 3])
      for (const [name, U1] of gates1)
        for (let q = 0; q < n; q++) {
          const U = embed1(U1, q, n)
          for (const p of allStrings(n))
            for (const ph of [0, 1, 2, 3]) {
              const P = p.withPhase(ph)
              const want = matmul(matmul(U, dense(P)), dagger(U))
              expect(matEq(dense(P.conjugate(name, q)), want, 1e-12), `${name}_${q} on ${P}`).toBe(true)
            }
        }
  })

  it('CNOT, CZ and SWAP match U P U† for every string on 2 and 3 qubits and every ordered wire pair', () => {
    for (const n of [2, 3])
      for (let a = 0; a < n; a++)
        for (let b = 0; b < n; b++) {
          if (a === b) continue
          const mats: [CliffordGate, Mat][] = [
            ['CNOT', cnot(a, b, n)],
            ['CZ', cz(a, b, n)],
            ['SWAP', swap(a, b, n)],
          ]
          for (const [name, U] of mats)
            for (const p of allStrings(n)) {
              const P = p.withPhase(1)
              const want = matmul(matmul(U, dense(P)), dagger(U))
              expect(matEq(dense(P.conjugate(name, a, b)), want, 1e-12), `${name}(${a},${b}) on ${P}`).toBe(true)
            }
        }
  })

  it('named single facts: H: X→Z, Y→−Y; S: X→Y, Y→−X; CNOT: XI→XX, IZ→ZZ, and conjugation preserves commutation', () => {
    expect(Pauli.parse('X').conjugate('H', 0).toString()).toBe('+Z')
    expect(Pauli.parse('Y').conjugate('H', 0).toString()).toBe('-Y')
    expect(Pauli.parse('X').conjugate('S', 0).toString()).toBe('+Y')
    expect(Pauli.parse('Y').conjugate('S', 0).toString()).toBe('-X')
    expect(Pauli.parse('XI').conjugate('CNOT', 0, 1).toString()).toBe('+XX')
    expect(Pauli.parse('IZ').conjugate('CNOT', 0, 1).toString()).toBe('+ZZ')
    const rand = rng(23)
    for (let t = 0; t < 100; t++) {
      const a = randomPauli(4, rand)
      const b = randomPauli(4, rand)
      const gate: CliffordGate = (['H', 'S', 'CNOT', 'CZ'] as const)[t % 4]
      const wires = gate === 'CNOT' || gate === 'CZ' ? [t % 4, (t + 1 + (t % 3)) % 4] : [t % 4]
      if (wires.length === 2 && wires[0] === wires[1]) continue
      expect(a.conjugate(gate, ...wires).commutesWith(b.conjugate(gate, ...wires))).toBe(a.commutesWith(b))
      expect(a.mul(b).conjugate(gate, ...wires).equals(a.conjugate(gate, ...wires).mul(b.conjugate(gate, ...wires)))).toBe(true)
    }
  })

  it('refuses a wire outside the register, the wrong number of wires, and a repeated wire', () => {
    expect(() => Pauli.identity(2).conjugate('H', 2)).toThrow()
    expect(() => Pauli.identity(2).conjugate('CNOT', 0)).toThrow()
    expect(() => Pauli.identity(2).conjugate('CNOT', 1, 1)).toThrow()
  })

  it('permuted moves letters: letter j goes to qubit perm[j]', () => {
    expect(Pauli.parse('XYZ').permuted([2, 0, 1]).toString()).toBe('+YZX')
    expect(() => Pauli.parse('XYZ').permuted([0, 1])).toThrow()
  })
})
