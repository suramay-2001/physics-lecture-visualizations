/**
 * qc/teleport.ts against numpy (block "teleport": explicit 3- and 4-qubit vectors, a projector-and-contract route
 * independent of the engine's own `schmidt`/SVD route), plus the independent SECOND check named in P-Q11-story §9.1:
 * a real `Circuit` (H + CNOT to prepare the Bell pair, CNOT + H + measure for Alice's Bell measurement, classically
 * controlled X/Z corrections) run through `circuit.ts` `branches` must reproduce the same branch probabilities and
 * fidelities as `teleport`.
 */
import { describe, expect, it } from 'vitest'
import { c } from '../complex'
import { apply, normalize, type Vec } from '../linalg'
import { branches, type Circuit } from './circuit'
import { fidelity, reducedDensity, schmidt } from './density'
import { X, Z } from './gates'
import { bellMeasure } from './measure'
import { bellCycle, denseCode, swapIdentity, teleport, weylBell } from './teleport'
import { bell, kron, randomState } from './state'
import { rng } from '../random'
import { FX, cv } from './testkit'

const close = (a: number, b: number, eps = 1e-9) => expect(Math.abs(a - b), `${a} ≈ ${b}`).toBeLessThan(eps)
const OUTCOMES = ['00', '01', '10', '11'] as const

describe('teleport: bellCycle', () => {
  it('matches numpy: (op ⊗ I)|Φ+⟩ for op = I, X, Y, Z, and which Bell state it names', () => {
    for (const { op, ket, name } of FX.teleport.bellCycle) {
      const got = bellCycle(op as 'I' | 'X' | 'Y' | 'Z')
      expect(got.name).toBe(name.replace('Phi', 'Φ').replace('Psi', 'Ψ').replace('+', '+').replace('-', '−'))
      const want = cv(ket)
      close(Math.abs(got.ket.reduce((s, x, i) => s + x.re * want[i].re + x.im * want[i].im, 0)), 1, 1e-9)
    }
  })
})

describe('teleport: denseCode', () => {
  it('matches numpy: every readout equals its bits exactly, with probability 1', () => {
    for (const { bits, readout, prob } of FX.teleport.denseCode) {
      const got = denseCode(bits as '00' | '01' | '10' | '11')
      expect(got.readout).toBe(readout)
      close(got.prob, prob, 1e-9)
      expect(got.readout).toBe(bits)
    }
  })

  it('denseCode fidelities are exactly 1 (the readout is deterministic): 10 random resources built from bellCycle', () => {
    for (const bits of OUTCOMES) {
      const { prob } = denseCode(bits)
      close(prob, 1)
    }
  })
})

describe('teleport: teleport', () => {
  it("matches numpy: Bob's pre-correction state is I/2, prob = 1/4 and fidelity = 1 in every branch", () => {
    for (const { psiName, psi, outcome, prob, fidelity: f, bobPre } of FX.teleport.teleport) {
      void psiName
      const got = teleport(cv(psi), bell('00+11'), outcome as '00' | '01' | '10' | '11')
      close(got.prob, prob, 1e-9)
      close(got.fidelity, f, 1e-9)
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
        close(got.bobPre[i][j].re, bobPre[i][j][0], 1e-9)
        close(got.bobPre[i][j].im, bobPre[i][j][1], 1e-9)
      }
    }
  })

  it('fidelity is exactly 1 for every outcome, for 20 random psi and all 4 branches (property test)', () => {
    const R = rng(21190)
    for (let t = 0; t < 20; t++) {
      const psi = randomState(1, R)
      for (const outcome of OUTCOMES) {
        const got = teleport(psi, bell('00+11'), outcome)
        close(got.fidelity, 1, 1e-9)
        close(got.prob, 0.25, 1e-9)
      }
    }
  })

  it("Bob's pre-correction reduced state is exactly I/2, independent of psi and of outcome (no signalling)", () => {
    const R = rng(21191)
    for (let t = 0; t < 10; t++) {
      const psi = randomState(1, R)
      const { bobPre } = teleport(psi)
      close(bobPre[0][0].re, 0.5)
      close(bobPre[1][1].re, 0.5)
      close(bobPre[0][1].re, 0)
      close(bobPre[0][1].im, 0)
    }
  })

  it('the independent check: a real teleportation Circuit run through branches() reproduces the same probabilities and fidelities', () => {
    const theta = (73.7 * Math.PI) / 180
    const psi: Vec = normalize([c(Math.cos(theta / 2)), c(Math.sin(theta / 2))])
    const circuit: Circuit = {
      version: 1,
      qubits: 3,
      clbits: 2,
      columns: [
        [{ op: 'gate', gate: 'Ry', targets: [0], params: [theta] }, { op: 'gate', gate: 'H', targets: [1] }],
        [{ op: 'gate', gate: 'X', controls: [1], targets: [2] }],
        [{ op: 'gate', gate: 'X', controls: [0], targets: [1] }],
        [{ op: 'gate', gate: 'H', targets: [0] }],
        [{ op: 'measure', qubit: 0, bit: 0 }, { op: 'measure', qubit: 1, bit: 1 }],
        [{ op: 'gate', gate: 'X', targets: [2], cond: { bits: [1], equals: '1' } }],
        [{ op: 'gate', gate: 'Z', targets: [2], cond: { bits: [0], equals: '1' } }],
      ],
    }
    const runs = branches(circuit)
    expect(runs).toHaveLength(4)
    expect(new Set(runs.map((r) => r.bits))).toEqual(new Set(OUTCOMES))
    for (const run of runs) {
      close(run.prob, 0.25, 1e-9)
      const bobFinal = reducedDensity(run.states[run.states.length - 1], [2])
      const circuitFidelity = fidelity(psi, bobFinal)
      const engineResult = teleport(psi, bell('00+11'), run.bits as '00' | '01' | '10' | '11')
      close(circuitFidelity, 1, 1e-9)
      close(engineResult.fidelity, 1, 1e-9)
      close(engineResult.prob, run.prob, 1e-9)
    }
  })
})

describe('teleport: swapIdentity', () => {
  it('matches numpy: 4 branches, each probability 1/4, each A-C pair named by the standard Bell basis', () => {
    const got = swapIdentity()
    expect(got).toHaveLength(4)
    for (const g of got) close(g.prob, 0.25, 1e-9)
    const wantNames = new Set(FX.teleport.swapIdentity.map((s: { name: string }) => s.name))
    const gotNames = new Set(got.map((g) => g.name.replace('Φ', 'Phi').replace('Ψ', 'Psi').replace('−', '-')))
    expect(gotNames).toEqual(wantNames)
    for (const want of FX.teleport.swapIdentity) {
      const g = got.find((x) => x.outcome === want.outcome)!
      close(g.prob, want.prob, 1e-9)
    }
  })
})

describe('teleport: weylBell', () => {
  it('N = 2 reproduces the qubit Bell basis exactly: (0,0)=Φ+, (1,0)=Φ-, (0,1)=Ψ+, (1,1)=Ψ-', () => {
    const PHI_P = bell('00+11')
    const PHI_M = bell('00-11')
    const PSI_P = bell('01+10')
    const PSI_M = bell('01-10')
    const overlap = (a: Vec, b: Vec) => Math.abs(a.reduce((s, x, i) => s + x.re * b[i].re + x.im * b[i].im, 0))
    close(overlap(weylBell(2, 0, 0), PHI_P), 1, 1e-9)
    close(overlap(weylBell(2, 1, 0), PHI_M), 1, 1e-9)
    close(overlap(weylBell(2, 0, 1), PSI_P), 1, 1e-9)
    close(overlap(weylBell(2, 1, 1), PSI_M), 1, 1e-9)
  })

  it('matches the numpy fixture for N = 2 and N = 3', () => {
    for (const { N, n, m, chi } of FX.teleport.weylBell) {
      const got = weylBell(N, n, m)
      const want = cv(chi)
      let re = 0
      let im = 0
      got.forEach((x, i) => {
        re += x.re * want[i].re + x.im * want[i].im
        im += x.re * want[i].im - x.im * want[i].re
      })
      close(Math.hypot(re, im), 1, 1e-9)
    }
  })

  it('the N = 3 Weyl-Bell basis (9 states) is orthonormal: the Gram matrix is the identity', () => {
    const states: Vec[] = []
    for (let n = 0; n < 3; n++) for (let m = 0; m < 3; m++) states.push(weylBell(3, n, m))
    for (let i = 0; i < 9; i++)
      for (let j = 0; j < 9; j++) {
        let re = 0
        let im = 0
        states[i].forEach((x, k) => {
          re += x.re * states[j][k].re + x.im * states[j][k].im
          im += x.re * states[j][k].im - x.im * states[j][k].re
        })
        close(re, i === j ? 1 : 0, 1e-9)
        close(im, 0, 1e-9)
      }
  })
})

describe('teleport: a mutation check', () => {
  it('swapping which bit controls X vs Z fails to recover a generic psi (confirms the mapping is load-bearing)', () => {
    const READOUT: Record<string, '00' | '01' | '10' | '11'> = { 'Φ+': '00', 'Ψ+': '01', 'Φ−': '10', 'Ψ−': '11' }
    const R = rng(21192)
    const psi = randomState(1, R)
    const full = kron(psi, bell('00+11'))
    let worst = 1
    for (const branch of bellMeasure(full, 0, 1)) {
      if (!branch.post) continue
      const outcome = READOUT[branch.name]
      let bobRaw = schmidt(branch.post, [2]).a[0]
      // BROKEN on purpose: outcome[0] should control Z and outcome[1] should control X (teleport.ts's real mapping);
      // here they are swapped.
      if (outcome[0] === '1') bobRaw = apply(X, bobRaw)
      if (outcome[1] === '1') bobRaw = apply(Z, bobRaw)
      worst = Math.min(worst, fidelity(psi, bobRaw))
    }
    expect(worst).toBeLessThan(0.999)
    // the real teleport() (correct mapping) recovers psi in EVERY branch
    for (const outcome of OUTCOMES) close(teleport(psi, bell('00+11'), outcome).fidelity, 1, 1e-9)
  })
})
