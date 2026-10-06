/**
 * Chapter F5 numbers ("Probability, expectation and variance"; plan: docs/roles/proposals/P-F5-story.md §1/§2/§4;
 * rulings docs/roles/decisions/qc709-foundations.md, qc709-foundations-rulings.md). Every number a learner reads in
 * F5 comes from `V` and is backed by a keyed claim; the numpy twin of each key, computed by an independent route, is
 * in physics/__fixtures__/claims-qc709/f5.json (pipeline/claims_qc709/f5.py). Keys start with `f5`, unique across
 * both courses (content/values.ts refuses a duplicate).
 *
 * No new engine function is needed (rulings doc): every number comes from physics/qc/info.ts (`mean`, `variance`,
 * `binomialMoments`, `shannon`, `binaryEntropy`) and physics/spin.ts (`KET`, `ketFromBloch`, `prob`: the Born-rule
 * overlap |⟨a|ψ⟩|², the F2 inner-product route — not the operator/expectation route Q3 uses for the same numbers,
 * per F5-E4 of the plan's errata table).
 */
import { abs2 } from '../../physics/complex'
import { matmul, mscale, trace2 } from '../../physics/linalg'
import { densityOf } from '../../physics/qc/density'
import { binaryEntropy, binomialMoments, mean, shannon, variance } from '../../physics/qc/info'
import { ket } from '../../physics/qc/state'
import { KET, ketFromBloch, nDotSigma, prob } from '../../physics/spin'
import { keyedClaim } from '../claimKit'

export { close, d, pct, tf, uf } from '../claimKit'

const DEG = Math.PI / 180

// the running fair-die example, outcomes 1..6 at 1/6 each
const DIE_XS = [1, 2, 3, 4, 5, 6]
const DIE_PS = DIE_XS.map(() => 1 / 6)

// the Born-rule spin bridge: |+n⟩ at θ = 60°, φ = 45° (Eq. 1.4-style, shared with Q1/Q3's running example),
// read along z — P(+) = |⟨+z|ψ⟩|² (the F2 inner-product route, not Q3's operator route)
const psiN = ketFromBloch(60 * DEG, 45 * DEG)
const bornP = prob(KET['+z'], psiN)
// ⟨S_z⟩ and (ΔS_z)² again through the density matrix, Tr(ρ M) (Bergou Eqs. 5.9–5.10): S_z = σ_z/2 in units of ħ
const rhoN = densityOf(psiN)
const Sz = mscale(nDotSigma([0, 0, 1]), 0.5)
const trSz = trace2(matmul(rhoN, Sz)).re
// the 8-bar stand-in picture the die beats draw: |+++⟩'s eight chances
const EIGHT = ket('+++').map(abs2)

export const V = {
  /* f5-probability */
  f5DieP: DIE_PS[0], // 1/6: each die bar
  f5DieN: DIE_XS.length, // 6: the count of outcomes
  f5DieSum: DIE_PS.reduce((s, p) => s + p, 0), // 1: the six die chances add to 1
  f5CoinHalf: 0.5, // the long-run head fraction a fair coin settles near
  f5TwoCoin: 0.5 * 0.5, // 0.25: two fair coins, P(HH)
  f5TwoCoinSum: 4 * (0.5 * 0.5), // 1: the four two-coin outcomes sum to 1
  f5BornP: bornP, // 0.75: P(+) at θ = 60° (cos²(30°), via the inner-product route)
  f5BornSum: bornP + (1 - bornP), // 1
  f5EightBar: Math.min(...EIGHT), // 0.125: the stand-in picture's smallest bar (each of the eight is 1/8)
  f5EightBarMax: Math.max(...EIGHT), // 0.125: and its largest, so the eight bars are equal
  f5TwoSix: (1 / 6) * (1 / 6), // 1/36: two independent sixes
  f5SixOrFive: 1 / 6 + 1 / 6, // 1/3: the wrong (additive) answer, shown as the trap
  f5DieMean: mean(DIE_XS, DIE_PS), // 3.5
  f5LinMean: 2 * mean(DIE_XS, DIE_PS) + 1, // 8: ⟨2X+1⟩ by linearity
  f5SpinAvg: mean([0.5, -0.5], [bornP, 1 - bornP]), // 0.25: ⟨S_z⟩ in units of ħ, from Σ M_α P_α (not the operator)
  f5SpinTrace: trSz, // 0.25: ⟨S_z⟩ = Tr(ρ S_z), the density-matrix route to the same average
  f5GameNet: mean(DIE_XS, DIE_PS) - 3, // 0.5: the fair-game net average
  f5DieVar: variance(DIE_XS, DIE_PS), // 2.9167
  f5DieM2: mean(
    DIE_XS.map((x) => x * x),
    DIE_PS,
  ), // 15.1667: ⟨X²⟩
  f5DieSD: Math.sqrt(variance(DIE_XS, DIE_PS)), // 1.7078
  f5DieMeanSq: mean(DIE_XS, DIE_PS) ** 2, // 12.25: ⟨X⟩², the short-cut formula's other term
  f5BinMean: binomialMoments(100, 0.5).mean, // 50
  f5BinVar: binomialMoments(100, 0.5).variance, // 25
  f5BinSD: Math.sqrt(binomialMoments(100, 0.5).variance), // 5
  f5MeanSD100: Math.sqrt(variance(DIE_XS, DIE_PS)) / Math.sqrt(100), // 0.1708: the die's own σ/√100
  f5SpinVar: variance([0.5, -0.5], [bornP, 1 - bornP]), // 0.1875: (ΔS_z)² in units of ħ²
  f5SpinSD: Math.sqrt(variance([0.5, -0.5], [bornP, 1 - bornP])), // 0.4330
  f5SpinVarTrace: trace2(matmul(rhoN, matmul(Sz, Sz))).re - trSz ** 2, // 0.1875: Tr(ρ S_z²) − Tr(ρ S_z)²
  f5VarSure: variance([0, 1], [1, 0]), // 0: a sure outcome scatters not at all
  f5VarHalf: variance([0, 1], [0.5, 0.5]), // 0.25: the most-uncertain coin
  f5HCoin: shannon([0.5, 0.5]), // 1 bit
  f5HDie: shannon(DIE_PS), // 2.585 bits = log2(6)
  f5HEight: shannon(EIGHT), // 3 bits = log2(8): the stand-in picture's eight equal bars
  f5HSure: shannon([1, 0]), // 0 bits: a certain outcome carries no information
  f5hThreeQuarter: binaryEntropy(0.75), // 0.8113 bits
  f5hHalf: binaryEntropy(0.5), // 1 bit
  /* challenges (§4), new keys only — the rest reuse the story's own claims */
  f5DieEven: 3 / 6, // 0.5: P(even) on a fair die
  f5AtLeastOne: 1 - 0.5 ** 3, // 0.875: P(at least one head in 3 flips)
  f5BiasedMean: mean([1, 0], [0.6, 0.4]), // 0.6: a biased coin's expected pay
  f5SqrtN64: 2 / Math.sqrt(64), // 0.25: the spread of a mean of 64 readings each with σ = 2
} as const

export type F5Key = keyof typeof V
export const claim = keyedClaim<F5Key>()
