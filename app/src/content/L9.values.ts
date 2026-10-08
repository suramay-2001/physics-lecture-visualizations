/**
 * Lecture 9 numbers, computed once with the engine (owner: P). Same contract as L1–L7.values.ts: every number a learner reads in
 * L9 comes from `V` and is backed by a keyed claim; the numpy twin of each key is in physics/__fixtures__/claims.json
 * (pipeline/make_claim_fixtures.py, "L9" block). Keys start with `l9`.
 *
 * Two spins: |u⟩ = |+z⟩ is qubit value 0 and Alice is the FIRST letter, so |ud⟩ = ket('01') (physics/qc/state.ts). A displayed
 * magnitude of a negative number gets its own key (the number reader sees digits, not signs). Yes/no facts are 1 or 0. "At every
 * ..." sweeps store the worst sample (`worst`), so the value equals its target only if every sample does. The seeded
 * random-state counts use physics/random.ts `rng(709)`; the numpy twin draws its own states, so only the count (0) and the
 * bound (1 = never above ½) are compared, never a seed-dependent number.
 *
 * This file imports physics/qc but no stage module: a lecture chunk may use the shared engine and must not pull in stage/svg.
 */
import { abs, abs2, c } from '../physics/complex'
import type { Vec } from '../physics/linalg'
import { inner, norm2 } from '../physics/linalg'
import { rng } from '../physics/random'
import { correlatorC, classicalPair, covariancePM, marginals, mean } from '../physics/qc/info'
import { marginal } from '../physics/qc/measure'
import { bell, isProduct, ket, kron, namedPair, pairDet, paramCount, randomState, udFamily } from '../physics/qc/state'
import { KET, ketFromBloch, samePhysicalState } from '../physics/spin'
import { keyedClaim } from './claimKit'

const DEG = Math.PI / 180
const yes = (b: boolean) => (b ? 1 : 0)
/** The sample farthest from `target`: equal to the target only if EVERY sample is (a minimum would only prove "at least"). */
const worst = (xs: number[], target: number) => xs.reduce((w, x) => (Math.abs(x - target) > Math.abs(w - target) ? x : w), target)

/** n equal amplitudes 1/√n: a state of an n-state system that favours no label (a coin has 2, a die 6). */
const uniformVec = (n: number): Vec => Array.from({ length: n }, () => c(1 / Math.sqrt(n)))

/* l9-tensor */
const coinDie = kron(uniformVec(2), uniformVec(6))
const coinDieThree = kron(uniformVec(3), uniformVec(6))
const spinPair = kron(uniformVec(2), uniformVec(2))

/* l9-classical */
const dealer = classicalPair('dealer')
const dealerMarg = marginals(dealer)
const biased = classicalPair({ pA: 0.7, pB: 0.4 })
const biasedMarg = marginals(biased)
const fair = classicalPair({ pA: 0.5, pB: 0.5 })
const PM = [1, -1] as const

/* l9-two-spins */
const uniform = namedPair('uniform')

/* l9-product: Alice at θ = 60° (φ = 0), Bob along +x */
const alice60 = ketFromBloch(60 * DEG, 0)
const bobX = KET['+x']
const prod60x = kron(alice60, bobX)
const bobPu = [0, 60, 120, 180].map((th) => marginal(kron(ketFromBloch(th * DEG, 0), bobX), [1])[0])

/* l9-counting */
const fam30 = udFamily(30 * DEG)

/* l9-singlet */
const sing = bell('01-10')
const flip = namedPair('flip')

/* Go deeper: 20 000 seeded Haar-random pair states */
const RANDOM_N = 20000
const R = rng(709)
let randomProducts = 0
let detMax = 0
for (let k = 0; k < RANDOM_N; k++) {
  const psi = randomState(2, R)
  if (isProduct(psi, [0])) randomProducts += 1
  detMax = Math.max(detMax, abs(pairDet(psi)))
}

export const V = {
  /* l9-tensor */
  l9DimCoinDie: coinDie.length, // 12: photon ⊗ die, 2 · 6
  l9DimThreeDie: coinDieThree.length, // 18: a three-state system with the die
  l9Twelfth: abs2(coinDie[0]), // 1/12: the chance of each label of the equal state
  /* l9-classical */
  l9CharlieP: dealer[0][1], // 1/2: P(+1, −1)
  l9CoinMeanA: mean(PM, dealerMarg.px), // 0
  l9CoinMeanB: mean(PM, dealerMarg.py), // 0
  l9CoinAB: correlatorC(dealer), // −1
  l9CoinCorr: covariancePM(dealer), // −1
  l9BiasedPA: biasedMarg.px[0], // 0.7
  l9BiasedPB: biasedMarg.py[0], // 0.4
  l9BiasedA: mean(PM, biasedMarg.px), // 0.4
  l9BiasedB: mean(PM, biasedMarg.py), // −0.2
  l9BiasedBSize: Math.abs(mean(PM, biasedMarg.py)), // 0.2: the size of ⟨b⟩ (the reader sees digits, not signs)
  l9BiasedAB: correlatorC(biased), // −0.08
  l9BiasedABSize: Math.abs(correlatorC(biased)), // 0.08
  l9BiasedCorr: covariancePM(biased), // 0
  l9IndepChance: fair[0][0], // 1/4
  l9IndepAB: correlatorC(fair), // 0
  /* l9-two-spins */
  l9DimSpins: spinPair.length, // 4
  l9UdUd: inner(ket('01'), ket('01')).re, // 1
  l9UdDu: inner(ket('01'), ket('10')).re, // 0
  l9UniAmp: uniform[0].re, // 1/2
  l9UniNorm: norm2(uniform), // 1
  /* l9-product */
  l9AlphaU: alice60[0].re, // 0.8660
  l9AlphaD: alice60[1].re, // 0.5
  l9BetaU: bobX[0].re, // 0.7071
  l9BetaD: bobX[1].re, // 0.7071
  l9ProdUU: prod60x[0].re, // 0.6124
  l9ProdUD: prod60x[1].re, // 0.6124
  l9ProdDU: prod60x[2].re, // 0.3536
  l9ProdDD: prod60x[3].re, // 0.3536
  l9ProdChanceTop: abs2(prod60x[0]), // 0.375
  l9ProdChanceBottom: abs2(prod60x[2]), // 0.125
  l9ProdNorm: norm2(prod60x), // 1
  l9ProdIsProduct: yes(isProduct(prod60x, [0])), // 1
  l9BobPu: worst(bobPu, 0.5), // 0.5 at θ_A = 0°, 60°, 120°, 180°
  /* l9-counting */
  l9Fam30Norm: norm2(fam30), // 1
  l9Fam30Ud: fam30[1].re, // 0.8660: ψ_ud
  l9Fam30Du: -fam30[2].re, // 0.5: the size of ψ_du (the amplitude is −0.5)
  l9ParamsOne: paramCount(1).general, // 2
  l9ParamsGeneral: paramCount(2).general, // 6
  l9ParamsProduct: paramCount(2).product, // 4
  l9RandomProducts: randomProducts, // 0 of 20 000 (the numpy twin counts its own 20 000)
  /* l9-singlet */
  l9SingUd: sing[1].re, // 0.7071
  l9SingDu: -sing[2].re, // 0.7071: the size of ψ_du (the amplitude is −0.7071)
  l9SingNorm: norm2(sing), // 1
  l9SingIsProduct: yes(isProduct(sing, [0])), // 0
  l9ExitPlusPlus: yes(samePhysicalState(uniform, kron(KET['+x'], KET['+x']))), // 1
  l9ExitProduct: yes(isProduct(uniform, [0])), // 1
  l9FlipProduct: yes(isProduct(flip, [0])), // 0
  l9Det15: pairDet(udFamily(15 * DEG)).re, // 0.25
  l9Det30: pairDet(udFamily(30 * DEG)).re, // 0.4330
  l9SingDet: pairDet(sing).re, // 0.5
  l9ProdDet: abs(pairDet(prod60x)), // 0
  l9DetMax: yes(detMax <= 0.5 + 1e-12), // 1: no one of 20 000 random states beats the singlet's 1/2
} as const

export type ValueKey = keyof typeof V

/** A claim tied to one L9 engine value: its text starts with `key · ` (read by content/claims.test.ts). */
export const claim = keyedClaim<ValueKey>()

export { close, d, pct, tf, uf } from './claimKit'
