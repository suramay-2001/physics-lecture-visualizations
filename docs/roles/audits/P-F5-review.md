# P review: 709 F5 "Chance with numbers" (main af4663e, reviewed 2026-10-07)

Reviewer: independent P verifier (read-only; not the builder). Skill: `skills/06-chapter-review/SKILL.md`.

## Verdict
**FIX-FIRST** (3 blocking, 8 should-fix, 6 nits, plus 2 builder's-language questions).
- **Numbers are right:** all 35 `V` keys, the 16 challenge keys and every hint and walkthrough number check out by an exact-fraction and explicit-enumeration route (item list below). There are no matching slips in `f5.py`.
- **Blocking:**
  - None of the 12 Try-it lines can be done: `deposit-stats` ignores every prop F5 passes (item 1).
  - The 8-bar `|+++⟩` stand-in reads "12.5 %" under captions that say "a fair die … each chance 1/6" and "six equal bars" (item 2).
  - The two-sixes reveal says adding gives "a chance above 1/3". Adding gives exactly 1/3 (item 3).
- **Must-check outcomes:**
  - Sums to 1, both variance formulas and Var ≥ 0, and independence are right.
  - Joint/marginal tables, correlation and conditional probability are absent. That is the accepted plan §12 Q1 trim, so it is not a defect.
  - The ⟨A⟩ = Tr(ρA) link is missing, even though Bergou states it on the page F5 should cite (item 6).
  - Bergou §3.3 is "Bell Inequalities", and §11.3 does not define h(p) (item 4). The Shannon entropy log base (2) is stated and right.
  - No amplitude is shown as a percentage: probability mode draws and reads only |a|², as "%".

## Evidence summary
- **`revF5F6-f5.py`** (scratchpad): 35/35 keys of `claims-qc709/f5.json` agree to 1e-9 with my route, with 0 mismatches. My route:
  - `Fraction` arithmetic for the die, so μ = 7/2, ⟨X²⟩ = 91/6 and Var = 35/12.
  - Explicit enumeration of {H,T}², {H,T}³ and 36 dice pairs.
  - Explicit binomial pmf sums: N = 100 gives σ = 5; N = 20, p = ½ gives 10 and 2.236 (the Try-it's "2.24" is right).
  - `math.log(q, 2)`, giving H(die) = 2.58496 and h(0.75) = 0.81128.
  - The spin bridge: ⟨S_z⟩ = 0.25, (ΔS_z)² = 0.1875 = p(1−p), ΔS_z = 0.4330.
  - The relative width σ/mean = 1/√(Np/(1−p)) checks.
  - Every challenge passes at its tolerance with the 3-d.p. answer (1.708, 2.585, 0.811).
- **Extra checks:**
  - The best yes/no scheme for one fair die (Huffman) averages 8/3 = 2.667 questions, not 2.585 (item 7).
  - The `|+++⟩` bars are 1/8 each.
  - `twoWay(p)` reproduces p exactly: 2.8 %, 16.7 %, 50 %, 75 %, 90 %, 100 %.
- **Vitest:** `npx vitest run src/content/claims.test.ts src/content/content.test.tsx src/widgets/visualSpecs.test.tsx src/content/qc709 -t "F5|F6|f5|f6"`: 140 passed, 0 failed. The widget gate only checks "mounts without NaN", so it cannot see item 1.
- **Sources read:**
  - Bergou (offsets from `P-709-map.md` (d)-E1: ch. 3 = PDF − 13, ch. 5 = −11, ch. 11 = −7; page heads confirmed):
    - §3.3 pp. 33–37 (PDF 46–50)
    - §3.8 p. 55 (PDF 68, Eq. 3.71)
    - §5.2 pp. 80–81 (PDF 91–92, Eqs. 5.9–5.10)
    - §11.1 pp. 190–191 (PDF 197–198, Eq. 11.3)
    - §11.3 pp. 193–194 (PDF 200–201)
  - Revised notes n3 pp. 14–15 and n4 pp. 18–19.
  - HW: no F5 item touches HW1/HW2, and there is no HW3 lookalike (the θ = 60° example is generic).
- **Widgets and stages:** read from source; no screenshots, no Playwright (per the brief).
  - `widgets/DepositStats.tsx`: props `state`, `axis`, `seed`; fire buttons +10/+100/+1000/+10000; readouts "expected Np ± σ", observed, z, 95 % band and the fraction in %.
  - `stage/svg/amplitudes.ts` + `AmplitudesScene.tsx`: probability-mode bars are labelled `|000⟩…`, with readouts `P(000) = 12.5 %` …
  - The `lab-r3` σ band is `2·binomialStd(n,p)/n` (`resolve.ts:181`).

## Blocking
1. **None of the 12 Try-it lines can be done on the widget that ships.** The Q11–Q13 and F2 precedent makes this Blocking.
   - **What the widget does:** `DepositStats` reads only `state`, `axis` and `seed`. F5 passes `{mode:'probability-build', outcomes:3}`, `{mode:'mean-die', die:6}`, `{mode:'binomial', n:20, p:0.5}` and `{mode:'entropy', coin:0.5}`, all of which are silently dropped. So every unit shows the default: |+z⟩ read at 60°, P = 0.7500, with fire buttons.
   - **What fails:**
     - There are no bars to drag or build (unit 1).
     - There is no die, mean or face to load (unit 2).
     - The widget's p is 0.75, not 0.5, and N moves only in steps of 10/100/1000/10000. At N = 20 it reads "15.0 ± 1.9", not "mean 10, σ = 2.24", and σ/√N for the mean is never shown (unit 3).
     - There is no slider and no H readout (unit 4).
   - **Fix:** in `F5.ts` `visual` (lines 90–93, 156–159, 223–226, 289–292), either build plan §9.3's `distribution` widget, or rewrite against widgets that exist:
     - **probability:** `{kind:'deposit-stats', props:{state:'+x', axis:'z', seed:709}}`. Try: "Fire +1000: every atom lands in one of the two piles, and the up fraction settles near 50 %."
     - **spread:** the same props. Try:
       - "Fire +10 twice (N = 20): expected 10.0 ± 2.2."
       - "Fire to N = 100: 50.0 ± 5.0; the band is 40–60, a smaller share of N."
       - "Fire +10000: the fraction's spread shrinks like 1/√N."
     - **average and surprise:** `{kind:'amplitude-bars', props:{state:[60,0], basis:'z'}}`. Try:
       - "θ = 60°: P(+z) = 75 %, so ⟨S_z⟩ = ½(0.75 − 0.25) = 0.25ħ."
       - "θ = 90°: 50/50, a fair coin, H = 1 bit."
       - "θ = 0°: 100 %, a sure outcome, H = 0."
2. **The die is drawn as eight 12.5 % bars under captions that say six bars at 1/6.**
   - **The defect:** `manyWay()` = `amp({ket:'+++'})` draws eight bars labelled |000⟩…|111⟩, each reading "12.5 %" in the bar label and the readout column. The file header (`F5.story.ts:22–26`) promises "the caption never claims the picture shows six", but:
     - probability:b1 caption: "a fair die: six outcomes, each chance $1/6$" (Formal: "$P(x) = 1/6$").
     - probability:b2 caption: "the six die chances add to 1".
     - surprise:b1 Ground derivation step 1, viewCaption "six equal bars".
     - spread:b4 ("100 fair flips: mean 50, spread 5") draws a flat 8-bar chart for a peaked binomial.
   - **Fix:**
     - Re-caption each `manyWay` beat as a stand-in, e.g. b1 "equally likely outcomes (8 shown, each 1/8); a die has 6, each 1/6"; b2 "every bar list adds to 1; heads settles near 0.5"; surprise:b1 step 1 "eight equal bars: $\log_2 8 = 3$ bits".
     - For spread:b4, drop the bar stage or use `amp(K('++'))` captioned "two flips: 0, 1, 1, 2 heads".
     - Alternatively, prepare a 6-term uniform state with an `amplitudes` circuit source.
3. **probability:b5 reveal, Ground (`F5.story.ts:203`): "Adding would even give a chance above $\tfrac13$ for a rarer event…".** Adding gives exactly 1/3, which is twice one six's 1/6.
   - *Fix:* "Adding would give $\tfrac13$, twice the chance of a single six, for an event that is rarer than one six."

## Should-fix
4. **The Bergou citations point at sections that do not contain the claim.**
   - **§3.3 (pp. 33–37) is "Bell Inequalities".** It has the hidden-variable joint distribution, Eq. 3.8's ⟨a₁b₁⟩ sum, CHSH, Tsirelson and the marginal problem. It has no sample space, no P(A∩B) = P(A)P(B), no variance, no binomial, no σ/√N and no law of large numbers. The word "variance" appears in Bergou only at §5.2.
   - **§11.3 (pp. 193–194) is joint/conditional entropy and mutual information.** The binary entropy h(x) is Eq. 3.71 in §3.8, p. 55.
   - **§11.1 is fine for Shannon.** Eq. 11.3 sits on pp. 190–191, with "the logarithm is base 2".
   - **Fix:**
     - Expectation and variance: cite "Bergou §5.2, p. 81, Eqs. 5.9–5.10" (⟨X⟩ = Σλ_j p_j = Tr(Xρ); σ² = ⟨X²⟩ − ⟨X⟩²).
     - Probability axioms, independence, the binomial and σ/√N: no Bergou source. Keep 'core' and cite Reif §1.2–1.6 (reference) or nothing.
     - h(p): cite "Bergou §3.8, p. 55, Eq. 3.71".
     - Shannon: "§11.1, pp. 190–191".
   - **Affected:**
     - `F5.ts` units 1–4 `lecture.pages` and `books`.
     - Every "(Bergou §3.3)" in `F5.story.ts` Formal text, plus the `refs` at spread:b4 and surprise:b2.
     - The `F5.glossary.ts` formal lines of `qc-sample-space`, `qc-probability`, `qc-independent`, `qc-variance` and `qc-binary-entropy`.
     - The `F5.review.ts` formal points.
   - Precedent: P-Q11 item 4.
5. **The notes pages do not match the REVISED notes.**
   - ⟨M⟩ = Σ M_α P_α and P_α = |⟨α|ψ⟩|² are on **p. 15** (n3), not p. 14.
   - The moments and the dispersion ⟨A²⟩ − ⟨A⟩² are on **pp. 18–19** (n4), not "p. 15" or "pp. 15–16".
   - Affected:
     - `F5.ts` units 1–3 `lecture.pages` and the `lecture` refs.
     - Story: probability:b2 F "(notes p. 14)", average:b1 F "p. 14", average:b3 `refs`, spread:b1 F "p. 15" and spread:b5 `refs`.
     - `qc-variance.formal`.
6. **The quantum-average link ⟨A⟩ = Tr(ρA) is missing** (a must-check). Bergou Eq. 5.9 states ⟨X⟩ = Σ λ_j p_j = Tr(Xρ) on the page F5 should cite.
   - *Fix:*
     - average:b3 Formal: add "$\sum_\alpha M_\alpha P_\alpha = \langle\psi|M|\psi\rangle = \mathrm{Tr}(\rho M)$ (Bergou §5.2, Eq. 5.9)".
     - spread:b5 Formal: add "Eq. 5.10".
7. **"H is the number of yes/no questions" is stated as exact.**
   - Shannon's bound is H ≤ L̄ < H + 1, and L̄ = H only for dyadic chances or over long runs. One fair die needs 8/3 = 2.667 questions on average, not 2.585.
   - *Fix:*
     - surprise:b1 Ground derivation step 2: "needs about $\log_2 N$ questions per reading, averaged over many readings".
     - Formal: "the fewest yes/no questions per outcome, on average over long runs".
     - The same edit goes in `qc-shannon-entropy.gloss` and the review formal point 1.
8. **Ground-track symbols are used before they are defined.**
   - $P(x)$ first appears in Ground at average:b1. probability:b1 Ground names "probability" but never writes $P(x)$.
   - spread:b3 Ground uses $\sigma$, but b2 Ground names only $\Delta X$.
   - probability:b4 Ground uses $\theta$ and $\mathbf n$ with no definition.
   - The `symbols` table (`F5.ts:32–74`) points all 37 symbols at outcome sentences that define none of them (θ, ħ, |+n⟩, M_α …).
   - *Fix:*
     - Add "written $P(x)$" to probability:b1 G.
     - Add "written $\sigma$" to spread:b2 G.
     - Add "$\theta$ is the angle between $\mathbf n$ and $z$" to probability:b4 G.
     - Point those symbols at those beats.
9. **probability:b2 Formal derivation, step 2 (independence), uses the single-magnet `lab` view.** One coin cannot show a product. *Fix:* swap the views: step 1 (normalization and f_n → P) → `lab`, step 2 → `amp(K('++'))`.
10. **surprise:b3 clue picture contradicts its question.** The prompt says the coin "always lands heads" and the caption says "a sure flip", but the stage is `twoWay(0.9)`, reading 90.0 % / 10.0 %. *Fix:* use `twoWay(1)`, or caption "a 90 % coin; now make it sure".
11. **spread:b3 caption number is not in the picture.** The caption says "for the die at N=100, 0.171". The drawn band is the ±1 coin's, half-width 2·5/100 = 0.10 at N = 100. *Fix:* caption "the coin's band halves for every 4× atoms; a die's mean at N = 100 would spread 0.171", or drop the die number from this caption.

## Nits
12. `F5.glossary.ts` header says F5 makes "no `Beat.introduces` claim" on `qc-expectation`, but `average:b1` has `introduces: ['qc-expectation']`. The ruling allows it, so fix the comment.
13. "Most counts land within a few of 50" (spread:b4 G, and the `f5-s-binomial` walkthrough) is loose when σ = 5. Say "within about 5 of 50, roughly two times in three".
14. Review card `f5-spread` Ground point 2 writes "$\sigma = \sqrt{\mathrm{Var}}$", but Var is a Formal-only symbol.
15. probability:b3 Formal says "the product of the two marginals", but "marginal" is never defined (the joint unit was deferred). Say "the product of the two single-coin chances".
16. spread:b1 Formal step 2 `why` derives "≥ 0" from "mean of squares minus square of mean". The reason is the first form ⟨(X − μ)²⟩, an average of squares.
17. average:b1 Ground step 1 (the "average n readings" step) shows `twoWay(1/6)` captioned "one value's own chance", which does not illustrate the step. The `lab` fractions view would.

## Builder's-language questions
- F5 reuses Q3's `qc-expectation` for a classical die. Its hover gloss reads "the average of many readings of copies of one state" and its Formal is ⟨ψ|M|ψ⟩. Should F5 get a classical wording through a wiring-pass `bridge`, or keep the quantum gloss?
- Classical coins and dice are drawn with ket labels (|0⟩, |000⟩) in a probability chapter. That is acceptable as a stand-in until the `distribution` kind (plan §9.2) lands. Should the captions name the mapping once (e.g. "bar |0⟩ = heads")?

## Checked and right
- **Probability:** P(even) = 0.5, P(HH) = 0.25, the four outcomes sum to 1, P(≥ 1 H in 3) = 0.875, two sixes = 1/36 versus the disjoint-union 1/3, and the Born p = cos²30° = 0.75 by the F2 inner-product route.
- **Expectation:** the fair die gives 3.5, ⟨2X+1⟩ = 8 by linearity, the biased payoff is 0.6, the game net is +0.5 (break-even price 3.5), and ⟨X+Y⟩ is additive even for dependent X, Y.
- **Spread:** Var = 35/12 = 2.917, both formulas agree, and ⟨X²⟩ = 15.167, ⟨X⟩² = 12.25, σ = 1.708. Binomial(100, ½) gives 50/25/5, σ/√100 = 0.171, and σ/√64 = 0.25 for σ = 2.
- **Spin bridge:** p(1−p)ħ² = 0.1875ħ², 0.433ħ. Zero variance holds only at p ∈ {0, 1}, with the maximum ¼ at ½.
- **Entropy:** H(coin) = 1, H(die) = log₂6 = 2.585, h(0.75) = 0.811, H(sure) = 0 with 0 log 0 = 0, and the maximum of h is at ½. The choice key is right and its distractor whys are true.
- **Derivations:** each has ≥ 2 distinct views per track. The notation beats introduce their terms (`qc-sample-space` space; `qc-probability`, `qc-variance`, `qc-shannon-entropy` notation).
- **Bridges** `qc-f2-inner-product`, `qc-l1-average`, `qc-l4-average` and `qc-l7-spreads` resolve to the named units.
- **Glossary:** no glossary id duplicates another chapter's. `qc-variance` versus Q3's `qc-dispersion` is ruled (plan F5-E2 / §12 Q4).
- **Housekeeping:** no raw TeX outside $…$ and no plan ids in learner text (spot-read every beat).
