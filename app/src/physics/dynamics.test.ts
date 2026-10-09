/**
 * Lecture 11 engine (physics/dynamics.ts) against independent numpy routes (pipeline/make_fixtures.py `lecture11_cases`: the eigh
 * exponential, np.linalg.matrix_power, np.angle of the evolved ket, explicit sandwiches), plus properties over random inputs: waiting is
 * unitary, evolution is a one-parameter group, the Schrödinger rate is −iHψ, the N-step product tends to U with a gap that falls like 1/N
 * and is never exactly unitary, a clock hand turns clockwise at E/ħ, U(t) ≅ R_z(ωt), the mean energy changes no prediction, U(T) = −I.
 * The conventions are asserted by name (hands fall clockwise; |+x⟩ turns to |+y⟩ after a quarter turn, as R_z(90°) of Lecture 6 does).
 */
import { describe, expect, it } from 'vitest'
import fx from './__fixtures__/numpy.json'
import { abs, approxEq, arg, c, expi, type C } from './complex'
import {
  clockHands, energyAverage, evolveKet, ketRate, meanPhase, precession, precessionPeriod, stepProduct, tinyStep, twoLevelH,
} from './dynamics'
import { type Mat, type Vec, apply, dagger, diag2, identity, isUnitary, madd, matEq, matmul, maxDiff, mscale, norm2, vscale } from './linalg'
import { evolve, generatorOf } from './operators'
import { eulerLimit } from './qc/complexExtra'
import { KET, Rz, SIGMA_Z, ketFromBloch, samePhysicalState } from './spin'
import { rng } from './random'

const D = fx.lecture11
const M = (x: unknown) => x as Mat
const V = (x: unknown) => x as Vec
const close = (a: number, b: number, eps = 1e-12) => expect(Math.abs(a - b), `${a} vs ${b}`).toBeLessThan(eps)
const closeMat = (A: Mat, B: Mat, eps = 1e-12) => expect(maxDiff(A, B), 'matrices differ').toBeLessThan(eps)
const closeVec = (a: Vec, b: Vec, eps = 1e-12) => a.forEach((z, i) => expect(abs({ re: z.re - b[i].re, im: z.im - b[i].im }), `entry ${i}`).toBeLessThan(eps))
const DEG = Math.PI / 180
const wrapDiff = (a: number, b: number) => Math.abs(arg(expi(a - b)))
/** The lecture's levels: E₊ = 3ε, E₋ = ε. */
const L31 = { upper: 3, lower: 1 }

describe('twoLevelH: H = diag(E₊, E₋) = ĒI + (ħω/2)Z, with Ē and ħω derived', () => {
  it('3ε and ε give Ē = 2ε and ħω = 2ε, and the two forms of H agree entry for entry', () => {
    const t = twoLevelH(3, 1)
    expect([t.mean, t.hbarOmega]).toEqual([2, 2])
    closeMat(t.H, madd(mscale(identity(2), t.mean), mscale(SIGMA_Z, t.hbarOmega / 2)))
    closeMat(t.H, diag2(3, 1))
  })
  it('refuses levels that are not an upper and a lower one', () => {
    expect(() => twoLevelH(1, 1)).toThrow()
    expect(() => twoLevelH(1, 3)).toThrow()
    expect(() => twoLevelH(Number.NaN, 0)).toThrow()
  })
})

describe('evolveKet: U(t)|ψ⟩ = e^{−iHt}|ψ⟩ against the numpy eigh exponential', () => {
  it('matches the fixture kets and matrices to 1e-12 on 12 random Hamiltonians', () => {
    for (const k of D.evolved) {
      closeMat(evolve(M(k.H), k.t), M(k.U))
      closeVec(evolveKet(M(k.H), k.t, V(k.psi0)), V(k.psi))
    }
  })
  it('waiting is unitary: U†U = I and the length of every state is kept (the notes’ norm argument)', () => {
    for (const k of D.evolved) {
      const U = evolve(M(k.H), k.t)
      expect(isUnitary(U, 1e-12)).toBe(true)
      close(norm2(evolveKet(M(k.H), k.t, V(k.psi0))), 1)
    }
  })
  it('energy is conserved: ⟨H⟩ is the same before and after waiting (numpy sandwich)', () => {
    for (const k of D.evolved) {
      close(energyAverage(M(k.H), V(k.psi0)), k.avgH0)
      close(energyAverage(M(k.H), V(k.psi)), k.avgH)
      close(k.avgH, k.avgH0, 1e-11)
    }
  })
  it('U is a one-parameter group: U(0) = I, U(s + t) = U(s)U(t), U(−t) = U(t)†', () => {
    const g = rng(11)
    for (const k of D.evolved) {
      const H = M(k.H)
      const s = g() * 4 - 2
      const t = g() * 4 - 2
      closeMat(evolve(H, 0), identity(2))
      closeMat(evolve(H, s + t), matmul(evolve(H, s), evolve(H, t)))
      closeMat(evolve(H, -t), dagger(evolve(H, t)))
    }
  })
  it('the generator of the family t ↦ U(t) is H: i dU/dt at t = 0 (central difference)', () => {
    for (const k of D.evolved) expect(maxDiff(generatorOf((t) => evolve(M(k.H), t)), M(k.H))).toBeLessThan(1e-8)
  })
})

describe('the Schrödinger equation: d|ψ⟩/dt = −iH|ψ⟩', () => {
  it('ketRate is −iH|ψ(t)⟩, matches numpy, and equals the numpy finite difference of the evolved ket', () => {
    for (const k of D.evolved) {
      const rate = ketRate(M(k.H), V(k.psi))
      closeVec(rate, V(k.rate))
      closeVec(rate, V(k.rateFd), 1e-7)
    }
  })
  it('finite differences of the engine’s own evolution agree with ketRate (a sign slip in either would fail)', () => {
    const H = twoLevelH(3, 1).H
    const t = 0.6
    const h = 1e-6
    const fd = apply(mscale(madd(evolve(H, t + h), mscale(evolve(H, t - h), -1)), 1 / (2 * h)), KET['+x'])
    closeVec(fd, ketRate(H, evolveKet(H, t, KET['+x'])), 1e-7)
  })
  it('at t = 0 the |+z⟩ amplitude changes at −3i (units of ε/ħ) and the |−z⟩ one is untouched', () => {
    const r = ketRate(twoLevelH(3, 1).H, KET['+z'])
    expect(approxEq(r[0], c(0, -3))).toBe(true)
    expect(approxEq(r[1], c(0, 0))).toBe(true)
  })
})

describe('stepProduct: (I − iHt/N)^N tends to U(t) but is never unitary', () => {
  it('matches numpy matrix_power on random H, t and N', () => {
    for (const k of D.steps) closeMat(stepProduct(M(k.H), k.t, k.N), M(k.P), 1e-11)
  })
  it('N = 1 is the tiny step itself, and the gap to U falls like 1/N (ten times the steps, a tenth of the error)', () => {
    const H = twoLevelH(3, 1).H
    closeMat(stepProduct(H, 0.4, 1), tinyStep(H, 0.4))
    const gap = (N: number) => maxDiff(stepProduct(H, 0.7, N), evolve(H, 0.7))
    expect(gap(100) / gap(10)).toBeGreaterThan(0.08)
    expect(gap(100) / gap(10)).toBeLessThan(0.12)
    expect(gap(1000) / gap(100)).toBeGreaterThan(0.09)
    expect(gap(1000) / gap(100)).toBeLessThan(0.11)
  })
  it('the lecture’s overshoot (Go deeper 2): Ē = 0, ωt = 180° stretches |+x⟩ to 3.467, 1.275, 1.025, 1.0025 for N = 1, 10, 100, 1000', () => {
    // H = diag(1, −1) (ħω = 2, Ē = 0), t = π/2: ωt = π
    const H = diag2(1, -1)
    const t = Math.PI / 2
    const sq = (N: number) => norm2(apply(stepProduct(H, t, N), KET['+x']))
    close(sq(1), 1 + (Math.PI / 2) ** 2, 1e-12)
    close(sq(10), (1 + (Math.PI / 20) ** 2) ** 10, 1e-12)
    expect(sq(1)).toBeGreaterThan(3.46)
    expect(sq(10)).toBeGreaterThan(1.27)
    expect(sq(100)).toBeGreaterThan(1.024)
    expect(sq(1000)).toBeLessThan(1.003)
    for (const N of [1, 10, 100, 1000]) expect(isUnitary(stepProduct(H, t, N), 1e-6)).toBe(false)
  })
  it('on one energy component it is the Euler polygon of 709: |(1 − iπ/2N)^N| = 1.862, 1.332, 1.0195 for N = 1, 4, 64', () => {
    const mod = (N: number) => abs(eulerLimit(-Math.PI / 2, N))
    close(mod(1), Math.sqrt(1 + (Math.PI / 2) ** 2))
    expect(mod(4)).toBeGreaterThan(1.33)
    expect(mod(64)).toBeLessThan(1.02)
    // the first diagonal entry of the step product is that same number
    close(abs(stepProduct(diag2(1, -1), Math.PI / 2, 4)[0][0]), mod(4))
  })
  it('one tiny step is unitary only to first order: the squared length grows like dt², not dt', () => {
    const H = twoLevelH(3, 1).H
    const grow = (dt: number) => norm2(apply(tinyStep(H, dt), KET['+x'])) - 1
    close(grow(0.01), 5 * 0.01 ** 2, 1e-12) // ⟨H²⟩ = (9 + 1)/2 = 5 for |+x⟩
    expect(grow(0.005) / grow(0.01)).toBeGreaterThan(0.24)
    expect(grow(0.005) / grow(0.01)).toBeLessThan(0.26)
  })
  it('refuses N that is not a whole number ≥ 1', () => {
    expect(() => stepProduct(diag2(1, 0), 1, 0)).toThrow()
    expect(() => stepProduct(diag2(1, 0), 1, 2.5)).toThrow()
  })
})

describe('clockHands: each energy component is a hand turning clockwise at E/ħ (numpy: np.angle of the evolved ket)', () => {
  it('the wrapped hand angles, the lengths and the gap match the fixture on 14 random level pairs and states', () => {
    for (const k of D.levels) {
      const h = clockHands({ upper: k.upper, lower: k.lower }, V(k.psi0), k.t)
      h.angle.forEach((a, i) => expect(wrapDiff(a, k.angle[i])).toBeLessThan(1e-9))
      h.length.forEach((l, i) => close(l, k.length[i]))
      expect(wrapDiff(h.gap!, k.gap)).toBeLessThan(1e-9)
    }
  })
  it('the unwrapped angle is arg(start) − E t, so a hand that goes round 1½ times reads −3π, not π', () => {
    const h = clockHands(L31, KET['+x'], 3 * Math.PI)
    close(h.turned[0], -9 * Math.PI)
    close(h.turned[1], -3 * Math.PI)
    expect(wrapDiff(h.angle[0], Math.PI)).toBeLessThan(1e-9) // the branch cut: +π and −π name one hand position
    expect(wrapDiff(h.angle[1], Math.PI)).toBeLessThan(1e-9)
  })
  it('direction is part of the contract: both hands fall (clockwise) as time grows, the upper one three times as fast', () => {
    const a = clockHands(L31, KET['+x'], 0.2)
    const b = clockHands(L31, KET['+x'], 0.3)
    expect(b.turned[0]).toBeLessThan(a.turned[0])
    expect(b.turned[1]).toBeLessThan(a.turned[1])
    close((b.turned[0] - a.turned[0]) / (b.turned[1] - a.turned[1]), 3)
    // and the hand of |+z⟩ is the phase of the evolved |+z⟩ amplitude: e^{−i 3 t}
    close(arg(evolveKet(twoLevelH(3, 1).H, 0.2, KET['+x'])[0]), a.turned[0])
  })
  it('the lecture’s numbers (E₊ = 3ε, E₋ = ε, start |+x⟩): hands −90°, −30° and gap 60° at εt/ħ = 30°; gap 90° at 45°', () => {
    const at = (deg: number) => clockHands(L31, KET['+x'], deg * DEG)
    ;[at(30).angle[0] / DEG, at(30).angle[1] / DEG].forEach((x, i) => close(x, [-90, -30][i], 1e-9))
    close(at(30).gap! / DEG, 60, 1e-9)
    close(at(45).gap! / DEG, 90, 1e-9)
    ;[at(45).angle[0] / DEG, at(45).angle[1] / DEG].forEach((x, i) => close(x, [-135, -45][i], 1e-9))
    for (const [deg, k] of Object.entries(D.lecture)) {
      const h = clockHands(L31, KET['+x'], Number(deg) * DEG)
      expect(wrapDiff(h.gap!, k.gap)).toBeLessThan(1e-9)
      h.angle.forEach((a, i) => expect(wrapDiff(a, k.angle[i])).toBeLessThan(1e-9))
    }
  })
  it('the gap is the Bloch azimuth: φ = arg(b/a) of the evolved ket, and wraps at a full lap (εt/ħ = 180° gives 0)', () => {
    const psi = evolveKet(twoLevelH(3, 1).H, 40 * DEG, KET['+x'])
    close(clockHands(L31, KET['+x'], 40 * DEG).gap!, ((arg(psi[1]) - arg(psi[0])) + 2 * Math.PI) % (2 * Math.PI), 1e-12)
    expect(clockHands(L31, KET['+x'], Math.PI).gap! < 1e-9 || clockHands(L31, KET['+x'], Math.PI).gap! > 2 * Math.PI - 1e-9).toBe(true)
  })
  it('a start at a pole has one hand and no gap (|+z⟩: nothing moves that anyone could see)', () => {
    const h = clockHands(L31, KET['+z'], 1)
    expect(h.gap).toBeNull()
    expect(h.length).toEqual([1, 0])
    expect(clockHands(L31, KET['-z'], 1).gap).toBeNull()
  })
  it('a start state off the equator keeps its hand lengths cos(θ/2), sin(θ/2) while the gap keeps φ₀ + ωt', () => {
    const start = ketFromBloch(60 * DEG, 25 * DEG)
    const h = clockHands(L31, start, 20 * DEG)
    close(h.length[0], Math.cos(30 * DEG))
    close(h.length[1], Math.sin(30 * DEG))
    close(h.gap! / DEG, 25 + 2 * 20, 1e-9)
  })
})

describe('precession: |+x⟩ turns about z at ω = (E₊ − E₋)/ħ (numpy: the evolved ket’s sandwiches)', () => {
  it('P(+x; t), ⟨S_x⟩ and the Bloch vector match the fixture on random levels and start states', () => {
    for (const k of D.levels) {
      const p = precession({ upper: k.upper, lower: k.lower }, k.t, V(k.psi0))
      close(p.pPlusX, k.pPlusX)
      close(p.sx, k.sx)
      p.bloch.forEach((x, i) => close(x, k.bloch[i]))
    }
  })
  it('from |+x⟩: P(+x; t) = cos²(ωt/2), ⟨S_x⟩ = ½ cos ωt and the arrow is (cos ωt, sin ωt, 0) (Go deeper 3)', () => {
    const g = rng(5)
    for (let i = 0; i < 20; i++) {
      const up = 0.5 + 5 * g()
      const lo = up - 0.5 - 4 * g()
      const t = 8 * g() - 4
      const w = up - lo
      const p = precession({ upper: up, lower: lo }, t)
      close(p.pPlusX, Math.cos((w * t) / 2) ** 2)
      close(p.sx, 0.5 * Math.cos(w * t))
      close(p.bloch[0], Math.cos(w * t))
      close(p.bloch[1], Math.sin(w * t))
      close(p.bloch[2], 0)
    }
  })
  it('the lecture’s Go-deeper table: ωt = 0°, 60°, 90°, 180° give P = 1, 0.75, 0.5, 0 and ⟨S_x⟩ = 0.5, 0.25, 0, −0.5', () => {
    // ω = 2ε/ħ, so ωt = 2·(εt/ħ)
    const at = (omegaT: number) => precession(L31, (omegaT / 2) * DEG)
    ;[0, 60, 90, 180].forEach((w, i) => {
      close(at(w).pPlusX, [1, 0.75, 0.5, 0][i])
      close(at(w).sx, [0.5, 0.25, 0, -0.5][i])
    })
  })
  it('the sense of the turn is the lecture’s: a quarter turn takes |+x⟩ to |+y⟩, as R_z(90°) does in Lecture 6', () => {
    const psi = evolveKet(twoLevelH(3, 1).H, 45 * DEG, KET['+x'])
    expect(samePhysicalState(psi, KET['+y'])).toBe(true)
    expect(samePhysicalState(psi, apply(Rz(Math.PI / 2), KET['+x']))).toBe(true)
  })
  it('the period is 2π/(E₊ − E₋): π for 3ε and ε, and the arrow is back at +x after it', () => {
    close(precessionPeriod(L31), Math.PI)
    for (const k of D.levels) close(precessionPeriod({ upper: k.upper, lower: k.lower }), k.period)
    const back = precession(L31, precessionPeriod(L31))
    close(back.bloch[0], 1)
    close(back.pPlusX, 1)
  })
})

describe('the two-level result: U(t) = e^{−iĒt} R_z(ωt) and the ket after one period is −e^{−iĒT}|ψ⟩', () => {
  it('U(t) equals the global phase e^{−iĒt} times R_z(ωt), entry for entry, at several times and level pairs', () => {
    for (const [up, lo] of [[3, 1], [6, 4], [2.5, -0.5], [1, 0]]) {
      const tl = twoLevelH(up, lo)
      for (const t of [0.1, 0.5, 1.3, 3.0]) {
        const U = evolve(tl.H, t)
        const want = mscale(Rz(tl.hbarOmega * t), meanPhase(tl.mean, t))
        expect(matEq(U, want, 1e-12)).toBe(true)
      }
    }
  })
  it('raising both energies by the same amount changes only the global phase: every probability and the Bloch vector are the same', () => {
    const a = precession({ upper: 3, lower: 1 }, 0.9)
    const b = precession({ upper: 6, lower: 4 }, 0.9)
    close(a.pPlusX, b.pPlusX)
    a.bloch.forEach((x, i) => close(x, b.bloch[i]))
    const ha = clockHands({ upper: 3, lower: 1 }, KET['+x'], 0.9)
    const hb = clockHands({ upper: 6, lower: 4 }, KET['+x'], 0.9)
    close(ha.gap!, hb.gap!)
    expect(samePhysicalState(evolveKet(twoLevelH(3, 1).H, 0.9, KET['+x']), evolveKet(twoLevelH(6, 4).H, 0.9, KET['+x']))).toBe(true)
  })
  it('for E₊ = 3ε and E₋ = ε, U(T) = −I exactly at εT/ħ = π, with the same numpy matrix; the ket is back to −|ψ⟩ (the full-turn sign of Lecture 7)', () => {
    const UT = evolve(twoLevelH(3, 1).H, Math.PI)
    closeMat(UT, M(D.UT), 1e-12)
    closeMat(UT, mscale(identity(2), -1), 1e-12)
    closeVec(evolveKet(twoLevelH(3, 1).H, Math.PI, KET['+x']), vscale(KET['+x'], -1), 1e-12)
    expect(samePhysicalState(evolveKet(twoLevelH(3, 1).H, Math.PI, KET['+x']), KET['+x'])).toBe(true)
  })
  it('a quarter turn of the arrow is εt/ħ = 45° and one lap is 180°: U(45°) ≅ R_z(90°), U(90°) ≅ R_z(180°)', () => {
    const tl = twoLevelH(3, 1)
    for (const [deg, phi] of [[45, 90], [90, 180], [180, 360]]) {
      const U = evolve(tl.H, deg * DEG)
      expect(matEq(U, mscale(Rz(phi * DEG), meanPhase(tl.mean, deg * DEG)), 1e-12)).toBe(true)
    }
  })
})

describe('stationary states: an energy eigenstate only gains the phase e^{−iEt}', () => {
  it('|±z⟩ are eigenstates of H = diag(E₊, E₋): the ket picks up exactly e^{−iE₊t} and e^{−iE₋t}', () => {
    const H = twoLevelH(3, 1).H
    for (const t of [0.2, 1.1, 4.0]) {
      const up = evolveKet(H, t, KET['+z'])
      const down = evolveKet(H, t, KET['-z'])
      expect(approxEq(up[0], expi(-3 * t), 1e-12)).toBe(true)
      expect(approxEq(down[1], expi(-1 * t), 1e-12)).toBe(true)
      expect(abs(up[1]) < 1e-12 && abs(down[0]) < 1e-12).toBe(true)
      expect(samePhysicalState(up, KET['+z'])).toBe(true)
      close(energyAverage(H, up), 3)
      close(energyAverage(H, down), 1)
    }
  })
  it('for |+x⟩, ⟨H⟩ stays at Ē = 2ε at every time, although the state moves', () => {
    const H = twoLevelH(3, 1).H
    for (const deg of [0, 30, 45, 90, 135]) close(energyAverage(H, evolveKet(H, deg * DEG, KET['+x'])), 2)
  })
  it('a start that is a mixture of energies is not stationary: the Bloch vector moves; one that is an eigenstate does not', () => {
    const moving = precession(L31, 30 * DEG).bloch
    const still = precession(L31, 30 * DEG, KET['+z']).bloch
    expect(Math.abs(moving[1])).toBeGreaterThan(0.5)
    expect(still).toEqual([0, 0, 1])
  })
})

describe('the engine builds nothing new for e^{iφ}', () => {
  it('eulerLimit(−π/2, N) tends to −i, the one-component U at ωt/2 = π/2', () => {
    const z = eulerLimit(-Math.PI / 2, 200000) as C
    expect(approxEq(z, c(0, -1), 1e-4)).toBe(true)
  })
})
