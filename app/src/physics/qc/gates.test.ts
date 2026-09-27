/**
 * gates.ts against numpy (block "gates": explicit matrices, scipy expm for rotations, kron + permutation matrices for
 * controlled gates, python-loop permutation matrices for oracles, reduce(np.kron, [H]*n), full-matrix products for
 * applyGate on random targets and controls, trace-decomposed Clifford images), plus properties: every gate unitary,
 * applyGate = the full matrix for 40 seeded cases, textbook identities (H² = I, HXH = Z, SWAP = 3 CNOTs, CZ symmetric).
 */
import { describe, expect, it } from 'vitest'
import { c } from '../complex'
import { type Mat, apply, identity, isUnitary, matmul, mscale } from '../linalg'
import { rng } from '../random'
import { permutationMatrix, reversibleOracle } from './bits'
import { randomUnitary } from './cmat'
import {
  GATES_1P,
  GATES_1Q,
  H,
  S,
  SWAP2,
  T,
  X,
  Z,
  applyGate,
  applyOraclePhase,
  applyOracleXor,
  cliffordConj,
  cnot,
  controlled,
  cswap,
  cz,
  isClifford,
  oraclePhase,
  oracleXor,
  pauliString,
  swap,
  toffoli,
  walshHadamard,
} from './gates'
import { embed, randomState } from './state'
import { FX, cm, cv, matGap, vecGap } from './testkit'

const D = FX.gates
const DENSE: Record<string, (...a: number[]) => Mat> = { cnot, cz, swap, toffoli, cswap }

describe('one-qubit gates against explicit and expm-built matrices', () => {
  it('I, X, Y, Z, H, S, S†, T, T† = the explicit numpy matrices', () => {
    for (const [name, M] of Object.entries(D.fixed)) expect(matGap(GATES_1Q[name], cm(M as never)), name).toBeLessThan(1e-15)
  })

  it('P(φ), Rx, Ry, Rz = diag(1, e^{iφ}) and scipy expm(−iθσ/2), including θ = 2π (R(2π) = −I)', () => {
    for (const k of D.params) expect(matGap(GATES_1P[k.gate](k.angle), cm(k.M)), `${k.gate}(${k.angle})`).toBeLessThan(1e-12)
  })

  it('textbook identities: H² = I, HXH = Z, S = T², S² = Z, H = (X + Z)/√2', () => {
    expect(matGap(matmul(H, H), identity(2))).toBeLessThan(1e-15)
    expect(matGap(matmul(matmul(H, X), H), Z)).toBeLessThan(1e-15)
    expect(matGap(matmul(T, T), S)).toBeLessThan(1e-15)
    expect(matGap(matmul(S, S), Z)).toBeLessThan(1e-15)
    expect(matGap(H, mscale(X.map((row, i) => row.map((x, j) => c(x.re + Z[i][j].re, x.im + Z[i][j].im))), Math.SQRT1_2))).toBeLessThan(1e-15)
  })
})

describe('many-qubit gates (q0 = most significant bit)', () => {
  it('cnot, cz, swap, toffoli, cswap on any wires = kron + permutation matrices', () => {
    for (const k of D.dense) expect(matGap(DENSE[k.name](...k.args), cm(k.M)), `${k.name}(${k.args})`).toBeLessThan(1e-15)
  })

  it('CNOT truth table (Bergou 1.9): |10⟩ → |11⟩, |11⟩ → |10⟩; CZ is symmetric; SWAP = three CNOTs (F7 D3)', () => {
    const C = cnot()
    expect(C[3][2]).toEqual(c(1))
    expect(C[2][3]).toEqual(c(1))
    expect(matGap(cz(0, 1), cz(1, 0))).toBe(0)
    expect(matGap(matmul(matmul(cnot(0, 1), cnot(1, 0)), cnot(0, 1)), swap())).toBeLessThan(1e-15)
    expect(matGap(controlled(X, [0], [1], 2), C)).toBe(0)
  })

  it('oracleXor and oraclePhase = numpy permutation/diagonal matrices; oracleXor = permutationMatrix(reversibleOracle(f))', () => {
    for (const k of D.oracles) {
      expect(matGap(oracleXor(k.table, k.nIn), cm(k.xor))).toBe(0)
      expect(matGap(oraclePhase(k.table, k.nIn), cm(k.phase))).toBe(0)
      expect(matGap(oracleXor(k.table, k.nIn), permutationMatrix(reversibleOracle(k.table)))).toBe(0)
      const U = oracleXor(k.table, k.nIn)
      expect(matGap(matmul(U, U), identity(U.length))).toBe(0) // its own inverse (F7 D2)
    }
    expect(matGap(oracleXor((x) => x === 1, 1), cnot())).toBe(0) // f(x) = x makes the f-CNOT a CNOT
  })

  it('walshHadamard(n) = reduce(np.kron, [H]*n)', () => {
    for (const [n, M] of Object.entries(D.walsh)) expect(matGap(walshHadamard(Number(n)), cm(M as never))).toBeLessThan(1e-15)
  })

  it('every gate is unitary', () => {
    const all: Mat[] = [
      ...Object.values(GATES_1Q), ...Object.values(GATES_1P).flatMap((f) => [f(0.3), f(-2.1)]), SWAP2, cnot(2, 0, 3), cz(1, 2, 3),
      swap(0, 2, 3), toffoli(), toffoli(2, 0, 1), cswap(), cswap(1, 2, 0), walshHadamard(3), oracleXor([0, 1, 1, 1], 2), oraclePhase([1, 0, 0, 1, 1, 0, 1, 0], 3),
    ]
    for (const U of all) expect(isUnitary(U, 1e-12)).toBe(true)
  })
})

describe('applyGate (in place, strided) = the full-matrix product', () => {
  it('numpy cases: random k-qubit unitaries on random (unsorted) targets with random controls, n = 3…6', () => {
    for (const k of D.apply) {
      const psi = cv(k.psi)
      const out = applyGate(psi, cm(k.U), k.targets, k.controls)
      expect(out).toBe(psi) // in place
      expect(vecGap(out, cv(k.out))).toBeLessThan(1e-12)
    }
  })

  it('40 seeded cases: applyGate = embed(U) · ψ; the oracle appliers = their matrices', () => {
    const R = rng(7095)
    for (let t = 0; t < 40; t++) {
      const n = 2 + (t % 5)
      const wires = Array.from({ length: n }, (_, i) => i).sort(() => R() - 0.5)
      const k = 1 + Math.floor(R() * Math.min(3, n - 1))
      const nc = Math.floor(R() * (n - k + 1))
      const U = randomUnitary(2 ** k, R)
      const psi = randomState(n, R)
      const want = apply(embed(U, n, wires.slice(0, k), wires.slice(k, k + nc)), psi)
      expect(vecGap(applyGate(psi.slice(), U, wires.slice(0, k), wires.slice(k, k + nc)), want)).toBeLessThan(1e-12)
    }
    const f = [0, 1, 1, 0, 1, 0, 0, 1] as const
    const psi = randomState(4, R)
    expect(vecGap(applyOracleXor(psi.slice(), [...f], [2, 0, 3], 1), apply(embed(oracleXor([...f], 3), 4, [2, 0, 3, 1]), psi))).toBeLessThan(1e-15)
    expect(vecGap(applyOraclePhase(psi.slice(), [...f], [3, 1, 0]), apply(embed(oraclePhase([...f], 3), 4, [3, 1, 0]), psi))).toBeLessThan(1e-15)
  })

  it('works at the 10-qubit cap without a dense matrix: H on every wire then again returns the input', () => {
    const R = rng(7096)
    const psi = randomState(10, R)
    const v = psi.slice()
    for (let q = 0; q < 10; q++) applyGate(v, H, [q])
    for (let q = 9; q >= 0; q--) applyGate(v, H, [q])
    expect(vecGap(v, psi)).toBeLessThan(1e-12)
    expect(() => applyGate(v, H, [10])).toThrow()
    expect(() => applyGate(v, cnot(), [0])).toThrow()
  })
})

describe('Clifford conjugation (Q4 "the Clifford table", Q20)', () => {
  it('U P U† = ±P′ matches numpy for H, S, X, Y, CNOT, CZ, SWAP on every one-wire Pauli', () => {
    const U: Record<string, Mat> = { H, S, X, Y: GATES_1Q.Y, cnot: cnot(), cz: cz(), swap: swap() }
    for (const k of D.clifford) expect(cliffordConj(U[k.gate], k.pauli), `${k.gate}: ${k.pauli}`).toEqual({ sign: k.sign, pauli: k.image })
  })

  it('T is not Clifford: T X T† = (X + Y)/√2 (numpy), not a single Pauli string', () => {
    expect(matGap(matmul(matmul(T, X), GATES_1Q.Tdg), cm(D.tImageOfX))).toBeLessThan(1e-15)
    expect(cliffordConj(T, 'X')).toBeNull()
    expect(isClifford(T)).toBe(false)
    expect(isClifford(H)).toBe(true)
    expect(isClifford(cnot(1, 0))).toBe(true)
    expect(isClifford(toffoli())).toBe(false)
    expect(matGap(pauliString('XZ'), [[0, 0, 1, 0], [0, 0, 0, -1], [1, 0, 0, 0], [0, -1, 0, 0]].map((r) => r.map((x) => c(x))))).toBe(0)
  })
})
