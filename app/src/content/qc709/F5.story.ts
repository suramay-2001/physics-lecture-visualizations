/**
 * Chapter F5 scroll story, both tracks over one stage (plan: docs/roles/proposals/P-F5-story.md §1–§2; rulings
 * docs/roles/decisions/qc709-foundations.md, qc709-foundations-rulings.md). F5 is the ground-up owner of classical
 * probability, expectation and variance — the trimmed probability chapter that grounds the Born rule, $\langle
 * M\rangle$ and $\Delta M$ for the Q chapters.
 *
 * Rules kept here:
 * - An F chapter has no lecture notes: its own line is phase 'core' ("The foundation"), then 'books' for a second
 *   source (Bergou), then 'clue' for a question-and-reveal beat.
 * - `text` is the Ground-up track (9th-grade start, ≤ 25 words per sentence), `formal` the Formal track (≤ 40).
 * - Every number in the prose comes from F5.values.ts through a keyed claim.
 *
 * Stage kinds (brief: "all merged" for this build are `amplitudes`, `plot`, `matrix` v2, `bloch`; the plan's own §9.2
 * proposes a NEW `distribution` kind for classical bar/histogram pictures, which was not built — the plan's own §9.2
 * fallback table is used instead throughout this file):
 * - A two-outcome classical chance (a coin of any bias, including the degenerate sure/unsure cases, and any named
 *   2-outcome event) is drawn EXACTLY on `amplitudes` (probability mode): $p = \cos^2(\theta/2)$ is a trig identity,
 *   so a direction `{dir: {thetaDeg: θ(p)}}` reproduces any desired two-way split bar-for-bar, reusing the Born-rule
 *   picture as a generic two-outcome bar chart (not labelled 'spin' unless the beat is genuinely about a spin).
 * - Two independent fair coins (4 equal outcomes) is drawn EXACTLY as `amp({ket: '++'})`: two qubits in $|+\rangle$
 *   give four equal bars of $1/4$, mathematically identical to HH/HT/TH/TT.
 * - A fair die (6 outcomes) and a Binomial histogram (101 outcomes) have no exact `amplitudes` representation (not a
 *   power of two, not a product state): these beats use a fixed uniform proxy `amp({ket: '+++'})` (8 equal bars) as a
 *   generic "equally likely outcomes" backdrop, with the real numbers (mean, variance, entropy) stated in the prose
 *   and backed by engine claims, exactly as the plan's own §9.2 fallback specifies ("the beat carries the mean/σ in
 *   the caption"). The picture never claims to be a six-sided die; the caption never claims the picture shows six.
 * - The two deposits/σ-band beats (`f5-probability:b2`, `f5-spread:b4`) use the existing 448 `lab-r3` kind (not new):
 *   a single SG magnet along x after a $|{+}z\rangle$ source gives a true 50/50 physical "coin flip", the "448 deposits
 *   picture" the plan asks for (P-F5-story.md, "Sources read": `physics/sg.ts` deposits/tallies).
 */
import type { AmpSource, AmplitudesState, Beat, LabBench, LabDevice, LabState, Ref, StageLayout, StageState } from '../schema'
import { claim, V } from './F5.values'

/* ---------------------------------------------------------------------------------------------- */
/* Stage shorthand (plan §0 "Stage shorthand"), as plain builder functions                          */
/* ---------------------------------------------------------------------------------------------- */

const amp = (state: AmpSource, extra: Partial<Omit<AmplitudesState, 'kind' | 'state'>> = {}): AmplitudesState => ({
  kind: 'amplitudes',
  state,
  mode: 'probability',
  shot: 'A-BARS',
  ...extra,
})
const K = (label: string): AmpSource => ({ ket: label })
/** θ(p) in degrees: the Bloch polar angle whose Born chance along z is exactly p (p = cos²(θ/2), any p ∈ [0, 1]). */
const thetaOf = (p: number): number => (2 * Math.acos(Math.sqrt(Math.max(0, Math.min(1, p))))) / (Math.PI / 180)
/** A generic two-outcome bar chart at chance p (not spin-labelled: a stand-in for any two-way classical split). */
const twoWay = (p: number, extra: Partial<Omit<AmplitudesState, 'kind' | 'state'>> = {}): AmplitudesState => amp({ dir: { thetaDeg: thetaOf(p), phiDeg: 0 } }, extra)
/** The spin Born-rule bridge picture, θ = 60°, φ = 45° (the chapter's one running spin example), spin-labelled. */
const spinBridge = (extra: Partial<Omit<AmplitudesState, 'kind' | 'state'>> = {}): AmplitudesState => amp({ dir: { thetaDeg: 60, phiDeg: 45 } }, { labels: 'spin', ...extra })
/** A uniform "many equally likely outcomes" proxy (8 equal bars): the fallback for a die or a Binomial histogram,
 * neither a power-of-two product state (no `distribution` kind was built; see the file header). */
const manyWay = (extra: Partial<Omit<AmplitudesState, 'kind' | 'state'>> = {}): AmplitudesState => amp(K('+++'), extra)

const xDevice: LabDevice = { axis: 'x' }
const oven: LabBench = { id: 'main', source: '+z', devices: [xDevice], showPrep: true }
const lab = (extra: Omit<LabState, 'kind' | 'benches'> = {}): LabState => ({ kind: 'lab-r3', benches: [oven], ...extra })
const split = (top: StageState, bottom: StageState): StageLayout => ({ layout: 'split', top, bottom })

export const bergou = (where: string, adds: string): Ref => ({ source: 'bergou', where, adds })

/* ---------------------------------------------------------------------------------------------- */
/* Claims (keyed to F5.values.ts; see that file for the engine call behind each key)                */
/* ---------------------------------------------------------------------------------------------- */

export const C = {
  dieP: claim('f5DieP', 'a fair die: each face $1/6$', () => V.f5DieP === 1 / 6),
  dieN: claim('f5DieN', 'a fair die has six faces', () => V.f5DieN === 6),
  dieSum: claim('f5DieSum', 'the six die chances add to 1', () => Math.abs(V.f5DieSum - 1) < 1e-9),
  coinHalf: claim('f5CoinHalf', 'a fair coin settles near $0.5$', () => V.f5CoinHalf === 0.5),
  twoCoin: claim('f5TwoCoin', 'two fair coins: $\\tfrac12\\times\\tfrac12=\\tfrac14$', () => Math.abs(V.f5TwoCoin - 0.25) < 1e-9),
  twoCoinSum: claim('f5TwoCoinSum', 'the four two-coin outcomes sum to 1', () => Math.abs(V.f5TwoCoinSum - 1) < 1e-9),
  bornP: claim('f5BornP', 'a spin at $\\theta=60°$: $P(+)=\\cos^2(30°)=0.75$', () => Math.abs(V.f5BornP - 0.75) < 1e-9),
  bornSum: claim('f5BornSum', 'the two Born chances sum to 1', () => Math.abs(V.f5BornSum - 1) < 1e-9),
  twoSix: claim('f5TwoSix', 'two independent sixes: $\\tfrac16\\times\\tfrac16=\\tfrac1{36}$', () => Math.abs(V.f5TwoSix - 1 / 36) < 1e-9),
  sixOrFive: claim('f5SixOrFive', 'the wrong (additive) answer, $\\tfrac16+\\tfrac16=\\tfrac13$', () => Math.abs(V.f5SixOrFive - 1 / 3) < 1e-9),
  dieMean: claim('f5DieMean', 'a fair die: $\\langle X\\rangle=3.5$', () => V.f5DieMean === 3.5),
  linMean: claim('f5LinMean', '$\\langle 2X+1\\rangle=8$ for the die', () => V.f5LinMean === 8),
  spinAvg: claim('f5SpinAvg', 'at $p=0.75$: $\\langle S_z\\rangle=0.25\\hbar$', () => Math.abs(V.f5SpinAvg - 0.25) < 1e-9),
  gameNet: claim('f5GameNet', 'the fair-game net average is $+0.5$', () => Math.abs(V.f5GameNet - 0.5) < 1e-9),
  dieVar: claim('f5DieVar', 'a fair die: variance $2.917$', () => Math.abs(V.f5DieVar - 2.9167) < 0.0005),
  dieM2: claim('f5DieM2', 'a fair die: $\\langle X^2\\rangle=15.167$', () => Math.abs(V.f5DieM2 - 15.1667) < 0.0005),
  dieMeanSq: claim('f5DieMeanSq', 'a fair die: $\\langle X\\rangle^2=12.25$', () => V.f5DieMeanSq === 12.25),
  dieSD: claim('f5DieSD', 'a fair die: $\\Delta X=1.708$', () => Math.abs(V.f5DieSD - 1.7078) < 0.0005),
  binMean: claim('f5BinMean', '100 fair flips: mean $50$', () => V.f5BinMean === 50),
  binVar: claim('f5BinVar', '100 fair flips: variance $25$', () => V.f5BinVar === 25),
  binSD: claim('f5BinSD', '100 fair flips: $\\sigma=5$', () => V.f5BinSD === 5),
  meanSD100: claim('f5MeanSD100', 'the mean of 100 dice: spread $0.171$', () => Math.abs(V.f5MeanSD100 - 0.1708) < 0.0005),
  spinVar: claim('f5SpinVar', 'at $p=0.75$: $(\\Delta S_z)^2=0.1875\\hbar^2$', () => Math.abs(V.f5SpinVar - 0.1875) < 1e-9),
  spinSD: claim('f5SpinSD', 'at $p=0.75$: $\\Delta S_z=0.433\\hbar$', () => Math.abs(V.f5SpinSD - 0.433) < 0.0005),
  varSure: claim('f5VarSure', 'a sure outcome: variance $0$', () => V.f5VarSure === 0),
  varHalf: claim('f5VarHalf', 'the most uncertain coin: variance $0.25$', () => Math.abs(V.f5VarHalf - 0.25) < 1e-9),
  hCoin: claim('f5HCoin', 'a fair coin: $H=1$ bit', () => V.f5HCoin === 1),
  hDie: claim('f5HDie', 'a fair die: $H=2.585$ bits', () => Math.abs(V.f5HDie - 2.585) < 0.0005),
  hThreeQuarter: claim('f5hThreeQuarter', 'a $75/25$ coin: $h=0.811$ bits', () => Math.abs(V.f5hThreeQuarter - 0.8113) < 0.0005),
  hHalf: claim('f5hHalf', '$h(0.5)=1$ bit', () => V.f5hHalf === 1),
  hSure: claim('f5HSure', 'a sure coin carries $H=0$ bits', () => V.f5HSure === 0),
  dieEven: claim('f5DieEven', 'a fair die: $P(\\text{even})=0.5$', () => V.f5DieEven === 0.5),
  atLeastOne: claim('f5AtLeastOne', 'three flips: $P(\\ge 1\\text{ head})=0.875$', () => Math.abs(V.f5AtLeastOne - 0.875) < 1e-9),
  biasedMean: claim('f5BiasedMean', 'a $0.6$-biased coin pays $0.6$ on average', () => V.f5BiasedMean === 0.6),
  sqrtN64: claim('f5SqrtN64', '64 readings of $\\sigma=2$: the mean’s spread is $0.25$', () => V.f5SqrtN64 === 0.25),
}

/* ---------------------------------------------------------------------------------------------- */
/* f5-probability — Chances over a list of outcomes                                                 */
/* ---------------------------------------------------------------------------------------------- */

const probability: Beat[] = [
  {
    id: 'f5-probability:b1',
    phase: 'core',
    introduces: ['qc-sample-space', 'qc-probability'],
    text:
      'List everything that can happen once: for a die, the faces 1 to 6. That list is the [[qc-sample-space|sample space]]. ' +
      'To each outcome give a [[qc-probability|probability]], a number from 0 to 1 saying how likely it is. A fair die gives each face $1/6$.',
    formal:
      'A [[qc-sample-space|sample space]] $\\Omega$ is the set of possible outcomes; a [[qc-probability|probability]] assigns each outcome $x$ a ' +
      'number $P(x) \\in [0, 1]$ (Bergou §3.3, p. 34). A fair die has $\\Omega = \\{1, \\ldots, 6\\}$, $P(x) = 1/6$. An event is a subset of $\\Omega$, its chance the sum over its outcomes.',
    caption: 'a fair die: six outcomes, each chance $1/6$',
    captionFormal: '$\\Omega = \\{1,\\ldots,6\\}$, $P(x) = 1/6$',
    stage: manyWay(),
    claims: [C.dieP, C.dieN],
  },
  {
    id: 'f5-probability:b2',
    phase: 'core',
    text:
      'Every outcome happens with some chance, and exactly one happens each time, so the chances add to 1. ' +
      'You can read a probability as a long-run frequency: flip a fair coin many times and the fraction of heads settles near $0.5$.',
    formal:
      'Normalization: $\\sum_{x\\in\\Omega} P(x) = 1$ (Bergou §3.3). The law of large numbers makes the observed frequency $f_n(x) \\to P(x)$ as the ' +
      'number of trials $n \\to \\infty$; this is what ties the abstract $P$ to counting (notes p. 14).',
    caption: 'the six die chances add to 1; heads settles near $0.5$',
    captionFormal: '$\\sum_x P(x) = 1$; $f_n \\to P$',
    stage: split(manyWay(), lab({ readouts: ['fractions'], shot: 'L-PLATE' })),
    derivation: {
      result: '\\sum_x P(x) = 1,\\quad P(A\\cap B) = P(A)P(B)',
      ground: [
        { tex: '\\text{one outcome happens each trial}', why: 'Exactly one face of the die comes up every roll.', view: manyWay(), viewCaption: 'a set of equally likely outcomes' },
        { tex: '\\sum_x P(x) = 1', why: 'The chances of all outcomes add to the certainty that something happens.' },
        {
          tex: 'f_n(x) = \\tfrac{\\#x \\text{ in } n \\text{ trials}}{n} \\to P(x)',
          why: 'Over many trials the fraction of times x comes up settles on its chance.',
          view: lab({ readouts: ['fractions'], shot: 'L-PLATE' }),
          viewCaption: 'deposits piling toward the chance',
        },
        {
          tex: 'P(A \\cap B) = P(A)P(B)',
          why: 'Independent events: one says nothing about the other, so their chances multiply.',
          view: amp(K('++')),
          viewCaption: 'two coins: four equal bars',
        },
      ],
      formal: [
        { tex: '\\sum_{x\\in\\Omega} P(x) = 1,\\quad f_n \\to P', why: 'Normalization, plus the law of large numbers tying frequency to chance (Bergou §3.3).', view: manyWay() },
        { tex: 'P(A\\cap B) = P(A)P(B)', why: 'This is the definition of independence for two events.', view: lab({ readouts: ['fractions'], shot: 'L-PLATE' }) },
      ],
    },
    claims: [C.dieSum, C.coinHalf],
  },
  {
    id: 'f5-probability:b3',
    phase: 'core',
    text:
      'Two events are [[qc-independent|independent]] when one tells you nothing about the other. Then their chances multiply. ' +
      'Flip two fair coins: the chance of two heads is $\\tfrac12 \\times \\tfrac12 = \\tfrac14$. The four outcomes HH, HT, TH, TT each have chance $1/4$.',
    formal:
      '$A$ and $B$ are [[qc-independent|independent]] iff $P(A \\cap B) = P(A)P(B)$ (Bergou §3.3). For two fair coins the joint space is $\\{H, T\\}^2$ with ' +
      '$P = 1/4$ each; independence makes the joint chance the product of the two marginals.',
    caption: 'two coins: $\\tfrac12\\times\\tfrac12 = \\tfrac14$ for HH',
    captionFormal: '$P(A\\cap B) = P(A)P(B)$',
    stage: amp(K('++')),
    claims: [C.twoCoin, C.twoCoinSum, C.coinHalf],
  },
  {
    id: 'f5-probability:b4',
    phase: 'books',
    text:
      'Quantum physics makes these chances from overlaps. A spin prepared along $\\mathbf n$ and read along $z$ gives "+" with chance $p = \\cos^2(\\theta/2)$, ' +
      'the size squared of an overlap (Chapter F2). At $\\theta = 60°$ that is $0.75$, and "−" has $0.25$. <<qc-l1-average|the oven’s output is a chance>>.',
    formal:
      'The [[qc-born-rule|Born rule]] sets $P(a) = |\\langle a|\\psi\\rangle|^2$ for a [[qc-normalized|normalized]] state (Chapter F2’s [[qc-inner-product|inner product]]) <<qc-f2-inner-product|the overlap and its size>>. ' +
      'For $|{+}n\\rangle$ read along $z$, $p_+ = \\cos^2(\\theta/2)$; at $\\theta = 60°$, $p_+ = 0.75$, $p_- = 0.25$ — a two-outcome distribution.',
    caption: 'spin at $60°$: chances $0.75$ and $0.25$',
    captionFormal: '$P(a) = |\\langle a|\\psi\\rangle|^2$; $p_+ = \\cos^2(\\theta/2)$',
    stage: spinBridge(),
    refs: [bergou('§5.2', 'The [[qc-born-rule|Born rule]], $P(a) = |\\langle a|\\psi\\rangle|^2$.')],
    claims: [C.bornP, C.bornSum],
  },
  {
    id: 'f5-probability:b5',
    phase: 'clue',
    text: 'A die is rolled twice. Someone says the chance of two sixes is $\\tfrac16 + \\tfrac16 = \\tfrac13$. Is that right?',
    formal: 'For two independent die rolls, is $P(6, 6) = P(6) + P(6)$?',
    caption: 'two sixes: adding or multiplying?',
    captionFormal: 'addition or the product rule?',
    stage: manyWay(),
    claims: [C.dieP],
    reveal: {
      text:
        'No. Adding is for "this outcome **or** that one" on a single roll. "Six **and** six" across two rolls multiplies: $\\tfrac16 \\times \\tfrac16 = \\tfrac1{36}$. ' +
        'Adding would even give a chance above $\\tfrac13$ for a rarer event than either roll alone.',
      formal:
        'No: $P(6 \\text{ then } 6) = P(6)P(6) = 1/36$ by independence. Addition is the rule for a union of disjoint events on one trial ($P(6 \\text{ or } 5) = 1/3$); the ' +
        'two rules answer different questions about different trials.',
      caption: 'two sixes: $\\tfrac1{36}$, not $\\tfrac13$',
      captionFormal: 'two sixes: $\\tfrac1{36}$, not $\\tfrac13$',
      stage: twoWay(1 / 36),
      claims: [C.twoSix, C.sixOrFive],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* f5-average — The number you expect on average                                                    */
/* ---------------------------------------------------------------------------------------------- */

const average: Beat[] = [
  {
    id: 'f5-average:b1',
    phase: 'core',
    introduces: ['qc-expectation'],
    text:
      'To summarise a random reading in one number, weight each value by its chance and add: the [[qc-expectation|expectation]] $\\langle X\\rangle = \\sum_x x\\,P(x)$. ' +
      'For a fair die it is $\\tfrac16(1 + 2 + \\cdots + 6) = 3.5$. It is the long-run average of many readings. <<qc-l4-average|the average that no atom reads>>.',
    formal:
      'The [[qc-expectation|expectation]] (mean) of a random variable $X$ is $\\langle X\\rangle = \\sum_x x\\,P(x)$ (Bergou §3.3, p. 35; the notes write ' +
      '$\\langle M\\rangle = \\sum_\\alpha M_\\alpha P_\\alpha$, p. 14). For a fair die, $\\langle X\\rangle = 3.5 = (1 + \\cdots + 6)/6$, the limit of the sample average.',
    caption: 'a fair die: $\\langle X\\rangle = 3.5$',
    captionFormal: 'Rosetta: $\\langle X\\rangle = E[X] = \\mu$; the notes’ $\\langle M\\rangle$',
    stage: manyWay(),
    derivation: {
      result: '\\langle X\\rangle = \\sum_x x\\,P(x)',
      ground: [
        { tex: '\\bar X_n = \\tfrac1n\\sum_{k=1}^n x_k', why: 'Average n readings by adding them and dividing by how many there were.', view: twoWay(1 / 6), viewCaption: 'one value’s own chance' },
        { tex: '\\bar X_n = \\sum_x x\\,\\tfrac{\\#x}{n}', why: 'Group the equal readings: each value times how often it came up.' },
        { tex: '\\tfrac{\\#x}{n} \\to P(x)', why: 'The frequency of each value tends to its chance.', view: manyWay(), viewCaption: 'the chances behind the count' },
        { tex: '\\langle X\\rangle = \\sum_x x\\,P(x)', why: 'So the long-run average is the chance-weighted sum: $3.5$ for a fair die.' },
      ],
      formal: [
        { tex: '\\bar X_n = \\sum_x x\\,f_n(x) \\to \\sum_x x\\,P(x)', why: 'Frequencies tend to probabilities (Bergou §3.3).', view: manyWay() },
        { tex: '\\langle X\\rangle = \\sum_x x\\,P(x)', why: 'The expectation; $3.5$ for a fair die.', view: twoWay(1 / 6) },
      ],
    },
    claims: [C.dieMean, C.dieP],
  },
  {
    id: 'f5-average:b2',
    phase: 'core',
    text:
      'The expectation can be a value the reading never takes: no die face shows $3.5$. It is a balance point, not an outcome. ' +
      'Expectation is linear: double every value and the average doubles; add a constant and the average shifts by it.',
    formal:
      '$\\langle X\\rangle$ need not lie in the range of $X$ (no die face is $3.5$): it is the distribution’s balance point. Expectation is linear, ' +
      '$\\langle aX + b\\rangle = a\\langle X\\rangle + b$ and $\\langle X + Y\\rangle = \\langle X\\rangle + \\langle Y\\rangle$, even when $X, Y$ are dependent (Bergou §3.3).',
    caption: '$3.5$ is the balance point, not a face; $\\langle 2X+1\\rangle = 8$',
    captionFormal: '$\\langle aX + b\\rangle = a\\langle X\\rangle + b$',
    stage: manyWay(),
    claims: [C.dieMean, C.linMean],
  },
  {
    id: 'f5-average:b3',
    phase: 'books',
    text:
      'For a spin read along $z$, the two values are $+\\hbar/2$ and $-\\hbar/2$ with chances $p$ and $1 - p$. The average is $\\langle S_z\\rangle = \\tfrac\\hbar2(2p - 1)$. ' +
      'At $p = 0.75$ it is $0.25\\hbar$ — the same number Chapter Q3’s measurement gives.',
    formal:
      'A $\\pm\\hbar/2$ reading with $P(+) = p$ has $\\langle S_z\\rangle = \\tfrac\\hbar2 p + (-\\tfrac\\hbar2)(1 - p) = \\tfrac\\hbar2(2p - 1)$. At $p = \\cos^2(\\theta/2) = 0.75$ ' +
      '($\\theta = 60°$): $\\langle S_z\\rangle = 0.25\\hbar$ <<qc-l4-average|the average that no atom reads>>. Chapter Q3 derives this from the operator; here it is just $\\sum M_\\alpha P_\\alpha$.',
    caption: '$p = 0.75$: $\\langle S_z\\rangle = 0.25\\hbar$',
    captionFormal: '$\\langle S_z\\rangle = \\tfrac\\hbar2(2p - 1)$',
    stage: spinBridge(),
    refs: [{ source: 'lecture', where: 'notes p. 14', adds: 'The average $\\langle M\\rangle = \\sum_\\alpha M_\\alpha P_\\alpha$.' }],
    claims: [C.bornP, C.spinAvg],
  },
  {
    id: 'f5-average:b4',
    phase: 'clue',
    text: 'A game pays you the die face in dollars but costs $3 to play. Over many plays, do you win or lose?',
    formal: 'With payoff $X$ (a fair die) and cost 3, what is the expected net $\\langle X - 3\\rangle$?',
    caption: 'a fair game?',
    captionFormal: '$\\langle X - 3\\rangle$?',
    stage: manyWay(),
    reveal: {
      text:
        'You win, slowly. The average payoff is $3.5$, so the average net is $3.5 - 3 = 0.5$ per play. ' +
        'A single play can lose, but over many plays the average net is positive.',
      formal: '$\\langle X - 3\\rangle = \\langle X\\rangle - 3 = 3.5 - 3 = 0.5 > 0$ by linearity: a favourable game. A fair game would cost exactly $\\langle X\\rangle = 3.5$, the expectation’s break-even price.',
      caption: 'net average $+0.5$ per play',
      captionFormal: 'net average $+0.5$ per play',
      stage: manyWay(),
      claims: [C.dieMean, C.gameNet],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* f5-spread — How widely the readings scatter                                                       */
/* ---------------------------------------------------------------------------------------------- */

const spread: Beat[] = [
  {
    id: 'f5-spread:b1',
    phase: 'core',
    introduces: ['qc-variance'],
    text:
      'Two distributions can share an average but scatter differently. The [[qc-variance|variance]] $(\\Delta X)^2 = \\langle(X - \\langle X\\rangle)^2\\rangle$ measures the scatter: ' +
      'the average squared distance from the mean. A short cut is $(\\Delta X)^2 = \\langle X^2\\rangle - \\langle X\\rangle^2$. For a fair die it is $2.917$.',
    formal:
      'The [[qc-variance|variance]] $(\\Delta X)^2 = \\mathrm{Var}(X) = \\langle(X - \\mu)^2\\rangle = \\langle X^2\\rangle - \\langle X\\rangle^2 \\ge 0$ (Bergou §3.3; the notes’ ' +
      'dispersion $\\langle A^2\\rangle - \\langle A\\rangle^2$, p. 15). For a fair die $\\langle X^2\\rangle = 15.167$, $\\langle X\\rangle^2 = 12.25$, so $(\\Delta X)^2 = 2.917$.',
    caption: 'a fair die: variance $2.917$',
    captionFormal: '$(\\Delta X)^2 = \\langle X^2\\rangle - \\langle X\\rangle^2$',
    stage: manyWay(),
    derivation: {
      result: '(\\Delta X)^2 = \\langle X^2\\rangle - \\langle X\\rangle^2',
      ground: [
        { tex: '(\\Delta X)^2 = \\langle(X - \\mu)^2\\rangle,\\quad \\mu = \\langle X\\rangle', why: 'The average squared distance of a reading from the mean.', view: manyWay(), viewCaption: 'a distribution with a mean' },
        { tex: '= \\langle X^2 - 2\\mu X + \\mu^2\\rangle', why: 'Expand the square inside the average.' },
        { tex: '= \\langle X^2\\rangle - 2\\mu\\langle X\\rangle + \\mu^2', why: 'Expectation is linear (shown in the previous unit), and $\\mu$ is a constant.' },
        { tex: '= \\langle X^2\\rangle - \\mu^2', why: '$2\\mu\\langle X\\rangle$ equals $2\\mu^2$, so the two middle terms combine.' },
        { tex: '(\\Delta X)^2 = \\langle X^2\\rangle - \\langle X\\rangle^2', why: 'The short-cut formula: a fair die’s variance comes out to $2.917$.', view: twoWay(0.5), viewCaption: 'a second distribution, same idea' },
      ],
      formal: [
        { tex: '(\\Delta X)^2 = \\langle X^2\\rangle - 2\\mu\\langle X\\rangle + \\mu^2 = \\langle X^2\\rangle - \\mu^2', why: 'Linearity of $\\langle\\cdot\\rangle$ collapses the middle terms.', view: manyWay() },
        { tex: '(\\Delta X)^2 = \\langle X^2\\rangle - \\langle X\\rangle^2', why: 'A mean of squares minus a square of a mean, so $(\\Delta X)^2 \\ge 0$ always.', view: twoWay(0.5), viewCaption: 'a second distribution, same idea' },
      ],
    },
    claims: [C.dieVar, C.dieM2, C.dieMeanSq],
  },
  {
    id: 'f5-spread:b2',
    phase: 'core',
    text:
      'The variance is in squared units, so take its square root: the [[qc-standard-deviation|standard deviation]] $\\Delta X = \\sqrt{(\\Delta X)^2}$. ' +
      'It is a typical distance from the mean, in the original units. For the fair die it is $\\sqrt{2.917} = 1.708$.',
    formal:
      'The [[qc-standard-deviation|standard deviation]] $\\sigma = \\Delta X = \\sqrt{\\mathrm{Var}(X)}$ shares $X$’s units and sets the width of a $\\pm\\sigma$ band. ' +
      'For the fair die $\\sigma = 1.708$: readings sit roughly within a band of this half-width about the mean.',
    caption: 'the die: $\\Delta X = 1.708$',
    captionFormal: '$\\sigma = \\sqrt{\\mathrm{Var}(X)} = 1.708$',
    stage: manyWay(),
    claims: [C.dieSD],
  },
  {
    // beat order keeps phases monotonic within the unit (core → books → clue), so this core beat (the plan's
    // b4, "the average sharpens") is placed before the books beat below (the plan's b3, the binomial), swapped
    // from the plan's own listing order; both keep their plan content unchanged.
    id: 'f5-spread:b3',
    phase: 'core',
    text:
      'Average $N$ independent readings and the average scatters less. Its standard deviation is $\\sigma/\\sqrt N$: four times as many readings halve the spread. ' +
      'This is why a long experiment sharpens an estimate. The 448 deposits show the band narrowing this way.',
    formal:
      'For $N$ independent readings each with variance $\\sigma^2$, the sample mean $\\bar X$ has variance $\\sigma^2/N$, so $\\Delta\\bar X = \\sigma/\\sqrt N$ (Bergou §3.3; ' +
      '448’s $\\sigma$-band). The spread of the mean falls as $1/\\sqrt N$ — the law of averages made quantitative.',
    caption: 'the mean of $N$: spread $\\sigma/\\sqrt N$; for the die at $N=100$, $0.171$',
    captionFormal: '$\\Delta\\bar X = \\sigma/\\sqrt N$',
    stage: split(lab({ readouts: ['sigma-band'], batches: [10, 100, 1000], shot: 'L-PLATE-C' }), manyWay()),
    derivation: {
      result: '\\Delta\\bar X = \\sigma/\\sqrt N',
      ground: [
        { tex: '\\bar X = \\tfrac1N\\sum_{k=1}^N X_k', why: 'The sample mean of N independent readings.', view: lab({ readouts: ['sigma-band'], batches: [10, 100, 1000], shot: 'L-PLATE-C' }), viewCaption: 'the band at small N' },
        { tex: '\\mathrm{Var}(\\bar X) = \\tfrac1{N^2}\\sum_k \\mathrm{Var}(X_k)', why: 'Independent readings: variances add, scaled by $1/N^2$.' },
        { tex: '= \\tfrac1{N^2}\\cdot N\\sigma^2 = \\tfrac{\\sigma^2}N', why: 'Every reading has the same variance $\\sigma^2$.', view: manyWay(), viewCaption: 'one reading’s own spread' },
        { tex: '\\Delta\\bar X = \\sigma/\\sqrt N', why: 'Take the square root: the mean’s spread shrinks as $1/\\sqrt N$.', view: lab({ readouts: ['sigma-band'], batches: [10, 100, 1000], shot: 'L-PLATE-C' }), viewCaption: 'the band narrows as deposits grow' },
      ],
      formal: [
        { tex: '\\mathrm{Var}(\\bar X) = \\sigma^2/N', why: 'Independence plus the scaling $\\mathrm{Var}(aX) = a^2\\mathrm{Var}(X)$.', view: manyWay() },
        { tex: '\\Delta\\bar X = \\sigma/\\sqrt N', why: 'The $1/\\sqrt N$ law; for the die at $N=100$, $0.171$.', view: lab({ readouts: ['sigma-band'], batches: [10, 100, 1000], shot: 'L-PLATE-C' }) },
      ],
    },
    claims: [C.dieSD, C.meanSD100],
  },
  {
    id: 'f5-spread:b4',
    phase: 'books',
    text:
      'Flip a fair coin $N$ times and count the heads. The count has mean $Np$ and variance $Np(1 - p)$. ' +
      'For $N = 100$ fair flips the mean is $50$ and the standard deviation is $\\sqrt{25} = 5$: most counts land within a few of $50$.',
    formal:
      'A Binomial$(N, p)$ count has mean $Np$ and variance $Np(1 - p)$ (Bergou §3.3; engine `binomialMoments`; Reif §1.4–1.6, reference only). For $N = 100$, $p = 0.5$: ' +
      'mean $50$, variance $25$, $\\sigma = 5$. The relative width $\\sigma/\\text{mean} = 1/\\sqrt{Np/(1-p)}$ shrinks as $N$ grows.',
    caption: '$100$ fair flips: mean $50$, spread $5$',
    captionFormal: 'Binomial: mean $Np$, variance $Np(1-p)$',
    stage: manyWay(),
    refs: [bergou('§3.3', 'The mean and variance of a sum.'), { source: 'reif', where: '§1.4–1.6', adds: 'Finite-sample binomial statistics (reference only).' }],
    claims: [C.binMean, C.binVar, C.binSD, C.coinHalf],
  },
  {
    id: 'f5-spread:b5',
    phase: 'books',
    text:
      'For a $\\pm\\hbar/2$ spin with $P(+) = p$, the variance works out to $(\\Delta S_z)^2 = \\hbar^2 p(1 - p)$. At $p = 0.75$ that is $0.1875\\hbar^2$, so $\\Delta S_z = 0.433\\hbar$. ' +
      'The scatter is largest at $p = \\tfrac12$ and zero when $p$ is $0$ or $1$.',
    formal:
      '$(\\Delta S_z)^2 = \\langle S_z^2\\rangle - \\langle S_z\\rangle^2 = (\\hbar/2)^2 - (\\tfrac\\hbar2(2p-1))^2 = \\hbar^2 p(1 - p)$, since $S_z^2 = \\tfrac{\\hbar^2}{4}I$. ' +
      'At $p = 0.75$: $0.1875\\hbar^2$, $\\Delta S_z = 0.433\\hbar$ <<qc-l7-spreads|spreads read off the sphere>>. Chapter Q3 gets the same number from the operator.',
    caption: '$p = 0.75$: $\\Delta S_z = 0.433\\hbar$',
    captionFormal: '$(\\Delta S_z)^2 = \\hbar^2 p(1-p) = 0.1875\\hbar^2$',
    stage: spinBridge({ labels: 'spin' }),
    refs: [{ source: 'lecture', where: 'notes pp. 15–16', adds: 'The dispersion $\\langle A^2\\rangle - \\langle A\\rangle^2$ applied to a spin reading.' }],
    claims: [C.spinVar, C.spinSD, C.bornP],
  },
  {
    id: 'f5-spread:b6',
    phase: 'clue',
    text: 'For which chances $p$ does a coin’s $0/1$ reading have zero variance?',
    formal: 'For a Bernoulli($p$) variable, when is $\\mathrm{Var} = p(1 - p) = 0$?',
    caption: 'zero scatter: when?',
    captionFormal: '$p(1-p)=0$: when?',
    stage: twoWay(0.75),
    claims: [C.coinHalf],
    reveal: {
      text:
        'Only when $p = 0$ or $p = 1$: a sure result. Then every reading is the same, so there is nothing to scatter. ' +
        'The scatter is largest in the middle, at $p = \\tfrac12$, where the result is most uncertain.',
      formal:
        '$p(1 - p) = 0 \\Leftrightarrow p \\in \\{0, 1\\}$: a deterministic outcome has variance $0$. The maximum is at $p = \\tfrac12$ (variance $\\tfrac14$). ' +
        'A zero-variance reading is the classical echo of a quantum eigenstate (Chapter Q3).',
      caption: 'variance $0$ at $p=0,1$; largest at $p=\\tfrac12$',
      captionFormal: 'variance $0$ at $p=0,1$; largest at $p=\\tfrac12$',
      stage: twoWay(1),
      claims: [C.varSure, C.varHalf],
    },
  },
]

/* ---------------------------------------------------------------------------------------------- */
/* f5-surprise — Counting information in bits                                                        */
/* ---------------------------------------------------------------------------------------------- */

const surprise: Beat[] = [
  {
    id: 'f5-surprise:b1',
    phase: 'core',
    introduces: ['qc-shannon-entropy'],
    text:
      'How much does one reading tell you? Measure it in bits: one bit is the answer to one yes/no question. ' +
      'A reading with $N$ equally likely outcomes needs $\\log_2 N$ bits. In general the [[qc-shannon-entropy|Shannon entropy]] is $H = -\\sum_x P(x)\\log_2 P(x)$.',
    formal:
      'The [[qc-shannon-entropy|Shannon entropy]] $H = -\\sum_x P(x)\\log_2 P(x)$ bits is the average number of yes/no questions needed to pin down the outcome ' +
      '(Bergou §11.1, p. 190). $N$ equally likely outcomes give $H = \\log_2 N$; a bit is the $N = 2$, fair case, $H = 1$.',
    caption: 'a fair coin: $H = 1$ bit',
    captionFormal: '$H = -\\sum_x P(x)\\log_2 P(x)$',
    stage: twoWay(0.5),
    derivation: {
      result: 'H = -\\sum_x P(x)\\log_2 P(x)',
      ground: [
        { tex: 'N \\text{ equally likely outcomes}', why: 'A fair die has six; a fair coin, two.', view: manyWay(), viewCaption: 'six equal bars' },
        { tex: '\\text{needs } \\log_2 N \\text{ yes/no questions}', why: 'Halving the list each question; $\\log_2$ counts the halvings.' },
        { tex: 'H = \\log_2 N', why: 'So $N = 2$ gives 1 bit, $N = 6$ gives $2.585$.', view: twoWay(0.5), viewCaption: 'fair coin: $H=1$' },
        { tex: 'H = -\\sum_x P(x)\\log_2 P(x)', why: 'For unequal chances, weight each outcome’s own surprise $-\\log_2 P(x)$ by its chance.', view: twoWay(0.75), viewCaption: 'biased coin: $H=0.811$' },
      ],
      formal: [
        { tex: 'H = \\log_2 N,\\quad -\\log_2 P(x) \\text{ the surprise of } x', why: 'The uniform case, plus additivity of surprise over independent parts (Bergou §11.1).', view: manyWay() },
        { tex: 'H = -\\sum_x P(x)\\log_2 P(x)', why: 'The average surprise, bounded $0 \\le H \\le \\log_2 N$.', view: twoWay(0.75) },
      ],
    },
    claims: [C.hCoin, C.hDie],
  },
  {
    id: 'f5-surprise:b2',
    phase: 'core',
    text:
      'A biased coin carries less than a full bit. The [[qc-binary-entropy|binary entropy]] $h(p) = -p\\log_2 p - (1 - p)\\log_2(1 - p)$ gives it. ' +
      'It peaks at $1$ when $p = \\tfrac12$, and falls to $0$ at $p = 0$ or $1$. A coin biased to $p = 0.75$ carries $h(0.75) = 0.811$ bits.',
    formal:
      'The [[qc-binary-entropy|binary entropy]] $h(p) = -p\\log_2 p - (1 - p)\\log_2(1 - p)$ is $H$ for a two-outcome distribution (Bergou §11.3, pp. 193–194). ' +
      'It is concave, maximal $1$ at $p = \\tfrac12$, zero at the endpoints. $h(0.75) = 0.811$.',
    caption: '$p=0.75$ coin: $h = 0.811$ bits',
    captionFormal: '$h(p) = -p\\log_2 p - (1-p)\\log_2(1-p)$',
    stage: twoWay(0.75),
    refs: [bergou('§11.3', 'The binary entropy function $h(p)$.')],
    claims: [C.hThreeQuarter, C.hHalf, C.bornP, C.coinHalf],
  },
  {
    id: 'f5-surprise:b3',
    phase: 'clue',
    text: 'A trick coin always lands heads. How many bits does one flip of it carry?',
    formal: 'What is $H$ for a distribution with $P(\\text{heads}) = 1$?',
    caption: 'a sure flip: how many bits?',
    captionFormal: '$H$ at $P=1$?',
    stage: twoWay(0.9),
    reveal: {
      text:
        'Zero. You already know the result, so the flip tells you nothing. The term $1\\cdot\\log_2 1 = 0$, and the other term vanishes because $0\\cdot\\log_2 0$ is taken as $0$. ' +
        'Certainty carries no information.',
      formal: '$H = -1\\log_2 1 - 0\\log_2 0 = 0$ (with the convention $0\\log 0 = 0$): a certain outcome has zero entropy. Entropy is largest for the uniform distribution and zero for a point mass — the information-theory echo of zero variance (the previous unit’s zero-scatter case).',
      caption: 'a sure coin: $H = 0$ bits',
      captionFormal: 'a sure coin: $H = 0$ bits',
      stage: twoWay(1),
      claims: [C.hSure, C.hThreeQuarter],
    },
  },
]

export const F5_STORY: Record<string, Beat[]> = {
  'f5-probability': probability,
  'f5-average': average,
  'f5-spread': spread,
  'f5-surprise': surprise,
}
