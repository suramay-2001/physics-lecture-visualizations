/**
 * Chapter Q3 numbers (Physics 709, "Measurement, the Bloch sphere and uncertainty"), computed once with the engine.
 * Plan: docs/roles/proposals/P-Q3-story.md; rulings docs/roles/decisions/qc709-Q2Q3.md, qc709-map.md, qc709-pilots.md,
 * qc709-nc.md.
 *
 * Same contract as Q1.values.ts: every number a learner reads in Q3 comes from `V` and is backed by a keyed claim
 * (content.test.tsx "claims hold"); the numpy twin of each key is in physics/__fixtures__/claims-qc709/q3.json
 * (pipeline/claims_qc709/q3.py, computed by an independent route: numpy.linalg.eigh and direct matrix arithmetic,
 * never the engine's a₀I + a·σ decomposition). Keys start with `q3` and are unique across both courses. `yes()`
 * turns a structural fact (an operator identity, a matrix equality) into 1 or 0, the convention Q1 uses for
 * `q1Commutator`, `q1ProjIdem`, `q1Lazy`.
 *
 * Conventions (the plan's "Conventions"): ψ = Q2's running state = ketFromBloch(π/3, 0) = (0.866, 0.5), the same
 * route Q1.values.ts uses for `psi30`. |+n⟩ is the chapter's sphere state, θ = 60°, φ = 45°.
 *
 * Engine gaps: none (P-Q3-story §9.1). Stage-contract gaps: none (§9.2).
 */
import { I, abs, abs2, c } from '../../physics/complex'
import {
  anticommutator,
  apply,
  charPoly2,
  commutator,
  dagger,
  inner,
  isDiagonal,
  isHermitian,
  madd,
  mat,
  matEq,
  matmul,
  mscale,
  norm,
  norm2,
  normalize,
  vec,
  vscale,
  type Mat,
} from '../../physics/linalg'
import { decomposeHermitian, eigen2 } from '../../physics/operators'
import { changeU, eigh, funcHermitian } from '../../physics/qc/cmat'
import { H, I2 } from '../../physics/qc/gates'
import { moment, robertsonBound, varianceN } from '../../physics/qc/measure'
import { benchTheory } from '../../physics/sg'
import { KET, SIGMA_X, SIGMA_Y, SIGMA_Z, SX, SY, SZ, blochVector, expectation, ketFromBloch, nDotSigma, projector, prob, sandwich, spinAlong } from '../../physics/spin'
import { claimKey, close, d, keyedClaim, pct, tf, uf } from '../claimKit'

const yes = (b: boolean) => (b ? 1 : 0)
const sameRay = (a: ReturnType<typeof vec>, b: ReturnType<typeof vec>) => close(prob(normalize(a), normalize(b)), 1)

/* ---- shared states (the plan's "Conventions") ---- */
/** ψ, Q2's running state at plane angle 30° (Bloch θ = 60°, φ = 0): (0.866, 0.5), the route Q1's `psi30` uses. */
const psi = ketFromBloch(Math.PI / 3, 0)
/** |+n⟩: θ = 60°, φ = 45° (Eq. 1.4). */
const N = ketFromBloch(Math.PI / 3, Math.PI / 4)
/** |−n⟩: θ = 120°, φ = 225° (Eq. 1.5's antipode). */
const MINUS_N = ketFromBloch((2 * Math.PI) / 3, (5 * Math.PI) / 4)
const NVEC = blochVector(N)
const PX = projector(KET['+x'])
const MX = projector(KET['-x'])
const PZ = projector(KET['+z'])
const MZ = projector(KET['-z'])
/** M = [[1, 2 − i], [2 + i, −3]] (§sp:b1), Hermitian: eigenvalues −4, 2. */
const M: Mat = mat([
  [1, c(2, -1)],
  [c(2, 1), -3],
])
/** J, the quarter turn [[0, −1], [1, 0]] (§ob:b6, §sp:b2): real, anti-Hermitian, eigenvalues ±i. */
const J: Mat = mat([
  [0, -1],
  [1, 0],
])
/** A = [[1, −1], [1, 1]] (Unit 2.4's +45° turn-and-stretch); A† = [[1, 1], [−1, 1]] turns by −45° (§ob:b4). */
const A: Mat = mat([
  [1, -1],
  [1, 1],
])
/** The non-Hermitian table of §ob:b5's clue. */
const NONHERM: Mat = mat([
  [0, 1],
  [0, 0],
])
const S2 = madd(madd(matmul(SX, SX), matmul(SY, SY)), matmul(SZ, SZ))
/** z → y and z → x basis-change matrices (linalg.ts `changeU`; old basis omitted = the standard/z basis). */
const U_ZY = changeU([KET['+y'], KET['-y']])
const U_ZX = changeU([KET['+x'], KET['-x']])
/** The x-basis table of P_{+z}: H P_{+z} H (H = H† = H⁻¹), used by three beats (so:b2, so:b6). */
const P_Z_IN_X = matmul(matmul(H, PZ), H)

const eigM = eigh(M)
const gaugeM = decomposeHermitian(M)!
const jEig = eigen2(J).values
const sigmaNEig = eigh(nDotSigma(NVEC)).values
const robN = robertsonBound(N, SX, SY)
const robZ = robertsonBound(KET['+z'], SX, SY)
const robX = robertsonBound(KET['+x'], SX, SY)
const deltaSx = madd(SX, mscale(I2, -expectation(SX, N)))
const deltaSy = madd(SY, mscale(I2, -expectation(SY, N)))
const covXY = sandwich(anticommutator(deltaSx, deltaSy), N).re / 2
/** D5 step 4's split ΔAΔB = ½[ΔA,ΔB] + ½{ΔA,ΔB}, checked as a matrix identity at |+n⟩ (not a bare literal). */
const halfSplitHolds = matEq(matmul(deltaSx, deltaSy), madd(mscale(commutator(deltaSx, deltaSy), 0.5), mscale(anticommutator(deltaSx, deltaSy), 0.5)))
/** Schwarz's worked pair (§un:b3): a = (1, i), b = (2, 1). */
const SCHWARZ_A = vec(1, I)
const SCHWARZ_B = vec(2, 1)
const innerBA = inner(SCHWARZ_B, SCHWARZ_A) // ⟨b|a⟩
const lambdaBest = { re: -innerBA.re / norm2(SCHWARZ_B), im: -innerBA.im / norm2(SCHWARZ_B) }

export const V = {
  /* q3-born */
  q3Pzx: prob(KET['+x'], KET['+z']), // 0.5
  q3BornPlus: prob(KET['+x'], psi), // 0.9330
  q3BornMinus: prob(KET['-x'], psi), // 0.0670
  q3ProjLen: norm(apply(PX, psi)), // 0.9659
  q3SandwichMatchesProb: yes(close(sandwich(PX, psi).re, prob(KET['+x'], psi))), // 1: D1
  q3Complete: yes(matEq(madd(PX, MX), I2) && matEq(madd(PZ, MZ), I2)), // 1
  q3AfterPlus: yes(sameRay(apply(PX, psi), KET['+x'])), // 1
  q3PhaseProj: yes(matEq(projector(vscale(KET['+x'], -1)), PX) && matEq(projector(vscale(KET['+x'], I)), PX)), // 1
  q3BSandwich: sandwich(PX, vec(0.6, 0.8)).re, // 0.98 (challenge q3-b-sandwich)
  q3BPhase: sandwich(MX, vec(0.6, c(0, 0.8))).re, // 0.5 (challenge q3-b-phase)

  /* q3-bloch */
  q3NAlpha: N[0].re, // 0.8660
  q3NBetaRe: N[1].re, // 0.3536
  q3NBetaIm: N[1].im, // 0.3536
  q3NVecXY: NVEC[0], // 0.6124 (n_x = n_y here)
  q3NVecZ: NVEC[2], // 0.5
  q3MinusNAlpha: MINUS_N[0].re, // 0.5
  q3MinusNBetaAbs: abs(MINUS_N[1]), // 0.866 (|−n⟩'s |−z⟩ amplitude, sin(θ/2) at θ=120°)
  q3NOrth: abs(inner(N, MINUS_N)), // 0 (reused in q3-spectral:b3)
  q3MinusZpole: yes(sameRay(ketFromBloch(Math.PI, Math.PI), KET['-z']) && sameRay(vscale(KET['+z'], -1), KET['+z'])), // 1
  q3STheta: (Math.acos(2 * 0.75 - 1) * 180) / Math.PI, // 60 (challenge q3-s-theta)
  q3SNx: blochVector(ketFromBloch(Math.PI / 2, Math.PI / 3))[0], // 0.5 (challenge q3-s-nx)
  q3SMinus: ketFromBloch((2 * Math.PI) / 3, Math.PI)[0].re, // 0.5 (challenge q3-s-minus)
  q3SMinusBetaAbs: abs(ketFromBloch((2 * Math.PI) / 3, Math.PI)[1]), // 0.866 (the same state's |−z⟩ amplitude)
  q3S120: prob(KET['+z'], ketFromBloch((2 * Math.PI) / 3, 0)), // 0.25 (challenge q3-s-120)

  /* q3-spin-operators */
  q3PsiAlpha: psi[0].re, // 0.866 (ψ's |+z⟩ coordinate; equals q3NAlpha only by coincidence, both θ=60°)
  q3PsiBeta: psi[1].re, // 0.5 (ψ's |−z⟩ coordinate)
  q3ReducePsi0: apply(PZ, psi)[0].re, // 0.8660
  q3XZOverlap: abs(inner(KET['+x'], KET['+z'])), // 0.7071
  q3PzInX: yes(matEq(P_Z_IN_X, mscale(mat([[1, 1], [1, 1]]), 0.5))), // 1
  q3Idem: yes(matEq(matmul(P_Z_IN_X, P_Z_IN_X), P_Z_IN_X)), // 1: P² = P in the x basis too
  q3SzBuild: yes(matEq(mscale(madd(PZ, mscale(MZ, -1)), 0.5), SZ)), // 1
  q3SxBuild: yes(matEq(mscale(madd(PX, mscale(MX, -1)), 0.5), SX)), // 1
  q3SyBuild: yes(matEq(mscale(madd(projector(KET['+y']), mscale(projector(KET['-y']), -1)), 0.5), SY)), // 1
  q3Y5050: prob(KET['+z'], KET['+y']), // 0.5 (= prob(KET['+x'], KET['+y']) too)
  q3SigmaNTop: nDotSigma(NVEC)[0][1].re, // 0.6124 (top-right entry's real part, = n_x)
  q3SnIsSpinAlong: yes(matEq(mscale(madd(projector(N), mscale(projector(MINUS_N), -1)), 0.5), spinAlong(NVEC))), // 1
  q3SigmaNEig: yes(close(sigmaNEig[0], -1) && close(sigmaNEig[1], 1)), // 1: ±1
  q3PzInXisPx: yes(matEq(P_Z_IN_X, PX)), // 1
  q3NotSame: yes(!matEq(PZ, PX)), // 1
  q3OPx: PX[0][1].re, // 0.5 (challenge q3-o-px)
  q3OPz: norm(apply(PZ, vec(0.6, 0.8))), // 0.6 (challenge q3-o-pz)
  q3OSigmaN: nDotSigma([Math.sin(Math.PI / 3), 0, Math.cos(Math.PI / 3)])[0][0].re, // 0.5 (challenge q3-o-sigman)

  /* q3-observables */
  q3SelectivePlus: benchTheory({ source: 'oven', axes: ['z', 'z'], keep: ['+'] }).plus, // 0.5
  q3SelectiveBlocked: benchTheory({ source: 'oven', axes: ['z', 'z'], keep: ['+'] }).blocked[0], // 0.5
  q3Pz75: prob(KET['+z'], N), // 0.75
  q3Pz25: prob(KET['-z'], N), // 0.25
  q3AvgSz: expectation(SZ, N), // 0.25
  q3AvgSzSum: 0.5 * prob(KET['+z'], N) - 0.5 * prob(KET['-z'], N), // 0.25, a second route (D3-style cross-check)
  q3AvgSx: expectation(SX, N), // 0.3062
  q3AvgSy: expectation(SY, N), // 0.3062
  q3AvgSigma: yes(close(expectation(SIGMA_X, N), NVEC[0]) && close(expectation(SIGMA_Y, N), NVEC[1]) && close(expectation(SIGMA_Z, N), NVEC[2])), // 1
  q3AdagCheck: yes(matEq(dagger(A), mat([[1, 1], [-1, 1]]))), // 1
  q3AdagNorm: norm(apply(dagger(A), psi)), // 1.4142
  q3AdjProdEq: yes(matEq(dagger(matmul(A, SX)), matmul(dagger(SX), dagger(A)))), // 1: (AB)† = B†A†
  q3AdjProdNeq: yes(!matEq(dagger(matmul(A, SX)), matmul(dagger(A), dagger(SX)))), // 1: (AB)† ≠ A†B† here
  q3AdjScale: yes(matEq(dagger(mscale(A, I)), mscale(dagger(A), c(0, -1)))), // 1: (cA)† = c*A†
  q3NonHerm: sandwich(NONHERM, N).re, // 0.3062 (real part; the imaginary part is equal)
  q3NonHermIsHerm: yes(isHermitian(NONHERM)), // 0
  q3MAvg: expectation(SZ, vec(Math.sqrt(0.9), Math.sqrt(0.1))), // 0.4 (challenge q3-m-avg)

  /* q3-spectral */
  q3MPolyB: charPoly2(M)[1].re, // 2
  q3MPolyC: charPoly2(M)[2].re, // −8
  q3MValLow: eigM.values[0], // −4
  q3MValHigh: eigM.values[1], // 2
  q3MGaugeA0: gaugeM.a0, // −1
  q3MGaugeLen: Math.hypot(...gaugeM.a), // 3
  q3JEig: yes(close(jEig[0].re, 0) && close(jEig[1].re, 0) && close(Math.abs(jEig[0].im), 1) && close(Math.abs(jEig[1].im), 1)), // 1: ±i
  q3MOrth: abs(inner(eigM.vectors[0], eigM.vectors[1])), // 0
  q3F: funcHermitian(SZ, (a) => a * a)[0][0].re, // 0.25
  q3DiagUAUdIsDiag: yes(isDiagonal(matmul(matmul(U_ZY, SIGMA_Y), dagger(U_ZY)))), // 1: ÛÂÛ† is diagonal
  q3DiagUdAUIsDiag: yes(isDiagonal(matmul(matmul(dagger(U_ZY), SIGMA_Y), U_ZY))), // 0: Û†ÂÛ is not, with p.9's Û
  q3Moment1: moment(N, SZ, 1).re, // 0.25
  q3Moment2: moment(N, SZ, 2).re, // 0.25
  q3VarSz: varianceN(N, SZ), // 0.1875
  q3SpreadZ: Math.sqrt(varianceN(N, SZ)), // 0.4330
  q3VarXY: varianceN(N, SX), // 0.15625 (= varianceN(N, SY))
  q3SpreadXY: Math.sqrt(varianceN(N, SX)), // 0.3953
  q3EigZeroAvg: expectation(spinAlong(NVEC), N), // 0.5
  q3EigZeroVar: varianceN(N, spinAlong(NVEC)), // 0
  q3EEig: eigM.values[1], // 2 (challenge q3-e-eig)

  /* q3-uncertainty */
  q3CommXY: yes(matEq(commutator(SX, SY), mscale(SZ, I))), // 1
  q3AntiXY: yes(matEq(anticommutator(SX, SY), mscale(I2, 0))), // 1
  q3AntiXX: yes(matEq(anticommutator(SX, SX), mscale(I2, 0.5))), // 1
  q3S2Val: S2[0][0].re, // 0.75
  q3S2Check: yes(matEq(S2, mscale(I2, 0.75))), // 1
  q3S2Comm: yes(matEq(commutator(S2, SZ), mscale(I2, 0))), // 1
  q3Jacobi: yes(
    matEq(madd(madd(commutator(SX, commutator(SY, SZ)), commutator(SY, commutator(SZ, SX))), commutator(SZ, commutator(SX, SY))), mscale(I2, 0)),
  ), // 1
  q3CompatPx: yes(matEq(commutator(SX, PX), mscale(I2, 0))), // 1
  q3CompatPxDiag: yes(matEq(matmul(matmul(U_ZX, PX), dagger(U_ZX)), mat([[1, 0], [0, 0]]))), // 1
  q3SchwarzLHS: abs2(inner(SCHWARZ_A, SCHWARZ_B)), // 5
  q3SchwarzRHS: norm2(SCHWARZ_A) * norm2(SCHWARZ_B), // 10
  q3SchwarzLambdaRe: Math.abs(lambdaBest.re), // 0.4
  q3SchwarzLambdaIm: Math.abs(lambdaBest.im), // 0.2
  q3SchwarzBestNorm: norm2(SCHWARZ_A) - abs2(inner(SCHWARZ_A, SCHWARZ_B)) / norm2(SCHWARZ_B), // 1
  q3UComm: sandwich(commutator(SX, SY), KET['+z']).im, // 0.5 (challenge q3-u-comm)
  q3RobProduct: robN.product, // 0.15625
  q3RobBound: robN.bound, // 0.125
  q3RobProdSq: robN.product ** 2, // 0.024414
  q3RobBoundSq: robN.bound ** 2, // 0.015625
  q3CommExpIm: sandwich(commutator(SX, SY), N).im, // 0.25
  q3Cov2: covXY ** 2, // 0.008789
  q3RobZProduct: robZ.product, // 0.25
  q3RobZSq: robZ.product ** 2, // 0.0625
  q3RobXVarY: varianceN(KET['+x'], SY), // 0.25
  q3RobXProduct: robX.product, // 0
  q3RobXBound: robX.bound, // 0
  q3EnsXPlus: benchTheory({ source: '+z', axes: ['x'], keep: [] }).plus, // 0.5
  q3EnsZPlus: benchTheory({ source: '+z', axes: ['z'], keep: [] }).plus, // 1
  q3SatNx0: yes(close(robertsonBound(ketFromBloch(Math.PI / 3, Math.PI / 2), SX, SY).slack, 0, 1e-6)), // 1: φ = 90° ⇒ n_x = 0
  q3SatNy0: yes(close(robertsonBound(ketFromBloch(Math.PI / 3, 0), SX, SY).slack, 0, 1e-6)), // 1: φ = 0° ⇒ n_y = 0

  /* small constants displayed as formula coefficients (D5's Schwarz-to-Robertson split), plus two derived squares */
  q3Half: 0.5 * yes(halfSplitHolds),
  q3Quarter: 0.25 * yes(halfSplitHolds),
  q3PzInXHalf: abs(inner(KET['+x'], KET['+z'])) ** 2,
  q3AvgSzSq: expectation(SZ, N) ** 2,
} as const

export type ValueKey = keyof typeof V
export const claim = keyedClaim<ValueKey>()
export { claimKey, close, d, pct, tf, uf }
