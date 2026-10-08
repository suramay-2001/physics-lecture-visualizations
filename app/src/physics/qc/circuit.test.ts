/**
 * circuit.ts against an independent numpy interpreter of the same JSON (block "circuit": every column as a product
 * of explicit kron/permutation matrices; measurement branches by explicit projectors). Fixtures: Deutsch for all four
 * f, the Bell circuit, the four teleportation branches, Deutsch–Jozsa n = 3 (five oracles), the 3-qubit QFT against
 * np.fft, four random circuits (n = 3…6) and a random circuit with mid-circuit measurement and classical control.
 * Properties: JSON round-trips; validateCircuit rejects malformed input with a reason and never throws (fuzzed).
 */
import { describe, expect, it } from 'vitest'
import { c } from '../complex'
import { identity, matmul } from '../linalg'
import { rng } from '../random'
import {
  type Circuit,
  branches,
  circuitUnitary,
  columnUnitary,
  measurementCount,
  parseCircuit,
  runCircuit,
  serializeCircuit,
  validateCircuit,
} from './circuit'
import { KET } from '../spin'
import { reducedDensity } from './density'
import { marginal } from './measure'
import { ket } from './state'
import { FX, cm, cv, matGap, vecGap } from './testkit'

const D = FX.circuit
const valid = (x: unknown): Circuit => {
  const v = validateCircuit(x)
  if (!v.ok) throw new Error(v.reason)
  return v.circuit
}

describe('fixture circuits run column by column exactly as the numpy interpreter', () => {
  it('Deutsch, all four f: every column state; P(q0 = 1) is 0 for constant f and 1 for balanced f (Bergou §1.4)', () => {
    for (const k of D.deutsch) {
      const run = runCircuit(valid(k.circuit))
      expect(run.states.length).toBe(k.states.length)
      run.states.forEach((s, i) => expect(vecGap(s, cv(k.states[i])), `${k.f} column ${i}`).toBeLessThan(1e-12))
      expect(Math.abs(marginal(run.states.at(-1)!, [0])[1] - k.pQ0is1)).toBeLessThan(1e-12)
      expect(k.pQ0is1).toBeCloseTo(k.f === 'zero' || k.f === 'one' ? 0 : 1, 12)
      const bs = branches(k.circuit)
      expect(bs.length).toBe(1)
      expect(bs[0].outcomes).toBe(k.pQ0is1 > 0.5 ? '1' : '0')
      expect(bs[0].prob).toBeCloseTo(1, 12)
    }
  })

  it('the Bell circuit: H then CNOT takes |00⟩ to (|00⟩ + |11⟩)/√2, column by column', () => {
    runCircuit(D.bell.circuit).states.forEach((s, i) => expect(vecGap(s, cv(D.bell.states[i]))).toBeLessThan(1e-15))
  })

  it('teleportation: four branches of probability ¼, final states = numpy, qubit 2 always ends in ψ', () => {
    const T = D.teleport
    const bs = branches(T.circuit, { psi0: cv(T.psi0) })
    expect(bs.map((b) => b.outcomes)).toEqual(T.branches.map((b: { outcomes: string }) => b.outcomes))
    const psi = cv(T.psi)
    const target = psi.map((a) => psi.map((b) => c(a.re * b.re + a.im * b.im, a.im * b.re - a.re * b.im)))
    bs.forEach((b, i) => {
      const f = T.branches[i]
      expect(b.prob).toBeCloseTo(0.25, 12)
      expect(Math.abs(b.prob - f.prob)).toBeLessThan(1e-12)
      expect(b.bits).toBe(f.bits)
      expect(vecGap(b.states.at(-1)!, cv(f.final))).toBeLessThan(1e-12)
      expect(matGap(reducedDensity(b.states.at(-1)!, [2]), cm(f.q2))).toBeLessThan(1e-12)
      expect(matGap(reducedDensity(b.states.at(-1)!, [2]), target)).toBeLessThan(1e-12)
      // the same branch, forced through runCircuit(outcomes)
      const run = runCircuit(T.circuit, { psi0: cv(T.psi0), outcomes: b.outcomes })
      expect(vecGap(run.states.at(-1)!, b.states.at(-1)!)).toBeLessThan(1e-15)
      expect(run.prob).toBeCloseTo(b.prob, 14)
    })
    expect(branches(T.circuit, { psi0: cv(T.psi0) }).reduce((s, b) => s + b.prob, 0)).toBeCloseTo(1, 12)
  })

  it('Deutsch–Jozsa n = 3: states per column; P(inputs = 000) is 1 for constant and 0 for balanced oracles', () => {
    for (const k of D.dj3) {
      const run = runCircuit(k.circuit)
      run.states.forEach((s, i) => expect(vecGap(s, cv(k.states[i])), `${k.f} column ${i}`).toBeLessThan(1e-12))
      const p000 = marginal(run.states.at(-1)!, [0, 1, 2])[0]
      expect(Math.abs(p000 - k.pAll0)).toBeLessThan(1e-12)
      expect(p000).toBeCloseTo(k.f.startsWith('constant') ? 1 : 0, 12)
    }
  })

  it('the 3-qubit QFT circuit (H, controlled P(π/2), P(π/4), SWAP): circuitUnitary = the column product = the DFT (np.fft)', () => {
    const U = circuitUnitary(D.qft3.circuit)
    expect(matGap(U, cm(D.qft3.U))).toBeLessThan(1e-12)
    expect(matGap(U, cm(D.qft3.dft))).toBeLessThan(1e-12)
  })

  it('random circuits (gates, controls, angles, SWAP, 2-qubit unitaries, xor oracles; n = 3…6): every column state; U for n ≤ 4', () => {
    for (const k of D.random) {
      const cc = valid(k.circuit)
      const run = runCircuit(cc)
      run.states.forEach((s, i) => expect(vecGap(s, cv(k.states[i])), `n = ${cc.qubits}, column ${i}`).toBeLessThan(1e-11))
      if (k.U) {
        const U = circuitUnitary(cc)
        expect(matGap(U, cm(k.U))).toBeLessThan(1e-11)
        const prod = cc.columns.reduce((acc, _, i) => matmul(columnUnitary(cc, i), acc), identity(2 ** cc.qubits))
        expect(matGap(prod, U)).toBeLessThan(1e-12)
      }
    }
  })

  it('mid-circuit measurement + classical control on a random input: branches = numpy (outcomes, probabilities, bits, final states)', () => {
    const M = D.mid
    const bs = branches(M.circuit, { psi0: cv(M.psi0) })
    expect(bs.length).toBe(M.branches.length)
    bs.forEach((b, i) => {
      const f = M.branches[i]
      expect(b.outcomes).toBe(f.outcomes)
      expect(b.bits).toBe(f.bits)
      expect(Math.abs(b.prob - f.prob)).toBeLessThan(1e-12)
      expect(vecGap(b.states.at(-1)!, cv(f.final))).toBeLessThan(1e-12)
    })
    expect(() => runCircuit(M.circuit, { psi0: cv(M.psi0) })).toThrow(/mid-circuit/)
  })
})

describe('runCircuit semantics', () => {
  it('rand samples one of the branches, with that branch\'s probability; a seeded run replays exactly', () => {
    const M = D.mid
    const bs = branches(M.circuit, { psi0: cv(M.psi0) })
    for (let s = 0; s < 20; s++) {
      const r1 = runCircuit(M.circuit, { psi0: cv(M.psi0), rand: rng(900 + s) })
      const r2 = runCircuit(M.circuit, { psi0: cv(M.psi0), rand: rng(900 + s) })
      expect(r2).toEqual(r1)
      const b = bs.find((x) => x.outcomes === r1.outcomes)!
      expect(Math.abs(b.prob - r1.prob)).toBeLessThan(1e-12)
      expect(vecGap(r1.states.at(-1)!, b.states.at(-1)!)).toBeLessThan(1e-12)
    }
  })

  it('rejects impossible outcomes, the wrong number of outcomes, a wrong-length psi0, and dense matrices for measuring circuits', () => {
    const deutsch0 = D.deutsch[0].circuit
    expect(() => runCircuit(deutsch0, { outcomes: '1' })).toThrow(/probability 0/)
    expect(() => runCircuit(deutsch0, { outcomes: '01' })).toThrow(/outcomes/)
    expect(() => runCircuit(deutsch0, { psi0: cv(D.teleport.psi0) })).toThrow(/psi0/)
    expect(() => circuitUnitary(deutsch0)).toThrow(/measures/)
    expect(() => circuitUnitary(D.teleport.circuit)).toThrow()
    expect(measurementCount(D.teleport.circuit)).toBe(2)
  })

  it('handles the 10-qubit cap (GHZ-10 by one H and nine CNOTs) and rejects 11 qubits', () => {
    const ghz: Circuit = { version: 1, qubits: 10, columns: [[{ op: 'gate', gate: 'H', targets: [0] }], ...Array.from({ length: 9 }, (_, k) => [{ op: 'gate' as const, gate: 'X' as const, controls: [k], targets: [k + 1] }])] }
    const last = runCircuit(ghz).states.at(-1)!
    expect(last[0].re).toBeCloseTo(Math.SQRT1_2, 14)
    expect(last[1023].re).toBeCloseTo(Math.SQRT1_2, 14)
    expect(validateCircuit({ ...ghz, qubits: 11 }).ok).toBe(false)
  })
})

describe('the JSON format: round trip and validation', () => {
  const samples: Circuit[] = [...D.deutsch.map((k: { circuit: Circuit }) => k.circuit), D.bell.circuit, D.teleport.circuit, ...D.dj3.map((k: { circuit: Circuit }) => k.circuit), D.qft3.circuit, ...D.random.map((k: { circuit: Circuit }) => k.circuit), D.mid.circuit]

  it('every fixture circuit validates; serialize → parse gives the same object and the same run', () => {
    for (const cc of samples) {
      const v = parseCircuit(serializeCircuit(cc))
      expect(v.ok).toBe(true)
      if (!v.ok) continue
      expect(v.circuit).toEqual(cc)
      expect(serializeCircuit(v.circuit)).toBe(serializeCircuit(cc))
      const a = branches(cc)
      const b = branches(v.circuit)
      expect(b.map((x) => x.outcomes)).toEqual(a.map((x) => x.outcomes))
      a.forEach((x, i) => expect(vecGap(b[i].states.at(-1)!, x.states.at(-1)!)).toBe(0))
    }
  })

  it('rejects malformed circuits with a reason that names the place', () => {
    /** a sparse array (a hole where forEach/every would skip): must be rejected, not skipped */
    const holey = (xs: unknown[], at: number): unknown[] => {
      const a = [...xs]
      delete a[at]
      return a
    }
    const base = { version: 1, qubits: 2, clbits: 1, columns: [[{ op: 'gate', gate: 'H', targets: [0] }]] }
    const bad: [unknown, RegExp][] = [
      [null, /object/],
      [[], /object/],
      ['{"version":1}', /object/],
      [{ ...base, version: 2 }, /version/],
      [{ ...base, qubits: 0 }, /qubits/],
      [{ ...base, qubits: 11 }, /qubits/],
      [{ ...base, qubits: 2.5 }, /qubits/],
      [{ ...base, extra: 1 }, /unknown field "extra"/],
      [{ ...base, init: '0' }, /init/],
      [{ ...base, init: '0x' }, /init/],
      [{ ...base, columns: {} }, /columns/],
      [{ ...base, columns: [[{ op: 'gate', gate: 'CNOT', targets: [0] }]] }, /columns\[0\]\[0\]\.gate/],
      [{ ...base, columns: [[{ op: 'gate', gate: 'H', targets: [2] }]] }, /targets\[0\]/],
      [{ ...base, columns: [[{ op: 'gate', gate: 'H', targets: [0, 1] }]] }, /takes 1 target/],
      [{ ...base, columns: [[{ op: 'gate', gate: 'X', targets: [0], controls: [0] }]] }, /both a control and a target/],
      [{ ...base, columns: [[{ op: 'gate', gate: 'Rz', targets: [0] }]] }, /one angle/],
      [{ ...base, columns: [[{ op: 'gate', gate: 'Rz', targets: [0], params: [Infinity] }]] }, /finite/],
      [{ ...base, columns: [[{ op: 'gate', gate: 'H', targets: [0], params: [1] }]] }, /no angle/],
      [{ ...base, columns: [[{ op: 'gate', gate: 'H', targets: [0] }, { op: 'gate', gate: 'X', targets: [0] }]] }, /already used in this column/],
      [{ ...base, columns: [[{ op: 'measure', qubit: 0, bit: 1 }]] }, /bit/],
      [{ ...base, clbits: 0, columns: [[{ op: 'measure', qubit: 0, bit: 0 }]] }, /no classical bits/],
      [{ ...base, columns: [[{ op: 'gate', gate: 'X', targets: [1], cond: { bits: [0], equals: '1' } }]] }, /not measured in an earlier column/],
      [{ ...base, columns: [[{ op: 'measure', qubit: 0, bit: 0 }, { op: 'gate', gate: 'X', targets: [1], cond: { bits: [0], equals: '1' } }]] }, /earlier column/],
      [{ ...base, columns: [[{ op: 'measure', qubit: 0, bit: 0 }], [{ op: 'gate', gate: 'X', targets: [1], cond: { bits: [0], equals: '11' } }]] }, /equals/],
      [{ ...base, columns: [[{ op: 'oracle', mode: 'xor', table: [0, 1], inputs: [0] }]] }, /target/],
      [{ ...base, columns: [[{ op: 'oracle', mode: 'xor', table: [0, 1, 1], inputs: [0], target: 1 }]] }, /table/],
      [{ ...base, columns: [[{ op: 'oracle', mode: 'phase', table: [0, 2], inputs: [0] }]] }, /0 or 1/],
      [{ ...base, columns: [[{ op: 'unitary', matrix: [[[1, 0], [1, 0]], [[0, 0], [1, 0]]], targets: [0] }]] }, /not unitary/],
      [{ ...base, columns: [[{ op: 'unitary', matrix: [[[1, 0]]], targets: [0] }]] }, /2 rows/],
      [{ ...base, columns: [[{ op: 'teleport', targets: [0] }]] }, /columns\[0\]\[0\]\.op:/],
      [{ ...base, columns: holey([[{ op: 'gate', gate: 'H', targets: [0] }], 'hole', []], 1) }, /columns\[1\]/],
      [{ ...base, columns: [[{ op: 'gate', gate: 'X', targets: [1], controls: holey(['hole', 0], 0) }]] }, /controls\[0\]/],
    ]
    for (const [x, why] of bad) {
      const v = validateCircuit(x)
      expect(v.ok, JSON.stringify(x)).toBe(false)
      if (!v.ok) expect(v.reason).toMatch(why)
    }
    expect(parseCircuit('{not json').ok).toBe(false)
  })

  it('fuzz: 400 random values and 400 random mutations of valid circuits never throw; whatever validates also runs', () => {
    const R = rng(70977)
    const keys = ['version', 'qubits', 'clbits', 'init', 'wires', 'title', 'columns', 'op', 'gate', 'targets', 'controls', 'params', 'cond', 'bits', 'equals', 'mode', 'table', 'inputs', 'target', 'matrix', 'qubit', 'bit', 'label', '__proto__', 'constructor']
    const atoms: unknown[] = [0, 1, 2, -1, 1.5, 10, 11, 1e9, NaN, Infinity, -0, '', '0', '01', '+-', 'H', 'X', 'Rz', 'SWAP', 'xor', 'phase', 'gate', 'measure', 'oracle', 'unitary', true, false, null, undefined, [], {}, [0], [0, 1], [[1, 0]]]
    const pick = <T,>(xs: readonly T[]): T => xs[Math.floor(R() * xs.length)]
    const randomValue = (depth: number): unknown => {
      const r = R()
      if (depth <= 0 || r < 0.4) return pick(atoms)
      if (r < 0.7) return Array.from({ length: Math.floor(R() * 4) }, () => randomValue(depth - 1))
      const o: Record<string, unknown> = {}
      for (let k = Math.floor(R() * 5); k > 0; k--) o[pick(keys)] = randomValue(depth - 1)
      return o
    }
    const mutate = (x: unknown, depth: number): unknown => {
      if (depth <= 0 || x === null || typeof x !== 'object') return randomValue(2)
      const clone = JSON.parse(JSON.stringify(x)) as Record<string, unknown> | unknown[]
      const ks = Object.keys(clone)
      if (!ks.length || R() < 0.2) return randomValue(2)
      const k = pick(ks)
      const r = R()
      if (r < 0.15) delete (clone as Record<string, unknown>)[k]
      else if (r < 0.25 && !Array.isArray(clone)) clone[pick(keys)] = randomValue(1)
      else (clone as Record<string, unknown>)[k] = mutate((clone as Record<string, unknown>)[k], depth - 1)
      return clone
    }
    let accepted = 0
    const check = (x: unknown) => {
      let v: ReturnType<typeof validateCircuit> | undefined
      expect(() => (v = validateCircuit(x))).not.toThrow()
      if (!v) return
      if (v.ok) {
        accepted++
        expect(() => runCircuit(v!.ok ? v!.circuit : (null as never), { rand: R })).not.toThrow()
      } else expect(typeof v.reason === 'string' && v.reason.length > 0).toBe(true)
    }
    for (let t = 0; t < 400; t++) check(randomValue(4))
    for (let t = 0; t < 400; t++) check(mutate(pick(samples), 4))
    expect(accepted).toBeGreaterThan(10) // (18 with this seed) the mutations keep some circuits valid, so the "validates ⇒ runs" half is exercised
    // hostile objects: a throwing getter, a circular reference, a BigInt
    const trap = { version: 1, qubits: 1, columns: [] }
    Object.defineProperty(trap, 'columns', { get: () => { throw new Error('boom') }, enumerable: true })
    const circ: Record<string, unknown> = { version: 1, qubits: 1, columns: [] }
    circ.wires = [circ]
    for (const x of [trap, circ, { version: 1, qubits: BigInt(1), columns: [] }]) {
      const v = validateCircuit(x)
      expect(v.ok).toBe(false)
    }
  })
})

describe('a run never writes into the shared spin kets (P-Q4-story §9.1 E1)', () => {
  it('one-qubit runs from every init leave KET and ket() unchanged', () => {
    const before = JSON.stringify(KET)
    for (const init of ['0', '1', '+', '-']) {
      runCircuit({ version: 1, qubits: 1, init, columns: [[{ op: 'gate', gate: 'Ry', targets: [0], params: [Math.PI / 3] }]] })
    }
    expect(JSON.stringify(KET)).toBe(before)
    expect(ket('00').map((z) => z.re)).toEqual([1, 0, 0, 0])
  })
})

describe('a run never writes into a state the caller handed it (W-448 #6)', () => {
  it('psi0 is left as it was, and the recorded column states are snapshots that later gates cannot change', () => {
    const psi0 = ket('00')
    const before = JSON.stringify(psi0)
    const circuit: Circuit = {
      version: 1,
      qubits: 2,
      columns: [[{ op: 'gate', gate: 'H', targets: [0] }], [{ op: 'gate', gate: 'X', targets: [1], controls: [0] }]],
    }
    const run = runCircuit(circuit, { psi0 })
    expect(JSON.stringify(psi0)).toBe(before)
    // the Bell pair at the end, |00⟩ at the start: the first snapshot was not overwritten by the later columns
    expect(run.states[0].map((z) => z.re)).toEqual([1, 0, 0, 0])
    expect(run.states.at(-1)!.map((z) => Math.round(z.re * 1000) / 1000)).toEqual([0.707, 0, 0, 0.707])
    // the same start state can run again and gives the same answer (a corrupted psi0 would not)
    expect(runCircuit(circuit, { psi0 }).states.at(-1)).toEqual(run.states.at(-1))
  })
})
