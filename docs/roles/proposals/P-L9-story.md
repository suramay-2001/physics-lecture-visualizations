# P-L9 — Lecture 9 story plan: composite quantum systems

Role P, proposal only (nothing under `app/` touched). One track (448), skill-03 section list, compressed like
`P-L8-story.md`. Chapter by topic (judge ruling 1): **L9 notes §§9.4–9.9 only** (pp. 7–14). L9's BB84 part (§§9.1–9.3,
pp. 3–6) is taught in `P-L8-story.md` units `l8-attack` and `l8-test`. Entanglement's measurement consequences (local
operators, ⟨σ_A⟩ = 0, correlations, GHZ) are L10's.

**Sources read.** `sources/L9/text.md` pp. 1–14 (p.5 rendered: one boxed sentence, no figure); Susskind & Friedman
Lecture 6 §§6.1–6.7 (`sources/susskind/chapter006.md`; the epub has no page numbers, the notes cite printed pp. 149–167),
§§6.8–6.9 read only to fix the L9/L10 boundary; `sources/L10/text.md` p.1 (its plan starts at local observables). 709's
built F6 (`f6-pairs` … `f6-growth`) and Q6 (`q6-many`, `q6-entangled`) read for overlap and links.

**Evidence.** Every number was computed twice: `plan448-engine.ts` (app engine incl. `physics/qc/state.ts` `kron`, `bell`,
`coefMatrix`, `isProduct`, `schmidtRank`, `paramCount`, `randomState`, `cmat.detN`) and an independent `plan448-numpy.py`
(reshape-and-det, random complex Gaussians). They agree (scratchpad `plan448/`).

**Rosetta (one line each, at first use).**
- |u⟩ ≡ |+z⟩, |d⟩ ≡ |−z⟩ (the notes' and Susskind's); in the engine u = qubit 0, d = 1, Alice = qubit 0 (`ket('01')` = |ud⟩).
- Bob's prepared state: notes' |ϕ⟩_B → **|ψ_B⟩** (φ is the app's azimuth/turn letter); Alice's is |ψ_A⟩; amplitudes α_u, α_d,
  β_u, β_d as in the notes; joint amplitudes ψ_ab; joint state |Ψ⟩.
- The no-factor proof (p.13) writes coefficients a, b, c, d, reusing d as the label of |d⟩: the app writes α_u, α_d, β_u, β_d.
- In the coin story σ_A, σ_B are **numbers** (±1 painted on a coin), not Pauli matrices: said in the caption of `l9-classical:b1`.

## 0. Chapter map

| # | id | Title (≤ 8 words) | Question | Notes | Susskind (§) / 709 chip |
|---|---|---|---|---|---|
| 1 | `l9-tensor` | Two systems need one new space | What state space describes two systems at once? | p.7 §9.4 | §6.1; chip → F6 `f6-pairs` |
| 2 | `l9-classical` | Correlation without anything quantum | Can two coins be correlated with nothing quantum going on? | p.8 §9.5 | §6.2 |
| 3 | `l9-two-spins` | Two spins: four basis states | What basis describes two spin-½ particles together? | p.9 §9.6 | §§6.3–6.4 |
| 4 | `l9-product` | Independent preparations give product states | What state does a pair have when each part is prepared alone? | p.10 §9.7 | §6.5; chip → F6 `f6-kron` |
| 5 | `l9-counting` | Counting parameters: six is more than four | Does every pair state come from two separate preparations? | p.11 §9.8 | §§6.6–6.7; chip → F6 `f6-growth` |
| 6 | `l9-singlet` | The singlet: a pair with no separate states | Which state of two spins cannot be split into two? | pp.11–13 §§9.8–9.9 | §6.7; chips → Q6 `q6-entangled`, F6 `f6-product-or-not`, Q9 `q9-schmidt` |

**Class marker.** This chapter starts mid-class: `l9-tensor:b1` carries **"Class 9 · from minute 23"** with the note
"its first 23 minutes finished BB84: Units 8.7–8.8" (schema field `Beat.classMark {class, from}`, P-L8 §9.4 S1). The chapter
ends where class 9 ended (the exit check); class 10 starts the next chapter.
**Outcomes.** Build H_A ⊗ H_B and count its dimension · tell classical correlation from independence · write and use the
four-state basis |uu⟩ … |dd⟩ · expand a product state and see why its normalization is automatic · count 4 vs 6 real
parameters · prove the singlet does not factor, and factor a state that does.
**Prerequisites (concept ids).** `vector-space`, `inner-product`, `probability`, `expectation`, `bloch-sphere`, `born-rule`.
**Ownership.** New to the course (no 448 lecture teaches pairs). 709 F6/Q6 teach the same ideas in their own notation (|00⟩,
coefficient matrix): "go further" chips only, never re-taught. L9's notes forbid tensor-product matrices, Hamiltonians and
angular-momentum addition today; the plan uses none (the grid below is a table of amplitudes, Susskind's Fig. 6.1, not a
Kronecker matrix). L10 owns local operators and "nothing is known about each spin" (L10 p.1 plan); `l9-singlet:b5` forwards to it.
**Beats.** 6 + 6 + 6 + 6 + 7 + 8 = **39** (6 clues, 2 Go-deeper). Media: none.

## 1. Story beats

`grid(s)` = the new `pair-grid` SVG kind (§9.2 G1) with `frame:'spin'` unless stated; `pair(a, b)` = `{pair:[a, b]}` (two 448
directions); `fam(t)` = `{family:'ud-du', tDeg:t}` = cos t|ud⟩ − sin t|du⟩ (t = 45° is the singlet); `sing` = `{bell:'01-10'}`;
`uni` = `{named:'uniform'}` = ½(|uu⟩ + |ud⟩ + |du⟩ + |dd⟩). P60 = {θ 60°, φ 0}. Claim keys `l9…`. Phases [L] [B] [C] [D].

### Unit `l9-tensor` (p.7) — **"Class 9 · from minute 23"** on b1
- **b1 [L].** "Until now every state described one system. Real objects are made of parts: an atom of an electron and a nucleus, a
  processor of many qubits. What space describes the whole?" · Stage `grid({frame:'coin-die', cells:'labels'})` · no number.
- **b2 [L].** "Alice's system has state space H_A, Bob's has H_B. A ket of one cannot be added to a ket of the other: they live in
  different spaces. The pair lives in a new space, H_AB = H_A ⊗ H_B." · `introduces:['composite-space']` · Stage b1's ·
  Cap "⊗: the tensor product of the two spaces".
- **b3 [L].** "Let Alice hold a photon, |H⟩ or |V⟩, and Bob a quantum die with faces |1⟩ to |6⟩. The pair gets one basis state for each
  pair of labels, such as |H4⟩ = |H⟩_A ⊗ |4⟩_B." · Stage `grid({frame:'coin-die', cells:'labels', highlight:['H4']})`.
- **b4 [L].** "Count the boxes: two rows times six columns is 12 basis states. In general dim(H_A ⊗ H_B) = N_A N_B: dimensions
  multiply, they do not add." · Stage b3's + `readouts:['dims']` · Claims `l9DimCoinDie` 2·6 = 12; `l9DimSpins` 2·2 = 4.
- **b5 [B] Susskind §6.1.2, Fig. 6.1.** "Susskind draws this very table: Alice's labels down the side, Bob's across the top, one combined
  state per box. He even gives Alice's kets a different bracket, so nobody adds them to Bob's." · Stage b3's.
- **b6 [C].** Q: "The label |H4⟩ has two parts. Is it two states side by side?" · Reveal: "No. It is one state of the pair, whose label
  records what each part shows. The tensor product builds a new space; it does not multiply two states into a number." · Stage b3's.
  Chip "go further in 709 → F6 `f6-pairs`".

### Unit `l9-classical` (p.8)
- **b1 [L].** "Charlie has a penny and a dime. He gives Alice one coin and Bob the other at random, and they part without looking. Score a
  penny +1 and a dime −1." · Stage `grid({classical:{joint:'charlie'}, cells:'chances'})` · Cap "here σ_A and σ_B are just the numbers on
  the coins · P(+1, −1) = P(−1, +1) = ½" · Claims `l9CharlieP` ½.
- **b2 [L].** "Over many trials ⟨σ_A⟩ = ⟨σ_B⟩ = 0. But the coins always differ, so ⟨σ_Aσ_B⟩ = −1, and the correlation
  ⟨σ_Aσ_B⟩ − ⟨σ_A⟩⟨σ_B⟩ is −1, not 0." · Stage b1's + `readouts:['means']` · Claims `l9CoinMeanA` 0 (`marginals`), `l9CoinAB` −1
  (`correlatorC`), `l9CoinCorr` −1 (`covariancePM`, §9.1 E2).
- **b3 [L] derivation D1.** "Independence means the joint chances factor: P(a, b) = P_A(a)P_B(b). Then ⟨ab⟩ = ⟨a⟩⟨b⟩, and the
  correlation is zero." · Stage `grid({classical:{joint:'independent', pA:0.7, pB:0.4}, cells:'chances', readouts:['means']})` ·
  Cap "P_A(+1) = 0.7, P_B(+1) = 0.4: ⟨ab⟩ = ⟨a⟩⟨b⟩ = −0.08" · Claims `l9Biased` −0.08 both ways.
- **b4 [L].** "Nothing strange happened. Charlie made the correlation while the coins were together, and each coin was definite all
  along. Alice's ignorance is only about who got which." · Stage b1's.
- **b5 [B] Susskind §6.2.** "Susskind's point: classical probability is incomplete knowledge of something that could be known. Knowing
  everything about a classical whole means knowing everything about each part. Quantum pairs will break that." · Stage b1's.
- **b6 [C].** Q: "Two dealers who never meet each hand out one coin at random. What is the correlation now?" · Stage
  `grid({classical:{joint:'independent', pA:0.5, pB:0.5}, cells:'chances'})` · Reveal: "Zero. Every pair of coins has chance ¼, the
  table factors, and ⟨σ_Aσ_B⟩ = 0 = ⟨σ_A⟩⟨σ_B⟩." · Reveal stage + `readouts:['means']` · Claims `l9IndepAB` 0.

### Unit `l9-two-spins` (p.9)
- **b1 [L].** "Now swap the coin and die for two spins. Write |u⟩ for |+z⟩ and |d⟩ for |−z⟩. Each spin has two dimensions, so the pair
  has 2 × 2 = 4." · `introduces:['two-spin-basis']` · Stage `grid({cells:'labels'})` · Claims `l9DimSpins` 4.
- **b2 [L].** "The pair's z-basis is |uu⟩, |ud⟩, |du⟩, |dd⟩. The first letter is always Alice's, the second Bob's: |du⟩ = |d⟩_A ⊗ |u⟩_B." ·
  Stage `grid({cells:'labels', highlight:['du']})`.
- **b3 [L].** "The four are orthonormal: ⟨ab|a′b′⟩ = δ_aa′ δ_bb′, so both letters must match. ⟨ud|ud⟩ = 1, but ⟨ud|du⟩ = 0." · Stage
  `grid({cells:'labels', highlight:['ud','du']})` · Claims `l9UdUd` 1, `l9UdDu` 0 (`inner(ket('01'), ket('10'))`).
- **b4 [L].** "With an orthonormal basis any combination is allowed: |Ψ⟩ = ψ_uu|uu⟩ + ψ_ud|ud⟩ + ψ_du|du⟩ + ψ_dd|dd⟩. One
  four-dimensional state describes the pair, not two separate kets." · Stage `grid({state:uni, cells:'amplitudes'})` · Cap "here every
  ψ_ab = ½" · Claims `l9UniNorm` 1.
- **b5 [B] Susskind §§6.3–6.4.** "Susskind calls Bob's spin τ so it never mixes with Alice's σ. He asks you to read each pair label ab as a
  single index: one state, one box." · Stage b3's.
- **b6 [C].** Q: "Are |ud⟩ and |du⟩ the same state?" · Reveal: "No. In |ud⟩ Alice is up and Bob down; in |du⟩ it is the other way round.
  They are orthogonal." · Stage `grid({cells:'labels', highlight:['ud','du']})` · Claims `l9UdDu` 0.

### Unit `l9-product` (p.10) — signature "amplitude grid": a column times a row
- **b1 [L].** "Let Alice prepare |ψ_A⟩ = α_u|u⟩ + α_d|d⟩ and Bob, separately, |ψ_B⟩ = β_u|u⟩ + β_d|d⟩, each normalized. The pair's
  state is |ψ_A⟩ ⊗ |ψ_B⟩." · Stage `grid({state:pair(P60,'+x'), factors:true, cells:'amplitudes'})` · Cap "the notes write |ϕ⟩_B;
  here |ψ_B⟩" · Claims `l9AliceAmps` (0.866, 0.500), `l9BobAmps` (0.707, 0.707).
- **b2 [L] derivation D2.** "Multiply out term by term. Each joint amplitude is one of Alice's times one of Bob's: ψ_uu = α_uβ_u,
  ψ_ud = α_uβ_d, ψ_du = α_dβ_u, ψ_dd = α_dβ_d." · Stage b1's · Cap "0.612, 0.612, 0.354, 0.354" · Claims `l9ProdCoefs` (kron).
- **b3 [L].** "So the four amplitudes are not four free choices: two small states made them all. In the grid, Alice's column times Bob's
  row fills every box." · Stage `grid({state:pair({thetaDeg:sweep(0,180), phiDeg:0},'+x'), factors:true})` · Cap "the second row is the
  first, rescaled" · Claims `l9ProdIsProduct` isProduct(kron(…)).
- **b4 [L] derivation D3.** "Normalization comes free. The four chances add to (|α_u|² + |α_d|²)(|β_u|² + |β_d|²) = 1 · 1 = 1, so no new
  condition is needed." · Stage b1's with `cells:'chances', readouts:['norm']` · Claims `l9ProdNorm` 1.
- **b5 [L].** "Two uses of the word product: the tensor-product space H_A ⊗ H_B holds every state of the pair, and a product state is one
  special vector in it. A product state means truly independent preparations." · Stage b1's.
- **b6 [C].** Q: "Turning Alice's state changes every box of the grid. Does it change anything Bob can measure?" · Stage
  `grid({state:pair({thetaDeg:sweep(0,180), phiDeg:0},'+x'), factors:true, cells:'chances', readouts:['marginals']})` · Reveal: "No.
  Bob's chance of u is |α_u β_u|² + |α_d β_u|² = |β_u|², whatever Alice did. His predictions are those of |ψ_B⟩." · Claims
  `l9BobPu` 0.5 for θ_A ∈ {0°, 60°, 120°, 180°} (`marginal`, physics/qc/measure.ts). Chip "go further in 709 → F6 `f6-kron`".

### Unit `l9-counting` (p.11)
- **b1 [L].** "The rules allow every normalized vector of the four-dimensional space, not only products. The general state has four
  amplitudes ψ_ab with |ψ_uu|² + |ψ_ud|² + |ψ_du|² + |ψ_dd|² = 1." · Stage `grid({state:fam(30), cells:'amplitudes', readouts:['norm']})` ·
  Claims `l9Fam30Norm` 1.
- **b2 [L].** "Count real numbers. One spin has two complex amplitudes, four reals. Normalization removes one and the overall phase
  another, leaving 2, the two Bloch angles." · Stage `grid({state:pair(P60,'+x'), factors:true, readouts:['params']})` · Claims
  `l9ParamsOne` paramCount(1).general = 2.
- **b3 [L] derivation D4.** "Two independent spins need 2 + 2 = 4. A general pair state has eight reals, minus one normalization and one
  phase: 6. Six is more than four." · Stage b2's · Claims `l9Params` paramCount(2) = {general 6, product 4}.
- **b4 [L].** "So some states of the pair cannot be written |ψ_A⟩ ⊗ |ψ_B⟩. They are called entangled states." · Stage `grid({state:sing,
  cells:'amplitudes', readouts:['params']})`.
- **b5 [B] Susskind §§6.6–6.7.** "Susskind counts the product state from both factors: eight reals, minus two normalizations and two
  phases, is four. He adds that entanglement has degrees: one pair state can be more entangled than another." · Stage
  `grid({state:fam(sweep(0,45)), cells:'amplitudes'})`.
- **b6 [C].** Q: "A product state and a general state both have four amplitudes. Why do they count differently?" · Reveal: "A product's
  four come from two pairs, α and β, and must obey their pattern. The general four are free, up to normalization and phase." · Stage
  b2's.
- **b7 [D] Go deeper (beyond the notes).** "Products form a thin four-parameter surface inside a six-parameter space. Pick a pair state
  at random and it is almost never a product: of 20 000 seeded random states, none was." · Stage `grid({state:fam(sweep(0,45)),
  readouts:['product']})` · Claims `l9RandomProducts` 0 (engine, seed 709; numpy independently 0 of its own 20 000). Chip → F6 `f6-growth`
  (n spins: 2n against 2·2ⁿ − 2).

### Unit `l9-singlet` (pp.11–13) — signature "amplitude grid": the anti-diagonal and the live determinant
- **b1 [L].** "Susskind's central example is the singlet, |sing⟩ = (|ud⟩ − |du⟩)/√2. It is a perfectly good normalized state of the
  pair." · Stage `grid({state:sing, cells:'amplitudes', readouts:['norm']})` · Cap "two boxes off the diagonal: +0.707 at ud,
  −0.707 at du" · Claims `l9SingCoefs` (0, 0.707, −0.707, 0); `l9SingNorm` 1.
- **b2 [L].** "Yet no product of an Alice state and a Bob state equals it. The pair has a definite state while neither spin has a
  state vector of its own." · Stage b1's · Claims `l9SingNotProduct` isProduct(sing) = false.
- **b3 [L] derivation D5 (notes p.13).** "Suppose it did factor. Matching the four amplitudes needs α_uβ_u = 0, α_uβ_d = 1/√2,
  α_dβ_u = −1/√2 and α_dβ_d = 0. The second forces α_u ≠ 0, so the first forces β_u = 0, and then the third fails." · Stage
  `grid({state:sing, highlight:['ud']})` · Claims `l9SingAmps` as b1.
- **b4 [L].** "That is the new feature: we can know the pair's state exactly with no state for each member. Lecture 10 asks what
  measurements on such a pair predict." · Stage b1's · Forward link to L10 (448 → 448, plain chapter link).
- **b5 [B] Susskind §6.7 and Exercise 6.3.** "Susskind calls the singlet maximally entangled, as entangled as a pair can be, and leaves
  the no-factor proof as an exercise. What that means for each spin alone is Lecture 10's question." · Stage b1's.
- **b6 [C] (the notes' exit check).** Q: "Does ½(|uu⟩ + |ud⟩ + |du⟩ + |dd⟩) split into one state for Alice and one for Bob? Try to factor it instead of counting terms." ·
  Stage `grid({state:uni, cells:'amplitudes'})` · Reveal: "Yes. It is (|u⟩ + |d⟩)/√2 for Alice times (|u⟩ + |d⟩)/√2 for Bob: |+x⟩ twice.
  Many terms do not make a state entangled." · Reveal stage `grid({state:pair('+x','+x'), factors:true})` · Claims `l9ExitPlusPlus`
  samePhysicalState(uni, kron(+x,+x)); `l9ExitProduct` true.
- **b7 [C].** Q: "Flip one sign: ½(|uu⟩ + |ud⟩ + |du⟩ − |dd⟩). Product or not?" · Stage `grid({state:{named:'flip'}, cells:'amplitudes'})` ·
  Reveal: "Not. Equal α_uβ_u and α_uβ_d force β_u = β_d; equal α_uβ_u and α_dβ_u force α_u = α_d. Then α_dβ_d would be +½, never −½." ·
  Claims `l9FlipProduct` false.
- **b8 [D] Go deeper (beyond the notes).** "A quick test: a pair state is a product exactly when ψ_uuψ_dd − ψ_udψ_du = 0. The singlet gives
  ½, the most any state can reach. Along cos t|ud⟩ − sin t|du⟩ the test value grows from 0 to ½." · Stage `grid({state:fam(sweep(0,45)),
  cells:'amplitudes', readouts:['det','product']})` · Cap "t = 15°: 0.250 · 30°: 0.433 · 45° (singlet): 0.500" · Claims `l9Det15` 0.25,
  `l9Det30` 0.4330, `l9SingDet` 0.5, `l9ProdDet` 0 (kron), `l9DetMax` worst |det| over 20 000 random states ≤ 0.5 (0.4998).
  Chips → F6 `f6-product-or-not` (the same test as a rank), Q9 `q9-schmidt` (degrees of entanglement), Q6 `q6-entangled`.

## 2. Derivations (one track: `ground` only; P-L8 §9.4 S3)
| id | Result | Steps (one-sentence `why` each) | Views (kinds on the unit's stage) |
|---|---|---|---|
| D1 `l9-classical:b3` | ⟨ab⟩ = ⟨a⟩⟨b⟩ | ⟨ab⟩ = Σ ab P(a,b) · independence: P(a,b) = P_A(a)P_B(b) · the double sum splits into two single sums · each sum is a mean | grid independent (0.7, 0.4) means → grid independent (0.5, 0.5) |
| D2 `l9-product:b2` | ψ_ab = α_aβ_b | write both factors · ⊗ distributes over sums · collect the four basis kets · read off each amplitude | grid pair(P60, +x) labels → amplitudes with factors |
| D3 `l9-product:b4` | ⟨Ψ|Ψ⟩ = 1 | add the four |α_aβ_b|² · group the u terms and the d terms of Alice · factor out (|β_u|² + |β_d|²) · each bracket is 1 | grid chances → grid chances + norm |
| D4 `l9-counting:b3` | 6 > 4 | one spin: 4 − 1 − 1 = 2 · two independent spins: 2 + 2 = 4 · general: 8 − 1 − 1 = 6 · 6 > 4, so not every state is a product | grid pair + params → grid singlet + params |
| D5 `l9-singlet:b3` | the singlet is not a product | assume a product · match four amplitudes · α_uβ_d ≠ 0 gives α_u ≠ 0 · α_uβ_u = 0 gives β_u = 0 · then α_dβ_u = 0 ≠ −1/√2 | grid singlet highlight ud → uu → du |

## 3. Try-it per unit (one new lazy widget, `pair-grid`, §9.3 W4; all other props existing)
| Unit | `visual` | Try this |
|---|---|---|
| tensor | `{kind:'pair-grid', props:{frame:'coin-die'}}` | 1. Count the boxes (12). · 2. Find |V3⟩: row V, column 3. · 3. Switch to two spins: 4 boxes. |
| classical | `{kind:'pair-grid', props:{mode:'classical', dealer:'charlie'}}` | 1. Read ⟨a⟩, ⟨b⟩, ⟨ab⟩ (0, 0, −1). · 2. Two dealers, p_A = 0.7, p_B = 0.4: ⟨ab⟩ = −0.08 = ⟨a⟩⟨b⟩. · 3. Try to make two separate dealers correlated (you cannot). |
| two-spins | `{kind:'pair-grid', props:{frame:'spin', alice:[0,0], bob:[180,0]}}` | 1. One box lights: |ud⟩. · 2. Flip both spins: |du⟩. · 3. Which box is "Alice down, Bob up"? |
| product | `{kind:'pair-grid', props:{frame:'spin', alice:[60,0], bob:[90,0]}}` | 1. Read 0.612, 0.612, 0.354, 0.354. · 2. Drag Alice's θ: Bob's column totals stay 0.5. · 3. The chances always total 1. |
| counting | `{kind:'pair-grid', props:{frame:'spin', preset:'family', t:0}}` | 1. t = 0: one box, |ud⟩, a product. · 2. t = 45°: the singlet. · 3. In product mode, can any slider setting reach the singlet? (No.) |
| singlet | `{kind:'pair-grid', props:{frame:'spin', preset:'family', t:45, showDet:true}}` | 1. Test value 0.5. · 2. Product mode: always 0. · 3. Build the exit-check state: Alice |+x⟩, Bob |+x⟩ (θ = 90°, φ = 0 both). |

## 4. Challenges (no homework exists for L9; the exit check is used with its walkthrough)
- `l9-te-dim` · warm-up · numeric · **12** — "Basis states of photon ⊗ die?" / one per label pair · rows × columns · 2 · 6.
- `l9-te-dim3` · core · numeric · **18** — "A three-state system with a die: dimension?" / dimensions multiply · 3 · 6.
- `l9-te-one` · core · choice — "|H4⟩ is…" ✓ one state of the pair · ✗ two states · ✗ a product of numbers · ✗ a superposition of H and 4.
- `l9-cl-ab` · warm-up · numeric · **−1** — "Charlie's coins: ⟨σ_Aσ_B⟩?" / always opposite.
- `l9-cl-indep` · core · numeric · **0** — "Two separate fair dealers: correlation?" / factorized table.
- `l9-cl-biased` · stretch · numeric · **−0.08** — "Independent coins, P_A(+1) = 0.7, P_B(+1) = 0.4: ⟨ab⟩?" / ⟨a⟩ = 0.4, ⟨b⟩ = −0.2 · product.
- `l9-ts-overlap` · warm-up · numeric · **0** — "⟨ud|du⟩?" / both letters must match.
- `l9-ts-count` · warm-up · numeric · **4** — "How many basis states for two spins?"
- `l9-ts-label` · core · choice — "Alice down, Bob up is…" ✓ |du⟩ · ✗ |ud⟩ · ✗ |dd⟩ · ✗ |uu⟩.
- `l9-pr-amp` · core · numeric · **0.354** (tol 0.001; ψ_du of kron(P60, +x)) — "Alice θ = 60°, Bob |+x⟩: ψ_du?" / α_d β_u · 0.5 · 0.707.
- `l9-pr-norm` · core · numeric · **1** — "Sum of the four chances of any product state?"
- `l9-pr-words` · core · choice — "H_A ⊗ H_B versus a product state" ✓ a space versus one kind of vector in it · ✗ the same thing · ✗ reversed · ✗ both are numbers.
- `l9-co-one` · warm-up · numeric · **2** — "Real parameters of one spin state?"
- `l9-co-gen` · core · numeric · **6** (`paramCount(2).general`) — "Real parameters of a general two-spin state?"
- `l9-co-why` · stretch · order — steps: "Four complex amplitudes: eight reals" · "Normalization removes one" · "The overall phase removes one" · "Six remain, more than the four of two separate spins".
- `l9-si-exit` · core · choice (the notes' exit check) — "½(|uu⟩ + |ud⟩ + |du⟩ + |dd⟩) is…" ✓ a product, |+x⟩ ⊗ |+x⟩ · ✗ entangled, four terms · ✗ the singlet · ✗ not normalized; walkthrough = `l9-singlet:b6` reveal.
- `l9-si-proof` · core · order — the five D5 steps.
- `l9-si-flip` · stretch · choice — "½(|uu⟩ + |ud⟩ + |du⟩ − |dd⟩)" ✓ entangled (`isProduct` false) with the b7 reasoning.

## 5. Glossary (448 `glossary.ts`, unprefixed; "twin" = a 709 entry exists → R5 promotes, never a copy)
New: `composite-system` (l9-tensor:b1) · `two-spin-basis` "|uu⟩, |ud⟩, |du⟩, |dd⟩" introduces 'notation' (l9-two-spins:b1) ·
`statistical-correlation` "⟨ab⟩ − ⟨a⟩⟨b⟩" (l9-classical:b2; uses expectation) · `independent-systems` "joint chances factor"
(l9-classical:b3; uses joint-probability) · `parameter-count` "real parameters" (l9-counting:b2; uses normalized, global-phase).
Twins (promote, R5): `composite-space` "H_A ⊗ H_B" introduces 'space' (qc-composite-space "joint space") · `tensor-product` "⊗"
(qc-tensor-product) · `product-state` (qc-product-state) · `entangled` (qc-entangled) · `singlet` (qc-singlet) · `product-test`
(qc-factoring-test; Go-deeper only). Reused: dimension, basis, orthonormal-basis, kronecker-delta, normalized, amplitude, superposition,
joint-probability, probability, expectation, global-phase, state-space, hilbert-space, ket, spin-half, bloch-sphere, photon (L8).

## 6. Review cards
- **tensor** — H_AB = H_A ⊗ H_B · one basis state per label pair · dims multiply: 2 · 6 = 12 · `$$\dim(\mathcal H_A\otimes\mathcal H_B) = N_AN_B$$` · Trap: adding dimensions (8).
- **classical** — correlation needs no quantum mechanics · Charlie's coins: −1 · independence ⇒ P factors ⇒ ⟨ab⟩ = ⟨a⟩⟨b⟩ · Trap: "correlated, so quantum".
- **two-spins** — |uu⟩, |ud⟩, |du⟩, |dd⟩, Alice first · ⟨ab|a′b′⟩ = δ_aa′δ_bb′ · any combination allowed · Trap: |ud⟩ = |du⟩.
- **product** — ψ_ab = α_aβ_b · normalization automatic · Bob's chances ignore Alice · Trap: tensor-product space = product state.
- **counting** — one spin 2, two separate spins 4, general pair 6 · so non-products exist: entangled · `$$8 - 1 - 1 = 6 > 2 + 2$$` · Trap: "four amplitudes either way".
- **singlet** — (|ud⟩ − |du⟩)/√2 is normalized and does not factor · the proof by matching amplitudes · ½(uu+ud+du+dd) does factor · Trap: counting terms.

## 7. Symbols before use
H_A, H_B, ⊗, H_AB (tensor:b2) · |H⟩_A, |4⟩_B, |H4⟩ (b3) · N_A, N_B, dim (b4) · σ_A, σ_B (numbers; classical:b1) · ⟨·⟩, a, b, P(a,b),
P_A, P_B (b2–b3) · |u⟩, |d⟩ (two-spins:b1) · |uu⟩ … |dd⟩ (b2) · δ (b3; L4 gloss `kronecker-delta`) · ψ_ab, |Ψ⟩ (b4) · |ψ_A⟩, |ψ_B⟩, α_u,
α_d, β_u, β_d (product:b1) · |sing⟩ (singlet:b1) · t (singlet:b8 and counting:b5 stage only). **Flags:** σ_A here is a number (caption);
the proof's a, b, c, d renamed (Rosetta); |ϕ⟩_B renamed.

## 8. Errata and hazards
No mathematical error found (every step re-done in both scripts; the proof's logic is sound). Notation fixes: d as coefficient and label
(p.13); |ϕ⟩_B vs the app's φ; σ for coin numbers and, from L10, Pauli operators. Susskind's brace bracket |a} for Alice is described,
not adopted. Naming: Susskind's dealer "Charlie" (L9) and the GHZ player Charlie (L10, ruling 7) are different people (R8).

## 9. Gaps
**9.1 Engine.** Almost all exists in `physics/qc` (shared per ruling 5): `kron`, `bell('01-10')`, `coefMatrix`, `isProduct`, `schmidtRank`,
`paramCount`, `randomState`, `measure.marginal`, `info.marginals`, `info.correlatorC`, `cmat.detN`. New, small, with numpy twins in
`make_fixtures.py` "lecture9": E1 `qc/state.ts` `pairDet(ψ)` = detN(coefMatrix(ψ)) and `udFamily(t)` = cos t|ud⟩ − sin t|du⟩;
`namedPair('uniform'|'flip')`. E2 `qc/info.ts` `covariancePM(pxy)` = correlatorC − (px₀ − px₁)(py₀ − py₁), and `classicalPair('charlie'
| {pA, pB})` → the 2×2 joint table. L9's values file therefore imports physics/qc: the chunk-rule change of P-L8 §9.4 S5 is a
prerequisite.
**9.2 Stage contract — G1 new SVG kind `pair-grid`** (448-owned, lazy, its scene also prints; the L9 signature "amplitude grid"):
```
{ kind: 'pair-grid'
  frame: 'spin' | 'coin-die'                      // rows = Alice's labels (u, d | H, V); columns = Bob's (u, d | 1…6)
  cells?: 'labels' | 'amplitudes' | 'chances'     // coin-die: labels only (validated)
  state?: { pair: [Dir, Dir] } | { bell: string } | { family: 'ud-du'; tDeg: Scrub } | { named: 'uniform' | 'flip' }
  classical?: { joint: 'charlie' } | { joint: 'independent'; pA: Scrub; pB: Scrub }   // a P(a, b) table instead of a state
  factors?: boolean                               // pair only: α_u, α_d down the left, β_u, β_d across the top
  highlight?: string[]                            // 'ud', 'H4', …
  readouts?: ('dims' | 'norm' | 'params' | 'marginals' | 'means' | 'det' | 'product')[]
  shot?: 'G-TABLE' }
```
Cells: fill = |ψ_ab| (or the chance), hue = phase, value printed exact where `snap` finds one; `det` prints ψ_uuψ_dd − ψ_udψ_du (only in
[D] beats); `product` prints "product" / "not a product" from `isProduct`; `params` prints "4 of 6"; `means` (classical) ⟨a⟩, ⟨b⟩, ⟨ab⟩ and
the correlation. Validation: `state` xor `classical`; `factors` needs `pair`; coin-die forbids state. Anchors `cell, row-a, col-b,
factor-a, factor-b, readout`. Passport "STATE SPACE · two spins, H_A ⊗ H_B" (coin-die: "BASIS LABELS · photon ⊗ die"; classical: "CHANCES ·
two coins"), note "not a place · one box per pair of labels". Fidelity (448 key `pair-grid`): exact (each box is ⟨ab|Ψ⟩ from the engine);
schematic (hue stands for phase); misleading ("a grid is not two separate states: only a product's grid is a column times a row";
"the classical table holds chances, not amplitudes"). Rejected alternative: extending 709's `matrix` kind (`coef` + `svd`) — it would need
u/d labels, two new sources, factor strips, a det readout and a non-square label grid, all inside a kind 709 chapters depend on.
**9.3 Widget — W4 `pair-grid`** (new, lazy; draws the G1 scene from controls, the ComplexPlaneQc pattern): `{mode?:'quantum'|'classical',
frame?:'spin'|'coin-die', alice?:[θ,φ], bob?:[θ,φ], preset?:'product'|'family', t?, dealer?:'charlie'|'independent', pA?, pB?, showDet?}`.
**9.4 Platform** (shared with P-L8 §9.4): S1 `classMark`, S2 `'deeper'` phase, S3 one-track derivations, S4 448 → 709 bridges, S5 chunk rules.

## 10. Media
None. (Susskind's Fig. 6.1 table is drawn live by `pair-grid`; no film, no opener, no decor.)

## 11. Hooks
**Concepts.** `composite-space` (l9-tensor; needs vector-space) · `classical-correlation` (l9-classical; probability, expectation) ·
`two-spins` (l9-two-spins; composite-space, inner-product) · `product-states` (l9-product; two-spins) · `parameter-count` (l9-counting;
product-states, bloch-sphere) · `entanglement` (l9-singlet; parameter-count). 709 twins get `sameAs`: F6's joint-space station →
`composite-space`, Q6's entangled station → `entanglement` (W edit in `content/qc709/concepts.ts`).
**Arcade** (existing spot-the-error kind, one round per unit; corrections are engine claims): `dims-add` (2 + 6 = 8; it is 12) → l9-tensor ·
`correlated-so-quantum` (Charlie's −1 "proves" a quantum link) → l9-classical · `ud-is-du` → l9-two-spins · `normalize-the-product` (an
extra normalization step) → l9-product · `eight-parameters` (forgets normalization and phase) → l9-counting · `four-terms-entangled`
(the exit check) → l9-singlet. A "factor it" sprint (new kind) is deferred.

**Fidelity notes.** pair-grid as in G1; the coin-die table shows labels only (Bob's die has no physics here); the family slider t is an
authored path through states, not a time evolution.

## 12. Rulings requested
1. New SVG kind `pair-grid` (G1) plus widget W4, rather than extending 709's `matrix` kind?
2. Class marker "Class 9 · from minute 23" on `l9-tensor:b1` (same field as P-L8 R1)?
3. Rosetta: |ϕ⟩_B → |ψ_B⟩, the proof's a, b, c, d → α_u, α_d, β_u, β_d, and σ_A/σ_B captioned as coin numbers?
4. The determinant test and its live readout only in Go-deeper beats (`l9-singlet:b8`), never in the notes' own line?
5. Glossary twins (composite space, tensor product, product state, entangled state, singlet, product test): promote to shared ids (as P-L8 R5)?
6. L9 stops at "the pair has a state, the spins do not"; "nothing is known about each spin" stays with L10 (`l9-singlet:b5` only forwards)?
7. The classical coin table lives in the same `pair-grid` kind (`classical` mode, chances not amplitudes): acceptable?
8. Keep Susskind's dealer "Charlie" in L9 although L10's GHZ trio has a Charlie, or call him "the dealer"?
