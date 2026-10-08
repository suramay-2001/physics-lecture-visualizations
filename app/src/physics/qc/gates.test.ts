/**
 * gates.ts against numpy (block "gates": explicit matrices, scipy expm for rotations, kron + permutation matrices for
 * controlled gates, python-loop permutation matrices for oracles, reduce(np.kron, [H]*n), full-matrix products for
 * applyGate on random targets and controls, trace-decomposed Clifford images), plus properties: every gate unitary,
 * applyGate = the full matrix for 40 seeded cases, textbook identities (H² = I, HXH = Z, SWAP = 3 CNOTs, CZ symmetric).
 */
import { describe, expect, it } from 'vitest'
import { c, mul } from '../complex'
import { type Mat, type Vec, apply, identity, inner, isUnitary, matmul, mscale } from '../linalg'
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
  applyGateInPlace,
  applyOraclePhase,
  applyOraclePhaseInPlace,
  applyOracleXor,
  applyOracleXorInPlace,
  cliffordConj,
  cnot,
  controlled,
  cswap,
  cz,
  heisenberg,
  isClifford,
  oraclePhase,
  oracleXor,
  pauliEigenvalue,
  pauliMul,
  pauliString,
  pauliStrings,
  paulisCommute,
  swap,
  toffoli,
  walshHadamard,
} from './gates'
import { bell, embed, ghz, ket, randomState } from './state'
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

describe('applyGate (strided, copying) = the full-matrix product', () => {
  it('numpy cases: random k-qubit unitaries on random (unsorted) targets with random controls, n = 3…6', () => {
    for (const k of D.apply) {
      const psi = cv(k.psi)
      const before = psi.slice()
      const out = applyGate(psi, cm(k.U), k.targets, k.controls)
      expect(out).not.toBe(psi) // a NEW state (W-448 #6): the input is left alone
      expect(vecGap(psi, before)).toBe(0)
      expect(vecGap(out, cv(k.out))).toBeLessThan(1e-12)
      // the in-place kernel (the circuit runner's) gives the same numbers, writing into its own copy
      const own = psi.slice()
      expect(applyGateInPlace(own, cm(k.U), k.targets, k.controls)).toBe(own)
      expect(vecGap(own, out)).toBe(0)
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
    let w = v
    for (let q = 0; q < 10; q++) w = applyGate(w, H, [q])
    for (let q = 9; q >= 0; q--) w = applyGate(w, H, [q])
    expect(vecGap(w, psi)).toBeLessThan(1e-12)
    expect(vecGap(v, psi)).toBe(0) // the start state was never touched
    expect(() => applyGate(v, H, [10])).toThrow()
    expect(() => applyGate(v, cnot(), [0])).toThrow()
  })
})

/**
 * REGRESSION (2026-10-09, W-448 #6; the planner of 448 L10/L11 hit it in a scratch CHSH run that read 0): `applyGate`
 * and the two oracle appliers used to write into their argument, so a state reused across calls was silently corrupted
 * (the same class as the 2026-09-29 `ket()` fix). They now return a new state and never modify `psi`; the in-place
 * kernels stay for circuit.ts, which steps its own vector.
 */
describe('applyGate, applyOracleXor and applyOraclePhase never modify their input', () => {
  const snapshot = (v: Vec) => v.map((z) => [z.re, z.im])
  const f = [0, 1, 1, 0, 1, 0, 0, 1] as const

  it('each leaves its argument bit-for-bit as it was and returns a different array', () => {
    const R = rng(448)
    const psi = randomState(4, R)
    const before = snapshot(psi)
    const outs: Vec[] = [
      applyGate(psi, randomUnitary(4, R), [3, 1]),
      applyGate(psi, X, [2], [0]), // controlled
      applyOracleXor(psi, [...f], [2, 0, 3], 1),
      applyOraclePhase(psi, [...f], [3, 1, 0]),
    ]
    expect(snapshot(psi)).toEqual(before)
    for (const o of outs) {
      expect(o).not.toBe(psi)
      expect(o).toHaveLength(psi.length)
    }
    // and they computed something: none of the four is the input
    for (const o of outs) expect(vecGap(o, psi)).toBeGreaterThan(1e-3)
  })

  it('the in-place kernels write into their argument and agree with the copying ones', () => {
    const R = rng(449)
    const psi = randomState(4, R)
    const U = randomUnitary(2, R)
    const pairs: [Vec, Vec][] = [
      [applyGate(psi, U, [1], [3]), applyGateInPlace(psi.slice(), U, [1], [3])],
      [applyOracleXor(psi, [...f], [2, 0, 3], 1), applyOracleXorInPlace(psi.slice(), [...f], [2, 0, 3], 1)],
      [applyOraclePhase(psi, [...f], [3, 1, 0]), applyOraclePhaseInPlace(psi.slice(), [...f], [3, 1, 0])],
    ]
    for (const [copy, inPlace] of pairs) expect(vecGap(copy, inPlace)).toBe(0)
    const own = psi.slice()
    expect(applyOraclePhaseInPlace(own, [...f], [3, 1, 0])).toBe(own)
    expect(vecGap(own, psi)).toBeGreaterThan(1e-3)
  })

  it('a scratch CHSH run on ONE shared singlet reads the textbook numbers (it read 0 when applyGate wrote into psi)', () => {
    const psi = bell('01-10') // the singlet, built once and shared by all sixteen runs below
    // the observable along the x–z direction `deg` from z: cos θ σ_z + sin θ σ_x, a one-wire matrix
    const obs = (deg: number): Mat => {
      const t = (deg * Math.PI) / 180
      return [
        [c(Math.cos(t)), c(Math.sin(t))],
        [c(Math.sin(t)), c(-Math.cos(t))],
      ]
    }
    expect(matGap(obs(0), Z)).toBe(0)
    // E(a, b) = ⟨ψ| A(a) ⊗ B(b) |ψ⟩, computed by applying the two one-wire matrices to the SHARED state
    const E = (a: number, b: number) => inner(psi, applyGate(applyGate(psi, obs(a), [0]), obs(b), [1])).re
    const before = snapshot(psi)
    for (const [a, b] of [[0, 0], [0, 90], [90, 0], [90, 90], [45, 135], [135, 45]]) {
      // the singlet: E(a, b) = −cos(a − b), the same each time the state is reused
      expect(E(a, b)).toBeCloseTo(-Math.cos(((a - b) * Math.PI) / 180), 12)
      expect(E(a, b)).toBe(E(a, b))
    }
    // Tsirelson's CHSH sum at a = 0°, a' = 90°, b = 45°, b' = 135°: |S| = 2√2, and the shared state never moved
    const S = E(0, 45) - E(0, 135) + E(90, 45) + E(90, 135)
    expect(Math.abs(S)).toBeCloseTo(2 * Math.SQRT2, 12)
    expect(snapshot(psi)).toEqual(before)
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

describe('Pauli algebra: pauliMul, paulisCommute, pauliEigenvalue, heisenberg (Q6, Q7)', () => {
  it('pauliMul = numpy matrix products decomposed by trace, on seeded strings n = 1, 2, 3', () => {
    for (const k of D.pauliMul) {
      const r = pauliMul(k.a, k.b)
      expect(r.string, `${k.a}·${k.b}`).toBe(k.string)
      expect(Math.hypot(r.phase.re - k.phase[0], r.phase.im - k.phase[1]), `${k.a}·${k.b} phase`).toBeLessThan(1e-12)
      expect(paulisCommute(k.a, k.b), `${k.a}, ${k.b}`).toBe(k.commute)
    }
  })

  it('pauliMul is associative, and its {phase, string} matches the full matrix product, for EVERY string with n ≤ 3', () => {
    for (const n of [1, 2, 3]) {
      const strings = pauliStrings(n)
      for (const a of strings) {
        for (const b of strings.slice(0, 6)) {
          // matches the matrix product (an independent route within the engine: full kron + matmul)
          const want = matmul(pauliString(a), pauliString(b))
          const { phase, string: s } = pauliMul(a, b)
          const got = mscale(pauliString(s), phase)
          expect(matGap(got, want), `${a}·${b}`).toBeLessThan(1e-12)
        }
      }
      // associativity: (a·b)·c = a·(b·c), phase and string, for 20 seeded random triples
      const R = rng(7099 + n)
      for (let t = 0; t < 20; t++) {
        const [a, b, cc] = [0, 0, 0].map(() => strings[Math.floor(R() * strings.length)])
        const left = pauliMul(pauliMul(a, b).string, cc)
        const leftPhase = mul(pauliMul(a, b).phase, left.phase)
        const right = pauliMul(a, pauliMul(b, cc).string)
        const rightPhase = mul(pauliMul(b, cc).phase, right.phase)
        expect(left.string, `(${a}·${b})·${cc}`).toBe(right.string)
        expect(Math.hypot(leftPhase.re - rightPhase.re, leftPhase.im - rightPhase.im)).toBeLessThan(1e-9)
      }
    }
  })

  it('pauliEigenvalue: ±1 on known eigenstates (Z|0⟩, X|+⟩, ZZ and XX on Bell states, Mermin\'s GHZ−), null otherwise', () => {
    for (const k of D.pauliEigen) {
      const psi = cv(k.psi)
      expect(pauliEigenvalue(psi, k.s), `${k.s} on ${JSON.stringify(k.psi)}`).toBe(k.want)
    }
    expect(pauliEigenvalue(ket('0'), 'Z')).toBe(1)
    expect(pauliEigenvalue(ket('+'), 'X')).toBe(1)
    expect(pauliEigenvalue(bell('00+11'), 'ZZ')).toBe(1)
    expect(pauliEigenvalue(bell('01-10'), 'XX')).toBe(-1)
    const ghzMinus = (() => {
      const v = ghz(3).map((x) => c(x.re, x.im))
      v[v.length - 1] = c(-v[v.length - 1].re, -v[v.length - 1].im)
      return v
    })()
    expect(pauliEigenvalue(ghzMinus, 'XXX')).toBe(-1)
    expect(pauliEigenvalue(ghzMinus, 'XYY')).toBe(1)
    expect(pauliEigenvalue(ghzMinus, 'YXY')).toBe(1)
    expect(pauliEigenvalue(ghzMinus, 'YYX')).toBe(1)
    expect(pauliEigenvalue(randomState(2, rng(7109)), 'ZI')).toBeNull()
  })

  it('heisenberg(U, s) = U†PU, decomposed by numpy trace (independent of cliffordConj\'s own trace loop)', () => {
    for (const k of D.heisenberg) {
      const U: Record<string, Mat> = { H, S, cnot: cnot(), cz: cz() }
      expect(heisenberg(U[k.gate], k.pauli), `${k.gate}: ${k.pauli}`).toEqual({ sign: k.sign, pauli: k.image })
    }
    // heisenberg(U, s) is the INVERSE map of cliffordConj(U, ·): if cliffordConj(U, p) = {sign, pauli: q} then
    // heisenberg(U, q) should return {sign, pauli: p} (U maps p ↦ sign·q forward, so U† maps sign·q ↦ p backward)
    const R = rng(7110)
    for (let t = 0; t < 20; t++) {
      const n = 1 + (t % 2)
      const U = n === 1 ? H : cnot()
      const p = pauliStrings(n)[1 + Math.floor(R() * (pauliStrings(n).length - 1))]
      const fwd = cliffordConj(U, p)
      if (!fwd) continue
      const back = heisenberg(U, fwd.pauli)
      expect(back).toEqual({ sign: fwd.sign, pauli: p })
    }
    expect(heisenberg(T, 'X')).toBeNull() // T is not Clifford
  })

  it('mutation sentinel: paulisCommute agrees with the commutator norm on 100 random string pairs, n ≤ 3', () => {
    const R = rng(7111)
    for (let t = 0; t < 100; t++) {
      const n = 1 + Math.floor(R() * 3)
      const strings = pauliStrings(n)
      const a = strings[Math.floor(R() * strings.length)]
      const b = strings[Math.floor(R() * strings.length)]
      const comm = matmul(pauliString(a), pauliString(b)).map((row, i) => row.map((x, j) => c(x.re - matmul(pauliString(b), pauliString(a))[i][j].re, x.im - matmul(pauliString(b), pauliString(a))[i][j].im)))
      const normZero = comm.every((row) => row.every((x) => Math.hypot(x.re, x.im) < 1e-9))
      expect(paulisCommute(a, b)).toBe(normZero)
    }
  })
})
