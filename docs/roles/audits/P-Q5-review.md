# P review: 709 Q5 "Deutsch's trick and interference" (merge 61ce402, reviewed 2026-10-02)

**Verdict: FIX-FIRST.**
- The physics is right in all six derivations, both errata, the adiabatic example and the measurement-based step.
- One caption shows a wrong state.
- The Formal track shows raw TeX in every unit's insight.
- Several learner answers and claims are hand-typed literals, so their numpy twins check nothing.

Evidence (scratchpad `revQ4Q5-*`):
- `revQ4Q5-recompute.py`: my own route, from U_f built from truth tables, Deutsch state by state, the MZ as R_y(−π/2)·diag·R_y(π/2), and W(θ) = HP(θ) with the |±θ⟩ projections. It makes 46 Q5 checks against the displayed values and `claims-qc709/q5.json`; 44 agree. The 2 mismatches are item 1 and the two claim labels in item 5.
- `vitest src/content`: 2363 passed.
- Plan and build agree beat for beat: 30 beats, the same ids and phases as P-Q5-story §1.
- **Bergou:** pp. 5–8 and 10 read in fresh 110–130 dpi renders (eqs. 1.10–1.21, Figs. 1.5–1.7, the p. 10 identity).
- **N&C:** pp. 29–34 checked against the text-layer page headers (PDF − 28).
- **Notes:** L1–L7 searched. No notes page treats Deutsch, oracles, interferometers, the adiabatic model or the measurement-based model.
- **Not done (economy):** no screenshots or contact sheets. Item 1's caption was read from source (deterministic `d()`). Bridges were checked by `bridges.test.ts`, not clicked through.

## Blocking

1. **`q5-deutsch:b4` caption (`Q5.story.ts:342`) shows the wrong final state.**
   - The caption reads "always 1: −|0⟩|−⟩ = (−0.500, 0.500, 0, 0)". |0⟩|−⟩ has amplitudes ±1/√2, so the state is (−0.707, 0.707, 0, 0).
   - It uses `q5D1Re` (ψ₁'s ½) instead of `q5D3R2`. The stage bars beside it and the `q5-d-sign` answer (0.707) both contradict it.
   - The shown-number lint passed only because `q5D1Re` is claimed on the beat, a claim about a different state.
   - *Fix:* `(−${d(V.q5D3R2, 3)}, ${d(V.q5D3R2, 3)}, 0, 0)`, with the beat claim switched to `q5D3R2` computed from the final state (item 4).

## Should-fix

2. **Raw TeX on screen (builder flag "Q5 writes math in Unicode").**
   - **(a) All six `insightFormal` strings are backslash TeX with no `$`:**
     - `Q5.ts:114`, `181`, `256` and `324`;
     - `Q5.ts:388`, the interferometer `P(\text{output 1})…`;
     - `Q5.ts:452`, other-models `\mathcal H(s)…`.
     - `UnitView.tsx:142` renders the insight through `Rich`, which typesets only `$…$`. The Formal reader sees `\rangle`, `\tfrac1{\sqrt2}` and the rest literally.
   - **(b) 16 story lines and 4 review points show raw caret-brace math outside TeX:**
     - `(−1)^{f(x)}` (oracle b3/b4/b6, deutsch b2/b3);
     - `e^{iφ₀}` (interferometer b2);
     - `2^{−n/2}Σ_x`, `H^{⊗n}|0⟩^{⊗n}` (one-value b3);
     - `e^{−iθ}`, `e^{iθ}` (other-models b3/b4);
     - `O_(f≡1)` subscripts;
     - Python-style `(1/√2)[[1, −1], [1, 1]]` and `[[−½, −½], [−½, ½]]`.
   - *Ruling:* plain Unicode is fine for |x⟩, ⊕, √ and Unicode subscripts. Anything with an exponent, a sum or a matrix goes in `$…$`, as in Q4's Formal, with `symbols` entries added. Wrap every `insightFormal` in `$…$`.
   - Q3 has the same insight defect (`Q3.ts:211`, `279`); flag it to the Q2/Q3 fixer.
3. **Plan-internal ids leak into learner text.**
   - "(D1)" (oracle b3 F), "(D2)" and "(D3)" (deutsch b2/b3 F), "(D5)" (one-value b2 F and the `q5-v-values` walkthrough), "(D4; erratum B1)", "This is eq. 1.18 (B1)", "(erratum B1)" (interferometer b2 F and its `why`), "(D6)" (other-models b3 F), and the review point "(erratum B1)" (`Q5.review.ts:93`).
   - "(§8.1)" (other-models b4 F) is the *plan's* errata section.
   - The app numbers neither derivations nor errata (`Derivation.tsx` and the corrections box), so a learner cannot resolve these.
   - *Fix:* "(derivation below)", "(see the corrections box)", and drop "§8.1".
4. **Learner answers are hand-typed literals, not engine results.**
   - `Q5.values.ts:241-294` types `q5XorZero/One/Id/Not`, `q5ConstZero…Not`, `q5ChCount`, `q5ChQueries`, `q5ParPHalf`, `q5ChValues`, `q5D3R2`, `q5MzHalfP`, `q5Half` and `q5Quarter`. `q5.py` types the same literals, so the twin check is vacuous.
   - These are the answers of `q5-p-xor`, `q5-p-count`, `q5-p-queries`, `q5-v-prob`, `q5-v-values`, `q5-d-sign` and `q5-i-bs`. This breaks the CLAUDE.md rule that every learner answer comes from `app/src/physics/`. All of them recompute right.
   - *Fix:*
     - derive the XOR and constant flags from the four f tables;
     - `q5ChCount` = count of f with f(0) ≠ f(1);
     - `q5ParPHalf` = `probs(final(cPar(ID)))[3]`;
     - `q5D3R2` = `final(cD(ONE))[1].re`;
     - give `q5-i-bs` its own key: the first splitter's arm-b chance, `probAt(stateAt(cMZ(0),1),1)`;
     - `q5ChQueries` and `q5ChValues` are counting arguments; mark them as such, or move them to the order or choice formats.
5. **Claims whose check misses their label.**
   - `q5Half` is labelled "the normalizing factor here is one over two root two" (deutsch b3) but checks 0.5. 1/(2√2) = 0.354, which is `q5Eighth`.
   - `q5DeutschTopMatches` is labelled "the interferometer and Deutsch's top wire agree exactly for f = id". It compares HOH|0⟩ with the literal |1⟩ and never runs the interferometer.
     - Recomputed: the MZ with phases (0, π) gives −|1⟩.
     - So the two agree only up to a global sign, and "exactly" is false. The beat prose ("the same port chances") is right.
   - `q5UfOne` and `q5UfNot` check only "unitary", while oracle b2 asserts U_(f≡1) = I⊗X and U_x̄ = (I⊗X)·CNOT. I verified both identities, but no claim does.
   - *Fix:* key the claims to what they say, using `sameUpToPhase(final(cMZF(ID)), hohId)` and `matEq` against I⊗X and (I⊗X)CNOT.
6. **Builder flag: `q5-d-steps` walkthrough is "Fig. 1.5." only.** Expand it to the five steps with their states:
   1. Prepare |0⟩|−⟩ (eq. 1.10).
   2. H on top gives ½(|0⟩+|1⟩)(|0⟩−|1⟩) (eq. 1.11).
   3. U_f kicks back (−1)^{f(x)} (eq. 1.14).
   4. H on top turns equal or opposite signs into |0⟩ or |1⟩ (eq. 1.15).
   5. Read the top qubit: 0 means constant, 1 means balanced.
7. **Builder flag: citation regex.**
   - Q5 lost nothing visible: it cites "Problem 1.3(a)", which the regex eats.
   - It does use lower-case "eq." throughout. Accept that after the `claims.test.ts:70` fix in P-Q4-review item 5.

## Nits

8. **Time-order wording.**
   - interferometer b2 F says "the reverse quarter-turn, the phases, then the quarter-turn", and b4 F says "reverse-splitter, phase, splitter". Both list the *operator product* with the word "then".
   - In time the photon meets the quarter-turn, then the phases, then the reverse quarter-turn.
   - *Fix:* say "in time order".
9. **N&C pages.**
   - eq. 1.38 is on p. 31, so one-value b3 should say "eqs. 1.38–1.39, pp. 31–32".
   - O_f is our notation: N&C p. 33 writes the ± signs. Say "(our O_f; N&C p. 33)".
10. **MBQC derivation line 5's `why`** says "this is W(θ)ψ/√2" on the line that states W(θ)|ψ⟩ without the √2. Say "so the previous line is W(θ)ψ/√2".
11. **`q5-problem` try-it** is SG `deposit-stats` ("Fire 10 atoms"), which is unrelated to constant versus balanced. Use the circuit or amplitude widget with the four f.
12. **The which-path reveal** bridges to 448 `l1-sequential`. Add the 709 link-back "Unit 1.2", since Q1's `q1-sequences` is the same lesson.
13. **The claim label "gauge a₀"** (`q5HHalfA0`) is the stage's field name. Say "the identity part a₀".

## Notes alignment (revised notes L1–L7)

- **No notes counterpart.** The notes never treat Deutsch's problem, oracles or kickback, quantum parallelism, the Mach–Zehnder, the adiabatic model or the measurement-based model. Q5's [L] beats cite Bergou §1.4–1.7, the course textbook, as ruling qc709-Q4Q5 #1 allows.
- **No wrong page.** Q5 cites no notes, so no notes page is wrong. The Bergou and N&C pages are right apart from item 9.
- **Missing [L] beats:** none are owed, since the notes have no Q5 material.
- **Add three link-backs to notes L5 via Q4:**
  - `oracle:b4` (O_id = Z): notes p. 24's Z.
  - `other-models:b3` (CZ = CPHASE): notes p. 25's CZ = |0⟩⟨0|⊗1 + |1⟩⟨1|⊗σ_z.
  - `other-models:b3` (W(θ) = HP(θ)): notes p. 24's phase gates.
- **For the re-map:** if Part II is renumbered around notes L5–L7, Q5 stays a Bergou-led chapter. Keep phase `'lecture'` for the beats that are Bergou's main line.

## Derivation view plans (≥ 2 distinct views per track)

The shorthand matches P-Q4-review: `stage(C, …)` is the existing split of `circ` over `amp`, and `matrix{…}` is the new kind.

| Derivation | Track: lines → view |
|---|---|
| **D1** `oracle:b3` kickback | **G** 1: `circ{cOr(ID,'1')}` (U_f box) · 2: `amp{C_KICK, upTo 0}` (\|1⟩\|−⟩: +0.707, −0.707) · 3: `stage(cOr(ZERO) on '1−')` (unchanged) · 4: `stage(C_KICK, upTo 0→1)` (the bars swap, which the hue shows as a sign) · 5: `cplane{spokes:{phasesDeg:[0,180]}}` ((−1)⁰, (−1)¹) · 6: `stage(C_KICK)`. **F** 1: `matrix{gate:'X', labels:'ket'}` on the \|−⟩ column · 2: `bloch{state:'-x', rotate:{axis:'x', angleDeg 0→180}}` (an eigenvector: the point stays) |
| **D5** `one-value:b2` | **G** 1: `stage(cPar(ID))` · 2–3: `stage(C_PARM, outcomes:'11')` (one bar left) · 4: `stage(C_PARM, mode:'probability')`. **F** 1: `amp{circuit: H⊗H then U_f on 3 qubits}` (2ⁿ bars) · 2: the same with `outcomes` |
| **D2** `deutsch:b2` ψ₂ | **G** 1: `stage(cD(ID), upTo 0)` · 2–3: `stage(cD(ID), upTo 0→1)` (+,−,+,−) · 4: `matrix{gate:'U_id', blocks:2}` (I and X blocks) · 5: `stage(cD(ID), upTo 1→2)` (+,−,−,+). **F** 1: `stage(cD(ID), upTo 1)` · 2–3: `matrix{gate:'O_f⊗I'}` for f = id, diag(1, 1, −1, −1) |
| **D3** `deutsch:b3` ψ₃ | **G** 1: `matrix{gate:'H', labels:'ket'}` · 2: `stage(cD(ID), upTo 2→3)` · 3: `cplane{chain:{phasesDeg:[0,0]}}` (sum 2) · 4: `cplane{chain:{phasesDeg:[0,180]}}` (sum 0) · 5–6: `stage(cDM(ONE), mode:'probability')` then `cDM(ID)`. **F** 1: `stage(cD(ID), upTo 3)` · 2: `stage(cDM(ID), outcomes:'1')` |
| **D4** `interferometer:b2` | **G** 1: `stage(cMZ(0), upTo 0→1, dials)` · 2: `cplane{spokes:{phasesDeg:[0, φ₁]}}` · 3: `matrix{gate:'Ry(-π/2)', labels a/b, hl: the swapped ports}` (the mirrored BS2) · 4–5: `stage(cMZ(π/2), upTo 2→3)` · 6: `cplane{chain:{phasesDeg:[0, 0→180]}}` (the resultant shrinks as cos). **F** 1: `matrix{gate:'Ry(π/2)'}` beside `matrix{gate:'X·Ry(π/2)·X'}` · 2: `stage(cMZ(π/2))` · 3: the `cplane` chain sweep |
| **D6** `other-models:b3` MBQC | **G** 1: `amp{circuit: Ry(π/3) on q0, \|+⟩ on q1}` · 2: `stage(C_MB, upTo 0→1)` (CZ flips one sign) · 3: `cplane{z:{r:1,φ:45}, show:['conj']}` · 4–5: `stage(C_MB, outcomes:'0')` · 6: `stage(C_MB, outcomes:'1')` · 7: `matrix{coef: rows \|±θ⟩, cols \|0⟩,\|1⟩}`. **F** 1: `matrix{coef: rows \|0⟩,\|1⟩ × cols \|+⟩,\|−⟩}` (diagonal α, β) · 2: `stage(C_MB, outcomes:'0')` |
| *optional new* `other-models:b2` gap | 1: `op{op:{matrix ℋ(s)}, eigen:true}` at s = 0, ½, 1 · 2: `bloch{state:{thetaDeg 90→0}}` (the ground state climbs) |

## Notation beats

| Space or notation | Introducing beat | Visual |
|---|---|---|
| f : {0,1} → {0,1}; constant and balanced; the four truth tables | `problem:b1` (exists) | `stage(cQ(…))` + a four-row truth-table `matrix{coef}` (f(0), f(1)) |
| The oracle box U_f, \|x⟩\|y ⊕ f(x)⟩, query | `oracle:b1` (exists) | `circ` + `matrix{gate:'U_f', blocks:2}` (a permutation) |
| (−1)^{f(x)}, the phase oracle O_f = diag((−1)^{f(0)}, (−1)^{f(1)}) | `oracle:b4` (exists) | `matrix{gate:'O_f'}` with phase colour + `amp` hue |
| Toffoli (a, b, c ⊕ ab) | `oracle:b5` (exists) | `circ{C_TOF}` + `matrix{gate:'Toffoli', hl: the 110/111 swap}` |
| H^{⊗n}, Σ_x, Walsh–Hadamard | `one-value:b3` (exists) | `matrix{kron:['H','H'], blocks:true}` (±½ with hue) + `amp` |
| \|ψ₀⟩…\|ψ₃⟩ step labels | `deutsch:b1` (exists) | `circ` cursor with step badges |
| **The one-photon mode space:** a†, b†, \|vac⟩ with a†\|vac⟩ ≡ \|0⟩, b†\|vac⟩ ≡ \|1⟩ | `interferometer:b1` (exists) | `circ` drawn as the MZ + `matrix{gate:'U_BS', labels a/b}` |
| φ₀, φ₁, U_BS, U_MZ | `interferometer:b2` (exists) | the `cplane` spokes |
| ℋ(s), s = t/t_f, the spectral gap | `other-models:b1` (exists) | `op{eigen}` |
| \|±θ⟩ basis, W(θ), CZ as CPHASE, cluster state | `other-models:b3` (exists) | `stage(C_MB)` + `matrix{coef}` |
| Byproduct X | `other-models:b4` (exists) | `stage(C_MB, outcomes:'1')` |

## Errata box (rulings Q5 B1 and B-new-1): both fair, and both checks are relevant

- **p. 8, eq. 1.18.**
  - Applying eq. 1.17 twice with the same mode labels sends equal phases to b†, output 2. I recomputed this: R_y(π/2)·I·R_y(π/2)|0⟩ = |1⟩.
  - Fig. 1.7's mirrors bring the φ₀ arm into BS2 through the b port. With the outputs named 1 and 2, as Bergou names them after eq. 1.18, the equation holds.
  - The check tests both halves (`q5Mz118`, `q5MzNaiveOut2`).
- **p. 10.**
  - As printed, W(θ)σ_x = σ_zW(−θ) is false. Recomputed: W(θ)X = e^{iθ}ZW(−θ), and the bare version fails.
  - The check tests both. The p. 10 typo, |−θ⟩₁ written where |+θ⟩₁ is meant (plan B-new-2, seen on the render), stays silent, per the ruling.

## Checked and right

- **Every number re-derived:** every displayed number and all 24 challenge answers.
  - U_f for each f, with U_id = CNOT, U₁ = I⊗X and U_x̄ = (I⊗X)CNOT.
  - The kickback 0.707 → −0.707, and flip on |0⟩|−⟩ → −0.707.
  - The parallel state and its ½, and 1/√8.
  - ψ₁, ψ₂ (copy and always 1), and P(top = 1) = 0, 0, 1, 1.
  - The MZ sweep: 1, 0.854, 0.5, 0.146, 0. Its output-1 amplitude at 90° is (1+i)/2, and copy's output-2 amplitude is −1.
  - The gaps: 2, 1.581, 1.414, 1.581, 2.
  - W(θ)ψ = (0.862 + 0.250i, 0.362 − 0.250i), with 80.6 % and 19.4 %. Both |±θ⟩ branches are W(θ)ψ/√2 and XW(θ)ψ/√2.
  - The |±θ⟩ reading is P(θ), then H, then a reading.
  - R_y(−90°)ΦR_y(90°) = Z(HΦH)Z (review card).
- **Derivations:** all six are stepwise true, and both tracks end on the stated result.
- **Citations:** Bergou eqs. 1.10–1.21, Problem 1.3(a)–(c), Figs. 1.5 and 1.7, and §1.7; N&C Fig. 1.14 (p. 29), the data/target registers (p. 31), eqs. 1.37–1.45, Fig. 1.19 and the interference remark (p. 34). Apart from item 9 all match the sources.
- **Cross-references:** Units 1.5, 4.2, 4.4, 5.1, 5.2 and 5.4, and Q4's "Unit 5.2" Toffoli forward reference, all resolve.
- **Plan and rulings:** both rulings are met: `q5-one-value` comes before `q5-deutsch`, and the adiabatic example is labelled ours.
