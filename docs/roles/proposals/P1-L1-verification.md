# P1 — Lecture 1 physics verification (role P, part 1)

Scope: `app/src/content/L1.ts` checked against `sources/L1`, Susskind TM Ch. 1–2, Townsend 2E Ch. 1, Axler, Bergou, and the engine (`app/src/physics/spin.ts`, `sg.ts`). Proposal only; nothing under `app/` changed.

## 1. Issues in L1.ts

**Numbers verified (all correct):** every `answer` and `claims` value in L1.ts was recomputed independently (numpy): repeat-z = 1; z→x→z = 1/8; blocked at magnet 2 = 1/4; P(+) at 45° = (1+cos 45°)/2 = 0.85355 = cos²22.5°; 3:1 split at θ = 60.000°; ⟨σ⟩ at 45° = 0.7071; order-B "false" = 1/4; P(up|right) = 1/2; |β|² = 0.64. The engine treats the oven as `state = null` → 50/50 at the first device, i.e. a **mixture**, not a superposition (correct). The errata entry (`corrections[0]`) is correct. **No factually wrong number was found.** The issues below are wording, framing, and reference problems.

| # | Location (unit / challenge / field) | Problem | Proposed fix | Severity |
|---|---|---|---|---|
| 1 | `watch[2]` (3b1b) "the same cos² rule"; `l1-average.books[2]` "The same cos² law for photons" | Photons obey P = cos²θ with θ the **physical** polarizer angle; spin obeys cos²(θ/2). Orthogonal photon states sit 90° apart, orthogonal spin states 180° apart. Saying "the same" teaches the wrong 45° answer (photon 0.5 vs spin 0.854). | "The same **Born rule**, but for photons the probability is cos²θ of the physical angle, while spin uses cos²(θ/2). Orthogonal polarizations are 90° apart; orthogonal spins are 180° apart." | wrong |
| 2 | `l1-vectors.visual` tryThis "Place ψ at 45° … this is \|right⟩" (projector widget) | Unit 3 just used "45°" for a **physical** magnet tilt (P = 0.854). Here "45°" is a **Hilbert-space** angle, which is the 90° physical direction (P = 0.5). Same number, different space, with no label. | Say "Hilbert-space angle 45° (= physical direction 90°, the x axis)". Add fidelity note: Hilbert angle = ½ × physical/Bloch angle. | misleading |
| 3 | `l1-logic.insight` "The state space can't be a set with Boolean logic" | Stronger than what the experiment shows. The order effect proves that measurements **disturb** the state. It does not rule out every set-valued (hidden-variable) model: Bell (1966) built one that reproduces all single-spin-½ statistics. The lecture says only that Boolean logic "doesn't describe" quantum states and that "we will need a different logic". | "…so 'P or Q' is not a fixed fact that a test merely reads off. A set of pre-existing answers plus non-disturbing checks cannot reproduce this. That motivates vectors." | misleading |
| 4 | `l1-sequential.insight` "There is no hidden list of answers being read off" | Same overreach as #3 (it only excludes answers that are read without being disturbed). | "…no list of answers that measurement merely reads without disturbing." | misleading |
| 5 | `l1-l-assumption` option A `why`: "If the answers were already there, checking order couldn't matter." | Missing the non-disturbance premise. Hidden answers that the first check rewrites would still give order effects. | "If the answers were already there **and checking didn't change them**, order couldn't matter." | misleading |
| 6 | `l1-logic.books[1]` (sets) "union … commutative ($A\cup B = B\cup A$). That symmetry is what fails here." | In quantum logic the join (span) of subspaces is **still** commutative. What depends on order is the **test procedure** (sequential disturbing measurements). The formal failure is distributivity. Also the sets text does not state commutativity; it defines ∪/∩ in §1.1.3, and §1.2 is about functions. | "…(§1.1.3). Classically, testing A then B cannot change the state, so the truth of A∪B does not depend on the testing order. Here the test changes the state." Ref → "§1.1.3 Set operations". | misleading |
| 7 | `l1-average.lecture.summary` "the **average deflection** … is n̂·m̂"; `l1-a-errata.prompt` "the average deflection is N̂·M̂" | A deflection has units (mm), so it cannot equal the dimensionless n̂·m̂. The lecture says "on average deflect by about N·M", which is the average **reading**, with each spot scaled to ±1. | "the average of the ±1 readings (deflection in units of the single-spot deflection) is n̂·m̂". Keep the lecture's wording only inside quotation marks. | unclear |
| 8 | `l1-average.lecture.equations` ⟨σ_n⟩; `clues[0]` "outcomes are ±1"; `l1-a-avg` | Unit 1 states outcomes as ±ħ/2 (S_z). Unit 3 switches to ±1 and σ **without** defining σ or the link σ = 2S/ħ, which breaks symbol-before-use. | At the first use of σ, add: "Write each reading as σ = 2S/ħ = ±1 (Susskind's σ)." Set `unit: 'ħ/2'` (or "in units of ħ/2") on `l1-a-avg`. | notation |
| 9 | `l1-vectors.lecture.summary` "…equal parts of both … so \|right⟩ = (\|up⟩+\|down⟩)/√2" | Equal probabilities fix only \|α\| = \|β\| = 1/√2, not the relative phase. The lecture says "choosing the relative phase … conveniently". Leaving this out hides the fact that (\|up⟩ ± i\|down⟩)/√2 (±y) are also 50/50 in z, and it sets up L2 badly. | Add: "Equal probabilities fix only the magnitudes; the relative phase is a choice (it fixes which horizontal direction we call x)." | misleading |
| 10 | `l1-vectors.lecture.summary` "Up and down are two perfectly distinguishable states, so they form a basis" | Orthogonality alone does not make a basis. The dimension 2 comes from "exactly two outcomes", and Susskind ties that to "no hidden variables". | "…two outcomes → a 2-D space; perfectly distinguishable → orthogonal; so {\|up⟩, \|down⟩} is an orthonormal basis." | unclear |
| 11 | `l1-vectors.lecture.equations` / clues / `l1-v-*`: kets \|↑⟩ \|↓⟩ \|→⟩ \|←⟩ | Arrow glyphs inside kets suggest a literal arrow in 3-D space, the exact misconception the unit warns against (see `l1-v-left` option 2 `why`). | Use \|+z⟩, \|−z⟩, \|+x⟩, \|−x⟩ in equations (see §4), and show the lecture's \|up⟩/\|right⟩ once in the Rosetta. | notation |
| 12 | `l1-quantized` / `l1-sequential`: "oven beam" never defined | "Unpolarized" is used (`l1-s-zxz` walkthrough) with no gloss. Learners often picture the oven output as a superposition. The engine correctly treats it as a 50/50 **mixture**. | Glossary + one clue: "Unpolarized = each atom has a random, unknown spin state (a mixture). No axis passes 100 %. A superposition such as \|+x⟩ **is** passed 100 % by SG_x." Bergou §2.3 as the forward reference. | unclear |
| 13 | `l1-vectors.books[1]` (Axler) "The axioms **the notes list**" | L1 does not list the axioms. They are in **L2** p.1 (seven ket axioms). | "The axioms Lecture 2 lists…". Keep "§1B, 1.20 definition: vector space" (4e numbering; see §3). | unclear |
| 14 | `l1-quantized.lecture.summary` "shaped magnets whose field is stronger near one pole" | Correct, but it does not say that the **gradient** is what separates the beams. `books[2]` says it later. Also, for silver the moment is antiparallel to the spin (μ ∝ −S). Townsend puts the sharp tip on the lower N pole, so ∂B_z/∂z < 0 and a spin-up atom "conveniently" deflects **up** (pp. 4–5). The "up spot = +ħ/2" pairing is a convention. | Add a fidelity note: "Up-spot ↔ S_z = +ħ/2 depends on the sign of the field gradient. The electron's moment points opposite its spin." The lecture's "north end = spin direction" is a naming choice, not physics. | unclear |
| 15 | `l1-quantized.lecture.summary` / visual "two spots" | The real 1922 plate showed two smeared lips (range of speeds, field gradient strong only near the centre; Townsend Fig. 1.2 caption). | Fidelity note: "idealized: real deposit is two smeared lobes." | unclear |
| 16 | `l1-a-errata.walkthrough[2]` "The likely slip: 60° and 45° swapped." | A guess stated as a diagnosis. Another plausible origin: cos²30° = 3/4, i.e. using cos² of the full angle, as for photons (see #1). | "One possible slip: …". Or drop the sentence. | unclear |
| 17 | `l1-l-assumption` option B "That 'or' is commutative for numbers" | Category error ("or" is not an operation on numbers), so the distractor does not test anything. | "That 'A or B' and 'B or A' mean the same proposition". Its `why`: "They do as sentences. The difference comes from what the tests do to the atom." | unclear |
| 18 | `l1-average.books[1]` (reif §1.2–1.4) | Not in `sources/`, so it cannot be verified locally. | Mark as unverified, or add the source. | notation |
| 19 | `watch[0]`, `books` (mit805 "Lecture 3") | No local source, so not verified here. | Web check by the orchestrator. | notation |
| 20 | `l1-sequential.lecture.pages` "L1 pp. 3–4" + summary "a final z measurement is 50/50 again" | L1 pp. 3–4 contain only z→x and x→x. The z→x→**z** reset is stated on **p. 5** ("either way … another random result") and in the p. 8 sheet §6, "Measurement changes the state". p. 4 is the 45° material. | pages → "L1 pp. 3, 5, 8". | notation |
| 21 | `l1-average.lecture.summary` "measured along any other axis only the average" | This is the lecture's own wording (p. 4), but the theory predicts the full distribution P(±), not only the mean. | "…only the probabilities (and hence the average)". | unclear |

## 2. Known lecture errata re-check

| Erratum | Verdict | Evidence |
|---|---|---|
| (a) L1 p.4: "3/4 up-right, 1/4 down-left at 45°" | **Confirmed wrong** | The page image `sources/L1/pages/p04.png` shows both the 3/4 claim and, two sentences later, the rule "on average deflect by about N·M". With ±1 readings, 2P(+)−1 = cos θ, so P(+) = (1+cos 45°)/2 = **0.8536**. The 3/4 split needs cos θ = ½, i.e. **θ = 60°** (both computed numerically). Independent check: Townsend Problem 1.3 (printed p. 26) gives \|⟨+z\|+n⟩\|² = cos²(θ/2), and Susskind §1.3 gives an average of cos θ. The L1.ts `corrections[0]` text and its `check()` are correct. |
| (b) L4 p.10: "The theoretical mean is zero" for ψ = (√3/2)\|+z⟩ + (1/2)\|−z⟩ | **Confirmed wrong** | `sources/L4/text.md` lines 465–505. The same page first computes ⟨S_z⟩ = (+ħ/2)(3/4) + (−ħ/2)(1/4) = **ħ/4**. A few lines later, under "Specify the ensemble being averaged", it says the theoretical mean is zero, which contradicts itself. Numerically ⟨S_z⟩ = 0.25 ħ (⟨σ_z⟩ = 0.5). It reads like a leftover from a \|+x⟩ example. Fix: "The theoretical mean is ħ/4; a finite sample average will scatter around it." |
| (c) L4: the four principles are in "Chapter 4" of Susskind | **Confirmed wrong** | `sources/L4/text.md:72`. Susskind numbers his chapters as **Lectures**, and "Principle 1" through "Principle 4" appear in `chapter003.md` lines 433–457, under **§3.2 The Principles** of **Lecture 3**, "Principles of Quantum Mechanics". Lecture 4 is "Time and Change". Fix: "Susskind & Friedman, Lecture 3 (§3.2)". The L4 bibliography line "printed pp. 69–74" cannot be checked, because the local source is an EPUB with no page numbers. |

Additional lecture-level slips noticed (not in L1.ts; FYI for the errata ledger):
- L1 p.2 says a magnet's strength "is measured in Teslas". A magnetic **moment** is measured in J/T (A·m²); tesla is the unit of the **field**. L1.ts does not repeat this.
- L1 p.7 (sheet image) writes P(up) = α² and α² + β² = 1. That holds only for real amplitudes; the general rule is \|α\|². L1.ts correctly uses \|α\|².
- L1 p.8 (sheet image) defines Ŝ_z with eigenvalues ±1. That is σ_z, not S_z = (ħ/2)σ_z. The notation should be reconciled in L2/L3 (see §4).

## 3. Cross-source map for L1 units

Page offsets were verified by reading the pages: Townsend printed = PDF − 16; Axler printed = PDF − 14; Bergou printed = PDF − 15. Susskind is an EPUB, so it is cited by section only.

| Unit | Townsend 2E | Susskind TM | Axler LADR 4e | Bergou QIP |
|---|---|---|---|---|
| `l1-quantized` Two spots | §1.1, pp. 1–5 (F = ∇(μ·B), the classical continuum on p. 4, the silver moment = one electron and "spin-up deflects up" on p. 5); §1.2 Exp. 1, pp. 5–6, Fig. 1.3a | §1.2–1.3 | none | §1.1 The Qubit, p. 1 |
| `l1-sequential` New axis erases | §1.2 Exps. 2–3, pp. 5–6 (Fig. 1.3b,c); blocked "modified SG" filter, Fig. 1.5, p. 8; Exp. 4, pp. 8–9 | §1.3 (90° rotation: random, mean 0) + §1.4 | none | §5.2 Standard Quantum Measurements, p. 74 |
| `l1-average` Averages | §1.4, pp. 15–17 (expectation value, eqs. 1.19–1.21; Fig. 1.8; Examples 1.1–1.2); Problem 1.3, p. 26 (\|+n⟩) | §1.3 (Fig. 1.4, average n̂·m̂) | 6.1 dot product, p. 182 | §1.1 eq. (1.2), Bloch sphere, pp. 1–2 |
| `l1-logic` Order-dependent "or" | Nothing direct. Closest: p. 6 (S_z and S_x cannot both be known) | §1.5–1.7 (same die example as the lecture, in §1.5) | none | none |
| `l1-vectors` States are vectors | §1.3, pp. 10–13 (basis, superposition, ⟨−z\|+z⟩ = 0 from Exp. 1, bras, Born rule); §1.4, pp. 14–15 (\|+x⟩ with phases δ±, eqs. 1.16–1.18) | §1.9 (axioms, bras/kets, inner products, orthonormal bases) + §2.1–2.3 | 1.20 vector space, §1B p. 12 (†); 6.2 inner product, p. 183; 6.10 orthogonal, p. 187; 6.22 orthonormal, p. 197; 6.30 expanding a vector in an orthonormal basis, p. 200 | §1.1 eq. (1.1), p. 1 |
| (oven gloss, units 1–2) | p. 4 ("atoms from the oven are not polarized") | none | none | §2.1 Ensembles, p. 14; §2.3 Pure and Mixed States of a Qubit, p. 17 |

(†) The local Axler excerpt covers only 1.1–1.18 (PDF pp. 16–25), then jumps to Ch. 3. "1.20 definition: vector space, p. 12" follows 4e numbering but could not be checked against the local text.

What each source adds (one line each):
- **Townsend.** U1: the real apparatus, and the sign choice that makes spin-up deflect up (μ is antiparallel to S). U2: the blocked-path "modified SG" is exactly the app's `keep`. Exp. 4, where an unblocked SGx is recombined and 100 % come out +z, is the cleanest forward hook to "superposition ≠ 50/50 mixture". U3: formal ⟨S_z⟩ and ΔS_z, plus the general \|+n⟩ = cos(θ/2)\|+z⟩ + e^{iφ} sin(θ/2)\|−z⟩ (the same as `ketFromBloch`). U5: writes the phases δ± explicitly before choosing real coefficients.
- **Susskind.** U1: the apparatus reduced to its logic (±1 only, repeatable; flipping the apparatus swaps the signs). U2: the claim that any measurement strong enough to learn something disturbs something else. U3: states the n̂·m̂ average in these words. U4: the identical "A or B" vs "B or A" test giving 1/4, plus the "A and B" statement that cannot be confirmed. U5: the claim that a 2-D space means no hidden variables, the derivation of \|r⟩ and \|l⟩, and the "phase ambiguity".
- **Axler.** U3: n̂·m̂ is the ℝ³ dot product (6.1), which is not the state-space inner product (6.2). U5: the precise axioms, and 6.30, the fact that ⟨e_k\|v⟩ are the coordinates, i.e. ⟨up\|ψ⟩ = α.
- **Bergou.** U1/U5: names the object (the qubit) and uses the same Bloch parametrization as the engine. The oven gloss: a maximally mixed state has many decompositions (into z states or into x states), which is exactly why the first magnet's axis doesn't matter.

**Refs in L1.ts to change:**
1. `l1-logic.books[1]` sets "§1.1–1.2" → **§1.1.3 (Set operations)**. §1.2 is "Functions", and the text does not state commutativity.
2. `l1-vectors.books[1]` Axler: "the notes list" → "Lecture 2 lists" (see §1 #13). The number 1.20 is fine.
3. `l1-vectors.books[0]` Susskind "§2.2–2.3" is correct. Suggest "§1.9, §2.1–2.3" so it includes the bra/ket and inner-product interlude.
4. Townsend is absent from L1.ts. Add the rows above, since it is the course text.
5. All other Susskind and Bergou refs in L1.ts were checked and are correct.

## 4. Notation Rosetta

| Meaning | Lecture (L1) | Townsend 2E | Susskind TM | Bergou | **App (recommended)** |
|---|---|---|---|---|---|
| spin up / down along z | up/down, +z/−z, \|up⟩ \|down⟩ | \|+z⟩, \|−z⟩ | \|u⟩, \|d⟩ | \|0⟩, \|1⟩ | **\|+z⟩, \|−z⟩** |
| along x | right/left, +x/−x, \|right⟩ \|left⟩ | \|+x⟩, \|−x⟩ | \|r⟩, \|l⟩ | \|±x⟩ (§2.3, eq. 2.21) | **\|+x⟩, \|−x⟩** |
| along y | "into/out of the board", +y/−y | \|+y⟩, \|−y⟩ | \|i⟩, \|o⟩ (in/out of the page) | none | **\|+y⟩, \|−y⟩** |
| general axis | "direction M, N" | \|+n⟩ (Problem 1.3) | m̂, n̂ | Bloch (θ, φ) | **\|+n⟩; n̂, m̂** |
| measured quantity | "±1" (p. 3); Ŝ_z with eigenvalues ±1 (p. 8 sheet) | S_z = ±ħ/2 | σ_z = ±1 | σ_z | **S_n = ±ħ/2; "reading" σ_n = 2S_n/ħ = ±1** |
| amplitude pair | α, β (real in the p. 7 sheet) | c₊, c₋; ⟨±z\|ψ⟩ | α_u, α_d | α, β | **α = ⟨+z\|ψ⟩, β = ⟨−z\|ψ⟩, with \|α\|², \|β\|²** |

Phase conventions agree across all four sources and the engine: \|+x⟩ = (\|+z⟩ + \|−z⟩)/√2 and \|+y⟩ = (\|+z⟩ + i\|−z⟩)/√2 (Townsend eqs. 1.29–1.30; Susskind eq. 2.5 and eq. 2.10; Bergou eq. 1.2 with φ = 0, π/2; `KET` in `spin.ts`). Susskind's "in" is +y **provided** x points right and z points up in the page, which is a right-handed frame, and his axes are drawn in the page plane (§3.6). **No sign conflict was found.**

**Recommendation: \|±z⟩, \|±x⟩, \|±y⟩, \|±n⟩ with S = ±ħ/2.** Reasons:
1. It names the axis and the outcome, and it extends to any n̂.
2. It matches Townsend, L4 onward, and the engine keys (`KET['+z']`).
3. It has no arrow glyphs, so there is no "literal arrow" reading (§1 #11).
4. The sign reads directly as the result.

Keep the lecture's up/right words in prose, with a first-use gloss ("up = +z"). Introduce σ = 2S/ħ once, as "Susskind's σ, the reading in units of ħ/2" (§1 #8).

## 5. Townsend Fig. 1.10 and §1.5 — ±i and right-handed axes

**Townsend's argument (paraphrased; printed pp. 18–20, PDF 34–36):**
1. Experiment 5 replaces the last SGz of Experiment 3 with an SGy. By symmetry (which axis we call z is only a label), \|+y⟩ is 50/50 in z, and \|+x⟩ is 50/50 in y.
2. He writes \|+x⟩ and \|+y⟩ as equal-magnitude combinations of \|±z⟩, with relative phases δ and γ. He computes \|⟨+y\|+x⟩\|² = ½[1 + cos(δ − γ)] (eq. 1.28). Requiring ½ forces δ − γ = ±π/2.
3. He fixes δ = 0 (real \|+x⟩) by convention, justified later in Ch. 3. That leaves two candidates: γ = +π/2 gives (\|+z⟩ + i\|−z⟩)/√2, and γ = −π/2 gives (\|+z⟩ − i\|−z⟩)/√2.
4. No probability measurement can choose between them, because the six experiments never said whether the axes are right- or left-handed. The +i state is S_y = +ħ/2 in a **right-handed** frame. The −i state is S_y = −ħ/2 there. Reversing ŷ while keeping x̂ and ẑ fixed makes the frame left-handed and turns "down along y" into "up along y". That is **Fig. 1.10**: panels (a) and (b) show the same state with the y axis reversed.
5. His main point is that some amplitude must be complex. The ±i ambiguity is only the handedness label.

What fixes the choice formally is the angular-momentum algebra [S_x, S_y] = iħS_z (equivalently, rotations generated by e^{−iφS_n/ħ} obey the right-hand rule). A left-handed frame would need −iħ.

**Engine check.** Every item below was run in numpy against the same definitions as `spin.ts`.

| Check | Result |
|---|---|
| σ_y = [[0, −i], [i, 0]]; σ_y (1, i)/√2 = +(1, i)/√2 | pass: \|+y⟩ is the +1 eigenvector |
| [σ_x, σ_y] = 2iσ_z, i.e. [S_x, S_y] = iS_z with ħ = 1 | pass: right-handed algebra |
| R_z(90°)\|+x⟩ with R_z(φ) = diag(e^{−iφ/2}, e^{iφ/2}) = e^{−iφS_z} | = e^{−iπ/4}\|+y⟩, overlap 1.000. Pass: a counter-clockwise (right-hand-rule) turn about +z takes +x to +y |
| R_z(−90°)\|+x⟩ | overlap with \|+y⟩ = 0 (it is \|−y⟩). Pass |
| `rotation(ẑ, φ)` = cos(φ/2)I − i sin(φ/2)σ_z equals `Rz(φ)` | pass (identical closed form) |
| `ketFromBloch(π/2, π/2)` = (1, i)/√2, with φ measured from +x toward +y | pass; the same parametrization as Townsend Problem 1.3 and Bergou eq. 1.2 |
| 3-D mapping in `widgets/BlochSphere.tsx:24`, T(x, y, z) = (x, z, −y) into three.js (y-up, right-handed) | det = +1, a proper rotation. Physics +y is drawn **into** the screen, which matches the lecture's "into the board = +y" and Susskind's "in". Pass |

**Verdict:** \|+y⟩ = (1, i)/√2 together with R_z(φ) = diag(e^{−iφ/2}, e^{iφ/2}) is consistent with a right-handed frame, in the engine and in the one 3-D mapping found. `spin.test.ts:100` already covers this indirectly: it checks that R_z shifts an equatorial state's φ by +φ. Suggested addition: an explicitly named handedness test, `samePhysicalState(apply(Rz(π/2), KET['+x']), KET['+y'])`, plus a rule that any new scene mapping must have det = +1.

## 6. Top 5 fixes, prioritized

| Rank | Fix | Why first | Touches |
|---|---|---|---|
| 1 | Stop calling the photon rule "the same cos² rule/law". State cos²θ (photon, physical angle) vs cos²(θ/2) (spin). (§1 #1) | The only statement that is actually wrong. It would lead a learner who trusts it to the wrong 45° answer (0.5 vs 0.854), inside the very unit that teaches the half angle. | `watch[2]`, `l1-average.books[2]` |
| 2 | Label the projector's angle as a **Hilbert-space** angle equal to ½ the physical angle, and give "45°" its physical meaning (90°, the x axis). (§1 #2) | The same number means two different things in consecutive units. This is the fidelity-contract item "Bloch angle = 2× Hilbert angle". | `l1-vectors.visual.tryThis`, projector caption |
| 3 | Scale the logic claims to what the experiment shows: measurements disturb, so "answers merely read off" fails. Do not say "can't be a set". Reword the sets ref (the join stays commutative; the testing order is what matters). (§1 #3–#6) | This removes an overclaim about hidden variables and a misattribution of which symmetry fails. The claim is part of the lecture outcome and belongs in the review card. | `l1-logic.insight`, `l1-sequential.insight`, `l1-l-assumption` A.why, `l1-logic.books[1]` |
| 4 | Define σ = 2S/ħ = ±1 at first use. Replace "average deflection" with "average reading (±1 units)". Add the unpolarized = **mixture** gloss. (§1 #7, #8, #12) | Symbol-before-use lint, dimensional correctness, and the mixture-vs-superposition seed for the Bloch-ball content. | `l1-average.lecture`, `clues[0]`, `l1-a-avg.unit`, `l1-a-errata.prompt`, glossary |
| 5 | Switch kets to \|±z⟩ / \|±x⟩ and state the relative-phase choice in the `l1-vectors` summary. Fix the refs: sets → §1.1.3, Axler "notes" → L2, add Townsend §§1.1–1.4, and `l1-sequential` pages → pp. 3, 5, 8. (§1 #9, #11, #13, #20; §3) | Removes the arrow-glyph reading, sets up L2's ±i, and makes the citations checkable. | `l1-vectors`, `books[]`, `lecture.pages` |

The numbers, the `corrections[0]` erratum, the engine phase conventions and the handedness were all verified correct. No change is needed there.
