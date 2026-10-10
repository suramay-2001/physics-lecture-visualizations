/**
 * qc/crypto.ts and povm.ts's usdPovm / helstromPovm against numpy (pipeline/make_crypto_fixtures.py → __fixtures__/qc-crypto.json: explicit
 * vectors and matrices, a bisection for the never-wrong coefficient, a scan of projective measurements for Helstrom, reshaped-tensor
 * reductions), plus the closed forms of P-Q15-story §1.6 and property tests: the never-wrong POVM is a POVM that never clicks on the other
 * state; the Helstrom POVM reaches the bound; B92's kept share is 1 − c whatever Eve does; the probe's x-error is ½(1 − cos φ/2); the sharing
 * record of a cheating Charlie equals the honest one for every θ; Eq. 6.6 is ½δ_ab.
 */
import { describe, expect, it } from 'vitest'
import raw from '../__fixtures__/qc-crypto.json?raw'
import { abs, abs2 } from '../complex'
import { type Vec, inner, matmul } from '../linalg'
import { rng } from '../random'
import {
  B92_STATES,
  b92Circuit,
  b92Overlap,
  b92Rates,
  caesar,
  charlieKets,
  eq66Check,
  probeAttack,
  probeCircuit,
  shareCircuit,
  shareSplit,
  shareThetaFor,
  sharingCheat,
  sharingZAgreement,
  xorBits,
} from './crypto'
import { runCircuit } from './circuit'
import { eigh, traceN } from './cmat'
import { densityOf } from './density'
import { bornPovm, helstrom, helstromPovm, isPOVM, usd, usdPovm } from './povm'
import { randomState } from './state'
import { cm, cv, matGap } from './testkit'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FX: any = JSON.parse(raw)
const DEG = Math.PI / 180
const close = (a: number, b: number, eps = 1e-10) => expect(Math.abs(a - b), `${a} ≈ ${b}`).toBeLessThan(eps)
const last = (states: Vec[]): Vec => states[states.length - 1]

describe('caesar and the XOR pad', () => {
  it('matches numpy on every case, and "Caesar" shifted by three is "Fdhvdu"', () => {
    expect(caesar('Caesar', 3)).toBe('Fdhvdu')
    for (const k of FX.caesar) expect(caesar(k.text, k.shift), `${k.text} by ${k.shift}`).toBe(k.out)
  })
  it('property: a shift undone by its negative returns the text, and a shift by 26 changes nothing', () => {
    for (const t of ['Caesar', 'qubit key', 'Zz aA!']) {
      for (const k of [1, 3, 13, 25]) expect(caesar(caesar(t, k), -k)).toBe(t)
      expect(caesar(t, 26)).toBe(t)
    }
    expect(() => caesar('a', 1.5)).toThrow()
  })
  it('xorBits matches numpy, adding the key twice returns the message, and the lengths must agree', () => {
    for (const k of FX.xor) expect(xorBits(k.a, k.b)).toBe(k.out)
    const R = rng(15101)
    for (let t = 0; t < 20; t++) {
      const m = Array.from({ length: 12 }, () => (R() < 0.5 ? '0' : '1')).join('')
      const key = Array.from({ length: 12 }, () => (R() < 0.5 ? '0' : '1')).join('')
      expect(xorBits(xorBits(m, key), key)).toBe(m)
    }
    expect(() => xorBits('10', '1')).toThrow()
  })
})

describe('usdPovm: the never-wrong POVM, against a bisection for its coefficient', () => {
  it('matches the fixture elements, the coefficient 1/(1 + c) and the success 1 − c (the fixture finds the coefficient by bisection, not by the formula)', () => {
    for (const k of FX.usd) {
      const E = usdPovm(cv(k.psi0), cv(k.psi1))
      E.forEach((e, i) => expect(matGap(e, cm(k.E[i])), `${k.name} element ${i}`).toBeLessThan(1e-9))
      close(1 / (1 + k.overlap), k.scale, 1e-9)
      close(bornPovm(E, densityOf(cv(k.psi0)))[0], k.success, 1e-9)
      close(bornPovm(E, densityOf(cv(k.psi1)))[1], k.success, 1e-9)
    }
  })
  it('property: for random pairs it is a POVM, never clicks on the other state, and succeeds with chance usd() on both', () => {
    const R = rng(15102)
    for (let t = 0; t < 25; t++) {
      const a = randomState(1, R)
      const b = randomState(1, R)
      const E = usdPovm(a, b)
      expect(isPOVM(E, 1e-9)).toBe(true)
      close(bornPovm(E, densityOf(b))[0], 0, 1e-12) // E0 never fires on ψ1
      close(bornPovm(E, densityOf(a))[1], 0, 1e-12) // E1 never fires on ψ0
      close(bornPovm(E, densityOf(a))[0], usd([a, b]), 1e-10)
      close(bornPovm(E, densityOf(b))[1], usd([a, b]), 1e-10)
      close(bornPovm(E, densityOf(a))[2], abs(inner(a, b)), 1e-10) // the inconclusive chance is c
    }
  })
  it('orthogonal states leave nothing inconclusive; identical states are never answered', () => {
    const [e0, e1, eq] = usdPovm(cv(FX.usd[1].psi0), cv(FX.usd[1].psi1))
    expect(matGap(eq, [[{ re: 0, im: 0 }, { re: 0, im: 0 }], [{ re: 0, im: 0 }, { re: 0, im: 0 }]])).toBeLessThan(1e-12)
    expect(isPOVM([e0, e1])).toBe(true)
    const same = FX.usd.find((k: { name: string }) => k.name === 'same')
    close(bornPovm(usdPovm(cv(same.psi0), cv(same.psi1)), densityOf(cv(same.psi0)))[2], 1, 1e-12)
    expect(() => usdPovm([{ re: 1, im: 0 }], [{ re: 1, im: 0 }])).toThrow()
  })
})

describe('helstromPovm: the minimum-error measurement', () => {
  it('matches the fixture projectors and success, and the success equals both the bound and a scan of projective measurements', () => {
    for (const k of FX.helstromPovm) {
      const E = helstromPovm(cm(k.rho0), cm(k.rho1), k.eta)
      E.forEach((e, i) => expect(matGap(e, cm(k.E[i])), `${k.name} element ${i}`).toBeLessThan(1e-9))
      const succ = k.eta * traceN(matmul(E[0], cm(k.rho0))).re + (1 - k.eta) * traceN(matmul(E[1], cm(k.rho1))).re
      close(succ, k.success, 1e-9)
      close(succ, helstrom(cm(k.rho0), cm(k.rho1), k.eta), 1e-9)
      close(k.bound, k.success, 1e-9)
      expect(k.scan, `${k.name}: no projective measurement beats it`).toBeLessThanOrEqual(k.success + 1e-9)
      expect(k.success - k.scan, `${k.name}: the scan comes within 1e-4 of it`).toBeLessThan(1e-4)
    }
  })
  it('for |0⟩ and |+⟩ at even odds the "state 1" projector sits on Γ’s positive axis, (θ, φ) = (135°, 0°)', () => {
    const E = helstromPovm(densityOf(B92_STATES[0]), densityOf(B92_STATES[1]), 0.5)
    // E1 = ½(I + n·σ) with n = (sin135°, 0, cos135°) = (0.7071, 0, −0.7071)
    close(E[1][0][1].re, 0.5 * Math.SQRT1_2) // ½ n_x
    close(E[1][0][0].re, 0.5 - 0.5 * Math.SQRT1_2) // ½ (1 + n_z), n_z = −0.7071
  })
  it('property: E0 + E1 = I, both are projectors, and the success equals helstrom() for random states and priors', () => {
    const R = rng(15103)
    for (let t = 0; t < 25; t++) {
      const r0 = densityOf(randomState(1, R))
      const r1 = densityOf(randomState(1, R))
      const eta = 0.1 + 0.8 * R()
      const E = helstromPovm(r0, r1, eta)
      expect(isPOVM(E, 1e-9)).toBe(true)
      for (const e of E) expect(matGap(matmul(e, e), e)).toBeLessThan(1e-9)
      const succ = eta * traceN(matmul(E[0], r0)).re + (1 - eta) * traceN(matmul(E[1], r1)).re
      close(succ, helstrom(r0, r1, eta), 1e-9)
    }
  })
  it('when Γ has no positive part (identical states, a likelier first one) E1 = 0: always guess the likelier state, with success η', () => {
    const rho = densityOf(B92_STATES[1])
    const E = helstromPovm(rho, rho, 0.7)
    expect(Math.max(...eigh(E[1]).values)).toBeLessThan(1e-12)
    expect(isPOVM(E)).toBe(true)
    close(0.7 * traceN(matmul(E[0], rho)).re + 0.3 * traceN(matmul(E[1], rho)).re, 0.7)
  })
})

describe('b92Rates: exact branch sums over Alice, Eve and Bob', () => {
  it('matches the fixture for every eavesdropper', () => {
    for (const eve of ['none', 'usd', 'minerr'] as const) {
      const got = b92Rates(eve)
      for (const key of ['kept', 'inconclusive', 'qber', 'eveRight', 'eveFail'] as const) close(got[key], FX.b92[eve][key], 1e-12)
    }
  })
  it('the closed forms: kept 1 − c, Q = c/2 for the never-wrong Eve, Q = ½(1 − √(1 − c²)) for the minimum-error Eve, and Eve right 1 − c/2 or ½(1 + √(1 − c²))', () => {
    const c = b92Overlap()
    close(c, Math.SQRT1_2)
    for (const eve of ['none', 'usd', 'minerr'] as const) close(b92Rates(eve).kept, 1 - c)
    close(b92Rates('none').qber, 0)
    close(b92Rates('none').eveRight, 0.5)
    close(b92Rates('usd').qber, c / 2)
    close(b92Rates('usd').eveFail, c)
    close(b92Rates('usd').eveRight, 1 - c / 2)
    close(b92Rates('minerr').qber, 0.5 * (1 - Math.sqrt(1 - c * c)))
    close(b92Rates('minerr').eveRight, 0.5 * (1 + Math.sqrt(1 - c * c)))
  })
  it('the quieter Eve is the minimum-error one: lower Q, and she knows more of the key', () => {
    expect(b92Rates('minerr').qber).toBeLessThan(b92Rates('usd').qber)
    expect(b92Rates('minerr').eveRight).toBeGreaterThan(b92Rates('usd').eveRight)
  })
  it('the encoder circuit sends |0⟩ for a = 0 and |+⟩ for a = 1', () => {
    const s0 = last(runCircuit(b92Circuit(0)).states)
    const s1 = last(runCircuit(b92Circuit(1)).states)
    // wire 1 holds Alice's bit, wire 2 the qubit sent: |00⟩ and |1⟩|+⟩
    close(abs2(s0[0]), 1)
    close(abs2(s1[2]), 0.5)
    close(abs2(s1[3]), 0.5)
  })
})

describe('probeAttack: a controlled rotation of Eve’s ancilla', () => {
  it('matches the fixture at six angles', () => {
    for (const k of FX.probe) {
      const got = probeAttack(k.phi)
      for (const key of ['zError', 'xError', 'qber', 'eveGuess', 'rA', 'rE'] as const) close(got[key], k[key], 1e-11)
    }
  })
  it('closed forms at every angle: no z-error, x-error ½(1 − cos φ/2), Eve guesses ½(1 + sin φ/2), both arrows cos φ/2', () => {
    for (let deg = 0; deg <= 180; deg += 15) {
      const p = probeAttack(deg * DEG)
      close(p.zError, 0, 1e-12)
      close(p.xError, 0.5 * (1 - Math.cos((deg * DEG) / 2)), 1e-11)
      close(p.eveGuess, 0.5 * (1 + Math.sin((deg * DEG) / 2)), 1e-11)
      close(p.rA, Math.cos((deg * DEG) / 2), 1e-11)
      close(p.rE, Math.cos((deg * DEG) / 2), 1e-11)
    }
  })
  it('no probe, no error and no information (φ = 0); a CNOT probe (φ = 180°) learns every z bit at the price of Q = ¼', () => {
    const none = probeAttack(0)
    close(none.xError, 0)
    close(none.eveGuess, 0.5)
    close(none.rA, 1)
    const cnot = probeAttack(Math.PI)
    close(cnot.eveGuess, 1)
    close(cnot.qber, 0.25)
  })
  it('property: more information always costs more error (Eve’s guess and the x-error rise together with φ on 0…180°)', () => {
    let prev = probeAttack(0)
    for (let deg = 5; deg <= 180; deg += 5) {
      const p = probeAttack(deg * DEG)
      expect(p.xError).toBeGreaterThan(prev.xError)
      expect(p.eveGuess).toBeGreaterThan(prev.eveGuess)
      prev = p
    }
  })
  it('the circuit is a valid two-wire circuit with a controlled Ry', () => {
    const C = probeCircuit(0.7, '+0')
    expect(C.columns[0][0]).toMatchObject({ op: 'gate', gate: 'Ry', targets: [1], controls: [0] })
  })
})

describe('shareSplit and the entangled code', () => {
  it('matches the fixture at four angles', () => {
    for (const k of FX.share) {
      const got = shareSplit(k.theta)
      close(got.bobPlus, k.bobPlus, 1e-12)
      got.charliePlus.forEach((x, i) => close(x, k.charliePlus[i], 1e-11))
      got.charlieMinus.forEach((x, i) => close(x, k.charlieMinus[i], 1e-11))
      close(got.overlap, k.overlap, 1e-11)
      close(got.usd, k.usd, 1e-11)
    }
  })
  it('closed forms: Bob reads +x with chance ½, the overlap is cos 2θ and Charlie’s success 1 − cos 2θ; at θ = 22.5° the overlap is B92’s 0.7071', () => {
    for (let deg = 5; deg <= 45; deg += 5) {
      const s = shareSplit(deg * DEG)
      close(s.bobPlus, 0.5)
      close(s.overlap, Math.abs(Math.cos(2 * deg * DEG)), 1e-11)
      close(s.usd, 1 - Math.abs(Math.cos(2 * deg * DEG)), 1e-11)
    }
    close(shareSplit(22.5 * DEG).overlap, b92Overlap(), 1e-11)
    close(shareSplit(22.5 * DEG).charliePlus[0], Math.SQRT1_2, 1e-11)
  })
  it('the logical states are cos θ|00⟩ ± sin θ|11⟩, and Bob’s ±x readings steer Charlie to ψ₊ and ψ₋, swapped for the bit 1', () => {
    const th = 22.5 * DEG
    const s0 = last(runCircuit(shareCircuit(th, 0)).states)
    const s1 = last(runCircuit(shareCircuit(th, 1)).states)
    close(s0[0].re, Math.cos(th))
    close(s0[3].re, Math.sin(th))
    close(s1[3].re, -Math.sin(th))
    const k0 = charlieKets(th, 0)
    const k1 = charlieKets(th, 1)
    close(abs(inner(k0.plus, k1.minus)), 1, 1e-12) // for |1̄⟩ the roles swap
    close(abs(inner(k0.minus, k1.plus)), 1, 1e-12)
    close(k0.pPlus, 0.5)
  })
  it('shareThetaFor finds the angle for a target success by bisection (30° for one half) and agrees with numpy', () => {
    close(shareThetaFor(0.5), 30, 1e-6)
    for (const [t, deg] of Object.entries(FX.shareTheta)) close(shareThetaFor(Number(t)), deg as number, 1e-6)
    expect(() => shareThetaFor(1)).toThrow()
  })
})

describe('sharingCheat: Bergou’s σ_z defence against a grabbing Charlie', () => {
  it('matches the fixture for the honest run and both cheats', () => {
    for (const order of ['honest', 'cheat-first', 'sigma-first'] as const) {
      const got = sharingCheat(order)
      close(got.recordGap, FX.cheat[order].recordGap, 1e-12)
      close(got.errorRate, FX.cheat[order].errorRate, 1e-12)
      close(got.charlieGuess, FX.cheat[order].charlieGuess, 1e-12)
      close(got.kept, FX.cheat[order].kept, 1e-12)
    }
  })
  it('the public record of a Charlie who reads first equals the honest one, so no error appears; he names the bit every time', () => {
    const cheat = sharingCheat('cheat-first')
    close(cheat.recordGap, 0, 1e-12)
    close(cheat.errorRate, 0, 1e-12)
    close(cheat.charlieGuess, 1, 1e-12)
    close(sharingCheat('honest').charlieGuess, 0.5, 1e-12)
  })
  it('a σ_z applied before Charlie can touch the qubit hides the bit from him (his guess ½) and still makes no error', () => {
    const early = sharingCheat('sigma-first')
    close(early.charlieGuess, 0.5, 1e-12)
    close(early.recordGap, 0, 1e-12)
    close(early.errorRate, 0, 1e-12)
  })
  it('property: the same holds for every θ, and Charlie’s kept share is 1 − |cos 2θ| times its quarter', () => {
    for (let deg = 10; deg <= 40; deg += 10) {
      const th = deg * DEG
      const cheat = sharingCheat('cheat-first', th)
      close(cheat.recordGap, 0, 1e-12)
      close(cheat.errorRate, 0, 1e-12)
      close(cheat.charlieGuess, 1, 1e-12)
      close(cheat.kept, 1 - Math.abs(Math.cos(2 * th)), 1e-11)
    }
  })
})

describe('sharingZAgreement: the check the printed scheme never makes', () => {
  it('matches the fixture at four angles', () => {
    for (const k of FX.zAgree) {
      close(sharingZAgreement(false, k.theta), k.honest, 1e-12)
      close(sharingZAgreement(true, k.theta), k.grab, 1e-12)
    }
  })
  it('an honest pair agrees on z every time, and after Charlie reads Bob’s qubit along x they agree half the time, for every θ', () => {
    for (let deg = 5; deg <= 45; deg += 5) {
      close(sharingZAgreement(false, deg * DEG), 1, 1e-12)
      close(sharingZAgreement(true, deg * DEG), 0.5, 1e-12)
    }
  })
})

describe('eq66Check: Bergou’s example table for Φ⁺ with the settings z and x', () => {
  const E = eq66Check()
  it('matches the fixture and the corrected table ½δ_ab (x = y), ¼ (x ≠ y); the printed ½ for every (a, b) is off by ½ and adds up to 2', () => {
    for (const x of [0, 1]) for (const y of [0, 1]) E.table[x][y].forEach((p, k) => close(p, FX.eq66.table[x][y][k], 1e-12))
    close(E.correctedGap, 0, 1e-12)
    close(E.printedGap, 0.5, 1e-12)
    close(E.printedRowSum, 2)
    close(FX.eq66.printedGap, E.printedGap, 1e-12)
    close(FX.eq66.printedRowSum, E.printedRowSum, 1e-12)
  })
  it('the hidden-variable copy a = λ_x, b = λ_y reproduces the exact table (local, so S ≤ 2 at these settings)', () => {
    close(E.lambdaGap, 0, 1e-12)
    close(FX.eq66.lambdaGap, 0, 1e-12)
  })
  it('every row of the exact table is a probability distribution', () => {
    for (const x of [0, 1]) for (const y of [0, 1]) close(E.table[x][y].reduce((a: number, b: number) => a + b, 0), 1, 1e-12)
  })
})

