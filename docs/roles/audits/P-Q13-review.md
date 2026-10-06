# P review: 709 Q13 "Open-system maps: Kraus operators and impossible machines" (main 157556a, reviewed 2026-10-06)

Reviewer: independent P verifier (read-only; not the builder). Skill: `skills/06-chapter-review/SKILL.md`.

## Verdict
**FIX-FIRST** (3 blocking, 8 should-fix, 7 nits).
- Every displayed number and all 15 challenge keys are right (27/27 independent numpy checks).
- **Blocking:**
  - The depolarizing channel is described as "replaced by ½I with chance p". That is false for its own Kraus set, and it contradicts the chapter's own "full mixing at p = 0.75" (item 1).
  - All six Try-it lines are false or impossible on their widgets (item 2).
  - The Stinespring extension "identity on the orthogonal complement" does not give a unitary (item 3).
- **Must-check outcomes (E3):**
  - Every Kraus set is CPTP with a positive Choi matrix: depolarizing at p = 0, ½, ¾, 1; dephasing at ½, 1; amplitude damping at ½, 1.
  - `transposeMap` and `unotMap` both give `choiIsPositive` = false, with Choi eigenvalue **−1** (unnormalized J; −½ for the chapter's normalized (T⊗I)ρ_Φ⁺).
  - Q13 itself calls none of `isCPTP`, `choi` or `choiIsPositive`. Its −½ comes from `ptranspose(ρ_Φ⁺)` = J(T)/2.
  - UNOT is deferred by the plan (`P-Q13-story.md:742`).

## Evidence summary
- **`revQ12Q13-q13.py`** (scratchpad): 27/27 checks, my own route.
  - Choi matrices from an elementary-basis loop, the transpose by axis swaps, and Bloch vectors via Tr(ρσ).
  - The Kraus operators of the drawn CNOT, ⟨m|U|0⟩_E.
  - The identity-extension test of item 3.
- **`revQ12Q13-probe.ts`** (rolldown + node): the E3 verdicts above.
  - Choi spectra: depolarizing(½) {⅓, ⅓, ⅓, 1}; amplitude damping(½) {0, 0, ½, 3/2}.
  - Every `V.q13*` matches numpy.
  - The depolarizing image of the b1 point at p = ½ is (0.25, 0.144, 0.167).
- **Vitest:** `npx vitest run src/content/qc709`: 68 passed (4 files).
- **Sources read:**
  - Bergou pp. 65–73 (PDF 77–85: Eqs. 4.1–4.37, §4.3.2) and Problem 4.5 (p. 75).
  - N&C pp. 360, 369 (Box 8.2), 374–380 and 532.
- **Widgets read:** `OperatorBuilder`, `PhaseDial`, `BlochSphere` (θ/φ sliders only; a pure point).
- **Not done (economy):** no screenshots, no Playwright.

## Blocking
1. **The depolarizing channel is misdescribed.**
   - **The sites:**
     - Ground `q13-depolarizing:b1` (`Q13.story.ts:409`): "With chance p the qubit is scrambled to the fully mixed centre".
     - Formal (`:411`): "replaces the qubit with ½I with probability p".
     - The caption (`:412`), the review card's point 1 and the `qc-depolarizing` gloss say the same.
   - **Why it is false:**
     - For ℰ = (1−p)ρ + (p/3)(XρX + YρY + ZρZ), the replacement probability is **4p/3** (Bloch factor 1 − 4p/3).
     - Replacing with chance p would give a factor 1 − p: 0.5 at p = ½, against the engine's ⅓ (numpy). It would also put full mixing at p = 1.
     - That contradicts the chapter's own pitfall, `q13-de-full` and `q13-de-collapse` (full mixing at 0.75).
     - Bergou p. 70 says what the formula does mean: nothing with 1 − p, and X, Y, Z each with p/3.
   - *Fix:*
     - Ground: "With chance $1-p$ nothing happens; with chance $p/3$ each, an $X$, $Y$ or $Z$ flip hits it."
     - Formal: add "(equivalently, replaced by $\tfrac12I$ with probability $\tfrac{4p}3$)".
     - Apply the same to the caption, the review point and the gloss.
2. **All six Try-it lines are false or impossible on their widgets** (Q11 item 1 precedent).
   - **`q13-from-unitary` (`Q13.ts:125`)** says "Build $\sqrt{0.5}X$; square-sum four such operators". `OperatorBuilder` builds only S_n = (ħ/2)(P₊ − P₋). Worse, four (√0.5 X)†(√0.5 X) sum to **2I** (numpy), which is not a channel.
   - **`q13-properties` (`:175`)** says "a negative [eigenvalue] fails positivity outright". Every S_n the widget builds has eigenvalues ±ħ/2, and it shows no eigenvalues.
   - **`q13-stinespring` (`:218`)** says "Build any isometry's V†V". The widget cannot.
   - **`q13-depolarizing` (`:264`)** says "Drag a surface state inward". `BlochSphere` has only θ/φ sliders, so its point stays on the surface.
   - **`q13-no-cloning` (`:332`, phase-dial)** says "the CNOT entangles it". There is no CNOT and no second wire.
   - **`q13-herbert` (`:390`, θ = 90°, not editable)** says "Bob's arrow never leaves the centre". The widget draws |+x⟩ on the surface.
   - *Fix:* rewrite each line to what its widget does, or change the widget. Examples:
     - Herbert: "This is one of Alice's x-basis outcomes, a surface point; Bob's own qubit has no point on the surface at all."
     - Depolarizing: "Pick $|{+x}\rangle$; noise at $p = 0.5$ would leave a point a third of the way out."
3. **"Identity on the orthogonal complement" does not extend V to a unitary.**
   - **The sites:** `stinespring:b2` Formal (`:342`) and the formal derivation step 2 `why` (`:368`). Both follow Bergou p. 67, which prints the same claim (PDF 79), so the chapter inherits a book error.
   - **Why it fails:**
     - For dephasing(½), set U = V on H_S⊗|0⟩ and U = I on H_S⊗|1⟩. Then U†U ≠ I (max |U†U − I| = 0.707, numpy).
     - V's range overlaps H_S⊗|1⟩, so the extension must send the complement onto the orthogonal complement of V's range.
   - *Fix:*
     - Text: "extends to a unitary by mapping an orthonormal basis of the complement onto one of the complement of $V$'s range".
     - Add a Correction for Bergou p. 67 whose `check()` computes the identity-extension's ‖U†U − I‖ > 0.

## Should-fix
4. **The drawn Kraus operators are not the drawn circuit's, and H is called part of the coupling.**
   - `from-unitary:b2` states A_m = ⟨m|U_SE|0⟩_E beside a CNOT, but draws A₁ = Z/√2 (`:144`). In fact ⟨1|CNOT|0⟩_E = |1⟩⟨1| (numpy).
   - That is an equivalent set (Unit 13.3's freedom, not yet taught). The channel is the same, and dephasing(½) is confirmed on random inputs.
   - The viewCaption "the coupling: $H$ then a CNOT" (`:169`) is also wrong: with H inside U_SE the map is not dephasing(½) (maxdiff 0.21). H only prepares |+⟩.
   - *Fix:*
     - Draw `{outer: [{ket:'1'}]}` as A₁, and P₀ + P₁ = I as the sum (both exact).
     - Or add "(an equivalent set; Unit 13.3)".
     - Caption: "$H$ prepares $|+\rangle$; the coupling is the CNOT".
5. **Two answer keys are typed literals** (Q11 item 6 precedent).
   - `q13-de-collapse` has `answer: 0.75` (`Q13.ts:287`; `q13PThreeQuarters` is a literal).
   - `q13MaxKraus2: 4` is the `q13-st-max` key.
   - *Fix:*
     - p* = `depolFactorP0 / (depolFactorP0 − depolFactorP100)` (the factor is linear in p).
     - The bound as the Choi rank of depolarizing(½) (`choi` + `eigh` count; numpy `matrix_rank` = 4).
6. **Q12 and Q10 are merged, but Q13 still names them in words only.**
   - `properties:b3/b4` say "the partial transpose used elsewhere in this course" (`:254, 306, 312`).
     - *Fix:* `[[qc-partial-transpose|partial transpose]]`, and name Chapter Q12.
   - Herbert's "no-signalling" is never linked.
     - *Fix:* `[[qc-no-signalling|no-signalling]]`, and add it to `prerequisites`.
   - Five glossary entries are never linked from any beat: `qc-complete-positivity`, `qc-stinespring`, `qc-depolarizing`, `qc-amplitude-damping` and `qc-no-cloning`. Link each at its `first` beat.
   - The story and glossary header comments are stale.
7. **Citations.**
   - The Stinespring unit cites "§4.1.3, pp. 68–69, Eqs. 4.6–4.8, 4.28" (`Q13.ts:216–217`). In fact Eqs. 4.6–4.8 are §4.1.2, pp. 66–67; the N² bound is §4.1.3, p. 69; and Eq. 4.28 is on p. 70.
   - Herbert §4.3.2 is pp. 72–73, not "p. 73". §4.3.1 is p. 72.
   - N&C Box 8.2 is on p. 369, not 368.
   - Amplitude damping is cited "(⚑ Problem 4.5)" (`:461`, glossary). P4.5 is a master equation in which γ is a *rate*; the Kraus pair and c = (0, 0, γ) are N&C §8.3.5, p. 380.
     - *Fix:* cite N&C. Keep P4.5 only as "Bergou's master-equation route", and note that γ here is a probability.
8. **The depolarizing picture breaks continuity.**
   - b1 says "Watch this point" at (θ, φ) = (60°, 30°) (`:414`). b2 then draws (⅓, 0, 0) (`:425`), the image of |+⟩.
   - The watched point actually goes to (0.25, 0.144, 0.167).
   - *Fix:* start b1 at `ball({r: [V.q13DepolFactorP0, 0, 0]})`.
9. **The no-cloning overlap step is garbled.**
   - Formal derivation step 2 (`:549`) says "overlap 0.7071 ≠ 0.5". The condition is s = s², so it should say "overlap 0.7071, whose square 0.5 ≠ 0.7071".
10. **Two traps are builder-speak or straw men** (Q11 item 7 precedent).
    - The depolarizing Formal trap reads "mistaken for a drawing error: it is the engine's own affine map".
      - *Fix:* "Expecting every channel to fix the centre: amplitude damping moves it to $(0,0,\gamma)$."
    - The no-cloning Formal trap reads "needs the full depolarizing machinery".
      - *Fix:* "Thinking approximate copies are also impossible: only perfect cloning is ruled out (Bergou p. 72)."
11. **T is overloaded.**
    - T is the channel in `from-unitary:b2` ("the book also writes $T(\rho)$") and in the depolarizing derivation, where $T(\sigma_k)$ appears (`:437, 450`).
    - But T is the transpose in Unit 13.2.
    - *Fix:* write $\mathcal E(\sigma_k)$ in the derivation, and keep "Bergou writes $T$" once.

## Nits
12. `q13-pr-cp` distractor "Only in one dimension" (`Q13.ts:202`) is arguably *true*: the 1×1 transpose is the identity channel. Replace it with "Only on mixed inputs".
13. properties:b3 Ground step 2 says "Transpose Alice's half only" (`:274`), but the stage transposes **B**. The result is the same for Φ⁺ (SWAP/2 either way, numpy). Say "one half".
14. The properties:b4 reveal, "A map is a channel exactly when its Choi matrix is a valid state", should read "completely positive exactly when its Choi matrix is positive".
15. "$\mathcal E\otimes I_B \ge 0$" appears in insightFormal, captionFormal, the glossary and the review. A map is not "≥ 0"; write "$\mathcal E\otimes I_B$ is positive".
16. Herbert's captionFormal "works iff a perfect cloner exists" should be "if". depolarizing:b4 says "turned inside out"; prefer "reflected through the centre".
17. `stinespring:b3`'s stage (the amplitude-damping decay operator) illustrates neither of the beat's two claims.
18. **Choi normalization:** the chapter uses (ℰ⊗I)ρ_Φ⁺ (trace 1, eigenvalue −½), while the E3 `choi()` is unnormalized (Tr J = 2, eigenvalue −1). This is harmless now; state it if a later claim reads `choi()`.

## Builder's-language questions
- from-unitary:b1 links the word "closed" to `qc-density-matrix` and the text "Chapter Q8" to `qc-von-neumann-equation`. Put each link on its term.
- Ground `from-unitary:b2` calls the channel "a weighted spread of the state". "a weighted sum of sandwiched copies" would say more.

## Checked and right
- **Completeness:**
  - Σ A_m†A_m = I is exact for dephasing(½) (½I + ½I) and depolarizing(½).
  - Tr ℰ(ρ) = Tr ρ is an operator identity (Bergou Eqs. 4.4–4.5 and N&C Eqs. 8.10, 8.14, both checked).
  - The C_DEPH channel (CNOT, E = |0⟩, traced) equals dephasing(½) exactly.
- **Transpose:**
  - (T⊗I)ρ_Φ⁺ = (I⊗T)ρ_Φ⁺ = SWAP/2, with spectrum {½, ½, ½, −½}.
  - Positive but not CP, as Bergou p. 67 and N&C Box 8.2 state.
- **Kraus bound:** Choi ranks are 4, 2 and 2 for depolarizing, dephasing and amplitude damping, so "≤ N² = 4" holds, with amplitude damping and dephasing using 2 and depolarizing 4. Kraus freedom matches Eq. 4.28.
- **Depolarizing (Eqs. 4.30–4.34):**
  - The Kraus set and ℰ(σ_k) = (1 − 4p/3)σ_k are right.
  - Factors: 1, ⅓, 0 and −⅓ at p = 0, ½, ¾, 1.
  - The reveal's "negative third, inverted" is right.
- **Amplitude damping (γ = ½):** c = (0, 0, 0.5), M_xx = 0.7071, M_zz = 0.5, with |1⟩ decaying to |0⟩ = +z.
- **No-cloning:**
  - CNOT|00⟩ = |00⟩ and CNOT|10⟩ = |11⟩; CNOT|+0⟩ = Φ⁺ (Eqs. 4.35–4.37).
  - |⟨0|+⟩| = 0.7071, and "only orthogonal states clone" matches N&C Box 12.1 (p. 532).
- **Herbert:** ρ_B = ½I, |r| = 0 for both of Alice's z and x readings. The history (Herbert's laser-amplifier "cloner"; Wootters–Zurek) matches Bergou pp. 72–73. Using Φ⁺ instead of Bergou's singlet follows `qc709-nc.md` #3.
- **General:**
  - No raw TeX outside `$…$` (scripted scan), no amplitudes as percentages, and no plan ids in learner text.
  - Derivations have ≥ 2 distinct views per track.
  - Both notation beats really introduce their terms (ℰ and A_m at from-unitary:b2; the Choi matrix at properties:b3).
  - No duplicate glossary id, the bridges `qc-l6-mixture` and `qc-l6-bloch` resolve, and HW2 does not overlap.
