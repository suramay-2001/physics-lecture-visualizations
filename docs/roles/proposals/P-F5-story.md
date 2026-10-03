# P-F5-story — F5 "Chance with numbers" (probability, expectation and variance — the trimmed probability chapter)

Proposal only. Nothing under `app/` is modified. Format: `P-F1-story.md` (Foundations two-track style) with the two
standing gates of `P-Q8-story.md`: every derivation list, both tracks, steps the stage through ≥ 2 distinct views
(`DerivStep.view`, `viewCaption`; W-709 #7), and every new space or notation gets exactly one notation beat
(`Beat.introduces`, `GlossEntry.introduces`; W-709 #8). Map entry: `P-709-map.md` §F5; rulings:
`decisions/qc709-foundations.md`. Planned with F4 and F6.

**Design & trim (`decisions/qc709-foundations.md`; brief).** F5 is the **trimmed** probability chapter — the ground-up
owner of chance, expectation and variance. It "grounds exactly what the Q chapters need: the Born rule, $\langle M\rangle$
and the variance" (notes `qc709-n1`/`n3`). The full map F5 (five units, ending in joint distributions and mutual
information) is cut to **four** units here: probability, expectation, spread, surprise. The joint/correlator unit is
**deferred** (its engine, `marginals`/`correlatorC`, exists and Q10 teaches CHSH inline — §12 Q1). Prerequisite **F2**
(the inner product, for the Born-rule link $P = |\langle a|\psi\rangle|^2$) is built in parallel; F5 bridges to it and
assumes it. The Q chapters (Q3 especially) already use $\langle M\rangle$ and $\Delta M$ inline; F5 does not duplicate
Q3's spin framing — it treats probability abstractly and uses spin only as the worked bridge. Ground ≤ 25
words/sentence; Formal ≤ 40; both tracks, every beat.

**Sources read** (copyrighted; paraphrased and cited).
- 709 notes pp. 14–16 (the average $\langle M\rangle = \sum_\alpha M_\alpha P_\alpha$, the moments $\langle A^n\rangle$,
  the dispersion $(\Delta A)^2 = \langle A^2\rangle - \langle A\rangle^2$) — the usage F5 grounds.
- Bergou 2e (**printed = PDF − 15**): §3.3 pp. 34–37 (distributions, the mean and variance of a sum), §11.1 p. 190,
  §11.3 pp. 193–194 (Shannon entropy, the binary entropy $h(p)$). Reif §1.2–1.6 is reference only (as in 448).
- 448's own probability language (`app/src/physics/sg.ts` deposits/tallies; the `sigmaBand` = $\sigma/\sqrt N$ readout)
  — F5 is the ground-up twin of the deposits picture.

**Evidence.** Every number was computed twice: by an independent numpy route (`scratchpad/f456plan-numpy.py`, block
"F5": explicit sums over outcomes, `np.log2`, closed forms) and by the app engine's `info` module (`mean`, `variance`,
`binomialMoments`, `shannon`, `binaryEntropy`). They agree to 6 decimals. Keys are `f5.*` in `F5.values.ts`.

**Conventions.**
- Beat id `<unit>:b<n>`. Phase tags **[L]** core ramp (`lecture` phase holds the Bergou/notes line), **[B]** a second
  source, **[C]** clue. Order L → B → C. Every beat has **G** (≤ 25 w/sentence) and **F** (≤ 40). All inline math is TeX
  inside `$…$`; no plan ids in learner text — cross-references read "Unit F5.2", "Chapter F2".
- **Units** are pure numbers (probabilities, counts, bits). The spin examples carry ħ only in the bridge beats, where
  $S = \sigma/2$ and the UI appends ħ (as $\langle S_z\rangle = 0.25\hbar$); the probability itself is unitless.
- **Stage shorthand** (each expands to one `StageState`):

| Shorthand | Expands to | Needs |
|---|---|---|
| `dist(D, f)` | `{kind:'distribution', data:D, ...f}` — a classical probability bar/histogram over named outcomes (NEW SVG kind, §9.2) | distribution |
| `amp(S, f)` | `{kind:'amplitudes', state:S, mode:'probability', ...f}` — Born-rule chance bars for a quantum state | — |
| `lab(f)` | `{kind:'lab-r3', ...f}` — the 448 deposits view (`tallies`, `sigmaBand`) for the law-of-averages beats | — |
| `split(A / B)` | `{layout:'split', top:A, bottom:B}` | — |

- `dist` data forms: `{coin:p}` (two bars, $p$ and $1-p$), `{die:6}` (six equal bars), `{binomial:{N, p}}` (the
  $N+1$ counts), `{outcomes:[{x, p}], mean?:true, spread?:true}` (bars with an optional mean line and ±σ band),
  `{entropy:true}` (adds the Shannon-$H$ readout). All derived in `resolve.ts` from `info` (§9.2).
- **Running examples:** a biased coin with $p$; a fair die (1–6); $N$ coin flips (a Binomial count); a spin $|{+}n\rangle$
  read along $z$, whose "+" chance is $p = \cos^2(\theta/2)$ (the Born-rule bridge, Chapter F2).
- **Rosetta** (stated once, `f5-average:b1` cap F): the notes write $\langle M\rangle$ for the expectation; probability
  texts write $E[X]$ or $\mu$; we use $\langle X\rangle$ and name $\mu = \langle X\rangle$. The variance is
  $(\Delta X)^2 = \mathrm{Var}(X) = \sigma^2$; the standard deviation is $\sigma = \Delta X$.

## 0. Chapter map

F5 answers the map's question: **"If each single atom is random, what can we still predict exactly?"** It stands alone
(a reader who has met F2's inner product can start) and is the bridge target for every chapter that takes an average,
a spread or an entropy.

| # | id | Title (≤ 8 words) | Driving question | Sources | bridges offered |
|---|---|---|---|---|---|
| 1 | `f5-probability` | Chances over a list of outcomes | What is a probability, why do a list's chances add to 1, and when do chances multiply? | Bergou §3.3 p. 34; notes p. 14 | `<<l1-average>>`, `<<f2-dot>>` (the Born link) |
| 2 | `f5-average` | The number you expect on average | What single number summarises a random reading, and how do we compute it? | notes p. 14; Bergou §3.3 p. 35 | `<<l4-average>>` |
| 3 | `f5-spread` | How widely the readings scatter | How do we measure scatter, and why does the average of many readings sharpen? | notes pp. 15–16; Bergou §3.3 pp. 35–37 | `<<l3-spread>>`, `<<l7-spreads>>` |
| 4 | `f5-surprise` | Counting information in bits | How much does one reading tell us, measured in yes/no questions? | Bergou §11.1 p. 190, §11.3 pp. 193–194 | — |

Forward F bridge: `f5-spread` → (deferred) `f5-joint` (correlators, the Bell marginal problem) — see §12 Q1.

**Outcomes** (Ground wording):
- Say what a probability is, check that a list of chances adds to 1, and multiply chances for independent events.
- Compute the expectation $\langle X\rangle$ of a random reading, and read it as a long-run average.
- Measure scatter with the variance and standard deviation, and explain why the average of $N$ readings sharpens by $\sqrt N$.
- Count the information in a reading in bits, with the Shannon entropy.

**Prerequisites** (concept ids): F2 `qc-inner-product` (for the Born-rule bridge $P = |\langle a|\psi\rangle|^2$). The
Ground ramp assumes percentages, fractions, coin flips and a class average only.

**Openers and films.** The Part F opener plays before `f5-probability`. Film `qc-f5-galton` (a Galton board: the
average sharpens as $1/\sqrt N$, §10.2) is the `Unit.opener` of `f5-spread`.

## 1. Story beats per unit

Stage kinds: `distribution` (every unit; the new SVG bar/histogram, §9.2), `amplitudes` in probability mode (the
Born-rule bridge beats), `lab-r3` (the deposits/`sigmaBand` beats in F5.3). Every derivation view uses a kind its unit's
beats show.

### Unit `f5-probability` — Chances over a list of outcomes

**`f5-probability:b1` [L] · notation beat, `introduces: ['qc-sample-space', 'qc-probability']`** (outcomes and chances)
- **G:** "List everything that can happen once: for a die, the faces 1 to 6. That list is the [[qc-sample-space|sample space]]. To each outcome give a [[qc-probability|probability]], a number from 0 to 1 saying how likely it is. A fair die gives each face $1/6$."
- **F:** "A [[qc-sample-space|sample space]] $\Omega$ is the set of possible outcomes; a [[qc-probability|probability]] assigns each outcome $x$ a number $P(x) \in [0, 1]$ (Bergou §3.3, p. 34). A fair die has $\Omega = \{1, \ldots, 6\}$, $P(x) = 1/6$. An event is a subset of $\Omega$; its probability is the sum over its outcomes."
- **Cap:** G "a fair die: six outcomes, each chance $1/6$" · F "$\Omega = \{1,\ldots,6\}$, $P(x) = 1/6$"
- **Stage:** `dist({die:6})` (six equal bars).
- **Claims:** `f5DieP` — each bar — `1/6` → 0.1667 · `f5DieN` — the count of outcomes → 6.

**`f5-probability:b2` [L]** (the chances add to 1; frequencies settle; D1)
- **G:** "Every outcome happens with some chance, and exactly one happens each time, so the chances add to 1. You can read a probability as a long-run frequency: flip a fair coin many times and the fraction of heads settles near $0.5$."
- **F:** "Normalization: $\sum_{x\in\Omega} P(x) = 1$ (Bergou §3.3). The law of large numbers makes the observed frequency $f_n(x) \to P(x)$ as the number of trials $n \to \infty$; this is what ties the abstract $P$ to counting (notes p. 14; D1)."
- **Cap:** G "the six die chances add to 1; heads settles near $0.5$" · F "$\sum_x P(x) = 1$; $f_n \to P$"
- **Stage:** `split( dist({die:6}) / lab({tallies:true, shot:'L-PLATE'}) )` (the bars, and deposits piling toward the fractions).
- **Derivation:** D1 (§2).
- **Claims:** `f5DieSum` — `sum(1/6 × 6)` → 1 · `f5CoinHalf` — the long-run head fraction → 0.5.

**`f5-probability:b3` [L]** (independent events multiply)
- **G:** "Two events are [[qc-independent|independent]] when one tells you nothing about the other. Then their chances multiply. Flip two fair coins: the chance of two heads is $\tfrac12 \times \tfrac12 = \tfrac14$. The four outcomes HH, HT, TH, TT each have chance $1/4$."
- **F:** "$A$ and $B$ are [[qc-independent|independent]] iff $P(A \cap B) = P(A)P(B)$ (Bergou §3.3). For two fair coins the joint space is $\{H, T\}^2$ with $P = 1/4$ each; independence makes the joint the product of the two marginals."
- **Cap:** G "two coins: $\tfrac12\times\tfrac12 = \tfrac14$ for HH" · F "$P(A\cap B) = P(A)P(B)$"
- **Stage:** `dist({outcomes:[{x:'HH', p:0.25}, {x:'HT', p:0.25}, {x:'TH', p:0.25}, {x:'TT', p:0.25}]})`.
- **Claims:** `f5TwoCoin` — `0.5 × 0.5` → 0.25 · `f5TwoCoinSum` → 1.

**`f5-probability:b4` [B]** (a quantum chance is a Born probability; the F2 bridge)
- **G:** "Quantum physics makes these chances from overlaps. A spin prepared along $\mathbf n$ and read along $z$ gives "+" with chance $p = \cos^2(\theta/2)$, the size squared of an overlap (Chapter F2). At $\theta = 60^\circ$ that is $0.75$, and "−" has $0.25$."
- **F:** "The Born rule sets $P(a) = |\langle a|\psi\rangle|^2$ for a normalized state (Chapter F2's inner product) <<f2-dot|the overlap and its size>>. For $|{+}n\rangle$ read along $z$, $p_+ = \cos^2(\theta/2)$; at $\theta = 60^\circ$, $p_+ = 0.75$, $p_- = 0.25$ — a two-outcome distribution."
- **Cap:** G "spin at $60^\circ$: chances $0.75$ and $0.25$" · F "$P(a) = |\langle a|\psi\rangle|^2$; $p_+ = \cos^2(\theta/2)$"
- **Stage:** `amp({dir:{thetaDeg:60, phiDeg:45}}, {labels:'spin'})` (the two Born bars).
- **Refs:** Bergou §5.2 (the Born rule); Chapter F2.
- **Claims:** `f5BornP` — `cos²(30°)` → 0.75 · `f5BornSum` → 1.
- **Bridge (G):** "<<l1-average|the oven's output is a chance>>."

**`f5-probability:b5` [C]** (can chances be added when they should be multiplied?)
- **Q G:** "A die is rolled twice. Someone says the chance of two sixes is $\tfrac16 + \tfrac16 = \tfrac13$. Is that right?"
- **Q F:** "For two independent die rolls, is $P(6, 6) = P(6) + P(6)$?"
- **Reveal G:** "No. Adding is for "this outcome **or** that one" on a single roll. "Six **and** six" across two rolls multiplies: $\tfrac16 \times \tfrac16 = \tfrac1{36}$. Adding would even give chances above 1."
- **Reveal F:** "No: $P(6 \text{ then } 6) = P(6)P(6) = 1/36$ by independence. Addition is the rule for a union of disjoint events on one trial ($P(6 \text{ or } 5) = 1/3$); the two rules answer different questions."
- **Reveal cap:** G/F "two sixes: $\tfrac1{36}$, not $\tfrac13$"
- **Stage:** question `dist({die:6, highlight:[5]})`; reveal `dist({outcomes:[{x:'(6,6)', p:0.0278}, {x:'other', p:0.9722}]})`.
- **Claims:** `f5TwoSix` — `1/36` → 0.0278 · `f5SixOrFive` — `1/6 + 1/6` → 0.3333.

### Unit `f5-average` — The number you expect on average

**`f5-average:b1` [L] · notation beat, `introduces: ['qc-expectation']`** (⟨X⟩ = Σ x P(x); D2)
- **G:** "To summarise a random reading in one number, weight each value by its chance and add: the [[qc-expectation|expectation]] $\langle X\rangle = \sum_x x\,P(x)$. For a fair die it is $\tfrac16(1 + 2 + \cdots + 6) = 3.5$. It is the long-run average of many readings."
- **F:** "The [[qc-expectation|expectation]] (mean) of a random variable $X$ is $\langle X\rangle = \sum_x x\,P(x)$ (Bergou §3.3, p. 35; the notes write $\langle M\rangle = \sum_\alpha M_\alpha P_\alpha$, p. 14; D2). For a fair die, $\langle X\rangle = 3.5 = (1 + \cdots + 6)/6$. It equals the limit of the sample average."
- **Cap:** G "a fair die: $\langle X\rangle = 3.5$" · F "Rosetta: $\langle X\rangle = E[X] = \mu$; the notes' $\langle M\rangle$"
- **Stage:** `dist({die:6, mean:true})` (the bars with the mean line at $3.5$).
- **Derivation:** D2 (§2).
- **Claims:** `f5DieMean` — `mean([1..6], [1/6]×6)` → 3.5.
- **Bridge (G):** "<<l4-average|the average no single atom reads>>."

**`f5-average:b2` [L]** (the average need not be a possible value; linearity)
- **G:** "The expectation can be a value the reading never takes: no die face shows $3.5$. It is a balance point, not an outcome. Expectation is linear: double every value and the average doubles; add a constant and the average shifts by it. $\langle 2X + 1\rangle = 2\langle X\rangle + 1$."
- **F:** "$\langle X\rangle$ need not lie in the range of $X$ (no die face is $3.5$): it is the distribution's balance point. Expectation is linear, $\langle aX + b\rangle = a\langle X\rangle + b$ and $\langle X + Y\rangle = \langle X\rangle + \langle Y\rangle$, even when $X, Y$ are dependent (Bergou §3.3)."
- **Cap:** G "$3.5$ is the balance point, not a face" · F "$\langle aX + b\rangle = a\langle X\rangle + b$"
- **Stage:** `dist({die:6, mean:true})` then `dist({outcomes:[{x:'3', p:...}, …], mean:true})` (a loaded die, mean moves).
- **Claims:** `f5DieMean` → 3.5 · `f5LinMean` — `⟨2X+1⟩ for the die` → 8.

**`f5-average:b3` [B]** (the spin average — the Q3 bridge)
- **G:** "For a spin read along $z$, the two values are $+\hbar/2$ and $-\hbar/2$ with chances $p$ and $1 - p$. The average is $\langle S_z\rangle = \tfrac\hbar2(2p - 1)$. At $p = 0.75$ it is $0.25\hbar$ — the same number Chapter Q3's measurement gives."
- **F:** "A $\pm\hbar/2$ reading with $P(+) = p$ has $\langle S_z\rangle = \tfrac\hbar2 p + (-\tfrac\hbar2)(1 - p) = \tfrac\hbar2(2p - 1)$. At $p = \cos^2(\theta/2) = 0.75$ ($\theta = 60^\circ$): $\langle S_z\rangle = 0.25\hbar$ <<l4-average|the average that no atom reads>>. Chapter Q3 derives this from the operator; here it is just $\sum M_\alpha P_\alpha$."
- **Cap:** G "$p = 0.75$: $\langle S_z\rangle = 0.25\hbar$" · F "$\langle S_z\rangle = \tfrac\hbar2(2p - 1)$"
- **Stage:** `amp({dir:{thetaDeg:60, phiDeg:45}}, {labels:'spin'})` (the two chance bars, average annotated).
- **Refs:** notes p. 14.
- **Claims:** `f5BornP` → 0.75 · `f5SpinAvg` — `mean([0.5, −0.5], [0.75, 0.25])` → 0.25.

**`f5-average:b4` [C]** (a fair game)
- **Q G:** "A game pays you the die face in dollars but costs \$3 to play. Over many plays, do you win or lose?"
- **Q F:** "With payoff $X$ (a fair die) and cost 3, what is the expected net $\langle X - 3\rangle$?"
- **Reveal G:** "You win, slowly. The average payoff is $3.5$, so the average net is $3.5 - 3 = 0.5$ per play. A single play can lose, but over many plays the average net is positive."
- **Reveal F:** "$\langle X - 3\rangle = \langle X\rangle - 3 = 3.5 - 3 = 0.5 > 0$ by linearity: a favourable game. A fair game would cost exactly $\langle X\rangle = 3.5$; the expectation is the break-even price."
- **Reveal cap:** G/F "net average $+0.5$ per play"
- **Stage:** question `dist({die:6, mean:true})`; reveal `dist({die:6, mean:true, shift:-3})` (the mean line at $0.5$).
- **Claims:** `f5DieMean` → 3.5 · `f5GameNet` — `3.5 − 3` → 0.5.

### Unit `f5-spread` — How widely the readings scatter

**`f5-spread:b1` [L] · notation beat, `introduces: ['qc-variance']`** ((ΔX)² = ⟨X²⟩ − ⟨X⟩²; D3)
- **G:** "Two distributions can share an average but scatter differently. The [[qc-variance|variance]] $(\Delta X)^2 = \langle(X - \langle X\rangle)^2\rangle$ measures the scatter: the average squared distance from the mean. A short cut is $(\Delta X)^2 = \langle X^2\rangle - \langle X\rangle^2$. For a fair die it is $2.917$."
- **F:** "The [[qc-variance|variance]] $(\Delta X)^2 = \mathrm{Var}(X) = \langle(X - \mu)^2\rangle = \langle X^2\rangle - \langle X\rangle^2 \ge 0$ (Bergou §3.3; the notes' dispersion $\langle A^2\rangle - \langle A\rangle^2$, p. 15; D3). For a fair die $\langle X^2\rangle = 15.167$, $\langle X\rangle^2 = 12.25$, so $(\Delta X)^2 = 2.917$."
- **Cap:** G "a fair die: variance $2.917$" · F "$(\Delta X)^2 = \langle X^2\rangle - \langle X\rangle^2$"
- **Stage:** `dist({die:6, mean:true, spread:true})` (the mean line and the ±σ band).
- **Derivation:** D3 (§2).
- **Claims:** `f5DieVar` — `variance([1..6], [1/6]×6)` → 2.9167 · `f5DieM2` — `mean([1..36 squares], …)` → 15.1667.

**`f5-spread:b2` [L]** (the standard deviation)
- **G:** "The variance is in squared units, so take its square root: the [[qc-standard-deviation|standard deviation]] $\Delta X = \sqrt{(\Delta X)^2}$. It is a typical distance from the mean, in the original units. For the fair die it is $\sqrt{2.917} = 1.708$."
- **F:** "The [[qc-standard-deviation|standard deviation]] $\sigma = \Delta X = \sqrt{\mathrm{Var}(X)}$ shares $X$'s units and sets the width of the ±σ band. For the fair die $\sigma = 1.708$; roughly, readings sit within a band of this half-width about the mean."
- **Cap:** G "the die: $\Delta X = 1.708$" · F "$\sigma = \sqrt{\mathrm{Var}(X)} = 1.708$"
- **Stage:** `dist({die:6, mean:true, spread:true})`.
- **Claims:** `f5DieSD` — `sqrt(variance(…))` → 1.7078.

**`f5-spread:b3` [B]** (counting heads: the binomial)
- **G:** "Flip a fair coin $N$ times and count the heads. The count has mean $Np$ and variance $Np(1 - p)$. For $N = 100$ fair flips the mean is $50$ and the standard deviation is $\sqrt{25} = 5$: most counts land within a few of $50$."
- **F:** "A Binomial$(N, p)$ count has mean $Np$ and variance $Np(1 - p)$ (Bergou §3.3; engine `binomialMoments`; Reif §1.4–1.6). For $N = 100$, $p = 0.5$: mean $50$, variance $25$, $\sigma = 5$. The relative width $\sigma/\text{mean} = 1/\sqrt{N p/(1-p)}$ shrinks as $N$ grows."
- **Cap:** G "$100$ fair flips: mean $50$, spread $5$" · F "Binomial: mean $Np$, variance $Np(1-p)$"
- **Stage:** `dist({binomial:{N:100, p:0.5}, mean:true, spread:true})` (the bell-shaped histogram).
- **Refs:** Reif §1.4–1.6 (reference); Bergou §3.3.
- **Claims:** `f5BinMean` — `binomialMoments(100, 0.5).mean` → 50 · `f5BinVar` → 25 · `f5BinSD` → 5.

**`f5-spread:b4` [L]** (the average of many readings sharpens; D4)
- **G:** "Average $N$ independent readings and the average scatters less. Its standard deviation is $\sigma/\sqrt N$: four times as many readings halve the spread. This is why a long experiment sharpens an estimate. The 448 deposits show the band narrowing as $1/\sqrt N$."
- **F:** "For $N$ independent readings each with variance $\sigma^2$, the sample mean $\bar X$ has variance $\sigma^2/N$, so $\Delta\bar X = \sigma/\sqrt N$ (Bergou §3.3; 448's `sigmaBand`; D4). The spread of the mean falls as $1/\sqrt N$ — the law of averages made quantitative."
- **Cap:** G "the mean of $N$: spread $\sigma/\sqrt N$" · F "$\Delta\bar X = \sigma/\sqrt N$"
- **Stage:** `split( lab({tallies:true, sigmaBand:true, shot:'L-PLATE'}) / dist({die:6, mean:true, spread:true}) )` (the band narrows as deposits grow).
- **Derivation:** D4 (§2).
- **Claims:** `f5DieSD` → 1.7078 · `f5MeanSD100` — `1.7078/√100` → 0.1708.

**`f5-spread:b5` [B]** (the spin spread — the Q3 bridge)
- **G:** "For a $\pm\hbar/2$ spin with $P(+) = p$, the variance works out to $(\Delta S_z)^2 = \hbar^2 p(1 - p)$. At $p = 0.75$ that is $0.1875\hbar^2$, so $\Delta S_z = 0.433\hbar$. The scatter is largest at $p = \tfrac12$ and zero when $p$ is $0$ or $1$."
- **F:** "$(\Delta S_z)^2 = \langle S_z^2\rangle - \langle S_z\rangle^2 = (\hbar/2)^2 - (\tfrac\hbar2(2p-1))^2 = \hbar^2 p(1 - p)$ (since $S_z^2 = (\hbar^2/4)I$). At $p = 0.75$: $0.1875\hbar^2$, $\Delta S_z = 0.433\hbar$ <<l7-spreads|spreads read off the sphere>>. Chapter Q3 gets the same from the operator."
- **Cap:** G "$p = 0.75$: $\Delta S_z = 0.433\hbar$" · F "$(\Delta S_z)^2 = \hbar^2 p(1-p) = 0.1875\hbar^2$"
- **Stage:** `amp({dir:{thetaDeg:60, phiDeg:45}}, {labels:'spin', spread:true})`.
- **Refs:** notes pp. 15–16.
- **Claims:** `f5SpinVar` — `variance([0.5, −0.5], [0.75, 0.25])` → 0.1875 · `f5SpinSD` → 0.4330.

**`f5-spread:b6` [C]** (when is there no scatter?)
- **Q G:** "For which chances $p$ does a coin's $0/1$ reading have zero variance?"
- **Q F:** "For a Bernoulli($p$) variable, when is $\mathrm{Var} = p(1 - p) = 0$?"
- **Reveal G:** "Only when $p = 0$ or $p = 1$: a sure result. Then every reading is the same, so there is nothing to scatter. The scatter is largest in the middle, at $p = \tfrac12$, where the result is most uncertain."
- **Reveal F:** "$p(1 - p) = 0 \Leftrightarrow p \in \{0, 1\}$: a deterministic outcome, variance 0. The maximum is at $p = \tfrac12$ (variance $\tfrac14$). A zero-variance reading is the classical echo of a quantum eigenstate (Chapter Q3)."
- **Reveal cap:** G/F "variance 0 at $p = 0, 1$; largest at $p = \tfrac12$"
- **Stage:** question `dist({coin:0.75, spread:true})`; reveal `dist({coin:1.0, spread:true})` (one bar, no band).
- **Claims:** `f5VarSure` — `variance([0,1], [1,0])` → 0 · `f5VarHalf` — `variance([0,1], [0.5,0.5])` → 0.25.

### Unit `f5-surprise` — Counting information in bits

**`f5-surprise:b1` [L] · notation beat, `introduces: ['qc-shannon-entropy']`** (bits and H; D5)
- **G:** "How much does one reading tell you? Measure it in bits: one bit is the answer to one yes/no question. A reading with $N$ equally likely outcomes needs $\log_2 N$ bits. In general the [[qc-shannon-entropy|Shannon entropy]] is $H = -\sum_x P(x)\log_2 P(x)$."
- **F:** "The [[qc-shannon-entropy|Shannon entropy]] $H = -\sum_x P(x)\log_2 P(x)$ bits is the average number of yes/no questions to pin down the outcome (Bergou §11.1, p. 190; D5). $N$ equally likely outcomes give $H = \log_2 N$; a bit is the $N = 2$, fair case, $H = 1$ (the information bit, distinct from F7's logic bit — §12 Q3)."
- **Cap:** G "a fair coin: $H = 1$ bit" · F "$H = -\sum_x P(x)\log_2 P(x)$"
- **Stage:** `dist({coin:0.5, entropy:true})` (two bars, $H = 1$ readout).
- **Derivation:** D5 (§2).
- **Claims:** `f5HCoin` — `shannon([0.5, 0.5])` → 1 · `f5HDie` — `shannon([1/6]×6)` → 2.585.

**`f5-surprise:b2` [L]** (the binary entropy h(p))
- **G:** "A biased coin carries less than a full bit. The [[qc-binary-entropy|binary entropy]] $h(p) = -p\log_2 p - (1 - p)\log_2(1 - p)$ gives it. It peaks at $1$ when $p = \tfrac12$, and falls to $0$ at $p = 0$ or $1$. A $75/25$ coin carries $h(0.75) = 0.811$ bits."
- **F:** "The [[qc-binary-entropy|binary entropy]] $h(p) = -p\log_2 p - (1 - p)\log_2(1 - p)$ is $H$ for a two-outcome distribution (Bergou §11.3, pp. 193–194). It is concave, maximal $1$ at $p = \tfrac12$, zero at the endpoints. $h(0.75) = 0.811$."
- **Cap:** G "$75/25$ coin: $h = 0.811$ bits" · F "$h(p) = -p\log_2 p - (1-p)\log_2(1-p)$"
- **Stage:** `dist({coin:0.75, entropy:true})`.
- **Claims:** `f5hThreeQuarter` — `binaryEntropy(0.75)` → 0.8113 · `f5hHalf` — `binaryEntropy(0.5)` → 1.

**`f5-surprise:b3` [C]** (a sure thing carries no information)
- **Q G:** "A trick coin always lands heads. How many bits does one flip of it carry?"
- **Q F:** "What is $H$ for a distribution with $P(\text{heads}) = 1$?"
- **Reveal G:** "Zero. You already know the result, so the flip tells you nothing. The term $1\cdot\log_2 1 = 0$, and the other term vanishes because $0\cdot\log_2 0$ is taken as $0$. Certainty carries no information."
- **Reveal F:** "$H = -1\log_2 1 - 0\log_2 0 = 0$ (with the convention $0\log 0 = 0$): a certain outcome has zero entropy. Entropy is largest for the uniform distribution and zero for a point mass — the information-theory echo of zero variance (Unit F5.3)."
- **Reveal cap:** G/F "a sure coin: $H = 0$ bits"
- **Stage:** question `dist({coin:0.9, entropy:true})`; reveal `dist({coin:1.0, entropy:true})` (one bar, $H = 0$).
- **Claims:** `f5HSure` — `shannon([1, 0])` → 0 · `f5hThreeQuarter` → 0.8113 (the contrast).

**Beat count:** 5 + 4 + 6 + 3 = **18 beats**, 4 of them clues with reveals. Phase mix: 11 [L] · 3 [B] · 4 [C]; within
every unit the order is L → B → C.

## 2. Derivations

Each step is `tex` — `why` — **view** (the shorthand above) — *viewCaption*. A step without a view inherits the previous
one in its list. Every list has ≥ 2 distinct views; every view's kind is one the unit's beats use. The last `tex` of each
list ends on the result.

**D1 · `f5-probability:b2` · result `\sum_x P(x) = 1,\quad P(A\cap B) = P(A)P(B)` (independent)** (Bergou §3.3; notes p. 14)
- Ground (3 views):
  1. `\text{one outcome happens each trial}` — Exactly one face of the die comes up. **view** `dist({die:6})` · *six outcomes*
  2. `\sum_x P(x) = 1` — The chances of all outcomes add to the certainty of something happening.
  3. `f_n(x) = \tfrac{\#x \text{ in } n \text{ trials}}{n} \to P(x)` — Over many trials the fraction settles on the chance. **view** `lab({tallies:true, shot:'L-PLATE'})` · *deposits piling toward $1/6$*
  4. `P(A \cap B) = P(A)P(B)` — Independent events: one says nothing about the other, so chances multiply. **view** `dist({outcomes:[{x:'HH', p:0.25}, {x:'HT', p:0.25}, {x:'TH', p:0.25}, {x:'TT', p:0.25}]})` · *two coins: four equal bars*
- Formal (2 views):
  1. `\sum_{x\in\Omega} P(x) = 1`, $f_n \to P$ — normalization and the law of large numbers (Bergou §3.3). **view** `dist({die:6})`
  2. `P(A\cap B) = P(A)P(B)` — the definition of independence. **view** `lab({tallies:true, shot:'L-PLATE'})`
- Check: `f5DieSum`, `f5CoinHalf`, `f5TwoCoin`.

**D2 · `f5-average:b1` · result `\langle X\rangle = \sum_x x\,P(x)`, the long-run mean** (Bergou §3.3; notes p. 14)
- Ground (3 views):
  1. `\bar X_n = \tfrac1n\sum_{k=1}^n x_k` — Average $n$ readings. **view** `lab({tallies:true, shot:'L-PLATE'})` · *deposits accumulating*
  2. `\bar X_n = \sum_x x\,\tfrac{\#x}{n}` — Group equal readings: each value times how often it came up.
  3. `\tfrac{\#x}{n} \to P(x)` — The frequency tends to the chance (D1). **view** `dist({die:6})` · *the chances $1/6$*
  4. `\langle X\rangle = \sum_x x\,P(x) = 3.5` — So the long-run average is the chance-weighted sum. **view** `dist({die:6, mean:true})` · *the mean line at $3.5$*
- Formal (2 views):
  1. `\bar X_n = \sum_x x\,f_n(x) \to \sum_x x\,P(x)` — frequencies → probabilities (Bergou §3.3). **view** `dist({die:6})`
  2. `\langle X\rangle = \sum_x x\,P(x)` — the expectation; $3.5$ for a fair die. **view** `dist({die:6, mean:true})`
- Check: `f5DieMean`.

**D3 · `f5-spread:b1` · result `(\Delta X)^2 = \langle X^2\rangle - \langle X\rangle^2`** (Bergou §3.3; notes p. 15)
- Ground (3 views):
  1. `(\Delta X)^2 = \langle(X - \mu)^2\rangle,\quad \mu = \langle X\rangle` — The average squared distance from the mean. **view** `dist({die:6, mean:true, spread:true})` · *mean and ±σ band*
  2. `= \langle X^2 - 2\mu X + \mu^2\rangle` — Expand the square inside the average.
  3. `= \langle X^2\rangle - 2\mu\langle X\rangle + \mu^2` — Expectation is linear (Unit F5.2); $\mu$ is a constant.
  4. `= \langle X^2\rangle - \mu^2` — $2\mu\langle X\rangle = 2\mu^2$, so two terms combine. **view** `dist({die:6, mean:true})` · *$\langle X^2\rangle = 15.167$, $\langle X\rangle^2 = 12.25$*
  5. `(\Delta X)^2 = \langle X^2\rangle - \langle X\rangle^2 = 2.917` — The short-cut formula; a fair die's variance.
- Formal (2 views):
  1. `(\Delta X)^2 = \langle X^2\rangle - 2\mu\langle X\rangle + \mu^2 = \langle X^2\rangle - \mu^2` — linearity of $\langle\cdot\rangle$. **view** `dist({die:6, mean:true})`
  2. `(\Delta X)^2 = \langle X^2\rangle - \langle X\rangle^2 \ge 0` — a mean of squares, so non-negative. **view** `dist({die:6, mean:true, spread:true})`
- Check: `f5DieVar`, `f5DieM2`.

**D4 · `f5-spread:b4` · result `\Delta\bar X = \sigma/\sqrt N`** (Bergou §3.3; 448 `sigmaBand`)
- Ground (3 views):
  1. `\bar X = \tfrac1N\sum_{k=1}^N X_k` — The sample mean of $N$ independent readings. **view** `lab({tallies:true, sigmaBand:true, shot:'L-PLATE'})` · *the band at small $N$*
  2. `\mathrm{Var}(\bar X) = \tfrac1{N^2}\sum_k \mathrm{Var}(X_k)` — Independent readings: variances add, scaled by $1/N^2$.
  3. `= \tfrac1{N^2}\cdot N\sigma^2 = \tfrac{\sigma^2}N` — Each reading has the same variance $\sigma^2$. **view** `dist({die:6, mean:true, spread:true})` · *one reading's spread $\sigma = 1.708$*
  4. `\Delta\bar X = \sigma/\sqrt N` — Take the square root: the mean's spread shrinks as $1/\sqrt N$. **view** `lab({tallies:true, sigmaBand:true, shot:'L-PLATE'})` · *the band narrows as deposits grow*
- Formal (2 views):
  1. `\mathrm{Var}(\bar X) = \sigma^2/N` — independence and the scaling $\mathrm{Var}(aX) = a^2\mathrm{Var}(X)$. **view** `dist({die:6, mean:true, spread:true})`
  2. `\Delta\bar X = \sigma/\sqrt N` — the $1/\sqrt N$ law; for the die at $N = 100$, $0.171$. **view** `lab({tallies:true, sigmaBand:true, shot:'L-PLATE'})`
- Check: `f5DieSD`, `f5MeanSD100`.

**D5 · `f5-surprise:b1` · result `H = -\sum_x P(x)\log_2 P(x)`** (Bergou §11.1, p. 190)
- Ground (3 views):
  1. `N \text{ equally likely outcomes}` — A fair die has six; a fair coin, two. **view** `dist({die:6, entropy:true})` · *six equal bars*
  2. `\text{needs } \log_2 N \text{ yes/no questions}` — Halving the list each question; $\log_2$ counts the halvings.
  3. `H = \log_2 N` — So $N = 2$ gives 1 bit, $N = 6$ gives $2.585$. **view** `dist({coin:0.5, entropy:true})` · *fair coin: $H = 1$*
  4. `H = -\sum_x P(x)\log_2 P(x)` — For unequal chances, weight each outcome's surprise $-\log_2 P(x)$ by its chance. **view** `dist({coin:0.75, entropy:true})` · *biased coin: $H = 0.811$*
- Formal (2 views):
  1. `H = \log_2 N` for the uniform case; surprise of $x$ is $-\log_2 P(x)$ — additivity over independent parts (Bergou §11.1). **view** `dist({die:6, entropy:true})`
  2. `H = -\sum_x P(x)\log_2 P(x)` — the average surprise; $0 \le H \le \log_2 N$. **view** `dist({coin:0.75, entropy:true})`
- Check: `f5HCoin`, `f5HDie`, `f5hThreeQuarter`.

## 3. Try-it widget per unit

Widgets reuse the stage kinds' own engine calls (`info` module).

| Unit | Widget spec | Why this one |
|---|---|---|
| `f5-probability` | `{kind:'distribution', props:{mode:'build', outcomes:3}}` | Drag the bars; they renormalize to sum to 1 (b1–b2). |
| `f5-average` | `{kind:'distribution', props:{mode:'mean', die:6}}` | Load the die (drag a bar up); watch the mean line slide (b1–b2). |
| `f5-spread` | `{kind:'distribution', props:{mode:'binomial', N:20, p:0.5}}` | Slide $N$ and $p$; the mean $Np$, the band $\sqrt{Np(1-p)}$ and $\sigma/\sqrt N$ update (b3–b4). |
| `f5-surprise` | `{kind:'distribution', props:{mode:'entropy', coin:0.5}}` | Slide the coin bias; watch $h(p)$ rise to 1 at $\tfrac12$ and fall to 0 at the ends (b1–b2). |

**Try this** (both tracks; F wording in brackets):
- `f5-probability`: (1) Make three bars sum to 1. (2) Set one bar to 1: a sure outcome. (3) Two coins — build HH, HT, TH, TT. [Check independence: each $1/4$.]
- `f5-average`: (1) Fair die: read $\langle X\rangle = 3.5$. (2) Load the 6 face: the mean rises. (3) Make the mean a value no face takes. [The balance point need not be an outcome.]
- `f5-spread`: (1) $N = 20$, $p = 0.5$: read mean $10$, $\sigma = 2.24$. (2) Raise $N$ to $100$: the relative width shrinks. (3) Watch $\sigma/\sqrt N$ for the sample mean. [The $1/\sqrt N$ law.]
- `f5-surprise`: (1) Fair coin: $H = 1$ bit. (2) Slide to $p = 0.9$: $H$ drops. (3) Slide to $p = 1$: $H = 0$. [Certainty carries no information.]

## 4. Challenges per unit

Format: tier · kind · id. Numbers computed in `F5.values.ts` with the named `info` call; tolerance 0.005 unless stated,
0 for exact integers. **Homework:** the map flags HW1 P1 and P3 (which plug in HW1's $|{+}n\rangle$) as submitted;
F5's story never uses those specific numbers, and the one touching item (`f5-sp-spin`) is hints-only (§12 Q2).

### `f5-probability`
1. **warm-up · numeric · `f5-p-die`** — "A fair die. What is the probability of rolling an even number?"
   - Answer: **0.5** = `3/6` (the event $\{2, 4, 6\}$).
   - Hints: (1) Add the chances of the outcomes in the event. (2) Three faces are even. (3) $3 \times \tfrac16$.
   - Walkthrough: $P(\text{even}) = \tfrac16 + \tfrac16 + \tfrac16 = 0.5$.
2. **core · numeric · `f5-p-two-heads`** — "Two fair coins. What is the chance of two heads?"
   - Answer: **0.25** = `0.5 × 0.5`.
   - Hints: (1) The flips are independent. (2) Independent chances multiply. (3) $\tfrac12 \times \tfrac12$.
   - Walkthrough: $P(\text{HH}) = 0.25$; the four outcomes each have $0.25$.
3. **core · numeric · `f5-p-born`** — "A spin at $\theta = 60^\circ$ is read along $z$. What is $P(+)$?"
   - Answer: **0.75** = `cos²(30°)` (the Born rule, Chapter F2).
   - Hints: (1) $P(+) = \cos^2(\theta/2)$. (2) $\theta/2 = 30^\circ$. (3) $\cos 30^\circ = 0.866$, squared.
   - Walkthrough: $\cos^2 30^\circ = 0.75$, so $P(-) = 0.25$.
4. **stretch · numeric · `f5-p-at-least-one`** — "Three fair coins. What is the chance of at least one head?"
   - Answer: **0.875** = `1 − (1/2)³`.
   - Hints: (1) Use the complement. (2) "At least one head" is the opposite of "all tails". (3) $P(\text{all tails}) = (1/2)^3$.
   - Walkthrough: $1 - \tfrac18 = 0.875$.

### `f5-average`
1. **warm-up · numeric · `f5-a-die`** — "What is the expectation of a fair die?"
   - Answer: **3.5** = `mean([1..6], [1/6]×6)`.
   - Hints: (1) Weight each face by $1/6$. (2) Add $1 + 2 + \cdots + 6 = 21$. (3) Divide by 6.
   - Walkthrough: $21/6 = 3.5$.
2. **core · numeric · `f5-a-biased`** — "A coin pays \$1 for heads ($p = 0.6$), \$0 for tails. What is the expected pay?"
   - Answer: **0.6** = `mean([1, 0], [0.6, 0.4])`.
   - Hints: (1) $\langle X\rangle = \sum x P(x)$. (2) $1\cdot0.6 + 0\cdot0.4$. (3) Only heads pays.
   - Walkthrough: $\langle X\rangle = 0.6$.
3. **core · numeric · `f5-a-linear`** — "A fair die's face is doubled and $1$ added. What is the new expectation?"
   - Answer: **8** = `2 × 3.5 + 1`.
   - Hints: (1) Expectation is linear. (2) $\langle 2X + 1\rangle = 2\langle X\rangle + 1$. (3) $\langle X\rangle = 3.5$.
   - Walkthrough: $2\cdot3.5 + 1 = 8$.
4. **stretch · numeric · `f5-a-spin`** — "A spin with $P(+) = 0.75$. What is $\langle S_z\rangle$, in units of $\hbar$?"
   - Answer: **0.25** = `mean([0.5, −0.5], [0.75, 0.25])`.
   - Hints: (1) Values $\pm\tfrac12$ (in ħ). (2) $\langle S_z\rangle = \tfrac12(2p - 1)$. (3) $2\cdot0.75 - 1 = 0.5$.
   - Walkthrough: $\tfrac12\cdot0.5 = 0.25\hbar$; the same as Chapter Q3's operator average.

### `f5-spread`
1. **warm-up · numeric · `f5-s-coin-var`** — "A fair coin ($0/1$). What is its variance?"
   - Answer: **0.25** = `variance([0, 1], [0.5, 0.5])`.
   - Hints: (1) $\mu = 0.5$. (2) $p(1 - p)$. (3) $0.5 \times 0.5$.
   - Walkthrough: $\mathrm{Var} = 0.25$, $\sigma = 0.5$.
2. **core · numeric · `f5-s-die-sd`** — "What is the standard deviation of a fair die (to 3 d.p.)?"
   - Answer: **1.708** = `sqrt(variance([1..6], [1/6]×6))`.
   - Hints: (1) Variance first. (2) $\langle X^2\rangle - \langle X\rangle^2 = 15.167 - 12.25$. (3) $\sqrt{2.917}$.
   - Walkthrough: $\sqrt{2.917} = 1.708$.
3. **core · numeric · `f5-s-binomial`** — "$100$ fair coin flips. What is the standard deviation of the head count?"
   - Answer: **5** = `sqrt(binomialMoments(100, 0.5).variance)`.
   - Hints: (1) Variance is $Np(1 - p)$. (2) $100 \times 0.5 \times 0.5 = 25$. (3) $\sqrt{25}$.
   - Walkthrough: $\sigma = 5$; most counts fall within a few of $50$.
4. **stretch · numeric · `f5-s-sqrtN`** — "A reading has $\sigma = 2$. Average $64$ independent readings. What is the spread of the average?"
   - Answer: **0.25** = `2 / sqrt(64)`.
   - Hints: (1) The sample mean's spread is $\sigma/\sqrt N$. (2) $\sqrt{64} = 8$. (3) $2/8$.
   - Walkthrough: $\sigma/\sqrt N = 0.25$: averaging sharpens the estimate.
5. **stretch · numeric · `f5-sp-spin` · `assigned: 'HW1 P1'`** (hints only; §12 Q2) — "For HW1's $|{+}n\rangle$ read along $z$, give $(\Delta S_z)^2$ in units of $\hbar^2$."
   - Answer: **computed from `variance`** with $p = \cos^2(\theta/2)$ for HW1's angle (not plugged in here).
   - Hints only: (1) $(\Delta S_z)^2 = \hbar^2 p(1 - p)$. (2) $p = \cos^2(\theta/2)$. (3) Use HW1's $\theta$.
   - Walkthrough: withheld while HW1 P1 is assigned.

### `f5-surprise`
1. **warm-up · numeric · `f5-u-coin`** — "How many bits does one fair coin flip carry?"
   - Answer: **1** = `shannon([0.5, 0.5])`.
   - Hints: (1) One yes/no question. (2) $H = \log_2 2$. (3) $\log_2 2 = 1$.
   - Walkthrough: $H = 1$ bit.
2. **core · numeric · `f5-u-die`** — "How many bits does a fair die roll carry (to 3 d.p.)?"
   - Answer: **2.585** = `shannon([1/6]×6)`.
   - Hints: (1) Six equally likely outcomes. (2) $H = \log_2 6$. (3) $\log_2 6 = 2.585$.
   - Walkthrough: $H = 2.585$ bits.
3. **core · numeric · `f5-u-binary`** — "A $75/25$ coin. How many bits does one flip carry (to 3 d.p.)?"
   - Answer: **0.811** = `binaryEntropy(0.75)`.
   - Hints: (1) Use $h(p)$. (2) $-0.75\log_2 0.75 - 0.25\log_2 0.25$. (3) Between 0 and 1.
   - Walkthrough: $h(0.75) = 0.811$ bits, less than a full bit.
4. **stretch · choice · `f5-u-max`** — "For which coin bias is the information per flip largest?"
   - Options: $p = 0.1$ · $p = 0.25$ · **$p = 0.5$** ✓ · $p = 0.9$.
   - Check: `binaryEntropy` is maximal (1 bit) at $p = 0.5$.
   - Hints: (1) Most uncertain means most informative. (2) When is the coin hardest to predict? (3) The symmetric case.
   - Walkthrough: $h(p)$ peaks at $p = 0.5$ ($H = 1$); the biased coins carry less.

## 5. Glossary terms new in F5

`introduces` marks the notation beats (W-709 #8). F5 is the ground-up owner of classical probability; Q chapters that
use $\langle M\rangle$/$\Delta M$ keep their beats and gain Q→F bridges later. Ids with a prior entry are REUSED (F5
sets its per-chapter introduces-beat); the rest are NEW.

| id | Term | introduces | new/reuse | Ground gloss | Formal definition | First use |
|---|---|---|---|---|---|---|
| `qc-sample-space` | sample space | space | NEW | The list of everything that can happen once. | The set $\Omega$ of possible outcomes (Bergou §3.3). | `f5-probability:b1` |
| `qc-probability` | probability | notation | NEW | A number from 0 to 1 saying how likely an outcome is. | $P: \Omega \to [0, 1]$ with $\sum_x P(x) = 1$. | `f5-probability:b1` |
| `qc-independent` | independent events | — | NEW | Two events where one tells you nothing about the other. | $P(A \cap B) = P(A)P(B)$. | `f5-probability:b3` |
| `qc-expectation` | expectation | notation | reuse (Q3) | The chance-weighted average of a reading; its long-run mean. | $\langle X\rangle = \sum_x x\,P(x)$; linear; the notes' $\langle M\rangle = \sum_\alpha M_\alpha P_\alpha$. | `f5-average:b1` |
| `qc-variance` | variance | notation | NEW | The average squared distance of a reading from its mean. | $(\Delta X)^2 = \langle(X - \mu)^2\rangle = \langle X^2\rangle - \langle X\rangle^2 \ge 0$ (the notes' dispersion). | `f5-spread:b1` |
| `qc-standard-deviation` | standard deviation | — | NEW | The square root of the variance: a typical distance from the mean. | $\sigma = \Delta X = \sqrt{\mathrm{Var}(X)}$. | `f5-spread:b2` |
| `qc-shannon-entropy` | Shannon entropy | notation | NEW | The average number of yes/no questions a reading answers, in bits. | $H = -\sum_x P(x)\log_2 P(x)$ bits; $0 \le H \le \log_2|\Omega|$ (Bergou §11.1). | `f5-surprise:b1` |
| `qc-binary-entropy` | binary entropy | — | NEW | The information in a two-outcome reading, as a function of its bias. | $h(p) = -p\log_2 p - (1-p)\log_2(1-p)$; max 1 at $p = \tfrac12$ (Bergou §11.3). | `f5-surprise:b2` |

Reused but **not** introduced here: `qc-inner-product` (F2, for the Born-rule bridge). The map's `qc-dispersion`
(Q3, $(\Delta A)^2$) is the same quantity as `qc-variance`; F5 owns the ground-up `qc-variance` and the wiring pass
links them (§12 Q4).

**Notation/space beats (one each, both tracks, with a view):**

| Gloss id | Kind | Beat | View |
|---|---|---|---|
| `qc-sample-space`, `qc-probability` | space / notation | `f5-probability:b1` | `dist({die:6})` |
| `qc-expectation` | notation | `f5-average:b1` | `dist({die:6, mean:true})` |
| `qc-variance` | notation | `f5-spread:b1` | `dist({die:6, mean:true, spread:true})` |
| `qc-shannon-entropy` | notation | `f5-surprise:b1` | `dist({coin:0.5, entropy:true})` |

## 6. Review card per unit (both tracks)

Every number is an F5 claim from §1 or §4.

### `f5-probability`
- **G points:** (1) The sample space lists the outcomes; a probability is a chance from 0 to 1. (2) A list of chances adds to 1. (3) Independent events multiply: two heads is $\tfrac14$. (4) A quantum chance is a Born probability $|\langle a|\psi\rangle|^2$.
- **F points:** (1) $\Omega$, $P(x) \in [0,1]$, $\sum_x P(x) = 1$. (2) $f_n \to P$ (law of large numbers). (3) $P(A\cap B) = P(A)P(B)$ for independent events.
- **Equations:** $\sum_x P(x) = 1,\quad P(A\cap B) = P(A)P(B),\quad P(a) = |\langle a|\psi\rangle|^2$
- **Trap:** adding chances that should multiply: two sixes is $\tfrac1{36}$, not $\tfrac13$ (`f5TwoSix`).

### `f5-average`
- **G points:** (1) $\langle X\rangle = \sum_x x\,P(x)$: the chance-weighted sum. (2) It is the long-run average of readings. (3) It need not be a possible value ($3.5$ for a die). (4) Expectation is linear.
- **F points:** (1) $\langle X\rangle = \sum x\,P(x)$ (Bergou §3.3; notes p. 14). (2) $\langle aX + b\rangle = a\langle X\rangle + b$. (3) For a spin, $\langle S_z\rangle = \tfrac\hbar2(2p - 1)$.
- **Equations:** $\langle X\rangle = \sum_x x\,P(x),\quad \langle aX + b\rangle = a\langle X\rangle + b$
- **Trap:** expecting $\langle X\rangle$ to be an outcome. No die face shows $3.5$ (`f5DieMean`).

### `f5-spread`
- **G points:** (1) The variance is the average squared distance from the mean, $(\Delta X)^2 = \langle X^2\rangle - \langle X\rangle^2$. (2) The standard deviation $\sigma = \sqrt{\mathrm{Var}}$ is in the original units. (3) A Binomial count has mean $Np$, variance $Np(1-p)$. (4) The average of $N$ readings has spread $\sigma/\sqrt N$.
- **F points:** (1) $(\Delta X)^2 = \langle X^2\rangle - \langle X\rangle^2 \ge 0$. (2) $\mathrm{Var}(\bar X) = \sigma^2/N$. (3) For a spin, $(\Delta S_z)^2 = \hbar^2 p(1-p)$.
- **Equations:** $(\Delta X)^2 = \langle X^2\rangle - \langle X\rangle^2,\quad \Delta\bar X = \sigma/\sqrt N$
- **Trap:** forgetting the $N^2$: variances scale as $1/N$, so the spread as $1/\sqrt N$, not $1/N$ (`f5MeanSD100`).

### `f5-surprise`
- **G points:** (1) Information is measured in bits: one yes/no question. (2) $N$ equally likely outcomes carry $\log_2 N$ bits. (3) $H = -\sum_x P(x)\log_2 P(x)$. (4) A sure outcome carries 0 bits.
- **F points:** (1) $H = -\sum_x P(x)\log_2 P(x)$ (Bergou §11.1). (2) $h(p)$ peaks at 1 for $p = \tfrac12$. (3) $H$ is largest for the uniform distribution.
- **Equations:** $H = -\sum_x P(x)\log_2 P(x),\quad h(p) = -p\log_2 p - (1-p)\log_2(1-p)$
- **Trap:** thinking a certain event carries information: $H = 0$ when $p = 1$ (`f5HSure`).

## 7. Symbol-before-use tables

Reading order: units in order; inside a unit, beats (L → B → C, reveals in place), then Try it, review, challenges.
Abbreviations pr, av, sp, su. Status: OK · **FLAG**. Carried from F2: the inner product $\langle a|\psi\rangle$ and the
Born rule $P = |\langle a|\psi\rangle|^2$. From F1: $\log$, powers. Spin symbols ($S_z$, $\hbar$, $|{+}n\rangle$, $\theta$)
appear only in the [B] bridge beats, defined there as Chapter Q3's.

### 7.1 Ground track
| Symbol | First use | Defined at | Status | Note |
|---|---|---|---|---|
| $\Omega$, outcomes | pr:b1 | pr:b1 | OK | Tag `qc-sample-space`; "the list". |
| $P(x)$ | pr:b1 | pr:b1 | OK | Tag `qc-probability`. |
| $\sum_x P(x) = 1$ | pr:b2 | pr:b2 | OK | — |
| $P(A \cap B)$ | pr:b3 | pr:b3 ("and") | OK | Tag `qc-independent`. |
| $\theta$, $\cos^2(\theta/2)$ | pr:b4 | pr:b4; F2 (Born) | OK | Spin bridge; $\theta$ is Q3's. |
| $\langle X\rangle$, $\mu$ | av:b1 | av:b1 | OK | Tag `qc-expectation`; Rosetta $E[X] = \mu$. |
| $S_z$, $\hbar$, $p$ | av:b3 | av:b3; Q3 | OK | Bridge beat; $S = \sigma/2$. |
| $(\Delta X)^2$, $\langle X^2\rangle$ | sp:b1 | sp:b1 | OK | Tag `qc-variance`. |
| $\sigma$, $\Delta X$ | sp:b2 | sp:b2 | OK | Tag `qc-standard-deviation`. |
| $N$, $Np$, $Np(1-p)$ | sp:b3 | sp:b3 | OK | Binomial moments. |
| $\bar X$, $\sigma/\sqrt N$ | sp:b4 | sp:b4 | OK | The sample mean. |
| $H$, bit | su:b1 | su:b1 | OK | Tag `qc-shannon-entropy`; "bit" = information bit. |
| $h(p)$ | su:b2 | su:b2 | OK | Tag `qc-binary-entropy`. |

### 7.2 Formal track
| Symbol | First use | Defined at | Status | Note |
|---|---|---|---|---|
| $f_n(x)$ | pr:b2 | pr:b2 | OK | Observed frequency. |
| $E[X]$, $\mu$ (Rosetta) | av:b1 cap | av:b1 | OK | Only in the Rosetta caption. |
| $\mathrm{Var}(X)$, $\sigma^2$ | sp:b1 | sp:b1 | OK | Same as $(\Delta X)^2$. |
| $\mathrm{Var}(\bar X) = \sigma^2/N$ | sp:b4 | sp:b4 (D4) | OK | — |
| $\log_2$, bits | su:b1 | su:b1; F1 | OK | — |
| bit (info) vs F7's logic bit | su:b1 | su:b1 note | **FLAG** | Stated in place; distinct concept, no shared gloss id (§12 Q3). |

**Counts:** no Ground FLAG; 1 Formal FLAG (information-bit vs logic-bit, resolved by naming in place). No symbol is used
before its defining beat within a unit.

## 8. Errata

**No `Correction` in the mathematics of Bergou §3.3, §11.1, §11.3 or notes pp. 14–16.** Every statement used — the
expectation, the variance short-cut, the binomial moments, $\sigma/\sqrt N$, the Shannon and binary entropies — was
re-checked (§ Evidence) and holds. Items for the record:

| # | Where | Finding | Action |
|---|---|---|---|
| F5-E1 | Trim vs map | The map's F5 has five units ending in joint distributions and mutual information. The brief trims to four (probability, expectation, spread, surprise); the joint/correlator unit is deferred though `marginals`/`correlatorC` exist. | Four units; §12 Q1 asks whether to restore the joint unit. |
| F5-E2 | `qc-dispersion` (Q3) vs `qc-variance` (F5) | Q3's dispersion $(\Delta A)^2 = \langle A^2\rangle - \langle A\rangle^2$ is the same quantity as F5's variance. | F5 owns the ground-up `qc-variance`; the wiring pass links Q3's `qc-dispersion`. §12 Q4. |
| F5-E3 | "bit" | The information bit (F5, $H = 1$) and F7's logic bit (a binary digit) are different concepts that would collide on a shared id. | Separate: no `qc-bit` gloss in F5; "information bit" named inline. §12 Q3. |
| F5-E4 | Spin numbers | The spin bridge beats (av:b3, sp:b5) reuse Q3's $p = \cos^2(\theta/2)$, $\langle S_z\rangle$, $\Delta S_z$ at $\theta = 60^\circ$, matching Q3's claims exactly; F5 derives them from $\sum M_\alpha P_\alpha$, not the operator. | Keep; the numbers agree with Q3 (`q3AvgSz`, `q3Var`). |

## 9. Engine gaps and stage-contract gaps

### 9.1 Engine
**No new functions.** Every number comes from `physics/qc/info.ts`: `mean(xs, p)`, `variance(xs, p)`,
`binomialMoments(N, p)`, `shannon(p)`, `binaryEntropy(p)`. The spin bridge values reuse Q3's `cos²`/`spin.ketFromBloch`
route. numpy twin: explicit sums over outcomes, `np.log2`, closed forms (`scratchpad/f456plan-numpy.py`, block "F5").

| Claim group | Engine route | numpy route |
|---|---|---|
| expectation | `mean(xs, p)` | `np.sum(xs * p)` |
| variance, SD | `variance(xs, p)` | `np.sum(p * (xs - mean)**2)` |
| binomial moments | `binomialMoments(N, p)` | `N*p`, `N*p*(1-p)` |
| Shannon / binary entropy | `shannon(p)`, `binaryEntropy(p)` | `-np.sum(p * np.log2(p))` (0·log0 = 0) |
| spin bridge ($\langle S_z\rangle$, $\Delta S_z$) | `mean`/`variance` on $(\pm\tfrac12, [p, 1-p])$ | closed form $\tfrac12(2p-1)$, $\sqrt{p(1-p)}$ |

**Note (no gap):** `info.marginals` and `info.correlatorC` exist and would serve a joint/correlator unit; the trim
leaves them unused in F5 (§12 Q1). Mutual information $I = H(X) + H(Y) - H(X, Y)$ needs no new function — it is three
`shannon` calls — should the joint unit be restored.

### 9.2 Stage contract
**NEW kind `distribution` (SVG; needs: distribution; skill `10-stage-kind`).** This is the re-map's planned `plot` kind
(`qc709-remap.md` ruling 7: "an SVG `plot` kind, so curve-shaped derivations get a real view"), specialised to classical
probability bars/histograms. It is the one new kind F4/F5/F6 require. Proposed state (content writes inputs only;
`resolve.ts` computes mean/variance/entropy with the `info` module):

```ts
type DistData =
  | { coin: Scrub }                               // two bars: p, 1 − p
  | { die: number }                               // `die` equal bars (fair)
  | { binomial: { N: number; p: Scrub } }         // the N + 1 counts, via binomialMoments for the markers
  | { outcomes: { x: string; p: Scrub }[] }       // named outcomes with chances
interface DistributionState {
  kind: 'distribution'
  data: DistData
  mean?: boolean                                  // a vertical line at ⟨X⟩ (info.mean; numeric outcomes only)
  spread?: boolean                                // a ±σ band about the mean (info.variance); needs `mean`
  entropy?: boolean                               // a Shannon-H readout (info.shannon)
  shift?: number                                  // slide the mean line (net-payoff beats)
  highlight?: number[]                            // outline named outcome(s)
  shot?: 'D-FLAT'
}
```
- **Passport:** "DISTRIBUTION · chances over outcomes"; note "not a place · bar height = chance"; axes "outcome",
  "probability"; no phase legend.
- **Fidelity keys:** `qc-dist-engine` (every bar, mean, band and $H$ from `info`), `qc-dist-height-is-chance`,
  `qc-dist-bars-sum-one`, `qc-dist-not-a-space`.
- **Validation:** `die` a whole number 2–20; `binomial.N` 1–200; every `p` in $[0, 1]$; `outcomes` ≤ 20 and summing to
  1 (checked at $s = 0, 0.5, 1$ for a sweep); `spread` requires `mean`; `mean`/`spread` require numeric outcomes
  (`coin`/`die`/`binomial`/numeric `x`).
- **Print figure:** the bar chart is the print figure (ink bars, the mean line and band as rules).

**`amplitudes` (probability mode; existing, no new fields).** The Born-rule bridge beats (pr:b4, av:b3, sp:b5) use
`amplitudes` in `mode:'probability'` with `labels:'spin'`; `spread:true` on those beats is the `amplitudes` readout, not
a new field — if it is not present, the spread goes in the caption.

**`lab-r3` (existing, no new fields).** The law-of-averages beats (pr:b2, D1; sp:b4, D4) use `tallies` and `sigmaBand`,
already in `LabState`.

**Fallback if `distribution` slips past the F5 build** (beat stages; derivations keep ≥ 2 distinct views):
| Beat group | Fallback |
|---|---|
| `dist` with ≤ 8 named outcomes (coin, die as a ket-less bar set) | `amplitudes` `mode:'probability'` from a uniform/named source, with the mean/variance/H in the caption |
| `dist({binomial:…})` | an SVG sparkline from `binomialMoments`, or the histogram in the opener film only; the beat carries the mean/σ in the caption |
| `dist({…, entropy:true})` | the $H$ value in the caption beside the bars |

### 9.3 Widget gaps (deferred under the cap; §3 specs are the target)
`distribution` widget modes `'build'` (drag bars, renormalize), `'mean'` (load a die, watch the mean), `'binomial'`
(sliders $N$, $p$), `'entropy'` (slide the bias, watch $h$). All reuse the `info` module.

## 10. Media

### 10.1 Blender opener (Part F top flange, shared)
The Part F opener (planned in F1 §10) plays before `f5-probability`; no F5-specific Blender asset.

### 10.2 Motion Canvas film (each drawn number named from the engine; the manifest lists them for `films.test.ts`)
**`qc-f5-galton` "A Galton board: averages sharpen as $1/\sqrt N$"** (opener of `f5-spread`, ~22 s):
1. Balls drop through a peg triangle; the pile builds a Binomial histogram (`binomialMoments(N, 0.5)`).
2. Overlay the mean $N/2$ and the ±σ band $\sqrt{N/4}$ (`f5BinMean`, `f5BinSD`) at $N = 100$: mean $50$, $\sigma = 5$.
3. The sample-mean band narrows as $\sigma/\sqrt N$ as more balls fall (`f5MeanSD100` = $0.171$ for the die analogue).
4. End card: the relative width $\sigma/\text{mean}$ shrinking with $N$.
Manifest: `f5BinMean`, `f5BinVar`, `f5BinSD`, `f5MeanSD100`.

### 10.3 Higgsfield decor (atmosphere only; no text, numbers or diagrams; user approves credits)
Grains of sand settling into a smooth heap on a dark bench — a pile forming, no scale, no ticks.

## 11. Hooks

### 11.1 Concept-map stations (`qc709/concepts.ts`, `QcConcept`)
| id | label | chapter · unit | needs | cross-course (448) |
|---|---|---|---|---|
| `qc-f5-probability` | Probabilities over a list of outcomes | F5 · `f5-probability` | — | links `born-rule` |
| `qc-f5-average` | Expectation: the number you expect | F5 · `f5-average` | `qc-f5-probability` | twin of `average` |
| `qc-f5-spread` | Variance and the $1/\sqrt N$ law | F5 · `f5-spread` | `qc-f5-average` | twin of `spread` (Q3) |
| `qc-f5-surprise` | Information in bits: Shannon entropy | F5 · `f5-surprise` | `qc-f5-probability` | — |

Cross-course edges use the proposed `twins448?`/`links448?` fields (F1 §11.1); neither is a prerequisite.

### 11.2 Arcade: one level per unit (`arcade/games.ts`; `wrong` is a 0-based step index)
Label constant: `const F5x = (unit, label) => ({ lecture: 'F5', unit, label })`. All four are Spot the error.
1. **`f5-probability` · `qc-add-independent`** — "Two sixes"
   - Steps: "A die is rolled twice." · "The chance of a six is $\tfrac16$ each time." · "The chance of two sixes adds them: $\tfrac16 + \tfrac16 = \tfrac13$." · "So two sixes happen a third of the time."
   - `wrong: 2`. Why: independent chances multiply: $\tfrac16 \times \tfrac16 = \tfrac1{36}$ (`f5TwoSix`).
2. **`f5-average` · `qc-mean-is-outcome`** — "The expected face"
   - Steps: "A fair die's faces are 1 to 6." · "Its expectation is $3.5$." · "An expectation is a possible reading." · "So some roll must show $3.5$."
   - `wrong: 2`. Why: $\langle X\rangle$ is a balance point, not an outcome; no face is $3.5$ (`f5DieMean`).
3. **`f5-spread` · `qc-spread-over-N`** — "Averaging many readings"
   - Steps: "One reading has $\sigma = 2$." · "Average $100$ of them." · "Variances add, so the mean's spread is $\sigma/N = 0.02$." · "So the average is pinned to $0.02$."
   - `wrong: 2`. Why: the spread falls as $\sigma/\sqrt N = 0.2$, not $\sigma/N$ (`f5MeanSD100` analogue).
4. **`f5-surprise` · `qc-sure-informative`** — "A certain flip"
   - Steps: "A trick coin always lands heads." · "Each flip still has two possible faces." · "So each flip carries $\log_2 2 = 1$ bit." · "A hundred flips carry $100$ bits."
   - `wrong: 2`. Why: with $P(\text{heads}) = 1$, $H = 0$: a certain outcome carries no information (`f5HSure`).

## 12. Questions for the judge

**Q1. Trim: keep the joint/correlator unit?** The map's F5 has a fifth unit (`f5-joint`: marginals, the correlator
$\langle XY\rangle$, the Bell marginal problem); its engine (`info.marginals`, `info.correlatorC`) exists. The brief
calls F5 "the trimmed probability chapter (probability, expectation, variance)", so this plan cuts it; Q10 teaches CHSH
inline. *Ask:* leave `f5-joint` deferred (my plan; F5 stays short), or restore it as a fifth unit so correlators have a
ground-up owner before Q10? *Recommend:* defer; add it in a later pass if Q10's wiring wants a bridge target.

**Q2. HW1 P1/P3.** The map flags these (which plug HW1's $|{+}n\rangle$ into $\langle S_z\rangle$/$\Delta S_z$) as
submitted. F5's story uses the generic $\theta = 60^\circ$ example, never HW1's specific angle; the one touching item
`f5-sp-spin` is hints-only. *Ask:* keep hints-only until the user says HW1 is past? *Recommend:* yes.

**Q3. The information bit vs F7's logic bit.** F5 introduces the information bit ($H = 1$ for a fair coin); the deferred
F7 owns the logic bit (a binary digit). They are different concepts. *Ask:* keep them as separate glossary ids
(`qc-shannon-entropy` carries "bit" inline in F5; F7 gets its own `qc-bit`), or one shared entry? *Recommend:*
separate; a shared id would conflate information with storage.

**Q4. `qc-dispersion` (Q3) vs `qc-variance` (F5).** Same quantity, two ids. *Ask:* F5 owns `qc-variance` ground-up and
the wiring pass links Q3's `qc-dispersion` (my plan), or rename one? *Recommend:* keep both ids, bridge them; renaming
touches built Q3 text.

**Q5. The `distribution` stage kind.** F5 needs one new SVG kind (§9.2), the re-map's planned `plot` kind. It is small
(one resolver case over the `info` module, one print figure) and F8 (histograms) and any later statistics reuse it.
*Ask:* build `distribution` with/just before F5 (my recommendation), or ship F5 on the `amplitudes`/caption fallback
first? *Recommend:* build it; the fallback loses the binomial histogram and the mean/σ band that `f5-spread` is about.
