/**
 * Lecture 13 numbers, computed once with the engine (owner: P). Same contract as L1–L12.values.ts: every number a learner reads in L13
 * comes from `V` and is backed by a keyed claim; the numpy twin of each key is in physics/__fixtures__/claims.json
 * (pipeline/make_claim_fixtures.py, "Lecture 13" block). Keys start with `l13`.
 *
 * Conventions as Lecture 12: ħ = m = 1 inside the engine (physics/wave.ts); lengths are in a fixed length ℓ, momenta in ħ/ℓ, times in mℓ²/ħ
 * (the UI appends the units). The unit packet is the Gaussian of width σ = 1ℓ at x₀ = 0 unless a key says otherwise: ψ(x) = (2πσ²)^{−1/4}
 * e^{−(x−x₀)²/4σ²}e^{ip₀x}. The momentum amplitude ψ̃(p) is `toMomentum` (the true transform of the grid state); a plane wave is analytic
 * (`planeSamples`). The only SI numbers are the helium atom's wavelength and fringes and the spreading times (physics/constants.ts).
 * A displayed magnitude of a negative number gets its own key (the number reader sees digits, not signs). Yes/no facts are 1 or 0; a residual
 * that should be zero is stored as itself and claimed to be below a tolerance. A number with an exponent is shown as a mantissa key and a typed power of ten.
 *
 * This file imports physics modules (wave, ring, constants) but no stage module: a lecture chunk must not pull in stage/svg.
 */
import { abs, add, c } from '../physics/complex'
import { M_ELECTRON, M_HELIUM4, YEAR_S, deBroglie, fringeSpacing, spreadTime } from '../physics/constants'
import { type Mat, identity, mat, mscale } from '../physics/linalg'
import { ringEigenphases, ringOffDiagonal, ringUnitaryGap, traceCommutator } from '../physics/ring'
import {
  GRID, boost, commutatorXP, dpdx, freeEvolve, innerProduct, interval, meanP, meanX, meanXFromMomentum, momentumMean, momentumNorm, momentumPeak, norm, pOp, packet, peakDensity,
  planeSamples, spreadP, spreadX, toMomentum, wavelength, xTimes,
} from '../physics/wave'
import { keyedClaim } from './claimKit'

const RAD = 180 / Math.PI
const PK = (x0: number, sigma: number, p0 = 0) => packet(GRID, { x0, sigma, p0 })
const idx = (x: number) => Math.round((x - GRID.x[0]) / GRID.dx) // the grid index of the position x
const mom = (x0: number, sigma: number, p0 = 0) => toMomentum(PK(x0, sigma, p0), GRID)
const plane = (p: number, x: number, o: { shift?: number; time?: number } = {}) => planeSamples([x], [p], o)
const phaseOf = (w: { re: Float64Array; im: Float64Array }) => Math.atan2(w.im[0], w.re[0])

/* unit 1: the spike as a limit */
const U1 = PK(0, 1)
const U05 = PK(0, 0.5)
const U18 = PK(0, 0.125)

/* unit 2: the generator */
const A2 = PK(-1, 1, 2)
const B3 = PK(1, 1, 3)
const herm = (() => {
  const l = innerProduct(A2, pOp(B3, GRID), GRID)
  const r = innerProduct(pOp(A2, GRID), B3, GRID)
  return Math.hypot(l.re - r.re, l.im - r.im)
})()

/* unit 3: the plane wave, helium and the ring of six sites */
const heLambda = deBroglie(M_HELIUM4, 2200) // metres
const ringPhases = ringEigenphases(6)

/* unit 5: the commutator in both pictures; two fixed 3 × 3 matrices for the trace argument */
const P2 = PK(2, 1)
const cm2 = commutatorXP(P2, GRID)
const commResidual = Math.max(
  ...[-1, 0.5, 2].map((x) => {
    const j = idx(x)
    return Math.hypot(cm2.re[j], cm2.im[j] - P2.re[j]) // [x̂, p̂]ψ − iψ at x (ψ is real here)
  }),
)
const commExp = innerProduct(P2, cm2, GRID)
const X3: Mat = mat([[1, c(0, 2), 0], [0, 1, 3], [2, 0, c(0, -1)]])
const Pm3: Mat = mat([[0, 1, c(0, 1)], [1, 2, 0], [c(0, -1), 1, 3]])
const iI3 = mscale(identity(3), c(0, 1))

/* unit 6: the Schrödinger equation in the position basis (checked, not shown) */
const schroOk = (() => {
  const t = 0.7
  const h = 1e-6
  const a = freeEvolve(PK(0, 1, 3), GRID, t)
  const b = freeEvolve(PK(0, 1, 3), GRID, t + h)
  const d2 = dpdx(dpdx(a, GRID), GRID) // ψ″
  // iħ ∂ₜψ = Ĥψ with Ĥ = −½ ∂ₓ²: (ψ(t + h) − ψ(t))/h should be (i/2) ψ″
  let m = 0
  let s = 0
  for (let j = 0; j < GRID.n; j++) {
    const dre = (b.re[j] - a.re[j]) / h
    const dim = (b.im[j] - a.im[j]) / h
    m = Math.max(m, Math.hypot(dre + 0.5 * d2.im[j], dim - 0.5 * d2.re[j]))
    s = Math.max(s, Math.hypot(d2.re[j], d2.im[j]))
  }
  return m / s < 1e-4 ? 1 : 0
})()
const F3 = freeEvolve(PK(0, 1, 3), GRID, 4)
const tMarbleMant = spreadTime(1e-3, 1e-3) // seconds: a gram, a tenth of a centimetre
const tElectron = spreadTime(M_ELECTRON, 1e-10) // seconds: an atom-sized packet

/* unit 7: the boost twin of the energy shift, Ehrenfest and momentum conservation */
const U15 = boost(U1, GRID, 1.5)
const wpw = (() => {
  // e^{−iεx̂} p̂ e^{iεx̂} ψ against (p̂ + ε)ψ, the twin of V Ĥ V† = Ĥ + ε
  const lhs = boost(pOp(boost(U1, GRID, 1.5), GRID), GRID, -1.5)
  const rhs = pOp(U1, GRID)
  let m = 0
  for (let j = 0; j < GRID.n; j++) m = Math.max(m, Math.hypot(lhs.re[j] - rhs.re[j] - 1.5 * U1.re[j], lhs.im[j] - rhs.im[j] - 1.5 * U1.im[j]))
  return m
})()
const freeComm = (() => {
  const psi = PK(0, 1, 3)
  const H = (w: typeof psi) => {
    const d2 = dpdx(dpdx(w, GRID), GRID)
    return { re: d2.re.map((v) => -0.5 * v), im: d2.im.map((v) => -0.5 * v) } // Ĥ = p̂²/2 = −½ ∂ₓ²
  }
  const a = H(pOp(psi, GRID))
  const b = pOp(H(psi), GRID)
  let m = 0
  for (let j = 0; j < GRID.n; j++) m = Math.max(m, Math.hypot(a.re[j] - b.re[j], a.im[j] - b.im[j]))
  return m
})()
const ehrenfest = (() => {
  // d⟨p̂⟩/dt = (i/ħ)⟨[Ĥ, p̂]⟩ for V = x²/2 (the kinetic part commutes with p̂): ⟨ψ|(V p̂ − p̂ V)ψ⟩ with V = x²/2
  const psi = PK(2, 1)
  const half = (w: typeof psi) => {
    const x2 = xTimes(xTimes(w, GRID), GRID)
    return { re: x2.re.map((v) => 0.5 * v), im: x2.im.map((v) => 0.5 * v) }
  }
  const a = half(pOp(psi, GRID))
  const b = pOp(half(psi), GRID)
  const C = { re: a.re.map((v, j) => v - b.re[j]), im: a.im.map((v, j) => v - b.im[j]) }
  return -innerProduct(psi, C, GRID).im // Re(i·z) = −Im z
})()

/* unit 6 (Go deeper, §13.10): two plane waves p = 2 and 4, m = 1. The brightest fringe is where the two phases agree: Im(ψ₁*ψ₂) changes sign there. */
const relSin = (x: number, t: number) => {
  const a = plane(2, x, { time: t })
  const b = plane(4, x, { time: t })
  return a.re[0] * b.im[0] - a.im[0] * b.re[0] // sin(θ₂ − θ₁)
}
const fringeAt = (lo: number, hi: number, t: number) => {
  let a = lo
  let b = hi
  for (let i = 0; i < 100; i++) {
    const m = (a + b) / 2
    if (relSin(a, t) * relSin(m, t) <= 0) b = m
    else a = m
  }
  return (a + b) / 2
}

export const V = {
  /* l13-delta */
  l13Peak1: peakDensity(U1), // 0.3989
  l13Peak05: peakDensity(U05), // 0.7979
  l13Peak0125: peakDensity(U18), // 3.192
  l13NarrowP1: interval(U1, GRID, -0.25, 0.25), // 0.1974
  l13NarrowP05: interval(U05, GRID, -0.25, 0.25), // 0.3829
  l13NarrowP0125: interval(U18, GRID, -0.25, 0.25), // 0.9545
  l13NarrowNorm0125: norm(U18, GRID), // 1
  l13Dp0125: spreadP(U18, GRID), // 4
  /* l13-generator */
  l13MeanP3: meanP(PK(0, 1, 3), GRID), // 3
  l13HermResidual: herm, // 0 (a rounding error): ⟨a|p̂b⟩ − ⟨p̂a|b⟩
  l13PPsiCentre: pOp(PK(0, 1, 3), GRID).re[idx(0)], // 1.895: (p̂ψ) at the centre of the p₀ = 3 packet, 3ψ(x₀)
  l13MeanPReal: meanP(PK(0, 1), GRID), // 0 (a rounding error): ⟨p⟩ of a real wavefunction
  /* l13-plane-wave */
  l13ShiftPhaseRadMag: Math.abs(phaseOf(plane(2, 0, { shift: Math.PI / 4 }))), // 1.571: the phase T(λ/4) adds to e^{2ix}, a quarter wavelength (−π/2)
  l13ShiftPhaseDegMag: Math.abs(phaseOf(plane(2, 0, { shift: Math.PI / 4 }))) * RAD, // 90
  l13FlatSingle: (() => {
    const d = [-8, -3.1, 0, 0.7, 2.5, 8].map((x) => plane(3, x)).map((w) => w.re[0] ** 2 + w.im[0] ** 2)
    return Math.max(...d) - Math.min(...d) // 0: |ψ|² is the same at every x
  })(),
  l13Dp4: spreadP(PK(0, 4, 3), GRID), // 0.125
  l13LambdaHePm: heLambda * 1e12, // 45.31
  l13FringeHeUm: fringeSpacing(1.95, heLambda, 8e-6) * 1e6, // 11.04
  l13Lambda3: wavelength(3), // 2.094
  l13RingPhase1: Math.abs(ringPhases[1]), // 60
  l13RingPhase2: Math.abs(ringPhases[2]), // 120
  l13RingPhase3: Math.abs(ringPhases[3]), // 180
  l13RingDiag: ringOffDiagonal(6), // 0
  l13RingUnitary: ringUnitaryGap(6), // 0
  /* l13-momentum-space */
  l13MeanPFromPhi: momentumMean(mom(0, 1, 3), GRID), // 3
  l13PhiPeak1: momentumPeak(mom(0, 1)), // 0.7979
  l13NormP1: momentumNorm(mom(0, 1), GRID), // 1
  l13NormP05: momentumNorm(mom(0, 0.5), GRID), // 1
  l13NormP2: momentumNorm(mom(0, 2), GRID), // 1
  l13Dp1: spreadP(U1, GRID), // 0.5
  l13Dp05: spreadP(U05, GRID), // 1
  l13Dp2: spreadP(PK(0, 2), GRID), // 0.25
  l13DxDp1: spreadX(U1, GRID) * spreadP(U1, GRID), // 0.5
  l13DxDp05: spreadX(U05, GRID) * spreadP(U05, GRID), // 0.5
  /* l13-two-bases */
  l13PMeanFromPhiMul: momentumMean(mom(0, 1), GRID), // 0 (a rounding error)
  l13XMeanFromP: meanXFromMomentum(mom(2, 1), GRID), // 2.000: ⟨x⟩ = ∫ψ̃*(iħ∂ₚψ̃)dp
  l13CommResidual: commResidual, // 0 (a rounding error): ([x̂, p̂]ψ − iψ) at x = −1, 0.5, 2
  l13CommExpIm: commExp.im, // 1: ⟨[x̂, p̂]⟩ = i
  l13CommExpRe: commExp.re, // 0
  l13DxDp2: spreadX(PK(0, 2), GRID) * spreadP(PK(0, 2), GRID), // 0.5
  l13TraceComm: abs(traceCommutator(X3, Pm3)), // 0 (a rounding error)
  l13TraceIdentity: abs(iI3.reduce((s, row, i) => add(s, row[i]), c(0))), // 3
  /* l13-schrodinger */
  l13SchroOk: schroOk, // 1: (ψ(t + h) − ψ(t))/h = −iĤψ to 1e−4 at h = 1e−6
  l13FreeMean2: meanX(freeEvolve(PK(0, 1, 3), GRID, 2), GRID), // 6
  l13OmegaK2: -phaseOf(plane(2, 0, { time: 0.5 })) / 0.5, // 2: the phase of e^{ikx} runs at ħk²/2m
  l13PlanePhaseDegMag: Math.abs(phaseOf(plane(2, 0, { time: 1 }))) * RAD, // 114.59
  l13FreeDp4: spreadP(F3, GRID), // 0.5
  l13FreeSd2: spreadX(freeEvolve(PK(0, 1), GRID, 2), GRID), // 1.414
  l13FreeSd4: spreadX(freeEvolve(PK(0, 1), GRID, 4), GRID), // 2.236
  l13SpreadElectronMant: tElectron / 1e-17, // 8.64 (× 10⁻¹⁷ s)
  l13SpreadElectronLog10: Math.log10(tElectron), // −16.06
  l13SpreadMarbleMant: tMarbleMant / 1e24, // 9.48 (× 10²⁴ s)
  l13SpreadMarbleYearsMant: tMarbleMant / YEAR_S / 1e17, // 3.0 (× 10¹⁷ years)
  /* l13-time */
  l13FreeNorm4: norm(F3, GRID), // 1
  l13FreeCommutatorOk: freeComm < 1e-9 ? 1 : 0, // 1: [Ĥ_free, p̂]ψ vanishes (a residual of rounding size)
  l13BoostMean: meanP(U15, GRID), // 1.5
  l13BoostSd: spreadP(U15, GRID), // 0.5
  l13WpWdag: wpw, // 0 (a rounding error)
  l13EhrenfestDpDt: ehrenfest, // −2
  l13MinFreeEnergy: Math.min(...Array.from(GRID.k, (k) => (k * k) / 2)), // 0
  /* l13-schrodinger, Go deeper (§13.10) */
  l13FringeSpacing: fringeAt(Math.PI - 0.5, Math.PI + 0.5, 0) - fringeAt(-0.5, 0.5, 0), // 3.142 = π
  l13FringeSpeed: (fringeAt(1, 2, 0.5) - fringeAt(-0.5, 0.5, 0)) / 0.5, // 3.0: the tracked fringe
  l13FringeSpeedFormula: (2 + 4) / 2, // 3: (p₁ + p₂)/2m
} as const

export type ValueKey = keyof typeof V

/** A claim tied to one L13 engine value: its text starts with `key · ` (read by content/claims.test.ts). */
export const claim = keyedClaim<ValueKey>()

export { close, d, pct, tf, uf } from './claimKit'
