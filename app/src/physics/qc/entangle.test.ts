/**
 * qc/entangle.ts against numpy (block "entangle": np.kron + np.trace correlators, np.linalg.svd for Horodecki's
 * bound and the pure-state concurrence, the full non-Hermitian eigenvalues of ρρ̃ for Wootters' concurrence,
 * itertools.product for the LHV bound), plus properties: Tsirelson's bound, isPPT ⇔ concurrence 0 for two qubits,
 * and a Bell state's exact Tsirelson violation, negativity and concurrence.
 */
import { describe, expect, it } from 'vitest'
import { c } from '../complex'
import { norm, normalize, type Vec } from '../linalg'
import { bell, kron, randomState } from './state'
import { densityOf, mixtureN, randomDensity } from './density'
import {
  type Dir,
  chsh,
  chshCurve,
  chshFromAxes,
  chshMaxHorodecki,
  concurrence,
  concurrencePure,
  correlationTensor,
  correlator,
  eofFromC,
  isPPT,
  lhvChsh,
  nDotSigma,
  negativity,
  prBox,
} from './entangle'
import { rng } from '../random'
import { FX, cm, cv } from './testkit'

const PHI_P = bell('00+11')
const PSI_M = bell('01-10')
const close = (a: number, b: number, eps = 1e-9) => expect(Math.abs(a - b), `${a} ≈ ${b}`).toBeLessThan(eps)
const TSIRELSON = 2 * Math.sqrt(2)
const X_DIR: Dir = [1, 0, 0]
const Y_DIR: Dir = [0, 1, 0]
const Z_DIR: Dir = [0, 0, 1]

describe('entangle: correlator / correlationTensor', () => {
  it('correlator on Phi+: <ZZ>=1, <XX>=1, <YY>=-1, <XZ>=0 (a ket and its density matrix agree)', () => {
    close(correlator(PHI_P, nDotSigma(Z_DIR), nDotSigma(Z_DIR)), 1)
    close(correlator(PHI_P, nDotSigma(X_DIR), nDotSigma(X_DIR)), 1)
    close(correlator(PHI_P, nDotSigma(Y_DIR), nDotSigma(Y_DIR)), -1)
    close(correlator(PHI_P, nDotSigma(X_DIR), nDotSigma(Z_DIR)), 0)
    close(correlator(densityOf(PHI_P), nDotSigma(Z_DIR), nDotSigma(Z_DIR)), correlator(PHI_P, nDotSigma(Z_DIR), nDotSigma(Z_DIR)))
  })

  it('the Bell states: Phi+ -> diag(1, -1, 1), Psi- -> diag(-1, -1, -1)', () => {
    const T = correlationTensor(PHI_P)
    const fixture = FX.entangle.correlationTensor['Phi+']
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) close(T[i][j], fixture[i][j])
    close(T[0][0], 1)
    close(T[1][1], -1)
    close(T[2][2], 1)
    const Tm = correlationTensor(PSI_M)
    const fixtureM = FX.entangle.correlationTensor['Psi-']
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) close(Tm[i][j], fixtureM[i][j])
  })

  it('matches numpy on a random mixed state (ket XOR density both accepted)', () => {
    const { rho, T } = FX.entangle.correlationTensorRandom
    const r = cm(rho)
    const got = correlationTensor(r)
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) close(got[i][j], T[i][j])
    // the ket route and the density-matrix route of `correlator` agree on a pure state
    const ketT = correlationTensor(PHI_P)
    const rhoT = correlationTensor(densityOf(PHI_P))
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) close(ketT[i][j], rhoT[i][j])
  })
})

describe('entangle: chsh / chshFromAxes / chshCurve', () => {
  it('matches numpy for Bergou\'s phase-dial state at several deltas, and the closed form 2cos(delta)+2sin(delta)', () => {
    const phaseBell = (deltaDeg: number): Vec => [c(Math.SQRT1_2), c(0), c(0), c(Math.SQRT1_2 * Math.cos((deltaDeg * Math.PI) / 180), Math.SQRT1_2 * Math.sin((deltaDeg * Math.PI) / 180))]
    for (const { deltaDeg, S, closedForm } of FX.entangle.chshPhase) {
      const got = chshCurve(phaseBell, [X_DIR, Y_DIR], [X_DIR, Y_DIR], deltaDeg)
      close(got, S, 1e-9)
      close(got, closedForm, 1e-9)
    }
  })

  it('chshFromAxes matches chsh built from the same directions via nDotSigma', () => {
    const a1 = nDotSigma(X_DIR)
    const a2 = nDotSigma(Y_DIR)
    const b1 = nDotSigma(X_DIR)
    const b2 = nDotSigma(Y_DIR)
    close(chsh(PHI_P, a1, a2, b1, b2), chshFromAxes(PHI_P, [X_DIR, Y_DIR], [X_DIR, Y_DIR]))
  })

  it('a Bell state at the optimal settings (a = Z, X; b = (Z+X)/√2, (Z-X)/√2) reaches exactly Tsirelson\'s bound 2√2', () => {
    const bPlus: Dir = [Math.SQRT1_2, 0, Math.SQRT1_2]
    const bMinus: Dir = [-Math.SQRT1_2, 0, Math.SQRT1_2]
    const S = chshFromAxes(PHI_P, [Z_DIR, X_DIR], [bPlus, bMinus])
    close(Math.abs(S), TSIRELSON, 1e-9)
  })

  it('Tsirelson\'s bound: |S| <= 2√2 for 200 random states and random axis settings', () => {
    const R = rng(21090)
    const randomDir = (): Dir => {
      const z = 2 * R() - 1
      const phi = 2 * Math.PI * R()
      const s = Math.sqrt(1 - z * z)
      return [s * Math.cos(phi), s * Math.sin(phi), z]
    }
    for (let t = 0; t < 200; t++) {
      const rho = t % 2 === 0 ? randomDensity(4, R, 1 + (t % 4)) : densityOf(randomState(2, R))
      const S = chshFromAxes(rho, [randomDir(), randomDir()], [randomDir(), randomDir()])
      expect(Math.abs(S)).toBeLessThanOrEqual(TSIRELSON + 1e-9)
    }
  })
})

describe('entangle: chshMaxHorodecki', () => {
  it('matches numpy (SVD of T) and hits exactly 2√2 for a Bell state', () => {
    for (const { name, M } of FX.entangle.chshMaxHorodecki) {
      const state = name === 'Phi+' ? PHI_P : name === 'Psi-' ? PSI_M : name === 'rhoRand' ? cm(FX.entangle.correlationTensorRandom.rho) : undefined
      if (state) close(chshMaxHorodecki(state), M)
    }
    close(chshMaxHorodecki(PHI_P), TSIRELSON)
  })

  it('bounds every random chshFromAxes score for that state (it is the MAXIMUM over all settings)', () => {
    const R = rng(21091)
    const randomDir = (): Dir => {
      const z = 2 * R() - 1
      const phi = 2 * Math.PI * R()
      const s = Math.sqrt(1 - z * z)
      return [s * Math.cos(phi), s * Math.sin(phi), z]
    }
    for (let t = 0; t < 50; t++) {
      const rho = randomDensity(4, R, 1 + (t % 4))
      const max = chshMaxHorodecki(rho)
      for (let k = 0; k < 10; k++) expect(Math.abs(chshFromAxes(rho, [randomDir(), randomDir()], [randomDir(), randomDir()]))).toBeLessThanOrEqual(max + 1e-6)
    }
  })
})

describe('entangle: lhvChsh / prBox', () => {
  it('matches numpy: 16 assignments, the classical bound is exactly 2', () => {
    const { assignments, maxS, xValues } = lhvChsh()
    expect(assignments).toEqual(FX.entangle.lhvChsh.assignments)
    expect(xValues).toEqual(FX.entangle.lhvChsh.xValues)
    expect(maxS).toBe(2)
    expect(FX.entangle.lhvChsh.maxS).toBe(2)
    for (const x of xValues) expect(Math.abs(x)).toBe(2)
  })

  it('prBox: S = 4, strictly above both the classical bound and Tsirelson\'s', () => {
    const { S, table } = prBox()
    expect(S).toBe(4)
    expect(table).toEqual(FX.entangle.prBox.table)
    expect(S).toBeGreaterThan(TSIRELSON)
  })
})

describe('entangle: isPPT / negativity', () => {
  it('matches numpy on product states, Bell states, Werner states and random mixtures', () => {
    for (const { name, rho, isPPT: want, negativity: wantN } of FX.entangle.ppt) {
      const r = cm(rho)
      expect(isPPT(r), name).toBe(want)
      close(negativity(r), wantN, 1e-9)
    }
  })

  it('negativity is 0 for a product state and exactly 1/2 for a Bell state', () => {
    const product = densityOf([c(1), c(0), c(0), c(0)])
    close(negativity(product), 0)
    expect(isPPT(product)).toBe(true)
    close(negativity(densityOf(PHI_P)), 0.5)
    expect(isPPT(densityOf(PHI_P))).toBe(false)
  })

  it('isPPT <=> concurrence ~ 0, for two qubits (Peres-Horodecki): 150 random density matrices', () => {
    const R = rng(21092)
    for (let t = 0; t < 150; t++) {
      const rho = randomDensity(4, R, 1 + (t % 4))
      expect(isPPT(rho), `rho ${t}`).toBe(concurrence(rho) < 1e-7)
    }
  })

  it('a separable mixture of product states is always PPT with concurrence 0 (40 random mixtures)', () => {
    const R = rng(21093)
    for (let t = 0; t < 40; t++) {
      const w = [R(), R(), R()]
      const sum = w.reduce((a, b) => a + b, 0)
      const parts = w.map((wk) => ({ w: wk / sum, psi: kron(randomState(1, R), randomState(1, R)) }))
      const rho = mixtureN(parts)
      expect(isPPT(rho), `separable mixture ${t}`).toBe(true)
      close(negativity(rho), 0, 1e-9)
      close(concurrence(rho), 0, 1e-6)
    }
  })
})

describe('entangle: concurrencePure / concurrence / eofFromC', () => {
  it('matches numpy: concurrencePure on pure states, by the independent 2 s1 s2 SVD route', () => {
    for (const { name, psi, C } of FX.entangle.concurrencePure) void name, close(concurrencePure(cv(psi)), C, 1e-9)
  })

  it('matches numpy: Wootters concurrence on mixed states, Werner thresholds, GHZ/W reduced pairs', () => {
    for (const { name, rho, C } of FX.entangle.concurrence) void name, close(concurrence(cm(rho)), C, 1e-7)
  })

  it('a Bell state has concurrence 1; an orthogonal product state has concurrence 0', () => {
    close(concurrencePure(PHI_P), 1)
    close(concurrencePure([c(1), c(0), c(0), c(0)]), 0)
    close(concurrence(densityOf(PHI_P)), 1)
    close(concurrence(densityOf([c(1), c(0), c(0), c(0)])), 0)
  })

  it('eofFromC matches numpy and the two endpoints: 0 at C=0, 1 bit at C=1', () => {
    for (const { C, E } of FX.entangle.eofFromC) close(eofFromC(C), E, 1e-9)
    close(eofFromC(0), 0)
    close(eofFromC(1), 1)
  })

  it('concurrencePure and concurrence(densityOf(.)) agree for 60 random pure states', () => {
    const R = rng(21094)
    for (let t = 0; t < 60; t++) {
      const psi = randomState(2, R)
      close(concurrencePure(psi), concurrence(densityOf(psi)), 1e-7)
    }
  })
})

describe('entangle: a mutation check', () => {
  // these assertions are tight enough that a plausible bug each catches at least one of them:
  it('the CHSH minus sign is on a2 b2, not elsewhere (swapping it would break the Bell-state maximum)', () => {
    const bPlus: Dir = [Math.SQRT1_2, 0, Math.SQRT1_2]
    const bMinus: Dir = [-Math.SQRT1_2, 0, Math.SQRT1_2]
    const right = chshFromAxes(PHI_P, [Z_DIR, X_DIR], [bPlus, bMinus])
    const wrongSign = chsh(PHI_P, nDotSigma(Z_DIR), nDotSigma(X_DIR), nDotSigma(bMinus), nDotSigma(bPlus))
    close(Math.abs(right), TSIRELSON, 1e-9)
    expect(Math.abs(Math.abs(wrongSign) - TSIRELSON)).toBeGreaterThan(1e-3)
  })

  it('concurrencePure is exactly 0 for a product state with complex amplitudes (a dropped conjugate would not give 0)', () => {
    const R = rng(21095)
    for (let t = 0; t < 20; t++) {
      const psi = kron(randomState(1, R), randomState(1, R))
      close(concurrencePure(psi), 0, 1e-9)
    }
  })

  it('concurrencePure is invariant under a global phase (dropping the conjugate would break this too)', () => {
    const R = rng(21096)
    const psi = randomState(2, R)
    const rotated = psi.map((x) => c(x.re * Math.cos(0.7) - x.im * Math.sin(0.7), x.re * Math.sin(0.7) + x.im * Math.cos(0.7)))
    close(concurrencePure(psi), concurrencePure(normalize(rotated)), 1e-9)
    expect(norm(psi)).toBeGreaterThan(0)
  })
})
