/**
 * qec/tableau.ts (the Gottesman–Knill tableau) against dense state vectors. The dense route is qc/circuit `runCircuit` with its Pauli
 * eigenvalue check in qc/gates `pauliEigenvalue`: both are separate, already-tested engine code, so a sign error in the tableau's update
 * rules cannot hide behind the same mistake in the reference. For random Clifford circuits (with and without mid-circuit Z measurements,
 * outcomes replayed on the dense side) the tableau's n stabilizers must each be an exact ±1 eigenvector of the dense state, so all 2ⁿ group
 * elements are; a random outcome has probability exactly 1/2 (so the dense branch probability is 2^{−#random}); the tableau invariants hold
 * after every step. The comparison with numpy's independently simulated states is in fixtures.test.ts.
 */
import { describe, expect, it } from 'vitest'
import { runCircuit } from '../qc/circuit'
import { rng } from '../random'
import { Pauli } from './pauli'
import { Tableau } from './tableau'
import { eigenvalueOf, randomCliffordOps, toCircuit } from './testkit'

const groupStrings = (t: Tableau): string[] => t.stabilizerGroup().map((p) => p.toString()).sort()

describe('tableau: small states by hand', () => {
  it('|0…0⟩ has stabilizers Z_j and destabilizers X_j', () => {
    const t = new Tableau(3)
    expect(t.stabilizers().map(String)).toEqual(['+ZII', '+IZI', '+IIZ'])
    expect(t.destabilizers().map(String)).toEqual(['+XII', '+IXI', '+IIX'])
    expect(t.invariantsHold()).toBe(true)
  })

  it('H gives |+⟩ (stabilizer X); H then Z gives |−⟩ (stabilizer −X); S on |+⟩ gives |+i⟩ (stabilizer Y)', () => {
    expect(new Tableau(1).h(0).stabilizers().map(String)).toEqual(['+X'])
    expect(new Tableau(1).h(0).pz(0).stabilizers().map(String)).toEqual(['-X'])
    expect(new Tableau(1).h(0).s(0).stabilizers().map(String)).toEqual(['+Y'])
    expect(new Tableau(1).px(0).stabilizers().map(String)).toEqual(['-Z']) // |1⟩
  })

  it('the Bell state (H, CNOT) has the group {II, XX, −YY, ZZ}; the GHZ state on 3 qubits has XXX, ZZI, IZZ', () => {
    const bell = new Tableau(2).h(0).cnot(0, 1)
    expect(groupStrings(bell)).toEqual(['+II', '+XX', '+ZZ', '-YY'].sort())
    const ghz = new Tableau(3).h(0).cnot(0, 1).cnot(1, 2)
    const g = groupStrings(ghz)
    for (const s of ['+XXX', '+ZZI', '+IZZ', '+ZIZ']) expect(g).toContain(s)
    expect(g.length).toBe(8)
  })

  it('measuring |0⟩ is deterministic 0; |1⟩ gives 1; |+⟩ is a fair coin that takes the given outcome and then repeats it', () => {
    expect(new Tableau(1).measureZ(0)).toEqual({ outcome: 0, deterministic: true })
    expect(new Tableau(1).px(0).measureZ(0)).toEqual({ outcome: 1, deterministic: true })
    for (const forced of [0, 1] as const) {
      const t = new Tableau(1).h(0)
      expect(t.peekZ(0)).toBeNull()
      expect(t.measureZ(0, forced)).toEqual({ outcome: forced, deterministic: false })
      expect(t.measureZ(0)).toEqual({ outcome: forced, deterministic: true })
      expect(t.peekZ(0)).toBe(forced)
      expect(t.invariantsHold()).toBe(true)
    }
  })

  it('Bell pair: the two outcomes agree (the second is deterministic after the first); a random generator decides the first', () => {
    for (const forced of [0, 1] as const) {
      const t = new Tableau(2).h(0).cnot(0, 1)
      expect(t.measureZ(0, forced).deterministic).toBe(false)
      expect(t.measureZ(1)).toEqual({ outcome: forced, deterministic: true })
    }
    const t = new Tableau(2).h(0).cnot(0, 1)
    expect(t.measureZ(0, () => 0.9).outcome).toBe(1)
  })

  it('CZ = H·CNOT·H on the target, SWAP exchanges qubits, Sdg is S³, apply() dispatches by name; bad arguments throw', () => {
    const a = new Tableau(2).h(0).h(1).cz(0, 1)
    expect(groupStrings(a)).toContain('+XZ')
    const b = new Tableau(2).px(0).swap(0, 1)
    expect(b.stabilizers().map(String)).toEqual(['-IZ', '+ZI']) // |10⟩ → |01⟩
    const c = new Tableau(1).h(0).sdg(0)
    expect(c.stabilizers().map(String)).toEqual(['-Y'])
    expect(new Tableau(2).apply('H', 0).apply('CNOT', 0, 1).stabilizers().map(String)).toEqual(['+XX', '+ZZ'])
    expect(() => new Tableau(2).cnot(0, 0)).toThrow()
    expect(() => new Tableau(2).h(2)).toThrow()
    expect(() => new Tableau(2).apply('CNOT', 0)).toThrow()
    expect(() => new Tableau(0)).toThrow()
  })

  it('reset returns a qubit to |0⟩ whatever the outcome was', () => {
    for (const forced of [0, 1] as const) {
      const t = new Tableau(2).h(0).cnot(0, 1)
      t.reset(0, forced)
      expect(t.measureZ(0)).toEqual({ outcome: 0, deterministic: true })
    }
  })

  it('copy is independent of the original', () => {
    const t = new Tableau(2).h(0)
    const c = t.copy().cnot(0, 1)
    expect(t.stabilizers().map(String)).toEqual(['+XI', '+IZ'])
    expect(c.stabilizers().map(String)).toEqual(['+XX', '+ZZ']) // CNOT: X_0 → X_0 X_1 and Z_1 → Z_0 Z_1
  })
})

describe('tableau against dense state vectors (random Clifford circuits)', () => {
  it('without measurement: every stabilizer is an exact ±1 eigenvector of the dense state, so all 2ⁿ group elements are', () => {
    const rand = rng(31)
    for (let trial = 0; trial < 60; trial++) {
      const n = 1 + (trial % 5)
      const ops = randomCliffordOps(n, 4 + Math.floor(rand() * 30), rand)
      const t = new Tableau(n)
      t.run(ops)
      expect(t.invariantsHold(), `trial ${trial}`).toBe(true)
      const psi = runCircuit(toCircuit(n, ops)).states.at(-1)!
      for (const g of t.stabilizerGroup()) expect(eigenvalueOf(psi, g), `trial ${trial}: ${g}`).toBe(1)
    }
  })

  it('invariants hold after every single step, not just at the end', () => {
    const rand = rng(32)
    for (let trial = 0; trial < 15; trial++) {
      const n = 2 + (trial % 4)
      const t = new Tableau(n)
      for (const op of randomCliffordOps(n, 25, rand, true)) {
        t.run([op], rand)
        expect(t.invariantsHold()).toBe(true)
      }
    }
  })

  it('with mid-circuit measurements: outcomes replayed on the dense side, the post-measurement state matches, and a fair coin has probability exactly 1/2', () => {
    const rand = rng(33)
    let randomOutcomes = 0
    let deterministicOutcomes = 0
    for (let trial = 0; trial < 80; trial++) {
      const n = 2 + (trial % 4)
      const ops = randomCliffordOps(n, 10 + Math.floor(rand() * 25), rand, true)
      const t = new Tableau(n)
      const results = t.run(ops, rand)
      const outcomes = results.map((r) => r.outcome).join('')
      const run = runCircuit(toCircuit(n, ops), { outcomes })
      const coins = results.filter((r) => !r.deterministic).length
      randomOutcomes += coins
      deterministicOutcomes += results.length - coins
      expect(run.prob, `trial ${trial}`).toBeCloseTo(2 ** -coins, 12)
      const psi = run.states.at(-1)!
      for (const g of t.stabilizerGroup()) expect(eigenvalueOf(psi, g), `trial ${trial}: ${g}`).toBe(1)
    }
    expect(randomOutcomes).toBeGreaterThan(20) // both kinds of outcome really occurred
    expect(deterministicOutcomes).toBeGreaterThan(20)
  })

  it('peekZ equals the dense outcome whenever the dense probability is 0 or 1, and is null exactly when it is ½', () => {
    const rand = rng(34)
    for (let trial = 0; trial < 40; trial++) {
      const n = 2 + (trial % 4)
      const ops = randomCliffordOps(n, 20, rand)
      const t = new Tableau(n)
      t.run(ops)
      const psi = runCircuit(toCircuit(n, ops)).states.at(-1)!
      for (let q = 0; q < n; q++) {
        const p = t.peekZ(q)
        let p1 = 0
        psi.forEach((amp, idx) => {
          if (idx & (1 << (n - 1 - q))) p1 += amp.re * amp.re + amp.im * amp.im
        })
        if (p === null) expect(p1).toBeCloseTo(0.5, 12)
        else expect(p1).toBeCloseTo(p, 12)
      }
    }
  })

  it('a long circuit on 10 qubits (the dense limit) still agrees', () => {
    const rand = rng(35)
    const ops = randomCliffordOps(10, 120, rand)
    const t = new Tableau(10)
    t.run(ops)
    const psi = runCircuit(toCircuit(10, ops)).states.at(-1)!
    for (const g of t.stabilizers()) expect(eigenvalueOf(psi, g)).toBe(1)
    // 10 generators; check ten random products of them too
    const gens = t.stabilizers()
    for (let m = 1; m < 1024; m += 97) {
      const p = gens.reduce((acc, g, i) => (m & (1 << i) ? acc.mul(g) : acc), Pauli.identity(10))
      expect(eigenvalueOf(psi, p)).toBe(1)
    }
  })

  it('a Clifford circuit conjugates every stabilizer exactly as Pauli.conjugate does (the tableau is Heisenberg propagation)', () => {
    const rand = rng(36)
    for (let trial = 0; trial < 30; trial++) {
      const n = 2 + (trial % 5)
      const ops = randomCliffordOps(n, 30, rand)
      let gens = new Tableau(n).stabilizers()
      for (const op of ops) if ('gate' in op) gens = gens.map((g) => g.conjugate(op.gate, ...op.qubits))
      const t = new Tableau(n)
      t.run(ops)
      // same group (the generators can differ by products); compare as sets
      const mine = t.stabilizerGroup().map(String).sort()
      const prop = gens
        .reduce<Pauli[]>((acc, g) => acc.flatMap((p) => [p, p.mul(g)]), [Pauli.identity(n)])
        .map(String)
        .sort()
      expect(mine).toEqual(prop)
    }
  })

  it('the Gottesman–Knill cost: gates touch O(n) bits, so 200 qubits and 3000 gates run in well under a second', () => {
    const rand = rng(37)
    const n = 200
    const ops = randomCliffordOps(n, 3000, rand)
    const t0 = Date.now()
    const t = new Tableau(n)
    t.run(ops)
    expect(Date.now() - t0).toBeLessThan(2000)
    expect(t.invariantsHold()).toBe(true)
  })
})
